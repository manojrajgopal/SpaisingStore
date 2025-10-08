import unittest
from app import create_app, db
from app.models.user import User
from app.models.product import Product
from app.models.order import Order

class OrderTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = self.app.test_client()
        
        with self.app.app_context():
            db.create_all()
            
            # Create test user
            user = User(email='test@example.com', first_name='Test', last_name='User')
            user.set_password('password')
            db.session.add(user)
            db.session.commit()
            
            # Create test product
            product = Product(name='Test Product', description='Test Desc', price=10.0, stock_quantity=5)
            db.session.add(product)
            db.session.commit()
            
            self.user_id = user.id
            self.product_id = product.id
    
    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()
    
    def test_create_order(self):
        # Login first
        login_response = self.client.post('/api/auth/login', json={
            'email': 'test@example.com',
            'password': 'password'
        })
        token = login_response.get_json()['access_token']
        
        # Create order
        order_response = self.client.post('/api/orders/', 
            json={
                'items': [{'product_id': self.product_id, 'quantity': 2}],
                'shipping_address': '123 Test St'
            },
            headers={'Authorization': f'Bearer {token}'}
        )
        
        self.assertEqual(order_response.status_code, 201)
        data = order_response.get_json()
        self.assertEqual(data['order']['total_amount'], 20.0)
        self.assertEqual(data['order']['status'], 'pending')

if __name__ == '__main__':
    unittest.main()