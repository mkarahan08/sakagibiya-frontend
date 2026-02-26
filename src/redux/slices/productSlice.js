import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

// 🔹 Tüm ürünleri getir (pagination ile)
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (page = 1, { rejectWithValue, getState }) => {
    try {
      const limit = 20;
      const state = getState();
      const selectedCategory = state.products.selectedCategory;
      
      // Kategori parametresi varsa ekle
      let url = `/products?page=${page}&limit=${limit}`;
      if (selectedCategory) {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      
      const response = await api.get(url);
      const existingItems = state.products.items || [];
      
      // Eğer ilk sayfa ise yeni liste, değilse ekle (tekrar eden _id'leri filtrele)
      let products;
      if (page === 1) {
        products = response.data.products;
      } else {
        const seenIds = new Set(existingItems.map(p => String(p._id)));
        const newItems = response.data.products.filter(p => !seenIds.has(String(p._id)));
        products = [...existingItems, ...newItems];
      }

      return {
        products,
        pagination: response.data.pagination
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ürünler alınırken bir hata oluştu"
      );
    }
  }
);


export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${productId}`);

      console.log("RAW product:", response.data); // 👈 DEBUG

      return response.data; // ✅
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ürün detayı alınırken bir hata oluştu"
      );
    }
  }
);

// 🔍 Ürün arama fonksiyonu (Server-side search)
export const searchProducts = createAsyncThunk(
  "products/searchProducts",
  async ({ query, page = 1 }, { rejectWithValue, getState }) => {
    try {
      if (!query || query.trim() === '') {
        return rejectWithValue("Arama terimi gerekli");
      }

      const limit = 20;
      const response = await api.get(`/products/search?query=${encodeURIComponent(query.trim())}&page=${page}&limit=${limit}`);
      
      if (response.data.success) {
        const state = getState();
        const existingItems = state.products.items || [];
        
        // Eğer ilk sayfa ise yeni liste, değilse ekle
        const products = page === 1 
          ? response.data.products 
          : [...existingItems, ...response.data.products];

        return {
          products,
          query: response.data.query || query,
          pagination: response.data.pagination
        };
      }
      
      return rejectWithValue(response.data.message || "Arama başarısız");
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Arama yapılırken bir hata oluştu"
      );
    }
  }
);


// 🔴 SLICE TANIMI (EKSİK OLAN KISIM)
const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    selectedProduct: null,
    loading: false,
    error: null,
    searchQuery: '', // Arama terimi
    isSearching: false, // Arama modunda mı?
    selectedCategory: null, // Seçili kategori
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 20,
      hasNextPage: false,
      hasPrevPage: false
    },
    loadingMore: false, // Daha fazla yükleniyor mu?
  },
  reducers: {
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    clearSearch: (state) => {
      state.searchQuery = '';
      state.isSearching = false;
      state.items = [];
      state.pagination = {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 20,
        hasNextPage: false,
        hasPrevPage: false
      };
    },
    setCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    clearCategory: (state) => {
      state.selectedCategory = null;
    },
    resetPagination: (state) => {
      state.pagination = {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 20,
        hasNextPage: false,
        hasPrevPage: false
      };
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Tüm ürünler
      .addCase(fetchProducts.pending, (state, action) => {
        const page = action.meta.arg || 1;
        if (page === 1) {
          state.loading = true;
        } else {
          state.loadingMore = true;
        }
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.items = action.payload.products || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload;
      })

      // Ürün detayı
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 🔍 Arama
      .addCase(searchProducts.pending, (state, action) => {
        const page = action.meta.arg?.page || 1;
        if (page === 1) {
          state.loading = true;
        } else {
          state.loadingMore = true;
        }
        state.error = null;
        state.isSearching = true;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.items = action.payload.products || [];
        state.searchQuery = action.payload.query || '';
        state.pagination = action.payload.pagination || state.pagination;
        state.isSearching = true;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload;
        state.isSearching = false;
      });
  },
});

// 🔹 ACTIONS EXPORT
export const { clearSelectedProduct, clearSearch, setCategory, clearCategory, resetPagination } = productSlice.actions;

// 🔹 DEFAULT EXPORT (store.js bunu bekliyor)
export default productSlice.reducer;
