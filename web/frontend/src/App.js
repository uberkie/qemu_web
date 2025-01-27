import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import BackupScheduler from './components/BackupScheduler';
import Settings from './components/Settings';
import VirtualMachineManager from './components/VirtualMachineManager';
import SnapshotManager from './components/SnapshotManager';
import XMLEditor from './components/XMLEditor';
import DiskManagement from './components/DiskManagement';
import PCIDeviceManager from './components/PCIDeviceManager';
import VMStats from "./components/VMStats";
import RemoteConsole from './components/RemoteConsole';
import DiskUsage from "./components/DiskUsage";

const App = () => {
  const [isAuth, setAuth] = useState(false);

    return (
        <Router>
            <div className="App">
                <Routes>
                  <Route path="/" element={isAuth ? <Navigate to="/vms" /> : <Login setAuth={setAuth} />} />
                  <Route path="/vms" element={isAuth ? <VirtualMachineManager /> : <Navigate to="/" />} />
                    <Route path="/snapshot" element={<SnapshotManager />} />
                  <Route path="/settings" element={<Settings /> } />
                  <Route path="/backups" element={ <BackupScheduler />} />
                  <Route path="/xmleditor" element={ <XMLEditor /> } />
                    <Route path="/disks" element={ <DiskManagement /> } />
                    <Route path="/pcidev" element={ <PCIDeviceManager /> } />
                     <Route path="/stats" element={ <VMStats /> } />
                    <Route path="/console" element={ <RemoteConsole /> } />
                    <Route path="/diskusage" element={ <DiskUsage /> } />
        </Routes>
            </div>
      </Router>
  );
};

export default App;
