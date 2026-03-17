import {useState} from "react";
import Header from "./Header";
import "./styles/MyContributions.css";



function MyContributions() {

        const contributions = [
                {
                    title: "Advanced Calculus Lecture Notes",
                    type: "Report/Essay",
                    date: "2023-11-01",
                    points: 20
                },
                {
                    title: "Introduction to Quantum Mechanics",
                    type: "Presentation",
                    date: "2023-09-15",
                    points: 35
                },
                {
                    title: "Data Structures and Algorithms Cheat Sheet",
                    type: "Study Guide",
                    date: "2024-01-22",
                    points: 15
                },
                {
                    title: "World War II Timeline Analysis",
                    type: "Report/Essay",
                    date: "2023-10-08",
                    points: 25
                },
                {
                    title: "Organic Chemistry Reaction Mechanisms",
                    type: "Flashcards",
                    date: "2024-02-14",
                    points: 30
                },
                {
                    title: "Macroeconomics Supply & Demand Models",
                    type: "Presentation",
                    date: "2023-12-03",
                    points: 40
                },
                {
                    title: "Shakespeare's Hamlet — Thematic Breakdown",
                    type: "Report/Essay",
                    date: "2024-03-01",
                    points: 18
                },
                {
                    title: "Linear Algebra Problem Sets (Week 1–6)",
                    type: "Practice Problems",
                    date: "2023-08-30",
                    points: 50
                },
                {
                    title: "Human Anatomy Diagram Notes",
                    type: "Study Guide",
                    date: "2024-01-05",
                    points: 22
                },
                {
                    title: "Python for Data Science — Beginner's Guide",
                    type: "Tutorial",
                    date: "2023-07-19",
                    points: 45
                },
                {
                    title: "Environmental Impact of Renewable Energy",
                    type: "Report/Essay",
                    date: "2024-02-28",
                    points: 33
                }
        ];

    return <>

        <Header />

        <div className="my-contributions-div">

            <h1>My Contributions</h1>

            <div className="my-contributions">

            {
                contributions.map((contribution) => (

                    <div className="contribution">
                        <h3 className="contribution-title">
                            {contribution.title}
                        </h3>

                        <p className="contribution-details">
                            <span className="contribution-type">{contribution.type}</span> - Uploaded: <span className="contribution-date">{contribution.date}</span>
                        </p>

                        <p className="contribution-points">Points Awarded: <span className="value">{contribution.points}</span></p>

                        <button className="view-contribution-details">View Details</button>


                    </div>

                ))

                }


            </div>

        </div>
    </>

}

export default MyContributions;
