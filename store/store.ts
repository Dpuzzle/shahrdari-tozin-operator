import { ThunkAction, Action, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, PersistConfig } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "@reduxjs/toolkit";
import modals from "@/store/core/modals";
import confirm from "@/store/core/confirm";
import auth from "@/store/core/auth";
import ActionReducer from "@/store/slices/Action";
import ActivityReducer from "@/store/slices/Activity";
import CarReducer from "@/store/slices/Car";
import tempReducer from "@/store/slices/temp";
import requestQueueReducer from "@/store/slices/requestQueue";

const rootReducer = combineReducers({
  modals,
  confirm,
  auth,
  Action: ActionReducer,
  Activity: ActivityReducer,
  Car: CarReducer,
  temp: tempReducer,
  requestQueue: requestQueueReducer,
});

const persistConfig: PersistConfig<ReturnType<typeof rootReducer>> = {
  key: "root",
  storage,
  whitelist: [
    "modals",
    "confirm",
    "auth",
    "Action",
    "Activity",
    "Car",
    "temp",
    "requestQueue",
  ],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
