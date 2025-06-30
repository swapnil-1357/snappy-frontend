import React, { useState, useRef } from 'react'
import { Heart, Send, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardContent, CardDescription } from '@/components/ui/card'
import { usePost } from '@/context/PostContext'
import DeletePostModal from './DeletePostModal'
import AddCommentModal from './AddCommentModal'
import { useAuth } from '@/context/AuthContext'
import { timeAgo } from '@/helpers/time-ago'
import ShareModal from './ShareModal'
import { Link } from 'react-router-dom'
import { Skeleton } from './ui/skeleton'
import UserAvatar from './UserAvatar'
import LikeListModal from './LikeListModal'

const PostCard = ({ post }) => {
    const { user, userDetails } = useAuth()
    const { deletePost, toggleLike } = usePost()

    const [isModalOpen, setModalOpen] = useState(false)
    const [isShareModalOpen, setShareModalOpen] = useState(false)
    const [imageLoading, setImageLoading] = useState(true)
    const [isLikeModalOpen, setIsLikeModalOpen] = useState(false)
    const [showHeart, setShowHeart] = useState(false)

    const liked = post.likes.includes(userDetails?.username)

    const handleDeleteClick = () => setModalOpen(true)

    const handleConfirmDelete = async () => {
        await deletePost(post.username, post.postid)
        setModalOpen(false)
    }

    const handleLikeClick = async () => {
        await toggleLike(post.username, post.postid)
    }
    const handleLike = async () => {
        try {
            const res = await fetch(`${VITE_HOME_ROUTE}/api/posts/toggle-like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postid: post.postid, username: currentUsername })
            });

            const data = await res.json();

            // If it's a new like, notify the post owner (avoid notifying on unlike)
            if (data.liked && post.username !== currentUsername) {
                await fetch(`${VITE_HOME_ROUTE}/api/user/add-notification`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: post.username,
                        type: 'like',
                        sender: currentUsername,
                    }),
                });
            }

            // update local state...
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };
      

    const handleDoubleClick = async () => {
        if (!liked) {
            setShowHeart(true)
            await toggleLike(post.username, post.postid)
            setTimeout(() => setShowHeart(false), 1000)
        }
    }

    return (
        <div>
            <Card className="w-[380px]">
                <CardHeader className='flex flex-row justify-between'>
                    <div className='flex gap-3 items-center'>
                        <UserAvatar
                            username={post.username}
                            fallback={post.username[0]}
                            className='h-10 w-10'
                        />
                        <div className='flex flex-col'>
                            <div className='text-lg font-bold'>{post.name}</div>
                            <Link to={`/u/${post.username}`} className='text-xs text-blue-400 mt-[-4px] underline w-fit'>
                                @{post.username}
                            </Link>
                        </div>
                    </div>
                    {user && userDetails?.username === post.username && (
                        <div
                            className='p-1 border-2 rounded-md cursor-pointer hover:bg-red-500 hover:text-white'
                            onClick={handleDeleteClick}
                        >
                            <Trash2 />
                        </div>
                    )}
                </CardHeader>

                <CardContent>
                    <div
                        className="relative"
                        onDoubleClick={handleDoubleClick}
                    >
                        {imageLoading && (
                            <Skeleton className='h-[330px] w-[330px] rounded-md' />
                        )}
                        <img
                            src={post.imageUrl}
                            alt='Post'
                            className='h-full w-full border-2 rounded-md max-h-[330px] max-w-[330px]'
                            onLoad={() => setImageLoading(false)}
                        />
                        {showHeart && (
                            <Heart className="absolute inset-0 m-auto w-20 h-20 text-red-500 animate-ping-slow fill-red-500 pointer-events-none" />
                        )}
                    </div>

                    <div className='flex justify-between mt-3 items-center text-2xl'>
                        <div className='flex items-center gap-2'>
                            <div className='flex items-center gap-1 cursor-pointer' onClick={handleLikeClick}>
                                <Heart className={`transition-colors duration-300 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                            </div>
                            <div
                                className="text-[1.1rem] cursor-pointer hover:underline"
                                onClick={() => setIsLikeModalOpen(true)}
                            >
                                {post.likes.length}
                            </div>
                            <AddCommentModal
                                comments={post.comments}
                                postid={post.postid}
                                whose_post={post.username}
                            />
                        </div>
                        <div className='cursor-pointer' onClick={() => setShareModalOpen(true)}>
                            <Send />
                        </div>
                    </div>

                    <div className='flex justify-end text-xs text-gray-400'>
                        {timeAgo(new Date(post.timestamp))}
                    </div>

                    <CardDescription className='text-black dark:text-white'>
                        {post.caption}
                    </CardDescription>
                </CardContent>
            </Card>

            <DeletePostModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Post"
                description="Are you sure you want to delete this post? This action cannot be undone."
            />

            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setShareModalOpen(false)}
                url={`${window.location.origin}/post/${post.postid}`}
            />
            <LikeListModal
                isOpen={isLikeModalOpen}
                onClose={() => setIsLikeModalOpen(false)}
                likes={post.likes}
            />
        </div>
    )
}

export default PostCard
