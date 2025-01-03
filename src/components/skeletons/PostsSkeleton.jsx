'use client'
import React from 'react'
import { Card } from '../ui/card'
import { Skeleton } from '../ui/skeleton'
import PostSkeleton from './PostSkeleton'



const PostsSkeleton = () => {
    return (
        <div className='flex flex-col gap-4'>

            <div className='flex gap-5 flex-col justify-center items-center'>

                <div className='flex items-center justify-between gap-10'>

                    <Skeleton className='h-10 w-[200px]' />
                    <Skeleton className='h-10 w-[100px]' />

                </div>

                <div className='flex gap-5 flex-col justify-center items-center w-full'>

                    {[...Array(3)].map((_, index) => (
                        <PostSkeleton key={index} />
                    ))}

                </div>
            </div>
        </div>
    )
}

export default PostsSkeleton
