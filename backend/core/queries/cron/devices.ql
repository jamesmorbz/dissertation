option task = {name: "devices", cron: "0 * * * *"}

from(bucket: "metrics")
    |> range(start: -1d)
    |> filter(fn: (r) => r["_measurement"] == "fluentbit.status" and r["_field"] == "power")
    |> distinct(column: "hardware_name")
    |> keep(columns: ["_value", "_stop", "hardware_name"])
    |> set(key: "_field", value: "hardware_name")
    |> set(key: "_measurement", value: "device")
    |> to(bucket: "devices", timeColumn: "_stop")
