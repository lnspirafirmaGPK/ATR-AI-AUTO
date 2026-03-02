// src/engine/parsers/toyotaMode21.js
import specs from '../../config/vigo_champ_specs.json' with { type: 'json' };
import { parseHexFrame, toByte } from './hexValidation.js';

/**
 * Parses Rail Pressure from Toyota Mode 21 response
 * Formula: (A * 256 + B) kPa
 */
export function parseRailPressure(byteA, byteB) {
  const validatedA = toByte(byteA, 'railPressure.byteA');
  const validatedB = toByte(byteB, 'railPressure.byteB');
  return (validatedA * 256 + validatedB);
}

/**
 * Parses Injector Feedback from Toyota Mode 21 response
 * Formula: (A - 128) * CorrectionFactor
 */
export function parseInjectorFeedback(byteA, correctionFactor = 1.0) {
  const validatedA = toByte(byteA, 'injectorFeedback.byteA');
  return (validatedA - 128) * correctionFactor;
}

/**
 * Decodes a full Mode 21 hex response frame
 * Example Frame: 61 01 ... (Data)
 */
export function parseMode21(hexString) {
    const bytes = parseHexFrame(hexString, 'Mode 21 frame');

    if (bytes.length < 14) {
        throw new Error('Incomplete Mode 21 frame');
    }

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
