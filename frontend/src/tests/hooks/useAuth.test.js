import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useAuth } from '../../../hooks/useAuth';
import authReducer from '../../../redux/slices/authSlice';

const createMockStore = (initialState) => configureStore({
  reducer: { auth: authReducer },
  preloadedState: { auth: initialState }
});

const wrapper = ({ children, store }) => (
  <Provider store={store}>{children}</Provider>
);

describe('useAuth', () => {
  it('should return initial auth state', () => {
    const store = createMockStore({
      user: null,
      token: null,
      loading: false,
      error: null
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => wrapper({ children, store })
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isAdmin).toBe(false);
  });

  it('should return authenticated state', () => {
    const mockUser = { id: 1, email: 'test@test.com', first_name: 'Test', is_admin: false };
    const store = createMockStore({
      user: mockUser,
      token: 'mock-token',
      loading: false,
      error: null
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => wrapper({ children, store })
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('mock-token');
    expect(result.current.isAuthenticated).toBe(true);
  });
});