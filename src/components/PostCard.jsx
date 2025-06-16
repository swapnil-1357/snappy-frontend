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


const GET_AVATAR_URL = `${import.meta.env.VITE_USER_URL}/get-avatar`


const PostCard = ({ post }) => {

    const { user, userDetails } = useAuth()
    const { deletePost, toggleLike } = usePost()
    const [isModalOpen, setModalOpen] = useState(false)
    const [isShareModalOpen, setShareModalOpen] = useState(false)
    const [avatarURL, setAvatarURL] = useState(null)
    const [imageLoading, setImageLoading] = useState(true)
    const [isLikeModalOpen, setIsLikeModalOpen] = useState(false)


    const fetchImage = async (username) => {
        try {
            const GET_AVATAR_URL_USERNAME = GET_AVATAR_URL + `?username=${username}`
            const response = await fetch(GET_AVATAR_URL_USERNAME)
            const data = await response.json()

            if (data.success) {
                setAvatarURL(data.avatar)
            }
        } catch (error) {

        }
    }

    useEffect(() => {
        fetchImage(post.username)
    }, [post.username])

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
            <Card className="w-[380px]">
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
                    <Card className="bg-white">
                        {imageLoading && (
                            <Skeleton className='h-[330px] w-[330px] rounded-md' />
                        )}
                        <img
                            src={post.imageUrl}
                            alt='Post Image'
                            className='h-full w-full border-2 rounded-md max-h-[330px] max-w-[330px]'
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
