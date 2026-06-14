"use client";

import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MONTHS } from "@/lib/economist";

type MonthPickerProps = {
  year: string;
  selectedMonth?: string;
};

const MonthPicker = ({ year, selectedMonth }: MonthPickerProps) => {
  const router = useRouter();

  return (
    <Select
      value={selectedMonth}
      onValueChange={(month) => router.push(`/economist/${year}/${month}`)}
    >
      <SelectTrigger className="w-[190px]" aria-label="Select month folder">
        <SelectValue placeholder="Select month" />
      </SelectTrigger>
      <SelectContent>
        {MONTHS.map((month) => (
          <SelectItem key={month} value={month}>
            {month}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default MonthPicker;
