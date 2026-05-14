import Header from './Header';
import { useState, useRef } from 'react';
import './styles/ResourceUpload.css';
import { UseResource } from './context/ResourceContext';
import { useNavigate } from 'react-router-dom';
import { useOnlineStatus } from './useOnlineStatus';

function ResourceUpload() {

    const resourceTypes = [
        { resourceType: 'midterm exam', points: 50 },
        { resourceType: 'final exam', points: 70 },
        { resourceType: 'report/essay', points: 20 }
    ];

    const { uploadResource } = UseResource();
    const navigate = useNavigate();
    const isOnline = useOnlineStatus();

    const [selectedResourceType, setSelectedResourceType] = useState("");
    const [title, setTitle] = useState("");
    const [courseCode, setCourseCode] = useState("");
    const [year, setYear] = useState("");
    const [instructor, setInstructor] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [popup, setPopup] = useState(null);
    const [formKey, setFormKey] = useState(0);

    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);

    const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles(prev => [...prev, ...droppedFiles]);
    };

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const handleClick = () => { fileInputRef.current?.click(); };
    const removeFile = (index) => { setFiles(prev => prev.filter((_, i) => i !== index)); };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const resetForm = () => {
        setSelectedResourceType("");
        setTitle("");
        setCourseCode("");
        setYear("");
        setInstructor("");
        setDescription("");
        setFiles([]);
        setError("");
        setFormKey(prev => prev + 1);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setError("");

        if (!isOnline) return setError("No internet connection. Please check your connection and try again.");

        // Validate all required fields
        if (!selectedResourceType) return setError("Please select a resource type.");
        if (!title.trim()) return setError("Please enter a title.");
        if (!courseCode.trim()) return setError("Please enter a course code.");
        if (!year.trim()) return setError("Please enter an academic year.");
        if (!instructor.trim()) return setError("Please enter an instructor name.");
        if (files.length === 0) return setError("Please upload at least one file.");

        setLoading(true);

        try {
            const result = await uploadResource({
                title: title.trim(),
                description,
                courseCode: courseCode.trim(),
                year: year.trim(),
                instructor: instructor.trim(),
                resourceType: selectedResourceType,
                files: files
            });

            if (result.success) {
                setPopup(result.pointsEarned);
                resetForm();
                setTimeout(() => {
                    setPopup(null);
                }, 3000);
            } else {
                setError(result.error === 'Resource already exists'
                    ? 'A resource with the same details already exists.'
                    : 'Something went wrong, please try again.'
                );
            }
        } catch (err) {
            setError("An error occurred during upload. Please try again.");
        } finally {
            // Always reset loading — this fixes the mobile stuck button bug
            setLoading(false);
        }
    };

    return (
        <>
            <Header />

            <div className="page-title"><h1>Upload New Resource</h1></div>

            <div className="resource-upload-container">

                {!isOnline && (
                    <div className="no-internet-banner">
                        ⚠️ You're offline. Please check your internet connection to upload resources.
                    </div>
                )}

                <form key={formKey} onSubmit={handleUpload}>

                    <div className="resource-details">
                        <h2>Resource Details</h2>
                        <p>Select Resource Type</p>

                        {resourceTypes.map((resourceType) => (
                            <div className="resource-type" key={resourceType.resourceType}>
                                <input
                                    type='radio'
                                    name="resource-type"
                                    value={resourceType.resourceType}
                                    onChange={(e) => setSelectedResourceType(e.target.value)}
                                />
                                <label htmlFor="resource-type">{resourceType.resourceType}</label>
                                <span className="points">+{resourceType.points} points</span>
                            </div>
                        ))}
                    </div>

                    <h2>Resource Information</h2>

                    <div className="resource-info">
