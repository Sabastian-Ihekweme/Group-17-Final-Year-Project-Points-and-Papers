import { createContext, useContext, useState, useEffect } from "react";
import supabase from "../config/supabaseClient";
import { UserAuth } from "./AuthContext";

const ResourceContext = createContext();

export const ResourceContextProvider = ({ children }) => {
    const { session, setPoints, userPoints } = UserAuth()
    const [unlockedResources, setUnlockedResources] = useState([]);
    const [loading, setLoading] = useState(true);

    const pointsMap = {
        'midterm exam': 20,
        'final exam': 30,
        'report/essay': 5
    }

    // Fetch unlocked resources for current user on mount
    useEffect(() => {
        if (session?.user?.id) {
            fetchUnlockedResources();
        }
    }, [session?.user?.id]);

    const fetchUnlockedResources = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('unlocked_resources')
                .select('resource_id')
                .eq('user_id', session.user.id);

            if (error) throw error;
            
            setUnlockedResources(data?.map(item => item.resource_id) || []);
        } catch (error) {
            console.error('Error fetching unlocked resources:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch all resources
    const fetchAllResources = async () => {
        try {
            const { data, error } = await supabase
                .from('resources')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching resources:', error);
            return [];
        }
    };

    // Search and filter resources
    const searchResources = async (filters = {}) => {
        try {
            let query = supabase
                .from('resources')
                .select('*');

            // Apply filters
            if (filters.searchQuery) {
                query = query.or(
                    `title.ilike.%${filters.searchQuery}%,course_code.ilike.%${filters.searchQuery}%,instructor.ilike.%${filters.searchQuery}%`
                );
            }

            if (filters.year) {
                query = query.eq('year', filters.year);
            }

            if (filters.instructor) {
                query = query.ilike('instructor', `%${filters.instructor}%`);
            }

            if (filters.department) {
                query = query.eq('department', filters.department);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error searching resources:', error);
            return [];
        }
    };

    // Unlock a resource
    const unlockResource = async (resourceId, resourceType) => {
        try {
            // Check if user has enough points
            const pointsCost = pointsMap[resourceType] || 3;

            if (userPoints < pointsCost) {
                return { success: false, error: `Not enough points. You need ${pointsCost} points but have ${userPoints}` };
            }

            // 1. Insert into unlocked_resources table
            const { error: unlockError } = await supabase
                .from('unlocked_resources')
                .insert({
                    user_id: session.user.id,
                    resource_id: resourceId,
                    unlocked_at: new Date().toISOString()
                });

            if (unlockError) throw unlockError;

            // 2. Deduct points from user's profile
            const { error: pointsError } = await supabase
                .from('profiles')
                .update({ points: userPoints - pointsCost })
                .eq('id', session.user.id);

            if (pointsError) throw pointsError;

            // 3. Update local state
            setUnlockedResources(prev => [...prev, resourceId]);
            setPoints(userPoints - pointsCost);

            return { success: true, pointsDeducted: pointsCost };
        } catch (error) {
            console.error('Error unlocking resource:', error);
            return { success: false, error: error.message || 'Failed to unlock resource' };
        }
    };

    const uploadResource = async ({ title, description, courseCode, year, instructor, resourceType, file, department }) => {

        // 1. check for duplicate — same (course_code + instructor + year) OR same title
        const { data: existingByCombination } = await supabase
            .from('resources')
            .select('id')
            .eq('course_code', courseCode)
            .eq('instructor', instructor)
            .eq('year', year)
            .limit(1)

        const { data: existingByTitle } = await supabase
            .from('resources')
            .select('id')
            .eq('title', title)
            .limit(1)

        if (
            (existingByCombination && existingByCombination.length > 0) ||
            (existingByTitle && existingByTitle.length > 0)
        ) {
            return { success: false, error: 'Resource already exists' }
        }

        // 2. upload file to storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${file.name}`
        const { error: fileError } = await supabase.storage
            .from('resources')
            .upload(fileName, file)

        if (fileError) {
            console.error('file upload error: ', fileError)
            return { success: false, error: fileError }
        }

        // 3. get public url
        const { data: { publicUrl } } = supabase.storage
            .from('resources')
            .getPublicUrl(fileName)

        // 4. save to database
        const { data, error } = await supabase
            .from('resources')
            .insert({
                user_id: session.user.id,
                title,
                description,
                course_code: courseCode,
                year,
                instructor,
                resource_type: resourceType,
                file_url: publicUrl,
                file_type: fileExt === 'pdf' ? 'pdf' : 'image',
                department
            })

        if (error) {
            console.error('database insert error: ', error)
            return { success: false, error }
        }

        // 5. update points in database + context
        const pointsToAdd = pointsMap[resourceType] || 3

        const { error: pointsError } = await supabase
            .from('profiles')
            .update({ points: userPoints + pointsToAdd })
            .eq('id', session.user.id);

        if (!pointsError) {
            setPoints(userPoints + pointsToAdd)
        }

        return { success: true, data, pointsEarned: pointsToAdd }
    }

    const value = {
        uploadResource,
        searchResources,
        unlockResource,
        fetchAllResources,
        unlockedResources,
        loading
    };

    return (
        <ResourceContext.Provider value={value}>
            {children}
        </ResourceContext.Provider>
    )
}

export const UseResource = () => {
    return useContext(ResourceContext);
}