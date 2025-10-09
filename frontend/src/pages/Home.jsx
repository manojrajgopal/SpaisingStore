// src/pages/Home.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
  const dispatch = useDispatch();
  const { items: products, loading, error } = useSelector(state => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading products...</p>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h3>Connection Issue</h3>
      <p>Unable to connect to the server. Please check if the backend is running.</p>
      <button 
        className="retry-button"
        onClick={() => dispatch(fetchProducts())}
      >
        Retry Connection
      </button>
      <div className="fallback-products">
        <h4>Featured Items</h4>
        <div className="fallback-grid">
          <div className="fallback-card">
            <div className="fallback-image"></div>
            <h5>Fashion Item</h5>
            <p>Available soon</p>
          </div>
          <div className="fallback-card">
            <div className="fallback-image"></div>
            <h5>Style Collection</h5>
            <p>Available soon</p>
          </div>
          <div className="fallback-card">
            <div className="fallback-image"></div>
            <h5>Trending Now</h5>
            <p>Available soon</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Check if products is an array before mapping
  if (!products || !Array.isArray(products) || products.length === 0) {
    return (
      <div className="error-container">
        <div className="error-icon">📦</div>
        <h3>No Products Available</h3>
        <p>No products were loaded. Please try again later.</p>
        <button 
          className="retry-button"
          onClick={() => dispatch(fetchProducts())}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="main-title">Welcome to Spaising's Store</h1>
          <p className="hero-subtitle">Discover the latest fashion trends</p>
        </div>
      </div>
      
      <div className="products-section">
        <div className="section-header">
          <h2 className="section-title">Featured Collection</h2>
          <div className="section-divider"></div>
        </div>
        
        {products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛍️</div>
            <h3>No Products Found</h3>
            <p>Check back later for new arrivals!</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;