import React, { useState, useRef } from 'react';
import Input from './Input';

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
  const fileInputRef = useRef();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        setFormData(prev => ({ ...prev, image_data: base64 }));
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <h3>{product ? 'Edit Product' : 'Add New Product'}</h3>
      
      <Input
        label="Product Name"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        required
      />
      
      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows="4"
        />
      </div>
      
      <div className="form-row">
        <Input
          label="Price ($)"
          name="price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={handleInputChange}
          required
        />
        
        <Input
          label="Stock Quantity"
          name="stock_quantity"
          type="number"
          value={formData.stock_quantity}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <Input
        label="Category"
        name="category"
        value={formData.category}
        onChange={handleInputChange}
      />
      
      <Input
        label="Image URL"
        name="image_url"
        value={formData.image_url}
        onChange={handleInputChange}
        placeholder="Or upload image below"
      />
      
      <div className="form-group">
        <label>Upload Image</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
        />
        <small>Supported formats: JPG, PNG, GIF</small>
      </div>
      
      {imagePreview && (
        <div className="image-preview">
          <img src={imagePreview} alt="Preview" />
        </div>
      )}
      
      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {product ? 'Update Product' : 'Create Product'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProductForm;