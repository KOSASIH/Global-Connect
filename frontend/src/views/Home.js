// frontend/src/views/Home.js
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Home = () => {
    return (
        <div>
            <Header />
            <main>
                <h2>Welcome to the Pi Transaction App</h2>
                <p>Your one-stop solution for managing Pi transactions, tracking price predictions, and ensuring authenticity.</p>
            </main>
            <Footer />
        </div>
    );
};

export default Home;
