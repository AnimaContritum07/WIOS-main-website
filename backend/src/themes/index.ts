export interface EventTheme {
  primary: string;
  background: string;
  text: string;
  fontFamily: string;
}

export const defaultTheme: EventTheme = {
  primary: "#2563eb",
  background: "#ffffff",
  text: "#111827",
  fontFamily: "system-ui, sans-serif",
};

// Add one entry per event: key = event slug. Each event can look different.
const themes: Record<string, EventTheme> = {
  "example-event": {
    primary: "#db2777",
    background: "#0f172a",
    text: "#f8fafc",
    fontFamily: "Georgia, serif",
  },
};

export function getTheme(slug: string): EventTheme {
  return themes[slug] ?? defaultTheme;
}
