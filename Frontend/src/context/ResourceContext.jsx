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

    const fetchAllResources = async () => {
        try {
            const { data, error } = await supabase
                .from('resources')
                .select(`*, profiles(username)`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching resources:', error);
            return [];
        }
    };

    const searchResources = async (filters = {}) => {
        try {
            let query = supabase
                .from('resources')
                .select(`*, profiles(username)`);

            if (filters.searchQuery) {
                query = query.or(
                    `title.ilike.%${filters.searchQuery}%,course_code.ilike.%${filters.searchQuery}%,instructor.ilike.%${filters.searchQuery}%`
                );
            }
            if (filters.year) query = query.eq('year', filters.year);
            if (filters.instructor) query = query.ilike('instructor', `%${filters.instructor}%`);
            if (filters.department) query = query.eq('department', filters.department);
            if (filters.level) {
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

    const unlockResource = async (resourceId, resourceType) => {
        try {
            const pointsCost = pointsMap[resourceType] || 3;

            if (userPoints < pointsCost) {
                return { success: false, error: `Not enough points. You need ${pointsCost} points but have ${userPoints}` };
            }

            const { error: unlockError } = await supabase
                .from('unlocked_resources')
                .insert({
                    user_id: session.user.id,
                    resource_id: resourceId,
                    unlocked_at: new Date().toISOString()
                });

            if (unlockError) throw unlockError;

            const { error: pointsError } = await supabase
                .from('profiles')
                .update({ points: userPoints - pointsCost })
                .eq('id', session.user.id);

            if (pointsError) throw pointsError;

            setUnlockedResources(prev => [...prev, resourceId]);
            setPoints(userPoints - pointsCost);

            return { success: true, pointsDeducted: pointsCost };
        } catch (error) {
            console.error('Error unlocking resource:', error);
            return { success: false, error: error.message || 'Failed to unlock resource' };
        }
    };

    // ← recursively builds nested replies
    const buildAnswerTree = (answers, parentId = null) => {
        return answers
            .filter(a => a.parent_id === parentId)
            .map(a => ({
                ...a,
                replies: buildAnswerTree(answers, a.id)
            }));
    };

    // ← updated to fetch nested replies + question upvotes + user upvote status
    const fetchQuestions = async (resourceId) => {
        try {
            // fetch questions with their upvote counts
            const { data: questions, error: questionsError } = await supabase
                .from('questions')
                .select(`
                    id,
                    user_id,
                    title,
                    body,
                    created_at,
                    profiles(username),
                    upvotes(count)
                `)
                .eq('resource_id', resourceId)
                .order('created_at', { ascending: false });

            if (questionsError) throw questionsError;

            // fetch ALL answers for this resource's questions (flat list)
            const questionIds = questions.map(q => q.id);

            if (questionIds.length === 0) return [];

            const { data: answers, error: answersError } = await supabase
                .from('answers')
                .select(`
                    id,
                    user_id,
                    question_id,
                    parent_id,
                    body,
                    created_at,
                    profiles(username),
                    upvotes(count)
                `)
                .in('question_id', questionIds)
                .order('created_at', { ascending: true });

            if (answersError) throw answersError;

            // fetch current user's upvotes for questions and answers
            const { data: userUpvotes } = await supabase
                .from('upvotes')
                .select('answer_id, question_id')
                .eq('user_id', session.user.id);

            const upvotedAnswerIds = new Set(userUpvotes?.filter(u => u.answer_id).map(u => u.answer_id) || []);
            const upvotedQuestionIds = new Set(userUpvotes?.filter(u => u.question_id).map(u => u.question_id) || []);

            // attach answers as nested tree to each question
            const questionsWithAnswers = questions.map(q => ({
                ...q,
                upvoteCount: q.upvotes?.[0]?.count || 0,
                isUpvoted: upvotedQuestionIds.has(q.id),
                answers: buildAnswerTree(
                    answers
                        .filter(a => a.question_id === q.id)
                        .map(a => ({
                            ...a,
                            upvoteCount: a.upvotes?.[0]?.count || 0,
                            isUpvoted: upvotedAnswerIds.has(a.id)
                        })),
                    null
                )
            }));

            return questionsWithAnswers;
        } catch (error) {
            console.error('Error fetching questions:', error);
            return [];
        }
    };

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

    // ← updated to accept parent_id for nested replies
    const postAnswer = async (questionId, body, parentId = null) => {
        try {
            const { data, error } = await supabase
                .from('answers')
                .insert({
                    question_id: questionId,
                    user_id: session.user.id,
                    body,
                    parent_id: parentId // ← null for direct answers, answer id for replies
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

    // ← updated to support upvoting both answers and questions
    const upvoteAnswer = async (answerId) => {
        return upvoteItem({ answerId });
    };

    const upvoteQuestion = async (questionId) => {
        return upvoteItem({ questionId });
    };

    const upvoteItem = async ({ answerId = null, questionId = null }) => {
        try {
            let query = supabase
                .from('upvotes')
                .select('id')
                .eq('user_id', session.user.id);

            if (answerId) query = query.eq('answer_id', answerId);
            if (questionId) query = query.eq('question_id', questionId);

            const { data: existingVote, error: checkError } = await query.single();

            if (checkError && checkError.code !== 'PGRST116') throw checkError;

            if (existingVote) {
                const { error: deleteError } = await supabase
                    .from('upvotes')
                    .delete()
                    .eq('id', existingVote.id);

                if (deleteError) throw deleteError;
                return { success: true, upvoted: false };
            } else {
                const insertData = { user_id: session.user.id };
                if (answerId) insertData.answer_id = answerId;
                if (questionId) insertData.question_id = questionId;

                const { error: insertError } = await supabase
                    .from('upvotes')
                    .insert(insertData);

                if (insertError) throw insertError;
                return { success: true, upvoted: true };
            }
        } catch (error) {
            console.error('Error upvoting:', error);
            return { success: false, error: error.message };
        }
    };

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

    const followUser = async (userIdToFollow) => {
        try {
            const { error } = await supabase
                .from('follows')
                .insert({ follower_id: session.user.id, following_id: userIdToFollow });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error following user:', error);
            return { success: false, error: error.message };
        }
    };

    const unfollowUser = async (userIdToUnfollow) => {
        try {
            const { error } = await supabase
                .from('follows')
                .delete()
                .eq('follower_id', session.user.id)
                .eq('following_id', userIdToUnfollow);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error unfollowing user:', error);
            return { success: false, error: error.message };
        }
    };

    const checkIfFollowing = async (userIdToCheck) => {
        try {
            const { data, error } = await supabase
                .from('follows')
                .select('id')
                .eq('follower_id', session.user.id)
                .eq('following_id', userIdToCheck)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data ? true : false;
        } catch (error) {
            console.error('Error checking follow status:', error);
            return false;
        }
    };

    const uploadResource = async ({ title, description, courseCode, year, instructor, resourceType, files, department }) => {

        const { data: existingByCombination } = await supabase
            .from('resources').select('id')
            .eq('course_code', courseCode).eq('instructor', instructor).eq('year', year).limit(1);

        const { data: existingByTitle } = await supabase
            .from('resources').select('id').eq('title', title).limit(1);

        if ((existingByCombination && existingByCombination.length > 0) || (existingByTitle && existingByTitle.length > 0)) {
            return { success: false, error: 'Resource already exists' };
        }

        const firstFile = files[0];
        const firstFileExt = firstFile.name.split('.').pop();
        const firstFileName = `${Date.now()}_${Math.random()}_${firstFile.name}`;

        const { error: firstFileError } = await supabase.storage.from('resources').upload(firstFileName, firstFile);
        if (firstFileError) return { success: false, error: firstFileError };

        const { data: { publicUrl } } = supabase.storage.from('resources').getPublicUrl(firstFileName);

        const { data: resourceData, error: resourceError } = await supabase
            .from('resources')
            .insert({
                user_id: session.user.id, title, description,
                course_code: courseCode, year, instructor,
                resource_type: resourceType, file_url: publicUrl,
                file_type: firstFileExt === 'pdf' ? 'pdf' : 'image', department
            })
            .select().single();

        if (resourceError) return { success: false, error: resourceError };

        const resourceId = resourceData.id;
        const uploadedFiles = [];

        for (const file of files) {
            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random()}_${file.name}`;

                const { error: fileError } = await supabase.storage.from('resources').upload(fileName, file);
                if (fileError) continue;

                const { data: { publicUrl } } = supabase.storage.from('resources').getPublicUrl(fileName);

                const { error: fileRefError } = await supabase
                    .from('resource_files')
                    .insert({ resource_id: resourceId, file_url: publicUrl, file_type: fileExt === 'pdf' ? 'pdf' : 'image' });

                if (!fileRefError) uploadedFiles.push(publicUrl);
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }

        const pointsToAdd = pointsMap[resourceType] || 3;
        const { error: pointsError } = await supabase
            .from('profiles').update({ points: userPoints + pointsToAdd }).eq('id', session.user.id);

        if (!pointsError) setPoints(userPoints + pointsToAdd);

        return { success: true, data: resourceData, pointsEarned: pointsToAdd, filesUploaded: uploadedFiles.length };
    };

    const value = {
        uploadResource, searchResources, unlockResource, fetchAllResources,
        fetchQuestions, postQuestion, postAnswer,
        upvoteAnswer, upvoteQuestion, // ← added upvoteQuestion
        deleteQuestion, deleteAnswer,
        followUser, unfollowUser, checkIfFollowing,
        unlockedResources, loading
    };

    return (
        <ResourceContext.Provider value={value}>
            {children}
        </ResourceContext.Provider>
    );
};

export const UseResource = () => {
    return useContext(ResourceContext);
};