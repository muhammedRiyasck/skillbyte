import { createSlice, type PayloadAction,  } from "@reduxjs/toolkit";

import type { User } from "./types/User";

interface AuthState {
  user: User | null;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem("user") || "null"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));

    },
    clearUser: (state) => {
      state.user = null;
     localStorage.removeItem("user");

    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
