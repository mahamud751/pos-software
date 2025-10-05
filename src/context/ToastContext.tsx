"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
import { ToastManager } from "@/components/Toast";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

type Action =
  | { type: "ADD_TOAST"; payload: Toast }
  | { type: "REMOVE_TOAST"; payload: string };

const toastReducer = (state: Toast[], action: Action): Toast[] => {
  switch (action.type) {
    case "ADD_TOAST":
      return [action.payload, ...state];
    case "REMOVE_TOAST":
      return state.filter((toast) => toast.id !== action.payload);
    default:
      return state;
  }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    dispatch({ type: "ADD_TOAST", payload: { id, message, type } });
  }, []);

  const removeToast = useCallback((id: string) => {
    dispatch({ type: "REMOVE_TOAST", payload: id });
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastManager toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
