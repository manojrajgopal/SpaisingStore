import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminProducts, createAdminProduct, updateAdminProduct, deleteAdminProduct } from '../../redux/slices/adminSlice';
import ProductForm from '../../components/ProductForm';
import { adminAPI } from '../../api/adminAPI';
import './Products.css';

const Products = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector(state => state.admin);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminProducts());
  }, [dispatch]);

  // Get the correct image URL for display
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

  const handleCreateProduct = async (productData) => {
    try {
      await dispatch(createAdminProduct(productData)).unwrap();
      setShowForm(false);
    } catch (error) {
      alert('Failed to create product: ' + error.message);
    }
  };

  const handleEditProduct = async (productData) => {
    try {
      await adminAPI.updateProduct(editingProduct.id, productData);
      dispatch(fetchAdminProducts()); // Refresh the list
      setEditingProduct(null);
    } catch (error) {
      alert('Failed to update product: ' + error.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await adminAPI.deleteProduct(productId);
      dispatch(fetchAdminProducts()); // Refresh the list
      setDeleteConfirm(null);
    } catch (error) {
      alert('Failed to delete product: ' + error.message);
    }
  };

  if (loading) return (
    <div className="admin-products-page">
      <div className="background-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>
      
      <div className="products-container">
        <div className="loading-products">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-products-page">
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
          <div className="header-content">
            <h1 className="products-title">Product Management</h1>
            <p className="products-subtitle">Manage your product catalog and inventory</p>
            <div className="products-stats">
              <span className="stat">Total Products: {products.length}</span>
            </div>
          </div>
          <button 
            onClick={() => setShowForm(true)} 
            className="add-product-btn"
            disabled={showForm}
          >
            <span className="btn-icon">➕</span>
            Add New Product
          </button>
        </div>

        {/* Products Table */}
        <div className="products-content">
          {products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👕</div>
              <h3>No Products Found</h3>
              <p>Add your first product to get started!</p>
              <button 
                onClick={() => setShowForm(true)} 
                className="add-first-product-btn"
              >
                Add First Product
              </button>
            </div>
          ) : (
            <div className="products-table-container">
              <div className="table-responsive">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th className="image-col">Image</th>
                      <th className="name-col">Product Name</th>
                      <th className="category-col">Category</th>
                      <th className="price-col">Price</th>
                      <th className="stock-col">Stock</th>
                      <th className="actions-col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id} className="product-row">
                        <td className="image-cell">
                          <div className="product-image">
                            <img 
                              src={getProductImage(product)} 
                              alt={product.name}
                              className="product-thumbnail"
                              onError={(e) => {
                                e.target.src = '/placeholder-image.jpg';
                                console.warn('Image failed to load for product:', product.name);
                              }}
                            />
                          </div>
                        </td>
                        <td className="name-cell">
                          <div className="product-name">{product.name}</div>
                          {product.description && (
                            <div className="product-description">
                              {product.description.length > 50 
                                ? `${product.description.substring(0, 50)}...` 
                                : product.description
                              }
                            </div>
                          )}
                        </td>
                        <td className="category-cell">
                          <span className="category-badge">
                            {product.category || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="price-cell">
                          <span className="price">${product.price}</span>
                        </td>
                        <td className="stock-cell">
                          <span className={`stock-badge ${product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                            {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <div className="action-buttons">
                            <button 
                              onClick={() => setEditingProduct(product)}
                              className="edit-btn"
                              title="Edit Product"
                            >
                              <span className="action-icon">✏️</span>
                              Edit
                            </button>
                            <button 
                              onClick={() => setDeleteConfirm(product)}
                              className="delete-btn"
                              title="Delete Product"
                            >
                              <span className="action-icon">🗑️</span>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Create Product Modal */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add New Product</h2>
                <button 
                  onClick={() => setShowForm(false)}
                  className="close-modal-btn"
                >
                  ✕
                </button>
              </div>
              <ProductForm
                onSubmit={handleCreateProduct}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {editingProduct && (
          <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Product</h2>
                <button 
                  onClick={() => setEditingProduct(null)}
                  className="close-modal-btn"
                >
                  ✕
                </button>
              </div>
              <ProductForm
                product={editingProduct}
                onSubmit={handleEditProduct}
                onCancel={() => setEditingProduct(null)}
              />
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="delete-confirm-modal">
                <div className="delete-icon">🗑️</div>
                <h3>Delete Product</h3>
                <p>Are you sure you want to delete <strong>"{deleteConfirm.name}"</strong>?</p>
                <p className="delete-warning">This action cannot be undone.</p>
                <div className="confirm-actions">
                  <button 
                    onClick={() => handleDeleteProduct(deleteConfirm.id)}
                    className="confirm-delete-btn"
                  >
                    Yes, Delete Product
                  </button>
                  <button 
                    onClick={() => setDeleteConfirm(null)}
                    className="cancel-delete-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;