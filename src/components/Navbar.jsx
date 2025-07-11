import React, { useState, useEffect, useRef } from 'react';
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
import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.VITE_NOTIFICATION_URL || 'http://localhost:3000/api/notifications';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

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

    const audioRef = useRef(null);
    const socketRef = useRef(null);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const fetchNotifications = async () => {
        if (!uid) return;
        try {
            const res = await axios.get(`${BASE_URL}/get`, {
                headers: { uid }
            });
            const data = res.data;
            const unseen = data.filter(n => !n.seen);
            setNotifications(data);
            setUnseenCount(unseen.length);
        } catch (err) {
            console.error('Fetch notifications error:', err);
        }
    };

    const markAllSeen = async () => {
        try {
            await axios.put(`${BASE_URL}/mark-all-seen`, null, {
                headers: { uid }
            });
            fetchNotifications();
        } catch (err) {
            console.error('Mark all seen failed:', err);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await axios.delete(`${BASE_URL}/delete/${id}`);
            fetchNotifications();
        } catch (err) {
            console.error('Delete notification error:', err);
        }
    };

    useEffect(() => {
        if (!uid) return;

        fetchNotifications();

        const socket = io(SOCKET_URL, {
            transports: ['websocket']
        });
        socketRef.current = socket;

        // Register this user
        socket.emit('register', uid);

        // Listen for notifications
        socket.on('new_notification', (newNotif) => {
            setNotifications(prev => [newNotif, ...prev]);
            setUnseenCount(prev => prev + 1);

            toast({
                title: 'New Notification',
                description: newNotif.message,
            });

            if (isMobile) {
                if (audioRef.current) {
                    audioRef.current.play().catch(() => { });
                }
                if (navigator.vibrate) {
                    navigator.vibrate(300);
                }
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [uid]);

    return (
        <div className="px-6 py-6 top-0 z-10 relative bg-white dark:bg-black">
            <audio ref={audioRef} src="/notification.mp3" preload="auto" />
            <div className='flex justify-between items-center'>
                <div className="flex gap-2 text-2xl font-bold items-center">
                    <SlSocialSkype />
                    <span>Snappy</span>
                </div>

                <div className='md:hidden'>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menu">
                        <Menu className="h-6 w-6" />
                    </button>
                </div>

                <div className='hidden md:flex gap-6 items-center'>
                    <Link to={`/u/${username}`}><User className="h-5 w-5" /></Link>
                    <Link to="/posts"><LayoutDashboard className="h-5 w-5" /></Link>
                    <a href="mailto:sukanil1357@gmail.com"><Contact className="h-5 w-5" /></a>

                    <div className="relative">
                        <button
                            onClick={() => {
                                setShowDropdown(!showDropdown);
                                markAllSeen();
                            }}
                            className="relative"
                        >
                            <Bell className="h-5 w-5" />
                            {unseenCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                                    {unseenCount}
                                </span>
                            )}
                        </button>
                        {showDropdown && (
                            <div className="absolute right-0 top-10 w-72 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg z-50">
                                <div className="p-3 font-semibold border-b">Notifications</div>
                                <div className="max-h-60 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-4 text-sm text-gray-500">No notifications</div>
                                    ) : (
                                        notifications.map(n => (
                                            <div
                                                key={n._id}
                                                className={`p-3 text-sm flex justify-between ${!n.seen ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                                            >
                                                <div className="flex flex-col">
                                                    <span>{n.message}</span>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(n.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => deleteNotification(n._id)}
                                                    className="text-red-500 text-xs"
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

                    <Button onClick={logOut}>Logout</Button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {isMenuOpen && (
                <div className="md:hidden mt-4 flex flex-col gap-4 border p-4 rounded-md">
                    <Link className="flex items-center gap-2" to={`/u/${username}`}>
                        <User className="h-5 w-5" /> Profile
                    </Link>
                    <Link className="flex items-center gap-2" to="/posts">
                        <LayoutDashboard className="h-5 w-5" /> Posts
                    </Link>
                    <a className="flex items-center gap-2" href="mailto:sukanil1357@gmail.com">
                        <Contact className="h-5 w-5" /> Contact
                    </a>

                    <div className="flex items-center gap-2" onClick={() => {
                        setShowDropdown(!showDropdown);
                        markAllSeen();
                    }}>
                        <Bell className="h-5 w-5" />
                        Notifications
                        {unseenCount > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs px-1 rounded-full">
                                {unseenCount}
                            </span>
                        )}
                    </div>

                    {showDropdown && (
                        <div className="bg-white dark:bg-gray-800 border mt-2 rounded-md max-h-60 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-sm text-gray-500">No notifications</div>
                            ) : (
                                notifications.map(n => (
                                    <div
                                        key={n._id}
                                        className={`p-3 text-sm flex justify-between ${!n.seen ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                                    >
                                        <div className="flex flex-col">
                                            <span>{n.message}</span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(n.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => deleteNotification(n._id)}
                                            className="text-red-500 text-xs"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    <Button onClick={logOut}>Logout</Button>
                </div>
            )}
        </div>
    );
};

export default Navbar;
