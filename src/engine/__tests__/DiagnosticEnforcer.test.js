import test from 'node:test';
import assert from 'node:assert/strict';
import DiagnosticEnforcer from '../DiagnosticEnforcer.js';

test('processData parses hex bytes and returns diagnostic result', () => {
  const result = DiagnosticEnforcer.processData({
    railPressureA: '88',
    railPressureB: 'B8',
    inj1: '82',
    inj2: '7E',
    inj3: '80',
    inj4: '7D'
  });

  assert.equal(result.values.railPressure, 35000);
  assert.deepEqual(result.values.injectors, { 1: 2, 2: -2, 3: 0, 4: -3 });
});

test('processData rejects invalid hex data', () => {
  assert.throws(() => {
    DiagnosticEnforcer.processData({
      railPressureA: 'ZZ',
      railPressureB: 'B8',
      inj1: '82',
      inj2: '7E',
      inj3: '80',
      inj4: '7D'
    });
  }, /Invalid mode21Data\.railPressureA/);
});
