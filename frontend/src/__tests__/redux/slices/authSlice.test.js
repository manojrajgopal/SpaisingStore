import { configureStore } from '@reduxjs/toolkit';
import authReducer, { loginUser, registerUser, logout } from '../../../redux/slices/authSlice.js';

// Mock the API
jest.mock('../../../api/authAPI.js', () => ({
  authAPI: {
    login: jest.fn(),
    register: jest.fn(),
    getMe: jest.fn(),
  },
}));

describe('authSlice', () => {
  let store;

  beforeEach(async () => {
    store = configureStore({ reducer: { auth: authReducer } });
    // Clear localStorage mock
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should handle initial state', () => {
    expect(store.getState().auth).toEqual({
      user: null,
      token: null,
      loading: false,
      error: null,
    });
  });

  it('should handle loginUser pending', () => {
    store.dispatch(loginUser.pending());
    const state = store.getState().auth;
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle logout', () => {
    // First set some state
    store.dispatch(loginUser.fulfilled({ 
      user: { id: 1, email: 'test@test.com' }, 
      access_token: 'token' 
    }));

    // Then logout
    store.dispatch(logout());
    
    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });
});