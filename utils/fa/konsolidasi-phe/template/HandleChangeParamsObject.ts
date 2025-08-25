export interface HandleChangeParamsObject {
    tipe: string;
    valueObject: any;
    kode_entitas: string;
    token: string;
    userid: string;
    entitas: string;
    vRefreshData: any;
    setStateDataHeaderList: React.Dispatch<React.SetStateAction<any>>;
    setRecordsData: React.Dispatch<React.SetStateAction<any>>;
    setRecordsDataApprove: React.Dispatch<React.SetStateAction<any>>;
    setRecordsDataBayar: React.Dispatch<React.SetStateAction<any>>;
    setFilteredData: React.Dispatch<React.SetStateAction<any>>;
    setFilteredDataApproval: React.Dispatch<React.SetStateAction<any>>;
    setFilteredDataBaru: React.Dispatch<React.SetStateAction<any>>;

    setMasterDataState: React.Dispatch<React.SetStateAction<any>>;
    setMasterKodeDokumen: React.Dispatch<React.SetStateAction<any>>;
    setDialogInputDataVisible: React.Dispatch<React.SetStateAction<any>>;
    setRefreshKey: React.Dispatch<React.SetStateAction<any>>;
    setStateDataParams: React.Dispatch<React.SetStateAction<any>>;

    recordsData: any;
    recordsDataApprove: any;
    recordsDataBayar: any;

    masterDataState: any;
    masterKodeDokumen: any;
    dialogInputDataVisible: any;
    refreshKey: any;
    stateDataParams: any;

    setSelectedEntitas: React.Dispatch<React.SetStateAction<any>>;
    selectedEntitas: any;

    setListEntitas: React.Dispatch<React.SetStateAction<any>>;
    listEntitas: any;

    setFilteredDataRpe: React.Dispatch<React.SetStateAction<any>>;
    filteredDataRpe: any;
    recordsDataRpe: any;

    // handleRefreshData: () => void;
}

export type DataItemRPE = {
    kode_rpe: string;
    no_rpe: string;
    tgl_rpe: string;
    via: string;
    kode_termin: string | null;
    kode_mu: string;
    kurs: string;
    total_berat: number;
    total_mu: string;
    netto_mu: string;
    keterangan: string | null;
    status: string;
    userid: string;
    tgl_update: string;
    approval: string | null;
    tgl_approval: string | null;
    no_reff: string;
    bayar_mu: string;
    total_berat_ekspedisi: string;
    total_berat_pabrik: string;
    total_klaim_ekspedisi: string;
    total_klaim_pabrik: string;
    total_tambahan: string;
    total_pph: string;
    sub_total: string;
    pph23: string;
    biaya_lain: string;
    ket_biaya: string | null;
    potongan_lain: string;
    memo_mu: string;
    lunas_mu: string;
    kode_dokumen: string;
    kode_dokumen_rev: string;
    tgl_trxrpe: string | null;
    status_app: string;
    no_dokumen: string | null;
    no_dokumen_rev: string | null;
};

export type DataItemPHE = {
    kode_phe: string;
    no_phe: string;
    tgl_phe: string;
    via: string;
    kode_termin: string | null;
    kode_mu: string;
    kurs: string;
    total_berat: number;
    total_mu: string;
    netto_mu: string;
    keterangan: string | null;
    status: string;
    userid: string;
    tgl_update: string;
    approval: string | null;
    tgl_approval: string | null;
    no_reff: string | null;
    bayar_mu: string;
    total_berat_ekspedisi: string;
    total_berat_pabrik: string;
    total_klaim_ekspedisi: string;
    total_klaim_pabrik: string;
    total_tambahan: string;
    total_pph: string;
    sub_total: string;
    pph23: string;
    biaya_lain: string;
    ket_biaya: string | null;
    potongan_lain: string;
    kode_dokumen: string | null;
    tgl_bayar: string | null;
    kode_dokumen_rev: string | null;
    no_dokumen: string | null;
    no_dokumen_rev: string | null;
    status_app: string;
    statusApproval: any;
};
