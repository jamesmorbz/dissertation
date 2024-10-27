from fastapi import APIRouter, HTTPException
import requests
from pydantic import BaseModel

router = APIRouter()


class MqttPayload(BaseModel):
    device_id: str
    command: str
    parameter: str = ""


class Command:
    POWER = "Power"


class Parameter:
    TOGGLE = "TOGGLE"


@router.put(
    "/{device_id}/TOGGLE_POWER",
    tags=["Device"],
    summary="Toggle the power of a device on/off",
)
async def toggle_power(device_id: str):
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
