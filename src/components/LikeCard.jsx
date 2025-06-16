// LikeCard.jsx
'use client'
import React, { useEffect, useState } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { useUser } from '@/context/UserContext'
import { Link } from 'react-router-dom'



const VITE_CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME


const LikeCard = ({ liker }) => {
    const { fetchImage } = useUser()
    const [avatarURL, setAvatarURL] = useState(null)

    const fetchAvatar = async (username) => {
        try {
            const url = await fetchImage(username)
            setAvatarURL(url)
        } catch (error) {

        }
    }

    useEffect(() => {
        fetchAvatar(liker)
    }, [liker])

    return (
        <Card className="p-1">
            <div className="flex items-center gap-3">
                <Avatar className='w-8 h-8'>
                    <AvatarImage src={avatarURL} alt={liker} />
                    <AvatarFallback>{liker[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col w-full gap-1">
                    <div className='text-sm'>
                        <Link to={`/u/${liker}`} className='text-blue-700'>
                            @{liker}
                        </Link> has liked this post.
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default LikeCard
