export function evaluateSubsidenceDisplacement(displacementMm: number, warningThresholdMm: number = 15.0): boolean {
  return Math.abs(displacementMm) >= warningThresholdMm;
}
