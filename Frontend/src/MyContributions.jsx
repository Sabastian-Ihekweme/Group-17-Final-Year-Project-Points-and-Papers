import {useState, useEffect} from "react";
import Header from "./Header";
import "./styles/MyContributions.css";
import { UserAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";
import supabase from "./config/supabaseClient";

function MyContributions() {
    const { session } = UserAuth();
    const navigate = useNavigate();
    const [contributions, setContributions] = useState([]);
    const [loading, setLoading] = useState(true);

    const uploadPointsMap = {
        'midterm exam': 50,
        'final exam': 70,
        'report/essay': 20
    };

    useEffect(() => {
        if (session?.user?.id) {
            fetchUserContributions();
        }
    }, [session?.user?.id]);

    const fetchUserContributions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('resources')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedContributions = data.map(resource => ({
                id: resource.id,
                title: resource.title,
                type: resource.resource_type,
                date: new Date(resource.created_at).toLocaleDateString(),
                points: uploadPointsMap[resource.resource_type] || 20,
                file_type: resource.file_type
            }));

            setContributions(formattedContributions);
        } catch (error) {
            console.error('Error fetching contributions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (contribution) => {
        navigate(`/resource-details-${contribution.file_type === 'pdf' ? 'pdf' : 'image'}/${contribution.id}`);
    };

    if (loading) {
        return <>
            <Header />
            <div className="my-contributions-div">
                <h1>My Contributions</h1>
                <div className="my-contributions">
                    <p>Loading...</p>
                </div>
            </div>
        </>
    }

    return <>

        <Header />

        <div className="my-contributions-div">

            <h1>My Contributions</h1>

            <div className="my-contributions">

            {
                contributions.map((contribution) => (

                    <div className="contribution" key={contribution.id}>
                        <h3 className="contribution-title">
                            {contribution.title}
                        </h3>

                        <p className="contribution-details">
                            <span className="contribution-type">{contribution.type}</span> - Uploaded: <span className="contribution-date">{contribution.date}</span>
                        </p>

                        <p className="contribution-points">Points Awarded: <span className="value">{contribution.points}</span></p>

                        <button className="view-contribution-details" onClick={() => handleViewDetails(contribution)}>View Details</button>


                    </div>

                ))

                }


            </div>

        </div>
    </>

}

export default MyContributions;