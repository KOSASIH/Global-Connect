// frontend/src/components/TransactionForm.js
import React, { useState } from 'react';
import axios from 'axios';

const TransactionForm = () => {
    const [destination, setDestination] = useState('');
    const [amount, setAmount] = useState('');
    const [assetCode, setAssetCode] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/transaction/create', {
                destination,
                amount,
                assetCode,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`, // Assuming token is stored in localStorage
                },
            });
            setMessage(`Transaction successful: ${response.data.id}`);
        } catch (error) {
            setMessage('Transaction failed. Please try again.');
        }
    };

    return (
        <div>
            <h2>Create Transaction</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Destination:</label>
                    <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} required />
                </div>
                <div>
                    <label>Amount:</label>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                </div>
                <div>
                    <label>Asset Code:</label>
                    <input type="text" value={assetCode} onChange={(e) => setAssetCode(e.target.value)} required />
                </div>
                <button type="submit">Submit</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default TransactionForm;
