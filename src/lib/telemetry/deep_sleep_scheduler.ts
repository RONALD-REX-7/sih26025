export function calculateSleepDurationUs(periodMinutes: number): number {
  if (periodMinutes <= 0) return 0;
  return periodMinutes * 60 * 1000 * 1000;
}
