import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Button, Form, Table, Container, Row, Col, Nav, Navbar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useParams } from "react-router-dom";
import axios from "axios";

function SnapshotManager() {
    const { name } = useParams(); // 'name' represents the VM name from the URL parameter
    const [snapshots, setSnapshots] = useState([]);
    const [vmNames, setVmNames] = useState([]);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newSnapshot, setNewSnapshot] = useState({ name: '', vm: '', description: '' });

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    // Fetch all VM names
    const fetchVMNames = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:8081/api/vms');
            if (response.data && Array.isArray(response.data.vms)) {
                setVmNames(response.data.vms.map(vm => vm.name));
            } else {
                setError('Failed to fetch VM names');
            }
        } catch (error) {
            setError('Failed to fetch VM names');
        }
    }, []);

    // Fetch snapshots for a specific VM name
    const fetchSnapshotsForVM = async (vmName) => {
        try {
            const response = await axios.get(`http://localhost:8081/api/vms/${vmName}/snapshots`);
            return response.data.snapshots.map(snapshot => ({ ...snapshot, vmName }));
        } catch (error) {
            console.error(`Failed to fetch snapshots for VM "${vmName}": ${error}`);
            return [];
        }
    };

    // Fetch snapshots for all VMs
    const fetchSnapshots = useCallback(async () => {
        try {
            const allSnapshots = await Promise.all(vmNames.map(vmName => fetchSnapshotsForVM(vmName)));
            setSnapshots(allSnapshots.flat());
        } catch (error) {
            setError('Failed to fetch snapshot details');
        }
    }, [vmNames]);

    useEffect(() => {
        fetchVMNames();
    }, [fetchVMNames]);

    useEffect(() => {
        if (vmNames.length > 0) {
            fetchSnapshots();
        }
    }, [fetchSnapshots, vmNames]);

    const createSnapshot = async (event) => {
        event.preventDefault();
        const date = new Date().toISOString().split('T')[0];
        const snapshotNameWithDate = `${newSnapshot.name} ${date}`;
        try {
            await axios.post(`http://localhost:8081/api/vms/${newSnapshot.vm}/snapshots`, { name: snapshotNameWithDate });
            setSnapshots([...snapshots, { name: snapshotNameWithDate, date, size: `${(Math.random() * 5 + 1).toFixed(1)} GB`, vmName: newSnapshot.vm }]);
            setNewSnapshot({ name: '', vm: '', description: '' });
            closeModal();
        } catch (error) {
            setError('Failed to create snapshot');
        }
    };

    const restoreSnapshot = async (snapshot) => {
        if (window.confirm(`Are you sure you want to restore the snapshot "${snapshot.name}" for VM "${snapshot.vmName}"?`)) {
            try {
                await axios.post(`http://localhost:8081/api/vms/${snapshot.vmName}/snapshots/${snapshot.name}/restore`);
                alert(`Snapshot "${snapshot.name}" restored successfully.`);
            } catch (error) {
                setError('Failed to restore snapshot');
            }
        }
    };

    const deleteSnapshot = async (snapshot) => {
        if (window.confirm(`Are you sure you want to delete the snapshot "${snapshot.name}" for VM "${snapshot.vmName}"?`)) {
            try {
                await axios.delete(`http://localhost:8081/api/vms/${snapshot.vmName}/snapshots/${snapshot.name}`);
                setSnapshots(snapshots.filter(snap => snap.name !== snapshot.name || snap.vmName !== snapshot.vmName));
                alert(`Snapshot "${snapshot.name}" deleted successfully.`);
            } catch (error) {
                setError('Failed to delete snapshot');
            }
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewSnapshot(prevSnapshot => ({ ...prevSnapshot, [name]: value }));
    };

    let nada;
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
                            <Nav.Link href="/pcidev" className="active">PCI Devices</Nav.Link>
                        </Nav>
                    </Container>
                </Navbar>
            </header>
            <Container className="mt-5">
                <Row className="mb-4">
                    <Col>
                        <h2>Snapshots Management</h2>
                        <Button variant="success" onClick={openModal}>Create New Snapshot</Button>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Table striped bordered hover>
                            <thead>
                            <tr>
                                <th>Date Created</th>
                                <th>VM</th>
                                <th>Name</th>

                                <th>Size</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {snapshots.map(snapshot => (

                                <tr key={`${snapshot.vmName}-${snapshot.name}`}>
                                    {`${nada = snapshot.name.split(' ')[1]?.toLowerCase()}`}
                                    <td>{snapshot.vmName}</td>
                                    <td>{snapshot.name}</td>
                                    <td>{snapshot.size}</td>
                                    <td>
                                        <Button variant="primary" size="sm" onClick={() => restoreSnapshot(snapshot)}>Restore</Button>{' '}
                                        <Button variant="danger" size="sm" onClick={() => deleteSnapshot(snapshot)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                        {error && <p className="text-danger">{error}</p>}
                    </Col>
                </Row>
            </Container>

            <Modal show={showModal} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Create New Snapshot</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={createSnapshot}>
                        <Form.Group controlId="snapshotName">
                            <Form.Label>Snapshot Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={newSnapshot.name}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="vmSelect" className="mt-3">
                            <Form.Label>Virtual Machine</Form.Label>
                            <Form.Control
                                as="select"
                                name="vm"
                                value={newSnapshot.vm}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select a VM</option>
                                {vmNames.map(vm => (
                                    <option key={vm} value={vm}>{vm}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="snapshotDescription" className="mt-3">
                            <Form.Label>Description (optional)</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="description"
                                rows="3"
                                value={newSnapshot.description}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-3">Create Snapshot</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default SnapshotManager;
