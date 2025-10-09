from flask import Blueprint, request, jsonify
from app import db
from app.models.product import Product
from app.models.user import User
from app.models.order import Order
from app.utils.permissions import admin_required
from app.schemas.product_schema import products_schema, product_schema
from app.schemas.user_schema import users_schema
from app.schemas.order_schema import orders_schema
from flask_jwt_extended import jwt_required as jwt_required_jwt  # Avoid name conflict

admin_bp = Blueprint('admin', __name__)

# Product Management
@admin_bp.route('/products', methods=['GET'])
@admin_required
def get_all_products():
    try:
        products = Product.query.all()
        return jsonify(products_schema.dump(products))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/products', methods=['POST'])
@admin_required
def create_product():
    try:
        data = request.get_json()

        # Create new product
        product = Product(
            name=data['name'],
            description=data.get('description', ''),
            price=data['price'],
            stock_quantity=data['stock_quantity'],
            image_url=data.get('image_url', ''),
            category=data.get('category', '')
        )

        # If image_data provided, save it
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

@admin_bp.route('/products/<int:product_id>', methods=['PUT'])
@admin_required
def update_product(product_id):
    try:
        product = Product.query.get_or_404(product_id)
        data = request.get_json()

        # Update basic fields
        product.name = data.get('name', product.name)
        product.description = data.get('description', product.description)
        product.price = data.get('price', product.price)
        product.stock_quantity = data.get('stock_quantity', product.stock_quantity)
        product.category = data.get('category', product.category)

        # Handle image update logic
        if 'image_data' in data and data['image_data']:
            product.set_image_from_base64(data['image_data'])
            
        if 'image_url' in data and data['image_url']:
            product.image_url = data['image_url']

        db.session.commit()

        return jsonify({
            'message': 'Product updated successfully',
            'product': product_schema.dump(product)
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@admin_bp.route('/products/<int:product_id>', methods=['DELETE'])
@admin_required
def delete_product(product_id):
    try:
        product = Product.query.get_or_404(product_id)
        
        # First, delete all related order items
        from app.models.order_item import OrderItem
        OrderItem.query.filter_by(product_id=product_id).delete()
        
        # Then delete the product
        db.session.delete(product)
        db.session.commit()
        
        return jsonify({'message': 'Product deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error deleting product {product_id}: {str(e)}")
        return jsonify({'error': str(e)}), 400

# User Management
@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    try:
        users = User.query.all()
        return jsonify(users_schema.dump(users))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Order Management
@admin_bp.route('/orders', methods=['GET'])
@admin_required
def get_all_orders():
    try:
        orders = Order.query.order_by(Order.created_at.desc()).all()
        
        # Manually serialize to avoid relationship issues
        orders_data = []
        for order in orders:
            order_data = order.to_dict()
            orders_data.append(order_data)
            
        return jsonify(orders_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Dashboard Stats
@admin_bp.route('/stats', methods=['GET'])
@admin_required 
def get_dashboard_stats():
    try:
        total_users = User.query.count()
        total_products = Product.query.count()
        total_orders = Order.query.count()
        total_revenue_result = db.session.query(db.func.sum(Order.total_amount)).scalar()
        total_revenue = float(total_revenue_result or 0)
        
        return jsonify({
            'total_users': total_users,
            'total_products': total_products,
            'total_orders': total_orders,
            'total_revenue': total_revenue
        })
        
    except Exception as e:
        print(f"❌ Error in get_dashboard_stats: {str(e)}")
        return jsonify({'error': str(e)}), 500