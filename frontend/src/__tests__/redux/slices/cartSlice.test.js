import { configureStore } from '@reduxjs/toolkit';
import cartReducer, { 
  addToCartLocal, 
  removeFromCartLocal, 
  updateQuantityLocal,
  clearCartLocal 
} from '../../../redux/slices/cartSlice.js';

describe('cartSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({ reducer: { cart: cartReducer } });
  });

  const mockProduct = {
    id: 1,
    name: 'Test Product',
    price: 29.99
  };

  it('should handle initial state', () => {
    expect(store.getState().cart).toEqual({
      items: [],
      totalItems: 0,
      totalAmount: 0,
      loading: false,
      error: null,
    });
  });

  it('should add item to cart', () => {
    store.dispatch(addToCartLocal(mockProduct));
    
    const state = store.getState().cart;
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toEqual({ ...mockProduct, quantity: 1 });
    expect(state.totalItems).toBe(1);
    expect(state.totalAmount).toBe(29.99);
  });
});