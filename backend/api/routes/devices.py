from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime, timedelta
import random
from fastapi_cache.decorator import cache
import sqlite3

router = APIRouter()

@router.get("/devices")
# @cache(expire=5) # TODO a bit aggresive?
async def devices_api():
    query = '''
        WITH last_state AS (
            SELECT *,
                   ROW_NUMBER() OVER (PARTITION BY topic ORDER BY time DESC) as rn
            FROM state_messages
        )
        SELECT
            COALESCE(mapping.friendly_name, state.topic) as hardware_name,
            state.topic,
            'device_type' as device_type,  -- Replace with actual device type if available
            state.POWER as status,
            state.time as last_updated,
            state.uptime_sec as uptime_seconds,
            state.wifi_ssid,
            state.wifi_rssi
        FROM last_state state
        LEFT JOIN device_mappings mapping
        ON state.topic = mapping.tasmota_name
        WHERE state.rn = 1
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