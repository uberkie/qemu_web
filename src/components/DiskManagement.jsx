import React, { useState } from 'react';
import { Modal, Button, Form, Table, Container, Row, Col, Nav, Navbar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const DiskManagement = () => {
    const [disks, setDisks] = useState([
        { id: 1, name: 'ubuntu-root', size: '20 GB', type: 'qcow2', attachedTo: 'Ubuntu 20.04 LTS' },
        { id: 2, name: 'data-disk-1', size: '100 GB', type: 'raw', attachedTo: 'Windows 10 Pro' },
        { id: 3, name: 'backup-disk', size: '500 GB', type: 'vdi', attachedTo: 'Not Attached' },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDisk, setEditingDisk] = useState(null);
    const [diskForm, setDiskForm] = useState({ name: '', size: '', type: 'qcow2' });

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
                <Row className="mb-4">
                    <Col>
                        <h2>Disk Management</h2>
                        <Button variant="primary" onClick={() => openModal()}>Create New Disk</Button>
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
                                <th>Attached To</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {disks.map(disk => (
                                <tr key={disk.id}>
                                    <td>{disk.name}</td>
                                    <td>{disk.size}</td>
                                    <td>{disk.type}</td>
                                    <td>{disk.attachedTo}</td>
                                    <td>
                                        <Button variant="primary" size="sm" onClick={() => openModal(disk)}>Edit</Button>{' '}
                                        <Button variant="danger" size="sm" onClick={() => handleDeleteDisk(disk.id)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
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
                        <Form.Group controlId="diskType" className="mt-3">
                            <Form.Label>Type</Form.Label>
                            <Form.Control
                                as="select"
                                value={diskForm.type}
                                onChange={(e) => setDiskForm({ ...diskForm, type: e.target.value })}
                                required
                            >
                                <option value="qcow2">QCOW2</option>
                                <option value="raw">Raw</option>
                                <option value="vdi">VDI</option>
                            </Form.Control>
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

export default DiskManagement;
