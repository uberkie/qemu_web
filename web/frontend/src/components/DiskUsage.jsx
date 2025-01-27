import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Form, Container, Row, Col, Navbar, Nav } from 'react-bootstrap';

import './disk.css';

const DiskUsage = () => {
    const [disks, setDisks] = useState([]);
    const [homeDirs, setHomeDirs] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDisk, setEditingDisk] = useState(null);
    const [diskForm, setDiskForm] = useState({ name: '', size: '', type: 'qcow2' });
    const [loading, setLoading] = useState(true);
    let dirname = "home"
    useEffect(() => {
        // Fetch disk usage data from the backend
        const fetchDiskData = async () => {
            try {
                const diskResponse = await fetch('https://192.168.111.145:8081/api/diskusage');
                const diskData = await diskResponse.json();
                setDisks(diskData.diskStats.split('\n')); // Assuming diskStats comes as a string with multiple lines
                const homeDirsResponse = await fetch('https://192.168.111.145:8081/api/files'); // Adjust URL for dynamic directory
                const homeDirsData = await homeDirsResponse.json();
                setHomeDirs(homeDirsData.homeDir);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };

        fetchDiskData();
    }, []);

    const openModal = (disk = null) => {
        setEditingDisk(disk);
        setDiskForm(disk ? { ...disk, size: disk.size.replace(' GB', '') } : { name: '', size: '', type: 'qcow2' });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingDisk(null);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (editingDisk) {
            setDisks(disks.map(disk => disk.id === editingDisk.id ? { ...diskForm, id: editingDisk.id, size: `${diskForm.size} GB` } : disk));
        } else {
            const newDisk = {
                id: disks.length ? Math.max(...disks.map(disk => disk.id)) + 1 : 1,
                name: diskForm.name,
                size: `${diskForm.size} GB`,
                type: diskForm.type,
                attachedTo: 'Not Attached'
            };
            setDisks([...disks, newDisk]);
        }
        closeModal();
    };

    const handleDeleteDisk = (id) => {
        if (window.confirm('Are you sure you want to delete this disk?')) {
            setDisks(disks.filter(disk => disk.id !== id));
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

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
                            <Nav.Link href="/stats" className="active">VM Stats</Nav.Link>
                            <Nav.Link href="/diskusage"className="active">Host Disks</Nav.Link>
                        </Nav>
                    </Container>
                </Navbar>
            </header>
            <Container className="mt-5">
                <Row className="mb-4">
                    <Col>
                        <h2>Host Disk Management</h2>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Size</th>
                                    <th>Type</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {disks.map((disk, index) => (
                                    <tr key={index}>
                                        <td>{disk}</td>
                                        <td>{disk.size}</td>
                                        <td>{disk.type}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Col>
                </Row>

                <Row className="mt-4">
                    <Col>
                        <h3>Home Directories</h3>
                        <pre>{homeDirs}</pre> {/* Assuming home directories will be shown as a string */}
                    </Col>
                </Row>
            </Container>

            <Modal show={isModalOpen} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingDisk ? 'Edit Disk' : 'Create New Disk'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleFormSubmit}>
                        <Form.Group controlId="diskName">
                            <Form.Label>Disk Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={diskForm.name}
                                onChange={(e) => setDiskForm({ ...diskForm, name: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="diskSize" className="mt-3">
                            <Form.Label>Size (GB)</Form.Label>
                            <Form.Control
                                type="number"
                                value={diskForm.size}
                                onChange={(e) => setDiskForm({ ...diskForm, size: e.target.value })}
                                min="1"
                                required
                            />
                        </Form.Group>
                        <Button variant="success" type="submit" className="mt-3">
                            {editingDisk ? 'Save Changes' : 'Create Disk'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default DiskUsage;
