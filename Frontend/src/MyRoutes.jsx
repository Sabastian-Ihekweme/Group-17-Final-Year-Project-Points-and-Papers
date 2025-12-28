import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import UserRegistration from "./UserRegistration";
import UserLogin from "./UserLogin"
import Header from './Header'
import MyProfile from './MyProfile'

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
            </Routes>
        </>
    )
}

export default MyRoutes;