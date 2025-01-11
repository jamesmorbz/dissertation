option task = {name: "1h_aggregation", cron: "0 * * * *", offset: 1m}

from(bucket: "metrics")
    |> range(start: -1h)
    |> filter(fn: (r) => r["_measurement"] == "fluentbit.wattage" and r["_field"] == "power")
    |> elapsed()
    |> map(fn: (r) => ({r with _value: r._value * (float(v: r.elapsed) / 3600.0)}))
    |> sum()
    |> to(bucket: "1h-aggregated", timeColumn: "_stop")
