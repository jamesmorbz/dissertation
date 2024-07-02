WITH
    last_state
    AS
    (
        SELECT *,
            ROW_NUMBER() OVER (PARTITION BY topic ORDER BY time DESC) as rn
        FROM state_messages
    )
SELECT
    COALESCE(mapping.friendly_name, state.topic) as hardware_name,
    state.topic,
    'device_type' as device_type, -- TODO Replace with actual device type if available
    state.POWER as status,
    state.time as last_updated,
    state.uptime_sec as uptime_seconds,
    state.wifi_ssid,
    state.wifi_rssi
FROM last_state state
    LEFT JOIN device_mappings mapping
    ON state.topic = mapping.tasmota_name
WHERE state.rn = 1