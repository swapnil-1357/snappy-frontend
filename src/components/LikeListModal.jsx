import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import UserAvatar from "./UserAvatar"
import { Link } from "react-router-dom"

const LikeListModal = ({ isOpen, onClose, likes = [] }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Liked by</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                    {likes.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground">No likes yet.</p>
                    ) : (
                        likes.map((username) => (
                            <Link
                                key={username}
                                to={`/u/${username}`}
                                className="flex items-center gap-3 hover:bg-muted p-2 rounded"
                                onClick={onClose}
                            >
                                <UserAvatar username={username} fallback={username[0]} className="h-8 w-8" />
                                <span>@{username}</span>
                            </Link>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default LikeListModal
