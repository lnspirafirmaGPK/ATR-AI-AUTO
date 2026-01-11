import React, { createContext, useContext, useState } from 'react';

const OBDContext = createContext();

export const CONNECTION_STATES = {
    DISCONNECTED: 'DISCONNECTED',
    CONNECTING: 'CONNECTING',
    CONNECTED: 'CONNECTED',
    ERROR: 'ERROR'
};

export function OBDProvider({ children }) {
  const [connectionState, setConnectionState] = useState(CONNECTION_STATES.DISCONNECTED);

  return (
    <OBDContext.Provider value={{ connectionState, setConnectionState }}>
      {children}
    </OBDContext.Provider>
  );
}

export const useOBD = () => useContext(OBDContext);
