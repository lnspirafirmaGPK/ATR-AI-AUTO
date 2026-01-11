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
    this.vehicleConfig = null; // [เพิ่ม] เก็บค่า Config รถที่เลือก (Isuzu/Toyota)

    // Internal state for simulation
    this.rpm = 800;
    this.railPressureBase = 35000;
    this.tick = 0;
  }

  // [เพิ่ม] ฟังก์ชันสำหรับรับ Config จาก OBDContext
  setVehicleConfig(config) {
    this.vehicleConfig = config;
    console.log("BluetoothService: Vehicle Config set to", config?.vehicleName);
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

  // [เพิ่ม] ฟังก์ชันจำลองค่า Raw Data ตาม Sensor ID
  getSimulatedRawValue(sensorId) {
    if (sensorId === 'trans_temp') {
      // Simulating Isuzu ATF Temp (Formula: A-40)
      // สร้างค่า Sin wave ให้ขยับขึ้นลงช่วง 80-90 องศา
      const temp = 85 + Math.sin(this.tick * 0.05) * 5; 
      // แปลงกลับเป็น Raw Byte A (Reverse formula: Val + 40)
      return { A: Math.floor(temp + 40), B: 0 };
    }
    return { A: 0, B: 0 };
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
      railPressure += (Math.random() - 0.5) * 1000;
      inj1 += (Math.random() - 0.5) * 5;
      inj2 += (Math.random() - 0.5) * 5;
      inj3 += (Math.random() - 0.5) * 5;
      inj4 += (Math.random() - 0.5) * 5;

    } else if (this.simulationMode === SIMULATION_MODES.SCV_FAULT) {
      const wave = Math.sin(this.tick * 0.2) * 2500;
      railPressure += wave;

    } else if (this.simulationMode === SIMULATION_MODES.INJECTOR_FAULT) {
      inj3 = 120; // -8.0 approx
      railPressure += (Math.random() - 0.5) * 1000;
    }

    // Convert back to bytes for Mode 21
    const railPressureA = Math.floor(railPressure / 256);
    const railPressureB = Math.floor(railPressure % 256);

    // [เพิ่ม] จำลองค่า ATF Temp โดยเรียกใช้ฟังก์ชัน getSimulatedRawValue
    // และคำนวณค่าจริง (Formula: A - 40) เพื่อส่งให้ Dashboard แสดงผลทันที
    const transRaw = this.getSimulatedRawValue('trans_temp');
    const trans_temp_val = transRaw.A - 40;

    return {
      timestamp: Date.now(),
      rpm: this.rpm,
      speed: 0,
      coolantTemp: 85,
      trans_temp: trans_temp_val, // ส่งค่าอุณหภูมิเกียร์ไปด้วย
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
