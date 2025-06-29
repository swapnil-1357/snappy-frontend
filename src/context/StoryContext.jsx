import { useToast } from "@/components/ui/use-toast"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { generateShortUniqueId } from "@/helpers/unique-id"
import { storage } from "@/firebaseConfig"
import axios from "axios"
import CryptoJS from "crypto-js"

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

    // Upload Image to Cloudinary (unsigned, using preset)
    const uploadImage = useCallback(async (file, username, storyid) => {
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('upload_preset', VITE_CLOUD_PRESET)
            formData.append('folder', `snappy/stories/${username}`)
            formData.append('public_id', storyid) // unique per story

            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${VITE_CLOUD_NAME}/image/upload`,
                formData
            )

            return response.data.secure_url
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to upload story image.',
                variant: 'destructive',
            })
            throw new Error('Image upload failed')
        }
    }, [])

    // Delete Image from Cloudinary (signed)
    const deleteImage = useCallback(async (username, storyid) => {
        try {
            const public_id = `snappy/stories/${username}/${storyid}`
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

            return response.data.result === 'ok'
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete story image.',
                variant: 'destructive',
            })
            throw new Error('Image deletion failed')
        }
    }, [])

    // Fetch Stories from backend
    const fetchStories = useCallback(async () => {
        setIsLoadingStories(true)
        try {
            const response = await fetch(GET_STORIES_URL)
            const data = await response.json()
            if (data.success) {
                setStories(data.stories)
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch stories.',
                variant: 'destructive',
            })
        } finally {
            setIsLoadingStories(false)
        }
    }, [])

    // Add Story
    const addStory = useCallback(async (username, file) => {
        setIsStoryAdding(true)
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
                toast({
                    title: 'Story Added',
                    description: 'Your story was added successfully.',
                })
            } else {
                throw new Error('Failed to add story')
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Error adding story.',
                variant: 'destructive',
            })
            throw new Error('Error adding story')
        } finally {
            setIsStoryAdding(false)
        }
    }, [uploadImage, fetchStories])

    // Delete Story
    const deleteStory = useCallback(async (username, storyid) => {
        setIsStoryDeleting(true)
        try {
            await deleteImage(username, storyid)

            const response = await fetch(DELETE_STORY_URL, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, storyid })
            })

            const data = await response.json()
            if (data.success) {
                await fetchStories()
                toast({
                    title: 'Story Deleted',
                    description: 'Your story was deleted successfully.',
                })
            } else {
                throw new Error('Failed to delete story')
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Error deleting story.',
                variant: 'destructive',
            })
            throw new Error('Error deleting story')
        } finally {
            setIsStoryDeleting(false)
        }
    }, [deleteImage, fetchStories])

    useEffect(() => {
        fetchStories()
    }, [fetchStories])

    return (
        <StoryContext.Provider value={{
            addStory,
            deleteStory,
            isStoryAdding,
            isStoryDeleting,
            isLoadingStories,
            stories
        }}>
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