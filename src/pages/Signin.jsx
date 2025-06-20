'use client'
import React, { useState } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useNavigate } from 'react-router-dom'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { SlSocialSkype } from "react-icons/sl"
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { FcGoogle } from 'react-icons/fc'




const SignIn = () => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const { toast } = useToast()
    const navigate = useNavigate()
    const { signIn, signInUsingGoogle } = useAuth()

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const onSubmit = async () => {
        setIsSubmitting(true)
        try {
            const response = await signIn(email, password)
            console.log('this is calling: ', response)

            if (!response.success) {
                return
            }

            toast({
                title: 'Hello',
                description: 'Team Snappy welcomes you'
            })

            navigate('/posts')

        } catch (error) {
            toast({
                title: 'Signin Failed',
                description: error.message || 'There was an error during sign-in.',
                variant: 'destructive'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className='flex flex-col gap-8 justify-center items-center min-h-screen'>
            <Card className="w-[400px] md:w-[500px] p-5">
                <CardHeader className='flex justify-center items-center'>
                    <CardTitle className='flex items-center gap-2 text-5xl font-bold'>
                        <SlSocialSkype />
                        Snappy
                    </CardTitle>
                    <CardDescription>welcome back from team snappy</CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="grid w-full items-center gap-5">
                            <div className="flex flex-col space-y-1.5">
                                <Input id="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <div className="flex flex-col items-center space-y-1.5 relative">
                                    <Input
                                        autoComplete="off"
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Password"
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <div
                                        className="absolute right-2 top-[14px] transform -translate-y-1/2 cursor-pointer"
                                        onClick={togglePasswordVisibility}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 justify-center">
                    <div>Not registered yet? <Link className='text-blue-500 underline' to='/sign-up'>SignUp</Link> </div>

                    <div className='flex items-center gap-6'>
                        <Button onClick={onSubmit} disabled={isSubmitting} >
                            {
                                isSubmitting ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please Wait
                                    </>
                                ) : ('SignIn')
                            }
                        </Button>

                        <Card onClick={() => signInUsingGoogle()} className='flex gap-2 items-center cursor-pointer rounded-full p-2 bg-white'>
                            <FcGoogle className='text-2xl' />
                        </Card>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

export default SignIn