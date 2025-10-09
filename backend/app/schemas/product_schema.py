# product_schema.py
from app import ma
from app.models.product import Product

class ProductSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Product
        include_fk = True
    
    # Ensure both image fields are included
    image_url = ma.String()
    image_data = ma.String()
    stock_quantity = ma.Integer() 
    
    def get_image_url(self, obj):
        return obj.get_image_url()

product_schema = ProductSchema()
products_schema = ProductSchema(many=True)