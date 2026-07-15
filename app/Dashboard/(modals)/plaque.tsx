"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useRef, useEffect } from "react";
import { Camera, Search, X } from "lucide-react";
import usePlaque from "@/hooks/usePlaque";
import type { CarType } from "@/store/slices/Car";
import Image from "next/image";
import { useModals } from "@/hooks/useModal";
import { ModalStep } from "@/store/core/modals";
import { useMid } from "@/hooks/useMid";

export interface ActionWorkType {
  id: number;
  name: string;
}

function PlaqueOTPInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otp, setOtp] = useState<string[]>(Array(8).fill(""));

  useEffect(() => {
    const newOtp = value.split("");
    setOtp(
      Array(8)
        .fill("")
        .map((_, index) => {
          if (newOtp.length > index) {
            return newOtp[index];
          }
          return "";
        }),
    );
  }, [value]);

  useEffect(() => {
    // Initialize input refs
    inputRefs.current = inputRefs.current.slice(0, 8);
  }, []);

  const handleInputChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Combine the OTP values and update parent
    const combinedValue = newOtp.join("");
    onChange(combinedValue);

    // Auto-focus next input
    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div
      className="flex gap-2 justify-center items-center z-50 pr-20 pl-10 h-full"
      dir="ltr"
    >
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e) => handleInputChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className={`text-center text-3xl font-bold w-5 outline-none  ${
            index === 6 ? " absolute right-10" : "bg-white/10"
          }
          ${index === 7 ? "absolute right-6" : "bg-white/10"}`}
        />
      ))}
    </div>
  );
}

