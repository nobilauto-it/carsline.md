from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

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

# Mock data models
class Car(BaseModel):
    id: int
    name: str
    price_value: float
    price_currency: str
    fuel: str
    transmission: str
    category: str
    cover_image_url: str

class Pagination(BaseModel):
    page: int
    limit: int
    total: int
    pages: int

class SortInfo(BaseModel):
    sort: str
    direction: str

class CarsResponse(BaseModel):
    cars: List[Car]
    pagination: Pagination
    sort_info: SortInfo

# Mock data
mock_cars = [
    Car(id=1, name="BMW X5", price_value=89.0, price_currency="EUR", fuel="Petrol", transmission="Automatic", category="SUV", cover_image_url="https://example.com/bmw.jpg"),
    Car(id=2, name="Audi A4", price_value=78.0, price_currency="EUR", fuel="Petrol", transmission="Automatic", category="Sedan", cover_image_url="https://example.com/audi.jpg"),
    Car(id=3, name="Mercedes C-Class", price_value=95.0, price_currency="EUR", fuel="Diesel", transmission="Automatic", category="Sedan", cover_image_url="https://example.com/mercedes.jpg"),
    Car(id=4, name="Toyota RAV4", price_value=65.0, price_currency="EUR", fuel="Petrol", transmission="Manual", category="SUV", cover_image_url="https://example.com/toyota.jpg"),
    Car(id=5, name="Honda Civic", price_value=45.0, price_currency="EUR", fuel="Petrol", transmission="Manual", category="Sedan", cover_image_url="https://example.com/honda.jpg"),
    Car(id=6, name="Ford Explorer", price_value=120.0, price_currency="EUR", fuel="Diesel", transmission="Automatic", category="SUV", cover_image_url="https://example.com/ford.jpg"),
    Car(id=7, name="Volkswagen Golf", price_value=55.0, price_currency="EUR", fuel="Petrol", transmission="Manual", category="Sedan", cover_image_url="https://example.com/vw.jpg"),
    Car(id=8, name="Nissan Qashqai", price_value=70.0, price_currency="EUR", fuel="Diesel", transmission="Automatic", category="SUV", cover_image_url="https://example.com/nissan.jpg"),
    Car(id=9, name="Hyundai Tucson", price_value=60.0, price_currency="EUR", fuel="Petrol", transmission="Automatic", category="SUV", cover_image_url="https://example.com/hyundai.jpg"),
    Car(id=10, name="Kia Sportage", price_value=58.0, price_currency="EUR", fuel="Diesel", transmission="Manual", category="SUV", cover_image_url="https://example.com/kia.jpg"),
    Car(id=11, name="Mazda CX-5", price_value=75.0, price_currency="EUR", fuel="Petrol", transmission="Automatic", category="SUV", cover_image_url="https://example.com/mazda.jpg"),
    Car(id=12, name="Subaru Outback", price_value=85.0, price_currency="EUR", fuel="Petrol", transmission="Automatic", category="SUV", cover_image_url="https://example.com/subaru.jpg"),
    Car(id=13, name="Lexus RX", price_value=150.0, price_currency="EUR", fuel="Petrol", transmission="Automatic", category="SUV", cover_image_url="https://example.com/lexus.jpg"),
    Car(id=14, name="Infiniti Q50", price_value=110.0, price_currency="EUR", fuel="Petrol", transmission="Automatic", category="Sedan", cover_image_url="https://example.com/infiniti.jpg"),
    Car(id=15, name="Acura TLX", price_value=100.0, price_currency="EUR", fuel="Petrol", transmission="Automatic", category="Sedan", cover_image_url="https://example.com/acura.jpg"),
    Car(id=16, name="Genesis G90", price_value=200.0, price_currency="EUR", fuel="Petrol", transmission="Automatic", category="Sedan", cover_image_url="https://example.com/genesis.jpg"),
    Car(id=17, name="Cadillac Escalade", price_value=300.0, price_currency="EUR", fuel="Petrol", transmission="Automatic", category="SUV", cover_image_url="https://example.com/cadillac.jpg"),
    Car(id=18, name="Lincoln Navigator", price_value=280.0, price_currency="EUR", fuel="Petrol", transmission="Automatic", category="SUV", cover_image_url="https://example.com/lincoln.jpg"),
    Car(id=19, name="Jaguar F-PACE", price_value=180.0, price_currency="EUR", fuel="Petrol", transmission="Automatic", category="SUV", cover_image_url="https://example.com/jaguar.jpg"),
    Car(id=20, name="Porsche Macan", price_value=250.0, price_currency="EUR", fuel="Petrol", transmission="Automatic", category="SUV", cover_image_url="https://example.com/porsche.jpg"),
    Car(id=21, name="Range Rover", price_value=400.0, price_currency="EUR", fuel="Diesel", transmission="Automatic", category="SUV", cover_image_url="https://example.com/range.jpg"),
    Car(id=22, name="Bentley Bentayga", price_value=500.0, price_currency="EUR", fuel="Petrol", transmission="Automatic", category="SUV", cover_image_url="https://example.com/bentley.jpg"),
    Car(id=23, name="Rolls-Royce Cullinan", price_value=800.0, price_currency="EUR", fuel="Petrol", transmission="Automatic", category="SUV", cover_image_url="https://example.com/rolls.jpg"),
    Car(id=24, name="Lamborghini Urus", price_value=600.0, price_currency="EUR", fuel="Petrol", transmission="Automatic", category="SUV", cover_image_url="https://example.com/lambo.jpg"),
    Car(id=25, name="Ferrari Purosangue", price_value=700.0, price_currency="EUR", fuel="Petrol", transmission="Automatic", category="SUV", cover_image_url="https://example.com/ferrari.jpg"),
    Car(id=26, name="Maserati Levante", price_value=350.0, price_currency="EUR", fuel="Petrol", transmission="Automatic", category="SUV", cover_image_url="https://example.com/maserati.jpg"),
    Car(id=27, name="Alfa Romeo Stelvio", price_value=160.0, price_currency="EUR", fuel="Petrol", transmission="Automatic", category="SUV", cover_image_url="https://example.com/alfa.jpg"),
    Car(id=28, name="Volvo XC90", price_value=140.0, price_currency="EUR", fuel="Diesel", transmission="Automatic", category="SUV", cover_image_url="https://example.com/volvo.jpg"),
    Car(id=29, name="Saab 9-3", price_value=80.0, price_currency="EUR", fuel="Petrol", transmission="Manual", category="Sedan", cover_image_url="https://example.com/saab.jpg"),
    Car(id=30, name="Opel Insignia", price_value=70.0, price_currency="EUR", fuel="Diesel", transmission="Automatic", category="Sedan", cover_image_url="https://example.com/opel.jpg"),
    Car(id=31, name="Peugeot 508", price_value=75.0, price_currency="EUR", fuel="Petrol", transmission="Automatic", category="Sedan", cover_image_url="https://example.com/peugeot.jpg"),
    Car(id=32, name="Renault Talisman", price_value=68.0, price_currency="EUR", fuel="Diesel", transmission="Manual", category="Sedan", cover_image_url="https://example.com/renault.jpg"),
]

