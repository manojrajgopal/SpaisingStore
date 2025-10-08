import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity, clearCart } from '../redux/slices/cartSlice';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../api/orderAPI';

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
      <div className="cart">
        <h2>Your Cart</h2>
        <p>Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="cart">
      <h2>Your Cart</h2>
      
      {items.map(item => (
        <div key={item.id} className="cart-item">
          <h4>{item.name}</h4>
          <p>${item.price} x {item.quantity}</p>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => dispatch(updateQuantity({
              id: item.id,
              quantity: parseInt(e.target.value) || 1
            }))}
            min="1"
          />
          <button onClick={() => dispatch(removeFromCart(item.id))}>
            Remove
          </button>
        </div>
      ))}
      
      <div className="cart-total">
        <h3>Total: ${total.toFixed(2)}</h3>
      </div>
      
      <button onClick={handleCheckout} className="checkout-btn">
        Checkout
      </button>
    </div>
  );
};

export default Cart;