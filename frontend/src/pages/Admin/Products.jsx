import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminProducts, createAdminProduct, updateAdminProduct, deleteAdminProduct } from '../../redux/slices/adminSlice';
import ProductForm from '../../components/ProductForm';
import { adminAPI } from '../../api/adminAPI';

const Products = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector(state => state.admin);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminProducts());
  }, [dispatch]);

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

  if (loading) return <div>Loading products...</div>;

  return (
    <div className="admin-products">
      <div className="admin-header">
        <h2>Product Management</h2>
        <button 
          onClick={() => setShowForm(true)} 
          className="btn-primary"
          disabled={showForm}
        >
          Add New Product
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ProductForm
              onSubmit={handleCreateProduct}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ProductForm
              product={editingProduct}
              onSubmit={handleEditProduct}
              onCancel={() => setEditingProduct(null)}
            />
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="delete-confirm">
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete "{deleteConfirm.name}"?</p>
              <div className="confirm-actions">
                <button 
                  onClick={() => handleDeleteProduct(deleteConfirm.id)}
                  className="btn-danger"
                >
                  Delete
                </button>
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>
                  <img 
                    src={product.image_url || product.image_data || '/placeholder-image.jpg'} 
                    alt={product.name}
                    className="product-thumbnail"
                  />
                </td>
                <td>{product.name}</td>
                <td>{product.category || 'Uncategorized'}</td>
                <td>${product.price}</td>
                <td>{product.stock_quantity}</td>
                <td className="actions">
                  <button 
                    onClick={() => setEditingProduct(product)}
                    className="btn-edit"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => setDeleteConfirm(product)}
                    className="btn-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {products.length === 0 && (
          <div className="empty-state">
            <p>No products found. Add your first product!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;