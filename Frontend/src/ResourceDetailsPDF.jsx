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

