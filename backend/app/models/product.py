from app import db

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, index=True)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    stock_quantity = db.Column(db.Integer, nullable=False, default=0)
    image_data = db.Column(db.Text)  # Store base64 image data
    image_url = db.Column(db.String(255))  # Or store external URL
    category = db.Column(db.String(50))  # Add category field
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'stock_quantity': self.stock_quantity,
            'image_data': self.image_data,
            'image_url': self.image_url,
            'category': self.category,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def set_image_from_base64(self, base64_string):
        """Store base64 image data"""
        if base64_string and base64_string.startswith('data:image'):
            self.image_data = base64_string
    
    def get_image_url(self):
        """Return image URL or generate from base64 data"""
        if self.image_url:
            return self.image_url
        elif self.image_data:
            return self.image_data  # This is the base64 data
        return None