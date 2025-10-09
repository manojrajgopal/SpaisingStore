import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../hooks/useAuth';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const cartItems = useSelector(state => state.cart.items);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-link">
            <div className="brand-logo">
              <span className="logo-icon">🛍️</span>
            </div>
            <span className="brand-text">Spaising's Store</span>
          </Link>
        </div>
        
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/products" className="nav-link">Products</Link>
          
          {user ? (
            <>
              <Link to="/cart" className="nav-link cart-link">
                <span className="cart-icon">🛒</span>
                Cart 
                {cartItemCount > 0 && (
                  <span className="cart-badge">{cartItemCount}</span>
                )}
              </Link>
              <Link to="/orders" className="nav-link">Orders</Link>
              {isAdmin && <Link to="/admin" className="nav-link">Admin</Link>}
              <div className="user-welcome">
                <span className="welcome-text">Welcome,</span>
                <span className="user-name">{user.first_name}</span>
              </div>
              <button onClick={handleLogout} className="logout-btn">
                <span className="btn-text">Logout</span>
                <span className="btn-icon">🚪</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link login-link">Login</Link>
              <Link to="/register" className="nav-link register-link">Register</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;