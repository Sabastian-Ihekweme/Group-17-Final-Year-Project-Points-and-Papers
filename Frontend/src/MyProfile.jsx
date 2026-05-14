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
