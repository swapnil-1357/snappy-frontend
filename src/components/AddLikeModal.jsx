'use client'
import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import UserAvatar from './UserAvatar'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'

const AddLikeModal = ({ isOpen, onClose, likes }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[400px] py-10">
                <DialogHeader>
                    <VisuallyHidden.Root>
                        <DialogTitle>People Who Liked This Post</DialogTitle>
                    </VisuallyHidden.Root>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    {likes.length > 0 ? (
                        likes.map((username, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <UserAvatar username={username} fallback={username[0]} className="h-8 w-8" />
                                <span>@{username}</span>
                            </div>
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
