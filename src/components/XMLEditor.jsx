import React, { useState, useEffect } from 'react';
import {Container, Nav, Navbar} from "react-bootstrap";

function XMLEditor() {
    const [xmlContent, setXmlContent] = useState(`<?xml version="1.0" encoding="UTF-8"?>
<domain type="qemu">
  <name>example-vm</name>
  <memory unit="GiB">4</memory>
  <vcpu>2</vcpu>
  <os>
    <type arch="x86_64" machine="pc-q35-5.2">hvm</type>
    <boot dev="hd"/>
  </os>
  <devices>
    <disk type="file" device="disk">
      <driver name="qemu" type="qcow2"/>
      <source file="/path/to/disk.qcow2"/>
      <target dev="vda" bus="virtio"/>
    </disk>
    <interface type="bridge">
      <source bridge="br0"/>
      <model type="virtio"/>
    </interface>
    <graphics type="vnc" port="-1" autoport="yes" listen="0.0.0.0">
      <listen type="address" address="0.0.0.0"/>
    </graphics>
  </devices>
</domain>`);

    const [previewHtml, setPreviewHtml] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        updatePreview();
    }, [xmlContent]);

    const updatePreview = () => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

        let newPreviewHtml = '<h3>VM Configuration Preview:</h3>';
        newPreviewHtml += `<p><strong>Name:</strong> ${xmlDoc.querySelector('name')?.textContent || 'N/A'}</p>`;
        newPreviewHtml += `<p><strong>Memory:</strong> ${xmlDoc.querySelector('memory')?.textContent || 'N/A'} ${xmlDoc.querySelector('memory')?.getAttribute('unit') || ''}</p>`;
        newPreviewHtml += `<p><strong>vCPUs:</strong> ${xmlDoc.querySelector('vcpu')?.textContent || 'N/A'}</p>`;

        const os = xmlDoc.querySelector('os type');
        if (os) {
            newPreviewHtml += `<p><strong>OS Type:</strong> ${os.getAttribute('arch') || 'N/A'} (${os.getAttribute('machine') || 'N/A'})</p>`;
        }

        const disk = xmlDoc.querySelector('disk');
        if (disk) {
            newPreviewHtml += `<p><strong>Disk:</strong> ${disk.querySelector('source')?.getAttribute('file') || 'N/A'} (${disk.querySelector('driver')?.getAttribute('type') || 'N/A'})</p>`;
        }

        const network = xmlDoc.querySelector('interface');
        if (network) {
            newPreviewHtml += `<p><strong>Network:</strong> ${network.getAttribute('type') || 'N/A'} (${network.querySelector('source')?.getAttribute('bridge') || 'N/A'})</p>`;
        }

        const graphics = xmlDoc.querySelector('graphics');
        if (graphics) {
            newPreviewHtml += `<p><strong>Graphics:</strong> ${graphics.getAttribute('type') || 'N/A'} (Port: ${graphics.getAttribute('port') || 'N/A'})</p>`;
        }

        setPreviewHtml(newPreviewHtml);
    };

    const validateXML = () => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

        if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
            setErrorMessage("XML validation failed: " + xmlDoc.getElementsByTagName("parsererror")[0].textContent);
            return false;
        } else {
            setErrorMessage("XML is valid.");
            return true;
        }
    };

    const applyChanges = () => {
        if (validateXML()) {
            // Here you would typically send the XML to your backend
            alert("Changes applied successfully!");
        } else {
            alert("Please fix XML errors before applying changes.");
        }
    };

    const resetToDefault = () => {
        if (window.confirm("Are you sure you want to reset to the default configuration? All changes will be lost.")) {
            setXmlContent(`<?xml version="1.0" encoding="UTF-8"?>
<domain type="qemu">
  <name>example-vm</name>
  <memory unit="GiB">4</memory>
  <vcpu>2</vcpu>
  <os>
    <type arch="x86_64" machine="pc-q35-5.2">hvm</type>
    <boot dev="hd"/>
  </os>
  <devices>
    <disk type="file" device="disk">
      <driver name="qemu" type="qcow2"/>
      <source file="/path/to/disk.qcow2"/>
      <target dev="vda" bus="virtio"/>
    </disk>
    <interface type="bridge">
      <source bridge="br0"/>
      <model type="virtio"/>
    </interface>
    <graphics type="vnc" port="-1" autoport="yes" listen="0.0.0.0">
      <listen type="address" address="0.0.0.0"/>
    </graphics>
  </devices>
</domain>`);
            setErrorMessage('');
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
            <div className="content">
                <h2>XML Editor</h2>
                <p>Edit your VM configuration directly using QEMU XML. Be cautious, as incorrect XML can break your VM configuration.</p>
                <div className="editor-container">
          <textarea
              className="xml-editor"
              spellCheck="false"
              value={xmlContent}
              onChange={(e) => setXmlContent(e.target.value)}
          />
                    <div className="preview-pane" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </div>
                <div className="action-buttons">
                    <button className="btn btn-primary" onClick={validateXML}>Validate XML</button>
                    <button className="btn btn-success" onClick={applyChanges}>Apply Changes</button>
                    <button className="btn btn-warning" onClick={resetToDefault}>Reset to Default</button>
                </div>
                <div className="error-message">{errorMessage}</div>
            </div>
        </div>
    );
}

export default XMLEditor;