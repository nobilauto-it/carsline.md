#!/usr/bin/env python3
"""
Простой скрипт для запуска Carento Cars API
"""

import uvicorn
from main import app

if __name__ == "__main__":
    print("Запуск Carento Cars API...")
    print("API будет доступен по адресу: http://localhost:8000")
    print("Документация API: http://localhost:8000/docs")
    print("Для остановки нажмите Ctrl+C")
    print("-" * 50)
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        reload=True,  # Автоматическая перезагрузка при изменении кода
        log_level="info"
    )
