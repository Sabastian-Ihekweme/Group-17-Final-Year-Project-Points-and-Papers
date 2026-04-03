import {useState, useRef, useEffect} from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, MessageSquare, ThumbsUp, Reply, Trash2 } from 'lucide-react';
import { useParams, useLocation } from 'react-router-dom';
import Header from "./Header";
import "./styles/ResourceDetailsUnlocked.css";
import { UseResource } from './context/ResourceContext';

function ResourceDetailsImage() {
    const { id } = useParams();
    const location = useLocation();
    const { fetchAllResources } = UseResource();
    
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Fetch resource on mount
    useEffect(() => {
        const loadResource = async () => {
            try {
                setLoading(true);
                
                // Check if resource was passed via location state
                if (location.state?.resource?.id === id) {
                    setResource(location.state.resource);
                } else {
                    // Fetch all resources and find the one with matching ID
                    const allResources = await fetchAllResources();
                    const foundResource = allResources.find(r => r.id === id);
                    
                    if (foundResource) {
                        setResource(foundResource);
                    } else {
                        console.error('Resource not found');
                    }
                }
            } catch (error) {
                console.error('Error loading resource:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadResource();
        }
    }, [id, location.state, fetchAllResources]);

    // For image resources, get the images array
    // If your DB stores multiple images per resource, fetch them here
    // For now, we'll display the single file_url
    const resources = resource?.file_url ? [resource.file_url] : [];

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === 0 ? resources.length - 1 : prevIndex - 1
        );
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === resources.length - 1 ? 0 : prevIndex + 1
        );
    };

    const downloadImagesAsZip = async () => {
        try {
            const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')).default;
            const zip = new JSZip();

            for (let i = 0; i < resources.length; i++) {
                const response = await fetch(resources[i]);
                const blob = await response.blob();
                zip.file(`image-${i + 1}.jpg`, blob);
            }

            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${resource.title}-images.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading resources:', error);
            alert('Failed to download resources. Please try again.');
        }
    };

    const [comments, setComments] = useState([
        {
          id: 1,
          author: 'Sarah Johnson',
          avatar: 'https://i.pravatar.cc/150?img=1',
          text: 'This is such an insightful post! Really helps clarify the concepts.',
          timestamp: '2 hours ago',
          likes: 12,
          replies: []
        }
    ]);

    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [visibleReplies, setVisibleReplies] = useState({});
    const [showReplies, setShowReplies] = useState({});

    const addComment = () => {
        if (newComment.trim()) {
            const comment = {
                id: Date.now(),
                author: 'You',
                avatar: 'https://i.pravatar.cc/150?img=10',
                text: newComment,
                timestamp: 'Just now',
                likes: 0,
                replies: []
            };
            setComments([comment, ...comments]);
            setNewComment('');
        }
    };

    const addReply = (parentId) => {
        if (replyText.trim()) {
            const reply = {
                id: Date.now(),
                author: 'You',
                avatar: 'https://i.pravatar.cc/150?img=10',
                text: replyText,
                timestamp: 'Just now',
                likes: 0,
                replies: []
            };

            const addReplyToComment = (commentList) => {
                return commentList.map(comment => {
                    if (comment.id === parentId) {
                        return {
                            ...comment,
                            replies: [reply, ...comment.replies]
                        };
                    }
                    return comment;
                });
            };

            setComments(addReplyToComment(comments));
            setReplyText('');
            setReplyingTo(null);
        }
    };

    const likeComment = (commentId) => {
        const updateLikes = (commentList) => {
            return commentList.map(comment => {
                if (comment.id === commentId) {
                    return { ...comment, likes: comment.likes + 1 };
                }
                return comment;
            });
        };

        setComments(updateLikes(comments));
    };

    const deleteComment = (commentId) => {
        setComments(comments.filter(comment => comment.id !== commentId));
    };

    const Comment = ({ comment }) => {
        return (
            <div className="comment-wrapper">
                <div className="comment-container">
                    <img src={comment.avatar} alt={comment.author} className="avatar" />
                    
                    <div className="comment-content">
                        <div className="comment-header">
                            <span className="author-name">{comment.author}</span>
                            <span className="timestamp">{comment.timestamp}</span>
                        </div>
                        
                        <p className="comment-text">{comment.text}</p>
                        
                        <div className="comment-actions">
                            <button 
                                className="action-button"
                                onClick={() => likeComment(comment.id)}
                            >
                                <ThumbsUp style={{ width: '0.875rem', height: '0.875rem' }} />
                                <span>{comment.likes}</span>
                            </button>
                            
                            <button 
                                className="action-button"
                                onClick={() => setReplyingTo(comment.id)}
                            >
                                <Reply style={{ width: '0.875rem', height: '0.875rem' }} />
                                <span>Answer</span>
                            </button>

                            {comment.author === 'You' && (
                                <button 
                                    className="action-button delete-button"
                                    onClick={() => {
                                        if (window.confirm('Are you sure?')) {
                                            deleteComment(comment.id);
                                        }
                                    }}
                                >
                                    <Trash2 style={{ width: '0.875rem', height: '0.875rem' }} />
                                    <span>Delete</span>
                                </button>
                            )}
                        </div>

                        {replyingTo === comment.id && (
                            <div className="reply-input-container">
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder={`Answer ${comment.author}...`}
                                    className="reply-input"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            addReply(comment.id);
                                        }
                                    }}
                                    autoFocus
                                />
                                <button onClick={() => addReply(comment.id)} className="submit-reply-button">
                                    Post
                                </button>
                                <button onClick={() => setReplyingTo(null)} className="cancel-button">
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="resource-details-unlocked-container">
                    <h2>Loading resource...</h2>
                </div>
            </>
        );
    }

    if (!resource) {
        return (
            <>
                <Header />
                <div className="resource-details-unlocked-container">
                    <h2>Resource not found</h2>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />

            <div className="resource-details-unlocked-container">

                <h2>Resource Details</h2>

                <div className="divs">

                <div className="div-1">
                <div className="resource-details-unlocked">

                    <div className="resource-title">
                    <h3>{resource.course_code} - {resource.title}</h3>
                    </div>
                    
                    <div className="resource-metadata">
                    <p className="instructor">By {resource.instructor}</p>

                    <p className="description">{resource.description || 'No description provided'}</p>
                    </div>

                        <div className="carousel-wrapper">
                        <div className="image-frame">
                            {resources.length > 0 ? (
                                <>
                                    <img
                                    src={resources[currentIndex]}
                                    alt={`Slide ${currentIndex + 1}`}
                                    className="carousel-image"
                                    />
                                    
                                    <div className="image-counter">
                                    {currentIndex + 1} / {resources.length}
                                    </div>
                                </>
                            ) : (
                                <p>No images available</p>
                            )}
                        </div>

                        {resources.length > 1 && (
                            <>
                                <button
                                    onClick={goToPrevious}
                                    className="nav-button nav-button-left"
                                >
                                    <ChevronLeft style={{ width: '1.5rem', height: '1.5rem' }} />
                                </button>

                                <button
                                    onClick={goToNext}
                                    className="nav-button nav-button-right"
                                >
                                    <ChevronRight style={{ width: '1.5rem', height: '1.5rem' }} />
                                </button>

                                <div className="dot-indicators">
                                    {resources.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`dot ${index === currentIndex ? 'active' : ''}`}
                                    />
                                    ))}
                                </div>
                            </>
                        )}
                        </div>

                        
                    </div>

                    <div className="download-buttons">
                        <button className="view-resource">
                            View Resource
                        </button>

                        <button onClick={downloadImagesAsZip} className="download-resource">
                            Download
                        </button>
                    </div>


                <div className="comments-section">
                    
                        <h2 className="section-header">
                        <MessageSquare style={{ width: '1.5rem', height: '1.5rem' }} />
                        Questions ({comments.length})
                        </h2>

                        <div className="new-comment-container">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Ask a question..."
                            className="comment-input"
                        />
                        <button onClick={addComment} className="submit-button">
                            Post Question
                        </button>
                        </div>

                        <div className="comments-list">
                        {comments.map(comment => (
                            <Comment key={comment.id} comment={comment}/>
                        ))}
                        </div>
                </div> 
                    </div>
                            

                    <div className="div-2">
                    <div className="resource-interactions">

                        <h3>Resource Interactions</h3>

                        <button className="generate-ai-notes">
                            Generate AI Notes
                        </button>

                        <button className="generate-ai-answers">
                            Generate AI Answers
                        </button>
                    </div>




                    </div>
                    

    
                </div>

                </div>            

        </>
    )
}

export default ResourceDetailsImage;