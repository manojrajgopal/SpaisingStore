from app import db

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')
    shipping_address = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    
    def update_status(self, new_status):
        """Update order status with validation"""
        valid_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
        if new_status in valid_statuses:
            self.status = new_status
            return True
        return False
    
    def to_dict(self):
        # Use relationship if available (eager loaded), otherwise fallback to query
        if hasattr(self, 'order_items') and self.order_items is not None:
            # Use eagerly loaded order_items
            order_items_data = [item.to_dict() for item in self.order_items]
        else:
            # Fallback to query (should be avoided with proper eager loading)
            from app.models.order_item import OrderItem
            order_items = OrderItem.query.filter_by(order_id=self.id).all()
            order_items_data = [item.to_dict() for item in order_items]
        
        return {
            'id': self.id,
            'user_id': self.user_id,
            'total_amount': self.total_amount,
            'status': self.status,
            'shipping_address': self.shipping_address,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'order_items': order_items_data
        }