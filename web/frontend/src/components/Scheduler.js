import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const Scheduler = () => {
    const { vmName } = useParams(); // Extract the VM name from URL
    const [snapshotName, setSnapshotName] = useState('');
    const [day, setDay] = useState('*');
    const [interval, setInterval] = useState('*/1');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSchedule = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8081/api/scheduler', {
                vm_name: vmName,
                snapshot_name: snapshotName,
                day,
                interval
            });
            setMessage(response.data.message);
        } catch (error) {
            setMessage('Error scheduling snapshot');
        }
    };
    const handleHome = () => {
        navigate('/vms');
    };
    return (
        <div className="w3-theme-d5">
            <h2>Schedule Snapshot for VM: {vmName}</h2>
            <form onSubmit={handleSchedule}>
                <input
                    type="text"
                    placeholder="Snapshot Name"
                    value={snapshotName}
                    onChange={(e) => setSnapshotName(e.target.value)}
                    required
                />
                <select value={day} onChange={(e) => setDay(e.target.value)}>
                    <option value="*">Every Day</option>
                    <option value="0">Sunday</option>
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                </select>
                <select value={interval} onChange={(e) => setInterval(e.target.value)}>
                    <option value="*/1">Every Minute</option>
                    <option value="*/5">Every 5 Minutes</option>
                    <option value="*/30">Every 30 Minutes</option>
                    <option value="0 0">Daily at Midnight</option>
                    <option value="0 12">Daily at Noon</option>
                </select>
                <button type="submit">Schedule Snapshot</button>
            </form>
            {message && <p>{message}</p>}
            <div>
                <button onClick={handleHome} className="btn btn-secondary">Back to VMs</button>
            </div>
        </div>

    );
};

export default Scheduler;
