// Cars Loader - загружает данные машин из API и отображает их
class CarsLoader {
    constructor() {
        // ВРЕМЕННО: Флаг для отключения отображения цены (заменить на false когда определимся с ценами)
        this.SHOW_PRICE_TEMPORARY = false; // true = показывать цены, false = показывать "По Договоренности"
        
        const host = window.location.hostname;
        const isProd = host && host.indexOf('new.carsline.md') !== -1;
        // Используем относительные пути для запросов через nginx (решает проблему CORS)
        // nginx проксирует /cars/ на http://127.0.0.1:8000
        const apiBase = '';
        this.apiBase = apiBase;
        this.apiUrl = isProd ? '/cars' : `${apiBase}/cars`;
        this.carsContainer = null;
        this.currentPage = 1;
        this.totalPages = 1;
        this.sortDirection = 'desc'; // Направление сортировки
        this.currentLimit = 15; // Количество элементов на странице (5 рядов по 3 карточки)
        this.originalLimit = 15; // Сохраняем оригинальный лимит
        this.currentSort = 'most_viewed'; // Критерий сортировки
        this.maxPrice = 4000; // Максимальная цена для фильтрации (по умолчанию 4000)
        this.selectedCategories = ['all']; // Выбранные категории для фильтрации (по умолчанию All)
        this.selectedFuels = ['all']; // Выбранные типы топлива для фильтрации (по умолчанию All)
        this.selectedTransmissions = ['all']; // Выбранные типы трансмиссии для фильтрации (по умолчанию All)
        this.selectedMarcas = ['all']; // Выбранные бренды для фильтрации (по умолчанию All)
        this.debounceTimer = null; // Таймер для debounce
        this.init();
        
        // Подписываемся на событие смены языка
        window.addEventListener('localeChanged', () => {
            if (window.Locale) {
                window.Locale.translatePage();
            }
        });
    }

    // ===== Клиентская синхронизация счётчиков через /cars (по всей базе) =====
    getNumberItemByInputId(inputId) {
        const input = document.querySelector(`#${inputId}`);
        return input ? input.closest('li')?.querySelector('.number-item') : null;
    }

    async fetchTotalViaCars(paramName, value) {
        const params = new URLSearchParams({ limit: '1' });
        if (paramName && value) params.append(paramName, value);
        try {
            const res = await fetch(`${this.apiUrl}?${params.toString()}`);
            if (!res.ok) return 0;
            const data = await res.json();
            return (data && data.pagination && typeof data.pagination.total_cars === 'number') ? data.pagination.total_cars : 0;
        } catch (e) { return 0; }
    }

    async fetchGlobalTotalCars() {
        // Всегда общее количество по всей базе, без фильтров
        return this.fetchTotalViaCars(null, null);
    }

    async updateAllCountersGlobal() {
        // Обновляет только "All" для категорий/топлива/трансмиссии ГЛОБАЛЬНЫМ тоталом
        const total = await this.fetchGlobalTotalCars();
        try {
            const catAll = document.querySelector('#category-all');
            if (catAll) {
                const el = catAll.closest('li')?.querySelector('.number-item');
                if (el) el.textContent = String(total);
            }
            const fuelAll = document.querySelector('#fuel-all');
            if (fuelAll) {
                const el = fuelAll.closest('li')?.querySelector('.number-item');
                if (el) el.textContent = String(total);
            }
            const txAll = document.querySelector('#transmission-all');
            if (txAll) {
                const el = txAll.closest('li')?.querySelector('.number-item');
                if (el) el.textContent = String(total);
            }
        } catch (_) { /* no-op */ }
    }

    async syncGroupedCountsViaCars() {
        // Категории
        const categories = [
            { id: 'category-suv', value: 'SUV' },
            { id: 'category-sedan', value: 'Sedan' },
            { id: 'category-cabrio', value: 'Cabrio' },
            { id: 'category-hatchback', value: 'Hatchback' },
            { id: 'category-universal', value: 'Universal' },
            { id: 'category-bus', value: 'Bus | Psg' },
            { id: 'category-mpv', value: 'MPV' },
            { id: 'category-minivan', value: 'Minivan' },
            { id: 'category-coupe', value: 'Coupe' }
        ];
        await Promise.all(categories.map(async c => {
            const total = await this.fetchTotalViaCars('category', c.value);
            const el = this.getNumberItemByInputId(c.id);
            if (el) el.textContent = String(total);
            const li = document.querySelector(`#${c.id}`)?.closest('li');
            if (li) li.style.display = total > 0 ? '' : 'none';
        }));

        // Топливо
        const fuels = [
            { id: 'fuel-benzina95', value: 'Benzina 95' },
            { id: 'fuel-motorina', value: 'Motorina' },
            { id: 'fuel-hybrid', value: 'Hybrid/Benzina' }
        ];
        await Promise.all(fuels.map(async f => {
            const total = await this.fetchTotalViaCars('fuel', f.value);
            const el = this.getNumberItemByInputId(f.id);
            if (el) el.textContent = String(total);
            const li = document.querySelector(`#${f.id}`)?.closest('li');
            if (li) li.style.display = total > 0 ? '' : 'none';
        }));

        // Трансмиссия
        const txs = [
            { id: 'transmission-automatic', value: 'Automatic' },
            { id: 'transmission-manual', value: 'Manual' },
            { id: 'transmission-variator', value: 'Variator' }
        ];
        await Promise.all(txs.map(async t => {
            const total = await this.fetchTotalViaCars('transmission', t.value);
            const el = this.getNumberItemByInputId(t.id);
            if (el) el.textContent = String(total);
            const li = document.querySelector(`#${t.id}`)?.closest('li');
            if (li) li.style.display = total > 0 ? '' : 'none';
        }));
    }

    updatePopularCategoriesFromCounts(counts) {
        // Обновляет популярные категории из тех же данных что и фильтры
        const popularSection = document.querySelector('.box-list-populars');
        if (!popularSection) {
            return;
        }
        
        const cards = popularSection.querySelectorAll('.card-popular');
        Array.from(cards).forEach((card) => {
            // Используем data-category атрибут для точного сопоставления
            const categoryName = card.getAttribute('data-category');
            if (!categoryName) {
                // Fallback: получаем из текста (для обратной совместимости)
                const categoryLink = card.querySelector('.card-info .card-title');
                if (!categoryLink) return;
                const categoryNameFromText = categoryLink.textContent.trim();
                if (!categoryNameFromText) return;
                // Используем название из текста
                const count = counts[categoryNameFromText] || 0;
                this.updateCardCount(card, count);
                return;
            }
            
            // Получаем количество из тех же данных что и фильтры
            const count = counts[categoryName] || 0;
            this.updateCardCount(card, count);
        });
    }
    
    updateCardCount(card, count) {
        // Исправленный селектор: ищем span вместо a
        const metaLinks = card.querySelector('.card-meta .meta-links span');
        if (!metaLinks) return;
        
        const vehicleText = count === 1 ? 'Vehicul' : 'Vehicule';
        metaLinks.textContent = `${count} ${vehicleText}`;
        
        // Скрываем карточку если count = 0 (как в фильтрах)
        const cardWrapper = card.closest('.col-lg-3');
        if (cardWrapper) {
            cardWrapper.style.display = count > 0 ? '' : 'none';
        }
    }

