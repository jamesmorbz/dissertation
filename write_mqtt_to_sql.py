import paho.mqtt.client as mqtt
import logging
import json
import sqlite3

# Function to insert state message into the database
def insert_state_message(conn, message):
    c = conn.cursor()
    payload = message['payload']
    c.execute('''
        INSERT INTO state_messages (
            topic, time, uptime, uptime_sec, heap, sleep_mode, sleep,
            load_avg, mqtt_count, power, wifi_ap, wifi_ssid, wifi_bssid,
            wifi_channel, wifi_mode, wifi_rssi, wifi_signal, wifi_link_count, wifi_downtime
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        message['topic'], payload['Time'], payload['Uptime'],
        payload['UptimeSec'], payload['Heap'], payload['SleepMode'],
        payload['Sleep'], payload['LoadAvg'], payload['MqttCount'],
        payload['POWER'], payload['Wifi']['AP'], payload['Wifi']['SSId'],
        payload['Wifi']['BSSId'], payload['Wifi']['Channel'], payload['Wifi']['Mode'],
        payload['Wifi']['RSSI'], payload['Wifi']['Signal'],
        payload['Wifi']['LinkCount'], payload['Wifi']['Downtime']
    ))
    conn.commit()

# Function to insert sensor message into the database
def insert_sensor_message(conn, message):
    c = conn.cursor()
    payload = message['payload']
    c.execute('''
        INSERT INTO sensor_messages (
            topic, time, total_start_time, total, yesterday, today,
            period, power, apparent_power, reactive_power, factor,
            voltage, current
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        message['topic'], payload['Time'], payload['ENERGY']['TotalStartTime'],
        payload['ENERGY']['Total'], payload['ENERGY']['Yesterday'],
        payload['ENERGY']['Today'], payload['ENERGY']['Period'],
        payload['ENERGY']['Power'], payload['ENERGY']['ApparentPower'],
        payload['ENERGY']['ReactivePower'], payload['ENERGY']['Factor'],
        payload['ENERGY']['Voltage'], payload['ENERGY']['Current']
    ))
    conn.commit()

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
    
    conn = sqlite3.connect('mqtt_messages.db')
    if 'STATE' in msg.topic:
        insert_state_message(conn, message)
    elif 'SENSOR' in msg.topic:
        insert_sensor_message(conn, message)
    conn.close()

mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
mqttc.on_connect = on_connect
mqttc.on_message = on_message

if __name__ == "__main__":
    logging.basicConfig(format='%(asctime)s %(message)s', level=logging.INFO)
    mqttc.connect("mqtt.eclipseprojects.io", 1883, 60)
    mqttc.loop_forever()
