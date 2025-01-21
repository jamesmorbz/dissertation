from pydantic_settings import BaseSettings
import yaml


class InfluxSettings(BaseSettings):
    url: str
    token: str
    org: str
    bucket: str
    debug: bool


class FastAPISettings(BaseSettings):
    host: str
    port: int
    log_level: str
    reload: bool
    debug: bool


class PostgresSettings(BaseSettings):
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_HOST: str
    POSTGRES_PORT: str
    POSTGRES_DB: str


def load_influx_config() -> InfluxSettings:
    with open("config/influx_config.yaml", "r") as file:
        config_data = yaml.safe_load(file)
    return InfluxSettings(**config_data)


def load_fastapi_config() -> FastAPISettings:
    with open("config/fastapi_config.yaml", "r") as file:
        config_data = yaml.safe_load(file)
    return FastAPISettings(**config_data)


def load_postgres_config() -> PostgresSettings:
    with open("config/postgres_config.yaml", "r") as file:
        config_data = yaml.safe_load(file)
    return PostgresSettings(**config_data)


def load_tags_config():
    with open("config/tags_metadata.yaml", "r") as file:
        config_data = yaml.safe_load(file)
    return config_data


influx_settings = load_influx_config()
fastapi_settings = load_fastapi_config()
postgres_settings = load_postgres_config()
tags_metadata = load_tags_config()
