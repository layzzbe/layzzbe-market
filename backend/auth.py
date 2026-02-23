import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt

# Xavfsizlik sozlamalari (Bular odatda .env faylda turadi, hozircha shu yerda saqlaymiz)
SECRET_KEY = "layzzbe_super_secure_jwt_secret_key_for_premium_market"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 1 hafta (7 kun)

def verify_password(plain_password: str, hashed_password: str):
    """Foydalanuvchi kiritgan oddiy parolni bazadagi heshlangan parol unga to'g'ri kelishini tekshiradi."""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str):
    """Yangi parolni xavfsiz hesh (bcrypt) formatiga o'tkazadi."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Foydalanuvchiga tizimga kirganini tasdiqlovchi JWT (JSON Web Token) yaratadi."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
        
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
