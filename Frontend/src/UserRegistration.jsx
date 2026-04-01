import {useState} from "react";
import './styles/UserRegistration.css';
import logo from './assets/icons/logo.png';
import landingPageDesign from './assets/landing-page-design.png'
import { NavLink , useNavigate} from 'react-router';
import { UserAuth } from "./context/AuthContext";

function UserRegistration () {

    const [username, setUsername] = useState("");
    const [level, setLevel] = useState("");
    const [department, setDepartment] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState("");


    const { session, signUpNewUser, signInUser, signOut } = UserAuth();
    const navigate = useNavigate();
    console.log(session);

    console.log(username, level, department, email, password);


    const handleSignUp = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const result = await signUpNewUser(username, level, department, email, password)

            if (result.success) {
                navigate('/my-profile');
            }
        } catch (err) {
            setError("an error occured");
        } finally {
            setLoading(false);
        }
    }


    return (
    <div className="user-registration">
        <div className="registration-container">

            <div className="logo-title">
                <img className="logo" src={logo}/>
                <h1>Points & Papers</h1>
            </div>

            <h2>Create Your Account</h2>

            <p>Unlock a world of academic resources and AI tools.</p>

            <form onSubmit={handleSignUp}>
                <div className="textbox">
                <label className="label" htmlFor="username">Username</label>
                <input
                onChange={(e) => setUsername(e.target.value)}
                type="text" id="username" name="username" placeholder="Choose a unique username"/>
                </div>


                <div className="textbox">
                <label className="label" htmlFor="level">Level</label>
                <select 
                onChange={(e) => setLevel(e.target.value)}
                id="level" name="level">
                    <option value="">Select your academic level</option>
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                </select>
                </div>



                <div className="textbox">
                <label className="label" htmlFor="department">Department</label>
                <select
                onChange={(e) => setDepartment(e.target.value)}
                id="department" name="department">
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
                type="email" id="email" name="email" placeholder="Enter your email address"/>
                </div>


                <div className="textbox">
                <label className="label" htmlFor="password">Password</label>
                <input 
                onChange={(e) => setPassword(e.target.value)}
                type="password" id="password" name="password" placeholder="Create a strong password"/>
                </div>

                
                <button type="submit" className="register-btn">Register</button>

                {error && <p>{error}</p>}

                <p className="login-link">Already have an account? <NavLink to='/user-login'>Login</NavLink></p>
            </form>           

        </div>

        <img className="landing-page-design" src={landingPageDesign}/>
    </div>
    )
}

export default UserRegistration;
