import { createAsyncThunk, createSlice, type PayloadAction   } from "@reduxjs/toolkit";

import type { User } from "./types/User";
import api from "@shared/utils/AxiosInstance";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: true, 
  error: null,
};

export const fetchCurrentUser = createAsyncThunk<User>(
  "auth/fetchCurrentUser",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/auth/me");
      return response?.data?.data?.userData;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to fetch user");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
      setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.error = null;
      state.loading = false;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
    extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        console.log(action.payload,'from fullfilled')
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.user = null;
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
