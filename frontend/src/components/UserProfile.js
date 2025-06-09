// frontend/src/components/UserProfile.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get('/api/user/profile/testuser', { // Replace 'testuser' with dynamic username
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setUser(response.data);
                setUsername(response.data.username);
            } catch (error) {
                setMessage('Failed to fetch user profile.');
            }
        };
        fetchUserProfile();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`/api/user/profile/${user.username}`, { username }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setUser(response.data);
            setMessage('Profile updated successfully.');
        } catch (error) {
            setMessage('Failed to update profile.');
        }
    };

    if (!user) return <p>Loading...</p>;

    return (
        <div>
            <h2>User Profile</h2>
            <form onSubmit={handleUpdate}>
                <div>
                    <label>Username:</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <button type="submit">Update</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default UserProfile;
