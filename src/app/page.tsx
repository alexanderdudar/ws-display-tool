"use client";

import { useState, useCallback } from "react";
import { useHoldings } from "@/lib/hooks";
import { UploadScreen } from "@/components/UploadScreen";
import { Dashboard } from "@/components/Dashboard";

export default function Home() {
  const { holdings, loaded, uploadCSV } = useHoldings();
  const [forceUpload, setForceUpload] = useState(false);

  const handleReupload = useCallback(() => {
    setForceUpload(true);
  }, []);

  const handleUpload = useCallback(
    (csv: string) => {
      uploadCSV(csv);
      setForceUpload(false);
    },
    [uploadCSV]
  );

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f7] dark:bg-black">
        <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (forceUpload || holdings.length === 0) {
    return <UploadScreen onUpload={handleUpload} />;
  }

  return <Dashboard holdings={holdings} onReupload={handleReupload} />;
}
