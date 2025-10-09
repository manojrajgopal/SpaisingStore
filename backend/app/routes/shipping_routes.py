from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.shipping_address import ShippingAddress

shipping_bp = Blueprint('shipping', __name__)

@shipping_bp.route('/addresses', methods=['GET'])
@jwt_required()
def get_shipping_addresses():
    """Get all shipping addresses for current user"""
    try:
        user_id = get_jwt_identity()
        addresses = ShippingAddress.query.filter_by(user_id=user_id).order_by(
            ShippingAddress.is_default.desc(), 
            ShippingAddress.created_at.desc()
        ).all()
        
        return jsonify([address.to_dict() for address in addresses])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@shipping_bp.route('/addresses', methods=['POST'])
@jwt_required()
def create_shipping_address():
    """Create a new shipping address"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['full_name', 'address_line1', 'city', 'state', 'postal_code', 'country']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 422
        
        # If this is set as default, remove default from other addresses
        if data.get('is_default'):
            ShippingAddress.query.filter_by(user_id=user_id, is_default=True).update({'is_default': False})
        
        address = ShippingAddress(
            user_id=user_id,
            full_name=data['full_name'],
            address_line1=data['address_line1'],
            address_line2=data.get('address_line2', ''),
            city=data['city'],
            state=data['state'],
            postal_code=data['postal_code'],
            country=data['country'],
            phone_number=data.get('phone_number', ''),
            is_default=data.get('is_default', False)
        )
        
        db.session.add(address)
        db.session.commit()
        
        return jsonify({
            'message': 'Shipping address created successfully',
            'address': address.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@shipping_bp.route('/addresses/<int:address_id>', methods=['PUT'])
@jwt_required()
def update_shipping_address(address_id):
    """Update a shipping address"""
    try:
        user_id = get_jwt_identity()
        address = ShippingAddress.query.filter_by(id=address_id, user_id=user_id).first()
        
        if not address:
            return jsonify({'error': 'Address not found'}), 404
        
        data = request.get_json()
        
        # If this is set as default, remove default from other addresses
        if data.get('is_default'):
            ShippingAddress.query.filter_by(user_id=user_id, is_default=True).update({'is_default': False})
        
        # Update fields
        updatable_fields = ['full_name', 'address_line1', 'address_line2', 'city', 'state', 
                          'postal_code', 'country', 'phone_number', 'is_default']
        
        for field in updatable_fields:
            if field in data:
                setattr(address, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Shipping address updated successfully',
            'address': address.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@shipping_bp.route('/addresses/<int:address_id>', methods=['DELETE'])
@jwt_required()
def delete_shipping_address(address_id):
    """Delete a shipping address"""
    try:
        user_id = get_jwt_identity()
        address = ShippingAddress.query.filter_by(id=address_id, user_id=user_id).first()
        
        if not address:
            return jsonify({'error': 'Address not found'}), 404
        
        db.session.delete(address)
        db.session.commit()
        
        return jsonify({'message': 'Shipping address deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@shipping_bp.route('/addresses/<int:address_id>/set-default', methods=['PUT'])
@jwt_required()
def set_default_address(address_id):
    """Set an address as default"""
    try:
        user_id = get_jwt_identity()
        address = ShippingAddress.query.filter_by(id=address_id, user_id=user_id).first()
        
        if not address:
            return jsonify({'error': 'Address not found'}), 404
        
        # Remove default from all addresses
        ShippingAddress.query.filter_by(user_id=user_id, is_default=True).update({'is_default': False})
        
        # Set this address as default
        address.is_default = True
        db.session.commit()
        
        return jsonify({
            'message': 'Default address set successfully',
            'address': address.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400