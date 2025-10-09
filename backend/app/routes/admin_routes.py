from flask import Blueprint, request, jsonify
from app import db
from app.models.product import Product
from app.models.user import User
from app.models.order import Order
from app.utils.permissions import admin_required
from app.schemas.product_schema import products_schema, product_schema
from app.schemas.user_schema import users_schema, user_schema
from app.schemas.order_schema import orders_schema
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.orm import joinedload

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

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        # Prevent admin from modifying their own admin status
        current_user_id = get_jwt_identity()
        
        if int(current_user_id) == user_id and 'is_admin' in data:
            return jsonify({'error': 'Cannot modify your own admin status'}), 400
        
        # Update user fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'email' in data:
            # Check if email already exists
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user_id:
                return jsonify({'error': 'Email already exists'}), 400
            user.email = data['email']
        if 'is_admin' in data:
            user.is_admin = bool(data['is_admin'])
        
        db.session.commit()
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user_schema.dump(user)
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        
        # Prevent admin from deleting themselves
        current_user_id = get_jwt_identity()
        if int(current_user_id) == user_id:
            return jsonify({'error': 'Cannot delete your own account'}), 400
        
        # Delete user's orders and order items first
        from app.models.order import Order
        from app.models.order_item import OrderItem
        
        orders = Order.query.filter_by(user_id=user_id).all()
        for order in orders:
            OrderItem.query.filter_by(order_id=order.id).delete()
            db.session.delete(order)
        
        # Delete the user
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'User deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# Order Management
@admin_bp.route('/orders', methods=['GET'])
@admin_required
def get_all_orders():
    try:
        # FIX: Use eager loading to avoid N+1 queries
        orders = Order.query.options(
            joinedload(Order.order_items)  # Eager load order_items
        ).order_by(Order.created_at.desc()).all()
        
        # Manually serialize to avoid relationship issues
        orders_data = []
        for order in orders:
            order_data = order.to_dict()
            orders_data.append(order_data)
            
        return jsonify(orders_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/orders/<int:order_id>', methods=['GET'])
@admin_required
def get_order_detail(order_id):
    try:
        order = Order.query.options(
            joinedload(Order.order_items)
        ).get_or_404(order_id)
        
        return jsonify(order.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@admin_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@admin_required
def update_order_status(order_id):
    try:
        # FIX: Use eager loading to avoid N+1 queries
        order = Order.query.options(
            joinedload(Order.order_items)
        ).get_or_404(order_id)
        
        data = request.get_json()
        
        if not data.get('status'):
            return jsonify({'error': 'Status is required'}), 400
            
        if order.update_status(data['status']):
            db.session.commit()
            return jsonify({
                'message': 'Order status updated successfully',
                'order': order.to_dict()
            })
        else:
            return jsonify({'error': 'Invalid status'}), 400
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

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
        return jsonify({'error': str(e)}), 500