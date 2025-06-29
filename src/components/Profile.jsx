import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import EditProfileModal from './EditProfileModal';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import PostCard from '@/components/PostCard';
import { useAuth } from '@/context/AuthContext';
import UserAvatar from './UserAvatar'; // <-- import your reusable avatar component

const Profile = ({ userProfile, userAvatar, posts, param_username }) => {
    const { user, userDetails } = useAuth()

    const [isEditModalOpen, setEditModalOpen] = useState(false)
    const [selectedPostType, setSelectedPostType] = useState('Own Posts')
    const [filteredPosts, setFilteredPosts] = useState([])

    useEffect(() => {
        if (selectedPostType === 'Own Posts') {
            setFilteredPosts(posts.filter(post => post.username === param_username))
        } else if (selectedPostType === 'Liked Posts') {
            setFilteredPosts(posts.filter(post => post.likes && post.likes.includes(param_username)))
        }
    }, [selectedPostType, posts, param_username])

    // Make sure userProfile is the profile for param_username, not the logged-in user
    // If you fetch userProfile, do it based on param_username
    // Example:
    // useEffect(() => {
    //   fetchUserProfile(param_username)
    // }, [param_username])

    return (
        <div className='flex md:flex-row flex-col gap-14'>
            <Card className='flex flex-col gap-5 p-5 justify-center items-center h-fit'>
                <div>
                    <UserAvatar
                        username={userProfile?.username}
                        fallback={userProfile?.username ? userProfile.username[0] : 'U'}
                        className='h-[12rem] w-[12rem]'
                    />
                </div>

                <div className='flex flex-col gap-2 text-center items-center justify-center max-w-[400px]'>
                    <div className='text-xl font-bold'>{userProfile?.name}</div>
                    <div className='text-sm text-gray-400'>@{userProfile?.username}</div>
                    <div>{userProfile?.about}</div>
                    <div className='mt-4 flex gap-2'>
                        {user && userDetails.email === user.email && userDetails.username === userProfile.username && (
                            <Button onClick={() => setEditModalOpen(true)}>Edit Profile</Button>
                        )}
                        {user && userProfile.username !== userDetails.username && <a href={`mailto:${userProfile.email}?subject=Hello&body=Hi there!`}>
                            <Button>
                                Send Mail
                            </Button>
                        </a>}
                    </div>
                </div>
            </Card>

            <div className='flex flex-col gap-4 w-full'>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='outline' className='self-start'>
                            {selectedPostType}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>View Posts</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setSelectedPostType('Own Posts')}>
                            Own Posts
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedPostType('Liked Posts')}>
                            Liked Posts
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className='overflow-y-auto max-h-[450px] pr-2 custom-scrollbar'>
                    <div className='flex flex-col gap-4'>
                        {filteredPosts.length === 0 ? (
                            <div>No posts found.</div>
                        ) : (
                            filteredPosts.map(post => <PostCard key={post.postid} post={post} />)
                        )}
                    </div>
                </div>
            </div>

            <EditProfileModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} />
        </div>
    )
}

export default Profile
