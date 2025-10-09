import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useAuth } from '../../../hooks/useAuth.js';
import authReducer from '../../../redux/slices/authSlice.js';

// Mock the authAPI
jest.mock('../../../api/authAPI.js', () => ({
  authAPI: {
    login: jest.fn(),
    register: jest.fn(),
    getMe: jest.fn(),
  },
}));

// Create wrapper component with Redux store
const createWrapper = (initialState = {}) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: initialState }
  });
  
  return ({ children }) => <Provider store={store}>{children}</Provider>;
};

describe('useAuth hook', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should return initial auth state', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper({
        user: null,
        token: null,
        loading: false,
        error: null
      })
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isAdmin).toBe(false);
  });

  it('should return authenticated state when user exists', () => {
    const mockUser = { 
      id: 1, 
      email: 'test@test.com', 
      first_name: 'John',
      is_admin: true 
    };
    
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper({
        user: mockUser,
        token: 'fake-token',
        loading: false,
        error: null
      })
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('fake-token');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isAdmin).toBe(true);
  });
});