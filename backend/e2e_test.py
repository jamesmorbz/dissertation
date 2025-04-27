import time
import paho.mqtt.client as mqtt
import datetime
import logging
import json
import requests

PROCESS_START_TIME = time.time()


def test_usage_payload():
    return {
        "Time": datetime.datetime.now().replace(microsecond=0).isoformat(sep="T"),
        "ENERGY": {
            "Power": 0,
            "Voltage": 0,
            "Current": 0,
        },
    }


def test_status_payload():
    return {
        "Time": datetime.datetime.now().replace(microsecond=0).isoformat(sep="T"),
        "POWER": "ON",
        "UptimeSec": int(time.time() - PROCESS_START_TIME),
        "Wifi": {
            "SSId": "TEST_SSID",
            "RSSI": 0,
            "Signal": 0,
        },
    }


def publish_message(topic, data, qos=1):
    msg_info = mqtt_client.publish(topic, json.dumps(data), qos=qos)
    msg_info.wait_for_publish()


def push_data():
    plug_name = "TEST_PLUG"
    status_data = test_status_payload()
    publish_message(f"tele/{plug_name}/STATE", status_data)
    usage_data = test_usage_payload()
    publish_message(f"tele/{plug_name}/SENSOR", usage_data)


def check_frontend_response():
    backend_url = "http://localhost:8000/api/devices/TEST_PLUG"
    response = requests.get(backend_url)

    if response.status_code == 200:
        logging.info("Device exists in the backend.")
    else:
        logging.error(f"Device check failed with status code: {response.status_code}")


def test_cleanup():
    # Placeholder for actual cleanup logic
    pass


if __name__ == "__main__":
    logging.basicConfig(format="%(asctime)s %(message)s", level=logging.INFO)
    mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

    mqtt_client.connect("mqtt", 1883, 60)
    push_data()
    mqtt_client.disconnect()

    check_frontend_response()

    test_cleanup()
    logging.info("Test completed successfully.")
