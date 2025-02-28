import React from 'react';
import { FaBell } from 'react-icons/fa';

const ChatHeader: React.FC = () => {
  return (
    <div className="flex justify-end p-4 bg-teal-800">
      <FaBell className="text-2xl cursor-pointer hover:text-amber-300 transition-colors" />
    </div>
  );
};

export default ChatHeader;