import React from 'react'
import { SlSocialSkype } from "react-icons/sl";
import { User, LayoutDashboard, Contact } from "lucide-react"
import { Link } from 'react-router-dom';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from './ui/button';
import { useAuth } from '@/context/AuthContext';



const Navbar = () => {
    const { logOut, userDetails } = useAuth();

    const username = userDetails ? userDetails.username : 'undefined';

    return (
        <div className='px-32 py-10 sticky'>
            <div className='flex justify-between items-center'>
                <div className='flex gap-2 text-4xl font-bold items-center'>
                    <div><SlSocialSkype /></div>
                    <div>Snappy</div>
                </div>
                <div className='flex gap-10 items-center'>
                    <div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link className='text-md' to={`/u/${username}`}>
                                        <User className="h-5 w-5" />
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div>Profile</div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link className='text-md' to={`/posts`}>
                                        <LayoutDashboard className="h-5 w-5" />
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div>Posts</div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <a className='text-md' href="mailto:sukanil1357@gmail.com">
                                        <Contact className="h-5 w-5" />
                                    </a>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div>Contact</div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <div>
                        <Button onClick={logOut}>
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Navbar;
