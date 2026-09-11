import { type ActivityType } from "@/store/slices/Activity";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useModals } from "@/hooks/useModal";
import { cn } from "@/lib/utils";

interface ActivityTableProps {
  data: ActivityType[];
}

export default function ActivityTable({ data }: ActivityTableProps) {
  const { openFromActivity } = useModals();

  const getOperationState = (d: ActivityType) => {
    if (d.Full && d.Empty) {
      return {
        label: "تکمیل شده",
        status: "completed",
        class: "bg-green-100 text-green-800",
      };
    } else if (d.Full && !d.Empty) {
      return {
        label: "ثبت وزن خالی",
        status: "pending",
        class: "bg-blue-100 text-blue-800",
      };
    } else if (!d.Full && d.Empty) {
      return {
        label: "ثبت وزن پر",
        status: "in-progress",
        class: "bg-amber-100 text-amber-800",
      };
    } else {
      return {
        label: "انتخاب عملیات",
        status: "idle",
        class: "bg-gray-100 text-gray-800",
      };
    }
  };

  return (
    <div className="w-full overflow-auto rounded-lg border border-gray-100 shadow-sm">
      <Table dir="rtl" className="min-w-full divide-y divide-gray-200">
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
              شناسه
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
              وضعیت
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
              خودرو
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
              نوع عملیات
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
              وزن خالی
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
              وزن پر
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
              وزن خالص
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
              زمان
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
              عملیات
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <TableRow className="hover:bg-gray-50 transition-colors">
              {/* ID Column */}

              <TableCell className="px-4 py-3 text-sm font-mono text-gray-500">
                {item.tozin_id}
              </TableCell>

              {/* Status Column */}
              <TableCell className="px-4 py-3 text-sm">
                <span
                  className={cn(
                    "inline-flex px-2 py-1 text-xs font-semibold rounded-full ",
                    getOperationState(item).class,
                  )}
                >
                  {getOperationState(item).label}
                </span>
              </TableCell>

              {/* Vehicle Column */}
              <TableCell className="px-4 py-3 text-sm font-medium text-gray-900">
                {item?.Car?.license_plate || "-"}
              </TableCell>

              {/* Action Type Column */}
              <TableCell className="px-4 py-3 text-sm font-medium text-gray-900">
                {item?.Action.name || "-"}
              </TableCell>

              {/* Empty Weight Column */}
              <TableCell className="px-4 py-3 text-sm text-right text-gray-700">
                {item?.Empty || "-"}
              </TableCell>

              {/* Full Weight Column */}
              <TableCell className="px-4 py-3 text-sm text-right text-gray-700">
                {item.Full || "-"}
              </TableCell>
              <TableCell className="px-4 py-3 text-sm text-right text-gray-700">
                {item.Full && item.Empty ? item.Full - item.Empty : "-"}
              </TableCell>

              {/* Time Column */}
              <TableCell className="px-4 py-3 text-sm text-gray-500">
                اخیراً
              </TableCell>

              {/* Actions Column */}
              <TableCell className="px-4 py-3 text-sm text-right">
                <button
                  onClick={() => openFromActivity(item)}
                  className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  {getOperationState(item).status === "completed"
                    ? "نمایش جزئیات"
                    : "ادامه عملیات"}
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
