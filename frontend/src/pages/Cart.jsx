import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity, clearCart } from '../redux/slices/cartSlice';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../api/orderAPI';
import './Cart.css';

const Cart = () => {
  const { items } = useSelector(state => state.cart);
  const { isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const orderData = {
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        shipping_address: '123 Main St' // In real app, get from form
      };

      await orderAPI.create(orderData);
      dispatch(clearCart());
      navigate('/orders');
    } catch (error) {
      alert('Checkout failed: ' + (error.response?.data?.error || error.message));
    }
  };

  if (items.length === 0) {
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
                  <div className="image-placeholder">👗</div>
                </div>
                
                <div className="item-details">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-price">${item.price}</p>
                  
                  <div className="item-controls">
                    <div className="quantity-controls">
                      <label className="quantity-label">Quantity:</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => dispatch(updateQuantity({
                          id: item.id,
                          quantity: parseInt(e.target.value) || 1
                        }))}
                        min="1"
                        className="quantity-input"
                      />
                    </div>
                    
                    <button 
                      onClick={() => dispatch(removeFromCart(item.id))}
                      className="remove-btn"
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
              <span className="summary-value">${total.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Shipping:</span>
              <span className="summary-value">Free</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total-row">
              <span className="total-label">Total:</span>
              <span className="total-value">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout Section */}
          <div className="checkout-section">
            <button 
              onClick={handleCheckout} 
              className="checkout-btn"
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