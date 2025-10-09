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
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update cart');
    }
  }
);

export const removeFromCartBackend = createAsyncThunk(
  'cart/removeFromCartBackend',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await cartAPI.removeFromCart(productId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to remove from cart');
    }
  }
);

export const clearCartBackend = createAsyncThunk(
  'cart/clearCartBackend',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartAPI.clearCart();
      return response.data;
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
    clearError: (state) => {
      state.error = null;
    },
    clearCartLocal: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalAmount = 0;
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
        state.items = action.payload.items || [];
        state.totalItems = action.payload.total_items || 0;
        state.totalAmount = action.payload.total_amount || 0;
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
        state.items = action.payload.cart?.items || action.payload.items || [];
        state.totalItems = action.payload.cart?.total_items || action.payload.total_items || 0;
        state.totalAmount = action.payload.cart?.total_amount || action.payload.total_amount || 0;
      })
      .addCase(addToCartBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.payload || 'Failed to add to cart';
      })
      
      // Update Cart Item
      .addCase(updateCartItemBackend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItemBackend.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.cart?.items || action.payload.items || [];
        state.totalItems = action.payload.cart?.total_items || action.payload.total_items || 0;
        state.totalAmount = action.payload.cart?.total_amount || action.payload.total_amount || 0;
      })
      .addCase(updateCartItemBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.payload || 'Failed to update cart';
      })
      
      // Remove from Cart
      .addCase(removeFromCartBackend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCartBackend.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.cart?.items || action.payload.items || [];
        state.totalItems = action.payload.cart?.total_items || action.payload.total_items || 0;
        state.totalAmount = action.payload.cart?.total_amount || action.payload.total_amount || 0;
      })
      .addCase(removeFromCartBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.payload || 'Failed to remove from cart';
      })
      
      // Clear Cart
      .addCase(clearCartBackend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCartBackend.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [];
        state.totalItems = 0;
        state.totalAmount = 0;
      })
      .addCase(clearCartBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.payload || 'Failed to clear cart';
      });
  },
});

export const { 
  clearError,
  clearCartLocal
} = cartSlice.actions;

export default cartSlice.reducer;