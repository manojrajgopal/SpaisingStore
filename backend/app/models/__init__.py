# This file helps avoid circular imports by ensuring all models are loaded
from app.models.user import User
from app.models.product import Product
from app.models.order import Order
from app.models.order_item import OrderItem

# Now that all models are loaded, we can set up relationships
from app import db

# Set up User relationships
User.orders = db.relationship('Order', backref='user', lazy=True)

# Set up Order relationships  
Order.order_items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')

# Set up Product relationships
Product.order_items = db.relationship('OrderItem', backref='product', lazy=True)

__all__ = ['User', 'Product', 'Order', 'OrderItem']