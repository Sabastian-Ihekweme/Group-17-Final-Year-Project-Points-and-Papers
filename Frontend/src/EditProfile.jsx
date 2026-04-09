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
                            className="edit-profile-avatar"
                            src={getAvatarUrl(currentSeed)}
                            alt="Profile Avatar"
                        />
                        <div className="avatar-overlay">
                            <span>Change</span>
                        </div>
                    </div>

                    <h2 className="profile-username">{username || "Your Name"}</h2>
                    <p className="profile-age">User since {new Date(session?.user?.created_at).getFullYear()}</p>

                </div>

                {/* Avatar Picker Modal */}
                {showAvatarPicker && (
                    <div className="avatar-modal-overlay" onClick={() => setShowAvatarPicker(false)}>
                        <div className="avatar-modal" onClick={(e) => e.stopPropagation()}>

                            <h3>Choose Your Avatar</h3>
                            <p>Click an avatar to select it</p>

                            <div className="avatar-grid">
                                {AVATAR_SEEDS.map((seed) => (
                                    <div
                                        key={seed}
                                        className={`avatar-option ${selectedSeed === seed ? 'selected' : ''}`}
                                        onClick={() => setSelectedSeed(seed)}
                                    >
                                        <img
                                            src={getAvatarUrl(seed)}
                                            alt={seed}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="avatar-modal-actions">
                                <button
                                    onClick={handleSaveAvatar}
                                    disabled={savingAvatar}
                                    className="save-avatar-btn"
                                >
                                    {savingAvatar ? "Saving..." : "Save Avatar"}
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedSeed(currentSeed);
                                        setShowAvatarPicker(false);
                                    }}
                                    className="cancel-avatar-btn"
                                >
                                    Cancel
                                </button>
                            </div>

                        </div>
                    </div>
                )}

                {/* Profile Form */}
                <form onSubmit={handleSaveProfile}>

                    <div className="personal-information-container">

                        <div className="personal-info-div">
                            <img className="edit-profile-icon-profile" src={profilepic} alt="profile icon" />
                            <h2>Personal Information</h2>
                        </div>

                        <label htmlFor="username">Username</label>
                        <input
                            name="username"
                            id="edit-profile-username"
                            className="edit-profile-username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />

                        <label>Email</label>
                        <input
                            name="email"
                            id="edit-profile-email"
                            className="edit-profile-email"
                            value={email}
                            disabled
                        />
                        <span>Email cannot be changed manually.</span>

                        <div className="edit-profile-info">

                            <div className="info-box">
                                <label htmlFor="department">Department</label>
                                <input
                                    name="department"
                                    className="edit-profile-department"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                />
                            </div>

                            <div className="info-box">
                                <label>Level</label>
                                <select
                                    className="edit-profile-level"
                                    name="level"
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                >
                                    <option value="100">100L</option>
                                    <option value="200">200L</option>
                                    <option value="300">300L</option>
                                    <option value="400">400L</option>
                                    <option value="500">500L</option>
                                    <option value="600">600L</option>
                                </select>
                            </div>

                        </div>

                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        {success && <p style={{ color: 'green' }}>{success}</p>}

                    </div>

                    <button className="save-changes" type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                        className="revert-changes"
                        type="button"
                        onClick={() => navigate(-1)}
                    >
                        Cancel & Revert
                    </button>

                </form>

            </div>
        </>
    );
}

export default EditProfile;