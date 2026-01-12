import { BleClient, numberToUUID } from '@capacitor-community/bluetooth-le';
import { BackgroundRunner } from '@capacitor/background-runner';
import { LocalNotifications } from '@capacitor/local-notifications';
import { parseRailPressure } from '../engine/parsers/toyotaMode21'; // Corrected import
// import { checkCriticalValues } from '../engine/DiagnosticEnforcer'; // Removed circular/missing import for now

// Simulation Modes Constant
export const SIMULATION_MODES = {
  NORMAL: 'NORMAL',
  SCV_FAULT: 'SCV_FAULT',
  INJECTOR_FAULT: 'INJECTOR_FAULT'
};

// UUID มาตรฐานสำหรับ ELM327 ส่วนใหญ่
const OBD_SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
const OBD_CHAR_UUID    = '0000fff1-0000-1000-8000-00805f9b34fb';

const initOBD = async () => {
    try {
        // androidNeverForLocation: true ช่วยลดความยุ่งยากเรื่อง Permission ใน Android 12+
        await BleClient.initialize({ androidNeverForLocation: true });
        console.log("Bluetooth initialized");
    } catch (error) {
        console.error("Bluetooth Init Failed:", error);
        throw error;
    }
};

const connectToDevice = async (deviceId) => {
    try {
        await BleClient.connect(deviceId, (deviceId) => onDisconnect(deviceId));
        console.log("Connected to", deviceId);
        
        // เริ่มรับค่าแบบ Stream
        await startDataStream(deviceId);
    } catch (error) {
        console.error("Connection Failed:", error);
    }
};

const onDisconnect = (deviceId) => {
    console.warn(`Device ${deviceId} disconnected!`);
    // Logic การ Reconnect อัตโนมัติควรอยู่ที่นี่
    LocalNotifications.schedule({
        notifications: [{
            title: "OBD2 Disconnected",
            body: "การเชื่อมต่อกับรถยนต์ขาดหาย กรุณาตรวจสอบอุปกรณ์",
            id: 99,
            schedule: { at: new Date(Date.now() + 1000) }
        }]
    });
};

// ฟังก์ชันแปลง DataView เป็น Hex String
const dataViewToHexString = (dataView) => {
    return Array.from(new Uint8Array(dataView.buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
};

const startDataStream = async (deviceId) => {
    await BleClient.startNotifications(
        deviceId,
        OBD_SERVICE_UUID,
        OBD_CHAR_UUID,
        (value) => {
            // 1. แปลง Raw Data เป็น Hex String
            const hexString = dataViewToHexString(value);
            console.log("Raw Hex:", hexString);

            // Mock logic for now
        }
    );
};

// Default Export to satisfy imports
const bluetoothService = {
  initOBD,
  connectToDevice,
  startDataStream,
  onData: () => {}, // Mock
  setSimulationMode: () => {}, // Mock
  disconnect: async () => {}, // Mock
  connect: async () => {} // Mock
};

export default bluetoothService;
