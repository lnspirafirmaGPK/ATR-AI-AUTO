// src/context/UserContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { USER_TIERS } from '../utils/constants';

const UserContext = createContext();

export { USER_TIERS };

export function UserProvider({ children }) {
  const [userTier, setUserTier] = useState(() => {
    return localStorage.getItem('user_tier') || USER_TIERS.FREE;
  });

  const upgradeToPro = () => {
    setUserTier(USER_TIERS.PRO);
    localStorage.setItem('user_tier', USER_TIERS.PRO);
  };

  const downgradeToFree = () => {
    setUserTier(USER_TIERS.FREE);
    localStorage.setItem('user_tier', USER_TIERS.FREE);
  };

  const isPro = userTier === USER_TIERS.PRO;

  return (
    <UserContext.Provider value={{ userTier, isPro, upgradeToPro, downgradeToFree }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
