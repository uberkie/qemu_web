import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';



const Login = ({ setAuth }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const auth = localStorage.getItem('auth');
        if (auth) {
            setAuth(true);
            navigate('/');
        }
    }, [setAuth, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://192.168.111.145:8081/api/login', { username, password });
            if (response.status === 200) {
                // Save session data
                localStorage.setItem('auth', true);
                localStorage.setItem('username', username);
                setAuth(true);
                navigate('/');
            }
        } catch (error) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="login-container">
            <h1>QemuUI Login</h1>
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn">Login</button>
            </form>
            {error && <div className="error-message">{error}</div>}
            <div className="forgot-password">
                <a href="#/forgot-password">Forgot Password?</a>
            </div>
        </div>
    );
}

export default Login;