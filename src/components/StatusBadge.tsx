
import { OrderStatus } from "@/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return { color: "bg-yellow-100 text-yellow-800", label: "Pending" };
      case "confirmed":
        return { color: "bg-blue-100 text-blue-800", label: "Confirmed" };
      case "packed":
        return { color: "bg-indigo-100 text-indigo-800", label: "Packed" };
      case "dispatched":
        return { color: "bg-purple-100 text-purple-800", label: "Dispatched" };
      case "out-for-delivery":
        return { color: "bg-orange-100 text-orange-800", label: "Out for Delivery" };
      case "delivered":
        return { color: "bg-green-100 text-green-800", label: "Delivered" };
      case "cancelled":
        return { color: "bg-red-100 text-red-800", label: "Cancelled" };
      default:
        return { color: "bg-gray-100 text-gray-800", label: status };
    }
  };

  const { color, label } = getStatusConfig(status);

  return (
    <span className={cn("status-chip", color, className)}>
      {label}
    </span>
  );
};

export default StatusBadge;
