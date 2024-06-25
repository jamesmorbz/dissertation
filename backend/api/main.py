from fastapi import APIRouter
from api.routes import monitoring, data, devices, controller, forecasting

api_router = APIRouter()

api_router.include_router(monitoring.router, prefix="", tags=["Base"])
api_router.include_router(devices.router, prefix="/devices", tags=["Metadata"])
api_router.include_router(controller.router, prefix="/controller", tags=["Controller"])
api_router.include_router(data.router, prefix="/data", tags=["Data"])
api_router.include_router(forecasting.router, prefix="/forecast", tags=["Forecast"])

# api_router.include_router(summary.router, tags=["summary"])
