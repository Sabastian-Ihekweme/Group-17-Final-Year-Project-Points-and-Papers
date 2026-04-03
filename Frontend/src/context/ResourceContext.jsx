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

    // Fetch all resources with uploader profile
    const fetchAllResources = async () => {
        try {
            const { data, error } = await supabase
                .from('resources')
                .select(`
                    *,
                    profiles(username)
                `)
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
                .select(`
                    *,
                    profiles(username)
                `);

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

            if (filters.level) {
                // Extract level from course code
                const levelNum = parseInt(filters.level);
                query = query.gte('course_code', `${levelNum}`).lt('course_code', `${levelNum + 100}`);
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

    // Fetch questions for a resource
    const fetchQuestions = async (resourceId) => {
        try {
            const { data, error } = await supabase
                .from('questions')
                .select(`
                    id,
                    user_id,
                    title,
                    body,
                    created_at,
                    profiles(username),
                    answers(
                        id,
                        user_id,
                        body,
                        created_at,
                        profiles(username),
                        upvotes:upvotes(count)
                    )
                `)
                .eq('resource_id', resourceId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching questions:', error);
            return [];
        }
    };

    // Post a question
    const postQuestion = async (resourceId, title, body) => {
        try {
            const { data, error } = await supabase
                .from('questions')
                .insert({
                    resource_id: resourceId,
                    user_id: session.user.id,
                    title,
                    body
                })
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error posting question:', error);
            return { success: false, error: error.message };
        }
    };

    // Post an answer to a question
    const postAnswer = async (questionId, body) => {
        try {
            const { data, error } = await supabase
                .from('answers')
                .insert({
                    question_id: questionId,
                    user_id: session.user.id,
                    body
                })
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error posting answer:', error);
            return { success: false, error: error.message };
        }
    };

    // Upvote an answer
    const upvoteAnswer = async (answerId) => {
        try {
            // Check if already upvoted
            const { data: existingVote, error: checkError } = await supabase
                .from('upvotes')
                .select('id')
                .eq('answer_id', answerId)
                .eq('user_id', session.user.id)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError;
            }

            if (existingVote) {
                // Already upvoted, remove upvote
                const { error: deleteError } = await supabase
                    .from('upvotes')
                    .delete()
                    .eq('id', existingVote.id);

                if (deleteError) throw deleteError;
                return { success: true, upvoted: false };
            } else {
                // Add upvote
                const { error: insertError } = await supabase
                    .from('upvotes')
                    .insert({
                        answer_id: answerId,
                        user_id: session.user.id
                    });

                if (insertError) throw insertError;
                return { success: true, upvoted: true };
            }
        } catch (error) {
            console.error('Error upvoting answer:', error);
            return { success: false, error: error.message };
        }
    };

    // Delete a question
    const deleteQuestion = async (questionId) => {
        try {
            const { error } = await supabase
                .from('questions')
                .delete()
                .eq('id', questionId)
                .eq('user_id', session.user.id);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error deleting question:', error);
            return { success: false, error: error.message };
        }
    };

    // Delete an answer
    const deleteAnswer = async (answerId) => {
        try {
            const { error } = await supabase
                .from('answers')
                .delete()
                .eq('id', answerId)
                .eq('user_id', session.user.id);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error deleting answer:', error);
            return { success: false, error: error.message };
        }
    };

    const uploadResource = async ({ title, description, courseCode, year, instructor, resourceType, files, department }) => {

        // 1. check for duplicate
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

        // 2. Upload first file to get URL for the resources table
        let primaryFileUrl = null;
        const firstFile = files[0];
        const firstFileExt = firstFile.name.split('.').pop();
        const firstFileName = `${Date.now()}_${Math.random()}_${firstFile.name}`;
        
        const { error: firstFileError } = await supabase.storage
            .from('resources')
            .upload(firstFileName, firstFile);

        if (firstFileError) {
            console.error('file upload error: ', firstFileError);
            return { success: false, error: firstFileError };
        }

        // Get public URL for first file
        const { data: { publicUrl } } = supabase.storage
            .from('resources')
            .getPublicUrl(firstFileName);

        primaryFileUrl = publicUrl;

        // 3. Create the main resource entry with first file URL
        const { data: resourceData, error: resourceError } = await supabase
            .from('resources')
            .insert({
                user_id: session.user.id,
                title,
                description,
                course_code: courseCode,
                year,
                instructor,
                resource_type: resourceType,
                file_url: primaryFileUrl,
                file_type: firstFileExt === 'pdf' ? 'pdf' : 'image',
                department
            })
            .select()
            .single()

        if (resourceError) {
            console.error('database insert error: ', resourceError)
            return { success: false, error: resourceError }
        }

        const resourceId = resourceData.id;

        // 4. Upload ALL files (including first) to resource_files table
        const uploadedFiles = [];
        
        for (const file of files) {
            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random()}_${file.name}`;
                
                // Upload to storage
                const { error: fileError } = await supabase.storage
                    .from('resources')
                    .upload(fileName, file);

                if (fileError) {
                    console.error('file upload error: ', fileError);
                    continue;
                }

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('resources')
                    .getPublicUrl(fileName);

                // Store file reference in resource_files table
                const { error: fileRefError } = await supabase
                    .from('resource_files')
                    .insert({
                        resource_id: resourceId,
                        file_url: publicUrl,
                        file_type: fileExt === 'pdf' ? 'pdf' : 'image'
                    });

                if (fileRefError) {
                    console.error('file reference error: ', fileRefError);
                    continue;
                }

                uploadedFiles.push(publicUrl);
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }

        // 5. Update points
        const pointsToAdd = pointsMap[resourceType] || 3

        const { error: pointsError } = await supabase
            .from('profiles')
            .update({ points: userPoints + pointsToAdd })
            .eq('id', session.user.id);

        if (!pointsError) {
            setPoints(userPoints + pointsToAdd)
        }

        return { success: true, data: resourceData, pointsEarned: pointsToAdd, filesUploaded: uploadedFiles.length }
    }

    const value = {
        uploadResource,
        searchResources,
        unlockResource,
        fetchAllResources,
        fetchQuestions,
        postQuestion,
        postAnswer,
        upvoteAnswer,
        deleteQuestion,
        deleteAnswer,
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