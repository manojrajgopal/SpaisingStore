import React, { useEffect, useState } from 'react';
import { orderAPI } from '../api/orderAPI';
import { useAuth } from '../hooks/useAuth';

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
    return <div>Please login to view your orders</div>;
  }

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="orders">
      <h2>Your Orders</h2>
      
      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        orders.map(order => (
          <div key={order.id} className="order-card">
            <h3>Order #{order.id}</h3>
            <p>Total: ${order.total_amount}</p>
            <p>Status: {order.status}</p>
            <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
            
            <div className="order-items">
              <h4>Items:</h4>
              {order.order_items.map(item => (
                <div key={item.id} className="order-item">
                  <span>{item.product_name} x {item.quantity}</span>
                  <span>${item.price}</span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;