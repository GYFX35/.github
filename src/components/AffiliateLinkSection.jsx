import React from 'react';

/**
 * Placeholder component for a section displaying affiliate links or products.
 * Props:
 *  - title (string, optional): Title for the section.
 *  - items (array, optional): Array of placeholder items. If not provided, shows a generic message.
 *  - itemStyle (object, optional): Style for individual items.
 *  - listStyle (object, optional): Style for the list container.
 */
function AffiliateLinkSection({ title = "Recommended Products/Services", items, itemStyle, listStyle }) {
  const sectionStyle = {
    padding: '15px',
    border: '1px solid #e0e0e0',
    borderRadius: '5px',
    margin: '15px 0',
    backgroundColor: '#f9f9f9',
  };

  const defaultItemStyle = {
    padding: '10px',
    borderBottom: '1px solid #eee',
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
      <h3>{title}</h3>
      {displayItems && displayItems.length > 0 ? (
        <ul style={defaultListStyle}>
          {displayItems.map(item => (
            <li key={item.id} style={defaultItemStyle}>
              <strong>{item.name}</strong>
              <p>{item.description}</p>
              <a href={`#product-${item.id}-affiliate-link`} style={{color: 'green', textDecoration: 'underline'}}>
                Learn More / Buy Now (Affiliate Link)
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>Affiliate links or product recommendations will be displayed here.</p>
      )}
      <p style={{fontSize: '0.8em', color: '#777', marginTop: '10px'}}>
        (As an affiliate, we may earn a commission from qualifying purchases.)
      </p>
    </div>
  );
}

export default AffiliateLinkSection;
