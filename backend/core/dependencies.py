from influxdb_client import InfluxDBClient
from core.database import db_manager
from typing import Generator
from sqlalchemy.orm import Session


def influxdb_client_dependency() -> InfluxDBClient:
    return db_manager.get_influxdb_client()


def sql_client_dependency() -> Generator[Session, None, None]:
    with db_manager.session() as session:
        yield session
