import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./slices/productSlice";
import authReducer from "./slices/authSlice";
import uploadReducer from "./slices/uploadSlice";
import wishlistReducer from "./slices/wishlistSlice";
import cartReducer from "./slices/cartSlice";
import categoryReducer from "./slices/categorySlice";
export const store = configureStore({
  reducer: {
    products: productReducer,
    auth: authReducer,
    upload: uploadReducer, 
    wishlist: wishlistReducer ,
    cart: cartReducer ,
    category: categoryReducer ,
  },
});