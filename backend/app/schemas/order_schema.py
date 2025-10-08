from app import ma
from app.models.order import Order
from app.models.order_item import OrderItem

class OrderItemSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = OrderItem
        include_fk = True

class OrderSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Order
        include_fk = True
    
    order_items = ma.Nested(OrderItemSchema, many=True)

order_schema = OrderSchema()
orders_schema = OrderSchema(many=True)