// src/features/chat/components/ChatMain.tsx
import React from 'react';
import { useChatStore } from '../store/chatStore';
import { useChatMain } from '../utils/chatUtils';
import ChatHeader from './ChatHeader';
import ChatBox from './ChatBox';
import MessageBox from './MessageBox';

interface ChatMainProps {
    className?: string;
}

const ChatMain: React.FC<ChatMainProps> = ({ className }) => {
    const { selectedChat, messages } = useChatStore();
    const {
        newMessage,
        setNewMessage,
        activePicker,
        setActivePicker,
        gifSearch,
        setGifSearch,
        gifs,
        isPickerOpen,
        setIsPickerOpen,
        messagesEndRef,
        messageContainerRef,
        otherUser,
        isOnline,
        isTyping,
        stickers,
        handleSend,
        handleEmojiClick,
        handleStickerClick,
        handleGifClick,
    } = useChatMain();

    return (
        <div className={`p-4 flex flex-col bg-teal-900 text-white h-screen ${className || ''}`}>
            {selectedChat ? (
                <>
                    <ChatHeader
                        name={selectedChat.isGroupChat ? selectedChat.chatName || 'Group Chat' : otherUser?.name || 'Unknown User'}
                        isGroupChat={selectedChat.isGroupChat || false}
                        profilePicture={!selectedChat.isGroupChat ? otherUser?.profilePicture : undefined}
                        groupIcon={selectedChat.isGroupChat ? selectedChat.groupIcon : undefined}
                        isOnline={isOnline || false}
                        isTyping={isTyping || false}
                    />
                    <ChatBox
                        messages={messages}
                        messageContainerRef={messageContainerRef}
                        messagesEndRef={messagesEndRef}
                    />
                    <MessageBox
                        newMessage={newMessage}
                        setNewMessage={setNewMessage}
                        activePicker={activePicker}
                        setActivePicker={setActivePicker}
                        gifSearch={gifSearch}
                        setGifSearch={setGifSearch}
                        gifs={gifs}
                        isPickerOpen={isPickerOpen}
                        setIsPickerOpen={setIsPickerOpen}
                        handleSend={handleSend}
                        handleEmojiClick={handleEmojiClick}
                        handleStickerClick={handleStickerClick}
                        handleGifClick={handleGifClick}
                        stickers={stickers}
                    />
                </>
            ) : (
                <p className="flex-1 flex items-center justify-center text-gray-300">
                    Select a chat to start messaging
                </p>
            )}
        </div>
    );
};

export default ChatMain;