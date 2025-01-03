from influxdb_client import InfluxDBClient
from .config import influx_settings
from sqlite3 import Connection, connect
from sqlalchemy import (
    create_engine,
    PrimaryKeyConstraint,
    ForeignKey,
    Boolean,
    Text,
    Column,
    Integer,
    String,
    TIMESTAMP,
    inspect,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.sql import func
from sqlalchemy.event import listens_for

influx_client = InfluxDBClient(
    url=influx_settings.url,
    token=influx_settings.token,
    org=influx_settings.org,
    debug=influx_settings.debug,
)

sqlite_client = connect("mqtt_messages.db")

SQLALCHEMY_DATABASE_URL = (
    "sqlite:///./sqlite3.db"  # The `connect_args` parameter is needed only for SQLite.
)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_influxdb_client() -> InfluxDBClient:
    return influx_client


def get_sqlite_client() -> Connection:
    return sqlite_client


def get_sql_session() -> Session:
    db = session()
    return db


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)

    first_name = Column(String(24))
    profile_picture = Column(Text)
    postcode = Column(Text)
    location = Column(Text)
    theme = Column(String(8), default="DARK")
    subscription = Column(Text)

    active = Column(Boolean, nullable=False, default=True)
    last_login = Column(TIMESTAMP)
    created_at = Column(TIMESTAMP, nullable=False, default=func.now())
    updated_at = Column(TIMESTAMP, nullable=False, default=func.now())


@listens_for(User, "before_update")
def update_updated_at(mapper, connection, target):
    state = inspect(target)
    if state.attrs.last_login.history.has_changes():
        return
    target.updated_at = func.now()


class Passwords(Base):
    __tablename__ = "passwords"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    password_hash = Column(String(255), nullable=False)
    updated_at = Column(
        TIMESTAMP, nullable=False, default=func.now(), onupdate=func.now()
    )


class DeviceMapping(Base):
    __tablename__ = "device_mappings"

    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    hardware_name = Column(String(30), nullable=False)
    friendly_name = Column(String(30), nullable=False)
    room = Column(Text)
    tag = Column(Text)

    created_at = Column(TIMESTAMP, nullable=False, default=func.now())
    updated_at = Column(
        TIMESTAMP, nullable=False, default=func.now(), onupdate=func.now()
    )

    # Composite Primary Key
    __table_args__ = (PrimaryKeyConstraint("user_id", "hardware_name"),)


# Create the database tables if they don't exist
User.metadata.create_all(bind=engine)
Passwords.metadata.create_all(bind=engine)
DeviceMapping.metadata.create_all(bind=engine)
