from flask_jwt_extended import get_jwt_identity
from app.models.user import User

def get_current_user():
    user_id_str = get_jwt_identity()
    try:
        user_id = int(user_id_str)
        return User.query.get(user_id)
    except (ValueError, TypeError):
        return None