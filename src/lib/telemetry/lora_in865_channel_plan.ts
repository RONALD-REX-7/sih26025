export const IN865_CHANNELS_MHZ: number[] = [
  865.0625,
  865.4025,
  865.9850,
];

export function isChannelInBand(freqMhz: number): boolean {
  return freqMhz >= 865.0 && freqMhz <= 867.0;
}
