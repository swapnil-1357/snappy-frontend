'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { getDownloadURL, listAll, ref, uploadBytes } from 'firebase/storage'
import { storage } from '@/firebaseConfig'
import { toast } from '@/components/ui/use-toast'
import { useNavigate, useParams } from 'react-router-dom'


const UserContext = createContext()


export const UserProvider = ({ children }) => {
    const params = useParams()
    const param_username = params?.username

    
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
            const res = await fetch(url)
            const data = await res.json()

            if (data.success) {
                const userdata = data.user
                setUserProfile({
                    name: userdata.name,
                    username: userdata.username,
                    about: userdata.about || '',
                    email: userdata.email,
                    posts: userdata.posts || [],
                    isVerified: userdata.isVerified
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
            console.error('Error fetching user profile:', error)
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
            console.error('Error listing files:', error)
            return false
        }
    }

    const fetchUserAvatar = async (username) => {
        try {
            if (!username) return

            setIsAvatarLoading(true)
            const fileExists = await checkIfFileExists(username)

            if (fileExists) {
                const storageRef = ref(storage, `snappy/avatars/${username}`)
                try {
                    const url = await getDownloadURL(storageRef)
                    setUserAvatar(url)
                } catch (error) {
                    console.error('Error fetching avatar:', error)
                    setUserAvatar(null)
                }
            } else {
                setUserAvatar(null)
            }
        } catch (error) {
            console.error('Error fetching avatar:', error)
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
                const storageRef = ref(storage, `snappy/avatars/${updatedUserInfo.username}`)
                await uploadBytes(storageRef, file)
                avatarUrl = await getDownloadURL(storageRef)
                setUserAvatar(avatarUrl)
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
                })
            })

            const response = await res.json()

            if (response.success) {
                setUserProfile({
                    name: updatedUserInfo.name,
                    username: updatedUserInfo.username,
                    about: updatedUserInfo.about,
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
            console.error('Error updating user profile:', error)
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
    
            const storageRef = ref(storage, `snappy/avatars/${username}`)
            if(storageRef){
                const url = await getDownloadURL(storageRef)
                return url
            }else{
                return null
            }
            
        } catch (error) {
            return null
        }
    }

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
