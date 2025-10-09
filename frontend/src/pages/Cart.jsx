import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchCart, 
  updateCartItemBackend, 
  removeFromCartBackend, 
  clearCartBackend 
} from '../redux/slices/cartSlice';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Checkout from '../components/Checkout';
import './Cart.css';

const Cart = () => {
  const { items, totalAmount, loading } = useSelector(state => state.cart);
  const { isAuthenticated, user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [updatingItems, setUpdatingItems] = useState({});
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdatingItems(prev => ({ ...prev, [productId]: true }));
    try {
      await dispatch(updateCartItemBackend({ productId, quantity: newQuantity })).unwrap();
    } catch (error) {
      alert('Failed to update quantity: ' + (error.message || 'Unknown error'));
    } finally {
      setUpdatingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      await dispatch(removeFromCartBackend(productId)).unwrap();
    } catch (error) {
      alert('Failed to remove item: ' + (error.message || 'Unknown error'));
    }
  };

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    navigate('/orders');
  };

  if (!isAuthenticated) {
    return (
      <div className="cart-page">
        <div className="background-animation">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
          <div className="floating-shape shape-4"></div>
        </div>
        
        <div className="cart-container">
          <div className="cart-card">
            <div className="empty-cart">
              <div className="empty-cart-icon">🔒</div>
              <h2 className="empty-cart-title">Please Login</h2>
              <p className="empty-cart-message">You need to be logged in to view your cart</p>
              <button 
                onClick={() => navigate('/login')}
                className="continue-shopping-btn"
              >
                Login to Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading && items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-card">
            <div className="empty-cart">
              <div className="loading-spinner"></div>
              <p>Loading your cart...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !showCheckout) {
    return (
      <div className="cart-page">
        <div className="background-animation">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
          <div className="floating-shape shape-4"></div>
        </div>
        
        <div className="cart-container">
          <div className="cart-card">
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h2 className="empty-cart-title">Your Cart is Empty</h2>
              <p className="empty-cart-message">Add some amazing fashion items to get started!</p>
              <button 
                onClick={() => navigate('/products')}
                className="continue-shopping-btn"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showCheckout) {
    return (
      <div className="cart-page">
        <div className="background-animation">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
          <div className="floating-shape shape-4"></div>
        </div>
        
        <div className="cart-container">
          <div className="cart-card">
            <Checkout 
              onBack={() => setShowCheckout(false)}
              onSuccess={handleCheckoutSuccess}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* Animated Background */}
      <div className="background-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>
      
      <div className="cart-container">
        <div className="cart-card">
          {/* Header */}
          <div className="cart-header">
            <h1 className="cart-title">Your Shopping Cart</h1>
            <p className="cart-subtitle">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
          </div>

          {/* Cart Items */}
          <div className="cart-items">
            {items.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="item-image-preview" />
                  ) : (
                    <div className="image-placeholder">👗</div>
                  )}
                </div>
                
                <div className="item-details">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-price">${item.price}</p>
                  
                  <div className="item-controls">
                    <div className="quantity-controls">
                      <label className="quantity-label">Quantity:</label>
                      <div className="quantity-input-group">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updatingItems[item.id]}
                          className="quantity-btn"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                          min="1"
                          max={item.available_stock}
                          className="quantity-input"
                          disabled={updatingItems[item.id]}
                        />
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.available_stock || updatingItems[item.id]}
                          className="quantity-btn"
                        >
                          +
                        </button>
                      </div>
                      {updatingItems[item.id] && <span className="updating-text">Updating...</span>}
                    </div>
                    
                    <button 
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="remove-btn"
                      disabled={updatingItems[item.id]}
                    >
                      <span className="remove-icon">🗑️</span>
                      Remove
                    </button>
                  </div>
                </div>
                
                <div className="item-total">
                  <span className="total-amount">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="cart-summary">
            <div className="summary-row">
              <span className="summary-label">Subtotal:</span>
              <span className="summary-value">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Shipping:</span>
              <span className="summary-value">Free</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total-row">
              <span className="total-label">Total:</span>
              <span className="total-value">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout Section */}
          <div className="checkout-section">
            <button 
              onClick={() => setShowCheckout(true)}
              className="checkout-btn"
              disabled={loading}
            >
              <span className="checkout-icon">💳</span>
              Proceed to Checkout
            </button>
            
            <button 
              onClick={() => navigate('/products')}
              className="continue-shopping-btn secondary"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;