export interface User {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
    status?: 'online' | 'offline' | 'away';
    lastSeen?: string;
} 