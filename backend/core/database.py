from contextlib import contextmanager
from typing import Generator
from influxdb_client import InfluxDBClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
import logging
from core.config import influx_settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

SQLITE_DB_PATH = "sqlite3.db"
SQLALCHEMY_DATABASE_URL = f"sqlite:///./{SQLITE_DB_PATH}"


class DatabaseManager:
    def __init__(self):
        self.engine = create_engine(
            SQLALCHEMY_DATABASE_URL,
            connect_args={"check_same_thread": False},
            poolclass=QueuePool,
            pool_size=10,
            max_overflow=20,
            pool_timeout=60,
            pool_recycle=3600,
            pool_pre_ping=True,
        )
        self.SessionFactory = sessionmaker(
            autocommit=False, autoflush=False, bind=self.engine, expire_on_commit=False
        )

        self.influx_client = InfluxDBClient(
            url=influx_settings.url,
            token=influx_settings.token,
            org=influx_settings.org,
            debug=influx_settings.debug,
        )

    @contextmanager
    def session(self) -> Generator[Session, None, None]:
        session = self.SessionFactory()
        try:
            yield session
            session.commit()
        except Exception as e:
            logger.error(f"Session error: {str(e)}")
            session.rollback()
            raise
        finally:
            session.close()

    def get_influxdb_client(self) -> InfluxDBClient:
        return self.influx_client

    def dispose(self):
        self.engine.dispose()
        self.mqtt_client.close()
        self.influx_client.close()


db_manager = DatabaseManager()
