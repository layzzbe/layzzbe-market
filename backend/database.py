from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# .env fayldan muhit o'zgaruvchilarini yuklash
load_dotenv()

# Ma'lumotlar bazasi URL manzili — .env fayldan o'qiladi (xavfsiz)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    raise RuntimeError("DATABASE_URL muhit o'zgaruvchisi topilmadi! .env faylini tekshiring.")

# MySQL uchun engine yaratish
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Sessiya (Session) yaratish
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Asosiy model (Base) klasi
Base = declarative_base()
