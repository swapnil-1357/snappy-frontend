'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { getDownloadURL, listAll, ref, uploadBytes } from 'firebase/storage'
import { storage } from '@/firebaseConfig'
import { toast } from '@/components/ui/use-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from './AuthContext'
import axios from 'axios'
import { generateShortUniqueId } from '@/helpers/unique-id'


const VITE_CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME
const VITE_CLOUD_API_KEY = import.meta.env.VITE_CLOUD_API_KEY
const VITE_CLOUD_API_SECRET = import.meta.env.VITE_CLOUD_API_SECRET
const VITE_CLOUD_PRESET = import.meta.env.VITE_CLOUD_PRESET


const UserContext = createContext()


export const UserProvider = ({ children }) => {
    const params = useParams()
    const param_username = params?.username

    const { user, setUser } = useAuth()

    const [userProfile, setUserProfile] = useState({})
    const [userAvatar, setUserAvatar] = useState('')
    const [isLoadingUser, setIsLoadingUser] = useState(false)
    const [isAvatarLoading, setIsAvatarLoading] = useState(false)

    const navigate = useNavigate()

    const fetchUserProfile = async (username) => {
        try {
            if (!username) return

            setIsLoadingUser(true)

            const url = `${import.meta.env.VITE_USER_URL}/get-user-by-username?username=${username}`
            const res = await fetch(url, {
                method: 'GET',
                credentials: 'include',
            })
            const data = await res.json()
            // // console.log('user profile user context called: ', data)

            if (data.success) {
                const userdata = data.user
                setUserProfile({
                    name: userdata.name,
                    username: userdata.username,
                    about: userdata.about || '',
                    email: userdata.email,
                    posts: userdata.posts || [],
                    isVerified: userdata.isVerified,
                    user_avatar: userdata.avatar
                })
            } else {
                toast({
                    title: 'Not Found',
                    description: 'No such user exists',
                    variant: 'destructive',
                })
                navigate('/posts')
            }

        } catch (error) {
            // // // // console.error('Error fetching user profile:', error)
            navigate('/')
        } finally {
            setIsLoadingUser(false)
        }
    }

    const fetchUserByEmail = async (email) => {
        try {
            if (!email) return

            setIsLoadingUser(true)
            const url = `${import.meta.env.VITE_USER_URL}/get-user-by-email?email=${email}`
            const res = await fetch(url, {
                method: 'GET',
                credentials: 'include',
            })
            const data = await res.json()

            if (data.success) {
                const userdata = data.user
                setUserProfile({
                    name: userdata.name,
                    username: userdata.username,
                    about: userdata.about || '',
                    email: userdata.email,
                    posts: userdata.posts || [],
                    stories: userdata.stories || [],
                    isVerified: userdata.isVerified,
                    user_avatar: userdata.avatar
                })
            } else {
                toast({
                    title: 'Not Found',
                    description: 'No such user exists',
                    variant: 'destructive',
                })
                navigate('/posts')
            }

        } catch (error) {
            navigate('/')
        } finally {
            setIsLoadingUser(false)
        }
    }

    const checkIfFileExists = async (username) => {
        try {
            if (!username) return false

            const listRef = ref(storage, 'snappy/avatars/')
            const res = await listAll(listRef)
            return res.items.some((item) => item.name === username)
        } catch (error) {
            // // // console.error('Error listing files:', error)
            return false
        }
    }

    const uploadImage = async (file, public_id) => {
        try {
            const uuid = generateShortUniqueId()
            const formData = new FormData()
            formData.append('file', file)
            formData.append('upload_preset', VITE_CLOUD_PRESET)
            formData.append('folder', 'snappy')
            formData.append('cloud_name', VITE_CLOUD_NAME)
            formData.append('public_id', uuid)
            // formData.append('invalidate', 'true') // Invalidate cached versions

            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${VITE_CLOUD_NAME}/image/upload`,
                formData
            )

            return response.data.secure_url

        } catch (error) {
            // // // console.error('Error uploading image to Cloudinary:', error)
            throw new Error('Image upload failed')
        }
    }

    const deleteImage = async (public_id) => {
        try {
            const timestamp = Math.round(new Date().getTime() / 1000)
            const signatureString = `public_id=${public_id}&timestamp=${timestamp}${VITE_CLOUD_API_SECRET}` // Replace with your API Secret
            const signature = CryptoJS.SHA1(signatureString).toString() // Generates the secure signature

            const formData = new FormData()
            formData.append('public_id', public_id)
            formData.append('timestamp', timestamp)
            formData.append('signature', signature)
            formData.append('api_key', VITE_CLOUD_API_KEY) // Replace with your Cloudinary API Key

            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${VITE_CLOUD_NAME}/image/destroy`,
                formData
            )

            return response.data.result // "ok" indicates success
        } catch (error) {
            // // // console.error('Error deleting image from Cloudinary:', error)
            throw new Error('Image deletion failed')
        }
    }

    const fetchImage = async (username) => {
        try {
            // // console.log('fetch image function called')
            const GET_AVATAR_URL = `${import.meta.env.VITE_USER_URL}/get-avatar`
            const GET_AVATAR_URL_USERNAME = GET_AVATAR_URL + `?username=${username}`
            const response = await fetch(GET_AVATAR_URL_USERNAME, {
                method: 'GET',
                credentials: 'include',
            })
            const data = await response.json()

            // // // console.log('here is the avatar new url: ', data)

            if (data.success) {
                return data.avatar
            }
        } catch (error) {
            // // // console.error('Error fetching image from Cloudinary:', error)
            // throw new Error('Image fetch failed')
        }
    }

    const fetchUserAvatar = async (username) => {
        try {
            if (!username) return

            setIsAvatarLoading(true)
            const img_url = await fetchImage(username)
            setUserAvatar(img_url)

        } catch (error) {
            // // // console.error('Error fetching avatar:', error)
            setUserAvatar(null)
        } finally {
            setIsAvatarLoading(false)
        }
    }

    const editUser = async (updatedUserInfo, file) => {
        try {
            setIsLoadingUser(true)

            let avatarUrl = userAvatar

            if (file) {
                const uploadURL = await uploadImage(file, updatedUserInfo.username)
                avatarUrl = uploadURL
                setUserAvatar(uploadURL)

                // // // console.log('this is the new avatar:', uploadURL)
            }

            const url = `${import.meta.env.VITE_USER_URL}/edit-user`

            // // // // console.log(url, 'calling this url for updating user')

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    username: updatedUserInfo.username,
                    name: updatedUserInfo.name,
                    about: updatedUserInfo.about,
                    avatar: avatarUrl
                })
            })

            const response = await res.json()

            if (response.success) {
                setUserProfile({
                    name: updatedUserInfo.name,
                    username: updatedUserInfo.username,
                    about: updatedUserInfo.about,
                    user_avatar: updatedUserInfo.avatar
                })
                setUser({
                    name: updatedUserInfo.name,
                    username: updatedUserInfo.username,
                    about: updatedUserInfo.about,
                    user_avatar: updatedUserInfo.avatar
                })
                toast({
                    title: 'Profile Updated',
                    description: 'Your profile has been successfully updated.',
                })


            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to update your profile. Please try again.',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            // // // console.error('Error updating user profile:', error)
            toast({
                title: 'Error',
                description: 'An error occurred while updating your profile.',
                variant: 'destructive',
            })
        } finally {
            setIsLoadingUser(false)
        }
    }

    const getAvatar = async (username) => {
        try {
            if (!username) return null

            const url = fetchImage(username)
            return url

        } catch (error) {
            return null
        }
    }

    useEffect(() => {
        if (user && user.email) {
            fetchUserByEmail(user.email)
            // setUserProfile(user)
        }
    }, [user])


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