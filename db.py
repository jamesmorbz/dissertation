import sqlite3
import json

def create_database():
    conn = sqlite3.connect('mqtt_messages.db')
    c = conn.cursor()
    
    # Create table for STATE messages
    c.execute('''
        CREATE TABLE IF NOT EXISTS state_messages (
            id INTEGER PRIMARY KEY,
            topic TEXT,
            time TEXT,
            uptime TEXT,
            uptime_sec INTEGER,
            heap INTEGER,
            sleep_mode TEXT,
            sleep INTEGER,
            load_avg INTEGER,
            mqtt_count INTEGER,
            power TEXT,
            wifi_ap INTEGER,
            wifi_ssid TEXT,
            wifi_bssid TEXT,
            wifi_channel INTEGER,
            wifi_mode TEXT,
            wifi_rssi INTEGER,
            wifi_signal INTEGER,
            wifi_link_count INTEGER,
            wifi_downtime TEXT
        )
    ''')
    
    # Create table for SENSOR messages
    c.execute('''
        CREATE TABLE IF NOT EXISTS sensor_messages (
            id INTEGER PRIMARY KEY,
            topic TEXT,
            time TEXT,
            total_start_time TEXT,
            total REAL,
            yesterday REAL,
            today REAL,
            period INTEGER,
            power REAL,
            apparent_power REAL,
            reactive_power REAL,
            factor REAL,
            voltage REAL,
            current REAL
        )
    ''')
    
    conn.commit()
    conn.close()



def insert_state_message(conn, message):
    c = conn.cursor()
    c.execute('''
        INSERT INTO state_messages (
            topic, time, uptime, uptime_sec, heap, sleep_mode, sleep,
            load_avg, mqtt_count, power, wifi_ap, wifi_ssid, wifi_bssid,
            wifi_channel, wifi_mode, wifi_rssi, wifi_signal, wifi_link_count, wifi_downtime
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        message['topic'], message['payload']['Time'], message['payload']['Uptime'],
        message['payload']['UptimeSec'], message['payload']['Heap'], message['payload']['SleepMode'],
        message['payload']['Sleep'], message['payload']['LoadAvg'], message['payload']['MqttCount'],
        message['payload']['POWER'], message['payload']['Wifi']['AP'], message['payload']['Wifi']['SSId'],
        message['payload']['Wifi']['BSSId'], message['payload']['Wifi']['Channel'], message['payload']['Wifi']['Mode'],
        message['payload']['Wifi']['RSSI'], message['payload']['Wifi']['Signal'],
        message['payload']['Wifi']['LinkCount'], message['payload']['Wifi']['Downtime']
    ))
    conn.commit()

def insert_sensor_message(conn, message):
    c = conn.cursor()
    c.execute('''
        INSERT INTO sensor_messages (
            topic, time, total_start_time, total, yesterday, today,
            period, power, apparent_power, reactive_power, factor,
            voltage, current
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        message['topic'], message['payload']['Time'], message['payload']['ENERGY']['TotalStartTime'],
        message['payload']['ENERGY']['Total'], message['payload']['ENERGY']['Yesterday'],
        message['payload']['ENERGY']['Today'], message['payload']['ENERGY']['Period'],
        message['payload']['ENERGY']['Power'], message['payload']['ENERGY']['ApparentPower'],
        message['payload']['ENERGY']['ReactivePower'], message['payload']['ENERGY']['Factor'],
        message['payload']['ENERGY']['Voltage'], message['payload']['ENERGY']['Current']
    ))
    conn.commit()


def move_messages_to_db():
    conn = sqlite3.connect('mqtt_messages.db')
    
    with open("mqtt_messages.json", "r") as file:
        for line in file:
            message = json.loads(line.strip())
            topic = message['topic']
            if 'STATE' in topic:
                insert_state_message(conn, message)
            elif 'SENSOR' in topic:
                insert_sensor_message(conn, message)
    
    conn.close()

if __name__ == "__main__":
    create_database()
    move_messages_to_db()