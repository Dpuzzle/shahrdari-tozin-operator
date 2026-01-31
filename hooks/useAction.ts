import { useConfirm } from "@/hooks/common/useConfirm";
import { Action_set, type ActionType } from "@/store/slices/Action";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetcher } from "@/lib/axios";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNetworkStatus } from "./common/useNetworkStatus";

export function useAction() {
  const { openConfirmModal } = useConfirm();
  const {isOnline} = useNetworkStatus()
  const Action_list = useAppSelector((store) => store.Action).data;
  
  const dispatch = useAppDispatch();
  const get_Action_list_list_712daa = async (confirm: boolean = false) => {
    // check for confirm when this function is opened
    if (confirm) {
      const isConfirmed = await openConfirmModal();
      if (!isConfirmed) {
        return false;
      }
    }

    
    
    try {
      // get data and read from server
      const response = await fetcher.get("Action/712daa/");

      if (response.data.Action) {
        
        const serverData = response.data.Action;
        // set response of server on state

        dispatch(Action_set(serverData));
        return true;
      } else {
        toast.error("خطا در دریافت اطلاعات");
        return false;
      }
    } catch (error) {
      console.error("Error fetching action data:", error);
      toast.error("خطا در دریافت اطلاعات");
      return false;
    }
  };

  useEffect(() => {
    // Fetch data when hook is initialized
    if(isOnline)
    get_Action_list_list_712daa();
  }, []);

  return { Action_list, get_Action_list_list_712daa };
}
