// src/components/VMDetails.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const VMDetails = () => {
    const { name } = useParams();
    const [vm, setVm] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchVm();
    }, [name]);

    const fetchVm = async () => {
        try {
            const response = await axios.get(`http://localhost:8081/api/vms/${name}`);
            setVm(response.data);
        } catch (error) {
            setError('Failed to fetch VM details');
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:8081/api/vms/${name}`);
            navigate('/vms');
        } catch (error) {
            setError('Failed to delete VM');
        }
    };

    if (!vm) return <p>Loading...</p>;

    return (
        <div>
            <h2>VM Details: {vm.name}</h2>
            <p>CPU Count: {vm.cpus}</p>
            <button onClick={handleDelete}>Delete VM</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default VMDetails;
