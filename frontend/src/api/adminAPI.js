import axiosClient from './axiosClient';

export const adminAPI = {
  // Products
  getProducts: () => axiosClient.get('/admin/products'),
  createProduct: (productData) => axiosClient.post('/admin/products', productData),
  updateProduct: (id, productData) => axiosClient.put(`/admin/products/${id}`, productData),
  deleteProduct: (id) => axiosClient.delete(`/admin/products/${id}`),
  
  // Users
  getUsers: () => axiosClient.get('/admin/users'),
  
  // Orders
  getOrders: () => axiosClient.get('/admin/orders'),
  
  // Stats
  getStats: () => axiosClient.get('/admin/stats'),

  updateUser: (userId, userData) => 
    axiosClient.put(`/admin/users/${userId}`, userData),

  deleteUser: (userId) => 
    axiosClient.delete(`/admin/users/${userId}`),

  updateOrderStatus: (orderId, statusData) => 
    axiosClient.put(`/admin/orders/${orderId}/status`, statusData),
};