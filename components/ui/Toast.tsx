import { useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import {
  FiCheckCircle,
  FiInfo,
  FiAlertTriangle,
  FiXCircle,
} from "react-icons/fi";

type ToastType = "success" | "info" | "warning" | "error";

interface ToastProps {
  type: ToastType;
  title: string;
  message: string;
  onClose: () => void;
}

const iconMap = {
  success: <FiCheckCircle className="text-accent text-xl shrink-0" />,
  info: <FiInfo className="text-blue-600 text-xl shrink-0" />,
  warning: <FiAlertTriangle className="text-yellow-600 text-xl shrink-0" />,
  error: <FiXCircle className="text-red-600 text-xl shrink-0" />,
};

const bgMap = {
  success: "bg-accent/10 border-accent/40 shadow-soft",
  info: "bg-blue-50/90 border-blue-500 shadow-blue-200/80",
  warning: "bg-yellow-50/90 border-yellow-500 shadow-yellow-200/80",
  error: "bg-red-50/90 border-red-500 shadow-red-200/80",
};

export default function Toast({ type, title, message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 left-4 right-4 md:right-4 md:left-auto md:ml-auto z-[9999] border w-auto md:max-w-md flex items-start gap-3 md:gap-4 border-l-4 px-3 py-3 md:px-4 md:py-3 font-poppins rounded-lg shadow-md ${bgMap[type]}`}
    >
      {iconMap[type]}

      <div className="flex-1 min-w-0 mr-3">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-700 leading-snug break-words">
          {message}
        </p>
      </div>

      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-600 hover:text-black"
      >
        <IoMdClose className="text-lg ml-2" />
      </button>
    </div>
  );
}
