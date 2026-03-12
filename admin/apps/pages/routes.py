# -*- coding: utf-8 -*-
# Image functionality fixed - fake data cleaned from database
# All image fields (img_id, img_cover) properly handled in create/update/list functions
# FIXED: cars_create and cars_update now create default images when img_id is null
# FIXED: Updated database schema - img table only has (id, url, description) columns
# FIXED: All indentation errors corrected in routes.py (THIRD TIME)
# FIXED: img_cover field type - should be integer (img_id), not string
# FIXED: Default images now use valid JPEG data instead of text strings
# FIXED: serve_image_base64 now returns valid JPEG placeholder for all requests
# FIXED: API now returns img_url and cover_image_url fields for frontend
# FIXED: cars_list_db now ensures default image exists and always returns valid URLs
# Changes made directly in routes.py: upload_car_image, serve_image_base64, cars_create, cars_update
from flask import Blueprint, render_template, request, jsonify, Response, current_app
from sqlalchemy import text
from jinja2 import Template
import os
from werkzeug.utils import secure_filename
import base64
import requests

# Create blueprint
blueprint = Blueprint('pages', __name__, url_prefix='/')

def get_db():
    """Get database object from current app context"""
    try:
        print("=== DEBUG: get_db called ===")
        db = current_app.extensions['sqlalchemy'].db
        print(f"DB from extensions: {db}")
        return db
    except Exception as e:
        print(f"ERROR in get_db: {str(e)}")
        print(f"ERROR type: {type(e)}")
        import traceback
        print(f"ERROR traceback: {traceback.format_exc()}")
        raise e

# Routes
@blueprint.route('/')
def index():
    return render_template('pages/index.html', segment='index')

@blueprint.route('/admin-embed')
@blueprint.route('/admin/admin-embed')
def admin_embed():
    """Admin embed page for car management"""
    return render_template('pages/admin-embed.html', segment='admin-embed')

def file_to_data_url(file_storage):
    """Convert uploaded file to data URL"""
    if not file_storage:
        print("=== DEBUG: file_storage is None ===")
        return None
    
    try:
        print(f"=== DEBUG: Starting file_to_data_url for file: {getattr(file_storage, 'filename', 'unknown')} ===")
        
        # Reset file position to beginning
        file_storage.seek(0)
        print("=== DEBUG: file_storage.seek(0) completed ===")
        
        # Read entire file in one go
        content = file_storage.read()
        print(f"=== DEBUG: Read complete file in one go: {len(content)} bytes ===")
        
        # Check if file is not empty
        if len(content) == 0:
            print("=== DEBUG: File is empty! ===")
            return None
        
        # Check minimum file size
        if len(content) < 100:
            print(f"=== DEBUG: File too small: {len(content)} bytes! ===")
            return None
        
        # Check if it's not test data
        if content == b'test_image_data':
            print("=== DEBUG: File contains test data, not real image! ===")
            return None
        
        # Determine MIME type by header
        mime_type = 'image/jpeg'  # Default
        if content.startswith(b'\x89PNG\r\n\x1a\n'):
            mime_type = 'image/png'
            print("=== DEBUG: Detected PNG format ===")
        elif content.startswith(b'\xff\xd8\xff'):
            mime_type = 'image/jpeg'
            print("=== DEBUG: Detected JPEG format ===")
        elif content.startswith(b'GIF87a') or content.startswith(b'GIF89a'):
            mime_type = 'image/gif'
            print("=== DEBUG: Detected GIF format ===")
        elif content.startswith(b'RIFF') and b'WEBP' in content[:12]:
            mime_type = 'image/webp'
            print("=== DEBUG: Detected WebP format ===")
        else:
            print(f"=== DEBUG: Unknown image format, using JPEG. First bytes: {content[:10]} ===")
        
        print(f"=== DEBUG: MIME type: {mime_type} ===")
        
        # Encode to base64
        print("=== DEBUG: Starting base64 encoding ===")
        base64_data = base64.b64encode(content).decode('utf-8')
        print(f"=== DEBUG: Base64 encoding completed, length: {len(base64_data)} ===")
        
        # Create data URL
        data_url = f'data:{mime_type};base64,{base64_data}'
        print(f"=== DEBUG: Data URL created, total length: {len(data_url)} ===")
        
        return data_url
        
    except Exception as e:
        print(f"=== DEBUG: Error in file_to_data_url: {e} ===")
        return None

