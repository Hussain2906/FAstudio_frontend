import assert from "node:assert/strict";
import test from "node:test";
import { brandColors } from "./theme.config.ts";
import { contrastRatio, generatePalette, generatePalettes, generateSemanticTokens, isInSrgbGamut, lightnessOf, shadeOrder } from "./theme.ts";

test("has exactly three editable brand colors", () => {
  assert.deepEqual(Object.keys(brandColors).sort(), ["primary", "secondary", "tertiary"]);
});

test("generates 33 shades with exact anchor values", () => {
  const palettes = generatePalettes();
  assert.equal(Object.values(palettes).flatMap(Object.values).length, 33);
  assert.equal(palettes.primary[700], brandColors.primary);
  assert.equal(palettes.secondary[500], brandColors.secondary);
  assert.equal(palettes.tertiary[200], brandColors.tertiary);
});

test("keeps shade lightness monotonic and colors in sRGB gamut", () => {
  const palettes = generatePalettes();
  for (const palette of Object.values(palettes)) {
    for (const color of Object.values(palette)) assert.equal(isInSrgbGamut(color), true);
    const lightnesses = shadeOrder.map((shade) => lightnessOf(palette[shade]));
    assert.equal(lightnesses.length, shadeOrder.length);
    assert.ok(lightnesses.every((value, index) => index === 0 || value >= lightnesses[index - 1]));
  }
});

test("semantic foregrounds meet WCAG AA contrast for normal text", () => {
  const semantic = generateSemanticTokens(generatePalettes());
  assert.ok(contrastRatio(semantic.light.foreground, semantic.light.background) >= 4.5);
  assert.ok(contrastRatio(semantic.light.primaryForeground, semantic.light.primary) >= 4.5);
  assert.ok(contrastRatio(semantic.dark.foreground, semantic.dark.background) >= 4.5);
  assert.ok(contrastRatio(semantic.dark.primaryForeground, semantic.dark.primary) >= 4.5);
});

test("changing a base color regenerates its palette", () => {
  assert.notDeepEqual(generatePalette(brandColors.primary, 700), generatePalette("#6B3F2A", 700));
});
