// src/engine/parsers/toyotaMode21.js
import specs from '../../config/vigo_champ_specs.json' with { type: 'json' };

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
    if (typeof hexString !== 'string') {
        throw new TypeError('Mode 21 frame must be a hex string');
    }

    // Remove spaces if any
    const cleanHex = hexString.replace(/\s+/g, '');

    if (!/^[0-9A-Fa-f]+$/.test(cleanHex) || cleanHex.length % 2 !== 0) {
        throw new Error('Invalid Mode 21 frame format');
    }

    const bytes = [];
    for (let i = 0; i < cleanHex.length; i += 2) {
        bytes.push(parseInt(cleanHex.substr(i, 2), 16));
    }

    if (bytes.length < 14) {
        throw new Error('Incomplete Mode 21 frame');
    }

    // Typical Toyota Mode 21 (0x21 0x01) response offset mapping
    // This is a simplified example based on common tech docs
    // 61 01 [Byte 3] [Byte 4] ...

    return {
        railPressure: parseRailPressure(bytes[3], bytes[4]),
        injectors: {
            1: parseInjectorFeedback(bytes[10], specs.constants.injector_correction_factor),
            2: parseInjectorFeedback(bytes[11], specs.constants.injector_correction_factor),
            3: parseInjectorFeedback(bytes[12], specs.constants.injector_correction_factor),
            4: parseInjectorFeedback(bytes[13], specs.constants.injector_correction_factor)
        }
    };
}
