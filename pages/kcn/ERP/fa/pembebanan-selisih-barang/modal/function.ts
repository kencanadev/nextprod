import moment from 'moment';

export const handleTgl = async (date: any, tipe: string, setFilterState: any, setCheckboxState: any) => {
    if (tipe === 'tanggal_awal') {
        setFilterState((oldData: any) => ({
            ...oldData,
            tanggal_awal: date,
        }));
        setCheckboxState((oldData: any) => ({
            ...oldData,
            tanggal_input: true,
        }));
    } else if (tipe === 'tanggal_akhir') {
        setFilterState((oldData: any) => ({
            ...oldData,
            tanggal_akhir: date,
        }));
        setCheckboxState((oldData: any) => ({
            ...oldData,
            tanggal_input: true,
        }));
    }
};
