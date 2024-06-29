import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import Modal from 'react-modal';
import '../comp.css';

const VMList = () => {
    const [vms, setVms] = useState([]);
    const [name, setName] = useState('');
    const [cpus, setCpus] = useState('');
    const [error, setError] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedVm, setSelectedVm] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchVms();
    }, []);

    const fetchVms = async () => {
        try {
            const response = await axios.get('http://localhost:8081/api/vms');
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
            const response = await axios.post('http://localhost:8081/api/vms/create', {name, cpus});
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

    const openModal = (vm) => {
        setSelectedVm(vm);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedVm(null);
    };

    const getStateMessage = (state) => {
        switch (state) {
            case 1: return 'Running';
            case 2: return 'BLOCKED';
            case 3: return 'PAUSED';
            case 4: return 'SHUTDOWN';
            case 5: return 'SHUTOFF';
            case 6: return 'CRASHED';
            case 7: return 'SUSPENDED';
            default: return 'UNKNOWN';
        }
    };

    const getOSLogo = (osUrl) => {
        // Extract the OS name from the URL (e.g., "ubuntu" from "http://ubuntu.com/ubuntu/20.04")
        const osKey = osUrl.split('/')[2]?.toLowerCase();

        // Map common OS keys to their logo URLs
        const osLogos = {
            'ubuntu.com': 'https://assets.ubuntu.com/v1/29985a98-ubuntu-logo32.png',
            'redhat.com': 'https://www.redhat.com/profiles/rh/themes/redhatdotcom/img/logo.png',
            'centos.org': 'https://www.centos.org/wp-content/themes/centos7/images/centos.png',
            'debian.org': 'https://www.debian.org/logos/openlogo-nd-100.png',
            'suse.com': 'https://www.suse.com/wp-content/uploads/2020/01/suse-logo-icon.png',
            'windows.com': 'https://upload.wikimedia.org/wikipedia/commons/4/48/Windows_logo_-_2021.svg'
        };

        // Return the logo URL or a default logo if not found
        return osLogos[osKey] || 'https://via.placeholder.com/32'; // Default or placeholder logo
    };

    return (
        <div className="w3-theme-d5">
            <h2>VM List</h2>
            <form onSubmit={handleCreateVm}>
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
            {error && <p style={{color: 'red'}}>{error}</p>}
            <ul>
                {vms.map((vm) => (
                    <li key={vm.name} style={{ color: vm.state !== 'Running' ? 'red' : 'inherit' }}>
                        <img src={getOSLogo(vm.vm_os)} alt="OS Logo" style={{height: '50px', width: '50px'}} /> <br />
                        <h2>{vm.name} - State: {getStateMessage(vm.state)}</h2> <br />
                        <button onClick={() => openModal(vm)}>Details</button>
                    </li>
                ))}
            </ul>
            {selectedVm && (
                <div className="w3-theme-d5">
                <Modal isOpen={modalIsOpen} onRequestClose={closeModal} ariaHideApp={false}>
                    <div className="w3-theme-d5" style={{inset: "0", padding: "0"}}>
                        <h2>{selectedVm.name}</h2>

                        <div>
                            <img src={getOSLogo(selectedVm.vm_os)} alt="OS Logo" style={{height: '50px', width: '50px'}} />
                            <p>ID: {selectedVm.id}</p>
                            <p>CPUs: {selectedVm.vcpus}</p>
                            <p>Memory: {selectedVm.memory / 1024} MB</p>
                            <p style={{ color: selectedVm.state !== 'Running' ? 'red' : 'inherit' }}>State: {getStateMessage(selectedVm.state)}</p>
                            <p>OS: {selectedVm.vm_os}</p>
                        </div>

                        <button onClick={() => handleDetails(selectedVm.name)}>Show Details</button>
                        <button onClick={closeModal}>Close</button>
                    </div>
                </Modal>
                </div>
            )}
        </div>
    );
};

export default VMList;
