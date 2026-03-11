import Header from "./Header";
import "./styles/AIAnswer.css";


function AIAnswer() {

    return (
        <>

            <Header />

            <div className="generate-ai-answer-container">

                <h1>Generate AI Answer</h1>

                <h2>
                    Utilize AI to generate answers based on the content of your unlocked academic resources.
                </h2>

                <div className="resource-details">
                    <h3>
                        Context from: SEN 317 Midterm Exam 2023
                    </h3>

                    <a>View Resource</a>

                    <p>
                        Comprehensive notes covering the basics of quantum mechanics, wave-particle duality, Schrödinger equation, and quantum entanglement. Ideal for undergraduate students.
                    </p>
                </div>


                <form className="question-for-ai">

                    <h2>Your Question for the AI</h2>

                    <label for="question">
                        Question/Context
                    </label>

                    <textarea 
                        className="ai-question"
                        name="question"
                        id="question"
                        placeholder="Ask a question or provide context from the resource (e.g., 'Explain the concept of wave-particle duality from this document')..."
                    />
                    
                    <button type="submit">
                        Generate Answer
                    </button>

                </form>

                
                <div className="ai-generated-answer">
                    
                    <h3>AI Generated Answer</h3>

                    <div className="ai-text-container"> 
                        <div className="text">Your AI-generated answer will appear here. Please provide a question above and click 'Generate Answer'.
                        </div>
                    </div>

                </div>

            </div>
        </>
    )

}

export default AIAnswer;

