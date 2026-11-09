export function filterTiltAngle(accelDeg: number, gyroRateDegPerSec: number, dtSeconds: number, alpha: number = 0.98): number {
  return (alpha * (accelDeg + (gyroRateDegPerSec * dtSeconds))) + ((1 - alpha) * accelDeg);
}
