from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.product import Product
from app.models.user import User
import json

cart_bp = Blueprint('cart', __name__)

# In-memory cart storage (use Redis in production)
user_carts = {}

def get_cart_for_user(user_id):
    """Get or create cart for user"""
    if user_id not in user_carts:
        user_carts[user_id] = []
    return user_carts[user_id]

@cart_bp.route('/', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_cart():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        user_id = get_jwt_identity()
        cart = get_cart_for_user(user_id)
        
        # Enrich cart items with product details
        enriched_cart = []
        for item in cart:
            product = Product.query.get(item['product_id'])
            if product:
                enriched_item = item.copy()
                enriched_item['product_name'] = product.name
                enriched_item['product_price'] = product.price
                enriched_item['product_image'] = product.get_image_url()
                enriched_item['available_stock'] = product.stock_quantity
                enriched_cart.append(enriched_item)
        
        return jsonify({
            'cart': enriched_cart,
            'total_items': len(cart),
            'total_amount': sum(item['quantity'] * item['price'] for item in cart)
        })
        
    except Exception as e:
        print(f"❌ Error in get_cart: {str(e)}")
        return jsonify({'error': 'Failed to fetch cart'}), 500

@cart_bp.route('/add', methods=['POST'])
@jwt_required()
def add_to_cart():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('product_id') or not data.get('quantity'):
            return jsonify({'error': 'Product ID and quantity are required'}), 422
        
        product_id = data['product_id']
        quantity = int(data['quantity'])
        
        # Check if product exists and has enough stock
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        if product.stock_quantity < quantity:
            return jsonify({'error': f'Only {product.stock_quantity} items available'}), 400
        
        cart = get_cart_for_user(user_id)
        
        # Check if product already in cart
        existing_item = next((item for item in cart if item['product_id'] == product_id), None)
        
        if existing_item:
            # Update quantity
            new_quantity = existing_item['quantity'] + quantity
            if product.stock_quantity < new_quantity:
                return jsonify({'error': f'Cannot add more than available stock'}), 400
            existing_item['quantity'] = new_quantity
        else:
            # Add new item
            cart.append({
                'product_id': product_id,
                'quantity': quantity,
                'price': product.price,
                'added_at': datetime.utcnow().isoformat()
            })
        
        return jsonify({
            'message': 'Product added to cart',
            'cart_item': {
                'product_id': product_id,
                'quantity': quantity,
                'product_name': product.name,
                'price': product.price
            }
        })
        
    except Exception as e:
        print(f"❌ Error in add_to_cart: {str(e)}")
        return jsonify({'error': str(e)}), 400

@cart_bp.route('/update', methods=['PUT'])
@jwt_required()
def update_cart_item():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or not data.get('product_id') or not data.get('quantity'):
            return jsonify({'error': 'Product ID and quantity are required'}), 422
        
        product_id = data['product_id']
        quantity = int(data['quantity'])
        
        if quantity <= 0:
            return jsonify({'error': 'Quantity must be positive'}), 400
        
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        if product.stock_quantity < quantity:
            return jsonify({'error': f'Only {product.stock_quantity} items available'}), 400
        
        cart = get_cart_for_user(user_id)
        item = next((item for item in cart if item['product_id'] == product_id), None)
        
        if not item:
            return jsonify({'error': 'Product not in cart'}), 404
        
        item['quantity'] = quantity
        item['price'] = product.price  # Update price in case it changed
        
        return jsonify({
            'message': 'Cart updated successfully',
            'cart_item': {
                'product_id': product_id,
                'quantity': quantity,
                'product_name': product.name,
                'price': product.price
            }
        })
        
    except Exception as e:
        print(f"❌ Error in update_cart_item: {str(e)}")
        return jsonify({'error': str(e)}), 400

@cart_bp.route('/remove/<int:product_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(product_id):
    try:
        user_id = get_jwt_identity()
        cart = get_cart_for_user(user_id)
        
        # Remove item from cart
        cart[:] = [item for item in cart if item['product_id'] != product_id]
        
        return jsonify({
            'message': 'Product removed from cart',
            'product_id': product_id
        })
        
    except Exception as e:
        print(f"❌ Error in remove_from_cart: {str(e)}")
        return jsonify({'error': str(e)}), 400

@cart_bp.route('/clear', methods=['DELETE'])
@jwt_required()
def clear_cart():
    try:
        user_id = get_jwt_identity()
        user_carts[user_id] = []
        
        return jsonify({'message': 'Cart cleared successfully'})
        
    except Exception as e:
        print(f"❌ Error in clear_cart: {str(e)}")
        return jsonify({'error': str(e)}), 400