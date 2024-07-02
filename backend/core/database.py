from influxdb_client import InfluxDBClient
from .config import settings
from sqlite3 import Connection, connect

influx_client = InfluxDBClient(
    url=settings.influxdb_url,
    token=settings.influxdb_token,
    org=settings.influxdb_org,
    debug=True,
)

sqlite_client = connect("mqtt_messages.db")


def get_influxdb_client() -> InfluxDBClient:
    return influx_client


def get_sqlite_client() -> Connection:
    return sqlite_client
