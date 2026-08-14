import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CarType } from "./Car";

export interface PendingCarRequest {
  id: string;
  car: CarType;
  payload: {
    license_plate: string;
    driver_name: string;
    vehicle_type_name: string;
    company_name?: string;
  };
  createdAt: string;
  status: "pending" | "sent" | "failed";
  lastError?: string;
}

interface SliceType {
  items: PendingCarRequest[];
}

const initialState: SliceType = { items: [] };

const requestQueue = createSlice({
  name: "requestQueue",
  initialState,
  reducers: {
    requestQueue_add: (state, action: PayloadAction<PendingCarRequest>) => ({
      ...state,
      items: [...state.items, action.payload],
    }),
    requestQueue_remove: (state, action: PayloadAction<string>) => ({
      ...state,
      items: state.items.filter((i) => i.id !== action.payload),
    }),
    requestQueue_updateStatus: (
      state,
      action: PayloadAction<{ id: string; status: "sent" | "failed"; lastError?: string }>
    ) => ({
      ...state,
      items: state.items.map((i) =>
        i.id === action.payload.id
          ? { ...i, status: action.payload.status, lastError: action.payload.lastError }
          : i
      ),
    }),
    requestQueue_clear: (state) => ({ ...state, items: [] }),
  },
});

export default requestQueue.reducer;
export const {
  requestQueue_add,
  requestQueue_remove,
  requestQueue_updateStatus,
  requestQueue_clear,
} = requestQueue.actions;
