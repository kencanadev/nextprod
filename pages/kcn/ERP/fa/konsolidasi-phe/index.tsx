import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { SidebarComponent, SidebarType, ContextMenuComponent } from '@syncfusion/ej2-react-navigations';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { ChangeEventArgs as ChangeEventArgsInput, FocusInEventArgs } from '@syncfusion/ej2-react-inputs';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import {
    Grid,
    AggregatesDirective,
    AggregateDirective,
    AggregateColumnsDirective,
    AggregateColumnDirective,
    Aggregate,
    GridComponent,
    ColumnDirective,
    ColumnsDirective,
    Inject,
    Page,
    Edit,
    Sort,
    Filter,
    Group,
    Resize,
    Reorder,
    Selection,
    Freeze,
    ExcelExport,
    PdfExport,
} from '@syncfusion/ej2-react-grids';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json'; // To load the culture based first day of week
import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import moment from 'moment';
import withReactContent from 'sweetalert2-react-content';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
// import { getServerSideProps } from '@/pages/api/getServerSide';

loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);

import idIDLocalization from 'public/syncfusion/locale.json';
L10n.load(idIDLocalization);

import { useSession } from '@/pages/api/sessionContext';
import { TabComponent } from '@syncfusion/ej2-react-navigations';
import {
    handleDoubleClick,
    handleDoubleClickApp,
    handleDoubleClickOD,
    handleRowSelected,
    handleRowSelectedOD,
    pencarianBayar,
    pencarianNoPhe,
    showLoading1,
    swalToast,
} from '@/lib/fa/konsolidasi-phe/functional/fungsiForm';
import style from '@/styles/index.module.css';
import { usersApp, appBackdate, usersMenu } from '@/utils/global/fungsi';
import DialogKonsolidasiPhe from './component/dialogKonsolidasiPhe';
import { handleCheckboxChange, pilihSemua, swalDialog, swalPopUp, totBayarMu, totBayarMuPheBaru, totNettoMuPheBaru } from '@/lib/fa/konsolidasi-phe/functional/fungsiForm';
import { GetAllEntitas, PostReleasePhe, getListCekNoInvPheKonsolidasi, getListPhe, getListPheKonsolidasi } from '@/lib/fa/konsolidasi-phe/api/api';
import { Tab } from '@headlessui/react';
import { CustomSumBayarMu, CustomSumBayarMuPheBaru, CustomSumNettoMuPheBaru } from '@/utils/fa/konsolidasi-phe/interface/fungsi';
import { DataItemPHE, DataItemRPE } from '@/utils/fa/konsolidasi-phe/template/HandleChangeParamsObject';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { LinearProgress } from '@mui/material';

enableRipple(true);

