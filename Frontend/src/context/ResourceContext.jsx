import { createContext, useContext } from "react";
import supabase from "../config/supabaseClient";
import { UserAuth } from "./AuthContext";

const ResourceContext = createContext();

export const ResourceContextProvider = ({ children }) => {
    const { session } = UserAuth();

    const uploadResource = async ({ title, description, courseCode, year, instructor, resourceType, file }) => {
    
        // 1. upload file to storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${file.name}`
        const { data: fileData, error: fileError } = await supabase.storage
            .from('resources')
            .upload(fileName, file)

        if (fileError) {
            console.error('file upload error: ', fileError)
            return { success: false, error: fileError }
        }

        // 2. get public url
        const { data: { publicUrl } } = supabase.storage
            .from('resources')
            .getPublicUrl(fileName)

        // 3. save to database
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

        return { success: true, data }
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