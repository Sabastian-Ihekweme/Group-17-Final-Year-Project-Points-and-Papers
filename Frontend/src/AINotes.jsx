import {useState} from "react";
import Header from "./Header";
import "./styles/AINotes.css";


function AINotes() {


   const [text, setText] = useState("");


   // get the value via state
   <textarea value={text} onChange={(e) => setText(e.target.value)} />


   // text now always has the current value
   console.log(text);


   const handleDownload = () => {
       const doc = new jsPDF();
       const lines = doc.splitTextToSize(text, 180); // 180 = page width minus margins
       doc.text(lines, 10, 10);
       doc.save("notes.pdf");
   };




   return (
       <>


       <Header />


       <div className="ai-notes-container">


           <div className="page-title">


                <h1>Generate AI Notes</h1>


               <p>
                   Generate summarized notes from your unlocked resources with customizable length and format.
               </p>




           </div>




       <div className="divs">


          
           <div className="note-generation-control">


               <h2>Note Generation Control</h2>


               <form>


                   <div className="resource-context-div">
                   <p className="resource-context-label">Resource Context</p>
                   <textarea className="resource-context" id="resource-context"
                   name="resource-context" />
                   </div>




                   <div className="note-length-div">
                   <p className="note-length-label">Note Length</p>
                   <div className="note-length-slider">
                       <div className="note-length-slider-labels">
                           <span className="note-length">Concise</span>
                           <span className="note-length">Detailed</span>
                       </div>
                       <input className="note-length-range" type="range" min="0" max="100" defaultValue="30" />
                   </div>
                   </div>


                  
                   <div className="format-style-div">
                   <p className="format-style-label">Format Style</p>
                   <div className="format-style-options">
                       <label><input type="radio" name="format-style" value="bullet points" />Bullet Points</label>
                       <label><input type="radio" name="format-style" value="paragraphs" />Paragraphs</label>
                       <label><input type="radio" name="format-style" value="mind map outline" />Mind Map Outline</label>
                   </div>
                   </div>




                   <button type="submit">Generate AI Notes</button>


               </form>


           </div>






           <div className="notes-preview">


               <h2>Notes Preview</h2>


               <textarea
               placeholder="Your AI-generated notes will appear here. Adjust settings on the left and click 'Generate Notes'."></textarea>


               <button onClick={handleDownload}
               className="download-notes">Download Notes</button>


           </div>


          
           </div>


           </div>


       </>
   )
};


export default AINotes;

