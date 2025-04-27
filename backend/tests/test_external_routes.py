import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import patch
from core.models import Base, User
import json
from fastapi_cache import FastAPICache
from fastapi_cache.backends import inmemory


@pytest.fixture(scope="function")
def session():
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)

    FastAPICache.init(inmemory.InMemoryBackend())

    sess = Session()
    yield sess
    sess.rollback()
    sess.close()


@pytest.mark.asyncio
async def test_carbon_intensity_success(session):
    user = User(username="testuser", email="test@example.com")
    session.add(user)
    session.commit()

    mock_response = {
        "data": [
            {
                "from": "2025-04-27T12:00Z",
                "to": "2025-04-27T12:30Z",
                "intensity": {
                    "forecast": 150,
                    "actual": 140,
                    "index": "moderate",
                },
            }
        ]
    }

    with patch("api.routes.external.requests.get") as mock_get:
        mock_get.return_value.content = json.dumps(mock_response)

        from api.routes.external import carbon_intensity

        result = await carbon_intensity(user)
        assert result["from"] == "2025-04-27T12:00Z"
        assert result["to"] == "2025-04-27T12:30Z"
        assert result["intensity"]["forecast"] == 150
        assert result["intensity"]["actual"] == 140
        assert result["intensity"]["index"] == "moderate"


def test_forecast_placeholder(session):
    user = User(username="testuser", email="test@example.com")
    session.add(user)
    session.commit()

    from api.routes.external import forecast

    result = forecast("device_1", user)
    assert result == "Filler"
