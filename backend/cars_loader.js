// Cars Loader - загружает данные машин из API и отображает их
class CarsLoader {
    constructor() {
        // Относительный URL к API, чтобы работать и на домене, и локально
        this.apiUrl = '/cars';

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
            const limit = 6; // держим в синхроне с бэкендом
            const response = await fetch(`${this.apiUrl}?page=${page}&limit=${limit}`);

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
            this.showError('Не удалось загрузить данные машин. Убедитесь, что API доступен.');
        }
    }

    renderCars(cars) {
        // Находим контейнер с машинами
        const carsGrid = document.querySelector('.box-grid-tours .row') || document.getElementById('cars-grid');

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

        // Обновляем счетчик найденных машин (именно общее количество)
        this.updateCarsCount(typeof cars.length === 'number' ? cars.length : 0);
    }

    createCarCard(car) {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6';
        col.style.height = 'auto';
        col.style.display = 'flex';
        col.style.flexDirection = 'column';

        // Получаем данные из API, используя только доступные поля
        const carName = this.getCarName(car);
        const carImage = this.getCarImage(car);
        const carPrice = this.getCarPrice(car);

        col.innerHTML = `
            <div class="card-journey-small background-card hover-up" style="height: auto; display: flex; flex-direction: column;">
                <style>
                    .card-category { height: auto !important; min-height: auto !important; }
                    .card-fuel { height: auto !important; min-height: auto !important; }
                    .card-gear { height: auto !important; min-height: auto !important; }
                    .btn-gray { white-space: nowrap !important; padding: 0.375rem 0.75rem !important; }
                    .card-location { border: none !important; border-bottom: none !important; margin: 0 !important; }
                    .card-location::after { display: none !important; }
                    .card-location::before { display: none !important; }
                    .card-location * { border: none !important; margin: 0 !important; }
                    .text-location { border: none !important; border-bottom: none !important; margin: 0 !important; }
                    .card-facitlities { margin: 0 !important; }
                    .card-facitlities * { margin: 0 !important; }
                    .card-image img { width: 100% !important; height: 200px !important; object-fit: cover !important; }
                </style>
                <div class="card-image">
                    <a href="cars-details-1.html">
                        <img src="${carImage}" alt="${this.escapeHtml(carName)}" />
                    </a>
                </div>
                <div class="card-info p-3" style="padding-top: 0.75rem !important; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                    <div class="card-rating">
                        <div class="card-left"></div>
                        <div class="card-right">
                            <span class="rating text-xs-medium rounded-pill">4.96 <span class="text-xs-medium neutral-500">(672 reviews)</span></span>
                        </div>
                    </div>
                    <div class="card-title">
                        <a class="text-lg-bold neutral-1000 text-nowrap" href="cars-details-1.html">${this.escapeHtml(carName)}</a>
                    </div>
                    <div class="card-program" style="margin-top: 0; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <div class="card-location" style="margin-bottom: 0.25rem;">
                                <p class="text-location text-sm-medium neutral-500">New South Wales, Australia</p>
                            </div>
                            <div class="card-facitlities" style="margin-bottom: 0.25rem;">
                                ${this.renderCarFacilities(car)}
                            </div>
                        </div>
                        <div class="endtime" style="margin-top: 0.25rem;">
                            <div class="card-price">
                                <h6 class="text-lg-bold neutral-1000">${carPrice}</h6>
                                <p class="text-md-medium neutral-500">/ day</p>
                            </div>
                            <div class="card-button">
                                <a class="btn btn-gray" href="cars-details-1.html" style="white-space: nowrap;">Book Now</a>
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
        if (car.marca_name) name += car.marca_name;
        if (car.model_name) name += (name ? ' ' : '') + car.model_name;
        return name || 'Unknown Car';
    }

    getCarImage(car) {
        // Используем cover_image_url если есть, иначе обычное изображение
        if (car.cover_image_url) return car.cover_image_url;
        if (car.img_url) return car.img_url;
        // Fallback изображение (если есть публичный ассет — подставь абсолютный путь)
        return '';
    }

    getCarPrice(car) {
        if (car.price_value != null) {
            const currency = car.price_currency || 'EUR';
            const value = parseFloat(car.price_value);
            return `${currency} ${isFinite(value) ? value.toFixed(2) : '0.00'}`;
        }
        return 'EUR 0.00';
    }

    renderCarFacilities(car) {
        const facilities = [];

        if (car.fuel) {
            facilities.push(`<p class="card-fuel text-md-medium" style="margin: 0;">${this.escapeHtml(car.fuel)}</p>`);
        }

        if (car.transmission) {
            facilities.push(`<p class="card-gear text-md-medium" style="margin: 0;">${this.escapeHtml(car.transmission)}</p>`);
        }

        if (car.category) {
            facilities.push(`<p class="card-category text-md-medium" style="margin: 0;">${this.escapeHtml(car.category)}</p>`);
        }

        if (facilities.length === 0) {
            facilities.push('<p class="card-info text-md-medium" style="margin: 0;">No additional info</p>');
        }

        return `<div class="row g-0">${facilities.map(f => `<div class="col-6">${f}</div>`).join('')}</div>`;
    }

    updateCarsCount(currentPageCount) {
        // Если есть глобальный индикатор общего числа — пробуем его обновить данными пагинации позже
        const countElement = document.querySelector('.number-found') || document.getElementById('number-found');
        if (countElement) {
            // Показываем сколько карточек на текущей странице (быстрая обратная связь)
            countElement.textContent = `${currentPageCount} items found`;
        }
    }

    updatePagination(pagination) {
        // Если есть глобальный индикатор общего числа — показываем именно total_cars
        const countElement = document.querySelector('.number-found') || document.getElementById('number-found');
        if (countElement && typeof pagination.total_cars === 'number') {
            countElement.textContent = `${pagination.total_cars} items found`;
        }

        const paginationContainer = document.querySelector('.pagination');
        if (!paginationContainer) return;

        // Не показываем пагинацию, если всего записей не больше, чем лимит на страницу
        if (pagination.total_cars <= pagination.limit) {
            paginationContainer.innerHTML = '';
            return;
        }

        let html = '';

        // Кнопка "Previous"
        if (pagination.has_prev) {
            html += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="carsLoader.loadCars(${pagination.current_page - 1}); return false;" aria-label="Previous">
                        <span aria-hidden="true">&laquo; Prev</span>
                    </a>
                </li>
            `;
        } else {
            html += `
                <li class="page-item disabled">
                    <span class="page-link" aria-label="Previous">&laquo; Prev</span>
                </li>
            `;
        }

        // Номера страниц
        for (let i = 1; i <= pagination.total_pages; i++) {
            if (i === pagination.current_page) {
                html += `<li class="page-item"><a class="page-link active" href="#">${i}</a></li>`;
            } else {
                html += `<li class="page-item"><a class="page-link" href="#" onclick="carsLoader.loadCars(${i}); return false;">${i}</a></li>`;
            }
        }

        // Кнопка "Next"
        if (pagination.has_next) {
            html += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="carsLoader.loadCars(${pagination.current_page + 1}); return false;" aria-label="Next">
                        <span aria-hidden="true">Next &raquo;</span>
                    </a>
                </li>
            `;
        } else {
            html += `
                <li class="page-item disabled">
                    <span class="page-link" aria-label="Next">Next &raquo;</span>
                </li>
            `;
        }

        paginationContainer.innerHTML = html;
    }

    showError(message) {
        const carsGrid = document.querySelector('.box-grid-tours .row') || document.getElementById('cars-grid');
        if (carsGrid) {
            carsGrid.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-warning text-center">
                        <h5>Ошибка загрузки данных</h5>
                        <p>${this.escapeHtml(message)}</p>
                        <button class="btn btn-primary" onclick="location.reload()">Попробовать снова</button>
                    </div>
                </div>
            `;
        }
    }

    escapeHtml(s) {
        if (s == null) return '';
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}

// Инициализируем загрузчик машин
const carsLoader = new CarsLoader();
// Делаем объект глобальным для доступа из onclick
window.carsLoader = carsLoader;