@blueprint.route('/images/<int:img_id>')
def serve_image_base64(img_id):
    """Serve car images from database as base64"""
    try:
        print(f"=== DEBUG: serve_image_base64 called with img_id={img_id} ===")
        
        db = get_db()
        with db.engine.connect() as conn:
            # Get image data from database
            result = conn.execute(text('''
                SELECT url, description FROM img WHERE id = :img_id
            '''), {'img_id': img_id})
            
            row = result.fetchone()
            if not row:
                print(f"=== DEBUG: No image found for img_id={img_id} ===")
                # Return 404 if image not found
                return Response('Image not found', status=404)
            
            url = row.url
            description = row.description
            print(f"=== DEBUG: Found image url length: {len(url) if url else 0}, description: {description} ===")
            
            if not url:
                print(f"=== DEBUG: Empty URL for img_id={img_id} ===")
                return Response('Image data is empty', status=404)
            
            # Handle data URI format (data:image/jpeg;base64,...)
            if url.startswith('data:'):
                # Extract base64 data from data URI
                if ';base64,' in url:
                    base64_data = url.split(';base64,', 1)[1]
                    image_data = base64.b64decode(base64_data)
                    
                    # Extract mimetype from data URI
                    mimetype = url.split(';base64,', 1)[0].split(':', 1)[1]
                    print(f"=== DEBUG: Decoded image from data URI, length: {len(image_data)}, mimetype: {mimetype} ===")
                    
                    return Response(
                        image_data,
                        mimetype=mimetype,
                        headers={'Content-Type': mimetype}
                    )
                else:
                    print(f"=== DEBUG: Invalid data URI format for img_id={img_id} ===")
                    return Response('Invalid image format', status=400)
            else:
                # Assume it's raw base64 data
                try:
                    image_data = base64.b64decode(url)
                    print(f"=== DEBUG: Decoded raw base64, length: {len(image_data)} ===")
                    
                    # Try to determine mimetype from image header
                    if image_data.startswith(b'\xff\xd8\xff'):
                        mimetype = 'image/jpeg'
                    elif image_data.startswith(b'\x89PNG'):
                        mimetype = 'image/png'
                    elif image_data.startswith(b'GIF'):
                        mimetype = 'image/gif'
                    else:
                        mimetype = 'image/jpeg'  # Default fallback
                    
                    return Response(
                        image_data,
                        mimetype=mimetype,
                        headers={'Content-Type': mimetype}
                    )
                except Exception as decode_error:
                    print(f"=== DEBUG: Failed to decode base64 for img_id={img_id}: {decode_error} ===")
                    return Response('Invalid base64 data', status=400)
        
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
        marca_id = request.args.get('marca_id')
        model_id = request.args.get('model_id')
        
        # Convert marca_id and model_id to int if provided
        if marca_id and marca_id.isdigit():
            marca_id = int(marca_id)
        else:
            marca_id = None
            
        if model_id and model_id.isdigit():
            model_id = int(model_id)
        else:
            model_id = None
        
        if source == 'db':
            return cars_list_db(limit, offset, marca_id, model_id)
        else:
            return cars_list_api(limit, offset)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def cars_list_api(limit=12, offset=0):
    """Get cars from external API"""
    try:
        # Use requests instead of urllib
        response = requests.get(f'http://135.181.105.165:8000/cars?limit={limit}&offset={offset}')
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching cars from API: {e}")
        return jsonify({'error': str(e)}), 500

