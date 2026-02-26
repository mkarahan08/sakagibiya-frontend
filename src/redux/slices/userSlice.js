import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// API base
const API_URL = "http://localhost:5000/api/users";

/* ============================
   ASYNC THUNKS
============================ */

// REGISTER
export const registerUser = createAsyncThunk(
  "user/register",
  async (userData, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      
      if (!res.ok) {
        const errorMessage = data.message || "Kayıt yapılırken bir hata oluştu";
        throw new Error(errorMessage);
      }

      if (data.success && data.data) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data));
        return data.data;
      } else {
        throw new Error("Geçersiz yanıt formatı");
      }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || "Kayıt yapılırken bir hata oluştu");
    }
  }
);

// LOGIN
export const loginUser = createAsyncThunk(
  "user/login",
  async (userData, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      
      if (!res.ok) {
        const errorMessage = data.message || "Giriş yapılırken bir hata oluştu";
        throw new Error(errorMessage);
      }

      if (data.success && data.data) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data));
        return data.data;
      } else {
        throw new Error("Geçersiz yanıt formatı");
      }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || "Giriş yapılırken bir hata oluştu");
    }
  }
);

// PROFILE
export const getProfile = createAsyncThunk(
  "user/profile",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Token bulunamadı");
      }

      const res = await fetch(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      
      if (!res.ok) {
        const errorMessage = data.message || "Profil bilgileri alınırken bir hata oluştu";
        throw new Error(errorMessage);
      }

      if (data.success && data.data) {
        return data.data;
      } else {
        throw new Error("Geçersiz yanıt formatı");
      }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || "Profil bilgileri alınırken bir hata oluştu");
    }
  }
);

/* ============================
   SLICE
============================ */

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: JSON.parse(localStorage.getItem("user")) || null,
    loading: false,
    error: null,
    isAuthenticated: !!localStorage.getItem("token"),
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // PROFILE
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Token geçersizse logout yap
        if (action.payload?.includes("Token") || action.payload?.includes("Yetkilendirme")) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          state.user = null;
          state.isAuthenticated = false;
        }
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
