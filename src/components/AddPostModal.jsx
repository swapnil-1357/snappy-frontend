'use client'
import React, { useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext' // Firebase AuthContext
import { useToast } from '@/components/ui/use-toast'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Plus, X } from 'lucide-react'
import { usePost } from '@/context/PostContext'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'




const AddPostModal = () => {
    const [caption, setCaption] = useState('')
    const [selectedImage, setSelectedImage] = useState(null)
    const [file, setFile] = useState(null)
    const [open, setOpen] = useState(false)
    const [isPostAdding, setIsPostAdding] = useState(false)
    const { userDetails } = useAuth()
    const fileInputRef = useRef(null)
    const { toast } = useToast()
    const { addPost } = usePost()

    const handleCaptionChange = (e) => {
        if (e.target.value.length <= 100) {
            setCaption(e.target.value)
        }
    }

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            const reader = new FileReader()
            reader.onloadend = () => {
                setSelectedImage(reader.result)
            }
            reader.readAsDataURL(e.target.files[0])
        }
    }

    const removeImage = () => {
        setSelectedImage(null)
        setFile(null)
        setCaption('')
    }

    const handleSubmit = async () => {
        if (!file || !userDetails) {
            toast({
                title: 'Error',
                description: 'Please select an image and ensure you are logged in',
                variant: 'destructive',
            })
            setOpen(false)
            return
        }

        setIsPostAdding(true)
        try {
            await addPost(userDetails.username, file, caption)

            toast({
                title: 'Success',
                description: 'Post uploaded successfully',
                variant: 'default',
            })

            removeImage()
            setOpen(false)

        } catch (err) {
            console.log(err)
            toast({
                title: 'Error',
                description: 'Failed to upload post',
                variant: 'destructive',
            })
        } finally {
            setIsPostAdding(false)
        }
    }

    const handleIconClick = () => {
        fileInputRef.current?.click()
    }

    const handleOpenChange = (isOpen) => {
        setOpen(isOpen)
        if (!isOpen) {
            removeImage()
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="default" className="flex gap-2">
                    <VisuallyHidden>Add Post</VisuallyHidden>
                    Add Post
                    <Plus />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Post</DialogTitle>
                    <DialogDescription>
                        <VisuallyHidden>Description for screen readers</VisuallyHidden>
                        Add a caption and upload an image for your post
                    </DialogDescription>
                </DialogHeader>
                <div>
                    <label
                        htmlFor="image-upload"
                        className={`block w-full ${selectedImage ? 'h-[400px]' : 'h-48'} bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer`}
                    >
                        {selectedImage ? (
                            <div className="relative w-full h-full">
                                <img
                                    src={selectedImage}
                                    alt="Selected"
                                    className="h-full w-full object-cover rounded"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 bg-white rounded-full p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-200"
                                >
                                    <X />
                                </button>
                            </div>
                        ) : (
                            <div className="text-gray-500" onClick={handleIconClick}>Select Image</div>
                        )}
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                        className="hidden"
                    />
                </div>
                <div>
                    <Input
                        autoComplete="off"
                        id="caption"
                        placeholder="Caption (up to 100 characters)"
                        value={caption}
                        onChange={handleCaptionChange}
                    />
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={isPostAdding}>
                        {isPostAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isPostAdding ? 'Uploading' : 'Post'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default AddPostModal
