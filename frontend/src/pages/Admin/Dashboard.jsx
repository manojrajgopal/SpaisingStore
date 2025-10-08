import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminStats } from '../../redux/slices/adminSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector(state => state.admin);

  useEffect(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>{stats.total_users}</p>
          </div>
          <div className="stat-card">
            <h3>Total Products</h3>
            <p>{stats.total_products}</p>
          </div>
          <div className="stat-card">
            <h3>Total Orders</h3>
            <p>{stats.total_orders}</p>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p>${stats.total_revenue.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;