/** The only editable brand values in the shared design system. */
export const brandColors = {
  primary: "#4D403A",
  secondary: "#A3968D",
  tertiary: "#DFDACF",
} as const;

export type BrandColorName = keyof typeof brandColors;
