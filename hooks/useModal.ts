import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  ModalStep,
  openModal as openModalDispatch,
  updateModal as updateModalDispatch,
  closeModal as closeModalRedux,
  ModalDataProps,
} from "@/store/core/modals";
import { ActivityType } from "@/store/slices/Activity";
import { useActivity } from "./useActivity";
import { useEffect } from "react";
import { useAction } from "./useAction";
import { useMid } from "./useMid";

export const useModals = () => {
  const modalData = useAppSelector((store) => store.modals.modals);
  const activityState = useAppSelector((store) => store.Activity);
  const selectedCar = modalData?.car;
  const actionType = modalData?.actionType;
  const fullWeghting = modalData?.fullWeghting;
  const empltyWeghting = modalData?.empltyWeghting;
  const selectedWork = modalData?.selectedWork;
  const step = modalData?.step;
  const selectedActivity = modalData?.activity;
  const { baskolData } = useMid();

  const dispatch = useAppDispatch();
  const { setActivity, Activity_data, sendDataServer } = useActivity("silent");
  const { Action_list } = useAction();

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  useEffect(() => {
    sendDataServer();
  }, [open, modalData]);

  const datetimeString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

  const closeModal = () => {
    if (!selectedCar) {
      dispatch(closeModalRedux());
      return;
    }

    console.log(modalData);
    // Generate a small integer tozin_id based on existing activity count
    const existingIds = new Set(
      (Activity_data || [])
        .map((a) => a.tozin_id)
        .filter((n): n is number => typeof n === "number"),
    );
    let nextTozinId: number =
      (activityState && typeof activityState.last_tozin_id === "number"
        ? activityState.last_tozin_id
        : 0) + 1;
    while (existingIds.has(nextTozinId)) {
      nextTozinId++;
    }
    const activityData = {
      ...selectedActivity,
      tozin_id: selectedActivity?.tozin_id ?? nextTozinId,
      address: modalData?.address || "ثبت نشده",
      Field_Data: modalData.Field_Data,
      Empty_baskol_number: baskolData?.baskol_number,
      Empty_baskol_date: datetimeString,
      Full_baskol_number: baskolData?.baskol_number,
      Full_baskol_date: datetimeString,
      Car: selectedCar,
      Empty: empltyWeghting || null,
      Full: fullWeghting || null,
      server_accepted: false,
      work_type: selectedWork as any,
      work_type_id: selectedWork?.id || -1,
      Action: actionType as any,
      mabda: modalData?.mabda || null,
    };

    console.log("setActivityData", activityData);
    setActivity(activityData);

    dispatch(closeModalRedux());
  };

  const openModal = (props: ModalDataProps) => {
    dispatch(openModalDispatch(props));
  };

  const updateCurrentData = (props: Partial<ModalDataProps>) => {
    const id = modalData?.id || Activity_data.length + 1;

    if (step === undefined || !actionType) return;
    const newData = {
      ...modalData,
      id,
      step,
      actionType,
      ...props,
    };

    console.log("update new props -> ", props);
    dispatch(updateModalDispatch(newData));
  };

  const openFromActivity = (activity: ActivityType) => {
    const act_action = Action_list.find((a) => a.pk === activity.Action.pk);
    if (!act_action) return;

    console.log("------------", activity);

    let perviousData: ModalDataProps = {
      id: activity.tozin_id ?? 0,
      step: ModalStep.PLAQUE,
      actionType: act_action,
      activity,
    };

    if (!activity.Car || !activity.work_type === undefined) {
      openModal(perviousData);
      return;
    }

    perviousData.car = activity.Car;
    perviousData.selectedWork = activity.work_type;
    perviousData.mabda = activity.mabda;

    perviousData.fullWeghting = activity.Full || undefined;
    perviousData.empltyWeghting = activity.Empty || undefined;

    switch ([!!activity.Full, !!activity.Empty, act_action.type].join("|")) {
      case "true|false|full":
      case "false|false|empty":
        perviousData.step = ModalStep.WEIGHTING_EMPTY;
        openModal(perviousData);
        return;
      case "false|true|empty":
      case "false|false|full":
      case "false|true|full":
        perviousData.step = ModalStep.WEIGHTING_FULL;
        openModal(perviousData);
        return;
    }

    perviousData.address = activity.address;
    perviousData.step = ModalStep.CONFIRM;
    openModal(perviousData);
  };

  const goNext = (current: ModalStep, data: Partial<ModalDataProps> = {}) => {
    if (step === undefined || !actionType) return;

    switch (current) {
      case ModalStep.PLAQUE:
        if (actionType?.type === "empty") {
          updateCurrentData({ step: ModalStep.WEIGHTING_EMPTY, ...data });
        } else {
          updateCurrentData({ step: ModalStep.WEIGHTING_FULL, ...data });
        }
        return;
      case ModalStep.WEIGHTING_EMPTY:
        if (actionType?.type === "empty") {
          updateCurrentData({ step: ModalStep.WEIGHTING_FULL, ...data });
        } else {
          updateCurrentData({ step: ModalStep.CONFIRM, ...data });
        }
        return;
      case ModalStep.WEIGHTING_FULL:
        if (actionType?.type === "empty") {
          updateCurrentData({ step: ModalStep.CONFIRM, ...data });
        } else {
          updateCurrentData({ step: ModalStep.WEIGHTING_EMPTY, ...data });
        }
        return;
      case ModalStep.CONFIRM:
        closeModal();
        return;
    }
  };

  const goPervious = (current: ModalStep) => {
    if (step === undefined || !actionType) return;
    switch (current) {
      case ModalStep.PLAQUE:
        return;
      case ModalStep.WEIGHTING_EMPTY:
        if (actionType?.type === "empty") {
          updateCurrentData({ step: ModalStep.PLAQUE });
        } else {
          updateCurrentData({ step: ModalStep.WEIGHTING_FULL });
        }
        return;
      case ModalStep.WEIGHTING_FULL:
        if (actionType?.type === "empty") {
          updateCurrentData({ step: ModalStep.WEIGHTING_EMPTY });
        } else {
          updateCurrentData({ step: ModalStep.PLAQUE });
        }
        return;
      case ModalStep.CONFIRM:
        if (actionType?.type === "empty") {
          updateCurrentData({ step: ModalStep.WEIGHTING_FULL });
        } else {
          updateCurrentData({ step: ModalStep.WEIGHTING_EMPTY });
        }
        return;
    }
  };

  return {
    selectedCar,
    selectedActivity,
    step,
    isOpen: !!modalData,
    closeModal,
    goNext,
    goPervious,
    actionType,
    updateCurrentData,
    fullWeghting,
    empltyWeghting,
    selectedWork,
    openFromActivity,
    openModal,
    modalData,
  };
};
