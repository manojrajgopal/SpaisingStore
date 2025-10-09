import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProductCard from '../../../components/ProductCard';
import cartReducer from '../../../redux/slices/cartSlice';
import authReducer from '../../../redux/slices/authSlice';

// Mock the Redux dispatch
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

import { useDispatch, useSelector } from 'react-redux';

// Create mock store
const createMockStore = (initialState) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
    },
    preloadedState: initialState,
  });
};

// Mock product data
const mockProduct = {
  id: 1,
  name: 'Test Product',
  description: 'This is a test product description that is quite long and should be truncated in the card',
  price: '29.99',
  stock_quantity: 10,
  category: 'Clothing',
  image_url: 'https://example.com/product.jpg'
};

const mockOutOfStockProduct = {
  ...mockProduct,
  id: 2,
  stock_quantity: 0
};

const mockProductWithImageData = {
  ...mockProduct,
  id: 3,
  image_url: null,
  image_data: 'data:image/jpeg;base64,fakebase64data'
};

describe('ProductCard', () => {
  let store;
  let mockDispatch;

  beforeEach(() => {
    mockDispatch = jest.fn();
    useDispatch.mockReturnValue(mockDispatch);
    
    store = createMockStore({
      auth: {
        user: { id: 1, email: 'test@test.com', first_name: 'John' },
        token: 'fake-token',
        loading: false,
        error: null
      },
      cart: {
        items: [],
        totalItems: 0,
        totalAmount: 0,
        loading: false,
        error: null
      }
    });

    // Mock useSelector to use our store
    useSelector.mockImplementation(selector => selector(store.getState()));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders product information correctly', () => {
    render(
      <Provider store={store}>
        <ProductCard product={mockProduct} />
      </Provider>
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('This is a test product description that is quite long and should be truncat...')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('10 in stock')).toBeInTheDocument();
  });

  it('displays out of stock when product has no stock', () => {
    render(
      <Provider store={store}>
        <ProductCard product={mockOutOfStockProduct} />
      </Provider>
    );

    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    expect(screen.getByText('Out of Stock')).toHaveClass('out-of-stock');
  });

  it('shows login message when user is not logged in', () => {
    // Override useSelector for this test
    useSelector.mockImplementation(selector => selector({
      ...store.getState(),
      auth: { user: null, token: null }
    }));

    render(
      <Provider store={store}>
        <ProductCard product={mockProduct} />
      </Provider>
    );

    expect(screen.getByText('Login to Purchase')).toBeInTheDocument();
  });

  it('calls addToCart when Add to Cart button is clicked', async () => {
    render(
      <Provider store={store}>
        <ProductCard product={mockProduct} />
      </Provider>
    );

    const addToCartButton = screen.getByText('Add to Cart');
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  it('disables button when product is out of stock', () => {
    render(
      <Provider store={store}>
        <ProductCard product={mockOutOfStockProduct} />
      </Provider>
    );

    const addToCartButton = screen.getByText('Out of Stock');
    expect(addToCartButton).toBeDisabled();
  });

  it('shows quick view modal when quick view button is clicked', () => {
    render(
      <Provider store={store}>
        <ProductCard product={mockProduct} />
      </Provider>
    );

    const quickViewButton = screen.getByText('👁️ Quick View');
    fireEvent.click(quickViewButton);

    expect(screen.getByText('Product Details')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('handles image loading states', () => {
    render(
      <Provider store={store}>
        <ProductCard product={mockProductWithImageData} />
      </Provider>
    );

    // Should render without crashing when using image_data
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('shows low stock badge when stock is less than 10', () => {
    const lowStockProduct = {
      ...mockProduct,
      stock_quantity: 5
    };

    render(
      <Provider store={store}>
        <ProductCard product={lowStockProduct} />
      </Provider>
    );

    expect(screen.getByText('Only 5 left')).toBeInTheDocument();
  });

  it('closes quick view modal when close button is clicked', () => {
    render(
      <Provider store={store}>
        <ProductCard product={mockProduct} />
      </Provider>
    );

    // Open modal
    fireEvent.click(screen.getByText('👁️ Quick View'));
    expect(screen.getByText('Product Details')).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByText('✕'));
    expect(screen.queryByText('Product Details')).not.toBeInTheDocument();
  });
});