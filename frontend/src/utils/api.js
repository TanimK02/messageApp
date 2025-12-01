import axios from 'axios';

const API_URL = 'https://messageapp-1a2r.onrender.com';

const api = axios.create({
    baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle expired token responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token is invalid or expired
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const register = async (email, password, username, name) => {
    const response = await api.post('/users/register', { email, password, username, name });
    return response.data;
};

export const login = async (identifier, password) => {
    const response = await api.post('/users/login', { identifier, password });
    return response.data;
};

export const getProfile = async () => {
    const response = await api.get('/users/profile');
    return response.data;
};

export const updateProfile = async (updates) => {
    const response = await api.put('/users/update', updates);
    return response.data;
};

export const changePassword = async (oldPassword, newPassword) => {
    const response = await api.post('/users/changePassword', { oldPassword, newPassword });
    return response.data;
};

export const deleteAccount = async () => {
    const response = await api.delete('/users/delete');
    return response.data;
};

// User List APIs
export const getUsers = async (page = 0) => {
    const response = await api.get(`/users/list/${page}`);
    return response.data;
};

export const searchUsers = async (query) => {
    const response = await api.get(`/users/search/${query}`);
    return response.data;
};

// Chat APIs
export const getChats = async (pageIndex = 0) => {
    const response = await api.get(`/chats/page/${pageIndex}`);
    return response.data;
};

export const createChat = async (title, usernames) => {
    const response = await api.post('/chats/create', { title, usernames });
    return response.data;
};

export const renameChat = async (chatId, newTitle) => {
    const response = await api.put('/chats/rename', { chatId, newTitle });
    return response.data;
};

export const addUserToChat = async (chatId, username) => {
    const response = await api.put('/chats/addUser', { chatId, username });
    return response.data;
};

export const removeUserFromChat = async (chatId, username) => {
    const response = await api.put('/chats/removeUser', { chatId, username });
    return response.data;
};

export const getChatUsers = async (chatId) => {
    const response = await api.get(`/chats/${chatId}/users`);
    return response.data;
};

// Message APIs
export const getMessages = async (chatId, page = 0) => {
    const response = await api.get(`/messages/chat/${chatId}/${page}`);
    return response.data;
};

export const createMessage = async (chatId, content) => {
    const response = await api.post('/messages/create', { chatId, content });
    return response.data;
};

export const updateMessage = async (messageId, content) => {
    const response = await api.put(`/messages/${messageId}`, { content });
    return response.data;
};

export const deleteMessage = async (messageId) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
};

export default api;
