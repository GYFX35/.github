// src/components/ProductDetailView.jsx
import React from 'react';
import ShareButton from './ShareButton'; // Import ShareButton

function ProductDetailView({ product }) {
  const viewStyle = {
    padding: '20px',
    maxWidth: '700px',
    margin: '20px auto',
    border: '1px solid #eee',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.05)',
  };

  const imageStyle = {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'contain',
    backgroundColor: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#aaa',
    marginBottom: '20px',
    borderRadius: '4px',
  };

  const flutterwaveButtonStyle = {
    backgroundColor: '#f5a623', // Flutterwave's orange color
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '20px',
    fontWeight: 'bold',
  };
  const shareButtonContainerStyle = { marginTop: '15px' };


  if (!product) {
    return <div style={viewStyle}><p>Select a product to see details.</p></div>;
  }

  // For product sharing, use window.location.href to get the current page URL
  // In a more advanced setup with unique routes per product, this URL would be more specific.
  const productShareUrl = window.location.href;

  return (
    <div style={viewStyle}>
      <h2>{product.name || "Detailed Product Name"}</h2>
      <div style={imageStyle}>
        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} style={{maxWidth: '100%', maxHeight: '100%', borderRadius: '4px'}} /> : <span>Product Image Placeholder</span>}
      </div>
      <p>{product.longDescription || "This is a more detailed description..."}</p>
      <p><strong>Price: ${product.price ? product.price.toFixed(2) : "0.00"}</strong></p>

      <button
        style={flutterwaveButtonStyle}
        onClick={() => alert(`Initiate Flutterwave payment for ${product.name} - Price: $${product.price.toFixed(2)} (Placeholder)`)}
      >
        Pay with Flutterwave
      </button>

      <div style={shareButtonContainerStyle}>
        <ShareButton
          title={`Check out ${product.name || "this product"}!`}
          text={`I found this amazing product: ${product.name || "Product Name"} - ${product.shortDescription || ""}`}
          url={productShareUrl} // Uses the current page URL for the product
          buttonText="Share Product"
        />
      </div>
    </div>
  );
}

export default ProductDetailView;
