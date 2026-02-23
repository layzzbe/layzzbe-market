from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ProductBase(BaseModel):
    title: str
    description: str
    price: str
    image: str
    category: str
    techStack: List[str] = []
    features: List[str] = []

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    class Config:
        from_attributes = True

# ── Auth Schemas ──────────────────────────────────────────────
class UserCreate(BaseModel):
    email: str
    password: str
    is_admin: Optional[bool] = False

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdateMe(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None

class ChangePassword(BaseModel):
    current_password: str
    new_password: str

class AdminResetPassword(BaseModel):
    new_password: str

class RoleUpdate(BaseModel):
    role: str  # 'admin' | 'moderator' | 'user'

# ── Response Schemas ──────────────────────────────────────────
class OrderInUser(BaseModel):
    id: int
    product_title: Optional[str] = None
    product_image: Optional[str] = None
    amount_usd: float
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    email: str
    is_admin: bool
    role: Optional[str] = 'user'
    full_name: Optional[str] = None
    phone: Optional[str] = None
    balance: Optional[float] = 0.0
    created_at: Optional[datetime] = None
    orders_count: Optional[int] = 0
    total_spent_usd: Optional[float] = 0.0
    class Config:
        from_attributes = True

class UserDetailResponse(BaseModel):
    id: int
    email: str
    is_admin: bool
    role: Optional[str] = 'user'
    full_name: Optional[str] = None
    phone: Optional[str] = None
    created_at: Optional[datetime] = None
    orders: List[OrderInUser] = []
    orders_count: int = 0
    total_spent_usd: float = 0.0
    class Config:
        from_attributes = True

class UserRoleUpdate(BaseModel):
    is_admin: bool

class TransactionOut(BaseModel):
    id: int
    type: str
    amount: float
    currency: str = 'UZS'
    description: Optional[str] = None
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class TopUpRequest(BaseModel):
    amount_uzs: float

class PurchaseRequest(BaseModel):
    product_title: str
    product_image: Optional[str] = None
    product_category: Optional[str] = None
    amount_uzs: float

class CartItemIn(BaseModel):
    product_id: int          # Only send ID — backend reads real price from DB
    quantity: int = 1

class WalletPaymentRequest(BaseModel):
    cart_items: List[CartItemIn]

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
