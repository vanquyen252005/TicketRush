import { Seat, SeatStatus } from "../types";
import { motion } from "motion/react";
import { X } from "lucide-react";

interface SeatComponentProps {
  seat: Seat;
  onClick?: (seat: Seat) => void;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-6 h-6 text-[8px]",
  md: "w-8 h-8 text-[10px]",
  lg: "w-10 h-10 text-xs",
};

const statusStyles: Record<SeatStatus, string> = {
  available: "bg-white border-2 border-blue-400 hover:bg-blue-50 cursor-pointer",
  selected: "bg-yellow-400 border-2 border-yellow-600 cursor-pointer",
  locked: "bg-red-500 border-2 border-red-700 cursor-not-allowed",
  sold: "bg-gray-400 border-2 border-gray-600 cursor-not-allowed",
};

export function SeatComponent({ seat, onClick, size = "md" }: SeatComponentProps) {
  const handleClick = () => {
    if (seat.status === "available" || seat.status === "selected") {
      onClick?.(seat);
    }
  };

  return (
    <motion.div
      whileHover={
        seat.status === "available" || seat.status === "selected"
          ? { scale: 1.1 }
          : undefined
      }
      whileTap={
        seat.status === "available" || seat.status === "selected"
          ? { scale: 0.95 }
          : undefined
      }
      className={`
        ${sizeClasses[size]}
        ${statusStyles[seat.status]}
        rounded-md flex items-center justify-center
        transition-all duration-200 relative
      `}
      onClick={handleClick}
      title={`${seat.label} - ${seat.price.toLocaleString("vi-VN")}đ`}
    >
      {seat.status === "sold" && (
        <X className="w-3 h-3 text-white absolute" />
      )}
    </motion.div>
  );
}
