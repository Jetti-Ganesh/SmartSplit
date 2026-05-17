import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
// Fetch user profile from API
export const fetchUserProfile = createAsyncThunk(
  'profile/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      console.log('fetchUserProfile thunk called');
      const response = await api.get('/profile');
      console.log('Profile response:', response.data);
      return response.data.user;
    } catch (error) {
      console.error('Profile fetch error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

// Update user profile on API
export const updateUserProfile = createAsyncThunk(
  'profile/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      console.log('📤 Updating profile...');
      if (profileData.avatar) {
        console.log('📸 Avatar size:', profileData.avatar.length, 'bytes');
      }
      const response = await api.put('/profile', profileData);
      console.log('✅ Profile update successful:', response.data);
      return response.data.user;
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error message:', error.message);
      
      // Handle specific errors
      if (error.response?.status === 413) {
        return rejectWithValue('Image is too large. Please use a smaller image.');
      }
      if (error.response?.status === 409) {
        return rejectWithValue('Email already in use by another account.');
      }
      
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to update profile'
      );
    }
  }
);

const initialState = {
  user: null,
  loading: false,
  error: null,
  success: false,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    // New reducer to directly set the user object (used after UPI updates)
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch user profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update user profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
        state.success = true;
        // Keep auth slice sync'd by updating local storage
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { clearError, clearSuccess, setUser } = profileSlice.actions;
export default profileSlice.reducer;
