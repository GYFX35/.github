// src/components/ProductDetailView.jsx
import React from 'react';
import ShareButton from './ShareButton';

function ProductDetailView({ product }) {
  const viewStyle = {
    padding: 'var(--spacing-lg)',
    maxWidth: '700px',
    margin: 'var(--spacing-lg) auto',
    border: 'var(--border-width) solid var(--border-color)',
    borderRadius: 'var(--border-radius-lg)',
    backgroundColor: 'var(--background-color)',
    boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
  };

  const imageStyle = {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'contain',
    backgroundColor: 'var(--light-background-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--secondary-text-color)',
    marginBottom: 'var(--spacing-lg)',
    borderRadius: 'var(--border-radius)',
  };

  const baseButtonStyle = { // Base for buttons in this component
    border: 'none',
    padding: 'var(--spacing-sm) var(--spacing-md)',
    borderRadius: 'var(--border-radius)',
    cursor: 'pointer',
    margin: 'var(--spacing-xs)',
    fontSize: 'var(--font-size-base)',
    fontWeight: 'var(--font-weight-bold)', // Bolder for action buttons
    textAlign: 'center',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'background-color 0.15s ease-in-out, border-color 0.15s ease-in-out',
  };

  const flutterwaveButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: 'var(--accent-color)',
    color: 'white',
    padding: 'var(--spacing-md) var(--spacing-lg)', // Larger padding
    fontSize: 'var(--font-size-lg)',
  };

  // Hover effect for Flutterwave button
  const flutterwaveButtonHoverStyle = { backgroundColor: '#d98e1f' }; // Darker accent

  const shareButtonContainerStyle = {
    marginTop: 'var(--spacing-md)',
    textAlign: 'center', // Center the share button if it's inline-block
  };


  if (!product) {
    return <div style={viewStyle}><p>Select a product to see details.</p></div>;
  }

  const productShareUrl = window.location.href;

  return (
    <div style={viewStyle}>
      <h2 style={{color: 'var(--text-color)', marginBottom: 'var(--spacing-md)'}}>{product.name || "Detailed Product Name"}</h2>
      <div style={imageStyle}>
        {product.imageUrl ?
          <img src={product.imageUrl} alt={product.name} style={{maxWidth: '100%', maxHeight: '100%', borderRadius: 'var(--border-radius)'}} /> :
          <span>Product Image Placeholder</span>}
      </div>
      <p style={{color: 'var(--text-color)', lineHeight: 'var(--line-height-base)', marginBottom: 'var(--spacing-md)'}}>
        {product.longDescription || "This is a more detailed description..."}
      </p>
      <p style={{fontWeight: 'var(--font-weight-bold)', color: 'var(--text-color)', fontSize: '1.75rem', marginBottom: 'var(--spacing-lg)'}}>
        ${product.price ? product.price.toFixed(2) : "0.00"}
      </p>

      <button
        style={flutterwaveButtonStyle}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = flutterwaveButtonHoverStyle.backgroundColor}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent-color)'}
        onClick={() => alert(`Initiate Flutterwave payment for ${product.name} - Price: $${product.price.toFixed(2)} (Placeholder)`)}
      >
        Pay with Flutterwave
      </button>

      <div style={shareButtonContainerStyle}>
        <ShareButton
          title={`Check out ${product.name || "this product"}!`}
          text={`I found this amazing product: ${product.name || "Product Name"} - ${product.shortDescription || ""}`}
          url={productShareUrl}
          buttonText="Share Product"
          buttonStyle={{ // Use a themed style, e.g., secondary or info
            ...baseButtonStyle,
            backgroundColor: 'var(--info-color)',
            color: 'white',
            fontWeight: 'var(--font-weight-normal)', // Less emphasis than pay button
            fontSize: 'var(--font-size-sm)',
            padding: 'var(--spacing-xs) var(--spacing-sm)',
          }}
        />
      </div>
    </div>
  );
}

export default ProductDetailView;
