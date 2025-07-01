'use client'
import React, { useEffect, useState, useMemo } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Trash2 } from 'lucide-react'
import { timeAgo } from '@/helpers/time-ago'
import { useUser } from '@/context/UserContext'
import { useAuth } from '@/context/AuthContext'
import { Link } from 'react-router-dom'

const CommentCard = ({ comment, onDelete }) => {
    const { fetchImage } = useUser()
    const { userDetails } = useAuth()
    const [avatarURL, setAvatarURL] = useState(null)

    useEffect(() => {
        let isMounted = true
        const fetchAvatar = async () => {
            try {
                const url = await fetchImage(comment.commentor)
                if (isMounted) setAvatarURL(url)
            } catch (_) { }
        }
        fetchAvatar()
        return () => { isMounted = false }
    }, [comment.commentor, fetchImage])

    const isCommentOwner = useMemo(() => {
        return (
            userDetails?.username?.toLowerCase() ===
            comment.commentor?.replace(/^@/, '').toLowerCase()
        )
    }, [userDetails?.username, comment.commentor])

    return (
        <Card className="p-2">
            <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                    <AvatarImage src={avatarURL} alt={comment.commentor} />
                    <AvatarFallback>
                        {comment.commentor?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col w-full">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Link to={`/u/${comment.commentor}`} className="text-sm text-blue-700">
                                @{comment.commentor}
                            </Link>
                            <div className="text-gray-500 text-xs">
                                {timeAgo(new Date(comment.timestamp))}
                            </div>
                        </div>
                        {isCommentOwner && (
                            <button
                                onClick={() => onDelete(comment)}
                                className="border-2 p-1 rounded-md hover:bg-red-500 hover:text-white"
                                aria-label="Delete comment"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                    <div className="text-sm mt-1">{comment.content}</div>
                </div>
            </div>
        </Card>
    )
}

export default React.memo(CommentCard)