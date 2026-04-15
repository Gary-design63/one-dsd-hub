import React, { useRef } from "react";
import { Paperclip } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useEditContext } from "@/context/EditContext";

interface PageToolbarProps {
  title: string;
}

export function PageToolbar({ title }: PageToolbarProps) {
  const { isEditing, toggleEditing, handleSave, handleDownload, handleUpload } = useEditContext();
  const uploadRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    handleDownload();
    toast.success(`${title} data exported`);
  };

  return (
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
      {isEditing ? (
        <>
          <Button size="sm" onClick={handleSave} className="text-xs h-7 bg-[#78BE21] hover:bg-[#5fa018] text-white">
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={toggleEditing} className="text-xs h-7">
            Cancel
          </Button>
        </>
      ) : (
        <Button size="sm" variant="outline" onClick={toggleEditing} className="text-xs h-7">
          Edit
        </Button>
      )}

      <Button
        size="sm"
        variant="outline"
        className="text-xs h-7 gap-1"
        onClick={() => uploadRef.current?.click()}
      >
        <Paperclip className="h-3 w-3" />
        Import
      </Button>
      <input
        ref={uploadRef}
        type="file"
        accept=".json,.csv,.txt,.pdf,.doc,.docx,audio/*,video/*,image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = "";
        }}
      />

      <Button size="sm" variant="outline" onClick={handleExport} className="text-xs h-7">
        Download
      </Button>
    </div>
  );
}
