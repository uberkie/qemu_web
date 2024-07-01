import React, { useState } from 'react';
import { Container, Row, Col, Button, Table, Modal, Form, Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function PCIDeviceManager() {
    const [pciDevices, setPciDevices] = useState([
        { id: "0000:00:01.0", type: "VGA", description: "NVIDIA GeForce RTX 3080", status: "Available" },
        { id: "0000:00:02.0", type: "Network", description: "Intel I211 Gigabit Network Connection", status: "In use" },
        { id: "0000:00:03.0", type: "Storage", description: "Samsung NVMe SSD Controller", status: "Available" },
        { id: "0000:00:04.0", type: "Audio", description: "Realtek ALC1220 Audio Controller", status: "Available" }
    ]);

    const [showModal, setShowModal] = useState(false);
    const [newDevice, setNewDevice] = useState({ type: '', model: '', description: '' });

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewDevice(prevDevice => ({ ...prevDevice, [name]: value }));
    };

    const addDevice = (event) => {
        event.preventDefault();
        const newDeviceEntry = {
            id: `0000:00:0${pciDevices.length + 1}.0`,
            type: newDevice.type,
            description: `${newDevice.model} - ${newDevice.description}`,
            status: "Available"
        };
        setPciDevices(prevDevices => [...prevDevices, newDeviceEntry]);
        closeModal();
        setNewDevice({ type: '', model: '', description: '' });
        alert(`Virtual PCI device "${newDeviceEntry.description}" added successfully.`);
    };

    const attachDevice = (id) => {
        if (window.confirm("Are you sure you want to attach this device?")) {
            setPciDevices(prevDevices =>
                prevDevices.map(device => device.id === id ? { ...device, status: 'In use' } : device)
            );
            alert("Device attached successfully.");
        }
    };

    const detachDevice = (id) => {
        if (window.confirm("Are you sure you want to detach this device?")) {
            setPciDevices(prevDevices =>
                prevDevices.map(device => device.id === id ? { ...device, status: 'Available' } : device)
            );
            alert("Device detached successfully.");
        }
    };

    const scanDevices = () => {
        alert("Scanning for new PCI devices...");
        // Implement actual scanning logic here
        setTimeout(() => {
            alert("Scan complete. No new devices found.");
        }, 2000);
    };

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
            <Container className="mt-4">
                <Row>
                    <Col>
                        <h2>PCI Device Management</h2>
                        <Button variant="primary" onClick={scanDevices}>Scan for New Devices</Button>{' '}
                        <Button variant="success" onClick={openModal}>Add Virtual Device</Button>
                    </Col>
                </Row>
                <Table striped bordered hover className="mt-4">
                    <thead>
                    <tr>
                        <th>Device ID</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {pciDevices.map(device => (
                        <tr key={device.id}>
                            <td>{device.id}</td>
                            <td>{device.type}</td>
                            <td>{device.description}</td>
                            <td>{device.status}</td>
                            <td>
                                {device.status === 'Available' ? (
                                    <Button variant="primary" size="sm" onClick={() => attachDevice(device.id)}>Attach</Button>
                                ) : (
                                    <Button variant="danger" size="sm" onClick={() => detachDevice(device.id)}>Detach</Button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            </Container>

            <Modal show={showModal} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Virtual PCI Device</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={addDevice}>
                        <Form.Group controlId="deviceType">
                            <Form.Label>Device Type</Form.Label>
                            <Form.Control
                                as="select"
                                name="type"
                                value={newDevice.type}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select a device type</option>
                                <option value="network">Network Card</option>
                                <option value="storage">Storage Controller</option>
                                <option value="gpu">Graphics Card</option>
                                <option value="sound">Sound Card</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="deviceModel" className="mt-3">
                            <Form.Label>Device Model</Form.Label>
                            <Form.Control
                                type="text"
                                name="model"
                                value={newDevice.model}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="deviceDescription" className="mt-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                type="text"
                                name="description"
                                value={newDevice.description}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-3">Add Device</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default PCIDeviceManager;
