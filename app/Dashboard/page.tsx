"use client";

import { type ActionType } from "@/store/slices/Action";
import ActionItem from "@/components/Action/itemlist";
import ActivityTable from "@/components/Activity/ActivityTable";
import StatusPanel from "@/components/Car/StatusPanel";
import StatusToggle from "@/components/User/StatusToggle";
import { useAction } from "@/hooks/useAction";
import { useActivity } from "@/hooks/useActivity";
import { useEffect, useState } from "react";
import ActionModal from "./(modals)/main";
import { useCar } from "@/hooks/useCar";
import { useModals } from "@/hooks/useModal";
import ReportModal from "@/components/Car/ReportModal";
import usePlaque from "@/hooks/usePlaque";
import { ModalStep } from "@/store/core/modals";
import { useNetworkStatus } from "@/hooks/common/useNetworkStatus";

export default function () {
  const { isOnline } = useNetworkStatus();
  const { Action_list, get_Action_list_list_712daa } = useAction();
  const _ = usePlaque();
  const {
    Activity_data,
    get_Activity_list_list_d2bfc9,
    sendDataServer: sendActivityData,
  } = useActivity("normal");
  const { sendReport } = useCar("silent");
  const { openModal, isOpen } = useModals();
  const [messageModalOpen, setMessageModalOpen] = useState<
    null | "violation" | "vehicle"
  >(null);

  const [reportType, setReportType] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverNumber, setDriverNumber] = useState("");
  const [carPlaque, setCarPlaque] = useState("");
  const [carType, setCarType] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const openPlaqueFromButton = (actionType: ActionType) => {
    openModal({
      actionType,
      step: ModalStep.PLAQUE,
      id: Activity_data.length + 1,
    });
  };

  const handleStatusChange = (status: boolean) => {
    // StatusToggle now handles network status internally via useNetworkStatus hook
    // This callback is kept for compatibility but the status is managed by the hook
  };

  const handleOpenModal = (type: "violation" | "vehicle") => {
    setMessageModalOpen(type);
    setReportType(type === "violation" ? "violation" : "vehicle");
    setDriverName("");
    setDriverNumber("");
    setCarPlaque("");
    setCarType("");
    setCompanyName("");
    setDesc("");
    setSuccess(false);
  };

  const handleCloseModal = () => {
    setMessageModalOpen(null);
    setReportType("");
    setDriverName("");
    setDriverNumber("");
    setCarPlaque("");
    setCarType("");
    setCompanyName("");
    setDesc("");
    setSuccess(false);
  };

  const handleSendMessage = async () => {
    setLoading(true);
    const resp = await sendReport({
      report_type: reportType,
      driver_name: driverName,
      driver_number: driverNumber,
      car_plaque: carPlaque,
      car_type: carType,
      company_name: companyName,
      desc: desc,
    });
    // Accept both 201 (success) and 202 (queued) as success
    setSuccess(resp?.status === 201 || resp?.status === 202);
    setDriverName("");
    setDriverNumber("");
    setCarPlaque("");
    setCarType("");
    setCompanyName("");
    setDesc("");
    setLoading(false);
  };

  useEffect(() => {
    // Fetch actions data from Django when component mounts
    get_Action_list_list_712daa();

    // Load activity data from the local CSV log
    get_Activity_list_list_d2bfc9();
  }, []);

  useEffect(() => {
    if (isOnline && !isOpen) {
      sendActivityData();
    }
  }, [isOnline, isOpen]);

  const hasActions = (Action_list || []).length > 0;
  const hasActivities = Activity_data.length > 0;

  return (
    <>
      <main className="bg-gray-50 min-h-screen" dir="rtl">
        {/* Official Header Banner */}
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
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg border border-red-700 font-medium transition-colors"
                onClick={() => handleOpenModal("violation")}
              >
                گزارش تخلف
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg border border-blue-700 font-medium transition-colors"
                onClick={() => handleOpenModal("vehicle")}
              >
                درخواست ماشین جدید
              </button>
              <div className="bg-gray-700 px-4 py-2 rounded-lg">
                <StatusToggle onStatusChange={handleStatusChange} />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 h-full flex flex-col">
          {/* Main Content Grid Layout */}
          <div className="flex flex-row w-full gap-6 h-full">
            {/* Actions Section */}
            <div className="bg-white border border-gray-200 rounded w-96">
              <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-800">
                  اقدامات مجاز
                </h2>
              </div>

              {/* Car Status Panel */}
              <div className="border-b border-gray-200">
                <StatusPanel />
              </div>

              <div className="p-4">
                {hasActions ? (
                  <div className="flex flex-col gap-2 w-full">
                    {Action_list.map((d, i) => (
                      <button
                        onClick={() => openPlaqueFromButton(d)}
                        key={i}
                        className="bg-white hover:bg-gray-50 transition-all duration-200 rounded-lg border border-gray-200 py-2 px-3 text-right shadow-sm hover:shadow flex items-center justify-between group"
                      >
                        <div className="flex-grow">
                          <ActionItem data={d} />
                        </div>
                        <div className="text-gray-400 group-hover:text-gray-600 transition-colors mr-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded p-6 text-center">
                    <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
                      <svg
                        className="w-8 h-8 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      هیچ اقدام مجازی در دسترس نیست
                    </p>
                    <p className="text-gray-600 mb-4">
                      شما هیچ اقدام مجازی در این زمان ندارید. لطفا با مدیر سیستم
                      تماس بگیرید.
                    </p>
                    <button
                      disabled
                      className="bg-gray-700 hover:bg-gray-800 text-white py-2 
                      px-4 rounded-lg border border-gray-800 font-medium transition-colors"
                    >
                      تماس با مدیر سیستم
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Activities Section */}
            <div className="bg-white border border-gray-200 rounded w-full">
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
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>سیستم مدیریت شهرداری نسخه ۱.۰ • تمامی حقوق محفوظ است</p>
            <p className="mt-1">فقط برای استفاده رسمی</p>
          </div>
        </div>
      </main>
      <ActionModal />
      {messageModalOpen && (
        <ReportModal
          messageModalOpen={messageModalOpen}
          reportType={reportType as typeof messageModalOpen}
          handleCloseModal={handleCloseModal}
          handleSendMessage={handleSendMessage}
          success={success}
          loading={loading}
          driverName={driverName}
          driverNumber={driverNumber}
          carPlaque={carPlaque}
          carType={carType}
          companyName={companyName}
          desc={desc}
          setDriverName={setDriverName}
          setDriverNumber={setDriverNumber}
          setCarPlaque={setCarPlaque}
          setCarType={setCarType}
          setCompanyName={setCompanyName}
          setReportType={setReportType}
          setDesc={setDesc}
        />
      )}
    </>
  );
}
