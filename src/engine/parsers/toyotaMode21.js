// src/engine/parsers/toyotaMode21.js

export function parseRailPressure(byteA, byteB) {
  // Formula: (A * 256 + B) kPa
  return (byteA * 256 + byteB);
}

export function parseInjectorFeedback(byteA, correctionFactor = 1.0) {
  // Formula: (A - 128) * CorrectionFactor
  // Approx range -5.0 to +5.0 mm3/st
  return (byteA - 128) * correctionFactor;
}
