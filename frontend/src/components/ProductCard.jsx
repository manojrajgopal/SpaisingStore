import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [isAdding, setIsAdding] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

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
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = '';
      }, 150);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const isOutOfStock = product.stock === 0;

  return (
    <>
      <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
        <div className="product-image-container">
          <img 
            src={product.image || '/api/placeholder/300/200'} 
            alt={product.name}
            onError={(e) => {
              e.target.src = '/api/placeholder/300/200';
            }}
          />
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
              👁️
            </button>
          </div>
        </div>
        
        <div className="product-info">
          <h3>{product.name}</h3>
          <p className="product-description">
            {product.description?.substring(0, 100)}...
          </p>
          <div className="product-meta">
            <span className="price">${product.price}</span>
            <span className={`stock ${product.stock < 10 ? 'low-stock' : ''}`}>
              {product.stock} in stock
            </span>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={isAdding || isOutOfStock || !user}
            className={`add-to-cart-btn ${isAdding ? 'adding' : ''}`}
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
              'Add to Cart'
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
                    src={product.image || '/api/placeholder/400/300'} 
                    alt={product.name}
                  />
                </div>
                
                <div className="quick-view-details">
                  <h2>{product.name}</h2>
                  <p className="product-price">${product.price}</p>
                  <p className="product-full-description">
                    {product.description || 'No description available.'}
                  </p>
                  
                  <div className="stock-info">
                    <span className={`stock-badge ${product.stock < 10 ? 'low' : 'high'}`}>
                      {product.stock} in stock
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