import json
import os
import xml.etree.ElementTree as ET

import libvirt
from crontab import CronTab
from flask import Flask
from flask import request, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy

sessions = {}
vms = []
state = None

# Path to your UI folder containing static files
ui_folder_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ui")


def extract_os_from_metadata(xml_desc):
	"""
	Extracts the operating system ID from the metadata in the given XML description.

	Parameters:
	- xml_desc (str): The XML description containing the metadata.

	Returns:
	- str: The operating system ID extracted from the metadata, or "Unknown OS" if not found.

	Raises:
	- ET.ParseError: If there is an error parsing the XML.
	"""
	try:
		# Parse the XML
		root = ET.fromstring(xml_desc)
		
		# Find the OS ID in the metadata
		namespace = {"libosinfo": "http://libosinfo.org/xmlns/libvirt/domain/1.0"}
		os_info = root.find(".//libosinfo:os", namespace)
		
		if os_info is not None:
			os_id = os_info.get("id", "Unknown OS")
			return os_id
		else:
			return "Unknown OS"
	except ET.ParseError as e:
		print(f"XML Parse Error: {e}")
		return "Unknown OS"


# def serve_index():
# 	"""
# 	Serves the index.html file from the specified directory.

# 	This function is a route handler for the root URL ("/"). It uses the `send_from_directory` function from the Flask
# 	framework to serve the index.html file from the specified directory.

# 	Parameters:
# 	None

# 	Returns:
# 	- The index.html file as a response.

# 	"""
# 	return send_from_directory(ui_folder_path, "index.html")


# def serve_static(path):
# 	"""
# 	Serves static files from the specified directory.

# 	This function is a route handler for serving static files. It takes a `path` parameter, which represents the path
# 	to the file to be served. The function uses the `send_from_directory` function from the Flask framework to serve
# 	the file from the specified directory.

# 	Parameters:
# 	- path (str): The path to the file to be served.

# 	Returns:
# 	- The file as a response.

# 	"""
# 	return send_from_directory(ui_folder_path, path)


def get_libvirt_connection():
	"""
	Tries to establish a connection to the libvirt daemon running on the system.

	Returns:
	- libvirt.virConnect: A connection object representing the libvirt connection if successful, None otherwise.
	"""
	try:
		return libvirt.open("qemu:///system")
	except libvirt.libvirtError as e:
		print(f"Failed to open connection to qemu:///system: {e}")
		return None


def login():
	"""
	Handles the login process for the API.

	This function is a route handler for the `/api/login` endpoint. It expects a POST request with a JSON payload
	containing the `username` and `password` fields.

	Parameters:
	- None

	Returns:
	- A JSON response with a `message` field indicating the success or failure of the login process.
	- A status code indicating the HTTP status of the response.

	Raises:
	- None

	Example usage:
	```
	curl -X POST -H "Content-Type: application/json" -d '{"username": "john", "password": "password123"}'
	http://localhost:5000/api/login
	```

	Note:
	- This function assumes that the `User` model is defined and that the `User` table exists in the database.
	- The session management logic is simplified and only handles a basic session management.
	- The password comparison is done in plain text. It is recommended to use a secure hashing algorithm for password
	storage.
	"""


# data = request.json
# username = data.get("username")
# password = data.get("password")
#
# # Check if username and password were provided
# if not username or not password:
# 	return json.dumps({"message": "Username and password are required"}), 400
#
# # Query the database for the user
# user = User.query.filter_by(username=username).first()
#
# # Check if user exists and password matches
# if user and user.password == password:
# 	# Implement session management or token generation here
# 	# For simplicity, let's assume a basic session management
# 	sessions[username] = True
# 	return json.dumps({"message": "Login successful"}), 200
# else:
# 	return json.dumps({"message": "Invalid credentials"}), 401


