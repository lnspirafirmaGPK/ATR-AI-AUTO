// src/engine/analyzers/fuelSystem.js
import specs from '../../config/vigo_champ_specs.json';

export function analyzeRailPressure(currentPressure, historicalPressures) {
  // Check fluctuation at idle
  // We need a buffer of recent pressures to calculate fluctuation
  if (historicalPressures.length < 10) return { status: 'NORMAL' };

  const min = Math.min(...historicalPressures);
  const max = Math.max(...historicalPressures);
  const fluctuation = (max - min) / 2; // Approx +/-

  const threshold = specs.thresholds.rail_pressure.scv_sticking_fluctuation;

  if (fluctuation > threshold) {
    return {
      status: 'WARNING',
      code: 'SCV_STICKING',
      message: 'SCV Sticking Detected',
      details: `Fluctuation: +/- ${Math.round(fluctuation)} kPa (Limit: ${threshold})`
    };
  }

  return { status: 'NORMAL' };
}

export function analyzeInjectors(feedbacks) {
  // feedbacks is an array or object: { cyl1: val, cyl2: val, ... }
  const { critical_min, critical_max } = specs.thresholds.injector_feedback;

  const alerts = [];
  let maxStatus = 'NORMAL';

  for (const [cyl, val] of Object.entries(feedbacks)) {
    if (val < critical_min || val > critical_max) {
      alerts.push({
        cyl,
        val,
        message: `Cylinder ${cyl} Feedback Critical: ${val.toFixed(2)}`
      });
      maxStatus = 'CRITICAL';
    }
  }

  if (maxStatus === 'CRITICAL') {
    return {
      status: 'CRITICAL',
      code: 'INJECTOR_RISK',
      message: 'Injector Failure Risk',
      alerts
    };
  }

  return { status: 'NORMAL' };
}
