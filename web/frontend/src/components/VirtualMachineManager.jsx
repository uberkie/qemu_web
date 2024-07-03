import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Card, Container, Row, Col, Nav, Navbar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";
import io from 'socket.io-client';
import { confirmAlert } from 'react-confirm-alert';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function VirtualMachineManager() {
    const [vms, setVms] = useState([]);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newVM, setNewVM] = useState({ name: '', os: 'ubuntu', cpu: 1, ram: 1, disk: 10 });
    const [cpus, setCpus] = useState('');
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const socket = io('http://127.0.0.1:5000'); // Replace with your WebSocket server URL
        setSocket(socket);

        // Fetch initial VMs
        fetchVms();

        // Subscribe to events
        socket.on('vm_created', handleVmCreated);
        socket.on('vm_status_updated', updateVMStatus);

        return () => {
            socket.disconnect();
        };
    }, []);

    const showError = (message) => toast.error(message);
    const showSuccess = (message) => toast.success(message);

    const fetchVms = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/api/vms');
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

    const handleVmCreated = (vm) => {
        setVms(prevVms => [...prevVms, vm]);
    };

    

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewVM(prevVM => ({ ...prevVM, [name]: name === 'name' ? value : parseInt(value) }));
    };

    const handleCreateVm = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:5000/api/vms/create', newVM);
            setVms([...vms, response.data]);

            // Emit event to server
            socket.emit('create_vm', response.data);

            closeModal();
            setNewVM({ name: '', os: 'ubuntu', cpu: 1, ram: 1, disk: 10 });
        } catch (error) {
            console.error("Error creating VM", error);
            setError('Failed to create VM');
        }
    };

    const openModal = () => setShowModal(true);
    const closeModal = () => {
        setShowModal(false);
        setNewVM({ name: '', os: 'ubuntu', cpu: 1, ram: 1, disk: 10 });
    };
    const getStateMessage = (state) => {
        switch (state) {
            case 1: return 'running';
            case 2: return 'BLOCKED';
            case 3: return 'paused';
            case 4: return 'shutdown';
            case 5: return 'poweroff';
            case 6: return 'CRASHED';
            case 7: return 'SUSPENDED';
            default: return 'UNKNOWN';
        }
    };

    const confirmAction = (action, vm) => {
        confirmAlert({
            title: 'Confirm action',
            message: `Are you sure you want to ${action} this VM?`,
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => performAction(action, vm)
                },
                {
                    label: 'No',
                    onClick: () => {}
                }
            ]
        });
    };

    const performAction = async (action, vm) => {
        try {
            // Define action mapping
            const actionMap = {
                start: 'start',
                resume: 'resume',
                reboot: 'reboot',
                stop: 'shutdown',
                poweroff: 'poweroff',

            };

            // Get the mapped action
            const apiAction = actionMap[action];
            if (!apiAction) {
                showError(`Unknown action: ${action}`);
                return;
            }

            // Construct the URL
            const url = `http://127.0.0.1:5000/api/vms/${vm.name}/control/${apiAction}`;
            console.log(url);

            // Make the request
            await axios.post(url);

            // Success message
            showSuccess(`VM ${action} successful`);
            await fetchVms(); // Refresh VM list
        } catch (error) {
            // Error handling
            if (error.response && error.response.data && error.response.data.message) {
                showError(`Failed to ${action} VM: ${error.response.data.message}`);
            } else {
                showError(`Failed to ${action} VM: ${error.message}`);
            }
        }
    };

    const updateVMStatus = async (id, newStatus) => {
        try {
            await fetchVms();
            const vm = vms.find(vm => vm.id === id);
            if (!vm) {
                showError('VM not found');
                return;
            }

            if ((vm.state === 1 && newStatus.toLowerCase() === 'start') || 
                ((vm.state === 4 || vm.state === 5) && (newStatus.toLowerCase() === 'shutdown' || newStatus.toLowerCase() === 'poweroff'))) {
                showError(`VM is already ${getStateMessage(vm.state)}`);
                return;
            }

            await performAction(newStatus.toLowerCase(), vm);
            
            setVms(prevVms => prevVms.map(vm => vm.id === id ? { ...vm, status: newStatus } : vm));
        } catch (error) {
            console.error("Error updating VM status", error);
            showError('Failed to update VM status');
        }
    };

    const renderVMGrid = () => (
        <Row className="mt-4">
            {vms.map(vm => (
                <Col key={vm.id} md={4} className="mb-4">
                    <Card>
                        <Card.Body>
                            <Card.Title>{vm.name}</Card.Title>
                            {/* <Card.Text><strong>OS:</strong> <img src={getOSLogo(vm.os)} alt={vm.os} width="32" /></Card.Text> */}
                            <Card.Text><strong>Status:</strong> <span className={`vm-status status-${vm.state}`}>{getStateMessage(vm.state)}</span></Card.Text>
                            <Card.Text><strong>CPU:</strong> {vm.vcpus} cores</Card.Text>
                            <Card.Text><strong>RAM:</strong> {vm.memory / 1024 / 1024} GB</Card.Text>
                            <Card.Text><strong>Disk:</strong> {(vm.disk_capacity / 1024 / 1024 / 1024).toFixed(2)} GB</Card.Text>
                            <div className="vm-actions">
                                {getStateMessage(vm.state) === 'running' ? (
                                    <>
                                        <Button variant="primary" size="sm" onClick={() => console.log(`Connecting to VM ${vm.id}`)}>Connect</Button>{' '}
                                        <Button variant="warning" size="sm" onClick={() => updateVMStatus(vm.id, 'PAUSED')}>Pause</Button>{' '}
                                        <Button variant="danger" size="sm" onClick={() => updateVMStatus(vm.id, 'poweroff')}>Power Off</Button>
                                    </>
                                ) : getStateMessage(vm.state) === 'poweroff' ? (
                                    <>
                                        <Button variant="success" size="sm" onClick={() => updateVMStatus(vm.id, 'start')}>Start</Button>{' '}
                                        <Button variant="primary" size="sm" onClick={() => console.log(`Editing VM ${vm.id}`)}>Edit</Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="success" size="sm" onClick={() => updateVMStatus(vm.id, 'start')}>Start</Button>{' '}
                                        <Button variant="danger" size="sm" onClick={() => updateVMStatus(vm.id, 'poweroff')}>Power Off</Button>
                                    </>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    );

    return (
        <div>
            <header>
                <Navbar bg="dark" variant="dark">
                    <Container>
                        <Navbar.Brand href="#home">QemuUI</Navbar.Brand>
                        <Nav className="me-auto">
                            <Nav.Link href="/vms" className="active">Virtual Machines</Nav.Link>
                            <Nav.Link href="/disks" className="active">Disks</Nav.Link>
                            <Nav.Link href="/snapshot" className="active">Snapshots</Nav.Link>
                            <Nav.Link href="/settings" className="active">Settings</Nav.Link>
                            <Nav.Link href="/xmleditor" className="active">XML Editor</Nav.Link>
                            <Nav.Link href="/backups" className="active">Backup Manager</Nav.Link>
                            <Nav.Link href="/pcidev" className="active">Pci Devices</Nav.Link>
                        </Nav>
                    </Container>
                </Navbar>
            </header>
            <Container className="mt-5">
                <Row>
                    <Col>
                        <h2>Virtual Machines</h2>
                        <Button variant="success" onClick={openModal}>Create New VM</Button>
                    </Col>
                </Row>
                {renderVMGrid()}
            </Container>

            <Modal show={showModal} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Create New Virtual Machine</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleCreateVm}>
                        <Form.Group controlId="vmName">
                            <Form.Label>VM Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={newVM.name}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="vmOS" className="mt-3">
                            <Form.Label>Operating System</Form.Label>
                            <Form.Control
                                as="select"
                                name="os"
                                value={newVM.os}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="ubuntu">Ubuntu</option>
                                <option value="windows">Windows</option>
                                <option value="fedora">Fedora</option>
                                <option value="debian">Debian</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="vmCPU" className="mt-3">
                            <Form.Label>CPU Cores</Form.Label>
                            <Form.Control
                                type="number"
                                name="cpu"
                                min="1"
                                max="16"
                                value={newVM.cpu}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="vmRAM" className="mt-3">
                            <Form.Label>RAM (GB)</Form.Label>
                            <Form.Control
                                type="number"
                                name="ram"
                                min="1"
                                max="64"
                                value={newVM.ram}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="vmDisk" className="mt-3">
                            <Form.Label>Disk Size (GB)</Form.Label>
                            <Form.Control
                                type="number"
                                name="disk"
                                min="10"
                                max="1000"
                                value={newVM.disk}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-3">Create VM</Button>
                    </Form>
                </Modal.Body>
            </Modal>
            <ToastContainer />
        </div>
    );
}

export default VirtualMachineManager;