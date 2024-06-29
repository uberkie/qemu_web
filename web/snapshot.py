import sys
import requests
import json

if len(sys.argv) != 3:
    print("Usage: snapshot.py <vm_name> <snapshot_name>")
    sys.exit(1)

vm_name = sys.argv[1]
snapshot_name = sys.argv[2]

url = f"http://localhost:8081/api/vms/{vm_name}/snapshots"
payload = json.dumps({
    "snapshot_name": snapshot_name
})
headers = {
    'Content-Type': 'application/json'
}

response = requests.post(url, headers=headers, data=payload)

if response.status_code == 200:
    print("Snapshot created successfully")
else:
    print(f"Failed to create snapshot: {response.status_code}, {response.text}")
