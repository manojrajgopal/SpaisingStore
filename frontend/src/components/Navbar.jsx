import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const cartItems = useSelector(state => state.cart.items);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">Spaising's Store</Link>
      </div>
      
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        
        {user ? (
          <>
            <Link to="/cart">
              Cart ({cartItems.reduce((total, item) => total + item.quantity, 0)})
            </Link>
            <Link to="/orders">Orders</Link>
            {isAdmin && <Link to="/admin">Admin</Link>}
            <span>Welcome, {user.first_name}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;