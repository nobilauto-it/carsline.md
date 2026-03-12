# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, request, jsonify, Response, current_app
from sqlalchemy import text
from jinja2 import Template
import os
from werkzeug.utils import secure_filename
import base64
import requests

# Create blueprint
blueprint = Blueprint('pages', __name__, url_prefix='/')

def find_css_file():
    """Find the correct CSS file for the project"""
    css_paths = [
        "/usr/Projects/Carento_v2.0.0_Unzip-First/2.Carento_Development_SourceCode/dist/assets/css/style.css",
        "/usr/Projects/Carento_v2.0.0_Unzip-First/2.Carento_Development_SourceCode/dist/assets/css/main.css",
        "/usr/Projects/Carento_v2.0.0_Unzip-First/2.Carento_Development_SourceCode/dist/css/style.css",
        "/usr/Projects/Carento_v2.0.0_Unzip-First/2.Carento_Development_SourceCode/dist/css/main.css"
    ]
    
    for path in css_paths:
        if os.path.exists(path):
            return path
    
    return None

# Routes
@blueprint.route('/')
def index():
    return render_template('pages/index.html', segment='index')

@blueprint.route('/banner-editor')
def banner_editor():
    """Banner editor page in Dastone style"""
    return render_template('pages/banner-editor.html', segment='banner-editor')

@blueprint.route('/admin-embed')
def admin_embed():
    """Admin embed page for car management"""
    return render_template('pages/admin-embed.html', segment='admin-embed')

@blueprint.route('/images/<int:img_id>')
def serve_image_base64(img_id):
    """Serve car images from database as base64"""
    try:
        with db.engine.connect() as conn:
            # Get image data from database (url column contains base64 data)
            result = conn.execute(text('SELECT url FROM img WHERE id = :img_id'), {'img_id': img_id})
            row = result.fetchone()
            
            if row and row[0]:
                # Get base64 data from url column
                base64_data = row[0]
                
                # Remove data URI prefix if present (e.g., "data:image/jpeg;base64,")
                if ',' in base64_data:
                    base64_data = base64_data.split(',', 1)[1]
                
                # Decode base64 to binary
                image_data = base64.b64decode(base64_data)
                
                # Determine MIME type based on base64 header
                mimetype = 'image/jpeg'  # default
                if base64_data.startswith('/9j/'):  # JPEG
                    mimetype = 'image/jpeg'
                elif base64_data.startswith('iVBORw0KGgo'):  # PNG
                    mimetype = 'image/png'
                elif base64_data.startswith('R0lGOD'):  # GIF
                    mimetype = 'image/gif'
                
                # Return image with proper headers
                return Response(
                    image_data,
                    mimetype=mimetype,
                    headers={'Content-Type': mimetype}
            )
            else:
                # Return 404 if image not found
                return Response('Image not found', status=404)
                
    except Exception as e:
        print(f"Error serving image {img_id}: {e}")
        return Response(f'Error loading image: {str(e)}', status=500)

# API endpoints for cars
@blueprint.route('/api/cars', methods=['GET'])
def cars_list():
    """Get cars list with pagination"""
    try:
        limit = int(request.args.get('limit', 12))
        offset = int(request.args.get('offset', 0))
        source = request.args.get('source', 'db')  # 'db' or 'api'
        
        if source == 'db':
            return cars_list_db(limit, offset)
        else:
            return cars_list_api(limit, offset)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def cars_list_api(limit=12, offset=0):
    """Get cars from external API"""
    try:
        # Use requests instead of urllib
        response = requests.get(f'http://194.33.40.197:8000/cars?limit={limit}&offset={offset}')
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching cars from API: {e}")
        return jsonify({'error': str(e)}), 500