    async updatePopularCategoriesCounts() {
        // Устаревший метод - теперь используем updatePopularCategoriesFromCounts()
        // Оставляем для обратной совместимости, но вызываем через loadCategoryCounts()
        try {
            const response = await fetch(`${this.apiBase}/cars/categories`);
            if (!response.ok) {
                return;
            }
            const counts = await response.json();
            this.updatePopularCategoriesFromCounts(counts);
        } catch (error) {
            // console.warn('Error updating popular categories counts:', error);
        }
    }

    async init() {
        this.maxPrice = 4000;
        const onReady = async () => {
            // Параллельная загрузка API запросов для ускорения (Promise.all вместо последовательных вызовов)
            await Promise.all([
                this.loadCars(),
                this.loadCategoryCounts(),
                this.loadFuelCounts(),
                this.loadTransmissionCounts()
            ]);
            
            // Обновление популярных категорий происходит автоматически через loadCategoryCounts() -> updatePopularCategoriesFromCounts()
            this.initEventHandlers();
            // Всегда после первичной инициализации выставляем глобальные "All"
            this.updateAllCountersGlobal();
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', onReady);
        } else {
            onReady();
        }
    }

    async loadCategoryCounts() {
        try {
            // console.log('Loading category counts...');
            const response = await fetch(`${this.apiBase}/cars/categories`);
            if (!response.ok) {
                // console.warn('Category counts request not OK:', response.status);
                return;
            }
            const counts = await response.json();
            // console.log('Category counts received:', counts);
            this.updateCategoryCounts(counts);
            // Обновляем также популярные категории теми же данными
            this.updatePopularCategoriesFromCounts(counts);
        } catch (error) {
            // console.warn('Error loading category counts:', error);
        }
    }

    updateCategoryCounts(counts) {
        // "All" из эндпоинта категорий (как общее по БД), НЕ из фильтров
        const allCategoryInput = document.querySelector('#category-all');
        const allCountElement = allCategoryInput && allCategoryInput.closest
            ? allCategoryInput.closest('li')?.querySelector('.number-item')
            : null;
        if (allCountElement) {
            allCountElement.textContent = Object.prototype.hasOwnProperty.call(counts, 'All') ? counts.All : '0';
        }
        
        const suvInput = document.querySelector('#category-suv');
        if (suvInput && suvInput.parentElement) {
            const suvCountElement = suvInput.parentElement.querySelector('.number-item');
            if (suvCountElement && counts.SUV) suvCountElement.textContent = counts.SUV;
        }

        const sedanInput = document.querySelector('#category-sedan');
        if (sedanInput && sedanInput.parentElement) {
            const sedanCountElement = sedanInput.parentElement.querySelector('.number-item');
            if (sedanCountElement && counts.Sedan) sedanCountElement.textContent = counts.Sedan;
        }

        const cabrioInput = document.querySelector('#category-cabrio');
        if (cabrioInput && cabrioInput.parentElement) {
            const cabrioCountElement = cabrioInput.parentElement.querySelector('.number-item');
            if (cabrioCountElement && counts.Cabrio) cabrioCountElement.textContent = counts.Cabrio;
        }

        const allCategories = [
            { id: 'category-bus', key: 'Bus | Psg', name: 'Bus | Psg' },
            { id: 'category-coupe', key: 'Coupe', name: 'Coupe' },
            { id: 'category-hatchback', key: 'Hatchback', name: 'Hatchback' },
            { id: 'category-minivan', key: 'Minivan', name: 'Minivan' },
            { id: 'category-mpv', key: 'MPV', name: 'MPV' },
            { id: 'category-universal', key: 'Universal', name: 'Universal' }
        ];
        
        allCategories.forEach(category => {
            const categoryInput = document.querySelector(`#${category.id}`);
            if (!categoryInput) return; // Пропускаем, если элемент не найден
            
            const countElement = categoryInput.parentElement?.querySelector('.number-item');
            const listItem = categoryInput.closest('li');
            
            if (!countElement || !listItem) return; // Пропускаем, если элементы не найдены
            
            if (counts[category.key] && counts[category.key] > 0) {
                countElement.textContent = counts[category.key];
                listItem.style.display = '';
            } else {
                countElement.textContent = '0';
                listItem.style.display = 'none';
            }
        });
        
        // console.log('Category counts updated in UI');
    }

    async loadFuelCounts() {
        try {
            // console.log('Loading fuel counts...');
            const response = await fetch(`${this.apiBase}/cars/fuels`);
            if (!response.ok) {
                // console.warn('Fuel counts request not OK:', response.status);
                return;
            }
            const counts = await response.json();
            // console.log('Fuel counts received:', counts);
            this.updateFuelCounts(counts);
        } catch (error) {
            // console.warn('Error loading fuel counts:', error);
        }
    }

    updateFuelCounts(counts) {
        const allCountElement = document.querySelector('#fuel-all').parentElement.querySelector('.number-item');
        if (allCountElement && counts.All) allCountElement.textContent = counts.All;

        const benzina95CountElement = document.querySelector('#fuel-benzina95').parentElement.querySelector('.number-item');
        if (benzina95CountElement && counts['Benzina 95']) benzina95CountElement.textContent = counts['Benzina 95'];

        const motorinaCountElement = document.querySelector('#fuel-motorina').parentElement.querySelector('.number-item');
        if (motorinaCountElement && counts.Motorina) motorinaCountElement.textContent = counts.Motorina;

        const hybridCountElement = document.querySelector('#fuel-hybrid').parentElement.querySelector('.number-item');
        if (hybridCountElement && counts['Hybrid/Benzina']) hybridCountElement.textContent = counts['Hybrid/Benzina'];

        // console.log('Fuel counts updated in UI');
    }

    async loadTransmissionCounts() {
        try {
            // console.log('Loading transmission counts...');
            const response = await fetch(`${this.apiBase}/cars/transmissions`);
            if (!response.ok) {
                // console.warn('Transmission counts request not OK:', response.status);
                return;
            }
            const counts = await response.json();
            // console.log('Transmission counts received:', counts);
            this.updateTransmissionCounts(counts);
        } catch (error) {
            // console.warn('Error loading transmission counts:', error);
        }
    }

    updateTransmissionCounts(counts) {
        const allCountElement = document.querySelector('#transmission-all').parentElement.querySelector('.number-item');
        if (allCountElement && counts.All) allCountElement.textContent = counts.All;

        const automaticCountElement = document.querySelector('#transmission-automatic').parentElement.querySelector('.number-item');
        if (automaticCountElement && counts.Automatic) automaticCountElement.textContent = counts.Automatic;

        const manualCountElement = document.querySelector('#transmission-manual').parentElement.querySelector('.number-item');
        if (manualCountElement && counts.Manual) manualCountElement.textContent = counts.Manual;

        const variatorCountElement = document.querySelector('#transmission-variator').parentElement.querySelector('.number-item');
        if (variatorCountElement && counts.Variator) variatorCountElement.textContent = counts.Variator;

        // console.log('Transmission counts updated in UI');
    }

