import { useState, useEffect } from "react";
import ToolPageLayout from "@/components/ToolPageLayout";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace("#", "").match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

const ColorConverterPage = () => {
  const [hex, setHex] = useState("#22d3ee");
  const rgb = hexToRgb(hex);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;

  return (
    <ToolPageLayout title="Color Converter" description="Convert between HEX, RGB, and HSL color formats">
      <div className="glass rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-xl border border-border shadow-lg" style={{ backgroundColor: hex }} />
          <div className="flex-1 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">HEX</label>
              <input type="text" value={hex} onChange={(e) => setHex(e.target.value)} className="input-dark w-full font-mono text-sm" />
            </div>
            <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="w-full h-10 cursor-pointer rounded-lg border border-border" />
          </div>
        </div>

        {rgb && hsl && (
          <div className="grid sm:grid-cols-3 gap-4 animate-fade-in">
            <div className="bg-surface rounded-lg p-4">
              <span className="text-xs font-semibold text-primary">HEX</span>
              <p className="font-mono text-sm text-foreground mt-1">{hex.toUpperCase()}</p>
            </div>
            <div className="bg-surface rounded-lg p-4">
              <span className="text-xs font-semibold text-primary">RGB</span>
              <p className="font-mono text-sm text-foreground mt-1">rgb({rgb.r}, {rgb.g}, {rgb.b})</p>
            </div>
            <div className="bg-surface rounded-lg p-4">
              <span className="text-xs font-semibold text-primary">HSL</span>
              <p className="font-mono text-sm text-foreground mt-1">hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</p>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
};

export default ColorConverterPage;
