from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.main import api_router
import uvicorn
from core.config import fastapi_settings, tags_metadata

app = FastAPI(openapi_tags=tags_metadata)

# Allow CORS for development
origins = [
    "http://localhost:5173",  # Vite Default Port
    "http://127.0.0.1:5173",  # Vite Default Port
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)  # prefix=settings.API_V1_STR

if __name__ == "__main__":
    uvicorn.run(
        app,
        host=fastapi_settings.host,
        port=fastapi_settings.port,
        log_level=fastapi_settings.log_level,
        reload=fastapi_settings.reload,
    )
