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

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return (
    <div className="products-loading">
      <div className="loading-spinner"></div>
      <p>Loading products...</p>
    </div>
  );
  
  if (error) return (
    <div className="products-error">
      <div className="error-icon">⚠️</div>
      <div>Error: {error}</div>
    </div>
  );

  return (
    <div className="products-page">
      {/* Animated Background */}
      <div className="background-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>
      
      <div className="products-container">
        {/* Header Section */}
        <div className="products-header">
          <h1 className="products-title">Our Collection</h1>
          <p className="products-subtitle">Discover amazing fashion pieces curated just for you</p>
        </div>
        
        {/* Search and Filter Section */}
        <div className="products-filters-section">
          <div className="filters-container">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search products by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="category-filter">
              <span className="filter-icon">📁</span>
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
              <div className="select-arrow">▼</div>
            </div>
          </div>
          
          <div className="results-info">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-grid-section">
          {filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="no-products">
              <div className="no-products-icon">👗</div>
              <h3>No Products Found</h3>
              <p>We couldn't find any products matching your search criteria.</p>
              <div className="no-products-actions">
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                  }}
                  className="reset-filters-btn"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;