// frontend/src/views/Dashboard.js
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TransactionForm from '../components/TransactionForm';
import PricePrediction from '../components/PricePrediction';

const Dashboard = () => {
    return (
        <div>
            <Header />
            <main>
                <h2>Dashboard</h2>
                <TransactionForm />
                <PricePrediction />
            </main>
            <Footer />
        </div>
    );
};

export default Dashboard;
