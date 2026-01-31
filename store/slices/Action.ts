import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import DefaultData from "@/data/defaultOfflineData.json"

export interface ExprotTypes {
  id: number;
  name: string;
  shema: string;
}

export interface UploadTypes {
  id: number;
  name: string;
  description: string;
  required: boolean;
}
export interface ActionWorkType {
  id: number;
  name: string;
}

export interface FieldType {
  id: number;
  name: string;
  key: string;
  required: boolean;
}

export interface ActionType {
  pk: number;
  name: string;
  type: "empty" | "full";
  exports: ExprotTypes[];
  uploads: UploadTypes[];
  works: ActionWorkType[];
  Field: FieldType[];
}

interface SliceType {
  data: ActionType[];
}

const initialState: SliceType = { data:  [
      {
          "pk": 1,
          "name": "تخلیه کامل",
          "type": "empty",
          "exports": [
              {
                  "id": 1,
                  "name": "گزارش تخلیه",
                  "shema": "empty_report"
              }
          ],
          "uploads": [
              {
                  "id": 1,
                  "name": "عکس تخلیه",
                  "description": "عکس از وضعیت تخلیه",
                  "required": false
              }
          ],
          "works": [
              {
                  "id": 1,
                  "name": "تخلیه زباله"
              },
              {
                  "id": 2,
                  "name": "تخلیه نخاله"
              }
          ],
          "Field": [
              {
                  "id": 1,
                  "name": "آدرس",
                  "key": "address",
                  "required": true
              },
              {
                  "id": 2,
                  "name": "توضیحات",
                  "key": "description",
                  "required": false
              }
          ]
      },
      {
          "pk": 2,
          "name": "بارگیری کامل",
          "type": "full",
          "exports": [
              {
                  "id": 2,
                  "name": "گزارش بارگیری",
                  "shema": "full_report"
              }
          ],
          "uploads": [
              {
                  "id": 2,
                  "name": "عکس بارگیری",
                  "description": "عکس از وضعیت بارگیری",
                  "required": false
              }
          ],
          "works": [
              {
                  "id": 3,
                  "name": "بارگیری زباله"
              },
              {
                  "id": 4,
                  "name": "بارگیری نخاله"
              }
          ],
          "Field": [
              {
                  "id": 3,
                  "name": "آدرس",
                  "key": "address",
                  "required": true
              },
              {
                  "id": 4,
                  "name": "نوع بار",
                  "key": "load_type",
                  "required": true
              }
          ]
      }
  ] };

const Action = createSlice({
  name: "Action",
  initialState,
  reducers: {
    Action_set: (state, action: PayloadAction<ActionType[]>) => ({
      ...state,
      data: action.payload,
    }),
    Action_clear: (state) => ({ ...state, data: [] }),
    Action_add: (state, action: PayloadAction<ActionType>) => ({
      ...state,
      data: [...state.data, action.payload],
    }),
    Action_update: (
      state,
      action: PayloadAction<{ data: ActionType; id: ActionType["pk"] }>
    ) => ({
      ...state,
      data: [
        action.payload.data,
        ...state.data.filter((d) => d.pk !== action.payload.id),
      ],
    }),
    Action_remove: (
      state,
      action: PayloadAction<{ id: ActionType["pk"] }>
    ) => ({
      ...state,
      data: state.data.filter((d) => d.pk !== action.payload.id),
    }),
  },
});
export default Action.reducer;
export const {
  Action_clear,
  Action_set,
  Action_add,
  Action_update,
  Action_remove,
} = Action.actions;
