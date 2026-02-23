from fastapi import FastAPI, Depends, HTTPException, status, Form as FastAPIForm
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Annotated, List
import models
import schemas
import auth
from database import SessionLocal, engine
from jose import JWTError, jwt
import requests as http_requests  # Telegram uchun
import hashlib

# Yaratilgan modellarni (jadvallarni) bazaga bog'laymiz
models.Base.metadata.create_all(bind=engine)

# Har bir so'rovda yangi darcha ochib, yopib beruvchi bog'lanish (Dependency)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def send_telegram_notification(db: Session, message: str) -> None:
    """
    Telegram admin ga xabar yuborish.
    Credentials SystemSetting jadvalidan o'qiladi — .env ishlatilmaydi.
    Agar sozlamalar yo'q yoki xato bo'lsa — jimgina o'tib ketadi.
    """
    try:
        token_row = db.query(models.SystemSetting).filter(
            models.SystemSetting.key == "telegram_bot_token"
        ).first()
        chat_row = db.query(models.SystemSetting).filter(
            models.SystemSetting.key == "telegram_admin_id"
        ).first()

        token = token_row.value.strip() if token_row and token_row.value else ""
        chat_id = chat_row.value.strip() if chat_row and chat_row.value else ""

        if not token or not chat_id:
            print("[Telegram] Bot token yoki admin ID sozlanmagan — xabar yuborilmadi.")
            return

        url = f"https://api.telegram.org/bot{token}/sendMessage"
        resp = http_requests.post(
            url,
            json={"chat_id": chat_id, "text": message, "parse_mode": "HTML"},
            timeout=5,
        )
        if not resp.ok:
            print(f"[Telegram] Xabar yuborishda xato: {resp.status_code} — {resp.text}")
    except Exception as e:
        print(f"[Telegram] Istisno: {e}")

# JWT obyekti qabul qilish nuqtasi, /api/auth/login orqali token olinishini bildiradi
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Tokenni tekshirib, tizimdagi foydalanuvchini aniqlovchi funksiya (Dependency)
async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token yaroqsiz yoki avtorizatsiyadan o'tmagansiz",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

# FastAPI dasturini yaratamiz
app = FastAPI(title="Layzzbe Market API")

# CORS sozlamalari (React frontend bilan ishlash uchun)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://layzzbe.uz",           # Production frontend
        "https://www.layzzbe.uz",
        "https://layzzbe-market.onrender.com",  # Render backend (if needed for self-calls)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dastur ishga tushganda bazani tekshiramiz (startup event)
@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    # Bazada biron mahsulot bormi?
    product_count = db.query(models.Product).count()
    if product_count == 0:
        # Bo'sh bo'lsa, avvalgi soxta ma'lumotlarni haqiqiy SQLite bazasiga joylashtiramiz
        mock_products = [
            models.Product(
                id=1,
                title="Next.js SaaS Loyiha",
                description="To'liq tayyor, avtorizatsiya va to'lov tizimiga ega mukammal SaaS platformasi. Loyihani boshlash uchun eng zo'r yechim.",
                price="$49",
                image="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop",
                category="Web Dasturlash",
                techStack="Next.js,React,Tailwind,Stripe",
                features="Foydalanuvchilarni autentifikatsiya qilish (Auth.js),Stripe orqali to'lovlar qabul qilish,Ma'lumotlar bazasi integratsiyasi (Prisma & PostgreSQL),To'liq moslashuvchan (Responsive) dizayn,SEO optimizatsiya qilingan"
            ),
            models.Product(
                id=2,
                title="Fintech Mobil UI Shablon",
                description="Zamonaviy moliya va bank ilovalari uchun maxsus yaratilgan yuqori sifatli mobil interfeys dizayni va React Native kodlari.",
                price="$29",
                image="https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop",
                category="Mobil Dasturlash",
                techStack="Figma,React Native,UI/UX,Expo",
                features="50 dan ortiq tayyor ekranlar,Qorong'u va yorug' rejim (Dark/Light mode),To'liq Figma komponentlar kutubxonasi,React Native & Expo da oson ishga tushirish,Silliq animatsiyalar"
            ),
            models.Product(
                id=3,
                title="AI Dashboard Shablon",
                description="Sun'iy intellekt tahlillari va ma'lumotlar boshqaruvi uchun keng qamrovli, chiroyli va qulay boshqaruv paneli.",
                price="$39",
                image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop",
                category="Boshqaruv Paneli",
                techStack="Vue 3,Nuxt,TypeScript,Tailwind",
                features="Interaktiv grafiklar va chartlar (Chart.js),AI modellarini boshqarish paneli,Kengaytirilgan filtrlash va qidiruv tizimi,Zamonaviy tekis (flat) va neonglass dizayn,Davlat menejmenti (Pinia)"
            ),
            models.Product(
                id=4,
                title="E-Commerce Backend API",
                description="Katta yuklamalarga chidamli, tezkor va xavfsiz elektron tijorat tizimlari uchun tayyor RESTful API yadrosi.",
                price="$59",
                image="https://images.unsplash.com/photo-1627398225052-24c8c7d81a4b?q=80&w=1000&auto=format&fit=crop",
                category="Backend",
                techStack="Node.js,Express,MongoDB,Redis",
                features="Kesh xotiradan foydalanish (Redis va xotirani optimallashtirish),JWT tabarrik (token) va xavfsizlik (Helmet, Rate Limit),Buyurtmalar tarixi va to'lov holatini kuzatish,Mahsulotlar ko'chirmasi va qidiruv funktsiyalari (Elasticsearch hook),Docker tayyor"
            )
        ]
        db.add_all(mock_products)
        db.commit()
    db.close()

