import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../api/orderAPI';
import { shippingAPI } from '../api/shippingAPI';
import { clearCartBackend } from '../redux/slices/cartSlice';
import ShippingAddressForm from './ShippingAddressForm';
import './Checkout.css';

const Checkout = ({ onBack, onSuccess }) => {
  const { items, totalAmount } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await shippingAPI.getAddresses();
      setAddresses(response.data);
      
      // Set default address if available
      const defaultAddress = response.data.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    }
  };

  const handleAddressSubmit = async (addressData) => {
    try {
      setLoading(true);
      let response;
      
      if (editingAddress) {
        response = await shippingAPI.updateAddress(editingAddress.id, addressData);
      } else {
        response = await shippingAPI.createAddress(addressData);
      }
      
      await fetchAddresses(); // Refresh addresses
      setShowAddressForm(false);
      setEditingAddress(null);
      
      // Select the new/updated address if it's set as default or it's the only one
      if (addressData.is_default || addresses.length === 0) {
        setSelectedAddress(response.data.address);
      }
    } catch (error) {
      alert('Failed to save address: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    try {
      await shippingAPI.deleteAddress(addressId);
      await fetchAddresses();
      
      // If we deleted the selected address, clear selection
      if (selectedAddress && selectedAddress.id === addressId) {
        setSelectedAddress(null);
      }
    } catch (error) {
      alert('Failed to delete address: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await shippingAPI.setDefaultAddress(addressId);
      await fetchAddresses();
    } catch (error) {
      alert('Failed to set default address: ' + (error.response?.data?.error || error.message));
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Please select a shipping address');
      return;
    }

    try {
      setLoading(true);
      
      const orderData = {
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        shipping_address: selectedAddress // Send the full address object
      };

      await orderAPI.create(orderData);
      await dispatch(clearCartBackend()).unwrap();
      
      // Show success message
      alert('Order placed successfully! A confirmation email has been sent to your email address.');
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/orders');
      }
    } catch (error) {
      alert('Checkout failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    return `${address.full_name}, ${address.address_line1}${address.address_line2 ? ', ' + address.address_line2 : ''}, ${address.city}, ${address.state} ${address.postal_code}, ${address.country}`;
  };

  // Step 1: Shipping Address
  if (step === 1) {
    return (
      <div className="checkout-step">
        <h2>Shipping Address</h2>
        
        {showAddressForm ? (
          <ShippingAddressForm
            address={editingAddress}
            onSubmit={handleAddressSubmit}
            onCancel={() => {
              setShowAddressForm(false);
              setEditingAddress(null);
            }}
          />
        ) : (
          <>
            <div className="addresses-list">
              {addresses.map(address => (
                <div 
                  key={address.id} 
                  className={`address-card ${selectedAddress?.id === address.id ? 'selected' : ''}`}
                  onClick={() => setSelectedAddress(address)}
                >
                  <div className="address-content">
                    <div className="address-header">
                      <h4>{address.full_name}</h4>
                      {address.is_default && <span className="default-badge">Default</span>}
                    </div>
                    <p>{formatAddress(address)}</p>
                    {address.phone_number && <p>Phone: {address.phone_number}</p>}
                  </div>
                  
                  <div className="address-actions">
                    {!address.is_default && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefaultAddress(address.id);
                        }}
                        className="action-btn set-default"
                      >
                        Set Default
                      </button>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingAddress(address);
                        setShowAddressForm(true);
                      }}
                      className="action-btn edit"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAddress(address.id);
                      }}
                      className="action-btn delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setShowAddressForm(true)}
              className="add-address-btn"
            >
              + Add New Address
            </button>

            <div className="checkout-actions">
              <button onClick={onBack} className="back-btn">
                Back to Cart
              </button>
              <button 
                onClick={() => setStep(2)} 
                disabled={!selectedAddress}
                className="continue-btn"
              >
                Continue to Payment
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Step 2: Payment Method
  if (step === 2) {
    return (
      <div className="checkout-step">
        <h2>Payment Method</h2>
        
        <div className="payment-methods">
          <div 
            className={`payment-method ${paymentMethod === 'card' ? 'selected' : ''}`}
            onClick={() => setPaymentMethod('card')}
          >
            <div className="payment-header">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'card'}
                onChange={() => setPaymentMethod('card')}
              />
              <span className="payment-title">Credit/Debit Card</span>
            </div>
            <p>Pay securely with your credit or debit card</p>
            <div className="payment-placeholder">
              <p>💳 Payment integration would be implemented here</p>
              <p>This is a demo - no real payment processing</p>
            </div>
          </div>

          <div 
            className={`payment-method ${paymentMethod === 'paypal' ? 'selected' : ''}`}
            onClick={() => setPaymentMethod('paypal')}
          >
            <div className="payment-header">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'paypal'}
                onChange={() => setPaymentMethod('paypal')}
              />
              <span className="payment-title">PayPal</span>
            </div>
            <p>Pay with your PayPal account</p>
          </div>
        </div>

        <div className="checkout-actions">
          <button onClick={() => setStep(1)} className="back-btn">
            Back to Address
          </button>
          <button onClick={() => setStep(3)} className="continue-btn">
            Review Order
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Review Order
  return (
    <div className="checkout-step">
      <h2>Review Your Order</h2>
      
      <div className="review-section">
        <div className="review-items">
          <h4>Order Items</h4>
          {items.map(item => (
            <div key={item.id} className="review-item">
              <span className="item-name">{item.name}</span>
              <span className="item-quantity">x{item.quantity}</span>
              <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="review-address">
          <h4>Shipping Address</h4>
          <p>{formatAddress(selectedAddress)}</p>
        </div>

        <div className="review-payment">
          <h4>Payment Method</h4>
          <p>{paymentMethod === 'card' ? 'Credit/Debit Card' : 'PayPal'}</p>
        </div>

        <div className="review-total">
          <h4>Order Total: ${totalAmount.toFixed(2)}</h4>
        </div>
      </div>

      <div className="checkout-actions">
        <button onClick={() => setStep(2)} className="back-btn">
          Back to Payment
        </button>
        <button 
          onClick={handlePlaceOrder}
          disabled={loading}
          className="place-order-btn"
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
};

export default Checkout;