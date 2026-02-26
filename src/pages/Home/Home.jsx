import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import "./Home.css";

import ProductCard from "../../components/ProductCard/ProductCard";
import FilterBar from "../../components/FilterBar/FilterBar";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, searchProducts, clearSearch, clearCategory, resetPagination } from "../../redux/slices/productSlice";

function Home() {
  const dispatch = useDispatch();
  const [sortBy, setSortBy] = useState("recommended");
  const [filters, setFilters] = useState({});
  const observerTarget = useRef(null);
  // Her ürün için session boyunca sabit kalan rastgele offset (Önerilenler sıralaması için)
  const randomOffsets = useRef({});

  // Redux state
  const { items, loading, loadingMore, error, searchQuery, isSearching, selectedCategory, pagination } = useSelector(
    (state) => state.products
  );

  // Kategori değiştiğinde filtreleri ve sıralamayı sıfırla
  useEffect(() => {
    setFilters({});
    setSortBy("recommended");
  }, [selectedCategory]);

  // İlk yükleme - sadece arama modunda değilse ve kategori değiştiğinde
  useEffect(() => {
    dispatch(resetPagination());
    if (!isSearching) {
      dispatch(fetchProducts(1));
    }
  }, [dispatch, isSearching, selectedCategory]);

  // Infinite scroll için Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && pagination.hasNextPage) {
          if (isSearching && searchQuery) {
            dispatch(searchProducts({ query: searchQuery, page: pagination.currentPage + 1 }));
          } else {
            dispatch(fetchProducts(pagination.currentPage + 1));
          }
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
  }, [dispatch, loading, loadingMore, pagination, isSearching, searchQuery]);

  // Component unmount olduğunda arama durumunu temizle
  useEffect(() => {
    return () => {
      // Sadece sayfa kapanırken temizle, arama yaparken değil
    };
  }, []);

  // Cinsiyetleri ve siteleri çıkar
  const genders = useMemo(() => {
    // Category alanından cinsiyet bilgisini çıkar (Kadın, Erkek içeren kategoriler)
    const allCategories = [...new Set((items || []).map(p => p.category).filter(Boolean))];
    const genderList = ['Kadın', 'Erkek', 'Çocuk'];
    const foundGenders = genderList.filter(g => 
      allCategories.some(cat => cat && cat.toLowerCase().includes(g.toLowerCase()))
    );
    // Eğer bulunamazsa varsayılan olarak ekle
    return foundGenders.length > 0 ? foundGenders : ['Kadın', 'Erkek'];
  }, [items]);

  const sites = useMemo(() => {
    const s = [...new Set((items || []).map(p => p.satici).filter(Boolean))];
    return s;
  }, [items]);

  // Fiyat aralığını hesapla
  const priceRange = useMemo(() => {
    const prices = (items || [])
      .map(p => {
        const priceStr = p.final_price || p.original_price;
        if (!priceStr) return null;
        if (typeof priceStr === 'number') return priceStr;
        const cleaned = priceStr.toString()
          .replace(" TL", "")
          .replace(/\./g, "")
          .replace(",", ".");
        return Number(cleaned);
      })
      .filter(p => p !== null && !isNaN(p));
    
    if (prices.length === 0) return [0, 1000];
    return [Math.min(...prices), Math.max(...prices)];
  }, [items]);

  // Redux'tan gelen ürünleri ProductCard'a uygun hale getir
  const mappedProducts = useMemo(() => {
    let products = (items || []).map((p) => {
      // 🔹 String "623,30 TL" → number 623.30
      const parsePrice = (priceStr) => {
        if (!priceStr) return null;
        // Eğer zaten number ise direkt döndür
        if (typeof priceStr === 'number') return priceStr;
        // String ise parse et
        const cleaned = priceStr
          .toString()
          .replace(" TL", "")
          .replace(/\./g, "") // Tüm noktaları kaldır (binlik ayırıcı)
          .replace(",", "."); // Virgülü noktaya çevir
        return Number(cleaned);
      };
  
      const originalPrice = parsePrice(p.original_price);
      const finalPrice = parsePrice(p.final_price);
  
      const discount =
        originalPrice && finalPrice
          ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
          : 0;
  
      return {
        _id: p._id,
        id: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        satici: p.satici,
        image: p.image,
        url: p.url,
        final_price: finalPrice,
        original_price: originalPrice,
        final_price_string: p.final_price, // Orijinal string formatı
        original_price_string: p.original_price, // Orijinal string formatı
        discount: discount,
        createdAt: p.createdAt,
      };
    });

    // Kategori filtresi artık backend'de yapılıyor, burada gerek yok

    // Filtreleme
    if (filters.gender) {
      products = products.filter(p => {
        const category = p.category || '';
        return category.toLowerCase().includes(filters.gender.toLowerCase());
      });
    }
    if (filters.satici) {
      products = products.filter(p => p.satici === filters.satici);
    }
    if (filters.price && filters.price.length === 2) {
      products = products.filter(p => {
        const price = p.final_price || p.original_price || 0;
        return price >= filters.price[0] && price <= filters.price[1];
      });
    }
    if (filters.discount && filters.discount.length === 2) {
      products = products.filter(p => {
        const disc = p.discount || 0;
        return disc >= filters.discount[0] && disc <= filters.discount[1];
      });
    }

    // Sıralama
    if (sortBy === "recommended") {
      // Önerilenler: indirim oranı yüksek olanlar önce, aynı seviyedekiler arasında rastgele sıra
      // Her ürüne session boyunca sabit kalan bir random offset atanır
      products.sort((a, b) => {
        const offsetA = randomOffsets.current[a._id] ?? (randomOffsets.current[a._id] = Math.random());
        const offsetB = randomOffsets.current[b._id] ?? (randomOffsets.current[b._id] = Math.random());
        // İndirim %70 ağırlık, rastgele %30 ağırlık (0-30 puan arasında)
        const scoreA = (a.discount || 0) * 0.7 + offsetA * 30;
        const scoreB = (b.discount || 0) * 0.7 + offsetB * 30;
        return scoreB - scoreA;
      });
    } else if (sortBy === "priceAsc") {
      products.sort((a, b) => (a.final_price || 0) - (b.final_price || 0));
    } else if (sortBy === "priceDesc") {
      products.sort((a, b) => (b.final_price || 0) - (a.final_price || 0));
    } else if (sortBy === "discountDesc") {
      products.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    }

    return products;
  }, [items, filters, sortBy, selectedCategory]);

  if (loading) {
    return (
      <div className="homeComponent">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Ürünler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="homeComponent">
        <div className="error-container">
          <p>Hata: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="homeComponent">
      
      {isSearching && searchQuery && (
  <div className="search-results-header">
    <h2 className="search-results-title">
      "{searchQuery}" için arama sonuçları
    </h2>
  </div>
)}


      <FilterBar
        onApply={setFilters}
        currentFilters={filters}
        sort={sortBy}
        onSortChange={setSortBy}
        priceRange={priceRange}
        discountRange={[0, 100]}
        genders={genders}
        sites={sites}
      />

      {mappedProducts.length === 0 ? (
        <div className="no-products">
          {isSearching && searchQuery ? (
            <>
              <p className="no-products-title">"{searchQuery}" için ürün bulunamadı</p>
              <p className="no-products-subtitle">Farklı bir arama terimi deneyin</p>
              <button 
                onClick={() => {
                  dispatch(clearSearch());
                  dispatch(resetPagination());
                  dispatch(fetchProducts(1));
                }}
                className="back-to-all-button"
              >
                Tüm Ürünleri Göster
              </button>
            </>
          ) : (
            <p>Filtre kriterlerinize uygun ürün bulunamadı.</p>
          )}
        </div>
      ) : (
        <>
          <div className="product-list">
            {mappedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
          {/* Infinite scroll trigger */}
          {pagination.hasNextPage && (
            <div ref={observerTarget} className="infinite-scroll-trigger">
              {loadingMore && (
                <div className="loading-more-container">
                  <div className="loading-spinner"></div>
                  <p>Daha fazla ürün yükleniyor...</p>
                </div>
              )}
            </div>
          )}
          {!pagination.hasNextPage && mappedProducts.length > 0 && (
            <div className="end-of-list">
              <p>Tüm ürünler gösterildi</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Home;
