import React, { useState, useRef, useEffect } from "react";
import Filter from "./Filter";
import "./FilterBar.css";

function FilterBar({ onApply, currentFilters, sort, onSortChange, priceRange, discountRange, genders, sites }) {
  const [openFilter, setOpenFilter] = useState(false);
  const filterRef = useRef(null);
  const [draft, setDraft] = useState(currentFilters || {});

  const toggleFilter = () => setOpenFilter((prev) => !prev);

  useEffect(() => {
    setDraft(currentFilters || {});
    // Eğer filtreler temizlendiyse dropdown'ı kapat
    if (!currentFilters || Object.keys(currentFilters).length === 0) {
      setOpenFilter(false);
    }
  }, [currentFilters]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        // Sort select'e tıklandığında dropdown'ı kapatma
        const sortSelect = e.target.closest('.sort-select, .sort-section');
        if (sortSelect) {
          return;
        }
        setOpenFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // committedFilters: Filter bileşeni boş inputları commit edip doğrudan gönderirse kullan
  const handleApply = (committedFilters) => {
    const filtersToApply = committedFilters !== undefined ? committedFilters : draft;
    if (onApply) {
      onApply(filtersToApply);
      setOpenFilter(false);
    }
  };

  const handleClear = () => {
    const cleared = {};
    setDraft(cleared);
    if (onApply) {
      onApply(cleared);
      setOpenFilter(false);
    }
  };

  const activeFilterCount = Object.entries(draft).filter(([key, v]) => {
    if (Array.isArray(v)) {
      if (key === 'price' && priceRange && priceRange.length === 2) {
        // Fiyat filtresi aktifse: min !== priceRange[0] veya max !== priceRange[1]
        return v[0] !== priceRange[0] || v[1] !== priceRange[1];
      }
      if (key === 'discount' && discountRange && discountRange.length === 2) {
        // İndirim filtresi aktifse: min !== discountRange[0] veya max !== discountRange[1]
        return v[0] !== discountRange[0] || v[1] !== discountRange[1];
      }
      // Diğer array'ler için: değerler farklıysa ve min 0 değilse
      return v[0] !== v[1] && v[0] !== 0;
    }
    return v && v !== '';
  }).length;

  return (
    <div className="filter-bar-container" ref={filterRef}>
      <div className="filter-bar">
        {/* Filtre Butonu */}
        <button
          className={`filter-button ${openFilter ? 'active' : ''}`}
          onClick={toggleFilter}
          type="button"
        >
          <span className="filter-icon">🔍</span>
          <span className="filter-text">Filtrele</span>
          {activeFilterCount > 0 && (
            <span className="filter-badge">{activeFilterCount}</span>
          )}
        </button>

        {/* Sıralama */}
        <div className="sort-section">
          <span className="sort-label">
            <span className="sort-icon">📊</span>
            <span>Sırala:</span>
          </span>
          <select 
            className="sort-select"
            value={sort || "recommended"} 
            onChange={(e) => onSortChange && onSortChange(e.target.value)}
          >
            <option value="recommended">Önerilenler</option>
            <option value="priceAsc">Fiyat: Düşükten Yükseğe</option>
            <option value="priceDesc">Fiyat: Yüksekten Düşüğe</option>
            <option value="discountDesc">En Çok İndirim</option>
          </select>
        </div>

      </div>

      {/* Filter Dropdown */}
      {openFilter && (
        <Filter
          value={draft}
          onChange={setDraft}
          onApply={handleApply}
          onClear={handleClear}
          priceRange={priceRange}
          discountRange={discountRange}
          genders={genders}
          sites={sites}
        />
      )}
    </div>
  );
}

export default FilterBar;
