import paho.mqtt.client as mqtt
import logging
import json
from fluent import asyncsender as sender
from fluent import event
from paho.mqtt.client import MQTTMessage

# Set up Fluent Bit logging client
fluent_sender = sender.FluentSender('fluentbit', host='fluentbit', port=24224)

def send_to_fluentbit(tag, record):
    """Send data to Fluent Bit using Fluent Forward Protocol."""
    try:
        # Use Fluentd event to send the log in the proper forward protocol format
        fluent_sender.emit(tag, record)
    except Exception as e:
        logging.error(f"Failed to send data to Fluent Bit: {e}")

def parse_power(status) -> bool:
    if status == "ON":
        return True
    elif status == "OFF":
        return False
    else:
        logging.error(f"Unsupported status: {status}")
        return False

def on_message(client, userdata, msg: MQTTMessage):
    topic = msg.topic
    
    if topic.endswith("/sensors") or topic.endswith("/LWT") or "discovery" in topic:
        logging.info(f"Ignoring message - {topic}")
        return
    
    try:
        payload = json.loads(msg.payload)
    except json.JSONDecodeError:
        logging.error(f"Bad Payload - {topic} - {msg.payload}")
        return
    
    fluentbit_payload = {}

    if topic.endswith("SENSOR"):
        fluentbit_payload = {
            "hardware_name": topic.split("/")[1],
            "source_topic": topic,
            "power": payload["ENERGY"]["Power"],
            "voltage": payload["ENERGY"]["Voltage"],
            "current": payload["ENERGY"]["Current"]
        }
        tag = "wattage"
    elif topic.endswith("STATE"):
        fluentbit_payload = {
            "hardware_name": topic.split("/")[1],
            "source_topic": topic,
            "wifi_name": payload["Wifi"]["SSId"],
            "power": parse_power(payload["POWER"]),
            "uptime": payload["UptimeSec"],
            "wifi_rssi": payload["Wifi"]["RSSI"],
            "wifi_signal": payload["Wifi"]["Signal"]
        }
        tag = "status"
    
    if fluentbit_payload:
        logging.info(f"Sending Payload to Fluent Bit - {fluentbit_payload}")
        send_to_fluentbit(tag, fluentbit_payload)

def on_connect(client, userdata, flags, reason_code, properties):
    logging.info(f"Connected with result code {reason_code} - Subscribing to all Topics on Brokers")
    client.subscribe("#")

if __name__ == "__main__":
    logging.basicConfig(format="%(asctime)s %(message)s", level=logging.INFO)
    mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    mqttc.on_connect = on_connect
    mqttc.on_message = on_message
    mqttc.connect("mqtt", 1883, 60)
    mqttc.loop_forever()
    sender.close()
