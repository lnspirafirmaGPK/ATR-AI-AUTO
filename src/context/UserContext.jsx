// src/context/UserContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { USER_TIERS } from '../utils/constants';

const UserContext = createContext();

export { USER_TIERS };

export function UserProvider({ children }) {
  const [userTier, setUserTier] = useState(() => {
    return localStorage.getItem('user_tier') || USER_TIERS.FREE;
  });

  const [ownerName, setOwnerName] = useState(() => {
    return localStorage.getItem('owner_name') || 'Guest';
  });

  const upgradeToPro = () => {
    setUserTier(USER_TIERS.PRO);
    localStorage.setItem('user_tier', USER_TIERS.PRO);
  };

  const upgradeToGoldenKey = (name = 'Master') => {
    setUserTier(USER_TIERS.GOLDEN_KEY);
    setOwnerName(name);
    localStorage.setItem('user_tier', USER_TIERS.GOLDEN_KEY);
    localStorage.setItem('owner_name', name);
  };

  const downgradeToFree = () => {
    setUserTier(USER_TIERS.FREE);
    localStorage.setItem('user_tier', USER_TIERS.FREE);
  };

  const isPro = userTier === USER_TIERS.PRO || userTier === USER_TIERS.GOLDEN_KEY;
  const isGoldenKey = userTier === USER_TIERS.GOLDEN_KEY;

  return (
    <UserContext.Provider value={{
      userTier,
      isPro,
      isGoldenKey,
      ownerName,
      upgradeToPro,
      upgradeToGoldenKey,
      downgradeToFree
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
