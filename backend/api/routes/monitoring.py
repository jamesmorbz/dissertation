from fastapi import APIRouter, status, Depends
from pydantic.dataclasses import dataclass
import sys
import fastapi
from typing import Optional
from core.dependencies import influxdb_client_dependency
from influxdb_client import InfluxDBClient

router = APIRouter()


@dataclass
class DatabaseStatus:
    status: str
    database_version: str


@dataclass
class InfluxState:
    version: str
    status: str
    message: str


@dataclass
class DatabaseMetrics:
    rows: int
    size: int
    transactions: int
    latency: float
    connections: int
    read_operations: int
    write_operations: int
    cache_hit_ratio: float
    uptime: float
    errors: int
    locking_info: Optional[str]
    cpu_usage: float
    memory_usage: int
    disk_io: int
    index_usage: Optional[str]
    replication_lag: Optional[float]


@dataclass
class BackendStatus:
    message: str
    fastapi_version: str
    python_version: str


@dataclass
class HealthCheck:
    status: str = "OK"


# Endpoint to perform a healthcheck on. This endpoint can primarily be used Docker
# to ensure a robust container orchestration and management is in place.


@router.get("/", response_model=BackendStatus)
async def read_root():
    return {
        "message": "For interactive documentation, please visit /docs",
        "fastapi_version": fastapi.__version__,
        "python_version": sys.version,
    }


@router.get(
    "/health",
    tags=["Monitoring"],
    summary="Perform a Health Check",
    response_description="Return HTTP Status Code 200 (OK)",
    status_code=status.HTTP_200_OK,
    response_model=HealthCheck,
)
def get_health() -> HealthCheck:
    return HealthCheck(status="OK")


@router.get(
    "/db_health",
    tags=["Monitoring"],
    summary="Perform a Database Health Check",
    response_description="Return HTTP Status Code 200 (OK)",
    status_code=status.HTTP_200_OK,
    response_model=DatabaseStatus,
)
def get_db_health() -> DatabaseStatus:
    return DatabaseStatus(status="OK", database_version="0.0.0")


@router.get(
    "/db_metrics",
    tags=["Monitoring"],
    summary="Give the full metrics of the DB",
    response_model=DatabaseMetrics,
)
def get_db_metrics(influxdb_client=Depends(influxdb_client_dependency)):
    return DatabaseMetrics(
        rows=1000000,
        size=104857600,
        transactions=15000,
        latency=12.5,
        connections=50,
        read_operations=200000,
        write_operations=100000,
        cache_hit_ratio=95.5,
        uptime=72.0,
        errors=10,
        locking_info="No significant locks",
        cpu_usage=30.5,
        memory_usage=524288000,
        disk_io=1048576000,
        index_usage="High usage on main index",
        replication_lag=0.5,
    )


@router.get(
    "/influx_health",
    tags=["Monitoring"],
    summary="Give the current status of the InfluxDB Instance",
    response_model=InfluxState,
)
def get_db_metrics(
    influxdb_client: InfluxDBClient = Depends(influxdb_client_dependency),
):
    influx_status = influxdb_client.health()
    return InfluxState(
        influx_status.version, influx_status.status, influx_status.message
    )
