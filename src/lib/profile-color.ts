const WORKLOADS = ['productividad_estudio', 'creacion_desarrollo', 'gaming_rendimiento'] as const;
const LIFESTYLES = ['maxima_portabilidad', 'movil_flexible', 'escritorio_fijo'] as const;
const BUDGETS = ['esencial', 'equilibrado', 'premium'] as const;
const OS_PREFS = ['windows', 'macos', 'abierto'] as const;

/**
 * Derives a unique HSL color for each of the 81 profile combinations.
 * Hue is evenly distributed across 360° (one hue per profile index).
 */
export function getProfileColor(
  workload: string,
  lifestyle: string,
  budget: string,
  os: string
): string {
  const wi = Math.max(0, WORKLOADS.indexOf(workload as (typeof WORKLOADS)[number]));
  const li = Math.max(0, LIFESTYLES.indexOf(lifestyle as (typeof LIFESTYLES)[number]));
  const bi = Math.max(0, BUDGETS.indexOf(budget as (typeof BUDGETS)[number]));
  const oi = Math.max(0, OS_PREFS.indexOf(os as (typeof OS_PREFS)[number]));

  const index = wi * 27 + li * 9 + bi * 3 + oi; // 0–80

  const hue = Math.round((index / 81) * 360);
  // Vary saturation and lightness slightly to avoid monotony
  const saturation = 60 + (index % 4) * 5;   // 60, 65, 70, 75 cycling
  const lightness = 48 + (index % 5) * 3;    // 48, 51, 54, 57, 60 cycling

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
