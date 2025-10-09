from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.user import User
from app.utils.email_service import send_order_confirmation_email
import traceback

order_bp = Blueprint('orders', __name__)

@order_bp.route('/', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_user_orders():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        print("🔍 GET /api/orders endpoint hit")
        user_id_str = get_jwt_identity()
        
        # Convert string to integer
        try:
            user_id = int(user_id_str)
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid user identity in token'}), 401
            
        print(f"🔍 User ID from JWT: {user_id}")
        
        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
        print(f"🔍 Found {len(orders)} orders for user {user_id}")
        
        # Manually serialize to avoid relationship issues
        orders_data = []
        for order in orders:
            order_data = order.to_dict()
            orders_data.append(order_data)
            
        return jsonify(orders_data)
        
    except Exception as e:
        print(f"❌ Error in get_user_orders: {str(e)}")
        print(f"🔍 Traceback: {traceback.format_exc()}")
        return jsonify({'error': 'Failed to fetch orders', 'details': str(e)}), 500

@order_bp.route('/', methods=['POST'])
@jwt_required()
def create_order():
    try:
        user_id_str = get_jwt_identity()
        
        # Convert string to integer
        try:
            user_id = int(user_id_str)
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid user identity in token'}), 401
            
        data = request.get_json()
        
        print(f"🔍 Creating order for user {user_id}")
        print(f"🔍 Order data: {data}")
        
        # Validate required fields
        if not data or not data.get('items'):
            return jsonify({'error': 'Order items are required'}), 422
            
        if not data.get('shipping_address'):
            return jsonify({'error': 'Shipping address is required'}), 422
        
        # Validate shipping address structure
        shipping_address = data.get('shipping_address')
        if isinstance(shipping_address, dict):
            # New format with address object
            required_address_fields = ['full_name', 'address_line1', 'city', 'state', 'postal_code', 'country']
            for field in required_address_fields:
                if not shipping_address.get(field):
                    return jsonify({'error': f'Shipping address {field} is required'}), 422
            
            # Format the address
            formatted_address = f"{shipping_address['full_name']}, {shipping_address['address_line1']}"
            if shipping_address.get('address_line2'):
                formatted_address += f", {shipping_address['address_line2']}"
            formatted_address += f", {shipping_address['city']}, {shipping_address['state']} {shipping_address['postal_code']}, {shipping_address['country']}"
            
            if shipping_address.get('phone_number'):
                formatted_address += f", Phone: {shipping_address['phone_number']}"
                
            shipping_address_str = formatted_address
        else:
            # Legacy string format
            shipping_address_str = shipping_address
        
        # Start transaction
        db.session.begin_nested()
        
        # Calculate total and check stock
        total_amount = 0
        order_items = []
        
        for item in data['items']:
            if not item.get('product_id') or not item.get('quantity'):
                return jsonify({'error': 'Each item must have product_id and quantity'}), 422
                
            product = Product.query.get(item['product_id'])
            if not product:
                raise Exception(f"Product {item['product_id']} not found")
            
            if product.stock_quantity < item['quantity']:
                raise Exception(f"Insufficient stock for {product.name}")
            
            total_amount += product.price * item['quantity']
            order_items.append({
                'product': product,
                'quantity': item['quantity'],
                'price': product.price,
                'product_name': product.name
            })
        
        # Create order
        order = Order(
            user_id=user_id,
            total_amount=total_amount,
            shipping_address=shipping_address_str
        )
        db.session.add(order)
        db.session.flush()  # Get order ID
        
        # Create order items and update stock
        for item_data in order_items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item_data['product'].id,
                quantity=item_data['quantity'],
                price=item_data['price'],
                product_name=item_data['product_name']
            )
            db.session.add(order_item)
            
            # Update product stock
            item_data['product'].stock_quantity -= item_data['quantity']
        
        db.session.commit()
        
        # Send confirmation email
        try:
            user = User.query.get(user_id)
            if user and user.email:
                send_order_confirmation_email(user.email, order)
                print(f"✅ Order confirmation email sent for order #{order.id}")
        except Exception as email_error:
            print(f"⚠️ Failed to send email: {email_error}")
            # Don't fail the order if email fails
        
        return jsonify({
            'message': 'Order created successfully',
            'order': order.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error in create_order: {str(e)}")
        print(f"🔍 Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 400