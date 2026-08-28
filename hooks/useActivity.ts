import { useConfirm } from "@/hooks/common/useConfirm";
import {
  Activity_add,
  Activity_set,
  Activity_update,
  Activity_set_base,
  type ActivityType,
} from "@/store/slices/Activity";
import { type CarType } from "@/store/slices/Car";
import { type ActionType } from "@/store/slices/Action";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { apiFetcher } from "@/lib/axios";
import { fetcher } from "@/lib/axios";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNetworkStatus } from "@/hooks/common/useNetworkStatus";
import { setSystemOnline } from "@/store/slices/system";

interface CsvActivityRow {
  tozin_id?: string;
  id?: string;
  vehicle_id?: string;
  vehicle_plate?: string;
  vehicle_driver?: string;
  weighing_type_id?: string;
  weighing_type_name?: string;
  work_type_id?: string;
  Empty?: string;
  Full?: string;
  address?: string;
  Field_Data?: string;
  sent_at?: string;
}

function mapCsvRowToActivity(row: CsvActivityRow): ActivityType {
  const vehicleId = Number(row.vehicle_id) || 0;
  const weighingTypeId = Number(row.weighing_type_id) || 0;
  const workTypeId = Number(row.work_type_id) || 0;
  const empty = row.Empty ? Number(row.Empty) : null;
  const full = row.Full ? Number(row.Full) : null;

  const car: CarType = {
    pk: vehicleId,
    driver: { id: 0, name: row.vehicle_driver ?? "", phone_number: "" },
    license_plate: row.vehicle_plate ?? "",
    license_plate_code: 0,
    type__name: "",
    last_empty_weight: 0,
    contractor__name: "",
  };

  const action: ActionType = {
    pk: weighingTypeId,
    name: row.weighing_type_name ?? "",
    type: "empty",
    exports: [],
    uploads: [],
    works: [],
    Field: [],
  };

  return {
    tozin_id: Number(row.tozin_id) || 0,
    Empty: empty,
    Full: full,
    Car: car,
    Action: action,
    work_type_id: workTypeId,
    work_type: { id: workTypeId, name: "" },
    address: row.address ?? "",
    server_accepted: true,
  };
}

export function useActivity(mode: undefined | "silent" | "normal" = "normal") {
  const { openConfirmModal } = useConfirm();
  const Activity_data = useAppSelector((store) => store.Activity).data;
  const dispatch = useAppDispatch();

  const get_activity_list = async (confirm: boolean = false) => {
    // check for confirm when this function is opened
    if (confirm) {
      const isConfirmed = await openConfirmModal();
      if (!isConfirmed) {
        return false;
      }
    }

    // Data is read from the local CSV log (no server fetch needed),
    // so it works online and offline.
    try {
      const response = await apiFetcher.get("/api/activity/logs");

      if (response.status >= 200 && response.status < 300) {
        const csvData: CsvActivityRow[] = response.data.data ?? [];

        // set CSV rows on state (no server fetch needed)
        dispatch(Activity_set(csvData.map((row) => mapCsvRowToActivity(row))));
        return true;
      }

      toast.error("خطا در دریافت اطلاعات");
      return false;
    } catch (error) {
      console.error("Error in activity data handling:", error);
      toast.error("خطا در دریافت اطلاعات");
      return false;
    }
  };

  const setActivity = async (data: ActivityType) => {
    dispatch(Activity_update({ data, pk: data.tozin_id }));
  };

  const sendDataServer = async () => {
    const data = Activity_data.filter((a) => !a.server_accepted).map((a) => ({
      ...a,
      id: a.tozin_id,
      address: a.address,
      vehicle_id: a.Car.pk,
      weighing_type_id: a.Action.pk,
      Full: a.Full,
      Empty: a.Empty,
      work_type_id: a.work_type_id,
    }));

    if (!data || data.length === 0) return;
    const last_tozin_id = Math.max(...data.map((a) => a.tozin_id || 0));
    dispatch(Activity_set_base(last_tozin_id));

    try {
      await apiFetcher.post("/api/activity", data);

      dispatch(
        Activity_set(data.map((a: any) => ({ ...a, server_accepted: true }))),
      );
    } catch (error) {
      console.error("Error sending activity data:", error);
      toast.error("خطا در ارسال اطلاعات");
    }
  };

  const syncActivityFromServer = async () => {
    try {
      const response = await fetcher.get("activity/");

      if (response.status >= 200 && response.status < 300) {
        const raw = response.data;
        let list: any[] = [];
        if (Array.isArray(raw)) {
          list = raw;
        } else if (raw && typeof raw === "object") {
          list = [raw];
        }

        dispatch(Activity_set(list as ActivityType[]));
      }
    } catch (error) {
      console.error("Error syncing activity from server:", error);
      dispatch(setSystemOnline(false));
      toast.error("خطا در دریافت اطلاعات از سرور");
    }
  };

  useEffect(() => {
    // Fetch data when hook is initialized
    if (mode !== "silent") {
      get_activity_list();
    }
  }, []);

  return {
    Activity_data,
    get_activity_list,
    get_Activity_list_list_d2bfc9: get_activity_list,
    setActivity,
    sendDataServer,
    syncActivityFromServer,
  };
}
