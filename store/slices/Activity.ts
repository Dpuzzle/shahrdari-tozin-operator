import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { CarType } from "./Car";
import { ActionType, ActionWorkType } from "./Action";
import { FieldDataWighing } from "../core/modals";

export interface ActivityType {
  tozin_id?: number;
  Empty: number | null;
  Full: number | null;
  Car: CarType;
  Action: ActionType;
  baskol_number_empty?: number;
  baskol_number_full?: number;
  server_accepted: boolean;
  work_type: ActionWorkType;
  work_type_id: number;
  address?: string;
  Field_Data?: FieldDataWighing[];
  mabda?: number;
}

interface SliceType {
  data: ActivityType[];
  last_tozin_id: number;
}

const initialState: SliceType = { data: [], last_tozin_id: 0 };

const Activity = createSlice({
  name: "Activity",
  initialState,
  reducers: {
    set: (state, action: PayloadAction<ActivityType[]>) => ({
      ...state,
      data: action.payload,
    }),
    set_base: (state, action: PayloadAction<number>) => ({
      ...state,
      last_tozin_id: action.payload ?? 0,
    }),
    clear: (state) => ({ ...state, data: [] }),
    add: (state, action: PayloadAction<ActivityType>) => ({
      ...state,
      data: [...state.data, action.payload],
    }),
    update: (
      state,
      action: PayloadAction<{
        data: ActivityType;
        pk: ActivityType["tozin_id"];
      }>
    ) => ({
      ...state,
      data: [
        action.payload.data,
        ...state.data.filter((d) => d.tozin_id !== action.payload.pk),
      ],
    }),
    remove: (
      state,
      action: PayloadAction<{ pk: ActivityType["tozin_id"] }>
    ) => ({
      ...state,
      data: state.data.filter((d) => d.tozin_id !== action.payload.pk),
    }),

    update_empty: (
      state,
      action: PayloadAction<{ pk: ActivityType["tozin_id"]; empty: number }>
    ) => ({
      ...state,
      data: state.data.map((d) =>
        d.tozin_id === action.payload.pk
          ? { ...d, Empty: action.payload.empty }
          : d
      ),
    }),
    update_full: (
      state,
      action: PayloadAction<{ pk: ActivityType["tozin_id"]; full: number }>
    ) => ({
      ...state,
      data: state.data.map((d) =>
        d.tozin_id === action.payload.pk
          ? { ...d, Full: action.payload.full }
          : d
      ),
    }),
  },
});
export default Activity.reducer;
export const {
  clear: Activity_clear,
  set: Activity_set,
  set_base: Activity_set_base,
  add: Activity_add,
  update: Activity_update,
  remove: Activity_remove,
} = Activity.actions;
