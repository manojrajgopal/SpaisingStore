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
  const { isAuthenticated } = useAuth();
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
      <div className="background-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>
      
      <div className="cart-container">
        <div className="cart-card">
          <div className="cart-header">
            <h1 className="cart-title">Your Shopping Cart</h1>
            <p className="cart-subtitle">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
          </div>

          <div className="cart-items">
            {items.map(item => {
              const product = item.product || {};
              return (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="item-image-preview" />
                    ) : (
                      <div className="image-placeholder">👗</div>
                    )}
                  </div>
                  
                  <div className="item-details">
                    <h3 className="item-name">{product.name}</h3>
                    <p className="item-price">${product.price}</p>
                    
                    <div className="item-controls">
                      <div className="quantity-controls">
                        <label className="quantity-label">Quantity:</label>
                        <div className="quantity-input-group">
                          <button
                            onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updatingItems[item.product_id]}
                            className="quantity-btn"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(item.product_id, parseInt(e.target.value) || 1)}
                            min="1"
                            max={product.available_stock || product.stock_quantity || 1}
                            className="quantity-input"
                            disabled={updatingItems[item.product_id]}
                          />
                          <button
                            onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                            disabled={item.quantity >= (product.available_stock || product.stock_quantity) || updatingItems[item.product_id]}
                            className="quantity-btn"
                          >
                            +
                          </button>
                        </div>
                        {updatingItems[item.product_id] && <span className="updating-text">Updating...</span>}
                      </div>
                      
                      <button 
                        onClick={() => handleRemoveFromCart(item.product_id)}
                        className="remove-btn"
                        disabled={updatingItems[item.product_id]}
                      >
                        <span className="remove-icon">🗑️</span>
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  <div className="item-total">
                    <span className="total-amount">${(product.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>

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
