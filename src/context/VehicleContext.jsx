// src/context/VehicleContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import DiagnosticEnforcer from '../engine/DiagnosticEnforcer';
import bluetoothService, { SIMULATION_MODES } from '../services/bluetooth';
import { useUser } from './UserContext';

const VehicleContext = createContext();

export function VehicleProvider({ children }) {
  const { isPro } = useUser();
  const [vehicleData, setVehicleData] = useState({
    rpm: 0,
    speed: 0,
    coolantTemp: 0,
    trans_temp: 0, // [เพิ่ม] รองรับค่าอุณหภูมิน้ำมันเกียร์สำหรับ Isuzu และรุ่นอื่น ๆ
    railPressure: 0,
    injectors: { 1: 0, 2: 0, 3: 0, 4: 0 },
  });

  const [diagnosticStatus, setDiagnosticStatus] = useState({
    railSystem: { status: 'NORMAL' },
    fuelSystem: { status: 'NORMAL' }
  });

  const [simulationMode, setSimulationMode] = useState(SIMULATION_MODES.NORMAL);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // รับข้อมูลดิบจาก Bluetooth Service
    bluetoothService.onData((rawFrame) => {
      // 1. ประมวลผลตรรกะการวินิจฉัย (สำหรับค่าที่ต้องวิเคราะห์เชิงลึก เช่น แรงดันราง)
      const diagnostics = DiagnosticEnforcer.processData(rawFrame.mode21);

      // 2. จัดโครงสร้างข้อมูลใหม่เพื่อส่งไปยัง UI
      const newData = {
        rpm: rawFrame.rpm,
        speed: rawFrame.speed,
        coolantTemp: rawFrame.coolantTemp,
        // [เพิ่ม] รับค่า trans_temp ที่คำนวณสูตรมาแล้วจาก bluetoothService
        trans_temp: rawFrame.trans_temp || 0, 
        
        // ฟิลด์สำหรับสมาชิก Pro เท่านั้น (ถ้าเป็น Free จะถูกซ่อนค่า)
        railPressure: isPro ? diagnostics.values.railPressure : null,
        injectors: isPro ? diagnostics.values.injectors : null,
      };

      setVehicleData(newData);

      // อัปเดตสถานะการวินิจฉัยสำหรับผู้ใช้ Pro
      if (isPro) {
        setDiagnosticStatus({
          railSystem: diagnostics.analysis.railSystem,
          fuelSystem: diagnostics.analysis.fuelSystem
        });
      } else {
        // รีเซ็ตสถานะเป็นปกติสำหรับผู้ใช้ทั่วไป
         setDiagnosticStatus({
            railSystem: { status: 'NORMAL' },
            fuelSystem: { status: 'NORMAL' }
          });
      }
    });
  }, [isPro]);

  // จัดการการสลับโหมดจำลอง (Simulation)
  const toggleSimulationMode = (mode) => {
    setSimulationMode(mode);
    bluetoothService.setSimulationMode(mode);
  };

  const connect = async () => {
    await bluetoothService.connect(simulationMode);
    setIsConnected(true);
  };

  const disconnect = async () => {
    await bluetoothService.disconnect();
    setIsConnected(false);
  };

  return (
    <VehicleContext.Provider value={{
      vehicleData,
      diagnosticStatus,
      simulationMode,
      toggleSimulationMode,
      isConnected,
      connect,
      disconnect
    }}>
      {children}
    </VehicleContext.Provider>
  );
}

export const useVehicle = () => useContext(VehicleContext);