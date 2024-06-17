from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
from api.main import api_router
import random
import uvicorn
# from core.config import settings

app = FastAPI()

# Allow CORS for development
origins = [
    "http://localhost:5173",  # Vite Default Port
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router) #prefix=settings.API_V1_STR

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)