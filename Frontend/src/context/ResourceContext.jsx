import { createContext, useContext, useState, useEffect } from "react";
import supabase from "../config/supabaseClient";
import { UserAuth } from "./AuthContext";

const ResourceContext = createContext();

export const ResourceContextProvider = ({ children }) => {
    const { session, setPoints, userPoints } = UserAuth()
    const [unlockedResources, setUnlockedResources] = useState([]);
    const [loading, setLoading] = useState(true);

    const uploadPointsMap = {
        'midterm exam': 50,
        'final exam': 70,
        'report/essay': 20
    }

    const unlockPointsMap = {
        'midterm exam': 30,
        'final exam': 50,
        'report/essay': 15
    }

    // Resource types that skip text extraction entirely
    const SKIP_EXTRACTION_TYPES = ['final year project'];

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
                .select(`*, profiles(username, avatar_seed)`)
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
                .select(`*, profiles(username, avatar_seed)`);

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
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('points')
                .eq('id', session.user.id)
                .single();

            if (profileError || !profileData) {
                return {
                    success: false,
                    error: 'Failed to fetch your points. Please try again.'
                };
            }

            const currentPoints = profileData.points || 0;
            const pointsCost = unlockPointsMap[resourceType] || 15;

            if (currentPoints < pointsCost) {
                return {
                    success: false,
                    error: `You don't have enough points to unlock this resource.\n\nPoints needed: ${pointsCost}\nPoints available: ${currentPoints}\n\nShare resources or answer questions to gain points.`
                };
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
                .update({ points: currentPoints - pointsCost })
                .eq('id', session.user.id);

            if (pointsError) throw pointsError;

            setUnlockedResources(prev => [...prev, resourceId]);
            setPoints(currentPoints - pointsCost);

            return { success: true, pointsDeducted: pointsCost };
        } catch (error) {
            console.error('Error unlocking resource:', error);
            return { success: false, error: error.message || 'Failed to unlock resource' };
        }
    };

    const buildAnswerTree = (answers, parentId = null) => {
        return answers
            .filter(a => a.parent_id === parentId)
            .map(a => ({
                ...a,
                replies: buildAnswerTree(answers, a.id)
            }));
    };

    const fetchQuestions = async (resourceId) => {
        try {
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

            const { data: userUpvotes } = await supabase
                .from('upvotes')
                .select('answer_id, question_id')
                .eq('user_id', session.user.id);

            const upvotedAnswerIds = new Set(userUpvotes?.filter(u => u.answer_id).map(u => u.answer_id) || []);
            const upvotedQuestionIds = new Set(userUpvotes?.filter(u => u.question_id).map(u => u.question_id) || []);

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

    const postAnswer = async (questionId, body, parentId = null) => {
        try {
            const { data, error } = await supabase
                .from('answers')
                .insert({
                    question_id: questionId,
                    user_id: session.user.id,
                    body,
                    parent_id: parentId
                })
                .select()
                .single();

            if (error) throw error;

            const pointsToAdd = 5;
            const { data: profileData } = await supabase
                .from('profiles')
                .select('points')
                .eq('id', session.user.id)
                .single();

            const currentPoints = profileData?.points || 0;
            const { error: pointsError } = await supabase
                .from('profiles')
                .update({ points: currentPoints + pointsToAdd })
                .eq('id', session.user.id);

            if (!pointsError) setPoints(currentPoints + pointsToAdd);

            return { success: true, data };
        } catch (error) {
            console.error('Error posting answer:', error);
            return { success: false, error: error.message };
        }
    };

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

                if (answerId) {
                    const { data: answer } = await supabase
                        .from('answers').select('user_id').eq('id', answerId).single();

                    if (answer) {
                        const { data: ownerProfile } = await supabase
                            .from('profiles').select('points').eq('id', answer.user_id).single();

                        if (ownerProfile) {
                            await supabase
                                .from('profiles')
                                .update({ points: Math.max(0, ownerProfile.points - 2) })
                                .eq('id', answer.user_id);
                        }
                    }
                } else if (questionId) {
                    const { data: question } = await supabase
                        .from('questions').select('user_id').eq('id', questionId).single();

                    if (question) {
                        const { data: ownerProfile } = await supabase
                            .from('profiles').select('points').eq('id', question.user_id).single();

                        if (ownerProfile) {
                            await supabase
                                .from('profiles')
                                .update({ points: Math.max(0, ownerProfile.points - 2) })
                                .eq('id', question.user_id);
                        }
                    }
                }

                return { success: true, upvoted: false };
            } else {
                const insertData = { user_id: session.user.id };
                if (answerId) insertData.answer_id = answerId;
                if (questionId) insertData.question_id = questionId;

                const { error: insertError } = await supabase.from('upvotes').insert(insertData);
                if (insertError) throw insertError;

                if (answerId) {
                    const { data: answer } = await supabase
                        .from('answers').select('user_id').eq('id', answerId).single();

                    if (answer) {
                        const { data: ownerProfile } = await supabase
                            .from('profiles').select('points').eq('id', answer.user_id).single();

                        if (ownerProfile) {
                            await supabase
                                .from('profiles')
                                .update({ points: ownerProfile.points + 2 })
                                .eq('id', answer.user_id);
                        }
                    }
                } else if (questionId) {
                    const { data: question } = await supabase
                        .from('questions').select('user_id').eq('id', questionId).single();

                    if (question) {
                        const { data: ownerProfile } = await supabase
                            .from('profiles').select('points').eq('id', question.user_id).single();

                        if (ownerProfile) {
                            await supabase
                                .from('profiles')
                                .update({ points: ownerProfile.points + 2 })
                                .eq('id', question.user_id);
                        }
                    }
                }

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

    // ─── Text Extraction ──────────────────────────────────────────────────────

    const triggerExtraction = async (fileUrl, fileType, resourceId, fileId = null, retries = 3) => {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                console.log(`Extraction attempt ${attempt}/${retries} for ${fileUrl}`);

                const response = await fetch(`${import.meta.env.VITE_APP_SUPABASE_URL}/functions/v1/extract-text`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${import.meta.env.VITE_APP_ANON_KEY}`,
                    },
                    body: JSON.stringify({ fileUrl, fileType, resourceId, fileId })
                });

                const result = await response.json();
                console.log('Extraction response:', result);

                if (response.ok && result.success) {
                    console.log(`✅ Extraction successful for ${fileUrl}`);
                    return { success: true, result, extractedText: result.extractedText || result.text || '' };
                } else {
                    console.error(`❌ Extraction failed (attempt ${attempt}):`, result);
                    if (attempt === retries) {
                        return { success: false, error: result.error || 'Extraction failed' };
                    }
                    await new Promise(resolve => setTimeout(resolve, attempt * 2000));
                }
            } catch (err) {
                console.error(`❌ Extraction error (attempt ${attempt}):`, err);
                if (attempt === retries) {
                    return { success: false, error: err.message };
                }
                await new Promise(resolve => setTimeout(resolve, attempt * 2000));
            }
        }
    };

    // -- LLM Validation --

    const validateResourceWithLLM = async ({ extractedText, resourceType, title, courseCode, year, instructor, department }) => {
        try {
            const isExam = resourceType === 'midterm exam' || resourceType === 'final exam';

            const validationQuestion = isExam
                ? buildExamValidationPrompt({ extractedText, resourceType, title, courseCode, year, instructor, department })
                : buildGeneralValidationPrompt({ extractedText, resourceType, title, courseCode, year, instructor, department });

            const response = await fetch(`${import.meta.env.VITE_APP_SUPABASE_URL}/functions/v1/ai-proxy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_APP_ANON_KEY}`,
                },
                body: JSON.stringify({
                    question: validationQuestion,
                    resource: { id: 'validation', title, course_code: courseCode },
                    files: []
                })
            });

            const data = await response.json();
            const rawText = (data.text || '').trim();
            console.log('[Validation] ai-proxy raw response:', rawText);

            const cleaned = rawText.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleaned);

            return parsed;
        } catch (err) {
            console.error('[Validation] Validation error:', err);
            // Fail open on network errors only — don't block legitimate uploads
            return { valid: true };
        }
    };

    /**
     * STRICT prompt for midterm and final exams.
     * ALL metadata fields must be verifiable in the document.
     */
    const buildExamValidationPrompt = ({ extractedText, resourceType, title, courseCode, year, instructor, department }) => {
        const isMidterm = resourceType === 'midterm exam';
        const isFinal = resourceType === 'final exam';

        const midtermKeywords = ['midterm', 'mid-term', 'mid term', 'mid-semester', 'mid semester', 'midsemester', 'continuous assessment', 'c.a.', 'test 1', 'test 2', 'first test', 'second test', '1st test', '2nd test'];
        const finalKeywords = ['final', 'final examination', 'final exam', 'end of semester', 'end-of-semester', 'end of year', 'semester examination', 'annual examination', 'examination'];

        return `You are a STRICT document validator for Points & Papers, an academic resource sharing platform for Nile University of Nigeria.

A user submitted an exam paper and provided this metadata:
- Resource Type: ${resourceType.toUpperCase()}
- Title: "${title}"
- Course Code: ${courseCode}
- Academic Year: ${year}
- Instructor: ${instructor}
- Department: ${department || 'Not specified'}

Here is the extracted text from the document:
---
${extractedText.slice(0, 3000)}
---

You must validate EVERY check below. Fail on the FIRST one that does not pass.

=== CHECK 1: EXAM TYPE (STRICT — most critical) ===
Midterm keywords: ${midtermKeywords.join(', ')}
Final exam keywords: ${finalKeywords.join(', ')}

- The user selected "${resourceType.toUpperCase()}".
- If they selected "midterm exam" and the document contains ANY final exam keyword → REJECT.
- If they selected "final exam" and the document contains ANY midterm keyword → REJECT.
- If BOTH types appear, reject — the document is ambiguous or mismatched.
- If NEITHER type appears AND the document looks like an academic exam (questions, instructions, marks), accept on this check only.
- A single unambiguous keyword mismatch is enough to reject. No benefit of the doubt.

=== CHECK 2: COURSE CODE ===
The user entered course code: "${courseCode}"
- Look for this course code (or a very close variant, e.g. spacing or dash differences) anywhere in the document.
- If a DIFFERENT course code clearly appears in the document header → REJECT.
- If no course code appears at all in the document, accept on this check (some scanned papers omit it).

=== CHECK 3: INSTRUCTOR NAME ===
The user entered instructor: "${instructor}"
- Look for this name (or a partial match — last name is enough) anywhere in the document.
- If a CLEARLY DIFFERENT instructor name appears in the document → REJECT.
- If no instructor name appears at all in the document, accept on this check (many exam papers omit it).

=== CHECK 4: ACADEMIC YEAR ===
The user entered year: "${year}"
- Look for this year or session (e.g. "2023", "2023/2024", "2022/23") in the document.
- If a CLEARLY DIFFERENT year appears prominently in the document → REJECT.
- If no year appears at all in the document, accept on this check.

=== CHECK 5: DOCUMENT IS AN ACTUAL EXAM ===
- The document must look like an exam paper: it should contain questions, instructions, marks/scores, or similar academic exam content.
- If the document is clearly something else entirely (a textbook chapter, a news article, a CV, a receipt, etc.) → REJECT.
- Be lenient with format: handwritten answers, scanned booklets, and non-standard layouts are acceptable.

=== IMPORTANT NOTES ===
- OCR errors are common in scanned documents. Minor spelling differences in names or codes are acceptable.
- Do NOT reject purely because the university name is absent — many Nile University papers do not state it explicitly.
- Be strict on MISMATCHES (wrong data present), lenient on ABSENCE (data simply not found).

Respond with ONLY a raw JSON object — no markdown, no code fences, nothing else:
{"valid": true}
OR
{"valid": false, "reason": "One concise sentence that names the specific mismatch and includes the actual values found. Examples: \"You selected Final Exam but the document appears to be a Midterm — it contains the phrase mid-semester test.\" or \"You entered course code SEN401 but the document header shows SEN301.\" or \"You entered instructor Dr. Ahmed but the document shows Prof. Usman.\" or \"The uploaded file does not appear to be an exam — it looks like a Software Architecture lecture note.\""}`;
    };

    /**
     * Lenient prompt for non-exam types (FYP, report/essay, lecture note, etc.)
     */
    const buildGeneralValidationPrompt = ({ extractedText, resourceType, title, courseCode, year, instructor, department }) => {
        return `You are a document validator for Points & Papers, an academic resource sharing platform for Nile University of Nigeria students.

A user uploaded a document with the following metadata:
- Resource Type: ${resourceType}
- Title: "${title}"
- Course Code: ${courseCode}
- Academic Year: ${year}
- Instructor: ${instructor}
- Department: ${department || 'Not specified'}

Here is the extracted text from the document (first 3000 characters):
---
${extractedText.slice(0, 3000)}
---

Validation rules (be LENIENT — only reject obvious fraud):
1. The document should be broadly consistent with the selected resource type.
2. Course code, instructor name, and year do NOT need to appear in the document — they are user-supplied metadata.
3. Only reject if the document is clearly and completely wrong (e.g. a cooking recipe, a social media post, random gibberish).
4. OCR errors, handwriting, and non-standard formatting should be given benefit of the doubt.

Respond with ONLY a raw JSON object — no markdown, no code fences, nothing else:
{"valid": true}
OR
{"valid": false, "reason": "One concise sentence naming what the document actually appears to be. Example: \"The uploaded file does not look like a report or essay — it appears to be a Final Exam paper for Database Management.\""}`;
    };


    // ─── Manual Re-extraction ─────────────────────────────────────────────────

    const retriggerExtraction = async (resourceId) => {
        try {
            console.log('Retriggering extraction for resource:', resourceId);

            const { data: files, error: filesError } = await supabase
                .from('resource_files')
                .select('*')
                .eq('resource_id', resourceId);

            if (filesError) throw filesError;

            const results = [];
            for (const file of files || []) {
                const result = await triggerExtraction(
                    file.file_url,
                    file.file_type,
                    resourceId,
                    file.id
                );
                results.push({ fileId: file.id, ...result });
            }

            return { success: true, results };
        } catch (error) {
            console.error('Error retriggering extraction:', error);
            return { success: false, error: error.message };
        }
    };

    // ─── Upload Resource ──────────────────────────────────────────────────────

    const uploadResource = async ({ title, description, courseCode, year, instructor, resourceType, files, department }) => {

        const skipExtraction = SKIP_EXTRACTION_TYPES.includes(resourceType);

        // ── Duplicate check — only reject if Course Code + Year + Instructor all match ──
        const { data: existingByCombination } = await supabase
            .from('resources')
            .select('id')
            .eq('course_code', courseCode)
            .eq('year', year)
            .eq('instructor', instructor)
            .limit(1);

        if (existingByCombination && existingByCombination.length > 0) {
            return {
                success: false,
                error: 'A resource with the same Course Code, Academic Year, and Instructor already exists.'
            };
        }

        // ── Upload first file to get a public URL for the resource row ───────
        const firstFile = files[0];
        const firstFileExt = firstFile.name.split('.').pop().toLowerCase();
        const firstFileName = `${Date.now()}_${Math.random()}_${firstFile.name}`;

        const { error: firstFileError } = await supabase.storage.from('resources').upload(firstFileName, firstFile);
        if (firstFileError) {
            console.error('First file upload error:', firstFileError);
            return { success: false, error: firstFileError.message };
        }

        const { data: { publicUrl } } = supabase.storage.from('resources').getPublicUrl(firstFileName);
        const firstFileType = firstFileExt === 'pdf' ? 'pdf' : 'image';

        console.log('First file uploaded:', { publicUrl, firstFileType });

        // ── Create the resource row ──────────────────────────────────────────
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
                file_url: publicUrl,
                file_type: firstFileType,
                department
            })
            .select().single();

        if (resourceError) {
            // Supabase CHECK constraint violation — resource_type value not allowed in DB
            if (resourceError.code === '23514') {
                const userFacingMessage =
                    `The resource type "${resourceType}" is not recognised by the database. ` +
                    `Please contact support or choose a different type.`;
                console.error(
                    `[Upload] ❌ DB CHECK constraint failed for resource_type "${resourceType}".\n` +
                    `         The value is not in the allowed list on the "resources" table.\n` +
                    `         Fix: run the following in your Supabase SQL editor and add "${resourceType}" to the list:\n\n` +
                    `         ALTER TABLE resources DROP CONSTRAINT resources_resource_type_check;\n` +
                    `         ALTER TABLE resources ADD CONSTRAINT resources_resource_type_check\n` +
                    `           CHECK (resource_type IN ('midterm exam', 'final exam', 'report/essay', 'final year project', 'lecture note', 'assignment', 'other'));\n\n` +
                    `         Supabase error:`, resourceError
                );
                return { success: false, error: userFacingMessage };
            }

            console.error(
                `[Upload] ❌ Resource insert failed (code: ${resourceError.code}):\n`,
                resourceError
            );
            return { success: false, error: resourceError.message };
        }

        const resourceId = resourceData.id;
        console.log('Resource created with ID:', resourceId);

        // -- Final year projects: upload all files, extract FIRST FILE ONLY for LLM verification --
        if (skipExtraction) {
            console.log(`[Upload] FYP detected — uploading all files, extracting first file only for verification.`);

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                try {
                    const fileExt = file.name.split('.').pop().toLowerCase();
                    const fileType = fileExt === 'pdf' ? 'pdf' : 'image';
                    const fileName = `${Date.now()}_${Math.random()}_${file.name}`;

                    const { error: fileError } = await supabase.storage.from('resources').upload(fileName, file);
                    if (fileError) { console.error('File upload error:', fileError); continue; }

                    const { data: { publicUrl: fileUrl } } = supabase.storage.from('resources').getPublicUrl(fileName);

                    const { data: fileRef, error: fileRefError } = await supabase
                        .from('resource_files')
                        .insert({ resource_id: resourceId, file_url: fileUrl, file_type: fileType })
                        .select().single();

                    if (fileRefError) { console.error('File reference error (FYP):', fileRefError); continue; }

                    // Only trigger extraction on the first file — used purely for verification
                    if (i === 0) {
                        console.log(`[Upload] FYP — triggering extraction on first file: ${fileUrl}`);
                        await triggerExtraction(fileUrl, fileType, resourceId, fileRef.id);
                    }
                } catch (err) {
                    console.error('Error processing file (FYP):', err);
                }
            }

            // Read extracted text from DB — trim to first ~500 words for LLM
            const { data: fypExtractedFiles } = await supabase
                .from('resource_files')
                .select('extracted_text')
                .eq('resource_id', resourceId)
                .not('extracted_text', 'is', null)
                .order('id', { ascending: true })
                .limit(1);

            const fypRawText = fypExtractedFiles?.[0]?.extracted_text?.trim() || '';
            console.log(`[Upload] FYP extracted text length: ${fypRawText.length} characters`);

            if (!fypRawText) {
                console.warn('[Upload] FYP — no text extracted, rejecting upload.');
                await supabase.from('resources').delete().eq('id', resourceId);
                return {
                    success: false,
                    error: 'We were unable to extract text from your document. Please ensure the file is a readable PDF or clear image and try again.'
                };
            }

            // Limit to first 500 words before sending to LLM
            const fypTextForValidation = fypRawText.split(/\s+/).slice(0, 500).join(' ');
            console.log(`[Upload] FYP — running LLM validation on first 500 words (${fypTextForValidation.split(/\s+/).length} words)...`);

            const fypValidation = await validateResourceWithLLM({
                extractedText: fypTextForValidation,
                resourceType,
                title,
                courseCode,
                year,
                instructor,
                department
            });

            console.log('[Upload] FYP validation result:', fypValidation);

            if (!fypValidation.valid) {
                console.warn('[Upload] FYP rejected by LLM — rolling back resource:', resourceId);
                await supabase.from('resources').delete().eq('id', resourceId);
                return {
                    success: false,
                    error: `Upload rejected: ${fypValidation.reason}`
                };
            }

            console.log('[Upload] FYP passed validation');

            // Award points
            const { data: profileData } = await supabase
                .from('profiles').select('points').eq('id', session.user.id).single();

            const currentPoints = profileData?.points || 0;
            const pointsToAdd = uploadPointsMap[resourceType] || 20;

            const { error: pointsError } = await supabase
                .from('profiles').update({ points: currentPoints + pointsToAdd }).eq('id', session.user.id);

            if (!pointsError) setPoints(currentPoints + pointsToAdd);

            return {
                success: true,
                data: resourceData,
                pointsEarned: pointsToAdd,
                filesUploaded: files.length,
                extractionStats: { successful: 1, failed: 0, total: 1, fypVerificationOnly: true }
            };
        }


        // ── For all other types: upload files + extract text ──────────────────
        const uploadedFiles = [];
        const extractionResults = [];

        for (const file of files) {
            try {
                const fileExt = file.name.split('.').pop().toLowerCase();
                const fileType = fileExt === 'pdf' ? 'pdf' : 'image';
                const fileName = `${Date.now()}_${Math.random()}_${file.name}`;

                console.log(`Uploading file: ${file.name} (${fileType})`);

                const { error: fileError } = await supabase.storage.from('resources').upload(fileName, file);
                if (fileError) { console.error('File upload error:', fileError); continue; }

                const { data: { publicUrl: fileUrl } } = supabase.storage.from('resources').getPublicUrl(fileName);

                const { data: fileRef, error: fileRefError } = await supabase
                    .from('resource_files')
                    .insert({ resource_id: resourceId, file_url: fileUrl, file_type: fileType })
                    .select().single();

                if (fileRefError) { console.error('File reference error:', fileRefError); continue; }

                uploadedFiles.push(fileUrl);
                console.log(`File uploaded successfully: ${fileUrl}`);

                const extractionResult = await triggerExtraction(fileUrl, fileType, resourceId, fileRef.id);
                extractionResults.push({ fileUrl, fileId: fileRef.id, ...extractionResult });

            } catch (error) {
                console.error('Error processing file:', error);
            }
        }

        console.log('All extractions completed:', extractionResults);

        // ── Read extracted text from DB (edge function writes there, not to response) ──
        console.log('[Validation] Reading extracted text from resource_files...');
        const { data: extractedFiles, error: extractedFilesError } = await supabase
            .from('resource_files')
            .select('extracted_text')
            .eq('resource_id', resourceId)
            .not('extracted_text', 'is', null)
            .order('id', { ascending: true })
            .limit(1);

        const firstExtractedText = extractedFiles?.[0]?.extracted_text?.trim() || '';
        console.log('[Validation] Extracted text length from DB:', firstExtractedText.length);

        // ── LLM Validation — always required, reject if no text ──────────────
        if (!firstExtractedText) {
            console.warn('[Validation] No extracted text in DB — rejecting upload.');
            await supabase.from('resources').delete().eq('id', resourceId);
            return {
                success: false,
                error: 'We were unable to extract text from your document. Please ensure the file is a readable PDF or clear image and try again.'
            };
        }

        console.log('[Validation] Running LLM validation...');
        const validation = await validateResourceWithLLM({
            extractedText: firstExtractedText,
            resourceType,
            title,
            courseCode,
            year,
            instructor,
            department
        });

        console.log('[Validation] Result:', validation);

        if (!validation.valid) {
            console.warn('[Validation] Rejected — rolling back resource:', resourceId);
            await supabase.from('resources').delete().eq('id', resourceId);
            return {
                success: false,
                error: `Upload rejected: ${validation.reason}`
            };
        }

        console.log('[Validation] ✅ Resource passed validation');

        // ── Award points ──────────────────────────────────────────────────────
        const { data: profileData } = await supabase
            .from('profiles').select('points').eq('id', session.user.id).single();

        const currentPoints = profileData?.points || 0;
        const pointsToAdd = uploadPointsMap[resourceType] || 20;

        const { error: pointsError } = await supabase
            .from('profiles').update({ points: currentPoints + pointsToAdd }).eq('id', session.user.id);

        if (!pointsError) setPoints(currentPoints + pointsToAdd);

        const successfulExtractions = extractionResults.filter(r => r.success).length;
        const failedExtractions = extractionResults.filter(r => !r.success).length;

        return {
            success: true,
            data: resourceData,
            pointsEarned: pointsToAdd,
            filesUploaded: uploadedFiles.length,
            extractionStats: {
                successful: successfulExtractions,
                failed: failedExtractions,
                total: extractionResults.length
            },
            extractionResults
        };
    };

    const value = {
        uploadResource,
        searchResources,
        unlockResource,
        fetchAllResources,
        fetchQuestions,
        postQuestion,
        postAnswer,
        upvoteAnswer,
        upvoteQuestion,
        deleteQuestion,
        deleteAnswer,
        followUser,
        unfollowUser,
        checkIfFollowing,
        retriggerExtraction,
        unlockedResources,
        loading,
        unlockPointsMap
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