import "./styles/EditProfile.css";
import Header from "./Header";
import profilepic from "./assets/icons/profile.png"
import snap from "./assets/icons/snap.png"

function EditProfile () {

    
    return (
        <>
            <Header />

            <div className="edit-profile-container">



                    <div className="profile-avatar-container">
                        
                        <img className="edit-profile-avatar"
                            src={profilepic}
                        ></img>

                        <h2 className="profile-username">John Doe</h2>

                        <p className="profile-age">User since 2023</p>


                        <form>

                            <p className="choose-avatar-p">Choose an Avatar:</p>

                            <div className="choose-avatar">

                            </div>

                            <button type="submit">Save</button>

                        </form>

                    </div>
            
            <form>
                    
                    <div className="personal-information-container">

                        <div className="personal-info-div">

                        <img className="edit-profile-icon-profile"
                            src={profilepic}
                        ></img>

                        <h2>Personal Information</h2>

                        </div>

                    
                        <label for="username">Username</label>
                        <input name="username" id="edit-profile-username" className="edit-profile-username" />
x
                     
                        <label>Email</label>
                        <input name="email" id="edit-profile-email" className="edit-profile-email" /> 
                        <span>Email cannot be changed manually.</span>

                        
                        <div className="edit-profile-info">
                            
                            <div className="info-box">
                            <label for="department">Department</label>
                            <input name="department" className="edit-profile-department" />
                            </div>
                            
                            <div className="info-box">
                            <label>Level</label>
                            <select className="edit-profile-level" name="level">
                                <option value="100L">100L</option>
                                <option value="200L">200L</option>
                                <option value="300L">300L</option>
                                <option value="400L">400L</option>
                                <option value="500L">500L</option>
                                <option value="600L">600L</option>
                            </select>
                            </div>

                        </div>



                    </div>


                    <button className="save-changes" type="sumbit">Save Changes</button>

                    <button className="revert-changes">Cancel & Revert</button>


            </form>



            </div>

        
        </>
    )


}

export default EditProfile;

