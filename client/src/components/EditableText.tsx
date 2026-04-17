import React from "react";
import { useEditContext } from "@/context/EditContext";
import { cn } from "@/lib/utils";

interface EditableTextProps {
  id: string;
  defaultValue: string;
  multiline?: boolean;
  className?: string;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div";
}

export function EditableText({ id, defaultValue, multiline = false, className, as: Tag = "span" }: EditableTextProps) {
  const { isEditing, getValue, setValue } = useEditContext();
  const value = getValue(id, defaultValue);

  if (!isEditing) {
    return <Tag className={className}>{value}</Tag>;
  }

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={e => setValue(id, e.target.value)}
        className={cn(
          "w-full bg-white border border-[#78BE21] rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#78BE21]/50 resize-y min-h-[60px]",
          className
        )}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={e => setValue(id, e.target.value)}
      className={cn(
        "bg-white border border-[#78BE21] rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-[#78BE21]/50 w-full",
        className
      )}
    />
  );
}
