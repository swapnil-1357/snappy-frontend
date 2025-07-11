import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Bell } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const VITE_NOTIFICATION_URL = import.meta.env.VITE_NOTIFICATION_URL;

const NotificationDropdown = () => {
    const { userDetails } = useAuth();
    const { toast } = useToast();

    const [notifications, setNotifications] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [unseenCount, setUnseenCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const res = await fetch(VITE_NOTIFICATION_URL, {
                headers: { uid: userDetails?.username },
            });
            const data = await res.json();

            // show toast if new unseen notifications come in
            const newUnseen = data.filter((n) => !n.seen);
            if (newUnseen.length > unseenCount) {
                const latest = newUnseen[0];
                toast({
                    title: `${latest.senderId} ${latest.message}`,
                });
            }

            setNotifications(data);
            setUnseenCount(newUnseen.length);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    const markAllSeen = async () => {
        await fetch(`${VITE_NOTIFICATION_URL}/mark-seen`, {
            method: "PUT",
            headers: { uid: userDetails?.username },
        });
        fetchNotifications(); // refresh
    };

    const deleteNotification = async (id) => {
        await fetch(`${VITE_NOTIFICATION_URL}/${id}`, {
            method: "DELETE",
        });
        setNotifications((prev) => prev.filter((n) => n._id !== id));
    };

    useEffect(() => {
        if (userDetails?.username) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 10000); // poll every 10 seconds
            return () => clearInterval(interval);
        }
    }, [userDetails]);

    return (
        <div className="relative">
            <button
                className="relative"
                onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                    if (!dropdownOpen) markAllSeen();
                }}
            >
                <Bell className="w-6 h-6" />
                {unseenCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                        {unseenCount}
                    </span>
                )}
            </button>

            {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50 max-h-96 overflow-y-auto border border-gray-200">
                    <div className="p-3 border-b font-semibold text-gray-800">
                        Notifications
                    </div>

                    {notifications.length === 0 ? (
                        <div className="p-4 text-gray-500">No notifications</div>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n._id}
                                className={`flex justify-between items-start gap-2 p-3 text-sm ${!n.seen ? "bg-blue-50" : ""
                                    } hover:bg-gray-100 transition`}
                            >
                                <div>
                                    <span className="font-medium">{n.senderId}</span>{" "}
                                    <span>{n.message}</span>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {new Date(n.timestamp).toLocaleString()}
                                    </div>
                                </div>
                                <button
                                    className="text-gray-400 hover:text-red-500 text-xs"
                                    onClick={() => deleteNotification(n._id)}
                                >
                                    ✕
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
