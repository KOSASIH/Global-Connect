// frontend/src/views/Analytics.js
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';

const Analytics = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await axios.get('/api/analytics/transaction-count');
                setAnalyticsData(response.data);
            } catch (error) {
                console.error('Failed to fetch analytics data.');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <p>Loading analytics...</p>;

    return (
        <div>
            <Header />
            <main>
                <h2>Analytics</h2>
                <p>Total Transactions: {analyticsData.totalTransactionCount}</p>
                {/* Add more analytics data display here */}
            </main>
            <Footer />
        </div>
    );
};

export default Analytics;
