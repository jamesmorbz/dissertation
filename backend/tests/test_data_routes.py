import pytest
from fastapi.testclient import TestClient
from api.routes.data import router
from unittest.mock import MagicMock


@pytest.fixture
def mock_influx_client():
    return MagicMock()


@pytest.fixture
def client():
    from fastapi import FastAPI

    app = FastAPI()
    app.include_router(router)
    return TestClient(app)


def test_get_weekly_total_success(client, mock_influx_client, monkeypatch):
    mock_response = [
        {
            "_value": 100.0,
            "_start": "2025-04-01T00:00:00Z",
            "_stop": "2025-04-07T00:00:00Z",
        },
        {
            "_value": 200.0,
            "_start": "2025-04-08T00:00:00Z",
            "_stop": "2025-04-14T00:00:00Z",
        },
    ]
    monkeypatch.setattr(
        "api.routes.data.InfluxHelper.query_influx",
        lambda *args, **kwargs: mock_response,
    )
    monkeypatch.setattr(
        "api.routes.data.InfluxHelper.convert_resp_to_dict",
        lambda *args, **kwargs: mock_response,
    )

    response = client.get("/weekly-total")
    assert response.status_code == 200
    assert response.json() == [
        {"total": 100.0, "start": "01 Apr", "stop": "07 Apr"},
        {"total": 200.0, "start": "08 Apr", "stop": "14 Apr"},
    ]


def test_get_weekly_total_fallback_to_daily(client, mock_influx_client, monkeypatch):
    mock_response = [
        {
            "_value": 100.0,
            "_start": "2025-04-01T00:00:00Z",
            "_stop": "2025-04-07T00:00:00Z",
        }
    ]
    monkeypatch.setattr(
        "api.routes.data.InfluxHelper.query_influx",
        lambda *args, **kwargs: mock_response,
    )
    monkeypatch.setattr(
        "api.routes.data.InfluxHelper.convert_resp_to_dict",
        lambda *args, **kwargs: mock_response,
    )

    mock_daily_response = [
        {"total": 50.0, "start": "13 Apr", "stop": "14 Apr"},
        {"total": 60.0, "start": "14 Apr", "stop": "15 Apr"},
    ]
    monkeypatch.setattr(
        "api.routes.data.get_daily_total", lambda *args, **kwargs: mock_daily_response
    )

    response = client.get("/weekly-total")
    assert response.status_code == 200
    assert response.json() == mock_daily_response


def test_get_daily_total_success(client, mock_influx_client, monkeypatch):
    mock_response = [
        {
            "_value": 50.0,
            "_start": "2025-04-13T00:00:00Z",
            "_stop": "2025-04-14T00:00:00Z",
        },
        {
            "_value": 60.0,
            "_start": "2025-04-14T00:00:00Z",
            "_stop": "2025-04-15T00:00:00Z",
        },
    ]
    monkeypatch.setattr(
        "api.routes.data.InfluxHelper.query_influx",
        lambda *args, **kwargs: mock_response,
    )
    monkeypatch.setattr(
        "api.routes.data.InfluxHelper.convert_resp_to_dict",
        lambda *args, **kwargs: mock_response,
    )

    response = client.get("/daily-total")
    assert response.status_code == 200
    assert response.json() == [
        {"total": 50.0, "start": "13 Apr", "stop": "14 Apr"},
        {"total": 60.0, "start": "14 Apr", "stop": "15 Apr"},
    ]


def test_get_daily_total_no_data(client, mock_influx_client, monkeypatch):
    mock_response = []
    monkeypatch.setattr(
        "api.routes.data.InfluxHelper.query_influx",
        lambda *args, **kwargs: mock_response,
    )
    monkeypatch.setattr(
        "api.routes.data.InfluxHelper.convert_resp_to_dict",
        lambda *args, **kwargs: mock_response,
    )

    response = client.get("/daily-total")
    assert response.status_code == 412
    assert response.json() == {"detail": "No Daily Comparison Data Found"}
