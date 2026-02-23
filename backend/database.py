from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Ma'lumotlar bazasi URL manzili (MySQL XAMPP orqali)
# root nomli admin va bo'sh parol bilan 3306 portida 'layzzbe_market' bazasiga ulanish
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://avnadmin:AVNS_8mTQ3u9mc0zTpiOKzgU@layzzbe-market-db-layzzbe.c.aivencloud.com:19488/layzzbe_market"

# 2. MySQL uchun engine yaratish. 
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 3. Sessiya (Session) yaratish. Biz DB bilan aloqani shu xotira orqali boshqaramiz.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Asosiy model (Base) klasi. Bizning hamma modellari (jadvallar) shundan olinadi.
Base = declarative_base()
