import * as toastr from 'toastr'
import { BehaviorSubject } from "rx";

// for global loader service
export const isLoading = new BehaviorSubject<boolean>(false);

export const isDialogOpen = new BehaviorSubject<any>({
  open: false,
  data: { message: "Are you Sure?", title: "" },
  cancelText: "Cancel",
  confirmText: "Okay",
  onConfirm: () => {},
});

export const forSuccess = (message: string) =>
  toastr.success(message, "Success");

export const forError = (message: string) => toastr.error(message, "Error");

export const forWarning = (message: string) =>
  toastr.warning(message, "Warning");
