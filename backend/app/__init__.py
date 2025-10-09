from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_jwt_extended import JWTManager
# from flask_mail import Mail
from flask_cors import CORS
from dotenv import load_dotenv
import os
from marshmallow import ValidationError
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from flask_jwt_extended.exceptions import JWTExtendedException
from flask_migrate import Migrate

migrate = Migrate()

# Initialize extensions
db = SQLAlchemy()
ma = Marshmallow()
jwt = JWTManager()
# mail = Mail()

def create_app():
    app = Flask(__name__)
    load_dotenv()

    # -----------------------------
    # Configuration
    # -----------------------------
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"mysql+pymysql://{os.getenv('MYSQL_USER')}:{os.getenv('MYSQL_PASSWORD')}"
        f"@{os.getenv('MYSQL_HOST')}/{os.getenv('MYSQL_DB')}"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    # app.config['MAIL_SERVER'] = os.getenv('EMAIL_HOST')
    # app.config['MAIL_PORT'] = int(os.getenv('EMAIL_PORT', 587))
    # app.config['MAIL_USE_TLS'] = True
    # app.config['MAIL_USERNAME'] = os.getenv('EMAIL_USER')
    # app.config['MAIL_PASSWORD'] = os.getenv('EMAIL_PASSWORD')

    # -----------------------------
    # CORS Configuration
    # -----------------------------
    CORS(app,
         resources={
             r"/api/*": {
                 "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
                 "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
                 "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
                 "supports_credentials": True,
                 "expose_headers": ["Content-Range", "X-Total-Count"]
             }
         },
         supports_credentials=True)

    # -----------------------------
    # Initialize extensions
    # -----------------------------
    db.init_app(app)
    ma.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    # mail.init_app(app)

    from app.models.user import User
    from app.models.product import Product
    from app.models.order import Order
    from app.models.order_item import OrderItem

    # -----------------------------
    # Handle OPTIONS requests (preflight)
    # -----------------------------
    @app.before_request
    def handle_options():
        from flask import request
        if request.method == 'OPTIONS':
            response = app.make_default_options_response()
            return response

    # -----------------------------
    # Middleware (Request Logger)
    # -----------------------------
    from app.middleware.logger import log_requests_start, log_requests_end
    app.before_request(log_requests_start)
    app.after_request(log_requests_end)

    # -----------------------------
    # Blueprints
    # -----------------------------
    from app.routes.auth_routes import auth_bp
    from app.routes.product_routes import product_bp
    from app.routes.order_routes import order_bp
    from app.routes.admin_routes import admin_bp
    from app.routes.cart_routes import cart_bp
    from app.routes.shipping_routes import shipping_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(product_bp, url_prefix='/api/products')
    app.register_blueprint(order_bp, url_prefix='/api/orders')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(cart_bp, url_prefix='/api/cart')
    app.register_blueprint(shipping_bp, url_prefix='/api/shipping')
    
    # -----------------------------
    # Error Handlers
    # -----------------------------
    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        return jsonify({
            'error': 'Validation failed',
            'details': error.messages
        }), 422

    @app.errorhandler(IntegrityError)
    def handle_integrity_error(error):
        db.session.rollback()
        return jsonify({
            'error': 'Database integrity error',
            'details': 'Duplicate entry or constraint violation'
        }), 400

    @app.errorhandler(SQLAlchemyError)
    def handle_sqlalchemy_error(error):
        db.session.rollback()
        return jsonify({
            'error': 'Database error',
            'details': str(error)
        }), 500

    @app.errorhandler(JWTExtendedException)
    def handle_jwt_error(error):
        return jsonify({
            'error': 'Authentication failed',
            'details': str(error)
        }), 401

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({'error': 'Method not allowed'}), 405

    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({'error': 'Internal server error'}), 500

    return app
