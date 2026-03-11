# -*- coding: utf-8 -*-
from fastapi import FastAPI, Depends, HTTPException, Query, Request
from sqlalchemy import create_engine, Column, Integer, String, Numeric, ForeignKey, Text, DateTime, text as sql_text, func
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship, selectinload
from pydantic import BaseModel
from typing import List, Optional, Any, Dict, Tuple
from datetime import datetime, date, time as dtime
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from collections import defaultdict
from threading import Lock
import time
import uuid
import json

# Опциональный импорт requests для Bitrix24 интеграции
try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False
    print("WARNING: 'requests' module not found. Bitrix24 integration will be disabled.")

# Database connection details
DATABASE_URL = "postgresql://carento:carento@194.33.40.197:5432/carento"

# FastAPI app initialization
app = FastAPI()

# CORS middleware to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://new.carsline.md",
        "https://new.carsline.md",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        # === добавлено для твоего фронта ===
        "http://194.33.40.197:3000",
        "http://194.33.40.197",
        "http://carsline.md",
        "https://carsline.md",
        "http://www.carsline.md",
        "https://www.carsline.md",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Enable gzip compression for larger responses
app.add_middleware(GZipMiddleware, minimum_size=500)

# ---- Rate Limiting Configuration (Optimized) ----
# Оптимизированное хранилище: {ip: {endpoint: {'count': N, 'window_start': timestamp}}}
rate_limit_storage = defaultdict(dict)
rate_limit_lock = Lock()
last_cleanup_time = time.time()
CLEANUP_INTERVAL = 300  # Очистка каждые 5 минут
MAX_STORAGE_SIZE = 10000  # Максимальное количество IP в хранилище

# Конфигурация лимитов для разных endpoints
# Формат: (количество_запросов, период_в_секундах)
# None означает отсутствие rate limiting
RATE_LIMITS = {
    "default": None,  # Нет лимита для GET запросов по умолчанию
    "/cars": None,  # Нет лимита для списка машин (публичные данные)
    "/cars/{car_id}": None,  # Нет лимита для деталей машины (публичные данные)
    "/cars/categories": None,  # Нет лимита для категорий (публичные данные)
    "/cars/fuels": None,  # Нет лимита для типов топлива (публичные данные)
    "/cars/transmissions": None,  # Нет лимита для трансмиссий (публичные данные)
    "/reservations": (20, 60),  # 20 запросов в минуту для бронирования (защита от спама)
    "/contacts": (20, 60),  # 20 запросов в минуту для контактной формы (защита от спама)
}

def get_rate_limit_for_path(path: str) -> Tuple[Optional[int], Optional[int]]:
    """
    Возвращает лимит для конкретного пути (None, None если лимит отключен)
    """
    # Проверяем точное совпадение
    if path in RATE_LIMITS:
        limit = RATE_LIMITS[path]
        if limit is None:
            return None, None
        return limit
    
    # Проверяем паттерны с параметрами (например, /cars/{car_id})
    if path.startswith("/cars/") and path != "/cars":
        parts = path.split("/")
        if len(parts) == 3 and parts[2].isdigit():
            limit = RATE_LIMITS.get("/cars/{car_id}", RATE_LIMITS["default"])
            if limit is None:
                return None, None
            return limit
        elif len(parts) == 3 and parts[2] in ["categories", "fuels", "transmissions"]:
            limit = RATE_LIMITS.get(f"/cars/{parts[2]}", RATE_LIMITS["default"])
            if limit is None:
                return None, None
            return limit
    
    # Возвращаем лимит для endpoint или default
    limit = RATE_LIMITS.get(path, RATE_LIMITS["default"])
    if limit is None:
        return None, None
    return limit

def cleanup_old_entries():
    """
    Периодическая очистка старых записей (вызывается редко)
    """
    global last_cleanup_time
    current_time = time.time()
    
    # Очищаем только раз в CLEANUP_INTERVAL секунд
    if current_time - last_cleanup_time < CLEANUP_INTERVAL:
        return
    
    with rate_limit_lock:
        expired_ips = []
        max_window = max(w for _, w in RATE_LIMITS.values())
        
        # Очистка истекших записей
        for ip, endpoints in list(rate_limit_storage.items()):
            expired_endpoints = []
            for endpoint, data in endpoints.items():
                # Используем максимальное окно для упрощения
                if current_time - data.get('window_start', 0) >= max_window:
                    expired_endpoints.append(endpoint)
            
            # Удаляем истекшие endpoints
            for endpoint in expired_endpoints:
                del endpoints[endpoint]
            
            # Удаляем IP если нет активных endpoints
            if not endpoints:
                expired_ips.append(ip)
        
        # Удаляем пустые IP
        for ip in expired_ips:
            if ip in rate_limit_storage:
                del rate_limit_storage[ip]
        
        # Если хранилище слишком большое, удаляем самые старые IP
        if len(rate_limit_storage) > MAX_STORAGE_SIZE:
            # Сортируем по времени последнего запроса и удаляем старые
            ip_times = []
            for ip, endpoints in rate_limit_storage.items():
                max_time = max((data.get('window_start', 0) for data in endpoints.values()), default=0)
                ip_times.append((ip, max_time))
            
            # Сортируем по времени (старые первыми)
            ip_times.sort(key=lambda x: x[1])
            
            # Удаляем самые старые
            to_remove = len(rate_limit_storage) - MAX_STORAGE_SIZE
            for ip, _ in ip_times[:to_remove]:
                if ip in rate_limit_storage:
                    del rate_limit_storage[ip]
        
        last_cleanup_time = current_time

def check_rate_limit(ip: str, path: str) -> Tuple[bool, dict]:
    """
    Оптимизированная проверка rate limit (O(1) вместо O(n))
    """
    max_requests, window_seconds = get_rate_limit_for_path(path)
    
    # Если лимит отключен, разрешаем запрос
    if max_requests is None or window_seconds is None:
        return True, {
            "limit": 0,
            "window": 0,
            "remaining": 0,
            "retry_after": 0
        }
    
    current_time = time.time()
    
    # Периодическая очистка (не блокирует запросы)
    cleanup_old_entries()
    
    with rate_limit_lock:
        ip_data = rate_limit_storage[ip]
        endpoint_data = ip_data.get(path)
        
        # Проверяем, нужно ли сбросить окно
        if endpoint_data is None or (current_time - endpoint_data.get('window_start', 0)) >= window_seconds:
            # Новое окно или первый запрос
            ip_data[path] = {'count': 1, 'window_start': current_time}
            remaining = max_requests - 1
            return True, {
                "limit": max_requests,
                "window": window_seconds,
                "remaining": remaining,
                "retry_after": 0
            }
        
        # Проверяем текущий счетчик
        current_count = endpoint_data.get('count', 0)
        
        if current_count >= max_requests:
            # Лимит превышен
            window_start = endpoint_data.get('window_start', current_time)
            elapsed = current_time - window_start
            retry_after = max(1, int(window_seconds - elapsed))
            
            return False, {
                "limit": max_requests,
                "window": window_seconds,
                "remaining": 0,
                "retry_after": retry_after
            }
        
        # Увеличиваем счетчик
        endpoint_data['count'] = current_count + 1
        remaining = max_requests - endpoint_data['count']
        
        return True, {
            "limit": max_requests,
            "window": window_seconds,
            "remaining": remaining,
            "retry_after": 0
        }

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """
    Middleware для rate limiting - применяется только к POST/PUT/DELETE запросам
    GET запросы не ограничиваются (публичные данные)
    """
    # Исключения: health check и другие служебные endpoints
    if request.url.path in ["/health", "/docs", "/openapi.json", "/redoc"]:
        return await call_next(request)
    
    # GET запросы не ограничиваются (публичные данные)
    # Rate limiting только для POST/PUT/DELETE/PATCH (изменение данных)
    if request.method in ["GET", "HEAD", "OPTIONS"]:
        return await call_next(request)
    
    # Получаем IP адрес клиента
    client_ip = request.client.host if request.client else "unknown"
    
    # Для проксированных запросов (если используется nginx/proxy)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # Берем первый IP из списка (реальный IP клиента)
        client_ip = forwarded_for.split(",")[0].strip()
    
    # Получаем путь запроса
    path = request.url.path
    
    # Проверяем, есть ли лимит для этого endpoint
    max_requests, window_seconds = get_rate_limit_for_path(path)
    
    # Если лимит = None, значит rate limiting отключен для этого endpoint
    if max_requests is None:
        return await call_next(request)
    
    # Проверяем rate limit
    allowed, limit_info = check_rate_limit(client_ip, path)
    
    if not allowed:
        # Превышен лимит - возвращаем 429 Too Many Requests
        return JSONResponse(
            status_code=429,
            content={
                "error": "Rate limit exceeded",
                "message": f"Too many requests. Limit: {limit_info['limit']} requests per {limit_info['window']} seconds.",
                "retry_after": limit_info["retry_after"],
                "limit": limit_info["limit"],
                "window": limit_info["window"]
            },
            headers={
                "Retry-After": str(limit_info["retry_after"]),
                "X-RateLimit-Limit": str(limit_info["limit"]),
                "X-RateLimit-Window": str(limit_info["window"]),
                "X-RateLimit-Remaining": "0"
            }
        )
    
    # Добавляем заголовки с информацией о лимите
    response = await call_next(request)
    response.headers["X-RateLimit-Limit"] = str(limit_info["limit"])
    response.headers["X-RateLimit-Window"] = str(limit_info["window"])
    response.headers["X-RateLimit-Remaining"] = str(limit_info["remaining"])
    
    return response

# SQLAlchemy setup
Base = declarative_base()
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Database Models
class Img(Base):
    __tablename__ = "img"
    id = Column(Integer, primary_key=True, index=True)
    url = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    path_thumb = Column(Text, nullable=True)    

class Marca(Base):
    __tablename__ = "marca"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)

