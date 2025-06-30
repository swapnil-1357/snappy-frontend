'use client'
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
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

const avatarCache = {}
const avatarPromiseMap = {}
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

    const fetchUserProfile = useCallback(async (username, force = false) => {
        try {
            if (!username) return
            setIsLoadingUser(true)
            if (!force && userProfileCache[username]) {
                setUserProfile(userProfileCache[username])
                return
            }
            if (userProfilePromiseMap[username]) {
                const cached = await userProfilePromiseMap[username]
                setUserProfile(cached)
                return
            }

            userProfilePromiseMap[username] = (async () => {
                const res = await fetch(`${import.meta.env.VITE_USER_URL}/get-user-by-username?username=${username}`)
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
                    toast({ title: 'Not Found', description: 'No such user exists', variant: 'destructive' })
                    navigate('/posts')
                    return null
                }
            })()

            await userProfilePromiseMap[username]
            delete userProfilePromiseMap[username]
        } catch {
            navigate('/')
        } finally {
            setIsLoadingUser(false)
        }
    }, [navigate])

    const fetchUserByEmail = useCallback(async (email, force = false) => {
        try {
            if (!email) return
            setIsLoadingUser(true)
            if (!force && userProfileCache[email]) {
                setUserProfile(userProfileCache[email])
                return
            }
            if (userProfilePromiseMap[email]) {
                const cached = await userProfilePromiseMap[email]
                setUserProfile(cached)
                return
            }

            userProfilePromiseMap[email] = (async () => {
                const res = await fetch(`${import.meta.env.VITE_USER_URL}/get-user-by-email?email=${email}`)
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
                    toast({ title: 'Not Found', description: 'No such user exists', variant: 'destructive' })
                    navigate('/posts')
                    return null
                }
            })()

            await userProfilePromiseMap[email]
            delete userProfilePromiseMap[email]
        } catch {
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
        } catch {
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
            formData.append('public_id', `avatars/${public_id}`)
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${VITE_CLOUD_NAME}/image/upload`,
                formData
            )
            return response.data.secure_url
        } catch (error) {
            throw new Error('Image upload failed')
        }
    }, [])

    const deleteImage = useCallback(async (public_id) => {
        try {
            const timestamp = Math.round(Date.now() / 1000)
            const signatureString = `public_id=${public_id}&timestamp=${timestamp}${VITE_CLOUD_API_SECRET}`
            const signature = CryptoJS.SHA1(signatureString).toString()
            const formData = new FormData()
            formData.append('public_id', public_id)
            formData.append('timestamp', timestamp)
            formData.append('signature', signature)
            formData.append('api_key', VITE_CLOUD_API_KEY)
            const res = await axios.post(
                `https://api.cloudinary.com/v1_1/${VITE_CLOUD_NAME}/image/destroy`,
                formData
            )
            return res.data.result
        } catch {
            throw new Error('Image deletion failed')
        }
    }, [])

    const fetchImage = useCallback(async (username) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_USER_URL}/get-avatar?username=${username}`)
            const data = await res.json()
            return data.success ? data.avatar : null
        } catch {
            return null
        }
    }, [])

    const getAvatar = useCallback(async (username) => {
        if (!username) return null
        if (avatarCache[username]) return avatarCache[username]
        if (avatarPromiseMap[username]) return await avatarPromiseMap[username]

        avatarPromiseMap[username] = (async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_USER_URL}/get-avatar?username=${username}&t=${Date.now()}`)
                const data = await res.json()
                if (data.success) {
                    avatarCache[username] = data.avatar
                    return data.avatar
                }
            } catch { }
            return null
        })()

        const url = await avatarPromiseMap[username]
        delete avatarPromiseMap[username]
        return url
    }, [])

    const fetchUserAvatar = useCallback(async (username) => {
        if (!username) return
        setIsAvatarLoading(true)
        try {
            const img_url = await getAvatar(username)
            setUserAvatar(img_url)
        } catch {
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

            const res = await fetch(`${import.meta.env.VITE_USER_URL}/edit-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: updatedUserInfo.username,
                    name: updatedUserInfo.name,
                    about: updatedUserInfo.about,
                    avatar: avatarUrl
                })
            })

            const data = await res.json()

            if (data.success) {
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
                if (updatedUserInfo.email) userProfileCache[updatedUserInfo.email] = updatedProfile
                avatarCache[updatedUserInfo.username] = cacheBustedAvatarUrl
                setUserAvatar(cacheBustedAvatarUrl)

                if (posts && setPosts) {
                    setPosts(posts.map(post =>
                        post.username === updatedUserInfo.username
                            ? { ...post, name: updatedUserInfo.name, user_avatar: cacheBustedAvatarUrl }
                            : post
                    ))
                }

                setTimeout(async () => {
                    if (fetchPosts) await fetchPosts(true)
                }, 800)

                toast({ title: 'Profile Updated', description: 'Your profile has been successfully updated.' })
                if (typeof callback === 'function') callback(null, updatedProfile)
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to update your profile. Please try again.',
                    variant: 'destructive',
                })
                if (typeof callback === 'function') callback(new Error('Failed to update'))
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'An error occurred while updating your profile.',
                variant: 'destructive',
            })
            if (typeof callback === 'function') callback(error)
        } finally {
            setIsLoadingUser(false)
        }
    }, [userAvatar, uploadImage, fetchPosts, posts, setPosts])

    useEffect(() => {
        if (user?.email) {
            fetchUserByEmail(user.email)
        }
    }, [user, fetchUserByEmail])

    const contextValue = useMemo(() => ({
        user,
        userProfile,
        userAvatar,
        isLoadingUser,
        isAvatarLoading,
        fetchUserProfile,
        fetchUserAvatar,
        editUser,
        getAvatar,
        fetchImage
    }), [
        user,
        userProfile,
        userAvatar,
        isLoadingUser,
        isAvatarLoading,
        fetchUserProfile,
        fetchUserAvatar,
        editUser,
        getAvatar,
        fetchImage
    ])

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => {
    const context = useContext(UserContext)
    if (!context) throw new Error('useUser must be used within a UserProvider')
    return context
}
