import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const VMList = () => {
    const [vms, setVms] = useState([]);
    const [name, setName] = useState('');
    const [id, setId] = useState('');
    const [cpus, setCpus] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchVms();
    }, []);

    const fetchVms = async () => {
        try {
            const response = await axios.get('http://localhost:8081/api/vms');
            // Check if the response data is an array
            if (Array.isArray(response.data)) {
                setVms(response.data);
            } else if (response.data.vms && Array.isArray(response.data.vms)) {
                setVms(response.data.vms);
            } else {
                console.error("Unexpected response format", response.data);
                setError('Unexpected response format');
            }
        } catch (error) {
            console.error("Error fetching VMs", error);
            setError('Failed to fetch VMs');
        }
    };

    const handleCreateVm = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8081/api/vms/create', { name, cpus });
            setVms([...vms, response.data]);
            setName('');
            setCpus('');
        } catch (error) {
            console.error("Error creating VM", error);
            setError('Failed to create VM');
        }
    };

    const handleDetails = (vmName) => {
        navigate(`/vms/${vmName}`);
    };

    return (
        <div>
            <h2>VM List</h2>
            <div style={{ marginBottom: '16px' }}>
                <select onChange={(e) => {
                    if (e.target.value === 'create') {
                        handleCreateVm();
                    }
                }}>
                    <option value="">Select an action</option>
                    <option value="create">Create VM</option>
                </select>
            </div>
            <form onSubmit={handleCreateVm} style={{ display: 'none' }}>
                <input
                    type="text"
                    placeholder="VM Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="CPU Count"
                    value={cpus}
                    onChange={(e) => setCpus(e.target.value)}
                    required
                />
                <button type="submit">Create VM</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <ul>
                {vms.map((vm) => (
                    <li key={vm.name}>
                        {vm.name} - {vm.vcpus} CPUs {vm.id} - {vm.memory}
                        <button onClick={() => handleDetails(vm.name)}>Details</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default VMList;