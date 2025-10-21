"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Distribution } from "../services/test-distribution-service";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: Distribution | null;
  onSave: (id: number, data: Partial<Distribution>) => Promise<void>;
  saving?: boolean;
  error?: string | null;
};

export default function EditSessionDialog({
  open,
  onOpenChange,
  session,
  onSave,
  saving = false,
  error = null,
}: Props) {
  const [form, setForm] = useState({
    testName: "",
    startDate: "",
    endDate: "",
    status: "Draft" as "Draft" | "Scheduled" | "Ongoing" | "Completed",
  });

  // Populate form when session changes
  useEffect(() => {
    if (session) {
      setForm({
        testName: session.testName || "",
        startDate: session.startDate || "",
        endDate: session.endDate || "",
        status: session.status || "Draft",
      });
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    try {
      await onSave(session.id, {
        testName: form.testName,
        startDate: form.startDate,
        endDate: form.endDate,
        status: form.status,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating session:", error);
    }
  };

  const handleDateChange = (field: "startDate" | "endDate", date: Date | undefined) => {
    if (date) {
      setForm(prev => ({
        ...prev,
        [field]: format(date, "yyyy-MM-dd"),
      }));
    }
  };

  const isValid = form.testName.trim() !== "" && form.startDate !== "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Test Session</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Test Name */}
          <div className="space-y-2">
            <Label htmlFor="testName">Test Name</Label>
            <Input
              id="testName"
              value={form.testName}
              onChange={(e) => setForm(prev => ({ ...prev, testName: e.target.value }))}
              placeholder="Enter test name"
              required
            />
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.startDate ? format(new Date(form.startDate), "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.startDate ? new Date(form.startDate) : undefined}
                  onSelect={(date) => handleDateChange("startDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label>End Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.endDate ? format(new Date(form.endDate), "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.endDate ? new Date(form.endDate) : undefined}
                  onSelect={(date) => handleDateChange("endDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Draft">Draft</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
