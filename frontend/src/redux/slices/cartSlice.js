import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../../api/cartAPI';

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartAPI.getCart();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch cart');
    }
  }
);

export const addToCartBackend = createAsyncThunk(
  'cart/addToCartBackend',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const response = await cartAPI.addToCart(productId, quantity);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add to cart');
    }
  }
);

export const updateCartItemBackend = createAsyncThunk(
  'cart/updateCartItemBackend',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartAPI.updateCartItem(productId, quantity);
      return { productId, quantity, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update cart');
    }
  }
);

export const removeFromCartBackend = createAsyncThunk(
  'cart/removeFromCartBackend',
  async (productId, { rejectWithValue }) => {
    try {
      await cartAPI.removeFromCart(productId);
      return productId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to remove from cart');
    }
  }
);

export const clearCartBackend = createAsyncThunk(
  'cart/clearCartBackend',
  async (_, { rejectWithValue }) => {
    try {
      await cartAPI.clearCart();
      return [];
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to clear cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalItems: 0,
    totalAmount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    // Local actions for immediate UI response
    addToCartLocal: (state, action) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    
    removeFromCartLocal: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    
    updateQuantityLocal: (state, action) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    
    clearCartLocal: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalAmount = 0;
    },
    
    setCart: (state, action) => {
      state.items = action.payload.cart || action.payload.items || [];
      state.totalItems = action.payload.total_items || action.payload.totalItems || 0;
      state.totalAmount = action.payload.total_amount || action.payload.totalAmount || 0;
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.cart || action.payload.items || [];
        state.totalItems = action.payload.total_items || action.payload.totalItems || 0;
        state.totalAmount = action.payload.total_amount || action.payload.totalAmount || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.payload || 'Failed to fetch cart';
      })
      
      // Add to Cart
      .addCase(addToCartBackend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCartBackend.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.cart || action.payload.items || state.items;
        state.totalItems = action.payload.total_items || action.payload.totalItems || state.totalItems;
        state.totalAmount = action.payload.total_amount || action.payload.totalAmount || state.totalAmount;
      })
      .addCase(addToCartBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.payload || 'Failed to add to cart';
      })
      
      // Update Cart Item - FIXED: Properly update the quantity in the state
      .addCase(updateCartItemBackend.fulfilled, (state, action) => {
        const { productId, quantity } = action.payload;
        const item = state.items.find(item => item.id === productId || item.product_id === productId);
        if (item) {
          item.quantity = quantity;
        }
        // Recalculate totals
        state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
        state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      })
      
      // Remove from Cart - FIXED: Properly remove item from state
      .addCase(removeFromCartBackend.fulfilled, (state, action) => {
        const productId = action.payload;
        state.items = state.items.filter(item => item.id !== productId && item.product_id !== productId);
        state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
        state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      })
      
      // Clear Cart
      .addCase(clearCartBackend.fulfilled, (state) => {
        state.items = [];
        state.totalItems = 0;
        state.totalAmount = 0;
      });
  },
});

export const { 
  addToCartLocal, 
  removeFromCartLocal, 
  updateQuantityLocal, 
  clearCartLocal,
  setCart,
  clearError 
} = cartSlice.actions;

export default cartSlice.reducer;