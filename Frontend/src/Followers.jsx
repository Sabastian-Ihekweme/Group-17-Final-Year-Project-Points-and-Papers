import {useState, useEffect} from "react";
import Header from "./Header";
import notification from "./assets/icons/bell.png";
import "./styles/Followers.css";
import { UserAuth } from "./context/AuthContext";
import supabase from "./config/supabaseClient";

function Followers() {

const { session } = UserAuth();
const [activeTab, setActiveTab] = useState("followers");
const [followers, setFollowers] = useState([]);
const [following, setFollowing] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
    if (session?.user?.id) {
        fetchFollowersAndFollowing();
    }
}, [session?.user?.id]);

const fetchFollowersAndFollowing = async () => {
    try {
        setLoading(true);
        
        // Fetch followers (people who follow the current user)
        const { data: followersData, error: followersError } = await supabase
            .from('follows')
            .select('follower_id, profiles!follower_id(id, username)')
            .eq('following_id', session.user.id);

        if (followersError) throw followersError;

        // Fetch following (people the current user follows)
        const { data: followingData, error: followingError } = await supabase
            .from('follows')
            .select('following_id, profiles!following_id(id, username)')
            .eq('follower_id', session.user.id);

        if (followingError) throw followingError;

        // Transform followers data
        const formattedFollowers = followersData.map(item => ({
            id: item.profiles.id,
            profilePic: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.profiles.id}`,
            username: item.profiles.username
        }));

        // Transform following data
        const formattedFollowing = followingData.map(item => ({
            id: item.profiles.id,
            profilePic: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.profiles.id}`,
            username: item.profiles.username
        }));

        setFollowers(formattedFollowers);
        setFollowing(formattedFollowing);
    } catch (error) {
        console.error('Error fetching followers/following:', error);
    } finally {
        setLoading(false);
    }
};

    function checkFollower(username) {
        if (following.some(item => item.username === username)) {
            return "is-following"
        } else {
            return "not-following"
        };
    };

    const handleFollowToggle = async (userId, currentStatus) => {
        try {
            if (currentStatus === "is-following") {
                // Unfollow
                const { error } = await supabase
                    .from('follows')
                    .delete()
                    .eq('follower_id', session.user.id)
                    .eq('following_id', userId);

                if (error) throw error;
            } else {
                // Follow
                const { error } = await supabase
                    .from('follows')
                    .insert({
                        follower_id: session.user.id,
                        following_id: userId
                    });

                if (error) throw error;
            }

            // Refresh the data
            fetchFollowersAndFollowing();
        } catch (error) {
            console.error('Error toggling follow:', error);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="followers-div">
                    <h1>Manage Connections</h1>
                    <p>Loading...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />

            <div className="followers-div">
                
                <h1>Manage Connections</h1>

                <div className="view-notifications-button">
                    <img className="notification-icon" src={notification}/>
                    <button>View Notifications</button>
                </div>

                <div className="followers-or-following">
                    <button 
                    onClick={() => setActiveTab("followers")}
                    className={activeTab == "followers" ? "button-active" : "button-inactive"}>Followers ({followers.length})</button>
                    
                    <button 
                    onClick={() => setActiveTab("following")}
                    className={activeTab == "followers" ? "button-inactive" : "button-active"}>Following ({following.length})</button>
                </div>

                
                <div className="user-list">


                    {
                        (activeTab === "followers" ? followers : following).map((follower) => (

                            <div className="account" key={follower.id}>

                                <div>
                                <img className="profile-pic" src={follower.profilePic} />
                                </div>

                                <h3 className="account-username">{follower.username}</h3>

                                <button 
                                    className={checkFollower(follower.username)}
                                    onClick={() => handleFollowToggle(follower.id, checkFollower(follower.username))}
                                >
                                    {checkFollower(follower.username) == "not-following" ? "Follow" : "Unfollow"}
                                </button>

                            </div>

                        ))
                    }



                </div>



                




            </div>
        </>
    )

}

export default Followers;