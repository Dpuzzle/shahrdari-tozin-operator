"use client";

import { useNetworkStatus } from "@/hooks/common/useNetworkStatus";

interface StatusToggleProps {
  onStatusChange?: (status: boolean) => void;
}

export default function StatusToggle({
  onStatusChange,
}: StatusToggleProps) {
  const {
    isOnline,
    isManualOverride,
    actualNetworkStatus,
    toggleManualOverride,
  } = useNetworkStatus();

  const handleToggle = () => {
    toggleManualOverride();
    // Notify parent if callback provided
    if (onStatusChange) {
      // Get the new status after toggle
      const newStatus = isManualOverride
        ? actualNetworkStatus
        : !actualNetworkStatus;
      onStatusChange(newStatus);
    }
  };

  // Determine display color: green if online, gray if offline
  // If manual override is active, show a different indicator
  const statusColor = isOnline ? "text-green-600" : "text-gray-600";
  const buttonColor = isOnline
    ? "bg-green-600 focus:ring-green-500"
    : "bg-gray-200 focus:ring-gray-500";

  return (
    <div className="flex items-center gap-2" dir="ltr">
      <div className="flex flex-col items-end">
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
      <button
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonColor}`}
        title={
          isManualOverride
            ? "کلیک برای استفاده از وضعیت شبکه"
            : "کلیک برای تغییر دستی وضعیت"
        }
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isOnline ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
