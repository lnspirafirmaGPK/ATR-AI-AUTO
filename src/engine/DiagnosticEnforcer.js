// src/engine/DiagnosticEnforcer.js
import { parseRailPressure, parseInjectorFeedback } from './parsers/toyotaMode21.js';
import { analyzeRailPressure, analyzeInjectors } from './analyzers/fuelSystem.js';
import specs from '../config/vigo_champ_specs.json' with { type: 'json' };
import { toByte } from './parsers/hexValidation.js';

/** @typedef {import('../types/diagnostics').DiagnosticResult} DiagnosticResult */
/** @typedef {import('../types/diagnostics').VehicleSpecs} VehicleSpecs */

class DiagnosticEnforcer {
  constructor() {
    this.railPressureBuffer = [];
    this.BUFFER_SIZE = 50;
    /** @type {VehicleSpecs} */
    this.specs = specs;
  }

  /**
   * Process raw data from OBD (e.g. Mode 21)
   * Accepts either decimal bytes or hex-string bytes.
   * @param {{railPressureA:number|string,railPressureB:number|string,inj1:number|string,inj2:number|string,inj3:number|string,inj4:number|string}} mode21Data
   * @returns {DiagnosticResult}
   */
  processData(mode21Data) {
    const railPressure = parseRailPressure(
      toByte(mode21Data.railPressureA, 'mode21Data.railPressureA'),
      toByte(mode21Data.railPressureB, 'mode21Data.railPressureB')
    );

    const injectors = {
      1: parseInjectorFeedback(toByte(mode21Data.inj1, 'mode21Data.inj1'), this.specs.constants.injector_correction_factor),
      2: parseInjectorFeedback(toByte(mode21Data.inj2, 'mode21Data.inj2'), this.specs.constants.injector_correction_factor),
      3: parseInjectorFeedback(toByte(mode21Data.inj3, 'mode21Data.inj3'), this.specs.constants.injector_correction_factor),
      4: parseInjectorFeedback(toByte(mode21Data.inj4, 'mode21Data.inj4'), this.specs.constants.injector_correction_factor),
    };

    return this.processProcessedData({ railPressure, injectors });
  }

  /**
   * Analyze already parsed/simulated values
   * @param {{railPressure:number, injectors: Record<number, number>}} values
   * @returns {DiagnosticResult}
   */
  processProcessedData(values) {
    const { railPressure, injectors } = values;

    // 1. Buffer Rail Pressure
    this.railPressureBuffer.push(railPressure);
    if (this.railPressureBuffer.length > this.BUFFER_SIZE) {
      this.railPressureBuffer.shift();
    }

    // 2. Analyze
    const railStatus = analyzeRailPressure(railPressure, this.railPressureBuffer);
    const injectorStatus = analyzeInjectors(injectors);

    // 3. Aggregated Result
    return {
      values: {
        railPressure,
        injectors
      },
      analysis: {
        railSystem: railStatus,
        fuelSystem: injectorStatus
      }
    };
  }
}

export default new DiagnosticEnforcer();
