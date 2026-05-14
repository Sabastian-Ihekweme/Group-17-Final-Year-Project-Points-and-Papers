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


   const avatarSrc = answerProfile.avatar_url ||
       `https://api.dicebear.com/7.x/avataaars/svg?seed=${answerProfile.avatar_seed || answer.user_id}`;


   const handleUpvote = () => {
       if (!isOnline) { alert("No internet connection."); return; }
       onUpvote(answer.id);
   };


   const handleReply = () => {
       if (!isOnline) { alert("No internet connection."); return; }
       setReplyingTo(replyingTo === answer.id ? null : answer.id);
   };


   return (
       <div className="comment-wrapper" style={{ marginLeft: depth > 0 ? '20px' : '0' }}>
           <div className="comment-container">
               <img
                   src={avatarSrc}
                   alt={answerProfile.username}
                   className="avatar"
                   onClick={() => navigate(`/profile/${answer.user_id}`)}
                   style={{ cursor: 'pointer', objectFit: 'cover' }}
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
                       <button className={`action-button ${isUpvoted ? 'upvoted' : ''}`} onClick={handleUpvote}
                           style={{ color: isUpvoted ? '#000000' : 'inherit', opacity: isOnline ? 1 : 0.5 }}>
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
                       <Answer key={reply.id} answer={reply} session={session} navigate={navigate}
                           onUpvote={onUpvote} onDelete={onDelete} onReply={onReply}
                           replyingTo={replyingTo} setReplyingTo={setReplyingTo}
                           newAnswerTexts={newAnswerTexts} setNewAnswerTexts={setNewAnswerTexts}
                           depth={depth + 1} isOnline={isOnline} />
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


   const avatarSrc = userProfile.avatar_url ||
       `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.avatar_seed || question.user_id}`;


   const handleUpvote = () => {
       if (!isOnline) { alert("No internet connection."); return; }
       onUpvoteQuestion(question.id);
   };


   const handleAnswer = () => {
       if (!isOnline) { alert("No internet connection."); return; }
       setReplyingTo(replyingTo === question.id ? null : question.id);
   };


   return (
       <div className="comment-wrapper">
           <div className="comment-container">
               <img
                   src={avatarSrc}
                   alt={userProfile.username}
                   className="avatar"
                   onClick={() => navigate(`/profile/${question.user_id}`)}
                   style={{ cursor: 'pointer', objectFit: 'cover' }}
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
                       <button className={`action-button ${isUpvoted ? 'upvoted' : ''}`} onClick={handleUpvote}
                           style={{ color: isUpvoted ? '#000000' : 'inherit', opacity: isOnline ? 1 : 0.5 }}>
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
                       <Answer key={answer.id} answer={answer} session={session} navigate={navigate}
                           onUpvote={onUpvoteAnswer} onDelete={onDeleteAnswer} onReply={onPostAnswer}
                           replyingTo={replyingTo} setReplyingTo={setReplyingTo}
                           newAnswerTexts={newAnswerTexts} setNewAnswerTexts={setNewAnswerTexts}
                           depth={0} isOnline={isOnline} />
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
   const [touchStart, setTouchStart] = useState(null);


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
       const loadResourceImages = async () => {
           if (resource?.id) {
               try {
                   const { data, error } = await supabase
                       .from('resource_files')
                       .select('file_url')
                       .eq('resource_id', resource.id)
                       .eq('file_type', 'image');


                   if (error) throw error;


                   if (data && data.length > 0) {
                       setResourceImages(data.map(f => f.file_url));
                   } else if (resource?.file_url) {
                       setResourceImages([resource.file_url]);
                   }
               } catch (error) {
                   if (resource?.file_url) setResourceImages([resource.file_url]);
               }
           }
       };
       loadResourceImages();
   }, [resource?.id]);


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


   const resources = resourceImages.length > 0 ? resourceImages : [];
   const goToPrevious = () => setCurrentIndex(prev => prev === 0 ? resources.length - 1 : prev - 1);
   const goToNext = () => setCurrentIndex(prev => prev === resources.length - 1 ? 0 : prev + 1);


   const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
   const handleTouchEnd = (e) => {
       if (touchStart === null) return;
       const diff = touchStart - e.changedTouches[0].clientX;
       if (Math.abs(diff) > 50) {
           diff > 0 ? goToNext() : goToPrevious();
       }
       setTouchStart(null);
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
       if (!isOnline) { alert("No internet connection."); return; }
       if (!newQuestion.trim()) return;
       const result = await postQuestion(resource.id, newQuestion, '');
       if (result.success) { setNewQuestion(''); refreshQuestions(); }
       else alert('Failed to post question: ' + result.error);
   };


   const handlePostAnswer = async (parentId, questionId) => {
       if (!isOnline) { alert("No internet connection."); return; }
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
       else alert('Failed to delete: ' + result.error);
   };


   const handleDeleteAnswer = async (answerId) => {
       if (!window.confirm('Are you sure you want to delete this answer?')) return;
       const result = await deleteAnswer(answerId);
       if (result.success) refreshQuestions();
       else alert('Failed to delete: ' + result.error);
   };


   const handleViewResource = () => {
       if (resources.length > 0) window.open(resources[currentIndex], '_blank');
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
           link.download = `${resource?.title || 'images'}.zip`;
           document.body.appendChild(link);
           link.click();
           document.body.removeChild(link);
           URL.revokeObjectURL(url);
       } catch (error) {
           alert('Failed to download. Please try again.');
       }
   };


   if (loading) return <><Header /><div className="resource-details-unlocked-container"><h2>Loading resource...</h2></div></>;
   if (!resource) return <><Header /><div className="resource-details-unlocked-container"><h2>Resource not found</h2></div></>;


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
                               <p className="instructor">
                                   Uploaded by{' '}
                                   <span onClick={() => navigate(`/profile/${resource.user_id}`)} style={{ cursor: 'pointer', color: '#1F9EF9' }}>
                                       {resource.profiles?.username || 'Anonymous'}
                                   </span>
                               </p>
                               <p className="description">{resource.description || 'No description provided'}</p>
                           </div>


                           {/* Carousel with touch support */}
                           <div className="carousel-wrapper">
                               <div
                                   className="image-frame"
                                   onTouchStart={handleTouchStart}
                                   onTouchEnd={handleTouchEnd}
                                   style={{ userSelect: 'none' }}
                               >
                                   {resources.length > 0 ? (
                                       <>
                                           <img src={resources[currentIndex]} alt={`Slide ${currentIndex + 1}`} className="carousel-image" />
                                           <div className="image-counter">{currentIndex + 1} / {resources.length}</div>
                                       </>
                                   ) : (
                                       <p>No images available</p>
                                   )}
                               </div>
                               {resources.length > 1 && (
                                   <>
                                       <button onClick={goToPrevious} className="nav-button nav-button-left">
                                           <ChevronLeft style={{ width: '1.5rem', height: '1.5rem' }} />
                                       </button>
                                       <button onClick={goToNext} className="nav-button nav-button-right">
                                           <ChevronRight style={{ width: '1.5rem', height: '1.5rem' }} />
                                       </button>
                                       <div className="dot-indicators">
                                           {resources.map((_, index) => (
                                               <button key={index} onClick={() => setCurrentIndex(index)}
                                                   className={`dot ${index === currentIndex ? 'active' : ''}`} />
                                           ))}
                                       </div>
                                   </>
                               )}
                           </div>
                       </div>


                       <div className="download-buttons">
                           <button onClick={handleViewResource} className="view-resource">View Resource</button>
                           <button onClick={downloadImagesAsZip} className="download-resource">Download</button>
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
                               <button onClick={handlePostQuestion} className="submit-button"
                                   disabled={!isOnline} style={{ opacity: isOnline ? 1 : 0.5 }}>
                                   Post Question
                               </button>
                           </div>
                           <div className="comments-list">
                               {questions.length > 0 ? (
                                   questions.map(question => (
                                       <Question key={question.id} question={question}
                                           session={session} navigate={navigate}
                                           onUpvoteQuestion={handleUpvoteQuestion}
                                           onUpvoteAnswer={handleUpvoteAnswer}
                                           onDeleteQuestion={handleDeleteQuestion}
                                           onDeleteAnswer={handleDeleteAnswer}
                                           onPostAnswer={handlePostAnswer}
                                           replyingTo={replyingTo} setReplyingTo={setReplyingTo}
                                           newAnswerTexts={newAnswerTexts} setNewAnswerTexts={setNewAnswerTexts}
                                           isOnline={isOnline} />
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
                           <button className="generate-ai-notes"
                               onClick={() => navigate('/generate-ai-notes', { state: { resource } })}
                               disabled={!isOnline}
                               style={{ opacity: isOnline ? 1 : 0.5, cursor: isOnline ? 'pointer' : 'not-allowed' }}>
                               Generate AI Notes
                           </button>
                           <button className="generate-ai-answers"
                               onClick={() => navigate('/generate-ai-answer', { state: { resource } })}
                               disabled={!isOnline}
                               style={{ opacity: isOnline ? 1 : 0.5, cursor: isOnline ? 'pointer' : 'not-allowed' }}>
                               Generate AI Answers
                           </button>
                       </div>
                   </div>
               </div>
           </div>
       </>
   );
}


export default ResourceDetailsImage;

