import { useState } from "react";
import Header from "./Header";
import "./styles/AIAnswer.css";
import { useLocation, useNavigate } from "react-router-dom";
import supabase from "./config/supabaseClient";
import DiagnosticCheck from "./DiagnosticCheck";

function AIAnswer() {
    const location = useLocation();
    const navigate = useNavigate();
    const resource = location.state?.resource;

    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

   const handleGenerate = async (e) => {
    e.preventDefault();
    if (!question.trim()) return setError("Please enter a question");
    if (!resource) return setError("No resource found");

    setLoading(true);
    setError("");
    setAnswer("");

    try {
        // Fetch all files for this resource with their extracted text
        const { data: files, error: filesError } = await supabase
            .from('resource_files')
            .select('id, file_url, file_type, extracted_text')
            .eq('resource_id', resource.id)

        if (filesError) throw filesError

        // If no files in resource_files, fall back to the resource itself
        let filesToSend = files?.length > 0
            ? files
            : [{ file_url: resource.file_url, file_type: resource.file_type, extracted_text: resource.extracted_text }]

        // Filter out files without extracted text
        filesToSend = filesToSend.filter(f => f.extracted_text && f.extracted_text.trim().length > 0);

        if (filesToSend.length === 0) {
            setError("The document text is still being processed. Please wait a moment and try again. This usually takes 10-30 seconds after upload.");
            setLoading(false);
            return;
        }

        console.log('Sending files with text:', filesToSend.map(f => ({ 
            url: f.file_url, 
            textLength: f.extracted_text?.length || 0 
        })));

        const response = await fetch(`${import.meta.env.VITE_APP_SUPABASE_URL}/functions/v1/ai-proxy`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${import.meta.env.VITE_APP_ANON_KEY}`,
            },
            body: JSON.stringify({
                question,
                resource,
                files: filesToSend
            })
        });

        const data = await response.json();
        console.log('Full response:', data);

        if (data.error) {
            setError(`Error: ${data.error}`);
            return;
        }

        if (data.text) {
            setAnswer(data.text);
        } else {
            setError("No answer was generated, please try again");
        }

    } catch (err) {
        console.error(err);
        setError("Something went wrong, please try again");
    } finally {
        setLoading(false);
    }
};

    if (!resource) {
        return (
            <>
                <Header />
                <div className="generate-ai-answer-container">
                    <h1>Generate AI Answer</h1>
                    <p>No resource found. Please go back and select a resource.</p>
                    <button onClick={() => navigate(-1)}>Go Back</button>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="generate-ai-answer-container">

                <h1>Generate AI Answer</h1>

                <h2>
                    Utilize AI to generate answers based on the content of your unlocked academic resources.
                </h2>

                <div className="resource-details">
                    <h3>Context from: {resource.course_code} — {resource.title}</h3>
                    <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                        View Resource
                    </a>
                    <p>{resource.description || 'No description provided'}</p>
                </div>

                <form className="question-for-ai" onSubmit={handleGenerate}>

                    <h2>Your Question for the AI</h2>

                    <label htmlFor="question">Question/Context</label>

                    <textarea
                        className="ai-question"
                        name="question"
                        id="question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask a question or provide context from the resource (e.g., 'Answer question 1a')..."
                    />

                    {error && <p style={{ color: 'red' }}>{error}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? "Generating..." : "Generate Answer"}
                    </button>

                </form>

                <div className="ai-generated-answer">

                    <h3>AI Generated Answer</h3>

                    <div className="ai-text-container">
                        <div className="text">
                            {answer
                                ? answer.split('\n').map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))
                                : "Your AI-generated answer will appear here. Please provide a question above and click 'Generate Answer'."
                            }
                        </div>
                    </div>

                </div>

            </div>
        </>
    );
}

export default AIAnswer;