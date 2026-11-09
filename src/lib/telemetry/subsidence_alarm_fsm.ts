export type MineRiskState = "STABLE" | "WATCH" | "WARNING" | "EVACUATE";

export function getRiskState(cumulativeSubsidenceMm: number): MineRiskState {
  if (cumulativeSubsidenceMm >= 50.0) return "EVACUATE";
  if (cumulativeSubsidenceMm >= 25.0) return "WARNING";
  if (cumulativeSubsidenceMm >= 10.0) return "WATCH";
  return "STABLE";
}
