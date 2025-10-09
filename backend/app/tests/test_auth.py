import unittest
import json
from app import create_app, db
from app.models.user import User

class AuthTestCase(unittest.TestCase):
    """Test case for authentication endpoints"""
    
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
    
    def test_user_registration(self):
        """Test user registration"""
        user_data = {
            'email': 'newuser@example.com',
            'password': 'newpassword',
            'first_name': 'New',
            'last_name': 'User'
        }
        
        response = self.client.post(
            '/api/auth/register',
            data=json.dumps(user_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn('access_token', data)
        self.assertIn('user', data)
        self.assertEqual(data['user']['email'], 'newuser@example.com')
    
    def test_duplicate_registration(self):
        """Test registration with existing email"""
        # Create user first
        user = User(
            email='existing@example.com',
            first_name='Existing',
            last_name='User'
        )
        user.set_password('password')
        
        with self.app.app_context():
            db.session.add(user)
            db.session.commit()
        
        # Try to register with same email
        user_data = {
            'email': 'existing@example.com',
            'password': 'password',
            'first_name': 'Another',
            'last_name': 'User'
        }
        
        response = self.client.post(
            '/api/auth/register',
            data=json.dumps(user_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
    
    def test_user_login(self):
        """Test user login"""
        # Create user first
        user = User(
            email='login@example.com',
            first_name='Login',
            last_name='User'
        )
        user.set_password('loginpassword')
        
        with self.app.app_context():
            db.session.add(user)
            db.session.commit()
        
        # Test login
        login_data = {
            'email': 'login@example.com',
            'password': 'loginpassword'
        }
        
        response = self.client.post(
            '/api/auth/login',
            data=json.dumps(login_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('access_token', data)
    
    def test_invalid_login(self):
        """Test login with invalid credentials"""
        login_data = {
            'email': 'nonexistent@example.com',
            'password': 'wrongpassword'
        }
        
        response = self.client.post(
            '/api/auth/login',
            data=json.dumps(login_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 401)
    
    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

if __name__ == '__main__':
    unittest.main()