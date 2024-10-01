import influxdb_client
from influxdb_client import Point
from influxdb_client.client.write_api import SYNCHRONOUS
import paho.mqtt.client as mqtt
import logging
import json

counter = 0
# token = "_VvTdkvnwyYzmHdyq-LE9R1lvrdM_aNO3q06es7EswjFgMK6UHByit1HWyiAZO3m4JLC0bHN6rJsU_ossUTJSA=="
token = "my-secret-token"
org = "diss"
url = "http://0.0.0.0:8086"

client = influxdb_client.InfluxDBClient(url=url, token=token, org=org)
bucket = "metrics"

write_api = client.write_api(write_options=SYNCHRONOUS)


def parse_power(status):
    if status == "ON":
        return True
    elif status == "OFF":
        return False
    else:
        logging.error("Unsupported status")


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
    global counter
    try:
        payload = json.loads(msg.payload)
    except json.JSONDecodeError as e:
        logging.error(f"JSON decode error: {e}")
        return

    if "SENSOR" in msg.topic:
        message = {"topic": msg.topic.split("/")[1], **payload["ENERGY"]}
        point = (
            Point("wattage")
            .tag("hardware_name", msg.topic.split("/")[1])
            .tag("source_topic", msg.topic)
            .field("power", message["Power"])
            .field("voltage", message["Voltage"])
            .field("current", message["Current"])
        )
    elif "STATE" in msg.topic:
        message = {"topic": msg.topic.split("/")[1], **payload}
        point = (
            Point("status")
            .tag("hardware_name", msg.topic.split("/")[1])
            .tag("source_topic", msg.topic)
            .tag("wifi_name", message["Wifi"]["SSId"])
            .field("power", parse_power(message["POWER"]))
            .field("uptime", message["UptimeSec"])
            .field("wifi_rssi", message["Wifi"]["RSSI"])
            .field("wifi_signal", message["Wifi"]["Signal"])
        )
    else:
        logging.info(f"something weird happened - {payload}")
        return

    write_api.write(bucket=bucket, org="diss", record=point)

    counter += 1
    if counter % 100 == 0:
        logging.info(f"Added {counter} new rows to DB")


mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
mqttc.on_connect = on_connect
mqttc.on_message = on_message

if __name__ == "__main__":
    logging.basicConfig(format="%(asctime)s %(message)s", level=logging.INFO)
    mqttc.connect("mqtt", 1883, 60)
    mqttc.loop_forever()
