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

// Add this to satisfy the import in DiagnosticEnforcer.js if it uses it,
// OR fix bluetooth.js to not use 'parseMode21' if it doesn't exist.
// Since bluetooth.js was importing 'parseMode21' which didn't exist, I removed that call in the fix above.
// However, if other files need it:
export function parseMode21(hexString) {
    // Placeholder
    return {};
}
