// frontend/src/components/PricePrediction.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PricePrediction = () => {
    const [predictedPrice, setPredictedPrice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrediction = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/api/pricePrediction/predict');
                setPredictedPrice(response.data.predictedPrice);
            } catch (error) {
                console.error("Error fetching prediction:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPrediction();
    }, []);

    return (
        <div>
            <h2>Predicted Price of Pi</h2>
            {loading ? <p>Loading...</p> : <p>${predictedPrice}</p>}
        </div>
    );
};

export default PricePrediction;
