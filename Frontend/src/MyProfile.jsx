import { useEffect, useState } from 'react';
import Header from './Header';
import upload from './assets/icons/upload.png'
import upvote from './assets/icons/like.png'
import people from './assets/icons/people.png'
import './styles/MyProfile.css'
import { UserAuth, getAvatarUrl } from './context/AuthContext';
import supabase from './config/supabaseClient';
import { useNavigate } from 'react-router-dom';

function MyProfile() {
    const { session } = UserAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null)
    const [totalUploads, setTotalUploads] = useState(null)
    const [totalUpvotes, setTotalUpvotes] = useState(null)
    const [totalFollowers, setTotalFollowers] = useState(null)
    const [totalFollowing, setTotalFollowing] = useState(null)

    useEffect(() => {
        const getProfile = async () => {
            if (!session?.user?.id) return;

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            setProfile(profileData);

            const { count: uploadsCount } = await supabase
                .from('resources')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', session.user.id);

            setTotalUploads(uploadsCount || 0);

            // Fix: fetch all answer IDs first, then count upvotes properly
            const { data: userAnswers } = await supabase
                .from('answers')
                .select('id')
                .eq('user_id', session.user.id);

            const answerIds = userAnswers?.map(a => a.id) || [];

            if (answerIds.length > 0) {
                // Count upvotes across all user's answers
                const { count: upvotesCount } = await supabase
                    .from('upvotes')
                    .select('*', { count: 'exact', head: true })
                    .in('answer_id', answerIds);

                setTotalUpvotes(upvotesCount || 0);
            } else {
                setTotalUpvotes(0);
            }

            const { count: followersCount } = await supabase
                .from('follows')
                .select('*', { count: 'exact', head: true })
                .eq('following_id', session.user.id);

            setTotalFollowers(followersCount || 0);

            const { count: followingCount } = await supabase
                .from('follows')
                .select('*', { count: 'exact', head: true })
                .eq('follower_id', session.user.id);

            setTotalFollowing(followingCount || 0);
        };

        getProfile();
    }, [session?.user?.id]);

    return (
        <>
            <Header />

            <div className="page-title"><h1>Welcome</h1></div>

            <div className="my-profile-container">

                <div className="user-info">
                    <img
                        className="profile-picture"
                        src={getAvatarUrl(profile?.avatar_seed)}
                        alt="avatar"
                    />
                    <div className="username">{profile?.username}</div>
                    <div className="level">{profile?.level}L</div>
                    <div className="department"><span>{profile?.department}</span></div>
                    <span
                        className="edit-profile-link"
                        onClick={() => navigate('/edit-profile')}
                    >
                        Edit Profile
                    </span>
                </div>

                <div className="user-metric">

                    <div className="user-metrics">
                        <div className="icon"><img className="profile-icon" src={upload} alt="uploads" /></div>
                        <div className="metrics-info">
                            <span className="metrics-description">Total Uploads</span>
                            <span className="metrics-value">{totalUploads ?? '—'}</span>
                        </div>
                    </div>

                    <div className="user-metrics">
                        <div className="icon"><img className="profile-icon" src={upvote} alt="upvotes" /></div>
                        <div className="metrics-info">
                            <span className="metrics-description">Total Upvotes</span>
                            <span className="metrics-value">{totalUpvotes ?? '—'}</span>
                        </div>
                    </div>

                    <div className="user-metrics">
                        <div className="icon"><img className="profile-icon" src={people} alt="followers" /></div>
                        <div className="metrics-info">
                            <span className="metrics-description">Followers</span>
                            <span className="metrics-value">{totalFollowers ?? '—'}</span>
                        </div>
                    </div>

                    <div className="user-metrics">
                        <div className="icon"><img className="profile-icon" src={people} alt="following" /></div>
                        <div className="metrics-info">
                            <span className="metrics-description">Following</span>
                            <span className="metrics-value">{totalFollowing ?? '—'}</span>
                        </div>
                    </div>

                </div>

            </div>
        </>
    );
}

export default MyProfile;