def logout():
	"""
	Logs out a user.

	This function handles the POST request to the `/api/logout` endpoint. It expects a JSON payload with the
	`username` field.

	Parameters:
	- None

	Returns:
	- A JSON response with a `message` field indicating the success of the logout process.
	- A status code indicating the HTTP status of the response.

	Raises:
	- None

	Example usage:
	```
	curl -X POST -H "Content-Type: application/json" -d '{"username": "john"}' http://localhost:5000/api/logout
	```

	Note:
	- This function assumes that the `sessions` dictionary is defined and contains the logged-in users.
	"""


# data = request.json
# username = data.get("username")
# sessions.pop(username, None)
# return json.dumps({"message": "Logout successful"}), 200


def list_vms():
	"""
	Lists all virtual machines (VMs) managed by libvirt.

	This function handles the GET request to the `/api/vms` endpoint. It connects to the libvirt server and retrieves
	a list of all domains (VMs). If no VMs are found, it returns a 404 response with a message indicating that no VMs
	were found. Otherwise, it collects information about each VM, including its name, ID, state, UUID, maximum memory,
	memory in use, number of virtual CPUs, and autostart status. The function returns a JSON response with a list of
	VMs.

	Parameters:
	- None

	Returns:
	- A JSON response with a `vms` field containing a list of VMs.
	- A status code indicating the HTTP status of the response.

	Raises:
	- A 500 response with an error message if there was an error connecting to the libvirt server.

	Example usage:
	```
	curl http://localhost:5000/api/vms
	```
	"""
	conn = get_libvirt_connection()
	if not conn:
		return json.dumps({"error": "Could not connect to libvirt"}), 500
	
	try:
		domains = conn.listAllDomains()
		dom = conn.listAllDomains(2)
		dom.append(domains)
		if not domains:
			return json.dumps({"message": "No VMs found"}), 404
		
		vms = []
		for domain in domains:
			# xml_desc = domain.XMLDesc()
			# root = ET.fromstring(xml_desc)
			
			# # Extract VM OS from the metadata
			# vm_os = extract_os_from_metadata(xml_desc)
			# disks = root.findall("devices/disk")
			disk_info = []
			cdrom_info = []
			
			# for disk in disks:
			#     disk_target = disk.find("target").get("dev")
			#     source = disk.find("source")
			#     if source is not None:
			#         disk_location = source.get("file")
			#     else:
			#         disk_location = None
			
			#     # Determine if it's a disk or a CD-ROM
			#     if disk.get("device") == "cdrom":
			#         cdrom_info.append(
			#             {
			#                 "target": disk_target,
			#                 "location": disk_location,
			#             }
			#         )
			#     else:
			#         disk_info.append({"location": disk_location, "target": disk_target})
			
			# sizes = domain.blockInfo(disk_target)
			vm_info = {
					"name"      : domain.name(),
					"id"        : domain.ID(),
					"state"     : domain.state()[0],
					"uuid"      : domain.UUIDString(),
					# "vm_os": vm_os,
					"max_memory": domain.maxMemory(),
					"memory"    : domain.info()[2],  # Memory in use
					"vcpus"     : domain.info()[3],  # Number of virtual CPUs
					"autostart" : domain.autostart(),
					# "disk_capacity": sizes[0],
					# "disks": disk_info,
					# "cdroms": cdrom_info,
			}
			vms.append(vm_info)
		
		# Return the collected VMs outside the loop
		return json.dumps({"vms": vms})
	except libvirt.libvirtError as e:
		return json.dumps({"error": str(e)}), 500
	finally:
		if conn:
			conn.close()


