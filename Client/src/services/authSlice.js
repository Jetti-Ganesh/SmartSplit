import { createSlice } from '@reduxjs/toolkit';

// Validate token synchronously
function getInitialAuthState() {
  const token = localStorage.getItem('token');
  if (!token) return { isLoggedIn: false, user: null, token: null };
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { isLoggedIn: false, user: null, token: null };
    }
    const user = JSON.parse(localStorage.getItem('user'));
    return { isLoggedIn: true, user, token };
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { isLoggedIn: false, user: null, token: null };
  }
}

const initialState = getInitialAuthState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isLoggedIn = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