# Eng asosiy sahifa (tekshirish uchun)
@app.get("/")
def read_root():
    return {"xabar": "Salom! Layzzbe Market orqa foni (Backend) a'lo darajada ishlayapti!"}

# Admin uchun haqiqiy statistika
@app.get("/api/admin/stats")
def get_admin_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Admin uchun real statistika: foydalanuvchilar, mahsulotlar, buyurtmalar."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Faqat adminlar uchun")
    users_count = db.query(models.User).count()
    products_count = db.query(models.Product).count()
    orders = db.query(models.Order).all()
    orders_count = len(orders)
    total_usd = round(sum(o.amount_usd for o in orders), 2)
    total_uzs = round(total_usd * 12800)
    return {
        "users_count": users_count,
        "products_count": products_count,
        "orders_count": orders_count,
        "total_revenue_usd": total_usd,
        "total_revenue_uzs": total_uzs,
    }


# Haqiqiy bazadagi mahsulotlarni React'ga beramiz!
@app.get("/api/products")
def get_products(db: Session = Depends(get_db)):
    products = db.query(models.Product).all()
    
    # Biz React frontend uchun qaytarayotganda 
    # techStack va features'dagi vergul-ajratilgan qatorni(String) massivlarga(List o'girishimiz kerak)
    # Shunday bo'lmasa frontend array emas deb xato beradi!
    formatted_products = []
    for product in products:
        # Har bir maxsulotni frontend kutgan qolipga yig'amiz
        formatted_products.append({
            "id": str(product.id), # Frontend UUID kutadi (id: "1" o'rniga), biz stringga ag'darib ishonch xosil qilamiz
            "title": product.title,
            "description": product.description,
            "price": product.price,
            "image": product.image,
            "category": product.category,
            "techStack": product.techStack.split(",") if product.techStack else [],
            "features": product.features.split(",") if product.features else []
        })

    return formatted_products

# ── CART endpoints ──────────────────────────────────────────────────────────

