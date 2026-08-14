import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface UserInfo {
  id: number;
  username: string;
  previous_weight_permission: boolean;
  add_car_permission: boolean;
}

export interface UserType {
  access?: string;
  refresh?: string;
  user?: UserInfo;
}

export type authType = {
  data?: UserType;
};

const initialState: authType = {};

const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserType>) => {
      state.data = action.payload;
    },
    logoutUser: (state) => ({}),
  },
});

export default authSlice.reducer;
export const { setUser, logoutUser } = authSlice.actions;
