// ============================================================================
// AI Agent Studio - Theme System
// 5 Color themes with full token definitions
// ============================================================================

export type ThemeId = "terracotta" | "slate" | "neon" | "sage" | "violet";

export interface ThemeTokens {
  bgApp: string;
  bgPanel: string;
  bgSubtle: string;
  bgMuted: string;
  bgAccentTint: string;
  border: string;
  borderSoft: string;
  text: string;
  textStrong: string;
  textMuted: string;
  textSoft: string;
  textFaint: string;
  accent: string;
  accentSoft: string;
  accentTint: string;
  accentHover: string;
  dotGlow: string;
  sendBg: string;
  sendFg: string;
  shadow: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  glassBg: string;
  glassBorder: string;
}

export interface ThemeDef {
  id: ThemeId;
  name: string;
  subtitle: string;
  isDark: boolean;
  tokens: ThemeTokens;
}

export const THEMES: ThemeDef[] = [
  {
    id: "terracotta",
    name: "Warm Terracotta",
    subtitle: "温暖赤陶",
    isDark: true,
    tokens: {
      bgApp: "#1a1917",
      bgPanel: "#222120",
      bgSubtle: "#2a2825",
      bgMuted: "#2e2c29",
      bgAccentTint: "#2e1a12",
      border: "#333128",
      borderSoft: "#2a2825",
      text: "#e8e4dc",
      textStrong: "#f2ede4",
      textMuted: "#9a9690",
      textSoft: "#6e6b65",
      textFaint: "#4e4b46",
      accent: "#d97a56",
      accentSoft: "#3d2318",
      accentTint: "#2e1a12",
      accentHover: "#e8896a",
      dotGlow: "rgba(217,122,86,0.3)",
      sendBg: "#d97a56",
      sendFg: "#1a1917",
      shadow: "rgba(0,0,0,0.5)",
      cardBg: "rgba(34,33,32,0.65)",
      cardBorder: "rgba(51,49,40,0.4)",
      cardShadow: "0 16px 48px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.2)",
      glassBg: "rgba(34,33,32,0.6)",
      glassBorder: "rgba(255,255,255,0.08)",
    },
  },
  {
    id: "slate",
    name: "Cool Slate",
    subtitle: "冷调石板",
    isDark: true,
    tokens: {
      bgApp: "#0a0a0c",
      bgPanel: "#111113",
      bgSubtle: "#1a1a1e",
      bgMuted: "#222228",
      bgAccentTint: "#111827",
      border: "#2a2a30",
      borderSoft: "#1f1f24",
      text: "#e4e4e8",
      textStrong: "#f4f4f6",
      textMuted: "#8b8b96",
      textSoft: "#5c5c66",
      textFaint: "#3e3e46",
      accent: "#6366f1",
      accentSoft: "#1e1b4b",
      accentTint: "#111827",
      accentHover: "#818cf8",
      dotGlow: "rgba(99,102,241,0.4)",
      sendBg: "#6366f1",
      sendFg: "#ffffff",
      shadow: "rgba(0,0,0,0.6)",
      cardBg: "rgba(17,17,19,0.68)",
      cardBorder: "rgba(42,42,48,0.4)",
      cardShadow: "0 16px 48px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.25)",
      glassBg: "rgba(17,17,19,0.55)",
      glassBorder: "rgba(255,255,255,0.08)",
    },
  },
  {
    id: "neon",
    name: "Neon Cyan",
    subtitle: "赛博霓虹",
    isDark: true,
    tokens: {
      bgApp: "#000000",
      bgPanel: "#0a0a0a",
      bgSubtle: "#141414",
      bgMuted: "#1a1a1a",
      bgAccentTint: "#001a12",
      border: "#262626",
      borderSoft: "#1a1a1a",
      text: "#e0e0e0",
      textStrong: "#f0f0f0",
      textMuted: "#888888",
      textSoft: "#555555",
      textFaint: "#333333",
      accent: "#00e5a0",
      accentSoft: "#002e1f",
      accentTint: "#001a12",
      accentHover: "#33edb5",
      dotGlow: "rgba(0,229,160,0.4)",
      sendBg: "#00e5a0",
      sendFg: "#000000",
      shadow: "rgba(0,0,0,0.7)",
      cardBg: "rgba(10,10,10,0.68)",
      cardBorder: "rgba(38,38,38,0.5)",
      cardShadow: "0 16px 48px rgba(0,0,0,0.5), 0 0 1px rgba(0,229,160,0.15)",
      glassBg: "rgba(10,10,10,0.55)",
      glassBorder: "rgba(0,229,160,0.1)",
    },
  },
  {
    id: "sage",
    name: "Soft Sage",
    subtitle: "柔雾鼠尾草",
    isDark: false,
    tokens: {
      bgApp: "#fafaf8",
      bgPanel: "#ffffff",
      bgSubtle: "#f5f5f2",
      bgMuted: "#eeece8",
      bgAccentTint: "#eef5ee",
      border: "#e8e6e1",
      borderSoft: "#f0eee9",
      text: "#37352f",
      textStrong: "#1a1916",
      textMuted: "#787574",
      textSoft: "#9b9a97",
      textFaint: "#c4c3c0",
      accent: "#4d8b6a",
      accentSoft: "#d4e8da",
      accentTint: "#eef5ee",
      accentHover: "#3d7a59",
      dotGlow: "rgba(77,139,106,0.3)",
      sendBg: "#4d8b6a",
      sendFg: "#ffffff",
      shadow: "rgba(0,0,0,0.08)",
      cardBg: "rgba(255,255,255,0.78)",
      cardBorder: "rgba(232,230,225,0.5)",
      cardShadow: "0 16px 48px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
      glassBg: "rgba(255,255,255,0.65)",
      glassBorder: "rgba(255,255,255,0.4)",
    },
  },
  {
    id: "violet",
    name: "Deep Violet",
    subtitle: "深邃紫罗兰",
    isDark: true,
    tokens: {
      bgApp: "#12111a",
      bgPanel: "#18172a",
      bgSubtle: "#201f35",
      bgMuted: "#28273e",
      bgAccentTint: "#1a1530",
      border: "#2e2d48",
      borderSoft: "#24233a",
      text: "#e6e4f0",
      textStrong: "#f4f2ff",
      textMuted: "#9895ad",
      textSoft: "#6b6885",
      textFaint: "#45425f",
      accent: "#a78bfa",
      accentSoft: "#2d1f5e",
      accentTint: "#1a1530",
      accentHover: "#c4b5fd",
      dotGlow: "rgba(167,139,250,0.4)",
      sendBg: "#a78bfa",
      sendFg: "#12111a",
      shadow: "rgba(0,0,0,0.5)",
      cardBg: "rgba(24,23,42,0.68)",
      cardBorder: "rgba(46,45,72,0.4)",
      cardShadow: "0 16px 48px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.2)",
      glassBg: "rgba(24,23,42,0.55)",
      glassBorder: "rgba(167,139,250,0.1)",
    },
  },
];