@app.get("/api/cart")
def get_cart(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Foydalanuvchi savatchasini qaytaradi (product ma'lumotlari bilan)."""
    items = db.query(models.CartItem).filter(models.CartItem.user_id == current_user.id).all()
    result = []
    for item in items:
        p = item.product
        if p:
            result.append({
                "id": p.id,
                "title": p.title,
                "price": p.price,
                "image": p.image,
                "category": p.category,
                "quantity": item.quantity,
            })
    return result

@app.post("/api/cart")
def add_to_cart(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Mahsulot qo'shish yoki miqdorni oshirish."""
    product_id = payload.get("product_id")
    quantity = payload.get("quantity", 1)
    if not product_id:
        raise HTTPException(status_code=400, detail="product_id kerak")

    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")

    existing = db.query(models.CartItem).filter(
        models.CartItem.user_id == current_user.id,
        models.CartItem.product_id == product_id
    ).first()

    if existing:
        existing.quantity += quantity
    else:
        db.add(models.CartItem(user_id=current_user.id, product_id=product_id, quantity=quantity))

    db.commit()
    return {"ok": True}

@app.put("/api/cart/{product_id}")
def update_cart_quantity(
    product_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Miqdorni to'g'ridan belgilash."""
    qty = payload.get("quantity", 1)
    item = db.query(models.CartItem).filter(
        models.CartItem.user_id == current_user.id,
        models.CartItem.product_id == product_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Savatda topilmadi")
    if qty <= 0:
        db.delete(item)
    else:
        item.quantity = qty
    db.commit()
    return {"ok": True}

@app.delete("/api/cart/{product_id}")
def remove_from_cart(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Savatchadan bitta mahsulotni o'chirish."""
    item = db.query(models.CartItem).filter(
        models.CartItem.user_id == current_user.id,
        models.CartItem.product_id == product_id
    ).first()
    if item:
        db.delete(item)
        db.commit()
    return {"ok": True}

# ── WISHLIST endpoints ───────────────────────────────────────────────────────

@app.get("/api/wishlist")
def get_wishlist(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Foydalanuvchi wishlist ini qaytaradi."""
    items = db.query(models.WishlistItem).filter(models.WishlistItem.user_id == current_user.id).all()
    result = []
    for item in items:
        p = item.product
        if p:
            result.append({
                "id": p.id,
                "title": p.title,
                "price": p.price,
                "image": p.image,
                "category": p.category,
            })
    return result

@app.post("/api/wishlist/{product_id}")
def toggle_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Wishlist toggle: bor bo'lsa o'chiradi, yo'q bo'lsa qo'shadi."""
    existing = db.query(models.WishlistItem).filter(
        models.WishlistItem.user_id == current_user.id,
        models.WishlistItem.product_id == product_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"liked": False}

    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")

    db.add(models.WishlistItem(user_id=current_user.id, product_id=product_id))
    db.commit()
    return {"liked": True}

@app.delete("/api/wishlist/{product_id}")
def remove_from_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Wishlist dan o'chirish (toggle bilan bir xil, DELETE method uchun)."""
    item = db.query(models.WishlistItem).filter(
        models.WishlistItem.user_id == current_user.id,
        models.WishlistItem.product_id == product_id
    ).first()
    if item:
        db.delete(item)
        db.commit()
    return {"ok": True}

# --- AUTH RO'YXATDAN O'TISH VA KIRISH ---

@app.post("/api/auth/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Email bazada bormi?
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Ushbu elektron pochta allaqachon ro'yxatdan o'tgan")
    
    # Parolni kodlash (Bcrypt)
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        is_admin=user.is_admin
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/auth/login", response_model=schemas.Token)
def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
):
    # Foydalanuvchini email orqali qidiramiz
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    # Agar user topilmasa yoki parol noto'g'ri bo'lsa
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Noto'g'ri elektron pochta yoki parol",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Hammasi to'g'ri bo'lsa, xavfsiz sessiya Token yaratamiz (1 hafta muddatli)
    access_token_expires = auth.timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_user_me(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Avtorizatsiyadan o'tgan foydalanuvchi ma'lumotlarini qaytaradi."""
    # Fresh query from DB to get latest balance (bypass SQLAlchemy cache)
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    orders = db.query(models.Order).filter(models.Order.user_id == user.id).all()
    total_spent = sum(o.amount_usd for o in orders)
    return {
        "id": user.id,
        "email": user.email,
        "is_admin": user.is_admin,
        "role": user.role or 'user',
        "full_name": user.full_name,
        "phone": user.phone,
        "balance": user.balance or 0.0,
        "created_at": user.created_at,
        "orders_count": len(orders),
        "total_spent_usd": round(total_spent, 2)
    }

@app.get("/api/debug/balance")
def debug_balance(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """MySQL dan to'g'ridan-to'g'ri balance qiymatini qaytaradi (tekshirish uchun)."""
    from sqlalchemy import text
    result = db.execute(text(f"SELECT id, email, balance FROM users WHERE id = {current_user.id}")).fetchone()
    return {"id": result[0], "email": result[1], "balance_in_mysql": result[2]}

@app.put("/api/auth/me", response_model=schemas.UserResponse)
def update_user_me(data: schemas.UserUpdateMe, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Foydalanuvchi o'z profilini yangilaydi (ism, telefon)."""
    if data.full_name is not None:
        current_user.full_name = data.full_name
    if data.phone is not None:
        current_user.phone = data.phone
    db.commit()
    db.refresh(current_user)
    orders = db.query(models.Order).filter(models.Order.user_id == current_user.id).all()
    total_spent = sum(o.amount_usd for o in orders)
    return {
        "id": current_user.id, "email": current_user.email, "is_admin": current_user.is_admin,
        "role": current_user.role or 'user', "full_name": current_user.full_name,
        "phone": current_user.phone, "created_at": current_user.created_at,
        "orders_count": len(orders), "total_spent_usd": round(total_spent, 2)
    }

@app.post("/api/auth/change-password")
def change_password(data: schemas.ChangePassword, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Foydalanuvchi o'z parolini o'zgartiradi."""
    if not auth.verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Joriy parol noto'g'ri")
    current_user.hashed_password = auth.get_password_hash(data.new_password)
    db.commit()
    return {"message": "Parol muvaffaqiyatli o'zgartirildi"}

@app.post("/api/users/{user_id}/reset-password")
def admin_reset_password(user_id: int, data: schemas.AdminResetPassword, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Admin foydalanuvchi parolini tiklaydi."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Faqat adminlar uchun")
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    target.hashed_password = auth.get_password_hash(data.new_password)
    db.commit()
    return {"message": f"{target.email} foydalanuvchisi paroli muvaffaqiyatli tiklandi"}

@app.put("/api/users/{user_id}/role-update")
def update_user_role_new(user_id: int, data: schemas.RoleUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Foydalanuvchi rolini o'zgartirish: admin/moderator/user."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Faqat adminlar uchun")
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="O'z darajangizni o'zgartira olmaysiz")
    if data.role not in ('admin', 'moderator', 'user'):
        raise HTTPException(status_code=400, detail="Noto'g'ri rol: admin, moderator yoki user bo'lishi kerak")
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    target.role = data.role
    target.is_admin = (data.role == 'admin')
    db.commit()
    db.refresh(target)
    return {"message": f"Rol '{data.role}' ga o'zgartirildi", "id": target.id, "role": target.role, "is_admin": target.is_admin}


@app.get("/api/users", response_model=List[schemas.UserResponse])
def get_users(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Barcha tizim foydalanuvchilarini qaytaradi (Faqat Admin) - buyurtmalar soni bilan."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Sizda bu amalni bajarish uchun ruxsat yo'q (Faqat Admin)")
    users = db.query(models.User).all()
    result = []
    for user in users:
        orders = db.query(models.Order).filter(models.Order.user_id == user.id).all()
        total_spent = sum(o.amount_usd for o in orders)
        result.append({
            "id": user.id,
            "email": user.email,
            "is_admin": user.is_admin,
            "created_at": user.created_at,
            "orders_count": len(orders),
            "total_spent_usd": round(total_spent, 2)
        })
    return result

@app.get("/api/users/{user_id}/detail", response_model=schemas.UserDetailResponse)
def get_user_detail(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Foydalanuvchining to'liq ma'lumotlari va buyurtmalar tarixi (Faqat Admin)."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Sizda bu amalni bajarish uchun ruxsat yo'q (Faqat Admin)")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    orders = db.query(models.Order).filter(models.Order.user_id == user_id).order_by(models.Order.created_at.desc()).all()
    total_spent = sum(o.amount_usd for o in orders)
    return {
        "id": user.id,
        "email": user.email,
        "is_admin": user.is_admin,
        "created_at": user.created_at,
        "orders": orders,
        "orders_count": len(orders),
        "total_spent_usd": round(total_spent, 2)
    }

@app.post("/api/orders")
def create_order(order_data: dict, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Yangi buyurtma yaratish (foydalanuvchi tomonidan)."""
    new_order = models.Order(
        user_id=current_user.id,
        product_title=order_data.get("product_title", ""),
        product_image=order_data.get("product_image", ""),
        product_category=order_data.get("product_category", ""),
        amount_usd=float(order_data.get("amount_usd", 0)),
        status=order_data.get("status", "completed")
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return {"message": "Buyurtma muvaffaqiyatli yaratildi", "order_id": new_order.id}

@app.get("/api/orders/my")
def get_my_orders(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Foydalanuvchining o'z buyurtmalarini qaytaradi."""
    orders = db.query(models.Order).filter(
        models.Order.user_id == current_user.id
    ).order_by(models.Order.created_at.desc()).all()
    return [
        {
            "id": o.id,
            "product_title": o.product_title,
            "product_image": o.product_image,
            "product_category": getattr(o, 'product_category', ''),
            "amount_usd": o.amount_usd,
            "status": getattr(o, 'status', 'completed'),
            "created_at": o.created_at
        }
        for o in orders
    ]


# ── Wallet endpoints ────────────────────────────────────────────────────────

@app.get("/api/transactions/my")
def get_my_transactions(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Foydalanuvchining to'lov tarixi (oxirgidan avvalgisigacha)."""
    txs = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id
    ).order_by(models.Transaction.created_at.desc()).all()
    return [
        {
            "id": t.id,
            "type": t.type,
            "amount": t.amount,
            "currency": t.currency,
            "description": t.description,
            "created_at": t.created_at
        }
        for t in txs
    ]

@app.post("/api/balance/topup")
def topup_balance(data: schemas.TopUpRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Hamyonga mablag' qo'shish (demo)."""
    if data.amount_uzs <= 0:
        raise HTTPException(status_code=400, detail="Summa 0 dan katta bo'lishi kerak")

    # Fresh query — sessiyaga bog'liq ob'ekt olamiz
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    new_balance = (user.balance or 0) + data.amount_uzs

    # To'g'ridan-to'g'ri UPDATE — SQLAlchemy tracking muammosini hal qiladi
    db.query(models.User).filter(models.User.id == current_user.id).update(
        {"balance": new_balance}, synchronize_session="fetch"
    )
    tx = models.Transaction(
        user_id=current_user.id,
        type="TOPUP",
        amount=data.amount_uzs,
        currency="UZS",
        description=f"Hamyonga +{int(data.amount_uzs):,} so'm qo'shildi"
    )
    db.add(tx)
    db.commit()
    return {"message": "Hamyon muvaffaqiyatli to'ldirildi", "balance": new_balance}

@app.post("/api/balance/purchase")
def purchase_with_balance(data: schemas.PurchaseRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Hamyon orqali xarid qilish va order yaratish."""
    # Fresh query
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    balance = user.balance or 0
    if balance < data.amount_uzs:
        raise HTTPException(
            status_code=400,
            detail=f"Hamyonda mablag' yetarli emas. Balans: {int(balance):,} so'm, kerakli: {int(data.amount_uzs):,} so'm"
        )
    USD_RATE = 12800
    amount_usd = round(data.amount_uzs / USD_RATE, 4)
    new_balance = balance - data.amount_uzs

    # Balance ni to'g'ridan-to'g'ri yangilash
    db.query(models.User).filter(models.User.id == current_user.id).update(
        {"balance": new_balance}, synchronize_session="fetch"
    )
    # Order yaratish
    new_order = models.Order(
        user_id=current_user.id,
        product_title=data.product_title,
        product_image=data.product_image or "",
        product_category=data.product_category or "",
        amount_usd=amount_usd,
        status="completed"
    )
    db.add(new_order)
    # Tranzaksiya
    tx = models.Transaction(
        user_id=current_user.id,
        type="PURCHASE",
        amount=data.amount_uzs,
        currency="UZS",
        description=f"{data.product_title} — {int(data.amount_uzs):,} so'm"
    )
    db.add(tx)
    db.commit()
    db.refresh(new_order)

    # Telegram bildirishnoma (yakka xarid)
    try:
        send_telegram_notification(
            db,
            f"🛒 <b>Yangi xarid!</b>\n"
            f"👤 {current_user.email}\n"
            f"📦 {data.product_title}\n"
            f"💰 {int(data.amount_uzs):,} so'm\n"
            f"💳 Qoldiq: {int(new_balance):,} so'm"
        )
    except Exception:
        pass

    return {
        "message": "Xarid muvaffaqiyatli amalga oshirildi",
        "new_balance": new_balance,
        "order_id": new_order.id
    }


# ── Click Uz: payment link generator ─────────────────────────────────────────

@app.post("/api/orders/generate-payment-link")
def generate_payment_link(
    data: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Click Uz to'lov havolasini yaratadi.
    1. Pending order saqlanadi.
    2. DB dan click_service_id va click_merchant_id o'qiladi.
    3. Rasmiy Click URL qaytariladi.
    """
    cart_items = data.get("cart_items", [])
    total_usd = data.get("total_usd", 0)

    if not cart_items:
        raise HTTPException(status_code=400, detail="Savatcha bo'sh")

    # 1. Yangi PENDING order yaratish (birinchi mahsulot nomi bilan)
    first_title = cart_items[0].get("title", "Mahsulot") if cart_items else "Mahsulot"
    try:
        amount = float(total_usd)
    except (TypeError, ValueError):
        amount = 0.0

    pending_order = models.Order(
        user_id=current_user.id,
        product_title=first_title + (f" va yana {len(cart_items)-1} ta" if len(cart_items) > 1 else ""),
        product_image=cart_items[0].get("image", "") if cart_items else "",
        amount_usd=amount,
        status="pending",
    )
    db.add(pending_order)
    db.commit()
    db.refresh(pending_order)

    # 2. Click sozlamalarini DB dan o'qish
    service_row = db.query(models.SystemSetting).filter(
        models.SystemSetting.key == "click_service_id"
    ).first()
    merchant_row = db.query(models.SystemSetting).filter(
        models.SystemSetting.key == "click_merchant_id"
    ).first()

    service_id = service_row.value.strip() if service_row and service_row.value else ""
    merchant_id = merchant_row.value.strip() if merchant_row and merchant_row.value else ""

    if not service_id or not merchant_id:
        # Pending orderni o'chirish — to'lov bo'lmadi
        db.delete(pending_order)
        db.commit()
        raise HTTPException(
            status_code=400,
            detail="Click tizimi sozlanmagan. Admin panelda Click sozlamalarini kiriting."
        )

    # 3. Rasmiy Click to'lov URL
    # UZS da yuboriladi — 1 USD ≈ 12800 UZS (DB dagi kursdan ham o'qish mumkin)
    USD_RATE = 12800
    amount_uzs = round(amount * USD_RATE)

    payment_url = (
        f"https://my.click.uz/services/pay"
        f"?service_id={service_id}"
        f"&merchant_id={merchant_id}"
        f"&amount={amount_uzs}"
        f"&transaction_param={pending_order.id}"
        f"&return_url=https://layzzbe.uz/dashboard"
    )

    return {"payment_url": payment_url, "order_id": pending_order.id}


# ── Admin: all orders ────────────────────────────────────────────────────────

@app.get("/api/admin/orders")
def admin_get_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Barcha buyurtmalar (faqat adminlar uchun). Buyer email bilan birgalikda."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q. Faqat adminlar uchun.")

    rows = (
        db.query(models.Order, models.User.email)
        .join(models.User, models.Order.user_id == models.User.id)
        .order_by(models.Order.id.desc())
        .all()
    )

    result = []
    for order, email in rows:
        result.append({
            "id": order.id,
            "buyer_email": email,
            "product_title": order.product_title,
            "product_image": order.product_image,
            "amount_usd": order.amount_usd,
            "created_at": order.created_at.isoformat() if order.created_at else None,
        })
    return result


# ── Batch wallet checkout ────────────────────────────────────────────────────

@app.post("/api/orders/process-wallet-payment")
def process_wallet_payment(
    data: schemas.WalletPaymentRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Hamyon orqali xarid. Narxlar bazadan o'qiladi — tamper-proof."""
    try:
        if not data.cart_items:
            raise HTTPException(status_code=400, detail="Savatcha bo'sh")

        USD_RATE = 12800

        # 1. Fetch real prices from DB for each product_id
        enriched = []
        for item in data.cart_items:
            if item.quantity <= 0:
                raise HTTPException(status_code=400, detail="Miqdor 0 dan katta bo'lishi kerak")
            product = db.query(models.Product).filter(
                models.Product.id == item.product_id
            ).first()
            if not product:
                raise HTTPException(
                    status_code=404,
                    detail=f"Mahsulot topilmadi (ID: {item.product_id})"
                )
            # price is stored as String in DB (e.g. "9.99") — parse safely
            try:
                price_usd = float(str(product.price).replace('$', '').strip())
            except (ValueError, TypeError):
                price_usd = 0.0

            enriched.append({
                "title": product.title,
                "image": product.image or "",
                "amount_usd": round(price_usd * item.quantity, 4),
            })

        # 2. Server-side total — never trust frontend
        total_usd = sum(e["amount_usd"] for e in enriched)
        total_uzs = round(total_usd * USD_RATE)

        # 3. Fresh balance
        user = db.query(models.User).filter(
            models.User.id == current_user.id
        ).first()
        balance = float(user.balance or 0.0)

        if balance < total_uzs:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Hamyonda mablag' yetarli emas. "
                    f"Balans: {int(balance):,} so'm, "
                    f"kerakli: {int(total_uzs):,} so'm"
                )
            )

        new_balance = balance - total_uzs

        # 4. Deduct balance
        db.query(models.User).filter(
            models.User.id == current_user.id
        ).update({"balance": new_balance}, synchronize_session="fetch")

        # 5. Create orders — ONLY columns that actually exist in models.Order:
        #    id, user_id, product_title, product_image, amount_usd, created_at
        titles = []
        for e in enriched:
            order = models.Order(
                user_id=current_user.id,
                product_title=e["title"],
                product_image=e["image"],
                amount_usd=e["amount_usd"],
            )
            db.add(order)
            titles.append(e["title"])

        # 6. Single PURCHASE transaction
        summary = ", ".join(titles[:3])
        if len(titles) > 3:
            summary += f" va yana {len(titles) - 3} ta"

        tx = models.Transaction(
            user_id=current_user.id,
            type="PURCHASE",
            amount=float(total_uzs),
            currency="UZS",
            description=f"Xarid: {summary} — {int(total_uzs):,} so'm",
        )
        db.add(tx)

        # 7. Atomic commit
        db.commit()

        # 8. Telegram bildirishnoma (bazadan credentials o'qiladi, crash bo'lmaydi)
        try:
            notif = (
                f"🛒 <b>Yangi xarid!</b>\n"
                f"👤 Foydalanuvchi: {current_user.email}\n"
                f"📦 Mahsulotlar: {summary}\n"
                f"💰 Jami: {int(total_uzs):,} so'm (${round(total_usd, 2)})\n"
                f"💳 Qoldiq: {int(new_balance):,} so'm"
            )
            send_telegram_notification(db, notif)
        except Exception:
            pass  # hech qachon checkoutni to'xtатmayди

        return {
            "message": "Xarid muvaffaqiyatli amalga oshirildi!",
            "new_balance": new_balance,
            "total_uzs": total_uzs,
            "items_purchased": len(enriched),
        }

    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Server xatosi: {str(exc)}")

@app.put("/api/users/{user_id}/role", response_model=schemas.UserResponse)
def update_user_role(user_id: int, role_data: schemas.UserRoleUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Foydalanuvchi darajasini yangilash (Foydalanuvchi <-> Admin). O'z-o'zini tahrirlash man etilgan."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Sizda bu amalni bajarish uchun ruxsat yo'q (Faqat Admin)")
    
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="O'z darajangizni o'zgartira olmaysiz!")
        
    target_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
        
    target_user.is_admin = role_data.is_admin
    db.commit()
    db.refresh(target_user)
    return target_user

@app.delete("/api/users/{user_id}", response_model=dict)
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Tizimdan foydalanuvchini batamom o'chirish. O'z-o'zini o'chirish man etilgan."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Sizda bu amalni bajarish uchun ruxsat yo'q (Faqat Admin)")
        
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Siz o'zingizni o'chira olmaysiz!")
        
    target_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
        
    db.delete(target_user)
    db.commit()
    return {"message": "Foydalanuvchi platformadan muvaffaqiyatli o'chirildi."}


# Frontend'dan keladigan yangi mahsulotlarni qabul qilish (POST) - faqat avtorizatsiyadan o'tganlar uchun!
@app.post("/api/products", response_model=schemas.Product)
def create_product(
    product: schemas.ProductCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) # BU QISMI YOPIQ QILDI! (PROTECTED)
):
    if not current_user.is_admin:
         raise HTTPException(status_code=403, detail="Sizda bu amalni bajarish uchun ruxsat yo'q (Faqat Admin)")

    # Pydantic yordamida kelgan techStack va features massivlarini Sqlite qabul qiladigan string (vergul) formatiga aylantiramiz
    tech_stack_str = ",".join(product.techStack) if product.techStack else ""
    features_str = ",".join(product.features) if product.features else ""
    
    # SQLAlchemy obyektini yaratish
    db_product = models.Product(
        title=product.title,
        description=product.description,
        price=product.price,
        image=product.image,
        category=product.category,
        techStack=tech_stack_str,
        features=features_str
    )
    
    # Bazaga yozish va saqlash
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    # Pydantic Product qolipiga to'g'ri kelishi uchun ma'lumotlarni ko'rinish holatini massivga qaytaramiz 
    return {
        "id": db_product.id,
        "title": db_product.title,
        "description": db_product.description,
        "price": db_product.price,
        "image": db_product.image,
        "category": db_product.category,
        "techStack": db_product.techStack.split(",") if db_product.techStack else [],
        "features": db_product.features.split(",") if db_product.features else []
    }

# Admin tizimi - Mahsulotni o'chirish (DELETE)
@app.delete("/api/products/{product_id}")
def delete_product(
    product_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.is_admin:
         raise HTTPException(status_code=403, detail="Sizda bu amalni bajarish uchun ruxsat yo'q (Faqat Admin)")
         
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")
        
    db.delete(db_product)
    db.commit()
    return {"message": "Mahsulot tranzaksiyasi bekor qilindi, muvaffaqiyatli o'chirildi"}

# Admin tizimi - Mahsulotni tahrirlash (PUT)
@app.put("/api/products/{product_id}", response_model=schemas.Product)
def update_product(
    product_id: int,
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.is_admin:
         raise HTTPException(status_code=403, detail="Sizda bu amalni bajarish uchun ruxsat yo'q (Faqat Admin)")
         
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")
        
    # Pydantic massivlarini stringga o'girish
    tech_stack_str = ",".join(product.techStack) if product.techStack else ""
    features_str = ",".join(product.features) if product.features else ""
    
    db_product.title = product.title
    db_product.description = product.description
    db_product.price = product.price
    db_product.image = product.image
    db_product.category = product.category
    db_product.techStack = tech_stack_str
    db_product.features = features_str
    
    db.commit()
    db.refresh(db_product)
    
    return {
        "id": db_product.id,
        "title": db_product.title,
        "description": db_product.description,
        "price": db_product.price,
        "image": db_product.image,
        "category": db_product.category,
        "techStack": db_product.techStack.split(",") if db_product.techStack else [],
        "features": db_product.features.split(",") if db_product.features else []
    }

# ── Admin: System Settings ────────────────────────────────────────────────────

@app.get("/api/admin/settings")
def get_admin_settings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Barcha tizim sozlamalarini {key: value} formatida qaytaradi. Faqat adminlar."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")
    rows = db.query(models.SystemSetting).all()
    return {row.key: row.value for row in rows}


@app.post("/api/admin/settings")
def save_admin_settings(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Bir nechta sozlamani bir vaqtda saqlash (upsert). Faqat adminlar."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")

    for key, value in payload.items():
        key = str(key).strip()
        if not key:
            continue
        existing = db.query(models.SystemSetting).filter(
            models.SystemSetting.key == key
        ).first()
        if existing:
            existing.value = str(value)
        else:
            db.add(models.SystemSetting(key=key, value=str(value)))

    db.commit()
    return {"message": "Sozlamalar muvaffaqiyatli saqlandi!", "count": len(payload)}


# ── Public Settings (no auth, safe keys only) ─────────────────────────────────

PUBLIC_KEYS = {
    "site_name", "site_description",
    "instagram_link", "telegram_channel", "youtube_link",
    "maintenance_mode", "maintenance_message",
    "usd_rate", "rub_rate",
}

@app.get("/api/settings/public")
def get_public_settings(db: Session = Depends(get_db)):
    """Hamma ko'rishi mumkin bo'lgan sozlamalar. Maxfiy kalitlar YO'Q."""
    rows = db.query(models.SystemSetting).filter(
        models.SystemSetting.key.in_(PUBLIC_KEYS)
    ).all()
    return {row.key: row.value for row in rows}


# ── Click.uz Webhook (Callback) ─────────────────────────────────────────────
@app.post("/api/payments/click/webhook")
def click_webhook(
    click_trans_id: int        = FastAPIForm(...),
    service_id: int            = FastAPIForm(...),
    click_paydoc_id: int       = FastAPIForm(...),
    merchant_trans_id: str     = FastAPIForm(...),   # our order.id as string
    amount: float              = FastAPIForm(...),
    action: int                = FastAPIForm(...),   # 0=Prepare, 1=Complete
    error: int                 = FastAPIForm(...),
    error_note: str            = FastAPIForm(...),
    sign_time: str             = FastAPIForm(...),
    sign_string: str           = FastAPIForm(...),
    db: Session = Depends(get_db),
):
    """
    Click.uz to'lov tizimining webhook (callback) so'rovi.
    action=0 → Prepare (to'lov tasdiqlanishidan oldin tekshirish)
    action=1 → Complete (to'lov yakunlandi)
    """

    # ── 1. Secret key dan o'qish ──────────────────────────────────────────────
    secret_row = db.query(models.SystemSetting).filter(
        models.SystemSetting.key == "click_secret_key"
    ).first()
    secret_key = secret_row.value.strip() if secret_row and secret_row.value else ""

    # ── 2. Sign tekshiruvi (MD5) ──────────────────────────────────────────────
    # Click formula: MD5(click_trans_id + service_id + secret_key +
    #                    merchant_trans_id + amount + action + sign_time)
    sign_input = (
        f"{click_trans_id}"
        f"{service_id}"
        f"{secret_key}"
        f"{merchant_trans_id}"
        f"{amount:.2f}"
        f"{action}"
        f"{sign_time}"
    )
    expected_sign = hashlib.md5(sign_input.encode("utf-8")).hexdigest()

    if secret_key and expected_sign != sign_string:
        return {
            "click_trans_id": click_trans_id,
            "merchant_trans_id": merchant_trans_id,
            "error": -1,
            "error_note": "SIGN CHECK FAILED",
        }

    # ── 3. Buyurtmani topish ──────────────────────────────────────────────────
    try:
        order_id = int(merchant_trans_id)
    except (ValueError, TypeError):
        return {
            "click_trans_id": click_trans_id,
            "merchant_trans_id": merchant_trans_id,
            "error": -6,
            "error_note": "Invalid merchant_trans_id",
        }

    order = db.query(models.Order).filter(models.Order.id == order_id).first()

    if not order:
        return {
            "click_trans_id": click_trans_id,
            "merchant_trans_id": merchant_trans_id,
            "error": -5,
            "error_note": "Order not found",
        }

    # ── 4. action == 0: Prepare ───────────────────────────────────────────────
    if action == 0:
        if order.status == "paid":
            return {
                "click_trans_id": click_trans_id,
                "merchant_trans_id": merchant_trans_id,
                "merchant_prepare_id": order.id,
                "error": -4,
                "error_note": "Already paid",
            }
        if order.status != "pending":
            return {
                "click_trans_id": click_trans_id,
                "merchant_trans_id": merchant_trans_id,
                "merchant_prepare_id": order.id,
                "error": -9,
                "error_note": "Transaction cancelled",
            }
        # Miqdor tekshiruvi (±1 UZS tolerans)
        USD_RATE = 12800
        expected_uzs = round(order.amount_usd * USD_RATE)
        if abs(amount - expected_uzs) > 1:
            return {
                "click_trans_id": click_trans_id,
                "merchant_trans_id": merchant_trans_id,
                "merchant_prepare_id": order.id,
                "error": -2,
                "error_note": "Incorrect parameter amount",
            }

        return {
            "click_trans_id": click_trans_id,
            "merchant_trans_id": merchant_trans_id,
            "merchant_prepare_id": order.id,
            "error": 0,
            "error_note": "Success",
        }

    # ── 5. action == 1: Complete ──────────────────────────────────────────────
    if action == 1:
        if error < 0:
            # Click o'zi xato yubordi — to'lov bekor
            order.status = "cancelled"
            db.commit()
            return {
                "click_trans_id": click_trans_id,
                "merchant_trans_id": merchant_trans_id,
                "merchant_confirm_id": order.id,
                "error": 0,
                "error_note": "Cancelled",
            }

        if order.status == "paid":
            return {
                "click_trans_id": click_trans_id,
                "merchant_trans_id": merchant_trans_id,
                "merchant_confirm_id": order.id,
                "error": -4,
                "error_note": "Already paid",
            }

        # ✅ To'lov muvaffaqiyatli — orderni "paid" qilish
        order.status = "paid"
        db.commit()

        # Telegram bildirishnoma
        try:
            notif = (
                f"✅ <b>To'lov tasdiqlandi!</b>\n"
                f"🆔 Order: #{order.id}\n"
                f"📦 {order.product_title}\n"
                f"💰 {int(amount):,} so'm\n"
                f"🏦 Click Trans: {click_trans_id}"
            )
            send_telegram_notification(db, notif)
        except Exception:
            pass

        return {
            "click_trans_id": click_trans_id,
            "merchant_trans_id": merchant_trans_id,
            "merchant_confirm_id": order.id,
            "error": 0,
            "error_note": "Success",
        }

    # Unknown action
    return {
        "click_trans_id": click_trans_id,
        "merchant_trans_id": merchant_trans_id,
        "error": -8,
        "error_note": "Unknown action",
    }
