import React, { useEffect, useMemo, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchFavorites, removeFromFavorites, clearFavorites } from "../../redux/slices/favoritesSlice";
import { VscHeartFilled, VscTrash, VscClose } from "react-icons/vsc";
import "./Favorites.css";

const Favorites = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.user);
  const { items: favorites, loading, error } = useSelector((state) => state.favorites);
  const [displayedCount, setDisplayedCount] = useState(20);
  const observerTarget = useRef(null);

  // Authentication kontrolü
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !isAuthenticated) {
      navigate("/login");
      return;
    }
  }, [isAuthenticated, navigate]);

  // Favorileri yükle
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && isAuthenticated) {
      dispatch(fetchFavorites());
    }
  }, [dispatch, isAuthenticated]);

  // Ürünleri formatla
  const mappedFavorites = useMemo(() => {
    if (!favorites || !Array.isArray(favorites) || favorites.length === 0) {
      return [];
    }
    
    return favorites
      .filter((p) => p && (p._id || p.id))
      .map((p) => {
        const parsePrice = (priceStr) => {
          if (!priceStr) return null;
          if (typeof priceStr === 'number') return priceStr;
          const cleaned = priceStr
            .toString()
            .replace(" TL", "")
            .replace(/\./g, "")
            .replace(",", ".");
          return Number(cleaned);
        };

        const originalPrice = parsePrice(p.original_price);
        const finalPrice = parsePrice(p.final_price);

        const discount =
          originalPrice && finalPrice
            ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
            : 0;

        return {
          _id: p._id || p.id,
          id: p.id || p._id,
          name: p.name || "İsimsiz Ürün",
          brand: p.brand,
          category: p.category,
          satici: p.satici,
          image: p.image || "",
          url: p.url,
          final_price: finalPrice,
          original_price: originalPrice,
          final_price_string: p.final_price || p.final_price_string,
          original_price_string: p.original_price || p.original_price_string,
          discount: discount,
          createdAt: p.createdAt,
        };
      });
  }, [favorites]);

  // Favoriler değiştiğinde displayedCount'u sıfırla
  useEffect(() => {
    setDisplayedCount(20);
  }, [favorites?.length]);

  // Infinite scroll için Intersection Observer
  useEffect(() => {
    if (displayedCount >= (mappedFavorites?.length || 0)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setDisplayedCount((prev) => Math.min(prev + 20, mappedFavorites?.length || 0));
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [displayedCount, mappedFavorites, loading]);

  const handleRemoveFavorite = async (productId, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    await dispatch(removeFromFavorites(productId));
    // Favorileri yeniden yükle
    dispatch(fetchFavorites());
  };

  const handleClearAll = async () => {
    if (window.confirm("Tüm favorileri temizlemek istediğinize emin misiniz?")) {
      await dispatch(clearFavorites());
      // Favorileri yeniden yükle
      dispatch(fetchFavorites());
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Fiyat formatlaması
  const formatPrice = (price, priceString) => {
    if (priceString) return priceString;
    if (price) return `${price.toFixed(2).replace(".", ",")} TL`;
    return "";
  };

  // Loading durumu
  if (loading) {
    return (
      <div className="favorites-page">
        <div className="favorites-empty">
          <div className="empty-icon-wrapper">
            <VscHeartFilled className="empty-icon" />
          </div>
          <h2 className="empty-title">Yükleniyor...</h2>
        </div>
      </div>
    );
  }

  // Boş durum kontrolü
  if (!favorites || favorites.length === 0) {
    return (
      <div className="favorites-page">
        <div className="favorites-empty">
          <div className="empty-icon-wrapper">
            <VscHeartFilled className="empty-icon" />
          </div>
          <h2 className="empty-title">Henüz favori ürününüz yok</h2>
          <p className="empty-description">
            Beğendiğiniz ürünleri favorilerinize ekleyerek daha sonra kolayca bulabilirsiniz.
          </p>
          <button onClick={() => navigate("/")} className="empty-button">
            Alışverişe Başla
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="favorites-container">
        {/* Header */}
        <div className="favorites-header">
          <div className="favorites-title-section">
            <h1 className="favorites-title">
              <VscHeartFilled className="title-icon" />
              <span>Favorilerim</span>
              <span className="favorites-count">({favorites.length})</span>
            </h1>
            <p className="favorites-subtitle">
              Beğendiğiniz {favorites.length} ürünü burada bulabilirsiniz
            </p>
          </div>
          {favorites.length > 0 && (
            <button onClick={handleClearAll} className="clear-all-button">
              <VscTrash className="clear-icon" />
              <span>Tümünü Temizle</span>
            </button>
          )}
        </div>

        {/* Sepet benzeri liste görünümü */}
        <div className="favorites-list">
          {mappedFavorites && mappedFavorites.length > 0 ? (
            mappedFavorites.slice(0, displayedCount).map((product) => {
              const displayFinalPrice = formatPrice(product.final_price, product.final_price_string);
              const displayOriginalPrice = formatPrice(product.original_price, product.original_price_string);

              return (
                <div key={product._id} className="favorite-item-card">
                  {/* Ürün resmi */}
                  <div 
                    className="favorite-item-image"
                    onClick={() => handleProductClick(product._id)}
                  >
                    {product.discount > 0 && (
                      <div className="favorite-discount-badge">
                        <span>%{product.discount}</span>
                      </div>
                    )}
                    <img 
                      src={product.image} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/200x200?text=Ürün+Resmi";
                      }}
                    />
                  </div>

                  {/* Ürün bilgileri */}
                  <div className="favorite-item-info">
                    {product.brand && (
                      <div className="favorite-item-brand">{product.brand}</div>
                    )}
                    <h3 
                      className="favorite-item-name"
                      onClick={() => handleProductClick(product._id)}
                    >
                      {product.name}
                    </h3>
                    <div className="favorite-item-meta">
                      {product.category && (
                        <span className="favorite-meta-item">
                          <span className="meta-label">Kategori:</span>
                          <span className="meta-value">{product.category}</span>
                        </span>
                      )}
                      {product.satici && (
                        <span className="favorite-meta-item">
                          <span className="meta-label">Satıcı:</span>
                          <span className="meta-value">{product.satici}</span>
                        </span>
                      )}
                    </div>
                    {product.url && (
                      <a 
                        href={product.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="favorite-product-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Ürüne Git →
                      </a>
                    )}
                  </div>

                  {/* Fiyat ve işlemler */}
                  <div className="favorite-item-actions">
                    <div className="favorite-price-section">
                      <div className="favorite-price-row">
                        <span className="favorite-current-price">{displayFinalPrice}</span>
                        {displayOriginalPrice && product.original_price && product.final_price && 
                         product.original_price > product.final_price && (
                          <span className="favorite-original-price">{displayOriginalPrice}</span>
                        )}
                      </div>
                      {product.discount > 0 && (
                        <div className="favorite-discount-info">
                          <span className="favorite-discount-text">%{product.discount} indirim</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleRemoveFavorite(product._id, e)}
                      className="favorite-remove-button"
                      aria-label="Favorilerden çıkar"
                    >
                      <VscClose className="remove-icon" />
                      <span>Kaldır</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="favorites-empty">
              <div className="empty-icon-wrapper">
                <VscHeartFilled className="empty-icon" />
              </div>
              <h2 className="empty-title">Ürünler yükleniyor...</h2>
            </div>
          )}
          {/* Infinite scroll trigger */}
          {mappedFavorites && displayedCount < mappedFavorites.length && (
            <div ref={observerTarget} className="infinite-scroll-trigger">
              <div className="loading-more-container">
                <div className="loading-spinner"></div>
                <p>Daha fazla ürün yükleniyor...</p>
              </div>
            </div>
          )}
          {mappedFavorites && displayedCount >= mappedFavorites.length && mappedFavorites.length > 20 && (
            <div className="end-of-list">
              <p>Tüm favoriler gösterildi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
