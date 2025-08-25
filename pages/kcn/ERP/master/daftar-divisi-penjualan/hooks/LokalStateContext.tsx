import React, { createContext, useContext } from 'react';
import LokalStateHooks from './lokalStateHooks';

const LokalStateContext = createContext<ReturnType<typeof LokalStateHooks> | null>(null);


const LokalStateContextDump = () => {
  return (
    <div>LokalStateContext</div>
  )
}

export default LokalStateContextDump

export const LokalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const state = LokalStateHooks();
    return <LokalStateContext.Provider value={state}>{children}</LokalStateContext.Provider>;
};

export const UseLokalState = () => {
    const context = useContext(LokalStateContext);
    if (!context) throw new Error('useLokalState must be used within a LokalStateProvider');
    return context;
};
