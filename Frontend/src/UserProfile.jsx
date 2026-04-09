import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import upload from './assets/icons/upload.png'
import upvote from './assets/icons/like.png'
import people from './assets/icons/people.png'
import './styles/MyProfile.css'
import supabase from './config/supabaseClient';
import { UserAuth, getAvatarUrl } from './context/AuthContext';
import { UseResource } from './context/ResourceContext';

function UserProfile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { session } = UserAuth();
    const { followUser, unfollowUser, checkIfFollowing } = UseResource();

    const [profile, setProfile] = useState(null);
    const [userResources, setUserResources] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [totalUploads, setTotalUploads] = useState(0);
    const [totalUpvotes, setTotalUpvotes] = useState(0);
    const [totalFollowers, setTotalFollowers] = useState(0);
    const [totalFollowing, setTotalFollowing] = useState(0);

    useEffect(() => {
        const getProfileData = async () => {
            try {
                setLoading(true);

                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();
                setProfile(profileData);

                const { data: resourcesData } = await supabase
                    .from('resources')
                    .select(`*, profiles(username)`)
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });
                setUserResources(resourcesData || []);
                setTotalUploads(resourcesData?.length || 0);

                const { data: userAnswers } = await supabase
                    .from('answers')
                    .select('id')
                    .eq('user_id', userId);
                const answerIds = userAnswers?.map(a => a.id) || [];
                let upvotesCount = 0;
                if (answerIds.length > 0) {
                    const { count } = await supabase
                        .from('upvotes')
                        .select('*', { count: 'exact', head: true })
                        .in('answer_id', answerIds);
                    upvotesCount = count || 0;
                }
                setTotalUpvotes(upvotesCount);

                const { count: followersCount } = await supabase
                    .from('follows')
                    .select('*', { count: 'exact', head: true })
                    .eq('following_id', userId);
                setTotalFollowers(followersCount || 0);

                const { count: followingCount } = await supabase
                    .from('follows')
                    .select('*', { count: 'exact', head: true })
                    .eq('follower_id', userId);
                setTotalFollowing(followingCount || 0);

                if (session?.user?.id && userId !== session.user.id) {
                    const following = await checkIfFollowing(userId);
                    setIsFollowing(following);
                }

            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) getProfileData();
    }, [userId, session?.user?.id]);

    const handleFollowClick = async () => {
        try {
            if (isFollowing) {
                const result = await unfollowUser(userId);
                if (result.success) {
                    setIsFollowing(false);
                    setTotalFollowers(prev => prev - 1);
                }
            } else {
                const result = await followUser(userId);
                if (result.success) {
                    setIsFollowing(true);
                    setTotalFollowers(prev => prev + 1);
                }
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="page-title"><h1>Loading...</h1></div>
            </>
        );
    }

    if (!profile) {
        return (
            <>
                <Header />
                <div className="page-title"><h1>User not found</h1></div>
            </>
        );
    }

    return (
        <>
            <Header />

            <div className="page-title"><h1>{profile.username}</h1></div>

            <div className="my-profile-container">

                <div className="user-info">
                    <img
                        className="profile-picture"
                        src={getAvatarUrl(profile.avatar_seed)}
                        alt="avatar"
                    />
                    <div className="username">{profile.username}</div>
                    <div className="level">{profile.level}L</div>
                    <div className="department"><span>{profile.department}</span></div>

                    {session?.user?.id && userId !== session.user.id && (
                        <button
                            onClick={handleFollowClick}
                            style={{
                                marginTop: '20px',
                                padding: '10px 30px',
                                backgroundColor: isFollowing ? '#f0f0f0' : '#1F9EF9',
                                color: isFollowing ? '#333' : '#fff',
                                border: isFollowing ? '2px solid #1F9EF9' : 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}
                        >
                            {isFollowing ? 'Unfollow' : 'Follow'}
                        </button>
                    )}
                </div>

                <div className="user-metric">

                    <div className="user-metrics">
                        <div className="icon"><img className="profile-icon" src={upload} /></div>
                        <div className="metrics-info">
                            <span className="metrics-description">Total Uploads</span>
                            <span className="metrics-value">{totalUploads}</span>
                        </div>
                    </div>

                    <div className="user-metrics">
                        <div className="icon"><img className="profile-icon" src={upvote} /></div>
                        <div className="metrics-info">
                            <span className="metrics-description">Total Upvotes</span>
                            <span className="metrics-value">{totalUpvotes}</span>
                        </div>
                    </div>

                    <div className="user-metrics">
                        <div className="icon"><img className="profile-icon" src={people} /></div>
                        <div className="metrics-info">
                            <span className="metrics-description">Followers</span>
                            <span className="metrics-value">{totalFollowers}</span>
                        </div>
                    </div>

                    <div className="user-metrics">
                        <div className="icon"><img className="profile-icon" src={people} /></div>
                        <div className="metrics-info">
                            <span className="metrics-description">Following</span>
                            <span className="metrics-value">{totalFollowing}</span>
                        </div>
                    </div>

                </div>

            </div>

            <div className="user-contributions" style={{ marginTop: '50px' }}>
                <h2 style={{ marginBottom: '20px' }}>Contributions ({totalUploads})</h2>

                {userResources.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {userResources.map(resource => (
                            <div
                                key={resource.id}
                                onClick={() => {
                                    const redirectPath = resource.file_type === 'pdf'
                                        ? `/resource-details-pdf/${resource.id}`
                                        : `/resource-details-image/${resource.id}`;
                                    navigate(redirectPath, { state: { resource } });
                                }}
                                style={{
                                    padding: '15px',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    backgroundColor: '#f9f9f9'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                    e.currentTarget.style.backgroundColor = '#f0f7ff';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.backgroundColor = '#f9f9f9';
                                }}
                            >
                                <h3 style={{ marginBottom: '10px', color: '#333' }}>
                                    {resource.course_code} - {resource.title}
                                </h3>
                                <p style={{ marginBottom: '8px', color: '#666', fontSize: '14px' }}>
                                    <strong>Type:</strong> {resource.resource_type}
                                </p>
                                <p style={{ marginBottom: '8px', color: '#666', fontSize: '14px' }}>
                                    <strong>Instructor:</strong> {resource.instructor}
                                </p>
                                <p style={{ color: '#999', fontSize: '13px' }}>
                                    {new Date(resource.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ textAlign: 'center', color: '#999' }}>No contributions yet</p>
                )}
            </div>
        </>
    );
}

export default UserProfile;