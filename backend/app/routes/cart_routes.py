# app/routes/cart_routes.py - COMPLETELY FIXED VERSION
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.user import User
from sqlalchemy.orm import joinedload

cart_bp = Blueprint('cart', __name__)

def get_or_create_cart(user_id):
    """Get or create cart for user with eager loading"""
    cart = Cart.query.options(
        joinedload(Cart.items).joinedload(CartItem.product)
    ).get(user_id)
    
    if not cart:
        cart = Cart(user_id=user_id)
        db.session.add(cart)
        db.session.commit()
        # Reload with relationships
        cart = Cart.query.options(
            joinedload(Cart.items).joinedload(CartItem.product)
        ).get(user_id)
    return cart

@cart_bp.route('', methods=['GET', 'OPTIONS'])
@cart_bp.route('/', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_cart():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        user_id = int(get_jwt_identity())
        cart = get_or_create_cart(user_id)
        return jsonify(cart.to_dict())
        
    except Exception as e:
        print(f"Error fetching cart: {str(e)}")
        return jsonify({'error': 'Failed to fetch cart'}), 500

@cart_bp.route('/add', methods=['POST', 'OPTIONS'])
@jwt_required()
def add_to_cart():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data or not data.get('product_id'):
            return jsonify({'error': 'Product ID is required'}), 400
        
        product_id = data['product_id']
        quantity = int(data.get('quantity', 1))
        
        if quantity <= 0:
            return jsonify({'error': 'Quantity must be positive'}), 400
        
        # Check if product exists and has enough stock
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        cart = get_or_create_cart(user_id)
        
        # Check if product already in cart
        existing_item = next((item for item in cart.items if item.product_id == product_id), None)
        
        if existing_item:
            # Update quantity
            new_quantity = existing_item.quantity + quantity
            if product.stock_quantity < new_quantity:
                return jsonify({
                    'error': f'Only {product.stock_quantity} items available',
                    'available_stock': product.stock_quantity
                }), 400
            existing_item.quantity = new_quantity
        else:
            # Add new item
            if product.stock_quantity < quantity:
                return jsonify({
                    'error': f'Only {product.stock_quantity} items available',
                    'available_stock': product.stock_quantity
                }), 400
            
            cart_item = CartItem(
                cart_user_id=user_id,
                product_id=product_id,
                quantity=quantity
            )
            db.session.add(cart_item)
        
        db.session.commit()
        
        # Reload cart with updated data
        cart = get_or_create_cart(user_id)
        return jsonify({
            'message': 'Product added to cart',
            'cart': cart.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error adding to cart: {str(e)}")
        return jsonify({'error': str(e)}), 400

@cart_bp.route('/update', methods=['PUT', 'OPTIONS'])
@jwt_required()
def update_cart_item():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data or not data.get('product_id') or not data.get('quantity'):
            return jsonify({'error': 'Product ID and quantity are required'}), 400
        
        product_id = data['product_id']
        quantity = int(data['quantity'])
        
        if quantity <= 0:
            return jsonify({'error': 'Quantity must be positive'}), 400
        
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        if product.stock_quantity < quantity:
            return jsonify({
                'error': f'Only {product.stock_quantity} items available',
                'available_stock': product.stock_quantity
            }), 400
        
        cart = get_or_create_cart(user_id)
        cart_item = next((item for item in cart.items if item.product_id == product_id), None)
        
        if not cart_item:
            return jsonify({'error': 'Product not in cart'}), 404
        
        cart_item.quantity = quantity
        db.session.commit()
        
        # Reload cart with updated data
        cart = get_or_create_cart(user_id)
        return jsonify({
            'message': 'Cart updated successfully',
            'cart': cart.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error updating cart: {str(e)}")
        return jsonify({'error': str(e)}), 400

@cart_bp.route('/remove/<int:product_id>', methods=['DELETE', 'OPTIONS'])
@jwt_required()
def remove_from_cart(product_id):
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        user_id = int(get_jwt_identity())
        
        cart_item = CartItem.query.filter_by(
            cart_user_id=user_id, 
            product_id=product_id
        ).first()
        
        if not cart_item:
            return jsonify({'error': 'Product not found in cart'}), 404
        
        db.session.delete(cart_item)
        db.session.commit()
        
        cart = get_or_create_cart(user_id)
        return jsonify({
            'message': 'Product removed from cart',
            'cart': cart.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error removing from cart: {str(e)}")
        return jsonify({'error': str(e)}), 400

@cart_bp.route('/clear', methods=['DELETE', 'OPTIONS'])
@jwt_required()
def clear_cart():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        user_id = int(get_jwt_identity())
        
        # Delete all cart items for this user
        CartItem.query.filter_by(cart_user_id=user_id).delete()
        db.session.commit()
        
        cart = get_or_create_cart(user_id)
        return jsonify({
            'message': 'Cart cleared successfully',
            'cart': cart.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error clearing cart: {str(e)}")
        return jsonify({'error': str(e)}), 400