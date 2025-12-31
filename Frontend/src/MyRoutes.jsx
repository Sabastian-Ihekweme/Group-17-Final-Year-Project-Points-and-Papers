import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import UserRegistration from "./UserRegistration";
import UserLogin from "./UserLogin"
import Header from './Header'
import MyProfile from './MyProfile'
import ResourceUpload from "./ResourceUpload";
import SearchResources from "./SearchResources";
import ResourceDetailsLocked from "./ResourceDetailsLocked";

function MyRoutes () {

    const location = useLocation();

    return (
        <>
            <Routes location={location} key={location.pathname}>
                <Route index element={<UserRegistration />} />
                <Route path="/user-registration" element={<UserRegistration />} />
                <Route path="/user-login" element={<UserLogin />} />
                <Route path="/header" element={<Header />} />
                <Route path="/my-profile" element={<MyProfile/>} />
                <Route path="/upload-resource" element={<ResourceUpload />} />
                <Route path="/search-resources" element={<SearchResources />} />
                <Route path="/resource-details-locked" element={<ResourceDetailsLocked/>} />
            </Routes>x
        </>
    )
}

export default MyRoutes;