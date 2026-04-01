import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from './assets/icons/logo.png';
import landingPageDesign from './assets/landing-page-design.png'
import './styles/UserLogin.css';
import { UserAuth } from "./context/AuthContext";

function UserLogin() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false); // ← was string, should be boolean

    const { signInUser } = UserAuth(); // ← only destructure what you need
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("") // ← clear previous errors before each attempt
        try {
            const result = await signInUser(email, password)

            if (result.success) {
                navigate('/my-profile');
            }
        } catch (err) {
            setError("An error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="user-login">
            <div className="user-registration">
                <div className="login-container">
        
                    <div className="logo-title">
                        <img className="logo" src={logo}/>
                        <h1>Points & Papers</h1>
                    </div>
        
                    <h2>Login to Your Account</h2>

                    {error && <p className="error-message">{error}</p>} {/* ← show error */}
        
                    <form onSubmit={handleSignIn}>     
        
                        <div className="textbox">
                            <label className="label" htmlFor="email">Email</label> {/* ← for → htmlFor */}
                            <input 
                                onChange={(e) => setEmail(e.target.value)}
                                type="email" id="email" name="email" placeholder="Enter your email address"/>
                        </div>
        
                        <div className="textbox">
                            <label className="label" htmlFor="password">Password</label> {/* ← for → htmlFor */}
                            <input 
                                onChange={(e) => setPassword(e.target.value)}
                                type="password" id="password" name="password" placeholder="Enter your password"/>
                        </div>
        
                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? "Logging in..." : "Login"} {/* ← loading feedback */}
                        </button>
        
                        <p className="login-link">Don't have an account? <NavLink to='/user-registration'>Create one</NavLink></p>
                    </form>           
        
                </div>
        
                <img className="landing-page-design" src={landingPageDesign}/>
            </div>
        </div>
    )
}

export default UserLogin;