def details_vm(name):
	"""
	Function to retrieve details of a specific virtual machine (VM) by name.

	Parameters:
	- name: The name of the VM to retrieve details for.

	Returns:
	- A JSON response with details of the VM.
	- HTTP status code indicating the success or failure of the operation.
	"""
	conn = get_libvirt_connection()
	if not conn:
		return json.dumps({"error": "Could not connect to libvirt"}), 500
	
	try:
		domain = conn.lookupByName(name)
		xml_desc = domain.XMLDesc()
		root = ET.fromstring(xml_desc)
		os_type = domain.OSType()
		# Extract VM OS from the metadata
		vm_os = extract_os_from_metadata(xml_desc)
		# Parse disk information
		disks = root.findall("devices/disk")
		disk_info = []
		cdrom_info = []
		print(os_type)
		for disk in disks:
			disk_target = disk.find("target").get("dev")
			source = disk.find("source")
			if source is not None:
				disk_location = source.get("file")
			else:
				disk_location = None
			
			# Determine if it's a disk or a CD-ROM
			if disk.get("device") == "cdrom":
				cdrom_info.append(
						{
								"target"  : disk_target,
								"location": disk_location,
						}
				)
			else:
				disk_info.append({"location": disk_location, "target": disk_target})
		
		vm_details = {
				"name"      : domain.name(),
				"id"        : domain.ID(),
				"state"     : domain.state()[0],
				"uuid"      : domain.UUIDString(),
				"vm_os"     : vm_os,
				"max_memory": domain.maxMemory(),
				"memory"    : domain.info()[2],  # Memory in use
				"vcpus"     : domain.info()[3],  # Number of virtual CPUs
				"autostart" : domain.autostart(),
				"disks"     : disk_info,
				"cdroms"    : cdrom_info,
		}
		
		return json.dumps(vm_details), 200
	except libvirt.libvirtError as e:
		return json.dumps({"error": f"VM not found: {str(e)}"}), 404
	finally:
		if conn is not None:
			conn.close()


def delete_vm(name):
	"""
	Delete a virtual machine by name.

	Parameters:
	- name (str): The name of the virtual machine to delete.

	Returns:
	- tuple: A tuple containing a JSON response and an HTTP status code.
		- dict: A dictionary containing a success message if the VM was deleted successfully.
		- int: An HTTP status code indicating the success or failure of the operation.
			- 200: The VM was deleted successfully.
			- 500: An error occurred while deleting the VM.

	Raises:
	- libvirt.libvirtError: If an error occurs while deleting the VM.

	"""
	conn = get_libvirt_connection()
	if not conn:
		return json.dumps({"error": "Could not connect to libvirt"}), 500
	
	try:
		domain = conn.lookupByName(name)
		domain.destroy()
		domain.undefine()
		return json.dumps({"message": f"VM {name} deleted successfully"}), 200
	except libvirt.libvirtError as e:
		return json.dumps({"error": str(e)}), 500
	finally:
		conn.close()


def create_vm():
	"""
	Creates a new virtual machine (VM) using the provided data.

	Parameters:
	- None

	Returns:
	- A JSON response with a message indicating the success or failure of the operation.
	- An HTTP status code indicating the success or failure of the operation.
		- 201: The VM was created successfully.
		- 500: An error occurred while creating the VM.

	Raises:
	- libvirt.libvirtError: If an error occurs while creating the VM.

	"""
	conn = get_libvirt_connection()
	if not conn:
		return json.dumps({"error": "Could not connect to libvirt"}), 500
	
	vm_data = request.json
	name = vm_data.get("name")
	cpus = vm_data.get("cpus")
	memory = vm_data.get("memory")  # Expecting memory in KiB
	
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
		return json.dumps({"message": f"VM {name} created successfully"}), 201
	except libvirt.libvirtError as e:
		return json.dumps({"error": str(e)}), 500
	finally:
		conn.close()


