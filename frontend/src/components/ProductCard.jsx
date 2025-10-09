import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [isAdding, setIsAdding] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(null);

  // Get the correct image URL - handle both URL and base64
  const getProductImage = () => {
    if (product.image_url && !imageError) {
      return product.image_url;
    }
    if (product.image_data && !imageError) {
      // If it's already a data URL, use it directly
      if (product.image_data.startsWith('data:')) {
        return product.image_data;
      }
      // Otherwise, assume it's base64 and format it
      return `data:image/jpeg;base64,${product.image_data}`;
    }
    // Fallback placeholder - use a reliable placeholder service
    return 'https://via.placeholder.com/300x200/667eea/ffffff?text=Product+Image';
  };

  const handleImageError = () => {
    console.warn('Image failed to load for product:', product.name);
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    setIsAdding(true);
    try {
      await dispatch(addToCart({
        productId: product.id,
        quantity: 1
      })).unwrap();
      
      // Success animation
      const button = document.activeElement;
      button.classList.add('success-animation');
      setTimeout(() => {
        button.classList.remove('success-animation');
      }, 600);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const isOutOfStock = product.stock_quantity === 0;

  return (
    <>
      <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
        <div className="product-image-container">
          <img 
            ref={imageRef}
            src={getProductImage()} 
            alt={product.name}
            className="product-image"
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
          {!imageLoaded && !imageError && (
            <div className="image-loading-placeholder">
              <div className="loading-spinner-small"></div>
            </div>
          )}
          {isOutOfStock && (
            <div className="out-of-stock-overlay">
              <span>Out of Stock</span>
            </div>
          )}
          <div className="product-actions">
            <button 
              className="quick-view-btn"
              onClick={() => setShowQuickView(true)}
              title="Quick View"
            >
              <span className="quick-view-icon">👁️</span>
            </button>
          </div>
          <div className="product-badge">
            {product.stock_quantity < 10 && product.stock_quantity > 0 && (
              <span className="low-stock-badge">Low Stock</span>
            )}
          </div>
        </div>
        
        <div className="product-info">
          <h3 className="product-title">{product.name}</h3>
          <p className="product-description">
            {product.description?.substring(0, 100)}...
          </p>
          <div className="product-meta">
            <span className="price">${product.price}</span>
            <span className={`stock ${product.stock_quantity < 10 ? 'low-stock' : ''}`}>
              {product.stock_quantity} in stock
            </span>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={isAdding || isOutOfStock || !user}
            className={`add-to-cart-btn ${isAdding ? 'adding' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
          >
            {isAdding ? (
              <>
                <span className="loading-spinner"></span>
                Adding...
              </>
            ) : isOutOfStock ? (
              'Out of Stock'
            ) : !user ? (
              'Login to Buy'
            ) : (
              <>
                <span className="cart-icon">🛒</span>
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickView && (
        <div className="modal-overlay" onClick={() => setShowQuickView(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="quick-view-modal">
              <button 
                className="close-btn"
                onClick={() => setShowQuickView(false)}
              >
                ✕
              </button>
              
              <div className="quick-view-content">
                <div className="quick-view-image">
                  <img 
                    src={getProductImage()} 
                    alt={product.name}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                </div>
                
                <div className="quick-view-details">
                  <h2>{product.name}</h2>
                  <p className="product-price">${product.price}</p>
                  <p className="product-full-description">
                    {product.description || 'No description available.'}
                  </p>
                  
                  <div className="stock-info">
                    <span className={`stock-badge ${product.stock_quantity < 10 ? 'low' : 'high'}`}>
                      {product.stock_quantity} in stock
                    </span>
                  </div>
                  
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdding || isOutOfStock || !user}
                    className={`add-to-cart-btn large ${isAdding ? 'adding' : ''}`}
                  >
                    {isAdding ? (
                      <>
                        <span className="loading-spinner"></span>
                        Adding to Cart...
                      </>
                    ) : isOutOfStock ? (
                      'Out of Stock'
                    ) : !user ? (
                      'Please Login to Purchase'
                    ) : (
                      'Add to Cart'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;