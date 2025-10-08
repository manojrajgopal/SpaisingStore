import axiosClient from './axiosClient';

export const productAPI = {
  getAll: () => axiosClient.get('/products'),
  getById: (id) => axiosClient.get(`/products/${id}`),
};