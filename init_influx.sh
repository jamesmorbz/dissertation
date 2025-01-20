#!/bin/sh

set -e

# Create buckets
influx bucket create -n devices -r 30d
influx bucket create -n 1h-aggregated -r 180d
influx bucket create -n 1d-aggregated -r 360d

# Create devices tracking task
cat << 'EOF' > /tmp/devices.flux
option task = {
    name: "devices",
    cron: "0 * * * *"
}

from(bucket: "metrics")
    |> range(start: -1d)
    |> filter(fn: (r) => r["_measurement"] == "fluentbit.status" and r["_field"] == "power")
    |> distinct(column: "hardware_name")
    |> keep(columns: ["_value", "_stop", "hardware_name"])
    |> set(key: "_field", value: "hardware_name")
    |> set(key: "_measurement", value: "device")
    |> to(bucket: "devices", timeColumn: "_stop")
EOF

influx task create -f /tmp/devices.flux

# Create daily aggregation task
cat << 'EOF' > /tmp/1d_aggregation.flux
option task = {
    name: "1d_aggregation",
    cron: "0 0 * * *",
    offset: 1m
}

from(bucket: "1h-aggregated")
    |> range(start: -1d)
    |> sum()
    |> to(bucket: "1d-aggregated", timeColumn: "_stop")
EOF

influx task create -f /tmp/1d_aggregation.flux

# Create hourly aggregation task
cat << 'EOF' > /tmp/1h_aggregation.flux
option task = {
    name: "1h_aggregation",
    cron: "0 * * * *",
    offset: 1m
}

from(bucket: "devices")
    |> range(start: -1h)
    |> filter(fn: (r) => r["_measurement"] == "fluentbit.wattage" and r["_field"] == "power")
    |> elapsed()
    |> map(fn: (r) => ({r with _value: r._value * (float(v: r.elapsed) / 3600.0)}))
    |> sum()
    |> to(bucket: "1h-aggregated", timeColumn: "_stop")
EOF

influx task create -f /tmp/1h_aggregation.flux