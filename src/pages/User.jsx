'use client'
import Navbar from '@/components/Navbar'
import Profile from '@/components/Profile'
import React, { useState, useEffect, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { useUser } from '@/context/UserContext'
import { usePost } from '@/context/PostContext'
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton'


const User = () => {

    const { param_username } = useParams()
    const { userProfile, userAvatar, fetchUserProfile, fetchUserAvatar, isLoadingUser, isAvatarLoading } = useUser()
    const { posts } = usePost()
    const [filteredPosts, setFilteredPosts] = useState([])

    useEffect(() => {
        if (param_username) {
            fetchUserProfile(param_username)
            fetchUserAvatar(param_username)
        }
    }, [param_username])

    useEffect(() => {
        const myPosts = posts.filter(post => post.username === param_username)
        setFilteredPosts(myPosts)
    }, [posts, param_username])


    return (
        <div className=''>
            <div className='flex flex-col'>
                <Navbar />
                <div className='flex items-center justify-center'>
                    {
                        (isLoadingUser || isAvatarLoading || !userProfile)
                            ? <ProfileSkeleton />
                            : <Profile
                                userProfile={userProfile}
                                userAvatar={userAvatar}
                                posts={posts}
                                param_username={param_username}
                            />
                    }

                </div>
            </div>
        </div>
    )
}

export default User
