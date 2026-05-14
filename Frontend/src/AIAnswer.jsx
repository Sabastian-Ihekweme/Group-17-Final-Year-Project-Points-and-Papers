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

 
}

export default AIAnswer;
