import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';


const VMDetails = () => {
    const { name } = useParams();
    const [vcpus, setVcpus] = useState('');
    const [id, setId] = useState('');
    const [memory, setMemory] = useState('');
    const [vm_os, setVm_os] = useState('');

    const [vm, setVm] = useState(null);

    let stateMessage;
    if (vm && vm.state === 5) {
        stateMessage = 'SHUTOFF';
    } else if (vm && vm.state === 1) {
        stateMessage = 'Running';
    } else if (vm && vm.state === 2) {
        stateMessage = 'BLOCKED';
    } else if (vm && vm.state === 3) {
        stateMessage = 'PAUSED';
    } else if (vm && vm.state === 4) {
        stateMessage = 'SHUTDOWN';
    } else if (vm && vm.state === 6) {
        stateMessage = 'CRASHED';
    } else if (vm && vm.state === 7) {
        stateMessage = 'SUSPENDED';
    } 
    
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchVm();
    }, [name]);

    const fetchVm = async () => {
        try {
            const response = await axios.get(`http://localhost:8081/api/vms/${name}/`);
            setVm(response.data);
        } catch (error) {
            setError('Failed to fetch VM details');
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:8081/api/vms/${name}/`);
            navigate('/vms');
        } catch (error) {
            setError('Failed to delete VM');
        }
    };

    const handleHome = async () => {
        try {
            await axios.get(`http://localhost:8081/api/vms`);
            navigate('/vms');
        } catch (error) {
            setError('Failed to delete VM');
        }
    };
    const handleSnapshot = async () => {
        try {
            await axios.get(`http://localhost:8081/api/vms/${name}/snapshots`);
            navigate(`/vms/${name}/snapshots`);
        } catch (error) {
            setError('Failed to open  VM Snapshots');
        }
    };

    if (!vm) return <p>Loading...</p>;

    return (
        <div  className="w3-theme-d5">
            <h2>VM Name: {name}</h2>
            <p>CPU Count: {vm.vcpus}</p>
            <p>ID: {vm.id}</p>
            <p>Memory: {(vm.memory / 1024 / 1024).toFixed(2)} GB</p>
            <p style={{ color: vm.state !== 'Running' ? 'red' : 'inherit' }}>State: {stateMessage}</p>
            <p>OS: {vm.vm_os}</p>
            <div>
            <p>Disks:</p>
            <ul>
                <div>
                {vm.disks.map((disk, index) => (
                    <li key={index}>
                        {Object.entries(disk).map(([key, value]) => (
                            <span key={key} style={{ display: 'block' }}>
                                {key === 'target' ? 'device name' : key}: {JSON.stringify(value)}
                            </span>
                        ))}
                    </li>
                ))}
                </div>
            </ul>
            </div>
            <div>
            <p>Cdroms:</p>
            <ul>
            <div>
                {vm.cdroms.map((cdrom, index) => (
                    <li key={index}>
                        {Object.entries(cdrom).map(([key, value]) => (
                            <span key={key} style={{ display: 'block' }}>
                                {key === 'target' ? 'device name' : key}: {JSON.stringify(value)}
                            </span>
                        ))}
                    </li>
                ))}
                </div>
            </ul>
            </div>
            <div style={{ marginBottom: '16px' }}>
                <select onChange={(e) => {
                    if (e.target.value === 'delete') {
                        handleDelete();
                    } else if (e.target.value === 'home') {
                        handleHome();
                    } else if (e.target.value === 'snapshot') {
                        handleSnapshot();
                    }
                }}>
                    <option value="">Select an action</option>
                    <option value="delete">Delete VM</option>
                    <option value="home">Home</option>
                    <option value="snapshot">View Snapshot</option>
                </select>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default VMDetails;