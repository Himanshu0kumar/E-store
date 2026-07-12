import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./slices/productSlice";
import authReducer from "./slices/authSlice";
import uploadReducer from "./slices/uploadSlice";
export const store = configureStore({
  reducer: {
    products: productReducer,
    auth: authReducer,
    upload: uploadReducer, 
  },
});