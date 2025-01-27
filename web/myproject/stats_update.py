#
#
#
# vm_list = []
# def get_vm():
#     vms = Stats.query.all()
#     for vm in vms:
#         vm_name = vm["vm_name"]
#         vm_list.append(vm_name)
#     return vm_list
#
#
# def get_connection():
#     try:
#         return libvirt.open("qemu:///system")
#     except libvirt.libvirtError as e:
#         print(f"Failed to open connection to qemu:///system: {e}")
#         return None
#
# def vm_update():
#     conn = get_connection()
#     while True:
#         vms = get_vm()
#         for vm in vms:
#             vm_name = vm["vm_name"]
#
#             try:
#                 domain = conn.lookupByName(vm_name)
#
#                 # Initial measurement
#                 initial_cpu_stats = domain.getCPUStats(True)
#                 initial_cpu_time = initial_cpu_stats[0]['cpu_time']
#
#                 # Wait for 1 second
#                 interval = 60
#                 time.sleep(interval)
#
#                 # Final measurement
#                 final_cpu_stats = domain.getCPUStats(True)
#                 final_cpu_time = final_cpu_stats[0]['cpu_time']
#
#                 # Calculate CPU usage
#                 cpu_time_used = final_cpu_time - initial_cpu_time
#                 cpu_usage_percentage = (cpu_time_used / (interval * 1e9)) * 100  # Convert to percentage
#
#                 # Prepare stats
#                 initial_memory_stats = domain.memoryStats()
#                 initial_memory_time = initial_memory_stats[0]
#                 print(initial_memory_time)
#
#                 new_stats = Stats(
#                     vm_name=vm_name,
#                     cpu_usage=cpu_usage_percentage,  # Placeholder, update with real data
#                     memory_usage="0%",  # Placeholder, update with real data
#                     disk_io="0%",  # Placeholder, update with real data
#                     time_stamp=datetime.now()  # Update with the actual timestamp
#                 )
#                 # db.session.add(new_stats)
#                 # db.session.commit()
#
#                 return json.dumps({"vms": vms})
#             except libvirt.libvirtError as e:
#                 return json.dumps({"error": str(e)}), 500
#             finally:
#                 if conn:
#                     conn.close()
#
# if __name__ == "__main__":
#     vm_update()