import { useState, useEffect } from "react";
import supabase from "./config/supabaseClient";

function DiagnosticCheck({ resourceId }) {
    const [diagnostics, setDiagnostics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkExtraction();
    }, [resourceId]);

    const checkExtraction = async () => {
        setLoading(true);
        try {
            // Check main resource
            const { data: resource, error: resourceError } = await supabase
                .from('resources')
                .select('*')
                .eq('id', resourceId)
                .single();

            // Check resource files
            const { data: files, error: filesError } = await supabase
                .from('resource_files')
                .select('*')
                .eq('resource_id', resourceId);

            setDiagnostics({
                resource: {
                    id: resource?.id,
                    file_url: resource?.file_url,
                    file_type: resource?.file_type,
                    extracted_text_length: resource?.extracted_text?.length || 0,
                    has_extracted_text: !!resource?.extracted_text,
                    extracted_text_preview: resource?.extracted_text?.substring(0, 200)
                },
                files: files?.map(f => ({
                    id: f.id,
                    file_url: f.file_url,
                    file_type: f.file_type,
                    extracted_text_length: f.extracted_text?.length || 0,
                    has_extracted_text: !!f.extracted_text,
                    extracted_text_preview: f.extracted_text?.substring(0, 200)
                })) || [],
                totalFiles: files?.length || 0,
                filesWithText: files?.filter(f => f.extracted_text).length || 0
            });
        } catch (error) {
            console.error('Diagnostic error:', error);
            setDiagnostics({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading diagnostics...</div>;

    return (
        <div style={{ 
            border: '2px solid #333', 
            padding: '20px', 
            margin: '20px 0',
            backgroundColor: '#f5f5f5',
            fontFamily: 'monospace',
            fontSize: '12px'
        }}>
            <h3>🔍 Extraction Diagnostics</h3>
            
            <div style={{ marginTop: '15px' }}>
                <strong>Main Resource:</strong>
                <pre style={{ backgroundColor: '#fff', padding: '10px', overflow: 'auto' }}>
                    {JSON.stringify(diagnostics?.resource, null, 2)}
                </pre>
            </div>

            <div style={{ marginTop: '15px' }}>
                <strong>Resource Files ({diagnostics?.totalFiles} total, {diagnostics?.filesWithText} with text):</strong>
                <pre style={{ backgroundColor: '#fff', padding: '10px', overflow: 'auto', maxHeight: '300px' }}>
                    {JSON.stringify(diagnostics?.files, null, 2)}
                </pre>
            </div>

            <button 
                onClick={checkExtraction}
                style={{
                    marginTop: '10px',
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                🔄 Refresh Diagnostics
            </button>
        </div>
    );
}

export default DiagnosticCheck;