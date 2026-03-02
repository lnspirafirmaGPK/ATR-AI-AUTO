// src/engine/SimulationEngine.js
export const SIMULATION_MODES = {
  NORMAL: 'NORMAL',
  SCV_FAULT: 'SCV_FAULT',
  INJECTOR_FAULT: 'INJECTOR_FAULT'
};

class SimulationEngine {
  constructor() {
    this.state = 'IDLE'; // IDLE, ACCELERATING, CRUISING, DECELERATING
    this.faultMode = SIMULATION_MODES.NORMAL;
    this.data = {
      rpm: 800,
      speed: 0,
      coolantTemp: 85,
      trans_temp: 78,
      railPressure: 35000,
      injectors: { 1: 0, 2: 0, 3: 0, 4: 0 }
    };

    // Target values for different states
    this.targets = {
      IDLE: { rpm: 800, speed: 0, railPressure: 35000 },
      ACCELERATING: { rpm: 3000, speed: 100, railPressure: 160000 },
      CRUISING: { rpm: 2000, speed: 90, railPressure: 120000 },
      DECELERATING: { rpm: 1000, speed: 40, railPressure: 40000 }
    };

    // Start automatic state changing
    this.startStateLoop();
  }

  setFaultMode(mode) {
    if (SIMULATION_MODES[mode]) {
      this.faultMode = mode;
    }
  }

  startStateLoop() {
    setInterval(() => {
      const states = ['IDLE', 'ACCELERATING', 'CRUISING', 'DECELERATING'];
      // Randomly change state every 5-10 seconds
      if (Math.random() > 0.8) {
        this.state = states[Math.floor(Math.random() * states.length)];
      }
    }, 2000);
  }

  // Linear interpolation helper
  lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
  }

  // Add some noise
  noise(magnitude) {
    return (Math.random() - 0.5) * magnitude;
  }

  update() {
    const target = this.targets[this.state];
    const smoothFactor = 0.05; // How fast values change

    // Update RPM
    this.data.rpm = this.lerp(this.data.rpm, target.rpm, smoothFactor) + this.noise(50);

    // Update Speed
    this.data.speed = this.lerp(this.data.speed, target.speed, smoothFactor) + this.noise(1);

    // Update Rail Pressure (follows RPM roughly)
    let pressureNoise = 500;
    // SCV Sticking: High fluctuations at IDLE
    if (this.faultMode === SIMULATION_MODES.SCV_FAULT && this.state === 'IDLE') {
      pressureNoise = 5000; // Large fluctuations
    }
    this.data.railPressure = this.lerp(this.data.railPressure, target.railPressure, smoothFactor) + this.noise(pressureNoise);

    // Slowly vary temps
    this.data.coolantTemp += this.noise(0.05);
    if (this.data.coolantTemp > 95) this.data.coolantTemp = 95;
    if (this.data.coolantTemp < 80) this.data.coolantTemp = 80;

    this.data.trans_temp += this.noise(0.04);

    // Injectors
    let injectorNoise = 0.5;
    if (this.faultMode === SIMULATION_MODES.INJECTOR_FAULT) {
      injectorNoise = 8.0; // Will likely cause values to exceed +/- 3.0
    }

    this.data.injectors[1] = this.noise(injectorNoise);
    this.data.injectors[2] = this.noise(injectorNoise);
    this.data.injectors[3] = this.noise(injectorNoise);
    this.data.injectors[4] = this.noise(injectorNoise);

    // Ensure at least one injector is "failing" in fault mode
    if (this.faultMode === SIMULATION_MODES.INJECTOR_FAULT) {
        if (Math.abs(this.data.injectors[1]) < 3.1) {
            this.data.injectors[1] = 3.5 + Math.random();
        }
    }

    return { ...this.data };
  }
}

export default new SimulationEngine();
