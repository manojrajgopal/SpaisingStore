from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models.user import User
from flask import jsonify, g

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            
            # Convert string identity to integer
            try:
                user_id = int(user_id)
            except (ValueError, TypeError):
                return jsonify({'error': 'Invalid user identity in token'}), 401
                
            user = User.query.get(user_id)
            
            if not user or not user.is_admin:
                return jsonify({'error': 'Admin access required'}), 403
            
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Invalid token', 'details': str(e)}), 401
    return decorated

def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        verify_jwt_in_request()
        return f(*args, **kwargs)
    return decorated

def optional_jwt(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            g.user_id = get_jwt_identity()
            # Convert to int if possible
            try:
                g.user_id = int(g.user_id)
            except (ValueError, TypeError):
                g.user_id = None
        except:
            g.user_id = None  # No JWT present
        return f(*args, **kwargs)
    return decorated