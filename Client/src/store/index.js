import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../services/authSlice';
import themeReducer from '../services/themeSlice';
import { groupAPI } from '../services/groupAPI';
import {expenseAPI} from '../services/expenseAPI';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    [groupAPI.reducerPath]: groupAPI.reducer,
    [expenseAPI.reducerPath]: expenseAPI.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(groupAPI.middleware, expenseAPI.middleware),
});
