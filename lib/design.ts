export function swatchColor(name: string): string {
  const colors: Record<string,string> = { black: "#18212b", white: "#fafafa", gray: "#a3a5a6", grey: "#a3a5a6", blue: "#52778d", red: "#b33e42", green: "#376d58", beige: "#c6bba7", brown: "#715746", nude: "#d1a993", plum: "#70435b", "cherry red": "#a1253e" };
  return colors[name.toLowerCase()] || "#c5cdd1";
}
