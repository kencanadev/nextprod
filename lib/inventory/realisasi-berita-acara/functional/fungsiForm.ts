import { HandleChangeParamsObject } from '@/utils/inventory/realisasi-berita-acara/template/HandleChangeParamsObject';

const pilihSemua = async (params: HandleChangeParamsObject) => {
    if (params.selectedEntitas.length !== params.listEntitas.length) {
        const cabang: any = [];
        await Promise.all(
            params.listEntitas.map((item: any) => {
                return cabang.push(item.kodecabang);
            })
        );
        params.setSelectedEntitas([...cabang]);
    } else {
        params.setSelectedEntitas([]);
    }
};

const handleCheckboxChange = (kode: any, params: HandleChangeParamsObject) => {
    console.log(`selectedEntitas.includes(${kode})`, params.selectedEntitas.includes(kode));

    params.setSelectedEntitas((prevSelectedEntitas: any) => {
        // Check if kode is already selected
        if (prevSelectedEntitas.includes(kode)) {
            // Remove the kode from selected codes if already selected
            return prevSelectedEntitas.filter((item: any) => item !== kode);
        } else {
            // Add kode to selected codes if not already selected
            return [...prevSelectedEntitas, kode];
        }
    });
};

const handleRowSelectedKonsolidasiRba = (args: any, params: HandleChangeParamsObject) => {
    if (args.data !== undefined) {
        params.setMasterDataState('APPKONSOLIDASIRBA');
        params.setMasterKodeDokumen(args.data.kode_rpeba);
        params.setStateDataHeaderList((prevState: any) => ({
            ...prevState,
            dataEntitas: args.data.entitas,
            app: args.data.app,
            jumlahCabang: args.data.jumlah_cabang,
            jumlahPabrik: args.data.jumlah_pabrik,
        }));
        // params.setDialogInputDataVisibleRba(true);
    }
};

const handleRowSelectedRba = (args: any, params: HandleChangeParamsObject) => {
    if (args.data !== undefined) {
        // params.setMasterDataState('EDIT');
        params.setMasterKodeDokumen(args.data.kode_rpeba);
        params.setStateDataHeaderList((prevState: any) => ({
            ...prevState,
            dataEntitas: args.data.entitas,
            app: args.data.app,
            jumlahCabang: args.data.jumlah_cabang,
            jumlahPabrik: args.data.jumlah_pabrik,
        }));
        // params.setDialogInputDataVisibleRba(true);
    }
};

const handleDoubleClickKonsolidasiRba = (args: any, params: HandleChangeParamsObject) => {
    params.setRefreshKey((prevKey: any) => prevKey + 1);
    if (args.rowData !== undefined) {
        params.setMasterDataState('EDITKONSOLIDASIRBA');
        params.setMasterKodeDokumen(args.rowData.kode_rpeba);
        params.setDialogInputDataVisibleRba(true);
        params.setStateDataHeaderList((prevState: any) => ({
            ...prevState,
            dataEntitas: args.rowData.entitas,
        }));
    }
};

const handleDoubleClickRba = (args: any, params: HandleChangeParamsObject) => {
    params.setRefreshKey((prevKey: any) => prevKey + 1);
    if (args.rowData !== undefined) {
        params.setMasterDataState('EDIT');
        params.setMasterKodeDokumen(args.rowData.kode_rpeba);
        params.setDialogInputDataVisibleRba(true);
        // params.setStateDataHeaderList((prevState: any) => ({
        //     ...prevState,
        //     dataEntitas: args.rowData.entitas,
        // }));
    }
};

export { handleRowSelectedRba, handleDoubleClickRba, handleDoubleClickKonsolidasiRba, handleRowSelectedKonsolidasiRba, pilihSemua, handleCheckboxChange };
