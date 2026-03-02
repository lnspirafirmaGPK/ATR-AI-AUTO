// src/context/VehicleContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import DiagnosticEnforcer from '../engine/DiagnosticEnforcer';
import SimulationEngine, { SIMULATION_MODES } from '../engine/SimulationEngine';
import bluetoothService from '../services/bluetooth';
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

  const [simulationMode, setSimulationMode] = useState(SIMULATION_MODES.NORMAL);
  const [isConnected, setIsConnected] = useState(false);

  // Sync SimulationEngine fault mode
  useEffect(() => {
    SimulationEngine.setFaultMode(simulationMode);
  }, [simulationMode]);

  // Simulation Loop
  useEffect(() => {
    let intervalId;
    if (!isConnected) {
      intervalId = setInterval(() => {
        const simData = SimulationEngine.update();
        setVehicleData(simData);

        // Run real analysis logic on simulated data
        const analysisResult = DiagnosticEnforcer.processProcessedData({
          railPressure: simData.railPressure,
          injectors: simData.injectors
        });

        setDiagnosticStatus(analysisResult.analysis);
      }, 100);
    }

    return () => clearInterval(intervalId);
  }, [isConnected]);

  const toggleSimulationMode = (mode) => {
    setSimulationMode(mode);
  };

  const connect = async () => {
    // In a real app, we might pass config here
    // For now, let's just mock connection
    setIsConnected(true);
  };

  const disconnect = async () => {
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
