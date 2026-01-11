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
    
    // Store current vehicle configuration
    this.currentConfig = null;
    this.lastHeader = '7DF'; // Default OBD-II Header
  }

  /**
   * Set the vehicle configuration (PIDs list)
   * This allows the service to know which PIDs to poll and how to decode them.
   */
  setVehicleConfig(config) {
    this.currentConfig = config;
    console.log(`[Bluetooth] Vehicle config set to: ${config?.vehicleName}`);
  }

  connect(mode = SIMULATION_MODES.NORMAL) {
    return new Promise((resolve) => {
      console.log('[Bluetooth] Connecting...');
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
      console.log('[Bluetooth] Disconnected');
      resolve(true);
    });
  }

  onData(callback) {
    this.onDataCallback = callback;
  }

  setSimulationMode(mode) {
    this.simulationMode = mode;
  }

  /**
   * Main Simulation Loop
   * Mimics the polling process of a real OBD-II reader
   */
  startSimulation() {
    if (this.intervalId) clearInterval(this.intervalId);

    this.intervalId = setInterval(async () => {
      if (!this.connected || !this.onDataCallback) return;

      this.tick++;
      
      // Update basic simulation physics
      this.updateSimulationPhysics();

      let frameData = {};

      if (this.currentConfig && this.currentConfig.pids) {
        // --- LOGIC 1: Dynamic Polling based on JSON ---
        // This simulates reading PIDs defined in your JSON (like Isuzu)
        
        for (const pidObj of this.currentConfig.pids) {
          // 1. Header Switching Logic (The "Commercial Grade" Feature)
          // If the PID requires a specific address (e.g., 7E2 for Transmission), we switch.
          const targetAddress = pidObj.address || '7DF';
          
          if (this.lastHeader !== targetAddress) {
            // In real app: await this.write(`AT SH ${targetAddress}`);
            // console.log(`[Protocol] Switching Header to ${targetAddress}`);
            this.lastHeader = targetAddress;
          }

          // 2. Simulate Request & Response
          // In real app: const response = await this.write(`${pidObj.mode}${pidObj.pid}`);
          const simulatedRawValue = this.getSimulatedRawValue(pidObj.id);
          
          // 3. Calculate value based on Formula (A-40, etc.)
          const calculatedValue = this.calculateFormula(pidObj.formula, simulatedRawValue);
          
          frameData[pidObj.id] = calculatedValue;
        }

        // Add standard fields if not present
        if (!frameData.rpm) frameData.rpm = this.rpm;
        frameData.timestamp = Date.now();

      } else {
        // --- LOGIC 2: Fallback / Legacy Toyota Mode ---
        // Keep this for backward compatibility if no config is set
        frameData = this.generateLegacyToyotaFrame();
      }

      this.onDataCallback(frameData);
    }, 100); // 10Hz update
  }

  updateSimulationPhysics() {
    // RPM Logic
    this.rpm = 800 + Math.sin(this.tick * 0.1) * 20;

    // Rail Pressure Logic
    if (this.simulationMode === SIMULATION_MODES.NORMAL) {
      this.railPressureBase = 35000 + (Math.random() - 0.5) * 1000;
    } else if (this.simulationMode === SIMULATION_MODES.SCV_FAULT) {
      this.railPressureBase = 35000 + Math.sin(this.tick * 0.2) * 5000; // Surge
    }
  }

  /**
   * Generate fake raw bytes (A, B, C, D) based on the sensor type
   */
  getSimulatedRawValue(sensorId) {
    // Returns an object { A, B, C, D } to mimic OBD response bytes
    
    if (sensorId === 'trans_temp') {
      // Simulating Isuzu ATF Temp
      // Normal temp around 80-90C. Formula is A-40. So A should be ~125.
      const temp = 85 + Math.sin(this.tick * 0.05) * 5; 
      return { A: Math.floor(temp + 40), B: 0 };
    }
    
    if (sensorId === 'cwt_fix_1') {
      // Simulating Coolant Temp
      const temp = 90 + (Math.random() * 2);
      return { A: 0, B: Math.floor(temp + 40) }; // Formula B-40
    }

    // Default random bytes
    return { A: 128, B: 128, C: 128, D: 128 };
  }

  calculateFormula(formula, bytes) {
    if (!formula) return 0;
    // Simple eval for simulation (Note: In production, use a safe parser)
    // Replace A, B, C, D with actual values
    try {
      const expression = formula
        .replace(/A/g, bytes.A || 0)
        .replace(/B/g, bytes.B || 0)
        .replace(/C/g, bytes.C || 0)
        .replace(/D/g, bytes.D || 0);
      
      // eslint-disable-next-line no-new-func
      return Function(`"use strict"; return (${expression})`)();
    } catch (e) {
      console.error(`Error parsing formula: ${formula}`, e);
      return 0;
    }
  }

  generateLegacyToyotaFrame() {
    // ... (This logic remains from your old file for backup) ...
    let inj1 = 128; let inj2 = 128; let inj3 = 128; let inj4 = 128;
    
    if (this.simulationMode === SIMULATION_MODES.INJECTOR_FAULT) {
      inj3 = 120; // Fault
    }

    const railPressureA = Math.floor(this.railPressureBase / 256);
    const railPressureB = Math.floor(this.railPressureBase % 256);

    return {
      timestamp: Date.now(),
      rpm: this.rpm,
      speed: 0,
      coolantTemp: 85,
      mode21: {
        railPressureA, railPressureB, inj1, inj2, inj3, inj4
      }
    };
  }
}

export default new BluetoothService();