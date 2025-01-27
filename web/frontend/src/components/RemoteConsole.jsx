import React, { useState } from 'react';


const RemoteConsole = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [command, setCommand] = useState('');
  
  const vm = {
    name: "Ubuntu-20.04",
    status: "Running",
    ipAddress: "192.168.1.100"
  };

  const appendToConsole = (text) => {
    setConsoleOutput(prevOutput => [...prevOutput, text]);
  };

  const connect = () => {
    setIsConnected(true);
    appendToConsole(`Connecting to ${vm.name}...`);
    setTimeout(() => {
      appendToConsole("Connected successfully.");
      appendToConsole("Welcome to Ubuntu 20.04 LTS");
      appendToConsole(`ubuntu@${vm.name}:~$ `);
    }, 1000);
  };

  const disconnect = () => {
    setIsConnected(false);
    appendToConsole(`Disconnected from ${vm.name}`);
  };

  const handleCommandInput = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedCommand = command.trim();
      if (trimmedCommand) {
        appendToConsole(`ubuntu@${vm.name}:~$ ${trimmedCommand}`);
        // Simulate command execution
        setTimeout(() => {
          switch(trimmedCommand.toLowerCase()) {
            case 'ls':
              appendToConsole("Documents  Downloads  Music  Pictures  Videos");
              break;
            case 'pwd':
              appendToConsole("/home/ubuntu");
              break;
            case 'date':
              appendToConsole(new Date().toString());
              break;
            case 'whoami':
              appendToConsole("ubuntu");
              break;
            default:
              appendToConsole(`Command not found: ${trimmedCommand}`);
          }
          appendToConsole(`ubuntu@${vm.name}:~$ `);
        }, 500);
      }
      setCommand('');
    }
  };

  return (
    <div>
      <header>
        <div className="container">
          <h1>QemuUI</h1>
        </div>
      </header>
      <nav>
        <div className="container">
          <ul>
            <li><a href="#/vms">Virtual Machines</a></li>
            <li><a href="#/disks">Disks</a></li>
            <li><a href="#/snapshots">Snapshots</a></li>
            <li><a href="#/settings">Settings</a></li>
            <li><a href="#/backup-scheduler">Backup Scheduler</a></li>
            <li><a href="#/logs">Logs</a></li>
          </ul>
        </div>
      </nav>
      <div className="container">
        <div className="content">
          <h2>Remote Console</h2>
          <div className="vm-info">
            <p><strong>VM Name:</strong> {vm.name}</p>
            <p><strong>Status:</strong> {vm.status}</p>
            <p><strong>IP Address:</strong> {vm.ipAddress}</p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={connect} 
            disabled={isConnected}
          >
            Connect
          </button>
          <button 
            className="btn btn-danger" 
            onClick={disconnect} 
            disabled={!isConnected}
          >
            Disconnect
          </button>
          <div className="console-container">
            <div id="consoleOutput" className="console-output">
              {consoleOutput.map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
            <input
              type="text"
              id="consoleInput"
              className="console-input"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleCommandInput}
              placeholder="Type your command here..."
              disabled={!isConnected}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoteConsole;
