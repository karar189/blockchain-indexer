export const COLORS = {
  deepBlue: "#0A2353",
  navy: "#112C70",
  primary: "#5B58EB",
  purple: "#BB63FF",
  cyan: "#56E1E9",
  textPrimary: "#FFFFFF",
  textSecondary: "#B8C2E8",
  success: "#34D399",
  warning: "#FBBF24",
  error: "#F87171",
  glass: "rgba(255, 255, 255, 0.1)",
  glassDark: "rgba(17, 24, 39, 0.6)",
  glassBorder: "rgba(255, 255, 255, 0.15)",
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};