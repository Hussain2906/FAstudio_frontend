import { converter, formatHex, toGamut } from "culori";
import { brandColors, type BrandColorName } from "./theme.config.ts";

export const shadeOrder = [950, 900, 800, 700, 600, 500, 400, 300, 200, 100, 50] as const;
export type Shade = (typeof shadeOrder)[number];
export type Palette = Record<Shade, string>;
export type BrandPalettes = Record<BrandColorName, Palette>;

const anchorShade: Record<BrandColorName, Shade> = {
  primary: 700,
  secondary: 500,
  tertiary: 200,
};

const toOklch = converter("oklch");
const toRgb = converter("rgb");

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const hexToRgb = (hex: string) => {
  const value = hex.replace("#", "");
  const channels = value.length === 3 ? value.split("").map((channel) => channel + channel) : value.match(/.{2}/g);
  if (!channels || channels.length !== 3) throw new Error(`Invalid color: ${hex}`);
  return channels.map((channel) => Number.parseInt(channel, 16) / 255);
};

const relativeLuminance = (hex: string) =>
  hexToRgb(hex)
    .map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);

export const contrastRatio = (foreground: string, background: string) => {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
};

const readableForeground = (background: string, candidates = ["#FFFFFF", "#211B18"]) =>
  candidates.reduce((best, candidate) =>
    contrastRatio(candidate, background) > contrastRatio(best, background) ? candidate : best,
  );

const shadeLightness = (baseLightness: number, shade: Shade, anchor: Shade) => {
  const shadeIndex = shadeOrder.indexOf(shade);
  const anchorIndex = shadeOrder.indexOf(anchor);
  return clamp(baseLightness + (shadeIndex - anchorIndex) * 0.055, 0.04, 0.96);
};

export const generatePalette = (baseHex: string, anchor: Shade): Palette => {
  const base = toOklch(baseHex);
  if (!base || base.l === undefined || base.c === undefined) throw new Error(`Invalid color: ${baseHex}`);

  return Object.fromEntries(
    shadeOrder.map((shade) => {
      if (shade === anchor) return [shade, (formatHex(baseHex) ?? baseHex).toUpperCase()];
      const lightness = shadeLightness(base.l, shade, anchor);
      const extreme = Math.abs(2 * lightness - 1);
      const chroma = base.c * (1 - 0.35 * extreme);
      const mapped = toGamut("rgb", "oklch")({ mode: "oklch", l: lightness, c: chroma, h: base.h });
      return [shade, formatHex(mapped).toUpperCase()];
    }),
  ) as Palette;
};

export const generatePalettes = (colors: typeof brandColors = brandColors): BrandPalettes =>
  Object.fromEntries(
    (Object.keys(colors) as BrandColorName[]).map((name) => [name, generatePalette(colors[name], anchorShade[name])]),
  ) as BrandPalettes;

export const generateSemanticTokens = (palettes: BrandPalettes) => {
  const { primary, secondary, tertiary } = palettes;
  const lightPrimaryForeground = readableForeground(primary[700]);
  const darkPrimaryForeground = readableForeground(primary[200]);
  return {
    light: {
      background: tertiary[50], foreground: primary[950], card: "#FFFFFF", cardForeground: primary[950], popover: "#FFFFFF", popoverForeground: primary[950],
      primary: primary[700], primaryForeground: lightPrimaryForeground, secondary: secondary[100],
      secondaryForeground: secondary[900], tertiary: tertiary[200], tertiaryForeground: primary[950],
      accent: tertiary[200], accentForeground: primary[950], muted: tertiary[100], mutedForeground: primary[800],
      border: secondary[200], input: secondary[300], ring: secondary[600], hover: primary[800], active: primary[900],
      selected: tertiary[200], disabled: secondary[100],
    },
    dark: {
      background: primary[950], foreground: primary[50], card: primary[900], cardForeground: primary[50], popover: primary[900], popoverForeground: primary[50],
      primary: primary[200], primaryForeground: darkPrimaryForeground, secondary: secondary[800],
      secondaryForeground: secondary[50], tertiary: tertiary[800], tertiaryForeground: tertiary[50],
      accent: tertiary[800], accentForeground: tertiary[50], muted: primary[800], mutedForeground: primary[200],
      border: secondary[700], input: secondary[600], ring: secondary[300], hover: primary[100], active: primary[50],
      selected: primary[800], disabled: primary[800],
    },
  };
};

export const theme = { palettes: generatePalettes(), semantic: generateSemanticTokens(generatePalettes()) };

export const isInSrgbGamut = (hex: string) => {
  const rgb = toRgb(hex);
  return Boolean(rgb && [rgb.r, rgb.g, rgb.b].every((channel) => channel >= 0 && channel <= 1));
};

export const lightnessOf = (hex: string) => toOklch(hex)?.l ?? Number.NaN;
