import React, { useState, useEffect } from 'react';
import { SlSocialSkype } from "react-icons/sl";
import { User, LayoutDashboard, Contact, Menu, Bell } from "lucide-react";
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from './ui/button';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from './ThemeProvider';
import { useToast } from '@/components/ui/use-toast';

const BASE_URL = import.meta.env.VITE_NOTIFICATION_URL || 'http://localhost:3000/api/notifications';


const Navbar = () => {
    const { theme } = useTheme();
    const { logOut, userDetails } = useAuth();
    const { toast } = useToast();

    const username = userDetails?.username || 'undefined';
    const uid = userDetails?._id;

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unseenCount, setUnseenCount] = useState(0);

    const fetchNotifications = async () => {
        if (!uid) return;
        try {
            const res = await axios.get(`${BASE_URL}/get`, {
                headers: { uid }
            });
            const data = res.data;
            const newUnseen = data.filter(n => !n.seen);

            if (newUnseen.length > unseenCount) {
                const latest = newUnseen[0];
                toast({
                    title: latest.message,
                });
            }

            setNotifications(data);
            setUnseenCount(newUnseen.length);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    };

    const markAllSeen = async () => {
        try {
            await axios.put(`${BASE_URL}/mark-all-seen`, null, {
                headers: { uid }
            });
            fetchNotifications();
        } catch (err) {
            console.error('Failed to mark as seen', err);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await axios.delete(`${BASE_URL}/delete/${id}`);
            fetchNotifications();
        } catch (err) {
            console.error('Failed to delete notification', err);
        }
    };

    useEffect(() => {
        if (uid) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 10000);
            return () => clearInterval(interval);
        }
    }, [uid]);

    return (
        <div className="px-10 py-10 top-0 z-10 relative">
            <div className='flex md:justify-evenly justify-between items-center'>
                {/* Logo */}
                <div className="flex gap-2 text-4xl font-bold items-center">
                    <SlSocialSkype />
                    <span>Snappy</span>
                </div>

                {/* Mobile Hamburger */}
                <div className='md:hidden'>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle Menu">
                        <Menu className="h-6 w-6" />
                    </button>
                </div>

                {/* Desktop Menu */}
                <div className='hidden md:flex gap-8 items-center relative'>
                    {/* Profile */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link to={`/u/${username}`}>
                                    <User className="h-5 w-5" />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>Profile</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Posts */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link to={`/posts`}>
                                    <LayoutDashboard className="h-5 w-5" />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>Posts</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Contact */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <a href="mailto:sukanil1357@gmail.com">
                                    <Contact className="h-5 w-5" />
                                </a>
                            </TooltipTrigger>
                            <TooltipContent>Contact</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setShowDropdown(!showDropdown);
                                markAllSeen();
                            }}
                        >
                            <Bell className="h-5 w-5" />
                            {unseenCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1.5">
                                    {unseenCount}
                                </span>
                            )}
                        </button>

                        {showDropdown && (
                            <div className="absolute right-0 top-10 w-72 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg rounded-lg z-50">
                                <div className="p-3 font-semibold border-b dark:border-gray-600">Notifications</div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-4 text-sm text-gray-500 dark:text-gray-300">
                                            No notifications
                                        </div>
                                    ) : (
                                        notifications.map(n => (
                                            <div
                                                key={n._id}
                                                className={`p-3 text-sm flex justify-between items-start gap-2 ${!n.seen ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                                            >
                                                <div className="flex flex-col">
                                                    <span>{n.message}</span>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(n.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => deleteNotification(n._id)}
                                                    className="text-red-500 text-xs hover:underline"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Logout */}
                    <Button onClick={logOut}>Logout</Button>
                </div>
            </div>

            {/* Mobile Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden mt-4 flex flex-col gap-4 shadow-lg rounded-md p-4 border-2">
                    <Link className="flex items-center gap-2" to={`/u/${username}`}>
                        <User className="h-5 w-5" /> Profile
                    </Link>
                    <Link className="flex items-center gap-2" to={`/posts`}>
                        <LayoutDashboard className="h-5 w-5" /> Posts
                    </Link>
                    <a className="flex items-center gap-2" href="mailto:sukanil1357@gmail.com">
                        <Contact className="h-5 w-5" /> Contact
                    </a>
                    <Button onClick={logOut}>Logout</Button>
                </div>
            )}
        </div>
    );
};

export default Navbar;
