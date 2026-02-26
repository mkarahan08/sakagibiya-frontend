import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { categories } from "../CategoryBar/CategoryData";
import { setCategory, clearCategory, clearSearch, fetchProducts } from "../../redux/slices/productSlice";
import "./CategoryBar.css";

function CategoryBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedCategory } = useSelector((state) => state.products);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeSubDropdown, setActiveSubDropdown] = useState(null);
  const subDropdownRefs = useRef({});

  const handleCategoryClick = (categoryName, e) => {
    e.preventDefault();
    // Ana sayfaya yönlendir
    if (window.location.pathname !== '/') {
      navigate('/');
    }
    
    // Kategoriyi seç
    if (selectedCategory === categoryName) {
      // Aynı kategoriye tekrar tıklanırsa filtreyi temizle
      dispatch(clearCategory());
      dispatch(clearSearch());
      dispatch(fetchProducts());
    } else {
      dispatch(setCategory(categoryName));
      dispatch(clearSearch());
      dispatch(fetchProducts());
    }
  };

  const handleSubCategoryClick = (categoryName, subCategoryName, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Ana sayfaya yönlendir
    if (window.location.pathname !== '/') {
      navigate('/');
    }
    
    // Alt kategoriyi kategori olarak filtrele
    dispatch(setCategory(subCategoryName));
    dispatch(clearSearch());
    dispatch(fetchProducts());
  };

  const handleDeepCategoryClick = (categoryName, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Ana sayfaya yönlendir
    if (window.location.pathname !== '/') {
      navigate('/');
    }
    
    // Derin kategoriyi filtrele
    dispatch(setCategory(categoryName));
    dispatch(clearSearch());
    dispatch(fetchProducts());
  };

  // Sub-dropdown pozisyonunu ayarla
  useEffect(() => {
    Object.keys(subDropdownRefs.current).forEach((key) => {
      const element = subDropdownRefs.current[key];
      if (element) {
        const rect = element.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        
        // Eğer sub-dropdown ekranın sağından taşıyorsa, sol tarafa aç
        if (rect.right > windowWidth - 20) {
          element.style.left = 'auto';
          element.style.right = 'calc(100% + 8px)';
        } else {
          element.style.left = 'calc(100% + 8px)';
          element.style.right = 'auto';
        }
      }
    });
  }, [activeSubDropdown]);

  return (
    <div className="category-bar">
      {categories.map((cat, index) => (
        <div
          key={index}
          className={`category-item ${selectedCategory === cat.name ? 'active' : ''}`}
          onMouseEnter={() => cat.subcategories && setActiveDropdown(cat.name)}
          onMouseLeave={() => {
            setActiveDropdown(null);
            setActiveSubDropdown(null);
          }}
          onClick={(e) => handleCategoryClick(cat.name, e)}
        >
          <span>{cat.name}</span>

          
          {cat.subcategories && activeDropdown === cat.name && (
            <div
              className="dropdown-menu"
              onMouseEnter={() => setActiveDropdown(cat.name)} 
              onMouseLeave={() => setActiveDropdown(null)}
            >
              {cat.subcategories.map((sub, i) => (
                <div
                  key={i}
                  className={`dropdown-item ${sub.subcategories ? 'has-submenu' : ''}`}
                  onMouseEnter={() =>
                    sub.subcategories && setActiveSubDropdown(sub.name)
                  }
                  onMouseLeave={() => setActiveSubDropdown(null)}
                  onClick={(e) => handleSubCategoryClick(cat.name, sub.name, e)}
                >
                  <span>{sub.name || sub}</span>

                  
                  {sub.subcategories &&
                    activeSubDropdown === sub.name && (
                      <div
                        ref={(el) => {
                          if (el) {
                            subDropdownRefs.current[`${cat.name}-${sub.name}`] = el;
                          } else {
                            delete subDropdownRefs.current[`${cat.name}-${sub.name}`];
                          }
                        }}
                        className="sub-dropdown"
                        onMouseEnter={() => setActiveSubDropdown(sub.name)}
                        onMouseLeave={() => setActiveSubDropdown(null)}
                      >
                        {sub.subcategories.map((deep, j) => (
                          <a 
                            key={j} 
                            href="#" 
                            className="dropdown-subitem"
                            onClick={(e) => handleDeepCategoryClick(deep, e)}
                          >
                            {deep}
                          </a>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default CategoryBar;
