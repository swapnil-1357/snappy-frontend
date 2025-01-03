import React from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, commentor, timestamp }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogTrigger asChild>
                {/* <Button onClick={onClose}>Delete</Button> */}
            </DialogTrigger>
            <DialogContent>
                <VisuallyHidden.Root>
                    <h3>Confirmation Dialog</h3>
                </VisuallyHidden.Root>
                <h3 className="text-lg font-semibold">Are you sure you want to delete this comment?</h3>
                <div>Comment by {commentor}</div>
                <div className="mt-4 flex gap-4">
                    <Button onClick={onConfirm} variant="destructive">Yes, Delete</Button>
                    <Button onClick={onClose}>Cancel</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ConfirmDeleteModal
