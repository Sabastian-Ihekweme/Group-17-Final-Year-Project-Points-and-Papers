import supabase from "../config/supabaseClient";
import { createContext, useContext, useEffect, useState} from "react";

const AuthContext = createContext();

export const AuthContextProvider = ({children}) => {
    const [session, setSession] = useState(undefined)
    const [points, setPoints] = useState(0)
    const [unreadNotifications, setUnreadNotifications] = useState(0)

    // fetch points whenever session changes
    useEffect(() => {
        if (session?.user?.id) {
            const fetchPoints = async () => {
                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('points')
                        .eq('id', session.user.id)
                        .single()

                    if (error) {
                        console.error('Error fetching points:', error);
                        setPoints(0);
                    } else if (data && typeof data.points === 'number') {
                        setPoints(data.points);
                    } else {
                        console.warn('Invalid points data:', data);
                        setPoints(0);
                    }
                } catch (error) {
                    console.error('Error in fetchPoints:', error);
                    setPoints(0);
                }
            }
            fetchPoints()

            // Also fetch unread notification count
            fetchUnreadNotifications()
        } else {
            setPoints(0)
            setUnreadNotifications(0)
        }
    }, [session?.user?.id])

    const fetchUnreadNotifications = async () => {
        try {
            // Count new notifications based on database entries
            // For now, we'll count followers + upvotes + answers created in last 24 hours
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            
            const { count: followerCount } = await supabase
                .from('follows')
                .select('*', { count: 'exact', head: true })
                .eq('following_id', session.user.id)
                .gte('created_at', oneDayAgo);

            setUnreadNotifications(followerCount || 0);
        } catch (error) {
            console.error('Error fetching unread notifications:', error);
        }
    };

    // persist login on refresh
    useEffect(() => {
        supabase.auth.getSession().then(({data: {session}}) => {
            setSession(session)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    // Sign Up
    const signUpNewUser = async (username, level, department, email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username,
                    level: level,
                    department: department,
                }
            }
        });

        if(error) {
            console.error("there was a problem signing up: ", error);
            return { success: false, error };
        }

        return { success: true, data };
    }

    // Sign in
    const signInUser = async (email, password) => {
        try {
            const {data, error} = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if(error) {
                console.error("sign in error occured: ", error);
                return { success: false, error: error.message };
            }

            return { success: true, data }
        } catch (error) {
            console.error("an error occured: ", error)
        }
    }

    // Sign Out
    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        if(error) {
            console.error("there was an error: ", error);
        }
    }

    return (
        <AuthContext.Provider value={{ session, signUpNewUser, signInUser, signOut, points, setPoints, unreadNotifications, setUnreadNotifications }}>
            {children}
        </AuthContext.Provider>
    )
}

export const UserAuth = () => {
    return useContext(AuthContext);
};