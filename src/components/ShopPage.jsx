// src/components/ShopPage.jsx
import React, { useState } from 'react';
import ProductCard from './ProductCard';
import ProductDetailView from './ProductDetailView';

// Sample product data
const sampleProducts = [
  {
    id: 'prod1',
    name: "Awesome Gadget",
    price: 29.99,
    imageUrl: 'https://via.placeholder.com/250x180.png?text=Gadget',
    shortDescription: "A really cool gadget you'll love.",
    longDescription: "This Awesome Gadget does amazing things. It's built with the finest materials and designed to make your life easier and more fun. Key features include A, B, and C. Get yours today!"
  },
  {
    id: 'prod2',
    name: "Stylish T-Shirt",
    price: 19.50,
    imageUrl: 'https://via.placeholder.com/250x180.png?text=T-Shirt',
    shortDescription: "Comfortable and stylish t-shirt.",
    longDescription: "Made from 100% premium cotton, this t-shirt offers both comfort and style. Available in various sizes and colors. Perfect for casual wear or as a statement piece."
  },
  {
    id: 'prod3',
    name: "Handmade Mug",
    price: 15.00,
    imageUrl: 'https://via.placeholder.com/250x180.png?text=Mug',
    shortDescription: "A unique handmade ceramic mug.",
    longDescription: "Start your day right with this beautiful handmade ceramic mug. Each mug is uniquely crafted by artisans, making it a special addition to your collection or a thoughtful gift."
  },
];


function ShopPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const pageStyle = {
    padding: 'var(--spacing-md)',
    // maxWidth: '1200px', // Optional: constrain width
    // margin: '0 auto',
  };

  const productListStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center', // Or 'flex-start' for left alignment
    gap: 'var(--spacing-md)', // Use theme spacing for gap
  };

  const backButtonStyle = {
    backgroundColor: 'var(--secondary-color)',
    color: 'white',
    border: 'none',
    padding: 'var(--spacing-sm) var(--spacing-md)',
    borderRadius: 'var(--border-radius)',
    cursor: 'pointer',
    marginBottom: 'var(--spacing-lg)',
    fontSize: 'var(--font-size-base)',
  };

  const handleDetailsClick = (productId) => {
    const product = sampleProducts.find(p => p.id === productId);
    setSelectedProduct(product);
  };

  if (selectedProduct) {
    return (
      <div style={pageStyle}>
        <button onClick={() => setSelectedProduct(null)} style={backButtonStyle}>
          &larr; Back to Shop
        </button>
        {/* ProductDetailView will be themed in its own step */}
        <ProductDetailView product={selectedProduct} />
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h2>Shop Our Products</h2>
      <div style={productListStyle}>
        {sampleProducts.map(product => (
          // ProductCard will be themed in its own step
          <ProductCard
            key={product.id}
            product={product}
            onDetailsClick={handleDetailsClick}
          />
        ))}
      </div>
    </div>
  );
}

export default ShopPage;
