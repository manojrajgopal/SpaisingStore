import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminOrders } from '../../redux/slices/adminSlice';

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector(state => state.admin);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'shipped': return 'status-shipped';
      case 'processing': return 'status-processing';
      case 'pending': return 'status-pending';
      default: return 'status-pending';
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="admin-orders">
      <h2>Order Management</h2>
      
      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <h4>Order #{order.id}</h4>
              <span className={`status-badge ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            
            <div className="order-details">
              <p><strong>Customer ID:</strong> {order.user_id}</p>
              <p><strong>Total:</strong> ${order.total_amount}</p>
              <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
              <p><strong>Shipping Address:</strong> {order.shipping_address}</p>
            </div>
            
            <div className="order-items">
              <h5>Items:</h5>
              {order.order_items && order.order_items.map(item => (
                <div key={item.id} className="order-item">
                  <span>{item.product_name} x {item.quantity}</span>
                  <span>${item.price} each</span>
                </div>
              ))}
            </div>
            
            <div className="order-actions">
              <button 
                onClick={() => setSelectedOrder(order)}
                className="btn-view"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="empty-state">
          <p>No orders found.</p>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="order-detail-modal">
              <h3>Order Details #{selectedOrder.id}</h3>
              
              <div className="order-info">
                <p><strong>Customer ID:</strong> {selectedOrder.user_id}</p>
                <p><strong>Status:</strong> 
                  <span className={`status-badge ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </p>
                <p><strong>Total Amount:</strong> ${selectedOrder.total_amount}</p>
                <p><strong>Order Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                <p><strong>Shipping Address:</strong></p>
                <p className="shipping-address">{selectedOrder.shipping_address}</p>
              </div>

              <div className="order-items-detail">
                <h4>Order Items</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.order_items && selectedOrder.order_items.map(item => (
                      <tr key={item.id}>
                        <td>{item.product_name}</td>
                        <td>{item.quantity}</td>
                        <td>${item.price}</td>
                        <td>${(item.quantity * item.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="modal-actions">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;