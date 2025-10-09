from marshmallow import Schema, fields, validate, ValidationError
from flask import jsonify

# Custom validators
def validate_price(value):
    if value < 0:
        raise ValidationError('Price cannot be negative')

def validate_stock(value):
    if value < 0:
        raise ValidationError('Stock quantity cannot be negative')

# Schemas for input validation
class ProductSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    description = fields.Str(validate=validate.Length(max=500))
    price = fields.Float(required=True, validate=validate_price)
    stock_quantity = fields.Int(required=True, validate=validate_stock)
    category = fields.Str(validate=validate.Length(max=50))
    image_url = fields.Str(validate=validate.Length(max=255))

class UserRegistrationSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6))
    first_name = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    last_name = fields.Str(required=True, validate=validate.Length(min=1, max=50))

class UserLoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)

class OrderSchema(Schema):
    shipping_address = fields.Str(required=True, validate=validate.Length(min=10))
    items = fields.List(fields.Dict(), required=True)

class CartItemSchema(Schema):
    product_id = fields.Int(required=True)
    quantity = fields.Int(required=True, validate=validate.Range(min=1))

# Initialize schemas
product_schema_validator = ProductSchema()
user_registration_schema = UserRegistrationSchema()
user_login_schema = UserLoginSchema()
order_schema_validator = OrderSchema()
cart_item_schema = CartItemSchema()

def validate_data(schema, data):
    """Validate data against schema and return errors if any"""
    errors = schema.validate(data)
    if errors:
        raise ValidationError(errors)

def handle_validation_error(error):
    """Handle marshmallow validation errors"""
    return jsonify({
        'error': 'Validation failed',
        'details': error.messages
    }), 422

def handle_database_error(error):
    """Handle database errors"""
    return jsonify({
        'error': 'Database operation failed',
        'details': str(error.orig) if hasattr(error, 'orig') else str(error)
    }), 500

def handle_jwt_error(error):
    """Handle JWT errors"""
    return jsonify({
        'error': 'Authentication failed',
        'details': str(error)
    }), 401