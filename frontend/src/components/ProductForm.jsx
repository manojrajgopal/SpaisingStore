import React, { useState, useRef } from 'react';
import Input from './Input';
import './ProductForm.css';

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    stock_quantity: product?.stock_quantity || '',
    category: product?.category || '',
    image_url: product?.image_url || '',
    image_data: ''
  });
  
  const [imagePreview, setImagePreview] = useState(product?.image_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    
    if (!formData.stock_quantity || parseInt(formData.stock_quantity) < 0) {
      newErrors.stock_quantity = 'Valid stock quantity is required';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ 
        ...prev, 
        image: 'Please select a valid image file (JPG, PNG, GIF, WEBP)' 
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ 
        ...prev, 
        image: 'Image size should be less than 5MB' 
      }));
      return;
    }

    setIsUploading(true);
    setErrors(prev => ({ ...prev, image: '' }));

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      setFormData(prev => ({ 
        ...prev, 
        image_data: base64,
        image_url: '' // Clear URL when uploading new image
      }));
      setImagePreview(base64);
      setIsUploading(false);
    };
    
    reader.onerror = () => {
      setErrors(prev => ({ 
        ...prev, 
        image: 'Failed to read image file' 
      }));
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ 
      ...prev, 
      image_data: '',
      image_url: '' 
    }));
    setImagePreview('');
    setErrors(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare data for submission
    const submissionData = {
      ...formData,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity),
      // Only send image_data if it's a new upload
      image_data: formData.image_data && !formData.image_data.startsWith('http') 
        ? formData.image_data 
        : ''
    };

    onSubmit(submissionData);
  };

  const categories = [
    'Shoes', 'Clothing', 'Electronics', 'Home & Garden', 
    'Sports', 'Beauty', 'Books', 'Toys', 'Automotive', 'Other'
  ];

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <div className="form-header">
        <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
        <p className="form-subtitle">
          {product ? 'Update your product information' : 'Create a new product for your store'}
        </p>
      </div>
      
      <div className="form-grid">
        {/* Basic Information Section */}
        <div className="form-section">
          <h3 className="section-title">Basic Information</h3>
          
          <Input
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            required
            placeholder="Enter product name"
          />
          
          <div className="form-group">
            <label className="form-label">
              Description <span className="optional">(Optional)</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              placeholder="Describe your product features, benefits, and specifications..."
            />
            {errors.description && (
              <span className="error-message">{errors.description}</span>
            )}
          </div>
        </div>

        {/* Pricing & Inventory Section */}
        <div className="form-section">
          <h3 className="section-title">Pricing & Inventory</h3>
          
          <div className="form-row">
            <Input
              label="Price ($)"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleInputChange}
              error={errors.price}
              required
              placeholder="0.00"
            />
            
            <Input
              label="Stock Quantity"
              name="stock_quantity"
              type="number"
              min="0"
              value={formData.stock_quantity}
              onChange={handleInputChange}
              error={errors.stock_quantity}
              required
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`form-select ${errors.category ? 'error' : ''}`}
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && (
              <span className="error-message">{errors.category}</span>
            )}
          </div>
        </div>

        {/* Image Section */}
        <div className="form-section">
          <h3 className="section-title">Product Image</h3>
          
          <div className="image-upload-section">
            <div className="upload-options">
              <Input
                label="Image URL"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                disabled={!!formData.image_data}
              />
              
              <div className="upload-divider">
                <span>OR</span>
              </div>

              <div className="form-group">
                <label className="form-label">Upload Image</label>
                <div className="file-upload-area">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="file-input"
                    disabled={!!formData.image_url}
                  />
                  <div className="upload-placeholder">
                    <i className="upload-icon">📁</i>
                    <p>Click to browse or drag and drop</p>
                    <small>Supports: JPG, PNG, GIF, WEBP (Max 5MB)</small>
                  </div>
                </div>
                {errors.image && (
                  <span className="error-message">{errors.image}</span>
                )}
                {isUploading && (
                  <div className="uploading-overlay">
                    <div className="upload-spinner"></div>
                    <span>Processing image...</span>
                  </div>
                )}
              </div>
            </div>

            {imagePreview && (
              <div className="image-preview-container">
                <div className="preview-header">
                  <h4>Image Preview</h4>
                  <button 
                    type="button" 
                    onClick={handleRemoveImage}
                    className="remove-image-btn"
                  >
                    <i className="remove-icon">×</i>
                    Remove
                  </button>
                </div>
                <div className="image-preview">
                  <img src={imagePreview} alt="Product preview" />
                  <div className="preview-overlay">
                    <span>Preview</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="form-actions">
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <div className="btn-spinner"></div>
              Processing...
            </>
          ) : (
            <>
              <i className="btn-icon">✓</i>
              {product ? 'Update Product' : 'Create Product'}
            </>
          )}
        </button>
        <button 
          type="button" 
          onClick={onCancel} 
          className="btn btn-secondary"
        >
          <i className="btn-icon">←</i>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProductForm;