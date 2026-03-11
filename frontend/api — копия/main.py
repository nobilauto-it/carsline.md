from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import create_engine, Column, Integer, String, Numeric, ForeignKey, Text, DateTime
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

# Database connection details
DATABASE_URL = "postgresql://carento:carento@135.181.105.165:5432/carento"

# FastAPI app initialization
app = FastAPI()

# CORS middleware to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

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
def get_cars(page: int = 1, limit: int = 6, db: Session = Depends(get_db)):
    # РџРѕР»СѓС‡Р°РµРј РѕР±С‰РµРµ РєРѕР»РёС‡РµСЃС‚РІРѕ РјР°С€РёРЅ
    total_cars = db.query(Car).count()
    
    # Р•СЃР»Рё РјР°С€РёРЅ 6 РёР»Рё РјРµРЅСЊС€Рµ, РїРѕРєР°Р·С‹РІР°РµРј РІСЃРµ РЅР° РѕРґРЅРѕР№ СЃС‚СЂР°РЅРёС†Рµ
    if total_cars <= 6:
        cars = db.query(Car).all()
        return {
            "cars": [CarResponse(
                id=car.id,
                created_date=car.created_date,
                img_url=car.img.url if car.img else None,
                marca_name=car.marca.name if car.marca else None,
                model_name=car.model.name if car.model else None,
                fuel=car.fuel,
                transmission=car.transmission,
                category=car.category,
                price_value=float(car.price.base_value) if car.price else None,
                price_currency=car.price.currency if car.price else None,
                cover_image_url=car.cover_image.url if car.cover_image else None
            ) for car in cars],
            "pagination": {
                "current_page": 1,
                "total_pages": 1,
                "total_cars": total_cars,
                "limit": total_cars,
                "has_next": False,
                "has_prev": False
            }
        }
    
    # Р•СЃР»Рё РјР°С€РёРЅ Р±РѕР»СЊС€Рµ 6, РёСЃРїРѕР»СЊР·СѓРµРј РїР°РіРёРЅР°С†РёСЋ
    skip = (page - 1) * limit
    cars = db.query(Car).offset(skip).limit(limit).all()
    
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
            price_value=float(car.price.base_value) if car.price else None,
            price_currency=car.price.currency if car.price else None,
            cover_image_url=car.cover_image.url if car.cover_image else None
        ))
    
    # Р’С‹С‡РёСЃР»СЏРµРј РёРЅС„РѕСЂРјР°С†РёСЋ Рѕ РїР°РіРёРЅР°С†РёРё
    total_pages = (total_cars + limit - 1) // limit  # РћРєСЂСѓРіР»СЏРµРј РІРІРµСЂС…
    
    return {
        "cars": response_cars,
        "pagination": {
            "current_page": page,
            "total_pages": total_pages,
            "total_cars": total_cars,
            "limit": limit,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
    }

@app.get("/cars/{car_id}", response_model=CarResponse)
def get_car_by_id(car_id: int, db: Session = Depends(get_db)):
    car = db.query(Car).filter(Car.id == car_id).first()
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
        price_value=float(car.price.base_value) if car.price else None,
        price_currency=car.price.currency if car.price else None,
        cover_image_url=car.cover_image.url if car.cover_image else None
    )

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
