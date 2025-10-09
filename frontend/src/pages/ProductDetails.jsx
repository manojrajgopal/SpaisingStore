import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { productAPI } from '../api/productAPI';
import { addToCartBackend } from '../redux/slices/cartSlice';
import { useAuth } from '../hooks/useAuth';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [imageState, setImageState] = useState('loading');
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productAPI.getById(id);
        setProduct(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const getProductImage = (product) => {
    if (product.image_url) {
      return product.image_url;
    }
    if (product.image_data) {
      if (product.image_data.startsWith('data:')) {
        return product.image_data;
      }
      return `data:image/jpeg;base64,${product.image_data}`;
    }
    return '/placeholder-image.jpg';
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    setAddingToCart(true);
    try {
      await dispatch(addToCartBackend({ 
        productId: product.id, 
        quantity: selectedQuantity 
      })).unwrap();
      
      alert('Product added to cart successfully!');
    } catch (error) {
      alert('Failed to add to cart: ' + (error.message || 'Unknown error'));
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      alert('Please login to purchase items');
      navigate('/login');
      return;
    }

    setAddingToCart(true);
    try {
      await dispatch(addToCartBackend({ 
        productId: product.id, 
        quantity: selectedQuantity 
      })).unwrap();
      
      navigate('/cart');
    } catch (error) {
      alert('Failed to add to cart: ' + (error.message || 'Unknown error'));
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="product-details-page">
        <div className="background-animation">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
          <div className="floating-shape shape-4"></div>
        </div>
        
        <div className="product-details-container">
          <div className="loading-product">
            <div className="loading-spinner"></div>
            <p>Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-details-page">
        <div className="background-animation">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
          <div className="floating-shape shape-4"></div>
        </div>
        
        <div className="product-details-container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h2>Product Not Found</h2>
            <p>{error}</p>
            <button 
              onClick={() => navigate('/products')}
              className="back-to-products-btn"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-page">
        <div className="background-animation">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
          <div className="floating-shape shape-4"></div>
        </div>
        
        <div className="product-details-container">
          <div className="not-found-state">
            <div className="not-found-icon">🔍</div>
            <h2>Product Not Found</h2>
            <p>The product you're looking for doesn't exist.</p>
            <button 
              onClick={() => navigate('/products')}
              className="back-to-products-btn"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const imageUrl = getProductImage(product);
  const isOutOfStock = product.stock_quantity === 0;
  const maxQuantity = Math.min(product.stock_quantity, 10);

  return (
    <div className="product-details-page">
      {/* Animated Background */}
      <div className="background-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>
      
      <div className="product-details-container">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb">
          <Link to="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/products" className="breadcrumb-link">Products</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        {/* Product Details Card */}
        <div className="product-details-card">
          <div className="product-details-grid">
            {/* Product Images */}
            <div className="product-images-section">
              <div className="main-image-container">
                {imageUrl ? (
                  <img 
                    src={imageUrl}
                    alt={product.name}
                    className={`main-product-image ${imageState === 'loaded' ? 'visible' : 'hidden'}`}
                    onLoad={() => setImageState('loaded')}
                    onError={() => setImageState('error')}
                  />
                ) : null}
                
                {(!imageUrl || imageState === 'error') && (
                  <div className="image-placeholder-large">
                    <span className="placeholder-icon">🛍️</span>
                    <span className="placeholder-text">No Image Available</span>
                  </div>
                )}

                {/* Out of stock overlay */}
                {isOutOfStock && (
                  <div className="stock-overlay-large">
                    <span>Out of Stock</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Information */}
            <div className="product-info-section">
              <div className="product-header">
                <h1 className="product-title">{product.name}</h1>
                {product.category && (
                  <div className="product-category">
                    <span className="category-badge">{product.category}</span>
                  </div>
                )}
              </div>

              <div className="product-price-section">
                <span className="product-price">${parseFloat(product.price).toFixed(2)}</span>
                <div className={`stock-status ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
                  {isOutOfStock ? (
                    <span className="stock-text out">Out of Stock</span>
                  ) : (
                    <span className="stock-text in">
                      {product.stock_quantity > 10 ? 'In Stock' : `Only ${product.stock_quantity} left!`}
                    </span>
                  )}
                </div>
              </div>

              <div className="product-description-section">
                <h3 className="section-title">Description</h3>
                <p className="product-description">
                  {product.description || 'No description available for this product.'}
                </p>
              </div>

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="quantity-section">
                  <label htmlFor="quantity" className="quantity-label">Quantity:</label>
                  <div className="quantity-selector">
                    <button
                      onClick={() => setSelectedQuantity(prev => Math.max(1, prev - 1))}
                      disabled={selectedQuantity <= 1}
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      value={selectedQuantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        setSelectedQuantity(Math.max(1, Math.min(maxQuantity, value)));
                      }}
                      min="1"
                      max={maxQuantity}
                      className="quantity-input"
                    />
                    <button
                      onClick={() => setSelectedQuantity(prev => Math.min(maxQuantity, prev + 1))}
                      disabled={selectedQuantity >= maxQuantity}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                  <span className="quantity-hint">Max: {maxQuantity} per order</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="action-buttons">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || addingToCart || !isAuthenticated}
                  className={`add-to-cart-btn ${addingToCart ? 'adding' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
                >
                  {addingToCart ? (
                    <span className="btn-loading">
                      <span className="spinner"></span>
                      Adding...
                    </span>
                  ) : isOutOfStock ? (
                    'Out of Stock'
                  ) : !isAuthenticated ? (
                    'Login to Add to Cart'
                  ) : (
                    <span className="btn-content">
                      <span className="cart-icon">🛒</span>
                      Add to Cart
                    </span>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock || addingToCart || !isAuthenticated}
                  className={`buy-now-btn ${isOutOfStock ? 'out-of-stock' : ''}`}
                >
                  {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
                </button>
              </div>

              {/* Product Meta */}
              <div className="product-meta">
                <div className="meta-item">
                  <span className="meta-label">SKU:</span>
                  <span className="meta-value">#{product.id}</span>
                </div>
                {product.category && (
                  <div className="meta-item">
                    <span className="meta-label">Category:</span>
                    <span className="meta-value">{product.category}</span>
                  </div>
                )}
                <div className="meta-item">
                  <span className="meta-label">Availability:</span>
                  <span className={`meta-value ${isOutOfStock ? 'out' : 'in'}`}>
                    {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section (Optional) */}
        <div className="related-products-section">
          <h2 className="section-title">You May Also Like</h2>
          <div className="related-products-actions">
            <button 
              onClick={() => navigate('/products')}
              className="browse-more-btn"
            >
              Browse All Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;