import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './stats.css';
import { Navbar, Container, Nav } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { io } from 'socket.io-client';

// Initialize toast notifications

const VMStats = () => {
  const [vms, setVms] = useState([]);
  const [cpuData, setCpuData] = useState([]);
  const [memoryData, setMemoryData] = useState([]);
  const [diskData, setDiskData] = useState([]);
  const [networkData, setNetworkData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [vm, setVm] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);

  const chartConfig = {
    type: 'line',
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  useEffect(() => {
    const socket = io('https://192.168.111.145');
        setSocket(socket);

        socket.on('connect', () => {
            console.log('Wave Socket connected');
        });


    // Fetch initial VMs
    fetchVms();

    // Subscribe to events

    socket.on('vm_cpu_updated', updateVMCpu);

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchVms = async () => {
    try {
      const response = await axios.get('https://192.168.111.145:8081/api/vms');
      if (Array.isArray(response.data)) {
        setVms(response.data);
      } else if (response.data.vms && Array.isArray(response.data.vms)) {
        setVms(response.data.vms);
      } else {
        console.error('Unexpected response format', response.data);
        setError('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching VMs', error);
      setError('Failed to fetch VMs');
      toast.error('Failed to fetch VMs');
    }
  };

  const fetchStats = async () => {
  try {
    const response = await axios.get(`https://192.168.111.145:8081/api/vms/${vm}/stats`);
    if (response.data.cpu_stats) {
      const cpuStats = response.data.cpu_stats.cpu_usage_percentage;
      setCpuData([cpuStats]); // Ensure to pass an array if you're updating state for a chart
      // Similarly, update other data states like memory, disk, and network
    } else {
      console.error("Unexpected response format", response.data);
      setError('Unexpected response format');
    }
  } catch (error) {
    console.error("Error fetching VM stats", error);
    setError('Failed to fetch VM stats');
  }
};

  const updateStats = () => {
    let dataPoints;
    switch (timeRange) {
      case '1h':
        dataPoints = 60;
        break;
      case '24h':
        dataPoints = 24;
        break;
      case '7d':
        dataPoints = 7;
        break;
      case '30d':
        dataPoints = 30;
        break;
      default:
        dataPoints = 24;
    }

    const newLabels = Array.from({ length: dataPoints }, (_, i) => i + (timeRange === '1h' ? 'm' : 'h'));
    setLabels(newLabels);

    fetchStats();
  };

  useEffect(() => {
    updateStats();
  }, [vm, timeRange]);

  const updateVMCpu = async (name, newStatus) => {
    try {
      // Fetch the latest VMs data
      await fetchVms();

      // Find the VM with the given ID
      const vmToUpdate = vms.find(vm => vm.name === name);

      // Check if the VM is found
      if (!vmToUpdate) {
        toast.error('VM not found');
        return;
      }

      // Normalize newStatus for consistent comparison
      const normalizedStatus = newStatus.toLowerCase();

      // Update the VM's status in the state
      setCpuData(prevCpu => prevCpu.map(vm => vm.name === name ? { ...vm, status: newStatus } : vm));
    } catch (error) {
      console.error('Error updating VM status', error);
      toast.error('Failed to update VM status');
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
        <h2>VM Statistics</h2>
        <div>
          <select id="vmSelect" value={vm} onChange={(e) => setVm(e.target.value)}>
            <option value="all">All VMs</option>
            {vms.map(vm => (
              <option key={vm.id} value={vm.name}>{vm.name}</option>
            ))}
          </select>
          <select id="timeRangeSelect" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="1h">Last 1 hour</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <button className="btn btn-primary" onClick={updateStats}>Update Stats</button>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>CPU Usage</h3>
            <div className="chart-container">
              <Line
                data={{
                  labels: labels,
                  datasets: [{
                    label: 'CPU Usage (%)',
                    data: cpuData,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                  }],
                }}
                options={chartConfig.options}
              />
            </div>
          </div>
          <div className="stat-card">
            <h3>Memory Usage</h3>
            <div className="chart-container">
              <Line
                data={{
                  labels: labels,
                  datasets: [{
                    label: 'Memory Usage (MB)',
                    data: memoryData,
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1,
                  }],
                }}
                options={chartConfig.options}
              />
            </div>
          </div>
          <div className="stat-card">
            <h3>Disk I/O</h3>
            <div className="chart-container">
              <Line
                data={{
                  labels: labels,
                  datasets: [{
                    label: 'Disk Read (MB/s)',
                    data: diskData.read,
                    borderColor: 'rgb(54, 162, 235)',
                    tension: 0.1,
                  }, {
                    label: 'Disk Write (MB/s)',
                    data: diskData.write,
                    borderColor: 'rgb(255, 206, 86)',
                    tension: 0.1,
                  }],
                }}
                options={chartConfig.options}
              />
            </div>
          </div>
          <div className="stat-card">
            <h3>Network Traffic</h3>
            <div className="chart-container">
              <Line
                data={{
                  labels: labels,
                  datasets: [{
                    label: 'Network In (Mbps)',
                    data: networkData.in,
                    borderColor: 'rgb(153, 102, 255)',
                    tension: 0.1,
                  }, {
                    label: 'Network Out (Mbps)',
                    data: networkData.out,
                    borderColor: 'rgb(255, 159, 64)',
                    tension: 0.1,
                  }],
                }}
                options={chartConfig.options}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VMStats;