def cars_list_db(limit=12, offset=0):
    """Get cars from local database"""
    try:
        from apps import db
        # Get total count
        count_result = db.session.execute(text('SELECT COUNT(*) FROM car'))
        total = count_result.fetchone()[0]
        
        # Get cars with pagination
        query = text('''
            SELECT c.id, c.created_date, c.fuel, c.transmission, c.category, 
                   c.marca_id, c.model_id, c.price_id, c.img_id, c.img_cover,
                   c.drive_type, c.seats, c.luggage_capacity,
                   m.name as marca_name, mo.name as model_name, p.base_value, p.currency
            FROM car c
            LEFT JOIN marca m ON c.marca_id = m.id
            LEFT JOIN model mo ON c.model_id = mo.id
            LEFT JOIN price p ON c.price_id = p.id
            ORDER BY c.created_date DESC
            LIMIT :limit OFFSET :offset
        ''')
        
        result = db.session.execute(query, {'limit': limit, 'offset': offset})
        rows = result.fetchall()
        
        # Convert to list of dictionaries
        items = []
        for row in rows:
            item = {
                'id': row.id,
                'created_date': row.created_date.isoformat() if row.created_date else None,
                'fuel': row.fuel,
                'transmission': row.transmission,
                'category': row.category,
                'marca_id': row.marca_id,
                'model_id': row.model_id,
                'price_id': row.price_id,
                'img_id': row.img_id,
                'img_cover': row.img_cover,
                'drive_type': row.drive_type,
                'seats': row.seats,
                'luggage_capacity': row.luggage_capacity,
                'marca': row.marca_name,
                'model': row.model_name,
                'base_value': str(row.base_value) if row.base_value else None,
                'currency': row.currency or 'Lei'
            }
            items.append(item)
        
        return jsonify({
            'items': items,
            'total': total,
            'limit': limit,
            'offset': offset
        })
    except Exception as e:
        print(f"Error fetching cars from database: {e}")
        return jsonify({'error': str(e)}), 500

