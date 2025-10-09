import React, { useEffect, useState } from 'react';
import { orderAPI } from '../api/orderAPI';
import { useAuth } from '../hooks/useAuth';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchOrders = async () => {
      try {
        const response = await orderAPI.getAll();
        setOrders(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="orders-page">
        <div className="background-animation">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
          <div className="floating-shape shape-4"></div>
        </div>
        
        <div className="orders-container">
          <div className="auth-required">
            <div className="auth-icon">🔐</div>
            <h2>Authentication Required</h2>
            <p>Please login to view your orders</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="orders-page">
      <div className="background-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>
      
      <div className="orders-container">
        <div className="loading-orders">
          <div className="loading-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="orders-page">
      <div className="background-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>
      
      <div className="orders-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h2>Error Loading Orders</h2>
          <p>{error}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="orders-page">
      {/* Animated Background */}
      <div className="background-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>
      
      <div className="orders-container">
        {/* Header Section */}
        <div className="orders-header">
          <h1 className="orders-title">Your Orders</h1>
          <p className="orders-subtitle">Track and manage your purchases</p>
        </div>

        {/* Orders List */}
        <div className="orders-content">
          {orders.length === 0 ? (
            <div className="no-orders">
              <div className="no-orders-icon">📦</div>
              <h2>No Orders Yet</h2>
              <p>Start shopping to see your orders here</p>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  {/* Order Header */}
                  <div className="order-header">
                    <div className="order-info">
                      <h3 className="order-number">Order #{order.id}</h3>
                      <div className="order-date">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="order-status">
                      <span className={`status-badge status-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="order-items">
                    <h4 className="items-title">Items</h4>
                    {order.order_items.map(item => (
                      <div key={item.id} className="order-item">
                        <div className="item-info">
                          <span className="item-name">{item.product_name}</span>
                          <span className="item-quantity">x {item.quantity}</span>
                        </div>
                        <div className="item-price">${item.price}</div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="order-footer">
                    <div className="order-total">
                      <span className="total-label">Total Amount:</span>
                      <span className="total-amount">${order.total_amount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;