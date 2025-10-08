import axiosClient from './axiosClient';

export const orderAPI = {
  getAll: () => axiosClient.get('/orders'),
  create: (orderData) => axiosClient.post('/orders', orderData),
};