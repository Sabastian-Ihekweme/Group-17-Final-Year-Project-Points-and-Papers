import Header from './Header';
import { useState, useRef } from 'react';
import './styles/ResourceUpload.css';
import { UseResource } from './context/ResourceContext';
import { useNavigate } from 'react-router-dom';
import { useOnlineStatus } from './useOnlineStatus';

function ResourceUpload() {

    const resourceTypes = [
        { resourceType: 'final exam', uploadPoints: 70, unlockPoints: 35 },
        { resourceType: 'midterm exam', uploadPoints: 50, unlockPoints: 25 },
        { resourceType: 'report/essay', uploadPoints: 20, unlockPoints: 15 },
        { resourceType: 'assignment', uploadPoints: 15, unlockPoints: 10 },
        { resourceType: 'lecture note', uploadPoints: 10, unlockPoints: 5 },
        { resourceType: 'other', uploadPoints: 5, unlockPoints: 2 },
    ];

    const departments = [
        'Computer Science', 'Cyber Security', 'Data Science',
        'Information Technology', 'Information Systems', 'Software Engineering'
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
    const [department, setDepartment] = useState("");
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
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    };

    const handleFileSelect = (e) => setFiles(prev => [...prev, ...Array.from(e.target.files)]);
    const handleClick = () => fileInputRef.current?.click();
    const removeFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index));

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const resetForm = () => {
        setSelectedResourceType(""); setTitle(""); setCourseCode("");
        setYear(""); setInstructor(""); setDescription("");
        setDepartment(""); setFiles([]); setError("");
        setFormKey(prev => prev + 1);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setError("");

        if (!isOnline) return setError("No internet connection. Please check your connection and try again.");
        if (!selectedResourceType) return setError("Please select a resource type.");
        if (!title.trim()) return setError("Please enter a title.");
        if (!courseCode.trim()) return setError("Please enter a course code.");
        if (!year.trim()) return setError("Please enter an academic year.");
        if (!instructor.trim()) return setError("Please enter an instructor name.");
        if (files.length === 0) return setError("Please upload at least one file.");

        setLoading(true);

        try {
            const result = await uploadResource({
                title: title.trim(), description,
                courseCode: courseCode.trim(), year: year.trim(),
                instructor: instructor.trim(), resourceType: selectedResourceType,
                files, department: department || null
            });

            if (result.success) {
                console.log('[ResourceUpload] Extraction stats:', result.extractionStats);
                setPopup(result.pointsEarned);
                resetForm();
                setTimeout(() => setPopup(null), 3000);
            } else {
                setError(result.error === 'Resource already exists'
                    ? 'A resource with the same details already exists.'
                    : 'Something went wrong, please try again.');
            }
        } catch (err) {
            console.error('[ResourceUpload] Unexpected error:', err);
            setError("An error occurred during upload. Please try again.");
        } finally {
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

                        {resourceTypes.map((rt) => (
                            <div className="resource-type" key={rt.resourceType}>
                                <input
                                    type='radio'
                                    name="resource-type"
                                    value={rt.resourceType}
                                    onChange={(e) => setSelectedResourceType(e.target.value)}
                                />
                                <label htmlFor="resource-type" style={{ textTransform: 'capitalize' }}>
                                    {rt.resourceType}
                                </label>
                                <span className="points">+{rt.uploadPoints} Points</span>
                            </div>
                        ))}
                    </div>

                    <h2>Resource Information</h2>

                    <div className="resource-info">

                        <div className="resource-info-box">
                            <label htmlFor="resource-title">Title</label>
                            <input name="resource-title" className="resource-title"
                                placeholder="e.g. Introduction to Software Engineering"
                                onChange={(e) => setTitle(e.target.value)} />
                        </div>

                        <div className="resource-info-box">
                            <label htmlFor="resource-course-code">Course Code</label>
                            <input name="resource-course-code" className="resource-course-code"
                                placeholder="e.g. SEN 201"
                                onChange={(e) => setCourseCode(e.target.value)} />
                        </div>

                        <div className="resource-info-box">
                            <label htmlFor="resource-year">Academic Year</label>
                            <input name="resource-year" className="resource-year"
                                placeholder="e.g. 2026"
                                onChange={(e) => setYear(e.target.value)} />
                        </div>

                        <div className="resource-info-box">
                            <label htmlFor="resource-instructor">Instructor/Lecturer</label>
                            <input name="resource-instructor" className="resource-instructor"
                                placeholder="e.g. Mr Austin Ogar"
                                onChange={(e) => setInstructor(e.target.value)} />
                        </div>

                        <div className="resource-info-box">
                            <label htmlFor="resource-department">Department</label>
                            <select name="resource-department" className="resource-department"
                                value={department} onChange={(e) => setDepartment(e.target.value)}>
                                <option value="">Select a department (optional)</option>
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        <div className="resource-info-box">
                            <label htmlFor="resource-description">Description (Optional)</label>
                            <textarea name="resource-description" className="resource-description"
                                placeholder="Provide a detailed description of the resource, its scope, and any relevant context."
                                onChange={(e) => setDescription(e.target.value)} />
                        </div>

                    </div>

                    <h2>Upload Files</h2>

                    <div className="card">
                        <div
                            className={`dropzone ${isDragging ? 'active' : ''}`}
                            onDragEnter={handleDragEnter} onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={handleClick}
                        >
                            <input ref={fileInputRef} type="file" accept=".pdf, image/*"
                                onChange={handleFileSelect} className="hidden-input" multiple />
                            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="main-text">
                                {isDragging ? 'Drop files here' : 'Drag & drop your files here, or click to browse'}
                            </p>
                            <p className="sub-text">(Max file size: 50MB, accepted formats: PDF, JPG, PNG)</p>
                        </div>

                        {files.length > 0 && (
                            <div className="file-list">
                                <h2 className="file-list-title">Uploaded Files ({files.length})</h2>
                                {files.map((file, index) => (
                                    <div key={index} className="file-item">
                                        <div className="file-info">
                                            <svg className="file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <div>
                                                <p className="file-name">{file.name}</p>
                                                <p className="file-size">{formatFileSize(file.size)}</p>
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => removeFile(index)} className="remove-button">×</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <button className="upload-resource-btn" type="submit" disabled={loading || !isOnline}>
                        {loading ? "Uploading..." : "Upload Resource"}
                    </button>

                </form>
            </div>

            {popup && (
                <div className="points-popup">
                    <p>🎉 Resource uploaded successfully!</p>
                    <p>You earned <strong>+{popup} points</strong></p>
                </div>
            )}
        </>
    );
}

export default ResourceUpload;
