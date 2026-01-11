import React, { createContext, useContext, useState } from 'react';
import bluetoothService from '../services/bluetooth';

// Import Specs ของรถแต่ละรุ่น
import isuzuSpecs from '../config/isuzu_dmax_specs.json';
import vigoSpecs from '../config/vigo_champ_specs.json';

const OBDContext = createContext();

export const CONNECTION_STATES = {
    DISCONNECTED: 'DISCONNECTED',
    CONNECTING: 'CONNECTING',
    CONNECTED: 'CONNECTED',
    ERROR: 'ERROR'
};

export function OBDProvider({ children }) {
  const [connectionState, setConnectionState] = useState(CONNECTION_STATES.DISCONNECTED);
  const [currentVehicle, setCurrentVehicle] = useState(null); // เก็บว่าตอนนี้ต่อรถรุ่นอะไรอยู่

  // ฟังก์ชันสำหรับเชื่อมต่อรถตามรุ่นที่เลือก
  const connectToVehicle = async (vehicleType) => {
    try {
      setConnectionState(CONNECTION_STATES.CONNECTING);

      // 1. เลือก Config ตามรุ่นที่ส่งเข้ามา
      if (vehicleType === 'ISUZU') {
        bluetoothService.setVehicleConfig(isuzuSpecs);
        setCurrentVehicle('Isuzu D-Max');
      } else if (vehicleType === 'TOYOTA') {
        bluetoothService.setVehicleConfig(vigoSpecs);
        setCurrentVehicle('Toyota Vigo Champ');
      } else {
        // Default
        bluetoothService.setVehicleConfig(vigoSpecs);
      }

      // 2. สั่ง Bluetooth Service ให้เชื่อมต่อ
      await bluetoothService.connect();
      
      // 3. อัปเดตสถานะเมื่อต่อสำเร็จ
      setConnectionState(CONNECTION_STATES.CONNECTED);
      
    } catch (error) {
      console.error("Connection Failed:", error);
      setConnectionState(CONNECTION_STATES.ERROR);
    }
  };

  const disconnect = async () => {
    await bluetoothService.disconnect();
    setConnectionState(CONNECTION_STATES.DISCONNECTED);
    setCurrentVehicle(null);
  };

  return (
    <OBDContext.Provider value={{ 
      connectionState, 
      currentVehicle,
      connectToVehicle, // ส่งฟังก์ชันนี้ออกไปให้หน้าอื่นใช้
      disconnect 
    }}>
      {children}
    </OBDContext.Provider>
  );
}

export const useOBD = () => useContext(OBDContext);