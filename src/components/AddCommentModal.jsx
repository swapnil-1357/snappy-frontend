// AddCommentModal.jsx
'use client'
import React, { useState } from 'react'
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

const AddCommentModal = ({ comments, whose_post, postid }) => {
    const { addComment, isAddingComment, deleteComment } = usePost()
    const [content, setContent] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [commentToDelete, setCommentToDelete] = useState(null)

    const handleDeleteClick = (comment) => {
        setCommentToDelete(comment)
        setIsModalOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (commentToDelete) {
            deleteComment(whose_post, postid, commentToDelete.commentId)
            setIsModalOpen(false)
        }
    }

    const onSubmit = () => {
        addComment(postid, whose_post, content)
        setContent('')
    }

    return (
        <div>
            <Dialog className='p-3'>
                <DialogTrigger asChild>
                    <div className='flex items-center gap-1 cursor-pointer'>
                        <MessageCircle />
                        <div className='text-[1.1rem]'>{comments && comments?.length}</div>
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

                    <div className="w-full">
                        <Input
                            value={content}
                            placeholder='Comment'
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                    <Button
                        disabled={isAddingComment || !content.trim()}
                        onClick={onSubmit}
                    >
                        {isAddingComment ? (
                            <><Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please Wait</>
                        ) : ('Add')}
                    </Button>

                    <div className="flex flex-col gap-4 pr-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {comments && comments.length > 0 ? comments.map((comment, index) => (
                            <CommentCard
                                key={index}
                                comment={comment}
                                onDelete={handleDeleteClick}
                            />
                        )) : (
                            <div className="text-gray-500 text-center">No comments yet. Be the first to comment!</div>
                        )}
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
