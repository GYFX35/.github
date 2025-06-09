import React, { useState } from 'react';
import ProductCard from './ProductCard';
import ProductDetailView from './ProductDetailView'; // To potentially show details

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

  const shopPageStyle = {
    padding: '20px',
  };

  const productListStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '15px',
  };

  const handleDetailsClick = (productId) => {
    const product = sampleProducts.find(p => p.id === productId);
    setSelectedProduct(product);
  };

  if (selectedProduct) {
    return (
      <div style={shopPageStyle}>
        <button onClick={() => setSelectedProduct(null)} style={{ marginBottom: '20px', padding: '8px 12px' }}>
          &larr; Back to Shop
        </button>
        <ProductDetailView product={selectedProduct} />
      </div>
    );
  }

  return (
    <div style={shopPageStyle}>
      <h2>Shop Our Products</h2>
      <div style={productListStyle}>
        {sampleProducts.map(product => (
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
