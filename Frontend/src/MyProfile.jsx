import { useEffect, useState } from 'react';
import Header from './Header';
import school from './assets/icons/school.png'
import subject from './assets/icons/subject.png'
import upload from './assets/icons/upload.png'
import upvote from './assets/icons/like.png'
import people from './assets/icons/people.png'
import './styles/MyProfile.css'
import { UserAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import supabase from './config/supabaseClient';

function MyProfile () {

    const { session, signOut } = UserAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null)
    const [totalUploads, setTotalUploads] = useState(0) // ← added

    useEffect(() => {
        const getProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession()

            // fetch profile
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()

            setProfile(data)

            // fetch total uploads ← added
            const { count } = await supabase
                .from('resources')
                .select('*', { count: 'exact', head: true }) // head: true means don't return rows, just the count
                .eq('user_id', session.user.id)

            setTotalUploads(count || 0)
        }

        getProfile()
    }, [])

    return (
        <>
            <Header/>

            <div className="page-title"><h1>Welcome</h1></div>
            
            <div className="my-profile-container">

               <div className="user-info">
                    <div className="profile-picture"></div>
                    <div className="username">{profile?.username}</div>
                    <div className="level">{profile?.level}L</div>
                    <div className="department"><span>{profile?.department}</span></div>
               </div>

                <div className="user-metric">

                    <div className="user-metrics">
                        <div className="icon"><img className="profile-icon" src={upload}/></div>
                        <div className="metrics-info">
                            <span className="metrics-description">Total Uploads</span>
                            <span className="metrics-value">{totalUploads}</span> {/* ← live count */}
                        </div>
                    </div>

                    <div className="user-metrics">
                        <div className="icon"><img className="profile-icon" src={upvote}/></div>
                        <div className="metrics-info">
                            <span className="metrics-description">Total Upvotes</span>
                            <span className="metrics-value">75</span>
                        </div>
                    </div>

                    <div className="user-metrics">
                        <div className="icon"><img className="profile-icon" src={people}/></div>
                        <div className="metrics-info">
                            <span className="metrics-description">Followers</span>
                            <span className="metrics-value">236</span>
                        </div>
                    </div>

                    <div className="user-metrics">
                        <div className="icon"><img className="profile-icon" src={people}/></div>
                        <div className="metrics-info">
                            <span className="metrics-description">Following</span>
                            <span className="metrics-value">177</span>
                        </div>
                    </div>

               </div>

            </div>
        
        </>
    )
}

export default MyProfile;