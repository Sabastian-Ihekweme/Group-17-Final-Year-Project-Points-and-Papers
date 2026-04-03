import {useState, useRef, useEffect} from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, MessageSquare, ThumbsUp, Reply, Trash2 } from 'lucide-react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Header from "./Header";
import "./styles/ResourceDetailsUnlocked.css";
import { UseResource } from './context/ResourceContext';
import { UserAuth } from './context/AuthContext';

function ResourceDetailsPDF() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { session } = UserAuth();
    const { fetchAllResources, fetchQuestions, postQuestion, postAnswer, upvoteAnswer, deleteQuestion, deleteAnswer } = UseResource();
    
    const [resource, setResource] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newQuestion, setNewQuestion] = useState('');
    const [newAnswerTexts, setNewAnswerTexts] = useState({});
    const [replyingTo, setReplyingTo] = useState(null);
    const [upvotedAnswers, setUpvotedAnswers] = useState(new Set());

    // Fetch resource on mount
    useEffect(() => {
        const loadResource = async () => {
            try {
                setLoading(true);
                
                if (location.state?.resource?.id === id) {
                    setResource(location.state.resource);
                } else {
                    const allResources = await fetchAllResources();
                    const foundResource = allResources.find(r => r.id === id);
                    
                    if (foundResource) {
                        setResource(foundResource);
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

    // Fetch questions when resource loads
    useEffect(() => {
        if (resource?.id) {
            const loadQuestions = async () => {
                const data = await fetchQuestions(resource.id);
                setQuestions(data);
            };
            loadQuestions();
        }
    }, [resource?.id, fetchQuestions]);

    // Handle posting a new question
    const handlePostQuestion = async () => {
        if (!newQuestion.trim()) return;

        const result = await postQuestion(resource.id, newQuestion, '');
        
        if (result.success) {
            setNewQuestion('');
            // Refresh questions
            const data = await fetchQuestions(resource.id);
            setQuestions(data);
        } else {
            alert('Failed to post question: ' + result.error);
        }
    };

    // Handle posting an answer
    const handlePostAnswer = async (questionId) => {
        const answerText = newAnswerTexts[questionId];
        if (!answerText?.trim()) return;

        const result = await postAnswer(questionId, answerText);
        
        if (result.success) {
            setNewAnswerTexts(prev => ({ ...prev, [questionId]: '' }));
            setReplyingTo(null);
            // Refresh questions
            const data = await fetchQuestions(resource.id);
            setQuestions(data);
        } else {
            alert('Failed to post answer: ' + result.error);
        }
    };

    // Handle upvoting an answer
    const handleUpvote = async (answerId) => {
        const result = await upvoteAnswer(answerId);
        
        if (result.success) {
            if (result.upvoted) {
                setUpvotedAnswers(prev => new Set([...prev, answerId]));
            } else {
                setUpvotedAnswers(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(answerId);
                    return newSet;
                });
            }
            // Refresh questions to get updated upvote counts
            const data = await fetchQuestions(resource.id);
            setQuestions(data);
        }
    };

    // Handle deleting a question
    const handleDeleteQuestion = async (questionId) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;

        const result = await deleteQuestion(questionId);
        
        if (result.success) {
            // Refresh questions
            const data = await fetchQuestions(resource.id);
            setQuestions(data);
        } else {
            alert('Failed to delete question: ' + result.error);
        }
    };

    // Handle deleting an answer
    const handleDeleteAnswer = async (answerId) => {
        if (!window.confirm('Are you sure you want to delete this answer?')) return;

        const result = await deleteAnswer(answerId);
        
        if (result.success) {
            // Refresh questions
            const data = await fetchQuestions(resource.id);
            setQuestions(data);
        } else {
            alert('Failed to delete answer: ' + result.error);
        }
    };

    const downloadPdf = () => {
        if (resource?.file_url) {
            const link = document.createElement('a');
            link.href = resource.file_url;
            link.download = `${resource.title}.pdf`;
            link.click();
        }
    };

    const Question = ({ question }) => {
        const userProfile = question.profiles || {};
        const answers = question.answers || [];
        const isOwnQuestion = question.user_id === session?.user?.id;

        return (
            <div className="comment-wrapper">
                <div className="comment-container">
                    <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${question.user_id}`} 
                        alt={userProfile.username} 
                        className="avatar" 
                        onClick={() => navigate(`/profile/${question.user_id}`)}
                        style={{ cursor: 'pointer' }}
                    />
                    
                    <div className="comment-content">
                        <div className="comment-header">
                            <span 
                                className="author-name"
                                onClick={() => navigate(`/profile/${question.user_id}`)}
                                style={{ cursor: 'pointer', color: '#1F9EF9' }}
                            >
                                {userProfile.username || 'Anonymous'}
                            </span>
                            <span className="timestamp">
                                {new Date(question.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        
                        <p className="comment-text" style={{ fontWeight: 'bold' }}>{question.title}</p>
                        <p className="comment-text">{question.body}</p>
                        
                        <div className="comment-actions">
                            <button 
                                className="action-button"
                                onClick={() => setReplyingTo(replyingTo === question.id ? null : question.id)}
                            >
                                <Reply style={{ width: '0.875rem', height: '0.875rem' }} />
                                <span>Answer ({answers.length})</span>
                            </button>

                            {isOwnQuestion && (
                                <button 
                                    className="action-button delete-button"
                                    onClick={() => handleDeleteQuestion(question.id)}
                                >
                                    <Trash2 style={{ width: '0.875rem', height: '0.875rem' }} />
                                    <span>Delete</span>
                                </button>
                            )}
                        </div>

                        {replyingTo === question.id && (
                            <div className="reply-input-container">
                                <textarea
                                    value={newAnswerTexts[question.id] || ''}
                                    onChange={(e) => setNewAnswerTexts(prev => ({ ...prev, [question.id]: e.target.value }))}
                                    placeholder="Write your answer..."
                                    className="reply-input"
                                    style={{ minHeight: '80px', resize: 'vertical' }}
                                />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => handlePostAnswer(question.id)} className="submit-reply-button">
                                        Post Answer
                                    </button>
                                    <button onClick={() => setReplyingTo(null)} className="cancel-button">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Answers */}
                {answers.length > 0 && (
                    <div className="replies-container">
                        {answers.map(answer => {
                            const answerProfile = answer.profiles || {};
                            const upvoteCount = answer.upvotes?.[0]?.count || 0;
                            const isOwnAnswer = answer.user_id === session?.user?.id;
                            const isUpvoted = upvotedAnswers.has(answer.id);

                            return (
                                <div key={answer.id} className="comment-wrapper" style={{ marginLeft: '20px' }}>
                                    <div className="comment-container">
                                        <img 
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${answer.user_id}`} 
                                            alt={answerProfile.username} 
                                            className="avatar" 
                                            onClick={() => navigate(`/profile/${answer.user_id}`)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        
                                        <div className="comment-content">
                                            <div className="comment-header">
                                                <span 
                                                    className="author-name"
                                                    onClick={() => navigate(`/profile/${answer.user_id}`)}
                                                    style={{ cursor: 'pointer', color: '#1F9EF9' }}
                                                >
                                                    {answerProfile.username || 'Anonymous'}
                                                </span>
                                                <span className="timestamp">
                                                    {new Date(answer.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            
                                            <p className="comment-text">{answer.body}</p>
                                            
                                            <div className="comment-actions">
                                                <button 
                                                    className={`action-button ${isUpvoted ? 'upvoted' : ''}`}
                                                    onClick={() => handleUpvote(answer.id)}
                                                    style={{ color: isUpvoted ? '#1F9EF9' : 'inherit' }}
                                                >
                                                    <ThumbsUp style={{ width: '0.875rem', height: '0.875rem' }} />
                                                    <span>{upvoteCount}</span>
                                                </button>

                                                {isOwnAnswer && (
                                                    <button 
                                                        className="action-button delete-button"
                                                        onClick={() => handleDeleteAnswer(answer.id)}
                                                    >
                                                        <Trash2 style={{ width: '0.875rem', height: '0.875rem' }} />
                                                        <span>Delete</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
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

                    <div className="pdf-link">
                      <a href={resource.file_url} target="_blank" rel="noopener noreferrer">Click to open PDF</a>
                    </div>
                        
                    </div>

                    <div className="download-buttons">
                        <button 
                        onClick={downloadPdf}
                        className="download-resource">
                            Download
                        </button>
                    </div>


                <div className="comments-section">
                    
                        <h2 className="section-header">
                        <MessageSquare style={{ width: '1.5rem', height: '1.5rem' }} />
                        Questions ({questions.length})
                        </h2>

                        <div className="new-comment-container">
                        <textarea
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            placeholder="Ask a question..."
                            className="comment-input"
                        />
                        <button onClick={handlePostQuestion} className="submit-button">
                            Post Question
                        </button>
                        </div>

                        <div className="comments-list">
                        {questions.length > 0 ? (
                            questions.map(question => (
                                <Question key={question.id} question={question}/>
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', color: '#999' }}>No questions yet. Be the first to ask!</p>
                        )}
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

export default ResourceDetailsPDF;