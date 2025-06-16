// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { mockProducts } from '../data/mockProducts';
import './ProductDetailPage.css'; // We'll create this

function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const foundProduct = mockProducts.find(p => p.slug === slug);
    setProduct(foundProduct);
    if (foundProduct && foundProduct.images && foundProduct.images.length > 0) {
      setSelectedImage(foundProduct.images[0]);
    } else if (foundProduct) { // Product exists but has no images array or it's empty
      setSelectedImage({ src: 'https://via.placeholder.com/600x400.png?text=No+Image', alt: 'Placeholder Image' });
    } else {
      setSelectedImage(null); // No product found
    }
  }, [slug]);

  if (!product) {
    return (
      <div className="product-detail-page product-not-found">
        <Helmet>
          <title>Product Not Found - Customer Magazine App</title>
          <meta name="description" content="The product you are looking for could not be found." />
        </Helmet>
        <h1>Product Not Found</h1>
        <p>Sorry, we couldn't find the product you're looking for.</p>
        <Link to="/products">← Back to Products</Link>
      </div>
    );
  }

  const handleThumbnailClick = (image) => {
    setSelectedImage(image);
  };

  return (
    <div className="product-detail-page">
      <Helmet>
        <title>{`${product.name} - Customer Magazine App`}</title>
        <meta name="description" content={product.description} />
        {/* Add more specific meta tags like Open Graph for product sharing */}
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description} />
        {selectedImage && <meta property="og:image" content={selectedImage.src} />}
        <meta property="og:type" content="product" />
        <meta property="product:price:amount" content={product.price.toString()} />
        <meta property="product:price:currency" content={product.currency} />
      </Helmet>

      <Link to="/products" className="back-to-products-link">← Back to Products</Link>

      <div className="product-detail-layout">
        <div className="product-images-section">
          {selectedImage && (
            <div className="main-image-container">
              <img src={selectedImage.src} alt={selectedImage.alt || product.name} className="main-product-image" />
            </div>
          )}
          {product.images && product.images.length > 1 && (
            <div className="thumbnail-gallery">
              {product.images.map((img) => (
                <img
                  key={img.id || img.src}
                  src={img.src}
                  alt={img.alt || `Thumbnail of ${product.name}`}
                  className={`thumbnail-image ${selectedImage && selectedImage.src === img.src ? 'active' : ''}`}
                  onClick={() => handleThumbnailClick(img)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="product-info-section">
          <h1>{product.name}</h1>
          {product.brand && <p className="product-brand">Brand: {product.brand}</p>}
          <p className="product-price">
            {product.currency === 'USD' && '$'}
            {product.price.toFixed(2)}
            {product.currency !== 'USD' && ` ${product.currency}`}
          </p>

          {product.rating && product.rating.count > 0 && (
            <p className="product-rating">
              Rating: {product.rating.average.toFixed(1)}/5 ({product.rating.count} reviews)
            </p>
          )}

          <p className="product-availability" style={{ color: product.availability === 'In Stock' ? 'green' : 'orange' }}>
            {product.availability}
          </p>

          {/* Short Description */}
          <p className="product-short-description">{product.description}</p>

          <button className="add-to-cart-btn" onClick={() => alert(`"${product.name}" added to cart (Placeholder Action)`)}>
            Add to Cart
          </button>

          {/* Long Description */}
          {product.longDescription && (
            <div className="product-long-description">
              <h3>Product Details</h3>
              <div dangerouslySetInnerHTML={{ __html: product.longDescription }} />
            </div>
          )}

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="product-features">
              <h3>Features</h3>
              <ul>
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="product-specifications">
              <h3>Specifications</h3>
              <table>
                <tbody>
                  {product.specifications.map((spec, index) => (
                    <tr key={index}>
                      <td>{spec.name}</td>
                      <td>{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
