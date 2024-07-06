from flask import Flask, jsonify, request, Response
import socket
import json
import logging

app = Flask(__name__)

# Setup logging
logging.basicConfig(level=logging.INFO)


def send_request_to_kvm(request_data):
	"""
	Sends a request to the KVM hypervisor using the provided request data.

	Parameters:
	- request_data (dict): The data to be sent as a JSON-encoded string.

	Returns:
	- dict: The response from the KVM hypervisor, parsed as a JSON object.
	"""
	host = '192.168.111.145'
	port = 12345
	
	try:
		client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
		client_socket.connect((host, port))
		client_socket.send(json.dumps(request_data).encode())
		
		response = client_socket.recv(4096).decode()  # Increased buffer size for larger responses
		client_socket.close()
		
		return json.loads(response)
	except socket.error as e:
		logging.error(f"Socket error: {e}")
		return {"status": "error", "message": str(e)}
	except json.JSONDecodeError as e:
		logging.error(f"JSON decode error: {e}")
		return {"status": "error", "message": "Invalid response format"}
	except Exception as e:
		logging.error(f"Unexpected error: {e}")
		return {"status": "error", "message": str(e)}


@app.route('/list_vms', methods=['GET'])
def list_vms():
	"""
	List virtual machines.
	"""
	request_data = {'command': 'list_vms'}
	response = send_request_to_kvm(request_data)
	return jsonify(response)


@app.route("/<name>/snapshots", methods=["GET"])
def list_snapshots(name):
	"""
	Get snapshots for a virtual machine.
	"""
	request_data = {"command": "get_snapshots", "name": name}
	logging.info(f"Request data: {request_data}")
	
	response = send_request_to_kvm(request_data)
	return jsonify(response)


@app.route("/snapshots/<name>", methods=["POST"])
def create_snapshots(name):
	"""
	Create a snapshot for a virtual machine.
	"""
	snapshot_name = request.json.get("snapshot_name")
	if not snapshot_name:
		return Response(json.dumps({"status": "error", "message": "Snapshot name is required"}), status=400,
						mimetype='application/json')
	
	request_data = {"command": "create_snapshots", "name": name, "snapshot": snapshot_name}
	logging.info(f"Request data: {request_data}")
	
	response = send_request_to_kvm(request_data)
	return jsonify(response)


@app.route("/start/<name>", methods=["POST"])
def start_vm(name):
	"""
	Start the specified virtual machine.
	"""
	request_data = {"command": "start_vm", "name": name}
	logging.info(f"Request data: {request_data}")
	
	response = send_request_to_kvm(request_data)
	return jsonify(response)


@app.route("/stop/<name>", methods=["POST"])
def stop_vm(name):
	"""
	Stop the specified virtual machine.
	"""
	request_data = {"command": "stop_vm", "name": name}
	logging.info(f"Request data: {request_data}")
	
	response = send_request_to_kvm(request_data)
	return jsonify(response)


@app.route("/reboot/<name>", methods=["POST"])
def reboot_vm(name):
	"""
	Reboot the specified virtual machine.
	"""
	request_data = {"command": "reboot_vm", "name": name}
	logging.info(f"Request data: {request_data}")
	
	response = send_request_to_kvm(request_data)
	return jsonify(response)


@app.route("/shutdown/<name>", methods=["POST"])
def shutdown_vm(name):
	"""
	Shutdown the specified virtual machine.
	"""
	request_data = {"command": "shutdown_vm", "name": name}
	logging.info(f"Request data: {request_data}")
	
	response = send_request_to_kvm(request_data)
	return jsonify(response)


@app.route("/suspend/<name>", methods=["POST"])
def suspend_vm(name):
	"""
	Suspend the specified virtual machine.
	"""
	request_data = {"command": "suspend_vm", "name": name}
	logging.info(f"Request data: {request_data}")
	
	response = send_request_to_kvm(request_data)
	return jsonify(response)


@app.route("/resume/<name>", methods=["POST"])
def resume_vm(name):
	"""
	Resume the specified virtual machine.
	"""
	request_data = {"command": "resume_vm", "name": name}
	logging.info(f"Request data: {request_data}")
	
	response = send_request_to_kvm(request_data)
	return jsonify(response)


@app.route("/poweroff/<name>", methods=["POST"])
def poweroff_vm(name):
	"""
	Power off the specified virtual machine.
	"""
	request_data = {"command": "poweroff_vm", "name": name}
	logging.info(f"Request data: {request_data}")
	
	response = send_request_to_kvm(request_data)
	return jsonify(response)


# Add similar functions for other commands as needed

if __name__ == '__main__':
	app.run(host='0.0.0.0', port=5000)
