from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from api.main import api_router
import uvicorn
from core.config import fastapi_settings, tags_metadata
from core.database import db_manager
from core.models import User, Passwords, DeviceMapping

app = FastAPI()


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="Disseration",  # TODO: Store this config in yaml
        version="1.0.0",
        description="""Backend for Dissertation.
                To authenticate, use the Authorize button at the top-right of the Swagger UI. \n
                Provide a token in the format: `Bearer <your-token>`. \n
                In order to get a token use the login API below.""",
        routes=app.routes,
        tags=tags_metadata,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "bearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Bearer <TOKEN>",
        }
    }
    openapi_schema["security"] = [{"bearerAuth": []}]
    for path, methods in openapi_schema["paths"].items():
        for method in methods.values():
            method["security"] = [{"bearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi

# Allow CORS for development
origins = [
    "http://localhost:5173",  # Vite Default Port
    "http://127.0.0.1:5173",  # Vite Default Port
    "http://localhost:5000",  # PROD Port
    "http://127.0.0.1:5000",  # PROD Port
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)  # prefix=settings.API_V1_STR

User.metadata.create_all(bind=db_manager.engine)
Passwords.metadata.create_all(bind=db_manager.engine)
DeviceMapping.metadata.create_all(bind=db_manager.engine)


if __name__ == "__main__":
    uvicorn.run(
        app,
        host=fastapi_settings.host,
        port=fastapi_settings.port,
        log_level=fastapi_settings.log_level,
        reload=fastapi_settings.reload,
    )
