import { createContext, useCallback, useContext, useState } from 'react';

import React from 'react'

const EntitasDataProviderDumy = () => {
  return (
    <div>EntitasDataProvider</div>
  )
}

export default EntitasDataProviderDumy

interface ContextType {
  checkedEnt: any;
  setCheckedEnt: any;
  isAllEntChecked: any;
  setIsAllEntChecked: any;
  currentEntitas: any;
  setCurrentEntitas: any;
}
const EntitasDataContext = createContext<ContextType | undefined>(undefined);

export const EntitasDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [checkedEnt, setCheckedEnt] = useState<any>({});
  const [isAllEntChecked, setIsAllEntChecked] = useState(false);
  const [currentEntitas, setCurrentEntitasState] = useState('');

  const clearDataEntitas = useCallback(() => {
    setCheckedEnt({});
    setIsAllEntChecked(false);
  }, []);

  const setCurrentEntitas = useCallback(
    (newEntitas: string) => {
      if (currentEntitas !== newEntitas) {
        clearDataEntitas(); // Clear data ketika entitas berubah
        setCurrentEntitasState(newEntitas);
      }
    },
    [currentEntitas, clearDataEntitas]
  );

  return <EntitasDataContext.Provider value={{ checkedEnt, setCheckedEnt, isAllEntChecked, setIsAllEntChecked, currentEntitas, setCurrentEntitas }}>{children}</EntitasDataContext.Provider>;
};

export const useEntitasData = () => {
  const context = useContext(EntitasDataContext);

  if (!context) {
    throw new Error('useEntitasData must be used within a EntitasDataProvider');
  }
  return context;
};
