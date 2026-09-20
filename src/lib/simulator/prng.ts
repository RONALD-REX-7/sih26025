/**
 * SIH26025 Deterministic Pseudo-Random Number Generator
 * 
 * Mulberry32 Algorithm:
 * Provides mathematically deterministic, seed-reproducible sequence of pseudorandom numbers.
 * Guaranteed: Mulberry32(seed).next() will yield identical numbers across any browser,
 * node runtime, or device for the same seed value.
 */

export class Mulberry32 {
  private state: number;

  constructor(seed: number) {
    // Force integer seed
    this.state = Math.floor(seed) >>> 0;
  }

  /**
   * Generates next float in range [0, 1)
   */
  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generates float in range [min, max)
   */
  public nextRange(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Generates Gaussian-distributed random number using Box-Muller transform
   */
  public nextGaussian(mean = 0, stdDev = 1): number {
    const u1 = Math.max(this.next(), 1e-15);
    const u2 = this.next();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * stdDev;
  }

  /**
   * Reset generator to specific seed
   */
  public reseed(seed: number): void {
    this.state = Math.floor(seed) >>> 0;
  }
}
