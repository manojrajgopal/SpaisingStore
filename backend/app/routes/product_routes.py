from flask import Blueprint, request, jsonify
from app import db
from app.models.product import Product
from app.schemas.product_schema import products_schema, product_schema
from app.utils.permissions import jwt_required, admin_required
import traceback

product_bp = Blueprint('products', __name__)

@product_bp.route('/', methods=['GET', 'OPTIONS'])
def get_products():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    
    try:
        print("🔍 GET /api/products endpoint hit")  # Debug log
        
        # Get query parameters for filtering
        category = request.args.get('category')
        search = request.args.get('search')
        min_price = request.args.get('min_price')
        max_price = request.args.get('max_price')
        
        query = Product.query
        print(f"🔍 Initial query: {query}")  # Debug log
        
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
        
        print(f"🔍 Final query: {query}")  # Debug log
        products = query.all()
        print(f"🔍 Found {len(products)} products")  # Debug log
        
        # Use schema instead of to_dict() for consistency
        result = products_schema.dump(products)
        print(f"🔍 Serialized result: {len(result)} items")  # Debug log
        
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ Error in get_products: {str(e)}")
        print(f"🔍 Traceback: {traceback.format_exc()}")  # Detailed error info
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@product_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    try:
        print(f"🔍 GET /api/products/{product_id}")  # Debug log
        product = Product.query.get_or_404(product_id)
        return jsonify(product_schema.dump(product))
    except Exception as e:
        print(f"❌ Error in get_product: {str(e)}")
        return jsonify({'error': str(e)}), 500

@product_bp.route('/categories', methods=['GET'])
def get_categories():
    try:
        print("🔍 GET /api/products/categories")  # Debug log
        categories = db.session.query(Product.category).distinct().all()
        categories = [cat[0] for cat in categories if cat[0]]
        return jsonify(categories)
    except Exception as e:
        print(f"❌ Error in get_categories: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Admin routes remain the same...
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