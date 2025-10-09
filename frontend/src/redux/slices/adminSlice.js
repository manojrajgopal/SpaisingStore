import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminAPI } from '../../api/adminAPI';

// Async thunks
export const fetchAdminStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchAdminProducts = createAsyncThunk(
  'admin/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching admin products...');
      const response = await adminAPI.getProducts();
      console.log('📦 Admin products response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching admin products:', error);
      return rejectWithValue(error.response.data);
    }
  }
);

export const createAdminProduct = createAsyncThunk(
  'admin/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await adminAPI.createProduct(productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateAdminProduct = createAsyncThunk(
  'admin/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.updateProduct(id, productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteAdminProduct = createAsyncThunk(
  'admin/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      await adminAPI.deleteProduct(productId);
      return productId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchAdminUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getUsers();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchAdminOrders = createAsyncThunk(
  'admin/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getOrders();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: null,
    products: [],
    users: [],
    orders: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Add a manual update for testing
    updateProductStock: (state, action) => {
      const { productId, stockQuantity } = action.payload;
      const product = state.products.find(p => p.id === productId);
      if (product) {
        product.stock_quantity = stockQuantity;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Stats
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error;
      })
      // Fetch Products
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        console.log('🔄 Storing products in state:', action.payload);
        state.products = action.payload;
      })
      // Create Product
      .addCase(createAdminProduct.fulfilled, (state, action) => {
        state.products.push(action.payload.product);
      })
      // Update Product
      .addCase(updateAdminProduct.fulfilled, (state, action) => {
        const updatedProduct = action.payload.product;
        const index = state.products.findIndex(p => p.id === updatedProduct.id);
        if (index !== -1) {
          state.products[index] = updatedProduct;
        }
      })
      // Delete Product
      .addCase(deleteAdminProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p.id !== action.payload);
      })
      // Fetch Users
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      // Fetch Orders
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
      });
  },
});

export const { clearError, updateProductStock } = adminSlice.actions;
export default adminSlice.reducer;