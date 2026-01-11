// src/context/OBDContext.jsx
import React, { createContext, useContext, useState } from 'react';
import bluetoothService from '../services/bluetooth';
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
  const [currentVehicle, setCurrentVehicle] = useState(null);

  // ฟังก์ชันเชื่อมต่อแบบระบุรุ่นรถ
  const connectToVehicle = async (vehicleType) => {
    try {
      setConnectionState(CONNECTION_STATES.CONNECTING);

      if (vehicleType === 'ISUZU') {
        bluetoothService.setVehicleConfig(isuzuSpecs);
        setCurrentVehicle('Isuzu D-Max');
      } else if (vehicleType === 'TOYOTA') {
        bluetoothService.setVehicleConfig(vigoSpecs);
        setCurrentVehicle('Toyota Vigo Champ');
      } else {
        bluetoothService.setVehicleConfig(vigoSpecs); // Default
      }

      await bluetoothService.connect();
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
      connectToVehicle, 
      disconnect 
    }}>
      {children}
    </OBDContext.Provider>
  );
}

export const useOBD = () => useContext(OBDContext);
