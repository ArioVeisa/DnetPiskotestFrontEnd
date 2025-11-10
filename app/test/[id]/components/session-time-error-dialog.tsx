"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

interface SessionTimeErrorDialogProps {
  open: boolean;
  startDate?: string;
  endDate?: string;
  onClose: () => void;
}

export function SessionTimeErrorDialog({
  open,
  startDate,
  endDate,
  onClose,
}: SessionTimeErrorDialogProps) {
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return format(date, "PPpp"); // e.g., "Nov 10, 2025 at 5:00 PM"
    } catch {
      return dateString;
    }
  };

  const isBeforeStart = startDate
    ? new Date() < new Date(startDate)
    : false;
  const isAfterEnd = endDate ? new Date() > new Date(endDate) : false;

  let title = "Test Session Not Available";
  let description = "The test session is not available at this time.";

  if (isBeforeStart) {
    title = "Test Has Not Started";
    description = `The test session has not started yet. The test will be available starting from ${formatDateTime(startDate)}.`;
  } else if (isAfterEnd) {
    title = "Test Session Has Ended";
    description = `The test session has ended. The test was available until ${formatDateTime(endDate)}.`;
  } else if (startDate && endDate) {
    description = `The test is only available between ${formatDateTime(startDate)} and ${formatDateTime(endDate)}.`;
  }

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="pt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


