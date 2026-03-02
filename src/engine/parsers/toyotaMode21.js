// src/engine/parsers/toyotaMode21.js

/**
 * Parses Rail Pressure from Toyota Mode 21 response
 * Formula: (A * 256 + B) kPa
 */
export function parseRailPressure(byteA, byteB) {
  return (byteA * 256 + byteB);
}

/**
 * Parses Injector Feedback from Toyota Mode 21 response
 * Formula: (A - 128) * CorrectionFactor
 */
export function parseInjectorFeedback(byteA, correctionFactor = 1.0) {
  return (byteA - 128) * correctionFactor;
}

/**
 * Decodes a full Mode 21 hex response frame
 * Example Frame: 61 01 ... (Data)
 */
export function parseMode21(hexString) {
    // Remove spaces if any
    const cleanHex = hexString.replace(/\s+/g, '');
    const bytes = [];
    for (let i = 0; i < cleanHex.length; i += 2) {
        bytes.push(parseInt(cleanHex.substr(i, 2), 16));
    }

    // Typical Toyota Mode 21 (0x21 0x01) response offset mapping
    // This is a simplified example based on common tech docs
    // 61 01 [Byte 3] [Byte 4] ...

    return {
        railPressure: parseRailPressure(bytes[3], bytes[4]),
        injectors: {
            1: parseInjectorFeedback(bytes[10], 0.01),
            2: parseInjectorFeedback(bytes[11], 0.01),
            3: parseInjectorFeedback(bytes[12], 0.01),
            4: parseInjectorFeedback(bytes[13], 0.01)
        }
    };
}
