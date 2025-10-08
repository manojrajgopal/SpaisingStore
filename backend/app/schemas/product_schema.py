from app import ma
from app.models.product import Product

class ProductSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Product
        include_fk = True
    
    image_url = ma.String(dump_only=True)
    
    def get_image_url(self, obj):
        return obj.get_image_url()

product_schema = ProductSchema()
products_schema = ProductSchema(many=True)