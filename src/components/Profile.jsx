import React, { useState, useEffect } from 'react';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar';
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



const Profile = ({ userProfile, userAvatar, posts, param_username }) => {
    const { user } = useAuth()
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

    return (
        <div className='flex gap-14'>
            <Card className='flex flex-col gap-5 p-5 justify-center items-center h-fit'>
                <div>
                    <Avatar className='h-[12rem] w-[12rem]'>
                        <AvatarImage src={userAvatar} alt={userProfile?.username} />
                        <AvatarFallback>{userProfile?.username ? userProfile.username[0] : 'U'}</AvatarFallback>
                    </Avatar>
                </div>

                <div className='flex flex-col gap-2 text-center items-center justify-center max-w-[400px]'>
                    <div className='text-xl font-bold'>{userProfile?.name}</div>
                    <div className='text-sm text-gray-400'>@{userProfile?.username}</div>
                    <div>{userProfile?.about}</div>
                    <div className='mt-4 flex gap-2'>
                        {user && userProfile.username === param_username && (
                            <Button onClick={() => setEditModalOpen(true)}>Edit Profile</Button>
                        )}
                        <Button as="a" href={`mailto:${userProfile.email}?subject=Hello&body=Hi there!`}>
                            Send Mail
                        </Button>
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
