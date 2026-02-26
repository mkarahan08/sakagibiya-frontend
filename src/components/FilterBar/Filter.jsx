import React, { useState, useEffect } from "react";
import "./Filter.css";

function Filter({ value, onChange, onApply, onClear, priceRange = [0, 0], discountRange = [0, 100], genders = [], sites = [] }) {
  const local = value || { 
    gender: '', 
    satici: '', 
    price: priceRange || [0, 0], 
    discount: discountRange || [0, 100] 
  };

  // Sayı inputları için yerel string state'ler
  // Böylece kullanıcı 0'ı silip yeni değer yazabilir, input takılmaz
  const [priceInputs, setPriceInputs] = useState([
    (local.price?.[0] ?? priceRange[0] ?? 0).toString(),
    (local.price?.[1] ?? priceRange[1] ?? 0).toString()
  ]);
  const [discountInputs, setDiscountInputs] = useState([
    (local.discount?.[0] ?? discountRange[0] ?? 0).toString(),
    (local.discount?.[1] ?? discountRange[1] ?? 100).toString()
  ]);

  // Filtreler tamamen sıfırlandığında (kategori değişimi vb.) yerel state'i de sıfırla
  useEffect(() => {
    if (!value || Object.keys(value).length === 0) {
      setPriceInputs([
        (priceRange[0] ?? 0).toString(),
        (priceRange[1] ?? 0).toString()
      ]);
      setDiscountInputs([
        (discountRange[0] ?? 0).toString(),
        (discountRange[1] ?? 100).toString()
      ]);
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const setField = (key, val) => onChange && onChange({ ...local, [key]: val });

  const handlePriceChange = (e, index) => {
    const raw = e.target.value;
    // Yerel string state güncelle → kullanıcı input'u serbestçe düzenleyebilir
    const newInputs = [...priceInputs];
    newInputs[index] = raw;
    setPriceInputs(newInputs);

    // Sadece geçerli sayıysa parent'ı güncelle
    if (raw !== '') {
      const currentPrice = [...(local.price || priceRange || [0, 0])];
      const numVal = parseFloat(raw);
      currentPrice[index] = isNaN(numVal) ? 0 : numVal;
      setField('price', currentPrice);
    }
  };

  const handleDiscountChange = (e, index) => {
    const raw = e.target.value;
    const newInputs = [...discountInputs];
    newInputs[index] = raw;
    setDiscountInputs(newInputs);

    if (raw !== '') {
      const currentDiscount = [...(local.discount || discountRange || [0, 100])];
      const numVal = parseFloat(raw);
      currentDiscount[index] = isNaN(numVal) ? 0 : numVal;
      setField('discount', currentDiscount);
    }
  };

  // Filtrele'ye basınca boş kalan inputları da commit et ve uygula
  const handleApplyClick = () => {
    const price = [
      priceInputs[0] !== '' ? (parseFloat(priceInputs[0]) || 0) : (local.price?.[0] ?? priceRange[0] ?? 0),
      priceInputs[1] !== '' ? (parseFloat(priceInputs[1]) || 0) : (local.price?.[1] ?? priceRange[1] ?? 0)
    ];
    const discount = [
      discountInputs[0] !== '' ? (parseFloat(discountInputs[0]) || 0) : (local.discount?.[0] ?? discountRange[0] ?? 0),
      discountInputs[1] !== '' ? (parseFloat(discountInputs[1]) || 0) : (local.discount?.[1] ?? discountRange[1] ?? 100)
    ];

    const committed = { ...local, price, discount };
    // Önce FilterBar'ın draft'ını güncelle, sonra apply et
    onChange && onChange(committed);
    onApply && onApply(committed);
  };

  // Display değerleri için yardımcı
  const displayPrice = (inputStr, fallback) => {
    if (inputStr === '' || inputStr === undefined) return fallback ?? 0;
    const n = parseFloat(inputStr);
    return isNaN(n) ? fallback ?? 0 : n;
  };

  return (
    <div className="filter-dropdown">
      <div className="filter-header">
        <h3 className="filter-title">
          <span className="filter-title-icon">🔍</span>
          <span>Filtre Seçenekleri</span>
        </h3>
        {onClear && (
          <button className="filter-close" onClick={onClear} type="button">
            ✕
          </button>
        )}
      </div>

      <div className="filter-content">

        {/* Gender */}
        {genders && genders.length > 0 && (
          <div className="filter-group">
            <label className="filter-group-label">
              <span className="label-icon">👤</span>
              <span>Cinsiyet</span>
            </label>
            <select 
              className="filter-select"
              value={local.gender || ''} 
              onChange={(e) => setField('gender', e.target.value)}
            >
              <option value="">Tümü</option>
              {genders.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        )}

        {/* Site */}
        {sites && sites.length > 0 && (
          <div className="filter-group">
            <label className="filter-group-label">
              <span className="label-icon">🏪</span>
              <span>Satıcı</span>
            </label>
            <select 
              className="filter-select"
              value={local.satici || ''} 
              onChange={(e) => setField('satici', e.target.value)}
            >
              <option value="">Tüm Satıcılar</option>
              {sites.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        {/* Fiyat Aralığı */}
        {priceRange && priceRange.length === 2 && (
          <div className="filter-group">
            <label className="filter-group-label">
              <span className="label-icon">💰</span>
              <span>Fiyat Aralığı (TL)</span>
            </label>
            <div className="range-inputs">
              <input
                type="number"
                className="range-input"
                placeholder="Min"
                value={priceInputs[0]}
                onChange={(e) => handlePriceChange(e, 0)}
                min={priceRange[0] ?? 0}
                max={priceRange[1] ?? 0}
              />
              <span className="range-separator">-</span>
              <input
                type="number"
                className="range-input"
                placeholder="Max"
                value={priceInputs[1]}
                onChange={(e) => handlePriceChange(e, 1)}
                min={priceRange[0] ?? 0}
                max={priceRange[1] ?? 0}
              />
            </div>
            <div className="range-display">
              <span>{displayPrice(priceInputs[0], priceRange[0])} TL</span>
              <span>{displayPrice(priceInputs[1], priceRange[1])} TL</span>
            </div>
          </div>
        )}

        {/* İndirim Oranı */}
        {discountRange && discountRange.length === 2 && (
          <div className="filter-group">
            <label className="filter-group-label">
              <span className="label-icon">🎯</span>
              <span>İndirim Oranı (%)</span>
            </label>
            <div className="range-inputs">
              <input
                type="number"
                className="range-input"
                placeholder="Min"
                value={discountInputs[0]}
                onChange={(e) => handleDiscountChange(e, 0)}
                min={0}
                max={100}
              />
              <span className="range-separator">-</span>
              <input
                type="number"
                className="range-input"
                placeholder="Max"
                value={discountInputs[1]}
                onChange={(e) => handleDiscountChange(e, 1)}
                min={0}
                max={100}
              />
            </div>
            <div className="range-display">
              <span>%{displayPrice(discountInputs[0], discountRange[0])}</span>
              <span>%{displayPrice(discountInputs[1], discountRange[1])}</span>
            </div>
          </div>
        )}
      </div>

      <div className="filter-actions">
        <button className="filter-apply-btn" onClick={handleApplyClick} type="button">
          <span>✓</span>
          <span>Filtrele</span>
        </button>
        {onClear && (
          <button className="filter-clear-btn" onClick={onClear} type="button">
            <span>✕</span>
            <span>Temizle</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default Filter;
