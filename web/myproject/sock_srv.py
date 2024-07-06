import socket
import libvirt
import json
import back

# Connect to the local libvirt daemon
conn = libvirt.open('qemu:///system')


def handle_request(request):
	"""
	Handles the incoming request and executes the corresponding command.

	Parameters:
	- request (dict): The request containing the command and its parameters.

	Returns:
	- dict: The response containing the result of the command execution.
	"""
	command = request.get('command')
	
	if command == 'list_vms':
		response = [vm.name() for vm in conn.listAllDomains()]
	elif command == 'create_vm':
		vm_data = request.get('vm_data')
		response = back.create_vm(vm_data)
	elif command == 'get_snapshots':
		vm_name = request.get('name')
		response = back.list_snapshots(vm_name)
	elif command == 'create_snapshots':
		vm_name = request.get('name')
		response = back.create_snapshot(vm_name, request.get('snapshot'))
	elif command == 'start_vm':
		vm_name = request.get('name')
		response = back.start_vm(vm_name)
	elif command == 'stop_vm':
		vm_name = request.get('name')
		response = back.stop_vm(vm_name)
	elif command == 'reboot_vm':
		vm_name = request.get('name')
		response = back.reboot_vm(vm_name)
	elif command == 'delete_vm':
		vm_name = request.get('name')
		response = back.delete_vm(vm_name)
	elif command == 'shutdown_vm':
		vm_name = request.get('name')
		response = back.shutdown_vm(vm_name)
	elif command == 'resume_vm':
		vm_name = request.get('name')
		response = back.resume_vm(vm_name)
	elif command == 'poweroff_vm':
		vm_name = request.get('name')
		print(vm_name, command)
		response = back.shutdown_vm(vm_name)
	else:
		response = {'status': 'error', 'message': 'Unknown command'}
	
	return response


def start_server():
	host = '0.0.0.0'
	port = 12345
	server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
	server_socket.bind((host, port))
	server_socket.listen(5)
	print("KVM socket server listening...")
	
	while True:
		client_socket, addr = server_socket.accept()
		print(f"Connection from {addr}")
		
		try:
			data = client_socket.recv(4096).decode()
			if not data:
				print("No data received")  # Debugging: Log no data received
				break
			
			print("Data received:", data)  # Debugging: Log the data received
			request = json.loads(data)
			response = handle_request(request)
			response_json = json.dumps(response)
			print("Sending response:", response_json)  # Debugging: Log the response
			client_socket.send(response_json.encode())
		
		except json.JSONDecodeError:
			print("Invalid JSON received")  # Debugging: Log invalid JSON
			client_socket.send(json.dumps({'status': 'error', 'message': 'Invalid JSON'}).encode())
		except Exception as e:
			print(f"Unexpected error: {e}")  # Debugging: Log any unexpected error
			client_socket.send(json.dumps({'status': 'error', 'message': str(e)}).encode())
		finally:
			client_socket.close()
	
	server_socket.close()


if __name__ == '__main__':
	start_server()
