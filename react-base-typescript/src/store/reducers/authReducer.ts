import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import Cookies from "js-cookie";
import { AuthState,LoginRes,SignupRes } from "../types/authType";

// const token = Cookies.get("token");
// const refresh_token = Cookies.get("refresh_token");
// const user = Cookies.get("user");

const token = localStorage.getItem("token");
const refresh_token = localStorage.getItem("refresh_token");

const initialState: AuthState = {
  token: token || "",
  refresh_token: refresh_token || ""
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<LoginRes>) => {
      
      state.token = action.payload.access_token;
      state.refresh_token = action.payload.refresh_token;
    },
    signup: (state, action: PayloadAction<SignupRes>) => {
      state.token = action.payload.access_token;
      state.refresh_token = action.payload.refresh_token;
    },
    logout: (state) => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
      state.token = "";
      state.refresh_token = "";
    },
    refreshToken: (state, action: PayloadAction<LoginRes>) => {
      state.token = action.payload.access_token;
    },
  },
});
export const { login, signup, logout, refreshToken } = authSlice.actions;

export default authSlice.reducer;
