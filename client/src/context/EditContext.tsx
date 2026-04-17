import React, { createContext, useContext, useState, useCallback } from "react";
import { toast } from "sonner";

interface EditContextType {
  isEditing: boolean;
  toggleEditing: () => void;
  getValue: (key: string, defaultValue: string) => string;
  setValue: (key: string, value: string) => void;
  handleSave: () => void;
  handleDownload: () => void;
  handleUpload: (file: File) => void;
}

const EditContext = createContext<EditContextType | null>(null);

const STORAGE_KEY = "one-dsd-editable-content";

function loadStored(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function EditProvider({ children }: { children: React.ReactNode }) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState<Record<string, string>>(loadStored);

  const toggleEditing = useCallback(() => {
    setIsEditing(prev => !prev);
  }, []);

  const getValue = useCallback((key: string, defaultValue: string) => {
    return content[key] ?? defaultValue;
  }, [content]);

  const setValue = useCallback((key: string, value: string) => {
    setContent(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
      setIsEditing(false);
      toast.success("Changes saved successfully");
    } catch {
      toast.error("Failed to save changes");
    }
  }, [content]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `one-dsd-content-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Content downloaded");
  }, [content]);

  const handleUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (typeof parsed === "object" && parsed !== null) {
          setContent(prev => {
            const merged = { ...prev, ...parsed };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            return merged;
          });
          toast.success("Content uploaded and applied");
        } else {
          toast.error("Invalid file format — expected JSON object");
        }
      } catch {
        toast.error("Failed to parse uploaded file");
      }
    };
    reader.readAsText(file);
  }, []);

  return (
    <EditContext.Provider value={{ isEditing, toggleEditing, getValue, setValue, handleSave, handleDownload, handleUpload }}>
      {children}
    </EditContext.Provider>
  );
}

export function useEditContext() {
  const ctx = useContext(EditContext);
  if (!ctx) throw new Error("useEditContext must be used within EditProvider");
  return ctx;
}
