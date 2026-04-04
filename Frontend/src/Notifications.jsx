import "./styles/Notifications.css";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import follower from "./assets/icons/person.png";
import upload from "./assets/icons/upload.png";
import question from "./assets/icons/answer.png";
import reply from "./assets/icons/reply.png";
import upvote from "./assets/icons/like.png";
import { UserAuth } from "./context/AuthContext";
import supabase from "./config/supabaseClient";
import { useState, useEffect } from "react";

function Notifications () {
    const { session, setUnreadNotifications } = UserAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.id) {
            fetchNotifications();
            // Mark all notifications as read when page loads
            markAllAsRead();
        }
    }, [session?.user?.id]);

    const markAllAsRead = async () => {
        try {
            // Reset unread count in context
            setUnreadNotifications(0);
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const userId = session.user.id;

            // 1. Get followers (users who follow the current user)
            const { data: followersData } = await supabase
                .from('follows')
                .select('follower_id, created_at, profiles!follower_id(username, id)')
                .eq('following_id', userId)
                .order('created_at', { ascending: false });

            const followerNotifications = (followersData || []).map(item => ({
                type: 'follower',
                profile: item.profiles.username,
                profileId: item.profiles.id,
                resource: null,
                timestamp: new Date(item.created_at).getTime(),
                userId: item.follower_id
            }));

            // 2. Get upvotes on user's answers
            const { data: answersData } = await supabase
                .from('answers')
                .select('id')
                .eq('user_id', userId);

            let upvoteNotifications = [];
            if (answersData && answersData.length > 0) {
                const answerIds = answersData.map(a => a.id);
                const { data: upvotesData } = await supabase
                    .from('upvotes')
                    .select('answer_id, created_at, profiles!user_id(username, id)')
                    .in('answer_id', answerIds)
                    .neq('user_id', userId)
                    .order('created_at', { ascending: false });

                upvoteNotifications = (upvotesData || []).map(item => ({
                    type: 'upvote',
                    profile: item.profiles.username,
                    profileId: item.profiles.id,
                    resource: 'your answer',
                    timestamp: new Date(item.created_at).getTime(),
                    userId: item.user_id,
                    points: 2
                }));
            }

            // 3. Get answers to user's questions
            const { data: questionsData } = await supabase
                .from('questions')
                .select('id')
                .eq('user_id', userId);

            let answerNotifications = [];
            if (questionsData && questionsData.length > 0) {
                const questionIds = questionsData.map(q => q.id);
                const { data: answersToQuestionsData } = await supabase
                    .from('answers')
                    .select('id, created_at, questions(title, id, resource_id), profiles!user_id(username, id)')
                    .in('question_id', questionIds)
                    .eq('parent_id', null)
                    .order('created_at', { ascending: false });

                answerNotifications = (answersToQuestionsData || []).map(item => ({
                    type: 'question',
                    profile: item.profiles.username,
                    profileId: item.profiles.id,
                    resource: item.questions.title,
                    resourceId: item.questions.resource_id,
                    timestamp: new Date(item.created_at).getTime(),
                    userId: item.user_id
                }));
            }

            // 4. Get replies to user's answers
            const { data: repliesData } = await supabase
                .from('answers')
                .select('id, created_at, questions(title, id, resource_id), profiles!user_id(username, id)')
                .eq('parent_id', userId)
                .order('created_at', { ascending: false });

            const replyNotifications = (repliesData || []).map(item => ({
                type: 'reply',
                profile: item.profiles.username,
                profileId: item.profiles.id,
                resource: item.questions.title,
                resourceId: item.questions.resource_id,
                timestamp: new Date(item.created_at).getTime(),
                userId: item.user_id
            }));

            // 5. Get uploads from people the user follows (ONLY after they followed)
            const { data: followingData } = await supabase
                .from('follows')
                .select('following_id, created_at')
                .eq('follower_id', userId);

            let uploadNotifications = [];
            if (followingData && followingData.length > 0) {
                // For each person they follow, get uploads AFTER they followed
                const uploadPromises = followingData.map(async (follow) => {
                    const { data: uploadsData } = await supabase
                        .from('resources')
                        .select('id, title, created_at, user_id, file_type, profiles!user_id(username, id)')
                        .eq('user_id', follow.following_id)
                        // Only get uploads AFTER this follow was created
                        .gte('created_at', follow.created_at)
                        .order('created_at', { ascending: false });

                    return (uploadsData || []).map(item => ({
                        type: 'upload',
                        profile: item.profiles.username,
                        profileId: item.profiles.id,
                        resource: item.title,
                        resourceId: item.id,
                        fileType: item.file_type,
                        timestamp: new Date(item.created_at).getTime(),
                        userId: item.user_id
                    }));
                });

                const allUploads = await Promise.all(uploadPromises);
                uploadNotifications = allUploads.flat();
            }

            // Combine and sort all notifications by timestamp
            const allNotifications = [
                ...followerNotifications,
                ...upvoteNotifications,
                ...answerNotifications,
                ...replyNotifications,
                ...uploadNotifications
            ].sort((a, b) => b.timestamp - a.timestamp);

            setNotifications(allNotifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    function notificationTypeDetails (type, profile, resource) {
        if (type === "follower") {
            return `${profile} started following you.`;
        } else if (type === "upload") {
            return `${profile} uploaded ${resource}`;
        } else if (type === "question") {
            return `${profile} answered your question on ${resource}`;
        } else if (type === "reply") {
            return `${profile} replied to your answer on ${resource}`;
        } else if (type === "upvote") {
            return `${profile} upvoted your answer (+2 points)`;
        };
    };

    function notificationTypeInfo (type) {
        if (type === "follower") {
            return "New Follower!";
        } else if (type === "upload") {
            return "New Upload by a Followed User";
        } else if (type === "question") {
            return "New Answer to Your Question";
        } else if (type === "reply") {
            return "New Reply to Your Answer";
        } else if (type === "upvote") {
            return "Your Answer Was Upvoted";
        };
    };

    function notificationTypeIcon (type) {
        if (type === "follower") {
            return follower
        } else if (type === "upload") {
            return upload
        } else if (type === "question") {
            return question
        } else if (type === "reply") {
            return reply
        } else if (type === "upvote") {
            return upvote
        };
    };

    function notificationTypeAction (type) {
        if (type === "follower") {
            return "View Profile"
        } else if (type === "upload") {
            return "View Resource"
        } else if (type === "question") {
            return "View Resource"
        } else if (type === "reply") {
            return "View Resource"
        } else if (type === "upvote") {
            return "View Resource"
        };
    };

    function handleNotificationAction(notification) {
        if (notification.type === "follower") {
            navigate(`/profile/${notification.userId}`);
        } else if (notification.type === "upload" || notification.type === "question" || notification.type === "reply" || notification.type === "upvote") {
            // Navigate to resource details page
            const resourceType = notification.fileType === 'pdf' ? 'pdf' : 'image';
            navigate(`/resource-details-${resourceType}/${notification.resourceId}`);
        }
    }

    function getTimeAgo(timestamp) {
        const diffMs = Date.now() - timestamp

        const seconds = Math.floor(diffMs / 1000)
        const minutes = Math.floor(diffMs / (1000 * 60))
        const hours   = Math.floor(diffMs / (1000 * 60 * 60))
        const days    = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        const weeks   = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7))
        const months  = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30))
        const years   = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365))

        if (seconds < 60)  return `${seconds} second${seconds !== 1 ? 's' : ''} ago`
        if (minutes < 60)  return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
        if (hours < 24)    return `${hours} hour${hours !== 1 ? 's' : ''} ago`
        if (days < 7)      return `${days} day${days !== 1 ? 's' : ''} ago`
        if (weeks < 4)     return `${weeks} week${weeks !== 1 ? 's' : ''} ago`
        if (months < 12)   return `${months} month${months !== 1 ? 's' : ''} ago`
                            return `${years} year${years !== 1 ? 's' : ''} ago`
    }

    if (loading) {
        return (
            <>
                <Header />
                <div className="notifications-div">
                    <h1>Notifications</h1>
                    <p>Loading...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />

            <div className="notifications-div">

                <h1>Notifications</h1>

                {notifications.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No notifications yet</p>
                ) : (
                    <>
                        {
                            notifications.map((notification, index) => (
                                
                                <div className="notification-container" key={index}>

                                    <div className="notification-icon">

                                        <img src={notificationTypeIcon(notification.type)} className="notification-type-icon" alt={notification.type}></img>

                                    </div>

                                    <div className="notification-details">

                                        <h3 className="notification-type">{notificationTypeInfo(notification.type)}</h3>
                                        <p className="notification-info">{notificationTypeDetails(notification.type,
                                            notification.profile, notification.resource
                                        )}</p>

                                        <div className="notification-meta-data">
                                            <div className="notification-time">
                                            <p>{getTimeAgo(notification.timestamp)}</p>
                                            </div>

                                            <button className="view-notification-button" onClick={() => handleNotificationAction(notification)}>
                                                {notificationTypeAction(notification.type)}
                                            </button>
                                        </div>

                                    </div>



                                </div>

                            ))
                        }
                    </>
                )}

            </div>
        </>
    )
}

export default Notifications;