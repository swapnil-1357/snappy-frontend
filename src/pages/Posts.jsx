'use client'
import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import AddPostModal from '@/components/AddPostModal'
import PostCard from '@/components/PostCard'
import PostsSkeleton from '@/components/skeletons/PostsSkeleton'
import Navbar from '@/components/Navbar'
import { usePost } from '@/context/PostContext'



const Posts = () => {
    const { posts, isLoadingPosts } = usePost()
    const [searchQuery, setSearchQuery] = useState('')

    const filteredPosts = posts.filter(post =>
        post.username.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className='flex flex-col gap-4'>
            <Navbar/>
            
            {isLoadingPosts && <PostsSkeleton/>}
            {!isLoadingPosts && <div className='flex gap-5 flex-col justify-center items-center'>
                <div className='flex items-center justify-between gap-10'>
                    <Input
                        placeholder="Search Posts by Username"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <AddPostModal />
                </div>
                <div className='flex gap-5 flex-col justify-center items-center'>
                    {!isLoadingPosts && filteredPosts.length === 0 && <div>No posts found.</div>}
                    {!isLoadingPosts && filteredPosts.map(post => (
                        <PostCard key={post.postid} post={post} />
                    ))}
                </div>
            </div>}
        </div>
    )
}

export default Posts
