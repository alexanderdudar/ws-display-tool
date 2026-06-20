"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";

interface Props {
  onUpload: (csv: string) => void;
}

export function UploadScreen({ onUpload }: Props) {
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) onUpload(text);
      };
      reader.readAsText(file);
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith(".csv")) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f5f5f7] dark:bg-black p-8">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`
          w-full max-w-lg p-16 rounded-[18px] text-center
          bg-white/80 dark:bg-white/5
          backdrop-blur-xl
          border border-black/5 dark:border-white/10
          shadow-[0_4px_24px_rgba(0,0,0,0.06)]
          transition-all duration-300
          ${dragging ? "scale-[1.02] border-[#0071e3] shadow-[0_8px_40px_rgba(0,113,227,0.15)]" : ""}
        `}
      >
        <div className="mx-auto w-16 h-16 rounded-full bg-[#0071e3]/10 flex items-center justify-center mb-6">
          <Upload className="w-7 h-7 text-[#0071e3]" />
        </div>
        <h1 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
          Upload Holdings Report
        </h1>
        <p className="text-[#86868b] mb-8 text-[15px]">
          Drop your Wealthsimple CSV here, or click to browse
        </p>
        <label className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0071e3] text-white font-medium text-[15px] cursor-pointer hover:brightness-110 hover:scale-[1.02] transition-all duration-200">
          <span>Choose File</span>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
      </div>
    </div>
  );
}
