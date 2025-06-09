// frontend/src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header>
            <h1>Pi Transaction App</h1>
            <nav>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/profile">Profile</Link></li>
                    <li><Link to="/transactions">Transactions</Link></li>
                    <li><Link to="/price-prediction">Price Prediction</Link></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
