'use client'
import React, { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Loader2, MessageCircle } from 'lucide-react'
import ConfirmDeleteModal from './ConfirmCommentDeleteModal'
import { usePost } from '@/context/PostContext'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import CommentCard from './CommentCard'
import { useAuth } from '@/context/AuthContext'

const AddCommentModal = ({ comments = [], whose_post, postid }) => {
    const { addComment, isAddingComment, deleteComment } = usePost()
    const { userDetails } = useAuth()

    const [content, setContent] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [commentToDelete, setCommentToDelete] = useState(null)

    const commentCount = useMemo(() => comments.length || 0, [comments])

    const handleDeleteClick = useCallback((comment) => {
        setCommentToDelete(comment)
        setIsModalOpen(true)
    }, [])

    const handleConfirmDelete = useCallback(() => {
        if (commentToDelete) {
            deleteComment(whose_post, postid, commentToDelete.commentId)
            setIsModalOpen(false)
            setCommentToDelete(null)
        }
    }, [commentToDelete, deleteComment, whose_post, postid])

    const handleInputChange = useCallback((e) => {
        setContent(e.target.value)
    }, [])

    const onSubmit = useCallback(async () => {
        const trimmed = content.trim()
        if (!trimmed) return

        await addComment(postid, whose_post, trimmed)
        setContent('')

        // send notification to post owner if not commenting on own post
        if (whose_post !== userDetails.username) {
            try {
                await fetch(`${import.meta.env.VITE_HOME_ROUTE}/api/user/add-notification`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: whose_post,
                        type: 'comment',
                        sender: userDetails.username,
                    }),
                })
            } catch (error) {
                console.error('Failed to send comment notification:', error)
            }
        }
    }, [content, addComment, postid, whose_post, userDetails.username])

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') onSubmit()
    }, [onSubmit])

    const renderedComments = useMemo(() => {
        if (comments.length === 0) {
            return (
                <div className="text-gray-500 text-center">
                    No comments yet. Be the first to comment!
                </div>
            )
        }
        return comments.map((comment) => (
            <CommentCard
                key={comment.commentId}
                comment={comment}
                onDelete={handleDeleteClick}
            />
        ))
    }, [comments, handleDeleteClick])

    return (
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <div className="flex items-center gap-1 cursor-pointer">
                        <MessageCircle />
                        <div className="text-[1.1rem]">{commentCount}</div>
                    </div>
                </DialogTrigger>

                <DialogContent
                    className="sm:max-w-[425px]"
                    aria-describedby="comment-dialog-description"
                >
                    <DialogHeader>
                        <VisuallyHidden.Root>
                            <DialogTitle>Comment on Post</DialogTitle>
                        </VisuallyHidden.Root>
                        <VisuallyHidden.Root>
                            <DialogDescription id="comment-dialog-description">
                                Add a comment to the post.
                            </DialogDescription>
                        </VisuallyHidden.Root>
                    </DialogHeader>

                    <Input
                        value={content}
                        placeholder="Comment"
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                    />

                    <Button
                        disabled={isAddingComment || !content.trim()}
                        onClick={onSubmit}
                    >
                        {isAddingComment ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Please Wait
                            </>
                        ) : 'Add'}
                    </Button>

                    <div className="flex flex-col gap-4 pr-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {renderedComments}
                    </div>

                    {commentToDelete && (
                        <ConfirmDeleteModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            onConfirm={handleConfirmDelete}
                            commentor={commentToDelete.commentor}
                            timestamp={commentToDelete.timestamp}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddCommentModal
