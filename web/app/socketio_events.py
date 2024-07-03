@socketio.on("connect")
def handle_connect():
    print("Client connected")


@socketio.on("disconnect")
def handle_disconnect():
    print("Client disconnected")


@socketio.on("message_from_client")
def handle_message(message):
    print("Received message:", message)
    socketio.emit("message_from_server", message)
