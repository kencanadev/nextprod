import { createContext, useCallback, useContext, useState } from 'react';

interface ContextType {
    data: any;
    setData: (data: any) => void;
    plag: string;
    setPlag: (plag: string) => void;
    currentEntitas: string | null;
    setCurrentEntitas: (entitas: string) => void;
    clearData: () => void;
}

const DataHandlerContext = createContext<ContextType | undefined>(undefined);

export const DataHandlerProvider = ({ children }: { children: React.ReactNode }) => {
    const [data, setData] = useState<any>([]);
    const [plag, setPlag] = useState('asc');
    const [currentEntitas, setCurrentEntitasState] = useState<string | null>(null);

    // Function untuk clear data
    const clearData = useCallback(() => {
        setData([]);
    }, []);

    // Function untuk set entitas dengan auto clear data jika berbeda
    const setCurrentEntitas = useCallback(
        (newEntitas: string) => {
            if (currentEntitas !== newEntitas) {
                clearData(); // Clear data ketika entitas berubah
                setCurrentEntitasState(newEntitas);
            }
        },
        [currentEntitas, clearData]
    );

    return <DataHandlerContext.Provider value={{ data, setData, plag, setPlag, currentEntitas, setCurrentEntitas, clearData }}>{children}</DataHandlerContext.Provider>;
};

export const useDataHandlerContext = () => {
    const context = useContext(DataHandlerContext);

    if (!context) {
        throw new Error('useDataHandlerContext must be used within a DataHandlerProvider');
    }
    return context;
};
