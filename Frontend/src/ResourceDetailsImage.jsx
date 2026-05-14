import {useState, useEffect} from 'react';
import { ChevronLeft, ChevronRight, MessageSquare, ThumbsUp, Reply, Trash2 } from 'lucide-react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Header from "./Header";
import "./styles/ResourceDetailsUnlocked.css";
import { UseResource } from './context/ResourceContext';
import { UserAuth } from './context/AuthContext';
import supabase from './config/supabaseClient';
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

function ResourceDetailsImage() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { session } = UserAuth();
    const { fetchAllResources, fetchQuestions, postQuestion, postAnswer, upvoteAnswer, upvoteQuestion, deleteQuestion, deleteAnswer } = UseResource();
    const isOnline = useOnlineStatus();

    const [resource, setResource] = useState(null);
    const [resourceImages, setResourceImages] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
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

