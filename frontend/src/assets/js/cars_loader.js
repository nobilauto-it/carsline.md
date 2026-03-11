// Cars Loader - загружает данные машин из API и отображает их
class CarsLoader {
    constructor() {
        this.apiUrl = 'http://localhost:8000/cars';
        this.carsContainer = null;
        this.currentPage = 1;
        this.totalPages = 1;
        this.init();
    }

    async init() {
        // Ждем загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.loadCars());
        } else {
            this.loadCars();
        }
    }

    async loadCars(page = 1) {
        try {
            console.log(`Loading cars data, page ${page}...`);
            const response = await fetch(`${this.apiUrl}?page=${page}&limit=15`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Получены данные машин:', data);
            
            this.currentPage = data.pagination.current_page;
            this.totalPages = data.pagination.total_pages;
            
            this.renderCars(data.cars);
            this.updatePagination(data.pagination);
        } catch (error) {
            console.error('Ошибка при загрузке данных машин:', error);
            this.showError('Не удалось загрузить данные машин. Проверьте, что API сервер запущен на http://localhost:8000');
        }
    }

    renderCars(cars) {
        // Находим контейнер с машинами
        const carsGrid = document.querySelector('.box-grid-tours .row');
        
        if (!carsGrid) {
            console.error('Контейнер для машин не найден');
            return;
        }

        // Проверяем, что cars является массивом
        if (!Array.isArray(cars)) {
            console.error('Данные машин не являются массивом:', cars);
            this.showError('Неверный формат данных машин');
            return;
        }

        // Очищаем существующие карточки
        carsGrid.innerHTML = '';

        // Отображаем каждую машину
        cars.forEach(car => {
            const carCard = this.createCarCard(car);
            carsGrid.appendChild(carCard);
        });

        // Обновляем счетчик найденных машин
        this.updateCarsCount(cars.length);
    }

    createCarCard(car) {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6';

        // Получаем данные из API, используя только доступные поля
        const carName = this.getCarName(car);
        const carImage = this.getCarImage(car);
        const carPrice = this.getCarPrice(car);
        const carFuel = car.fuel || 'N/A';
        const carTransmission = car.transmission || 'N/A';
        const carCategory = car.category || 'N/A';

        col.innerHTML = `
            <div class="card-journey-small background-card hover-up">
                <div class="card-image" style="height: 200px; overflow: hidden;">
                    <a href="cars-details-1.html">
                        <img src="${carImage}" alt="${carName}" style="width: 100%; height: 100%; object-fit: cover;" />
                    </a>
                </div>
                <div class="card-info p-4 pt-30">
                    <div class="card-rating">
                        <div class="card-left"></div>
                        <div class="card-right">
                            <span class="rating text-xs-medium rounded-pill">4.96 <span class="text-xs-medium neutral-500">(672 reviews)</span></span>
                        </div>
                    </div>
                    <div class="card-title">
                        <a class="text-lg-bold neutral-1000 text-nowrap" href="cars-details-1.html">${carName}</a>
                    </div>
                    <div class="card-program">
                        <div class="card-location">
                            <p class="text-location text-sm-medium neutral-500">New South Wales, Australia</p>
                        </div>
                        <div class="card-facitlities">
                            ${this.renderCarFacilities(car)}
                        </div>
                        <div class="endtime">
                            <div class="card-price">
                                <h6 class="text-lg-bold neutral-1000">${carPrice}</h6>
                                <p class="text-md-medium neutral-500">/ day</p>
                            </div>
                            <div class="card-button">
                                <a class="btn btn-gray" href="cars-details-1.html">Book Now</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return col;
    }

    getCarName(car) {
        // Формируем название машины из марки и модели (НЕ из категории)
        let name = '';
        if (car.marca_name) {
            name += car.marca_name;
        }
        if (car.model_name) {
            name += (name ? ' ' : '') + car.model_name;
        }
        // НЕ добавляем category в название - она должна быть отдельно
        return name || 'Unknown Car';
    }

    getCarImage(car) {
        // Используем cover_image_url если есть, иначе обычное изображение
        if (car.cover_image_url) {
            return car.cover_image_url;
        }
        if (car.img_url) {
            return car.img_url;
        }
        // Fallback изображение
        return 'assets/imgs/cars-listing/cars-listing-6/car-1.png';
    }

    getCarPrice(car) {
        if (car.price_value) {
            const currency = car.price_currency || 'EUR';
            const value = parseFloat(car.price_value);
            return `${currency} ${value.toFixed(2)}`;
        }
        return 'EUR 0.00';
    }

    renderCarFacilities(car) {
        const facilities = [];
        
        // Добавляем только те поля, которые есть в базе данных
        if (car.fuel) {
            facilities.push(`<p class="card-fuel text-md-medium">${car.fuel}</p>`);
        }
        
        if (car.transmission) {
            facilities.push(`<p class="card-gear text-md-medium">${car.transmission}</p>`);
        }
        
        if (car.category) {
            facilities.push(`<p class="card-category-type text-md-medium">${car.category}</p>`);
        }

        // Если нет доступных данных, показываем заглушку
        if (facilities.length === 0) {
            facilities.push('<p class="card-info text-md-medium">No additional info</p>');
        }

        // Возвращаем характеристики как простые параграфы, как в оригинале
        return facilities.join('');
    }

    updateCarsCount(count) {
        const countElement = document.querySelector('.number-found');
        if (countElement) {
            countElement.textContent = `${count} items found`;
        }
    }

    updatePagination(pagination) {
        // Обновляем счетчик найденных машин
        this.updateCarsCount(pagination.total_cars);
        
        // Не показываем пагинацию, если машин 15 или меньше
        if (pagination.total_cars <= 15) {
            const paginationContainer = document.querySelector('.pagination');
            if (paginationContainer) {
                paginationContainer.innerHTML = '';
            }
            return;
        }
        
        // Обновляем пагинацию
        const paginationContainer = document.querySelector('.pagination');
        if (paginationContainer) {
            let paginationHTML = '';
            
            // Кнопка "Previous"
            if (pagination.has_prev) {
                paginationHTML += `
                    <li class="page-item">
                        <a class="page-link" href="#" onclick="carsLoader.loadCars(${pagination.current_page - 1}); return false;" aria-label="Previous">
                            <span aria-hidden="true">
                                <svg width="12" height="12" viewbox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6.00016 1.33325L1.3335 5.99992M1.3335 5.99992L6.00016 10.6666M1.3335 5.99992H10.6668" stroke="" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </span>
                        </a>
                    </li>
                `;
            } else {
                paginationHTML += `
                    <li class="page-item disabled">
                        <a class="page-link" href="#" aria-label="Previous">
                            <span aria-hidden="true">
                                <svg width="12" height="12" viewbox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6.00016 1.33325L1.3335 5.99992M1.3335 5.99992L6.00016 10.6666M1.3335 5.99992H10.6668" stroke="" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </span>
                        </a>
                    </li>
                `;
            }
            
            // Номера страниц
            for (let i = 1; i <= pagination.total_pages; i++) {
                if (i === pagination.current_page) {
                    paginationHTML += `<li class="page-item"><a class="page-link active" href="#">${i}</a></li>`;
                } else {
                    paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="carsLoader.loadCars(${i}); return false;">${i}</a></li>`;
                }
            }
            
            // Кнопка "Next"
            if (pagination.has_next) {
                paginationHTML += `
                    <li class="page-item">
                        <a class="page-link" href="#" onclick="carsLoader.loadCars(${pagination.current_page + 1}); return false;" aria-label="Next">
                            <span aria-hidden="true">
                                <svg width="12" height="12" viewbox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.99967 10.6666L10.6663 5.99992L5.99968 1.33325M10.6663 5.99992L1.33301 5.99992" stroke="" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </span>
                        </a>
                    </li>
                `;
            } else {
                paginationHTML += `
                    <li class="page-item disabled">
                        <a class="page-link" href="#" aria-label="Next">
                            <span aria-hidden="true">
                                <svg width="12" height="12" viewbox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.99967 10.6666L10.6663 5.99992L5.99968 1.33325M10.6663 5.99992L1.33301 5.99992" stroke="" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </span>
                        </a>
                    </li>
                `;
            }
            
            paginationContainer.innerHTML = paginationHTML;
        }
    }

    showError(message) {
        const carsGrid = document.querySelector('.box-grid-tours .row');
        if (carsGrid) {
            carsGrid.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-warning text-center">
                        <h5>Ошибка загрузки данных</h5>
                        <p>${message}</p>
                        <button class="btn btn-primary" onclick="location.reload()">Попробовать снова</button>
                    </div>
                </div>
            `;
        }
    }
}

// Инициализируем загрузчик машин
const carsLoader = new CarsLoader();

// Делаем объект глобальным для доступа из onclick
window.carsLoader = carsLoader;
