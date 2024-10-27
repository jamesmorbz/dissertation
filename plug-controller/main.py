from flask import Flask, request, jsonify
import paho.mqtt.client as mqtt
import time

app = Flask(__name__)

mqtt_client = mqtt.Client()

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT Broker!")
    else:
        print(f"Failed to connect, return code {rc}")

def on_disconnect(client, userdata, rc):
    print("Disconnected from MQTT Broker. Attempting to reconnect...")
    while True:
        try:
            mqtt_client.reconnect()
            print("Reconnected to MQTT Broker")
            break
        except:
            print("Reconnection failed, retrying in 5 seconds...")
            time.sleep(5)

@app.route('/action', methods=['PUT'])
def publish_message():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request data"}), 400
    
    device_id = data.get("device_id")
    action = data.get("command")
    parameter = data.get("parameter")

    if not device_id or not action:
        return jsonify({"error": "Missing device_id or command"}), 400

    topic = f"cmnd/{device_id}/{action}"
    res = mqtt_client.publish(topic, parameter)
    res.wait_for_publish(TIMEOUT)
    
    return jsonify({"status": f"Message published - {res}"}), 200

if __name__ == '__main__':
    TIMEOUT = 2
    mqtt_client.on_connect = on_connect
    mqtt_client.on_disconnect = on_disconnect
    mqtt_client.reconnect_delay_set(min_delay=1, max_delay=120)
    mqtt_client.connect("mqtt", 1883, 60)
    mqtt_client.loop_start()
    app.run(host='0.0.0.0', port=3000)