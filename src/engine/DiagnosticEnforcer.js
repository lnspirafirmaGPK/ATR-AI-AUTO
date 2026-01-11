// src/engine/DiagnosticEnforcer.js
import { parseRailPressure, parseInjectorFeedback } from './parsers/toyotaMode21.js';
import { analyzeRailPressure, analyzeInjectors } from './analyzers/fuelSystem.js';
import specs from '../config/vigo_champ_specs.json';

class DiagnosticEnforcer {
  constructor() {
    this.railPressureBuffer = [];
    this.BUFFER_SIZE = 50;
  }

  processData(mode21Data) {
    // Expecting mode21Data to be raw bytes or pre-parsed object
    // For this implementation, let's assume we receive raw bytes array or object
    // { railPressureA, railPressureB, inj1, inj2, inj3, inj4 }

    // 1. Parse Data
    const railPressure = parseRailPressure(mode21Data.railPressureA, mode21Data.railPressureB);
    const injectors = {
      1: parseInjectorFeedback(mode21Data.inj1, specs.constants.injector_correction_factor),
      2: parseInjectorFeedback(mode21Data.inj2, specs.constants.injector_correction_factor),
      3: parseInjectorFeedback(mode21Data.inj3, specs.constants.injector_correction_factor),
      4: parseInjectorFeedback(mode21Data.inj4, specs.constants.injector_correction_factor),
    };

    // 2. Buffer Rail Pressure
    this.railPressureBuffer.push(railPressure);
    if (this.railPressureBuffer.length > this.BUFFER_SIZE) {
      this.railPressureBuffer.shift();
    }

    // 3. Analyze
    const railStatus = analyzeRailPressure(railPressure, this.railPressureBuffer);
    const injectorStatus = analyzeInjectors(injectors);

    // 4. Aggregated Result
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
