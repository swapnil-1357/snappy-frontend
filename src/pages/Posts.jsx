'use client'
import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import AddPostModal from '@/components/AddPostModal'
import PostCard from '@/components/PostCard'
import PostsSkeleton from '@/components/skeletons/PostsSkeleton'
import Navbar from '@/components/Navbar'
import { usePost } from '@/context/PostContext'
import Stories from '@/components/Stories'



const Posts = () => {
    const { posts, isLoadingPosts } = usePost()
    const [searchQuery, setSearchQuery] = useState('')

    const filteredPosts = posts.filter(post =>
        post.username.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className='flex flex-col gap-4'>

            <div>
                <Navbar />
                <Stories />
            </div>

            {isLoadingPosts && <PostsSkeleton />}
            {!isLoadingPosts && <div className='flex gap-5 flex-col justify-center items-center'>
                <div className='flex items-center justify-between gap-8 px-[1.1rem]'>
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
