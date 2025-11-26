'use client'
import React, { useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Plus, X } from 'lucide-react'
import { usePost } from '@/context/PostContext'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { GoogleGenAI } from "@google/genai";



const AddPostModal = () => {
    const [caption, setCaption] = useState('')
    const [captionSuggestions, setCaptionSuggestions] = useState([])
    const [selectedPreview, setSelectedPreview] = useState(null)
    const [file, setFile] = useState(null)
    const [open, setOpen] = useState(false)
    const [isPostAdding, setIsPostAdding] = useState(false)
    const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false)

    const { userDetails } = useAuth()
    const { toast } = useToast()
    const { addPost } = usePost()
    const fileInputRef = useRef(null)

    const handleCaptionChange = (e) => {
        if (e.target.value.length <= 100) {
            setCaption(e.target.value)
        }
    }

    const generateCaptionsFromImage = async (base64Image, mimeType) => {
        const genAI = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY)

        try {
            setIsGeneratingCaptions(true)

            // const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

            const result = await genAI.models.generateContent({
                model:'gemini-2.5-flash',
                contents:
                [
                { text: 'Suggest 4 short and catchy Instagram captions (max 10 words) for this image. Return only the captions without extra text.' },
                {
                    inlineData: {
                        mimeType,
                        data: base64Image.split(',')[1],
                    },
                },
            ],})

            const rawText = result.text || ''
            const lines = rawText.split('\n').map(line => line.trim()).filter(Boolean)

            const filteredCaptions = lines
                .map(line => line.replace(/^\d+[\.\)]?\s*/, '')) // remove numbering
                .filter(line => line.split(/\s+/).length <= 10)

            setCaptionSuggestions(filteredCaptions)
        } catch (error) {
            console.error('Gemini Caption Error:', error)
            setCaptionSuggestions([])

            toast({
                title: 'AI Error',
                description: 'AI is overloaded. Try again later.',
                variant: 'destructive',
            })
        } finally {
            setIsGeneratingCaptions(false)
        }
    }

    const handleFileChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]

            if (selectedFile.size > 10 * 1024 * 1024) {
                toast({
                    title: 'File Size Exceeded',
                    description: 'File size exceeds 10MB. Please select a smaller file.',
                    variant: 'destructive',
                })
                return
            }

            const reader = new FileReader()
            reader.onloadend = async () => {
                setSelectedPreview(reader.result)
                setFile(selectedFile)
                await generateCaptionsFromImage(reader.result, selectedFile.type)
            }
            reader.readAsDataURL(selectedFile)
        }
    }

    const removePreview = () => {
        setSelectedPreview(null)
        setFile(null)
        setCaption('')
        setCaptionSuggestions([])
    }

    const handleSubmit = async () => {
        if (!file || !userDetails) {
            toast({
                title: 'Error',
                description: 'Please select a file and ensure you are logged in',
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

            removePreview()
            setOpen(false)
        } catch (err) {
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
            removePreview()
        }
    }

    const isVideo = file?.type?.startsWith('video')

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
                        Add a caption and upload an image or video (max 10MB)
                    </DialogDescription>
                </DialogHeader>

                <div>
                    <label
                        htmlFor="file-upload"
                        className={`block w-full ${selectedPreview ? 'h-[400px]' : 'h-48'
                            } bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer`}
                    >
                        {selectedPreview ? (
                            <div className="relative w-full h-full">
                                {isVideo ? (
                                    <video
                                        src={selectedPreview}
                                        controls
                                        className="h-full w-full object-cover rounded"
                                    />
                                ) : (
                                    <img
                                        src={selectedPreview}
                                        alt="Selected"
                                        className="h-full w-full object-cover rounded"
                                    />
                                )}
                                <button
                                    type="button"
                                    onClick={removePreview}
                                    className="absolute top-2 right-2 bg-white rounded-full p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-200"
                                >
                                    <X />
                                </button>
                            </div>
                        ) : (
                            <div className="text-gray-500" onClick={handleIconClick}>
                                Select File
                            </div>
                        )}
                    </label>
                    <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="hidden"
                    />
                </div>

                {/* Loader and caption suggestions */}
                {isGeneratingCaptions ? (
                    <div className="flex justify-center items-center my-4">
                        <Loader2 className="animate-spin w-5 h-5 text-gray-500" />
                        <span className="ml-2 text-sm text-gray-500">Generating captions...</span>
                    </div>
                ) : captionSuggestions.length > 0 && (
                    <div className="space-y-2 mt-4">
                        <p className="text-sm text-gray-600">AI Caption Suggestions:</p>
                        <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                            {captionSuggestions.map((sug, idx) => (
                                <Button
                                    key={idx}
                                    variant="outline"
                                    className="w-full text-left whitespace-normal"
                                    onClick={() => setCaption(sug)}
                                >
                                    {sug}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-4">
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
