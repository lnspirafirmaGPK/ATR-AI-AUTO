// src/services/bluetooth.js

// Mock implementation for Simulation Mode
// In production, this would use @capacitor-community/bluetooth-le or bluetooth-serial

export const SIMULATION_MODES = {
  NORMAL: 'NORMAL',
  SCV_FAULT: 'SCV_FAULT',
  INJECTOR_FAULT: 'INJECTOR_FAULT'
};

class BluetoothService {
  constructor() {
    this.connected = false;
    this.simulationMode = SIMULATION_MODES.NORMAL;
    this.intervalId = null;
    this.onDataCallback = null;

    // Internal state for simulation
    this.rpm = 800;
    this.railPressureBase = 35000;
    this.tick = 0;
  }

  connect(mode = SIMULATION_MODES.NORMAL) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.connected = true;
        this.simulationMode = mode;
        this.startSimulation();
        resolve(true);
      }, 1000);
    });
  }

  disconnect() {
    return new Promise((resolve) => {
      this.connected = false;
      if (this.intervalId) clearInterval(this.intervalId);
      resolve(true);
    });
  }

  onData(callback) {
    this.onDataCallback = callback;
  }

  setSimulationMode(mode) {
    this.simulationMode = mode;
  }

  startSimulation() {
    if (this.intervalId) clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      if (!this.connected || !this.onDataCallback) return;

      this.tick++;
      const data = this.generateFrame();
      this.onDataCallback(data);
    }, 100); // 10Hz update
  }

  generateFrame() {
    // Simulate Raw Bytes for Toyota Mode 21
    // Need: railPressureA, railPressureB, inj1, inj2, inj3, inj4

    let railPressure = this.railPressureBase;
    let inj1 = 128; // 0.0
    let inj2 = 128;
    let inj3 = 128;
    let inj4 = 128;

    // RPM Logic
    this.rpm = 800 + Math.sin(this.tick * 0.1) * 20;

    // Logic based on Simulation Mode
    if (this.simulationMode === SIMULATION_MODES.NORMAL) {
      // Fluctuate +/- 500
      railPressure += (Math.random() - 0.5) * 1000;

      // Injectors small variance
      inj1 += (Math.random() - 0.5) * 5;
      inj2 += (Math.random() - 0.5) * 5;
      inj3 += (Math.random() - 0.5) * 5;
      inj4 += (Math.random() - 0.5) * 5;

    } else if (this.simulationMode === SIMULATION_MODES.SCV_FAULT) {
      // Sawtooth wave +/- 2500
      const wave = Math.sin(this.tick * 0.2) * 2500;
      railPressure += wave;

    } else if (this.simulationMode === SIMULATION_MODES.INJECTOR_FAULT) {
      // Cylinder 3 fails (< -3.0) -> A < (128 - 3) = 125
      inj3 = 120; // -8.0 approx
      railPressure += (Math.random() - 0.5) * 1000;
    }

    // Convert back to bytes
    const railPressureA = Math.floor(railPressure / 256);
    const railPressureB = Math.floor(railPressure % 256);

    return {
      timestamp: Date.now(),
      rpm: this.rpm,
      speed: 0,
      coolantTemp: 85,
      mode21: {
        railPressureA,
        railPressureB,
        inj1,
        inj2,
        inj3,
        inj4
      }
    };
  }
}

export default new BluetoothService();
