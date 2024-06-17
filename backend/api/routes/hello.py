from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime, timedelta
import random

router = APIRouter()

@router.get("/hello")
async def hello():
    return "hello"