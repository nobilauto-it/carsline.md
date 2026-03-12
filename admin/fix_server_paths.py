#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для исправления путей на сервере
Запускать на сервере для обновления путей в routes.py
"""

import os
import re
import glob

def fix_server_paths():
    """Исправляет пути на сервере"""
    
    print("=== ИСПРАВЛЕНИЕ ПУТЕЙ НА СЕРВЕРЕ ===")
    print("=" * 50)
    
    # Поиск HTML файлов
    print("\n1. ПОИСК HTML ФАЙЛОВ:")
    html_files = []
    
    # Расширенные паттерны поиска
    patterns = [
        "/usr/Projects/**/*.html",
        "/var/www/**/*.html", 
        "/home/**/*.html",
        "/opt/**/*.html",
        "**/index.html",
        "**/homepage*.html",
        "**/banner*.html"
    ]
    
    for pattern in patterns:
        try:
            files = glob.glob(pattern, recursive=True)
            for file in files:
                if os.path.isfile(file) and file not in html_files:
                    html_files.append(file)
                    print(f"  Найден: {file}")
        except Exception as e:
            print(f"  Ошибка поиска {pattern}: {e}")
    
    # Поиск CSS файлов
    print("\n2. ПОИСК CSS ФАЙЛОВ:")
    css_files = []
    
    css_patterns = [
        "/usr/Projects/**/*.css",
        "/var/www/**/*.css",
        "/home/**/*.css", 
        "/opt/**/*.css",
        "**/main.css",
        "**/style.css",
        "**/app.css",
        "**/banner*.css"
    ]
    
    for pattern in css_patterns:
        try:
            files = glob.glob(pattern, recursive=True)
            for file in files:
                if os.path.isfile(file) and file not in css_files:
                    css_files.append(file)
                    print(f"  Найден: {file}")
        except Exception as e:
            print(f"  Ошибка поиска {pattern}: {e}")
    
    # Анализ найденных файлов
    print("\n3. АНАЛИЗ ФАЙЛОВ:")
    
    # Выбираем наиболее подходящие файлы
    main_html = None
    main_css = None
    
    for html_file in html_files:
        if 'index.html' in html_file or 'homepage' in html_file.lower():
            main_html = html_file
            break
    
    if not main_html and html_files:
        main_html = html_files[0]
    
    for css_file in css_files:
        if 'main.css' in css_file or 'style.css' in css_file:
            main_css = css_file
            break
    
    if not main_css and css_files:
        main_css = css_files[0]
    
    print(f"\n  Выбранный HTML файл: {main_html}")
    print(f"  Выбранный CSS файл: {main_css}")
    
    # Генерируем код для routes.py
    print("\n4. КОД ДЛЯ ОБНОВЛЕНИЯ routes.py:")
    print("=" * 50)
    
    if main_html:
        print(f"""
# Обновите функцию find_html_file() в routes.py:
def find_html_file():
    server_html_paths = [
        "{main_html}",
""")
        
        for html_file in html_files[:5]:  # Показываем первые 5
            print(f'        "{html_file}",')
        
        print("""        # Дополнительные пути
        "/var/www/html/index.html",
        "/var/www/html/dist/index.html"
    ]
    
    for path in server_html_paths:
        if os.path.exists(path):
            print(f"Found HTML file: {path}")
            return path
    
    return None
""")
    
    if main_css:
        print(f"""
# Обновите функцию find_css_file() в routes.py:
def find_css_file():
    server_css_paths = [
        "{main_css}",
""")
        
        for css_file in css_files[:5]:  # Показываем первые 5
            print(f'        "{css_file}",')
        
        print("""        # Дополнительные пути
        "/var/www/html/assets/css/main.css",
        "/var/www/html/css/main.css"
    ]
    
    for path in server_css_paths:
        if os.path.exists(path):
            print(f"Found CSS file: {path}")
            return path
    
    return None
""")
    
    print("\n" + "=" * 50)
    print("ИНСТРУКЦИИ:")
    print("1. Скопируйте найденные пути выше")
    print("2. Обновите функции find_html_file() и find_css_file() в routes.py")
    print("3. Перезапустите Flask приложение")
    print("4. Проверьте работу редактора баннера")

if __name__ == "__main__":
    fix_server_paths()
