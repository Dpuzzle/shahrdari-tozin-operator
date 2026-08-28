"use client";

import ActivityTable from "@/components/Activity/ActivityTable";
import StatusToggle from "@/components/User/StatusToggle";
import { useActivity } from "@/hooks/useActivity";
import { useEffect } from "react";
import usePlaque from "@/hooks/usePlaque";
import { useNetworkStatus } from "@/hooks/common/useNetworkStatus";
import { useAuth } from "@/hooks/common/useAuth";
import OperationSection from "@/app/Dashboard/(sections)/operation";

export default function () {
  const { logout } = useAuth();
  const { isOnline } = useNetworkStatus();
  const { flushPendingCars, syncCarRequestsFromServer } = usePlaque();
  const {
    Activity_data,
    get_Activity_list_list_d2bfc9,
    sendDataServer: sendActivityData,
    syncActivityFromServer,
  } = useActivity("normal");

  useEffect(() => {
    get_Activity_list_list_d2bfc9();
    syncActivityFromServer();
    syncCarRequestsFromServer();
  }, []);

  useEffect(() => {
    if (isOnline) {
      sendActivityData();
      flushPendingCars();
    }
  }, [isOnline]);

  const hasActivities = Activity_data.length > 0;

  return (
    <main className="bg-gray-50 min-h-screen" dir="rtl">
      <div className="bg-gray-800 text-white py-4 border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="ml-3">
              <img src="/logowhite.png" alt="Logo" className="w-20 h-20" />
            </div>
            <div>
              <h1 className="text-2xl font-serif">
                سیستم مدیریت باسکول شهرداری
              </h1>
              <p className="text-sm opacity-80">داشبورد اپراتور</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-gray-700 px-4 py-2 rounded-lg">
              <StatusToggle />
            </div>
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg border border-red-700 font-medium transition-colors"
              onClick={logout}
            >
              خروج
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 h-full flex flex-col">
        <div className="flex flex-row w-full gap-6 h-full">
          <div className="bg-white border border-gray-200 rounded flex-1">
            <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">
                گزارش فعالیت‌های کاربر
              </h2>
            </div>
            <div className="p-4">
              {hasActivities ? (
                <div className="max-h-[500px] overflow-y-auto">
                  <ActivityTable data={Activity_data} />
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded p-6 text-center">
                  <p className="text-gray-600">
                    هیچ فعالیتی برای این کاربر ثبت نشده است
                  </p>
                </div>
              )}
            </div>
          </div>
          <OperationSection />
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>سیستم مدیریت شهرداری نسخه ۱.۰ • تمامی حقوق محفوظ است</p>
          <p className="mt-1">فقط برای استفاده رسمی</p>
        </div>
      </div>
    </main>
  );
}
