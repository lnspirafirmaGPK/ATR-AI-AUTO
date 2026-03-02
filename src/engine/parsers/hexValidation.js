// src/engine/parsers/hexValidation.js

/**
 * Ensures the given value is a valid byte (0-255).
 * Supports decimal numbers and hex strings (e.g. "7F", "0x7F").
 */
export function toByte(value, fieldName = 'byte') {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 0xFF) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    const normalized = trimmed.startsWith('0x') || trimmed.startsWith('0X')
      ? trimmed.slice(2)
      : trimmed;

    if (/^[0-9A-Fa-f]{1,2}$/.test(normalized)) {
      return parseInt(normalized, 16);
    }
  }

  throw new TypeError(`Invalid ${fieldName}: expected byte (0-255) or hex string`);
}

/**
 * Normalize and validate a hex frame string into byte array.
 */
export function parseHexFrame(hexString, frameName = 'frame') {
  if (typeof hexString !== 'string') {
    throw new TypeError(`${frameName} must be a hex string`);
  }

  const cleanHex = hexString.replace(/\s+/g, '');

  if (!/^[0-9A-Fa-f]+$/.test(cleanHex) || cleanHex.length % 2 !== 0) {
    throw new Error(`Invalid ${frameName} format`);
  }

  const bytes = [];
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes.push(parseInt(cleanHex.slice(i, i + 2), 16));
  }

  return bytes;
}
