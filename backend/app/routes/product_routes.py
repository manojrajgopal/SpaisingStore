from flask import Blueprint, request, jsonify
from app import db
from app.models.product import Product
from app.schemas.product_schema import products_schema, product_schema
from app.utils.permissions import admin_required
from app.utils.permissions import jwt_required
import traceback

product_bp = Blueprint('products', __name__)

@product_bp.route('/', methods=['GET', 'OPTIONS'])
def get_products():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    
    try:
        
        # Get query parameters for filtering
        category = request.args.get('category')
        search = request.args.get('search')
        min_price = request.args.get('min_price')
        max_price = request.args.get('max_price')
        
        query = Product.query
        
        if category:
            query = query.filter(Product.category == category)
        if search:
            query = query.filter(Product.name.ilike(f'%{search}%'))
        if min_price:
            try:
                query = query.filter(Product.price >= float(min_price))
            except ValueError:
                return jsonify({'error': 'Invalid min_price format'}), 400
        if max_price:
            try:
                query = query.filter(Product.price <= float(max_price))
            except ValueError:
                return jsonify({'error': 'Invalid max_price format'}), 400
        
        products = query.all()
        
        # Use schema instead of to_dict() for consistency
        result = products_schema.dump(products)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@product_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    try:
        product = Product.query.get_or_404(product_id)
        return jsonify(product_schema.dump(product))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@product_bp.route('/categories', methods=['GET'])
def get_categories():
    try:
        categories = db.session.query(Product.category).distinct().all()
        categories = [cat[0] for cat in categories if cat[0]]
        return jsonify(categories)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@product_bp.route('', methods=['POST'])
@jwt_required
@admin_required
def create_product():
    try:
        data = request.get_json()
        
        product = Product(
            name=data['name'],
            description=data.get('description', ''),
            price=float(data['price']),
            stock_quantity=int(data.get('stock_quantity', 0)),
            category=data.get('category', ''),
            image_url=data.get('image_url', '')
        )
        
        if data.get('image_data'):
            product.set_image_from_base64(data['image_data'])
        
        db.session.add(product)
        db.session.commit()
        
        return jsonify({
            'message': 'Product created successfully',
            'product': product_schema.dump(product)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@product_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required
@admin_required
def update_product(product_id):
    try:
        product = Product.query.get_or_404(product_id)
        data = request.get_json()
        
        product.name = data.get('name', product.name)
        product.description = data.get('description', product.description)
        product.price = float(data.get('price', product.price))
        product.stock_quantity = int(data.get('stock_quantity', product.stock_quantity))
        product.category = data.get('category', product.category)
        product.image_url = data.get('image_url', product.image_url)
        
        if data.get('image_data'):
            product.set_image_from_base64(data['image_data'])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Product updated successfully',
            'product': product_schema.dump(product)
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@product_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required
@admin_required
def delete_product(product_id):
    try:
        product = Product.query.get_or_404(product_id)
        
        db.session.delete(product)
        db.session.commit()
        
        return jsonify({'message': 'Product deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400