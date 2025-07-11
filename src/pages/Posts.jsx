'use client'
import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import AddPostModal from '@/components/AddPostModal'
import PostCard from '@/components/PostCard'
import PostsSkeleton from '@/components/skeletons/PostsSkeleton'
import Navbar from '@/components/Navbar'
import Stories from '@/components/Stories'
import { usePost } from '@/context/PostContext'
import { useHybridSearch } from '@/hooks/useHybridSearch'
import { useDebounce } from '@/hooks/useDebounce'

const Posts = () => {
    const { posts, isLoadingPosts } = usePost()
    const [searchQuery, setSearchQuery] = useState('')
    const debouncedSearch = useDebounce(searchQuery, 300)
    const [filteredPosts, setFilteredPosts] = useState([])
    const { search, isReady } = useHybridSearch(posts, 'username')

    useEffect(() => {
        if (!debouncedSearch.trim()) {
            setFilteredPosts(posts)
        } else if (isReady) {
            search(debouncedSearch).then(setFilteredPosts)
        }
    }, [debouncedSearch, posts, isReady])

    return (
        <div className='flex flex-col gap-4'>
            <div>
                <Navbar />
                <Stories />
            </div>

            {isLoadingPosts && <PostsSkeleton />}
            {!isLoadingPosts && (
                <div className='flex gap-5 flex-col justify-center items-center'>
                    <div className='flex items-center justify-between gap-8 px-[1.1rem]'>
                        <Input
                            placeholder='Search Posts by Username'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <AddPostModal />
                    </div>
                    <div className='flex gap-5 flex-col justify-center items-center '>
                        {filteredPosts.length === 0 && <div>No posts found.</div>}
                        {filteredPosts.map((post) => (
                            <PostCard key={post.postid} post={post} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Posts
