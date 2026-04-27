import { useEffect, useState } from "react";
import ToolPageLayout from "@/components/ToolPageLayout";
import { Copy, Check } from "lucide-react";

type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };

function hexToRgb(hex: string): RGB | null {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const m = h.match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}
function rgbToHex({ r, g, b }: RGB) {
  const t = (n: number) => n.toString(16).padStart(2, "0");
  return `#${t(r)}${t(g)}${t(b)}`.toUpperCase();
}
function rgbToHsl({ r, g, b }: RGB): HSL {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
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
function hslToRgb({ h, s, l }: HSL): RGB {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) { const v = Math.round(l * 255); return { r: v, g: v, b: v }; }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return { r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255), g: Math.round(hue2rgb(p, q, h) * 255), b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255) };
}
function rgbToCmyk({ r, g, b }: RGB) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  const c = k === 1 ? 0 : (1 - rn - k) / (1 - k);
  const m = k === 1 ? 0 : (1 - gn - k) / (1 - k);
  const y = k === 1 ? 0 : (1 - bn - k) / (1 - k);
  return { c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) };
}
function relLum({ r, g, b }: RGB) {
  const f = (n: number) => { const x = n / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(a: RGB, b: RGB) {
  const la = relLum(a), lb = relLum(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

const ColorConverterPage = () => {
  const [hex, setHex] = useState("#22D3EE");
  const [rgb, setRgb] = useState<RGB>({ r: 34, g: 211, b: 238 });
  const [hsl, setHsl] = useState<HSL>({ h: 187, s: 86, l: 53 });
  const [copied, setCopied] = useState<string | null>(null);

  // Sync from hex
  useEffect(() => {
    const r = hexToRgb(hex); if (!r) return;
    setRgb(r); setHsl(rgbToHsl(r));
  }, [hex]);

  const updateRgb = (next: RGB) => {
    setRgb(next); setHex(rgbToHex(next)); setHsl(rgbToHsl(next));
  };
  const updateHsl = (next: HSL) => {
    setHsl(next); const r = hslToRgb(next); setRgb(r); setHex(rgbToHex(r));
  };

  const cmyk = rgbToCmyk(rgb);
  const cWhite = contrast(rgb, { r: 255, g: 255, b: 255 });
  const cBlack = contrast(rgb, { r: 0, g: 0, b: 0 });

  const copy = (label: string, val: string) => {
    navigator.clipboard.writeText(val); setCopied(label); setTimeout(() => setCopied(null), 1500);
  };

  const swatches: { label: string; value: string }[] = [
    { label: "HEX", value: hex.toUpperCase() },
    { label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: "CMYK", value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
  ];

  // Tints/shades
  const variants = [-40, -20, 0, 20, 40].map((d) => {
    const l = Math.max(0, Math.min(100, hsl.l + d));
    return { l, color: `hsl(${hsl.h}, ${hsl.s}%, ${l}%)` };
  });

  return (
    <ToolPageLayout title="Color Converter" description="HEX · RGB · HSL · CMYK with contrast checking and tints/shades">
      <div className="glass rounded-xl p-6 space-y-6">
        <div className="grid md:grid-cols-[auto_1fr] gap-6 items-start">
          <div className="space-y-3">
            <div className="w-32 h-32 rounded-xl border border-border shadow-lg" style={{ backgroundColor: hex }} />
            <input type="color" value={hex} onChange={(e) => setHex(e.target.value.toUpperCase())} className="w-32 h-10 cursor-pointer rounded-lg border border-border" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-primary block mb-1">HEX</label>
              <input type="text" value={hex} onChange={(e) => setHex(e.target.value)} className="input-dark w-full font-mono text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-primary block mb-1">RGB</label>
              <div className="grid grid-cols-3 gap-2">
                {(["r","g","b"] as const).map((k) => (
                  <input key={k} type="number" min={0} max={255} value={rgb[k]}
                    onChange={(e) => updateRgb({ ...rgb, [k]: Math.max(0, Math.min(255, Number(e.target.value) || 0)) })}
                    className="input-dark font-mono text-sm" />
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-primary block mb-1">HSL</label>
              <div className="grid grid-cols-3 gap-2">
                <input type="number" min={0} max={360} value={hsl.h} onChange={(e) => updateHsl({ ...hsl, h: Math.max(0, Math.min(360, Number(e.target.value) || 0)) })} className="input-dark font-mono text-sm" />
                <input type="number" min={0} max={100} value={hsl.s} onChange={(e) => updateHsl({ ...hsl, s: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} className="input-dark font-mono text-sm" />
                <input type="number" min={0} max={100} value={hsl.l} onChange={(e) => updateHsl({ ...hsl, l: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} className="input-dark font-mono text-sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {swatches.map((s) => (
            <button key={s.label} onClick={() => copy(s.label, s.value)} className="bg-surface rounded-lg p-4 text-left hover:bg-muted transition-colors group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-primary">{s.label}</span>
                {copied === s.label ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
              </div>
              <p className="font-mono text-sm text-foreground mt-1 break-all">{s.value}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Contrast (WCAG)</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-white text-black rounded-lg p-3 text-sm">
              <span style={{ color: hex }}>Sample text on white</span>
              <span className="font-mono">{cWhite.toFixed(2)} : 1 {cWhite >= 4.5 ? "✓" : "✗"}</span>
            </div>
            <div className="flex items-center justify-between bg-black text-white rounded-lg p-3 text-sm">
              <span style={{ color: hex }}>Sample text on black</span>
              <span className="font-mono">{cBlack.toFixed(2)} : 1 {cBlack >= 4.5 ? "✓" : "✗"}</span>
            </div>
            <p className="text-xs text-muted-foreground">AA requires 4.5:1 for normal text, 3:1 for large.</p>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Tints & Shades</h3>
          <div className="grid grid-cols-5 gap-2">
            {variants.map((v) => (
              <button key={v.l} onClick={() => copy(`L${v.l}`, v.color)} className="aspect-square rounded-lg border border-border" style={{ background: v.color }} title={v.color} />
            ))}
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
};

export default ColorConverterPage;
