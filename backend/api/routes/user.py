from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from core.models import User, Passwords
from pydantic import BaseModel, EmailStr, Field
from core.dependencies import sql_client_dependency
from typing import Optional
from utils.user import (
    get_user_by_username,
    get_user_by_email,
    authenticate_user,
    create_jwt_token,
    verify_jwt_token,
    hash_password,
    get_current_user,
)
from typing import Annotated
from fastapi import Response
from fastapi.security import OAuth2PasswordBearer

router = APIRouter()

ACCESS_TOKEN_EXPIRE_MINUTES = 120
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = Field(None, description="The user's email address")
    profile_picture: Optional[str] = Field(
        None, description="URL to the user's profile picture"
    )
    postcode: Optional[str] = Field(None, description="The user's postcode")
    location: Optional[str] = Field(None, description="The user's location")
    theme: Optional[str] = Field(
        None, max_length=8, description="The user's theme (e.g., 'DARK' or 'LIGHT')"
    )
    subscription: Optional[str] = Field(
        None, description="The user's subscription plan"
    )


def create_user(db: Session, user: UserCreate):
    hashed_password = hash_password(user.password)
    db_user = User(username=user.username, email=user.email)

    db.add(db_user)
    db.commit()
    db.refresh(
        db_user
    )  # refresh because id not populated because primary key value only assigned after commit to database

    db_password = Passwords(user_id=db_user.id, password_hash=hashed_password)
    db.add(db_password)
    db.commit()
    return {"message": "User Created!"}


@router.post("/sign-up")
def register_user(user: UserCreate, db: Session = Depends(sql_client_dependency)):
    if get_user_by_username(db, username=user.username):
        raise HTTPException(status_code=400, detail="Username already taken")

    if get_user_by_email(db, email=user.email):
        raise HTTPException(status_code=400, detail="Email already taken")

    return create_user(db=db, user=user)


@router.post("/login")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(sql_client_dependency),
):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,  # TODO: Implement account active defaulting to false
            detail="Account is not yet activated. Please check your inbox and press the activation link!",
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_jwt_token(
        data={"username": user.username}, expires_delta=access_token_expires
    )
    user.last_login = func.now()
    db.commit()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires": access_token_expires,
    }


@router.get("/current-user")
def update_user_attributes(
    current_user: Annotated[User, Depends(get_current_user)],
):
    return current_user


@router.get("/verify-token")
def verify_token(token: Annotated[str, Depends(oauth2_scheme)]):
    return verify_jwt_token(token)


@router.put("/update")
def update_user_attributes(
    user_update: UserUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(sql_client_dependency),
):

    user = db.query(User).filter(User.username == current_user.username).first()
    if (
        not user
    ):  # TODO: I don't think this is needed, since we already have a user object. But since we are updating maybe we need to ensure the user still exists, in case we cache the decode (to catch the edge case of jwt token creation, deleting account then trying to update it)
        raise HTTPException(status_code=404, detail="User not found")

    updated = False
    for key, value in user_update.model_dump(exclude_unset=True).items():
        if getattr(user, key) != value:
            setattr(user, key, value)
            updated = True

    if updated:
        db.commit()
        db.refresh(user)  # Refresh the updated user instance
        return {"message": "User updated successfully", "user": user}
    else:
        return Response(status_code=status.HTTP_304_NOT_MODIFIED)
