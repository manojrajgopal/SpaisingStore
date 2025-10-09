import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addToCartBackend } from '../redux/slices/cartSlice';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [isAdding, setIsAdding] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [imageState, setImageState] = useState('loading'); // loading, loaded, error

  const getImageUrl = () => {
    if (product.image_url) return product.image_url;
    if (product.image_data) {
      if (product.image_data.startsWith('data:')) return product.image_data;
      return `data:image/jpeg;base64,${product.image_data}`;
    }
    return null;
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Prevent navigation when clicking cart button
    
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    setIsAdding(true);
    
    try {
      await dispatch(addToCartBackend({ productId: product.id, quantity: 1 })).unwrap();
      // Success message can be shown here if needed
    } catch (error) {
      alert('Failed to add to cart: ' + (error.message || 'Unknown error'));
    } finally {
      setIsAdding(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleQuickViewClick = (e) => {
    e.stopPropagation(); // Prevent card navigation when clicking quick view
    setShowQuickView(true);
  };

  const handleModalClick = (e) => {
    e.stopPropagation(); // Prevent card navigation when interacting with modal
  };

  const isOutOfStock = product.stock_quantity === 0;
  const imageUrl = getImageUrl();

  return (
    <>
      <div className="product-card" onClick={handleCardClick} style={{cursor: 'pointer'}}>
        {/* Image Section */}
        <div className="card-image">
          {imageUrl ? (
            <img 
              src={imageUrl}
              alt={product.name}
              className={`product-img ${imageState === 'loaded' ? 'visible' : 'hidden'}`}
              onLoad={() => setImageState('loaded')}
              onError={() => setImageState('error')}
            />
          ) : null}
          
          {/* Show placeholder if no image or error */}
          {(!imageUrl || imageState === 'error') && (
            <div className="image-placeholder">
              <span className="placeholder-icon">🛍️</span>
              <span className="placeholder-text">No Image</span>
            </div>
          )}

          {/* Loading spinner */}
          {imageState === 'loading' && imageUrl && (
            <div className="image-loading">
              <div className="loading-dots">
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
          )}

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="stock-overlay">
              <span>Out of Stock</span>
            </div>
          )}

          {/* Quick view button */}
          <button 
            className="quick-view-btn"
            onClick={handleQuickViewClick}
          >
            <span>👁️ Quick View</span>
          </button>

          {/* Stock badge */}
          {product.stock_quantity > 0 && product.stock_quantity < 10 && (
            <div className="stock-badge">
              Only {product.stock_quantity} left
            </div>
          )}
        </div>

        {/* Product Info - Always visible */}
        <div className="card-content">
          <h3 className="product-title">{product.name}</h3>
          
          <p className="product-desc">
            {product.description ? 
              (product.description.length > 80 ? 
                `${product.description.substring(0, 80)}...` : 
                product.description
              ) : 
              'No description available'
            }
          </p>

          <div className="product-meta">
            <div className="price">${parseFloat(product.price).toFixed(2)}</div>
            <div className={`stock ${product.stock_quantity < 10 ? 'low' : ''}`}>
              {product.stock_quantity} in stock
            </div>
          </div>

          <button
            className={`cart-btn ${isAdding ? 'adding' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
            onClick={handleAddToCart}
            disabled={isAdding || isOutOfStock || !user}
          >
            {isAdding ? (
              <span className="btn-loading">
                <span className="spinner"></span>
                Adding...
              </span>
            ) : isOutOfStock ? (
              'Out of Stock'
            ) : !user ? (
              'Login to Purchase'
            ) : (
              <span className="btn-content">
                <span className="cart-icon">🛒</span>
                Add to Cart
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickView && (
        <div className="modal-overlay" onClick={() => setShowQuickView(false)}>
          <div className="modal" onClick={handleModalClick}>
            <div className="modal-header">
              <h2>Product Details</h2>
              <button className="close-btn" onClick={() => setShowQuickView(false)}>
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="modal-image">
                {imageUrl && imageState !== 'error' ? (
                  <img src={imageUrl} alt={product.name} />
                ) : (
                  <div className="modal-placeholder">
                    <span>📷</span>
                    <p>Image not available</p>
                  </div>
                )}
              </div>
              
              <div className="modal-details">
                <h3>{product.name}</h3>
                <div className="modal-price">${parseFloat(product.price).toFixed(2)}</div>
                <p className="modal-desc">
                  {product.description || 'No description available.'}
                </p>
                
                <div className="modal-stock">
                  <span className={`stock-tag ${isOutOfStock ? 'out' : 'in'}`}>
                    {isOutOfStock ? 'Out of Stock' : `${product.stock_quantity} in stock`}
                  </span>
                </div>
                
                <button
                  className={`modal-cart-btn ${isAdding ? 'adding' : ''}`}
                  onClick={handleAddToCart}
                  disabled={isAdding || isOutOfStock || !user}
                >
                  {isAdding ? (
                    <span className="btn-loading">
                      <span className="spinner"></span>
                      Adding to Cart...
                    </span>
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
      )}
    </>
  );
};

export default ProductCard;