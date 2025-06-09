// frontend/src/services/userService.js
import api from './api';

export const registerUser = async (userData) => {
    const response = await api.post('/user/register', userData);
    return response.data;
};

export const loginUser = async (credentials) => {
    const response = await api.post('/user/login', credentials);
    return response.data;
};

export const getUserProfile = async (username) => {
    const response = await api.get(`/user/profile/${username}`);
    return response.data;
};

export const updateUserProfile = async (username, updates) => {
    const response = await api.put(`/user/profile/${username}`, updates);
    return response.data;
};

export const deleteUser = async (username) => {
    const response = await api.delete(`/user/profile/${username}`);
    return response.data;
};
