# Инструкции по перезапуску API сервера

## Проблема
API сервер не поддерживает параметр `sort_direction`, поэтому сортировка не работает.

## Решение
Нужно перезапустить API сервер с обновленным кодом.

## Шаги:

### 1. Остановите текущий API сервер
- Найдите окно терминала, где запущен API сервер
- Нажмите `Ctrl+C` для остановки

### 2. Запустите API сервер заново
```bash
cd api
python main.py
```

Или если используете uvicorn:
```bash
cd api
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Проверьте, что сервер запустился
Должно появиться сообщение:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 4. Проверьте API в браузере
Откройте: `http://localhost:8000/cars?page=1&limit=15&sort_direction=desc`

Должен вернуться JSON с полем `sort_info`:
```json
{
  "cars": [...],
  "pagination": {...},
  "sort_info": {
    "direction": "desc",
    "sorted_by": "id"
  }
}
```

### 5. Проверьте сортировку
Попробуйте разные направления:
- `http://localhost:8000/cars?sort_direction=desc` - по убыванию ID
- `http://localhost:8000/cars?sort_direction=asc` - по возрастанию ID

Должны вернуться разные порядки автомобилей.

## Что изменилось в API:

### 1. Добавлен параметр `sort_direction`
```python
def get_cars(page: int = 1, limit: int = 6, sort_direction: str = "desc", db: Session = Depends(get_db)):
```

### 2. Добавлена сортировка по ID
```python
if sort_direction == "asc":
    cars = db.query(Car).order_by(Car.id.asc()).all()
else:
    cars = db.query(Car).order_by(Car.id.desc()).all()
```

### 3. Добавлена информация о сортировке в ответ
```python
"sort_info": {
    "direction": sort_direction,
    "sorted_by": "id"
}
```

## Проверка работы:

### 1. Откройте страницу `dist/index.html`

### 2. Нажмите на кнопку сортировки

### 3. В консоли должны появиться сообщения:
```
Loading cars data, page 1, sort direction: asc...
Получены данные машин: {cars: Array(15), pagination: {...}, sort_info: {...}}
Информация о сортировке от API: {direction: "asc", sorted_by: "id"}
```

### 4. На странице должно произойти:
- Кнопка изменит цвет
- Появится спиннер загрузки
- Счетчик покажет стрелку направления
- Появится уведомление об обновлении
- **Порядок автомобилей должен измениться!**

## Если не работает:

### 1. Проверьте, что API сервер запущен:
```bash
curl http://localhost:8000/
```

### 2. Проверьте, что API поддерживает сортировку:
```bash
curl "http://localhost:8000/cars?sort_direction=asc"
curl "http://localhost:8000/cars?sort_direction=desc"
```

### 3. Проверьте консоль браузера на ошибки

### 4. Убедитесь, что в ответе API есть поле `sort_info`

## Ожидаемый результат:

После перезапуска API сервера:
1. ✅ Кнопка сортировки будет менять цвет
2. ✅ Появится индикатор загрузки
3. ✅ **Порядок автомобилей будет реально меняться**
4. ✅ В консоли будет информация о сортировке от API
5. ✅ Появится уведомление об обновлении данных
