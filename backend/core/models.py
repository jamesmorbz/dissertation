# database/models.py
from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
    String,
    Text,
    TIMESTAMP,
    PrimaryKeyConstraint,
    inspect,
    event,
)
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


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


@event.listens_for(User, "before_update")
def update_user_updated_at(mapper, connection, target):
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
    friendly_name = Column(String(30))
    room = Column(Text)
    tag = Column(Text)
    created_at = Column(TIMESTAMP, nullable=False, default=func.now())
    updated_at = Column(
        TIMESTAMP, nullable=False, default=func.now(), onupdate=func.now()
    )

    __table_args__ = (PrimaryKeyConstraint("user_id", "hardware_name"),)
