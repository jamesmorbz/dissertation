from fastapi import APIRouter
from api.routes import data, hello, summary, devices, controller

api_router = APIRouter()

api_router.include_router(hello.router, prefix="", tags=["test"])

api_router.include_router(devices.router, prefix="", tags=["data"])

api_router.include_router(controller.router, prefix="", tags=["controller"])

# api_router.include_router(data.router, tags=["data"])
# api_router.include_router(summary.router, tags=["summary"])