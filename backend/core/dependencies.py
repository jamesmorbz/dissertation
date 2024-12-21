from influxdb_client import InfluxDBClient
from sqlite3 import Connection
from .database import get_influxdb_client, get_sql_session


def influxdb_client_dependency() -> InfluxDBClient:
    return get_influxdb_client()


def sql_client_dependency() -> Connection:
    return get_sql_session()
