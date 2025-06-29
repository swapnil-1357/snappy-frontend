import { useUser } from '@/context/UserContext'
import { useEffect, useState } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

const UserAvatar = ({ username, fallback = 'U', ...props }) => {
    const { getAvatar } = useUser()
    const [avatarUrl, setAvatarUrl] = useState('')

    useEffect(() => {
        let mounted = true
        // Always get the latest avatar (with cache-busting if updated)
        getAvatar(username).then(url => {
            if (mounted) setAvatarUrl(url)
        })
        return () => { mounted = false }
    }, [username, getAvatar])

    return (
        <Avatar {...props}>
            <AvatarImage src={avatarUrl || undefined} alt={username} />
            <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
    )
}

export default UserAvatar