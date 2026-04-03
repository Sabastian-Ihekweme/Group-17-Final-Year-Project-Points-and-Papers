import { createContext, useContext } from "react";
import supabase from "../config/supabaseClient";
import { UserAuth } from "./AuthContext";

const ResourceContext = createContext();

export const ResourceContextProvider = ({ children }) => {
    const { session, setPoints } = UserAuth()

    const pointsMap = {
        'midterm exam': 50,
        'final exam': 70,
        'report/essay': 20
    }

    const uploadResource = async ({ title, description, courseCode, year, instructor, resourceType, file }) => {

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
            })

        if (error) {
            console.error('database insert error: ', error)
            return { success: false, error }
        }

        // 5. update points in database + context
        const pointsToAdd = pointsMap[resourceType]

        const { error: pointsError } = await supabase.rpc('increment_points', {
            user_id: session.user.id,
            points_to_add: pointsToAdd
        })

        if (!pointsError) {
            setPoints(prev => prev + pointsToAdd)
        }

        return { success: true, data, pointsEarned: pointsToAdd }
    }

    return (
        <ResourceContext.Provider value={{ uploadResource }}>
            {children}
        </ResourceContext.Provider>
    )
}

export const UseResource = () => {
    return useContext(ResourceContext);
}