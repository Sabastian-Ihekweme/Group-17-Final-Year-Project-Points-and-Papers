import "./styles/Notifications.css";
import Header from "./Header";
import follower from "./assets/icons/person.png";
import upload from "./assets/icons/upload.png";
import question from "./assets/icons/answer.png";
import reply from "./assets/icons/reply.png";
import upvote from "./assets/icons/like.png";

function Notifications () {

const notifications = [
    {
        type: "follower",
        profile: "Jane Smith",
        resource: "Introduction to Engineering Midterms",
        timestamp: Date.now() - 1000 * 30 // 30 seconds ago
    },
    {
        type: "upload",
        profile: "Michael Chen",
        resource: "Calculus II Practice Problems",
        timestamp: Date.now() - 1000 * 60 * 5 // 5 minutes ago
    },
    {
        type: "upvote",
        profile: "Amara Okafor",
        resource: "Physics 101 Lab Report Template",
        timestamp: Date.now() - 1000 * 60 * 23 // 23 minutes ago
    },
    {
        type: "reply",
        profile: "Carlos Rivera",
        resource: "How do I solve differential equations?",
        timestamp: Date.now() - 1000 * 60 * 60 * 2 // 2 hours ago
    },
    {
        type: "question",
        profile: "Priya Nair",
        resource: "Can someone explain Fourier Transforms?",
        timestamp: Date.now() - 1000 * 60 * 60 * 7 // 7 hours ago
    },
    {
        type: "follower",
        profile: "David Osei",
        resource: "Thermodynamics Study Guide",
        timestamp: Date.now() - 1000 * 60 * 60 * 24 // 1 day ago
    },
    {
        type: "upvote",
        profile: "Sophie Müller",
        resource: "Organic Chemistry Reaction Cheat Sheet",
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3 // 3 days ago
    },
    {
        type: "upload",
        profile: "Tariq Hassan",
        resource: "Data Structures and Algorithms Notes",
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5 // 5 days ago
    },
    {
        type: "reply",
        profile: "Yuki Tanaka",
        resource: "What is the best way to study for finals?",
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 9 // 9 days ago
    },
    {
        type: "question",
        profile: "Fatima Al-Rashid",
        resource: "Does anyone have Civil Engineering past papers?",
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 20 // 20 days ago
    },
    {
        type: "follower",
        profile: "Liam O'Brien",
        resource: "Structural Analysis Lecture Slides",
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 40 // ~1 month ago
    },
    {
        type: "upvote",
        profile: "Ngozi Adeyemi",
        resource: "Linear Algebra Full Course Summary",
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 400 // ~1 year ago
    },
]


    function notificationTypeDetails (type, profile, resource) {
        if (type === "follower") {
            return `${profile} started following you.`;
        } else if (type === "upload") {
            return `${profile} uploaded ${resource}`;
        } else if (type === "question") {
            return `${profile} asked a question on ${resource}`;
        } else if (type === "reply") {
            return `${profile} answered your question on ${resource}`;
        } else if (type === "upvote") {
            return `${profile} upvoted your answer on ${resource}`;
        };
    };

        function notificationTypeInfo (type, profile, resource, icon) {
        if (type === "follower") {
            return "New Follower!";
        } else if (type === "upload") {
            return "New Upload by a Followed User";
        } else if (type === "question") {
            return "New Question on Your Resource";
        } else if (type === "reply") {
            return "New Answer to Your Question";
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
            return "View Answer"
        } else if (type === "upvote") {
            return "View Answer"
        };
    };

            function getTimeAgo(timestamp) {
        const diffMs = Date.now() - timestamp

        const seconds = Math.floor(diffMs / 1000)
        const minutes = Math.floor(diffMs / (1000 * 60))
        const hours   = Math.floor(diffMs / (1000 * 60 * 60))
        const days    = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        const weeks   = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7))
        const months  = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30))
        const years   = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365))

        if (seconds < 60)  return `${seconds} second${seconds !== 1 ? 's' : ''}`
        if (minutes < 60)  return `${minutes} minute${minutes !== 1 ? 's' : ''}`
        if (hours < 24)    return `${hours} hour${hours !== 1 ? 's' : ''}`
        if (days < 7)      return `${days} day${days !== 1 ? 's' : ''}`
        if (weeks < 4)     return `${weeks} week${weeks !== 1 ? 's' : ''}`
        if (months < 12)   return `${months} month${months !== 1 ? 's' : ''}`
                            return `${years} year${years !== 1 ? 's' : ''}`
        }

        console.log(notifications);


    return (
        <>
            <Header />

            <div className="notifications-div">

                <h1>Notifications</h1>


                {
                    notifications.map(notification => (
                        
                        <div className="notification-container">

                            <div className="notification-icon">

                                <img src={notificationTypeIcon(notification.type)} className="notification-type-icon"></img>

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

                                    <button className="view-notification-button">{notificationTypeAction(notification.type)}</button>
                                </div>

                            </div>



                        </div>

                    ))
                }

            </div>
        </>
    )
}

export default Notifications;

