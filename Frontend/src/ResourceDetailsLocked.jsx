import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "./Header";
import calendar from "./assets/icons/calendar.png";
import "./styles/ResourceDetailsLocked.css"
import { UseResource } from './context/ResourceContext';
import { UserAuth } from './context/AuthContext';
import supabase from './config/supabaseClient';

function ResourceDetailsLocked() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userPoints } = UserAuth();
    const { unlockResource, fetchAllResources } = UseResource();
    
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [unlocking, setUnlocking] = useState(false);

    // Unlock points map
    const unlockPointsMap = {
        'midterm exam': 30,
        'final exam': 50,
        'report/essay': 15
    };

    useEffect(() => {
        const loadResource = async () => {
            try {
                setLoading(true);
                const allResources = await fetchAllResources();
                const foundResource = allResources.find(r => r.id === id);
                if (foundResource) {
                    setResource(foundResource);
                }
            } catch (error) {
                console.error('Error loading resource:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadResource();
        }
    }, [id]);

    const handleUnlock = async () => {
        if (!resource) return;

        const pointsCost = unlockPointsMap[resource.resource_type] || 15;

        if (userPoints < pointsCost) {
            alert(`You don't have enough points to unlock this resource.\n\nPoints needed: ${pointsCost}\nPoints available: ${userPoints}\n\nShare resources or answer questions to gain points.`);
            return;
        }

        setUnlocking(true);
        const result = await unlockResource(id, resource.resource_type);
        setUnlocking(false);

        if (result.success) {
            alert('Resource unlocked successfully!');
            navigate(`/resource-details-${resource.file_type === 'pdf' ? 'pdf' : 'image'}/${id}`);
        } else {
            alert(result.error || 'Failed to unlock resource');
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="resource-details-locked-container">
                    <h1>Loading...</h1>
                </div>
            </>
        );
    }

    if (!resource) {
        return (
            <>
                <Header />
                <div className="resource-details-locked-container">
                    <h1>Resource not found</h1>
                </div>
            </>
        );
    }

    const pointsCost = unlockPointsMap[resource.resource_type] || 15;
    const hasEnoughPoints = userPoints >= pointsCost;

    return (
        <>
            <Header />

            <div className="resource-details-locked-container">

                <h1>Resource Details (Locked)</h1>

                <div className="resource-detailsl-locked">

                    <h2>{resource.course_code} {resource.title}</h2>

                    <div className="resource-meta-data">

                        <div className="resource-type-tag">
                            {resource.resource_type}
                        </div>

                        <div className="resource-title">{resource.title}</div>

                        <div className="instructor">{resource.instructor}</div>

                        <div className="upload-date">
                            <img className="upload-date-icon" src={calendar} alt="calendar" />
                            Uploaded: {new Date(resource.created_at).toLocaleDateString()}
                        </div>
                    </div>

                    <div className="uploader-profile-and-unlock-points">

                        <div className="uploader-profile">

                            <h3>Uploader</h3>

                            <div className="uploader-info">

                                <div className="uploader-profile-pic">
                                    <img className="uploader-profile-pic-img" alt={resource.profiles?.username} />
                                </div>

                                <div className="uploader-meta-data">
                                    <span className="uploader-name">
                                        {resource.profiles?.username || 'Anonymous'}
                                    </span>
                                    <span className="uploader-level-department">
                                        {resource.department}
                                    </span>
                                </div>

                            </div>

                            <button 
                                className="view-profile-button"
                                onClick={() => navigate(`/profile/${resource.user_id}`)}
                            >
                                View Profile
                            </button>

                        </div>

                        <div className="unlock-info">
                            <p className="label">Points to Unlock</p>

                            <p className="points-req">{pointsCost}</p>

                            <p className={`remark ${hasEnoughPoints ? 'enough-points' : 'not-enough-points'}`}>
                                {hasEnoughPoints 
                                    ? `You have enough points (${userPoints}/${pointsCost})`
                                    : `You don't have enough points (${userPoints}/${pointsCost})`
                                }
                            </p>
                        </div>

                    </div>

                    <div className="resource-description">
                        {resource.description || 'No description provided'}
                    </div>

                    <button 
                        className={`unlock-resource-button ${!hasEnoughPoints ? 'disabled' : ''}`}
                        onClick={handleUnlock}
                        disabled={!hasEnoughPoints || unlocking}
                    >
                        {unlocking ? 'Unlocking...' : hasEnoughPoints ? 'Unlock Resource' : 'Insufficient Points'}
                    </button>

                    {!hasEnoughPoints && (
                        <div className="insufficient-points-message">
                            <p>You don't have enough points to unlock this resource.</p>
                            <p>Share resources or answer questions to gain points.</p>
                        </div>
                    )}

                </div>

                <div className="important-information">
                    
                    <h3>Important Information</h3>

                    <ul>
                        <li>Points used for unlocking resources are non-refundable.</li>
                        <li>Once unlocked, resources are permanently accessible from your account.</li>
                        <li>Ensure you have sufficient points before proceeding with the unlock.</li>
                        <li>Earn points by sharing resources and answering questions.</li>
                        <li>Contact support if you encounter any issues with your unlocked content.</li>
                    </ul>

                </div>

            </div>

        </>
    )
}

export default ResourceDetailsLocked;