// src/components/ProductCard.jsx
import React from 'react';

function ProductCard({ product, onDetailsClick }) {
  const cardStyle = {
    border: 'var(--border-width) solid var(--border-color)',
    borderRadius: 'var(--border-radius-lg)', // Use larger radius for cards
    padding: 'var(--spacing-md)',
    margin: 'var(--spacing-sm)', // Adjusted margin for consistency if used in flex/grid
    width: '250px', // Keep fixed width or make responsive
    textAlign: 'center',
    backgroundColor: 'var(--background-color)',
    boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)', // Standard shadow
  };

  const imageStyle = {
    width: '100%',
    height: '180px',
    backgroundColor: 'var(--light-background-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--secondary-text-color)',
    marginBottom: 'var(--spacing-md)',
    borderRadius: 'var(--border-radius)', // Consistent border radius
  };

  const buttonStyle = { // Corresponds to .btn .btn-primary from global styles
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    border: 'var(--border-width) solid var(--primary-color)',
    padding: 'var(--spacing-sm) var(--spacing-md)',
    borderRadius: 'var(--border-radius)',
    cursor: 'pointer',
    marginTop: 'var(--spacing-md)',
    fontSize: 'var(--font-size-base)',
    fontWeight: 'var(--font-weight-normal)',
    textDecoration: 'none', // Remove underline if Link component adds it
    display: 'inline-block',
    textAlign: 'center',
    transition: 'background-color 0.15s ease-in-out, border-color 0.15s ease-in-out',
  };

  // Simple hover effect, can be enhanced with :hover in CSS if not inline
  // For inline, you'd need onMouseEnter/onMouseLeave to change style object

  if (!product) {
    return <div style={cardStyle}><p>Product data missing.</p></div>;
  }

  return (
    <div style={cardStyle}>
      <div style={imageStyle}>
        {product.imageUrl ?
          <img src={product.imageUrl} alt={product.name} style={{maxWidth: '100%', maxHeight: '100%', borderRadius: 'var(--border-radius)'}} /> :
          <span>Product Image</span>}
      </div>
      <h4 style={{color: 'var(--text-color)', marginBottom: 'var(--spacing-sm)'}}>{product.name || "Sample Product"}</h4>
      <p style={{fontSize: 'var(--font-size-sm)', color: 'var(--secondary-text-color)', marginBottom: 'var(--spacing-sm)'}}>
        {product.shortDescription || "A brief description of the product."}
      </p>
      <p style={{fontWeight: 'var(--font-weight-bold)', color: 'var(--text-color)', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)'}}>
        ${product.price ? product.price.toFixed(2) : "0.00"}
      </p>
      <button
        style={buttonStyle}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2a65a0'} // Darker primary
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--primary-color)'}
        onClick={() => onDetailsClick ? onDetailsClick(product.id) : null}
      >
        View Details
      </button>
    </div>
  );
}

export default ProductCard;
