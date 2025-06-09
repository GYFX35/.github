import React from 'react';

/**
 * Placeholder component for displaying detailed information about a single product.
 * Props:
 *  - product (object): Contains product details { id, name, price, imageUrl, longDescription }
 */
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

  if (!product) {
    return <div style={viewStyle}><p>Select a product to see details.</p></div>;
  }

  return (
    <div style={viewStyle}>
      <h2>{product.name || "Detailed Product Name"}</h2>
      <div style={imageStyle}>
        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} style={{maxWidth: '100%', maxHeight: '100%', borderRadius: '4px'}} /> : <span>Product Image Placeholder</span>}
      </div>
      <p>{product.longDescription || "This is a more detailed description of the product, highlighting its features, benefits, and other relevant information. This section would typically be populated with rich text or markdown."}</p>
      <p><strong>Price: ${product.price ? product.price.toFixed(2) : "0.00"}</strong></p>
      {/*
        This button is a placeholder. In a real implementation, clicking this would
        initiate the Flutterwave payment process.
        The actual Flutterwave integration logic (calling FlutterwaveCheckout)
        would be handled here or in a parent component that manages state.
      */}
      <button
        style={flutterwaveButtonStyle}
        onClick={() => alert(`Initiate Flutterwave payment for ${product.name} - Price: $${product.price.toFixed(2)} (Placeholder)`)}
      >
        Pay with Flutterwave
      </button>
    </div>
  );
}

export default ProductDetailView;
