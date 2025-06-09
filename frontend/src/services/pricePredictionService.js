// frontend/src/services/pricePredictionService.js
import api from './api';

export const getPredictedPrice = async () => {
    const response = await api.get('/pricePrediction/predict');
    return response.data;
};
