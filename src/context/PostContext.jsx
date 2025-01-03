'use client'
import { createContext, useContext, useEffect, useState } from "react"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { useToast } from "@/components/ui/use-toast"
import { storage } from "@/firebaseConfig"
import { uniqueId } from "@/helpers/unique-id"
import { useAuth } from "./AuthContext"


const GET_POSTS_URL = `${import.meta.env.VITE_POST_URL}/get-posts`
const ADD_POST_URL = `${import.meta.env.VITE_POST_URL}/add-post`
const DELETE_POST_URL = `${import.meta.env.VITE_POST_URL}/delete-post`
const ADD_COMMENT_URL = `${import.meta.env.VITE_POST_URL}/add-comment`
const DELETE_COMMENT_URL = `${import.meta.env.VITE_POST_URL}/delete-comment`
const TOGGLE_LIKE_URL = `${import.meta.env.VITE_POST_URL}/toggle-like`


const PostContext = createContext()

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


    const fetchPosts = async () => {
        try {
            setIsLoadingPosts(true)

            const response = await fetch(GET_POSTS_URL)
            const data = await response.json()

            if (data.success) {
                setPosts(data.posts)
            }

        } catch (error) {
            // toast({
            //     title: 'Error',
            //     description: 'Failed to fetch posts',
            //     variant: 'destructive',
            // })
        } finally {
            setIsLoadingPosts(false)
        }
    }

    const addPost = async (username, file, caption) => {
        try {
            setIsPostAdding(true)

            const postid = uniqueId
            const storageRef = ref(storage, `snappy/${username}/posts/${postid}`)
            await uploadBytes(storageRef, file)

            const imageUrl = await getDownloadURL(storageRef)
            const timestamp = new Date().toISOString()

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
                await fetchPosts()
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
    }

    const deletePost = async (username, postid) => {
        try {
            setIsPostDeleting(true)

            const storageRef = ref(storage, `snappy/${username}/posts/${postid}`)
            await deleteObject(storageRef)

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
                await fetchPosts()
            }

        } catch (error) {
            toast({
                title: 'Error',
                description: 'Something went wrong while deleting the post',
                variant: 'destructive',
            })
        } finally {
            setIsPostDeleting(false)
        }
    }

    const addComment = async (postid, post_creator_username, content) => {
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
                description: 'Comment is too long. It must be under 500 characters.',
                variant: 'destructive',
            })
            return
        }
    
        try {
            setIsAddingComment(true)
    
            const comment = {
                commentId: uniqueId,
                commentor: userDetails.username,
                content: content.trim(),
                timestamp: new Date().toISOString(),
            }
    
            const response = await fetch(ADD_COMMENT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ whose_post: post_creator_username, postid, comment })
            })
    
            const data = await response.json()
    
            if (response.ok && data.success) {
                toast({
                    title: 'Success',
                    description: 'Comment added successfully!',
                    variant: 'default',
                })
    
                await fetchPosts()
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
    }
    
    const deleteComment = async (post_creator_username, postid, commentId) => {
        try {
            console.log(post_creator_username, postid, commentId)
            setIsDeletingComment(true)

            const response = await fetch(DELETE_COMMENT_URL, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ whose_post: post_creator_username, postid, commentId })
            })

            const data = await response.json()

            if (data.success) {
                toast({
                    title: 'Success',
                    description: 'Comment deleted successfully!',
                    variant: 'default',
                })
                await fetchPosts()
            }

        } catch (error) {
            console.log(error)
            toast({
                title: 'Error',
                description: 'Something went wrong while deleting the comment',
                variant: 'destructive',
            })
        } finally {
            setIsDeletingComment(false)
        }
    }

    const toggleLike = async (post_creator_username, postid) => {
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
                await fetchPosts()
            }

        } catch (error) {
            console.log(error)

            toast({
                title: 'Error',
                description: 'Something went wrong while liking the post',
                variant: 'destructive',
            })
        } finally {
            setIsLikingPost(false)
        }
    }

    useEffect(() => {
        fetchPosts()
    }, [])

    return (
        <PostContext.Provider value={{ toggleLike, isLikingPost, isAddingComment, isDeletingComment, addComment, deleteComment, isLoadingPosts, posts, fetchPosts, addPost, deletePost, isPostAdding, isPostDeleting }}>
            {children}
        </PostContext.Provider>
    )
}

export const usePost = () => {
    const context = useContext(PostContext)
    if (!context) {
        console.error('App must be wrapped by post context')
    }
    return context
}
