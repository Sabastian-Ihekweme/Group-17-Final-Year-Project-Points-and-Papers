import {useState} from "react";
import './styles/UserRegistration.css';
import logo from './assets/icons/logo.png';
import landingPageDesign from './assets/landing-page-design.png'
import { NavLink, useNavigate } from 'react-router';
import { UserAuth } from "./context/AuthContext";
import supabase from "./config/supabaseClient";

const ALL_DEPARTMENTS = [
    // College of Health Sciences
    "Medicine & Surgery", "Human Anatomy", "Human Physiology", "Public Health",
    "Medical Laboratory Science", "Nursing Sciences",
    // Faculty of Law
    "Law",
    // Faculty of Engineering
    "Civil Engineering", "Computer Engineering", "Electrical & Electronics Engineering",
    "Mechanical Engineering", "Petroleum & Gas Engineering", "Mechatronics",
    "Chemical Engineering", "Information & Communication Engineering",
    // Faculty of Environmental Sciences
    "Architecture", "Urban & Regional Planning", "Quantity Surveying",
    "Building", "Estate Management", "Geo-Informatics & Surveying",
    // Faculty of Science
    "Biochemistry", "Microbiology", "Biotechnology", "Industrial Chemistry",
    "Biology", "Science Laboratory Technology",
    // Faculty of Computing Studies
    "Software Engineering", "Computer Science", "Information Technology",
    "Cyber Security", "Data Science", "Information Systems",
    // Faculty of Management Sciences
    "Accounting", "Banking and Finance", "Business Administration",
    "Public Administration", "Marketing", "Entrepreneurship",
    "Logistics & Supply Chain Management",
    // Faculty of Arts & Social Sciences
    "Criminology & Security Studies", "Economics", "Petroleum Economics and Policy Studies",
    "Mass Communication", "Political Science & International Relations", "Broadcasting",
    "Film & Multimedia Studies", "Psychology", "Sociology", "Peace Studies & Conflict Resolution",
];

function UserRegistration() {

    const [username, setUsername] = useState("");
    const [level, setLevel] = useState("");
    const [department, setDepartment] = useState("");
    const [deptQuery, setDeptQuery] = useState("");
    const [showDeptDropdown, setShowDeptDropdown] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const filteredDepartments = ALL_DEPARTMENTS.filter(d =>
        d.toLowerCase().includes(deptQuery.toLowerCase())
    );

    const { signUpNewUser } = UserAuth();
    const navigate = useNavigate();

    const validateForm = async () => {
        if (!username.trim()) return "Please enter a username.";
        if (!level) return "Please select your academic level.";
        if (!department) return "Please select a valid department from the list.";
        if (!email.trim()) return "Please enter your email address.";
        if (!password) return "Please enter a password.";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return "Please enter a valid email address.";

        if (password.length < 6) return "Password must be at least 6 characters long.";

        const { data: existingUsername } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username.trim())
            .maybeSingle();

        if (existingUsername) return "This username is already taken. Please choose another.";

        return null;
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

                    <div className="textbox" style={{ position: 'relative' }}>
                        <label className="label" htmlFor="department">Department</label>
                        <input
                            id="department"
                            type="text"
                            placeholder="Type to search your department..."
                            value={deptQuery}
                            onChange={(e) => {
                                setDeptQuery(e.target.value);
                                setDepartment('');
                                setShowDeptDropdown(true);
                            }}
                            onFocus={() => setShowDeptDropdown(true)}
                            onBlur={() => setTimeout(() => setShowDeptDropdown(false), 150)}
                            autoComplete="off"
                        />
                        {showDeptDropdown && deptQuery && filteredDepartments.length > 0 && (
                            <ul style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                background: '#fff',
                                border: '1px solid #ccc',
                                borderRadius: '6px',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                zIndex: 100,
                                margin: 0,
                                padding: 0,
                                listStyle: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                                {filteredDepartments.map(dept => (
                                    <li
                                        key={dept}
                                        onMouseDown={() => {
                                            setDepartment(dept);
                                            setDeptQuery(dept);
                                            setShowDeptDropdown(false);
                                        }}
                                        style={{
                                            padding: '10px 14px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            borderBottom: '1px solid #f0f0f0'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                                    >
                                        {dept}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {deptQuery && !department && (
                            <small style={{ color: '#e53e3e', fontSize: '12px' }}>
                                Please select a department from the list.
                            </small>
                        )}
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