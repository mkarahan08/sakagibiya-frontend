import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "./slices/productSlice";
import userReducer from "./slices/userSlice";
import favoritesReducer from "./slices/favoritesSlice";

export const store = configureStore({
  reducer: {
    products: productsReducer,
    user: userReducer,
    favorites: favoritesReducer,
  },
});
