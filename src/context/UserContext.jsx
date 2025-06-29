'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getDownloadURL, listAll, ref, uploadBytes } from 'firebase/storage'
import { storage } from '@/firebaseConfig'
import { toast } from '@/components/ui/use-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from './AuthContext'
import axios from 'axios'
import { generateShortUniqueId } from '@/helpers/unique-id'
import CryptoJS from 'crypto-js'
import { usePost } from './PostContext'


const VITE_CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME
const VITE_CLOUD_API_KEY = import.meta.env.VITE_CLOUD_API_KEY
const VITE_CLOUD_API_SECRET = import.meta.env.VITE_CLOUD_API_SECRET
const VITE_CLOUD_PRESET = import.meta.env.VITE_CLOUD_PRESET


const UserContext = createContext()

// Global avatar cache and pending promise map
const avatarCache = {}
const avatarPromiseMap = {}

// Global user profile cache and pending promise map
const userProfileCache = {}
const userProfilePromiseMap = {}

export const UserProvider = ({ children }) => {
    const params = useParams()
    const param_username = params?.username

    const { user } = useAuth()

    const [userProfile, setUserProfile] = useState({})
    const [userAvatar, setUserAvatar] = useState('')
    const [isLoadingUser, setIsLoadingUser] = useState(false)
    const [isAvatarLoading, setIsAvatarLoading] = useState(false)

    const navigate = useNavigate()
    const { posts, setPosts, fetchPosts } = usePost()

    // Optimized fetchUserProfile with cache and deduplication
    const fetchUserProfile = useCallback(async (username, force = false) => {
        try {
            if (!username) return

            setIsLoadingUser(true)

            // Use cache if not forced and cache exists
            if (!force && userProfileCache[username]) {
                setUserProfile(userProfileCache[username])
                setIsLoadingUser(false)
                return
            }

            // If a fetch is already in progress, wait for it
            if (userProfilePromiseMap[username]) {
                const cached = await userProfilePromiseMap[username]
                setUserProfile(cached)
                setIsLoadingUser(false)
                return
            }

            // Otherwise, fetch and cache
            userProfilePromiseMap[username] = (async () => {
                const url = `${import.meta.env.VITE_USER_URL}/get-user-by-username?username=${username}`
                const res = await fetch(url)
                const data = await res.json()
                if (data.success) {
                    const userdata = {
                        name: data.user.name,
                        username: data.user.username,
                        about: data.user.about || '',
                        email: data.user.email,
                        posts: data.user.posts || [],
                        isVerified: data.user.isVerified,
                        user_avatar: data.user.avatar
                    }
                    userProfileCache[username] = userdata
                    setUserProfile(userdata)
                    return userdata
                } else {
                    toast({
                        title: 'Not Found',
                        description: 'No such user exists',
                        variant: 'destructive',
                    })
                    navigate('/posts')
                    return null
                }
            })()

            await userProfilePromiseMap[username]
            delete userProfilePromiseMap[username]

        } catch (error) {
            navigate('/')
        } finally {
            setIsLoadingUser(false)
        }
    }, [navigate])

    // Optimized fetchUserByEmail with cache and deduplication
    const fetchUserByEmail = useCallback(async (email, force = false) => {
        try {
            if (!email) return

            setIsLoadingUser(true)

            // Use cache if not forced and cache exists
            if (!force && userProfileCache[email]) {
                setUserProfile(userProfileCache[email])
                setIsLoadingUser(false)
                return
            }

            // If a fetch is already in progress, wait for it
            if (userProfilePromiseMap[email]) {
                const cached = await userProfilePromiseMap[email]
                setUserProfile(cached)
                setIsLoadingUser(false)
                return
            }

            // Otherwise, fetch and cache
            userProfilePromiseMap[email] = (async () => {
                const url = `${import.meta.env.VITE_USER_URL}/get-user-by-email?email=${email}`
                const res = await fetch(url)
                const data = await res.json()
                if (data.success) {
                    const userdata = {
                        name: data.user.name,
                        username: data.user.username,
                        about: data.user.about || '',
                        email: data.user.email,
                        posts: data.user.posts || [],
                        stories: data.user.stories || [],
                        isVerified: data.user.isVerified,
                        user_avatar: data.user.avatar
                    }
                    userProfileCache[email] = userdata
                    setUserProfile(userdata)
                    return userdata
                } else {
                    toast({
                        title: 'Not Found',
                        description: 'No such user exists',
                        variant: 'destructive',
                    })
                    navigate('/posts')
                    return null
                }
            })()

            await userProfilePromiseMap[email]
            delete userProfilePromiseMap[email]

        } catch (error) {
            navigate('/')
        } finally {
            setIsLoadingUser(false)
        }
    }, [navigate])

    const checkIfFileExists = useCallback(async (username) => {
        try {
            if (!username) return false

            const listRef = ref(storage, 'snappy/avatars/')
            const res = await listAll(listRef)
            return res.items.some((item) => item.name === username)
        } catch (error) {
            // // // console.error('Error listing files:', error)
            return false
        }
    }, [])

    const uploadImage = useCallback(async (file, public_id) => {
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('upload_preset', VITE_CLOUD_PRESET)
            formData.append('folder', 'snappy')
            formData.append('cloud_name', VITE_CLOUD_NAME)
            formData.append('public_id', `avatars/${public_id}`) // <-- always the same for each user

            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${VITE_CLOUD_NAME}/image/upload`,
                formData
            )

            return response.data.secure_url

        } catch (error) {
            // console.error('Error uploading image to Cloudinary:', error)
            console.error('Error uploading image to Cloudinary:', error.response?.data || error.message)
            throw new Error('Image upload failed')
        }
    }, [])

    const deleteImage = useCallback(async (public_id) => {
        try {
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

            return response.data.result // "ok" indicates success
        } catch (error) {
            // // // console.error('Error deleting image from Cloudinary:', error)
            throw new Error('Image deletion failed')
        }
    }, [])

    // Only fetch avatar if not cached or pending, and always resolve to a URL or null
    const fetchImage = useCallback(async (username) => {
        try {
            const GET_AVATAR_URL = `${import.meta.env.VITE_USER_URL}/get-avatar`
            const GET_AVATAR_URL_USERNAME = GET_AVATAR_URL + `?username=${username}`
            const response = await fetch(GET_AVATAR_URL_USERNAME)
            const data = await response.json()
            if (data.success) {
                return data.avatar
            }
        } catch (error) {
            // // // console.error('Error fetching image from Cloudinary:', error)
        }
        return null
    }, [user])

    // Optimized getAvatar with deduplication, cache, and cache-busting after edit
    const getAvatar = useCallback(async (username) => {
        if (!username) return null

        // Use cache if available
        if (avatarCache[username]) {
            return avatarCache[username]
        }

        // If a fetch is already in progress, wait for it
        if (avatarPromiseMap[username]) {
            return await avatarPromiseMap[username]
        }

        // Always fetch with cache-busting to avoid stale images
        avatarPromiseMap[username] = (async () => {
            const GET_AVATAR_URL = `${import.meta.env.VITE_USER_URL}/get-avatar?username=${username}&t=${Date.now()}`
            try {
                const response = await fetch(GET_AVATAR_URL)
                const data = await response.json()
                if (data.success) {
                    avatarCache[username] = data.avatar
                    return data.avatar
                }
            } catch (error) {
                // fallback or error handling
            }
            return null
        })()

        const url = await avatarPromiseMap[username]
        delete avatarPromiseMap[username]
        return url
    }, [user])

    // Use this in components to set the avatar state
    const fetchUserAvatar = useCallback(async (username) => {
        try {
            if (!username) return

            setIsAvatarLoading(true)
            const img_url = await getAvatar(username)
            setUserAvatar(img_url)
        } catch (error) {
            setUserAvatar(null)
        } finally {
            setIsAvatarLoading(false)
        }
    }, [getAvatar])

    const editUser = useCallback(async (updatedUserInfo, file, callback) => {
        try {
            setIsLoadingUser(true)

            let avatarUrl = userAvatar

            if (file) {
                const uploadURL = await uploadImage(file, updatedUserInfo.username)
                avatarUrl = uploadURL
                setUserAvatar(uploadURL)
            }

            const url = `${import.meta.env.VITE_USER_URL}/edit-user`

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: updatedUserInfo.username,
                    name: updatedUserInfo.name,
                    about: updatedUserInfo.about,
                    avatar: avatarUrl
                })
            })

            const response = await res.json()

            if (response.success) {
                // Add cache busting to avatar URL
                const cacheBustedAvatarUrl = avatarUrl + '?t=' + Date.now()
                const updatedProfile = {
                    name: updatedUserInfo.name,
                    username: updatedUserInfo.username,
                    about: updatedUserInfo.about,
                    email: updatedUserInfo.email,
                    posts: updatedUserInfo.posts || [],
                    isVerified: updatedUserInfo.isVerified,
                    user_avatar: cacheBustedAvatarUrl
                }
                setUserProfile(updatedProfile)
                userProfileCache[updatedUserInfo.username] = updatedProfile
                if (updatedUserInfo.email) {
                    userProfileCache[updatedUserInfo.email] = updatedProfile
                }
                // Update avatar cache
                avatarCache[updatedUserInfo.username] = cacheBustedAvatarUrl
                setUserAvatar(cacheBustedAvatarUrl)
                // Update posts in frontend
                if (posts && setPosts) {
                    setPosts(posts.map(post =>
                        post.username === updatedUserInfo.username
                            ? { ...post, name: updatedUserInfo.name, user_avatar: cacheBustedAvatarUrl }
                            : post
                    ))
                }
                // Wait for the image to be available on the CDN/storage
                setTimeout(async () => {
                    if (fetchPosts) await fetchPosts(true)
                }, 800) // 800ms delay, adjust as needed
                toast({
                    title: 'Profile Updated',
                    description: 'Your profile has been successfully updated.',
                })
                if (typeof callback === 'function') {
                    callback(null, updatedProfile)
                }
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to update your profile. Please try again.',
                    variant: 'destructive',
                })
                if (typeof callback === 'function') {
                    callback(new Error('Failed to update your profile'))
                }
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'An error occurred while updating your profile.',
                variant: 'destructive',
            })
            if (typeof callback === 'function') {
                callback(error)
            }
        } finally {
            setIsLoadingUser(false)
        }
    }, [userAvatar, uploadImage, fetchPosts, posts, setPosts])

    useEffect(() => {
        if (user && user.email) {
            fetchUserByEmail(user.email)
        }
    }, [user, fetchUserByEmail])

    return (
        <UserContext.Provider
            value={{
                userProfile,
                userAvatar,
                isLoadingUser,
                isAvatarLoading,
                fetchUserProfile,
                fetchUserAvatar,
                editUser,
                getAvatar,
                fetchImage
            }}
        >
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => {
    const context = useContext(UserContext)
    if (!context) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}
