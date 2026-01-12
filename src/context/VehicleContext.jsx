// src/context/VehicleContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import DiagnosticEnforcer from '../engine/DiagnosticEnforcer';
import SimulationEngine from '../engine/SimulationEngine';
import bluetoothService, { SIMULATION_MODES } from '../services/bluetooth';
import { useUser } from './UserContext';

const VehicleContext = createContext();

export function VehicleProvider({ children }) {
  const { isPro } = useUser();
  const [vehicleData, setVehicleData] = useState({
    rpm: 0,
    speed: 0,
    coolantTemp: 0,
    trans_temp: 0,
    railPressure: 0,
    injectors: { 1: 0, 2: 0, 3: 0, 4: 0 },
  });

  const [diagnosticStatus, setDiagnosticStatus] = useState({
    railSystem: { status: 'NORMAL' },
    fuelSystem: { status: 'NORMAL' }
  });

  // Note: simulationMode here was referring to Bluetooth service internal simulation
  // We are overriding this with our new SimulationEngine for the UI Demo
  const [simulationMode, setSimulationMode] = useState('NORMAL');
  const [isConnected, setIsConnected] = useState(false);

  // Simulation Loop
  useEffect(() => {
    let intervalId;
    if (!isConnected) {
      // Run Simulation Engine if not connected to real OBD
      intervalId = setInterval(() => {
        const simData = SimulationEngine.update();
        
        // Use DiagnosticEnforcer to analyze simulated data too
        // We mock the mode21 object structure expected by Enforcer
        const mockMode21 = {
          railPressureA: 0, railPressureB: 0, // Enforcer expects raw bytes, but we might skip for sim
          // For simplicity in Demo, we pass values directly if Enforcer allows,
          // OR we just use simData directly for display and mock the status.
        };

        setVehicleData(simData);

        // Simple mock status for simulation
        if (simData.railPressure > 160000) {
           setDiagnosticStatus(prev => ({ ...prev, railSystem: { status: 'WARNING' } }));
        } else {
           setDiagnosticStatus(prev => ({ ...prev, railSystem: { status: 'NORMAL' } }));
        }

      }, 100); // 10Hz update rate
    }

    return () => clearInterval(intervalId);
  }, [isConnected]);

  // Real Bluetooth Data Handler (Commented out if bluetoothService exports are missing/broken in this env)
  /*
  useEffect(() => {
    if (isConnected) {
       bluetoothService.onData((rawFrame) => { ... });
    }
  }, [isConnected, isPro]);
  */

  const toggleSimulationMode = (mode) => {
    setSimulationMode(mode);
    // bluetoothService.setSimulationMode(mode);
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
