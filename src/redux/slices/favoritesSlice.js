import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

// API'den favorileri getir
export const fetchFavorites = createAsyncThunk(
  "favorites/fetchFavorites",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return [];
      }

      const res = await api.get("/favorites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        return res.data.data || [];
      }
      return [];
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      return rejectWithValue(error.response?.data?.message || "Favoriler yüklenemedi");
    }
  }
);

// Favorilere ekle
export const addToFavorites = createAsyncThunk(
  "favorites/addToFavorites",
  async (productId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("Giriş yapmanız gerekiyor");
      }

      const res = await api.post(
        "/favorites/add",
        { productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        return res.data.data;
      }
      return rejectWithValue(res.data.message || "Favori eklenemedi");
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue("Giriş yapmanız gerekiyor");
      }
      return rejectWithValue(error.response?.data?.message || "Favori eklenemedi");
    }
  }
);

// Favorilerden çıkar
export const removeFromFavorites = createAsyncThunk(
  "favorites/removeFromFavorites",
  async (productId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("Giriş yapmanız gerekiyor");
      }

      const res = await api.delete(`/favorites/remove/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        return productId;
      }
      return rejectWithValue(res.data.message || "Favori çıkarılamadı");
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue("Giriş yapmanız gerekiyor");
      }
      return rejectWithValue(error.response?.data?.message || "Favori çıkarılamadı");
    }
  }
);

// Toggle favorite
export const toggleFavorite = createAsyncThunk(
  "favorites/toggleFavorite",
  async (productId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("Giriş yapmanız gerekiyor");
      }

      const res = await api.post(
        "/favorites/toggle",
        { productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        return { productId, isFavorite: res.data.isFavorite };
      }
      return rejectWithValue(res.data.message || "İşlem başarısız");
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue("Giriş yapmanız gerekiyor");
      }
      return rejectWithValue(error.response?.data?.message || "İşlem başarısız");
    }
  }
);

// Favori durumunu kontrol et
export const checkFavoriteStatus = createAsyncThunk(
  "favorites/checkFavoriteStatus",
  async (productId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return false;
      }

      const res = await api.get(`/favorites/check/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        return res.data.isFavorite;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
);

// Tüm favorileri temizle
export const clearFavorites = createAsyncThunk(
  "favorites/clearFavorites",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("Giriş yapmanız gerekiyor");
      }

      const state = getState();
      const favorites = state.favorites.items;

      // Tüm favorileri tek tek sil
      const deletePromises = favorites.map((fav) =>
        api.delete(`/favorites/remove/${fav._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      await Promise.all(deletePromises);

      return [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Favoriler temizlenemedi");
    }
  }
);

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearFavoritesLocal: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Favorites
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.items = [];
      })
      // Add to Favorites
      .addCase(addToFavorites.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToFavorites.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addToFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove from Favorites
      .addCase(removeFromFavorites.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addCase(removeFromFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle Favorite
      .addCase(toggleFavorite.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleFavorite.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Clear Favorites
      .addCase(clearFavorites.pending, (state) => {
        state.loading = true;
      })
      .addCase(clearFavorites.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
      })
      .addCase(clearFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFavoritesLocal } = favoritesSlice.actions;
export default favoritesSlice.reducer;
