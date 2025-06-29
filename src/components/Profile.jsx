import React, { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import EditProfileModal from './EditProfileModal'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import PostCard from '@/components/PostCard'
import { useAuth } from '@/context/AuthContext'
import UserAvatar from './UserAvatar'

const Profile = ({ posts, param_username }) => {
    const { user, userDetails } = useAuth()
    const [isEditModalOpen, setEditModalOpen] = useState(false)
    const [selectedPostType, setSelectedPostType] = useState('Own Posts')
    const [filteredPosts, setFilteredPosts] = useState([])
    const [profile, setProfile] = useState(null)

    // Fetch the correct profile for the username in the URL
    useEffect(() => {
        setProfile(null)
        fetch(`/api/user/get-user-by-username?username=${param_username}`)
            .then(res => res.json())
            .then(data => setProfile(data.user))
    }, [param_username])

    useEffect(() => {
        if (selectedPostType === 'Own Posts') {
            setFilteredPosts(posts.filter(post => post.username === param_username))
        } else if (selectedPostType === 'Liked Posts') {
            setFilteredPosts(posts.filter(post => post.likes && post.likes.includes(param_username)))
        }
    }, [selectedPostType, posts, param_username])

    if (!profile) return <div>Loading...</div>

    return (
        <div className='flex md:flex-row flex-col gap-14'>
            <Card className='flex flex-col gap-5 p-5 justify-center items-center h-fit'>
                <div>
                    <UserAvatar
                        username={profile.username}
                        fallback={profile.username ? profile.username[0] : 'U'}
                        className='h-[12rem] w-[12rem]'
                    />
                </div>
                <div className='flex flex-col gap-2 text-center items-center justify-center max-w-[400px]'>
                    <div className='text-xl font-bold'>{profile.name}</div>
                    <div className='text-sm text-gray-400'>@{profile.username}</div>
                    <div>{profile.about}</div>
                    <div className='mt-4 flex gap-2'>
                        {user && userDetails.username === profile.username && (
                            <Button onClick={() => setEditModalOpen(true)}>Edit Profile</Button>
                        )}
                        {user && profile.username !== userDetails.username && (
                            <a href={`mailto:${profile.email}?subject=Hello&body=Hi there!`}>
                                <Button>Send Mail</Button>
                            </a>
                        )}
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
