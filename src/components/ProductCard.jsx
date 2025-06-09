import React from 'react';

/**
 * Placeholder component for displaying a single product in a list.
 * Props:
 *  - product (object): Contains product details { id, name, price, imageUrl, shortDescription }
 *  - onDetailsClick (function): Callback when "View Details" is clicked, passing product id.
 */
function ProductCard({ product, onDetailsClick }) {
  const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    margin: '10px',
    width: '250px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  const imageStyle = {
    width: '100%',
    height: '180px',
    backgroundColor: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#aaa',
    marginBottom: '10px',
    borderRadius: '4px',
  };

  const buttonStyle = {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
  };

  if (!product) {
    return <div style={cardStyle}><p>Product data missing.</p></div>;
  }

  return (
    <div style={cardStyle}>
      <div style={imageStyle}>
        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} style={{maxWidth: '100%', maxHeight: '100%', borderRadius: '4px'}} /> : <span>Product Image</span>}
      </div>
      <h4>{product.name || "Sample Product"}</h4>
      <p>{product.shortDescription || "A brief description of the product."}</p>
      <p><strong>Price: ${product.price ? product.price.toFixed(2) : "0.00"}</strong></p>
      <button style={buttonStyle} onClick={() => onDetailsClick ? onDetailsClick(product.id) : null}>
        View Details
      </button>
    </div>
  );
}

export default ProductCard;