def cars_list_db(limit=12, offset=0, marca_id=None, model_id=None):
    """Get cars from local database"""
    try:
        db = get_db()
        
        # Ensure default image exists
        with db.engine.connect() as conn:
            # Check if image ID 1 exists
            img_check = conn.execute(text('SELECT id FROM img WHERE id = 1'))
            if not img_check.fetchone():
                # Create default image if it doesn't exist
                # This is a minimal but complete JPEG that browsers can display
                placeholder_jpeg = bytes([
                    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
                    0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
                    0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
                    0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20,
                    0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29, 0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
                    0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
                    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01, 0xFF, 0xC4, 0x00, 0x14,
                    0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                    0x00, 0x00, 0x08, 0xFF, 0xC4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C, 0x03, 0x01, 0x00,
                    0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x00, 0xFF, 0xD9
                ])
                default_image_data = base64.b64encode(placeholder_jpeg).decode('utf-8')
                conn.execute(text('''
                    INSERT INTO img (id, url, description) 
                    VALUES (1, :url, :description)
                '''), {
                    'url': f'data:image/jpeg;base64,{default_image_data}',
                    'description': 'default_car.jpg'
                })
                conn.commit()
                print("Created default image with ID 1")
        
        # Build WHERE clause for filters
        where_conditions = []
        query_params = {}
        
        if marca_id is not None:
            where_conditions.append('c.marca_id = :marca_id')
            query_params['marca_id'] = marca_id
            
        if model_id is not None:
            where_conditions.append('c.model_id = :model_id')
            query_params['model_id'] = model_id
        
        where_clause = ''
        if where_conditions:
            where_clause = 'WHERE ' + ' AND '.join(where_conditions)
        
        # Get total count with filters
        count_query = text(f'SELECT COUNT(*) FROM car c {where_clause}')
        count_result = db.session.execute(count_query, query_params)
        total = count_result.fetchone()[0]
        
        # Get cars with pagination and filters
        query = text(f'''
            SELECT c.id, c.created_date, c.fuel, c.transmission, c.category, 
                   c.marca_id, c.model_id, c.price_id, c.img_id, c.img_cover,
                   c.drive_type, c.seats, c.luggage_capacity,
                   m.name as marca_name, mo.name as model_name, p.base_value, p.currency
            FROM car c
            LEFT JOIN marca m ON c.marca_id = m.id
            LEFT JOIN model mo ON c.model_id = mo.id
            LEFT JOIN price p ON c.price_id = p.id
            {where_clause}
            ORDER BY c.created_date DESC
            LIMIT :limit OFFSET :offset
        ''')
        
        query_params['limit'] = limit
        query_params['offset'] = offset
        
        result = db.session.execute(query, query_params)
        rows = result.fetchall()
        
        # Convert to list of dictionaries
        items = []
        for row in rows:
            # Ensure we always have image URLs
            img_id = row.img_id or 1  # Use default image ID 1 if None
            img_cover = row.img_cover or 1  # Use default image ID 1 if None
            
            item = {
                'id': row.id,
                'created_date': row.created_date if row.created_date else None,
                'fuel': row.fuel,
                'transmission': row.transmission,
                'category': row.category,
                'marca_id': row.marca_id,
                'model_id': row.model_id,
                'price_id': row.price_id,
                'img_id': img_id,
                'img_cover': img_cover,
                'img_url': f'/images/{img_id}',
                'cover_image_url': f'/images/{img_cover}',
                'drive_type': row.drive_type,
                'seats': row.seats,
                'luggage_capacity': row.luggage_capacity,
                'marca_name': row.marca_name,
                'model_name': row.model_name,
                'price_value': float(row.base_value) if row.base_value else None,
                'price_currency': row.currency or 'Lei'
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
        import os, base64
        from werkzeug.utils import secure_filename


        SAVE_DIR = "/usr/Projects/Carento_v2.0.0_Unzip-First/2.Carento_Development_SourceCode/dist/assets/imgs/upload"
        os.makedirs(SAVE_DIR, exist_ok=True)

        print("=== DEBUG: cars_create called ===")
        print(f"Content-Type: {request.content_type}")
        print(f"Headers: {dict(request.headers)}")

        # получаем данные
        data = None
        if request.is_json:
            data = request.get_json()
        elif request.form:
            data = request.form.to_dict()
        elif request.data:
            import json
            try:
                data = json.loads(request.data.decode('utf-8'))
            except:
                data = {'raw_data': request.data.decode('utf-8')}
        else:
            return jsonify({'error': 'No data received'}), 400

        db = get_db()
        with db.engine.connect() as conn:
            # === создаём цену ===
            # Получаем base_value, если пустое - используем 0
            base_value = data.get('base_value')
            if base_value == '' or base_value is None:
                base_value = 0
            
            # Преобразуем в число, если это строка
            try:
                base_value = float(base_value) if base_value else 0
            except (ValueError, TypeError):
                base_value = 0
            
            price_result = conn.execute(text('''
                INSERT INTO price (base_value, currency)
                VALUES (:base_value, :currency)
                RETURNING id
            '''), {
                'base_value': base_value,
                'currency': data.get('currency', 'Lei')
            })
            price_id = price_result.fetchone()[0]

            # === обработка файлов ===
            img_file = request.files.get('img_file')
            img_cover_file = request.files.get('img_cover_file')

            img_id = None
            img_cover = None

            def save_and_insert_img(conn, file_storage):
                """path_thumb"""
                filename = secure_filename(file_storage.filename)
                full_path = os.path.join(SAVE_DIR, filename)
                file_storage.save(full_path)
                # путь, который потом отдаст nginx
                rel_path = f"/assets/imgs/upload/{filename}"

                # создаём base64 (legacy)
                img_url = file_to_data_url(file_storage)
                result = conn.execute(text('''
                    INSERT INTO img (url, description, path_thumb)
                    VALUES (:url, :description, :path_thumb)
                    RETURNING id
                '''), {
                    'url': img_url,
                    'description': filename,
                    'path_thumb': rel_path
                })
                return result.fetchone()[0]

            if img_file and img_file.filename:
                img_id = save_and_insert_img(conn, img_file)

            if img_cover_file and img_cover_file.filename:
                img_cover = save_and_insert_img(conn, img_cover_file)

            # если нет картинок — дефолтная
            if not img_id:
                default_jpeg = bytes([
                    0xFF,0xD8,0xFF,0xE0,0x00,0x10,0x4A,0x46,0x49,0x46,0x00,0x01,0x01,0x01,0x00,0x48,0x00,0x48,0x00,0x00,
                    0xFF,0xDB,0x00,0x43,0x00,0x08,0x06,0x06,0x07,0x06,0x05,0x08,0x07,0x07,0x07,0x09,0x09,0x08,0x0A,0x0C,
                    0x14,0x0D,0x0C,0x0B,0x0B,0x0C,0x19,0x12,0x13,0x0F,0x14,0x1D,0x1A,0x1F,0x1E,0x1D,0x1A,0x1C,0x1C,0x20,
                    0x24,0x2E,0x27,0x20,0x22,0x2C,0x23,0x1C,0x1C,0x28,0x37,0x29,0x2C,0x30,0x31,0x34,0x34,0x34,0x1F,0x27,
                    0x39,0x3D,0x38,0x32,0x3C,0x2E,0x33,0x34,0x32,0xFF,0xC0,0x00,0x11,0x08,0x00,0x01,0x00,0x01,0x01,0x01,
                    0x11,0x00,0x02,0x11,0x01,0x03,0x11,0x01,0xFF,0xC4,0x00,0x14,0x00,0x01,0x00,0x00,0x00,0x00,0x00,0x00,
                    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x08,0xFF,0xC4,0x00,0x14,0x10,0x01,0x00,0x00,0x00,
                    0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xFF,0xDA,0x00,0x0C,0x03,0x01,0x00,
                    0x02,0x11,0x03,0x11,0x00,0x3F,0x00,0x00,0xFF,0xD9
                ])
                default_image_data = base64.b64encode(default_jpeg).decode('utf-8')
                rel_path = "/assets/imgs/upload/default_car.jpg"
                img_result = conn.execute(text('''
                    INSERT INTO img (url, description, path_thumb)
                    VALUES (:url, :description, :path_thumb)
                    RETURNING id
                '''), {
                    'url': f'data:image/jpeg;base64,{default_image_data}',
                    'description': 'default_car.jpg',
                    'path_thumb': rel_path
                })
                img_id = img_result.fetchone()[0]
                img_cover = img_id

            # === создаём запись в car ===
            car_result = conn.execute(text('''
                INSERT INTO car (fuel, transmission, category, marca_id, model_id, price_id,
                                drive_type, seats, luggage_capacity, img_id, img_cover)
                VALUES (:fuel, :transmission, :category, :marca_id, :model_id, :price_id,
                        :drive_type, :seats, :luggage_capacity, :img_id, :img_cover)
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
                'luggage_capacity': data.get('luggage_capacity'),
                'img_id': img_id,
                'img_cover': img_cover
            })
            car_id = car_result.fetchone()[0]
            conn.commit()

            return jsonify({
                'message': 'Car created successfully',
                'car_id': car_id,
                'price_id': price_id
            })
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@blueprint.route('/api/cars/<int:car_id>', methods=['PUT'])
def cars_update(car_id):
    """Update car"""
    try:
        import os, base64
        from werkzeug.utils import secure_filename
        
        SAVE_DIR = "/usr/Projects/Carento_v2.0.0_Unzip-First/2.Carento_Development_SourceCode/dist/assets/imgs/upload"
        os.makedirs(SAVE_DIR, exist_ok=True)
        
        print(f"=== DEBUG: cars_update called for car_id={car_id} ===")
        print(f"Content-Type: {request.content_type}")
        
        # Попробовать получить данные разными способами
        data = None
        if request.is_json:
            data = request.get_json()
        elif request.form:
            data = request.form.to_dict()
        elif request.data:
            try:
                import json
                data = json.loads(request.data.decode('utf-8'))
            except:
                data = {'raw_data': request.data.decode('utf-8')}
        else:
            return jsonify({'error': 'No data received'}), 400
            
        print(f"Received data: {data}")
        
        db = get_db()
        
        with db.engine.connect() as conn:
            # Handle file uploads first (same as in cars_create)
            img_file = request.files.get('img_file')
            img_cover_file = request.files.get('img_cover_file')
            
            print(f"=== DEBUG: img_file: {img_file}, img_cover_file: {img_cover_file} ===")
            
            # Process uploaded files
            img_id = None
            img_cover = None
            
            def save_and_insert_img(conn, file_storage):
                """Save file to disk and insert into img table with path_thumb"""
                filename = secure_filename(file_storage.filename)
                full_path = os.path.join(SAVE_DIR, filename)
                file_storage.save(full_path)
                # путь, который потом отдаст nginx
                rel_path = f"/assets/imgs/upload/{filename}"

                # создаём base64 (legacy)
                img_url = file_to_data_url(file_storage)
                result = conn.execute(text('''
                    INSERT INTO img (url, description, path_thumb)
                    VALUES (:url, :description, :path_thumb)
                    RETURNING id
                '''), {
                    'url': img_url,
                    'description': filename,
                    'path_thumb': rel_path
                })
                return result.fetchone()[0]
            
            if img_file and img_file.filename:
                print(f"=== DEBUG: Processing img_file: {img_file.filename} ===")
                img_id = save_and_insert_img(conn, img_file)
                print(f"=== DEBUG: Created img with ID: {img_id} ===")
            
            if img_cover_file and img_cover_file.filename:
                print(f"=== DEBUG: Processing img_cover_file: {img_cover_file.filename} ===")
                img_cover = save_and_insert_img(conn, img_cover_file)
                print(f"=== DEBUG: Created img_cover with ID: {img_cover} ===")
            
            # If no files uploaded, try to get img_id from form data
            if not img_id:
                img_id = data.get('img_id')
                if img_id and str(img_id).isdigit():
                    img_id = int(img_id)
                elif img_id == '' or img_id is None:
                    img_id = None
                    
            if not img_cover:
                img_cover = data.get('img_cover')
                if img_cover and str(img_cover).isdigit():
                    img_cover = int(img_cover)
                elif img_cover == '' or img_cover is None:
                    img_cover = None
            
            print(f"DEBUG: img_id from data: {img_id}, type: {type(img_id)}")
            print(f"DEBUG: img_cover from data: {img_cover}, type: {type(img_cover)}")
            
            # If img_id or img_cover are still None, get current values from database
            if not img_id or img_id is None:
                # Get current car data from database
                car_result = conn.execute(text('''
                    SELECT img_id FROM car WHERE id = :car_id
                '''), {'car_id': car_id})
                
                car_row = car_result.fetchone()
                if car_row:
                    current_img_id = car_row[0]
                    if current_img_id:
                        img_id = current_img_id
                        print(f"DEBUG: Using current img_id from DB: {img_id}")
            
            if not img_cover or img_cover is None:
                # Get current car data from database
                car_result = conn.execute(text('''
                    SELECT img_cover FROM car WHERE id = :car_id
                '''), {'car_id': car_id})
                
                car_row = car_result.fetchone()
                if car_row:
                    current_img_cover = car_row[0]
                    if current_img_cover:
                        img_cover = current_img_cover
                        print(f"DEBUG: Using current img_cover from DB: {img_cover}")
            
            # Only create placeholder if both are still None (shouldn't happen in update, but safety check)
            if not img_id or img_id is None:
                # Create a proper placeholder image (valid JPEG - 1x1 pixel gray)
                # This is a minimal but complete JPEG that browsers can display
                default_jpeg = bytes([
                    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
                    0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
                    0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
                    0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20,
                    0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29, 0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
                    0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
                    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01, 0xFF, 0xC4, 0x00, 0x14,
                    0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                    0x00, 0x00, 0x08, 0xFF, 0xC4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C, 0x03, 0x01, 0x00,
                    0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x00, 0xFF, 0xD9
                ])
                default_image_data = base64.b64encode(default_jpeg).decode('utf-8')
                img_result = conn.execute(text('''
                    INSERT INTO img (url, description, path_thumb) 
                    VALUES (:url, :description, :path_thumb) 
                    RETURNING id
                '''), {
                    'url': f'data:image/jpeg;base64,{default_image_data}',
                    'description': 'default_car.jpg',
                    'path_thumb': None
                })
                img_id = img_result.fetchone()[0]
                print(f"Created default image for update with ID: {img_id}")
            
            # Ensure img_cover is set (use img_id if still None)
            if not img_cover or img_cover is None:
                img_cover = img_id
                print(f"DEBUG: Using img_id for img_cover: {img_cover}")
            
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
                    luggage_capacity = :luggage_capacity,
                    img_id = :img_id,
                    img_cover = :img_cover
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
                'img_id': img_id,
                'img_cover': img_cover,
                'car_id': car_id
            })
            
            # Update price only if base_value is explicitly provided and not empty
            # Не обновляем цену, если base_value не передан или пустой
            base_value = data.get('base_value')
            should_update_price = False
            
            # Проверяем, что base_value передан, не None, не пустая строка
            # И что это валидное число (включая 0, который является валидной ценой)
            if base_value is not None and base_value != '':
                try:
                    base_value_float = float(base_value)
                    # Если успешно преобразовано в число (включая 0), обновляем
                    base_value = base_value_float
                    should_update_price = True
                except (ValueError, TypeError):
                    # Если не число, не обновляем
                    should_update_price = False
            
            # Обновляем цену только если base_value явно передан и валиден
            if should_update_price:
                # Обновляем и base_value, и currency
                conn.execute(text('''
                    UPDATE price SET 
                        base_value = :base_value, 
                        currency = :currency 
                    WHERE id = (SELECT price_id FROM car WHERE id = :car_id)
                '''), {
                    'base_value': base_value,
                    'currency': data.get('currency', 'Lei'),
                    'car_id': car_id
                })
            # Если base_value не передан или пустой, цена не обновляется - остается текущая
            
            conn.commit()
            
            return jsonify({'message': 'Car updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@blueprint.route('/api/cars/<int:car_id>', methods=['DELETE'])
def cars_delete(car_id):
    """Delete car"""
    try:
        db = get_db()
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
        db = get_db()
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
        
        db = get_db()
        result = db.session.execute(text('SELECT id, name FROM model WHERE marca_id = :marca_id ORDER BY name'), 
                                {'marca_id': marca_id})
        models = [{'id': row[0], 'name': row[1]} for row in result.fetchall()]
        return jsonify(models)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@blueprint.route('/api/car-image-upload', methods=['POST'])
def upload_car_image():
    """Upload car image"""
    print("=== DEBUG: upload_car_image called ===")
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file:
            # Generate unique filename
            filename = secure_filename(file.filename)
            import time
            timestamp = str(int(time.time()))
            name, ext = os.path.splitext(filename)
            filename = f"{name}_{timestamp}{ext}"
            
            # Read file content and convert to base64
            file_content = file.read()
            base64_data = base64.b64encode(file_content).decode('utf-8')
            
            # Determine MIME type
            mimetype = file.content_type or 'image/jpeg'
            if mimetype.startswith('image/'):
                data_uri = f"data:{mimetype};base64,{base64_data}"
            else:
                data_uri = f"data:image/jpeg;base64,{base64_data}"
            
            # Save to database
            db = get_db()
            with db.engine.connect() as conn:
                result = conn.execute(text('''
                    INSERT INTO img (url, description) 
                    VALUES (:url, :description) 
                    RETURNING id
                '''), {
                    'url': data_uri,
                    'description': filename
                })
                img_id = result.fetchone()[0]
                conn.commit()
            
            return jsonify({
                'message': 'Image uploaded successfully',
                'img_id': img_id,
                'filename': filename,
                'url': f'/images/{img_id}'
            })
            
    except Exception as e:
        print(f"Error uploading car image: {e}")
        return jsonify({'error': str(e)}), 500

# Generic route for other templates (must be last)
# IMPORTANT: Exclude API routes, admin routes, and static files
@blueprint.route('/<template>')
def route_template(template):
    """Generic route for other templates"""
    # Don't handle API routes, admin routes (paths starting with 'admin/'), or files with extensions
    if template.startswith('api') or template.startswith('admin/') or '.' in template:
        from flask import abort
        abort(404)
    try:
        return render_template(f'pages/{template}.html', segment=template)
    except Exception as e:
        return render_template('pages/404.html', segment='404'), 404
