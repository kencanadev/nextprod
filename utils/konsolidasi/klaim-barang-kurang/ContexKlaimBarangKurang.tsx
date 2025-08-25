import { useContext, useEffect, useState } from "react";
import { createContext } from "react";

type ExampleContextType = {
    dialogOpen: boolean;
    setDialogOpen: (value: boolean) => void;
};

const StateContext = createContext<ExampleContextType | null>(null);

export const ExampleProvider = ({ children }: any) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Mencegah render di SSR

    return <StateContext.Provider value={{ dialogOpen, setDialogOpen }}>{children}</StateContext.Provider>;
};

export const useExample = () => {
    const context = useContext(StateContext);
    
    return context ?? { dialogOpen: false, setDialogOpen: () => {} };
};