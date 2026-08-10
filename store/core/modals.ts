import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ActionType, ActionWorkType, FieldType } from "../slices/Action";
import { ActivityType } from "../slices/Activity";
import { CarType } from "../slices/Car";

export type appMessageType = {
  type: "" | "success" | "error" | "warning" | "info";
  title: string;
  desc: string;
};

export enum ModalStep {
  PLAQUE,
  WEIGHTING_FULL,
  WEIGHTING_EMPTY,
  CONFIRM,
}

export interface FieldDataWighing {
  Field: FieldType;
  value: string;
}
export interface ModalDataProps {
  id: number;
  address?: string;
  step: ModalStep;
  actionType: ActionType;
  activity?: ActivityType;
  car?: CarType;
  selectedWork?: ActionWorkType;
  fullWeghting?: number;
  empltyWeghting?: number;
  Field_Data?: FieldDataWighing[] | [];
  mabda?: number;
}

export type coreType = {
  modals?: ModalDataProps;
  message: appMessageType;
};

const initialState: coreType = {
  message: {
    type: "",
    title: "",
    desc: "",
  },
};

const coreSlice = createSlice({
  name: "coreSlice",
  initialState,
  reducers: {
    changeMessage: (state, action: PayloadAction<appMessageType>) => {
      state.message = action.payload;
    },

    clearMessage: (state) => {
      state.message = {
        type: "",
        title: "",
        desc: "",
      };
    },
    openModal: (state, action: PayloadAction<ModalDataProps>) => {
      state.modals = { ...state.modals, ...action.payload };
      //(state.modals);
    },
    updateModal: (state, action: PayloadAction<Partial<ModalDataProps>>) => {
      if (!state.modals) return;
      state.modals = { ...state.modals, ...action.payload };
    },

    closeModal: (state) => {
      state.modals = undefined;
    },
  },
});

export default coreSlice.reducer;
export const {
  changeMessage,
  clearMessage,
  openModal,
  closeModal,
  updateModal,
} = coreSlice.actions;
