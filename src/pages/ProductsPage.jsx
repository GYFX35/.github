// src/pages/ProductsPage.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../components/ProductCard';
import { mockProducts } from '../data/mockProducts';
import './ProductsPage.css'; // We'll create this CSS file

function ProductsPage() {
  return (
    <div className="products-page">
      <Helmet>
        <title>Our Products - Customer Magazine App</title>
        <meta name="description" content="Browse our collection of exciting products available for purchase." />
      </Helmet>

      <header className="products-page-header">
        <h1>Our Products</h1>
        <p>Discover a range of items selected just for you.</p>
      </header>

      {mockProducts && mockProducts.length > 0 ? (
        <div className="products-grid">
          {mockProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="no-products-message">
          No products available at the moment. Please check back soon!
        </p>
      )}
    </div>
  );
}

export default ProductsPage;
