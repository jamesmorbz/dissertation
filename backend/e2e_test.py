from selenium import webdriver
from selenium.webdriver.common.by import By
import time
import logging
import requests
import json
import datetime
import paho.mqtt.client as mqtt

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
    plug_name = TEST_PLUG_NAME
    status_data = test_status_payload()
    publish_message(f"tele/{plug_name}/STATE", status_data)
    usage_data = test_usage_payload()
    publish_message(f"tele/{plug_name}/SENSOR", usage_data)
    logging.info(f"PASS - Pushed {TEST_PLUG_NAME} data to MQTT broker...")


def check_frontend_ui():
    driver = webdriver.Safari()

    try:
        frontend_url = "http://localhost:5173/dashboard"
        driver.get(frontend_url)
        time.sleep(1)  # Wait for the page to load

        # Locate the device card section
        device_cards = driver.find_elements(
            By.XPATH, "//div[contains(@class, 'device-card')]"
        )
        device_names = [card.text for card in device_cards]

        # Check if TEST_PLUG is listed
        if any(TEST_PLUG_NAME in name for name in device_names):
            logging.info(f"PASS - Found {TEST_PLUG_NAME} in the device tab")
        else:
            logging.error(f"FAIL - {TEST_PLUG_NAME} not found in the device tab")

    except Exception as e:
        logging.error(f"FAIL - Error during frontend UI check: {e}")

    finally:
        driver.quit()


def check_backend_response():
    backend_url = "http://localhost:8000/api/devices"
    response = requests.get(backend_url)

    data = response.json()

    if TEST_PLUG_NAME in data:
        logging.info(f"PASS - Found {TEST_PLUG_NAME} in Backend")
    else:
        logging.error("FAIL - Not Found {TEST_PLUG_NAME}")


def test_cleanup():
    pass


if __name__ == "__main__":
    TEST_PLUG_NAME = "TEST_PLUG_30042025"
    logging.basicConfig(format="%(asctime)s %(message)s", level=logging.INFO)
    mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

    logging.info("STARTED - E2E Integration Test...")
    mqtt_client.connect("localhost", 1883, 60)
    mqtt_client.loop_start()
    push_data()
    mqtt_client.disconnect()
    mqtt_client.loop_stop()

    check_backend_response()
    check_frontend_ui()

    test_cleanup()  # Remove test data if needed
    logging.info("PASS - Test completed successfully.")
    logging.info("FINISHED - E2E Integration Test...")
