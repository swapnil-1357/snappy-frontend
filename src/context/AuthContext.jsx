'use client'
import { useToast } from "@/components/ui/use-toast"
import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth"
import { createContext, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { GoogleAuthProvider, sendEmailVerification, signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth"
import { auth, storage } from "../firebaseConfig"
import UsernameModal from "@/components/UsernameModal"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import Loader from "@/components/Loader"
import axios from "axios"


const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [isAuthLoading, setIsAuthLoading] = useState(true)
    const [user, setUser] = useState(null)
    const [savedUser, setSavedUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isEmailVerified, setIsEmailVerified] = useState(false)
    const [userDetails, setUserDetails] = useState(null)
    const [showUsernameModal, setShowUsernameModal] = useState(false)
    const [defaultName, setDefaultName] = useState('')
    const [defaultUsername, setDefaultUsername] = useState('')

    const { toast } = useToast()
    const navigate = useNavigate()

    const handleUserProfileUpdate = (data) => {
        setUser(data)
    }

    const signIn = async (email, password) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_AUTH_URL}/signin`,
                { email, password },
                { withCredentials: true }
            )
            console.log('this is our response signin: ', res)
            if (!res.data?.success) {
                toast({
                    title: 'Error',
                    description: res.data?.message || 'Something wrong',
                    variant: 'destructive'
                })
            }

            const user = res.data?.message.user
            console.log('signin user: ', user)

            if (user?.isVerified && !user.isVerified) {
                toast({
                    title: "Email Not Verified",
                    description: "Please verify your email before signing in.",
                    variant: "destructive",
                })
                setIsAuthenticated(false)
                setIsEmailVerified(false)
                setUser(null)
                return { success: false, emailVerified: false, user: null }
            }

            setUser(user)
            setIsAuthenticated(true)
            setIsEmailVerified(user.isVerified)

            localStorage.setItem('snappyUser', JSON.stringify(user))

            toast({
                title: "Welcome",
                description: "You're successfully signed in.",
                variant: "success"
            })

            return { success: true, emailVerified: user.isVerified, user }

        } catch (err) {
            // Handle authentication errors
            handleAuthError(err)
            // console.log(err)

            toast({
                title: 'Signin Failed',
                description: err.message || 'There was an error signing in.',
                variant: 'destructive'
            })

            return { success: false, error: err.message }
        }
    }

    const signUp = async (name, username, email, password) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_AUTH_URL}/signup`,
                { name, username, email, password },
                { withCredentials: true }
            )
            console.log(res)
            if (!res.data.success) {
                toast({
                    title: 'Error',
                    description: res.data?.message || 'Something wrong',
                    variant: 'destructive'
                })
            }

            const savedUser = res.data?.message?.user
            // const sessionToken = res.data?.message?.token
            setSavedUser(savedUser)
            setUserDetails(savedUser)
            localStorage.setItem('snappyUser', JSON.stringify(savedUser))

            // const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            // const user = userCredential.user
            // await sendEmailVerification(user)

            // const SAVE_USER_URL = `${import.meta.env.VITE_USER_URL}/save-user-in-mongo`
            // await fetch(SAVE_USER_URL, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ name, username, email, isVerified: user.emailVerified })
            // })

            toast({
                title: "Account Created",
                description: "Verification email sent. Please verify your email.",
                variant: "default",
            })

            // setUser(savedUser)
            // setIsAuthenticated(true)
            // setIsEmailVerified(savedUser.isVerified)

        } catch (err) {
            handleAuthError(err)
        }
    }

    const signInUsingGoogle = async () => {
        const provider = new GoogleAuthProvider()
        try {
            const result = await signInWithPopup(auth, provider)
            const user = result.user
            setUser(user)
            setIsAuthenticated(true)
            setIsEmailVerified(user.emailVerified)
            setDefaultName(user.displayName || '')

            const response = await fetch(`${import.meta.env.VITE_USER_URL}/get-user-by-email?email=${user.email}`, {
                method: 'GET',
                credentials: 'include',
            })
            const data = await response.json()

            if (data.success) {
                setUserDetails(data.user)
                toast({
                    title: 'Welcome back!',
                    description: 'You have successfully signed in.',
                    variant: 'default',
                })
            } else {
                setShowUsernameModal(true)
            }
        } catch (err) {
            toast({
                title: 'Google Sign-In Failed',
                description: 'An error occurred during Google sign-in. Please try again.',
                variant: 'destructive',
            })
            setUser(null)
            setIsAuthenticated(false)
            setIsEmailVerified(false)
        }
    }

    const logOut = () => {
        // signOut(auth).then(() => {
        //     setUser(null)
        //     setIsAuthenticated(false)
        //     setIsEmailVerified(false)
        //     navigate("/sign-in")
        //     toast({
        //         title: "Logged Out",
        //         description: "You have been successfully logged out.",
        //         variant: "default",
        //     })
        // }).catch((err) => {
        //     toast({
        //         title: "Log Out Error",
        //         description: "Failed to log out. Please try again.",
        //         variant: "destructive",
        //     })
        //     setUser(null)
        //     setIsAuthenticated(false)
        //     setIsEmailVerified(false)
        // })
    }

    const uploadGooglePhoto = async (username, photoURL) => {
        try {
            const response = await fetch(photoURL, {
                method: 'GET',
                credentials: 'include',
            })
            const blob = await response.blob()
            const storageRef = ref(storage, `snappy/avatars/${username}`)

            await uploadBytes(storageRef, blob, 'data_url')

            const url = await getDownloadURL(storageRef)
            return url
        } catch (error) {
            // // console.error('Error uploading avatar:', error)
            return null
        }
    }

    const handleSaveUser = async (userData) => {
        try {
            const url = await uploadGooglePhoto(userData.username, user.photoURL)

            if (!url) {
                toast({
                    title: 'Try with JPG or JPEG or PNG image file',
                    description: 'Failed to save user details.',
                    variant: 'destructive',
                })
                return
            }

            const SAVE_USER_URL = `${import.meta.env.VITE_USER_URL}/save-user-in-mongo`

            const response = await fetch(SAVE_USER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: userData.name,
                    username: userData.username,
                    email: user.email,
                    isVerified: user.isVerified,
                    avatar: url
                }),
            })

            if (response.ok) {
                toast({
                    title: 'Account Created',
                    description: 'Your account has been created successfully.',
                    variant: 'default',
                })
                setUserDetails({
                    name: userData.name,
                    username: userData.username,
                    email: user.email,
                    isVerified: user.isVerified,
                    user_avatar: userData.avatar
                })

                setShowUsernameModal(false)
            } else {
                const errorData = await response.json()
                toast({
                    title: 'Save Error',
                    description: errorData.message || 'Failed to save user details.',
                    variant: 'destructive',
                })
                setUser(null)
                setIsAuthenticated(false)
                setIsEmailVerified(false)
                setUserDetails({})
            }
        } catch (err) {
            toast({
                title: 'Error',
                description: 'An error occurred while saving your details. Please try again.',
                variant: 'destructive',
            })
        }
    }


    const handleAuthError = (err) => {
        if (err.code === 'auth/wrong-password') {
            toast({
                title: "Incorrect Password",
                description: "The password you entered is incorrect.",
                variant: "destructive",
            })
        } else if (err.code === 'auth/user-not-found') {
            toast({
                title: "User Not Found",
                description: "No user found with this email address.",
                variant: "destructive",
            })
        } else {
            toast({
                title: "Auth Error",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive",
            })
        }
    }

    useEffect(() => {
        const snappyUser = localStorage.getItem('snappyUser')
        if (snappyUser) {
            try {
                const parsedUser = JSON.parse(snappyUser)
                setUser(parsedUser)
            } catch (err) {
                console.error('Invalid JSON in snappyUser:', err)
                localStorage.removeItem('snappyUser')
            }
        }
    }, [])

    useEffect(() => {
        console.log('useEffect user:', user)
        if (user?.isVerified) {
            navigate('/posts')
        } else {
            navigate('/')
        }
    }, [user])

    // if (isAuthLoading) {
    //     return <Loader />
    // }

    return (
        <AuthContext.Provider value={{
            savedUser, user, userDetails, isAuthenticated, isEmailVerified,
            signInUsingGoogle, logOut, signIn, signUp, isAuthLoading, setUser
        }}>
            {children}
            {showUsernameModal && (
                <UsernameModal
                    showModal={showUsernameModal}
                    onClose={() => setShowUsernameModal(false)}
                    onSave={handleSaveUser}
                    defaultName={defaultName}
                    defaultUsername={defaultUsername}
                    userEmail={user.email}
                />
            )}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}