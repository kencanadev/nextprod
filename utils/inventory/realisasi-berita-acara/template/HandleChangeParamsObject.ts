export interface HandleChangeParamsObject {
    kode_entitas: string;
    token: string;
    userid: string;
    entitas: string;
    vRefreshData: any;
    tipe: string;
    valueObject: any;
    // setStateDataHeaderList: React.Dispatch<React.SetStateAction<any>>;
    // setRecordsData: React.Dispatch<React.SetStateAction<any>>;
    // setRecordsDataApprove: React.Dispatch<React.SetStateAction<any>>;
    // setRecordsDataBayar: React.Dispatch<React.SetStateAction<any>>;
    // setFilteredData: React.Dispatch<React.SetStateAction<any>>;
    // setFilteredDataApproval: React.Dispatch<React.SetStateAction<any>>;
    // setFilteredDataBaru: React.Dispatch<React.SetStateAction<any>>;

    setMasterDataState: React.Dispatch<React.SetStateAction<any>>;
    setMasterKodeDokumen: React.Dispatch<React.SetStateAction<any>>;
    setDialogInputDataVisibleRba: React.Dispatch<React.SetStateAction<any>>;
    setRefreshKey: React.Dispatch<React.SetStateAction<any>>;
    setStateDataHeaderList: React.Dispatch<React.SetStateAction<any>>;
    // setDialogInputDataVisible: React.Dispatch<React.SetStateAction<any>>;
    // setStateDataParams: React.Dispatch<React.SetStateAction<any>>;

    // recordsData: any;
    // recordsDataApprove: any;
    // recordsDataBayar: any;

    masterDataState: any;
    masterKodeDokumen: any;
    dialogInputDataVisibleRba: any;
    refreshKey: any;

    // dialogInputDataVisible: any;
    // stateDataParams: any;

    setSelectedEntitas: React.Dispatch<React.SetStateAction<any>>;
    selectedEntitas: any;

    setListEntitas: React.Dispatch<React.SetStateAction<any>>;
    listEntitas: any;

    // setFilteredDataRpe: React.Dispatch<React.SetStateAction<any>>;
    // filteredDataRpe: any;
    // recordsDataRpe: any;

    // handleRefreshData: () => void;

    gridListDataKonsolidasiRbaRef: any;
}

export const apiPph22 = [
    { id: 1, value: 'N', nama_pph: 'Tanpa Pajak', enabled: true },
    { id: 2, value: 'T', nama_pph: 'PPN', enabled: true },
    { id: 3, value: 'P', nama_pph: 'PPN - PPH22', enabled: true },
];
