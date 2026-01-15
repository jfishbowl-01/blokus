export const DISPLAY_COLOR_OPTIONS = [
  '#2563EB', // blue
  '#06B6D4', // cyan
  '#14B8A6', // teal
  '#22C55E', // green
  '#84CC16', // lime
  '#EAB308', // yellow
  '#F97316', // orange
  '#EF4444', // red
  '#EC4899', // pink
  '#8B5CF6'  // purple
];

export const DEFAULT_DISPLAY_COLORS = {
  blue: DISPLAY_COLOR_OPTIONS[0],
  yellow: DISPLAY_COLOR_OPTIONS[5],
  red: DISPLAY_COLOR_OPTIONS[7],
  green: DISPLAY_COLOR_OPTIONS[3]
};

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;

export function normalizeHexColor(value) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!HEX_COLOR_RE.test(trimmed)) return null;
  return trimmed.toUpperCase();
}

export function resolveDisplayColor(player) {
  if (!player) return '#94A3B8';
  const normalized = normalizeHexColor(player.display_color);
  if (normalized) return normalized;
  const seat = DEFAULT_DISPLAY_COLORS[player.color];
  return seat || '#94A3B8';
}

export function hexToRgba(hex, alpha) {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return `rgba(148, 163, 184, ${alpha})`;
  const clean = normalized.slice(1);
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getUniqueDisplayColor(preferredColor, takenColors) {
  const taken = new Set();
  if (takenColors) {
    for (const color of takenColors) {
      const normalized = normalizeHexColor(color);
      if (normalized) taken.add(normalized);
    }
  }

  const preferred = normalizeHexColor(preferredColor);
  if (preferred && !taken.has(preferred)) return preferred;

  for (const candidate of DISPLAY_COLOR_OPTIONS) {
    const normalized = normalizeHexColor(candidate);
    if (normalized && !taken.has(normalized)) return normalized;
  }

  for (const candidate of Object.values(DEFAULT_DISPLAY_COLORS)) {
    const normalized = normalizeHexColor(candidate);
    if (normalized && !taken.has(normalized)) return normalized;
  }

  return preferred || DISPLAY_COLOR_OPTIONS[0] || '#94A3B8';
}
