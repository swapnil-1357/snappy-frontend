import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useDebounceCallback } from 'usehooks-ts'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'
import { emailValidation, nameValidation, passwordValidation, usernameValidation } from '@/schemas/signupSchema'
import { z } from 'zod'
import emailjs from 'emailjs-com'
import { Link, useNavigate } from 'react-router-dom'
import { SlSocialSkype } from 'react-icons/sl'
import { useAuth } from '@/context/AuthContext'
import { FcGoogle } from "react-icons/fc";




const SignUp = () => {
    const navigate = useNavigate()

    const [name, setName] = useState('')
    const [nameMessage, setNameMessage] = useState('')

    const [username, setUsername] = useState('')
    const [usernameMessage, setUsernameMessage] = useState('')
    const [isCheckingUsername, setIsCheckingUsername] = useState(false)

    const [isSubmitting, setIsSubmitting] = useState(false)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const debounced = useDebounceCallback(setUsername, 800)

    const { toast } = useToast()
    const { signUp, signInUsingGoogle } = useAuth()

    const SignUpQueryValidation = z.object({
        username: usernameValidation,
        email: emailValidation,
        password: passwordValidation,
        name: nameValidation,
    })

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true)
            const result = SignUpQueryValidation.safeParse({
                name,
                username,
                email,
                password,
            })
            if (!result.success) {
                toast({
                    title: 'Error',
                    description: 'Invalid credentials',
                    variant: 'destructive'
                })
                return
            }

            // console.log(name, username, email, password)
            const signUpUser = await signUp(name, username, email, password)
            navigate('/sign-in')

        } catch (error) {
            const axiosError = error
            let errorMessage = axiosError.response?.data.message
            toast({
                title: 'Signup Failed',
                description: errorMessage,
                variant: 'destructive'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        const checkUsernameUnique = async () => {
            if (username) {
                setIsCheckingUsername(true);
                setUsernameMessage('');

                try {
                    const CHECK_USERNAME_UNIQUE_URL = `${import.meta.env.VITE_USER_URL}/check-username-unique?username=${encodeURIComponent(username)}`;

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
                    setUsernameMessage(error.message || 'Error checking Username')
                } finally {
                    setIsCheckingUsername(false)
                }
            }
        }

        checkUsernameUnique()
    }, [username])

    const handleNameChange = (e) => {
        setName(e.target.value)

        try {
            nameValidation.parse(e.target.value)
            setNameMessage('')

        } catch (error) {
            setNameMessage(error.errors[0].message)
        }
    }

    return (
        <div className='flex flex-col gap-8 justify-center items-center min-h-screen'>
            <Card className="w-[500px] p-5">
                <CardHeader className='flex justify-center items-center'>
                    <CardTitle className='flex items-center gap-2 text-5xl font-bold'>
                        <SlSocialSkype />
                        Snappy
                    </CardTitle>
                    <CardDescription>Join the next generation social media</CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="grid w-full items-center gap-5">
                            <div className='flex flex-col space-y-1.5'>
                                <Input
                                    name="name"
                                    placeholder="Name"
                                    onChange={handleNameChange}
                                    autoComplete='off'
                                />
                                <div className={`text-sm ${nameMessage ? 'text-red-500' : ''}`}>
                                    {nameMessage}
                                </div>
                            </div>

                            <div className="flex flex-col space-y-1.5">
                                <Input name="username" autoComplete='off' placeholder="Username" onChange={(e) => {
                                    setUsername(e.target.value)
                                    debounced(e.target.value)
                                }} />
                                {isCheckingUsername && <Loader2 className='animate-spin' />}
                                <div className={`text-sm ${usernameMessage === "Username is unique" ? 'text-green-500' : 'text-red-500'}`}>
                                    {usernameMessage}
                                </div>
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Input name="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
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
                    <div>Already a member? <Link to='/sign-in' className='text-blue-500 underline'>SignIn</Link> </div>

                    <div className='flex items-center gap-6'>
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {
                                isSubmitting ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please Wait
                                    </>
                                ) : ('Signup')
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

export default SignUp
