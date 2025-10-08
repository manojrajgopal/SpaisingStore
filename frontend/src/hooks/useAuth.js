import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { loginUser, registerUser, logout, getCurrentUser } from '../redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, loading, error } = useSelector(state => state.auth);

  const login = useCallback((credentials) => {
    return dispatch(loginUser(credentials));
  }, [dispatch]);

  const register = useCallback((userData) => {
    return dispatch(registerUser(userData));
  }, [dispatch]);

  const signOut = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const refreshUser = useCallback(() => {
    return dispatch(getCurrentUser());
  }, [dispatch]);

  return {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout: signOut,
    refreshUser,
    isAuthenticated: !!token,
    isAdmin: user?.is_admin || false,
  };
};