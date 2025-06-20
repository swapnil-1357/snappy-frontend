import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import Loader from './Loader'

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, user, isAuthLoading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!isAuthLoading) {
            if (!user) {
                navigate('/sign-in')
            } else if (user.emailVerified === false) {
                navigate('/sign-in')
            }
        }
    }, [isAuthLoading, user, navigate])

    // if (isAuthLoading) {
    //     return <Loader />
    // }

    return isAuthenticated ? children : null
}

export default ProtectedRoute