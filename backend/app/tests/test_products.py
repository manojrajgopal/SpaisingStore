import unittest
import json
from app import create_app, db
from app.models.product import Product
from app.models.user import User

class ProductTestCase(unittest.TestCase):
    """Test case for the products endpoints"""
    
    def setUp(self):
        """Set up test variables"""
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
            email='test@example.com',
            first_name='Test',
            last_name='User'
        )
        user.set_password('testpassword')
        db.session.add(user)
        
        # Create test products
        products = [
            Product(
                name='Test Product 1',
                description='Test Description 1',
                price=19.99,
                stock_quantity=10,
                category='electronics'
            ),
            Product(
                name='Test Product 2',
                description='Test Description 2',
                price=29.99,
                stock_quantity=5,
                category='clothing'
            )
        ]
        
        for product in products:
            db.session.add(product)
        
        db.session.commit()
        self.user_id = user.id
        self.product_ids = [p.id for p in products]
    
    def get_auth_headers(self):
        """Get authentication headers"""
        # Login to get token
        login_data = {
            'email': 'test@example.com',
            'password': 'testpassword'
        }
        response = self.client.post(
            '/api/auth/login',
            data=json.dumps(login_data),
            content_type='application/json'
        )
        token = json.loads(response.data)['access_token']
        return {'Authorization': f'Bearer {token}'}
    
    def test_get_products(self):
        """Test GET /api/products endpoint"""
        response = self.client.get('/api/products')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 2)
        
        # Test product properties
        product = data[0]
        self.assertIn('id', product)
        self.assertIn('name', product)
        self.assertIn('price', product)
        self.assertIn('stock_quantity', product)
    
    def test_get_product_by_id(self):
        """Test GET /api/products/<id> endpoint"""
        response = self.client.get(f'/api/products/{self.product_ids[0]}')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['name'], 'Test Product 1')
        self.assertEqual(data['price'], 19.99)
    
    def test_get_nonexistent_product(self):
        """Test GET /api/products with non-existent ID"""
        response = self.client.get('/api/products/999')
        self.assertEqual(response.status_code, 404)
    
    def test_get_products_with_filters(self):
        """Test GET /api/products with query filters"""
        # Test category filter
        response = self.client.get('/api/products?category=electronics')
        data = json.loads(response.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['category'], 'electronics')
        
        # Test search filter
        response = self.client.get('/api/products?search=Product 2')
        data = json.loads(response.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], 'Test Product 2')
    
    def test_get_categories(self):
        """Test GET /api/products/categories endpoint"""
        response = self.client.get('/api/products/categories')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
        self.assertIn('electronics', data)
        self.assertIn('clothing', data)
    
    def tearDown(self):
        """Clean up after tests"""
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

if __name__ == '__main__':
    unittest.main()