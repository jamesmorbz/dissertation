import paho.mqtt.client as mqtt
import logging
import json

# The callback for when the client receives a CONNACK response from the server.
def on_connect(client, userdata, flags, reason_code, properties):
    logging.info(f"Connected with result code {reason_code}")
    # Subscribing in on_connect() means that if we lose the connection and
    # reconnect then subscriptions will be renewed.
    client.subscribe("tele/tasmota_D5F2A7/#")
    client.subscribe("cmnd/tasmota_D5F2A7/#")
    client.subscribe("stat/tasmota_D5F2A7/#")
    client.subscribe("tele/tasmota_D5EADA/#")
    client.subscribe("cmnd/tasmota_D5EADA/#")
    client.subscribe("stat/tasmota_D5EADA/#")

# The callback for when a PUBLISH message is received from the server.
def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload)
    except json.JSONDecodeError as e:
        logging.error(f"JSON decode error: {e}")
        return
    
    message = {
        'topic': msg.topic,
        'payload': payload
    }
    logging.info(json.dumps(message))
    with open("mqtt_messages.json", "a") as file:
        file.write(json.dumps(message) + "\n")

mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
mqttc.on_connect = on_connect
mqttc.on_message = on_message

# Blocking call that processes network traffic, dispatches callbacks and
# handles reconnecting.
# Other loop*() functions are available that give a threaded interface and a
# manual interface.

if __name__ == "__main__":
    logging.basicConfig(format='%(asctime)s %(message)s', level=logging.INFO)
    mqttc.connect("mqtt.eclipseprojects.io", 1883, 60)
    mqttc.loop_forever()
