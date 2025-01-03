'use client'
import { useToast } from "@/components/ui/use-toast"
import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth"
import { createContext, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { GoogleAuthProvider, sendEmailVerification, signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth"
import { auth, storage } from "../firebaseConfig"
import UsernameModal from "@/components/UsernameModal"
import { getDownloadURL, ref, uploadBytes, uploadString } from "firebase/storage"



const AuthContext = createContext()



export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isEmailVerified, setIsEmailVerified] = useState(false)
    const [userDetails, setUserDetails] = useState(null)

    const [showUsernameModal, setShowUsernameModal] = useState(false)
    const [defaultName, setDefaultName] = useState('')
    const [defaultUsername, setDefaultUsername] = useState('')

    const { toast } = useToast()
    const navigate = useNavigate()


    const fetchUserDetails = async (email) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_USER_URL}/get-user-by-email?email=${email}`);
            const data = await response.json()

            if (data.success) {
                setUserDetails(data.user)
            } else {
                // toast({
                //     title: "Error fetching user details",
                //     description: data.message || "An error occurred while fetching user details.",
                //     variant: "destructive",
                // })
            }
        } catch (error) {
            toast({
                title: "Fetch Error",
                description: "Failed to fetch user details from the server.",
                variant: "destructive",
            })
        }
    }

    const signIn = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const user = userCredential.user
            setUser(user)
            setIsAuthenticated(true)
            setIsEmailVerified(user.emailVerified)

            // Email verification check
            if (!user.emailVerified) {
                toast({
                    title: "Email Not Verified",
                    description: "Please verify your email before signing in.",
                    variant: "warning",
                })
            }

            return {
                success: true,
                emailVerified: user.emailVerified,
                user,
            }
        } catch (err) {
            // Different error handling based on error code
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
            } else if (err.code === 'auth/too-many-requests') {
                toast({
                    title: "Too Many Attempts",
                    description: "Please try again later.",
                    variant: "destructive",
                })
            } else {
                toast({
                    title: "Sign-In Error",
                    description: "An unexpected error occurred. Please try again.",
                    variant: "destructive",
                })
            }

            return {
                success: false,
                error: err.message,
            }
        }
    }

    const signUp = async (name, username, email, password) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const user = userCredential.user
            await sendEmailVerification(user)

            // Storing user in MongoDB
            const SAVE_USER_URL = `${import.meta.env.VITE_USER_URL}/save-user-in-mongo`
            await fetch(SAVE_USER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    username,
                    email,
                    isVerified: user.emailVerified
                })
            })

            toast({
                title: "Account Created",
                description: "Verification email sent. Please verify your email.",
                variant: "default",
            })

            setUser(user)
            setIsAuthenticated(true)
            setIsEmailVerified(user.emailVerified)

        } catch (err) {
            // Different error handling based on error code
            if (err.code === 'auth/email-already-in-use') {
                toast({
                    title: "Email In Use",
                    description: "This email address is already in use by another account.",
                    variant: "destructive",
                })
            } else if (err.code === 'auth/weak-password') {
                toast({
                    title: "Weak Password",
                    description: "Your password must be at least 6 characters long.",
                    variant: "destructive",
                })
            } else if (err.code === 'auth/invalid-email') {
                toast({
                    title: "Invalid Email",
                    description: "Please enter a valid email address.",
                    variant: "destructive",
                })
            } else {
                toast({
                    title: "Sign-Up Error",
                    description: "An unexpected error occurred. Please try again.",
                    variant: "destructive",
                })
            }
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

            const response = await fetch(`${import.meta.env.VITE_USER_URL}/get-user-by-email?email=${user.email}`)
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

            console.log(user)

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

    const uploadGooglePhoto = async (username, photoURL) => {
        try {
            const response = await fetch(photoURL)
            const blob = await response.blob() 
            const storageRef = ref(storage, `snappy/avatars/${username}`)
            
            await uploadBytes(storageRef, blob, 'data_url')
    
            const url = await getDownloadURL(storageRef)
            return url
        } catch (error) {
            console.error('Error uploading avatar:', error)
            return null
        }
    }

    const handleSaveUser = async (userData) => {
        try {
            const SAVE_USER_URL = `${import.meta.env.VITE_USER_URL}/save-user-in-mongo`

            const response = await fetch(SAVE_USER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: userData.name,
                    username: userData.username,
                    email: user.email,
                    isVerified: user.emailVerified,
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
                    isVerified: user.emailVerified,
                })

                await uploadGooglePhoto(userData.username, user.photoURL)
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

    const logOut = () => {
        signOut(auth)
            .then(() => {
                setUser(null)
                setIsAuthenticated(false)
                setIsEmailVerified(false)
                navigate("/sign-in")
                toast({
                    title: "Logged Out",
                    description: "You have been successfully logged out.",
                    variant: "default",
                })
            })
            .catch((err) => {
                toast({
                    title: "Log Out Error",
                    description: "Failed to log out. Please try again.",
                    variant: "destructive",
                })
                setUser(null)
                setIsAuthenticated(false)
                setIsEmailVerified(false)
            })
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user)
                setIsAuthenticated(true)
                setIsEmailVerified(user.emailVerified)
                await fetchUserDetails(user.email)
            } else {
                setUser(null)
                setIsAuthenticated(false)
                setIsEmailVerified(false)
            }
        })
        return () => unsubscribe()
    }, [])

    return (
        <AuthContext.Provider
            value={{
                user,
                userDetails,
                isAuthenticated,
                isEmailVerified,
                signInUsingGoogle,
                logOut,
                signIn,
                signUp
            }}
        >
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
