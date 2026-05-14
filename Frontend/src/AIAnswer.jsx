import { useState } from "react";
import Header from "./Header";
import "./styles/AINotes.css";
import { useLocation, useNavigate } from "react-router-dom";
import supabase from "./config/supabaseClient";
import DiagnosticCheck from "./DiagnosticCheck";


function AINotes() {
   const location = useLocation();
   const navigate = useNavigate();
   const resource = location.state?.resource;


   const [context, setContext] = useState("");
   const [notes, setNotes] = useState("");
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");
   const [noteLength, setNoteLength] = useState(30);
   const [formatStyle, setFormatStyle] = useState("bullet points");


   const getLengthLabel = (value) => {
       if (value <= 33) return "Concise";
       if (value <= 66) return "Moderate";
       return "Detailed";
   };


 const handleGenerate = async (e) => {
   e.preventDefault();
   if (!context.trim()) return setError("Please enter some context or a prompt");
   if (!resource) return setError("No resource found");


   setLoading(true);
   setError("");
   setNotes("");


   try {
       // Fetch all files for this resource with extracted text
       const { data: files, error: filesError } = await supabase
           .from('resource_files')
           .select('id, file_url, file_type, extracted_text')
           .eq('resource_id', resource.id);


       if (filesError) throw filesError;


       let filesToSend = files?.length > 0
           ? files
           : [{ file_url: resource.file_url, file_type: resource.file_type, extracted_text: resource.extracted_text }];


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


       const response = await fetch(`${import.meta.env.VITE_APP_SUPABASE_URL}/functions/v1/ai-notes`, {
           method: "POST",
           headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${import.meta.env.VITE_APP_ANON_KEY}`,
           },
           body: JSON.stringify({
               context,
               resource,
               files: filesToSend,
               noteLength: getLengthLabel(noteLength),
               formatStyle
           })
       });


       const data = await response.json();
       console.log('Full response:', data);


       if (data.error) {
           setError(`Error: ${data.error}`);
           return;
       }


       if (data.text) {
           setNotes(data.text);
       } else {
           setError("No notes were generated, please try again");
       }


   } catch (err) {
       console.error(err);
       setError("Something went wrong, please try again");
   } finally {
       setLoading(false);
   }
};


   const handleDownload = () => {
       if (!notes) return;
       const blob = new Blob([notes], { type: 'text/plain' });
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = `${resource?.title || 'notes'}.txt`;
       a.click();
       URL.revokeObjectURL(url);
   };


   if (!resource) {
       return (
           <>
               <Header />
               <div className="ai-notes-container">
                   <h1>Generate AI Notes</h1>
                   <p>No resource found. Please go back and select a resource.</p>
                   <button onClick={() => navigate(-1)}>Go Back</button>
               </div>
           </>
       );
   }


   return (
       <>
           <Header />


           <div className="ai-notes-container">


               <div className="page-title">
                   <h1>Generate AI Notes</h1>
                   <p>Generate summarized notes from your unlocked resources with customizable length and format.</p>
               </div>


               <div className="resource-details">
                   <h3>Context from: {resource.course_code} — {resource.title}</h3>
                   <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                       View Resource
                   </a>
                   <p>{resource.description || 'No description provided'}</p>
               </div>


               <div className="divs">


                   <div className="note-generation-control">


                       <h2>Note Generation Control</h2>




                       <form onSubmit={handleGenerate}>


                           <div className="resource-context-div">
                               <p className="resource-context-label">What would you like notes on?</p>
                               <textarea
                                   className="resource-context"
                                   id="resource-context"
                                   name="resource-context"
                                   value={context}
                                   onChange={(e) => setContext(e.target.value)}
                                   placeholder="e.g. 'Summarize question 1', 'Give me notes on the entire document', 'Explain the key concepts from section 2'..."
                               />
                           </div>


                           <div className="note-length-div">
                               <p className="note-length-label">Note Length: <strong>{getLengthLabel(noteLength)}</strong></p>
                               <div className="note-length-slider">
                                   <div className="note-length-slider-labels">
                                       <span className="note-length">Concise</span>
                                       <span className="note-length">Detailed</span>
                                   </div>
                                   <input
                                       className="note-length-range"
                                       type="range"
                                       min="0"
                                       max="100"
                                       value={noteLength}
                                       onChange={(e) => setNoteLength(Number(e.target.value))}
                                   />
                               </div>
                           </div>


                           <div className="format-style-div">
                               <p className="format-style-label">Format Style</p>
                               <div className="format-style-options">
                                   <label>
                                       <input type="radio" name="format-style" value="bullet points"
                                           checked={formatStyle === "bullet points"}
                                           onChange={(e) => setFormatStyle(e.target.value)} />
                                       Bullet Points
                                   </label>
                                   <label>
                                       <input type="radio" name="format-style" value="paragraphs"
                                           checked={formatStyle === "paragraphs"}
                                           onChange={(e) => setFormatStyle(e.target.value)} />
                                       Paragraphs
                                   </label>
                                   <label>
                                       <input type="radio" name="format-style" value="mind map outline"
                                           checked={formatStyle === "mind map outline"}
                                           onChange={(e) => setFormatStyle(e.target.value)} />
                                       Mind Map Outline
                                   </label>
                               </div>
                           </div>


                           {error && <p style={{ color: 'red' }}>{error}</p>}


                           <button type="submit" disabled={loading}>
                               {loading ? "Generating..." : "Generate AI Notes"}
                           </button>


                       </form>


                   </div>


                   <div className="notes-preview">


                       <h2>Notes Preview</h2>


                       <textarea
                           value={notes}
                           onChange={(e) => setNotes(e.target.value)}
                           placeholder="Your AI-generated notes will appear here. Adjust settings on the left and click 'Generate Notes'."
                       />


                       <button
                           onClick={handleDownload}
                           className="download-notes"
                           disabled={!notes}
                       >
                           Download Notes
                       </button>


                   </div>


               </div>


           </div>
       </>
   );
}


export default AINotes;

