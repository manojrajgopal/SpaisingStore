import unittest
import json
from app import create_app, db
from app.models.user import User
from app.models.shipping_address import ShippingAddress

class ShippingTestCase(unittest.TestCase):
    """Test case for shipping address endpoints"""
    
    def setUp(self):
        self.app = create_app()
        self.app.config.update({
            'TESTING': True,
            'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
            'JWT_SECRET_KEY': 'test-secret-key'
        })
        self.client = self.app.test_client()
        
        with self.app.app_context():
            db.create_all()
            self.create_test_data()
    
    def create_test_data(self):
        """Create test data"""
        # Create test user
        user = User(
            email='shippinguser@test.com',
            first_name='Shipping',
            last_name='User'
        )
        user.set_password('password123')
        
        db.session.add(user)
        db.session.commit()
        
        self.user_id = user.id
    
    def get_auth_headers(self):
        """Get authentication headers"""
        login_data = {
            'email': 'shippinguser@test.com',
            'password': 'password123'
        }
        response = self.client.post(
            '/api/auth/login',
            data=json.dumps(login_data),
            content_type='application/json'
        )
        token = json.loads(response.data)['access_token']
        return {'Authorization': f'Bearer {token}'}
    
    def test_create_shipping_address(self):
        """Test POST /api/shipping/addresses"""
        headers = self.get_auth_headers()
        address_data = {
            'full_name': 'John Doe',
            'address_line1': '123 Main Street',
            'address_line2': 'Apt 4B',
            'city': 'New York',
            'state': 'NY',
            'postal_code': '10001',
            'country': 'United States',
            'phone_number': '+1234567890',
            'is_default': True
        }
        
        response = self.client.post(
            '/api/shipping/addresses',
            data=json.dumps(address_data),
            content_type='application/json',
            headers=headers
        )
        
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data['address']['full_name'], 'John Doe')
        self.assertEqual(data['address']['city'], 'New York')
        self.assertEqual(data['address']['is_default'], True)
    
    def test_create_shipping_address_missing_required_fields(self):
        """Test creating address with missing required fields"""
        headers = self.get_auth_headers()
        address_data = {
            'full_name': 'John Doe',
            # Missing address_line1, city, state, postal_code, country
        }
        
        response = self.client.post(
            '/api/shipping/addresses',
            data=json.dumps(address_data),
            content_type='application/json',
            headers=headers
        )
        
        self.assertEqual(response.status_code, 422)
    
    def test_get_shipping_addresses(self):
        """Test GET /api/shipping/addresses"""
        headers = self.get_auth_headers()
        
        # First create an address
        address_data = {
            'full_name': 'John Doe',
            'address_line1': '123 Main Street',
            'city': 'New York',
            'state': 'NY',
            'postal_code': '10001',
            'country': 'United States'
        }
        self.client.post(
            '/api/shipping/addresses',
            data=json.dumps(address_data),
            content_type='application/json',
            headers=headers
        )
        
        # Then get all addresses
        response = self.client.get('/api/shipping/addresses', headers=headers)
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['full_name'], 'John Doe')
    
    def test_update_shipping_address(self):
        """Test PUT /api/shipping/addresses/<address_id>"""
        headers = self.get_auth_headers()
        
        # First create an address
        address_data = {
            'full_name': 'John Doe',
            'address_line1': '123 Main Street',
            'city': 'New York',
            'state': 'NY',
            'postal_code': '10001',
            'country': 'United States'
        }
        create_response = self.client.post(
            '/api/shipping/addresses',
            data=json.dumps(address_data),
            content_type='application/json',
            headers=headers
        )
        address_id = json.loads(create_response.data)['address']['id']
        
        # Then update it
        update_data = {
            'full_name': 'Jane Smith',
            'city': 'Los Angeles',
            'is_default': True
        }
        
        response = self.client.put(
            f'/api/shipping/addresses/{address_id}',
            data=json.dumps(update_data),
            content_type='application/json',
            headers=headers
        )
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['address']['full_name'], 'Jane Smith')
        self.assertEqual(data['address']['city'], 'Los Angeles')
        self.assertEqual(data['address']['is_default'], True)
    
    def test_delete_shipping_address(self):
        """Test DELETE /api/shipping/addresses/<address_id>"""
        headers = self.get_auth_headers()
        
        # First create an address
        address_data = {
            'full_name': 'John Doe',
            'address_line1': '123 Main Street',
            'city': 'New York',
            'state': 'NY',
            'postal_code': '10001',
            'country': 'United States'
        }
        create_response = self.client.post(
            '/api/shipping/addresses',
            data=json.dumps(address_data),
            content_type='application/json',
            headers=headers
        )
        address_id = json.loads(create_response.data)['address']['id']
        
        # Then delete it
        response = self.client.delete(
            f'/api/shipping/addresses/{address_id}',
            headers=headers
        )
        
        self.assertEqual(response.status_code, 200)
        
        # Verify address is deleted
        response = self.client.get('/api/shipping/addresses', headers=headers)
        data = json.loads(response.data)
        self.assertEqual(len(data), 0)
    
    def test_set_default_address(self):
        """Test PUT /api/shipping/addresses/<address_id>/set-default"""
        headers = self.get_auth_headers()
        
        # Create two addresses
        address1_data = {
            'full_name': 'John Doe',
            'address_line1': '123 Main Street',
            'city': 'New York',
            'state': 'NY',
            'postal_code': '10001',
            'country': 'United States',
            'is_default': True
        }
        address2_data = {
            'full_name': 'Jane Smith',
            'address_line1': '456 Oak Avenue',
            'city': 'Los Angeles',
            'state': 'CA',
            'postal_code': '90210',
            'country': 'United States',
            'is_default': False
        }
        
        # Create first address
        response1 = self.client.post(
            '/api/shipping/addresses',
            data=json.dumps(address1_data),
            content_type='application/json',
            headers=headers
        )
        address1_id = json.loads(response1.data)['address']['id']
        
        # Create second address
        response2 = self.client.post(
            '/api/shipping/addresses',
            data=json.dumps(address2_data),
            content_type='application/json',
            headers=headers
        )
        address2_id = json.loads(response2.data)['address']['id']
        
        # Set second address as default
        response = self.client.put(
            f'/api/shipping/addresses/{address2_id}/set-default',
            headers=headers
        )
        
        self.assertEqual(response.status_code, 200)
        
        # Verify second address is now default and first is not
        response = self.client.get('/api/shipping/addresses', headers=headers)
        data = json.loads(response.data)
        
        for address in data:
            if address['id'] == address1_id:
                self.assertEqual(address['is_default'], False)
            if address['id'] == address2_id:
                self.assertEqual(address['is_default'], True)
    
    def test_cannot_access_other_users_addresses(self):
        """Test that users cannot access other users' addresses"""
        # Create second user
        user2 = User(
            email='otheruser@test.com',
            first_name='Other',
            last_name='User'
        )
        user2.set_password('password123')
        db.session.add(user2)
        db.session.commit()
        
        # Login as first user and create address
        headers1 = self.get_auth_headers()
        address_data = {
            'full_name': 'John Doe',
            'address_line1': '123 Main Street',
            'city': 'New York',
            'state': 'NY',
            'postal_code': '10001',
            'country': 'United States'
        }
        create_response = self.client.post(
            '/api/shipping/addresses',
            data=json.dumps(address_data),
            content_type='application/json',
            headers=headers1
        )
        address_id = json.loads(create_response.data)['address']['id']
        
        # Login as second user and try to access first user's address
        login_data = {
            'email': 'otheruser@test.com',
            'password': 'password123'
        }
        response = self.client.post(
            '/api/auth/login',
            data=json.dumps(login_data),
            content_type='application/json'
        )
        token = json.loads(response.data)['access_token']
        headers2 = {'Authorization': f'Bearer {token}'}
        
        # Try to get the address
        response = self.client.get(
            f'/api/shipping/addresses/{address_id}',
            headers=headers2
        )
        # This should return 404 since the address doesn't belong to second user
        self.assertEqual(response.status_code, 404)
    
    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

if __name__ == '__main__':
    unittest.main()