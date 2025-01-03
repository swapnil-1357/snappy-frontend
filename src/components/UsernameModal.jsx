import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import { useDebounceCallback } from 'usehooks-ts'
import { useNavigate } from 'react-router-dom'


// https://snappy-backend-wodp.onrender.com

const UsernameModal = ({ showModal, onClose, onSave, defaultName, defaultUsername, userEmail }) => {
    const [name, setName] = useState(defaultName || '')
    const [username, setUsername] = useState(defaultUsername || '')
    const [isCheckingUsername, setIsCheckingUsername] = useState(false)
    const [usernameMessage, setUsernameMessage] = useState('')
    const { toast } = useToast()

    const navigate = useNavigate()

    const debounced = useDebounceCallback(setUsername, 500)

    useEffect(() => {
        const checkUsernameUnique = async () => {
            if (username) {
                setIsCheckingUsername(true)
                setUsernameMessage('')

                try {
                    const CHECK_USERNAME_UNIQUE_URL = `${import.meta.env.VITE_USER_URL}/check-username-unique?username=${encodeURIComponent(username)}`
                    const response = await fetch(CHECK_USERNAME_UNIQUE_URL, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })

                    if (!response.ok) {
                        const errorData = await response.json()
                        throw new Error(errorData.message || 'Failed to check username')
                    }

                    const data = await response.json()
                    setUsernameMessage(data.message)

                } catch (error) {
                    setUsernameMessage(error.message || 'Error checking username')
                    navigate('/sign-in')
                } finally {
                    setIsCheckingUsername(false)
                }
            }
        }

        checkUsernameUnique()

    }, [username])

    const handleSave = () => {
        if (!name || !username) {
            toast({
                title: "Error",
                description: "Both name and username are required.",
                variant: "destructive",
            })
            return
        }

        onSave({ name, username })
        navigate('/posts')
    }

    const handleClose = () => {
        const generatedUsername = `${userEmail.split('@')[0].toLowerCase()}`
        setUsername(generatedUsername)
        console.log(generatedUsername)

        toast({
            title: 'Username set',
            description: `Username set to ${generatedUsername}`,
            variant: 'default'
        })

        console.log(name, generatedUsername)
        onSave({ name, username: generatedUsername })      
        navigate('/posts')
    }

    return (
        <Dialog open={showModal} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Set Username and Name</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">

                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        disabled={!!defaultName}
                    />

                    <div className="flex flex-col space-y-1.5">
                        <Input
                            name="username"
                            autoComplete='off'
                            placeholder="Username"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value)
                                debounced(e.target.value)
                            }}
                        />

                        {isCheckingUsername && <Loader2 className='animate-spin' />}

                        <div className={`text-sm ${usernameMessage === "Username is unique" ? 'text-green-500' : 'text-red-500'}`}>
                            {usernameMessage}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleSave} disabled={isCheckingUsername || usernameMessage !== "Username is unique"}>Save</Button>
                    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default UsernameModal
