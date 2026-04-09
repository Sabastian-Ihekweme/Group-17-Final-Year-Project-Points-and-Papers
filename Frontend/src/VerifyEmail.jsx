import './styles/VerifyEmail.css';
import logo from './assets/icons/logo.png';

function VerifyEmail() {
    return (
        <div className="verify-email-container">
            <div className="verify-email-card">

                <div className="logo-title">
                    <img className="logo" src={logo} alt="logo" />
                    <h1>Points & Papers</h1>
                </div>

                <div className="email-icon">📧</div>

                <h2>Check Your Email</h2>

                <p>We've sent a verification link to your email address. Click the link to activate your account and get started.</p>

                <div className="verify-tips">
                    <p>• Check your spam/junk folder if you don't see it</p>
                    <p>• The link expires after 24 hours</p>
                    <p>• Make sure you used a valid email address</p>
                </div>

            </div>
        </div>
    );
}

export default VerifyEmail;