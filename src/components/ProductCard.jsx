// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

function ProductCard({ product }) {
  if (!product) {
    return null; // Or some placeholder for a missing product
  }

  const primaryImage = product.images && product.images.length > 0
    ? product.images[0]
    : { src: 'https://via.placeholder.com/300x200.png?text=No+Image', alt: 'Placeholder Image' };

  return (
    <div className="product-card">
      <Link to={`/product/${product.slug}`} className="product-card-link">
        <div className="product-card-image-container">
          <img
            src={primaryImage.src}
            alt={primaryImage.alt || product.name}
            className="product-card-image"
          />
        </div>
        <div className="product-card-content">
          <h3 className="product-card-name">{product.name}</h3>
          <p className="product-card-price">
            {product.currency === 'USD' && '$'}
            {product.price.toFixed(2)}
            {product.currency !== 'USD' && ` ${product.currency}`}
          </p>
          {/* Optional: Short description or rating could go here */}
          {/* <p className="product-card-description">{product.description}</p> */}
        </div>
      </Link>
      {/* "Add to Cart" button could be here, or just on detail page */}
      {/* For now, View Details is implicitly the whole card link */}
      <Link to={`/product/${product.slug}`} className="product-card-details-btn">
        View Details
      </Link>
    </div>
  );
}

export default ProductCard;
