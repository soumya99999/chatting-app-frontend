// src/pages/ChatPage.tsx
import React, { useEffect, useState } from 'react';
import ChatHeader from '../Components/ChatHeader';
import ChatSidebar from '../features/chat/components/ChatSidebar';
import ChatMain from '../features/chat/components/ChatMain';
import { useChatStore } from '../features/chat/store/chatStore';
import { useUserStore } from '../features/user/store/userStore';

// Online should be present here
const ChatPage: React.FC = () => {
    const { fetchChats, initializeSocket,onlineUsers} = useChatStore();
    const { currentUser, users } = useUserStore();
    const { accessChat } = useChatStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        if (currentUser) {
            // console.log("Initializing chat for user:", currentUser.id, "with onlineUsers:", onlineUsers);
            fetchChats();
            initializeSocket(currentUser.id);
            const interval = setInterval(() => {
                // console.log("Current onlineUsers for user", currentUser.id, ":", onlineUsers);
            }, 5000); // Log every 5 seconds for debugging
            return () => clearInterval(interval);
        }
    }, [fetchChats, initializeSocket, currentUser, onlineUsers]);

    const handleUserClick = (userId: string) => {
        accessChat(userId);
    };

    return (
        <div className="min-h-screen bg-teal-900 text-white flex flex-col">
            <ChatHeader />
            {!isSidebarOpen && (
                <div className="bg-teal-800 p-4">
                    <h3 className="text-lg font-bold mb-2">All Users</h3>
                    <div className="flex gap-4 overflow-x-auto">
                        {users.map((user) => (
                            <div
                                key={user.id}
                                onClick={() => handleUserClick(user.id)}
                                className="flex items-center gap-2 p-2 bg-teal-700 rounded-lg cursor-pointer hover:bg-teal-600"
                            >
                                <img
                                    src={user.profilePicture || 'https://via.placeholder.com/30'}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <span>{user.name}</span>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="mt-2 text-amber-300 hover:text-amber-400"
                    >
                        Open Sidebar
                    </button>
                </div>
            )}
            <div className="flex flex-1 overflow-hidden">
                {isSidebarOpen && <ChatSidebar onClose={() => setIsSidebarOpen(false)} />}
                <ChatMain className={isSidebarOpen ? 'w-3/4' : 'w-full'} />
            </div>
        </div>
    );
};

export default ChatPage;