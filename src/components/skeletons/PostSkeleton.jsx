import React from 'react'
import { Skeleton } from '../ui/skeleton'
import { Card } from '../ui/card'



const PostSkeleton = () => {
    return (
        <Card className="w-[350px] p-5">
            <div className='flex flex-row justify-between'>
                <div className='flex gap-3 items-center'>
                    <Skeleton className='h-10 w-10 rounded-full' />

                    <div className='flex flex-col gap-1'>
                        <div>
                            <Skeleton className='h-6 w-[120px]' />
                        </div>
                        <div>
                            <Skeleton className='h-3 w-[80px]' />
                        </div>
                    </div>

                </div>
            </div>

            <div>
                <Card className='mt-2'>
                    <Skeleton className='h-[300px] w-full' />
                </Card>
                <div className='flex justify-between mt-3 items-center text-2xl'>

                    <div className='flex items-center gap-4'>

                        <div className='flex items-center gap-1 cursor-pointer'>
                            <Skeleton className='h-8 w-8 rounded-full' />
                            <Skeleton className='h-8 w-8 rounded-full' />
                        </div>
                    </div>

                    <div className='cursor-pointer'>
                        <Skeleton className='h-8 w-8 rounded-full' />
                    </div>
                </div>
                <div className='flex justify-end text-xs my-2'>
                    <Skeleton className='h-3 w-[80px]' />
                </div>
                <div>
                    <Skeleton className='h-6 w-full' />
                </div>
            </div>
        </Card>
    )
}

export default PostSkeleton