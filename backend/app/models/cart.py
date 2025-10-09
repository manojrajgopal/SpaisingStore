# app/models/cart.py - FIXED
from app import db
from datetime import datetime

class Cart(db.Model):
    __tablename__ = 'carts'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    items = db.relationship('CartItem', backref='cart', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'user_id': self.user_id,
            'items': [item.to_dict() for item in self.items],
            'total_amount': sum(item.subtotal for item in self.items),
            'total_items': len(self.items)
        }

class CartItem(db.Model):
    __tablename__ = 'cart_items'
    
    id = db.Column(db.Integer, primary_key=True)
    cart_user_id = db.Column(db.Integer, db.ForeignKey('carts.user_id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to Product
    product = db.relationship('Product', backref='cart_items', lazy='joined')
    
    @property
    def subtotal(self):
        return self.product.price * self.quantity if self.product else 0
    
    def to_dict(self):
        product_data = None
        if self.product:
            product_data = {
                'id': self.product.id,
                'name': self.product.name,
                'price': float(self.product.price),
                'stock_quantity': self.product.stock_quantity,
                'image_url': self.product.image_url,
                'image_data': self.product.image_data,
                'category': self.product.category,
                'available_stock': self.product.stock_quantity  # Add this for frontend
            }
        
        return {
            'id': self.id,
            'product_id': self.product_id,
            'quantity': self.quantity,
            'subtotal': float(self.subtotal),
            'product': product_data
        }