@blueprint.route('/api/cars', methods=['POST'])
def cars_create():
    """Create new car"""
    try:
        data = request.get_json()
        
        with db.engine.connect() as conn:
            # Create price first
            price_result = conn.execute(text('''
                INSERT INTO price (base_value, currency) 
                VALUES (:base_value, :currency) 
                RETURNING id
            '''), {
                'base_value': data.get('base_value'),
                'currency': data.get('currency', 'Lei')
            })
            price_id = price_result.fetchone()[0]
            
            # Create car
            car_result = conn.execute(text('''
                INSERT INTO car (fuel, transmission, category, marca_id, model_id, price_id, 
                               drive_type, seats, luggage_capacity) 
                VALUES (:fuel, :transmission, :category, :marca_id, :model_id, :price_id,
                       :drive_type, :seats, :luggage_capacity) 
                RETURNING id
            '''), {
                'fuel': data.get('fuel'),
                'transmission': data.get('transmission'),
                'category': data.get('category'),
                'marca_id': data.get('marca_id'),
                'model_id': data.get('model_id'),
                'price_id': price_id,
                'drive_type': data.get('drive_type'),
                'seats': data.get('seats'),
                'luggage_capacity': data.get('luggage_capacity')
            })
            car_id = car_result.fetchone()[0]
            
            conn.commit()
            
            return jsonify({
                'message': 'Car created successfully',
                'car_id': car_id,
                'price_id': price_id
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@blueprint.route('/api/cars/<int:car_id>', methods=['PUT'])
def cars_update(car_id):
    """Update car"""
    try:
        data = request.get_json()
        
        with db.engine.connect() as conn:
            # Update car
            conn.execute(text('''
                UPDATE car SET 
                    fuel = :fuel, 
                    transmission = :transmission, 
                    category = :category, 
                    marca_id = :marca_id, 
                    model_id = :model_id,
                    drive_type = :drive_type,
                    seats = :seats,
                    luggage_capacity = :luggage_capacity
                WHERE id = :car_id
            '''), {
                'fuel': data.get('fuel'),
                'transmission': data.get('transmission'),
                'category': data.get('category'),
                'marca_id': data.get('marca_id'),
                'model_id': data.get('model_id'),
                'drive_type': data.get('drive_type'),
                'seats': data.get('seats'),
                'luggage_capacity': data.get('luggage_capacity'),
                'car_id': car_id
            })
            
            # Update price if provided
            if 'base_value' in data or 'currency' in data:
                conn.execute(text('''
                    UPDATE price SET 
                        base_value = :base_value, 
                        currency = :currency 
                    WHERE id = (SELECT price_id FROM car WHERE id = :car_id)
                '''), {
                    'base_value': data.get('base_value'),
                    'currency': data.get('currency', 'Lei'),
                    'car_id': car_id
                })
            
            conn.commit()
            
            return jsonify({'message': 'Car updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@blueprint.route('/api/cars/<int:car_id>', methods=['DELETE'])
def cars_delete(car_id):
    """Delete car"""
    try:
        with db.engine.connect() as conn:
            # Get price_id first
            price_result = conn.execute(text('SELECT price_id FROM car WHERE id = :car_id'), {'car_id': car_id})
            price_row = price_result.fetchone()
            
            if price_row:
                price_id = price_row[0]
                
                # Delete car
                conn.execute(text('DELETE FROM car WHERE id = :car_id'), {'car_id': car_id})
                
                # Delete price
                conn.execute(text('DELETE FROM price WHERE id = :price_id'), {'price_id': price_id})
                
                conn.commit()
                
                return jsonify({'message': 'Car deleted successfully'})
            else:
                return jsonify({'error': 'Car not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@blueprint.route('/api/marcas', methods=['GET'])
def marcas_list():
    """Get marcas list"""
    try:
        from apps import db
        result = db.session.execute(text('SELECT id, name FROM marca ORDER BY name'))
        marcas = [{'id': row[0], 'name': row[1]} for row in result.fetchall()]
        return jsonify(marcas)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@blueprint.route('/api/models', methods=['GET'])
def models_list():
    """Get models list for a marca"""
    try:
        marca_id = request.args.get('marca_id')
        if not marca_id:
            return jsonify({'error': 'marca_id is required'}), 400
        
        from apps import db
        result = db.session.execute(text('SELECT id, name FROM model WHERE marca_id = :marca_id ORDER BY name'), 
                                {'marca_id': marca_id})
        models = [{'id': row[0], 'name': row[1]} for row in result.fetchall()]
        return jsonify(models)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Banner editor API endpoints
@blueprint.route('/api/banner-data', methods=['GET'])
def get_banner_data():
    """Get current banner data from files"""
    try:
        index_path = "/usr/Projects/Carento_v2.0.0_Unzip-First/2.Carento_Development_SourceCode/dist/index.html"
        css_path = find_css_file()
        if not css_path:
            return jsonify({'error': 'CSS file not found'}), 500
        
        data = {
            'title': '',
            'subtitle': '',
            'description': '',
            'background_image': ''
        }
        
        # Read title and subtitle from HTML
        if os.path.exists(index_path):
            with open(index_path, 'r', encoding='utf-8') as f:
                content = f.read()
            import re
            
            # Extract title - ищем h1 с классом hero-title
            title_match = re.search(r'<h1[^>]*class="[^"]*hero-title[^"]*"[^>]*>(.*?)</h1>', content)
            if title_match:
                data['title'] = title_match.group(1)
            
            # Extract subtitle - ищем h2 или p с классом hero-subtitle
            subtitle_match = re.search(r'<(h2|p)[^>]*class="[^"]*hero-subtitle[^"]*"[^>]*>(.*?)</\1>', content)
            if subtitle_match:
                data['subtitle'] = subtitle_match.group(2)
            
            # Extract description - ищем p с классом hero-description или small
            desc_match = re.search(r'<p[^>]*class="[^"]*hero-description[^"]*"[^>]*>(.*?)</p>', content)
            if not desc_match:
                desc_match = re.search(r'<small[^>]*>(.*?)</small>', content)
            if desc_match:
                data['description'] = desc_match.group(1)
        
        # Read background image from CSS
        if os.path.exists(css_path):
            with open(css_path, 'r', encoding='utf-8') as f:
                css_content = f.read()
            import re
            
            # Ищем background-image в CSS для hero секции
            patterns = [
                r'\.banner-hero\.hero-1[^}]*background-image:\s*url\(([^)]*)\)',
                r'\.banner-hero\.hero-2[^}]*background-image:\s*url\(([^)]*)\)',
                r'\.block-banner-home1[^}]*background-image:\s*url\(([^)]*)\)',
                r'\.box-section[^}]*background-image:\s*url\(([^)]*)\)',
                r'\.hero[^}]*background-image:\s*url\(([^)]*)\)',
                r'\.banner[^}]*background-image:\s*url\(([^)]*)\)'
            ]
            
            for pattern in patterns:
                bg_match = re.search(pattern, css_content)
                if bg_match:
                    data['background_image'] = bg_match.group(1)
                    break
        
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def update_index_html(title, subtitle, description):
    """Update HTML content in index.html"""
    try:
        index_path = "/usr/Projects/Carento_v2.0.0_Unzip-First/2.Carento_Development_SourceCode/dist/index.html"
        
        if os.path.exists(index_path):
            with open(index_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            import re
            
            # Update title
            if title:
                content = re.sub(r'<h1[^>]*class="[^"]*hero-title[^"]*"[^>]*>.*?</h1>', 
                               f'<h1 class="hero-title text-white text-xl-bold wow fadeInUp">{title}</h1>', content)
            
            # Update subtitle
            if subtitle:
                content = re.sub(r'<(h2|p)[^>]*class="[^"]*hero-subtitle[^"]*"[^>]*>.*?</\1>', 
                               f'<h2 class="hero-subtitle wow fadeInUp">{subtitle}</h2>', content)
            
            # Update description
            if description:
                content = re.sub(r'<p[^>]*class="[^"]*hero-description[^"]*"[^>]*>.*?</p>', 
                               f'<p class="hero-description wow fadeInUp">{description}</p>', content)
            
            with open(index_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            return True
    except Exception as e:
        print(f"Error updating HTML: {e}")
        return False

def update_background_image_in_css(image_url):
    """Update background image in CSS"""
    try:
        css_path = find_css_file()
        if not css_path:
            return jsonify({'error': 'CSS file not found'}), 500
        
        if os.path.exists(css_path):
            with open(css_path, 'r', encoding='utf-8') as f:
                    content = f.read()
        
            import re
            
            # Update background image for hero section
            if image_url:
                # Ищем и заменяем background-image в hero секции
                # Ищем более специфичные селекторы для hero секции
                patterns = [
                    r'(\.banner-hero\.hero-1[^}]*background-image:\s*)url\([^)]*\)',
                    r'(\.banner-hero\.hero-2[^}]*background-image:\s*)url\([^)]*\)',
                    r'(\.block-banner-home1[^}]*background-image:\s*)url\([^)]*\)',
                    r'(\.box-section[^}]*background-image:\s*)url\([^)]*\)',
                    r'(\.hero[^}]*background-image:\s*)url\([^)]*\)',
                    r'(\.banner[^}]*background-image:\s*)url\([^)]*\)'
                ]
                
                # Сначала попробуем заменить существующие
                replaced = False
                for pattern in patterns:
                    if re.search(pattern, content):
                        content = re.sub(pattern, f'\\1url({image_url})', content)
                        replaced = True
                        break
                
                # Если не нашли существующий, добавим новый
                if not replaced:
                    # Добавляем новый CSS правило в конец файла
                    new_css = f"\n.banner-hero.hero-1 {{\n  background-image: url({image_url}) !important;\n  background-size: cover;\n  background-position: center;\n  background-repeat: no-repeat;\n}}\n.block-banner-home1 {{\n  background-image: url({image_url}) !important;\n  background-size: cover;\n  background-position: center;\n  background-repeat: no-repeat;\n}}"
                    content += new_css
            
            with open(css_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            return True
    except Exception as e:
        print(f"Error updating CSS: {e}")
        return False

@blueprint.route('/api/banner-update', methods=['POST'])
def update_banner():
    """Update banner content"""
    try:
        data = request.get_json()
        
        title = data.get('title', '')
        subtitle = data.get('subtitle', '')
        description = data.get('description', '')
        background_image = data.get('background_image', '')
        
        # Update HTML content
        html_success = update_index_html(title, subtitle, description)
        
        # Update CSS background image
        css_success = update_background_image_in_css(background_image)
        
        if html_success and css_success:
            return jsonify({'message': 'Banner updated successfully'})
        else:
            return jsonify({'error': 'Failed to update banner'}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@blueprint.route('/api/banner-upload', methods=['POST'])
def upload_banner_image():
    """Upload banner background image"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file:
            # Create uploads directory if it doesn't exist
            upload_dir = "/usr/Projects/Carento_v2.0.0_Unzip-First/2.Carento_Development_SourceCode/dist/assets/imgs/banners"
            os.makedirs(upload_dir, exist_ok=True)
            
            # Generate unique filename
            filename = secure_filename(file.filename)
            import time
            timestamp = str(int(time.time()))
            name, ext = os.path.splitext(filename)
            filename = f"{name}_{timestamp}{ext}"
            
            # Save file
            file_path = os.path.join(upload_dir, filename)
            file.save(file_path)
            
            # Return relative path for CSS
            relative_path = f"../imgs/banners/{filename}"
            
            return jsonify({
                'message': 'Image uploaded successfully',
                'filename': filename,
                'path': relative_path
            })
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Generic route for other templates (must be last)
@blueprint.route('/<template>')
def route_template(template):
    """Generic route for other templates"""
    try:
        return render_template(f'pages/{template}.html', segment=template)
    except Exception as e:
        return render_template('pages/404.html', segment='404'), 404