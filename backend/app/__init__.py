from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_jwt_extended import JWTManager
# from flask_mail import Mail
from flask_cors import CORS
from dotenv import load_dotenv
import os

db = SQLAlchemy()
ma = Marshmallow()
jwt = JWTManager()
# mail = Mail()

def create_app():
    app = Flask(__name__)
    load_dotenv()

    # Configuration
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

    # Initialize CORS - REMOVE the duplicate after_request middleware
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

    # Initialize other extensions
    db.init_app(app)
    ma.init_app(app)
    jwt.init_app(app)
    # mail.init_app(app)

    @app.before_request
    def handle_options():
        from flask import request
        if request.method == 'OPTIONS':
            response = app.make_default_options_response()
            return response

    # Middleware
    from app.middleware.logger import log_requests_start, log_requests_end
    app.before_request(log_requests_start)
    app.after_request(log_requests_end)

    # Register blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.product_routes import product_bp
    from app.routes.order_routes import order_bp
    from app.routes.admin_routes import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(product_bp, url_prefix='/api/products')
    app.register_blueprint(order_bp, url_prefix='/api/orders')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Global error handler
    @app.errorhandler(Exception)
    def handle_exception(e):
        return {'error': str(e)}, 500

    return app