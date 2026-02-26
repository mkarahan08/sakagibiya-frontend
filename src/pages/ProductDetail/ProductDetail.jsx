import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById } from "../../redux/slices/productSlice";
import { toggleFavorite, checkFavoriteStatus, fetchFavorites } from "../../redux/slices/favoritesSlice";
import { VscHeart, VscHeartFilled } from "react-icons/vsc";
import "./ProductDetail.css";

function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  const { selectedProduct, loading, error } = useSelector(
    (state) => state.products
  );
  const { isAuthenticated } = useSelector((state) => state.user);
  const { items: favorites } = useSelector((state) => state.favorites);
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkingFavorite, setCheckingFavorite] = useState(false);

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  // Favori durumunu kontrol et
  useEffect(() => {
    if (selectedProduct && isAuthenticated) {
      setCheckingFavorite(true);
      dispatch(checkFavoriteStatus(selectedProduct._id))
        .then((result) => {
          if (result.payload !== undefined) {
            setIsFavorite(result.payload);
          }
        })
        .finally(() => setCheckingFavorite(false));
    } else {
      setIsFavorite(false);
    }
  }, [selectedProduct, isAuthenticated, dispatch]);

  // Favoriler listesini yükle
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchFavorites());
    }
  }, [dispatch, isAuthenticated]);

  // Yüklenme durumu
  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <div className="product-detail-page">
        <div className="error-container">
          <p className="error-message">Hata: {error}</p>
          <button onClick={() => navigate("/")} className="back-button">
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  // Ürün bulunamadı
  if (!selectedProduct) {
    return (
      <div className="product-detail-page">
        <div className="error-container">
          <p className="error-message">Ürün bulunamadı.</p>
          <button onClick={() => navigate("/")} className="back-button">
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  // Fiyat parse fonksiyonu
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

  const originalPrice = parsePrice(selectedProduct.original_price);
  const finalPrice = parsePrice(selectedProduct.final_price);
  const originalPriceString = selectedProduct.original_price || "";
  const finalPriceString = selectedProduct.final_price || "";

  const discount =
    originalPrice && finalPrice
      ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
      : 0;

  // Fiyat formatlaması
  const formatPrice = (price, priceString) => {
    if (priceString) return priceString;
    if (price) return `${price.toFixed(2).replace(".", ",")} TL`;
    return "";
  };

  const displayFinalPrice = formatPrice(finalPrice, finalPriceString);
  const displayOriginalPrice = formatPrice(originalPrice, originalPriceString);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!selectedProduct || !selectedProduct._id) return;

    try {
      const result = await dispatch(toggleFavorite(selectedProduct._id));
      if (toggleFavorite.fulfilled.match(result)) {
        setIsFavorite(result.payload.isFavorite);
        // Favorileri yeniden yükle
        dispatch(fetchFavorites());
      } else {
        // Hata durumunda login sayfasına yönlendir
        if (result.payload && result.payload.includes("Giriş")) {
          navigate("/login");
        }
      }
    } catch (error) {
      console.error("Favori işlemi hatası:", error);
    }
  };

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        {/* Geri dön butonu */}
        <button onClick={() => navigate(-1)} className="back-nav-button">
          ← Geri
        </button>

        {/* Ana içerik - Birleşik container */}
        <div className="product-detail-card">
          {/* Ürün görseli - Sol taraf */}
          <div className="product-image-section">
            <div className={`product-image-wrapper ${imageLoaded ? 'image-loaded' : ''}`}>
              {discount > 0 && (
                <div className="detail-discount-badge">
                  <span className="discount-icon">↓</span>
                  <span className="discount-text">%{discount}</span>
                </div>
              )}
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="product-detail-image"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
              />
            </div>
          </div>

          {/* Ürün bilgileri - Sağ taraf */}
          <div className="product-info-section">
          {/* Favoriler Butonu */}
          <button
            onClick={handleToggleFavorite}
            className={`favorite-button ${isFavorite ? 'active' : ''}`}
            aria-label={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
            disabled={checkingFavorite}
          >
            {checkingFavorite ? (
              <span className="favorite-loading">⏳</span>
            ) : isFavorite ? (
              <VscHeartFilled className="favorite-icon" />
            ) : (
              <VscHeart className="favorite-icon" />
            )}
            <span className="favorite-text">
              {isFavorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
            </span>
          </button>

          {/* Marka */}
          {selectedProduct.brand && (
            <p className="product-brand">{selectedProduct.brand}</p>
          )}

          {/* Ürün adı */}
          <h1 className="product-detail-title">
            {selectedProduct.name}
          </h1>

          {/* Fiyat bilgisi */}
          <div className="product-price-section">
            <div className="price-row">
              <span className="current-price">{displayFinalPrice}</span>
              {displayOriginalPrice && originalPrice && finalPrice && originalPrice > finalPrice && (
                <span className="original-price-detail">{displayOriginalPrice}</span>
              )}
            </div>
            {discount > 0 && (
              <div className="discount-info">
                <span className="discount-percentage">%{discount}</span>
                <span className="discount-text">indirim</span>
              </div>
            )}
          </div>

          {/* Ürün bilgileri */}
          <div className="product-meta">
            {selectedProduct.category && (
              <div className="meta-item">
                <span className="meta-label">Kategori:</span>
                <span className="meta-value">{selectedProduct.category}</span>
              </div>
            )}
            {selectedProduct.satici && (
              <div className="meta-item">
                <span className="meta-label">Satıcı:</span>
                <span className="meta-value">{selectedProduct.satici}</span>
              </div>
            )}
            {selectedProduct.id && (
              <div className="meta-item">
                <span className="meta-label">Ürün ID:</span>
                <span className="meta-value">{selectedProduct.id}</span>
              </div>
            )}
          </div>

          {/* Ürüne git butonu */}
          {selectedProduct.url && (
            <a
              href={selectedProduct.url}
              target="_blank"
              rel="noopener noreferrer"
              className="product-link-button"
            >
              <span className="button-icon">🔗</span>
              <span>Ürüne Git</span>
            </a>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
