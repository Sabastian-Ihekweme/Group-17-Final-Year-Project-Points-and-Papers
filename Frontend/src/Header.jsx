import logo from './assets/icons/logo.png';
import './styles/Header.css'
import SidePane from './SidePane';

function Header() {
    return (
        <>

        <SidePane />

        <div className="header">
            <div className="logo-and-title">
            <img className="header-logo" src={logo} />
            <h2 className="header-title">Points & Papers</h2>
            </div>

            <div className="points-and-profile">
            <p className="points">Points: <span>1200</span></p>
            <div className="profile-picture">1</div>
            </div>
        </div>
        <hr/>
        </>
    )
}

export default Header;