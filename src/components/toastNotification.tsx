"use client";
import { Toaster, toast } from "sonner";

export const showToast = {
  success: (msg: string) => toast.success(msg),
  error: (msg: string) => toast.error(msg),
};

export function ToastProvider() {
  return <Toaster position="bottom-right" richColors />;
}
