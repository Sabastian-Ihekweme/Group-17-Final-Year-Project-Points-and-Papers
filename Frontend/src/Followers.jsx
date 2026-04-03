import { useEffect, useState } from "react";
import Header from "./Header";
import { useNavigate } from 'react-router-dom';
import "./styles/Followers.css";
import { UserAuth } from './context/AuthContext';
import { UseResource } from './context/ResourceContext';
import supabase from './config/supabaseClient';

function Followers() {

    const navigate = useNavigate();
    const { session } = UserAuth();
    const { unfollowUser } = UseResource();

    const [activeTab, setActiveTab] = useState("followers");
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const loadConnections = async () => {
            try {
                setLoading(true);

                // Fetch followers
                const { data: followersData } = await supabase
                    .from('follows')
                    .select(`
                        follower_id,
                        profiles:follower_id(id, username, level, department)
                    `)
                    .eq('following_id', session.user.id);

                setFollowers(followersData?.map(f => f.profiles) || []);

                // Fetch following
                const { data: followingData } = await supabase
                    .from('follows')
                    .select(`
                        following_id,
                        profiles:following_id(id, username, level, department)
                    `)
                    .eq('follower_id', session.user.id);

                setFollowing(followingData?.map(f => f.profiles) || []);

            } catch (error) {
                console.error('Error loading connections:', error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user?.id) {
            loadConnections();
        }
    }, [session?.user?.id]);

    const handleUnfollow = async (userIdToUnfollow) => {
        try {
            const result = await unfollowUser(userIdToUnfollow);
            if (result.success) {
                setFollowing(prev => prev.filter(f => f.id !== userIdToUnfollow));
            }
        } catch (error) {
            console.error('Error unfollowing:', error);
        }
    };

    const handleRemoveFollower = async (followerId) => {
        try {
            const { error } = await supabase
                .from('follows')
                .delete()
                .eq('follower_id', followerId)
                .eq('following_id', session.user.id);

            if (!error) {
                setFollowers(prev => prev.filter(f => f.id !== followerId));
            }
        } catch (error) {
            console.error('Error removing follower:', error);
        }
    };

    const getFilteredList = () => {
        const list = activeTab === "followers" ? followers : following;
        if (!searchQuery.trim()) return list;
        
        return list.filter(user =>
            user.username.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const filteredList = getFilteredList();

    return (
        <>
            <Header />

            <div className="followers-div">
                
                <h1>Manage Connections</h1>

                <div className="followers-or-following">
                    <button 
                        onClick={() => setActiveTab("followers")}
                        className={activeTab === "followers" ? "button-active" : "button-inactive"}
                    >
                        Followers ({followers.length})
                    </button>
                    
                    <button 
                        onClick={() => setActiveTab("following")}
                        className={activeTab === "following" ? "button-active" : "button-inactive"}
                    >
                        Following ({following.length})
                    </button>
                </div>

                <div className="search-container">
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>

                {loading ? (
                    <div className="loading-message">Loading connections...</div>
                ) : filteredList.length > 0 ? (
                    <div className="user-list">
                        {filteredList.map((user) => (
                            <div key={user.id} className="account">

                                <div className="account-left" onClick={() => navigate(`/profile/${user.id}`)}>
                                    <div className="profile-pic"></div>
                                    <div className="account-info">
                                        <h3 className="account-username">{user.username}</h3>
                                        <p className="account-meta">{user.level}L • {user.department}</p>
                                    </div>
                                </div>

                                {activeTab === "followers" && (
                                    <button 
                                        className="action-button remove-button"
                                        onClick={() => handleRemoveFollower(user.id)}
                                    >
                                        Remove
                                    </button>
                                )}

                                {activeTab === "following" && (
                                    <button 
                                        className="action-button unfollow-button"
                                        onClick={() => handleUnfollow(user.id)}
                                    >
                                        Unfollow
                                    </button>
                                )}

                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No {activeTab} found</p>
                    </div>
                )}

            </div>
        </>
    )
}

export default Followers;