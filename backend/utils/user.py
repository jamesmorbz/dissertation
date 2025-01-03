from core.database import User, Passwords
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from fastapi import HTTPException, Depends, status
from core.dependencies import sql_client_dependency
from jose import jwt, JWTError
from datetime import datetime, UTC, timedelta
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated
from sqlalchemy import or_

SECRET_KEY = "your_secret_ke"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 7200  # TODO - Future James, Please turn this down.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str):
    return pwd_context.hash(password)


def get_user_by_username(db: Session, username: str) -> User:
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str) -> User:
    return db.query(User).filter(User.email == email).first()


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(sql_client_dependency),
) -> User:
    try:
        payload = verify_jwt_token(token)
        username = payload.get("username")

        user = (
            db.query(User).filter(User.username == username).first()
        )  # TODO: In memory cache username => user model
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return user
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def verify_jwt_token(token: Annotated[str, Depends(oauth2_scheme)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("username")
        if username is None:
            raise HTTPException(status_code=403, detail="Token is invalid or expired")
        return payload
    except JWTError:
        raise HTTPException(status_code=403, detail="Token is invalid or expired")


def create_jwt_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def authenticate_user(username: str, password: str, db: Session):
    user = (
        db.query(User)
        .filter(or_(User.username == username, User.email == username))
        .first()
    )
    if not user:
        return False

    user_password = db.query(Passwords).filter(Passwords.user_id == user.id).first()
    if not pwd_context.verify(password, user_password.password_hash):
        return False

    return user
