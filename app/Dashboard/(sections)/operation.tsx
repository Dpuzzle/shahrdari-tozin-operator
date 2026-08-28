"use client";

import { type ActionType } from "@/store/slices/Action";
import ActionItem from "@/components/Action/itemlist";
import StatusPanel from "@/components/Car/StatusPanel";
import { useAction } from "@/hooks/useAction";
import { useModals } from "@/hooks/useModal";
import { ModalStep } from "@/store/core/modals";
import { useActivity } from "@/hooks/useActivity";

export default function OperationSection() {
  const { Action_list } = useAction();
  const { openModal } = useModals();
  const { Activity_data } = useActivity("silent");

  const openPlaqueFromButton = (actionType: ActionType) => {
    console.log(actionType);
    openModal({
      actionType,
      step: ModalStep.PLAQUE,
      id: Activity_data.length + 1,
    });
  };

  const hasActions = Action_list.length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded w-96 shadow-sm">
      <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-800">اقدامات مجاز</h2>
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
              شما هیچ اقدام مجازی در این زمان ندارید. لطفا با مدیر سیستم تماس
              بگیرید.
            </p>
            <button
              disabled
              className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-lg border border-gray-800 font-medium transition-colors cursor-not-allowed opacity-60"
            >
              تماس با مدیر سیستم
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
