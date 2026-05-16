import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  const storedTheme = localStorage.getItem('theme');
  return storedTheme === 'dark' || storedTheme !== 'light'; // Default to dark if not set
};

const initialState = {
  isDark: getInitialTheme(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark;
      localStorage.setItem('theme', state.isDark ? 'dark' : 'light');
    },
    setTheme: (state, action) => {
      state.isDark = action.payload;
      localStorage.setItem('theme', state.isDark ? 'dark' : 'light');
    }
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
