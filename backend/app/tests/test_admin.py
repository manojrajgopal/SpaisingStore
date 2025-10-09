import unittest
import json
from app import create_app, db
from app.models.user import User
from app.models.product import Product
from app.models.order import Order
from app.models.order_item import OrderItem

class AdminTestCase(unittest.TestCase):
    """Test case for admin endpoints"""
    
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
        """Create test data including admin user"""
        # Create admin user
        admin_user = User(
            email='admin@test.com',
            first_name='Admin',
            last_name='User',
            is_admin=True
        )
        admin_user.set_password('admin123')
        
        # Create regular user
        regular_user = User(
            email='user@test.com',
            first_name='Regular',
            last_name='User',
            is_admin=False
        )
        regular_user.set_password('user123')
        
        # Create test products
        products = [
            Product(
                name='Admin Test Product 1',
                description='Test Description 1',
                price=19.99,
                stock_quantity=10,
                category='electronics'
            ),
            Product(
                name='Admin Test Product 2',
                description='Test Description 2',
                price=29.99,
                stock_quantity=5,
                category='clothing'
            )
        ]
        
        db.session.add(admin_user)
        db.session.add(regular_user)
        for product in products:
            db.session.add(product)
        
        db.session.commit()
        
        self.admin_user_id = admin_user.id
        self.regular_user_id = regular_user.id
        self.product_ids = [p.id for p in products]
    
    def get_admin_headers(self):
        """Get admin authentication headers"""
        login_data = {
            'email': 'admin@test.com',
            'password': 'admin123'
        }
        response = self.client.post(
            '/api/auth/login',
            data=json.dumps(login_data),
            content_type='application/json'
        )
        token = json.loads(response.data)['access_token']
        return {'Authorization': f'Bearer {token}'}
    
    def get_user_headers(self):
        """Get regular user authentication headers"""
        login_data = {
            'email': 'user@test.com',
            'password': 'user123'
        }
        response = self.client.post(
            '/api/auth/login',
            data=json.dumps(login_data),
            content_type='application/json'
        )
        token = json.loads(response.data)['access_token']
        return {'Authorization': f'Bearer {token}'}
    
    def test_admin_get_all_products(self):
        """Test admin GET /api/admin/products"""
        headers = self.get_admin_headers()
        response = self.client.get('/api/admin/products', headers=headers)
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 2)
    
    def test_admin_create_product(self):
        """Test admin POST /api/admin/products"""
        headers = self.get_admin_headers()
        product_data = {
            'name': 'New Admin Product',
            'description': 'New Description',
            'price': 39.99,
            'stock_quantity': 15,
            'category': 'electronics'
        }
        
        response = self.client.post(
            '/api/admin/products',
            data=json.dumps(product_data),
            content_type='application/json',
            headers=headers
        )
        
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data['product']['name'], 'New Admin Product')
        self.assertEqual(data['product']['price'], 39.99)
    
    def test_admin_update_product(self):
        """Test admin PUT /api/admin/products/<id>"""
        headers = self.get_admin_headers()
        update_data = {
            'name': 'Updated Product Name',
            'price': 49.99
        }
        
        response = self.client.put(
            f'/api/admin/products/{self.product_ids[0]}',
            data=json.dumps(update_data),
            content_type='application/json',
            headers=headers
        )
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['product']['name'], 'Updated Product Name')
        self.assertEqual(data['product']['price'], 49.99)
    
    def test_admin_delete_product(self):
        """Test admin DELETE /api/admin/products/<id>"""
        headers = self.get_admin_headers()
        
        response = self.client.delete(
            f'/api/admin/products/{self.product_ids[0]}',
            headers=headers
        )
        
        self.assertEqual(response.status_code, 200)
        
        # Verify product is deleted
        response = self.client.get('/api/admin/products', headers=headers)
        data = json.loads(response.data)
        self.assertEqual(len(data), 1)  # Only one product left
    
    def test_admin_get_all_users(self):
        """Test admin GET /api/admin/users"""
        headers = self.get_admin_headers()
        response = self.client.get('/api/admin/users', headers=headers)
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 2)  # admin + regular user
    
    def test_admin_get_all_orders(self):
        """Test admin GET /api/admin/orders"""
        headers = self.get_admin_headers()
        response = self.client.get('/api/admin/orders', headers=headers)
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
    
    def test_admin_get_dashboard_stats(self):
        """Test admin GET /api/admin/stats"""
        headers = self.get_admin_headers()
        response = self.client.get('/api/admin/stats', headers=headers)
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIn('total_users', data)
        self.assertIn('total_products', data)
        self.assertIn('total_orders', data)
        self.assertIn('total_revenue', data)
    
    def test_non_admin_access_denied(self):
        """Test that non-admin users cannot access admin endpoints"""
        headers = self.get_user_headers()
        response = self.client.get('/api/admin/products', headers=headers)
        self.assertEqual(response.status_code, 403)
    
    def test_admin_update_user(self):
        """Test admin PUT /api/admin/users/<id>"""
        headers = self.get_admin_headers()
        update_data = {
            'first_name': 'UpdatedFirstName',
            'last_name': 'UpdatedLastName',
            'is_admin': True
        }
        
        response = self.client.put(
            f'/api/admin/users/{self.regular_user_id}',
            data=json.dumps(update_data),
            content_type='application/json',
            headers=headers
        )
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['user']['first_name'], 'UpdatedFirstName')
        self.assertEqual(data['user']['last_name'], 'UpdatedLastName')
    
    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

if __name__ == '__main__':
    unittest.main()