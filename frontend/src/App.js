// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import VMList from './components/VMList';
import VMDetails from './components/VMDetails';

const App = () => {
    const [isAuth, setAuth] = useState(false);

    return (
        <Router>
            <Routes>
                <Route path="/" element={isAuth ? <Navigate to="/vms" /> : <Login setAuth={setAuth} />} />
                <Route path="/vms" element={isAuth ? <VMList /> : <Navigate to="/" />} />
                <Route path="/vms/:name" element={isAuth ? <VMDetails /> : <Navigate to="/" />} />
            </Routes>
        </Router>
    );
};

export default App;
