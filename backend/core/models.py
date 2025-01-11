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
from sqlalchemy.orm import Session
from sqlalchemy.orm.state import InstanceState

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
    hardware_name = Column(String(32), nullable=False)
    friendly_name = Column(String(32))
    room = Column(Text)
    tag = Column(Text)
    created_at = Column(TIMESTAMP, nullable=False, default=func.now())
    updated_at = Column(
        TIMESTAMP, nullable=False, default=func.now(), onupdate=func.now()
    )

    __table_args__ = PrimaryKeyConstraint("user_id", "hardware_name")


class Audit(Base):
    __tablename__ = "audit"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    timestamp = Column(TIMESTAMP, nullable=False, default=func.now())
    log = Column(Text, nullable=False)
    details = Column(Text, nullable=True)
    device = Column(String(32))
    action_type = Column(String(16))


class AutomationRule(Base):
    __tablename__ = "automation_rules"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    hardware_name = Column(String(32), nullable=False)
    active = Column(Boolean, nullable=False, default=True)
    action = Column(String(32), nullable=False)
    trigger_type = Column(String(32), nullable=False)
    value = Column(String(16), nullable=False)
    created_at = Column(TIMESTAMP, nullable=False, default=func.now())
    updated_at = Column(
        TIMESTAMP, nullable=False, default=func.now(), onupdate=func.now()
    )


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    timestamp = Column(TIMESTAMP, nullable=False, default=func.now())
    message = Column(Text, nullable=False)
    read = Column(Boolean, nullable=False, default=False)


def create_audit_log(
    session: Session,
    user_id: int,
    log: str,
    details: str,
    device: str = None,
    action_type: str = None,
):
    """Helper function to create an audit log entry"""
    audit_entry = Audit(
        user_id=user_id,
        log=log,
        details=details,
        device=device,
        action_type=action_type,
    )
    session.add(audit_entry)


@event.listens_for(DeviceMapping, "before_update")
def track_device_updates(mapper, connection, target: DeviceMapping):
    session = Session.object_session(target)
    if not session:
        return

    state: InstanceState[DeviceMapping] = inspect(target)
    changes = []

    if state.attrs.friendly_name.history.has_changes():
        old_name = (
            state.attrs.friendly_name.history.deleted[0]
            if state.attrs.friendly_name.history.deleted
            else None
        )
        new_name = (
            state.attrs.friendly_name.history.added[0]
            if state.attrs.friendly_name.history.added
            else None
        )
        changes.append(f"Name changed from '{old_name}' to '{new_name}'")

    if state.attrs.room.history.has_changes():
        old_room = (
            state.attrs.room.history.deleted[0]
            if state.attrs.room.history.deleted
            else None
        )
        new_room = (
            state.attrs.room.history.added[0]
            if state.attrs.room.history.added
            else None
        )
        changes.append(f"Room changed from '{old_room}' to '{new_room}'")

    if state.attrs.tag.history.has_changes():
        old_tag = (
            state.attrs.tag.history.deleted[0]
            if state.attrs.tag.history.deleted
            else None
        )
        new_tag = (
            state.attrs.tag.history.added[0] if state.attrs.tag.history.added else None
        )
        changes.append(f"Tag changed from '{old_tag}' to '{new_tag}'")

    if changes:
        log_message = f"Device Details for {target.hardware_name} were updated"
        create_audit_log(
            session,
            target.user_id,
            log_message,
            details=", ".join(changes),
            device=target.hardware_name,
            action_type="DEVICE_UPDATE",
        )


@event.listens_for(DeviceMapping, "before_insert")
def track_device_creation(mapper, connection, target: DeviceMapping):
    session = Session.object_session(target)
    if session:
        create_audit_log(
            session,
            target.user_id,
            f"Device Details for '{target.hardware_name}' were added",
            details=f"Attributes - Friendly Name: {target.friendly_name}, Room: {target.room}, Tag: {target.tag}",
            device=target.hardware_name,
            action_type="DEVICE_ADD",
        )


@event.listens_for(AutomationRule, "before_update")
def track_automation_rule_updates(mapper, connection, target: AutomationRule):
    session = Session.object_session(target)
    if not session:
        return

    state: InstanceState[AutomationRule] = inspect(target)
    changes = []

    if state.attrs.hardware_name.history.has_changes():
        old_name = (
            state.attrs.hardware_name.history.deleted[0]
            if state.attrs.hardware_name.history.deleted
            else None
        )
        new_name = (
            state.attrs.hardware_name.history.added[0]
            if state.attrs.hardware_name.history.added
            else None
        )
        changes.append(f"Hardware Name changed from '{old_name}' to '{new_name}'")

    if state.attrs.action.history.has_changes():
        old_action = (
            state.attrs.action.history.deleted[0]
            if state.attrs.action.history.deleted
            else None
        )
        new_action = (
            state.attrs.action.history.added[0]
            if state.attrs.action.history.added
            else None
        )
        changes.append(f"Action changed from '{old_action}' to '{new_action}'")

    if state.attrs.trigger_type.history.has_changes():
        old_trigger = (
            state.attrs.trigger_type.history.deleted[0]
            if state.attrs.trigger_type.history.deleted
            else None
        )
        new_trigger = (
            state.attrs.trigger_type.history.added[0]
            if state.attrs.trigger_type.history.added
            else None
        )
        changes.append(f"Trigger Type changed from '{old_trigger}' to '{new_trigger}'")

    if state.attrs.value.history.has_changes():
        old_value = (
            state.attrs.value.history.deleted[0]
            if state.attrs.value.history.deleted
            else None
        )
        new_value = (
            state.attrs.value.history.added[0]
            if state.attrs.value.history.added
            else None
        )
        changes.append(f"Value changed from '{old_value}' to '{new_value}'")

    if state.attrs.active.history.has_changes():
        old_active = (
            state.attrs.active.history.deleted[0]
            if state.attrs.active.history.deleted
            else None
        )
        new_active = (
            state.attrs.active.history.added[0]
            if state.attrs.active.history.added
            else None
        )
        changes.append(f"Active status changed from '{old_active}' to '{new_active}'")

    if changes:
        log_message = f"Automation Rule for {target.hardware_name} was updated"
        create_audit_log(
            session,
            target.user_id,
            log_message,
            details=", ".join(changes),
            device=target.hardware_name,
            action_type="AUTOMATION_RULE_UPDATE",
        )


@event.listens_for(AutomationRule, "before_insert")
def track_automation_rule_creation(mapper, connection, target: AutomationRule):
    session = Session.object_session(target)
    if session:
        create_audit_log(
            session,
            target.user_id,
            f"Automation Rule for '{target.hardware_name}' was created",
            details=f"Attributes - Action: {target.action}, Trigger Type: {target.trigger_type}, "
            f"Value: {target.value}, Active: {target.active}",
            device=target.hardware_name,
            action_type="AUTOMATION_RULE_ADD",
        )
