import { renderHook, act } from '@testing-library/react';
import { useFetch } from '../../../hooks/useFetch.js';

// Mock fetch function
const mockFetchFunction = jest.fn();

describe('useFetch hook', () => {
  beforeEach(() => {
    mockFetchFunction.mockClear();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useFetch(mockFetchFunction));
    
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.refetch).toBe('function');
  });

  it('should handle successful data fetch', async () => {
    const mockData = [{ id: 1, name: 'Test Product' }];
    mockFetchFunction.mockResolvedValue(mockData);

    const { result } = renderHook(() => useFetch(mockFetchFunction));

    // Wait for the async effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockFetchFunction).toHaveBeenCalledTimes(1);
  });
});