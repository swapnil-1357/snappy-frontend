import React, { useState, useEffect } from 'react'
import { Heart, Send, Trash2 } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardHeader, CardContent, CardDescription } from '@/components/ui/card'
import { usePost } from '@/context/PostContext'
import DeletePostModal from './DeletePostModal'
import AddCommentModal from './AddCommentModal'
import { useAuth } from '@/context/AuthContext'
import { timeAgo } from '@/helpers/time-ago'
import ShareModal from './ShareModal'
import { useUser } from '@/context/UserContext'
import { Skeleton } from './ui/skeleton'
import AddLikeModal from './AddLikeModal'
import { Link } from 'react-router-dom'

const PostCard = ({ post }) => {
    const { user, userDetails } = useAuth()
    const { deletePost, toggleLike } = usePost()
    const { getAvatar } = useUser()
    const [isModalOpen, setModalOpen] = useState(false)
    const [isShareModalOpen, setShareModalOpen] = useState(false)
    // const [liked, setLiked] = useState(false)
    const [avatarURL, setAvatarURL] = useState(null)
    const [imageLoading, setImageLoading] = useState(true)
    const [isLikeModalOpen, setIsLikeModalOpen] = useState(false)

    useEffect(() => {
        const fetchAvatar = async () => {
            const url = await getAvatar(post.username)
            setAvatarURL(url)
        }
        fetchAvatar()
    }, [post.username, getAvatar])

    const liked = post.likes.includes(userDetails?.username);


    const handleDeleteClick = () => {
        setModalOpen(true)
    }

    const handleConfirmDelete = async () => {
        deletePost(post.username, post.postid)
        setModalOpen(false)
    }

    const handleLikeClick = async () => {
        await toggleLike(post.username, post.postid)
    }

    const handleShareClick = () => {
        setShareModalOpen(true)
    }

    const handleImageLoad = () => {
        setImageLoading(false)
    }

    return (
        <div>
            <Card className="w-[350px]">
                <CardHeader className='flex flex-row justify-between'>
                    <div className='flex gap-3 items-center'>
                        <Avatar className='h-10 w-10'>
                            <AvatarImage src={avatarURL} alt={post.username} />
                            <AvatarFallback>{post.username[0]}</AvatarFallback>
                        </Avatar>
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
                    <Card>
                        {imageLoading && (
                            <Skeleton className='h-[300px] w-[300px] rounded-md' />
                        )}
                        <img
                            src={post.imageUrl}
                            alt='Post Image'
                            className='h-full w-full border-2 rounded-md max-h-[300px] max-w-[300px]'
                            onLoad={handleImageLoad}
                        />
                    </Card>
                    <div className='flex justify-between mt-3 items-center text-2xl'>
                        <div className='flex items-center gap-4'>
                            <div className='flex items-center gap-1 cursor-pointer' onClick={() => setIsLikeModalOpen(true)}>
                                <Heart className={`transition-colors duration-300 ${liked ? 'fill-red-500' : ''}`} />
                                <div className='text-[1.1rem]'>{post.likes && post.likes.length}</div>
                            </div>
                            <div>
                                <AddCommentModal comments={post.comments} postid={post.postid} whose_post={post.username} />
                            </div>
                        </div>
                        <div className='cursor-pointer' onClick={handleShareClick}>
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
                url={`/post/${post.postid}`}
            />

            <AddLikeModal
                isOpen={isLikeModalOpen}
                onClose={() => setIsLikeModalOpen(false)}
                likes={post.likes}
                addLike={handleLikeClick}
            />
        </div>
    )
}

export default PostCard
