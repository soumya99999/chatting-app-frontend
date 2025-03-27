// src/pages/ChatPage.tsx
import React, { useEffect, useState } from 'react';
import ChatHeader from '../Components/ChatHeader';
import ChatSidebar from '../features/chat/components/ChatSidebar';
import ChatMain from '../features/chat/components/ChatMain';
import { useChatStore } from '../features/chat/store/chatStore';
import { useAuthStore } from '../features/auth/store/authStore';
import UserList from '../features/chat/components/UserList';
import { useNavigate } from 'react-router-dom';

const ChatPage: React.FC = () => {
    const { fetchChats, initializeSocket } = useChatStore();
    const { user, isAuthenticated } = useAuthStore();
    const { accessChat } = useChatStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const initializeChat = async () => {
            try {
                if (!isAuthenticated || !user) {
                    console.log('User not authenticated, redirecting to login...');
                    navigate('/login');
                    return;
                }

                console.log('Initializing chat with user:', user.id);
                await fetchChats();
                initializeSocket(user.id);
                setIsInitialized(true);
            } catch (error) {
                console.error('Error initializing chat:', error);
                navigate('/login');
            }
        };

        initializeChat();
    }, [fetchChats, initializeSocket, user, isAuthenticated, navigate]);

    const handleUserClick = async (userId: string) => {
        try {
            await accessChat(userId);
        } catch (error) {
            console.error('Error accessing chat:', error);
            navigate('/login');
        }
    };

    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-teal-900 text-white flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-teal-900 text-white flex flex-col">
            <ChatHeader />
            {!isSidebarOpen && (
                <div className="bg-teal-800 p-4">
                    <h3 className="text-lg font-bold mb-2">All Users</h3>
                    <div className="flex gap-4 overflow-x-auto">
                        <UserList
                            onUserClick={handleUserClick}
                            className="flex gap-4 overflow-x-auto"
                        />
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