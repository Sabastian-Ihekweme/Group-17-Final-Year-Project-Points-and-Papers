import './styles/UserRegistration.css';
import logo from './assets/icons/logo.png';
import landingPageDesign from './assets/landing-page-design.png'

function UserRegistration () {

    return (
    <>
        <div className="registration-container">

            <div className="logo-title">
                <img className="logo" src={logo}/>
                <h1>Points & Papers</h1>
            </div>

            <h2>Create Your Account</h2>

            <p>Unlock a world of academic resources and AI tools.</p>

            <form>
                <label for="username">Username</label>
                <input type="text" id="username" name="username" placeholder="Choose a unique username"/>

                <label for="level">Level</label>
                <select id="level" name="level">
                    <option value="">Select your academic level</option>
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                </select>

                <label for="department">Department</label>
                <select id="department" name="department">
                    <option value="">Select your department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Cyber Security">Cyber Security</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Information Systems">Information Systems</option>
                    <option value="Software Engineering">Software Engineering</option>
                </select>

                <label for="email">Email</label>
                <input type="email" id="email" name="email" placeholder="Enter your email address"/>

                <label for="password">Password</label>
                <input type="password" id="password" name="password" placeholder="Create a strong password"/>

                <button type="submit" class="register-btn">Register</button>

                <p class="login-link">Already have an account? <a href='#'>Login</a></p>
            </form>           

        </div>

        <img src={landingPageDesign}/>
    </>
    )
}

export default UserRegistration;
