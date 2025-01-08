from core.models import User
from typing import Callable


def cache_entry_user_pk(
    func: Callable,
    *args,
    **kwargs,
) -> str:

    current_user: User = kwargs["kwargs"]["current_user"]
    return f"{current_user.id}:{func.__name__}"
