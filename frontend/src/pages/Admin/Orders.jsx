import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminOrders, updateOrderStatus } from '../../redux/slices/adminSlice';
import './Orders.css';

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector(state => state.admin);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const statusOptions = [
    { value: 'pending', label: '⏳ Pending', color: 'status-pending' },
    { value: 'processing', label: '⚙️ Processing', color: 'status-processing' },
    { value: 'shipped', label: '🚚 Shipped', color: 'status-shipped' },
    { value: 'delivered', label: '✅ Delivered', color: 'status-completed' },
    { value: 'cancelled', label: '❌ Cancelled', color: 'status-cancelled' }
  ];

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'status-completed';
      case 'shipped': return 'status-shipped';
      case 'processing': return 'status-processing';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return '✅';
      case 'shipped': return '🚚';
      case 'processing': return '⚙️';
      case 'pending': return '⏳';
      case 'cancelled': return '❌';
      default: return '⏳';
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(orderId);
      await dispatch(updateOrderStatus({ orderId, status: newStatus })).unwrap();
      setUpdatingStatus(null);
    } catch (error) {
      alert('Failed to update order status: ' + error.message);
      setUpdatingStatus(null);
    }
  };

  if (loading) return (
    <div className="admin-orders-page">
      <div className="background-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>
      
      <div className="orders-container">
        <div className="loading-orders">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-orders-page">
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
          <h1 className="orders-title">Order Management</h1>
          <p className="orders-subtitle">Manage and track customer orders</p>
          <div className="orders-stats">
            <span className="stat">Total Orders: {orders.length}</span>
          </div>
        </div>

        {/* Orders List */}
        <div className="orders-content">
          {orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No Orders Found</h3>
              <p>There are no orders to display at the moment.</p>
            </div>
          ) : (
            <div className="orders-grid">
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  {/* Order Header */}
                  <div className="order-card-header">
                    <div className="order-info">
                      <h3 className="order-number">Order #{order.id}</h3>
                      <div className="order-customer">
                        <span className="customer-label">Customer ID:</span>
                        <span className="customer-id">{order.user_id}</span>
                      </div>
                    </div>
                    <div className="order-status">
                      <span 
                        className={`status-badge ${getStatusColor(order.status)} ${updatingStatus === order.id ? 'updating' : ''}`}
                        onClick={() => setSelectedOrder(order)}
                        title="Click to view details and update status"
                      >
                        <span className="status-icon">{getStatusIcon(order.status)}</span>
                        {updatingStatus === order.id ? 'Updating...' : order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="order-card-details">
                    <div className="detail-row">
                      <span className="detail-label">Total Amount:</span>
                      <span className="detail-value">${order.total_amount}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Order Date:</span>
                      <span className="detail-value">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Shipping:</span>
                      <span className="detail-value address">{order.shipping_address}</span>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="order-items-preview">
                    <h4 className="items-title">Items ({order.order_items ? order.order_items.length : 0})</h4>
                    <div className="items-list">
                      {order.order_items && order.order_items.slice(0, 2).map(item => (
                        <div key={item.id} className="preview-item">
                          <span className="item-name">{item.product_name}</span>
                          <span className="item-quantity">x{item.quantity}</span>
                        </div>
                      ))}
                      {order.order_items && order.order_items.length > 2 && (
                        <div className="more-items">+{order.order_items.length - 2} more items</div>
                      )}
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="order-card-actions">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="view-details-btn"
                    >
                      <span className="btn-icon">👁️</span>
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="order-detail-modal">
                {/* Modal Header */}
                <div className="modal-header">
                  <h2>Order Details</h2>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="close-modal-btn"
                  >
                    ✕
                  </button>
                </div>

                {/* Order Information */}
                <div className="modal-body">
                  <div className="order-detail-section">
                    <h3>Order Information</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Order ID:</span>
                        <span className="detail-value">#{selectedOrder.id}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Customer ID:</span>
                        <span className="detail-value">{selectedOrder.user_id}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Status:</span>
                        <span className={`status-badge ${getStatusColor(selectedOrder.status)}`}>
                          <span className="status-icon">{getStatusIcon(selectedOrder.status)}</span>
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Total Amount:</span>
                        <span className="detail-value total">${selectedOrder.total_amount}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Order Date:</span>
                        <span className="detail-value">
                          {new Date(selectedOrder.created_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Status Update */}
                  <div className="order-detail-section">
                    <h3>Order Status</h3>
                    <div className="status-selector">
                      <label>Update Status:</label>
                      <select 
                        value={selectedOrder.status} 
                        onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                        disabled={updatingStatus === selectedOrder.id}
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {updatingStatus === selectedOrder.id && (
                        <span className="updating-text">Updating...</span>
                      )}
                    </div>
                  </div>

                  {/* Shipping Information */}
                  <div className="order-detail-section">
                    <h3>Shipping Information</h3>
                    <div className="shipping-address">
                      {selectedOrder.shipping_address}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="order-detail-section">
                    <h3>Order Items</h3>
                    <div className="items-table-container">
                      <table className="items-table">
                        <thead>
                          <tr>
                            <th>Product Name</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.order_items && selectedOrder.order_items.map(item => (
                            <tr key={item.id}>
                              <td className="product-name">{item.product_name}</td>
                              <td className="quantity">{item.quantity}</td>
                              <td className="price">${item.price}</td>
                              <td className="subtotal">${(item.quantity * item.price).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="3" className="total-label">Total Amount:</td>
                            <td className="total-amount">${selectedOrder.total_amount}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="modal-actions">
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="close-btn"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;