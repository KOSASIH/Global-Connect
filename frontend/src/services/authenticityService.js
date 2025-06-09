// frontend/src/services/authenticityService.js
import api from './api';

export const validateTransaction = async (transactionId) => {
    const response = await api.post('/authenticity/validate', { transactionId });
    return response.data;
};
