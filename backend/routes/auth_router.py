from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from services.auth import authenticate_user, register_user
from backend.core.db import get_db
from models.auth_model import User
from schema.auth_schema import Token, UserCreate, UserLogin, UserOut
from utils.security import create_access_token, create_refresh_token, get_current_active_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    return register_user(db, user_in)


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, credentials.email, credentials.password)
    return Token(
        access_token=create_access_token(subject=user.email),
        refresh_token=create_refresh_token(subject=user.email),
    )


@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_active_user)):
    return current_user