from fastapi import APIRouter, HTTPException, Depends
import requests
from pydantic import BaseModel
from core.dependencies import sql_client_dependency
from core.models import User, AutomationRule
from typing import Optional
from sqlalchemy.orm import Session
from utils.user import get_current_user

router = APIRouter()


class MqttPayload(BaseModel):
    device_id: str
    command: str
    parameter: str = ""


class Command:
    POWER = "Power"


class Parameter:
    TOGGLE = "TOGGLE"


class AutomationRuleBase(BaseModel):
    hardware_name: str
    action: str
    trigger_type: str
    value: str
    active: Optional[bool] = True


class AutomationRuleCreate(AutomationRuleBase):
    pass


class AutomationRuleUpdate(BaseModel):
    hardware_name: Optional[str] = None
    action: Optional[str] = None
    trigger_type: Optional[str] = None
    value: Optional[str] = None
    active: Optional[bool] = None


@router.post(
    "/automation_rules",
    tags=["Automation Rules"],
    summary="Create a new automation rule",
)
async def create_automation_rule(
    rule: AutomationRuleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(sql_client_dependency),
):
    new_rule = AutomationRule(
        user_id=current_user.id,
        hardware_name=rule.hardware_name,
        action=rule.action,
        trigger_type=rule.trigger_type,
        value=rule.value,
    )
    db.add(new_rule)
    db.commit()
    db.refresh(new_rule)
    return new_rule


@router.put(
    "/automation_rules/{rule_id}",
    tags=["Automation Rules"],
    summary="Update an existing automation rule",
)
async def update_automation_rule(
    rule_id: int,
    rule_update: AutomationRuleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(sql_client_dependency),
):
    existing_rule = (
        db.query(AutomationRule)
        .filter(AutomationRule.id == rule_id, AutomationRule.user_id == current_user.id)
        .first()
    )

    if not existing_rule:
        raise HTTPException(status_code=404, detail="Automation rule not found")

    for key, value in rule_update.model_dump(exclude_unset=True).items():
        if getattr(existing_rule, key) != value:
            setattr(existing_rule, key, value)

    db.commit()
    db.refresh(existing_rule)
    return existing_rule


@router.delete(
    "/automation_rules/{rule_id}",
    tags=["Automation Rules"],
    summary="Delete an automation rule",
    status_code=204,
)
async def delete_automation_rule(
    rule_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(sql_client_dependency),
):
    rule = (
        db.query(AutomationRule)
        .filter(AutomationRule.id == rule_id, AutomationRule.user_id == current_user.id)
        .first()
    )

    if not rule:
        raise HTTPException(status_code=404, detail="Automation rule not found")

    db.delete(rule)
    db.commit()
    return None


@router.patch(
    "/automation_rules/{rule_id}/deactivate",
    tags=["Automation Rules"],
    summary="Deactivate an automation rule",
)
async def deactivate_automation_rule(
    rule_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(sql_client_dependency),
):
    rule = (
        db.query(AutomationRule)
        .filter(AutomationRule.id == rule_id, AutomationRule.user_id == current_user.id)
        .first()
    )

    if not rule:
        raise HTTPException(status_code=404, detail="Automation rule not found")

    rule.active = False
    db.commit()
    db.refresh(rule)
    return rule


@router.put(
    "/{device_id}/TOGGLE_POWER",
    tags=["Device"],
    summary="Toggle the power of a device on/off",
)
async def toggle_power(device_id: str):  # TODO: Revamp given the new structure
    CONTROLLER_URL = "http://plug-controller:3000/action"
    data = {
        "device_id": device_id,
        "command": Command.POWER,
        "parameter": Parameter.TOGGLE,
    }
    response = requests.put(CONTROLLER_URL, json=data)

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail="Failed to forward action to Controller",
        )

    return {"response": f"Forwarded action for {device_id} to Controller"}
