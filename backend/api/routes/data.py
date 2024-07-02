from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta
import random
from pydantic.dataclasses import dataclass
from typing import List
from core.dependencies import get_influxdb_client
from influxdb_client import InfluxDBClient
import json
from influxdb_client.client.flux_table import TableList

router = APIRouter()


@dataclass
class DataPoint:
    _unix: int
    _value: int | None  # TODO maybe null values should be 0?
    _time: str


@dataclass
class Dataset:
    device_name: str
    data: List[DataPoint]


@dataclass
class Summary:
    device_name: str
    end_timestamp: int
    start_timestamp: int
    total_power: int
    average_power: float


def generate_data(start_timestamp, lookback_minutes, interval_seconds):
    data = []

    for i in range(lookback_minutes):
        date = start_timestamp - (i * interval_seconds)
        data.append(DataPoint(date, random.randint(100, 300)))

    return data


# TODO ensure these are the supported units of time supported  duration_lit        = int_lit duration_unit .
# duration_unit       = "s" | "m" | "h" | "d" | "w" .
# TODO can play around with time truncation if we ever need
# |> truncateTimeColumn(unit: {interval})
# TODO use start_timestamp


@router.get(
    "/{device_id}",
    response_model=Dataset,
    tags=["Device"],
    summary="Get Power Usage Data for a Device",
)
async def get_data(
    device_id: str,  # TODO remove this default value
    start_timestamp: int = int(datetime.now().timestamp()),
    lookback: str = "15m",
    interval: str = "1m",
    aggregation: str = "max",
    influx_client: InfluxDBClient = Depends(get_influxdb_client),
):
    query_api = influx_client.query_api()
    # TODO how can I store influx queries in a more elegant way?
    query = f"""
    from(bucket: "metrics")
        |> range(start: -{lookback})
        |> filter(fn: (r) => r["_measurement"] == "wattage")
        |> filter(fn: (r) => r["_field"] == "power")
        |> filter(fn: (r) => r["hardware_name"] == "{device_id}")
        |> aggregateWindow(every: {interval}, fn: {aggregation}, createEmpty: true)
        |> map(fn: (r) => ({{ r with _unix: uint(v: r._time) }}))
    """
    response: TableList = query_api.query(query)
    data = json.loads(response.to_json(["_unix", "_value", "_time"]))

    return {"device_name": device_id, "data": data}


@router.get(
    "/{device_id}/summary",
    response_model=Summary,
    tags=["Device"],
    summary="Get Power Usage Summary for a Device",
)
async def get_summary(
    device_id: str,
    end_date: str = datetime.now().strftime("%d-%m-%Y"),
    start_date: str = (datetime.now() - timedelta(days=1)).strftime("%d-%m-%Y"),
):
    try:
        start_dt = datetime.strptime(start_date, "%d-%m-%Y")
        end_dt = datetime.strptime(end_date, "%d-%m-%Y")
    except ValueError:
        raise HTTPException(
            status_code=400, detail="Incorrect date format, should be DD-MM-YYYY"
        )

    if start_dt >= end_dt:
        raise HTTPException(
            status_code=400, detail="start_date must be before end_date"
        )

    total_minutes = int((end_dt - start_dt).total_seconds() / 60)
    total_power = sum(
        random.randint(100, 300) for _ in range(total_minutes)
    )  # Simulated total
    average_power = total_power / total_minutes

    summary = {
        "device_name": device_id,
        "end_timestamp": int(start_dt.timestamp()),
        "start_timestamp": int(end_dt.timestamp()),
        "total_power": total_power,
        "average_power": average_power,
    }

    return summary
