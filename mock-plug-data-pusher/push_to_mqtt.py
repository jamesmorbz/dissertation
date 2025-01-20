import time
import paho.mqtt.client as mqtt
import datetime
import yaml
import random
import logging
import json

INTERVAL_SECONDS = 5
PROCESS_START_TIME = time.time()

def gen_rand_bool(usage_spike_frequency):
    return random.choices([True, False], weights=[usage_spike_frequency, 100 - usage_spike_frequency], k=1)[0]


def gen_rand_float(low, high):
    return round(random.uniform(low, high), 2)


def format_usage_payload(power, voltage, current):
    return {
        "Time": datetime.datetime.now().replace(microsecond=0).isoformat(sep="T"),
        "ENERGY": {
            "Power": power,
            "Voltage": voltage,
            "Current": current,
        }
    }


def format_status_payload(network_name):
    return {
        "Time": datetime.datetime.now().replace(microsecond=0).isoformat(sep="T"),
        "POWER": "ON",
        "UptimeSec": int(time.time() - PROCESS_START_TIME),
        "Wifi": {
            "SSId": network_name,
            "RSSI": random.randint(0, 100),
            "Signal": random.randint(-100, 0),
        }
    }


def publish_message(topic, data, qos=1):
    msg_info = mqtt_client.publish(topic, json.dumps(data), qos=qos)
    msg_info.wait_for_publish()


def get_usage(mock_plug):
    configured_usage = mock_plug["usage"]
    voltage = random.randint(240, 260)
    if "usage_spikes" in mock_plug and gen_rand_bool(mock_plug["usage_spikes"]):
        possible_levels = ["HIGH", "MEDIUM", "LOW", "IDLE"]
        possible_levels.remove(configured_usage)
        usage_level = random.choice(possible_levels)
    else:
        usage_level = configured_usage

    match usage_level:
        case "HIGH":
            return (
                random.randint(usage["HIGH"]["WATTAGE_MIN"], usage["HIGH"]["WATTAGE_MAX"]),
                voltage,
                gen_rand_float(usage["HIGH"]["CURRENT_MIN"], usage["HIGH"]["CURRENT_MAX"]))
        case "MEDIUM":
            return (
                random.randint(usage["MEDIUM"]["WATTAGE_MIN"], usage["MEDIUM"]["WATTAGE_MAX"]),
                voltage,
                gen_rand_float(usage["MEDIUM"]["CURRENT_MIN"], usage["MEDIUM"]["CURRENT_MAX"]))
        case "LOW":
            return (
                random.randint(usage["LOW"]["WATTAGE_MIN"], usage["LOW"]["WATTAGE_MAX"]),
                voltage,
                gen_rand_float(usage["LOW"]["CURRENT_MIN"], usage["LOW"]["CURRENT_MAX"]))
        case "IDLE":
            return 0, voltage, gen_rand_float(0, 0.04)
        case _:
            raise Exception("Unknown usage type in plug")


def push_data():
    plugs = config["plugs"]

    while True:
        for mock_plug in plugs:
            plug_name = mock_plug["name"]
            reliability = mock_plug.get("reliability", 100)

            if gen_rand_bool(reliability):
                status_data = format_status_payload(mock_plug["network_name"])
                publish_message(f"tele/{plug_name}/STATE", status_data)

                power, voltage, current = get_usage(mock_plug)
                usage_data = format_usage_payload(power, voltage, current)
                publish_message(f"tele/{plug_name}/SENSOR", usage_data)
            else:
                logging.info(f"{plug_name} didn't publish data")

        time.sleep(INTERVAL_SECONDS)

if __name__ == "__main__":
    config = yaml.safe_load(open("config.yaml"))
    usage = config["usage"]

    logging.basicConfig(format="%(asctime)s %(message)s", level=logging.INFO)
    mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

    mqtt_client.connect("mqtt", 1883, 60)
    mqtt_client.loop_start()
    push_data()
    mqtt_client.disconnect()
    mqtt_client.loop_stop()
