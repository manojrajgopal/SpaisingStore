import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/ProductCard';
import './Products.css';

const Products = () => {
  const dispatch = useDispatch();
  const { items: products, loading, error } = useSelector(state => state.products);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Get unique categories
  const categories = [...new Set(products.map(product => product.category).filter(Boolean))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return (
    <div className="products-loading">
      <div className="loading-pulse">
        <div></div>
        <div></div>
        <div></div>
      </div>
      <p>Discovering amazing products...</p>
    </div>
  );
  
  if (error) return (
    <div className="products-error">
      <div className="error-graphic">⚠️</div>
      <h2>Connection Error</h2>
      <p>We're having trouble loading our collection. Please check your connection.</p>
      <button 
        className="retry-btn"
        onClick={() => dispatch(fetchProducts())}
      >
        Retry Connection
      </button>
    </div>
  );

  return (
    <div className="products-page">
      {/* Background Elements */}
      <div className="page-background">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
      </div>

      <div className="products-container">
        {/* Header */}
        <div className="products-header">
          <div className="header-content">
            <h1 className="page-title">Our Collection</h1>
            <p className="page-subtitle">Explore our carefully curated selection of fashion items</p>
          </div>
          <div className="header-stats">
            <div className="total-products">
              <span className="count">{filteredProducts.length}</span>
              <span className="label">Products</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="category-filter">
              <span className="filter-icon">📂</span>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="results-info">
            Showing {filteredProducts.length} of {products.length} products
            {(searchTerm || selectedCategory) && (
              <button 
                className="clear-filters"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-content">
          {filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No products found</h3>
              <p>Try adjusting your search or filter criteria</p>
              <button 
                className="reset-filters-btn"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;