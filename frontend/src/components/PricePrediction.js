// frontend/src/components/PricePrediction.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PricePrediction = () => {
    const [predictedPrice, setPredictedPrice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPredictedPrice = async () => {
            try {
                const response = await axios.get('/api/pricePrediction/predict');
                setPredictedPrice(response.data.predictedPrice);
            } catch (error) {
                console.error('Failed to fetch predicted price.');
            } finally {
                setLoading(false);
            }
        };
        fetchPredictedPrice();
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h2>Price Prediction</h2>
            <p>Predicted Price of Pi: ${predictedPrice}</p>
        </div>
    );
};

export default PricePrediction;
