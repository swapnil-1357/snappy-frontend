'use client'
import React from 'react'
import { Skeleton } from '../ui/skeleton'
import { Card } from '../ui/card'
import PostSkeleton from './PostSkeleton'




const ProfileSkeleton = () => {
    return (
        <div className='flex gap-14'>

            <Card className='flex flex-col gap-5 p-5 justify-center items-center h-fit'>
                
                <div>
                    <Skeleton className='h-[12rem] w-[12rem] rounded-full' />
                </div>

                <div className='flex flex-col gap-2 text-center items-center justify-center max-w-[400px]'>
                    <Skeleton className='h-8 w-[150px]' />
                    <Skeleton className='h-3 w-[100px] mt-1' />
                    <Skeleton className='h-5 w-full mt-2' />
                    <div className='mt-4 flex gap-2'>
                        <Skeleton className='h-10 w-[100px]' />
                        <Skeleton className='h-10 w-[100px]' />
                    </div>
                </div>
            </Card>

            <div className='flex flex-col gap-4 w-full'>
                <Skeleton className='h-10 w-[150px]' />

                <div>
                    <div className='flex flex-col gap-4'>
                        {[...Array(3)].map((_, index) => (
                            <PostSkeleton key={index} />
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default ProfileSkeleton
