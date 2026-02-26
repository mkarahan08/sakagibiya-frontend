import React from "react";
import "./ProductCard.css";
import { useNavigate } from "react-router-dom";

function timeAgo(dateString) {
  if (!dateString) return "";

  const createdDate = new Date(dateString);
  const now = new Date();

  const diffMs = now - createdDate;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMinutes < 60) return `${diffMinutes} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffMonths < 12) return `${diffMonths} ay önce`;

  return "1 yıldan fazla";
}

function ProductCard({ product }) {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const {
    _id,
    brand,
    name,
    image,
    final_price,
    original_price,
    final_price_string,
    original_price_string,
    discount,
    createdAt,
  } = product;

  // Fiyat formatlaması: Eğer string formatı varsa onu kullan, yoksa number'ı formatla
  const formatPrice = (price, priceString) => {
    if (priceString) return priceString; // Orijinal string formatı varsa onu kullan
    if (price) return `${price.toFixed(2).replace(".", ",")} TL`; // Number ise formatla
    return "";
  };

  const displayFinalPrice = formatPrice(final_price, final_price_string);
  const displayOriginalPrice = formatPrice(original_price, original_price_string);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div
      className="product-card"
      onClick={() => navigate(`/product/${_id}`)}
    >
      {/* Ürün görseli - Aspect ratio ile kayma önleme */}
      <div className={`product-image-container ${imageLoaded ? 'image-loaded' : ''}`}>
        {/* İndirim rozeti - Görselin üzerinde */}
        {discount && discount > 0 && (
          <div className="discount-badge">
            <span className="discount-icon">↓</span>
            <span className="discount-text">%{discount}</span>
          </div>
        )}
        <img 
          src={image} 
          alt={name} 
          className="product-img"
          loading="lazy"
          onLoad={handleImageLoad}
          onError={() => setImageLoaded(true)}
        />
      </div>

      {/* Ürün adı - Dinamik yükseklik */}
      <div className="product-name-container">
        <h3 className="product-name"><strong>{brand}</strong> {name}</h3>
      </div>

      {/* Fiyat bilgisi */}
      <div className="product-price-container">
        <span className="product-price">{displayFinalPrice}</span>
        {displayOriginalPrice && original_price && final_price && original_price > final_price && (
          <span className="old-price">{displayOriginalPrice}</span>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
