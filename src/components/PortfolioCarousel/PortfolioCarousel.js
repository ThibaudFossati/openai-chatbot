import React from 'react';

export default function PortfolioCarousel({ items }) {
  return (
    <div className="carousel-container">
      {items.map((item, idx) => (
        <div key={idx} className="carousel-item">
          <img src={item.src} alt={item.alt} />
          <p>{item.caption}</p>
        </div>
      ))}
    </div>
  );
}
