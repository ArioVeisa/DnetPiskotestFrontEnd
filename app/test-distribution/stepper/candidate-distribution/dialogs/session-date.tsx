"use client";

import { useState, useEffect } from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type SessionDateProps = {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  disabled?: boolean;
};

function SessionDate({ label, value, onChange, disabled }: SessionDateProps) {
  const [open, setOpen] = useState(false);
  const [localDate, setLocalDate] = useState<Date | undefined>(value || undefined);

  useEffect(() => {
    setLocalDate(value || undefined);
  }, [value]);

  return (
    <div className="flex gap-4 w-full">
      <div className="flex flex-1 flex-col gap-3">
        <Label className="px-1">{label}</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between font-normal"
              disabled={disabled}
            >
              {localDate
                ? localDate.toLocaleDateString("en-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "Pick a date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={localDate}
              onSelect={(date) => {
                setLocalDate(date || undefined);
                if (date) {
                  const newDate = new Date(date);
                  if (value) {
                    // pertahankan jam & menit sebelumnya
                    newDate.setHours(value.getHours(), value.getMinutes(), 0, 0);
                  }
                  onChange(newDate);
                } else {
                  onChange(null);
                }
                setOpen(false);
              }}
              disabled={disabled}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-3">
        <Label className="invisible px-1">Time</Label>
        <Input
          type="time"
          step="60"
          value={value ? value.toISOString().substring(11, 16) : ""}
          disabled={disabled}
          onChange={(e) => {
            if (!value) return;
            const [h, m] = e.target.value.split(":").map(Number);
            const newDate = new Date(value);
            newDate.setHours(h);
            newDate.setMinutes(m);
            onChange(newDate);
          }}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  );
}

export default SessionDate;
