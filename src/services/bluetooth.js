import { BleClient, numberToUUID } from '@capacitor-community/bluetooth-le';
import { BackgroundRunner } from '@capacitor/background-runner';
import { LocalNotifications } from '@capacitor/local-notifications';
import { parseMode21 } from '../engine/parsers/toyotaMode21'; // อ้างอิงจากโครงสร้างไฟล์ของคุณ
import { checkCriticalValues } from '../engine/DiagnosticEnforcer'; // สมมติว่ามีฟังก์ชันนี้

// UUID มาตรฐานสำหรับ ELM327 ส่วนใหญ่
const OBD_SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
const OBD_CHAR_UUID    = '0000fff1-0000-1000-8000-00805f9b34fb';

export const initOBD = async () => {
    try {
        // androidNeverForLocation: true ช่วยลดความยุ่งยากเรื่อง Permission ใน Android 12+
        await BleClient.initialize({ androidNeverForLocation: true });
        console.log("Bluetooth initialized");
    } catch (error) {
        console.error("Bluetooth Init Failed:", error);
        throw error;
    }
};

export const connectToDevice = async (deviceId) => {
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

export const startDataStream = async (deviceId) => {
    await BleClient.startNotifications(
        deviceId,
        OBD_SERVICE_UUID,
        OBD_CHAR_UUID,
        (value) => {
            // 1. แปลง Raw Data เป็น Hex String
            const hexString = dataViewToHexString(value);
            console.log("Raw Hex:", hexString);

            // 2. ส่งเข้า Parser (Toyota Mode 21)
            // สมมติว่า parseMode21 คืนค่าเป็น Object { railPressure: 25000, coolantTemp: 90, ... }
            const engineData = parseMode21(hexString); 

            // 3. ส่งข้อมูลไปอัปเดต UI (ผ่าน Context หรือ State Management)
            // updateVehicleState(engineData); 

            // 4. ตรวจสอบความปลอดภัย (Logic Enforcer)
            const analysisResult = checkCriticalValues(engineData);
            
            if (analysisResult.isCritical) {
                 triggerCriticalAlert(analysisResult.message);
            }
        }
    );
};

const triggerCriticalAlert = async (message) => {
    // แจ้งเตือนผ่าน Notification
    await LocalNotifications.schedule({
        notifications: [{
            title: "⚠️ CRITICAL WARNING",
            body: message,
            id: Date.now(),
            actionTypeId: "CRITICAL_ACTION",
            sound: "alert_sound.wav" // เสียงเตือนเฉพาะ
        }]
    });

    // สั่นเตือน (Haptic Feedback)
    if (navigator.vibrate) {
        navigator.vibrate([500, 200, 500]); // สั่น-หยุด-สั่น
    }

    // ส่ง Event ไปยัง Background Runner (ถ้าจำเป็นต้องรัน Logic หนักๆ ต่อ)
    try {
        await BackgroundRunner.dispatchEvent({
            label: 'com.atr.autoai.task',
            event: 'criticalAlert',
            details: { msg: message, timestamp: Date.now() }
        });
    } catch (e) {
        console.log("Background dispatch optional check");
    }
};
