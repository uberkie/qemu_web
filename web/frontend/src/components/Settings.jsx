import React, { useState } from 'react';
import {Container, Nav, Navbar} from "react-bootstrap";

function Settings() {
    const [settings, setSettings] = useState({
        defaultVMPath: '/var/lib/qemu',
        maxConcurrentVMs: 4,
        autoStart: true,
        defaultNetworkMode: 'nat',
        vncPassword: '',
        cpuType: 'host',
        ioMode: 'native',
        updateChannel: 'stable',
        backupSchedule: 'daily'
    });

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        setSettings({
            ...settings,
            [name]: value
        });
    };

    const saveSettings = (event) => {
        event.preventDefault();
        // Here you would typically send the settings to your backend
        console.log('Saving settings:', settings);
        alert('Settings saved successfully!');
    };

    const resetSettings = () => {
        if (window.confirm('Are you sure you want to reset all settings to their default values?')) {
            setSettings({
                defaultVMPath: '/var/lib/qemu',
                maxConcurrentVMs: 4,
                autoStart: true,
                defaultNetworkMode: 'nat',
                vncPassword: '',
                cpuType: 'host',
                ioMode: 'native',
                updateChannel: 'stable',
                backupSchedule: 'daily'
            });
            alert('Settings have been reset to defaults. Remember to save your changes.');
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
                            <Nav.Link href="/stats" className="active">VM Stats</Nav.Link>
                            <Nav.Link href="/diskusage"className="active">Host Disks</Nav.Link>

                        </Nav>
                    </Container>
                </Navbar>
            </header>
            <div className="content">
                <h2>Settings</h2>
                <form onSubmit={saveSettings}>
                    <div className="settings-grid">
                        <div className="settings-section">
                            <h3>General Settings</h3>
                            <div className="form-group">
                                <label htmlFor="defaultVMPath">Default VM Storage Path:</label>
                                <input type="text" id="defaultVMPath" name="defaultVMPath" value={settings.defaultVMPath} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="maxConcurrentVMs">Max Concurrent VMs:</label>
                                <input type="number" id="maxConcurrentVMs" name="maxConcurrentVMs" min="1" max="10" value={settings.maxConcurrentVMs} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>
                                    <input type="checkbox" id="autoStart" name="autoStart" checked={settings.autoStart} onChange={handleInputChange} />
                                    Auto-start VMs on boot
                                </label>
                            </div>
                        </div>
                        <div className="settings-section">
                            <h3>Network Settings</h3>
                            <div className="form-group">
                                <label htmlFor="defaultNetworkMode">Default Network Mode:</label>
                                <select id="defaultNetworkMode" name="defaultNetworkMode" value={settings.defaultNetworkMode} onChange={handleInputChange}>
                                    <option value="bridged">Bridged</option>
                                    <option value="nat">NAT</option>
                                    <option value="host-only">Host-only</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="vncPassword">VNC Password:</label>
                                <input type="password" id="vncPassword" name="vncPassword" value={settings.vncPassword} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="settings-section">
                            <h3>Performance</h3>
                            <div className="form-group">
                                <label htmlFor="cpuType">CPU Type:</label>
                                <select id="cpuType" name="cpuType" value={settings.cpuType} onChange={handleInputChange}>
                                    <option value="host">Host CPU</option>
                                    <option value="qemu64">QEMU64</option>
                                    <option value="qemu32">QEMU32</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="ioMode">I/O Mode:</label>
                                <select id="ioMode" name="ioMode" value={settings.ioMode} onChange={handleInputChange}>
                                    <option value="native">Native</option>
                                    <option value="threads">Threads</option>
                                    <option value="io_uring">io_uring</option>
                                </select>
                            </div>
                        </div>
                        <div className="settings-section">
                            <h3>Updates & Maintenance</h3>
                            <div className="form-group">
                                <label htmlFor="updateChannel">Update Channel:</label>
                                <select id="updateChannel" name="updateChannel" value={settings.updateChannel} onChange={handleInputChange}>
                                    <option value="stable">Stable</option>
                                    <option value="beta">Beta</option>
                                    <option value="nightly">Nightly</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="backupSchedule">Backup Schedule:</label>
                                <select id="backupSchedule" name="backupSchedule" value={settings.backupSchedule} onChange={handleInputChange}>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="never">Never</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="action-buttons">
                        <button type="button" className="btn btn-danger" onClick={resetSettings}>Reset to Defaults</button>
                        <button type="submit" className="btn btn-primary">Save Settings</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Settings;