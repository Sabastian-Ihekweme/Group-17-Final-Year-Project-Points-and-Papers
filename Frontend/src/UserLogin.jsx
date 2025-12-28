import { NavLink } from "react-router-dom";
import logo from './assets/icons/logo.png';
import landingPageDesign from './assets/landing-page-design.png'
import './styles/UserLogin.css';


function UserLogin() {

    return (
        <div className="user-login">
             <div className="user-registration">
                    <div className="login-container">
            
                        <div className="logo-title">
                            <img className="logo" src={logo}/>
                            <h1>Points & Papers</h1>
                        </div>
            
                        <h2>Login to Your Account</h2>
            
            
                        <form>     
            
                            <div className="textbox">
                            <label className="label" for="email">Email</label>
                            <input type="email" id="email" name="email" placeholder="Enter your email address"/>
                            </div>
            
            
                            <div className="textbox">
                            <label className="label" for="password">Password</label>
                            <input type="password" id="password" name="password" placeholder="Enter your password"/>
                            </div>
            
                            
                            <button type="submit" className="register-btn">Login</button>
            
                            <p class="login-link">Don't have an account? <NavLink to='/user-registration'>Create one</NavLink></p>
                        </form>           
            
                    </div>
            
                    <img className="landing-page-design" src={landingPageDesign}/>
                </div>
        </div>
    )

}

export default UserLogin;