export default function Plaque() {
  const { cars } = usePlaque();
  const [selectedPlaque, setSelectedPlaque] = useState("");
  const [filteredData, setFilteredData] = useState<CarType[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isWorkSelectionOpen, setIsWorkSelectionOpen] = useState(false);
  const { baskolData } = useMid();

  const { goNext, actionType, updateCurrentData, selectedActivity } =
    useModals();

  console.log("cars", cars);

  const works = actionType?.works || [];

  const [selectedCar, selectedCarHandler] = useState<CarType | undefined>(
    undefined,
  );

  console.log("filteredData", filteredData);

  const filterPlaques = (searchTerm: string) => {
    if (!searchTerm) return;
    const filterCars = cars.filter((car) =>
      car.license_plate.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredData(filterCars);
  };

  useEffect(() => {
    if (baskolData && baskolData.plaque_number)
      handlePlaqueChange(baskolData.plaque_number);
  }, [baskolData]);

  useEffect(() => {
    selectedCarHandler(selectedActivity?.Car);
    setFilteredData(cars);
  }, []);

  const handlePlaqueChange = (value: string) => {
    setSelectedPlaque(value);
    if (value.length > 0) {
      filterPlaques(value);
      setShowDropdown(true);
    } else {
      setFilteredData([]);
      setShowDropdown(false);
    }
  };

  const handlePlaqueSelect = (plaque: string, code: string) => {
    plaque = `${plaque}${code}`;
    setSelectedPlaque(plaque);
    setShowDropdown(false);
  };

  const handleSubmit = (car: CarType) => {
    selectedCarHandler(car);
    updateCurrentData({ car });
  };

  const handleNextStep = () => {
    if (works.length > 0) {
      setIsWorkSelectionOpen(true);
    } else {
      goNext(ModalStep.PLAQUE);
    }
  };

  const handleWorkSelection = (work: ActionWorkType) => {
    setIsWorkSelectionOpen(false);

    updateCurrentData({ selectedWork: work });

    goNext(ModalStep.PLAQUE);
  };

  return (
    <div className="p-6">
      <div className="flex flex-row gap-5">
        {/* Right Column - Results */}
        <div className="w-full">
          {selectedCar ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-4 py-3 bg-gray-50 border-b">
                <h2 className="text-sm font-semibold text-gray-900">
                  نتایج جستجو
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        ایران{selectedCar.license_plate_code}-
                        {`${selectedCar.license_plate.slice(3, 6)} 
                                   ${selectedCar.license_plate.slice(2, 3)} 
                                   ${selectedCar.license_plate.slice(0, 2)}`}
                      </p>
                      {selectedCar.driver && selectedCar.driver.name && (
                        <p className="text-sm text-gray-600">
                          راننده: {selectedCar.driver.name}
                        </p>
                      )}
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      ثبت شده
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">تاریخ بررسی:</span>
                      <p className="font-medium">
                        {new Date().toLocaleDateString("fa-IR")}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">نوع خودرو:</span>
                      <p className="font-medium">
                        {selectedCar.type__name || "نامشخص"}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div>
                      <span className="text-gray-500">پیمانکار:</span>
                      <p className="font-medium">
                        {selectedCar.contractor__name || "نامشخص"}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex gap-3">
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                        onClick={handleNextStep}
                      >
                        مرحله بعدی
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-8 text-center">
                <Search className="w-14 h-14 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 text-sm">
                  جهت مشاهده اطلاعات، شماره پلاک را وارد کنید
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Left Column - Camera and Search */}
        <div className="space-y-6 w-96">
          {/* Camera Section */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-gray-50 border-b">
              <h2 className="text-sm font-semibold text-gray-900">
                دوربین نظارت
              </h2>
            </div>
            <div className="p-4">
              <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
                {baskolData?.image_link ? (
                  <Dialog
                    open={isImageModalOpen}
                    onOpenChange={setIsImageModalOpen}
                  >
                    <DialogTrigger asChild>
                      <img
                        key={`camera-${Date.now()}`}
                        src={baskolData.image_link || "/placeholder.svg"}
                        className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        alt="تصویر دوربین نظارت"
                        onClick={() => setIsImageModalOpen(true)}
                      />
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
                      <div className="relative">
                        <img
                          key={`camera-${Date.now()}`}
                          src={baskolData.image_link || "/placeholder.svg"}
                          className="w-full h-auto max-h-[85vh] object-contain"
                          alt="تصویر دوربین نظارت - نمایش بزرگ"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                          onClick={() => setIsImageModalOpen(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <div className="text-center">
                    <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Camera className="w-7 h-7 text-gray-600" />
                    </div>
                    <p className="text-sm text-gray-500">در انتظار اتصال</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-4 py-3 bg-gray-50 border-b">
              <h2 className="text-sm font-semibold text-gray-900">فرم جستجو</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="w-80">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    شماره پلاک
                  </label>
                  <div className="relative">
                    <div className="flex flex-col gap-2 relative mb-10 h-20">
                      <Image
                        src="/plaque.png"
                        width={0}
                        height={0}
                        sizes="100vw"
                        className="w-full h-auto absolute"
                        alt="plaque"
                      />
                      <PlaqueOTPInput
                        value={selectedPlaque}
                        onChange={handlePlaqueChange}
                      />
                    </div>
                    {/* Dropdown */}
                    {showDropdown && cars.length > 0 && (
                      <div className="absolute top-full right-0 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto mt-1">
                        {filteredData.map((item) => (
                          <button
                            key={item.pk}
                            onClick={() => {
                              handlePlaqueSelect(
                                item.license_plate,
                                String(item.license_plate_code),
                              );
                              handleSubmit(item);
                            }}
                            className="w-full px-4 py-3 text-right hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-sm"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex flex-row">
                                <span className="font-medium text-gray-900">
                                  {item.license_plate_code}
                                </span>
                                <span className="font-medium text-gray-900">
                                  {`-${item.license_plate.slice(3, 6)} 
                                   ${item.license_plate.slice(2, 3)} 
                                   ${item.license_plate.slice(0, 2)}`}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {item.driver && item.driver.name
                                  ? item.driver.name
                                  : "مالک نامشخص"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {item.contractor__name
                                  ? item.contractor__name
                                  : "مالک نامشخص"}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Work Selection Dialog */}
      <Dialog open={isWorkSelectionOpen} onOpenChange={setIsWorkSelectionOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl shadow-xl p-0">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle className="text-right pr-4 text-lg font-bold text-gray-800">
              انتخاب نوع بار
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 max-h-96 overflow-y-auto p-4">
            {works.length > 0 ? (
              works.map((work: ActionWorkType) => (
                <Button
                  key={work.id}
                  variant="outline"
                  className="w-full justify-between text-right h-auto py-3 px-4 
                       rounded-xl border-gray-200 
                       hover:bg-blue-50 hover:border-blue-300 
                       transition-all duration-200"
                  onClick={() => handleWorkSelection(work)}
                >
                  <span className="font-medium text-gray-700">{work.name}</span>
                </Button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <svg
                  className="w-10 h-10 mb-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p>هیچ نوع باری موجود نیست</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 px-6 py-4 border-t">
            <Button
              variant="outline"
              className="rounded-xl hover:bg-gray-100 transition"
              onClick={() => setIsWorkSelectionOpen(false)}
            >
              انصراف
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