class Model(Base):
    __tablename__ = "model"
    id = Column(Integer, primary_key=True, index=True)
    marca_id = Column(Integer, ForeignKey("marca.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    marca = relationship("Marca")

class Price(Base):
    __tablename__ = "price"
    id = Column(Integer, primary_key=True, index=True)
    currency = Column(String(3), default="EUR")
    base_value = Column(Numeric(12, 2), nullable=False)

class Car(Base):
    __tablename__ = "car"
    id = Column(Integer, primary_key=True, index=True)
    created_date = Column(DateTime, default=datetime.now)
    img_id = Column(Integer, ForeignKey("img.id"), nullable=True)
    marca_id = Column(Integer, ForeignKey("marca.id"), nullable=True)
    model_id = Column(Integer, ForeignKey("model.id"), nullable=True)
    fuel = Column(String(50), nullable=True)
    transmission = Column(String(50), nullable=True)
    category = Column(String(50), nullable=True)
    drive_type = Column(String(50), nullable=True)
    seats = Column(Integer, nullable=True)
    luggage_capacity = Column(Integer, nullable=True)
    price_id = Column(Integer, ForeignKey("price.id"), nullable=True)
    img_cover = Column(Integer, ForeignKey("img.id", ondelete="SET NULL", onupdate="CASCADE"), nullable=True)

    img = relationship("Img", foreign_keys=[img_id])
    marca = relationship("Marca")
    model = relationship("Model")
    price = relationship("Price")
    cover_image = relationship("Img", foreign_keys=[img_cover])

# Pydantic Models for API
class ImgBase(BaseModel):
    model_config = {"from_attributes": True}
    
    url: str
    description: Optional[str] = None

class MarcaBase(BaseModel):
    model_config = {"from_attributes": True}
    
    name: str

class ModelBase(BaseModel):
    model_config = {"from_attributes": True}
    
    name: str
    marca: MarcaBase

class PriceBase(BaseModel):
    model_config = {"from_attributes": True}
    
    currency: str
    base_value: float

class CarResponse(BaseModel):
    model_config = {"from_attributes": True, "protected_namespaces": ()}
    
    id: int
    created_date: datetime
    img_url: Optional[str] = None
    marca_name: Optional[str] = None
    model_name: Optional[str] = None
    fuel: Optional[str] = None
    transmission: Optional[str] = None
    category: Optional[str] = None
    drive_type: Optional[str] = None
    seats: Optional[int] = None
    luggage_capacity: Optional[int] = None
    price_value: Optional[float] = None
    price_currency: Optional[str] = None
    cover_image_url: Optional[str] = None

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# API Endpoints
@app.get("/")
async def root():
    return {"message": "Carento Cars API", "version": "1.0.0"}


@app.get("/cars")
def get_cars(page: int = 1, limit: int = 6, sort: str = "most_viewed", direction: str = "desc",
             max_price: Optional[float] = None, category: Optional[List[str]] = Query(None),
             fuel: Optional[List[str]] = Query(None), transmission: Optional[List[str]] = Query(None),
             db: Session = Depends(get_db)):

    def thumb(img):
        return img.path_thumb if img and getattr(img, "path_thumb", None) else None

    query = (
        db.query(Car)
        .options(
            selectinload(Car.img),
            selectinload(Car.marca),
            selectinload(Car.model),
            selectinload(Car.price),
            selectinload(Car.cover_image),
        )
    )

    if category:
        query = query.filter(Car.category.in_(category))
    if fuel:
        query = query.filter(Car.fuel.in_(fuel))
    if transmission:
        query = query.filter(Car.transmission.in_(transmission))
    if max_price is not None:
        query = query.join(Price).filter(Price.base_value <= max_price)

    total_cars = query.count()
    skip = (page - 1) * limit

    if direction == "asc":
        cars = query.order_by(Car.id.asc()).offset(skip).limit(limit).all()
    else:
        cars = query.order_by(Car.id.desc()).offset(skip).limit(limit).all()

    response_cars = []
    for car in cars:
        response_cars.append(CarResponse(
            id=car.id,
            created_date=car.created_date,
            img_url=thumb(car.img),
            marca_name=car.marca.name if car.marca else None,
            model_name=car.model.name if car.model else None,
            fuel=car.fuel,
            transmission=car.transmission,
            category=car.category,
            drive_type=car.drive_type,
            seats=car.seats,
            luggage_capacity=car.luggage_capacity,
            price_value=float(car.price.base_value) if car.price else None,
            price_currency=car.price.currency if car.price else None,
            cover_image_url=thumb(car.cover_image)
        ))

    total_pages = (total_cars + limit - 1) // limit

    return {
        "cars": response_cars,
        "pagination": {
            "current_page": page,
            "total_pages": total_pages,
            "total_cars": total_cars,
            "limit": limit,
            "has_next": page < total_pages,
            "has_prev": page > 1
        },
        "sort_info": {"direction": direction, "sorted_by": sort}
    }    
    # Если машин больше 6, используем пагинацию
    skip = (page - 1) * limit
    # Применяем сортировку для пагинации
    if direction == "asc":
        cars = query.order_by(Car.id.asc()).offset(skip).limit(limit).all()
    else:
        cars = query.order_by(Car.id.desc()).offset(skip).limit(limit).all()
    
    response_cars = []
    for car in cars:
        response_cars.append(CarResponse(
            id=car.id,
            created_date=car.created_date,
            img_url=car.img.url if car.img else None,
            marca_name=car.marca.name if car.marca else None,
            model_name=car.model.name if car.model else None,
            fuel=car.fuel,
            transmission=car.transmission,
            category=car.category,
            drive_type=car.drive_type,
            seats=car.seats,
            luggage_capacity=car.luggage_capacity,
            price_value=float(car.price.base_value) if car.price else None,
            price_currency=car.price.currency if car.price else None,
            cover_image_url=car.cover_image.url if car.cover_image else None
        ))
    

    total_pages = (total_cars + limit - 1) // limit  
    
    return {
        "cars": response_cars,
        "pagination": {
            "current_page": page,
            "total_pages": total_pages,
            "total_cars": total_cars,
            "limit": limit,
            "has_next": page < total_pages,
            "has_prev": page > 1
        },
        "sort_info": {
            "direction": direction,
            "sorted_by": sort
        }
    }

# Simple in-memory caches (TTL)
_CACHE_TTL_SECONDS = 60
_category_cache = {"data": None, "ts": 0.0}
_fuel_cache = {"data": None, "ts": 0.0}
_transmission_cache = {"data": None, "ts": 0.0}


@app.get("/cars/categories")
def get_category_counts(db: Session = Depends(get_db)):
    """Get car counts by categories"""
    try:
        # Cache hit
        now = time.time()
        if _category_cache["data"] is not None and (now - _category_cache["ts"]) < _CACHE_TTL_SECONDS:
            return _category_cache["data"]

        # Получаем все категории и их количество
        category_counts = db.query(Car.category, func.count(Car.id)).group_by(Car.category).all()
        
        # Формируем результат
        result = {}
        total = 0
        for category, count in category_counts:
            if category:  # Игнорируем NULL категории
                result[category] = count
                total += count
        
        # Добавляем общий счетчик
        result["All"] = total
        
        _category_cache.update({"data": result, "ts": now})
        return result
    except Exception as e:
        # Логируем ошибку с полным traceback
        import traceback
        error_msg = f"Error in get_category_counts: {str(e)}"
        print(error_msg)
        traceback.print_exc()
        # Возвращаем пустой результат вместо 500 ошибки
        return {"All": 0}

@app.get("/cars/fuels")
def get_fuel_counts(db: Session = Depends(get_db)):
    """Get car counts by fuel types"""
    try:
        now = time.time()
        if _fuel_cache["data"] is not None and (now - _fuel_cache["ts"]) < _CACHE_TTL_SECONDS:
            return _fuel_cache["data"]

        # Получаем все типы топлива и их количество
        fuel_counts = db.query(Car.fuel, func.count(Car.id)).group_by(Car.fuel).all()
        
        # Формируем результат
        result = {}
        total = 0
        for fuel, count in fuel_counts:
            if fuel:  # Игнорируем NULL топливо
                result[fuel] = count
                total += count
        
        # Добавляем общий счетчик
        result["All"] = total
        
        _fuel_cache.update({"data": result, "ts": now})
        return result
    except Exception as e:
        # Логируем ошибку с полным traceback
        import traceback
        error_msg = f"Error in get_fuel_counts: {str(e)}"
        print(error_msg)
        traceback.print_exc()
        # Возвращаем пустой результат вместо 500 ошибки
        return {"All": 0}

@app.get("/cars/transmissions")
def get_transmission_counts(db: Session = Depends(get_db)):
    """Get car counts by transmission types"""
    try:
        now = time.time()
        if _transmission_cache["data"] is not None and (now - _transmission_cache["ts"]) < _CACHE_TTL_SECONDS:
            return _transmission_cache["data"]

        # Получаем все типы трансмиссии и их количество
        transmission_counts = db.query(Car.transmission, func.count(Car.id)).group_by(Car.transmission).all()
        
        # Формируем результат
        result = {}
        total = 0
        for transmission, count in transmission_counts:
            if transmission:  # Игнорируем NULL трансмиссию
                result[transmission] = count
                total += count
        
        # Добавляем общий счетчик
        result["All"] = total
        
        _transmission_cache.update({"data": result, "ts": now})
        return result
    except Exception as e:
        # Логируем ошибку с полным traceback
        import traceback
        error_msg = f"Error in get_transmission_counts: {str(e)}"
        print(error_msg)
        traceback.print_exc()
        # Возвращаем пустой результат вместо 500 ошибки
        return {"All": 0}

@app.get("/cars/{car_id}", response_model=CarResponse)
def get_car_by_id(car_id: int, db: Session = Depends(get_db)):
    car = (
        db.query(Car)
        .options(
            selectinload(Car.img),
            selectinload(Car.marca),
            selectinload(Car.model),
            selectinload(Car.price),
            selectinload(Car.cover_image),
        )
        .filter(Car.id == car_id)
        .first()
    )
    if car is None:
        raise HTTPException(status_code=404, detail="Car not found")
    return CarResponse(
        id=car.id,
        created_date=car.created_date,
        img_url=car.img.url if car.img else None,
        marca_name=car.marca.name if car.marca else None,
        model_name=car.model.name if car.model else None,
        fuel=car.fuel,
        transmission=car.transmission,
        category=car.category,
        drive_type=car.drive_type,
        seats=car.seats,
        luggage_capacity=car.luggage_capacity,
        price_value=float(car.price.base_value) if car.price else None,
        price_currency=car.price.currency if car.price else None,
        cover_image_url=car.cover_image.url if car.cover_image else None
    )

# ---- Reservations API ----
class ReservationCreate(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: str
    car_name: str

    pickup_date: date
    dropoff_date: date
    pickup_location: str
    dropoff_location: str
    pickup_time: Optional[dtime] = None  # Опциональное поле, можно не отправлять

    extras: Dict[str, Any] = {}
    subtotal_lei: float = 0
    discount_lei: float = 0
    total_lei: float = 0


# ---- Contact Form API ----
class ContactFormCreate(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: str
    message: str


# ---- Bitrix24 Integration ----
BITRIX24_WEBHOOK_BASE = "https://nobilauto.bitrix24.ru/rest/18397/h5c7kw97sfp3uote"
BITRIX24_LEAD_ADD_URL = f"{BITRIX24_WEBHOOK_BASE}/crm.lead.add"
BITRIX24_LEAD_UPDATE_URL = f"{BITRIX24_WEBHOOK_BASE}/crm.lead.update"
BITRIX24_LEAD_GET_URL = f"{BITRIX24_WEBHOOK_BASE}/crm.lead.get"
BITRIX24_CONTACT_ADD_URL = f"{BITRIX24_WEBHOOK_BASE}/crm.contact.add"

def create_contact_in_bitrix24(first_name: str, last_name: str, phone: str, email: str):
    """
    Создает контакт в Bitrix24 или возвращает ID существующего
    """
    if not REQUESTS_AVAILABLE:
        print(f"[Bitrix24] REQUESTS_AVAILABLE is False, cannot create contact")
        return None
    
    try:
        # Проверяем и очищаем поля
        first_name_clean = first_name.strip() if first_name else ""
        last_name_clean = last_name.strip() if last_name else ""
        phone_clean = phone.strip() if phone else ""
        email_clean = email.strip() if email else ""
        
        # Проверяем, что обязательные поля не пустые
        if not first_name_clean or not last_name_clean:
            print(f"[Bitrix24] ⚠ WARNING: Empty name fields (first_name: '{first_name_clean}', last_name: '{last_name_clean}')")
        if not phone_clean:
            print(f"[Bitrix24] ⚠ WARNING: Empty phone field")
        if not email_clean:
            print(f"[Bitrix24] ⚠ WARNING: Empty email field")
        
        # Если все поля пустые, не создаем контакт
        if not first_name_clean and not last_name_clean and not phone_clean and not email_clean:
            print(f"[Bitrix24] ✗ ERROR: All contact fields are empty, cannot create contact")
            return None
        
        contact_data = {
            "fields": {
                "NAME": first_name_clean,
                "LAST_NAME": last_name_clean,
                "PHONE": [
                    {
                        "VALUE": phone_clean,
                        "VALUE_TYPE": "WORK"
                    }
                ],
                "EMAIL": [
                    {
                        "VALUE": email_clean,
                        "VALUE_TYPE": "WORK"
                    }
                ]
            }
        }
        
        print(f"[Bitrix24] Creating contact for: {first_name_clean} {last_name_clean}, {email_clean}")
        response = requests.post(
            BITRIX24_CONTACT_ADD_URL,
            json=contact_data,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            if "result" in result:
                contact_id = result["result"]
                print(f"[Bitrix24] ✓ Contact created with ID: {contact_id}")
                return contact_id
            elif "error" in result:
                error_code = result.get("error", "Unknown")
                error_msg = result.get("error_description", result.get("error", "Unknown error"))
                print(f"[Bitrix24] ✗ Contact creation error: {error_code} - {error_msg}")
                print(f"[Bitrix24] Full error response: {json.dumps(result, ensure_ascii=False, indent=2)}")
                return None
            else:
                print(f"[Bitrix24] ✗ Unexpected response format: {result}")
                return None
        else:
            print(f"[Bitrix24] ✗ Contact creation HTTP error: {response.status_code}")
            print(f"[Bitrix24] Response text: {response.text[:500]}")
            return None
            
    except requests.exceptions.Timeout:
        print(f"[Bitrix24] ✗ Timeout creating contact")
        return None
    except requests.exceptions.RequestException as e:
        print(f"[Bitrix24] ✗ Request error creating contact: {str(e)}")
        return None
    except Exception as e:
        print(f"[Bitrix24] ✗ Exception creating contact: {str(e)}")
        import traceback
        print(f"[Bitrix24] Traceback: {traceback.format_exc()}")
        return None


def send_to_bitrix24(payload: ReservationCreate):
    """
    Отправляет данные резервации в Bitrix24 CRM
    """
    print(f"[RESERVATION] ===== send_to_bitrix24 CALLED =====")
    print(f"[RESERVATION] Payload: first_name={payload.first_name}, last_name={payload.last_name}, phone={payload.phone}, email={payload.email}")
    print(f"[RESERVATION] Bitrix24 Webhook URL: {BITRIX24_WEBHOOK_BASE}")
    print(f"[RESERVATION] Bitrix24 Lead Add URL: {BITRIX24_LEAD_ADD_URL}")
    
    if not REQUESTS_AVAILABLE:
        print(f"[RESERVATION] REQUESTS_AVAILABLE is False!")
        return {"success": False, "error": "requests module not installed"}
    
    # Проверяем, что webhook URL настроен
    if not BITRIX24_WEBHOOK_BASE or BITRIX24_WEBHOOK_BASE == "":
        print(f"[RESERVATION] ✗ ERROR: BITRIX24_WEBHOOK_BASE is not configured!")
        return {"success": False, "error": "Bitrix24 webhook URL is not configured"}
    
    try:
        print(f"[RESERVATION] Creating contact in Bitrix24...")
        # Сначала создаем контакт
        contact_id = create_contact_in_bitrix24(
            payload.first_name,
            payload.last_name,
            payload.phone,
            payload.email
        )
        print(f"[RESERVATION] Contact ID: {contact_id}")
        if contact_id:
            print(f"[RESERVATION] ✓ Contact created successfully with ID: {contact_id}")
        else:
            print(f"[RESERVATION] ⚠ WARNING: Contact was NOT created, but will continue to create lead")
        
        # Формируем заголовок лида
        title = f"Резервация: {payload.car_name}"
        
        # Формируем текстовый комментарий со всеми дополнительными данными
        comments_lines = [
            "ДЕТАЛЬНАЯ ИНФОРМАЦИЯ О РЕЗЕРВАЦИИ:",
            "",
            f"Автомобиль: {payload.car_name}",
            f"Дата получения: {payload.pickup_date}",
        ]
        if payload.pickup_time:
            comments_lines.append(f"Время получения: {payload.pickup_time}")
        comments_lines.extend([
            f"Локация получения: {payload.pickup_location}",
            f"Дата возврата: {payload.dropoff_date}",
            f"Локация возврата: {payload.dropoff_location}",
            ""
        ])
        
        # Добавляем дополнительные услуги
        services_list = []
        
        if payload.extras and isinstance(payload.extras, dict) and len(payload.extras) > 0:
            for service_name, service_data in payload.extras.items():
                # Обрабатываем разные форматы данных
                price_value = None
                
                if isinstance(service_data, (int, float)):
                    price_value = float(service_data)
                    services_list.append(f"- {service_name}: {price_value:.2f} lei")
                elif isinstance(service_data, dict):
                    price = service_data.get("price", None)
                    quantity = service_data.get("quantity", 1)
                    
                    if price is not None:
                        try:
                            price_value = float(price)
                            if quantity and int(quantity) > 1:
                                total_price = price_value * int(quantity)
                                services_list.append(f"- {service_name}: {quantity} × {price_value:.2f} lei = {total_price:.2f} lei")
                            else:
                                services_list.append(f"- {service_name}: {price_value:.2f} lei")
                        except (ValueError, TypeError):
                            services_list.append(f"- {service_name}")
                    else:
                        services_list.append(f"- {service_name}")
                else:
                    services_list.append(f"- {service_name}")
        
        if services_list:
            comments_lines.append("Дополнительные услуги:")
            comments_lines.extend(services_list)
            comments_lines.append("")
        
        # Добавляем финансовую информацию
        # Обрабатываем случай, когда финансовые поля могут быть None или отсутствовать
        subtotal = payload.subtotal_lei if payload.subtotal_lei is not None else 0.0
        discount = payload.discount_lei if payload.discount_lei is not None else 0.0
        total = payload.total_lei if payload.total_lei is not None else 0.0
        
        comments_lines.extend([
            "ФИНАНСОВАЯ ИНФОРМАЦИЯ:",
            f"Подытог: {subtotal:.2f} lei",
            f"Скидка: {discount:.2f} lei",
            f"ИТОГО К ОПЛАТЕ: {total:.2f} lei"
        ])
        
        comments = "\n".join(comments_lines)
        
        # Проверяем обязательные поля перед отправкой
        first_name_clean = payload.first_name.strip() if payload.first_name else ""
        last_name_clean = payload.last_name.strip() if payload.last_name else ""
        phone_clean = payload.phone.strip() if payload.phone else ""
        email_clean = payload.email.strip() if payload.email else ""
        
        # Проверяем, что обязательные поля не пустые
        if not first_name_clean or not last_name_clean:
            print(f"[RESERVATION] ⚠ WARNING: Empty name fields (first_name: '{first_name_clean}', last_name: '{last_name_clean}')")
        if not phone_clean:
            print(f"[RESERVATION] ⚠ WARNING: Empty phone field")
        if not email_clean:
            print(f"[RESERVATION] ⚠ WARNING: Empty email field")
        
        # Формируем данные для Bitrix24
        bitrix_data = {
            "fields": {
                "TITLE": title,
                "NAME": first_name_clean,
                "LAST_NAME": last_name_clean,
                "PHONE": [
                    {
                        "VALUE": phone_clean,
                        "VALUE_TYPE": "WORK"
                    }
                ],
                "EMAIL": [
                    {
                        "VALUE": email_clean,
                        "VALUE_TYPE": "WORK"
                    }
                ],
                "COMMENTS": comments,
                "SOURCE_ID": "33",  # Источник: сайт
                "ASSIGNED_BY_ID": 4480  # Ответственный пользователь
            }
        }
        
        # Если контакт был создан, связываем его с лидом
        if contact_id:
            bitrix_data["fields"]["CONTACT_ID"] = contact_id
            print(f"[RESERVATION] Linking contact ID {contact_id} to lead")
        else:
            print(f"[RESERVATION] ⚠ No contact ID, creating lead without contact link")
        
        print(f"[RESERVATION] Lead data prepared. Contact ID: {contact_id}, SOURCE_ID: 33")
        
        # ДИАГНОСТИКА: Сохраняем информацию для ответа
        debug_info = {
            "request_url": BITRIX24_LEAD_ADD_URL,
            "request_data": bitrix_data,
            "response_status": None,
            "response_text": None,
            "response_json": None
        }
        
        print(f"[RESERVATION] Bitrix24 Request URL: {BITRIX24_LEAD_ADD_URL}")
        print(f"[RESERVATION] Bitrix24 Request Data: {bitrix_data}")
        print(f"[RESERVATION] Sending POST request to Bitrix24...")
        
        try:
            response = requests.post(
                BITRIX24_LEAD_ADD_URL,
                json=bitrix_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            debug_info["response_status"] = response.status_code
            debug_info["response_text"] = response.text[:1000]  # Первые 1000 символов
            
            print(f"[RESERVATION] Request sent successfully!")
            print(f"[RESERVATION] Bitrix24 Response Status: {response.status_code}")
            print(f"[RESERVATION] Bitrix24 Response Text: {response.text}")
        except requests.exceptions.ConnectionError as e:
            print(f"[RESERVATION] Connection Error: {e}")
            return {"success": False, "error": f"Connection error: {str(e)}", "debug": debug_info}
        except requests.exceptions.Timeout as e:
            print(f"[RESERVATION] Timeout Error: {e}")
            return {"success": False, "error": f"Timeout: {str(e)}", "debug": debug_info}
        except Exception as e:
            print(f"[RESERVATION] Request Exception: {e}")
            import traceback
            print(f"[RESERVATION] Traceback: {traceback.format_exc()}")
            return {"success": False, "error": f"Request error: {str(e)}", "debug": debug_info}
        
        # Проверяем ответ
        if response.status_code == 200:
            try:
                result = response.json()
                debug_info["response_json"] = result
                print(f"[RESERVATION] Bitrix24 Response JSON: {result}")
                
                if "result" in result:
                    lead_id = result["result"]
                    print(f"[RESERVATION] Lead created with ID: {lead_id}")
                    
                    # Явно обновляем SOURCE_ID через update
                    try:
                        update_data = {
                            "id": lead_id,
                            "fields": {
                                "SOURCE_ID": "33"
                            }
                        }
                        print(f"[RESERVATION] Updating SOURCE_ID for lead {lead_id}...")
                        update_response = requests.post(
                            BITRIX24_LEAD_UPDATE_URL,
                            json=update_data,
                            headers={"Content-Type": "application/json"},
                            timeout=5
                        )
                        if update_response.status_code == 200:
                            update_result = update_response.json()
                            if "result" in update_result and update_result["result"]:
                                print(f"[RESERVATION] ✓ SOURCE_ID updated successfully")
                            else:
                                print(f"[RESERVATION] ⚠ SOURCE_ID update response: {update_result}")
                        else:
                            print(f"[RESERVATION] ⚠ SOURCE_ID update HTTP error: {update_response.status_code}")
                    except Exception as update_error:
                        print(f"[RESERVATION] ⚠ Could not update SOURCE_ID: {str(update_error)}")
                    
                    return {"success": True, "lead_id": lead_id, "debug": debug_info}
                elif "error" in result:
                    error_code = result.get("error", "Unknown")
                    error_msg = result.get("error_description", result.get("error", "Unknown error"))
                    print(f"[RESERVATION] Bitrix24 Error: {error_code} - {error_msg}")
                    return {"success": False, "error": f"{error_code}: {error_msg}", "debug": debug_info}
                else:
                    print(f"[RESERVATION] Bitrix24 Unexpected format: {result}")
                    return {"success": False, "error": "Unexpected response format", "debug": debug_info}
            except Exception as e:
                print(f"[RESERVATION] Bitrix24 JSON parse error: {e}")
                return {"success": False, "error": f"JSON parse error: {str(e)}", "debug": debug_info}
        
        error_msg = f"HTTP {response.status_code}: {response.text[:500]}"
        print(f"[RESERVATION] Bitrix24 HTTP Error: {error_msg}")
        return {"success": False, "error": error_msg, "debug": debug_info}
        
    except requests.exceptions.Timeout:
        return {"success": False, "error": "Timeout: Bitrix24 не ответил в течение 5 секунд"}
    except requests.exceptions.RequestException as e:
        return {"success": False, "error": f"Request error: {str(e)}"}
    except Exception as e:
        return {"success": False, "error": f"Unexpected error: {str(e)}"}


def send_contact_to_bitrix24(payload: ContactFormCreate):
    """
    Отправляет данные контактной формы в Bitrix24 CRM
    """
    if not REQUESTS_AVAILABLE:
        return {"success": False, "error": "requests module not installed"}
    
    try:
        # Сначала создаем контакт
        contact_id = create_contact_in_bitrix24(
            payload.first_name,
            payload.last_name,
            payload.phone,
            payload.email
        )
        
        # Формируем заголовок лида
        title = f"Контактная форма: {payload.first_name} {payload.last_name}"
        
        # Формируем текстовый комментарий с сообщением
        comments_lines = [
            "СООБЩЕНИЕ ИЗ КОНТАКТНОЙ ФОРМЫ:",
            "",
            payload.message.strip(),
            ""
        ]
        
        comments = "\n".join(comments_lines)
        
        # Проверяем обязательные поля перед отправкой
        first_name_clean = payload.first_name.strip() if payload.first_name else ""
        last_name_clean = payload.last_name.strip() if payload.last_name else ""
        phone_clean = payload.phone.strip() if payload.phone else ""
        email_clean = payload.email.strip() if payload.email else ""
        
        # Проверяем, что обязательные поля не пустые
        if not first_name_clean or not last_name_clean:
            print(f"[Bitrix24] ⚠ WARNING: Empty name fields (first_name: '{first_name_clean}', last_name: '{last_name_clean}')")
        if not phone_clean:
            print(f"[Bitrix24] ⚠ WARNING: Empty phone field")
        if not email_clean:
            print(f"[Bitrix24] ⚠ WARNING: Empty email field")
        
        # Формируем данные для Bitrix24
        bitrix_data = {
            "fields": {
                "TITLE": title,
                "NAME": first_name_clean,
                "LAST_NAME": last_name_clean,
                "PHONE": [
                    {
                        "VALUE": phone_clean,
                        "VALUE_TYPE": "WORK"
                    }
                ],
                "EMAIL": [
                    {
                        "VALUE": email_clean,
                        "VALUE_TYPE": "WORK"
                    }
                ],
                "COMMENTS": comments,
                "SOURCE_ID": "33",  # Источник: сайт
                "ASSIGNED_BY_ID": 4480  # Ответственный пользователь
            }
        }
        
        # Если контакт был создан, связываем его с лидом
        if contact_id:
            bitrix_data["fields"]["CONTACT_ID"] = contact_id
        
        response = requests.post(
            BITRIX24_LEAD_ADD_URL,
            json=bitrix_data,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        # Проверяем ответ
        if response.status_code == 200:
            try:
                result = response.json()
                
                if "result" in result:
                    lead_id = result["result"]
                    
                    # Явно обновляем SOURCE_ID через update
                    try:
                        update_data = {
                            "id": lead_id,
                            "fields": {
                                "SOURCE_ID": "33"
                            }
                        }
                        requests.post(
                            BITRIX24_LEAD_UPDATE_URL,
                            json=update_data,
                            headers={"Content-Type": "application/json"},
                            timeout=5
                        )
                    except Exception:
                        pass
                    
                    return {"success": True, "lead_id": lead_id}
                elif "error" in result:
                    error_code = result.get("error", "Unknown")
                    error_msg = result.get("error_description", result.get("error", "Unknown error"))
                    return {"success": False, "error": f"{error_code}: {error_msg}"}
                else:
                    return {"success": False, "error": "Unexpected response format"}
            except Exception as e:
                return {"success": False, "error": f"JSON parse error: {str(e)}"}
        
        error_msg = f"HTTP {response.status_code}: {response.text[:500]}"
        return {"success": False, "error": error_msg}
        
    except requests.exceptions.Timeout:
        return {"success": False, "error": "Timeout: Bitrix24 не ответил в течение 5 секунд"}
    except requests.exceptions.RequestException as e:
        return {"success": False, "error": f"Request error: {str(e)}"}
    except Exception as e:
        return {"success": False, "error": f"Unexpected error: {str(e)}"}


@app.options("/reservations")
async def options_reservations():
    """Обработка preflight OPTIONS запросов для CORS"""
    return JSONResponse(
        status_code=200,
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
        }
    )

@app.post("/reservations")
def create_reservation(payload: ReservationCreate, request: Request, db: Session = Depends(get_db)):
    try:
        print(f"[RESERVATION] ===== NEW RESERVATION REQUEST =====")
        print(f"[RESERVATION] Payload received: first_name={payload.first_name}, email={payload.email}, car_name={payload.car_name}")
        print(f"[RESERVATION] Financial fields: subtotal={payload.subtotal_lei}, discount={payload.discount_lei}, total={payload.total_lei}")
        print(f"[RESERVATION] Dates: pickup_date={payload.pickup_date}, dropoff_date={payload.dropoff_date}")
        print(f"[RESERVATION] Locations: pickup_location={payload.pickup_location}, dropoff_location={payload.dropoff_location}")
        
        rid = str(uuid.uuid4())
        user_agent = request.headers.get("user-agent", "")
        client_ip = request.client.host if request.client else None

        insert_sql = sql_text(
            """
            INSERT INTO reservations (
                id, first_name, last_name, phone, email, car_name,
                pickup_date, dropoff_date, pickup_location, dropoff_location, pickup_time,
                extras, subtotal_lei, discount_lei, total_lei, user_agent, client_ip
            ) VALUES (
                :id, :first_name, :last_name, :phone, :email, :car_name,
                :pickup_date, :dropoff_date, :pickup_location, :dropoff_location, :pickup_time,
                :extras, :subtotal_lei, :discount_lei, :total_lei, :user_agent, :client_ip
            )
            """
        )

        # Обрабатываем финансовые поля - если None, используем 0
        subtotal_lei = payload.subtotal_lei if payload.subtotal_lei is not None else 0.0
        discount_lei = payload.discount_lei if payload.discount_lei is not None else 0.0
        total_lei = payload.total_lei if payload.total_lei is not None else 0.0
        
        db.execute(
            insert_sql,
            {
                "id": rid,
                "first_name": payload.first_name.strip() if payload.first_name else "",
                "last_name": payload.last_name.strip() if payload.last_name else "",
                "phone": payload.phone.strip() if payload.phone else "",
                "email": payload.email.strip() if payload.email else "",
                "car_name": payload.car_name.strip() if payload.car_name else "",
                "pickup_date": payload.pickup_date,
                "dropoff_date": payload.dropoff_date,
                "pickup_location": payload.pickup_location.strip() if payload.pickup_location else "",
                "dropoff_location": payload.dropoff_location.strip() if payload.dropoff_location else "",
                "pickup_time": payload.pickup_time,
                "extras": json.dumps(payload.extras) if payload.extras else "{}",
                "subtotal_lei": subtotal_lei,
                "discount_lei": discount_lei,
                "total_lei": total_lei,
                "user_agent": user_agent,
                "client_ip": client_ip,
            },
        )
        db.commit()
        
        # Отправляем данные в Bitrix24
        print(f"[RESERVATION] ===== STARTING Bitrix24 SEND =====")
        bitrix_result = {"success": False, "error": "Not executed"}
        try:
            print(f"[RESERVATION] Calling send_to_bitrix24()...")
            bitrix_result = send_to_bitrix24(payload)
            print(f"[RESERVATION] Bitrix24 Result: {bitrix_result}")
        except Exception as bitrix_error:
            import traceback
            print(f"[RESERVATION] Bitrix24 Exception: {traceback.format_exc()}")
            bitrix_result = {"success": False, "error": f"Exception: {str(bitrix_error)}"}
        
        return {
            "status": "ok",
            "id": rid,
            "bitrix24": {
                "sent": bitrix_result.get("success", False),
                "lead_id": bitrix_result.get("lead_id") if bitrix_result.get("success") else None,
                "error": bitrix_result.get("error") if not bitrix_result.get("success") else None,
                "debug": bitrix_result.get("debug")  # Добавляем детальную информацию для браузера
            }
        }
    except ValueError as ve:
        db.rollback()
        import traceback
        error_traceback = traceback.format_exc()
        print(f"[RESERVATION] ✗ VALIDATION ERROR in create_reservation: {str(ve)}")
        print(f"[RESERVATION] Traceback: {error_traceback}")
        raise HTTPException(
            status_code=400, 
            detail=f"Validation error: {str(ve)}"
        )
    except Exception as e:
        db.rollback()
        import traceback
        error_traceback = traceback.format_exc()
        print(f"[RESERVATION] ✗ ERROR in create_reservation: {str(e)}")
        print(f"[RESERVATION] Traceback: {error_traceback}")
        raise HTTPException(
            status_code=500, 
            detail=f"Server error: {str(e)}"
        )


@app.options("/contacts")
async def options_contacts():
    """Обработка preflight OPTIONS запросов для CORS"""
    return JSONResponse(
        status_code=200,
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
        }
    )

@app.post("/contacts")
def create_contact(payload: ContactFormCreate, request: Request, db: Session = Depends(get_db)):
    try:
        rid = str(uuid.uuid4())
        user_agent = request.headers.get("user-agent", "")
        client_ip = request.client.host if request.client else None

        insert_sql = sql_text(
            """
            INSERT INTO reservations (
                id, first_name, last_name, phone, email, car_name,
                pickup_date, dropoff_date, pickup_location, dropoff_location, pickup_time,
                extras, subtotal_lei, discount_lei, total_lei, user_agent, client_ip
            ) VALUES (
                :id, :first_name, :last_name, :phone, :email, :car_name,
                :pickup_date, :dropoff_date, :pickup_location, :dropoff_location, :pickup_time,
                :extras, :subtotal_lei, :discount_lei, :total_lei, :user_agent, :client_ip
            )
            """
        )

        # Сохраняем сообщение в extras как JSON
        extras_data = {"contact_message": payload.message.strip()}

        db.execute(
            insert_sql,
            {
                "id": rid,
                "first_name": payload.first_name.strip(),
                "last_name": payload.last_name.strip(),
                "phone": payload.phone.strip(),
                "email": payload.email.strip(),
                "car_name": None,  # NULL для контактной формы
                "pickup_date": None,  # NULL
                "dropoff_date": None,  # NULL
                "pickup_location": None,  # NULL
                "dropoff_location": None,  # NULL
                "pickup_time": None,  # NULL
                "extras": json.dumps(extras_data),
                "subtotal_lei": 0,
                "discount_lei": 0,
                "total_lei": 0,
                "user_agent": user_agent,
                "client_ip": client_ip,
            },
        )
        db.commit()
        
        # Отправляем данные в Bitrix24 (не блокируем ответ, если не удалось)
        bitrix_result = {"success": False, "error": "Not executed"}
        try:
            bitrix_result = send_contact_to_bitrix24(payload)
        except Exception as bitrix_error:
            bitrix_result = {"success": False, "error": f"Exception: {str(bitrix_error)}"}
        
        return {
            "status": "ok",
            "id": rid,
            "bitrix24": {
                "sent": bitrix_result.get("success", False),
                "lead_id": bitrix_result.get("lead_id") if bitrix_result.get("success") else None,
                "error": bitrix_result.get("error") if not bitrix_result.get("success") else None
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"DB insert error: {e}")

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
