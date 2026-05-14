import { configureStore } from "@reduxjs/toolkit";
import { groupAPI } from "../services/groupAPI";
export const store = configureStore({
    reducer:
    {
        [groupAPI.reducerPath]: groupAPI.reducer
    },
    middleware: (getDefaultMiddleware)=>getDefaultMiddleware().concat(groupAPI.middleware)
})