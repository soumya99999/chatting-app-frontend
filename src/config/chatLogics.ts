// src/features/chat/utils/chatLogics.ts
import {Message} from '../features/chat/types/chatInterface';
import {User} from '../features/user/store/userStore';

// Determines margin for message alignment
export const isSameSenderMargin = (messages: Message[], m: Message, i: number, userId: string): number | "auto" => {
    if (
        i < messages.length - 1 &&
        messages[i + 1].senderId === m.senderId &&
        messages[i].senderId !== userId
    ) {
        return 33; // Indent for consecutive messages from same sender
    } else if (
        (i < messages.length - 1 &&
            messages[i + 1].senderId !== m.senderId &&
            messages[i].senderId !== userId) ||
        (i === messages.length - 1 && messages[i].senderId !== userId)
    ) {
        return 0; // No indent for new sender or last message
    } else {
        return "auto"; // Right-aligned for current user
    }
};

// Checks if this is the last message from the same sender (not current user)
export const isSameSender = (messages: Message[], m: Message, i: number, userId: string): boolean => {
    return (
        i < messages.length - 1 &&
        (messages[i + 1].senderId !== m.senderId || messages[i + 1].senderId === undefined) &&
        messages[i].senderId !== userId
    );
};

// Identifies the last message from another user
export const isLastMessage = (messages: Message[], i: number, userId: string): boolean => {
    return (
        i === messages.length - 1 &&
        messages[messages.length - 1].senderId !== userId &&
        messages[messages.length - 1].senderId !== undefined
    );
};

// Checks if the previous message is from the same sender
export const isSameUser = (messages: Message[], m: Message, i: number): boolean => {
    return i > 0 && messages[i - 1].senderId === m.senderId;
};

// Gets the other user's name
export const getSender = (loggedUser: User, users: User[]): string => {
    console.log(users[0].id," logged ",loggedUser.id)
    return users[0].id === loggedUser.id ? users[1].name : users[0].name;
};

// Gets the full user object of the other participant
export const getSenderFull = (loggedUser: User, users: User[]): User => {
    return users[0].id === loggedUser.id ? users[1] : users[0];
};