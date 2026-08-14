import fetcher from "@/lib/axios";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Car_set, Car_add, CarType } from "@/store/slices/Car";
import { temp_selectCar } from "@/store/slices/temp";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNetworkStatus } from "@/hooks/common/useNetworkStatus";
import {
  requestQueue_add,
  requestQueue_remove,
  requestQueue_updateStatus,
} from "@/store/slices/requestQueue";
import { apiFetcher } from "@/lib/axios";

export default function usePlaque() {
  const cars = useAppSelector((state) => state.Car.data);
  const selectedCar = useAppSelector((state) => state.temp.selectedCar);
  const pendingRequests = useAppSelector((state) => state.requestQueue.items);
  const dispatch = useAppDispatch();
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    fetchCarData();
  }, []);

  const fetchCarData = async () => {
    const response = await fetcher.get("cars/");
    dispatch(Car_set(response.data));
  };

  const createCar = async (data: {
    license_plate: string;
    driver_name: string;
    vehicle_type_name: string;
    company_name?: string;
    phone_number: number;
  }): Promise<CarType | null> => {
    // If online, try to send directly to Django
    if (isOnline) {
      try {
        const response = await fetcher.post("car/create/", data);
        if (response.data?.car) {
          dispatch(Car_add(response.data.car as CarType));
          toast.success("خودرو با موفقیت ثبت شد");
          return response.data.car as CarType;
        }
        return null;
      } catch (error) {
        // fall through to offline queue
      }
    }

    // Offline or direct POST failed: queue locally
    const tempId = -Date.now();
    const tempCar: CarType = {
      pk: tempId,
      driver: { id: 0, name: data.driver_name, phone_number: "" },
      license_plate: data.license_plate,
      license_plate_code: 0,
      type__name: data.vehicle_type_name,
      last_empty_weight: 0,
      contractor__name: data.company_name || "بدون پیمانکار",
      mabda: [],
      from_operator: true,
    };

    dispatch(Car_add(tempCar));

    const requestId = `${tempId}`;
    dispatch(
      requestQueue_add({
        id: requestId,
        car: tempCar,
        payload: data,
        createdAt: new Date().toISOString(),
        status: "pending",
      }),
    );

    if (!isOnline) {
      toast.info("خودرو به صورت موقت ثبت شد و با برقراری ارتباط ارسال می‌شود");
    } else {
      toast.error("خطا در ثبت خودرو، در حال صادر کردن در صف...");
    }

    return tempCar;
  };

  const flushPendingCars = async (): Promise<boolean> => {
    const pending = pendingRequests.filter((r) => r.status === "pending");
    if (pending.length === 0) return false;

    try {
      const authorization =
        typeof window !== "undefined"
          ? document.cookie
              .split("; ")
              .find((c) => c.startsWith("accessToken="))
              ?.split("=")[1]
          : null;

      const response = await apiFetcher.post("/api/car-requests", pending, {
        headers: {
          "Content-Type": "application/json",
          ...(authorization
            ? { Authorization: `Bearer ${authorization}` }
            : {}),
        },
      });

      if (response.status >= 200 && response.status < 300) {
        // Mark all as sent in Redux
        for (const item of pending) {
          dispatch(requestQueue_remove(item.id));
        }
        toast.success(`${pending.length} خودرو با موفقیت ارسال شد`);
        // Refresh car list from server to get real IDs
        await fetchCarData();
        return true;
      }

      // Update failed statuses
      for (const item of pending) {
        dispatch(
          requestQueue_updateStatus({
            id: item.id,
            status: "failed",
            lastError: `Server responded with status ${response.status}`,
          }),
        );
      }
      return false;
    } catch (error: any) {
      for (const item of pending) {
        dispatch(
          requestQueue_updateStatus({
            id: item.id,
            status: "failed",
            lastError: error?.message ?? "Network error",
          }),
        );
      }
      return false;
    }
  };

  return {
    cars,
    selectedCar,
    createCar,
    fetchCarData,
    flushPendingCars,
    pendingRequests,
  };
}
