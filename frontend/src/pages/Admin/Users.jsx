import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api/adminAPI';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await adminAPI.getUsers();
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return (
    <div className="admin-users-page">
      <div className="background-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>
      
      <div className="users-container">
        <div className="loading-users">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-users-page">
      {/* Animated Background */}
      <div className="background-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>
      
      <div className="users-container">
        {/* Header Section */}
        <div className="users-header">
          <h1 className="users-title">User Management</h1>
          <p className="users-subtitle">Manage and monitor user accounts</p>
          <div className="users-stats">
            <div className="stat-card">
              <span className="stat-number">{users.length}</span>
              <span className="stat-label">Total Users</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{users.filter(user => user.is_admin).length}</span>
              <span className="stat-label">Admin Users</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{users.filter(user => !user.is_admin).length}</span>
              <span className="stat-label">Regular Users</span>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="users-content">
          {users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No Users Found</h3>
              <p>There are no users registered in the system.</p>
            </div>
          ) : (
            <div className="users-table-container">
              <div className="table-responsive">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th className="id-col">ID</th>
                      <th className="user-col">User</th>
                      <th className="email-col">Email</th>
                      <th className="role-col">Role</th>
                      <th className="joined-col">Joined Date</th>
                      <th className="status-col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="user-row">
                        <td className="id-cell">
                          <span className="user-id">#{user.id}</span>
                        </td>
                        <td className="user-cell">
                          <div className="user-avatar">
                            {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                          </div>
                          <div className="user-info">
                            <div className="user-name">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="user-joined-mobile">
                              Joined {new Date(user.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="email-cell">
                          <span className="user-email">{user.email}</span>
                        </td>
                        <td className="role-cell">
                          <span className={`role-badge ${user.is_admin ? 'admin' : 'user'}`}>
                            <span className="role-icon">
                              {user.is_admin ? '👑' : '👤'}
                            </span>
                            {user.is_admin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="joined-cell">
                          <div className="joined-date">
                            {new Date(user.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="joined-time">
                            {new Date(user.created_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="status-cell">
                          <span className="status-badge active">
                            <span className="status-dot"></span>
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;