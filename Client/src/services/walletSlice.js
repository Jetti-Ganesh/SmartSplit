import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { setUser } from './profileSlice';

// Fetch wallet transaction history
export const fetchWalletTransactions = createAsyncThunk(
  'wallet/fetchWalletTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/wallet');
      return response.data.transactions;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transaction history');
    }
  }
);

// Top up wallet balance
export const topUpWallet = createAsyncThunk(
  'wallet/topUpWallet',
  async ({ amount }, { dispatch, getState, rejectWithValue }) => {
    try {
      const response = await api.post('/wallet/topup', { amount });
      
      // Update walletBalance in profile state
      const state = getState();
      const currentUser = state.profile.user;
      if (currentUser) {
        dispatch(setUser({ ...currentUser, walletBalance: response.data.walletBalance }));
      }
      
      // Refresh transaction history
      dispatch(fetchWalletTransactions());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to top up wallet');
    }
  }
);

// Withdraw wallet balance to UPI ID
export const withdrawWallet = createAsyncThunk(
  'wallet/withdrawWallet',
  async ({ amount, upiId }, { dispatch, getState, rejectWithValue }) => {
    try {
      const response = await api.post('/wallet/withdraw', { amount, upiId });
      
      // Update walletBalance in profile state
      const state = getState();
      const currentUser = state.profile.user;
      if (currentUser) {
        dispatch(setUser({ ...currentUser, walletBalance: response.data.walletBalance }));
      }
      
      // Refresh transaction history
      dispatch(fetchWalletTransactions());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to withdraw wallet balance');
    }
  }
);

// Send money peer-to-peer (P2P) by email
export const sendMoneyWallet = createAsyncThunk(
  'wallet/sendMoneyWallet',
  async ({ email, amount }, { dispatch, getState, rejectWithValue }) => {
    try {
      const response = await api.post('/wallet/send', { email, amount });
      
      // Update walletBalance in profile state
      const state = getState();
      const currentUser = state.profile.user;
      if (currentUser) {
        dispatch(setUser({ ...currentUser, walletBalance: response.data.walletBalance }));
      }
      
      // Refresh transaction history
      dispatch(fetchWalletTransactions());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to transfer money');
    }
  }
);

// Settle group debt using wallet
export const settleDebtWallet = createAsyncThunk(
  'wallet/settleDebtWallet',
  async ({ SettlementID, groupId, to, amount }, { dispatch, getState, rejectWithValue }) => {
    try {
      const response = await api.post('/wallet/settle', { SettlementID, groupId, to, amount });
      
      // Update walletBalance in profile state
      const state = getState();
      const currentUser = state.profile.user;
      if (currentUser) {
        dispatch(setUser({ ...currentUser, walletBalance: response.data.walletBalance }));
      }
      
      // Refresh transaction history
      dispatch(fetchWalletTransactions());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to settle debt via wallet');
    }
  }
);

const initialState = {
  transactions: [],
  loading: false,
  error: null,
  success: false,
  successMessage: '',
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearWalletError: (state) => {
      state.error = null;
    },
    clearWalletSuccess: (state) => {
      state.success = false;
      state.successMessage = '';
    },
  },
  extraReducers: (builder) => {
    // Fetch wallet transactions
    builder
      .addCase(fetchWalletTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchWalletTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Top up wallet
    builder
      .addCase(topUpWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(topUpWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.successMessage = action.payload.message || 'Top-up successful!';
      })
      .addCase(topUpWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });

    // Withdraw wallet balance
    builder
      .addCase(withdrawWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(withdrawWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.successMessage = action.payload.message || 'Withdrawal completed!';
      })
      .addCase(withdrawWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });

    // Send money P2P
    builder
      .addCase(sendMoneyWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(sendMoneyWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.successMessage = action.payload.message || 'Transfer successful!';
      })
      .addCase(sendMoneyWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });

    // Settle debt
    builder
      .addCase(settleDebtWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(settleDebtWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.successMessage = action.payload.message || 'Settlement completed!';
      })
      .addCase(settleDebtWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { clearWalletError, clearWalletSuccess } = walletSlice.actions;
export default walletSlice.reducer;
