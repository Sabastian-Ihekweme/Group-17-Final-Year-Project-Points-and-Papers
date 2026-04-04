import {useState} from "react";
import Header from "./Header";
import notification from "./assets/icons/bell.png";
import user from "./assets/icons/user.png"
import "./styles/Followers.css";

function Followers() {

const [activeTab, setActiveTab] = useState("followers");

const followers = [
    { profilePic: "user", username: "Alice Johnson" },
    { profilePic: "user", username: "Michael Applewhite" },
    { profilePic: "user", username: "Sarah Connor" },
    { profilePic: "user", username: "James Okafor" },
    { profilePic: "user", username: "Priya Nair" },
    { profilePic: "user", username: "Ethan Brooks" },
    { profilePic: "user", username: "Fatima Yusuf" },
    { profilePic: "user", username: "Carlos Rivera" },
    { profilePic: "user", username: "Lena Müller" },
    { profilePic: "user", username: "David Osei" },
    { profilePic: "user", username: "Yuki Tanaka" },
    { profilePic: "user", username: "Amara Diallo" },
];

const following = [
    { profilePic: {user}, username: "Michael Applewhite" },  // also follows back
    { profilePic: {user}, username: "Sarah Connor" },         // also follows back
    { profilePic: {user}, username: "Ethan Brooks" },         // also follows back
    { profilePic: {user}, username: "Fatima Yusuf" },         // also follows back
    { profilePic: {user}, username: "Tom Hansley" },
    { profilePic: {user}, username: "Grace Okonkwo" },
    { profilePic: {user}, username: "Ravi Patel" },
    { profilePic: {user}, username: "Nina Petrova" },
    { profilePic: {user}, username: "Omar Khalid" },
    { profilePic: {user}, username: "Zoe Adeyemi" },
    { profilePic: {user}, username: "Ben Nakamura" },
    { profilePic: {user}, username: "Isla Ferguson" },
    { profilePic: {user}, username: "Kwame Mensah" },
];


    function checkFollower(follower) {
        if (following.some(item => item.username === follower)) {
            return "is-following"
        } else {
            return "not-following"
        };
    };

    return (
        <>
            <Header />

            <div className="followers-div">
                
                <h1>Manage Connections</h1>

                <div className="view-notifications-button">
                    <img className="notification-icon" src={notification}/>
                    <button>View Notifications</button>
                </div>

                <div className="followers-or-following">
                    <button 
                    onClick={() => setActiveTab("followers")}
                    className={activeTab == "followers" ? "button-active" : "button-inactive"}>Followers ({followers.length})</button>
                    
                    <button 
                    onClick={() => setActiveTab("following")}
                    className={activeTab == "followers" ? "button-inactive" : "button-active"}>Following ({following.length})</button>
                </div>

                
                <div className="user-list">


                    {
                        (activeTab === "followers" ? followers : following).map((follower) => (

                            <div className="account">

                                <div>
                                <img className="profile-pic" src={follower.profilePic} />
                                </div>

                                <h3 className="account-username">{follower.username}</h3>

                                <button className={checkFollower(follower.username)}>
                                    {checkFollower(follower.username) == "not-following" ? "Follow" : "Unfollow"}
                                </button>

                            </div>

                        ))
                    }



                </div>



                



            </div>
        </>
    )

}

export default Followers;

