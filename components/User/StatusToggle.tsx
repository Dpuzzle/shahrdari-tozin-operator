"use client";

import { useNetworkStatus } from "@/hooks/common/useNetworkStatus";

export default function StatusToggle() {
  const { isOnline, isManualOverride, actualNetworkStatus } =
    useNetworkStatus();

  const statusColor = isOnline ? "text-green-600" : "text-red-600";

  return (
    <div className="flex items-center gap-2" dir="ltr">
      <span className={`text-sm font-medium ${statusColor}`}>
        {isOnline ? "آنلاین" : "آفلاین"}
      </span>
      {isManualOverride && (
        <span className="text-xs text-yellow-600">(دستی)</span>
      )}
      {!isManualOverride && actualNetworkStatus !== isOnline && (
        <span className="text-xs text-blue-600">(خودکار)</span>
      )}
    </div>
  );
}
