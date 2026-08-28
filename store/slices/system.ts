import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface SystemState {
  isSystemOnline: boolean;
}

const initialState: SystemState = {
  isSystemOnline: true,
};

const system = createSlice({
  name: "system",
  initialState,
  reducers: {
    setSystemOnline: (state, action: PayloadAction<boolean>) => ({
      ...state,
      isSystemOnline: action.payload,
    }),
  },
});

export default system.reducer;
export const { setSystemOnline } = system.actions;
