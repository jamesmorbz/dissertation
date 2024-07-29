from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.main import api_router
import uvicorn
import yaml
import os

# from core.config import settings
API_DOCS_FILENAME = "tags_metadata.yaml"
SERVER_CONFIG_FILENAME = "server_config.yaml"

tags_config_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)), "config", API_DOCS_FILENAME
)
with open(tags_config_path, "r") as file:
    tags_metadata = yaml.safe_load(file)

server_config_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)), "config", SERVER_CONFIG_FILENAME
)
with open(server_config_path, "r") as file:
    server_config = yaml.safe_load(file)


def get_config_param(key):
    return server_config.get(key)


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
        host=get_config_param("host"),
        port=get_config_param("port"),
        log_level=get_config_param("log_level"),
        reload=get_config_param("reload"),
    )
