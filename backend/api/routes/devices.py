from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime, timedelta
import random
import sqlite3

router = APIRouter()

@router.get("/devices")
async def hello():
    query = '''
        WITH last_state AS (
            SELECT *,
                   ROW_NUMBER() OVER (PARTITION BY topic ORDER BY time DESC) as now
            FROM state_messages
        )
        SELECT
            topic,
            'hardware_name' as hardware_name,  -- Replace with actual hardware name if available
            'device_type' as device_type,  -- Replace with actual device type if available
            POWER as status,
            time as last_updated,
            uptime_sec as uptime_seconds,
            wifi_ssid,
            wifi_rssi
        FROM last_state
        WHERE now = 1
    '''
    
    conn = sqlite3.connect('mqtt_messages.db')
    cursor = conn.cursor()
    cursor.execute(query)
    rows = cursor.fetchall()
    conn.close()

    device_list = [
        {
            "name": row[0],
            "hardware_name": row[1],
            "device_type": row[2],
            "status": row[3],
            "last_updated": row[4],
            "uptime_seconds": row[5],
            "wifi_ssid": row[6],
            "wifi_rssi": row[7]
        }
        for row in rows
    ]
    
    return device_list