import unittest
import json
from app import create_app, db
from app.models.user import User
from app.models.product import Product

class CartTestCase(unittest.TestCase):
    """Test case for cart endpoints"""
    
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
            email='cartuser@test.com',
            first_name='Cart',
            last_name='User'
        )
        user.set_password('password123')
        
        # Create test products
        products = [
            Product(
                name='Cart Product 1',
                description='Cart Description 1',
                price=15.99,
                stock_quantity=10,
                category='electronics'
            ),
            Product(
                name='Cart Product 2',
                description='Cart Description 2',
                price=25.99,
                stock_quantity=5,
                category='clothing'
            )
        ]
        
        db.session.add(user)
        for product in products:
            db.session.add(product)
        
        db.session.commit()
        
        self.user_id = user.id
        self.product_ids = [p.id for p in products]
    
    def get_auth_headers(self):
        """Get authentication headers"""
        login_data = {
            'email': 'cartuser@test.com',
            'password': 'password123'
        }
        response = self.client.post(
            '/api/auth/login',
            data=json.dumps(login_data),
            content_type='application/json'
        )
        token = json.loads(response.data)['access_token']
        return {'Authorization': f'Bearer {token}'}
    
    def test_get_empty_cart(self):
        """Test GET /api/cart with empty cart"""
        headers = self.get_auth_headers()
        response = self.client.get('/api/cart', headers=headers)
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['total_items'], 0)
        self.assertEqual(len(data['cart']), 0)
        self.assertEqual(data['total_amount'], 0)
    
    def test_add_to_cart(self):
        """Test POST /api/cart/add"""
        headers = self.get_auth_headers()
        cart_data = {
            'product_id': self.product_ids[0],
            'quantity': 2
        }
        
        response = self.client.post(
            '/api/cart/add',
            data=json.dumps(cart_data),
            content_type='application/json',
            headers=headers
        )
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['total_items'], 1)
        self.assertEqual(data['cart'][0]['quantity'], 2)
        self.assertEqual(data['cart'][0]['product_id'], self.product_ids[0])
    
    def test_add_to_cart_insufficient_stock(self):
        """Test adding more than available stock"""
        headers = self.get_auth_headers()
        cart_data = {
            'product_id': self.product_ids[0],
            'quantity': 15  # More than available stock (10)
        }
        
        response = self.client.post(
            '/api/cart/add',
            data=json.dumps(cart_data),
            content_type='application/json',
            headers=headers
        )
        
        self.assertEqual(response.status_code, 400)
    
    def test_update_cart_item(self):
        """Test PUT /api/cart/update"""
        headers = self.get_auth_headers()
        
        # First add item to cart
        add_data = {
            'product_id': self.product_ids[0],
            'quantity': 1
        }
        self.client.post(
            '/api/cart/add',
            data=json.dumps(add_data),
            content_type='application/json',
            headers=headers
        )
        
        # Then update quantity
        update_data = {
            'product_id': self.product_ids[0],
            'quantity': 3
        }
        
        response = self.client.put(
            '/api/cart/update',
            data=json.dumps(update_data),
            content_type='application/json',
            headers=headers
        )
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['quantity'], 3)
    
    def test_remove_from_cart(self):
        """Test DELETE /api/cart/remove/<product_id>"""
        headers = self.get_auth_headers()
        
        # First add item to cart
        add_data = {
            'product_id': self.product_ids[0],
            'quantity': 1
        }
        self.client.post(
            '/api/cart/add',
            data=json.dumps(add_data),
            content_type='application/json',
            headers=headers
        )
        
        # Then remove it
        response = self.client.delete(
            f'/api/cart/remove/{self.product_ids[0]}',
            headers=headers
        )
        
        self.assertEqual(response.status_code, 200)
        
        # Verify cart is empty
        response = self.client.get('/api/cart', headers=headers)
        data = json.loads(response.data)
        self.assertEqual(data['total_items'], 0)
    
    def test_clear_cart(self):
        """Test DELETE /api/cart/clear"""
        headers = self.get_auth_headers()
        
        # Add multiple items to cart
        products_to_add = [
            {'product_id': self.product_ids[0], 'quantity': 1},
            {'product_id': self.product_ids[1], 'quantity': 1}
        ]
        
        for product in products_to_add:
            self.client.post(
                '/api/cart/add',
                data=json.dumps(product),
                content_type='application/json',
                headers=headers
            )
        
        # Clear cart
        response = self.client.delete('/api/cart/clear', headers=headers)
        self.assertEqual(response.status_code, 200)
        
        # Verify cart is empty
        response = self.client.get('/api/cart', headers=headers)
        data = json.loads(response.data)
        self.assertEqual(data['total_items'], 0)
        self.assertEqual(len(data['cart']), 0)
    
    def test_cart_total_amount_calculation(self):
        """Test cart total amount calculation"""
        headers = self.get_auth_headers()
        
        # Add multiple items with different quantities
        products_to_add = [
            {'product_id': self.product_ids[0], 'quantity': 2},  # 15.99 * 2 = 31.98
            {'product_id': self.product_ids[1], 'quantity': 1}   # 25.99 * 1 = 25.99
        ]
        
        for product in products_to_add:
            self.client.post(
                '/api/cart/add',
                data=json.dumps(product),
                content_type='application/json',
                headers=headers
            )
        
        # Check total amount
        response = self.client.get('/api/cart', headers=headers)
        data = json.loads(response.data)
        
        expected_total = (15.99 * 2) + (25.99 * 1)
        self.assertEqual(data['total_amount'], expected_total)
        self.assertEqual(data['total_items'], 2)
    
    def test_add_nonexistent_product(self):
        """Test adding non-existent product to cart"""
        headers = self.get_auth_headers()
        cart_data = {
            'product_id': 9999,  # Non-existent product ID
            'quantity': 1
        }
        
        response = self.client.post(
            '/api/cart/add',
            data=json.dumps(cart_data),
            content_type='application/json',
            headers=headers
        )
        
        self.assertEqual(response.status_code, 404)
    
    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

if __name__ == '__main__':
    unittest.main()