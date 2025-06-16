import { useToast } from "@/components/ui/use-toast"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { createContext, useContext, useEffect, useState } from "react"
import { generateShortUniqueId } from "@/helpers/unique-id"
import { storage } from "@/firebaseConfig"
import axios from "axios"


// fetches all stories (not particular user's story)
const GET_STORIES_URL = `${import.meta.env.VITE_STORY_URL}/get-stories`
const POST_STORIES_URL = `${import.meta.env.VITE_STORY_URL}/post-story`
const DELETE_STORY_URL = `${import.meta.env.VITE_STORY_URL}/delete-story`

const VITE_CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME
const VITE_CLOUD_API_KEY = import.meta.env.VITE_CLOUD_API_KEY
const VITE_CLOUD_API_SECRET = import.meta.env.VITE_CLOUD_API_SECRET
const VITE_CLOUD_PRESET = import.meta.env.VITE_CLOUD_PRESET


const StoryContext = createContext()

export const StoryProvider = ({ children }) => {

    const { toast } = useToast()

    const [isStoryAdding, setIsStoryAdding] = useState(false)
    const [isStoryDeleting, setIsStoryDeleting] = useState(false)
    const [isLoadingStories, setIsLoadingStories] = useState(false)
    const [stories, setStories] = useState([])

    // Upload Image
    const uploadImage = async (file, username, storyid) => {
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('upload_preset', VITE_CLOUD_PRESET)
            formData.append('folder', `snappy/stories/${username}`)
            formData.append('public_id', storyid)


            // // console.log('this is cloudinary call')
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${VITE_CLOUD_NAME}/image/upload`,
                formData
            )

            // // console.log('this is cloudinary url: ', response.data.secure_url)
            return response.data.secure_url

        } catch (error) {
            // // // console.error('Error uploading image to Cloudinary:', error)
            throw new Error('Image upload failed')
        }
    }

    // Delete Image
    const deleteImage = async (username, storyid) => {
        try {
            const public_id = `snappy/${username}/stories/${storyid}`
            const timestamp = Math.round(new Date().getTime() / 1000)
            const signatureString = `public_id=${public_id}&timestamp=${timestamp}${VITE_CLOUD_API_SECRET}`
            const signature = CryptoJS.SHA1(signatureString).toString()

            const formData = new FormData()
            formData.append('public_id', public_id)
            formData.append('timestamp', timestamp)
            formData.append('signature', signature)
            formData.append('api_key', VITE_CLOUD_API_KEY)

            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${VITE_CLOUD_NAME}/image/destroy`,
                formData
            )

            if (response.data.result === 'ok') {
                // // // console.log(`Image ${public_id} deleted successfully`)
                return true
            } else {
                // // // console.error(`Failed to delete image ${public_id}:`, response.data)
                return false
            }
        } catch (error) {
            // // // console.error('Error deleting image from Cloudinary:', error)
            throw new Error('Image deletion failed')
        }
    }

    // Fetch Image
    const fetchImage = (username, storyid) => {
        try {
            const url = `https://res.cloudinary.com/${VITE_CLOUD_NAME}/image/upload/v1/snappy/${username}/stories/${storyid}`
            return url
        } catch (error) {
            // // // console.error('Error fetching image from Cloudinary:', error)
            throw new Error('Image fetch failed')
        }
    }


    // Fetch Stories
    const fetchStories = async (username) => {
        setIsLoadingStories(true)
        try {
            const response = await fetch(GET_STORIES_URL)
            const data = await response.json()

            if (data.success) {
                setStories(data.stories)
            } else {
            }
        } catch (error) {
            // throw new Error('Error fetching stories')
        } finally{
            setIsLoadingStories(false)
        }
    }

    // Add Story
    const addStory = async (username, file) => {
        try {
            let storyid = generateShortUniqueId()
            const imageUrl = await uploadImage(file, username, storyid)
            const timestamp = new Date().toISOString()

            const response = await fetch(POST_STORIES_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, storyid, imageUrl, timestamp })
            })

            const data = await response.json()
            if (data.success) {
                await fetchStories()
            } else {
                throw new Error('Failed to add story')
            }
        } catch (error) {
            // // // console.error('Error adding story:', error)
            throw new Error('Error adding story')
        } finally{
            
        }
    }

    // Delete Story
    const deleteStory = async (username, storyid) => {
        try {
            await deleteImage(username, storyid)

            const response = await fetch(DELETE_STORY_URL, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, storyid })
            })

            const data = await response.json()
            if (data.success) {
                // // // console.log('Story deleted successfully')
            } else {
                throw new Error('Failed to delete story')
            }
        } catch (error) {
            // // // console.error('Error deleting story:', error)
            throw new Error('Error deleting story')
        }
    }

    useEffect(() => {
        fetchStories()
    }, [])

    return (
        <StoryContext.Provider value={{ addStory, deleteStory, isStoryAdding, isStoryDeleting, isLoadingStories, stories }}>
            {children}
        </StoryContext.Provider>
    )
}

export const useStory = () => {
    const context = useContext(StoryContext)
    if (!context) {
        // console.error('App must be wrapped by story context')
    }
    return context
}