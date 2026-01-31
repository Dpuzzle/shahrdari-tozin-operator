import { useConfirm } from "@/hooks/common/useConfirm";
import {
  Activity_add,
  Activity_set,
  Activity_update,
  Activity_set_base,
  type ActivityType,
} from "@/store/slices/Activity";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetcher, createQueuableRequest } from "@/lib/axios";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNetworkStatus } from "@/hooks/common/useNetworkStatus";
import { addRequest } from "@/store/slices/requestQueue";

export function useActivity(mode: undefined | "silent" | "normal" = "normal") {
  const { openConfirmModal } = useConfirm();
  const Activity_data = useAppSelector((store) => store.Activity).data;
  const dispatch = useAppDispatch();
  const { isOnline } = useNetworkStatus();

  const get_activity_list = async (confirm: boolean = false) => {
    // check for confirm when this function is opened
    if (confirm) {
      const isConfirmed = await openConfirmModal();
      if (!isConfirmed) {
        return false;
      }
    }

    // Don't fetch if offline (GET requests don't need queueing)
    if (!isOnline) {
      toast.error("در حالت آفلاین نمی‌توان اطلاعات را دریافت کرد");
      return false;
    }

    try {
      const response = await fetcher.get("activity/");

      if (response.status >= 200 && response.status < 300) {
        const serverData = response.data.Weighing;
        const lastBase: number = response.data.last_tozin_id ?? 0;

        // set response of server on state
        dispatch(
          Activity_set(
            serverData.map((a: any) => ({ ...a, server_accepted: true }))
          )
        );
        dispatch(Activity_set_base(lastBase));
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

    // If offline, queue the request
    if (!isOnline) {
      const queueRequest = createQueuableRequest("activity/", "POST", data);
      dispatch(addRequest(queueRequest));
      toast.info("درخواست در صف قرار گرفت و پس از اتصال به اینترنت ارسال می‌شود");
      return;
    }

    // If online, send immediately
    try {
    const response = await fetcher.post("activity/", data);

    const serverData = response.data.Weighing;

    if (serverData)
      dispatch(
        Activity_set(
          serverData.map((a: any) => ({ ...a, server_accepted: true }))
        )
      );
    } catch (error) {
      // If request fails due to network error, queue it
      console.error("Error sending activity data:", error);
      const queueRequest = createQueuableRequest("activity/", "POST", data);
      dispatch(addRequest(queueRequest));
      toast.info("خطا در ارسال. درخواست در صف قرار گرفت");
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
  };
}
