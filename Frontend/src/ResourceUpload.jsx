import Header from './Header';
import {useState, useRef} from 'react';
import './styles/ResourceUpload.css';

function ResourceUpload () {

    const resourceTypes = [
        {
            resourceType: 'midterm exam',
            points: 50
        },

        {
            resourceType: 'final exam',
            points: 70
        },

        {
            resourceType: 'report/essay',
            points: 20
        }
    ]

      const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

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

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

    return (
        <>
            <Header />

            <div className="page-title"><h1>Upload New Resource</h1></div>

            <div className="resource-upload-container">

                <form>



                    <div className="resource-details">

                        <h2>Resource Details</h2>

                        <p>Select Resource Type</p>

                    {
                       resourceTypes.map((resourceType) => (
                        
                        <div className="resource-type">
                            <input type='radio' name="resource-type" value={resourceType.resourceType}/>
                            <label for="resource-type">{resourceType.resourceType}</label>
                            <span className="points">+{resourceType.points} points</span>
                        </div>

                       ))
                    }

            </div>


                 <h2>Resource Information</h2>
                    
                <div className="resource-info">

   
                    <div className="resource-info-box">
                        <label for="resource-title">Title</label>
                        <input name="resource-title" className="resource-title"
                        placeholder="e.g. Introduction to Software Engineering"/>
                    </div>
                    
                    <div className="resource-info-box">
                        <label for="resource-course-code">Course Code</label>
                        <input name="resource-course-code" className="resource-course-code"
                        placeholder="e.g. SEN 201"/>
                    </div>
                    
                    <div className="resource-info-box">
                        <label for="resource-year">Academic Year</label>
                        <input name="resource-year" className="resource-year"
                        placeholder="e.g. 2025-2026"/>
                    </div>
                    
                    <div className="resource-info-box">
                        <label for="resource-title">Instructor/Lecturer</label>
                        <input name="resource-instructor" className="resource-instructor"
                        placeholder="e.g. Mr Austin Ogar"/>
                    </div>
                    
                    <div className="resource-info-box">
                        <label for="resource-description">Description</label>
                        <textarea name="resource-description" className="resource-description"
                        placeholder="Provide a detailed description of the resource, its scope, and any relevant context."/>
                    </div>
                
                </div>
            

                    <h2>Upload File</h2>

        <div className="card">
          
          <div
            className={`dropzone ${isDragging ? 'active' : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden-input"
            />
            
            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            
            <p className="main-text">
              {isDragging ? 'Drop files here' : 'Drag & drop your file here, or click to browse'}
            </p>
            <p className="sub-text">
              (Max file size: 20MB, accepted formats: PDF, DOCX, PPTX, JPG, PNG)
            </p>
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
                  <button
                    onClick={() => removeFile(index)}
                    className="remove-button"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>


                <button className="upload-resource-btn" type="submit">Upload Resource</button>
                </form>

            </div>
        </>
    )
}

export default ResourceUpload;