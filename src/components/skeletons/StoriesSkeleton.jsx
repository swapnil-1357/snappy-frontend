import React from 'react'
import { Skeleton } from '../ui/skeleton'


const StorySkeleton = () => {
    return (
        <Skeleton className='h-[80px] w-[80px] rounded-full' />
    )
}

const StoriesSkeleton = () => {
    return (
        <>
            {[...Array(4)].map((_, index) => (
                <StorySkeleton key={index} />
            ))}
        </>
    )
}

export default StoriesSkeleton