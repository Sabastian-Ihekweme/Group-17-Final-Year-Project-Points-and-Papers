import {useState, useEffect} from "react";
import logo from './assets/icons/logo.png';
import './styles/Header.css'
import SidePane from './SidePane';
import supabase from './config/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from "./context/AuthContext";

function Header() {

    const { session, signOut, points } = UserAuth()
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null)

    useEffect(() => {
        const getProfile = async () => {
            if (!session?.user?.id) return;
            
            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()

                setProfile(data)
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        }

        getProfile()
    }, [session?.user?.id])

    const handleSignOut = async (e) => {
        e.preventDefault()
        try {
            await signOut()
            navigate('/user-login')
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <>
        <SidePane />
        <div className="header">
            <div className="logo-and-title">
                <img className="header-logo" src={logo} alt="logo" />
                <h2 className="header-title">Points & Papers</h2>
            </div>

            <div className="points-and-profile">
                <p className="points">Points: <span>{points || 0}</span></p>
                <p onClick={handleSignOut} className="sign-out">Sign Out</p>
            </div>
        </div>
        </>
    )
}

export default Header;