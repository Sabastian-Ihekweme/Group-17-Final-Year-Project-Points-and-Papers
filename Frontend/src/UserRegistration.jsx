import {useState} from "react";
import './styles/UserRegistration.css';
import logo from './assets/icons/logo.png';
import landingPageDesign from './assets/landing-page-design.png'
import { NavLink, useNavigate } from 'react-router';
import { UserAuth } from "./context/AuthContext";
import supabase from "./config/supabaseClient";

function UserRegistration() {

    const [username, setUsername] = useState("");
    const [level, setLevel] = useState("");
    const [department, setDepartment] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { signUpNewUser } = UserAuth();
    const navigate = useNavigate();

    const validateForm = async () => {
        // All fields required
        if (!username.trim()) return "Please enter a username.";
        if (!level) return "Please select your academic level.";
        if (!department) return "Please select your department.";
        if (!email.trim()) return "Please enter your email address.";
        if (!password) return "Please enter a password.";

        // Email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return "Please enter a valid email address.";

        // Password length
        if (password.length < 6) return "Password must be at least 6 characters long.";

        // Check if username already exists
        const { data: existingUsername } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username.trim())
            .maybeSingle();

        if (existingUsername) return "This username is already taken. Please choose another.";

        return null; // no errors
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const validationError = await validateForm();
            if (validationError) {
                setError(validationError);
                setLoading(false);
                return;
            }

            const result = await signUpNewUser(username.trim(), level, department, email.trim(), password);

            if (result.success) {
                navigate('/my-profile');
            } else {
                // Handle Supabase auth errors
                const msg = result.error?.message || "";
                if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("already been registered")) {
                    setError("An account with this email already exists. Please log in.");
                } else {
                    setError(msg || "Something went wrong, please try again.");
                }
            }
        } catch (err) {
            setError("An error occurred, please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="user-registration">
            <div className="registration-container">

                <div className="logo-title">
                    <img className="logo" src={logo} alt="logo" />
                    <h1>Points & Papers</h1>
                </div>

                <h2>Create Your Account</h2>

                <p>Unlock a world of academic resources and AI tools.</p>

                <form onSubmit={handleSignUp}>
                    <div className="textbox">
                        <label className="label" htmlFor="username">Username</label>
                        <input
                            onChange={(e) => setUsername(e.target.value)}
                            type="text" id="username" name="username" placeholder="Choose a unique username" />
                    </div>

                    <div className="textbox">
                        <label className="label" htmlFor="level">Level</label>
                        <select onChange={(e) => setLevel(e.target.value)} id="level" name="level" value={level}>
                            <option value="">Select your academic level</option>
                            <option value="100">100 Level</option>
                            <option value="200">200 Level</option>
                            <option value="300">300 Level</option>
                            <option value="400">400 Level</option>
                        </select>
                    </div>

                    <div className="textbox">
                        <label className="label" htmlFor="department">Department</label>
                        <select onChange={(e) => setDepartment(e.target.value)} id="department" name="department" value={department}>
                            <option value="">Select your department</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Cyber Security">Cyber Security</option>
                            <option value="Data Science">Data Science</option>
                            <option value="Information Technology">Information Technology</option>
                            <option value="Information Systems">Information Systems</option>
                            <option value="Software Engineering">Software Engineering</option>
                        </select>
                    </div>

                    <div className="textbox">
                        <label className="label" htmlFor="email">Email</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="email" id="email" name="email" placeholder="Enter your email address" />
                    </div>

                    <div className="textbox">
                        <label className="label" htmlFor="password">Password</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            type="password" id="password" name="password" placeholder="Create a strong password (min. 6 characters)" />
                    </div>

                    <button type="submit" className="register-btn" disabled={loading}>
                        {loading ? "Creating Account..." : "Register"}
                    </button>

                    {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}

                    <p className="login-link">Already have an account? <NavLink to='/user-login'>Login</NavLink></p>
                </form>
            </div>

            <img className="landing-page-design" src={landingPageDesign} alt="design" />
        </div>
    );
}

export default UserRegistration;