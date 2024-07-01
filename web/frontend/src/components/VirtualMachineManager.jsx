import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Card, Container, Row, Col, Nav, Navbar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";

function VirtualMachineManager() {
    const [vms, setVms] = useState([]);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newVM, setNewVM] = useState({ name: '', os: 'ubuntu', cpu: 1, ram: 1, disk: 10 });
    const [cpus, setCpus] = useState('');

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

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewVM(prevVM => ({ ...prevVM, [name]: name === 'name' ? value : parseInt(value) }));
    };

    const handleCreateVm = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8081/api/vms/create', newVM);
            setVms([...vms, response.data]);
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
            case 3: return 'PAUSED';
            case 4: return 'stopped';
            case 5: return 'stopped';
            case 6: return 'CRASHED';
            case 7: return 'SUSPENDED';
            default: return 'UNKNOWN';
        }
    };
    const updateVMStatus = (id, newStatus) => {
        setVms(prevVms => prevVms.map(vm => vm.id === id ? { ...vm, status: newStatus } : vm));
    };

    const getOSLogo = (osUrl) => {
        // Extract the OS name from the URL (e.g., "ubuntu" from "http://ubuntu.com/ubuntu/20.04")
        const osKey = osUrl.split('/')[2]?.toLowerCase();
        const sKey = osUrl.split('/')[3]?.toLowerCase();
        const nKey = osUrl.split('/')[4]?.toLowerCase();



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
        return sKey + nKey //osLogos[osKey] || 'https://via.placeholder.com/32'; // Default or placeholder logo
    };

    const renderVMGrid = () => (
        <Row className="mt-4">
            {vms.map(vm => (
                <Col key={vm.id} md={4} className="mb-4">
                    <Card>
                        <Card.Body>
                            <Card.Title>{vm.name}</Card.Title>
                            <Card.Text><strong>OS:</strong> {getOSLogo(vm.vm_os)}</Card.Text>
                            <Card.Text><strong>Status:</strong> <span className={`vm-status status-${vm.state}`}>{getStateMessage(vm.state)}</span></Card.Text>
                            <Card.Text><strong>CPU:</strong> {vm.vcpus} cores</Card.Text>
                            <Card.Text><strong>RAM:</strong> {vm.memory / 1024 / 1024} GB</Card.Text>
                            <Card.Text><strong>Disk:</strong> {(vm.disk_capacity / 1024 / 1024 / 1024).toFixed(2)} GB</Card.Text>
                            <div className="vm-actions">
                                {getStateMessage(vm.state) === 'running' ? (
                                    <>
                                        <Button variant="primary" size="sm" onClick={() => console.log(`Connecting to VM ${vm.id}`)}>Connect</Button>{' '}
                                        <Button variant="warning" size="sm" onClick={() => updateVMStatus(vm.id, 'paused')}>Pause</Button>{' '}
                                        <Button variant="danger" size="sm" onClick={() => updateVMStatus(vm.id, 'stopped')}>Stop</Button>
                                    </>
                                ) : getStateMessage(vm.state) === 'stopped' ? (
                                    <>
                                        <Button variant="success" size="sm" onClick={() => updateVMStatus(vm.id, 'running')}>Start</Button>{' '}
                                        <Button variant="primary" size="sm" onClick={() => console.log(`Editing VM ${vm.id}`)}>Edit</Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="success" size="sm" onClick={() => updateVMStatus(vm.id, 'running')}>Resume</Button>{' '}
                                        <Button variant="danger" size="sm" onClick={() => updateVMStatus(vm.id, 'stopped')}>Stop</Button>
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
        </div>
    );
}

export default VirtualMachineManager;
