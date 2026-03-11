#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для автоматической генерации sitemap.xml
Сканирует папку dist/ и создает актуальный sitemap.xml
Запускать через cron для автоматического обновления
"""

import os
import sys
import glob
from datetime import datetime
from pathlib import Path

# Устанавливаем UTF-8 для вывода в консоль (важно для Linux)
if sys.version_info >= (3, 7):
    if sys.stdout.encoding != 'utf-8':
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except AttributeError:
            # Для старых версий Python
            import io
            sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
else:
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Конфигурация
BASE_URL = "https://new.carsline.md"
DIST_DIR = "dist"
SITEMAP_FILE = os.path.join(DIST_DIR, "sitemap.xml")

# Страницы для исключения (как в robots.txt)
EXCLUDED_PATTERNS = [
    "404.html",
    "test.html",
    "test-image.html",
    "index_utf8.html",
    "index.html.backup",
    "agent-dashboard-",
    "user-dashboard-",
    "assets/",  # Исключаем файлы из assets
]

# Приоритеты и частота обновления для разных типов страниц
PAGE_PRIORITIES = {
    "index.html": {"priority": "1.0", "changefreq": "daily"},
    "about-us.html": {"priority": "0.9", "changefreq": "weekly"},
    "contact.html": {"priority": "0.9", "changefreq": "monthly"},
    "cars-list-": {"priority": "0.8", "changefreq": "daily"},
    "cars-details-": {"priority": "0.8", "changefreq": "weekly"},
    "blog-": {"priority": "0.7", "changefreq": "weekly"},
    "services.html": {"priority": "0.7", "changefreq": "monthly"},
    "pricing.html": {"priority": "0.7", "changefreq": "monthly"},
    "faqs.html": {"priority": "0.7", "changefreq": "monthly"},
    "calculator.html": {"priority": "0.6", "changefreq": "monthly"},
    "dealer-": {"priority": "0.6", "changefreq": "weekly"},
    "shop-": {"priority": "0.6", "changefreq": "weekly"},
    "term.html": {"priority": "0.5", "changefreq": "yearly"},
    "login.html": {"priority": "0.4", "changefreq": "yearly"},
    "register.html": {"priority": "0.4", "changefreq": "yearly"},
    "index-": {"priority": "0.6", "changefreq": "weekly"},
}

# Значения по умолчанию
DEFAULT_PRIORITY = "0.5"
DEFAULT_CHANGEFREQ = "monthly"


def should_exclude(filename):
    """Проверяет, нужно ли исключить файл из sitemap"""
    for pattern in EXCLUDED_PATTERNS:
        if pattern in filename:
            return True
    return False


def get_page_settings(filename):
    """Определяет приоритет и частоту обновления для страницы"""
    for pattern, settings in PAGE_PRIORITIES.items():
        if filename.startswith(pattern) or pattern in filename:
            return settings
    return {"priority": DEFAULT_PRIORITY, "changefreq": DEFAULT_CHANGEFREQ}


def get_file_modification_date(filepath):
    """Получает дату последнего изменения файла"""
    try:
        mtime = os.path.getmtime(filepath)
        return datetime.fromtimestamp(mtime).strftime("%Y-%m-%d")
    except:
        return datetime.now().strftime("%Y-%m-%d")


def find_html_files():
    """Находит все HTML файлы в папке dist/"""
    html_files = []
    dist_path = Path(DIST_DIR)
    
    if not dist_path.exists():
        print(f"Ошибка: папка {DIST_DIR} не найдена!")
        return []
    
    # Ищем все HTML файлы
    for html_file in dist_path.glob("*.html"):
        filename = html_file.name
        filepath = str(html_file)
        
        # Пропускаем исключенные файлы
        if should_exclude(filename):
            continue
        
        html_files.append({
            "filename": filename,
            "filepath": filepath,
            "url": f"{BASE_URL}/{filename}" if filename != "index.html" else f"{BASE_URL}/"
        })
    
    return html_files


def generate_sitemap(html_files):
    """Генерирует XML для sitemap"""
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ''
    ]
    
    # Сортируем файлы: index.html первый, остальные по алфавиту
    html_files.sort(key=lambda x: (x["filename"] != "index.html", x["filename"]))
    
    for file_info in html_files:
        filename = file_info["filename"]
        url = file_info["url"]
        filepath = file_info["filepath"]
        
        # Получаем настройки для страницы
        settings = get_page_settings(filename)
        priority = settings["priority"]
        changefreq = settings["changefreq"]
        
        # Получаем дату изменения файла
        lastmod = get_file_modification_date(filepath)
        
        xml_lines.extend([
            '    <url>',
            f'        <loc>{url}</loc>',
            f'        <lastmod>{lastmod}</lastmod>',
            f'        <changefreq>{changefreq}</changefreq>',
            f'        <priority>{priority}</priority>',
            '    </url>',
            ''
        ])
    
    xml_lines.append('</urlset>')
    
    return '\n'.join(xml_lines)


def main():
    """Основная функция"""
    print("Генерация sitemap.xml...")
    
    # Находим все HTML файлы
    html_files = find_html_files()
    
    if not html_files:
        print("Не найдено HTML файлов для добавления в sitemap!")
        return
    
    print(f"Найдено {len(html_files)} страниц для добавления в sitemap")
    
    # Генерируем sitemap
    sitemap_xml = generate_sitemap(html_files)
    
    # Сохраняем файл
    try:
        with open(SITEMAP_FILE, 'w', encoding='utf-8') as f:
            f.write(sitemap_xml)
        print(f"[OK] sitemap.xml успешно создан: {SITEMAP_FILE}")
        print(f"  Включено страниц: {len(html_files)}")
    except Exception as e:
        print(f"[ERROR] Ошибка при сохранении sitemap.xml: {e}")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())

