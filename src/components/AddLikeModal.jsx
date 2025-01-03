'use client'
import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useUser } from '@/context/UserContext'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import LikeCard from './LikeCard'

const AddLikeModal = ({ isOpen, onClose, likes, addLike }) => {
    const { getAvatar } = useUser()

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <VisuallyHidden.Root>
                        <DialogTitle>People Who Liked This Post</DialogTitle>
                    </VisuallyHidden.Root>
                </DialogHeader>

                <button onClick={addLike} className="w-full p-2 bg-red-500 text-white rounded">
                    ❤️ Like
                </button>

                <div className="flex flex-col gap-4">
                    {likes.length > 0 ? (
                        likes.map((username, index) => (
                            <LikeCard key={index} liker={username} />
                        ))
                    ) : (
                        <div className="text-gray-500 text-center">No likes yet.</div>
                    )}
                </div>
                
            </DialogContent>
        </Dialog>
    )
}

export default AddLikeModal