    async loadCars(page = 1) {
        try {
            // console.log(`Loading cars data, page ${page}, limit: ${this.currentLimit}, sort: ${this.currentSort}, direction: ${this.sortDirection}, maxPrice: ${this.maxPrice}...`);
            const params = new URLSearchParams({
                page: page,
                limit: this.currentLimit,
                sort: this.currentSort,
                direction: this.sortDirection
            });
            if (this.maxPrice !== null && this.maxPrice >= 250 && this.maxPrice <= 4000) {
                params.append('max_price', this.maxPrice);
                // console.log(`✅ Добавлен параметр max_price: ${this.maxPrice}`);
            } else {
                // console.log(`❌ Параметр max_price не добавлен (maxPrice: ${this.maxPrice})`);
            }
            const specificCategories = this.selectedCategories.filter(cat => cat !== 'all');
            if (specificCategories.length > 0) {
                specificCategories.forEach(category => params.append('category', category));
                // console.log(`✅ Добавлены параметры категорий: ${specificCategories.join(', ')}`);
            } else {
                // console.log(`❌ Параметры категорий не добавлены (selectedCategories: ${JSON.stringify(this.selectedCategories)})`);
            }
            const specificFuels = this.selectedFuels.filter(fuel => fuel !== 'all');
            if (specificFuels.length > 0) {
                specificFuels.forEach(fuel => params.append('fuel', fuel));
                // console.log(`✅ Добавлены параметры топлива: ${specificFuels.join(', ')}`);
            } else {
                // console.log(`❌ Параметры топлива не добавлены (selectedFuels: ${JSON.stringify(this.selectedFuels)})`);
            }
            const specificTransmissions = this.selectedTransmissions.filter(transmission => transmission !== 'all');
            if (specificTransmissions.length > 0) {
                specificTransmissions.forEach(transmission => params.append('transmission', transmission));
                // console.log(`✅ Добавлены параметры трансмиссии: ${specificTransmissions.join(', ')}`);
            } else {
                // console.log(`❌ Параметры трансмиссии не добавлены (selectedTransmissions: ${JSON.stringify(this.selectedTransmissions)})`);
            }
            // console.log('Final URLSearchParams:', params.toString());
            const fullUrl = `${this.apiUrl}?${params}`;
            // console.log('Полный URL запроса:', fullUrl);
            const response = await fetch(fullUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            // console.log('Получены данные машин:', data);
            
            // Клиентская фильтрация по брендам (только если выбран бренд, не 'all')
            let filteredCars = data.cars;
            let isBrandFilterActive = false;
            
            // Проверяем, есть ли активный фильтр по брендам
            const hasActiveBrandFilter = Array.isArray(this.selectedMarcas) && 
                                        this.selectedMarcas.length > 0 && 
                                        !this.selectedMarcas.every(m => m === 'all' || (Array.isArray(m) && m.every(b => b === 'all')));
            
            if (hasActiveBrandFilter) {
                // Flatten массив, если selectedMarcas содержит массивы
                const flatMarcas = this.selectedMarcas.flat().filter(marca => marca !== 'all');
                if (flatMarcas.length > 0) {
                    isBrandFilterActive = true;
                    // Приводим выбранные бренды к lowercase для сравнения
                    const selectedMarcasLower = flatMarcas.map(m => m.toLowerCase().trim());
                    filteredCars = data.cars.filter(car => {
                        if (!car.marca_name) {
                            // console.log('Car without marca_name:', car);
                            return false;
                        }
                        // Приводим marca_name к lowercase для сравнения
                        const carMarcaLower = car.marca_name.toLowerCase().trim();
                        // Проверяем точное совпадение или включение
                        const matches = selectedMarcasLower.some(selectedMarca => {
                            // Точное совпадение (предпочтительно)
                            if (carMarcaLower === selectedMarca) return true;
                            // Проверяем, содержит ли marca_name выбранный бренд
                            if (carMarcaLower.includes(selectedMarca)) return true;
                            // Проверяем обратное включение (для случаев типа "mercedes-benz" и "mercedes")
                            if (selectedMarca.includes(carMarcaLower)) return true;
                            return false;
                        });
                        if (!matches && selectedMarcasLower.length > 0) {
                            // console.log(`Car marca "${car.marca_name}" (lowercase: "${carMarcaLower}") не совпадает с выбранными:`, selectedMarcasLower);
                        }
                        return matches;
                    });
                    // console.log(`✅ Применена клиентская фильтрация по брендам: ${flatMarcas.join(', ')}. Было: ${data.cars.length}, Стало: ${filteredCars.length}`);
                    // console.log('Выбранные бренды (lowercase):', selectedMarcasLower);
                    // Показываем примеры marca_name из загруженных данных для отладки
                    if (data.cars.length > 0) {
                        const uniqueMarcas = [...new Set(data.cars.map(c => c.marca_name).filter(Boolean))];
                        // console.log('Уникальные marca_name в данных:', uniqueMarcas);
                    }
                }
            } else {
                // console.log('❌ Фильтр по брендам не активен (selectedMarcas:', this.selectedMarcas, ')');
            }
            
            this.currentPage = data.pagination.current_page;
            this.totalPages = data.pagination.total_pages;
            this.renderCars(filteredCars);
            
            // Если фильтр по брендам активен, обновляем пагинацию с учетом отфильтрованных машин
            if (isBrandFilterActive) {
                const filteredPagination = {
                    ...data.pagination,
                    total_cars: filteredCars.length,
                    has_next: false, // Отключаем пагинацию при клиентской фильтрации
                    has_prev: false
                };
                this.updatePagination(filteredPagination);
            } else {
                // Нормальная пагинация, если фильтр не активен
                this.updatePagination(data.pagination);
            }
            // После любой загрузки тоже синхронизируем глобальные All
            this.updateAllCountersGlobal();
            
            // Прокручиваем страницу вверх к списку машин при смене страницы
            setTimeout(() => {
                const carsSection = document.querySelector('.box-grid-tours');
                if (carsSection) {
                    carsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    // Если контейнер не найден, просто прокручиваем вверх страницы
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }, 100);
        } catch (error) {
            // console.error('Ошибка при загрузке данных машин:', error);
            this.showError('Не удалось загрузить данные машин. Проверьте, что API сервер запущен на http://localhost:8000');
        }
    }

    renderCars(cars) {
        const carsGrid = document.querySelector('.box-grid-tours .row');
        if (!carsGrid) {
            // console.error('Контейнер для машин не найден');
            return;
        }
        if (!Array.isArray(cars)) {
            // console.error('Данные машин не являются массивом:', cars);
            this.showError('Неверный формат данных машин');
            return;
        }
        
        // Скрываем весь контейнер перед очисткой
        carsGrid.style.display = 'none';
        carsGrid.style.visibility = 'hidden';
        carsGrid.style.opacity = '0';
        
        // Скрываем плейсхолдер загрузки
        const loadingSpinner = carsGrid.querySelector('.loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
            loadingSpinner.remove();
        }
        const loadingCol = carsGrid.querySelector('.col-12.text-center');
        if (loadingCol) {
            loadingCol.style.display = 'none';
            loadingCol.remove();
        }
        
        // Очищаем контейнер
        carsGrid.innerHTML = '';
        
        // Рендерим карточки машин
        if (cars.length > 0) {
            cars.forEach(car => {
                const carCard = this.createCarCard(car);
                carsGrid.appendChild(carCard);
            });
            
            // Показываем контейнер после рендеринга
            carsGrid.style.display = 'flex';
            carsGrid.style.visibility = 'visible';
            carsGrid.style.opacity = '1';
            
            // Показываем родительский контейнер .box-grid-tours
            const boxGridTours = carsGrid.closest('.box-grid-tours');
            if (boxGridTours) {
                boxGridTours.style.display = 'block';
                boxGridTours.style.visibility = 'visible';
                boxGridTours.style.opacity = '1';
                boxGridTours.style.height = 'auto';
                boxGridTours.style.minHeight = 'auto';
            }
            
            // Принудительно обновляем отображение
            void carsGrid.offsetHeight;
        } else {
            // Если машин нет, оставляем контейнер скрытым
            carsGrid.style.display = 'none';
            const boxGridTours = carsGrid.closest('.box-grid-tours');
            if (boxGridTours) {
                boxGridTours.style.display = 'none';
            }
        }
        
        this.updateCarsCount(cars.length);
        if (window.Locale) window.Locale.translatePage();
    }

    createCarCard(car) {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6';
        const carName = this.getCarName(car);
        const carImage = this.getCarImage(car);
        const carPrice = this.getCarPrice(car);
        const carFuel = car.fuel || 'N/A';
        const carTransmission = car.transmission || 'N/A';
        const carCategory = car.category || 'N/A';

        col.innerHTML = `
            <div class="card-journey-small background-card hover-up" data-car-id="${car.id}" style="cursor: pointer;">
                <div class="card-image" style="height: 200px; overflow: hidden; position: relative; padding: 0; margin: 0; background-image: url('${carImage}'); background-size: cover; background-position: center; background-repeat: no-repeat;">
                    <a href="cars-details-1.html?id=${car.id}" style="display: block; width: 100%; height: 100%; position: relative; z-index: 1;">
                        <img src="${carImage}" alt="${carName}" style="width: 100%; height: 100%; object-fit: cover; opacity: 1; display: block;" onload="this.style.opacity='1';" onerror="this.style.opacity='0'; this.parentElement.parentElement.style.backgroundImage='url(assets/imgs/cars-listing/cars-listing-6/car-1.png)';" />
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
                        <a class="text-lg-bold neutral-1000 text-nowrap" href="cars-details-1.html?id=${car.id}">${carName}</a>
                    </div>
                    <div class="card-program">
                        <div class="card-location" style="visibility: hidden;">
                            <p class="text-location text-sm-medium neutral-500">New South Wales, Australia</p>
                        </div>
                        <div class="card-facitlities">
                            ${this.renderCarFacilities(car)}
                        </div>
                        <div class="endtime">
                            <div class="card-price">
                                <h6 class="text-lg-bold neutral-1000 price-tooltip" data-tooltip="${window.Locale ? window.Locale.t('price.fromDays') : 'De la 30 de zile'}" data-lang-key-tooltip="price.fromDays" data-car-price="${car.price_value || 0}">${this.SHOW_PRICE_TEMPORARY ? `Lei ${car.price_value ? Math.round(parseFloat(car.price_value)) : 0}<span data-lang-key="price.perDay">${window.Locale ? window.Locale.t('price.perDay') : '/ zi'}</span>` : `<span data-lang-key="price.onRequest">${window.Locale ? window.Locale.t('price.onRequest') : 'La cerere'}</span>`}</h6>
                            </div>
                            <div class="card-button">
                                <a class="btn btn-gray" href="cars-details-1.html?id=${car.id}" data-lang-key="car.book">Rezervă acum</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        const cardElement = col.querySelector('.card-journey-small');
        if (cardElement) {
            cardElement.addEventListener('click', function(e) {
                if (e.target.closest('a')) return;
                const carId = this.getAttribute('data-car-id');
                if (carId) window.location.href = `cars-details-1.html?id=${carId}`;
            });
        }
        
        // Убеждаемся, что карточка видна сразу после создания
        col.style.opacity = '1';
        col.style.visibility = 'visible';
        col.style.display = 'block';
        
        return col;
    }

    getCarName(car) {
        if (car.name) return car.name;
        let name = '';
        if (car.marca_name) name += car.marca_name;
        if (car.model_name) name += (name ? ' ' : '') + car.model_name;
        return name || 'Unknown Car';
    }

    getCarImage(car) {
        if (car.cover_image_url) return car.cover_image_url;
        if (car.img_url) return car.img_url;
        return 'assets/imgs/cars-listing/cars-listing-6/car-1.png';
    }

    getCarPrice(car) {
        // ВРЕМЕННО: Если флаг отключен, возвращаем короткий текст "По запросу" с переводом
        if (!this.SHOW_PRICE_TEMPORARY) {
            return window.Locale ? window.Locale.t('price.onRequest') : 'La cerere';
        }
        // Обычная логика отображения цены
        if (car.price_value) {
            const value = parseFloat(car.price_value);
            return `Lei ${Math.round(value)}`;
        }
        return 'Lei 0';
    }

    getFuelTranslationKey(fuel) {
        // Убрали переводы для топлива - используем хардкод на румынском
        return null;
    }
    
    getTransmissionTranslationKey(transmission) {
        // Убрали переводы для трансмиссии - используем хардкод на румынском
        return null;
    }

    renderCarFacilities(car) {
        const facilities = [];
        if (car.fuel) {
            // Убрали переводы - используем хардкод на румынском (значение из API)
            facilities.push(`<p class="card-fuel text-md-medium">${car.fuel}</p>`);
        }
        if (car.transmission) {
            // Убрали переводы - используем хардкод на румынском (значение из API)
            facilities.push(`<p class="card-gear text-md-medium">${car.transmission}</p>`);
        }
        const seatsCount = car.seats || 5;
        const seatsText = window.Locale ? window.Locale.t('car.seats') : 'locuri';
        facilities.push(`<p class="card-seat text-md-medium"><i class="fas fa-car-seat"></i> ${seatsCount}&nbsp;<span data-lang-key="car.seats">${seatsText}</span></p>`);
        if (car.category) {
            facilities.push(`<p class="card-category-type text-md-medium"><i class="fas fa-car-side"></i> ${car.category}</p>`);
        }
        if (facilities.length === 0) {
            facilities.push('<p class="card-info text-md-medium">No additional info</p>');
        }
        return facilities.join('');
    }

    updateCurrencyInCards() {
        return;
    }

    updateCarsCount(count) {
        const countElement = document.querySelector('.number-found');
        if (countElement) {
            const countNumberElement = countElement.querySelector('.count-number');
            if (countNumberElement) {
                countNumberElement.textContent = count;
            } else {
                const foundText = window.Locale ? window.Locale.t('popular.found') : 'Au fost găsite';
                const vehiclesText = window.Locale ? window.Locale.t('popular.vehicule') : 'de vehicule';
                countElement.innerHTML = `<span data-lang-key="popular.found">${foundText}</span> <span class="count-number">${count}</span> <span data-lang-key="popular.vehicule">${vehiclesText}</span>`;
                if (window.Locale) window.Locale.translatePage();
            }
        }
    }

    updatePagination(pagination) {
        // console.log('updatePagination called with:', pagination);
        // В заголовке найденных показываем число текущей выборки (это не "All")
        this.updateCarsCount(pagination.total_cars);

        // ⛔️ УБРАНО: раньше мы затирали "All" текущим total_cars из пагинации (фильтры)
        // Теперь "All" обновляется только глобально через updateAllCountersGlobal()

        // Синхронизируем детальные счётчики через /cars (по всей базе)
        this.syncGroupedCountsViaCars();

        // console.log('Showing pagination for total_cars:', pagination.total_cars);
        const paginationContainer = document.querySelector('.pagination');
        if (paginationContainer) {
            let paginationHTML = '';
            if (pagination.has_prev) {
                paginationHTML += `
                    <li class="page-item">
                        <a class="page-link" href="#" onclick="carsLoader.loadCars(${pagination.current_page - 1}); return false;" aria-label="Previous">
                            <span aria-hidden="true">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6.00016 1.33325L1.3335 5.99992M1.3335 5.99992L6.00016 10.6666M1.3335 5.99992H10.6668" stroke="#000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"></path>
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
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6.00016 1.33325L1.3335 5.99992M1.3335 5.99992L6.00016 10.6666M1.3335 5.99992H10.6668" stroke="#000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </span>
                        </a>
                    </li>
                `;
            }
            for (let i = 1; i <= pagination.total_pages; i++) {
                if (i === pagination.current_page) {
                    paginationHTML += `<li class="page-item"><a class="page-link active" href="#">${i}</a></li>`;
                } else {
                    paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="carsLoader.loadCars(${i}); return false;">${i}</a></li>`;
                }
            }
            if (pagination.has_next) {
                paginationHTML += `
                    <li class="page-item">
                        <a class="page-link" href="#" onclick="carsLoader.loadCars(${pagination.current_page + 1}); return false;" aria-label="Next">
                            <span aria-hidden="true">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.99967 10.6666L10.6663 5.99992L5.99968 1.33325M10.6663 5.99992L1.33301 5.99992" stroke="#000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"></path>
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
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.99967 10.6666L10.6663 5.99992L5.99968 1.33325M10.6663 5.99992L1.33301 5.99992" stroke="#000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </span>
                        </a>
                    </li>
                `;
            }
            paginationContainer.innerHTML = paginationHTML;
        }
    }

    initEventHandlers() {
        const sortButton = document.querySelector('.btn-sort');
        if (sortButton) {
            sortButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSortDirection();
            });
            // console.log('Кнопка сортировки инициализирована');
        }

        const showDropdown = document.querySelector('#dropdownSort2');
        if (showDropdown) {
            const showItems = showDropdown.parentElement.querySelectorAll('.dropdown-item');
            showItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const limit = parseInt(item.textContent.trim());
                    this.setLimit(limit);
                    this.updateDropdownText(showDropdown, limit);
                    this.setActiveItem(item);
                });
            });
        }

        const sortDropdown = document.querySelector('#dropdownSort');
        if (sortDropdown) {
            const sortItems = sortDropdown.parentElement.querySelectorAll('.dropdown-item');
            sortItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const sortText = item.textContent.trim();
                    const sortValue = this.getSortValue(sortText);
                    this.setSort(sortValue);
                    this.updateDropdownText(sortDropdown, sortText);
                    this.setActiveItem(item);
                });
            });
        }

        this.initPriceSlider();
        
        const applyBtn = document.querySelector('#applyFiltersBtn');
        // console.log('Apply button found:', applyBtn);
        if (applyBtn) {
            applyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // console.log('Apply button clicked!');
                this.applyFilters();
            });
            // console.log('Apply button event listener added');
        } else {
            // console.log('Apply button not found!');
        }
        
        const clearBtn = document.querySelector('#clearFiltersBtn');
        // console.log('Clear button found:', clearBtn);
        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // console.log('Clear button clicked!');
                this.clearFilters();
            });
            // console.log('Clear button event listener added');
        } else {
            // console.log('Clear button not found!');
        }
        
        this.initCategoryFilters();
        this.initFuelFilters();
        this.initTransmissionFilters();
        this.initBrandFilters();
    }
    
    initBrandFilters() {
        // Используем делегирование событий на родительском контейнере карусели
        // Это гарантирует, что обработчик будет работать даже если элементы пересоздаются
        const carouselContainer = document.querySelector('.carouselTicker.carouselTicker-left.box-list-brand-car');
        if (!carouselContainer) {
            // console.warn('Carousel container not found for brand filters');
            return;
        }
        
        // Удаляем старый обработчик, если он есть (чтобы избежать дублирования)
        if (this.brandFilterHandler) {
            carouselContainer.removeEventListener('click', this.brandFilterHandler, true);
        }
        
        // Создаем обработчик с привязкой к контексту
        this.brandFilterHandler = (e) => {
            // Проверяем, что клик был по элементу с классом item-brand
            const link = e.target.closest('.item-brand[data-brand]');
            if (!link) return;
            
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Убираем href, чтобы предотвратить переход
            if (link.hasAttribute('href')) {
                link.setAttribute('href', '#');
            }
            
            // Получаем brand из data-brand (уже в lowercase)
            const brand = link.getAttribute('data-brand')?.toLowerCase().trim() || '';
            if (!brand) {
                // console.warn('No brand found in data-brand attribute');
                return;
            }
            
            // console.log(`Brand ${brand} clicked`);
            
            // Маппинг для брендов - включаем различные варианты написания
            const brandMapping = {
                'mer': ['mer', 'mercedes', 'mercedes-benz', 'mercedes benz'],
                'bmw': ['bmw'],
                'lexus': ['lexus', 'Lexus', 'LEXUS'],
                'honda': ['honda', 'Honda', 'HONDA'],
                'chevrolet': ['chevrolet', 'Chevrolet', 'CHEVROLET'],
                'acura': ['acura', 'Acura', 'ACURA'],
                'toyota': ['toyota', 'Toyota', 'TOYOTA']
            };
            
            // Используем маппинг или сам бренд
            const searchBrands = brandMapping[brand] || [brand];
            
            // Устанавливаем выбранные бренды для поиска
            this.selectedMarcas = searchBrands;
            
            // Увеличиваем лимит для загрузки всех машин для фильтрации
            this.currentLimit = 200;
            
            // Сбрасываем страницу на первую
            this.currentPage = 1;
            
            // Загружаем машины с фильтром по бренду
            this.loadCars(1);
            
            // Показываем кнопку сброса фильтра по брендам (с небольшой задержкой для гарантии)
            setTimeout(() => {
                this.showBrandFilterReset();
            }, 100);
            
            // Прокручиваем к списку машин
            setTimeout(() => {
                const carsSection = document.querySelector('.box-grid-tours');
                if (carsSection) {
                    carsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 300);
            
            return false;
        };
        
        // Привязываем обработчик к контейнеру с использованием capture phase
        carouselContainer.addEventListener('click', this.brandFilterHandler, true);
        // console.log('Brand filter handler attached to carousel container (event delegation)');
        
        // Также обновляем все ссылки, чтобы убрать href
        const brandLinks = document.querySelectorAll('.item-brand[data-brand]');
        // console.log('Found brand links:', brandLinks.length);
        brandLinks.forEach(link => {
            if (link.hasAttribute('href')) {
                link.setAttribute('href', '#');
            }
        });
        
        // Обработчик для кнопки сброса фильтра по брендам
        this.initBrandFilterReset();
        
        // Переинициализируем обработчики после небольшой задержки (на случай, если карусель инициализируется позже)
        setTimeout(() => {
            this.reinitBrandFilters();
        }, 1000);
    }
    
    reinitBrandFilters() {
        // Проверяем, есть ли элементы карусели
        const brandLinks = document.querySelectorAll('.item-brand[data-brand]');
        if (brandLinks.length > 0) {
            // console.log('Reinitializing brand filters, found links:', brandLinks.length);
            // Обновляем href для всех ссылок
            brandLinks.forEach(link => {
                if (link.hasAttribute('href') && link.getAttribute('href') !== '#') {
                    link.setAttribute('href', '#');
                }
            });
        }
    }
    
    initBrandFilterReset() {
        // Проверяем, не создан ли уже стиль для hover
        if (!document.getElementById('resetBrandFilterBtnStyle')) {
            const style = document.createElement('style');
            style.id = 'resetBrandFilterBtnStyle';
            style.textContent = `
                #resetBrandFilterBtn {
                    display: none !important;
                    margin-left: 10px;
                    padding: 8px 10px !important;
                    background: transparent !important;
                    border: none !important;
                    align-items: center;
                    justify-content: center;
                }
                #resetBrandFilterBtn.show {
                    display: inline-flex !important;
                    visibility: visible !important;
                }
                #resetBrandFilterBtn svg {
                    width: 18px;
                    height: 18px;
                    stroke: var(--bs-neutral-1000);
                }
                #resetBrandFilterBtn:hover {
                    background-color: var(--bs-neutral-200) !important;
                }
                #resetBrandFilterBtn:hover svg path {
                    stroke: #d6ff66 !important;
                }
                .box-item-sort {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                #resetBrandFilterWrapper {
                    display: inline-flex;
                    align-items: center;
                    margin-left: auto;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Создаем кнопку сброса фильтра по брендам, если её нет
        let resetBtn = document.getElementById('resetBrandFilterBtn');
        if (!resetBtn) {
            // Ищем контейнер box-item-sort для размещения рядом с кнопкой сортировки
            const sortContainer = document.querySelector('.box-item-sort');
            if (sortContainer) {
                resetBtn = document.createElement('button');
                resetBtn.id = 'resetBrandFilterBtn';
                resetBtn.type = 'button';
                resetBtn.className = 'btn btn-sort';
                resetBtn.setAttribute('aria-label', 'Resetează filtrul');
                resetBtn.setAttribute('title', 'Resetează filtrul');
                
                // Создаем SVG иконку крестика (X) для сброса фильтра
                const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svgIcon.setAttribute('width', '18');
                svgIcon.setAttribute('height', '18');
                svgIcon.setAttribute('viewBox', '0 0 18 18');
                svgIcon.setAttribute('fill', 'none');
                svgIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                svgIcon.setAttribute('aria-hidden', 'true');
                
                // Иконка крестика (X) - интуитивный символ для сброса/очистки
                const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path1.setAttribute('d', 'M4.5 4.5L13.5 13.5');
                path1.setAttribute('stroke', '');
                path1.setAttribute('stroke-width', '1.5');
                path1.setAttribute('stroke-linecap', 'round');
                path1.setAttribute('stroke-linejoin', 'round');
                
                const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path2.setAttribute('d', 'M13.5 4.5L4.5 13.5');
                path2.setAttribute('stroke', '');
                path2.setAttribute('stroke-width', '1.5');
                path2.setAttribute('stroke-linecap', 'round');
                path2.setAttribute('stroke-linejoin', 'round');
                
                svgIcon.appendChild(path1);
                svgIcon.appendChild(path2);
                resetBtn.appendChild(svgIcon);
                
                // Вставляем в контейнер после кнопки сортировки
                sortContainer.appendChild(resetBtn);
                
                // console.log('Reset brand filter button created next to sort button');
            } else {
                // console.error('Sort container not found, trying alternative location');
                // Альтернативный вариант - рядом с каруселью
                const brandCarousel = document.querySelector('.box-list-brand-car');
                if (brandCarousel) {
                    const container = brandCarousel.closest('.box-search-category');
                    if (container) {
                        const wrapper = document.createElement('div');
                        wrapper.id = 'resetBrandFilterWrapper';
                        
                        resetBtn = document.createElement('button');
                        resetBtn.id = 'resetBrandFilterBtn';
                        resetBtn.type = 'button';
                        resetBtn.className = 'btn btn-sort';
                        resetBtn.setAttribute('aria-label', 'Resetează filtrul');
                        resetBtn.setAttribute('title', 'Resetează filtrul');
                        
                        // Создаем SVG иконку крестика (X) для сброса фильтра
                        const altSvgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        altSvgIcon.setAttribute('width', '18');
                        altSvgIcon.setAttribute('height', '18');
                        altSvgIcon.setAttribute('viewBox', '0 0 18 18');
                        altSvgIcon.setAttribute('fill', 'none');
                        altSvgIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                        altSvgIcon.setAttribute('aria-hidden', 'true');
                        
                        // Иконка крестика (X)
                        const altPath1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        altPath1.setAttribute('d', 'M4.5 4.5L13.5 13.5');
                        altPath1.setAttribute('stroke', '');
                        altPath1.setAttribute('stroke-width', '1.5');
                        altPath1.setAttribute('stroke-linecap', 'round');
                        altPath1.setAttribute('stroke-linejoin', 'round');
                        
                        const altPath2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        altPath2.setAttribute('d', 'M13.5 4.5L4.5 13.5');
                        altPath2.setAttribute('stroke', '');
                        altPath2.setAttribute('stroke-width', '1.5');
                        altPath2.setAttribute('stroke-linecap', 'round');
                        altPath2.setAttribute('stroke-linejoin', 'round');
                        
                        altSvgIcon.appendChild(altPath1);
                        altSvgIcon.appendChild(altPath2);
                        resetBtn.appendChild(altSvgIcon);
                        
                        wrapper.appendChild(resetBtn);
                        container.appendChild(wrapper);
                        // console.log('Reset brand filter button created in alternative location');
                    }
                }
            }
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // console.log('Reset brand filter button clicked');
                this.resetBrandFilter();
            });
        } else {
            // console.error('Reset button not created');
        }
    }
    
    showBrandFilterReset() {
        const resetBtn = document.getElementById('resetBrandFilterBtn');
        const wrapper = document.getElementById('resetBrandFilterWrapper');
        if (resetBtn) {
            resetBtn.classList.add('show');
            resetBtn.classList.remove('d-none');
            resetBtn.style.display = 'inline-flex';
            resetBtn.style.visibility = 'visible';
            if (wrapper) {
                wrapper.style.display = 'block';
            }
            // console.log('Reset brand filter button shown');
        } else {
            // console.warn('Reset button not found when trying to show');
        }
    }
    
    hideBrandFilterReset() {
        const resetBtn = document.getElementById('resetBrandFilterBtn');
        const wrapper = document.getElementById('resetBrandFilterWrapper');
        if (resetBtn) {
            resetBtn.classList.remove('show');
            resetBtn.classList.add('d-none');
            resetBtn.style.display = 'none';
            resetBtn.style.visibility = 'hidden';
            if (wrapper) {
                wrapper.style.display = 'none';
            }
            // console.log('Reset brand filter button hidden');
        }
    }
    
    resetBrandFilter() {
        // console.log('Resetting brand filter...');
        // Сбрасываем фильтр по брендам - важно использовать новый массив
        this.selectedMarcas = ['all'];
        
        // Возвращаем оригинальный лимит
        this.currentLimit = this.originalLimit;
        
        // Сбрасываем страницу на первую
        this.currentPage = 1;
        
        // Скрываем кнопку сброса
        this.hideBrandFilterReset();
        
        // Перезагружаем страницу для полного сброса состояния
        window.location.reload();
    }
    
    initCategoryFilters() {
        const categoryCheckboxes = document.querySelectorAll('input[data-category]');
        // console.log('Found category checkboxes:', categoryCheckboxes.length);
        categoryCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const category = e.target.getAttribute('data-category');
                const isChecked = e.target.checked;
                // console.log(`Category ${category} ${isChecked ? 'selected' : 'deselected'}`);
                if (category === 'all') {
                    if (isChecked) {
                        categoryCheckboxes.forEach(cb => {
                            if (cb.getAttribute('data-category') !== 'all') cb.checked = false;
                        });
                        this.selectedCategories = ['all'];
                    } else {
                        this.selectedCategories = [];
                    }
                } else {
                    if (isChecked) {
                        const allCheckbox = document.querySelector('#category-all');
                        if (allCheckbox) allCheckbox.checked = false;
                        this.selectedCategories.push(category);
                    } else {
                        this.selectedCategories = this.selectedCategories.filter(cat => cat !== category);
                    }
                }
                // console.log('Selected categories:', this.selectedCategories);
                this.debouncedLoadCars();
                this.loadCategoryCounts(); // подтянет All из /cars/categories (глобально)
                this.updateAllCountersGlobal(); // усилим, чтобы точно не зависеть от фильтров
            });
        });
    }

    initFuelFilters() {
        const fuelCheckboxes = document.querySelectorAll('input[data-fuel]');
        // console.log('Found fuel checkboxes:', fuelCheckboxes.length);
        fuelCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const fuel = e.target.getAttribute('data-fuel');
                const isChecked = e.target.checked;
                // console.log(`Fuel ${fuel} ${isChecked ? 'selected' : 'deselected'}`);
                if (fuel === 'all') {
                    if (isChecked) {
                        fuelCheckboxes.forEach(cb => {
                            if (cb.getAttribute('data-fuel') !== 'all') cb.checked = false;
                        });
                        this.selectedFuels = ['all'];
                    } else {
                        this.selectedFuels = [];
                    }
                } else {
                    if (isChecked) {
                        const allCheckbox = document.querySelector('#fuel-all');
                        if (allCheckbox) allCheckbox.checked = false;
                        this.selectedFuels.push(fuel);
                    } else {
                        this.selectedFuels = this.selectedFuels.filter(f => f !== fuel);
                    }
                }
                // console.log('Selected fuels:', this.selectedFuels);
                this.debouncedLoadCars();
                this.loadFuelCounts(); // подтянет All из /cars/fuels (глобально)
                this.updateAllCountersGlobal();
            });
        });
    }

    initTransmissionFilters() {
        const transmissionCheckboxes = document.querySelectorAll('input[data-transmission]');
        // console.log('Found transmission checkboxes:', transmissionCheckboxes.length);
        transmissionCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const transmission = e.target.getAttribute('data-transmission');
                const isChecked = e.target.checked;
                // console.log(`Transmission ${transmission} ${isChecked ? 'selected' : 'deselected'}`);
                if (transmission === 'all') {
                    if (isChecked) {
                        transmissionCheckboxes.forEach(cb => {
                            if (cb.getAttribute('data-transmission') !== 'all') cb.checked = false;
                        });
                        this.selectedTransmissions = ['all'];
                    } else {
                        this.selectedTransmissions = [];
                    }
                } else {
                    if (isChecked) {
                        const allCheckbox = document.querySelector('#transmission-all');
                        if (allCheckbox) allCheckbox.checked = false;
                        this.selectedTransmissions.push(transmission);
                    } else {
                        this.selectedTransmissions = this.selectedTransmissions.filter(t => t !== transmission);
                    }
                }
                // console.log('Selected transmissions:', this.selectedTransmissions);
                this.debouncedLoadCars();
                this.loadTransmissionCounts(); // подтянет All из /cars/transmissions (глобально)
                this.updateAllCountersGlobal();
            });
        });
    }

    toggleSortDirection() {
        this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc';
        // console.log(`Направление сортировки изменено на: ${this.sortDirection}`);
        this.loadCars(this.currentPage);
        this.updateSortButtonVisual();
    }

    updateSortButtonVisual() {
        const sortButton = document.querySelector('.btn-sort');
        if (sortButton) {
            if (this.sortDirection === 'asc') {
                sortButton.classList.add('sort-asc');
                sortButton.classList.remove('sort-desc');
                sortButton.title = 'Сортировка по возрастанию (нажмите для убывания)';
            } else {
                sortButton.classList.add('sort-desc');
                sortButton.classList.remove('sort-asc');
                sortButton.title = 'Сортировка по убыванию (нажмите для возрастания)';
            }
        }
    }

    setLimit(limit) {
        this.currentLimit = limit;
        // console.log(`Limit changed to: ${limit}`);
        this.loadCars(1);
    }

    setSort(sortValue) {
        this.currentSort = sortValue;
        // console.log(`Sort changed to: ${sortValue}`);
        this.loadCars(1);
    }

    getSortValue(sortText) {
        const sortMap = {
            'Most Viewed': 'most_viewed',
            'Recently search': 'recently_searched',
            'Most popular': 'most_popular',
            'Top rated': 'top_rated'
        };
        return sortMap[sortText] || 'most_viewed';
    }

    updateDropdownText(dropdown, text) {
        const span = dropdown.querySelector('span');
        if (span) span.textContent = text;
    }

    applyFilters() {
        // console.log('Applying filters...');
        // console.log('Current maxPrice:', this.maxPrice);
        // console.log('Current selectedCategories:', this.selectedCategories);
        const activeFilters = this.collectActiveFilters();
        // console.log('Active filters:', activeFilters);
        this.currentPage = 1;
        this.loadCars(1);
        this.loadCategoryCounts();
        this.showUpdateNotification('Filters applied successfully!');
        this.updateAllCountersGlobal();
    }

    collectActiveFilters() {
        const filters = {};
        // console.log('Collecting active filters...');
        if (this.maxPrice !== null && this.maxPrice >= 250 && this.maxPrice <= 4000) {
            filters.maxPrice = this.maxPrice;
        }
        const specificCategories = this.selectedCategories.filter(cat => cat !== 'all');
        if (specificCategories.length > 0) filters.categories = specificCategories;
        const specificFuels = this.selectedFuels.filter(fuel => fuel !== 'all');
        if (specificFuels.length > 0) filters.fuels = specificFuels;
        const specificTransmissions = this.selectedTransmissions.filter(transmission => transmission !== 'all');
        if (specificTransmissions.length > 0) filters.transmissions = specificTransmissions;
        // console.log('Collected filters:', filters);
        return filters;
    }

    clearFilters() {
        // console.log('Clearing all filters...');
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
        this.maxPrice = 4000;
        this.selectedCategories = ['all'];
        this.selectedFuels = ['all'];
        this.selectedTransmissions = ['all'];
        this.selectedMarcas = ['all'];
        // Возвращаем оригинальный лимит
        this.currentLimit = this.originalLimit;
        // Скрываем кнопку сброса фильтра по брендам
        this.hideBrandFilterReset();

        const sliderInput = document.querySelector('#price-slider');
        if (sliderInput) {
            sliderInput.value = '4000';
            sliderInput.dispatchEvent(new Event('input'));
        }
        const hiddenInput = document.querySelector('.value-money');
        if (hiddenInput) hiddenInput.value = '4000';
        const priceSpan = document.querySelector('.box-value-price span:last-child');
        if (priceSpan) priceSpan.innerHTML = 'Lei 4000';

        const categoryCheckboxes = document.querySelectorAll('input[data-category]');
        categoryCheckboxes.forEach(checkbox => {
            checkbox.checked = checkbox.dataset.category === 'all';
        });
        const fuelCheckboxes = document.querySelectorAll('input[data-fuel]');
        fuelCheckboxes.forEach(checkbox => {
            checkbox.checked = checkbox.dataset.fuel === 'all';
        });
        const transmissionCheckboxes = document.querySelectorAll('input[data-transmission]');
        transmissionCheckboxes.forEach(checkbox => {
            checkbox.checked = checkbox.dataset.transmission === 'all';
        });

        this.currentPage = 1;
        this.loadCars(1);
        this.loadCategoryCounts();
        this.loadFuelCounts();
        this.loadTransmissionCounts();
        this.showUpdateNotification('All filters cleared!');
        this.updateAllCountersGlobal();
    }

    setActiveItem(clickedItem) {
        const parent = clickedItem.parentElement;
        const allItems = parent.querySelectorAll('.dropdown-item');
        allItems.forEach(item => item.classList.remove('active'));
        clickedItem.classList.add('active');
    }

    initPriceSlider() {
        const checkSlider = () => {
            // console.log('Проверяем доступность слайдера...');
            // console.log('jQuery доступен:', typeof $ !== 'undefined');
            // console.log('Элемент #price-slider найден:', $('#price-slider').length > 0);
            if (typeof $ !== 'undefined' && $('#price-slider').length > 0) {
                // console.log('Инициализируем простой слайдер...');
                this.initSimpleWorkingSlider();
            } else {
                // console.log('Элемент #price-slider не найден, повторяем через 100мс...');
                setTimeout(checkSlider, 100);
            }
        };
        checkSlider();
    }

    initAlternativeSlider() {
        this.initSimpleWorkingSlider();
    }
    
    initSimpleWorkingSlider() {
        const sliderInput = document.querySelector('#price-slider');
        const sliderFill = document.querySelector('#slider-fill');
        const sliderTooltip = document.querySelector('#slider-tooltip');
        if (sliderInput && sliderFill && sliderTooltip) {
            // console.log('Инициализируем простой рабочий слайдер...');
            sliderInput.setAttribute('min', '250');
            sliderInput.setAttribute('max', '4000');
            sliderInput.setAttribute('value', '4000');
            sliderInput.value = '4000';
            this.maxPrice = 4000;
            const updateSlider = (value) => {
                let valueNum = parseInt(value);
                if (isNaN(valueNum)) valueNum = 4000;
                else if (valueNum < 250) valueNum = 250;
                else if (valueNum > 4000) valueNum = 4000;
                if (valueNum !== parseInt(value)) sliderInput.value = valueNum.toString();
                const percentage = ((valueNum - 250) / (4000 - 250)) * 100;
                sliderFill.style.width = percentage + '%';
                sliderTooltip.innerHTML = 'Lei ' + valueNum;
                sliderTooltip.classList.add('updating');
                setTimeout(() => sliderTooltip.classList.remove('updating'), 200);
                const priceSpan = document.querySelector('.box-value-price span:last-child');
                if (priceSpan) priceSpan.innerHTML = 'Lei ' + valueNum;
                const hiddenInput = document.querySelector('.value-money');
                if (hiddenInput) hiddenInput.value = valueNum;
                this.maxPrice = valueNum;
                // console.log(`Цена изменена на: Lei ${valueNum}, maxPrice: ${this.maxPrice}`);
                this.debouncedLoadCars();
            };
            sliderInput.addEventListener('input', (e) => updateSlider(e.target.value));
            sliderInput.addEventListener('change', (e) => updateSlider(e.target.value));
            updateSlider(4000);
            // console.log('Простой рабочий слайдер инициализирован, maxPrice:', this.maxPrice);
        } else {
            // console.log('Элементы простого слайдера не найдены...');
        }
    }
    
    initSimpleSlider() {
        const sliderContainer = document.querySelector('#slider-range');
        if (sliderContainer) {
            // console.log('Инициализируем простой слайдер...');
            const rangeInput = document.createElement('input');
            rangeInput.type = 'range';
            rangeInput.min = '0';
            rangeInput.max = '500';
            rangeInput.step = '1';
            rangeInput.value = '280';
            rangeInput.style.width = '100%';
            sliderContainer.appendChild(rangeInput);
            rangeInput.addEventListener('input', (e) => {
                const value = e.target.value;
                const priceSpan = document.querySelector('.box-value-price span:last-child');
                if (priceSpan) priceSpan.innerHTML = 'Lei ' + value;
                const hiddenInput = document.querySelector('.value-money');
                if (hiddenInput) hiddenInput.value = value;
                this.maxPrice = parseInt(value);
                // console.log(`Цена изменена на: Lei ${value}, maxPrice: ${this.maxPrice}`);
                this.debouncedLoadCars();
            });
            const priceSpan = document.querySelector('.box-value-price span:last-child');
            if (priceSpan) priceSpan.textContent = 'Lei 280';
            const hiddenInput = document.querySelector('.value-money');
            if (hiddenInput) hiddenInput.value = '280';
            this.maxPrice = 280;
            // console.log('Простой слайдер инициализирован, maxPrice:', this.maxPrice);
        }
    }

    debouncedLoadCars() {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            // console.log('Debounced loadCars вызван');
            this.currentPage = 1;
            this.loadCars();
        }, 300);
    }

    showUpdateNotification(message) {
        // console.log('✅ ' + message);
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 9999;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            if (notification.parentNode) notification.parentNode.removeChild(notification);
        }, 3000);
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
