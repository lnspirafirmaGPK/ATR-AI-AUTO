export interface VehicleSpecs {
  thresholds: {
    rail_pressure: {
      idle_target: number;
      idle_tolerance: number;
      scv_sticking_fluctuation: number;
    };
    injector_feedback: {
      critical_min: number;
      critical_max: number;
    };
  };
  constants: {
    injector_correction_factor: number;
    calibration_needed: boolean;
  };
}

export interface InjectorFeedbackMap {
  [cylinder: number]: number;
}

export interface DiagnosticStatus {
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  code?: string;
  message?: string;
  details?: string;
  alerts?: Array<{
    cyl: string;
    val: number;
    message: string;
  }>;
}

export interface DiagnosticResult {
  values: {
    railPressure: number;
    injectors: InjectorFeedbackMap;
  };
  analysis: {
    railSystem: DiagnosticStatus;
    fuelSystem: DiagnosticStatus;
  };
}
