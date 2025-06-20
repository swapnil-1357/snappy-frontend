import React, { useState } from 'react';
import { SlSocialSkype } from "react-icons/sl";
import { User, LayoutDashboard, Contact, Menu, HandCoins } from "lucide-react";
import { Link } from 'react-router-dom';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from './ui/button';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from './ThemeProvider';

const Navbar = () => {
    const { theme } = useTheme();
    const { logOut, userDetails, user } = useAuth();
    console.log('this is user: ', user)
    const username = user ? user.username : 'undefined';
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="px-10 py-10 top-0 z-10">
            <div className='flex md:justify-evenly justify-between items-center'>
                {/* Logo Section */}
                <div className={`flex gap-2 text-4xl font-bold items-center`}>
                    <div>
                        <SlSocialSkype />
                    </div>
                    <div>Snappy</div>
                </div>

                {/* Hamburger Icon for Mobile */}
                <div className='md:hidden '>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle Menu">
                        <Menu className={`h-6 w-6`} />
                    </button>
                </div>

                {/* Menu Items - Visible on Desktop */}
                <div className='hidden md:flex gap-10 items-center '>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link className={`text-md`} to={`/u/${username}`}>
                                    <User className={`h-5 w-5`} />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div>Profile</div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link className={`text-md`} to={`/posts`}>
                                    <LayoutDashboard className={`h-5 w-5`} />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div>Posts</div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <a className={`text-md`} href="mailto:sukanil1357@gmail.com">
                                    <Contact className={`h-5 w-5`} />
                                </a>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div>Contact</div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>



                    <Button onClick={logOut}>
                        Logout
                    </Button>
                </div>
            </div>

            {/* Dropdown Menu for Mobile */}
            {isMenuOpen && (
                <div className="md:hidden mt-4 flex flex-col gap-4 shadow-lg rounded-md p-4 border-2">
                    <Link className={`text-md flex items-center gap-2`} to={`/u/${username}`}>
                        <User className={`h-5 w-5`} /> Profile
                    </Link>
                    <Link className={`text-md flex items-center gap-2`} to={`/posts`}>
                        <LayoutDashboard className={`h-5 w-5`} /> Posts
                    </Link>
                    <a className={`text-md flex items-center gap-2`} href="mailto:sukanil1357@gmail.com">
                        <Contact className={`h-5 w-5`} /> Contact
                    </a>

                    <Button onClick={logOut}>
                        Logout
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Navbar;