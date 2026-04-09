import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import UserRegistration from "./UserRegistration";
import UserLogin from "./UserLogin"
import Header from './Header'
import MyProfile from './MyProfile'
import UserProfile from './UserProfile';
import ResourceUpload from "./ResourceUpload";
import SearchResources from "./SearchResources";
import ResourceDetailsLocked from "./ResourceDetailsLocked";
import ResourceDetailsImage from "./ResourceDetailsImage";
import ResourceDetailsPDF from "./ResourceDetailsPDF";
import AIAnswer from "./AIAnswer";
import AINotes from "./AINotes";
import MyContributions from "./MyContributions";
import Followers from "./Followers";
import Notifications from "./Notifications";
import EditProfile from "./EditProfile";
import VerifyEmail from "./VerifyEmail";
import { UserAuth } from "./context/AuthContext";

const ProtectedRoute = ({ children }) => {
    const { session } = UserAuth()
    if (session === undefined) return null
    if (!session) return <Navigate to="/user-login" replace />
    return children
}

function MyRoutes() {
    const location = useLocation();

    return (
        <Routes location={location} key={location.pathname}>
            {/* public routes */}
            <Route index element={<UserRegistration />} />
            <Route path="/user-registration" element={<UserRegistration />} />
            <Route path="/user-login" element={<UserLogin />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* protected routes */}
            <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            <Route path="/header" element={<ProtectedRoute><Header /></ProtectedRoute>} />
            <Route path="/my-profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
            <Route path="/upload-resource" element={<ProtectedRoute><ResourceUpload /></ProtectedRoute>} />
            <Route path="/search-resources" element={<ProtectedRoute><SearchResources /></ProtectedRoute>} />
            <Route path="/resource-details-locked" element={<ProtectedRoute><ResourceDetailsLocked /></ProtectedRoute>} />
            <Route path="/resource-details-image/:id" element={<ProtectedRoute><ResourceDetailsImage /></ProtectedRoute>} />
            <Route path="/resource-details-pdf/:id" element={<ProtectedRoute><ResourceDetailsPDF /></ProtectedRoute>} />
            <Route path="/profile/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/generate-ai-answer" element={<ProtectedRoute><AIAnswer /></ProtectedRoute>} />
            <Route path="/generate-ai-notes" element={<ProtectedRoute><AINotes /></ProtectedRoute>} />
            <Route path="/my-contributions" element={<ProtectedRoute><MyContributions /></ProtectedRoute>} />
            <Route path="/followers" element={<ProtectedRoute><Followers /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        </Routes>
    )
}

export default MyRoutes;