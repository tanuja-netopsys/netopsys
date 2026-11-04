import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

let listeners: ToastListener[] = [];
let toastMemory: ToastItem[] = [];

function notifyListeners() {
  listeners.forEach((listener) => listener([...toastMemory]));
}

function addToast(
  type: ToastType,
  message: string,
  options?: { title?: string; duration?: number }
) {
  const id = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  const duration = options?.duration ?? 4000;
  const newToast: ToastItem = {
    id,
    type,
    message,
    title: options?.title,
    duration,
  };

  toastMemory = [newToast, ...toastMemory.slice(0, 4)]; // keep max 5 visible toasts
  notifyListeners();

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  return id;
}

function removeToast(id: string) {
  toastMemory = toastMemory.filter((t) => t.id !== id);
  notifyListeners();
}

/**
 * Toast notification dispatcher compatible with toastify API
 */
export const toast = {
  success: (message: string, options?: { title?: string; duration?: number }) =>
    addToast("success", message, options),
  error: (message: string, options?: { title?: string; duration?: number }) =>
    addToast("error", message, options),
  info: (message: string, options?: { title?: string; duration?: number }) =>
    addToast("info", message, options),
  warning: (message: string, options?: { title?: string; duration?: number }) =>
    addToast("warning", message, options),
  dismiss: (id: string) => removeToast(id),
};

const TOAST_THEMES: Record<
  ToastType,
  {
    icon: typeof CheckCircle2;
    iconColor: string;
    borderColor: string;
    glowColor: string;
    barColor: string;
    defaultTitle: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    glowColor: "rgba(16, 185, 129, 0.15)",
    barColor: "bg-emerald-500",
    defaultTitle: "Success",
  },
  error: {
    icon: AlertCircle,
    iconColor: "text-rose-400",
    borderColor: "border-rose-500/30",
    glowColor: "rgba(244, 63, 94, 0.15)",
    barColor: "bg-rose-500",
    defaultTitle: "Error",
  },
  info: {
    icon: Info,
    iconColor: "text-sky-400",
    borderColor: "border-sky-500/30",
    glowColor: "rgba(56, 189, 248, 0.15)",
    barColor: "bg-sky-500",
    defaultTitle: "Information",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-amber-400",
    borderColor: "border-amber-500/30",
    glowColor: "rgba(245, 158, 11, 0.15)",
    barColor: "bg-amber-500",
    defaultTitle: "Notice",
  },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    listeners.push(setToasts);
    setToasts([...toastMemory]);
    return () => {
      listeners = listeners.filter((l) => l !== setToasts);
    };
  }, []);

  return (
    <aside
      aria-label="Notifications"
      className="fixed top-5 right-5 z-[999999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => {
          const theme = TOAST_THEMES[t.type];
          const Icon = theme.icon;
          const durationSec = (t.duration || 4000) / 1000;

          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              style={{
                boxShadow: `0 12px 36px rgba(0, 0, 0, 0.65), 0 0 24px ${theme.glowColor}`,
              }}
              className={`pointer-events-auto relative overflow-hidden rounded-2xl bg-[#0F0A1A]/95 backdrop-blur-xl border ${theme.borderColor} p-4 text-white shadow-2xl transition-all`}
            >
              <div className="flex items-start gap-3">
                <div className={`shrink-0 mt-0.5 ${theme.iconColor}`}>
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="flex-1 pr-2 min-w-0">
                  <h5 className="text-[13px] font-semibold text-white tracking-tight leading-snug">
                    {t.title || theme.defaultTitle}
                  </h5>
                  <p className="mt-0.5 text-xs text-[#B5B0C8] leading-relaxed break-words">
                    {t.message}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  aria-label="Close notification"
                  className="shrink-0 -mr-1 -mt-1 p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress bar timer */}
              {t.duration && t.duration > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white/[0.08]">
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: durationSec, ease: "linear" }}
                    className={`h-full ${theme.barColor}`}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </aside>
  );
}

