class InfluxDBQueries:
    @staticmethod
    def get_distinct_devices_query():
        return """
        from(bucket: "metrics")
            |> range(start: -90d)
            |> keep(columns: ["hardware_name"])
            |> distinct(column: "hardware_name")
        """

    @staticmethod
    def get_device_status_query():
        return """
        from(bucket: "metrics")
            |> range(start: -30d)
            |> filter(fn: (r) => r["_measurement"] == "fluentbit.status")
            |> filter(fn: (r) => r["_field"] == "power" or r["_field"] == "uptime" or r["_field"] == "wifi_rssi" or r["_field"] == "wifi_signal")
            |> last()
        """

    @staticmethod
    def get_last_usage_query():
        return """
        from(bucket: "metrics")
            |> range(start: -30d)
            |> filter(fn: (r) => r["_measurement"] == "fluentbit.wattage")
            |> filter(fn: (r) => r["_field"] == "power")
            |> map(fn: (r) => ({r with _unix: uint(v: r._time) }))
            |> last()
        """

    @staticmethod
    def get_row_count_per_device_query():
        return """
        from(bucket: "metrics")
            |> range(start: -24h)
            |> filter(fn: (r) => r["_measurement"] == "fluentbit.wattage")
            |> filter(fn: (r) => r["_field"] == "power")
            |> window(every: 1h)
            |> group(columns: ["hardware_name", "_start"])
            |> count()
        """

    @staticmethod
    def get_device_usage_query(
        lookback: str, device_id: str, interval: str, aggregation: str
    ):  # TODO: Stricter type hints on input to InfluxQuery
        return f"""
        from(bucket: "metrics")
            |> range(start: -{lookback})
            |> filter(fn: (r) => r["_measurement"] == "fluentbit.wattage")
            |> filter(fn: (r) => r["_field"] == "power")
            |> filter(fn: (r) => r["hardware_name"] == "{device_id}")
            |> aggregateWindow(every: {interval}, fn: {aggregation}, createEmpty: true)
            |> map(fn: (r) => ({{ r with _unix: uint(v: r._time) }}))
            |> fill(value: 0.0)
        """

    @staticmethod
    def get_weekly_summary_query():
        return """
            union(
                tables: [
                    from(bucket: "metrics")
                        |> range(start: -14d, stop: -7d)
                        |> filter(fn: (r) => r["_measurement"] == "fluentbit.wattage")
                        |> filter(fn: (r) => r["_field"] == "power")
                        |> group()
                        |> sum(),
                    from(bucket: "metrics")
                        |> range(start: -7d, stop: now())
                        |> filter(fn: (r) => r["_measurement"] == "fluentbit.wattage")
                        |> filter(fn: (r) => r["_field"] == "power")
                        |> group()
                        |> sum(),
                ]
            )
        """

    @staticmethod
    def get_monthly_summary_query():
        return """
            from(bucket: "metrics")
            |> range(start: -30d)
            |> filter(fn: (r) => r["_measurement"] == "fluentbit.wattage")
            |> filter(fn: (r) => r["_field"] == "power")
            |> aggregateWindow(every: 1d, fn: sum, createEmpty: true)
            |> fill(value:0.0)
            |> map(fn: (r) => ({r with _time: 
                if int(v: r._stop) - int(v: r._time) < 100000 then
                    r._time
                else
                    time(v: int(v: r._time) - 86400000000000)
            }))
        """

    @staticmethod
    def get_daily_aggregated_data_query(lookback_days: int, device_id: str = None):
        if device_id is None:
            return f"""
                from(bucket: "metrics")
                |> range(start: -{lookback_days}d)
                |> filter(fn: (r) => r["_measurement"] == "fluentbit.wattage")
                |> filter(fn: (r) => r["_field"] == "power")
                |> aggregateWindow(every: 1d, fn: sum, createEmpty: true)
                |> map(fn: (r) => ({{ r with _unix: uint(v: r._time) }}))
            """
        else:
            return f"""
                from(bucket: "metrics")
                |> range(start: -{lookback_days}d)
                |> filter(fn: (r) => r["_measurement"] == "fluentbit.wattage")
                |> filter(fn: (r) => r["_field"] == "power")
                |> filter(fn: (r) => r["hardware_name"] == "{device_id}")
                |> aggregateWindow(every: 1d, fn: sum, createEmpty: true)
                |> map(fn: (r) => ({{ r with _unix: uint(v: r._time) }}))
            """
