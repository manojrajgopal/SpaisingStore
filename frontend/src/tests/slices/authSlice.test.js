import authReducer, { loginUser, logout } from '../../../redux/slices/authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    token: null,
    loading: false,
    error: null
  };

  it('should return initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle logout', () => {
    const stateWithUser = {
      user: { id: 1, email: 'test@test.com' },
      token: 'token',
      loading: false,
      error: null
    };

    expect(authReducer(stateWithUser, logout())).toEqual(initialState);
  });

  it('should handle loginUser.pending', () => {
    const action = { type: loginUser.pending.type };
    const state = authReducer(initialState, action);
    expect(state.loading).toBe(true);
    expect(state.error).toBe(null);
  });

  it('should handle loginUser.fulfilled', () => {
    const mockResponse = {
      user: { id: 1, email: 'test@test.com' },
      access_token: 'token123'
    };
    
    const action = { type: loginUser.fulfilled.type, payload: mockResponse };
    const state = authReducer(initialState, action);
    
    expect(state.loading).toBe(false);
    expect(state.user).toEqual(mockResponse.user);
    expect(state.token).toBe(mockResponse.access_token);
  });
});