def list_snapshots(name):
	"""
	Get a list of snapshots for a given VM name.

	:param name: The name of the VM.
	:type name: str
	:return: A JSON response containing a list of snapshots for the VM.
	:rtype: flask.Response

	If the connection to libvirt fails, a JSON response with an error message is returned.

	Example usage:
	```
	>>> list_snapshots("my_vm")
	{
		"snapshots": [
			{"name": "snapshot1"},
			{"name": "snapshot2"},
			...
		]
	}
	```
	"""
	conn = get_libvirt_connection()
	snapshots = []
	if not conn:
		return json.dumps({"error": "Could not connect to libvirt"}), 500
	
	try:
		domain = conn.lookupByName(name)
		snapshot = domain.snapshotListNames()
		for name in snapshot:
			shots = {"name": name}
			snapshots.append(shots)
		return json.dumps({"snapshots": snapshots})
	except libvirt.libvirtError as e:
		return json.dumps({"error": str(e)}), 500
	finally:
		conn.close()


def create_snapshot(name):
	"""
	Create a new snapshot for the specified VM.

	:param name: The name of the VM for which the snapshot is created.
	:type name: str
	:return: A JSON response indicating the success or failure of the snapshot creation.
	:rtype: flask.Response
	"""
	snapshot_name = request.json.get("name")
	if not snapshot_name:
		return json.dumps({"error": "Snapshot name is required"}), 400
	
	conn = get_libvirt_connection()
	if not conn:
		return json.dumps({"error": "Could not connect to libvirt"}), 500
	
	try:
		domain = conn.lookupByName(name)
		xml = f"""
        <domainsnapshot>
            <name>{snapshot_name}</name>
            <description>Snapshot of {name}</description>
        </domainsnapshot>
        """
		domain.snapshotCreateXML(xml, 0)
		return json.dumps({"message": "Snapshot created successfully"}), 201
	except libvirt.libvirtError as e:
		return json.dumps({"error": str(e)}), 500
	finally:
		conn.close()


def restore_snapshot(name, snapshot_name):
	conn = get_libvirt_connection()
	if not conn:
		return json.dumps({"error": "Could not connect to libvirt"}), 500
	
	try:
		domain = conn.lookupByName(name)
		snapshot = domain.snapshotLookupByName(snapshot_name)
		domain.revertToSnapshot(snapshot, 0)
		return json.dumps({"message": "Snapshot restored successfully"})
	except libvirt.libvirtError as e:
		return json.dumps({"error": str(e)}), 500
	finally:
		conn.close()


def delete_snapshot(name, snapshot_name):
	conn = get_libvirt_connection()
	if not conn:
		return json.dumps({"error": "Could not connect to libvirt"}), 500
	
	try:
		domain = conn.lookupByName(name)
		snapshot = domain.snapshotLookupByName(snapshot_name)
		snapshot.delete(0)
		return json.dumps({"message": "Snapshot deleted successfully"})
	except libvirt.libvirtError as e:
		return json.dumps({"error": str(e)}), 500
	finally:
		conn.close()


def schedule_snapshot():
	"""
	Restore a snapshot for a given VM name and snapshot name.

	:param name: The name of the VM for which the snapshot is restored.
	:type name: str
	:param snapshot_name: The name of the snapshot to be restored.
	:type snapshot_name: str
	:return: A JSON response indicating the success or failure of the snapshot restoration.
	:rtype: flask.Response

	If the connection to libvirt fails, a JSON response with an error message is returned.

	Example usage:
	```
	>>> restore_snapshot("my_vm", "my_snapshot")
	{
		"message": "Snapshot restored successfully"
	}
	```
	"""
	data = request.json
	day = data.get("day", "*")  # Default to every day if not specified
	interval = data.get("interval", "*/1")  # Default to every minute if not specified
	vm_name = data.get("vm_name")
	snapshot_name = data.get("snapshot_name")
	
	cron = CronTab(user=True)  # Create a cron job for the current user
	job = cron.new(command=f"python3 /path/to/snapshot.py {vm_name} {snapshot_name}")
	job.setall(f"{interval} {day} * * *")
	cron.write()
	
	return (
			json.dumps({"status": "success", "message": "Scheduled snapshot successfully"}),
			200,
	)


