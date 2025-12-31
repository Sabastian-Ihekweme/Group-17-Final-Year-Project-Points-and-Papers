import Header from "./Header";
import calendar from "./assets/icons/calendar.png";
import "./styles/ResourceDetailsLocked.css"


function ResourceDetailsLocked () {
    return (
        <>

            <Header />

            <div className="resource-details-locked">

                <h1>Resource Details (Locked)</h1>

                <div className="resource-details">

                    <h2>SEN 317 Midterm Exam</h2>


                    <div className="resource-meta-data">

                            <div className="resource-type-tag">
                                Midterm Exam
                            </div>

                        <div className="resource-title">Compiler Construction Midterm Exam</div>

                        <div className="instructor">Mr Austin Ogar</div>

                        <div className="upload-date">
                            <img className="upload-date-icon" src={calendar} />
                            Uploaded: October 26, 2023
                        </div>
                    </div>

                    <div className="uploader-profile-and-unlock-points">

                    <div class="uploader-profile">

                        <h3>Uploader</h3>

                        <div className="uploader-info">

                            <div className="uploader-profile-pic">
                            <img className="uploader-profile-pic-img" />
                            </div>

                            <div className="uploader-meta-data">
                                <span className="uploader-name">
                                    Alice Smith
                                </span>
                                <span className="uploader-level-department">
                                    Software Engineering 300L
                                </span>
                            </div>

                        </div>

                            <button className="view-profile-button">
                                View Profile
                            </button>

                    </div>

                    <div className="unlock-info">
                        <p className="label">Points to Unlock</p>

                        <p className="points-req">30/1200</p>

                        <p className="remark">You have enough points</p>
                    </div>

                    </div>

                    <div className="resource-description">
                        Comprehensive midterm exam covering lexical analysis, syntax analysis & semantic analysis
                    </div>

                    <button className="unlock-resource-button">
                        Unlock Resource
                    </button>

                </div>

                <div className="important-information">
                    
                    <h3>Important Information</h3>

                    <li>Points used for unlocking resources are non-refundable.</li>
                    <li>Once unlocked, resources are permanently accessible from your account.</li>
                    <li>Ensure you have sufficient points before proceeding with the unlock.</li>
                    <li>Contact support if you encounter any issues with your unlocked content.</li>

                </div>

            </div>

        </>
    )
}

export default ResourceDetailsLocked;
