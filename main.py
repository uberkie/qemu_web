from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import libvirt


app = Flask(__name__, static_url_path='', static_folder='ui')
CORS(app)  # Enable CORS for all routes

# In-memory storage for demonstration purposes
users = {"admin": "password"}
sessions = {}
vms = []


def get_libvirt_connection():
    try:
        return libvirt.open('qemu:///system')
    except libvirt.libvirtError as e:
        print(f"Failed to open connection to qemu:///system: {e}")
        return None


@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if username in users and users[username] == password:
        sessions[username] = True
        return jsonify({"message": "Login successful"}), 200
    return jsonify({"message": "Invalid credentials"}), 401


@app.route('/api/logout', methods=['POST'])
def logout():
    data = request.json
    username = data.get('username')
    sessions.pop(username, None)
    return jsonify({"message": "Logout successful"}), 200


@app.route('/api/vms', methods=['GET'])
def list_vms():
    conn = get_libvirt_connection()
    if not conn:
        return jsonify({'error': 'Could not connect to libvirt'}), 500

    try:
        domains = conn.listAllDomains()
        if not domains:
            return jsonify({'message': 'No VMs found'}), 404

        vms = []
        for domain in domains:
            vm_info = {
                'name': domain.name(),
                'id': domain.ID(),
                'state': domain.state()[0],
                'uuid': domain.UUIDString(),
                'max_memory': domain.maxMemory(),
                'memory': domain.info()[2],  # Memory in use
                'vcpus': domain.info()[3],  # Number of virtual CPUs
                'autostart': domain.autostart()
            }
            vms.append(vm_info)

        return jsonify({'vms': vms})
    except libvirt.libvirtError as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


@app.route('/api/vms/<name>', methods=['GET'])
def details_vm(name):
    conn = get_libvirt_connection()
    if not conn:
        return jsonify({'error': 'Could not connect to libvirt'}), 500

    try:
        domain = conn.lookupByName(name)
        vm_details = {
            'name': domain.name(),
            'id': domain.ID(),
            'state': domain.state()[0],
            'uuid': domain.UUIDString(),
            'max_memory': domain.maxMemory(),
            'memory': domain.info()[2],  # Memory in use
            'vcpus': domain.info()[3],  # Number of virtual CPUs
            'autostart': domain.autostart()
        }
        return jsonify(vm_details), 200
    except libvirt.libvirtError as e:
        return jsonify({'error': f'VM not found: {str(e)}'}), 404
    finally:
        if conn is not None:
            conn.close()

@app.route('/api/vms/<name>', methods=['DELETE'])
def delete_vm(name):
    conn = get_libvirt_connection()
    if not conn:
        return jsonify({'error': 'Could not connect to libvirt'}), 500

    try:
        domain = conn.lookupByName(name)
        domain.destroy()
        domain.undefine()
        return jsonify({'message': f'VM {name} deleted successfully'}), 200
    except libvirt.libvirtError as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


@app.route('/api/vms', methods=['POST'])
def create_vm():
    conn = get_libvirt_connection()
    if not conn:
        return jsonify({'error': 'Could not connect to libvirt'}), 500

    vm_data = request.json
    name = vm_data.get('name')
    cpus = vm_data.get('cpus')
    memory = vm_data.get('memory')  # Expecting memory in KiB

    try:
        # Define a new domain (example XML)
        vm_xml = f"""
        <domain type='kvm'>
          <name>{name}</name>
          <memory>{memory}</memory>
          <vcpu>{cpus}</vcpu>
          <os>
            <type arch='x86_64' machine='pc-i440fx-2.9'>hvm</type>
          </os>
          <devices>
            <disk type='file' device='disk'>
              <driver name='qemu' type='qcow2'/>
              <source file='/var/lib/libvirt/images/{name}.qcow2'/>
              <target dev='vda' bus='virtio'/>
            </disk>
            <interface type='network'>
              <source network='default'/>
              <model type='virtio'/>
            </interface>
          </devices>
        </domain>
        """
        conn.createXML(vm_xml, 0)
        return jsonify({'message': f'VM {name} created successfully'}), 201
    except libvirt.libvirtError as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


# Serve the UI
@app.route('/')
def serve_ui():
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/vms/<vm_name>/snapshots', methods=['GET'])
def list_snapshots(vm_name):
    conn = get_libvirt_connection()
    if not conn:
        return jsonify({'error': 'Could not connect to libvirt'}), 500

    try:
        domain = conn.lookupByName(vm_name)
        snapshots = domain.snapshotListNames()
        return jsonify({'snapshots': snapshots})
    except libvirt.libvirtError as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


@app.route('/vms/<vm_name>/snapshots', methods=['POST'])
def create_snapshot(vm_name):
    snapshot_name = request.json.get('name')
    if not snapshot_name:
        return jsonify({'error': 'Snapshot name is required'}), 400

    conn = get_libvirt_connection()
    if not conn:
        return jsonify({'error': 'Could not connect to libvirt'}), 500

    try:
        domain = conn.lookupByName(vm_name)
        xml = f"""
        <domainsnapshot>
            <name>{snapshot_name}</name>
            <description>Snapshot of {vm_name}</description>
        </domainsnapshot>
        """
        domain.snapshotCreateXML(xml, 0)
        return jsonify({'message': 'Snapshot created successfully'}), 201
    except libvirt.libvirtError as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


@app.route('/vms/<vm_name>/snapshots/<snapshot_name>/restore', methods=['POST'])
def restore_snapshot(vm_name, snapshot_name):
    conn = get_libvirt_connection()
    if not conn:
        return jsonify({'error': 'Could not connect to libvirt'}), 500

    try:
        domain = conn.lookupByName(vm_name)
        snapshot = domain.snapshotLookupByName(snapshot_name)
        domain.revertToSnapshot(snapshot, 0)
        return jsonify({'message': 'Snapshot restored successfully'})
    except libvirt.libvirtError as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


@app.route('/vms/<vm_name>/snapshots/<snapshot_name>', methods=['DELETE'])
def delete_snapshot(vm_name, snapshot_name):
    conn = get_libvirt_connection()
    if not conn:
        return jsonify({'error': 'Could not connect to libvirt'}), 500

    try:
        domain = conn.lookupByName(vm_name)
        snapshot = domain.snapshotLookupByName(snapshot_name)
        snapshot.delete(0)
        return jsonify({'message': 'Snapshot deleted successfully'})
    except libvirt.libvirtError as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


# Ensure other static files are served
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.static_folder, path)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8081)
