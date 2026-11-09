export function estimateTimeOnAirMs(payloadBytes: number, spreadingFactor: number): number {
  if (payloadBytes < 0 || spreadingFactor < 7 || spreadingFactor > 12) {
    throw new Error("Invalid parameters");
  }
  const symbolDurationMs = (Math.pow(2, spreadingFactor) / 125000) * 1000;
  const symbols = 8 + 4.25 + (payloadBytes * 2);
  return Number((symbols * symbolDurationMs).toFixed(1));
}
