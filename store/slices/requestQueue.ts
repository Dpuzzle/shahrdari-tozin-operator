import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface QueuedRequest {
  id: string;
  type: "activity" | "report";
  method: "POST" | "PUT" | "DELETE";
  url: string;
  payload: any;
  timestamp: number;
  retryCount: number;
  syncing?: boolean;
}

interface RequestQueueState {
  queue: QueuedRequest[];
  isSyncing: boolean;
}

const initialState: RequestQueueState = {
  queue: [],
  isSyncing: false,
};

const requestQueueSlice = createSlice({
  name: "requestQueue",
  initialState,
  reducers: {
    addRequest: (state, action: PayloadAction<Omit<QueuedRequest, "id" | "timestamp" | "retryCount">>) => {
      const newRequest: QueuedRequest = {
        ...action.payload,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        retryCount: 0,
        syncing: false,
      };
      state.queue.push(newRequest);
    },
    removeRequest: (state, action: PayloadAction<{ id: string }>) => {
      state.queue = state.queue.filter((req) => req.id !== action.payload.id);
    },
    markRequestSyncing: (state, action: PayloadAction<{ id: string }>) => {
      const request = state.queue.find((req) => req.id === action.payload.id);
      if (request) {
        request.syncing = true;
      }
      state.isSyncing = true;
    },
    markRequestFailed: (state, action: PayloadAction<{ id: string }>) => {
      const request = state.queue.find((req) => req.id === action.payload.id);
      if (request) {
        request.syncing = false;
        request.retryCount += 1;
      }
      // Check if any requests are still syncing
      state.isSyncing = state.queue.some((req) => req.syncing);
    },
    clearQueue: (state) => {
      state.queue = [];
      state.isSyncing = false;
    },
    setSyncing: (state, action: PayloadAction<{ isSyncing: boolean }>) => {
      state.isSyncing = action.payload.isSyncing;
    },
  },
});

export default requestQueueSlice.reducer;
export const {
  addRequest,
  removeRequest,
  markRequestSyncing,
  markRequestFailed,
  clearQueue,
  setSyncing,
} = requestQueueSlice.actions;

