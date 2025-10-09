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
    <div className="page-loading">
      <div className="loading-wave">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <p>Loading amazing products...</p>
    </div>
  );
  
  if (error) return (
    <div className="page-error">
      <div className="error-illustration">🚨</div>
      <h2>Oops! Something went wrong</h2>
      <p>We're having trouble loading our products. Please check your connection and try again.</p>
      <button 
        className="retry-btn"
        onClick={() => dispatch(fetchProducts())}
      >
        Try Again
      </button>
    </div>
  );

  if (!products || !Array.isArray(products) || products.length === 0) {
    return (
      <div className="page-empty">
        <div className="empty-illustration">📦</div>
        <h2>No Products Available</h2>
        <p>It seems we're out of stock at the moment. Check back soon for new arrivals!</p>
        <button 
          className="retry-btn"
          onClick={() => dispatch(fetchProducts())}
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-shape shape-1"></div>
          <div className="hero-shape shape-2"></div>
          <div className="hero-shape shape-3"></div>
        </div>
        
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to <span className="brand">Spaising's Store</span>
          </h1>
          <p className="hero-subtitle">
            Discover exclusive fashion pieces that define your style
          </p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">{products.length}+</span>
              <span className="stat-label">Products</span>
            </div>
            <div className="stat">
              <span className="stat-number">100%</span>
              <span className="stat-label">Quality</span>
            </div>
            <div className="stat">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="products-showcase">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Collection</h2>
            <p className="section-subtitle">Handpicked items just for you</p>
            <div className="section-decoration"></div>
          </div>

          <div className="products-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;