# 🛍️ SpaisingStore - Full Stack E-Commerce Application

## 📖 Project Overview

SpaisingStore is a complete e-commerce platform built with modern web technologies. The application features a React frontend with Redux state management and a Flask backend with MySQL database, providing separate views for customers and administrators.

---

- **Frontend:** [http://localhost:5173](http://localhost:5173)  
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)  
- **GitHub:** [![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/manojrajgopal/SpaisingStore)

---

## ✨ Features

### 🛒 Customer Features
    
- User Registration & Login with JWT authentication
- Product Browsing with search and filtering
- Shopping Cart with real-time stock validation
- Order Management with email confirmations
- Order History tracking
- Shipping Address management

### 👨‍💼 Admin Features
    
- Dashboard with sales analytics and metrics
- Product Management - full CRUD operations
- User Management - view and manage customers
- Order Management - process and track all orders
- Admin-only secure endpoints

### 🛠️ Technology Stack

| Layer      | Technology                                           |
|-------------|------------------------------------------------------|
| Frontend    | React 19, Redux Toolkit, React Router, Vite          |
| Backend     | Python Flask, SQLAlchemy ORM, JWT Authentication     |
| Database    | MySQL with Flask-Migrate                             |
| Testing     | Jest (Frontend), unittest (Backend)                  |
| Email       | SMTP with HTML templates                             |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- MySQL 5.7+
- Node.js 22.19.0+

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/manojrajgopal/SpaisingStore.git

# Navigate into the project folder
cd SpaisingStore

# Create and activate a virtual environment
Create virtual environment and activate
```

Option 1: Using Python venv
```bash
# Create virtual environment
python -m venv venv

# Activate environment
venv\Scripts\activate      # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

Option 2: Using Conda
```bash
# Create Conda environment
conda create -n SpaisingStore python=3.11 -y

# Activate environment
conda activate SpaisingStore

# Install dependencies
pip install -r requirements.txt
```

Environment Configuration
Create .env file in backend root:

```bash
# .env
FLASK_ENV=development
SECRET_KEY=your-secret-key
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DB=spaisingstore
JWT_SECRET_KEY=your-jwt-secret
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_ADDRESS=your-email@gmail.com
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
GOOGLE_REFRESH_TOKEN=
GOOGLE_ACCESS_TOKEN=
```

```bash
# Development mode
python.exe -m app.main
# or
flask --app app.main --debug run

# View available routes
flask routes
```

Database Setup:
```bash
# Initialize database
flask --app app.main init-db

# Run migrations
flask db migrate -m "Initial migration"
flask db upgrade

# Create admin user
flask --app app.main create-admin
```

### Frontend Setup
Navigate to frontend directory

```bash
cd frontend
Install dependencies
```

```bash
npm install
```

Environment Configuration
Create `.env` file in frontend root:

```bash
# .env
VITE_API_BASE_URL=http://localhost:5000/api
```

Run Frontend:

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

🏃‍♂️ Running the Application
Backend Commands
```bash
# Development
python.exe -m app.main
set FLASK_APP=app.main
flask --app app.main --debug run

# Database
flask --app app.main init-db
flask --app app.main create-admin
flask db migrate -m "Message"
flask db upgrade
flask routes
```

Frontend Commands
```bash
# Development
npm run dev

# Testing
npm run test
npm run test:watch
npm run test:coverage
npm run test:verbose

# Linting and building
npm run lint
npm run build
npm run preview
```
---

## 📚 API Endpoints

### 🔐 Authentication
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- GET /api/auth/me - Get current user

### 🎯 Products
- GET /api/products - Get all products
- GET /api/products/{id} - Get product details
- POST /api/admin/products - Create product (Admin)
- PUT /api/admin/products/{id} - Update product (Admin)
- DELETE /api/admin/products/{id} - Delete product (Admin)

### 🛒 Cart
- GET /api/cart - Get user's cart
- POST /api/cart/add - Add item to cart
- DELETE /api/cart/remove/{id} - Remove from cart
- PUT /api/cart/update - Update from cart
- DELETE /api/cart/clear - Clear cart

### 📦 Orders
- GET /api/orders - Get user's orders
- POST /api/orders - Create new order

### 👨‍💼 Admin
- GET /api/admin/users - Get all users
- GET /api/admin/orders - Get all orders
- GET /api/admin/stats - Get dashboard stats
- PUT /api/admin/orders/1/status - Update order status
- PUT /api/admin/users/{id} - Update user details and auth
---

## 🧪 Testing

### Backend Tests

```bash
python -m pytest
python -m pytest app/tests/test_auth.py -v
```
### Frontend Tests
```bash
npm run test
npm run test:coverage
```

---

## 📁 Project Structure
```bash
SpaisingStore/
├── backend/
│   ├── app/
│   │   ├── middleware/      # Middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── schemas/         # Marshmallow schemas
│   │   ├── tests/           # Test suite
│   │   ├── utils/           # Utils
│   │   └── main.py          # Application entry point
│   └── migrations/          # Database migrations
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── redux/          # State management
│   │   ├── api/            # API configuration
│   │   ├── routes/         # Protected/Public Route
│   │   └── tests/          # Test files
│   └── package.json
```

---

## 🔧 Key Features Implemented

### Frontend (React & Redux)
1. Functional components with hooks (useState, useEffect, useRef)
2. Custom reusable Input component with forwardRef
3. Redux Toolkit for global state management
4. Lazy loading for admin routes
5. Custom hooks (useAuth, useFetch)
6. API services layer with Axios
7. Unit tests with Jest and React Testing Library

### Backend (Flask)
1. RESTful API with role-based access control
2. JWT authentication with role-based permissions
3. Custom middleware for request logging
4. SQLAlchemy ORM with MySQL
5. Marshmallow schemas for validation
6. Transactional checkout process
7. Email notifications with templates
8. Global exception handling

### 🛡️ Security Features
1. JWT Authentication with role-based access
2. Password hashing using Werkzeug security
3. Input validation with Marshmallow schemas
4. SQL injection protection through SQLAlchemy ORM
5. CORS configuration for frontend integration
6. Protected admin routes

---

## 🚀 Deployment
### Production Checklist
- Set FLASK_ENV=production
- Use strong secret keys in production
- Configure production MySQL database
- Set up SMTP email service
- Configure CORS for your domain
- Build frontend with npm run build

---

## 📞 Support
For technical support or questions:
- Check browser console for errors
- Verify environment configuration
- Ensure backend server is running on port 5000
- Check network connectivity to the API

Contact: manojraj15@hotmail.com
Developer: Manoj R

---

## Happy Coding! 🎉