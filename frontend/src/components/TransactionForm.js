import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionForm = () => {
    const [destination, setDestination] = useState('');
    const [amount, setAmount] = useState('');
    const [assetCode, setAssetCode] = useState('PI');
    const [valueType, setValueType] = useState('internal');
    const [rates, setRates] = useState({ internalValue: '', externalValue: '' });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch dual value rates from backend
        axios.get('/api/dualvalue/rates')
            .then(res => setRates(res.data))
            .catch(() => setRates({ internalValue: 'N/A', externalValue: 'N/A' }));
    }, []);

    Input validation
        if (!destination || !amount || !assetCode) {
            setMessage('All fields are required.');
            setLoading(false);
            return;
        }
        if (Number(amount) <= 0) {
            setMessage('Amount must be greater than zero.');
            setLoading(false);
            return;
        }

        try {
            const response = await('token')}`,
                },
            });

            setMessage(`Transaction successful! TxID: ${response.data.id || response.data.txId || '[unknown]'}`);
            setDestination('');
            setAmount('');
            setAssetCode('PI');
            setValueType('internal');
        } catch (error) {
            if (error.response) {
                setMessage(` || 'Please try again.'}`);
            } else {
                setMessage('Transaction failed: Network error. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Create Transaction</h2>
            <form onSubmit={handleSubmit} autoComplete="off">
                <div>
                    <label> setDestination(e.target.value)}
                        required
                        autoFocus
                    />
                </div>
                <div>
                    <label>Amount:</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        required
                        min="0.0000001"
                        step="any"
                    />
                </div.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Value Type:</label>
                    <select
                        value={valueType}
                        onChange={e => setValueType(e.target.value)}
                    >
                        <option value="internal">
                            Internal (${rates.internalValue}/Pi)
                        </option>
                        <option value="external">
                            External (~${rates.externalValue}/Pi)
                        </option>
                    </select>
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Processing...' : 'Submit'}
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default TransactionForm;
