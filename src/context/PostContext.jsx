'use client'
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { useToast } from "@/components/ui/use-toast"
import { storage } from "@/firebaseConfig"
import { generateShortUniqueId } from "@/helpers/unique-id"
import { useAuth } from "./AuthContext"
import axios from "axios"
import CryptoJS from "crypto-js"

const GET_POSTS_URL = `${import.meta.env.VITE_POST_URL}/get-posts`
const ADD_POST_URL = `${import.meta.env.VITE_POST_URL}/add-post`
const DELETE_POST_URL = `${import.meta.env.VITE_POST_URL}/delete-post`
const ADD_COMMENT_URL = `${import.meta.env.VITE_POST_URL}/add-comment`
const DELETE_COMMENT_URL = `${import.meta.env.VITE_POST_URL}/delete-comment`
const TOGGLE_LIKE_URL = `${import.meta.env.VITE_POST_URL}/toggle-like`

const VITE_CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME
const VITE_CLOUD_API_KEY = import.meta.env.VITE_CLOUD_API_KEY
const VITE_CLOUD_API_SECRET = import.meta.env.VITE_CLOUD_API_SECRET
const VITE_CLOUD_PRESET = import.meta.env.VITE_CLOUD_PRESET

const PostContext = createContext()

const CACHE_DURATION = 300000 // 30 seconds

// Global cache and pending promise map for posts
const postsCache = { data: null, timestamp: 0 }
const postsPromise = { current: null }

