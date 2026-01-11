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
      // 1. Process Logic (The Brain)
      const diagnostics = DiagnosticEnforcer.processData(rawFrame.mode21);

      // 2. Filter Data based on Tier
      // Free users get Standard OBD (RPM, Speed, Temp)
      // Pro users get Deep Diagnostics (Rail Pressure, Injectors, Alerts)

      const newData = {
        rpm: rawFrame.rpm,
        speed: rawFrame.speed,
        coolantTemp: rawFrame.coolantTemp,
        // Pro only fields (masked if free)
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
        // Reset warnings if not pro
         setDiagnosticStatus({
            railSystem: { status: 'NORMAL' },
            fuelSystem: { status: 'NORMAL' }
          });
      }
    });
  }, [isPro]);

  // Handle Simulation Mode Switch
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