@app.get("/cars", response_model=CarsResponse)
async def get_cars(
    page: int = 1,
    limit: int = 20,
    sort: str = "most_viewed",
    direction: str = "desc",
    max_price: Optional[float] = None,
    category: Optional[List[str]] = None
):
    print(f"API called with: page={page}, limit={limit}, sort={sort}, direction={direction}, max_price={max_price}, category={category}")
    
    # Filter cars by price if max_price is provided
    filtered_cars = mock_cars
    if max_price is not None:
        filtered_cars = [car for car in mock_cars if car.price_value <= max_price]
        print(f"After price filter: {len(filtered_cars)} cars")
    
    # Filter cars by category if category is provided
    if category is not None and len(category) > 0:
        print(f"Filtering by categories: {category}")
        filtered_cars = [car for car in filtered_cars if car.category in category]
        print(f"After category filter: {len(filtered_cars)} cars")
    
    # Sort cars
    if sort == "most_viewed":
        filtered_cars.sort(key=lambda x: x.id, reverse=(direction == "desc"))
    elif sort == "price":
        filtered_cars.sort(key=lambda x: x.price_value, reverse=(direction == "desc"))
    elif sort == "name":
        filtered_cars.sort(key=lambda x: x.name, reverse=(direction == "desc"))
    
    # Pagination
    total = len(filtered_cars)
    pages = (total + limit - 1) // limit
    start = (page - 1) * limit
    end = start + limit
    paginated_cars = filtered_cars[start:end]
    
    return CarsResponse(
        cars=paginated_cars,
        pagination=Pagination(
            page=page,
            limit=limit,
            total=total,
            pages=pages
        ),
        sort_info=SortInfo(
            sort=sort,
            direction=direction
        )
    )

@app.get("/")
async def root():
    return {"message": "Test API Server is running!"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
