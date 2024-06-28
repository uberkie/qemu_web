from flask import Flask, jsonify, request
import os
import libvirt
from flask_cors import CORS
from flask.static import Static

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def get_libvirt_connection():
    try:
        return libvirt.open('qemu:///system')
    except libvirt.libvirtError as e:
        print(f"Failed to open connection to qemu:///system: {e}")
        return None

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
    machine = vm_data.get('machine')
    network = vm_data.get('network')
    net_type = vm_data.get('network_type')

    try:
        # Define a new domain (example XML)
        vm_xml = f"""
        <domain type='kvm'>
          <name>{name}</name>
          <memory>{memory}</memory>
          <vcpu>{cpus}</vcpu>
          <os>
            <type arch='x86_64' machine={machine}>hvm</type>
          </os>
          <devices>
            <disk type='file' device='disk'>
              <driver name='qemu' type='qcow2'/>
              <source file='/var/lib/libvirt/images/{name}.qcow2'/>
              <target dev='vda' bus='virtio'/>
            </disk>
            <interface type='network'>
              <source network={network}/>
              <model type={net_type}/>
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


if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=8081)
