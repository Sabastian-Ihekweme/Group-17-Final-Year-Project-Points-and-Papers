import "./styles/EditProfile.css";
import Header from "./Header";
import profilepic from "./assets/icons/profile.png";
import { useState, useEffect } from "react";
import { UserAuth, AVATAR_SEEDS, getAvatarUrl } from "./context/AuthContext";
import supabase from "./config/supabaseClient";
import { useNavigate } from "react-router-dom";

function EditProfile() {
    const { session, updateAvatar, updateProfile } = UserAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [department, setDepartment] = useState("");
    const [level, setLevel] = useState("");
    const [currentSeed, setCurrentSeed] = useState("default");
    const [selectedSeed, setSelectedSeed] = useState("default");
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savingAvatar, setSavingAvatar] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (session?.user?.id) {
            const fetchProfile = async () => {
                const { data } = await supabase
                    .from('profiles')
                    .select('username, department, level, avatar_seed')
                    .eq('id', session.user.id)
                    .single();

                if (data) {
                    setUsername(data.username || "");
                    setDepartment(data.department || "");
                    setLevel(data.level || "");
                    setCurrentSeed(data.avatar_seed || "default");
                    setSelectedSeed(data.avatar_seed || "default");
                }

                setEmail(session.user.email || "");
            };
            fetchProfile();
        }
    }, [session?.user?.id]);

    const handleSaveAvatar = async () => {
        setSavingAvatar(true);
        const result = await updateAvatar(selectedSeed);
        if (result.success) {
            setCurrentSeed(selectedSeed);
            setShowAvatarPicker(false);
        } else {
            setError("Failed to save avatar, please try again");
        }
        setSavingAvatar(false);
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        const result = await updateProfile({ username, department, level });
        if (result.success) {
            setSuccess("Profile updated successfully!");
            setTimeout(() => setSuccess(""), 3000);
        } else {
            setError("Failed to update profile, please try again");
        }
        setSaving(false);
    };

    return (
        <>
            <Header />

            <div className="edit-profile-container">

                {/* Avatar Section */}
                <div className="profile-avatar-container">

                    <div className="avatar-wrapper" onClick={() => setShowAvatarPicker(true)}>
                        <img
