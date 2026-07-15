import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { CarType } from "./Car";

interface SliceType {
  selectedCar: CarType | null;
  last_tozin_id: number;
}

const initialState: SliceType = { selectedCar: null, last_tozin_id: 0 };

const temp = createSlice({
  name: "temp",
  initialState,
  reducers: {
    temp_selectCar: (
      state,
      action: PayloadAction<{ car: CarType | null }>,
    ) => ({
      ...state,
      selectedCar: action.payload.car,
    }),
    updateTozinID: (state, action: PayloadAction<{ tozin_id: number }>) => ({
      ...state,
      last_tozin_id: action.payload.tozin_id,
    }),
  },
});
export default temp.reducer;
export const { temp_selectCar, updateTozinID } = temp.actions;
