import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAdminStats } from '../../redux/slices/adminSlice';
import './Dashboard.css';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector(state => state.admin);

  useEffect(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  const quickActions = [
    { icon: '📊', title: 'Products', path: '/admin/products', description: 'Manage inventory' },
    { icon: '👥', title: 'Users', path: '/admin/users', description: 'User management' },
    { icon: '📦', title: 'Orders', path: '/admin/orders', description: 'View all orders' },
    { icon: '➕', title: 'Add Product', path: '/admin/products', description: 'Create new product' }
  ];

  const recentActivities = [
    { action: 'New order received', time: '2 min ago', type: 'order' },
    { action: 'User registration', time: '5 min ago', type: 'user' },
    { action: 'Product updated', time: '10 min ago', type: 'product' },
    { action: 'Payment processed', time: '15 min ago', type: 'payment' }
  ];

  if (loading) return (
    <div className="admin-dashboard-page">
      <div className="dashboard-container">
        <div className="loading-dashboard">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard-page">
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back! Here's what's happening with your store today.</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon users-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Total Users</h3>
                <p className="stat-value">{stats.total_users.toLocaleString()}</p>
                <div className="stat-trend">
                  <span className="trend-up">+12% this month</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon products-icon">
                <i className="fas fa-box"></i>
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Total Products</h3>
                <p className="stat-value">{stats.total_products.toLocaleString()}</p>
                <div className="stat-trend">
                  <span className="trend-up">+5% this month</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orders-icon">
                <i className="fas fa-shopping-cart"></i>
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Total Orders</h3>
                <p className="stat-value">{stats.total_orders.toLocaleString()}</p>
                <div className="stat-trend">
                  <span className="trend-up">+8% this month</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon revenue-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Total Revenue</h3>
                <p className="stat-value">${stats.total_revenue.toFixed(2)}</p>
                <div className="stat-trend">
                  <span className="trend-up">+15% this month</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Section */}
        <div className="section-container">
          <div className="section-header">
            <h2>Quick Actions</h2>
            <p>Frequently used admin functions</p>
          </div>
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <Link to={action.path} key={index} className="quick-action-card">
                <div className="action-icon">
                  <span>{action.icon}</span>
                </div>
                <div className="action-content">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
                <div className="action-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="dashboard-content-grid">
          {/* Recent Activities */}
          <div className="content-card">
            <div className="card-header">
              <h3>Recent Activities</h3>
              <span className="view-all">View All</span>
            </div>
            <div className="activities-list">
              {recentActivities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    <i className={`fas fa-${
                      activity.type === 'order' ? 'shopping-cart' :
                      activity.type === 'user' ? 'user-plus' :
                      activity.type === 'product' ? 'box' : 'credit-card'
                    }`}></i>
                  </div>
                  <div className="activity-content">
                    <p className="activity-text">{activity.action}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="content-card">
            <div className="card-header">
              <h3>Performance Metrics</h3>
            </div>
            <div className="metrics-grid">
              <div className="metric-item">
                <div className="metric-info">
                  <span className="metric-label">Conversion Rate</span>
                  <span className="metric-value">3.2%</span>
                </div>
                <div className="metric-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '65%'}}></div>
                  </div>
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-info">
                  <span className="metric-label">Customer Satisfaction</span>
                  <span className="metric-value">4.8/5</span>
                </div>
                <div className="metric-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '96%'}}></div>
                  </div>
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-info">
                  <span className="metric-label">Inventory Turnover</span>
                  <span className="metric-value">2.1x</span>
                </div>
                <div className="metric-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '70%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Performance Section */}
        <div className="dashboard-info">
          <div className="info-card">
            <h3>Store Performance Overview</h3>
            <p>Monitor your store's key metrics and make data-driven decisions to grow your business. Track sales performance, customer engagement, and inventory management in real-time.</p>
            <div className="info-features">
              <div className="feature">
                <span className="feature-icon">
                  <i className="fas fa-chart-bar"></i>
                </span>
                <span>Real-time Analytics</span>
              </div>
              <div className="feature">
                <span className="feature-icon">
                  <i className="fas fa-bolt"></i>
                </span>
                <span>Performance Insights</span>
              </div>
              <div className="feature">
                <span className="feature-icon">
                  <i className="fas fa-target"></i>
                </span>
                <span>Growth Tracking</span>
              </div>
              <div className="feature">
                <span className="feature-icon">
                  <i className="fas fa-bell"></i>
                </span>
                <span>Smart Notifications</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;