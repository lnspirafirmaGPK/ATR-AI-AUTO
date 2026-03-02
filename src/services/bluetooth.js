import { BleClient } from '@capacitor-community/bluetooth-le';
import { LocalNotifications } from '@capacitor/local-notifications';
import { SIMULATION_MODES } from '../engine/SimulationEngine';

// UUID มาตรฐานสำหรับ ELM327 ส่วนใหญ่
const OBD_SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
const OBD_CHAR_UUID    = '0000fff1-0000-1000-8000-00805f9b34fb';

const initOBD = async () => {
    try {
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
        await startDataStream(deviceId);
    } catch (error) {
        console.error("Connection Failed:", error);
    }
};

const onDisconnect = (deviceId) => {
    console.warn(`Device ${deviceId} disconnected!`);
    LocalNotifications.schedule({
        notifications: [{
            title: "OBD2 Disconnected",
            body: "การเชื่อมต่อกับรถยนต์ขาดหาย กรุณาตรวจสอบอุปกรณ์",
            id: 99,
            schedule: { at: new Date(Date.now() + 1000) }
        }]
    });
};

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
            const hexString = dataViewToHexString(value);
            console.log("Raw Hex:", hexString);
        }
    );
};

const bluetoothService = {
  initOBD,
  connectToDevice,
  startDataStream,
  onData: (callback) => {}, // Mock
  setSimulationMode: (mode) => {}, // Mock
  disconnect: async () => { console.log("Disconnected"); },
  connect: async (mode) => { console.log("Connected in mode:", mode); },
  setVehicleConfig: (config) => { console.log("Vehicle Config Set"); }
};

export { SIMULATION_MODES };
export default bluetoothService;
