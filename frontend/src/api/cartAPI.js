import axiosClient from './axiosClient';

export const cartAPI = {
  // Get user's cart
  getCart: () => axiosClient.get('/cart'),
  
  // Add item to cart
  addToCart: (productId, quantity = 1) => 
    axiosClient.post('/cart/add', { product_id: productId, quantity }),
  
  // Update cart item quantity
  updateCartItem: (productId, quantity) => 
    axiosClient.put('/cart/update', { product_id: productId, quantity }),
  
  // Remove item from cart
  removeFromCart: (productId) => 
    axiosClient.delete(`/cart/remove/${productId}`),
  
  // Clear entire cart
  clearCart: () => axiosClient.delete('/cart/clear')
};