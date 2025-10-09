import axiosClient from './axiosClient';

export const shippingAPI = {
  // Get all shipping addresses for current user
  getAddresses: () => axiosClient.get('/shipping/addresses'),
  
  // Create new shipping address
  createAddress: (addressData) => axiosClient.post('/shipping/addresses', addressData),
  
  // Update shipping address
  updateAddress: (addressId, addressData) => 
    axiosClient.put(`/shipping/addresses/${addressId}`, addressData),
  
  // Delete shipping address
  deleteAddress: (addressId) => 
    axiosClient.delete(`/shipping/addresses/${addressId}`),
  
  // Set address as default
  setDefaultAddress: (addressId) => 
    axiosClient.put(`/shipping/addresses/${addressId}/set-default`)
};