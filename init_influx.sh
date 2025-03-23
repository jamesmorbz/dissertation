#!/bin/sh

set -e

# Create buckets
influx bucket create -n usage -r 30d
influx bucket create -n devices
influx bucket create -n 1h-aggregated -r 180d
influx bucket create -n 1d-aggregated -r 360d

cat << 'EOF' > /tmp/devices.flux
option task = {
    name: "devices",
    cron: "0 * * * *"
}

from(bucket: "usage")
    |> range(start: -1d)
    |> filter(fn: (r) => r["_measurement"] == "status" and r["_field"] == "state")
    |> distinct(column: "hardware_name")
    |> keep(columns: ["_value", "_stop", "hardware_name"])
    |> set(key: "_field", value: "hardware_name")
    |> set(key: "_measurement", value: "device")
    |> to(bucket: "devices", timeColumn: "_stop")
EOF

influx task create -f /tmp/devices.flux

cat << 'EOF' > /tmp/1h_aggregation.flux
option task = {
    name: "1h_aggregation",
    cron: "0 * * * *",
    offset: 1m
}

from(bucket: "usage")
    |> range(start: -1h)
    |> filter(fn: (r) => r["_measurement"] == "power" and r["_field"] == "wattage")
    |> elapsed()
    |> map(fn: (r) => ({r with _value: r._value * (float(v: r.elapsed) / 3600.0)}))
    |> sum()
    |> to(bucket: "1h-aggregated", timeColumn: "_stop")
EOF

influx task create -f /tmp/1h_aggregation.flux

cat << 'EOF' > /tmp/1d_aggregation.flux
option task = {
    name: "1d_aggregation",
    cron: "0 0 * * *",
    offset: 5m
}

from(bucket: "1h-aggregated")
    |> range(start: -1d)
    |> sum()
    |> to(bucket: "1d-aggregated", timeColumn: "_stop")
EOF

influx task create -f /tmp/1d_aggregation.flux

