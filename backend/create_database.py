import sqlite3


def create_database():
    conn = sqlite3.connect("mqtt_messages.db")
    c = conn.cursor()

    # Create table for STATE messages
    c.execute(
        """
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
    """
    )

    # Create table for SENSOR messages
    c.execute(
        """
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
    """
    )

    c.execute("DROP TABLE IF EXISTS device_mappings")
    c.execute(
        """
        CREATE TABLE IF NOT EXISTS device_mappings (
            hardware_name TEXT PRIMARY KEY,
            friendly_name TEXT,
            tag TEXT,
            last_updated TIMESTAMP
        )
    """
    )

    conn.commit()
    conn.close()


if __name__ == "__main__":
    create_database()
