import supabase from "../config/supabaseClient";
import { createContext, useContext, useEffect, useState} from "react";


const AuthContext = createContext();


// 40 pre-defined avatar seeds
export const AVATAR_SEEDS = [
   "tiger", "cosmos", "river", "phoenix", "storm",
   "luna", "blaze", "echo", "nova", "frost",
   "cedar", "atlas", "ember", "zephyr", "sage",
   "onyx", "coral", "dusk", "haven", "flint",
   "marble", "solstice", "birch", "nimbus", "vale",
   "cinder", "thistle", "grove", "lumen", "quartz",
   "sable", "tide", "wren", "axiom", "dune",
   "halo", "moss", "prism", "rune", "beacon"
];


export const getAvatarUrl = (seed) =>
   `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed ?? 'default'}`;


export const getProfileAvatar = (profile) =>
   profile?.avatar_url || getAvatarUrl(profile?.avatar_seed);


const AuthContextProvider = ({children}) => {
   const [session, setSession] = useState(undefined)
   const [points, setPoints] = useState(0)
   const [unreadNotifications, setUnreadNotifications] = useState(0)


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
           fetchUnreadNotifications()
       } else {
           setPoints(0)
           setUnreadNotifications(0)
       }
   }, [session?.user?.id])


   const fetchUnreadNotifications = async () => {
       try {
           const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          
           const { count: followerCount = 0 } = await supabase
               .from('follows')
               .select('*', { count: 'exact', head: true })
               .eq('following_id', session.user.id)
               .gte('created_at', oneDayAgo);


           const { count: answerCount = 0 } = await supabase
               .from('answers')
               .select('*', { count: 'exact', head: true })
               .in('question_id',
                   (await supabase
                       .from('questions')
                       .select('id')
                       .eq('user_id', session.user.id)).data?.map(q => q.id) || []
               )
               .gte('created_at', oneDayAgo)
               .neq('user_id', session.user.id);


           setUnreadNotifications((followerCount || 0) + (answerCount || 0));
       } catch (error) {
           console.error('Error fetching unread notifications:', error);
       }
   };


   useEffect(() => {
       supabase.auth.getSession().then(({data: {session}}) => {
           setSession(session)
       })


       const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
           setSession(session)
       })


       return () => subscription.unsubscribe()
   }, [])


   const signUpNewUser = async (username, level, department, email, password) => {
       // Assign a random avatar seed on signup
       const randomSeed = AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)];


       const { data, error } = await supabase.auth.signUp({
           email: email,
           password: password,
           options: {
               data: {
                   username: username,
                   level: level,
                   department: department,
                   avatar_seed: randomSeed,
               }
           }
       });


       if (error) {
           console.error("there was a problem signing up: ", error);
           return { success: false, error };
       }


       // Also update the profiles table directly with the avatar seed
       if (data?.user?.id) {
           await supabase
               .from('profiles')
               .update({ avatar_seed: randomSeed })
               .eq('id', data.user.id);
       }


       return { success: true, data };
   }


   const signInUser = async (email, password) => {
       try {
           const {data, error} = await supabase.auth.signInWithPassword({
               email: email,
               password: password
           });


           if (error) {
               console.error("sign in error occured: ", error);
               return { success: false, error: error.message };
           }


           return { success: true, data }
       } catch (error) {
           console.error("an error occured: ", error)
       }
   }


   const signOut = async () => {
       const { error } = await supabase.auth.signOut()
       if (error) {
           console.error("there was an error: ", error);
       }
   }


   const updateAvatar = async (seed) => {
       try {
           const { error } = await supabase
               .from('profiles')
               .update({ avatar_seed: seed })
               .eq('id', session.user.id);


           if (error) throw error;
           return { success: true };
       } catch (error) {
           console.error('Error updating avatar:', error);
           return { success: false, error: error.message };
       }
   }


   const updateProfile = async ({ username, department, level }) => {
       try {
           const { error } = await supabase
               .from('profiles')
               .update({ username, department, level })
               .eq('id', session.user.id);


           if (error) throw error;
           return { success: true };
       } catch (error) {
           console.error('Error updating profile:', error);
           return { success: false, error: error.message };
       }
   }


   return (
       <AuthContext.Provider value={{
           session, signUpNewUser, signInUser, signOut,
           points, setPoints,
           unreadNotifications, setUnreadNotifications,
           updateAvatar, updateProfile
       }}>
           {children}
       </AuthContext.Provider>
   )
}


export { AuthContextProvider };


export const UserAuth = () => {
   return useContext(AuthContext);
};

