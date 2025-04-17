import React from 'react';
import EmojiPicker, { EmojiStyle, EmojiClickData } from 'emoji-picker-react';
import { FaSearch } from 'react-icons/fa';
import type { IGif } from '@giphy/js-types';

interface MessageBoxProps {
    newMessage: string;
    setNewMessage: (message: string) => void;
    activePicker: 'emoji' | 'sticker' | 'gif';
    setActivePicker: (picker: 'emoji' | 'sticker' | 'gif') => void;
    gifSearch: string;
    setGifSearch: (search: string) => void;
    gifs: IGif[];
    isPickerOpen: boolean;
    setIsPickerOpen: (isOpen: boolean) => void;
    handleSend: () => void;
    handleEmojiClick: (emojiObject: EmojiClickData) => void;
    handleStickerClick: (stickerUrl: string) => void;
    handleGifClick: (gif: IGif) => void;
    stickers: string[];
}

const MessageBox: React.FC<MessageBoxProps> = ({
    newMessage,
    setNewMessage,
    activePicker,
    setActivePicker,
    gifSearch,
    setGifSearch,
    gifs,
    isPickerOpen,
    setIsPickerOpen,
    handleSend,
    handleEmojiClick,
    handleStickerClick,
    handleGifClick,
    stickers
}) => {
    return (
        <div className="mt-4 flex flex-col">
            {isPickerOpen && (
                <div className="picker-container absolute bottom-16 left-4 bg-gray-800 rounded-lg shadow-lg w-72">
                    <div className="flex border-b border-gray-700">
                        <button
                            onClick={() => setActivePicker('emoji')}
                            className={`flex-1 p-2 text-white ${
                                activePicker === 'emoji'
                                    ? 'bg-teal-700'
                                    : 'hover:bg-teal-600'
                            }`}
                        >
                            Emoji
                        </button>
                        <button
                            onClick={() => setActivePicker('sticker')}
                            className={`flex-1 p-2 text-white ${
                                activePicker === 'sticker'
                                    ? 'bg-amber-600'
                                    : 'hover:bg-amber-500'
                            }`}
                        >
                            Stickers
                        </button>
                        <button
                            onClick={() => setActivePicker('gif')}
                            className={`flex-1 p-2 text-white ${
                                activePicker === 'gif'
                                    ? 'bg-gray-600'
                                    : 'hover:bg-gray-500'
                            }`}
                        >
                            GIFs
                        </button>
                    </div>
                    <div className="p-2 max-h-72 overflow-y-auto hide-scrollbar">
                        {activePicker === 'emoji' && (
                            <EmojiPicker
                                onEmojiClick={handleEmojiClick}
                                emojiStyle={EmojiStyle.NATIVE}
                            />
                        )}
                        {activePicker === 'sticker' && (
                            <div className="grid grid-cols-3 gap-2">
                                {stickers.map((sticker, index) => (
                                    <img
                                        key={index}
                                        src={sticker}
                                        alt={`Sticker ${index}`}
                                        className="w-12 h-12 cursor-pointer"
                                        onClick={() => handleStickerClick(sticker)}
                                    />
                                ))}
                            </div>
                        )}
                        {activePicker === 'gif' && (
                            <div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={gifSearch}
                                        onChange={(e) => setGifSearch(e.target.value)}
                                        placeholder="Search GIFs..."
                                        className="w-full p-2 mb-2 bg-gray-700 text-white rounded pl-10"
                                    />
                                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                                </div>
                                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto hide-scrollbar">
                                    {gifs.map((gif) => (
                                        <img
                                            key={gif.id}
                                            src={gif.images.fixed_height_small.url}
                                            alt={gif.title}
                                            className="w-12 h-12 cursor-pointer"
                                            onClick={() => handleGifClick(gif)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div className="flex items-center bg-teal-700 rounded-lg">
                <div className="relative">
                    <button
                        onClick={() => setIsPickerOpen(!isPickerOpen)}
                        className="p-2 hover:cursor-pointer text-teal-300 hover:text-teal-200"
                    >
                        😊
                    </button>
                </div>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-2 bg-transparent text-white placeholder-gray-300 border-none focus:outline-none focus:ring-2 focus:ring-amber-300"
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                    onClick={handleSend}
                    className="p-2 bg-amber-300 text-gray-900 rounded-r-lg hover:bg-amber-400 transition-colors"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default MessageBox; 