"use client";

import { useState, useEffect, useCallback } from "react";

export interface NetworkStatus {
  isOnline: boolean;
  isManualOverride: boolean;
  actualNetworkStatus: boolean;
}

export function useNetworkStatus() {
  const [actualNetworkStatus, setActualNetworkStatus] = useState<boolean>(
    // typeof window !== "undefined" ? navigator.onLine : true
    false
  );
  const [manualOverride, setManualOverride] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setActualNetworkStatus(true);
    };

    const handleOffline = () => {
      setActualNetworkStatus(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const setManualOverrideMode = useCallback((override: boolean | null) => {
    setManualOverride(override);
  }, []);

  const toggleManualOverride = useCallback(() => {
    setManualOverride((prev) => {
      if (prev === null) {
        // If no override, set to opposite of actual network status
        return !actualNetworkStatus;
      }
      // If override exists, clear it
      return null;
    });
  }, [actualNetworkStatus]);

  // Determine final online status: manual override takes precedence
  const isOnline =
    manualOverride !== null ? manualOverride : actualNetworkStatus;

  return {
    isOnline,
    isManualOverride: manualOverride !== null,
    actualNetworkStatus,
    setManualOverride: setManualOverrideMode,
    toggleManualOverride,
  };
}