def start_vm(name):
	"""
	Starts a virtual machine with the given name.

	:param name: The name of the virtual machine to start.
	:type name: str

	:return: A JSON response indicating the success or failure of the operation.
	:rtype: flask.Response

	:raises libvirt.libvirtError: If an error occurs while starting the virtual machine.
	"""
	conn = get_libvirt_connection()
	if not conn:
		return json.dumps({"error": "Could not connect to libvirt"}), 500
	
	try:
		domain = conn.lookupByName(name)
		domain.create()  # Start the VM
		
		# socketio.emit('vm_status_updated', {"id": domain.ID(), "status": "start"})
		return json.dumps({"message": "Domain started"})
	except libvirt.libvirtError as e:
		return json.dumps({"error": str(e)}), 500
	finally:
		conn.close()


def resume_vm(name):
	"""
	Resume a virtual machine with the given name.

	:param name: The name of the virtual machine to resume.
	:type name: str

	:return: A JSON response indicating the success or failure of the operation.
	:rtype: flask.Response

	:raises libvirt.libvirtError: If an error occurs while resuming the virtual machine.
	"""
	conn = get_libvirt_connection()
	if not conn:
		return json.dumps({"error": "Could not connect to libvirt"}), 500
	
	try:
		domain = conn.lookupByName(name)
		domain.resume()  # Resume the VM
		# socketio.emit('handle_vm', {"message": "Domain resumed"})
		return json.dumps({"message": "Domain resumed"})
	except libvirt.libvirtError as e:
		return json.dumps({"error": str(e)}), 500
	finally:
		conn.close()


def reboot_vm(name):
	"""
	Reboot a virtual machine.

	:param name: The name of the virtual machine to reboot.
	:type name: str

	:return: A JSON response indicating the success or failure of the operation.
	:rtype: flask.Response

	:raises libvirt.libvirtError: If an error occurs while rebooting the virtual machine.
	"""
	conn = get_libvirt_connection()
	if not conn:
		return json.dumps({"error": "Could not connect to libvirt"}), 500
	
	try:
		domain = conn.lookupByName(name)
		domain.reboot()  # Reboot the VM
		# socketio.emit('handle_vm', {"message": "Domain rebooted"})
		return json.dumps({"message": "Domain rebooted"})
	except libvirt.libvirtError as e:
		return json.dumps({"error": str(e)}), 500
	finally:
		conn.close()


def shutdown_vm(name):
	"""
	Shutdown a virtual machine with the given name.

	:param name: The name of the virtual machine to shutdown.
	:type name: str

	:return: A JSON response indicating the success or failure of the operation.
	:rtype: flask.Response

	:raises libvirt.libvirtError: If an error occurs while shutting down the virtual machine.
	"""
	conn = get_libvirt_connection()
	print(name)
	if not conn:
		return json.dumps({"error": "Could not connect to libvirt"}), 500
	
	try:
		domain = conn.lookupByName(name)
		domain.shutdown()  # Shutdown the VM
		return json.dumps({"message": "Domain shut down"})
	
	except libvirt.libvirtError as e:
		return json.dumps({"error": str(e)}), 500
	finally:
		conn.close()


def power_vm(name):
	"""
	Shutdown a virtual machine with the given name.

	:param name: The name of the virtual machine to shutdown.
	:type name: str

	:return: A JSON response indicating the success or failure of the operation.
	:rtype: flask.Response

	:raises libvirt.libvirtError: If an error occurs while shutting down the virtual machine.
	"""
	conn = get_libvirt_connection()
	print(name)
	if not conn:
		return json.dumps({"error": "Could not connect to libvirt"}), 500
	
	try:
		domain = conn.lookupByName(name)
		# socketio.emit('vm_status_updated', {"id": domain.ID(), "status": "poweroff"})
		domain.destroy()  # Shutdown the VM
		
		return json.dumps({"message": "Domain powered down"})
	except libvirt.libvirtError as e:
		return json.dumps({"error": str(e)}), 500
	finally:
		conn.close()
