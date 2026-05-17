import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../services/authSlice';
import themeReducer from '../services/themeSlice';
import { groupAPI } from '../services/groupAPI';
import { expenseAPI } from '../services/expenseAPI';
import { settleUpAPI } from '../services/settleUpAPI';
import profileReducer from '../services/profileSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    [groupAPI.reducerPath]: groupAPI.reducer,
    [expenseAPI.reducerPath]: expenseAPI.reducer,
    [settleUpAPI.reducerPath]: settleUpAPI.reducer,
    profile: profileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(groupAPI.middleware, expenseAPI.middleware, settleUpAPI.middleware),
});
