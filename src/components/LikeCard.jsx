// LikeCard.jsx
'use client'
import React, { useEffect, useState } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { useUser } from '@/context/UserContext'
import { Link } from 'react-router-dom'



const LikeCard = ({ liker }) => {
    const { getAvatar } = useUser()
    const [avatarURL, setAvatarURL] = useState(null)

    useEffect(() => {
        const fetchAvatar = async () => {
            const url = await getAvatar(liker)
            setAvatarURL(url)
        }
        fetchAvatar()
    }, [liker, getAvatar])

    return (
        <Card className="p-2">
            <div className="flex items-center gap-3">
                <Avatar className='w-10 h-10'>
                    <AvatarImage src={avatarURL} alt={liker} />
                    <AvatarFallback>{liker[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col w-full gap-1">
                    <div>
                        <Link to={`/u/${liker}`}>
                            <strong>@{liker}</strong>
                        </Link> has liked this post.
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default LikeCard
