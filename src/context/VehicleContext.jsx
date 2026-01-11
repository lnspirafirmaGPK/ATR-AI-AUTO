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
    trans_temp: 0, // [เพิ่มใหม่] รองรับค่าอุณหภูมิเกียร์
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
    bluetoothService.onData((rawFrame) => {
      // 1. Process Logic
      const diagnostics = DiagnosticEnforcer.processData(rawFrame.mode21);

      // 2. Map Data
      const newData = {
        rpm: rawFrame.rpm,
        speed: rawFrame.speed,
        coolantTemp: rawFrame.coolantTemp,
        trans_temp: rawFrame.trans_temp || 0, // [เพิ่มใหม่] รับค่าจาก Service
        
        railPressure: isPro ? diagnostics.values.railPressure : null,
        injectors: isPro ? diagnostics.values.injectors : null,
      };

      setVehicleData(newData);

      if (isPro) {
        setDiagnosticStatus({
          railSystem: diagnostics.analysis.railSystem,
          fuelSystem: diagnostics.analysis.fuelSystem
        });
      } else {
         setDiagnosticStatus({
            railSystem: { status: 'NORMAL' },
            fuelSystem: { status: 'NORMAL' }
          });
      }
    });
  }, [isPro]);

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
