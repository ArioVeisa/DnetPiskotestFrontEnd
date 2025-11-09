"use client";

import { useState, useEffect } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SessionDateProps = {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  disabled?: boolean;
};

function SessionDate({ label, value, onChange, disabled }: SessionDateProps) {
  const [dateValue, setDateValue] = useState<string>("");
  const [timeValue, setTimeValue] = useState<string>("");

  // Initialize date and time values from Date object
  useEffect(() => {
    if (value) {
      // Format date as YYYY-MM-DD for date input
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, "0");
      const day = String(value.getDate()).padStart(2, "0");
      setDateValue(`${year}-${month}-${day}`);
      
      // Format time as HH:MM for time input
      const hours = String(value.getHours()).padStart(2, "0");
      const minutes = String(value.getMinutes()).padStart(2, "0");
      setTimeValue(`${hours}:${minutes}`);
    } else {
      setDateValue("");
      setTimeValue("");
    }
  }, [value]);

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDateValue = e.target.value;
    setDateValue(newDateValue);
    
    if (newDateValue && timeValue) {
      // Combine date and time
      const date = new Date(`${newDateValue}T${timeValue}`);
      onChange(date);
    } else if (newDateValue) {
      // If only date is set, use current time
      const now = new Date();
      const date = new Date(`${newDateValue}T${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`);
      onChange(date);
    } else {
      onChange(null);
    }
  };

  // Handle time change
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTimeValue = e.target.value;
    setTimeValue(newTimeValue);
    
    if (dateValue && newTimeValue) {
      // Combine date and time
      const date = new Date(`${dateValue}T${newTimeValue}`);
      onChange(date);
    } else if (newTimeValue && value) {
      // If only time is set, use existing date
      const newDate = new Date(value);
      const [hours, minutes] = newTimeValue.split(":");
      newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      onChange(newDate);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <Label className="px-1">{label}</Label>
      
      {/* Date and Time inputs side by side - date longer than time */}
      <div className="flex gap-2 items-center">
        {/* Date input - has built-in calendar picker - longer width */}
        <Input
          type="date"
          value={dateValue}
          onChange={handleDateChange}
          disabled={disabled}
          className="flex-[2]"
        />
        {/* Time input - has built-in time picker - shorter width */}
        <Input
          type="time"
          value={timeValue}
          onChange={handleTimeChange}
          disabled={disabled}
          className="flex-1"
          step="60"
        />
      </div>
    </div>
  );
}

export default SessionDate;
