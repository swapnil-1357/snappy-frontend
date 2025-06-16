'use client'
import React, { useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, X } from 'lucide-react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { FaCirclePlus } from "react-icons/fa6";
import { useStory } from '@/context/StoryContext'




const AddStoryModal = () => {

    const [selectedImage, setSelectedImage] = useState(null)
    const [file, setFile] = useState(null)
    const [open, setOpen] = useState(false)
    const [isStoryAdding, setIsStoryAdding] = useState(false)
    
    const { userDetails } = useAuth()
    const fileInputRef = useRef(null)
    const { toast } = useToast()

    const { addStory } = useStory()


    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            
            const selectedFile = e.target.files[0]

            if (selectedFile.size > 10 * 1024 * 1024) {
                toast({
                    title: 'File Size Exceeded',
                    description: 'File size exceeds 10MB. Please select a smaller image.',
                    variant: 'destructive',
                })
                return
            }
            
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

        setIsStoryAdding(true)
        try {
            await addStory(userDetails.username, file)

            toast({
                title: 'Success',
                description: 'Story uploaded successfully',
                variant: 'default',
            })

            removeImage()
            setOpen(false)

        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to upload story',
                variant: 'destructive',
            })
        } finally {
            setFile(null)
            setIsStoryAdding(false)
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
                <div>
                    <VisuallyHidden>Add Story</VisuallyHidden>
                    <FaCirclePlus className='absolute right-2 bottom-1 text-white border-[3px] rounded-full border-gray-900 h-[30px] w-[30px]' />
                </div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Select Image</DialogTitle>
                    <DialogDescription>
                        <VisuallyHidden>Description for screen readers</VisuallyHidden>
                        Add image of size less than 10MB
                    </DialogDescription>
                </DialogHeader>
                
                <div>
                    <label
                        htmlFor="image-upload"
                        className={`block w-full ${selectedImage ? 'h-[400px]' :  'h-96'} bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer`}
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

                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={isStoryAdding}>
                        {isStoryAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isStoryAdding ? 'Uploading' : 'Post'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default AddStoryModal