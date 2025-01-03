from fastapi import APIRouter, Depends
from datetime import datetime
from pydantic.dataclasses import dataclass
from typing import List
from influxdb_client import InfluxDBClient
from influxdb_client.client.flux_table import TableList
from core.queries.influx_queries import InfluxDBQueries
from utils.query_helper import InfluxHelper
from utils.user import get_current_user
from typing import Annotated
from core.database import User
from core.dependencies import influxdb_client_dependency
from pydantic import BaseModel

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


# TODO - If we remove device name from the above summary data class we should add the below data class
@dataclass
class SummarySet:
    device_name: str
    data: List[Summary]


class LastUsage(BaseModel):
    hardware_name: str
    last_usage: int


# TODO ensure these are the supported units of time supported  duration_lit = int_lit duration_unit .
# duration_unit       = "s" | "m" | "h" | "d" | "w" .
# TODO can play around with time truncation if we ever need
# |> truncateTimeColumn(unit: {interval})
# TODO use start_timestamp
# TODO  |> fill(usePrevious: true)


@router.get(
    "/device/{device_id}",
    response_model=Dataset,
    tags=["Device"],
    summary="Get Power Usage Data for a Device",
)
async def get_device_data(
    device_id: str,  # TODO remove this default value
    start_timestamp: int = int(datetime.now().timestamp()),
    lookback: str = "15m",
    interval: str = "1m",
    aggregation: str = "max",
    influx_client: InfluxDBClient = Depends(influxdb_client_dependency),
):

    query = InfluxDBQueries.get_device_usage_query(
        lookback, device_id, interval, aggregation
    )
    response: TableList = InfluxHelper.query_influx(influx_client, query)
    fields = ["_unix", "_value", "_time"]
    data = InfluxHelper.convert_resp_to_dict(response, fields)[
        1:-1
    ]  # TODO - currently removing -1 as the timestamp takes a different format and is skewed off the minute - this may have side effects
    return {"device_name": device_id, "data": data}


@router.get(
    "/device/{device_id}/daily_data",
    response_model=Dataset,
    tags=["Device"],
    summary="TBC",
)
async def get_device_daily_data(
    device_id: str,
    lookback_days: int = 7,
    influx_client: InfluxDBClient = Depends(influxdb_client_dependency),
):
    query = InfluxDBQueries.get_daily_aggregated_data_query(lookback_days, device_id)
    response: TableList = InfluxHelper.query_influx(influx_client, query)
    fields = ["_unix", "_value", "_time"]
    data = InfluxHelper.convert_resp_to_dict(response, fields)

    return {"device_name": device_id, "data": data}


@router.get(
    "/last_usage",
    # response_model=List[LastUsage],
    tags=["All Devices"],
    summary="Get the current status of all devices",
)
async def devices_current_state(
    current_user: Annotated[
        User, Depends(get_current_user)
    ],  # TODO: add user validation to influxDB data get
    influx_client: InfluxDBClient = Depends(influxdb_client_dependency),
):
    query: str = InfluxDBQueries.get_last_usage_query()
    response: TableList = InfluxHelper.query_influx(influx_client, query)
    fields = ["_value", "hardware_name"]
    rows = InfluxHelper.convert_resp_to_dict(response, fields)

    devices = {}
    for row in rows:
        device_name = row["hardware_name"]
        devices[device_name] = {"last_usage": row["_value"]}

    return devices


@router.get(
    "/daily_data",
    response_model=List[Dataset],
    tags=["Summary", "Device"],
    summary="TBC1",
)
async def get_daily_data(
    lookback_days: int = 7,
    influx_client: InfluxDBClient = Depends(influxdb_client_dependency),
):
    query = InfluxDBQueries.get_daily_aggregated_data_query(lookback_days)
    response: TableList = InfluxHelper.query_influx(influx_client, query)
    fields = ["hardware_name", "_unix", "_value", "_time"]
    rows = InfluxHelper.convert_resp_to_dict(response, fields)

    data = {}
    for row in rows:
        device_name = row["hardware_name"]
        data_point = DataPoint(row["_unix"], row["_value"], row["_time"])
        if device_name not in data:
            data[device_name] = {"device_name": device_name, "data": [data_point]}
        else:
            data[device_name]["data"].append(data_point)

    return data.values()
