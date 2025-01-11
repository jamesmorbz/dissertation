option task = {name: "1d_aggregation", cron: "0 0 * * *", offset: 1m}

from(bucket: "1h-aggregated")
    |> range(start: -1d)
    |> sum()
    |> to(bucket: "1d-aggregated", timeColumn: "_stop")
    