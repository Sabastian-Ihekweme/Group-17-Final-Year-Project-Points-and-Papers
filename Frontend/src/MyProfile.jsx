import Header from './Header';
import school from './assets/icons/school.png'
import subject from './assets/icons/subject.png'
import upload from './assets/icons/upload.png'
import upvote from './assets/icons/like.png'
import people from './assets/icons/people.png'
import './styles/MyProfile.css'

function MyProfile () {
    return (
        <>
            <Header/>

            <div className="page-title"><h1>User Profile</h1></div>
            
            <div className="my-profile-container">

               <div className="user-info">
                    <div className="profile-picture"></div>

                    <div className="username">Ehijele Solomon</div>
                    
                    <div className="level">
                        <img src={school} />
                        <span>400L</span>
                    </div>

                    <div className="department">
                        <img className="profile-icon" src={subject} />
                        <span>Software Engineering</span>
                    </div>
               </div>

                <div className="user-metric">

               <div className="user-metrics">

                    <div className="icon">
                        <img className="profile-icon" src={upload}/>
                    </div>

                    <div className="metrics-info">
                        <span className="metrics-description">Total Uploads</span>
                        <span className="metrics-value">15</span>
                    </div>

               </div>




               <div className="user-metrics">

                    <div className="icon">
                        <img className="profile-icon" src={upvote}/>
                    </div>

                    <div className="metrics-info">
                        <span className="metrics-description">Total Upvotes</span>
                        <span className="metrics-value">75</span>
                    </div>

               </div>





               <div className="user-metrics">

                    <div className="icon">
                        <img className="profile-icon" src={people}/>
                    </div>

                    <div className="metrics-info">
                        <span className="metrics-description">Followers</span>
                        <span className="metrics-value">236</span>
                    </div>

               </div>





               <div className="user-metrics">

                    <div className="icon">
                        <img className="profile-icon" src={people}/>
                    </div>

                    <div className="metrics-info">
                        <span className="metrics-description">Following</span>
                        <span className="metrics-value">177</span>
                    </div>

               </div>

               </div>

            </div>
        </>
    )
}

export default MyProfile;