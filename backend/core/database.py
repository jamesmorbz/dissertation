from influxdb_client import InfluxDBClient
from .config import influx_settings
from sqlite3 import Connection, connect

influx_client = InfluxDBClient(
    url=influx_settings.url,
    token=influx_settings.token,
    org=influx_settings.org,
    debug=influx_settings.debug,
)

sqlite_client = connect("mqtt_messages.db")


def get_influxdb_client() -> InfluxDBClient:
    return influx_client


def get_sqlite_client() -> Connection:
    return sqlite_client
