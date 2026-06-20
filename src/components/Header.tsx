"use client";

import { Eye, EyeOff, Upload, Sun, Moon } from "lucide-react";

interface Props {
  privacyHidden: boolean;
  onTogglePrivacy: () => void;
  onReupload: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Header({
  privacyHidden,
  onTogglePrivacy,
  onReupload,
  darkMode,
  onToggleDarkMode,
}: Props) {
  return (
    <header className="bg-white/80 dark:bg-black/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="w-[90%] max-w-[1800px] mx-auto flex items-center justify-between py-4 border-b border-black/5 dark:border-white/10">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
          WS Display
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-full hover:bg-[#f5f5f7] dark:hover:bg-white/10 transition-colors"
          title={darkMode ? "Light mode" : "Dark mode"}
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-[#86868b]" />
          ) : (
            <Moon className="w-5 h-5 text-[#86868b]" />
          )}
        </button>
        <button
          onClick={onTogglePrivacy}
          className="p-2 rounded-full hover:bg-[#f5f5f7] dark:hover:bg-white/10 transition-colors"
          title={privacyHidden ? "Show values" : "Hide values"}
        >
          {privacyHidden ? (
            <EyeOff className="w-5 h-5 text-[#86868b]" />
          ) : (
            <Eye className="w-5 h-5 text-[#86868b]" />
          )}
        </button>
        <button
          onClick={onReupload}
          className="p-2 rounded-full hover:bg-[#f5f5f7] dark:hover:bg-white/10 transition-colors"
          title="Upload new file"
        >
          <Upload className="w-5 h-5 text-[#86868b]" />
        </button>
      </div>
      </div>
    </header>
  );
}
