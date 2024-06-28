import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import 'react-bootstrap';

const VMSnapshots = () => {
    const { name } = useParams();
    const [snapshots, setSnapshots] = useState([]);
    const [error, setError] = useState('');
    const [newSnapshotName, setNewSnapshotName] = useState('');
    const navigate = useNavigate();

    const fetchSnapshots = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:8081/api/vms/${name}/snapshots`);
            setSnapshots(response.data.snapshots);
        } catch (error) {
            setError('Failed to fetch snapshot details');
        }
    }, [name]);

    useEffect(() => {
        fetchSnapshots();
    }, [fetchSnapshots]);

    const handleCreateSnapshot = async (e) => {
        e.preventDefault();
        const date = new Date().toISOString().split('T')[0];
        const snapshotNameWithDate = `${newSnapshotName} ${date}`;
        try {
            const response = await axios.post(`http://localhost:8081/api/vms/${name}/snapshots`, { name: snapshotNameWithDate });
            setSnapshots([...snapshots, snapshotNameWithDate]);
            setNewSnapshotName(''); // Clear the input field
        } catch (error) {
            setError('Failed to create snapshot');
        }
    };

    const handleDeleteSnapshot = async (snapshotName) => {
        try {
            await axios.delete(`http://localhost:8081/api/vms/${name}/snapshots/${snapshotName}`);
            setSnapshots(snapshots.filter(snapshot => snapshot !== snapshotName)); // Remove deleted snapshot
        } catch (error) {
            setError('Failed to delete snapshot');
        }
    };

    const handleRestoreSnapshot = async (snapshotName) => {
        try {
            await axios.post(`http://localhost:8081/api/vms/${name}/snapshots/${snapshotName}/restore`);
            // You might want to fetch snapshots again or handle this based on your needs
        } catch (error) {
            setError('Failed to restore snapshot');
        }
    };

    const handleHome = () => {
        navigate('/vms');
    };

    return (
        <div className="container mt-4">
            <h2>Snapshots for VM: {name}</h2>
            {error && <p className="text-danger">{error}</p>}
            
            <form onSubmit={handleCreateSnapshot} className="mb-3">
                <div className="input-group">
                    <input 
                        type="text" 
                        value={newSnapshotName} 
                        onChange={(e) => setNewSnapshotName(e.target.value)} 
                        placeholder="New Snapshot Name" 
                        className="form-control"
                        required 
                    />
                    <button type="submit" className="btn btn-primary">Create Snapshot</button>
                </div>
            </form>
            
            <ul className="list-group mb-3" style={{ marginBottom: '10px' }}>
                {snapshots.map((snapshot, index) => (
                    <div>
                    <li key={index} >
                        <div >{snapshot}</div>
                        <div>
                            <br/>
                            <button onClick={() => handleRestoreSnapshot(snapshot)} className="btn btn-secondary btn-sm me-2">Restore</button>
                            <button onClick={() => handleDeleteSnapshot(snapshot)} className="btn btn-danger btn-sm">Delete</button>
                        </div>
                    </li>
                    </div>
                ))}
            </ul>
            <button onClick={handleHome} className="btn btn-secondary">Back to VMs</button>
        </div>
    );
};

export default VMSnapshots;