from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app import db
from app.models.user import User
from app.utils.validators import user_registration_schema, user_login_schema, validate_data  # ✅ Import validators

auth_bp = Blueprint('auth', __name__)

# -------------------------
# REGISTER ROUTE
# -------------------------
@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()

        # ✅ Validate request data
        validate_data(user_registration_schema, data)

        # Check duplicate email
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400

        # Create new user
        user = User(
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name']
        )
        user.set_password(data['password'])

        db.session.add(user)
        db.session.commit()

        access_token = create_access_token(identity=str(user.id))

        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'user': user.to_dict()
        }), 201

    except ValidationError as e:
        return jsonify({'error': 'Validation failed', 'details': e.messages}), 422
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


# -------------------------
# LOGIN ROUTE
# -------------------------
@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        # ✅ Validate request data
        validate_data(user_login_schema, data)

        user = User.query.filter_by(email=data['email']).first()
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401

        access_token = create_access_token(identity=str(user.id))

        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': user.to_dict()
        })

    except ValidationError as e:
        return jsonify({'error': 'Validation failed', 'details': e.messages}), 422
    except Exception as e:
        return jsonify({'error': str(e)}), 400


# -------------------------
# GET CURRENT USER
# -------------------------
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))  # Convert back to int for query

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'user': user.to_dict()})
