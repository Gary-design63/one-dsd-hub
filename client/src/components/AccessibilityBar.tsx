import React from "react";

interface AccessibilityBarProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export function AccessibilityBar({ zoom, onZoomChange }: AccessibilityBarProps) {
  return (
    <div className="flex items-center gap-3">
      <label htmlFor="zoom-slider" className="text-xs text-white/70 whitespace-nowrap hidden md:inline">
        Zoom
      </label>
      <input
        id="zoom-slider"
        type="range"
        min={75}
        max={150}
        step={5}
        value={zoom}
        onChange={(e) => onZoomChange(Number(e.target.value))}
        className="w-20 h-1 accent-[#FFB71B] cursor-pointer"
        aria-label={`Zoom level: ${zoom}%`}
      />
      <span className="text-xs text-white/70 w-8 text-right">{zoom}%</span>
    </div>
  );
}

export function SkipLink() {
  return (
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
  );
}
