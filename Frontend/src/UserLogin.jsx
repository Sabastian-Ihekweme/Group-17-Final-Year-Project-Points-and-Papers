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
   const [loading, setLoading] = useState(false);


   const { signInUser } = UserAuth();
   const navigate = useNavigate();


   const handleSignIn = async (e) => {
       e.preventDefault();
       setError("");


       // Basic field checks
       if (!email.trim()) return setError("Please enter your email address.");
       if (!password) return setError("Please enter your password.");


       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       if (!emailRegex.test(email)) return setError("Please enter a valid email address.");


       setLoading(true);
       try {
           const result = await signInUser(email.trim(), password);


           if (result?.success) {
               navigate('/my-profile');
           } else {
               // Map Supabase error messages to user-friendly ones
               const msg = result?.error || "";
               if (msg.toLowerCase().includes("invalid login credentials") || msg.toLowerCase().includes("invalid credentials")) {
                   setError("Incorrect email or password. Please try again.");
               } else if (msg.toLowerCase().includes("email not confirmed")) {
                   setError("Please verify your email before logging in.");
               } else if (msg.toLowerCase().includes("user not found")) {
                   setError("No account found with this email address.");
               } else {
                   setError(msg || "Something went wrong. Please try again.");
               }
           }
       } catch (err) {
           setError("An error occurred. Please try again.");
       } finally {
           setLoading(false);
       }
   };


   return (
       <div className="user-login">
           <div className="user-registration">
               <div className="login-container">


                   <div className="logo-title">
                       <img className="logo" src={logo} alt="logo" />
                       <h1>Points & Papers</h1>
                   </div>


                   <h2>Login to Your Account</h2>


                   {error && <p className="error-message">{error}</p>}


                   <form onSubmit={handleSignIn}>


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
                               type="password" id="password" name="password" placeholder="Enter your password" />
                       </div>


                       <button type="submit" className="login-btn" disabled={loading}>
                           {loading ? "Logging in..." : "Login"}
                       </button>


                       <p className="login-link">Don't have an account? <NavLink to='/user-registration'>Create one</NavLink></p>
                   </form>
               </div>


               <img className="landing-page-design" src={landingPageDesign} alt="design" />
           </div>
       </div>
   );
}


export default UserLogin;


