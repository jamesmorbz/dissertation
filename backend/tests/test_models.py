import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError
from core.models import (
    User,
    DeviceMapping,
    Audit,
    AutomationRule,
    Notification,
    Passwords,
)
from core.models import Base


@pytest.fixture(scope="function")
def session():
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)

    sess = Session()
    yield sess
    sess.rollback()
    sess.close()


def test_create_user(session):
    user = User(username="testuser", email="test@example.com")
    session.add(user)
    session.commit()
    fetched_user = session.query(User).filter_by(username="testuser").first()
    assert fetched_user.email == "test@example.com"


def test_user_unique_username(session):
    user1 = User(username="unique", email="user1@example.com")
    user2 = User(username="unique", email="user2@example.com")
    session.add_all([user1, user2])
    with pytest.raises(IntegrityError):
        session.commit()


def test_user_default_active(session):
    user = User(username="defaultactive", email="active@example.com")
    session.add(user)
    session.commit()
    fetched_user = session.query(User).filter_by(username="defaultactive").first()
    assert fetched_user.active is True


def test_user_theme_default(session):
    user = User(username="defaulttheme", email="theme@example.com")
    session.add(user)
    session.commit()
    fetched_user = session.query(User).filter_by(username="defaulttheme").first()
    assert fetched_user.theme == "DARK"


def test_password_creation(session):
    user = User(username="passworduser", email="pass@example.com")
    session.add(user)
    session.commit()
    pwd = Passwords(user_id=user.id, password_hash="hashedpwd")
    session.add(pwd)
    session.commit()
    assert session.query(Passwords).filter_by(user_id=user.id).first()


def test_password_requires_user(session):
    pwd = Passwords(user_id=None, password_hash="no_user")
    session.add(pwd)
    with pytest.raises(IntegrityError):
        session.commit()


def test_device_mapping_creation(session):
    user = User(username="deviceuser", email="device@example.com")
    session.add(user)
    session.commit()
    device = DeviceMapping(user_id=user.id, hardware_name="device1")
    session.add(device)
    session.commit()
    fetched_device = (
        session.query(DeviceMapping).filter_by(hardware_name="device1").first()
    )
    assert fetched_device.user_id == user.id


def test_device_mapping_composite_key(session):
    user = User(username="compkeyuser", email="comp@example.com")
    session.add(user)
    session.commit()
    device1 = DeviceMapping(user_id=user.id, hardware_name="device")
    device2 = DeviceMapping(user_id=user.id, hardware_name="device")
    session.add_all([device1, device2])
    with pytest.raises(IntegrityError):
        session.commit()


def test_notification_defaults(session):
    user = User(username="notifyuser", email="notify@example.com")
    session.add(user)
    session.commit()
    notif = Notification(user_id=user.id, message="Test Notification")
    session.add(notif)
    session.commit()
    assert session.query(Notification).first().read is False


def test_audit_creation(session):
    user = User(username="audituser", email="audit@example.com")
    session.add(user)
    session.commit()
    audit = Audit(user_id=user.id, log="User logged in", details="Success")
    session.add(audit)
    session.commit()
    assert (
        session.query(Audit).filter_by(user_id=user.id).first().log == "User logged in"
    )


def test_device_mapping_event_on_insert(session):
    user = User(username="eventuser", email="event@example.com")
    session.add(user)
    session.commit()
    device = DeviceMapping(
        user_id=user.id, hardware_name="eventdevice", room="Living Room"
    )
    session.add(device)
    session.commit()
    audit_entry = session.query(Audit).filter_by(action_type="DEVICE_ADD").first()
    assert audit_entry
    assert "eventdevice" in audit_entry.log


def test_device_mapping_event_on_update(session):
    user = User(username="updateeventuser", email="updateevent@example.com")
    session.add(user)
    session.commit()
    device = DeviceMapping(
        user_id=user.id, hardware_name="updatedevice", room="Old Room"
    )
    session.add(device)
    session.commit()
    device.room = "New Room"
    session.commit()
    audit_entry = session.query(Audit).filter_by(action_type="DEVICE_UPDATE").first()
    assert audit_entry
    assert "New Room" in audit_entry.details


def test_automation_rule_insert_event(session):
    user = User(username="autouser", email="auto@example.com")
    session.add(user)
    session.commit()
    rule = AutomationRule(
        user_id=user.id,
        hardware_name="Switch",
        action="ON",
        trigger_type="TIME",
        value="10:00",
    )
    session.add(rule)
    session.commit()
    audit_entry = (
        session.query(Audit).filter_by(action_type="AUTOMATION_RULE_ADD").first()
    )
    assert audit_entry


def test_automation_rule_update_event(session):
    user = User(username="updateautouser", email="updateauto@example.com")
    session.add(user)
    session.commit()
    rule = AutomationRule(
        user_id=user.id,
        hardware_name="Plug",
        action="OFF",
        trigger_type="EVENT",
        value="Motion",
    )
    session.add(rule)
    session.commit()
    rule.action = "ON"
    session.commit()
    audit_entry = (
        session.query(Audit).filter_by(action_type="AUTOMATION_RULE_UPDATE").first()
    )
    assert audit_entry
    assert "ON" in audit_entry.details


def test_user_email_uniqueness(session):
    user1 = User(username="emailuser1", email="emailunique@example.com")
    user2 = User(username="emailuser2", email="emailunique@example.com")
    session.add_all([user1, user2])
    with pytest.raises(IntegrityError):
        session.commit()


def test_user_timestamp_defaults(session):
    user = User(username="timestampuser", email="timestamp@example.com")
    session.add(user)
    session.commit()
    assert user.created_at is not None
    assert user.updated_at is not None


def test_user_updated_at_changes(session):
    user = User(username="changeuser", email="change@example.com")
    session.add(user)
    session.commit()
    old_updated_at = user.updated_at
    user.first_name = "Changed"
    session.commit()
    assert user.updated_at >= old_updated_at


def test_notification_mark_as_read(session):
    user = User(username="readnotifyuser", email="readnotify@example.com")
    session.add(user)
    session.commit()
    notif = Notification(user_id=user.id, message="Read this")
    session.add(notif)
    session.commit()
    notif.read = True
    session.commit()
    assert session.query(Notification).filter_by(read=True).first()


def test_password_updated_timestamp(session):
    user = User(username="pwdtimeuser", email="pwdtime@example.com")
    session.add(user)
    session.commit()
    pwd = Passwords(user_id=user.id, password_hash="initial")
    session.add(pwd)
    session.commit()
    old_updated = pwd.updated_at
    pwd.password_hash = "updated"
    session.commit()
    assert pwd.updated_at >= old_updated
