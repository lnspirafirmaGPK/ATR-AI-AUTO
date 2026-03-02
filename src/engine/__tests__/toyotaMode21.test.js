import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMode21 } from '../parsers/toyotaMode21.js';

test('parseMode21 parses rail pressure and injector feedback from a valid frame', () => {
  const frame = '61 01 00 88 B8 00 00 00 00 00 82 7E 80 7D';
  const result = parseMode21(frame);

  assert.equal(result.railPressure, 35000);
  assert.deepEqual(result.injectors, {
    1: 2,
    2: -2,
    3: 0,
    4: -3,
  });
});

test('parseMode21 rejects invalid frame format', () => {
  assert.throws(() => parseMode21('61 01 ZZ'), /Invalid Mode 21 frame format/);
});

test('parseMode21 rejects incomplete frames', () => {
  assert.throws(() => parseMode21('61 01 00 88 B8'), /Incomplete Mode 21 frame/);
});
