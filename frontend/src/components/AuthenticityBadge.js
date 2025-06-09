// frontend/src/components/AuthenticityBadge.js
import React from 'react';

const AuthenticityBadge = ({ isValid }) => {
    return (
        <div>
            {isValid ? (
                <span style={{ color: 'green' }}>Authentic</span>
            ) : (
                <span style={{ color: 'red' }}>Not Authentic</span>
            )}
        </div>
    );
};

export default AuthenticityBadge;
