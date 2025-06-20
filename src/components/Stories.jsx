import React, { useEffect, useRef, useState } from 'react'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogDescription, DialogTitle } from '@/components/ui/dialog'

import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Pagination } from 'swiper/modules'
import { Autoplay, Navigation } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/pagination'

import '../swiper.css'
import { useUser } from '@/context/UserContext'
import AddStoryModal from './AddStoryModal'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useStory } from '@/context/StoryContext'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from './ThemeProvider'
import Loader from './Loader'
import { toast } from './ui/use-toast'
import { Link, useNavigate } from 'react-router-dom'
import StoriesSkeleton from './skeletons/StoriesSkeleton'



const Stories = () => {
    const { theme } = useTheme()

    const { userProfile } = useUser()
    const { userDetails, isAuthLoading, user } = useAuth()
    const { stories, isLoadingStories } = useStory()

    const [openAddStory, setOpenAddStory] = useState(false)
    const [openDialog, setOpenDialog] = useState(false)

    const [selectedStories, setSelectedStories] = useState([])
    const [avatars, setAvatars] = useState({})
    const [selectedUser, setSelectedUser] = useState({})
    const [storyNumber, setStoryNumber] = useState(1)

    const { fetchImage } = useUser()
    const navigate = useNavigate()


    // if (isAuthLoading) {
    //     return <Loader />
    // }

    // if (!user) {
    //     navigate('/sign-in')
    //     return null
    // }

    // if (!user.isVerified) {
    //     navigate('/sign-in')
    //     return null
    // }


    const fetchAvatar = async (username) => {
        if (!avatars[username]) {
            const url = await fetchImage(username)
            setAvatars((prev) => ({ ...prev, [username]: url }))
        }
    }

    const progressCircle = useRef(null)
    const progressContent = useRef(null)

    const onAutoplayTimeLeft = (s, time, progress) => {
        if (progressCircle.current) {
            progressCircle.current.style.setProperty('--progress', 1 - progress)
        }
        if (progressContent.current) {
            progressContent.current.textContent = `${Math.ceil(time / 1000)}s`
        }
    }

    const sortedStories = (() => {
        const currentUserStory = stories.find(story => story.username === user?.username)
        const otherStories = stories.filter(story => story.username !== user?.username)
        return currentUserStory ? [currentUserStory, ...otherStories] : otherStories
    })()


    const handleDialogOpen = (story) => {
        setSelectedUser({
            'username': story.username,
            'name': story.name,
            'avatar': story.avatar
        })
        setSelectedStories(story.stories)
        setOpenDialog(true)
    }

    const handleSlideChange = (swiper) => {
        setStoryNumber(swiper.activeIndex + 1)
    }

    useEffect(() => {
        sortedStories.forEach(story => {
            fetchAvatar(story.username)
        })
    }, [sortedStories])


    return (
        <>
            <div className='flex gap-4 justify-center items-center w-[400px] p-3 m-auto'>
                {isLoadingStories ? <StoriesSkeleton /> : (<Swiper
                    slidesPerView={3.5}
                    spaceBetween={5}
                    freeMode={true}
                    pagination={{ clickable: true }}
                    modules={[FreeMode, Pagination]}
                    className="mySwiper"
                >
                    {/* Current user's story or add story button */}
                    <SwiperSlide key="user-profile">
                        {user && user.username && sortedStories.some(story => story.username === user.username) ? (
                            <>
                                <div
                                    className='border-[0.2rem] border-red-400 rounded-full cursor-pointer'
                                    onClick={() => handleDialogOpen(sortedStories.find(story => story.username === user.username))}
                                >
                                    <Avatar className='h-[80px] w-[80px]'>
                                        {user && user.username && <AvatarImage src={avatars[user.username] || fetchAvatar(user.username) || ''} alt="User Avatar" />}
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                </div>
                                <AddStoryModal open={openAddStory} onOpenChange={setOpenAddStory} />
                            </>
                        ) : (
                            <div
                                className='border-[0.2rem] border-gray-400 rounded-full cursor-pointer'
                                onClick={() => setOpenDialog(true)}
                            >
                                <Avatar className='h-[80px] w-[80px]'>
                                    {user && user.username && <AvatarImage src={avatars[user.username] || fetchAvatar(user.username) || ''} alt="User Avatar" />}
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>

                                <AddStoryModal open={openAddStory} onOpenChange={setOpenAddStory} />
                            </div>
                        )}
                    </SwiperSlide>

                    {/* Other users' stories */}
                    {user && user.username && sortedStories
                        .filter(story => story.username !== user.username)
                        .map((story, index) => (
                            <SwiperSlide key={`story-${index}`}>
                                <div
                                    className='border-[0.2rem] border-red-600 rounded-full cursor-pointer'
                                    onClick={() => handleDialogOpen(story)}
                                >
                                    <Avatar className='h-[80px] w-[80px]'>
                                        <AvatarImage src={avatars[story.username] || ''} alt={`Avatar ${index + 1}`} />
                                        <AvatarFallback>{story.username[0]}</AvatarFallback>
                                    </Avatar>
                                </div>
                            </SwiperSlide>
                        ))}
                </Swiper>)}
            </div>

            {/* Modal for viewing stories */}
            {selectedStories && selectedStories?.length > 0 && <Dialog
                open={openDialog}
                onOpenChange={(isOpen) => {
                    setOpenDialog(isOpen)
                    if (!isOpen) {
                        // Clear states to avoid showing old data
                        setSelectedStories([])
                        setSelectedUser({})
                        setStoryNumber(1)
                    }
                }}
            >
                <DialogContent className='outline-none border-none'>
                    <DialogHeader>
                        <DialogTitle>
                            <VisuallyHidden>Viewing {selectedUser.name}'s Stories</VisuallyHidden>
                        </DialogTitle>
                        <DialogDescription>
                            {selectedStories?.length > 0 && (
                                <div className='flex justify-between'>
                                    <div className='flex gap-3 items-center'>
                                        <Avatar className='h-10 w-10'>
                                            <AvatarImage src={selectedUser.avatar} alt={selectedUser.username} />
                                            <AvatarFallback>U</AvatarFallback>
                                        </Avatar>
                                        <div className='flex flex-col'>
                                            <div className={`text-lg ${(theme === 'dark') ? 'text-white' : 'text-black'} `}>{selectedUser.name}</div>
                                            <Link to={`/u/${selectedUser.username}`} className='text-xs text-blue-400 mt-[-4px] underline w-fit'>
                                                @{selectedUser.username}
                                            </Link>
                                        </div>
                                    </div>

                                    <div className='pt-4 mt-2'>{storyNumber}/{selectedStories?.length}</div>
                                </div>
                            )}
                            <VisuallyHidden>Description for screen readers</VisuallyHidden>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="swiper-container">
                        <Swiper
                            spaceBetween={30}
                            centeredSlides={true}
                            loop={false}
                            autoplay={{
                                delay: 5000,
                                disableOnInteraction: false,
                            }}
                            pagination={{ clickable: true }}
                            navigation={true}
                            modules={[Autoplay, Pagination, Navigation]}
                            onAutoplayTimeLeft={onAutoplayTimeLeft}
                            className="mySwiper"
                            onSlideChange={handleSlideChange}
                        >
                            {selectedStories.map((userStory, index) => (
                                <SwiperSlide key={`user-story-${index}`}>
                                    <div className="relative w-full h-full">
                                        <img
                                            className="swiper-image"
                                            src={userStory.url}
                                            alt={`Story ${index + 1}`}
                                        />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        <div className="autoplay-progress" slot="container-end">
                            <svg viewBox="0 0 48 48" ref={progressCircle}>
                                <circle cx="24" cy="24" r="20"></circle>
                            </svg>
                        </div>
                    </div>

                </DialogContent>
            </Dialog>}
        </>
    )
}

export default Stories