let textareaObj: any;
const KonsolidasiPhe = () => {
    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const nip = sessionData?.nip ?? '';
    const kode_user = sessionData?.nip ?? '';
    const entitas = sessionData?.entitas ?? '';
    const token = sessionData?.token ?? '';

    if (isLoading) {
        return;
    }

    const router = useRouter();
    const rowIdxListData = useRef(0);

    let sidebarObj: SidebarComponent;
    let type: SidebarType = 'Push';
    let mediaQueryState: string = '(min-width: 600px)';

    // =====================================================================
    // INI KODINGAN TERBARU PHE
    const [stateFiilterData, setStateFilterData] = useState({
        noPheValue: '',
        date1: moment(),
        date2: moment().endOf('month'),
        namaEkspedisiValue: '',
        noReffValue: '',
        selectedOptionPph: 'semua',
        selectedOptionLunas: 'semua',
    });

    const [stateChecked, setStateChecked] = useState({
        isNoPheChecked: false,
        isTanggalChecked: true,
        isNamaEkspedisiChecked: false,
        isNoReffChecked: false,
    });

    const [stateDataHeaderList, setStateDataHeaderList] = useState({
        searchNoPhe: '',
        searchBayar: '',
    });

    const [stateDataParams, setStateDataParams] = useState({
        via: '',
        pph23: '',
        kode_phe: '',
        kode_rpe: '',
        kode_dokumen: '', // untuk pembayaran kalo ada jurnal
        statusApproval: '',
        status: '',
        status_app: '',
        no_dokumen: '',
        no_phe: '',
        tgl_phe: '',
        filterTab: '',
        kodeEntitasKonsolidasi: '',
    });
    // END

    interface UserMenuState {
        baru: any;
        edit: any;
        hapus: any;
        cetak: any;
        app_fpp: any;
    }
    const [userMenu, setUserMenu] = useState<UserMenuState>({ baru: '', edit: '', hapus: '', cetak: '', app_fpp: '' });
    const kode_menu = '60203'; // kode menu Konsolidasi PHE
    const [refreshKey, setRefreshKey] = useState(0);

    type PHEListItem = {
        no_phe: string;
        tgl_phe: any;
        via: any;
        no_reff: any;
        pph23: any;
        netto_mu: any;
        total_mu: any;
        status: any;
        statusApproval: any;
        no_dokumen: any;
        no_dokumen_rev: any;
    };

    type RPEListItem = {
        no_rpe: string;
        tgl_rpe: any;
        via: any;
        no_reff: any;
        pph23: any;
        netto_mu: any;
        total_mu: any;
        status: any;
        no_dokumen: any;
        no_dokumen_rev: any;
    };

    const [recordsDataRpe, setRecordsDataRpe] = useState<RPEListItem[]>([]);
    const [recordsData, setRecordsData] = useState<PHEListItem[]>([]);
    const [recordsDataApprove, setRecordsDataApprove] = useState<PHEListItem[]>([]);
    const [recordsDataBayar, setRecordsDataBayar] = useState<PHEListItem[]>([]);
    const recordsDataRpeRef = useRef<RPEListItem[]>([]);
    const recordsDataRef = useRef<PHEListItem[]>([]);
    const recordsDataApproveRef = useRef<PHEListItem[]>([]);
    const recordsDataBayarRef = useRef<PHEListItem[]>([]);
    const [filteredDataRpe, setFilteredDataRpe] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [filteredDataApproval, setFilteredDataApproval] = useState<any[]>([]);
    const [filteredDataBayar, setFilteredDataBaru] = useState<any[]>([]);
    const [listEntitas, setListEntitas] = useState<any>([]);

    // INI YANG TERBARU
    const [masterDataState, setMasterDataState] = useState<string>('BARU');
    const [masterKodeDokumen, setMasterKodeDokumen] = useState<string>('BARU');
    const [masterBarangProduksi, setMasterBarangProduksi] = useState<string>('Y');
    const [dialogInputDataVisible, setDialogInputDataVisible] = useState(false);

    //=========== Setting format tanggal sesuai locale ID ===========
    const formatDate: Object = { type: 'date', format: 'dd-MM-yyyy' };

    // let gridListData: Grid | any;
    const gridListDataRPERef = useRef<GridComponent>(null);
    const gridListDataRef = useRef<GridComponent>(null);
    const gridListDataApprovalRef = useRef<GridComponent>(null);
    const gridListDataBayarRef = useRef<GridComponent>(null);

    const styleButton = { width: 57 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#3b3f5c' };
    const styleButtonApp = { fontWeight: 'bold', width: 57 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#e6e6e6' };
    const styleButtonDisabled = { width: 57 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#ece7f5' };

    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [windowHeight, setWindowHeight] = useState(0);
    const gridWidth = sidebarVisible ? 'calc(100% - 315px)' : '100%';

    const tanggalSekarang = moment();
    // Menentukan tanggal awal bulan
    const tanggalAwalBulan = tanggalSekarang.startOf('month');
    // Menentukan tanggal akhir bulan dengan moment.js
    const tanggalHariIni = moment(new Date()).format('YYYY-MM-DD');
    const tanggalAkhirBulan = moment(tanggalAwalBulan.endOf('month')).format('YYYY-MM-DD');

    const [valueAppBackdate, setValueAppBackdate] = useState(true);
    const vRefreshData = useRef(0);
    const [leblFilter, setLabelFilter] = useState('Data RPE');

    const useSelectedEntitas = (entitasLogin: string) => {
        // Ambil dari localStorage berdasarkan entitas yang sedang login
        const [selectedEntitas, setSelectedEntitas] = useState<string[]>(() => {
            const storedData = localStorage.getItem(`selectedEntitas_${entitasLogin}`);
            return storedData ? JSON.parse(storedData) : [];
        });

        // Simpan ke localStorage setiap kali `selectedEntitas` berubah
        useEffect(() => {
            localStorage.setItem(`selectedEntitas_${entitasLogin}`, JSON.stringify(selectedEntitas));
        }, [selectedEntitas, entitasLogin]);

        return { selectedEntitas, setSelectedEntitas };
    };

    // const [selectedEntitas, setSelectedEntitas] = useState<any>([]);
    const { selectedEntitas, setSelectedEntitas } = useSelectedEntitas(kode_entitas);
    const [errorMassage, setErrorMassage] = useState<any>('');
    const [currentIndicator, setCurrentIndicator] = useState<any>('');
    const [showLoadingModal, setShowLoadingModal] = useState<any>(false);
    // const [isLoading, setIsLoading] = useState<any>(0);
    const [isLoadingModal, setIsLoadingModal] = useState<any>(0);
    // const [kodeEntitasKonsolidasi, setKodeEntitasKonsolidasi] = useState<any>(0);

    // ====================== FUNGSI FUNGSI BARU PHE ==========================

    const fetchDataUseEffect = async () => {
        await usersMenu(kode_entitas, userid, kode_menu)
            .then((result) => {
                const { baru, edit, hapus, cetak } = result;
                setUserMenu((prevState) => ({
                    ...prevState,
                    baru: baru,
                    edit: edit,
                    hapus: hapus,
                    cetak: cetak,
                }));
            })
            .catch((error) => {
                console.error('Error:', error);
            });

        await appBackdate(kode_entitas, userid)
            .then((result) => {
                setValueAppBackdate(result);
            })
            .catch((error) => {
                console.error('Error:', error);
            });

        const respUsersApp = await usersApp(kode_entitas, userid);
        setUserMenu((prevState: any) => ({
            ...prevState,
            app_fpp: respUsersApp[0].app_fpp,
        }));

        const allEntitas = await GetAllEntitas(kode_entitas, token);
        setListEntitas(allEntitas);
        // console.log('respUsersApp = ', respUsersApp[0].app_fpp);
    };

    useEffect(() => {
        const refreshData = async () => {
            let entitas = kode_entitas;
            let noPhe = 'all';
            let tglAwal = tanggalHariIni; //tanggalHariIni
            let tglAkhir = tanggalAkhirBulan; //tanggalAkhirBulan
            // let tglAwal = '2024-12-18'; //tanggalHariIni
            // let tglAkhir = '2024-12-18'; //tanggalAkhirBulan

            let namaEkspedisi = 'all';
            let noReff = 'all';
            let pph23 = 'all';
            let statusLunas = 'all';

            const paramObject = {
                kode_entitas: entitas,
                noPhe: noPhe,
                tglAwal: tglAwal, //tanggalHariIni
                tglAkhir: tglAkhir, //tanggalAkhirBulan

                namaEkspedisi: namaEkspedisi,
                noReff: noReff,
                pph23: pph23,
                statusLunas: statusLunas,
                token: token,
            };

            const responseDataBaru = await getListPhe(paramObject, '0');
            const responseDataApproval = await getListPhe(paramObject, '1');
            const responseDataPembayaran = await getListPhe(paramObject, '2');
            // const allEntitas = await GetAllEntitas(kode_entitas, token);

            // Menambahkan field baru ke responseDataApprove
            const responseDataBaruFix = responseDataBaru.map((item: any) => ({
                ...item,
                statusApproval: 'Baru',
                netto_mu: parseFloat(item.netto_mu),
                total_mu: parseFloat(item.total_mu),
            }));

            const responseDataApproveFix = responseDataApproval.map((item: any) => ({
                ...item,
                statusApproval: 'Approval',
                netto_mu: parseFloat(item.netto_mu),
                total_mu: parseFloat(item.total_mu),
            }));

            const responseDataBayarFix = responseDataPembayaran.map((item: any) => ({
                ...item,
                statusApproval: 'Bayar',
                netto_mu: parseFloat(item.netto_mu),
                total_mu: parseFloat(item.total_mu),
            }));

            setRecordsData(responseDataBaruFix);
            setRecordsDataApprove(responseDataApproveFix);
            setRecordsDataBayar(responseDataBayarFix);
            // setListEntitas(allEntitas);

            recordsDataRef.current = responseDataBaruFix;
            recordsDataApproveRef.current = responseDataApproveFix;
            recordsDataBayarRef.current = responseDataBayarFix;
        };
        if (selectedEntitas.length > 0) {
            refreshData();
        }
        fetchDataUseEffect();
    }, []);

    const hasilJsonListPHE: { responseDataBaruFix: DataItemPHE[]; responseDataApproveFix: DataItemPHE[]; responseDataBayarFix: DataItemPHE[] } = {
        responseDataBaruFix: [],
        responseDataApproveFix: [],
        responseDataBayarFix: [],
    };

    const hasilJsonListRPE: { data: DataItemRPE[] } = {
        data: [], // Array berisi objek dengan tipe `DataItem`
    };

    const handleRefreshData = async () => {
        if (selectedEntitas.length <= 0) {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: '<p style="font-size:12px; color:white;">Pilih Entitas terlebih dahulu</p>',
                width: '100%',
                customClass: {
                    popup: style['colored-popup'], // Custom class untuk sweetalert
                },
            });
            return;
        } else {
            vRefreshData.current += 1;
            const cariNoPhe = document.getElementById('cariNoPhe') as HTMLInputElement;
            if (cariNoPhe) {
                cariNoPhe.value = '';
            }

            const cariBayar = document.getElementById('cariBayar') as HTMLInputElement;
            if (cariBayar) {
                cariBayar.value = '';
            }
            setStateDataHeaderList((prevState: any) => ({
                ...prevState,
                searchNoPhe: '',
                searchBayar: '',
            }));
            await showLoading1(true);
            if (kode_entitas !== null || kode_entitas !== '') {
                try {
                    let entitas = kode_entitas;
                    let noPhe = 'all';
                    let tglAwal = 'all'; //tanggalHariIni
                    let tglAkhir = 'all'; //tanggalAkhirBulan

                    let namaEkspedisi = 'all';
                    let noReff = 'all';
                    let pph23 = 'all';
                    let statusLunas = 'all';

                    if (stateChecked.isNoPheChecked) {
                        noPhe = `${stateFiilterData.noPheValue}`;
                    }

                    if (stateChecked.isTanggalChecked) {
                        const formattedDate1 = stateFiilterData.date1.format('YYYY-MM-DD');
                        const formattedDate2 = stateFiilterData.date2.format('YYYY-MM-DD');
                        tglAwal = `${formattedDate1}`;
                        tglAkhir = `${formattedDate2}`;
                    }

                    if (stateChecked.isNamaEkspedisiChecked) {
                        namaEkspedisi = `${stateFiilterData.namaEkspedisiValue}`;
                    }

                    if (stateChecked.isNoReffChecked) {
                        noReff = `${stateFiilterData.noReffValue}`;
                    }

                    if (stateFiilterData.selectedOptionPph === 'semua') {
                        pph23 = 'all';
                    } else if (stateFiilterData.selectedOptionPph === 'ya') {
                        pph23 = 'P';
                    } else if (stateFiilterData.selectedOptionPph === 'tidak') {
                        pph23 = 'N';
                    }

                    if (stateFiilterData.selectedOptionLunas === 'semua') {
                        statusLunas = 'all';
                    } else if (stateFiilterData.selectedOptionLunas === 'lunas') {
                        statusLunas = 'Lunas';
                    } else if (stateFiilterData.selectedOptionLunas === 'batalBayar') {
                        statusLunas = 'Batal Bayar';
                    }

                    for (const item of selectedEntitas) {
                        setShowLoadingModal(true);
                        setCurrentIndicator(`Memulai fetch di entitas ${item}`);
                        setIsLoadingModal(10);

                        const paramObject = {
                            kode_entitas: item,
                            noDokumen: noPhe,
                            tglAwal: tglAwal, //tanggalHariIni
                            tglAkhir: tglAkhir, //tanggalAkhirBulan

                            namaEkspedisi: namaEkspedisi,
                            noReff: noReff,
                            pph23: pph23,
                            statusLunas: statusLunas,
                            token: token,
                        };

                        const responseDataOutstandingRpe = await getListPheKonsolidasi(paramObject, '0');
                        const responseDataBaru = await getListPhe(paramObject, '0');
                        const responseDataApproval = await getListPhe(paramObject, '1');
                        const responseDataPembayaran = await getListPhe(paramObject, '2');

                        setCurrentIndicator(`Modifikasi data di entitas ${item}`);
                        setIsLoadingModal(50);
                        // Menambahkan field baru ke responseDataApprove
                        const ODRPE = responseDataOutstandingRpe.filter((item: any) => item.status?.trim().toLowerCase() === 'terbuka' && item.status_app?.trim().toLowerCase() === 'disetujui');
                        const responseDataBaruRpeFix = ODRPE.map((Data: any) => ({
                            ...Data,
                            entitas: item,
                            netto_mu: parseFloat(Data.netto_mu),
                            total_mu: parseFloat(Data.total_mu),
                            sub_total: parseFloat(Data.sub_total),
                            total_berat: parseFloat(Data.total_berat),
                        }));

                        const responseDataBaruFix = responseDataBaru.map((Data: any) => ({
                            ...Data,
                            entitas: item,
                            statusApproval: 'Baru',
                            netto_mu: parseFloat(Data.netto_mu),
                            total_mu: parseFloat(Data.total_mu),
                        }));

                        const responseDataApproveFix = responseDataApproval.map((Data: any) => ({
                            ...Data,
                            entitas: item,
                            statusApproval: 'Approval',
                            netto_mu: parseFloat(Data.netto_mu),
                            total_mu: parseFloat(Data.total_mu),
                        }));

                        const responseDataBayarFix = await Promise.all(
                            responseDataPembayaran.map(async (Data: any) => {
                                // Ambil kode_phe dari masing-masing Data
                                const kode_phe = Data.kode_phe;

                                // Panggil endpoint untuk mendapatkan data invoice
                                const responCekInvoicePembayaran = await getListCekNoInvPheKonsolidasi(item, token, kode_phe);

                                // Pastikan data ada dan merupakan array
                                const invoiceList = responCekInvoicePembayaran || [];

                                // Gabungkan nilai no_reff dengan separator ';'
                                const noInvoiceStr = invoiceList.map((invoice: any) => invoice.no_reff).join(';');

                                // Kembalikan objek yang telah dimodifikasi
                                return {
                                    ...Data,
                                    entitas: item, // Pastikan variabel 'item' sudah didefinisikan
                                    statusApproval: 'Bayar',
                                    netto_mu: parseFloat(Data.netto_mu),
                                    total_mu: parseFloat(Data.total_mu),
                                    no_invoice: noInvoiceStr, // Tambahkan field baru
                                };
                            })
                        );

                        // const responseDataBayarFix = responseDataPembayaran.map((Data: any) => ({
                        //     ...Data,
                        //     entitas: item,
                        //     statusApproval: 'Bayar',
                        //     netto_mu: parseFloat(Data.netto_mu),
                        //     total_mu: parseFloat(Data.total_mu),
                        // }));

                        // Tambahkan hasil ke array
                        hasilJsonListRPE.data.push(...responseDataBaruRpeFix);
                        hasilJsonListPHE.responseDataBaruFix.push(...responseDataBaruFix);
                        hasilJsonListPHE.responseDataApproveFix.push(...responseDataApproveFix);
                        hasilJsonListPHE.responseDataBayarFix.push(...responseDataBayarFix);

                        setIsLoadingModal(100);
                        setCurrentIndicator(`Modifikasi berhasil di entitas ${item}`);
                    }

                    setRecordsDataRpe(hasilJsonListRPE.data);
                    setRecordsData(hasilJsonListPHE.responseDataBaruFix);
                    setRecordsDataApprove(hasilJsonListPHE.responseDataApproveFix);
                    setRecordsDataBayar(hasilJsonListPHE.responseDataBayarFix);

                    recordsDataRpeRef.current = hasilJsonListRPE.data;
                    recordsDataRef.current = hasilJsonListPHE.responseDataBaruFix;
                    recordsDataApproveRef.current = hasilJsonListPHE.responseDataApproveFix;
                    recordsDataBayarRef.current = hasilJsonListPHE.responseDataBayarFix;

                    showLoading1(false);
                    setShowLoadingModal(false);
                } catch (error) {
                    console.error(error);
                    // setCurrentIndicator(`Gagal memproses entitas ${item}`);
                    setErrorMassage('terjadi kesalahan');
                }
            }
        }
    };

    const showNewRecord = async () => {
        if (masterKodeDokumen !== '' && stateDataParams.filterTab !== '') {
            setMasterDataState('BARU');
            setMasterKodeDokumen('BARU');

            setDialogInputDataVisible(true);
            setRefreshKey((prevKey) => prevKey + 1);
        }
    };

    const showEditRecord = () => {
        if (masterKodeDokumen === '' || masterKodeDokumen === 'BARU') {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: '<p style="font-size:12px; color:white;">Silahkan pilih data PHE terlebih dahulu</p>',
                width: '100%',
                customClass: {
                    popup: style['colored-popup'], // Custom class untuk sweetalert
                },
            });
            return;
        }

        setMasterDataState('EDIT');
        setMasterKodeDokumen(masterKodeDokumen);
        setDialogInputDataVisible(true);
        setRefreshKey((prevKey: any) => prevKey + 1);
    };

    const showAppBtlRecord = (tipe: any) => {
        if (stateDataParams.status === 'Lunas' && stateDataParams.statusApproval === 'Bayar') {
        } else {
            if (stateDataParams.status === 'Release') {
                withReactContent(swalToast).fire({
                    icon: 'warning',
                    title: '<p style="font-size:12px; color:white;">Status approval Release tidak dapat dibatalkan</p>',
                    width: '100%',
                    customClass: {
                        popup: style['colored-popup'], // Custom class untuk sweetalert
                    },
                });
                return;
            }

            if (stateDataParams.status === 'Batal Bayar') {
                withReactContent(swalToast).fire({
                    icon: 'warning',
                    title: '<p style="font-size:12px; color:white;">Status approval Batal Bayar tidak dapat dibatalkan</p>',
                    width: '100%',
                    customClass: {
                        popup: style['colored-popup'], // Custom class untuk sweetalert
                    },
                });
                return;
            }

            if (masterKodeDokumen === '' || masterKodeDokumen === 'BARU') {
                withReactContent(swalToast).fire({
                    icon: 'warning',
                    title: '<p style="font-size:12px; color:white;">Silahkan pilih data PHE terlebih dahulu</p>',
                    width: '100%',
                    customClass: {
                        popup: style['colored-popup'], // Custom class untuk sweetalert
                    },
                });
                return;
            }
            if (tipe === 'approval') {
                if (stateDataParams.status === 'Terbuka' && stateDataParams.statusApproval === 'Approval') {
                    withReactContent(swalToast).fire({
                        icon: 'warning',
                        title: '<p style="font-size:12px; color:white;">Status approval Disetujui tidak dapat dikoreksi</p>',
                        width: '100%',
                        customClass: {
                            popup: style['colored-popup'], // Custom class untuk sweetalert
                        },
                    });
                    return;
                }
            } else {
                if (stateDataParams.statusApproval === 'Baru' && stateDataParams.status === 'Terbuka') {
                    withReactContent(swalToast).fire({
                        icon: 'warning',
                        title: '<p style="font-size:12px; color:white;">Status approval Terbuka tidak dapat dibatalkan</p>',
                        width: '100%',
                        customClass: {
                            popup: style['colored-popup'], // Custom class untuk sweetalert
                        },
                    });
                    return;
                }
            }

            setMasterDataState(`${tipe === 'approval' ? 'APPROVAL' : 'BATAL APP'}`);
            setMasterKodeDokumen(masterKodeDokumen);
            setDialogInputDataVisible(true);
            setRefreshKey((prevKey: any) => prevKey + 1);
        }
    };

    const onClickRelease = async () => {
        const jsonData = {
            // entitas: kode_entitas,
            entitas: stateDataParams.kodeEntitasKonsolidasi,
            userid: userid.toUpperCase(),
            kode_phe: stateDataParams.kode_phe,
        };
        const reqReleasePhe = await PostReleasePhe(jsonData, token, kode_entitas);
        if (reqReleasePhe.data.status === true) {
            await withReactContent(swalPopUp).fire({
                icon: 'success',
                title: '<p style="font-size:12px;color:white;margin-right: -42px;">Data RPE berhasil di Release</p>',
                width: '50%', // Atur lebar popup sesuai kebutuhan
                heightAuto: true,
                timer: 2000,
                showConfirmButton: false, // Menampilkan tombol konfirmasi
                allowOutsideClick: false, // Menonaktifkan penutupan saat klik di luar
                allowEscapeKey: false, // Menonaktifkan penutupan dengan tombol Escape
                customClass: {
                    popup: style['colored-popup'], // Custom class untuk sweetalert
                },
            });
            handleRefreshData();
        }
    };

    const showBayarRecord = (tipe: any) => {
        if (stateDataParams.status_app === 'Disetujui') {
            if (stateDataParams.status === 'Lunas') {
            } else {
                if (masterKodeDokumen === '' || masterKodeDokumen === 'BARU') {
                    withReactContent(swalToast).fire({
                        icon: 'warning',
                        title: '<p style="font-size:12px; color:white;">Silahkan pilih data PHE terlebih dahulu</p>',
                        width: '100%',
                        customClass: {
                            popup: style['colored-popup'], // Custom class untuk sweetalert
                        },
                    });
                    return;
                }

                setMasterDataState(`${tipe === 'bayar' ? 'BAYAR' : 'BATAL BAYAR'}`);
                setMasterKodeDokumen(masterKodeDokumen);
                setDialogInputDataVisible(true);
                setRefreshKey((prevKey: any) => prevKey + 1);
            }
        }
    };

    const showBatalRecord = (tipe: any) => {
        if (stateDataParams.status === 'Lunas') {
            if (masterKodeDokumen === '' || masterKodeDokumen === 'BARU') {
                withReactContent(swalToast).fire({
                    icon: 'warning',
                    title: '<p style="font-size:12px; color:white;">Silahkan pilih data PHE terlebih dahulu</p>',
                    width: '100%',
                    customClass: {
                        popup: style['colored-popup'], // Custom class untuk sweetalert
                    },
                });
                return;
            }

            setMasterDataState(`${tipe === 'bayar' ? 'BAYAR' : 'BATAL BAYAR'}`);
            setMasterKodeDokumen(masterKodeDokumen);
            setDialogInputDataVisible(true);
            setRefreshKey((prevKey: any) => prevKey + 1);
        }
    };

    const showUpdateFilePendukung = () => {
        if (stateDataParams.filterTab === 'od') {
        } else {
            if (stateDataParams.status_app === 'Baru') {
            } else {
                if (masterKodeDokumen === '' || masterKodeDokumen === 'BARU') {
                    withReactContent(swalToast).fire({
                        icon: 'warning',
                        title: '<p style="font-size:12px; color:white;">Silahkan pilih data PHE terlebih dahulu</p>',
                        width: '100%',
                        customClass: {
                            popup: style['colored-popup'], // Custom class untuk sweetalert
                        },
                    });
                    return;
                }

                setMasterDataState(stateDataParams.status_app === 'Baru' ? 'EDIT' : 'FilePendukung');
                setMasterKodeDokumen(masterKodeDokumen);
                setDialogInputDataVisible(true);
                setRefreshKey((prevKey: any) => prevKey + 1);
            }
        }
    };

    const showReleaseRecord = () => {
        if (stateDataParams.status === 'Batal Bayar' && stateDataParams.status_app === 'Disetujui') {
            // Tambahkan CSS untuk tombol
            const style = document.createElement('style');
            style.innerHTML = `
    .swal2-popup .btn {
        margin-left: 10px;
    }

    .swal2-confirm, .swal2-cancel {
        width: 70px;  /* Atur ukuran lebar yang sama */
        height: 33px;  /* Atur ukuran tinggi yang sama */
        font-size: 14px;  /* Sesuaikan ukuran font */
    }

    .custom-content p {
        margin: 5px 0; /* Sesuaikan margin antara baris */
    }
`;
            document.head.appendChild(style);

            withReactContent(swalDialog)
                .fire({
                    title: '<p style="font-size:13px; font-weight:bold; text-align:center;">Release RPE dari Pembatalan Pembayaran Ekspedisi</p>',
                    html: `
            <div class="custom-content" style="font-size:13px; text-align:left;">
                <p><strong>No. PHE   :</strong> ${stateDataParams.no_phe}</p>
                <p><strong>Tanggal   :</strong> ${moment(stateDataParams.tgl_phe).format('DD-MM-YYYY')}</p>
            </div>
        `,
                    width: '21%',
                    // target: '#dialogTtbList',
                    confirmButtonText: 'OK',
                    cancelButtonText: 'No',
                    showCancelButton: true,
                })
                .then(async (result) => {
                    if (result.isConfirmed) {
                        onClickRelease();
                    }
                });
            return;
        } else {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: '<p style="font-size:12px; color:white;">Hanya Status Batal Bayar yang dapat di Release RPE nya.</p>',
                width: '100%',
                customClass: {
                    popup: style['colored-popup'], // Custom class untuk sweetalert
                },
            });
            return;
        }
    };

    // ================== Funsgi Reload untuk Responsive sidebar filter ==========================
    useEffect(() => {
        const handleResize = () => {
            setWindowHeight(window.innerHeight);
            if (window.innerWidth < 800) {
                setSidebarVisible(false);
            } else {
                setSidebarVisible(true);
            }
        };

        if (typeof window !== 'undefined') {
            setWindowHeight(window.innerHeight);
            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    }, []);

    const onCreate = () => {
        sidebarObj.element.style.visibility = '';
    };
    const toggleClick = () => {
        setSidebarVisible(true);
    };
    const closeClick = () => {
        setSidebarVisible(false);
    };
    // ===========================================================================================

    //============== Format baris pada grid List Data  =============
    const rowDataBoundListData = (args: any) => {
        if (args.row) {
            if (getValue('status', args.data) == 'Lunas' && getValue('status_app', args.data) === 'Baru') {
                args.row.style.background = '#35df0d';
            } else if (getValue('status', args.data) == 'Lunas' && getValue('status_app', args.data) === 'Disetujui') {
                args.row.style.background = 'yellow';
            } else if (getValue('status', args.data) == 'Terbuka' && getValue('status_app', args.data) === 'Disetujui') {
                args.row.style.background = 'yellow';
            } else if (getValue('status', args.data) == 'Terbuka' && getValue('status_app', args.data) === 'Ditolak') {
                args.row.style.background = 'yellow';
            } else if (getValue('status', args.data) == 'Batal Bayar' && getValue('status_app', args.data) === 'Disetujui') {
                args.row.style.background = 'yellow';
            } else if (getValue('status', args.data) == 'Release' && getValue('status_app', args.data) === 'Disetujui') {
                args.row.style.background = 'yellow';
            }
        }
    };

    //============== Format cell pada grid list Data ===============
    const queryCellInfoListDataBaru = (args: any) => {
        if (getValue('status', args.data) == 'Lunas' && getValue('status_app', args.data) === 'Baru') {
            args.cell.style.color = 'black';
        } else if (getValue('status', args.data) == 'Terbuka' && getValue('status_app', args.data) === 'Baru') {
            args.cell.style.color = 'blue';
        } else if (getValue('status', args.data) == 'Terbuka' && getValue('status_app', args.data) === 'Ditolak') {
            args.cell.style.color = 'red';
        } else if (getValue('status', args.data) == 'Terbuka' && getValue('status_app', args.data) === 'Koreksi') {
            args.cell.style.color = 'blue';
        } else if (getValue('status', args.data) == 'Batal Bayar' && getValue('status_app', args.data) === 'Baru') {
            args.cell.style.color = 'blue';
        }
    };
    const queryCellInfoListDataApproval = (args: any) => {
        args.cell.style.color = 'red';
    };
    const queryCellInfoListDataBayar = (args: any) => {
        if (getValue('status', args.data) == 'Lunas' && getValue('status_app', args.data) === 'Baru') {
            args.cell.style.color = 'black';
        } else {
            args.cell.style.color = 'red';
        }
    };

    const queryCellODRPE = (args: any) => {
        if (args.column.field === 'status_app') {
            // Contoh: Warnai berdasarkan nilai
            args.cell.style.backgroundColor = 'yellow'; // Warna merah muda
        }
    };

    const handleLabelFilter = (tipe: any) => {
        setLabelFilter(tipe);
    };

    // END

    const handleParamsObject = {
        kode_entitas: kode_entitas,
        token: token,
        userid: userid,
        entitas: entitas,
        vRefreshData: vRefreshData,
        tipe: '',
        valueObject: null,
        setStateDataHeaderList,
        setRecordsData,
        setRecordsDataApprove,
        setRecordsDataBayar,
        setFilteredData,
        setFilteredDataApproval,
        setFilteredDataBaru,

        setMasterDataState,
        setMasterKodeDokumen,
        setDialogInputDataVisible,
        setRefreshKey,
        setStateDataParams,

        recordsData,
        recordsDataApprove,
        recordsDataBayar,

        masterDataState,
        masterKodeDokumen,
        dialogInputDataVisible,
        refreshKey,
        stateDataParams,

        setSelectedEntitas,
        selectedEntitas,

        setListEntitas,
        listEntitas,

        setFilteredDataRpe,
        filteredDataRpe,
        recordsDataRpe,
    };
    // ===========================================================================================

    //

    return (
        <div className="Main" id="main-target">
            {/*==================================================================================================*/}
            {/*================================ Tampilan utama Tanda Terima Barang =============================*/}
            {/*==================================================================================================*/}
            <div>
                <div style={{ minHeight: '40px', marginTop: '-19px', marginBottom: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <TooltipComponent content="Tampilkan filter data" opensOn="Hover" openDelay={1000} target="#btnFilter">
                            <TooltipComponent content="Refresh data yang ditampilkan" opensOn="Hover" openDelay={1000} target="#btnRefresh">
                                <TooltipComponent content="Membuat tanda PHE baru" opensOn="Hover" openDelay={1000} target="#btnBaru">
                                    <TooltipComponent content="Edit data PHE" opensOn="Hover" openDelay={1000} target="#btnEdit">
                                        <TooltipComponent content="Persetujuan dokumen" opensOn="Hover" openDelay={1000} target="#btnApproval">
                                            <ButtonComponent
                                                id="btnBaru"
                                                cssClass="e-primary e-small"
                                                style={
                                                    userMenu.baru === 'Y' || userid === 'administrator' || userid === 'ADMINISTRATOR'
                                                        ? { ...styleButton }
                                                        : { ...styleButtonDisabled, color: '#1c1b1f61' }
                                                }
                                                disabled={userMenu.baru === 'Y' || userid === 'administrator' || userid === 'ADMINISTRATOR' ? false : true}
                                                // onClick={() => HandleButtonClick('BARU', 'baru', router)}
                                                onClick={showNewRecord}
                                                content="Baru"
                                            ></ButtonComponent>

                                            <ButtonComponent
                                                id="btnEdit"
                                                cssClass="e-primary e-small"
                                                style={
                                                    userMenu.edit === 'Y' || userid === 'administrator' || userid === 'ADMINISTRATOR'
                                                        ? { ...styleButton }
                                                        : { ...styleButtonDisabled, color: '#1c1b1f61' }
                                                }
                                                disabled={userMenu.edit === 'Y' || userid === 'administrator' || userid === 'ADMINISTRATOR' ? false : true}
                                                onClick={() => {
                                                    if (stateDataParams.filterTab !== 'od') {
                                                        showEditRecord();
                                                    }
                                                }}
                                                content="Ubah"
                                            ></ButtonComponent>
                                            <ButtonComponent
                                                id="btnFilter"
                                                cssClass="e-primary e-small"
                                                style={
                                                    sidebarVisible
                                                        ? { width: '57px', height: '28px', marginBottom: '0.5em', marginTop: '0.5em', marginRight: '0.8em' }
                                                        : { ...styleButton, color: 'white' }
                                                }
                                                // disabled={disabledFilter}
                                                disabled={sidebarVisible}
                                                //onClick={showFilterData}
                                                onClick={toggleClick}
                                                content="Filter"
                                            ></ButtonComponent>
                                            <ButtonComponent
                                                id="btnApp"
                                                cssClass="e-primary e-small"
                                                style={
                                                    userMenu.app_fpp === '2' || userid === 'administrator' || userid === 'ADMINISTRATOR'
                                                        ? { ...styleButtonApp, width: 100 + 'px', color: 'green' }
                                                        : { ...styleButtonDisabled, width: 100 + 'px', color: '#1c1b1f61' }
                                                }
                                                disabled={userMenu.app_fpp === '2' || userid === 'administrator' || userid === 'ADMINISTRATOR' ? false : true}
                                                // disabled={true}
                                                onClick={() => {
                                                    if (stateDataParams.filterTab !== 'od') {
                                                        showAppBtlRecord('approval');
                                                    }
                                                }}
                                                content="Approval"
                                                iconCss="e-icons e-medium e-chevron-right"
                                                iconPosition="Left"
                                            ></ButtonComponent>

                                            <ButtonComponent
                                                id="btnBatalApp"
                                                cssClass="e-primary e-small"
                                                style={
                                                    userMenu.app_fpp === '2' || userid === 'administrator' || userid === 'ADMINISTRATOR'
                                                        ? { ...styleButtonApp, width: 125 + 'px', color: '#95050a' }
                                                        : { ...styleButtonDisabled, width: 125 + 'px', color: '#1c1b1f61' }
                                                }
                                                disabled={userMenu.app_fpp === '2' || userid === 'administrator' || userid === 'ADMINISTRATOR' ? false : true}
                                                onClick={() => {
                                                    if (stateDataParams.filterTab !== 'od') {
                                                        showAppBtlRecord('batal');
                                                    }
                                                }}
                                                content="Batal Approval"
                                                iconCss="e-icons e-medium e-chevron-right"
                                                iconPosition="Left"
                                            ></ButtonComponent>

                                            <ButtonComponent
                                                id="btnPembayaran"
                                                cssClass="e-primary e-small"
                                                style={{ ...styleButtonApp, width: 119 + 'px', color: 'green' }}
                                                disabled={entitas === '898' ? false : true}
                                                // disabled={true}
                                                onClick={() => {
                                                    if (stateDataParams.filterTab !== 'od') {
                                                        showBayarRecord('bayar');
                                                    }
                                                }}
                                                content="Pembayaran"
                                                iconCss="e-icons e-medium e-chevron-right"
                                                iconPosition="Left"
                                            ></ButtonComponent>

                                            <ButtonComponent
                                                id="btnBatalPembayaran"
                                                cssClass="e-primary e-small"
                                                style={{ ...styleButtonApp, width: 143 + 'px', color: 'green' }}
                                                disabled={entitas === '898' ? false : true}
                                                // disabled={true}
                                                onClick={() => {
                                                    if (stateDataParams.filterTab !== 'od') {
                                                        showBatalRecord('batal bayar');
                                                    }
                                                }}
                                                content="Batal Pembayaran"
                                                iconCss="e-icons e-medium e-chevron-right"
                                                iconPosition="Left"
                                            ></ButtonComponent>

                                            {/* <ButtonComponent
                                                id="btnReleaseRpe"
                                                cssClass="e-primary e-small"
                                                style={
                                                    userMenu.app_fpp === '2' || userid === 'administrator' || userid === 'ADMINISTRATOR'
                                                        ? { ...styleButtonApp, width: 125 + 'px', color: 'green' }
                                                        : { ...styleButtonDisabled, width: 125 + 'px', color: '#1c1b1f61' }
                                                }
                                                disabled={userMenu.app_fpp === '2' || userid === 'administrator' || userid === 'ADMINISTRATOR' ? false : true}
                                                // disabled={true}
                                                onClick={() => {
                                                    if (stateDataParams.filterTab !== 'od') {
                                                        showReleaseRecord;
                                                    }
                                                }}
                                                content="Release RPE"
                                                iconCss="e-icons e-medium e-chevron-right"
                                                iconPosition="Left"
                                            ></ButtonComponent> */}

                                            {/* <div className="form-input ml-3 mr-1" style={{ width: '180px', display: 'inline-block' }}> */}
                                            <div className="form-input ml-3 mr-1" style={{ width: '180px', display: 'inline-block' }}>
                                                <TextBoxComponent
                                                    id="cariNoPhe"
                                                    className="searchtext"
                                                    placeholder="<Cari Nomor RPE>"
                                                    showClearButton={false}
                                                    //input={(args: FocusInEventArgs) => {
                                                    input={(args: ChangeEventArgsInput) => {
                                                        const value: any = args.value;
                                                        const mergerObject = {
                                                            ...handleParamsObject,
                                                            valueObject: value,
                                                        };
                                                        pencarianNoPhe(mergerObject);
                                                    }}
                                                    floatLabelType="Never"
                                                />
                                            </div>

                                            <div className="form-input ml-3 mr-1" style={{ width: '180px', display: 'inline-block' }}>
                                                <TextBoxComponent
                                                    id="cariBayar"
                                                    className="searchtext"
                                                    placeholder="<Bayar>"
                                                    showClearButton={true}
                                                    //input={(args: FocusInEventArgs) => {
                                                    input={(args: ChangeEventArgsInput) => {
                                                        const value: any = args.value;
                                                        const mergerObject = {
                                                            ...handleParamsObject,
                                                            valueObject: value,
                                                        };
                                                        pencarianBayar(mergerObject);
                                                    }}
                                                />
                                            </div>
                                        </TooltipComponent>
                                    </TooltipComponent>
                                </TooltipComponent>
                            </TooltipComponent>
                        </TooltipComponent>
                    </div>
                    <div className="ml-3 mr-1" style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="mt-1" style={{ fontSize: '20px', fontFamily: 'Times New Roman' }}>
                            Konsolidasi (PHE)
                        </span>
                    </div>
                </div>

                <div id="main-content" style={{ display: 'flex', gap: '3px', position: 'sticky', overflow: 'hidden' }}>
                    <SidebarComponent
                        id="default-sidebar"
                        target={'#main-content'}
                        ref={(Sidebar) => (sidebarObj = Sidebar as SidebarComponent)}
                        // style={{ background: 'transparent', visibility: 'hidden', marginRight: '0.8em' }}
                        style={{
                            background: 'transparent',
                            marginRight: '0.8em',
                            display: 'block',
                            visibility: sidebarVisible ? 'visible' : 'hidden',
                            // maxHeight: `100px`,
                            overflowY: 'auto',
                        }}
                        created={onCreate}
                        //showBackdrop={showBackdrop}
                        type={type}
                        width="310px"
                        height={200}
                        mediaQuery={mediaQueryState}
                        isOpen={true}
                        open={() => setSidebarVisible(true)}
                        close={() => setSidebarVisible(false)}
                        enableGestures={false}
                    >
                        {/* ===============  Filter Data ========================   */}
                        {/* {disabledFilter && ( */}
                        <div className="panel-filter" style={{ background: '#dedede', width: '100%', height: '100%', overflowY: 'auto' }}>
                            <div className="flex items-center text-center">
                                <button
                                    className="absolute right-0 top-0 mb-[16px] p-2 text-gray-600 hover:text-gray-900"
                                    //onClick={toggleFilterData}
                                    onClick={closeClick}
                                >
                                    <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                                </button>
                            </div>
                            <div style={{ marginBottom: '7px' }}></div>
                            <div className="panel" style={{ background: '#dedede', padding: '1px' }}>
                                <Tab.Group defaultIndex={0}>
                                    <div className="panel-data" style={{ width: '109%', marginLeft: '-13px' }}>
                                        <div className="h-full overflow-auto p-4 ">
                                            <Tab.List style={{ marginTop: '-14px' }} className="mt-1 flex w-full flex-wrap border-b border-white-light dark:border-[#191e3a]">
                                                <Tab key={0} onClick={() => handleLabelFilter('Data RPE')}>
                                                    {({ selected }) => (
                                                        <button
                                                            style={{ fontSize: '12px' }}
                                                            className={`${
                                                                selected ? '!border-white-light !border-b-white font-bold text-gray-900 dark:!border-[#191e3a] dark:!border-b-black' : 'text-gray-600'
                                                            } -mb-[1px] flex items-center border border-transparent p-3.5 py-2 !outline-none transition duration-300 hover:text-danger`}
                                                        >
                                                            Filters
                                                        </button>
                                                    )}
                                                </Tab>
                                                <Tab key={1} onClick={() => handleLabelFilter('Kantor Cabang')}>
                                                    {({ selected }) => (
                                                        <button
                                                            style={{ fontSize: '12px' }}
                                                            className={`${
                                                                selected ? '!border-white-light !border-b-white font-bold text-gray-900 dark:!border-[#191e3a] dark:!border-b-black' : 'text-gray-600'
                                                            } -mb-[1px] flex items-center border border-transparent p-3.5 py-2 !outline-none transition duration-300 hover:text-danger`}
                                                        >
                                                            Konsolidasi
                                                        </button>
                                                    )}
                                                </Tab>
                                            </Tab.List>
                                        </div>
                                    </div>
                                    <div className="panel-data" style={{ background: '#b6beca', width: '109%', height: '593px', marginLeft: '-13px', marginTop: '-15px' }}>
                                        <div>
                                            <label
                                                style={{
                                                    backgroundColor: '#5c7ba0',
                                                    padding: '5px 10px',
                                                    fontSize: '14px',
                                                    color: 'white',
                                                    display: 'inline-block',
                                                    width: '100%',
                                                    position: 'sticky',
                                                }}
                                            >
                                                {leblFilter}
                                            </label>
                                        </div>
                                        <div style={{ marginTop: '-22px', marginLeft: '0px' }} className="h-full overflow-auto p-4 ">
                                            {/* <div className="e-content ml-[-14px] mr-[-14px] mt-[12px]"> */}
                                            <Tab.Panels style={{ marginBottom: 10 }}>
                                                <div className="e-content ml-[-14px] mr-[-14px] mt-[12px]">
                                                    <Tab.Panel key={0}>
                                                        <div className="flex">
                                                            <CheckBoxComponent
                                                                label="No. Dokumen"
                                                                checked={stateChecked.isNoPheChecked}
                                                                change={(args: ChangeEventArgsButton) => {
                                                                    const value: any = args.checked;
                                                                    setStateChecked((prevState: any) => ({
                                                                        ...prevState,
                                                                        isNoPheChecked: value,
                                                                    }));
                                                                }}
                                                                style={{ borderRadius: 3, borderColor: 'gray' }}
                                                            />
                                                        </div>

                                                        <div className="mt-1 flex justify-between">
                                                            <div className="container form-input">
                                                                <TextBoxComponent
                                                                    placeholder=""
                                                                    value={stateFiilterData.noPheValue}
                                                                    input={(args: FocusInEventArgs) => {
                                                                        const value: any = args.value;
                                                                        setStateChecked((prevState: any) => ({
                                                                            ...prevState,
                                                                            isNoPheChecked: value,
                                                                        }));
                                                                        setStateFilterData((prevState: any) => ({
                                                                            ...prevState,
                                                                            noPheValue: value,
                                                                        }));
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="mt-2 flex justify-between">
                                                            <CheckBoxComponent
                                                                label="Tanggal"
                                                                checked={stateChecked.isTanggalChecked}
                                                                change={(args: ChangeEventArgsButton) => {
                                                                    const value: any = args.checked;
                                                                    setStateChecked((prevState: any) => ({
                                                                        ...prevState,
                                                                        isTanggalChecked: value,
                                                                    }));
                                                                }}
                                                            />
                                                        </div>

                                                        <div className={`grid grid-cols-1 justify-between gap-1 sm:flex `}>
                                                            <div className="form-input mt-1 flex justify-between">
                                                                <DatePickerComponent
                                                                    locale="id"
                                                                    cssClass="e-custom-style"
                                                                    // renderDayCell={onRenderDayCell}
                                                                    enableMask={true}
                                                                    maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                                    showClearButton={false}
                                                                    format="dd-MM-yyyy"
                                                                    value={stateFiilterData.date1.toDate()}
                                                                    change={(args: ChangeEventArgsCalendar) => {
                                                                        setStateChecked((prevState: any) => ({
                                                                            ...prevState,
                                                                            isTanggalChecked: true,
                                                                        }));
                                                                        setStateFilterData((prevState: any) => ({
                                                                            ...prevState,
                                                                            date1: moment(args.value),
                                                                        }));
                                                                    }}
                                                                >
                                                                    <Inject services={[MaskedDateTime]} />
                                                                </DatePickerComponent>
                                                            </div>
                                                            <p
                                                                className="set-font-11 ml-0.5 mr-0.5 mt-3 flex justify-between"
                                                                style={{ width: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '2.5vh' }}
                                                            >
                                                                s/d
                                                            </p>
                                                            <div className="form-input mt-1 flex justify-between">
                                                                <DatePickerComponent
                                                                    locale="id"
                                                                    cssClass="e-custom-style"
                                                                    // renderDayCell={onRenderDayCell}
                                                                    enableMask={true}
                                                                    maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                                    showClearButton={false}
                                                                    format="dd-MM-yyyy"
                                                                    value={stateFiilterData.date2.toDate()}
                                                                    change={(args: ChangeEventArgsCalendar) => {
                                                                        setStateChecked((prevState: any) => ({
                                                                            ...prevState,
                                                                            isTanggalChecked: true,
                                                                        }));
                                                                        setStateFilterData((prevState: any) => ({
                                                                            ...prevState,
                                                                            date2: moment(args.value),
                                                                        }));
                                                                    }}
                                                                >
                                                                    <Inject services={[MaskedDateTime]} />
                                                                </DatePickerComponent>
                                                            </div>
                                                        </div>

                                                        <div className="mt-2 flex justify-between">
                                                            <CheckBoxComponent
                                                                label="Nama Ekspedisi"
                                                                checked={stateChecked.isNamaEkspedisiChecked}
                                                                change={(args: ChangeEventArgsButton) => {
                                                                    const value: any = args.checked;
                                                                    setStateChecked((prevState: any) => ({
                                                                        ...prevState,
                                                                        isNamaEkspedisiChecked: true,
                                                                    }));
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="mt-1 flex justify-between">
                                                            <div className="container form-input">
                                                                <TextBoxComponent
                                                                    placeholder=""
                                                                    value={stateFiilterData.namaEkspedisiValue}
                                                                    input={(args: FocusInEventArgs) => {
                                                                        const value: any = args.value;
                                                                        setStateChecked((prevState: any) => ({
                                                                            ...prevState,
                                                                            isNamaEkspedisiChecked: value,
                                                                        }));
                                                                        setStateFilterData((prevState: any) => ({
                                                                            ...prevState,
                                                                            namaEkspedisiValue: value,
                                                                        }));
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="mt-2 flex justify-between">
                                                            <CheckBoxComponent
                                                                label="No. Reff"
                                                                checked={stateChecked.isNoReffChecked}
                                                                change={(args: ChangeEventArgsButton) => {
                                                                    const value: any = args.checked;
                                                                    setStateChecked((prevState: any) => ({
                                                                        ...prevState,
                                                                        isNoReffChecked: value,
                                                                    }));
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="mt-1 flex justify-between">
                                                            <div className="container form-input">
                                                                <TextBoxComponent
                                                                    placeholder=""
                                                                    value={stateFiilterData.noReffValue}
                                                                    input={(args: FocusInEventArgs) => {
                                                                        const value: any = args.value;
                                                                        setStateChecked((prevState: any) => ({
                                                                            ...prevState,
                                                                            isNoReffChecked: value,
                                                                        }));
                                                                        setStateFilterData((prevState: any) => ({
                                                                            ...prevState,
                                                                            noReffValue: value,
                                                                        }));
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="mt-2 flex justify-between">
                                                            <div className="font-bold">
                                                                <span style={{ fontWeight: 'bold', fontSize: 11 }}>PPH</span>
                                                            </div>
                                                        </div>
                                                        <div className="mt-1 flex">
                                                            <input
                                                                type="radio"
                                                                name="pph"
                                                                id="ya"
                                                                className="form-radio"
                                                                checked={stateFiilterData.selectedOptionPph === 'ya'}
                                                                onChange={(event) =>
                                                                    setStateFilterData((prevState: any) => ({
                                                                        ...prevState,
                                                                        selectedOptionPph: event.target.id,
                                                                    }))
                                                                }
                                                            />
                                                            <label htmlFor="ya" className="ml-1" style={{ marginBottom: -2, fontSize: 11 }}>
                                                                YA
                                                            </label>

                                                            <input
                                                                type="radio"
                                                                name="pph"
                                                                id="tidak"
                                                                className="form-radio ml-4"
                                                                checked={stateFiilterData.selectedOptionPph === 'tidak'}
                                                                onChange={(event) =>
                                                                    setStateFilterData((prevState: any) => ({
                                                                        ...prevState,
                                                                        selectedOptionPph: event.target.id,
                                                                    }))
                                                                }
                                                            />
                                                            <label htmlFor="tidak" className="ml-1" style={{ marginBottom: -2, fontSize: 11 }}>
                                                                Tidak
                                                            </label>

                                                            <input
                                                                type="radio"
                                                                name="pph"
                                                                id="semua"
                                                                className="form-radio ml-4"
                                                                checked={stateFiilterData.selectedOptionPph === 'semua'}
                                                                onChange={(event) =>
                                                                    setStateFilterData((prevState: any) => ({
                                                                        ...prevState,
                                                                        selectedOptionPph: event.target.id,
                                                                    }))
                                                                }
                                                            />
                                                            <label htmlFor="semua" className="ml-1" style={{ marginBottom: -2, fontSize: 11 }}>
                                                                Semua
                                                            </label>
                                                        </div>

                                                        <div className="mt-2 flex justify-between">
                                                            <div className="font-bold">
                                                                <span style={{ fontWeight: 'bold', fontSize: 11 }}>Lunas</span>
                                                            </div>
                                                        </div>
                                                        <div className="mt-1 flex">
                                                            <input
                                                                type="radio"
                                                                name="pembayaranLunas"
                                                                id="lunas"
                                                                className="form-radio"
                                                                checked={stateFiilterData.selectedOptionLunas === 'lunas'}
                                                                onChange={(event) =>
                                                                    setStateFilterData((prevState: any) => ({
                                                                        ...prevState,
                                                                        selectedOptionLunas: event.target.id,
                                                                    }))
                                                                }
                                                            />
                                                            <label htmlFor="lunas" className="ml-1" style={{ marginBottom: -2, fontSize: 11 }}>
                                                                Lunas
                                                            </label>

                                                            <input
                                                                type="radio"
                                                                name="pembayaranLunas"
                                                                id="batalBayar"
                                                                className="form-radio ml-4"
                                                                checked={stateFiilterData.selectedOptionLunas === 'batalBayar'}
                                                                onChange={(event) =>
                                                                    setStateFilterData((prevState: any) => ({
                                                                        ...prevState,
                                                                        selectedOptionLunas: event.target.id,
                                                                    }))
                                                                }
                                                            />
                                                            <label htmlFor="batalBayar" className="ml-1" style={{ marginBottom: -2, fontSize: 11 }}>
                                                                Batal Bayar
                                                            </label>

                                                            <input
                                                                type="radio"
                                                                name="pembayaranLunas"
                                                                id="semua"
                                                                className="form-radio ml-4"
                                                                checked={stateFiilterData.selectedOptionLunas === 'semua'}
                                                                onChange={(event) =>
                                                                    setStateFilterData((prevState: any) => ({
                                                                        ...prevState,
                                                                        selectedOptionLunas: event.target.id,
                                                                    }))
                                                                }
                                                            />
                                                            <label htmlFor="semua" className="ml-1" style={{ marginBottom: -2, fontSize: 11 }}>
                                                                Semua
                                                            </label>
                                                        </div>
                                                    </Tab.Panel>
                                                </div>
                                                <div className="e-content mt-[12px]">
                                                    <Tab.Panel key={1}>
                                                        <div className="mb-[-20px] ml-[-19px] mt-[-16px] h-[40%] overflow-x-auto p-1">
                                                            <div className="mb-0.5 flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    id="all-entitas"
                                                                    checked={listEntitas.length === selectedEntitas.length}
                                                                    onChange={() => {
                                                                        const mergerObject = {
                                                                            ...handleParamsObject,
                                                                        };
                                                                        pilihSemua(mergerObject);
                                                                    }}
                                                                />
                                                                <label style={{ marginLeft: '5px' }} htmlFor={`all-entitas`} className="m-0 text-xs text-gray-900">
                                                                    {`Pilih Semua`}
                                                                </label>
                                                            </div>
                                                            {listEntitas.map((item: any) => (
                                                                <div key={item.kodecabang} className="mb-0.5 flex items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`checkbox-${item.kodecabang}`}
                                                                        value={item.kodecabang}
                                                                        checked={selectedEntitas.includes(item.kodecabang)}
                                                                        onChange={() => {
                                                                            const mergerObject = {
                                                                                ...handleParamsObject,
                                                                            };
                                                                            handleCheckboxChange(item.kodecabang, mergerObject);
                                                                        }}
                                                                    />
                                                                    <label style={{ marginLeft: '5px' }} htmlFor={`checkbox-${item.kodecabang}`} className="m-0 text-xs text-gray-900">
                                                                        {`[${item.kodecabang}] ${item.cabang}`}
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </Tab.Panel>
                                                </div>
                                            </Tab.Panels>
                                            {/* </div> */}
                                        </div>
                                    </div>
                                </Tab.Group>
                            </div>
                        </div>
                    </SidebarComponent>

                    {/* ===============  Grid Data ========================   */}
                    <div className="panel" style={{ background: '#dedede', width: gridWidth, margin: 'auto auto auto' + (sidebarVisible ? ' 315px' : ' 0'), overflowY: 'auto' }}>
                        <div className="panel-data" style={{ width: '100%', height: '660px' }}>
                            <TabComponent selectedItem={0} animation={{ previous: { effect: 'None' }, next: { effect: 'None' } }} height="100%">
                                <div className="e-tab-header" style={{ marginBottom: 10 }}>
                                    <div tabIndex={0} className="flex h-[41px] items-center justify-center">
                                        {' '}
                                        1. Outstanding RPE
                                    </div>
                                    <div tabIndex={1} className="flex h-[41px] items-center justify-center">
                                        {' '}
                                        2. PHE Baru
                                    </div>
                                    <div tabIndex={2} className="flex h-[41px] items-center justify-center">
                                        {' '}
                                        3. Approval{' '}
                                    </div>
                                    <div tabIndex={3} className="flex h-[41px] items-center justify-center">
                                        {' '}
                                        4. Selesai Bayar{' '}
                                    </div>
                                    {/* <div tabIndex={0}> Data List</div> */}
                                </div>
                                <div className="e-content">
                                    <div style={{ width: '100%', height: '100%', marginTop: '5px' }} tabIndex={0}>
                                        <GridComponent
                                            // key={gridKey}
                                            // key={`key-${refreshGrid}`}
                                            id="gridListData"
                                            locale="id"
                                            // ref={(g) => (gridListData = g)}
                                            ref={gridListDataRPERef}
                                            dataSource={stateDataHeaderList.searchNoPhe !== '' || stateDataHeaderList.searchBayar !== '' ? filteredDataRpe : recordsDataRpeRef.current}
                                            selectionSettings={{ mode: 'Row', type: 'Single' }}
                                            allowPaging={true}
                                            allowSorting={true}
                                            allowFiltering={false}
                                            allowResizing={true}
                                            autoFit={true}
                                            allowReordering={true}
                                            pageSettings={{ pageSize: 25, pageCount: 5, pageSizes: ['25', '50', '100', 'All'] }}
                                            rowHeight={22}
                                            width={'100%'}
                                            height={501}
                                            gridLines={'Both'}
                                            // loadingIndicator={{ indicatorType: 'Shimmer' }}
                                            queryCellInfo={queryCellODRPE}
                                            // rowDataBound={rowDataBoundListData}
                                            rowSelected={(args) => {
                                                const mergerObject = {
                                                    ...handleParamsObject,
                                                };
                                                handleRowSelectedOD(args, 'od', mergerObject);
                                            }}
                                            recordDoubleClick={(args) => {
                                                // const mergerObject = {
                                                //     ...handleParamsObject,
                                                // };

                                                // handleDoubleClickOD(args, 'od', mergerObject);
                                                showNewRecord();
                                            }}
                                        >
                                            <ColumnsDirective>
                                                <ColumnDirective
                                                    field="entitas"
                                                    headerText="Entitas"
                                                    headerTextAlign="Center"
                                                    textAlign="Center"
                                                    //autoFit
                                                    width="70"
                                                />
                                                <ColumnDirective
                                                    field="no_rpe"
                                                    headerText="No. RPE"
                                                    headerTextAlign="Center"
                                                    textAlign="Center"
                                                    //autoFit
                                                    width="125"
                                                />
                                                <ColumnDirective
                                                    field="tgl_rpe"
                                                    headerText="Tgl. RPE"
                                                    headerTextAlign="Center"
                                                    textAlign="Center"
                                                    //autoFit
                                                    width="100"
                                                    type="date"
                                                    format={formatDate}
                                                />
                                                <ColumnDirective
                                                    field="via"
                                                    headerText="Ekspedisi"
                                                    headerTextAlign="Center"
                                                    textAlign="Left"
                                                    //autoFit
                                                    width="320"
                                                />
                                                <ColumnDirective
                                                    field="no_reff"
                                                    headerText="No. Faktur Eks"
                                                    headerTextAlign="Center"
                                                    textAlign="Left"
                                                    //autoFit
                                                    width="120"
                                                />
                                                <ColumnDirective
                                                    field="sub_total"
                                                    format="N2"
                                                    headerText="Total Klaim"
                                                    headerTextAlign="Center"
                                                    textAlign="Right"
                                                    //autoFit
                                                    width="110"
                                                />

                                                <ColumnDirective
                                                    field="total_berat"
                                                    format="N2"
                                                    headerText="Total Berat"
                                                    headerTextAlign="Center"
                                                    textAlign="Right"
                                                    //autoFit
                                                    width="110"
                                                />
                                                <ColumnDirective
                                                    field="total_mu"
                                                    format="N2"
                                                    headerText="Total Bayar"
                                                    headerTextAlign="Center"
                                                    textAlign="Right"
                                                    //autoFit
                                                    width="110"
                                                />
                                                <ColumnDirective
                                                    field="status"
                                                    headerText="status"
                                                    headerTextAlign="Center"
                                                    textAlign="Center"
                                                    //autoFit
                                                    width="80"
                                                />
                                                <ColumnDirective
                                                    field="status_app"
                                                    headerText="Approval"
                                                    headerTextAlign="Center"
                                                    textAlign="Center"
                                                    //autoFit
                                                    width="100"
                                                />
                                                <ColumnDirective
                                                    field="no_dokumen"
                                                    headerText="No. Jurnal"
                                                    headerTextAlign="Center"
                                                    textAlign="Left"
                                                    //autoFit
                                                    width="150"
                                                />

                                                <ColumnDirective field="no_dokumen_rev" headerText="No. Jurnal Rev" headerTextAlign="Center" textAlign="Left" width="150" />
                                            </ColumnsDirective>
                                            <AggregatesDirective>
                                                <AggregateDirective>
                                                    <AggregateColumnsDirective>
                                                        <AggregateColumnDirective field="total_mu" type="Custom" customAggregate={totBayarMu} footerTemplate={CustomSumBayarMu} />
                                                    </AggregateColumnsDirective>
                                                </AggregateDirective>
                                            </AggregatesDirective>
                                            <Inject services={[Aggregate, Page, Selection, Edit, /*Toolbar,*/ Sort, Group, Filter, Resize, Reorder /*, Freeze,*/, ExcelExport, PdfExport]} />
                                        </GridComponent>
                                    </div>
                                    <div style={{ width: '100%', height: '100%', marginTop: '5px' }} tabIndex={1}>
                                        <GridComponent
                                            // key={gridKey}
                                            // key={`key-${refreshGrid}`}
                                            id="gridListData"
                                            locale="id"
                                            // ref={(g) => (gridListData = g)}
                                            ref={gridListDataRef}
                                            dataSource={stateDataHeaderList.searchNoPhe !== '' || stateDataHeaderList.searchBayar !== '' ? filteredData : recordsDataRef.current}
                                            selectionSettings={{ mode: 'Row', type: 'Single' }}
                                            allowPaging={true}
                                            allowSorting={true}
                                            allowFiltering={false}
                                            allowResizing={true}
                                            autoFit={true}
                                            allowReordering={true}
                                            pageSettings={{ pageSize: 25, pageCount: 5, pageSizes: ['25', '50', '100', 'All'] }}
                                            rowHeight={22}
                                            width={'100%'}
                                            height={501}
                                            gridLines={'Both'}
                                            // loadingIndicator={{ indicatorType: 'Shimmer' }}
                                            queryCellInfo={queryCellInfoListDataBaru}
                                            rowDataBound={rowDataBoundListData}
                                            rowSelected={(args) => {
                                                const mergerObject = {
                                                    ...handleParamsObject,
                                                };
                                                handleRowSelected(args, mergerObject);
                                            }}
                                            recordDoubleClick={(args) => {
                                                const mergerObject = {
                                                    ...handleParamsObject,
                                                };
                                                handleDoubleClick(args, mergerObject);
                                            }}
                                        >
                                            <ColumnsDirective>
                                                <ColumnDirective
                                                    field="entitas"
                                                    headerText="Entitas"
                                                    headerTextAlign="Center"
                                                    textAlign="Center"
                                                    //autoFit
                                                    width="70"
                                                />
                                                <ColumnDirective
                                                    field="no_phe"
                                                    headerText="No. PHE"
                                                    headerTextAlign="Center"
                                                    textAlign="Center"
                                                    //autoFit
                                                    width="125"
                                                />
                                                <ColumnDirective
                                                    field="tgl_phe"
                                                    headerText="Tgl. PHE"
                                                    headerTextAlign="Center"
                                                    textAlign="Center"
                                                    //autoFit
                                                    width="100"
                                                    type="date"
                                                    format={formatDate}
                                                />
                                                <ColumnDirective
                                                    field="via"
                                                    headerText="Ekspedisi"
                                                    headerTextAlign="Center"
                                                    textAlign="Left"
                                                    //autoFit
                                                    width="340"
                                                />
                                                <ColumnDirective
                                                    field="no_reff"
                                                    headerText="No. Reff"
                                                    headerTextAlign="Center"
                                                    textAlign="Left"
                                                    //autoFit
                                                    width="120"
                                                />
                                                <ColumnDirective
                                                    field="pph23"
                                                    headerText="pph23"
                                                    headerTextAlign="Center"
                                                    textAlign="Center"
                                                    //autoFit
                                                    width="65"
                                                />

                                                <ColumnDirective
                                                    field="netto_mu"
                                                    format="N2"
                                                    headerText="Jumlah"
                                                    headerTextAlign="Center"
                                                    textAlign="Right"
                                                    //autoFit
                                                    width="110"
                                                />
                                                <ColumnDirective
                                                    field="total_mu"
                                                    format="N2"
                                                    headerText="Total Bayar"
                                                    headerTextAlign="Center"
                                                    textAlign="Right"
                                                    //autoFit
                                                    width="110"
                                                />
                                                <ColumnDirective
                                                    field="status"
                                                    headerText="status"
                                                    headerTextAlign="Center"
                                                    textAlign="Center"
                                                    //autoFit
                                                    width="80"
                                                />
                                                <ColumnDirective
                                                    field="status_app"
                                                    headerText="Approval"
                                                    headerTextAlign="Center"
                                                    textAlign="Center"
                                                    //autoFit
                                                    width="100"
                                                />
                                                <ColumnDirective
                                                    field="no_dokumen"
                                                    headerText="No. Jurnal"
                                                    headerTextAlign="Center"
                                                    textAlign="Left"
                                                    //autoFit
                                                    width="150"
                                                />

                                                <ColumnDirective field="no_dokumen_rev" headerText="No. Jurnal Rev" headerTextAlign="Center" textAlign="Left" width="150" />
                                            </ColumnsDirective>
                                            <AggregatesDirective>
                                                <AggregateDirective>
                                                    <AggregateColumnsDirective>
                                                        <AggregateColumnDirective field="netto_mu" type="Custom" customAggregate={totNettoMuPheBaru} footerTemplate={CustomSumNettoMuPheBaru} />
                                                        <AggregateColumnDirective field="total_mu" type="Custom" customAggregate={totBayarMuPheBaru} footerTemplate={CustomSumBayarMuPheBaru} />
                                                    </AggregateColumnsDirective>
                                                </AggregateDirective>
                                            </AggregatesDirective>
                                            <Inject services={[Aggregate, Page, Selection, Edit, /*Toolbar,*/ Sort, Group, Filter, Resize, Reorder /*, Freeze,*/, ExcelExport, PdfExport]} />
                                        </GridComponent>
                                    </div>
                                    <div style={{ width: '100%', height: '100%', marginTop: '5px' }} tabIndex={2}>
                                        <GridComponent
                                            // key={gridKey}
                                            id="gridListData"
                                            locale="id"
                                            // ref={(g) => (gridListData = g)}
                                            ref={gridListDataApprovalRef}
                                            dataSource={stateDataHeaderList.searchNoPhe !== '' || stateDataHeaderList.searchBayar !== '' ? filteredDataApproval : recordsDataApproveRef.current}
                                            selectionSettings={{ mode: 'Row', type: 'Single' }}
                                            allowPaging={true}
                                            allowSorting={true}
                                            allowFiltering={false}
                                            allowResizing={true}
                                            autoFit={true}
                                            allowReordering={true}
                                            pageSettings={{ pageSize: 25, pageCount: 5, pageSizes: ['25', '50', '100', 'All'] }}
                                            rowHeight={22}
                                            width={'100%'}
                                            height={501}
                                            gridLines={'Both'}
                                            // // loadingIndicator={{ indicatorType: 'Shimmer' }}
                                            queryCellInfo={queryCellInfoListDataApproval}
                                            rowDataBound={rowDataBoundListData}
                                            rowSelected={(args) => {
                                                const mergerObject = {
                                                    ...handleParamsObject,
                                                };
                                                handleRowSelected(args, mergerObject);
                                            }}
                                            recordDoubleClick={(args) => {
                                                const mergerObject = {
                                                    ...handleParamsObject,
                                                };
                                                handleDoubleClickApp(args, mergerObject);
                                            }}
                                        >
                                            <ColumnsDirective>
                                                <ColumnDirective
                                                    field="entitas"
                                                    headerText="Entitas"
                                                    headerTextAlign="Center"
                                                    textAlign="Center"
                                                    //autoFit
                                                    width="70"
                                                />
                                                <ColumnDirective
                                                    field="no_phe"
                                                    headerText="No. PHE"
                                                    headerTextAlign="Center"
                                                    textAlign="Center"
                                                    //autoFit
                                                    width="125"
                                                />
                                                <ColumnDirective
                                                    field="tgl_phe"
                                                    headerText="Tgl. PHE"
                                                    headerTextAlign="Center"
                                                    textAlign="Center"
                                                    //autoFit
                                                    width="100"
                                                    type="date"
                                                    format={formatDate}
                                                />
                                                <ColumnDirective
                                                    field="via"
                                                    headerText="Ekspedisi"
                                                    headerTextAlign="Center"
                                                    textAlign="Left"
                                                    //autoFit
                                                    width="340"
                                                />
                                                <ColumnDirective
                                                    field="no_reff"
                                                    headerText="No. Reff"
                                                    headerTextAlign="Center"
                                                    textAlign="Left"
                                                    //autoFit
                                                    width="120"
                                                />
                                                <ColumnDirective
                                                    field="pph23"
                                                    headerText="pph23"
                                                    headerTextAlign="Center"
                                                    textAlign="Center"
                                                    //autoFit
                                                    width="65"
                                                />

                                                <ColumnDirective
                                                    field="netto_mu"
                                                    format="N2"
                                                    headerText="Jumlah"
                                                    headerTextAlign="Center"
                                                    textAlign="Right"
                                                    //autoFit
                                                    width="110"
                                                />
                                                <ColumnDirective
                                                    field="total_mu"
                                                    format="N2"
                                                    headerText="Total Bayar"
                                                    headerTextAlign="Center"
                                                    textAlign="Right"
                                                    //autoFit
                                                    width="110"
                                                />
                                                <ColumnDirective
                                                    field="status"
                                                    headerText="status"
                                                    headerTextAlign="Center"
                                                    textAlign="Center"
                                                    //autoFit
                                                    width="80"
                                                />
                                                <ColumnDirective
                                                    field="status_app"
                                                    headerText="Approval"
                                                    headerTextAlign="Center"
                                                    textAlign="Center"
                                                    //autoFit
                                                    width="100"
                                                />
                                                <ColumnDirective
                                                    field="no_dokumen"
                                                    headerText="No. Jurnal"
                                                    headerTextAlign="Center"
                                                    textAlign="Left"
                                                    //autoFit
                                                    width="150"
                                                />

                                                <ColumnDirective field="no_dokumen_rev" headerText="No. Jurnal Rev" headerTextAlign="Center" textAlign="Left" width="150" />
                                            </ColumnsDirective>
                                            <Inject services={[Page, Selection, Edit, /*Toolbar,*/ Sort, Group, Filter, Resize, Reorder /*, Freeze,*/, ExcelExport, PdfExport]} />
                                        </GridComponent>
                                    </div>
                                    <div style={{ width: '100%', height: '100%', marginTop: '5px' }} tabIndex={3}>
                                        <GridComponent
                                            // key={gridKey}
                                            id="gridListData"
                                            locale="id"
                                            // ref={(g) => (gridListData = g)}
                                            ref={gridListDataBayarRef}
                                            dataSource={stateDataHeaderList.searchNoPhe !== '' || stateDataHeaderList.searchBayar !== '' ? filteredDataBayar : recordsDataBayarRef.current}
                                            selectionSettings={{ mode: 'Row', type: 'Single' }}
                                            allowPaging={true}
                                            allowSorting={true}
                                            allowFiltering={false}
                                            allowResizing={true}
                                            autoFit={true}
                                            allowReordering={true}
                                            pageSettings={{ pageSize: 25, pageCount: 5, pageSizes: ['25', '50', '100', 'All'] }}
                                            rowHeight={22}
                                            width={'100%'}
                                            height={501}
                                            gridLines={'Both'}
                                            // // loadingIndicator={{ indicatorType: 'Shimmer' }}
                                            queryCellInfo={queryCellInfoListDataBayar}
                                            rowDataBound={rowDataBoundListData}
                                            rowSelected={(args) => {
                                                const mergerObject = {
                                                    ...handleParamsObject,
                                                };
                                                handleRowSelected(args, mergerObject);
                                            }}
                                            recordDoubleClick={(args) => {
                                                const mergerObject = {
                                                    ...handleParamsObject,
                                                };
                                                handleDoubleClickApp(args, mergerObject);
                                            }}
                                        >
                                            <ColumnsDirective>
                                                <ColumnDirective
                                                    field="entitas"
                                                    headerText="Entitas"
                                                    headerTextAlign="Center"
                                                    textAlign="Center"
                                                    //autoFit
                                                    width="70"
                                                />
                                                <ColumnDirective
                                                    field="no_phe"
                                                    headerText="No. PHE"
                                                    headerTextAlign="Center"
                                                    textAlign="Center"
                                                    //autoFit
                                                    width="125"
                                                />
                                                <ColumnDirective
                                                    field="tgl_phe"
                                                    headerText="Tgl. PHE"
                                                    headerTextAlign="Center"
                                                    textAlign="Center"
                                                    //autoFit
                                                    width="100"
                                                    type="date"
                                                    format={formatDate}
                                                />
                                                <ColumnDirective
                                                    field="via"
                                                    headerText="Ekspedisi"
                                                    headerTextAlign="Center"
                                                    textAlign="Left"
                                                    //autoFit
                                                    width="340"
                                                />
                                                <ColumnDirective
                                                    field="no_invoice"
                                                    headerText="No. Invoice"
                                                    headerTextAlign="Center"
                                                    textAlign="Left"
                                                    //autoFit
                                                    width="170"
                                                    clipMode="EllipsisWithTooltip"
                                                />
                                                <ColumnDirective
                                                    field="no_reff"
                                                    headerText="No. Reff"
                                                    headerTextAlign="Center"
                                                    textAlign="Left"
                                                    //autoFit
                                                    width="120"
                                                />
                                                <ColumnDirective
                                                    field="pph23"
                                                    headerText="pph23"
                                                    headerTextAlign="Center"
                                                    textAlign="Center"
                                                    //autoFit
                                                    width="65"
                                                />

                                                <ColumnDirective
                                                    field="netto_mu"
                                                    format="N2"
                                                    headerText="Jumlah"
                                                    headerTextAlign="Center"
                                                    textAlign="Right"
                                                    //autoFit
                                                    width="110"
                                                />
                                                <ColumnDirective
                                                    field="total_mu"
                                                    format="N2"
                                                    headerText="Total Bayar"
                                                    headerTextAlign="Center"
                                                    textAlign="Right"
                                                    //autoFit
                                                    width="110"
                                                />
                                                <ColumnDirective
                                                    field="status"
                                                    headerText="status"
                                                    headerTextAlign="Center"
                                                    textAlign="Center"
                                                    //autoFit
                                                    width="80"
                                                />
                                                <ColumnDirective
                                                    field="status_app"
                                                    headerText="Approval"
                                                    headerTextAlign="Center"
                                                    textAlign="Center"
                                                    //autoFit
                                                    width="100"
                                                />
                                                <ColumnDirective
                                                    field="no_dokumen"
                                                    headerText="No. Jurnal"
                                                    headerTextAlign="Center"
                                                    textAlign="Left"
                                                    //autoFit
                                                    width="150"
                                                />

                                                <ColumnDirective field="no_dokumen_rev" headerText="No. Jurnal Rev" headerTextAlign="Center" textAlign="Left" width="150" />
                                            </ColumnsDirective>
                                            <Inject services={[Page, Selection, Edit, /*Toolbar,*/ Sort, Group, Filter, Resize, Reorder /*, Freeze,*/, ExcelExport, PdfExport]} />
                                        </GridComponent>
                                    </div>
                                </div>
                            </TabComponent>

                            {/*============ Tampilkan popup menu untuk print dan simpan ke file ================*/}
                            <ContextMenuComponent id="contextmenu" target=".e-gridheader" animationSettings={{ duration: 800, effect: 'FadeIn' }} />
                        </div>
                    </div>
                </div>

                <div className="flex">
                    <div
                        onClick={handleRefreshData}
                        style={{ minHeight: '51px', marginTop: '-26px', marginBottom: '11px', width: '308px', backgroundColor: '#dedede', visibility: sidebarVisible ? 'visible' : 'hidden' }}
                    >
                        <div className="mt-6 flex justify-center">
                            <TooltipComponent content="Refresh data yang ditampilkan" opensOn="Hover" openDelay={1000} position="BottomCenter">
                                <ButtonComponent
                                    cssClass="e-primary e-small"
                                    iconCss="e-icons e-medium e-refresh"
                                    content="Refresh Data"
                                    style={{ backgroundColor: '#3b3f5c', marginTop: '1px', marginBottom: '17px' }}
                                    // onClick={handleRefreshData}
                                />
                            </TooltipComponent>
                        </div>
                    </div>
                    <div style={{ width: '8px' }}></div>
                    <div
                        style={{
                            width: gridWidth,
                            margin: sidebarVisible ? '-9px auto 11px 0' : 'auto auto auto -315px',
                            minHeight: '51px',
                            marginTop: '-43px',
                            marginBottom: '11px',
                            backgroundColor: '#dedede',
                            overflowY: 'auto',
                            marginLeft: '-6px',
                        }}
                    >
                        <div className="flex">
                            <div style={{ width: '172px' }}>
                                <TooltipComponent content="Update File Pendukung" opensOn="Hover" openDelay={1000} position="BottomCenter">
                                    <ButtonComponent
                                        cssClass="e-primary e-small"
                                        iconCss="e-icons e-medium e-chevron-right"
                                        iconPosition="Left"
                                        content="Update File Pendukung"
                                        style={{ backgroundColor: '#9f9a9a', marginTop: '46px', marginLeft: '10px', color: 'black' }}
                                        onClick={showUpdateFilePendukung}
                                    />
                                </TooltipComponent>
                            </div>

                            <div style={{ width: '10%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* {isOpenPreview && (
                <div
                    style={{
                        position: 'fixed',
                        top: '0',
                        left: '0',
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: '1000',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            position: 'relative',
                            textAlign: 'center',
                            zIndex: '1001',
                            cursor: isDragging ? 'grabbing' : 'grab',
                        }}
                    >
                        <img
                            src={imageDataUrl}
                            alt={`Zoomed ${indexPreview}`}
                            style={{
                                transform: `scale(${zoomScale}) translate(${position.x}px, ${position.y}px)`,
                                transition: 'transform 0.1s ease',
                                cursor: 'pointer',
                                maxWidth: '100vw',
                                maxHeight: '100vh',
                            }}
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                        />
                    </div>
                    <div
                        style={{
                            position: 'fixed',
                            top: '10px',
                            right: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '10px',
                            zIndex: '1001',
                        }}
                    >
                        <ButtonComponent
                            id="zoomIn"
                            cssClass="e-primary e-small"
                            iconCss=""
                            style={{
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '24px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                padding: 0,
                            }}
                        >
                            <span className="e-icons e-zoom-in" style={{ fontSize: '32px', fontWeight: 'bold' }} onClick={() => HandleZoomIn(setZoomScale)}></span>
                        </ButtonComponent>
                        <ButtonComponent
                            id="zoomOut"
                            cssClass="e-primary e-small"
                            iconCss=""
                            style={{
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '24px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                padding: 0,
                            }}
                        >
                            <span className="e-icons e-zoom-out" style={{ fontSize: '32px', fontWeight: 'bold' }} onClick={() => HandleZoomOut(setZoomScale)}></span>
                        </ButtonComponent>

                        <ButtonComponent
                            id="close"
                            cssClass="e-primary e-small"
                            iconCss=""
                            style={{
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '24px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                padding: 0,
                            }}
                        >
                            <span className="e-icons e-close" style={{ fontSize: '20px', fontWeight: 'bold' }} onClick={() => HandleCloseZoom(setIsOpenPreview, setImageDataUrl)}></span>
                        </ButtonComponent>
                    </div>
                </div>
            )} */}

            {/*==================================================================================================*/}
            {/*=================================== Modal dialog untuk view TTD =============================*/}
            {/*==================================================================================================*/}

            <DialogKonsolidasiPhe
                userid={userid}
                kode_entitas={kode_entitas}
                kodeEntitas={stateDataParams.kodeEntitasKonsolidasi}
                entitas={entitas}
                masterKodeDokumen={masterKodeDokumen}
                masterDataState={masterDataState}
                masterBarangProduksi={masterBarangProduksi}
                isOpen={dialogInputDataVisible}
                onClose={() => {
                    setDialogInputDataVisible(false);
                }}
                onRefresh={handleRefreshData}
                kode_user={kode_user}
                refreshKey={refreshKey}
                onOpen={() => {
                    setDialogInputDataVisible(true);
                }}
                token={token}
                valueAppBackdate={valueAppBackdate}
                stateDataParams={stateDataParams}
                setStateDataDataParams={setStateDataParams}
            />
            {/* )} */}

            <DialogComponent width="500px" height="200px" isModal={true} visible={showLoadingModal} close={() => setShowLoadingModal(false)} overlayClick={() => {}}>
                <div className="flex h-full w-full items-center justify-center">
                    <div className="w-full flex-grow px-10">
                        <p>Proses : {currentIndicator}</p>
                        <LinearProgress variant="buffer" value={isLoadingModal} color={errorMassage === '' ? 'primary' : 'error'} valueBuffer={isLoadingModal} />
                        <p className="text-red italic">{errorMassage === '' ? '' : errorMassage}</p>
                    </div>
                    {errorMassage.length !== 0 && (
                        <div className="flex w-full gap-2">
                            <button className="bg-red-400 p-5" onClick={() => setShowLoadingModal(false)}>
                                Tutup
                            </button>

                            <button className="bg-red-400 p-5">Coba lagi</button>
                        </div>
                    )}
                </div>
            </DialogComponent>
        </div>
    );
};

// export { getServerSideProps };

export default KonsolidasiPhe;
