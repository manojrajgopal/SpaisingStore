import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api/adminAPI';
import './Users.css';
import { useDispatch } from 'react-redux';
import { updateAdminUser, deleteAdminUser } from '../../redux/slices/adminSlice';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    is_admin: false
  });

  const dispatch = useDispatch();

  const handleEditUser = async (userData) => {
    try {
      await dispatch(updateAdminUser({ 
        userId: editingUser.id, 
        userData 
      })).unwrap();
      setEditingUser(null);
      // Refresh users list
      const response = await adminAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      alert('Failed to update user: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await dispatch(deleteAdminUser(userId)).unwrap();
      setDeleteConfirm(null);
      // Refresh users list
      const response = await adminAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      alert('Failed to delete user: ' + error.message);
    }
  };

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
                      <th className="actions-col">Actions</th>
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
                        <td className="actions-cell">
                          <div className="action-buttons">
                            <button 
                              onClick={() => {
                                setEditingUser(user);
                                setEditForm({
                                  first_name: user.first_name,
                                  last_name: user.last_name,
                                  email: user.email,
                                  is_admin: user.is_admin
                                });
                              }}
                              className="edit-btn"
                              title="Edit User"
                            >
                              <span className="action-icon">✏️</span>
                              Edit
                            </button>
                            <button 
                              onClick={() => setDeleteConfirm(user)}
                              className="delete-btn"
                              title="Delete User"
                              disabled={user.is_admin} // Prevent deleting admin users for safety
                            >
                              <span className="action-icon">🗑️</span>
                              Delete
                            </button>
                          </div>
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

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit User</h2>
              <button onClick={() => setEditingUser(null)} className="close-modal-btn">
                ✕
              </button>
            </div>
            <div className="user-form">
              <div className="form-group">
                <label>First Name:</label>
                <input 
                  type="text" 
                  value={editForm.first_name}
                  onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Last Name:</label>
                <input 
                  type="text" 
                  value={editForm.last_name}
                  onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input 
                  type="email" 
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={editForm.is_admin}
                    onChange={(e) => setEditForm({...editForm, is_admin: e.target.checked})}
                  />
                  Admin User
                </label>
              </div>
              <div className="form-actions">
                <button onClick={() => handleEditUser(editForm)} className="save-btn">
                  Save Changes
                </button>
                <button onClick={() => setEditingUser(null)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="delete-confirm-modal">
              <div className="delete-icon">🗑️</div>
              <h3>Delete User</h3>
              <p>Are you sure you want to delete user <strong>"{deleteConfirm.first_name} {deleteConfirm.last_name}"</strong>?</p>
              <p className="delete-warning">This will also delete all their orders and cannot be undone.</p>
              <div className="confirm-actions">
                <button 
                  onClick={() => handleDeleteUser(deleteConfirm.id)}
                  className="confirm-delete-btn"
                >
                  Yes, Delete User
                </button>
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="cancel-delete-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;