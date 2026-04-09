import {useState, useEffect} from 'react';
import { MessageSquare, ThumbsUp, Reply, Trash2 } from 'lucide-react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Header from "./Header";
import "./styles/ResourceDetailsUnlocked.css";
import { UseResource } from './context/ResourceContext';
import { UserAuth } from './context/AuthContext';
import { useOnlineStatus } from './useOnlineStatus';

const Answer = ({ answer, session, navigate, onUpvote, onDelete, onReply, replyingTo, setReplyingTo, newAnswerTexts, setNewAnswerTexts, depth = 0, isOnline }) => {
    const answerProfile = answer.profiles || {};
    const upvoteCount = answer.upvoteCount || 0;
    const isUpvoted = answer.isUpvoted || false;
    const isOwnAnswer = answer.user_id === session?.user?.id;
    const replies = answer.replies || [];

    const handleUpvote = () => {
        if (!isOnline) { alert("No internet connection. Please check your network."); return; }
        onUpvote(answer.id);
    };

    const handleReply = () => {
        if (!isOnline) { alert("No internet connection. Please check your network."); return; }
        setReplyingTo(replyingTo === answer.id ? null : answer.id);
    };

    return (
        <div className="comment-wrapper" style={{ marginLeft: depth > 0 ? '20px' : '0' }}>
            <div className="comment-container">
                <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${answerProfile.avatar_seed || answer.user_id}`}
                    alt={answerProfile.username}
                    className="avatar"
                    onClick={() => navigate(`/profile/${answer.user_id}`)}
                    style={{ cursor: 'pointer' }}
                />
                <div className="comment-content">
                    <div className="comment-header">
                        <span className="author-name" onClick={() => navigate(`/profile/${answer.user_id}`)} style={{ cursor: 'pointer', color: '#1F9EF9' }}>
                            {answerProfile.username || 'Anonymous'}
                        </span>
                        <span className="timestamp">{new Date(answer.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="comment-text">{answer.body}</p>
                    <div className="comment-actions">
                        <button
                            className={`action-button ${isUpvoted ? 'upvoted' : ''}`}
                            onClick={handleUpvote}
                            style={{ color: isUpvoted ? '#000000' : 'inherit', opacity: isOnline ? 1 : 0.5 }}
                        >
                            <ThumbsUp style={{ width: '0.875rem', height: '0.875rem' }} />
                            <span>{upvoteCount}</span>
                        </button>
                        <button className="action-button" onClick={handleReply} style={{ opacity: isOnline ? 1 : 0.5 }}>
                            <Reply style={{ width: '0.875rem', height: '0.875rem' }} />
                            <span>Reply</span>
                        </button>
                        {isOwnAnswer && (
                            <button className="action-button delete-button" onClick={() => onDelete(answer.id)}>
                                <Trash2 style={{ width: '0.875rem', height: '0.875rem' }} />
                                <span>Delete</span>
                            </button>
                        )}
                    </div>
                    {replyingTo === answer.id && (
                        <div className="reply-input-container">
                            <textarea
                                value={newAnswerTexts[answer.id] || ''}
                                onChange={(e) => setNewAnswerTexts(prev => ({ ...prev, [answer.id]: e.target.value }))}
                                placeholder="Write your reply..."
                                className="reply-input"
                                style={{ minHeight: '80px', resize: 'vertical' }}
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => onReply(answer.id, answer.question_id)} className="submit-reply-button">Post Reply</button>
                                <button onClick={() => setReplyingTo(null)} className="cancel-button">Cancel</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {replies.length > 0 && (
                <div className="replies-container">
                    {replies.map(reply => (
                        <Answer
                            key={reply.id}
                            answer={reply}
                            session={session}
                            navigate={navigate}
                            onUpvote={onUpvote}
                            onDelete={onDelete}
                            onReply={onReply}
                            replyingTo={replyingTo}
                            setReplyingTo={setReplyingTo}
                            newAnswerTexts={newAnswerTexts}
                            setNewAnswerTexts={setNewAnswerTexts}
                            depth={depth + 1}
                            isOnline={isOnline}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const Question = ({ question, session, navigate, onUpvoteQuestion, onUpvoteAnswer, onDeleteQuestion, onDeleteAnswer, onPostAnswer, replyingTo, setReplyingTo, newAnswerTexts, setNewAnswerTexts, isOnline }) => {
    const userProfile = question.profiles || {};
    const answers = question.answers || [];
    const isOwnQuestion = question.user_id === session?.user?.id;
    const isUpvoted = question.isUpvoted || false;
    const upvoteCount = question.upvoteCount || 0;

    const handleUpvote = () => {
        if (!isOnline) { alert("No internet connection. Please check your network."); return; }
        onUpvoteQuestion(question.id);
    };

    const handleAnswer = () => {
        if (!isOnline) { alert("No internet connection. Please check your network."); return; }
        setReplyingTo(replyingTo === question.id ? null : question.id);
    };

    return (
        <div className="comment-wrapper">
            <div className="comment-container">
                <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.avatar_seed || question.user_id}`}
                    alt={userProfile.username}
                    className="avatar"
                    onClick={() => navigate(`/profile/${question.user_id}`)}
                    style={{ cursor: 'pointer' }}
                />
                <div className="comment-content">
                    <div className="comment-header">
                        <span className="author-name" onClick={() => navigate(`/profile/${question.user_id}`)} style={{ cursor: 'pointer', color: '#1F9EF9' }}>
                            {userProfile.username || 'Anonymous'}
                        </span>
                        <span className="timestamp">{new Date(question.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="comment-text" style={{ fontWeight: 'bold' }}>{question.title}</p>
                    <p className="comment-text">{question.body}</p>
                    <div className="comment-actions">
                        <button
                            className={`action-button ${isUpvoted ? 'upvoted' : ''}`}
                            onClick={handleUpvote}
                            style={{ color: isUpvoted ? '#000000' : 'inherit', opacity: isOnline ? 1 : 0.5 }}
                        >
                            <ThumbsUp style={{ width: '0.875rem', height: '0.875rem' }} />
                            <span>{upvoteCount}</span>
                        </button>
                        <button className="action-button" onClick={handleAnswer} style={{ opacity: isOnline ? 1 : 0.5 }}>
                            <Reply style={{ width: '0.875rem', height: '0.875rem' }} />
                            <span>Answer ({answers.length})</span>
                        </button>
                        {isOwnQuestion && (
                            <button className="action-button delete-button" onClick={() => onDeleteQuestion(question.id)}>
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
                                <button onClick={() => onPostAnswer(question.id, null)} className="submit-reply-button">Post Answer</button>
                                <button onClick={() => setReplyingTo(null)} className="cancel-button">Cancel</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {answers.length > 0 && (
                <div className="replies-container">
                    {answers.map(answer => (
                        <Answer
                            key={answer.id}
                            answer={answer}
                            session={session}
                            navigate={navigate}
                            onUpvote={onUpvoteAnswer}
                            onDelete={onDeleteAnswer}
                            onReply={onPostAnswer}
                            replyingTo={replyingTo}
                            setReplyingTo={setReplyingTo}
                            newAnswerTexts={newAnswerTexts}
                            setNewAnswerTexts={setNewAnswerTexts}
                            depth={0}
                            isOnline={isOnline}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

function ResourceDetailsPDF() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { session } = UserAuth();
    const { fetchAllResources, fetchQuestions, postQuestion, postAnswer, upvoteAnswer, upvoteQuestion, deleteQuestion, deleteAnswer } = UseResource();
    const isOnline = useOnlineStatus();

    const [resource, setResource] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newQuestion, setNewQuestion] = useState('');
    const [newAnswerTexts, setNewAnswerTexts] = useState({});
    const [replyingTo, setReplyingTo] = useState(null);

    useEffect(() => {
        const loadResource = async () => {
            try {
                setLoading(true);
                if (location.state?.resource?.id === id) {
                    setResource(location.state.resource);
                } else {
                    const allResources = await fetchAllResources();
                    const foundResource = allResources.find(r => r.id === id);
                    if (foundResource) setResource(foundResource);
                }
            } catch (error) {
                console.error('Error loading resource:', error);
            } finally {
                setLoading(false);
            }
        };
        if (id) loadResource();
    }, [id]);

    useEffect(() => {
        if (resource?.id) {
            const loadQuestions = async () => {
                const data = await fetchQuestions(resource.id);
                setQuestions(data);
            };
            loadQuestions();
        }
    }, [resource?.id]);

    const refreshQuestions = async () => {
        const data = await fetchQuestions(resource.id);
        setQuestions(data);
    };

    const updateAnswerUpvote = (answers, answerId) => {
        return answers.map(a => {
            if (a.id === answerId) {
                const isUpvoted = a.isUpvoted;
                return { ...a, isUpvoted: !isUpvoted, upvoteCount: isUpvoted ? a.upvoteCount - 1 : a.upvoteCount + 1 };
            }
            return { ...a, replies: updateAnswerUpvote(a.replies || [], answerId) };
        });
    };

    const handlePostQuestion = async () => {
        if (!isOnline) { alert("No internet connection. Please check your network."); return; }
        if (!newQuestion.trim()) return;
        const result = await postQuestion(resource.id, newQuestion, '');
        if (result.success) { setNewQuestion(''); refreshQuestions(); }
        else alert('Failed to post question: ' + result.error);
    };

    const handlePostAnswer = async (parentId, questionId) => {
        if (!isOnline) { alert("No internet connection. Please check your network."); return; }
        const answerText = newAnswerTexts[parentId];
        if (!answerText?.trim()) return;
        const actualQuestionId = questionId || parentId;
        const parentAnswerId = questionId ? parentId : null;
        const result = await postAnswer(actualQuestionId, answerText, parentAnswerId);
        if (result.success) {
            setNewAnswerTexts(prev => ({ ...prev, [parentId]: '' }));
            setReplyingTo(null);
            refreshQuestions();
        } else alert('Failed to post answer: ' + result.error);
    };

    const handleUpvoteAnswer = async (answerId) => {
        setQuestions(prev => prev.map(q => ({ ...q, answers: updateAnswerUpvote(q.answers, answerId) })));
        await upvoteAnswer(answerId);
    };

    const handleUpvoteQuestion = async (questionId) => {
        setQuestions(prev => prev.map(q => {
            if (q.id !== questionId) return q;
            const isUpvoted = q.isUpvoted;
            return { ...q, isUpvoted: !isUpvoted, upvoteCount: isUpvoted ? q.upvoteCount - 1 : q.upvoteCount + 1 };
        }));
        await upvoteQuestion(questionId);
    };

    const handleDeleteQuestion = async (questionId) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;
        const result = await deleteQuestion(questionId);
        if (result.success) refreshQuestions();
        else alert('Failed to delete question: ' + result.error);
    };

    const handleDeleteAnswer = async (answerId) => {
        if (!window.confirm('Are you sure you want to delete this answer?')) return;
        const result = await deleteAnswer(answerId);
        if (result.success) refreshQuestions();
        else alert('Failed to delete answer: ' + result.error);
    };

    const downloadPdf = () => {
        if (!isOnline) { alert("No internet connection. Please check your network."); return; }
        if (resource?.file_url) {
            const link = document.createElement('a');
            link.href = resource.file_url;
            link.download = `${resource.title}.pdf`;
            link.click();
        }
    };

    const handleAINavigate = (path) => {
        if (!isOnline) {
            alert("No internet connection. AI features require an internet connection.");
            return;
        }
        navigate(path, { state: { resource } });
    };

    if (loading) return <><Header /><div className="resource-details-unlocked-container"><h2>Loading resource...</h2></div></>;
    if (!resource) return <><Header /><div className="resource-details-unlocked-container"><h2>Resource not found</h2></div></>;

    return (
        <>
            <Header />
            <div className="resource-details-unlocked-container">
                <h2>Resource Details</h2>

                {!isOnline && (
                    <div style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #ef4444',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        marginBottom: '16px',
                        color: '#ef4444',
                        fontSize: '14px'
                    }}>
                        ⚠️ You're offline. Commenting, upvoting, and AI features are disabled.
                    </div>
                )}

                <div className="divs">
                    <div className="div-1">
                        <div className="resource-details-unlocked">
                            <div className="resource-title">
                                <h3>{resource.course_code} - {resource.title}</h3>
                            </div>
                            <div className="resource-metadata">
                                <p className="instructor">
                                    Uploaded by{' '}
                                    <span onClick={() => navigate(`/profile/${resource.user_id}`)} style={{ cursor: 'pointer', color: '#1F9EF9' }}>
                                        {resource.profiles?.username || 'Anonymous'}
                                    </span>
                                </p>
                                <p className="description">{resource.description || 'No description provided'}</p>
                            </div>
                            <div className="pdf-link">
                                <a href={resource.file_url} target="_blank" rel="noopener noreferrer">Click to open PDF</a>
                            </div>
                        </div>
                        <div className="download-buttons">
                            <button onClick={downloadPdf} className="download-resource" disabled={!isOnline} style={{ opacity: isOnline ? 1 : 0.5 }}>Download</button>
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
                                    placeholder={isOnline ? "Ask a question..." : "You're offline. Connect to ask questions."}
                                    className="comment-input"
                                    disabled={!isOnline}
                                    style={{ opacity: isOnline ? 1 : 0.6 }}
                                />
                                <button
                                    onClick={handlePostQuestion}
                                    className="submit-button"
                                    disabled={!isOnline}
                                    style={{ opacity: isOnline ? 1 : 0.5 }}
                                >
                                    Post Question
                                </button>
                            </div>
                            <div className="comments-list">
                                {questions.length > 0 ? (
                                    questions.map(question => (
                                        <Question
                                            key={question.id}
                                            question={question}
                                            session={session}
                                            navigate={navigate}
                                            onUpvoteQuestion={handleUpvoteQuestion}
                                            onUpvoteAnswer={handleUpvoteAnswer}
                                            onDeleteQuestion={handleDeleteQuestion}
                                            onDeleteAnswer={handleDeleteAnswer}
                                            onPostAnswer={handlePostAnswer}
                                            replyingTo={replyingTo}
                                            setReplyingTo={setReplyingTo}
                                            newAnswerTexts={newAnswerTexts}
                                            setNewAnswerTexts={setNewAnswerTexts}
                                            isOnline={isOnline}
                                        />
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
                            <button
                                className="generate-ai-notes"
                                onClick={() => handleAINavigate('/generate-ai-notes')}
                                disabled={!isOnline}
                                style={{ opacity: isOnline ? 1 : 0.5, cursor: isOnline ? 'pointer' : 'not-allowed' }}
                                title={!isOnline ? "No internet connection" : ""}
                            >
                                Generate AI Notes
                            </button>
                            <button
                                className="generate-ai-answers"
                                onClick={() => handleAINavigate('/generate-ai-answer')}
                                disabled={!isOnline}
                                style={{ opacity: isOnline ? 1 : 0.5, cursor: isOnline ? 'pointer' : 'not-allowed' }}
                                title={!isOnline ? "No internet connection" : ""}
                            >
                                Generate AI Answers
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ResourceDetailsPDF;