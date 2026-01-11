import {useState, useRef, useEffect} from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, MessageSquare, ThumbsUp, Reply, Trash2 } from 'lucide-react';
import Header from "./Header";
import "./styles/ResourceDetailsUnlocked.css";
import { Document, Page, pdfjs } from "react-pdf";
import resource from "/resources/Screenshot 2025-12-29 at 14.57.13.png";
import downArrow from "./assets/icons/down-arrow.png"
import upArrow from "./assets/icons/up-arrow.png"
import pdf from "/resources/Student-Transcript-(1).pdf"



function ResourceDetailsPDF() {
     
const pdfDocument = pdf;

const [comments, setComments] = useState([
    {
      id: 1,
      author: 'Sarah Johnson',
      avatar: 'https://i.pravatar.cc/150?img=1',
      text: 'This is such an insightful post! Really helps clarify the concepts.',
      timestamp: '2 hours ago',
      likes: 12,
      replies: [
        {
          id: 2,
          author: 'Mike Chen',
          avatar: 'https://i.pravatar.cc/150?img=2',
          text: 'I agree! The examples were particularly helpful.',
          timestamp: '1 hour ago',
          likes: 5,
          replies: [
            {
              id: 4,
              author: 'Emily Davis',
              avatar: 'https://i.pravatar.cc/150?img=4',
              text: 'Absolutely! This really changed my perspective.',
              timestamp: '45 minutes ago',
              likes: 3,
              replies: []
            },
            {
              id: 5,
              author: 'John Smith',
              avatar: 'https://i.pravatar.cc/150?img=5',
              text: 'Same here, very enlightening!',
              timestamp: '30 minutes ago',
              likes: 2,
              replies: []
            }
          ]
        },
        {
          id: 6,
          author: 'Lisa Brown',
          avatar: 'https://i.pravatar.cc/150?img=6',
          text: 'Thanks for sharing this!',
          timestamp: '50 minutes ago',
          likes: 4,
          replies: []
        }
      ]
    },
    {
      id: 3,
      author: 'Alex Rivera',
      avatar: 'https://i.pravatar.cc/150?img=3',
      text: 'Could you elaborate more on the second point? I\'m having trouble understanding it.',
      timestamp: '3 hours ago',
      likes: 8,
      replies: Array.from({ length: 8 }, (_, i) => ({
        id: 100 + i,
        author: `User ${i + 1}`,
        avatar: `https://i.pravatar.cc/150?img=${20 + i}`,
        text: `Reply number ${i + 1} to Alex's comment`,
        timestamp: `${i + 1} minutes ago`,
        likes: i,
        replies: []
      }))
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
          } else if (comment.replies.length > 0) {
            return {
              ...comment,
              replies: addReplyToComment(comment.replies)
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
        } else if (comment.replies.length > 0) {
          return { ...comment, replies: updateLikes(comment.replies) };
        }
        return comment;
      });
    };

    setComments(updateLikes(comments));
  };

  const loadMoreReplies = (commentId) => {
    setVisibleReplies(prev => ({
      ...prev,
      [commentId]: (prev[commentId] || 0) + 5
    }));
    setShowReplies(prev => ({
      ...prev,
      [commentId]: true
    }));
  };

  const toggleReplies = (commentId) => {
    setShowReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

        const deleteComment = (commentId) => {
            const removeComment = (commentList) => {
            return commentList
                .filter(comment => comment.id !== commentId)
                .map(comment => ({
                ...comment,
                replies: removeComment(comment.replies)
                }));
            };

            setComments(removeComment(comments));
        };

  const Comment = ({ comment, depth = 0 }) => {
    const visibleCount = visibleReplies[comment.id] || 0;
    const isShowingReplies = showReplies[comment.id] || false;
    const visibleReplyList = comment.replies.slice(0, visibleCount);
    const hasMoreReplies = comment.replies.length > visibleCount;

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
                    if (window.confirm('Are you sure you want to delete this comment?')) {
                      deleteComment(comment.id);
                    }
                  }}
                >
                  <Trash2 style={{ width: '0.875rem', height: '0.875rem' }} />
                  <span>Delete</span>
                </button>
              )}

              {comment.replies.length > 0 && (
                <button 
                  className="view-replies-button"
                  onClick={() => {
                    if (!isShowingReplies) {
                      loadMoreReplies(comment.id);
                    } else {
                      toggleReplies(comment.id);
                    }
                  }}
                >
                  {isShowingReplies ? 'Hide answers' : `View ${comment.replies.length} ${comment.replies.length === 1 ? 'answer' : 'answers'}`}
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

        {comment.replies.length > 0 && isShowingReplies && (
          <div className="replies-container">
            {visibleReplyList.map(reply => (
              <Comment key={reply.id} comment={reply} depth={depth + 1}/>
            ))}
            
            {hasMoreReplies && (
              <button 
                className="load-more-button"
                onClick={() => loadMoreReplies(comment.id)}
              >
                <ChevronDown style={{ width: '1rem', height: '1rem' }} />
                Load more replies ({comment.replies.length - visibleCount} remaining)
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const downloadPdf = () => {
    const link = document.createElement('a');
    link.href = {pdfDocument};
    link.download = 'resources.pdf';
    link.click();
  };

    return (
        <>

            <Header />

            <div className="resource-details-unlocked-container">

                <h2>Resource Details</h2>

                <div className="divs">

                <div className="div-1">
                <div className="resource-details-unlocked">

                    <div className="resource-title">
                    <h3>SEN 317 Midterms 2023</h3>
                    </div>
                    
                    <div className="resource-metadata">
                    <p className="instructor">By Mr Austin Ogar</p>

                    <p className="description">Comprehensive notes covering perturbation theory, scattering theory, and relativistic quantum mechanics. Suitable for graduate-level students.</p>
                    </div>

                    <div className="pdf-link">
                      <a href={pdfDocument} target="null">Click to open PDF</a>
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

export default ResourceDetailsPDF;
