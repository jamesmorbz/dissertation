# config.py

from pydantic_settings import BaseSettings
import yaml


class Settings(BaseSettings):
    influxdb_url: str
    influxdb_token: str
    influxdb_org: str
    influxdb_bucket: str


def load_config() -> Settings:
    with open("config.yaml", "r") as file:
        config_data = yaml.safe_load(file)
    return Settings(**config_data)


settings = load_config()
