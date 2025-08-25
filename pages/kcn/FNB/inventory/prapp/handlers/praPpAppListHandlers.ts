import { SetStateAction } from 'react';
import moment from 'moment';

interface PraPpAppListHandlerProps {
    setSelectedOptionApp: (value: SetStateAction<string>) => void;
    setDate1PraPpAppList: (value: SetStateAction<moment.Moment>) => void;
    setDate2PraPpAppList: (value: SetStateAction<moment.Moment>) => void;
    setNamaBarangPraPpAppList: (value: SetStateAction<string>) => void;
    setIsNamaBarangPraPpAppChecked: (value: SetStateAction<boolean>) => void;
    setNoPraPpAppList: (value: SetStateAction<string>) => void;
    setIsNoPraPpListAppChecked: (value: SetStateAction<boolean>) => void;
}

export const createPraPpAppListHandlers = ({
    setSelectedOptionApp,
    setDate1PraPpAppList,
    setDate2PraPpAppList,
    setNamaBarangPraPpAppList,
    setIsNamaBarangPraPpAppChecked,
    setNoPraPpAppList,
    setIsNoPraPpListAppChecked,
}: PraPpAppListHandlerProps) => {
    const handleOptionChangeApp = (value: string) => {
        setSelectedOptionApp(value);
    };

    const handleTglApp = async (date: any, tipe: string, setIsTanggalPraPpListAppChecked: Function) => {
        if (tipe === 'tanggalAwal') {
            setDate1PraPpAppList(date);
            setIsTanggalPraPpListAppChecked(true);
        } else {
            setDate2PraPpAppList(date);
            setIsTanggalPraPpListAppChecked(true);
        }
    };

    const handleNamaBarangPraPpInputChangeApp = (value: any) => {
        setNamaBarangPraPpAppList(value);
        setIsNamaBarangPraPpAppChecked(value.length > 0);
    };

    const handleNoInputChangeApp = (value: any) => {
        setNoPraPpAppList(value);
        setIsNoPraPpListAppChecked(value.length > 0);
    };

    return {
        handleOptionChangeApp,
        handleTglApp,
        handleNamaBarangPraPpInputChangeApp,
        handleNoInputChangeApp,
    };
};