export const PostProvider = ({ children }) => {
    const { toast } = useToast()
    const { userDetails } = useAuth()

    const [isPostAdding, setIsPostAdding] = useState(false)
    const [isPostDeleting, setIsPostDeleting] = useState(false)
    const [isLoadingPosts, setIsLoadingPosts] = useState(false)
    const [isAddingComment, setIsAddingComment] = useState(false)
    const [isDeletingComment, setIsDeletingComment] = useState(false)
    const [isLikingPost, setIsLikingPost] = useState(false)
    const [posts, setPosts] = useState([])

    // cloudinary image crud
    const uploadImage = useCallback(async (file, username, postid) => {
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('upload_preset', VITE_CLOUD_PRESET)
            formData.append('folder', `snappy/posts/${username}`)
            formData.append('cloud_name', VITE_CLOUD_NAME)
            formData.append('public_id', postid)

            const isVideo = file.type.startsWith('video/')
            const uploadUrl = `https://api.cloudinary.com/v1_1/${VITE_CLOUD_NAME}/${isVideo ? 'video' : 'image'}/upload`

            const response = await axios.post(uploadUrl, formData)

            return response.data.secure_url
        } catch (error) {
            throw new Error('Media upload failed')
        }
    }, [])
    

    const deleteImage = useCallback(async (username, postid) => {
        try {
            const timestamp = Math.round(new Date().getTime() / 1000)

            // Construct the public_id using the username and postid for post images
            const public_id = `snappy/posts/${username}/${postid}`

            // Create the signature string using the public_id, timestamp, and your Cloudinary API secret
            const signatureString = `public_id=${public_id}&timestamp=${timestamp}${VITE_CLOUD_API_SECRET}`
            const signature = CryptoJS.SHA1(signatureString).toString() // Generates the secure signature

            // Prepare the form data to send to Cloudinary
            const formData = new FormData()
            formData.append('public_id', public_id)
            formData.append('timestamp', timestamp)
            formData.append('signature', signature)
            formData.append('api_key', VITE_CLOUD_API_KEY) // Your Cloudinary API Key

            // Send the delete request to Cloudinary
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${VITE_CLOUD_NAME}/image/destroy`,
                formData
            )

            // Return success result if the deletion is successful
            if (response.data.result === 'ok') {
                // console.log(`Image ${public_id} deleted successfully`)
                return true
            } else {
                // console.error(`Failed to delete image ${public_id}:`, response.data)
                return false
            }
        } catch (error) {
            // console.error('Error deleting image from Cloudinary:', error)
            throw new Error('Image deletion failed')
        }
    }, [])

    const fetchPosts = useCallback(async (force = false) => {
        setIsLoadingPosts(true)
        const now = Date.now()

        // Use cache if not forced and cache is recent
        if (!force && postsCache.data && now - postsCache.timestamp < CACHE_DURATION) {
            setPosts(postsCache.data)
            setIsLoadingPosts(false)
            return
        }

        // If a fetch is already in progress, wait for it
        if (postsPromise.current) {
            const data = await postsPromise.current
            setPosts(data)
            setIsLoadingPosts(false)
            return
        }

        // Otherwise, fetch and cache
        postsPromise.current = (async () => {
            const response = await fetch(GET_POSTS_URL)
            const data = await response.json()
            if (data.success) {
                postsCache.data = data.posts
                postsCache.timestamp = Date.now()
                setPosts(data.posts)
                return data.posts
            }
            return []
        })()

        await postsPromise.current
        postsPromise.current = null
        setIsLoadingPosts(false)
    }, [])

    const addPost = useCallback(async (username, file, caption) => {
        try {
            setIsPostAdding(true)
            const postid = generateShortUniqueId()
            const timestamp = new Date().toISOString()
            const imageUrl = await uploadImage(file, username, postid)
            const response = await fetch(ADD_POST_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, postid, imageUrl, caption, timestamp })
            })
            const data = await response.json()
            if (data.success) {
                toast({
                    title: 'Success',
                    description: 'Post added successfully!',
                    variant: 'default',
                })
                await fetchPosts(true) // Force fresh fetch
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Something went wrong while adding the post',
                variant: 'destructive',
            })
        } finally {
            setIsPostAdding(false)
        }
    }, [uploadImage, toast, fetchPosts])

    const deletePost = useCallback(async (username, postid) => {
        try {
            setIsPostDeleting(true)
            await deleteImage(username, postid)
            const response = await fetch(DELETE_POST_URL, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, postid })
            })
            const data = await response.json()
            if (data.success) {
                toast({
                    title: 'Success',
                    description: 'Post deleted successfully!',
                    variant: 'default',
                })
                await fetchPosts(true) // Force fresh fetch
            }
        } catch (error) {
            console.log('this is error: ', error)
            toast({
                title: 'Error',
                description: 'Something went wrong while deleting the post',
                variant: 'destructive',
            })
        } finally {
            setIsPostDeleting(false)
        }
    }, [deleteImage, toast, fetchPosts])

    const addComment = useCallback(async (postid, post_creator_username, content) => {
        if (!userDetails || !userDetails.username) {
            toast({
                title: 'Authentication Error',
                description: 'You need to be logged in to add a comment.',
                variant: 'destructive',
            })
            return
        }

        if (!content.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Comment cannot be empty.',
                variant: 'destructive',
            })
            return
        }

        if (content.length < 3) {
            toast({
                title: 'Validation Error',
                description: 'Comment is too short. It must be at least 3 characters.',
                variant: 'destructive',
            })
            return
        }

        if (content.length > 100) {
            toast({
                title: 'Validation Error',
                description: 'Comment is too long. It must be under 100 characters.',
                variant: 'destructive',
            })
            return
        }

        try {
            setIsAddingComment(true)

            const newComment = {
                commentId: generateShortUniqueId(),
                commentor: userDetails.username,
                content: content.trim(),
                timestamp: new Date().toISOString(),
            }

            const response = await fetch(ADD_COMMENT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ whose_post: post_creator_username, postid, comment: newComment })
            })

            const data = await response.json()

            if (response.ok && data.success) {
                toast({
                    title: 'Success',
                    description: 'Comment added successfully!',
                    variant: 'default',
                })

                // ✅ update only the affected post's comments
                setPosts(prev =>
                    prev.map(post =>


                        post.postid === postid 
             ? {
                                ...post,
                                comments: [...post.comments, newComment],
                            }
                            : post
                    )
                )
            } else {
                throw new Error(data.message || 'Failed to add comment.')
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message || 'Something went wrong while adding the comment.',
                variant: 'destructive',
            })
        } finally {
            setIsAddingComment(false)
        }
    }, [userDetails, toast, setPosts])


    const deleteComment = useCallback(async (post_creator_username, postid, commentId) => {
        try {
            setIsDeletingComment(true)
            const res = await fetch(DELETE_COMMENT_URL, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ whose_post: post_creator_username, postid, commentId })
            })
            const { success } = await res.json()
            if (success) {
                toast({
                    title: 'Success',
                    description: 'Comment deleted successfully!',
                    variant: 'default',
                })

                // Update comments locally instead of refreshing all posts
                setPosts(prev =>
                    prev.map(post =>
                        post.postid === postid
                            ? {
                                ...post,
                                comments: post.comments.filter(c => c.commentId !== commentId)
                            }
                            : post
                    )
                )
            }
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Something went wrong while deleting the comment',
                variant: 'destructive',
            })
        } finally {
            setIsDeletingComment(false)
        }
    }, [toast, setPosts])

    const toggleLike = useCallback(async (post_creator_username, postid) => {
        try {
            if (!userDetails) return
            setIsLikingPost(true)

            const response = await fetch(TOGGLE_LIKE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ whose_post: post_creator_username, postid, liker: userDetails.username })
            })
            const data = await response.json()

            if (data.success) {
                setPosts(prev =>
                    prev.map(post =>
                        post.postid === postid
                            ? {
                                ...post,
                                likes: post.likes.includes(userDetails.username)
                                    ? post.likes.filter(u => u !== userDetails.username)
                                    : [...post.likes, userDetails.username],
                            }
                            : post
                    )
                )
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Something went wrong while liking the post',
                variant: 'destructive',
            })
        } finally {
            setIsLikingPost(false)
        }
    }, [userDetails, toast, setPosts])


    useEffect(() => {
        fetchPosts()
    }, [fetchPosts])

    return (
        <PostContext.Provider
            value={{
                toggleLike,
                isLikingPost,
                isAddingComment,
                isDeletingComment,
                addComment,
                deleteComment,
                isLoadingPosts,
                posts,
                fetchPosts,
                addPost,
                deletePost,
                isPostAdding,
                isPostDeleting,
                setPosts, // <-- add this
            }}>
            {children}
        </PostContext.Provider>
    )
}

export const usePost = () => {
    const context = useContext(PostContext)
    if (!context) {
        // // // console.error('App must be wrapped by post context')
    }
    return context
}