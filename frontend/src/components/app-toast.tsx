/* eslint-disable react-refresh/only-export-components -- module hosts Toaster + notify API together */
import type { ReactNode } from "react";
import { Toaster, toast as sonnerToast } from "sonner";

/**
 * Global toast host. Tweak Sonner options and styling here only — the rest of
 * the app should import {@link notify} from this file, not `sonner` directly.
 */
export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      expand={false}
      visibleToasts={4}
      offset="1rem"
      gap={10}
      toastOptions={{
        classNames: {
          toast:
            "font-sans border border-[--gray-6] bg-[--gray-2] text-[--gray-12] shadow-lg",
          title: "text-[--gray-12]",
          description: "text-[--gray-11]",
          error: "border-red-500/40",
          success: "border-emerald-500/40",
        },
      }}
    />
  );
}

type ToastContent = string | ReactNode;

/** App-wide toast API — wraps Sonner so design and defaults stay centralized. */
export const notify = {
  success(message: ToastContent, description?: string) {
    return sonnerToast.success(
      message,
      description ? { description } : undefined
    );
  },

  error(message: ToastContent, description?: string) {
    return sonnerToast.error(
      message,
      description ? { description } : undefined
    );
  },

  message(message: ToastContent, description?: string) {
    return sonnerToast.message(
      message,
      description ? { description } : undefined
    );
  },

  promise<T>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) {
    return sonnerToast.promise(promise, msgs);
  },
};
