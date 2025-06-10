// src/components/AffiliateLinkSection.jsx
import React from 'react';

function AffiliateLinkSection({ title = "Recommended Products/Services", items, itemStyle, listStyle }) {
  const sectionStyle = {
    padding: 'var(--spacing-md)',
    border: 'var(--border-width) solid var(--border-color)',
    borderRadius: 'var(--border-radius-lg)',
    margin: 'var(--spacing-lg) 0', // Adjusted margin
    backgroundColor: 'var(--light-background-color)', // Use light bg for section
  };

  const defaultItemStyle = {
    padding: 'var(--spacing-sm) 0', // Reduced padding for items within section
    borderBottom: 'var(--border-width) solid var(--border-color)',
    ...itemStyle
  };

  const defaultListStyle = {
    listStyle: 'none',
    paddingLeft: 0,
    ...listStyle
  };

  const placeholderItems = [
    { id: 1, name: "Affiliate Product 1", description: "A brief description of this amazing product." },
    { id: 2, name: "Affiliate Service 2", description: "Learn more about this helpful service." },
    { id: 3, name: "Affiliate Tool 3", description: "A must-have tool for your needs." },
  ];

  const displayItems = items || placeholderItems;

  return (
    <div style={sectionStyle}>
      <h3 style={{color: 'var(--text-color)', marginBottom: 'var(--spacing-md)'}}>{title}</h3>
      {displayItems && displayItems.length > 0 ? (
        <ul style={defaultListStyle}>
          {displayItems.map((item, index) => (
            <li
              key={item.id}
              style={{
                ...defaultItemStyle,
                borderBottom: index === displayItems.length - 1 ? 'none' : defaultItemStyle.borderBottom // No border for last item
              }}
            >
              <strong style={{color: 'var(--text-color)'}}>{item.name}</strong>
              <p style={{fontSize: 'var(--font-size-sm)', color: 'var(--secondary-text-color)', margin: 'var(--spacing-xs) 0'}}>{item.description}</p>
              <a href={`#product-${item.id}-affiliate-link`} style={{color: 'var(--success-color)', textDecoration: 'underline', fontWeight: 'var(--font-weight-bold)'}}>
                Learn More / Buy Now
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{color: 'var(--secondary-text-color)'}}>Affiliate links or product recommendations will be displayed here.</p>
      )}
      <p style={{fontSize: 'var(--font-size-sm)', color: 'var(--secondary-text-color)', marginTop: 'var(--spacing-md)', fontStyle: 'italic'}}>
        (As an affiliate, we may earn a commission from qualifying purchases.)
      </p>
    </div>
  );
}

export default AffiliateLinkSection;