export function getTheme(id: ThemeId): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

// Map theme tokens to CSS custom properties
export function themeToCssVars(tokens: ThemeTokens): Record<string, string> {
  return {
    "--bg-app": tokens.bgApp,
    "--bg-panel": tokens.bgPanel,
    "--bg-subtle": tokens.bgSubtle,
    "--bg-muted": tokens.bgMuted,
    "--bg-accent-tint": tokens.bgAccentTint,
    "--border": tokens.border,
    "--border-soft": tokens.borderSoft,
    "--text-color": tokens.text,
    "--text-strong": tokens.textStrong,
    "--text-muted": tokens.textMuted,
    "--text-soft": tokens.textSoft,
    "--text-faint": tokens.textFaint,
    "--accent": tokens.accent,
    "--accent-soft": tokens.accentSoft,
    "--accent-tint": tokens.accentTint,
    "--accent-hover": tokens.accentHover,
    "--accent-foreground": tokens.sendFg,
    "--dot-glow": tokens.dotGlow,
    "--send-bg": tokens.sendBg,
    "--send-fg": tokens.sendFg,
    "--shadow-color": tokens.shadow,
    "--card-bg": tokens.cardBg,
    "--card-border": tokens.cardBorder,
    "--card-shadow": tokens.cardShadow,
    "--glass-bg": tokens.glassBg,
    "--glass-border": tokens.glassBorder,
    // Shadcn compatibility
    "--background": tokens.bgApp,
    "--foreground": tokens.text,
    "--card": tokens.bgPanel,
    "--card-foreground": tokens.text,
    "--popover": tokens.bgPanel,
    "--popover-foreground": tokens.text,
    "--primary": tokens.textStrong,
    "--primary-foreground": tokens.bgApp,
    "--secondary": tokens.bgSubtle,
    "--secondary-foreground": tokens.textStrong,
    "--muted": tokens.bgMuted,
    "--muted-foreground": tokens.textMuted,
    "--input": tokens.border,
    "--ring": tokens.accent,
    "--sidebar": tokens.bgPanel,
    "--sidebar-foreground": tokens.text,
    "--sidebar-primary": tokens.accent,
    "--sidebar-primary-foreground": tokens.sendFg,
    "--sidebar-accent": tokens.bgSubtle,
    "--sidebar-accent-foreground": tokens.text,
    "--sidebar-border": tokens.border,
    "--sidebar-ring": tokens.accent,
  };
}
