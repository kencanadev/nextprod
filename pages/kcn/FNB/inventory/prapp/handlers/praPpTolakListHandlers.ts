import moment from 'moment';

export const createPraPpTolakListHandlers = ({
    setDate1TolakList,
    setDate2TolakList,
    setDate1PreOrderTolakList,
    setDate2PreOrderTolakList,
    setNamaBarangTolakList,
    setIsNamaBarangTolakChecked,
    setNoTolakList,
    setIsNoTolakChecked,
    setIsTanggalTolakChecked,
    setIsTanggalPreOrderTolakChecked,
}: any) => {
    const handleTglTolak = async (date: any, tipe: string) => {
        if (tipe === 'tanggalAwal') {
            setDate1TolakList(date);
            setIsTanggalTolakChecked(true);
        } else {
            setDate2TolakList(date);
            setIsTanggalTolakChecked(true);
        }
    };

    const handleTglPreOrderTolak = async (date: any, tipe: string) => {
        if (tipe === 'tanggalAwal') {
            setDate1PreOrderTolakList(date);
            setIsTanggalPreOrderTolakChecked(true);
        } else {
            setDate2PreOrderTolakList(date);
            setIsTanggalPreOrderTolakChecked(true);
        }
    };

    const handleNamaBarangInputTolak = (value: any) => {
        setNamaBarangTolakList(value);
        setIsNamaBarangTolakChecked(value.length > 0);
    };

    const handleNoInputTolak = (value: any) => {
        setNoTolakList(value);
        setIsNoTolakChecked(value.length > 0);
    };

    return {
        handleTglTolak,
        handleTglPreOrderTolak,
        handleNamaBarangInputTolak,
        handleNoInputTolak,
    };
};
