from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time
import json

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

# Mock data for fast testing
MOCK_CARS = [
    {
        "id": i,
        "created_date": "2025-01-01T00:00:00",
        "img_url": f"https://via.placeholder.com/300x200?text=Car+{i}",
        "marca_name": f"Brand {i}",
        "model_name": f"Model {i}",
        "fuel": "Gasoline",
        "transmission": "Automatic",
        "category": "Sedan",
        "price_value": 25000.0 + i * 1000,
        "price_currency": "USD",
        "cover_image_url": f"https://via.placeholder.com/300x200?text=Car+{i}"
    }
    for i in range(1, 101)  # 100 mock cars
]

@app.get("/")
async def root():
    return {"message": "Fast Carento Cars API", "version": "2.0.0"}

@app.get("/cars")
def get_cars(page: int = 1, limit: int = 6, sort: str = "most_viewed", direction: str = "desc"):
    start_time = time.time()
    print(f"🚀 FAST API запрос: page={page}, limit={limit}, sort={sort}, direction={direction}")
    
    # Получаем общее количество машин
    total_cars = len(MOCK_CARS)
    print(f"📊 Найдено машин: {total_cars}")
    
    # Если машин 6 или меньше, показываем все на одной странице
    if total_cars <= 6:
        cars = MOCK_CARS.copy()
        if direction == "asc":
            cars.sort(key=lambda x: x["id"])
        else:
            cars.sort(key=lambda x: x["id"], reverse=True)
        
        response_time = time.time() - start_time
        print(f"⚡ Время ответа: {response_time:.3f}с")
        
        return {
            "cars": cars,
            "pagination": {
                "current_page": 1,
                "total_pages": 1,
                "total_cars": total_cars,
                "limit": total_cars,
                "has_next": False,
                "has_prev": False
            },
            "sort_info": {
                "direction": direction,
                "sorted_by": sort
            }
        }
    
    # Если машин больше 6, используем пагинацию
    skip = (page - 1) * limit
    
    # Применяем сортировку
    sorted_cars = MOCK_CARS.copy()
    if direction == "asc":
        sorted_cars.sort(key=lambda x: x["id"])
    else:
        sorted_cars.sort(key=lambda x: x["id"], reverse=True)
    
    # Применяем пагинацию
    cars = sorted_cars[skip:skip + limit]
    
    # Вычисляем информацию о пагинации
    total_pages = (total_cars + limit - 1) // limit
    
    response_time = time.time() - start_time
    print(f"⚡ Время ответа: {response_time:.3f}с")
    
    return {
        "cars": cars,
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

@app.get("/cars/{car_id}")
def get_car_by_id(car_id: int):
    start_time = time.time()
    print(f"🚀 FAST API запрос автомобиля: {car_id}")
    
    car = next((car for car in MOCK_CARS if car["id"] == car_id), None)
    if car is None:
        return {"error": "Car not found"}
    
    response_time = time.time() - start_time
    print(f"⚡ Время ответа: {response_time:.3f}с")
    
    return car

if __name__ == "__main__":
    import uvicorn
    print("🚀 Запуск быстрого API сервера...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
