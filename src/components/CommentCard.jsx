// CommentCard.jsx
'use client'
import React, { useEffect, useState } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Trash2 } from 'lucide-react'
import { timeAgo } from '@/helpers/time-ago'
import { useUser } from '@/context/UserContext'
import { Link } from 'react-router-dom'



const CommentCard = ({ comment, onDelete }) => {
    const { getAvatar } = useUser()
    const [avatarURL, setAvatarURL] = useState(null)

    useEffect(() => {
        const fetchAvatar = async () => {
            const url = await getAvatar(comment.commentor)
            setAvatarURL(url)
        }
        fetchAvatar()
    }, [comment.commentor, getAvatar])

    return (
        <Card className="p-2">
            <div className="flex items-start gap-3">
                <Avatar className='w-10 h-10'>
                    <AvatarImage src={avatarURL} alt={comment.commentor} />
                    <AvatarFallback>{comment.commentor[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col w-full">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Link className="text-sm text-blue-500" to={`/u/${comment.commentor}`}>
                                @{comment.commentor}
                            </Link>
                            <div className="text-gray-500 text-xs">
                                {timeAgo(new Date(comment.timestamp))}
                            </div>
                        </div>
                        <div
                            className='border-2 p-1 rounded-md cursor-pointer hover:bg-red-500 hover:text-white'
                            onClick={() => onDelete(comment)}
                        >
                            <Trash2 className='h-5 w-5' />
                        </div>
                    </div>
                    <div>
                        {comment.content}
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default CommentCard
