"use client";

import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addRequest,
  removeRequest,
  markRequestSyncing,
  markRequestFailed,
  setSyncing,
  type QueuedRequest,
} from "@/store/slices/requestQueue";
import { fetcher } from "@/lib/axios";
import { useNetworkStatus } from "./useNetworkStatus";
import toast from "react-hot-toast";
import { Activity_set, Activity_set_base } from "@/store/slices/Activity";

const MAX_RETRY_COUNT = 3;
const RETRY_DELAY_MS = 1000; // Start with 1 second

const getRetryDelay = (retryCount: number): number => {
  // Exponential backoff: 1s, 2s, 4s
  return RETRY_DELAY_MS * Math.pow(2, retryCount);
};

export function useSyncQueue() {
  const dispatch = useAppDispatch();
  const { isOnline } = useNetworkStatus();
  const queue = useAppSelector((state) => state.requestQueue.queue);
  const isSyncing = useAppSelector((state) => state.requestQueue.isSyncing);

  const processRequest = useCallback(
    async (request: QueuedRequest): Promise<boolean> => {
      dispatch(markRequestSyncing({ id: request.id }));

      try {
        let response;
        switch (request.method) {
          case "POST":
            response = await fetcher.post(request.url, request.payload);
            break;
          case "PUT":
            response = await fetcher.put(request.url, request.payload);
            break;
          case "DELETE":
            response = await fetcher.delete(request.url);
            break;
          default:
            throw new Error(`Unsupported method: ${request.method}`);
        }

        // Check if request was successful (status < 400)
        if (response.status >= 200 && response.status < 400) {
          // If this is an activity request, update Activity state
          if (request.type === "activity" && request.url.includes("activity/")) {
            const serverData = response.data?.Weighing;
            if (serverData && Array.isArray(serverData)) {
              // Update Activity state with server response, marking as accepted
              dispatch(
                Activity_set(
                  serverData.map((a: any) => ({ ...a, server_accepted: true }))
                )
              );
              
              // Update last_tozin_id if provided
              if (response.data?.last_tozin_id !== undefined) {
                dispatch(Activity_set_base(response.data.last_tozin_id));
              }
            }
          }
          
          dispatch(removeRequest({ id: request.id }));
          return true;
        } else {
          // Server returned error, mark as failed
          dispatch(markRequestFailed({ id: request.id }));
          return false;
        }
      } catch (error: any) {
        // Network error or other exception
        dispatch(markRequestFailed({ id: request.id }));
        console.error(`Failed to sync request ${request.id}:`, error);
        return false;
      }
    },
    [dispatch]
  );

  const syncQueue = useCallback(async () => {
    if (!isOnline || queue.length === 0 || isSyncing) {
      return;
    }

    dispatch(setSyncing({ isSyncing: true }));

    // Process requests sequentially to avoid conflicts
    const pendingRequests = queue.filter(
      (req) => !req.syncing && req.retryCount < MAX_RETRY_COUNT
    );

    if (pendingRequests.length === 0) {
      dispatch(setSyncing({ isSyncing: false }));
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const request of pendingRequests) {
      const success = await processRequest(request);
      if (success) {
        successCount++;
      } else {
        failCount++;
        // If retry count exceeded, remove from queue
        if (request.retryCount >= MAX_RETRY_COUNT - 1) {
          dispatch(removeRequest({ id: request.id }));
          toast.error(
            `درخواست ${request.type === "activity" ? "فعالیت" : "گزارش"} با خطا مواجه شد و حذف شد`
          );
        } else {
          // Wait before retrying (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, getRetryDelay(request.retryCount))
          );
        }
      }
    }

    dispatch(setSyncing({ isSyncing: false }));

    if (successCount > 0) {
      toast.success(`${successCount} درخواست با موفقیت ارسال شد`);
    }
  }, [isOnline, queue, isSyncing, dispatch, processRequest]);

  // Auto-sync when network comes online
  useEffect(() => {
    if (isOnline && queue.length > 0 && !isSyncing) {
      // Small delay to ensure network is stable
      const timeoutId = setTimeout(() => {
        syncQueue();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [isOnline, queue.length, isSyncing, syncQueue]);

  return {
    syncQueue,
    queueLength: queue.length,
    isSyncing,
    pendingRequests: queue.filter(
      (req) => !req.syncing && req.retryCount < MAX_RETRY_COUNT
    ).length,
  };
}

