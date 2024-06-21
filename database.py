import sqlite3

conn = sqlite3.connect("mqtt_messages.db")
c = conn.cursor()    

c.execute('''
        CREATE TABLE IF NOT EXISTS device_mappings (
            id INTEGER PRIMARY KEY,
            tasmota_name TEXT UNIQUE,
            friendly_name TEXT
        )
    ''')