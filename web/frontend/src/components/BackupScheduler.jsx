import React, { useState } from 'react';
import { Modal, Button, Form, Table, Container, Row, Col, Nav, Navbar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function BackupScheduler() {
    const [backupSchedules, setBackupSchedules] = useState([
        { vm: "Ubuntu-20.04", schedule: "Daily at 02:00", retention: 7, lastBackup: "2023-06-14 02:00", status: "Success" },
        { vm: "Windows-10", schedule: "Weekly on Sunday at 03:00", retention: 30, lastBackup: "2023-06-11 03:00", status: "Success" },
        { vm: "CentOS-8", schedule: "Monthly on 1st at 01:00", retention: 90, lastBackup: "2023-06-01 01:00", status: "Failed" }
    ]);

    const [showModal, setShowModal] = useState(false);
    const [newSchedule, setNewSchedule] = useState({
        vm: "",
        scheduleType: "daily",
        scheduleTime: "",
        retention: ""
    });

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    const addBackupSchedule = (event) => {
        event.preventDefault();
        const { vm, scheduleType, scheduleTime, retention } = newSchedule;

        let scheduleText;
        switch(scheduleType) {
            case 'daily':
                scheduleText = `Daily at ${scheduleTime}`;
                break;
            case 'weekly':
                scheduleText = `Weekly on Sunday at ${scheduleTime}`;
                break;
            case 'monthly':
                scheduleText = `Monthly on 1st at ${scheduleTime}`;
                break;
            default:
                scheduleText = `Daily at ${scheduleTime}`;
        }

        const newScheduleEntry = {
            vm: vm,
            schedule: scheduleText,
            retention: parseInt(retention),
            lastBackup: "N/A",
            status: "Pending"
        };

        setBackupSchedules([...backupSchedules, newScheduleEntry]);
        closeModal();
        alert(`Backup schedule for "${vm}" added successfully.`);
        setNewSchedule({ vm: "", scheduleType: "daily", scheduleTime: "", retention: "" });
    };

    const editSchedule = (vm) => {
        alert(`Editing backup schedule for ${vm}`);
        // Here you would typically open a modal with the current schedule details for editing
    };

    const deleteSchedule = (vm) => {
        if (window.confirm(`Are you sure you want to delete the backup schedule for "${vm}"?`)) {
            setBackupSchedules(backupSchedules.filter(schedule => schedule.vm !== vm));
            alert(`Backup schedule for "${vm}" has been deleted.`);
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewSchedule({ ...newSchedule, [name]: value });
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
                        <h2>Backup Scheduler</h2>
                        <Button variant="success" onClick={openModal}>Add New Backup Schedule</Button>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Table striped bordered hover>
                            <thead>
                            <tr>
                                <th>VM Name</th>
                                <th>Schedule</th>
                                <th>Retention</th>
                                <th>Last Backup</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {backupSchedules.map((schedule, index) => (
                                <tr key={index}>
                                    <td>{schedule.vm}</td>
                                    <td>{schedule.schedule}</td>
                                    <td>{schedule.retention} days</td>
                                    <td>{schedule.lastBackup}</td>
                                    <td>{schedule.status}</td>
                                    <td>
                                        <Button variant="primary" size="sm" onClick={() => editSchedule(schedule.vm)}>Edit</Button>{' '}
                                        <Button variant="danger" size="sm" onClick={() => deleteSchedule(schedule.vm)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Container>

            <Modal show={showModal} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Backup Schedule</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={addBackupSchedule}>
                        <Form.Group controlId="vmSelect">
                            <Form.Label>Virtual Machine</Form.Label>
                            <Form.Control
                                as="select"
                                name="vm"
                                value={newSchedule.vm}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select a VM</option>
                                <option value="Ubuntu-20.04">Ubuntu 20.04 LTS</option>
                                <option value="Windows-10">Windows 10 Pro</option>
                                <option value="CentOS-8">CentOS 8</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="scheduleType" className="mt-3">
                            <Form.Label>Schedule Type</Form.Label>
                            <Form.Control
                                as="select"
                                name="scheduleType"
                                value={newSchedule.scheduleType}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="scheduleTime" className="mt-3">
                            <Form.Label>Time</Form.Label>
                            <Form.Control
                                type="time"
                                name="scheduleTime"
                                value={newSchedule.scheduleTime}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="retention" className="mt-3">
                            <Form.Label>Retention (days)</Form.Label>
                            <Form.Control
                                type="number"
                                name="retention"
                                min="1"
                                max="365"
                                value={newSchedule.retention}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-3">Add Schedule</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default BackupScheduler;
