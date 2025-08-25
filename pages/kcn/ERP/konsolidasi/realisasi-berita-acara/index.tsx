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
import { faFilter, faRefresh, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
// import { getServerSideProps } from '@/pages/api/getServerSide';

loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);

import idIDLocalization from 'public/syncfusion/locale.json';
L10n.load(idIDLocalization);

import { useSession } from '@/pages/api/sessionContext';
import { showLoading1, swalToast } from '@/lib/fa/konsolidasi-phe/functional/fungsiForm';
import style from '@/styles/index.module.css';
import { usersApp, appBackdate, usersMenu } from '@/utils/global/fungsi';
import { Tab } from '@headlessui/react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { LinearProgress } from '@mui/material';
import { MenuItemModel } from '@syncfusion/ej2-react-navigations';
import { MenuEventArgs } from '@syncfusion/ej2-react-splitbuttons';
import DialogRba from '../../inventory/realisasi-berita-acara/component/dialogRba';
import { GetAllEntitas, GetCekAppRba, GetCekDataReportRBA, PostUpdateCatatan, getListKonsolidasiRba } from '@/lib/inventory/realisasi-berita-acara/api/api';
import {
    Modal,
    checkValueAccessorAccPabrik,
    checkValueAccessorBebanCabang,
    checkValueAccessorLevel1,
    checkValueAccessorLevel2,
    swalDialog,
    swalPopUp,
} from '@/utils/inventory/realisasi-berita-acara/interface/fungsi';
import Draggable from 'react-draggable';
import styles from '@styles/index.module.css';
import { handleCheckboxChange, handleDoubleClickKonsolidasiRba, handleRowSelectedKonsolidasiRba, pilihSemua } from '@/lib/inventory/realisasi-berita-acara/functional/fungsiForm';
import { useProgress } from '@/context/ProgressContext';
import GlobalProgressBar from '@/components/GlobalProgressBar';
import { frmNumber } from '@/utils/routines';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2';

enableRipple(true);

let textareaObj: any;
const KonsolidasiRba = () => {
    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const nip = sessionData?.nip ?? '';
    const kode_user = sessionData?.nip ?? '';
    const entitas = sessionData?.entitas ?? '';
    const token = sessionData?.token ?? '';
    const kodeUser = sessionData?.kode_user ?? '';

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
    const { startProgress, updateProgress, endProgress, setLoadingMessage } = useProgress();

    const [stateFiilterData, setStateFilterData] = useState({
        date1: moment(),
        date2: moment().endOf('month'),
        noBaValue: '',
        namaEkspedisiValue: '',
        namaSupplierValue: '',
        noReffValue: '',
        noFbmValue: '',
        noFjValue: '',
        selectedOptionStatus: 'semua',
        selectedOptionLunas: 'semua',
    });

    const [stateChecked, setStateChecked] = useState({
        isTanggalChecked: true,
        isNoBaChecked: false,
        isNamaEkspedisiChecked: false,
        isNamaSupplierChecked: false,
        isNoReffChecked: false,
        isNofbmChecked: false,
        isNofjChecked: false,

        isNoPilihSemua: false,
    });

    const [stateDataHeaderList, setStateDataHeaderList] = useState({
        searchNoPhe: '',
        searchBayar: '',
        plagInputCatatanKonsol: false,
        inputCatatanKonsol: '',

        kode_rpeba: '',
        dataEntitas: '',
        kode_fbm: '',

        app: '',
        appRba: '',
        jumlahCabang: 0,
        jumlahPabrik: 0,
    });
    // END

    interface UserMenuState {
        baru: any;
        edit: any;
        hapus: any;
        cetak: any;
        app_rba: any;
    }
    const [userMenu, setUserMenu] = useState<UserMenuState>({ baru: '', edit: '', hapus: '', cetak: '', app_rba: '' });
    const kode_menu = '91200'; // kode menu Konsolidasi PHE
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

    const [recordsDataKonsolidasiRba, setRecordsDataKonsolidasiRba] = useState<RPEListItem[]>([]);
    const recordsDataKonsolidasiRbaRef = useRef<any[]>([]);
    const [listEntitas, setListEntitas] = useState<any>([]);
    const [masterDataState, setMasterDataState] = useState<string>('BARU');
    const [masterKodeDokumen, setMasterKodeDokumen] = useState<string>('BARU');
    const [dialogInputDataVisibleRba, setDialogInputDataVisibleRba] = useState(false);

    //=========== Setting format tanggal sesuai locale ID ===========
    const formatDate: Object = { type: 'date', format: 'dd-MM-yyyy' };

    // let gridListData: Grid | any;
    const gridListDataKonsolidasiRbaRef = useRef<GridComponent | any>(null);

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
    const [leblFilter, setLabelFilter] = useState('Data Berita Acara');

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

    const [modalPositionKet, setModalPositionKet] = useState({ top: '30%', right: '30%', width: '30%', background: '#dedede' });

    // ====================== FUNGSI FUNGSI BARU PHE ==========================

    const hasilJsonListKonsolidasiRba: { data: any[] } = {
        data: [], // Array berisi objek dengan tipe `DataItem`
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

    const handleLabelFilter = (tipe: any) => {
        setLabelFilter(tipe);
    };

    // =====================================================================================================
    // =====================================================================================================
    // INI FUNGSI UNTUK KONSOLIDASI BERITA ACARA

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
            app_rba: respUsersApp[0].app_rba,
        }));

        const allEntitas = await GetAllEntitas(kode_entitas, token);
        setListEntitas(allEntitas);

        const cekAppRba = await GetCekAppRba(kode_entitas, token, kodeUser);

        setStateDataHeaderList((prevState: any) => ({
            ...prevState,
            appRba: cekAppRba[0].app_rba,
        }));
        // console.log('respUsersApp = ', respUsersApp[0].app_rba);
    };

    useEffect(() => {
        fetchDataUseEffect();
    }, []);

    //============== Format baris pada grid List Data  =============
    const rowDataBound = (args: any) => {
        if (args.row) {
            if (getValue('pilih', args.data) == 1) {
                args.row.style.background = '#0ff';
            }
        }
    };
    const queryCell = (args: any) => {
        if (args.column.field === 'jumlah_cabang' && args.data.jumlah_cabang > 0 && args.data.pilih === 0) {
            // Contoh: Warnai berdasarkan nilai
            args.cell.style.backgroundColor = 'yellow';
        }

        if (args.column.field === 'jumlah_pabrik' && args.data.jumlah_pabrik > 0 && args.data.pilih === 0) {
            // Contoh: Warnai berdasarkan nilai
            args.cell.style.backgroundColor = '#00ff00';
        }

        if (args.column.field === 'entitas') {
            args.cell.style.backgroundColor = 'white';
        }
    };

    // ============ untuk menampilkan dropdown cetak dan fungsi pemanggilan nya =================
    let cMenuCetak: ContextMenuComponent;
    let cMenuCetakMergePdf: ContextMenuComponent;
    function btnPrintClick(e: any): void {
        var clientRect = (e.target as Element).getBoundingClientRect();
        cMenuCetak.open(clientRect.bottom, clientRect.left);
    }

    let menuCetakItems: MenuItemModel[] = [
        {
            id: 'pkp',
            text: 'Realisasi Berita Acara Klaim Pabrik (PKP)',
        },
        {
            id: 'non_pkp',
            text: 'Realisasi Berita Acara Klaim Pabrik (NON PKP)',
        },
    ];

    const menuCetakSelect = async (args: MenuEventArgs) => {
        const paramObject = {
            kode_entitas: stateDataHeaderList.dataEntitas,
            kode_rpeba: masterKodeDokumen,
            token: token,
            jumlah_cabang: stateDataHeaderList.jumlahCabang,
            jumlah_pabrik: stateDataHeaderList.jumlahPabrik,
        };
        if (args.item.id === 'pkp') {
            OnClick_CetakRbaPKP(paramObject);
        } else if (args.item.id === 'non_pkp') {
            OnClick_CetakRbaNONPKP(paramObject);
        }
    };

    // Merger PDF
    function btnMergePdf(e: any): void {
        var clientRect = (e.target as Element).getBoundingClientRect();
        cMenuCetakMergePdf.open(clientRect.bottom, clientRect.left);
    }

    let menuCetakItemsMergerPdf: MenuItemModel[] = [
        {
            id: 'pkp',
            text: 'Realisasi Berita Acara Klaim Pabrik (PKP)',
        },
        {
            id: 'non_pkp',
            text: 'Realisasi Berita Acara Klaim Pabrik (NON PKP)',
        },
    ];

    const menuCetakSelectMergePdf = async (args: MenuEventArgs) => {
        const paramObject = {
            kode_entitas: stateDataHeaderList.dataEntitas,
            kode_rpeba: masterKodeDokumen,
            token: token,
            jumlah_cabang: stateDataHeaderList.jumlahCabang,
            jumlah_pabrik: stateDataHeaderList.jumlahPabrik,
        };
        if (args.item.id === 'pkp') {
            generatePDF('pkp');
        } else if (args.item.id === 'non_pkp') {
            generatePDF('non_pkp');
        }
    };

    // END

    const headerTemplateSuratJalanPabrik = () => {
        const bgcolor = 'tranparent';
        const fcolor = '#5d676e';
        return (
            <TooltipComponent content="Gagal Kirim" opensOn="Hover" openDelay={1000} position="BottomCenter">
                <div style={{ background: bgcolor, width: '100%', lineHeight: 1.3 }}>
                    <span style={{ width: '80px', fontSize: 11, textAlign: 'center', paddingLeft: '0px', color: fcolor, background: bgcolor }}>
                        Surat Jalan
                        <br />
                        Pabrik
                    </span>
                </div>
            </TooltipComponent>
        );
    };

    const headerTemplateProsesDokumen = () => {
        const bgcolor = 'tranparent';
        const fcolor = '#5d676e';
        return (
            <TooltipComponent content="Gagal Kirim" opensOn="Hover" openDelay={1000} position="BottomCenter">
                <div style={{ background: bgcolor, width: '100%', lineHeight: 1.3 }}>
                    <span style={{ width: '80px', fontSize: 11, textAlign: 'center', paddingLeft: '0px', color: fcolor, background: bgcolor }}>
                        Proses
                        <br />
                        Dokumen
                    </span>
                </div>
            </TooltipComponent>
        );
    };

    const headerTemplateTglProsesRba = () => {
        const bgcolor = 'tranparent';
        const fcolor = '#5d676e';
        return (
            <TooltipComponent content="Gagal Kirim" opensOn="Hover" openDelay={1000} position="BottomCenter">
                <div style={{ background: bgcolor, width: '100%', lineHeight: 1.3 }}>
                    <span style={{ width: '80px', fontSize: 11, textAlign: 'center', paddingLeft: '0px', color: fcolor, background: bgcolor }}>
                        Tgl. Proses
                        <br />
                        RBA
                    </span>
                </div>
            </TooltipComponent>
        );
    };

    const [progress, setProgress] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isError, setIsError] = useState(false);
    const [message, setMessage] = useState(''); // Pesan untuk keberhasilan atau kegagalan

    const handleRefreshData = async () => {
        console.log('sdasdasda = ');

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
            // await showLoading1(true);
            // startProgress();
            if (kode_entitas !== null || kode_entitas !== '') {
                // setIsSaving(true);
                // setIsModalOpen(true); // Buka modal
                // setProgress(0);
                // setIsError(false);
                // setMessage(''); // Reset pesan

                // const interval = setInterval(() => {
                //     setProgress((prev) => (prev < 90 ? prev + 10 : prev));
                // }, 300);

                try {
                    // await new Promise((resolve) => setTimeout(resolve, 3000));
                    // setMessage('Proses Load Data.....');
                    // setProgress(11); // Berhasil menyimpan data PPI
                    let entitas = kode_entitas;
                    let noBa = 'all';
                    let tglAwal = 'all'; //tanggalHariIni
                    let tglAkhir = 'all'; //tanggalAkhirBulan

                    let namaEkspedisi = 'all';
                    let namaSupplier = 'all';
                    let noReff = 'all';
                    let noFbm = 'all';
                    let noFj = 'all';
                    let status = 'all';
                    let lunas = 'all';

                    if (stateChecked.isNoBaChecked) {
                        noBa = `${stateFiilterData.noBaValue}`;
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

                    if (stateChecked.isNamaSupplierChecked) {
                        namaSupplier = `${stateFiilterData.namaSupplierValue}`;
                    }

                    if (stateChecked.isNoReffChecked) {
                        noReff = `${stateFiilterData.noReffValue}`;
                    }

                    if (stateChecked.isNofbmChecked) {
                        noFbm = `${stateFiilterData.noFbmValue}`;
                    }

                    if (stateChecked.isNofjChecked) {
                        noFj = `${stateFiilterData.noFjValue}`;
                    }

                    if (stateFiilterData.selectedOptionStatus === 'semua') {
                        status = 'all';
                    } else if (stateFiilterData.selectedOptionStatus === 'prosesApp') {
                        status = 'A';
                    } else if (stateFiilterData.selectedOptionStatus === 'app1') {
                        status = '1';
                    } else if (stateFiilterData.selectedOptionStatus === 'app2') {
                        status = '2';
                    } else if (stateFiilterData.selectedOptionStatus === 'fullApp') {
                        status = 'F';
                    }

                    if (stateFiilterData.selectedOptionLunas === 'semua') {
                        lunas = 'all';
                    } else if (stateFiilterData.selectedOptionLunas === 'lunas') {
                        lunas = 'Lunas';
                    } else if (stateFiilterData.selectedOptionLunas === 'lunasSebagian') {
                        lunas = 'Lunas Sebagian';
                    } else if (stateFiilterData.selectedOptionLunas === 'belumLunas') {
                        lunas = 'Belum Lunas';
                    }

                    for (const item of selectedEntitas) {
                        // await new Promise((resolve) => setTimeout(resolve, 3000));
                        // setMessage(`Proses Load entitas ${item}`);
                        // setProgress(30); // Berhasil mengunggah file
                        setShowLoadingModal(true);
                        setCurrentIndicator(`Memulai fetch di entitas ${item}`);
                        setIsLoadingModal(10);
                        const paramObject = {
                            kode_entitas: item,
                            tglAwal: tglAwal, //tanggalHariIni
                            tglAkhir: tglAkhir, //tanggalAkhirBulan
                            noBa: noBa,

                            namaEkspedisi: namaEkspedisi,
                            namaSupplier: namaSupplier,
                            noReff: noReff,
                            noFbm: noFbm,
                            noFj: noFj,
                            status: status,
                            lunas: lunas,
                            token: token,
                        };

                        console.log('paramObject = ', paramObject);
                        const responseDataKonsolidasiRba = await getListKonsolidasiRba(paramObject);

                        setCurrentIndicator(`Modifikasi data di entitas ${item}`);
                        setIsLoadingModal(50);

                        // Menambahkan field baru ke responseDataApprove
                        // const DataRba = responseDataKonsolidasiRba.filter((item: any) => item.status?.trim().toLowerCase() === 'terbuka' && item.status_app?.trim().toLowerCase() === 'disetujui');
                        const responseDataKonsolidasiRbaFix = responseDataKonsolidasiRba.map((Data: any) => ({
                            ...Data,
                            entitas: item,
                            total_pusat: parseFloat(Data.total_pusat),
                            total_mu: parseFloat(Data.total_mu),
                            netto_mu: parseFloat(Data.netto_mu),
                            jumlah_pabrik: parseFloat(Data.jumlah_pabrik),
                            pilih: 0,
                        }));

                        // // Tambahkan hasil ke array
                        hasilJsonListKonsolidasiRba.data.push(...responseDataKonsolidasiRbaFix);

                        setIsLoadingModal(100);
                        setCurrentIndicator(`Modifikasi berhasil di entitas ${item}`);
                    }

                    setRecordsDataKonsolidasiRba(hasilJsonListKonsolidasiRba.data);
                    recordsDataKonsolidasiRbaRef.current = hasilJsonListKonsolidasiRba.data;
                    console.log('hasilJsonListKonsolidasiRba.data = ', hasilJsonListKonsolidasiRba.data);

                    gridListDataKonsolidasiRbaRef.current?.setProperties({ dataSource: hasilJsonListKonsolidasiRba.data });
                    gridListDataKonsolidasiRbaRef.current?.refresh();

                    // showLoading1(false);
                    // endProgress();
                    setShowLoadingModal(false);
                } catch (error: any) {
                    console.error(error);
                    setLoadingMessage('terjadi kesalahan');
                }
            }
        }
    };

    const handleRefreshDataLoad = async () => {
        console.log('aaaaaaaaaaaaaaaaa');

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
            await showLoading1(true);
            // startProgress();
            if (kode_entitas !== null || kode_entitas !== '') {
                try {
                    let entitas = kode_entitas;
                    let noBa = 'all';
                    let tglAwal = 'all'; //tanggalHariIni
                    let tglAkhir = 'all'; //tanggalAkhirBulan

                    let namaEkspedisi = 'all';
                    let namaSupplier = 'all';
                    let noReff = 'all';
                    let noFbm = 'all';
                    let noFj = 'all';
                    let status = 'all';
                    let lunas = 'all';

                    if (stateChecked.isNoBaChecked) {
                        noBa = `${stateFiilterData.noBaValue}`;
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

                    if (stateChecked.isNamaSupplierChecked) {
                        namaSupplier = `${stateFiilterData.namaSupplierValue}`;
                    }

                    if (stateChecked.isNoReffChecked) {
                        noReff = `${stateFiilterData.noReffValue}`;
                    }

                    if (stateChecked.isNofbmChecked) {
                        noFbm = `${stateFiilterData.noFbmValue}`;
                    }

                    if (stateChecked.isNofjChecked) {
                        noFj = `${stateFiilterData.noFjValue}`;
                    }

                    if (stateFiilterData.selectedOptionStatus === 'semua') {
                        status = 'all';
                    } else if (stateFiilterData.selectedOptionStatus === 'prosesApp') {
                        status = 'A';
                    } else if (stateFiilterData.selectedOptionStatus === 'app1') {
                        status = '1';
                    } else if (stateFiilterData.selectedOptionStatus === 'app2') {
                        status = '2';
                    } else if (stateFiilterData.selectedOptionStatus === 'fullApp') {
                        status = 'F';
                    }

                    if (stateFiilterData.selectedOptionLunas === 'semua') {
                        lunas = 'all';
                    } else if (stateFiilterData.selectedOptionLunas === 'lunas') {
                        lunas = 'Lunas';
                    } else if (stateFiilterData.selectedOptionLunas === 'lunasSebagian') {
                        lunas = 'Lunas Sebagian';
                    } else if (stateFiilterData.selectedOptionLunas === 'belumLunas') {
                        lunas = 'Belum Lunas';
                    }

                    for (const item of selectedEntitas) {
                        const paramObject = {
                            kode_entitas: item,
                            tglAwal: tglAwal, //tanggalHariIni
                            tglAkhir: tglAkhir, //tanggalAkhirBulan
                            noBa: noBa,

                            namaEkspedisi: namaEkspedisi,
                            namaSupplier: namaSupplier,
                            noReff: noReff,
                            noFbm: noFbm,
                            noFj: noFj,
                            status: status,
                            lunas: lunas,
                            token: token,
                        };

                        const responseDataKonsolidasiRba = await getListKonsolidasiRba(paramObject);

                        // Menambahkan field baru ke responseDataApprove
                        // const DataRba = responseDataKonsolidasiRba.filter((item: any) => item.status?.trim().toLowerCase() === 'terbuka' && item.status_app?.trim().toLowerCase() === 'disetujui');
                        const responseDataKonsolidasiRbaFix = responseDataKonsolidasiRba.map((Data: any) => ({
                            ...Data,
                            entitas: item,
                            total_pusat: parseFloat(Data.total_pusat),
                            total_mu: parseFloat(Data.total_mu),
                            netto_mu: parseFloat(Data.netto_mu),
                            jumlah_pabrik: parseFloat(Data.jumlah_pabrik),
                            pilih: 0,
                        }));

                        // // Tambahkan hasil ke array
                        hasilJsonListKonsolidasiRba.data.push(...responseDataKonsolidasiRbaFix);
                    }

                    setRecordsDataKonsolidasiRba(hasilJsonListKonsolidasiRba.data);
                    recordsDataKonsolidasiRbaRef.current = hasilJsonListKonsolidasiRba.data;

                    gridListDataKonsolidasiRbaRef.current?.setProperties({ dataSource: hasilJsonListKonsolidasiRba.data });
                    gridListDataKonsolidasiRbaRef.current?.refresh();

                    showLoading1(false);
                } catch (error: any) {
                    console.error(error);
                    setLoadingMessage('terjadi kesalahan');
                }
            }
        }
    };

    const handleOnclickButton = (tipe: any) => {
        setRefreshKey((prevKey: any) => prevKey + 1);
        if (tipe === 'approval') {
            if (stateDataHeaderList.app === 'Y') {
                withReactContent(swalToast).fire({
                    icon: 'warning',
                    title: '<p style="font-size:12px; color:white;">Dokumen sudah full approved..</p>',
                    width: '100%',
                    customClass: {
                        popup: styles['colored-popup'], // Custom class untuk sweetalert
                    },
                });
            } else if (stateDataHeaderList.appRba !== '2') {
                withReactContent(swalToast).fire({
                    icon: 'warning',
                    title: '<p style="font-size:12px; color:white;">Proses approval harus level 2.</p>',
                    width: '100%',
                    customClass: {
                        popup: styles['colored-popup'], // Custom class untuk sweetalert
                    },
                });
            } else {
                setDialogInputDataVisibleRba(true);
            }
        } else if (tipe === 'mergePdf') {
        }
    };

    const clickCatatanKonsole = (props: any) => {
        setStateDataHeaderList((prevState: any) => ({
            ...prevState,
            plagInputCatatanKonsol: true,
            inputCatatanKonsol: props.catatan_konsol,
            kode_rpeba: props.kode_rpeba,
            dataEntitas: props.entitas,
        }));
    };

    const closeModalCatatanKonsole = (tipe: any) => {
        setStateDataHeaderList((prevState: any) => ({
            ...prevState,
            plagInputCatatanKonsol: false,
        }));
    };

    const simpanDataList = async (tipe: any, value: any, props: any) => {
        if (tipe === 'catatanKonsol') {
            const paramObject = {
                param1: 'catatan',
                // entitas: stateDataHeaderList.dataEntitas,
                // catatan: stateDataHeaderList.inputCatatanKonsol,
                // kode_rpeba: stateDataHeaderList.kode_rpeba,

                entitas: props.entitas,
                catatan: value,
                kode_rpeba: props.kode_rpeba,
            };
            const response = await PostUpdateCatatan(paramObject, token, kode_entitas);
            if (!response) {
                console.error('Request gagal: kode_entitas atau token tidak valid');
                return;
            }
            const result = response?.data;
            const status = result.status;
            const errormsg = result.serverMessage;
            if (status !== true) {
                withReactContent(swalDialog).fire({
                    title: ``,
                    html: errormsg,
                    icon: 'warning',
                    width: '20%',
                    heightAuto: true,
                    showConfirmButton: true,
                    confirmButtonText: 'Ok',
                });
            } else {
                // setStateDataHeaderList((prevState: any) => ({
                //     ...prevState,
                //     plagInputCatatanKonsol: false,
                // }));
                await withReactContent(swalPopUp).fire({
                    icon: 'success',
                    title: '<p style="font-size:12px;color:white;margin-right: -42px;">Catatan Berhasil di EDIT.</p>',
                    width: '50%', // Atur lebar popup sesuai kebutuhan
                    heightAuto: true,
                    timer: 2000,
                    showConfirmButton: false, // Menampilkan tombol konfirmasi
                    allowOutsideClick: false, // Menonaktifkan penutupan saat klik di luar
                    allowEscapeKey: false, // Menonaktifkan penutupan dengan tombol Escape
                    customClass: {
                        popup: styles['colored-popup'], // Custom class untuk sweetalert
                    },
                });

                // const catatanKonsol = document.getElementById(`catatanKonsol${stateDataHeaderList.kode_rpeba}`) as HTMLInputElement;
                // if (catatanKonsol) {
                //     catatanKonsol.value = stateDataHeaderList.inputCatatanKonsol;
                // }
            }
        } else {
            const paramObject = {
                param1: '',
                entitas: props.entitas,
                kode_rpeba: props.kode_rpeba,
                userid: userid.toLocaleUpperCase(),
                kode_fbm: props.kode_fbm,
                kirim_pabrik: value,
            };

            console.log('paramObject = ', paramObject);

            const response = await PostUpdateCatatan(paramObject, token, kode_entitas);
            if (!response) {
                console.error('Request gagal: kode_entitas atau token tidak valid');
                return;
            }
            const result = response?.data;
            const status = result.status;
            const errormsg = result.serverMessage;
            if (status !== true) {
                withReactContent(swalDialog).fire({
                    title: ``,
                    html: errormsg,
                    icon: 'warning',
                    width: '20%',
                    heightAuto: true,
                    showConfirmButton: true,
                    confirmButtonText: 'Ok',
                });
            } else {
                // setStateDataHeaderList((prevState: any) => ({
                //     ...prevState,
                //     plagInputCatatanKonsol: false,
                // }));
                await withReactContent(swalPopUp).fire({
                    icon: 'success',
                    title: '<p style="font-size:12px;color:white;margin-right: -42px;">Tgl Proses berhasil dirubah</p>',
                    width: '50%', // Atur lebar popup sesuai kebutuhan
                    heightAuto: true,
                    timer: 2000,
                    showConfirmButton: false, // Menampilkan tombol konfirmasi
                    allowOutsideClick: false, // Menonaktifkan penutupan saat klik di luar
                    allowEscapeKey: false, // Menonaktifkan penutupan dengan tombol Escape
                    customClass: {
                        popup: styles['colored-popup'], // Custom class untuk sweetalert
                    },
                });

                // const tglPabrik = document.getElementById(`tglPabrik${props.kode_rpeba}`) as HTMLInputElement;
                // if (tglPabrik) {
                //     tglPabrik.value = value === 'Y' ? moment().format('DD-MM-YYYY') : '';
                // }
            }
        }
    };

    const pilihSemuaData = (value: any) => {
        if (gridListDataKonsolidasiRbaRef.current && Array.isArray(gridListDataKonsolidasiRbaRef.current?.dataSource)) {
            const dataSource = gridListDataKonsolidasiRbaRef.current.dataSource.map((item: any) => ({
                ...item,
                pilih: value === true ? 1 : 0,
            }));
            // Set dataSource baru
            gridListDataKonsolidasiRbaRef.current.dataSource = dataSource;
            gridListDataKonsolidasiRbaRef.current.refresh(); // Perbarui tampilan grid

            setStateChecked((prevState: any) => ({
                ...prevState,
                isNoPilihSemua: value,
            }));
        }
    };

    //==================================================================================================
    // Fungsi untuk menampilkan Cetak RBA PKP
    const OnClick_CetakRbaPKP = (paramObject: any) => {
        let height = window.screen.availHeight - 150;
        let width = window.screen.availWidth - 200;
        let leftPosition = window.screen.width / 2 - (width / 2 + 10);
        let topPosition = window.screen.height / 2 - (height / 2 + 50);
        let iframeSrc: any;
        if (paramObject.jumlah_cabang > 0 && paramObject.jumlah_pabrik <= 0) {
            iframeSrc = `./realisasi-berita-acara//report/rba_pkp_beban_cabang?entitas=${paramObject.kode_entitas}&kode_rpeba=${paramObject.kode_rpeba}&token=${paramObject.token}`;
        } else if (paramObject.jumlah_cabang <= 0 && paramObject.jumlah_pabrik > 0) {
            iframeSrc = `./realisasi-berita-acara//report/rba_pkp_acc_pabrik?entitas=${paramObject.kode_entitas}&kode_rpeba=${paramObject.kode_rpeba}&token=${paramObject.token}`;
        } else if (paramObject.jumlah_cabang > 0 && paramObject.jumlah_pabrik > 0) {
            iframeSrc = `./realisasi-berita-acara//report/rba_pkp_acc_pabrik_beban_cabang?entitas=${paramObject.kode_entitas}&kode_rpeba=${paramObject.kode_rpeba}&token=${paramObject.token}`;
        }

        fetch(iframeSrc)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then(() => {
                let iframe = `
            <html><head>
            <title>Laporan Klaim Barang PKP | Next KCN Sytem</title>
            <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
            </head><body>
            <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
            </body></html>`;

                let win = window.open(
                    '',
                    '_blank',
                    `status=no,width=${width},height=${height},resizable=yes
                ,left=${leftPosition},top=${topPosition}
                ,screenX=${leftPosition},screenY=${topPosition}
                ,toolbar=no,menubar=no,scrollbars=no,location=no,directories=no`
                );

                if (win) {
                    let link = win.document.createElement('link');
                    link.type = 'image/png';
                    link.rel = 'shortcut icon';
                    link.href = '/favicon.png';
                    win.document.getElementsByTagName('head')[0].appendChild(link);
                    win.document.write(iframe);
                } else {
                    console.error('Window failed to open.');
                }
            })
            .catch((error) => {
                console.error('Failed to load resource:', error);
            });
    };
    // END

    //==================================================================================================
    // Fungsi untuk menampilkan Cetak RBA NON PKP
    const OnClick_CetakRbaNONPKP = (paramObject: any) => {
        let height = window.screen.availHeight - 150;
        let width = window.screen.availWidth - 200;
        let leftPosition = window.screen.width / 2 - (width / 2 + 10);
        let topPosition = window.screen.height / 2 - (height / 2 + 50);
        let iframeSrc: any;
        if (paramObject.jumlah_cabang > 0 && paramObject.jumlah_pabrik <= 0) {
            iframeSrc = `./realisasi-berita-acara//report/rba_nonpkp_beban_cabang?entitas=${paramObject.kode_entitas}&kode_rpeba=${paramObject.kode_rpeba}&token=${paramObject.token}`;
        } else if (paramObject.jumlah_cabang <= 0 && paramObject.jumlah_pabrik > 0) {
            iframeSrc = `./realisasi-berita-acara//report/rba_nonpkp_acc_pabrik?entitas=${paramObject.kode_entitas}&kode_rpeba=${paramObject.kode_rpeba}&token=${paramObject.token}`;
        } else if (paramObject.jumlah_cabang > 0 && paramObject.jumlah_pabrik > 0) {
            iframeSrc = `./realisasi-berita-acara//report/rba_nonpkp_acc_pabrik_beban_cabang?entitas=${paramObject.kode_entitas}&kode_rpeba=${paramObject.kode_rpeba}&token=${paramObject.token}`;
        }

        fetch(iframeSrc)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then(() => {
                let iframe = `
            <html><head>
            <title>Laporan Klaim Barang NON PKP | Next KCN Sytem</title>
            <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
            </head><body>
            <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
            </body></html>`;

                let win = window.open(
                    '',
                    '_blank',
                    `status=no,width=${width},height=${height},resizable=yes
                ,left=${leftPosition},top=${topPosition}
                ,screenX=${leftPosition},screenY=${topPosition}
                ,toolbar=no,menubar=no,scrollbars=no,location=no,directories=no`
                );

                if (win) {
                    let link = win.document.createElement('link');
                    link.type = 'image/png';
                    link.rel = 'shortcut icon';
                    link.href = '/favicon.png';
                    win.document.getElementsByTagName('head')[0].appendChild(link);
                    win.document.write(iframe);
                } else {
                    console.error('Window failed to open.');
                }
            })
            .catch((error) => {
                console.error('Failed to load resource:', error);
            });
    };
    // END

    const CustomSumJumlahpabrik = (props: any) => {
        return <span style={{ fontWeight: 'bold' }}>{props.Custom}</span>;
    };

    const totJumlahPabrik = (args: any) => {
        const jumlahMu = args.result.reduce((total: number, item: any) => {
            return total + parseFloat(item.jumlah_pabrik === '' ? '0' : item.jumlah_pabrik);
        }, 0);
        return frmNumber(jumlahMu);
    };

    const CustomSumJumlahcabang = (props: any) => {
        return <span style={{ fontWeight: 'bold' }}>{props.Custom}</span>;
    };

    const totJumlahCabang = (args: any) => {
        const jumlahMu = args.result.reduce((total: number, item: any) => {
            return total + parseFloat(item.jumlah_cabang === '' ? '0' : item.jumlah_cabang);
        }, 0);
        return frmNumber(jumlahMu);
    };

    const formattedName = moment().format('YYMMDDHHmmss');
    const hasilJsonListReportRBA: { data: any[] } = {
        data: [], // Array berisi objek dengan tipe `DataItem`
    };

    const transformDataReportRBA = (dataReportRBA: any, jumlah_cabang: any, jumlah_pabrik: any, tipe: any) => {
        console.log('dataReportRBA = ', dataReportRBA);

        return {
            data: [
                {
                    data_NamaEntitas: dataReportRBA.data_NamaEntitas,
                    data_Periode: dataReportRBA.data_Periode,
                    data_NamaHeader: dataReportRBA.data_NamaHeader,
                    data_NamaSupp: dataReportRBA.data_NamaSupp,
                    data_NoRBA: dataReportRBA.data_NoRBA,
                    data_TanggalACC: dataReportRBA.data_TanggalACC,
                    data_TanggalDiBuat: dataReportRBA.data_TanggalDiBuat,
                    data_AliasMNama: dataReportRBA.data_AliasMNama,
                    jumlah_cabang: jumlah_cabang, // Default 0, bisa diubah sesuai kebutuhan
                    jumlah_pabrik: jumlah_pabrik,
                    tipe_report: tipe,
                    ttd_1: dataReportRBA.ttd_1 === null ? '' : dataReportRBA.ttd_1,
                    ttd_2: dataReportRBA.ttd_2 === null ? '' : dataReportRBA.ttd_2,
                    ttd_1_64: dataReportRBA.ttd_1_64,
                    ttd_2_64: dataReportRBA.ttd_2_64,
                    data: dataReportRBA.data.map((item: any) => ({
                        no_urut: item.no_urut === null ? '' : item.no_urut,
                        kode_rpeba: item.kode_rpeba === null ? '' : item.kode_rpeba,
                        no_rpeba: item.no_rpeba === null ? '' : item.no_rpeba,
                        no_fj: item.no_fj === null ? '' : item.no_fj,
                        tgl_fj: item.tgl_fj === null ? '' : item.tgl_fj,
                        tgl_sj: item.tgl_mb === null ? '' : item.tgl_mb,
                        nopol: item.nopol === null ? '' : item.nopol,
                        no_kontrak: item.no_kontrak === null ? '' : item.no_kontrak,
                        diskripsi: item.diskripsi === null ? '' : item.diskripsi,
                        qty: item.qty === null ? '' : item.qty,
                        harga: item.harga === null ? '' : item.harga,
                        // jumlah: item.Total === null ? '' : item.Total,
                        jumlah: item.jumlah === null ? '' : item.jumlah,
                        tipe: item.tipe,
                        catatan_keuangan: item.catatan_keuangan === null ? '' : item.catatan_keuangan,
                        tgl1: item.tgl1 === null ? '' : item.tgl1,
                        tgl2: item.tgl2 === null ? '' : item.tgl2,
                        tgl3: item.tgl3 === null ? '' : item.tgl3,
                        no_rek: item.norek,
                        nama_rek: item.nama_rek,
                        bank: item.bank,
                        // ttd_1: item.ttd_1 === null ? '' : item.ttd_1,
                        // ttd_2: item.ttd_2 === null ? '' : item.ttd_2,
                    })),
                },
            ],
        };
    };

    const generatePDF = async (tipe: any) => {
        // await showLoading1(true);
        setIsSaving(true);
        setIsModalOpen(true); // Buka modal
        setProgress(0);
        setIsError(false);
        setMessage(''); // Reset pesan

        const interval = setInterval(() => {
            setProgress((prev) => (prev < 90 ? prev + 10 : prev));
        }, 300);
        try {
            setMessage('Proses Download Data.....');
            setProgress(11); // Berhasil menyimpan data PPI
            if (gridListDataKonsolidasiRbaRef.current && Array.isArray(gridListDataKonsolidasiRbaRef.current.dataSource)) {
                const updatedDataSource = gridListDataKonsolidasiRbaRef.current.dataSource;
                const filter = updatedDataSource.filter((item: any) => item.pilih === 1);
                const dataSource = filter.map((item: any) => ({
                    kode_rpeba: item.kode_rpeba,
                    no_rpeba: item.no_rpeba,
                    jumlah_cabang: item.jumlah_cabang,
                    jumlah_pabrik: item.jumlah_pabrik,
                    entitas: item.entitas,
                }));
                for (const item of dataSource) {
                    setMessage(`Proses Generate PDF No. ${item.no_rpeba}`);
                    setProgress(30); // Berhasil mengunggah file
                    const dataReportRBA = await GetCekDataReportRBA(item.entitas, item.kode_rpeba, token);
                    setMessage(`Proses Generate PDF No. ${item.no_rpeba}`);
                    setProgress(50); // Berhasil mengunggah file
                    const transformedData = transformDataReportRBA(dataReportRBA, item.jumlah_cabang, item.jumlah_pabrik, tipe);
                    hasilJsonListReportRBA.data.push(...transformedData.data);
                    setMessage(`Proses Generate PDF No. ${item.no_rpeba}`);
                    setProgress(100); // Berhasil mengunggah file
                }

                const data = hasilJsonListReportRBA;
                const pdf = new jsPDF('p', 'mm', 'letter');
                console.log(' data.data = ', data.data);

                data.data.forEach((report, index) => {
                    const pabrikData = report.data.filter((item: any) => item.tipe === 'pabrik');
                    console.log('pabrikData = ', pabrikData);
                    const cabangData = report.data.filter((item: any) => item.tipe === 'cabang');
                    if (report.jumlah_cabang > 0 && report.jumlah_pabrik > 0) {
                        const htmlContent = `
                                <div style="font-family: 'Times New Roman', Times, serif; font-size: 9px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;margin-top: 10px;">
                                        <div style="width: 30px; height: 30px; background-color: green; margin-left: 40px"></div>
                                        
                                            <h3 style="flex: 1; text-align: center; margin: 0; font-size: 9px; font-weight: bold">LAPORAN KLAIM BARANG KURANG</h3>
                                        </div>
                                        <hr style="width: 95%; margin: auto;margin-top: 10px;height: 0.2px; background-color: black; border: none;"></hr>
                                        <div style="display: flex; justify-content: space-between; margin-top: 10px; margin-bottom: 10px; margin-left: 40px; font-size: 9px;">
                                        ${
                                            report.tipe_report === 'pkp'
                                                ? `<div>
                                                <p style="font-size: 8px">${report.data_NamaEntitas}</p>
                                                <p style="font-size: 8px"><strong>PERIODE : ${report.data_Periode}</strong></p>
                                                <p style="font-size: 8px">${report.data_NamaSupp}</p>
                                            </div>
                                            <table style="width: 40%; font-family: 'Times New Roman', Times, serif; font-size: 7px">
                                                <tr>
                                                    <td style="text-align: right; padding: 0px 3px; line-height: 0.9; border: none; font-size: 9px">No. RBA :</td>
                                                    <td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none; font-size: 9px">${report.data_NoRBA}</td>
                                                </tr>
                                                <tr>
                                                    <td style="text-align: right; padding: 0px 3px; line-height: 0.9; border: none; font-size: 9px">Tanggal ACC Pabrik :</td>
                                                    <td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none; font-size: 9px">${report.data_TanggalACC}</td>
                                                </tr>
                                                <tr>
                                                    <td style="text-align: right; padding: 0px 3px; line-height: 0.9; border: none; font-size: 9px">Tanggal dibuat :</td>
                                                    <td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none; font-size: 9px">${report.data_TanggalDiBuat}</td>
                                                </tr>
                                            </table>`
                                                : `<div>
                                                <p style="font-size: 9px">${report.data_NamaEntitas}</p>
                                                <p style="font-size: 9px"><strong>PERIODE : ${report.data_Periode}</strong></p>
                                                <p style="font-size: 9px">${report.data_AliasMNama}</p>
                                            </div>
                                            <table style="width: 40%; font-family: 'Times New Roman', Times, serif; font-size: 9px">
                                                <tr>
                                                    <td style="text-align: right; padding: 0px 3px; line-height: 0.9; border: none; font-size: 9px">No. RBA :</td>
                                                    <td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none; font-size: 9px">${report.data_NoRBA}</td>
                                                </tr>
                                                <tr>
                                                    <td style="text-align: right; padding: 0px 3px; line-height: 0.9; border: none; font-size: 9px">Tanggal ACC Pabrik :</td>
                                                    <td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none; font-size: 9px">${report.data_TanggalACC}</td>
                                                </tr>
                                                <tr>
                                                    <td style="text-align: right; padding: 0px 3px; line-height: 0.9; border: none; font-size: 9px">Tanggal dibuat :</td>
                                                    <td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none; font-size: 9px">${report.data_TanggalDiBuat}</td>
                                                </tr>
                                            </table>
                                        `
                                        }
                                        </div>

                                        <table border="1" style="width: 95%; margin: auto; border-collapse: separate; border-spacing: 0; font-size: 9px;">
                                            <thead>
                                                <tr>
                                                <th style="border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px; white-space: nowrap;">No.</th>
                                                <th style="border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px; white-space: nowrap;">No BA</th>
                                                <th style="border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px; white-space: nowrap;">No. FJ</th>
                                                <th style="border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px; white-space: nowrap;width:70px;">Tgl. FJ</th>
                                                <th style="border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px; white-space: nowrap;width:70px;">Tgl. SJ</th>
                                                <th style="border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px; white-space: nowrap;width:60px;">Nopol</th>
                                                <th style="border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px; white-space: nowrap;width:80px;">No. Kontrak</th>
                                                <th style="border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px; white-space: nowrap;width:100px;">Nama Barang</th>
                                                <th style="border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px; white-space: nowrap;">Qty</th>
                                                <th style="border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px; white-space: nowrap;">Harga</th>
                                                <th style=" border-top: 0.2px solid black;font-size: 9px; white-space: nowrap;">Jumlah</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            
                                            ${pabrikData
                                                .map(
                                                    (item: any) => `
                                                <tr>
                                                    <td style="line-height: 1; padding: 1px 2px;border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px">${item.no_urut}</td>
                                                    <td style="line-height: 1; padding: 1px 2px;border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px">${item.no_rpeba}</td>
                                                    <td style="line-height: 1; padding: 1px 2px;border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px">${item.no_fj}</td>
                                                    <td style="line-height: 1; padding: 1px 2px;border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px">${
                                                        moment(item.tgl_fj).isValid() ? moment(item.tgl_fj).format('DD-MM-YYYY') : ''
                                                    }</td>
                                                    <td style="line-height: 1; padding: 1px 2px;border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px">${
                                                        moment(item.tgl_sj).isValid() ? moment(item.tgl_sj).format('DD-MM-YYYY') : ''
                                                    }</td>
                                                    <td style="line-height: 1; padding: 1px 2px;border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px">${item.nopol}</td>
                                                    <td style="line-height: 1; padding: 1px 2px;border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px">${item.no_kontrak}</td>
                                                    <td style="line-height: 1; padding: 1px 2px;border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px">${item.diskripsi}</td>
                                                    <td style="line-height: 1; padding: 1px 2px;text-align: right; border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px">${frmNumber(
                                                        item.qty.toFixed(2)
                                                    )}</td>
                                                    <td style="line-height: 1; padding: 1px 2px;text-align: right; border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px">${frmNumber(
                                                        parseFloat(item.harga).toFixed(2)
                                                    )}</td>
                                                    <td style="line-height: 1; padding: 1px 2px;text-align: right; border-top: 0.2px solid black; font-size: 9px">${frmNumber(
                                                        parseFloat(item.jumlah).toFixed(2)
                                                    )}</td>
                                                </tr>
                                            `
                                                )
                                                .join('')}
                                            <tr>
                                                <td colspan="8" style="text-align: right; padding: 6px 8px; border-bottom: 0.2px solid black; border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px"><strong>Total</strong></td>
                                                <td style="text-align: right; padding: 6px 8px; border-bottom: 0.2px solid black; border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px"><strong>${frmNumber(
                                                    pabrikData.reduce((sum: number, item: any) => sum + Number(item.qty || 0), 0).toFixed(2)
                                                )}</strong></td>
                                                <td style="padding: 6px 8px; border-bottom: 0.2px solid black; border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px"></td>
                                                <td style="text-align: right; padding: 6px 8px; border-bottom: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px"><strong>${frmNumber(
                                                    pabrikData.reduce((sum: number, item: any) => sum + Number(item.jumlah || 0), 0).toFixed(2)
                                                )}</strong></td>
                                            </tr>
                                            </tbody>
                                        </table>

                                        <div style="display: flex; justify-content: space-around; margin-top: 30px; text-align: center; font-size: 9px;">
                                            <div style="width:30%">
                                            </div>
                                            <div style="width:25%">
                                                <p style="font-size: 9px;">Hormat kami,</p>
                                            </div>
                                            <div style="width:20%">
                                                <p style="font-size: 9px;">Mengetahui</p>
                                            </div>
                                            <div style="width:20%">
                                                <p style="font-size: 9px;">Menyetujui</p>
                                                <br>
                                            </div>
                                        </div>
                                     
                                        <div style="display: flex; justify-content: space-around; text-align: center; font-size: 9px;">
                                        <div style="width:38%">
                                        <h3 style="flex: 1; text-align: left; margin: 0; margin-left: 40px; font-size: 9px; font-weight: bold">MOHON DI TRANSFER KE NO. REK :</h3>
                                            <table style="width: 100%; margin-left: 40px; font-family: 'Times New Roman', Times, serif; font-size: 9px">
                                                        <tr>
                                                            <td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none;font-weight: bold; width: 85px;font-size: 9px;">BANK</td>
                                                            ${
                                                                report.tipe_report === 'pkp'
                                                                    ? `<td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none;font-weight: bold;font-size: 9px;">: ${
                                                                          pabrikData[0].bank === null ? '' : pabrikData[0].bank
                                                                      }</td>`
                                                                    : `<td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none;font-weight: bold;font-size: 9px;">: BCA</td>`
                                                            }
                                                           
                                                        </tr>
                                                        <tr>
                                                            <td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none;font-weight: bold;font-size: 9px;">NO. REK </td>
                                                            ${
                                                                report.tipe_report === 'pkp'
                                                                    ? `<td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none;font-weight: bold;font-size: 9px;">: ${
                                                                          pabrikData[0].no_rek === null ? '' : pabrikData[0].no_rek
                                                                      }</td>`
                                                                    : `<td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none;font-weight: bold;font-size: 9px;">: 176-9000-559</td>`
                                                            }
                                                            
                                                        </tr>
                                                        <tr>
                                                            <td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none;font-weight: bold;font-size: 9px;">A/N</td>
                                                            ${
                                                                report.tipe_report === 'pkp'
                                                                    ? `<td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none;font-weight: bold;font-size: 9px;">: ${
                                                                          pabrikData[0].nama_rek === null ? '' : pabrikData[0].nama_rek
                                                                      }</td>`
                                                                    : `<td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none;font-weight: bold;font-size: 9px;">: SHIERLEY</td>`
                                                            }
                                                        </tr>
                                            </table>
                                        </div>
                                        <div style="width:28%">
                                            <div style="display: flex; align-items: center; width: 100%; font-size: 9px;">
                                                <!-- Gambar tanda tangan -->
                                                <div style="width: 40%; text-align: left;">
                                                    <img src="data:image/jpg;base64,${report.ttd_1_64}" width="80" height="40" />
                                                </div>
                                        
                                                <!-- Teks tgl1 di sebelah kanan gambar -->
                                                <div style="width: 60%; text-align: left;">
                                                    <p>${pabrikData[0].tgl1}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div style="width:18%">
                                            <p style="font-size: 9px;">${pabrikData[0].tgl2}</p>
                                        </div>
                                        <div style="width:20%">
                                            <div style="display: flex; align-items: right; width: 100%; font-size: 9px;">
                                                    <!-- Gambar tanda tangan -->
                                                    <div style="width: 60%; text-align: left;">
                                                        <img src="data:image/jpg;base64,${report.ttd_2_64}" width="80" height="40" />
                                                    </div>              
                                                    <!-- Teks tgl1 di sebelah kanan gambar -->
                                                    <div style="width: 40%; text-align: left;">
                                                        <p>${pabrikData[0].tgl3}</p>
                                                    </div>
                                                
                                            </div>
                                        </div>
                                    </div>
                                                

                                                <div style="display: flex; justify-content: space-around; margin-top: 10px; text-align: center; font-size: 9px;">
                                            <div style="width:30%">
                                            </div>
                                            <div style="width:25%">
                                                <p style="font-size: 9px;">${pabrikData[0].catatan_keuangan}</p>
                                                <br><br>
                                            </div>
                                            <div style="width:20%">
                                            </div>
                                            <div style="width:20%">
                                            </div>
                                        </div>
                                                

                                    </div>
                                    
                                    <br>
                                    <div style="font-family: 'Times New Roman', Times, serif; font-size: 9px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;margin-top: 10px;">
                                        <div style="width: 30px; height: 30px; background-color: yellow; margin-left: 40px;"></div>
                                                
                                            <h3 style="flex: 1; text-align: center; margin: 0; font-size: 9px; font-weight: bold">LAPORAN KLAIM BARANG KURANG BEBAN CABANG</h3>
                                        </div>
                                        <hr style="width: 95%; margin: auto;margin-top: 10px;height: 0.2px; background-color: black; border: none;"></hr>

                                        <div style="display: flex; justify-content: space-between; margin-top: 10px; margin-bottom: 10px; margin-left: 40px; font-size: 9px;">
                                        ${
                                            report.tipe_report === 'pkp'
                                                ? `<div>
                                                <p style="font-size: 9px">${report.data_NamaEntitas}</p>
                                                <p style="font-size: 9px"><strong>PERIODE : ${report.data_Periode}</strong></p>
                                                <p style="font-size: 9px">${report.data_NamaSupp}</p>
                                            </div>
                                            <table style="width: 40%; font-family: 'Times New Roman', Times, serif; font-size: 9px">
                                                <tr>
                                                    <td style="text-align: right; padding: 0px 3px; line-height: 0.9; border: none;font-size: 9px">No. RBA :</td>
                                                    <td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none;font-size: 9px">${report.data_NoRBA}</td>
                                                </tr>
                                                <tr>
                                                    <td style="text-align: right; padding: 0px 3px; line-height: 0.9; border: none;font-size: 9px">Tanggal ACC Pabrik :</td>
                                                    <td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none;font-size: 9px">${report.data_TanggalACC}</td>
                                                </tr>
                                                <tr>
                                                    <td style="text-align: right; padding: 0px 3px; line-height: 0.9; border: none;font-size: 9px">Tanggal dibuat :</td>
                                                    <td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none;font-size: 9px">${report.data_TanggalDiBuat}</td>
                                                </tr>
                                            </table>`
                                                : `<div>
                                                <p>${report.data_NamaEntitas}</p>
                                                <p><strong>PERIODE : ${report.data_Periode}</strong></p>
                                                <p>${report.data_AliasMNama}</p>
                                            </div>
                                            <table style="width: 40%; font-family: 'Times New Roman', Times, serif; font-size: 9px">
                                                <tr>
                                                    <td style="text-align: right; padding: 0px 3px; line-height: 0.9; border: none;font-size: 9px">No. RBA :</td>
                                                    <td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none;font-size: 9px">${report.data_NoRBA}</td>
                                                </tr>
                                                <tr>
                                                    <td style="text-align: right; padding: 0px 3px; line-height: 0.9; border: none;font-size: 9px">Tanggal ACC Pabrik :</td>
                                                    <td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none;font-size: 9px">${report.data_TanggalACC}</td>
                                                </tr>
                                                <tr>
                                                    <td style="text-align: right; padding: 0px 3px; line-height: 0.9; border: none;font-size: 9px">Tanggal dibuat :</td>
                                                    <td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none;font-size: 9px">${report.data_TanggalDiBuat}</td>
                                                </tr>
                                            </table>
                                        `
                                        }
                                        </div>

                                        <table border="1" style="width: 95%; margin: auto; border-collapse: separate; border-spacing: 0; font-size: 9px;">
                                            <thead>
                                                <tr>
                                                    <th style="border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px; white-space: nowrap;">No.</th>
                                                    <th style="border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px; white-space: nowrap;">No BA</th>
                                                    <th style="border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px; white-space: nowrap;">No. FJ</th>
                                                    <th style="border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px; white-space: nowrap;width:70px;">Tgl. FJ</th>
                                                    <th style="border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px; white-space: nowrap;width:70px;">Tgl. SJ</th>
                                                    <th style="border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px; white-space: nowrap;width:60px;">Nopol</th>
                                                    <th style="border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px; white-space: nowrap;width:80px;">No. Kontrak</th>
                                                    <th style="border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px; white-space: nowrap;width:100px;">Nama Barang</th>
                                                    <th style="border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px; white-space: nowrap;">Qty</th>
                                                    <th style="border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px; white-space: nowrap;">Harga</th>
                                                    <th style="border-top: 0.2px solid black;font-size: 9px;  white-space: nowrap;">Jumlah</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            
                                            ${cabangData
                                                .map(
                                                    (item: any) => `
                                                <tr>
                                                    <td style="line-height: 1; padding: 1px 2px;border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px">${item.no_urut}</td>
                                                    <td style="line-height: 1; padding: 1px 2px;border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px">${item.no_rpeba}</td>
                                                    <td style="line-height: 1; padding: 1px 2px;border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px">${item.no_fj}</td>
                                                    <td style="line-height: 1; padding: 1px 2px;border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px">${
                                                        moment(item.tgl_fj).isValid() ? moment(item.tgl_fj).format('DD-MM-YYYY') : ''
                                                    }</td>
                                                    <td style="line-height: 1; padding: 1px 2px;border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px">${
                                                        moment(item.tgl_sj).isValid() ? moment(item.tgl_sj).format('DD-MM-YYYY') : ''
                                                    }</td>
                                                    <td style="line-height: 1; padding: 1px 2px;border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px">${item.nopol}</td>
                                                    <td style="line-height: 1; padding: 1px 2px;border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px">${item.no_kontrak}</td>
                                                    <td style="line-height: 1; padding: 1px 2px;border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px">${item.diskripsi}</td>
                                                    <td style="line-height: 1; padding: 1px 2px;text-align: right; border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px">${frmNumber(
                                                        item.qty.toFixed(2)
                                                    )}</td>
                                                    <td style="line-height: 1; padding: 1px 2px;text-align: right; border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px">${frmNumber(
                                                        parseFloat(item.harga).toFixed(2)
                                                    )}</td>
                                                    <td style="line-height: 1; padding: 1px 2px;text-align: right; border-top: 0.2px solid black; font-size: 9px">${frmNumber(
                                                        parseFloat(item.jumlah).toFixed(2)
                                                    )}</td>
                                                </tr>
                                            `
                                                )
                                                .join('')}
                                            <tr>
                                                <td colspan="8" style="text-align: right; padding: 6px 8px; border-bottom: 0.2px solid black; border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px"><strong>Total</strong></td>
                                                <td style="text-align: right; padding: 6px 8px; border-bottom: 0.2px solid black; border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px"><strong>${frmNumber(
                                                    cabangData.reduce((sum: number, item: any) => sum + Number(item.qty || 0), 0).toFixed(2)
                                                )}</strong></td>
                                                <td style="padding: 6px 8px; border-bottom: 0.2px solid black; border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px"></td>
                                                <td style="text-align: right; padding: 6px 8px; border-bottom: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px"><strong>${frmNumber(
                                                    cabangData.reduce((sum: number, item: any) => sum + Number(item.jumlah || 0), 0).toFixed(2)
                                                )}</strong></td>
                                            </tr>
                                            </tbody>
                                        </table>

                                        <div style="display: flex; justify-content: space-around; margin-top: 30px; text-align: center; font-size: 9px;">
                                            <div style="width:30%">
                                            </div>
                                            <div style="width:25%">
                                                <p style="font-size: 9px;">Hormat kami,</p>
                                                <br><br>
                                            </div>
                                            <div style="width:20%">
                                                <p style="font-size: 9px;">Mengetahui</p>
                                                <br><br>
                                            </div>
                                            <div style="width:20%">
                                                <p style="font-size: 9px;">Menyetujui</p>
                                                <br><br>
                                            </div>
                                        </div>

                                        <div style="display: flex; justify-content: space-around; text-align: center; font-size: 9px;">
                                        <div style="width:38%">
                                        
                                        </div>
                                        <div style="width:28%">
                                            <div style="display: flex; align-items: center; width: 100%; font-size: 9px;">
                                                <!-- Gambar tanda tangan -->
                                                <div style="width: 40%; text-align: left;">
                                                    <img src="data:image/jpg;base64,${report.ttd_1_64}" width="80" height="40" />
                                                </div>
                                        
                                                <!-- Teks tgl1 di sebelah kanan gambar -->
                                                <div style="width: 60%; text-align: left;">
                                                    <p>${cabangData[0].tgl1}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div style="width:18%">
                                            <p style="font-size: 9px;">${cabangData[0].tgl2}</p>
                                        </div>
                                        <div style="width:20%">
                                            <div style="display: flex; align-items: right; width: 100%; font-size: 9px;">
                                                <!-- Gambar tanda tangan -->
                                                <div style="width: 60%; text-align: left;">
                                                    <img src="data:image/jpg;base64,${report.ttd_2_64}" width="80" height="40" />
                                                </div>              
                                                <!-- Teks tgl1 di sebelah kanan gambar -->
                                                <div style="width: 40%; text-align: left;">
                                                    <p>${cabangData[0].tgl3}</p>
                                                </div>
                                            
                                            </div>               
                                        </div>
                                    </div>

                                        <div style="display: flex; justify-content: space-around; margin-top: 50px; text-align: center; font-size: 9px;">
                                            <div style="width:30%">
                                            </div>
                                            <div style="width:25%">
                                                <p style="font-size: 9px;">${pabrikData[0].catatan_keuangan}</p>
                                                <br><br>
                                            </div>
                                            <div style="width:20%">
                                            </div>
                                            <div style="width:20%">
                                            </div>
                                        </div>

                                        
                                    </div>
                                    
                                `;

                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = htmlContent;
                        tempDiv.style.position = 'absolute';
                        tempDiv.style.left = '-9999px';
                        document.body.appendChild(tempDiv);

                        html2canvas(tempDiv, {
                            scale: 2, // atau 3 jika masih burem
                            useCORS: true, // jika pakai gambar dari URL
                        }).then((canvas) => {
                            const imgData = canvas.toDataURL('image/png');
                            const pdfWidth = pdf.internal.pageSize.getWidth();
                            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                            if (index > 0) pdf.addPage();
                            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                            document.body.removeChild(tempDiv);

                            if (index === data.data.length - 1) {
                                pdf.save(`${formattedName}.pdf`);
                            }
                        });
                    } else {
                        const htmlContent = `
                                    <div style="font-family: 'Times New Roman', Times, serif; font-size: 9px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;margin-top: 10px;">
                                        ${
                                            report.jumlah_cabang > 0
                                                ? `<div style="width: 30px; height: 30px; background-color: yellow; margin-left: 40px;"></div>`
                                                : `<div style="width: 30px; height: 30px; background-color: green; margin-left: 40px"></div>`
                                        }
                                            <h3 style="flex: 1; text-align: center; margin: 0; font-size: 9px; font-weight: bold">${report.data_NamaHeader}</h3>
                                        </div>
                                        <hr style="width: 95%; margin: auto;margin-top: 10px;height: 0.2px; background-color: black; border: none;"></hr>

                                        <div style="display: flex; justify-content: space-between; margin-top: 10px; margin-bottom: 10px; margin-left: 40px; font-size: 9px;">
                                        ${
                                            report.tipe_report === 'pkp'
                                                ? `<div>
                                                <p style="font-size: 9px">${report.data_NamaEntitas}</p>
                                                <p style="font-size: 9px"><strong>PERIODE : ${report.data_Periode}</strong></p>
                                                <p style="font-size: 9px">${report.data_NamaSupp}</p>
                                            </div>
                                            <table style="width: 40%; font-family: 'Times New Roman', Times, serif; font-size: 9px">
                                                <tr>
                                                    <td style="text-align: right; padding: 0px 3px; line-height: 0.9; border: none; font-size: 9px">No. RBA :</td>
                                                    <td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none; font-size: 9px">${report.data_NoRBA}</td>
                                                </tr>
                                                <tr>
                                                    <td style="text-align: right; padding: 0px 3px; line-height: 0.9; border: none; font-size: 9px">Tanggal ACC Pabrik :</td>
                                                    <td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none; font-size: 9px">${report.data_TanggalACC}</td>
                                                </tr>
                                                <tr>
                                                    <td style="text-align: right; padding: 0px 3px; line-height: 0.9; border: none; font-size: 9px">Tanggal dibuat :</td>
                                                    <td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none; font-size: 9px">${report.data_TanggalDiBuat}</td>
                                                </tr>
                                            </table>`
                                                : `<div>
                                                <p style="font-size: 9px">${report.data_NamaEntitas}</p>
                                                <p style="font-size: 9px"><strong>PERIODE : ${report.data_Periode}</strong></p>
                                                <p style="font-size: 9px">${report.data_AliasMNama}</p>
                                            </div>
                                            <table style="width: 40%; font-family: 'Times New Roman', Times, serif; font-size: 9px">
                                                <tr>
                                                    <td style="text-align: right; padding: 0px 3px; line-height: 0.9; border: none; font-size: 9px">No. RBA :</td>
                                                    <td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none; font-size: 9px">${report.data_NoRBA}</td>
                                                </tr>
                                                <tr>
                                                    <td style="text-align: right; padding: 0px 3px; line-height: 0.9; border: none; font-size: 9px">Tanggal ACC Pabrik :</td>
                                                    <td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none; font-size: 9px">${report.data_TanggalACC}</td>
                                                </tr>
                                                <tr>
                                                    <td style="text-align: right; padding: 0px 3px; line-height: 0.9; border: none; font-size: 9px">Tanggal dibuat :</td>
                                                    <td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none; font-size: 9px">${report.data_TanggalDiBuat}</td>
                                                </tr>
                                            </table>
                                        `
                                        }
                                        </div>

                                        <table border="1" style="width: 95%; margin: auto;">
                                            <thead>
                                                <tr>
                                                <th style="border-right: 0.1px solid black; border-top: 0.1px solid black; font-size: 9px; white-space: nowrap;">No.</th>
                                                <th style="border-right: 0.1px solid black; border-top: 0.1px solid black; font-size: 9px; white-space: nowrap;">No BA</th>
                                                <th style="border-right: 0.1px solid black; border-top: 0.1px solid black; font-size: 9px; white-space: nowrap;">No. FJ</th>
                                                <th style="border-right: 0.1px solid black; border-top: 0.1px solid black; font-size: 9px; white-space: nowrap; width:70px;">Tgl. FJ</th>
                                                <th style="border-right: 0.1px solid black; border-top: 0.1px solid black; font-size: 9px; white-space: nowrap; width:70px;">Tgl. SJ</th>
                                                <th style="border-right: 0.1px solid black; border-top: 0.1px solid black; font-size: 9px; white-space: nowrap; width:60px;">Nopol</th>
                                                <th style="border-right: 0.1px solid black; border-top: 0.1px solid black; font-size: 9px; white-space: nowrap;">No. Kontrak</th>
                                                <th style="border-right: 0.1px solid black; border-top: 0.1px solid black; font-size: 9px; white-space: nowrap; width:100px;">Nama Barang</th>
                                                <th style="border-right: 0.1px solid black; border-top: 0.1px solid black; font-size: 9px; white-space: nowrap;">Qty</th>
                                                <th style="border-right: 0.1px solid black; border-top: 0.1px solid black; font-size: 9px; white-space: nowrap;">Harga</th>
                                                <th style=" border-top: 0.1px solid black;font-size: 9px; white-space: nowrap;">Jumlah</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${report.data
                                                    .map(
                                                        (item: any) => `
                                                        <tr>
                                                        <td style="line-height: 1; padding: 1px 2px; border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 7px">${
                                                            item.no_urut
                                                        }</td>
                                                        <td style="line-height: 1; padding: 1px 2px; border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 7px">${
                                                            item.no_rpeba
                                                        }</td>
                                                        <td style="line-height: 1; padding: 1px 2px; border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 7px">${item.no_fj}</td>
                                                        <td style="line-height: 1; padding: 1px 2px;border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 7px">${
                                                            moment(item.tgl_fj).isValid() ? moment(item.tgl_fj).format('DD-MM-YYYY') : ''
                                                        }</td>
                                                        <td style="border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 7px">${
                                                            moment(item.tgl_sj).isValid() ? moment(item.tgl_sj).format('DD-MM-YYYY') : ''
                                                        }</td>
                                                        <td style="line-height: 1; padding: 1px 2px; border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 7px">${item.nopol}</td>
                                                        <td style="line-height: 1; padding: 1px 2px; border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 7px">${
                                                            item.no_kontrak
                                                        }</td>
                                                        <td style="line-height: 1; padding: 1px 2px; border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 7px">${
                                                            item.diskripsi
                                                        }</td>
                                                        <td style="line-height: 1; padding: 1px 2px; text-align: right; border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 7px">${frmNumber(
                                                            item.qty.toFixed(2)
                                                        )}</td>
                                                        <td style="line-height: 1; padding: 1px 2px; text-align: right; border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 7px">${frmNumber(
                                                            parseFloat(item.harga).toFixed(2)
                                                        )}</td>
                                                        <td style="line-height: 1; padding: 1px 2px; text-align: right; border-top: 0.2px solid black; font-size: 7px">${frmNumber(
                                                            parseFloat(item.jumlah).toFixed(2)
                                                        )}</td>
                                                    </tr>
                                                `
                                                    )
                                                    .join('')}
                                                <tr>
                                                    <td colspan="8" style="text-align: right; padding: 6px 8px; border-bottom: 0.2px solid black; border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px"><strong>Total</strong></td>
                                                    <td style="text-align: right; padding: 6px 8px; border-bottom: 0.2px solid black; border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px"><strong>${frmNumber(
                                                        report.data.reduce((sum: any, item: any) => sum + (parseFloat(item.qty) || 0), 0).toFixed(2)
                                                    )}</strong></td>
                                                    <td style="padding: 6px 8px; border-bottom: 0.2px solid black; border-right: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px"></td>
                                                    <td style="text-align: right; padding: 6px 8px; border-bottom: 0.2px solid black; border-top: 0.2px solid black; font-size: 9px"><strong>${frmNumber(
                                                        report.data.reduce((sum: any, item: any) => sum + (parseFloat(item.jumlah) || 0), 0).toFixed(2)
                                                    )}</strong></td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        <div style="display: flex; justify-content: space-around; margin-top: 30px; text-align: center; font-size: 9px;">
                                            <div style="width:30%; font-size: 9px;">
                                            </div>
                                            <div style="width:25%">
                                                <p style="font-size: 9px;">Hormat kami,</p>
                                                <br>
                                            </div>
                                            <div style="width:20%">
                                                <p style="font-size: 9px;">Mengetahui</p>
                                                <br>
                                            </div>
                                            <div style="width:20%">
                                                <p style="font-size: 9px;">Menyetujui</p>
                                                <br>
                                            </div>
                                        </div>
                                        ${
                                            report.jumlah_cabang <= 0
                                                ? `
                                                <div style="display: flex; justify-content: space-around; text-align: center; font-size: 9px;">
                                        <div style="width:38%">
                                        <h3 style="flex: 1; margin-bottom: 10px; text-align: left; margin: 0; margin-left: 40px; font-size: 9px; font-weight: bold">MOHON DI TRANSFER KE NO. REK :</h3>
                                            <table style="width: 80%; margin-left: 40px; font-family: 'Times New Roman', Times, serif; font-size: 9px">
                                                    <tr>
                                                        <td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none;font-weight: bold; width: 85px; font-size: 9px;">BANK</td>
                                                        ${
                                                            report.tipe_report === 'pkp'
                                                                ? `<td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none;font-weight: bold;font-size: 9px;">: ${
                                                                      report.data[0].bank === null ? '' : report.data[0].bank
                                                                  }</td>`
                                                                : `<td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none;font-weight: bold;font-size: 9px;">: BCA</td>`
                                                        }                        
                                                    </tr>
                                                    <tr>
                                                        <td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none;font-weight: bold;font-size: 9px;">NO. REK </td>
                                                        ${
                                                            report.tipe_report === 'pkp'
                                                                ? `<td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none;font-weight: bold;font-size: 9px;">: ${
                                                                      report.data[0].no_rek === null ? '' : report.data[0].no_rek
                                                                  }</td>`
                                                                : `<td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none;font-weight: bold;font-size: 9px;">: 176-9000-559</td>`
                                                        }
                                                        
                                                    </tr>
                                                    <tr>
                                                        <td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none;font-weight: bold;font-size: 9px;">A/N</td>
                                                        ${
                                                            report.tipe_report === 'pkp'
                                                                ? `<td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none;font-weight: bold;font-size: 9px;">: ${
                                                                      report.data[0].nama_rek === null ? '' : report.data[0].nama_rek
                                                                  }</td>`
                                                                : `<td style="text-align: left; padding: 0px 3px; line-height: 0.9; border: none;font-weight: bold;font-size: 9px;">: SHIERLEY</td>`
                                                        }
                                                    </tr>
                                            </table>
                                        </div>
                                        <div style="width:28%">
                                            <div style="display: flex; align-items: center; width: 100%; font-size: 9px;">
                                                <!-- Gambar tanda tangan -->
                                                <div style="width: 40%; text-align: left;">
                                                    <img src="data:image/jpg;base64,${report.ttd_1_64}" width="80" height="40" />
                                                </div>
                                        
                                                <!-- Teks tgl1 di sebelah kanan gambar -->
                                                <div style="width: 60%; text-align: left;">
                                                    <p>${report.data[0].tgl1}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div style="width:18%">
                                            <p style="font-size: 9px;">${report.data[0].tgl2}</p>
                                        </div>
                                        <div style="width:20%">
                                            <div style="display: flex; align-items: right; width: 100%; font-size: 9px;">
                                                <!-- Gambar tanda tangan -->
                                                <div style="width: 60%; text-align: left;">
                                                    <img src="data:image/jpg;base64,${report.ttd_2_64}" width="80" height="40" />
                                                </div>              
                                                <!-- Teks tgl1 di sebelah kanan gambar -->
                                                <div style="width: 40%; text-align: left;">
                                                    <p>${report.data[0].tgl3}</p>
                                                </div>
                                                <br><br>
                                            </div>
                                        </div>`
                                                : `
                                                <div style="display: flex; justify-content: space-around; text-align: center; font-size: 9px;">
                                        <div style="width:38%">
                                        
                                        </div>
                                        <div style="width:28%">
                                          <div style="display: flex; align-items: center; width: 100%; font-size: 9px;">
                                            <!-- Gambar tanda tangan -->
                                            <div style="width: 40%; text-align: left;">
                                                <img src="data:image/jpg;base64,${report.ttd_1_64}" width="80" height="40" />
                                            </div>
                                      
                                            <!-- Teks tgl1 di sebelah kanan gambar -->
                                            <div style="width: 60%; text-align: left;">
                                                <p>${report.data[0].tgl1}</p>
                                            </div>
                                          </div>
                                        </div>
                                        <div style="width:18%">
                                            <p style="font-size: 9px;">${report.data[0].tgl2}</p>
                                        </div>
                                        <div style="width:20%">
                                            <div style="display: flex; align-items: right; width: 100%; font-size: 9px;">
                                                <!-- Gambar tanda tangan -->
                                                <div style="width: 60%; text-align: left;">
                                                    <img src="data:image/jpg;base64,${report.ttd_2_64}" width="80" height="40" />
                                                </div>              
                                                <!-- Teks tgl1 di sebelah kanan gambar -->
                                                <div style="width: 40%; text-align: left;">
                                                    <p>${report.data[0].tgl3}</p>
                                                </div>
                                            <br><br>
                                            </div>
                                        </div>
                                                `
                                        }

                                        <div style="display: flex; justify-content: space-around; margin-top: 50px; text-align: center; font-size: 9px;">
                                            <div style="width:30%">
                                            </div>
                                            <div style="width:25%">
                                                <p style="font-size: 9px;">${report.data[0].catatan_keuangan}</p>
                                                <br><br>
                                            </div>
                                            <div style="width:20%">
                                            </div>
                                            <div style="width:20%">
                                            </div>
                                        </div>

                                    </div>
                                `;

                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = htmlContent;
                        tempDiv.style.position = 'absolute';
                        tempDiv.style.left = '-9999px';
                        document.body.appendChild(tempDiv);

                        html2canvas(tempDiv, {
                            scale: 2, // atau 3 jika masih burem
                            useCORS: true, // jika pakai gambar dari URL
                        }).then((canvas) => {
                            const imgData = canvas.toDataURL('image/png');
                            const pdfWidth = pdf.internal.pageSize.getWidth();
                            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                            if (index > 0) pdf.addPage();
                            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                            document.body.removeChild(tempDiv);

                            if (index === data.data.length - 1) {
                                pdf.save(`${formattedName}.pdf`);
                            }
                        });
                    }
                });
                // showLoading1(false);
            }
        } catch (error: any) {
            console.error(error);
            setLoadingMessage('terjadi kesalahan');

            clearInterval(interval);
            setIsError(true); // Set error jika penyimpanan gagal
            setMessage(error.message); // Tampilkan pesan error
        } finally {
            setIsSaving(false);
            clearInterval(interval); // Hentikan interval
            setTimeout(() => {
                setIsModalOpen(false); // Tutup modal setelah delay
                setProgress(0); // Reset progress
                setIsError(false); // Reset error state
            }, 2000); // Tutup modal setelah 2 detik
        }
    };

    const templateProsesDokumen = (field: string, data: any, column: any) => {
        return data[field] === 'Y' ? '✅' : '⬜';
    };

    const templatePilihDok = (field: string, data: any, column: any) => {
        return data.pilih === 1 ? '✅' : '⬜';
    };

    const rowClick = (args: any) => {
        if (args.cellIndex == 15) {
            Swal.fire({
                title: `Catatan Konsol No. RBA : ${args.rowData.no_rpeba}`,
                input: 'textarea',
                inputValue: args.rowData.catatan_konsol, // Gunakan inputValue untuk nilai awal
                inputAttributes: {
                    autocapitalize: 'off',
                    rows: '10',
                    placeholder: 'Catatan Konsolidasi',
                },
                customClass: {
                    input: styles['custom-textarea-rba'],
                    confirmButton: styles['btn-simpan-catatan-rba'],
                },

                showCancelButton: true,
                confirmButtonText: 'Simpan',
                showLoaderOnConfirm: true,
                preConfirm: async (value) => {
                    simpanDataList('catatanKonsol', value, args.rowData);
                    gridListDataKonsolidasiRbaRef.current.dataSource[args.rowIndex] = {
                        ...gridListDataKonsolidasiRbaRef.current.dataSource[args.rowIndex],
                        catatan_konsol: value,
                    };
                    gridListDataKonsolidasiRbaRef.current.refresh();
                },
                allowOutsideClick: () => !Swal.isLoading(),
            }).then((result) => {
                console.log('result', result);
            });
        } else if (args.cellIndex == 13) {
            simpanDataList('prosesDokumen', args.rowData.kirim_pabrik === 'N' ? 'Y' : 'N', args.rowData);
            gridListDataKonsolidasiRbaRef.current.dataSource[args.rowIndex] = {
                ...gridListDataKonsolidasiRbaRef.current.dataSource[args.rowIndex],
                kirim_pabrik: args.rowData.kirim_pabrik === 'N' ? 'Y' : 'N',
                tgl_pabrik: args.rowData.kirim_pabrik === 'N' ? moment() : '',
            };
            gridListDataKonsolidasiRbaRef.current.refresh();
        } else if (args.cellIndex == 12) {
            // // handleChangePilih(args.rowData.pilih === 0 ? true : false, args.rowData);
            // gridListDataKonsolidasiRbaRef.current.dataSource[args.rowIndex] = {
            //     ...gridListDataKonsolidasiRbaRef.current.dataSource[args.rowIndex],
            //     pilih: args.rowData.pilih === 0 ? 1 : 0,
            // };
            // gridListDataKonsolidasiRbaRef.current.refresh();
            // perubahan 25-06-2025
            const dataSource = gridListDataKonsolidasiRbaRef.current.dataSource;
            const index = dataSource.findIndex((item: any) => item.no_rpeba === args.rowData.no_rpeba);

            if (index !== -1) {
                dataSource[index] = {
                    ...dataSource[index],
                    pilih: dataSource[index].pilih === 0 ? 1 : 0,
                };
                gridListDataKonsolidasiRbaRef.current.refresh();
            } else {
                console.warn('no_rpeba tidak ditemukan di dataSource');
            }

        }
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

        setMasterDataState,
        setMasterKodeDokumen,
        setDialogInputDataVisibleRba,
        setRefreshKey,
        setStateDataHeaderList,

        masterDataState,
        masterKodeDokumen,
        dialogInputDataVisibleRba,
        refreshKey,

        setSelectedEntitas,
        selectedEntitas,

        setListEntitas,
        listEntitas,

        gridListDataKonsolidasiRbaRef: gridListDataKonsolidasiRbaRef.current,
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

                                            <ContextMenuComponent
                                                id="cMenuCetak"
                                                ref={(scope) => (cMenuCetak = scope as any)}
                                                items={menuCetakItems}
                                                select={menuCetakSelect}
                                                animationSettings={{ duration: 800, effect: 'FadeIn' }}
                                            />

                                            <ButtonComponent
                                                id="btnCetak"
                                                cssClass="e-primary e-small"
                                                style={
                                                    userMenu.cetak === 'Y' || userid === 'administrator' || userid === 'ADMINISTRATOR'
                                                        ? { ...styleButton, width: 75 + 'px' }
                                                        : { ...styleButtonDisabled, width: 75 + 'px', color: '#1c1b1f61' }
                                                }
                                                disabled={userMenu.cetak === 'Y' || userid === 'administrator' || userid === 'ADMINISTRATOR' ? false : true}
                                                onClick={btnPrintClick}
                                                content="Cetak"
                                                iconCss="e-icons e-medium e-chevron-down"
                                                iconPosition="Right"
                                            ></ButtonComponent>

                                            <ButtonComponent
                                                id="btnApp"
                                                cssClass="e-primary e-small"
                                                // style={
                                                //     userMenu.app_rba === '2' || userid === 'administrator' || userid === 'ADMINISTRATOR'
                                                //         ? { ...styleButtonApp, width: 100 + 'px', color: 'green' }
                                                //         : { ...styleButtonDisabled, width: 100 + 'px', color: '#1c1b1f61' }
                                                // }
                                                style={{ ...styleButtonApp, width: 100 + 'px', color: 'green' }}
                                                // disabled={userMenu.app_rba === '2' || userid === 'administrator' || userid === 'ADMINISTRATOR' ? false : true}
                                                // disabled={true}
                                                onClick={() => handleOnclickButton('approval')}
                                                content="Approval"
                                                iconCss="e-icons e-medium e-chevron-right"
                                                iconPosition="Left"
                                            ></ButtonComponent>

                                            <ContextMenuComponent
                                                id="cMenuCetak1"
                                                ref={(scope) => (cMenuCetakMergePdf = scope as any)}
                                                items={menuCetakItemsMergerPdf}
                                                select={menuCetakSelectMergePdf}
                                                animationSettings={{ duration: 800, effect: 'FadeIn' }}
                                            />
                                            <ButtonComponent
                                                id="btnMergePdf"
                                                cssClass="e-primary e-small"
                                                // style={
                                                //     userMenu.app_rba === '2' || userid === 'administrator' || userid === 'ADMINISTRATOR'
                                                //         ? { ...styleButtonApp, width: 125 + 'px', color: 'green' }
                                                //         : { ...styleButtonDisabled, width: 125 + 'px', color: '#1c1b1f61' }
                                                // }
                                                style={{ ...styleButtonApp, width: 125 + 'px', color: 'green' }}
                                                // disabled={userMenu.app_rba === '2' || userid === 'administrator' || userid === 'ADMINISTRATOR' ? false : true}
                                                onClick={btnMergePdf}
                                                content="Merge PDF"
                                                iconCss="e-icons e-medium e-chevron-right"
                                                iconPosition="Left"
                                            ></ButtonComponent>
                                        </TooltipComponent>
                                    </TooltipComponent>
                                </TooltipComponent>
                            </TooltipComponent>
                        </TooltipComponent>
                    </div>
                    <div className="ml-3 mr-1" style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="mt-1" style={{ fontSize: '20px', fontFamily: 'Times New Roman' }}>
                            Konsolidasi Realisasi Berita Acara (RBA)
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
                        <div className="panel-filter" style={{ background: '#dedede', width: '100%', height: '100%' }}>
                            <div style={{ marginBottom: '7px' }}></div>
                            <div className="panel" style={{ background: '#dedede', padding: '1px' }}>
                                <Tab.Group defaultIndex={0}>
                                    <div className="panel-data" style={{ width: '109%', marginLeft: '-13px', marginTop: '-16px' }}>
                                        <div className="h-full overflow-auto p-4 ">
                                            <Tab.List style={{ marginTop: '-14px' }} className="mt-1 flex w-full flex-wrap border-b border-white-light dark:border-[#191e3a]">
                                                <Tab key={0} onClick={() => handleLabelFilter('Data Berita Acara')}>
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
                                            <button
                                                style={{ color: 'white' }}
                                                className="absolute right-0 top-0 mb-[16px] p-2 text-gray-600 hover:text-gray-900"
                                                //onClick={toggleFilterData}
                                                onClick={closeClick}
                                            >
                                                <FontAwesomeIcon icon={faTimes} width="20" height="20" />
                                            </button>
                                        </div>
                                        <div style={{ marginTop: '-22px', marginLeft: '0px' }} className="h-full overflow-auto p-4 ">
                                            {/* <div className="e-content ml-[-14px] mr-[-14px] mt-[12px]"> */}
                                            <Tab.Panels style={{ marginBottom: 10 }}>
                                                <div className="e-content ml-[-14px] mr-[-14px] mt-[12px]">
                                                    <Tab.Panel key={0}>
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

                                                        <div className={`grid grid-cols-1 justify-between gap-1 sm:flex `} style={{ marginBottom: '7px' }}>
                                                            <div className="form-input mt-1 flex justify-between" style={{ height: '30px', padding: '0px 1px 8px 10px' }}>
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
                                                            <div className="form-input mt-1 flex justify-between" style={{ height: '30px', padding: '0px 1px 8px 10px' }}>
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

                                                        <div className="flex">
                                                            <CheckBoxComponent
                                                                label="No. BA"
                                                                checked={stateChecked.isNoBaChecked}
                                                                change={(args: ChangeEventArgsButton) => {
                                                                    const value: any = args.checked;
                                                                    setStateChecked((prevState: any) => ({
                                                                        ...prevState,
                                                                        isNoBaChecked: value,
                                                                    }));
                                                                }}
                                                                style={{ borderRadius: 3, borderColor: 'gray' }}
                                                            />
                                                        </div>

                                                        <div className="mt-1 flex justify-between">
                                                            <input
                                                                className={` container form-input`}
                                                                style={{ fontSize: 11, marginTop: 4, marginLeft: 0, borderColor: '#bfc9d4', width: '100%', borderRadius: 5 }}
                                                                // disabled={true}
                                                                value={stateFiilterData?.noBaValue}
                                                                onChange={(event) => {
                                                                    const value: any = event.target.value;
                                                                    setStateChecked((prevState: any) => ({
                                                                        ...prevState,
                                                                        isNoBaChecked: value,
                                                                    }));
                                                                    setStateFilterData((prevState: any) => ({
                                                                        ...prevState,
                                                                        noBaValue: value,
                                                                    }));
                                                                }}
                                                            ></input>
                                                        </div>

                                                        <div className="mt-2 flex justify-between">
                                                            <CheckBoxComponent
                                                                label="Nama Ekspedisi"
                                                                checked={stateChecked.isNamaEkspedisiChecked}
                                                                change={(args: ChangeEventArgsButton) => {
                                                                    const value: any = args.checked;
                                                                    setStateChecked((prevState: any) => ({
                                                                        ...prevState,
                                                                        isNamaEkspedisiChecked: value,
                                                                    }));
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="mt-1 flex justify-between">
                                                            <input
                                                                className={` container form-input`}
                                                                style={{ fontSize: 11, marginTop: 4, marginLeft: 0, borderColor: '#bfc9d4', width: '100%', borderRadius: 5 }}
                                                                // disabled={true}
                                                                value={stateFiilterData?.namaEkspedisiValue}
                                                                onChange={(event) => {
                                                                    const value: any = event.target.value;
                                                                    setStateChecked((prevState: any) => ({
                                                                        ...prevState,
                                                                        isNamaEkspedisiChecked: value,
                                                                    }));
                                                                    setStateFilterData((prevState: any) => ({
                                                                        ...prevState,
                                                                        namaEkspedisiValue: value,
                                                                    }));
                                                                }}
                                                            ></input>
                                                        </div>

                                                        <div className="mt-2 flex justify-between">
                                                            <CheckBoxComponent
                                                                label="Nama Supplier"
                                                                checked={stateChecked.isNamaSupplierChecked}
                                                                change={(args: ChangeEventArgsButton) => {
                                                                    const value: any = args.checked;
                                                                    setStateChecked((prevState: any) => ({
                                                                        ...prevState,
                                                                        isNamaSupplierChecked: value,
                                                                    }));
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="mt-1 flex justify-between">
                                                            <input
                                                                className={` container form-input`}
                                                                style={{ fontSize: 11, marginTop: 4, marginLeft: 0, borderColor: '#bfc9d4', width: '100%', borderRadius: 5 }}
                                                                // disabled={true}
                                                                value={stateFiilterData?.namaSupplierValue}
                                                                onChange={(event) => {
                                                                    const value: any = event.target.value;
                                                                    setStateChecked((prevState: any) => ({
                                                                        ...prevState,
                                                                        isNamaSupplierChecked: value,
                                                                    }));
                                                                    setStateFilterData((prevState: any) => ({
                                                                        ...prevState,
                                                                        namaSupplierValue: value,
                                                                    }));
                                                                }}
                                                            ></input>
                                                        </div>

                                                        <div className="mt-2 flex justify-between">
                                                            <CheckBoxComponent
                                                                label="No. Referensi"
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
                                                            <input
                                                                className={` container form-input`}
                                                                style={{ fontSize: 11, marginTop: 4, marginLeft: 0, borderColor: '#bfc9d4', width: '100%', borderRadius: 5 }}
                                                                // disabled={true}
                                                                value={stateFiilterData?.noReffValue}
                                                                onChange={(event) => {
                                                                    const value: any = event.target.value;
                                                                    setStateChecked((prevState: any) => ({
                                                                        ...prevState,
                                                                        isNoReffChecked: value,
                                                                    }));
                                                                    setStateFilterData((prevState: any) => ({
                                                                        ...prevState,
                                                                        noReffValue: value,
                                                                    }));
                                                                }}
                                                            ></input>
                                                        </div>

                                                        <div className="mt-2 flex justify-between">
                                                            <CheckBoxComponent
                                                                label="No. FBM"
                                                                checked={stateChecked.isNofbmChecked}
                                                                change={(args: ChangeEventArgsButton) => {
                                                                    const value: any = args.checked;
                                                                    setStateChecked((prevState: any) => ({
                                                                        ...prevState,
                                                                        isNofbmChecked: value,
                                                                    }));
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="mt-1 flex justify-between">
                                                            <input
                                                                className={` container form-input`}
                                                                style={{ fontSize: 11, marginTop: 4, marginLeft: 0, borderColor: '#bfc9d4', width: '100%', borderRadius: 5 }}
                                                                // disabled={true}
                                                                value={stateFiilterData?.noFbmValue}
                                                                onChange={(event) => {
                                                                    const value: any = event.target.value;
                                                                    setStateChecked((prevState: any) => ({
                                                                        ...prevState,
                                                                        isNofbmChecked: value,
                                                                    }));
                                                                    setStateFilterData((prevState: any) => ({
                                                                        ...prevState,
                                                                        noFbmValue: value,
                                                                    }));
                                                                }}
                                                            ></input>
                                                        </div>

                                                        <div className="mt-2 flex justify-between">
                                                            <CheckBoxComponent
                                                                label="No. FJ"
                                                                checked={stateChecked.isNofjChecked}
                                                                change={(args: ChangeEventArgsButton) => {
                                                                    const value: any = args.checked;
                                                                    setStateChecked((prevState: any) => ({
                                                                        ...prevState,
                                                                        isNofjChecked: value,
                                                                    }));
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="mt-1 flex justify-between">
                                                            <input
                                                                className={` container form-input`}
                                                                style={{ fontSize: 11, marginTop: 4, marginLeft: 0, borderColor: '#bfc9d4', width: '100%', borderRadius: 5 }}
                                                                // disabled={true}
                                                                value={stateFiilterData?.noFjValue}
                                                                onChange={(event) => {
                                                                    const value: any = event.target.value;
                                                                    setStateChecked((prevState: any) => ({
                                                                        ...prevState,
                                                                        isNofjChecked: value,
                                                                    }));
                                                                    setStateFilterData((prevState: any) => ({
                                                                        ...prevState,
                                                                        noFjValue: value,
                                                                    }));
                                                                }}
                                                            ></input>
                                                        </div>

                                                        <div className="mt-2 flex justify-between">
                                                            <div className="font-bold">
                                                                <span style={{ fontWeight: 'bold', fontSize: 11 }}>Status</span>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-x-4">
                                                            <div className="flex items-center">
                                                                <input
                                                                    type="radio"
                                                                    name="status"
                                                                    id="prosesApp"
                                                                    className="form-radio h-4 w-4"
                                                                    checked={stateFiilterData.selectedOptionStatus === 'prosesApp'}
                                                                    onChange={(event) =>
                                                                        setStateFilterData((prevState: any) => ({
                                                                            ...prevState,
                                                                            selectedOptionStatus: event.target.id,
                                                                        }))
                                                                    }
                                                                />
                                                                <label htmlFor="prosesApp" className="ml-1" style={{ fontSize: '11px', marginBottom: '-2px' }}>
                                                                    Proses Approved
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <input
                                                                    type="radio"
                                                                    name="status"
                                                                    id="fullApp"
                                                                    className="form-radio h-4 w-4"
                                                                    checked={stateFiilterData.selectedOptionStatus === 'fullApp'}
                                                                    onChange={(event) =>
                                                                        setStateFilterData((prevState: any) => ({
                                                                            ...prevState,
                                                                            selectedOptionStatus: event.target.id,
                                                                        }))
                                                                    }
                                                                />
                                                                <label htmlFor="fullApp" className="ml-1" style={{ fontSize: '11px', marginBottom: '-2px' }}>
                                                                    Full Approved
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <input
                                                                    type="radio"
                                                                    name="status"
                                                                    id="app1"
                                                                    className="form-radio h-4 w-4"
                                                                    checked={stateFiilterData.selectedOptionStatus === 'app1'}
                                                                    onChange={(event) =>
                                                                        setStateFilterData((prevState: any) => ({
                                                                            ...prevState,
                                                                            selectedOptionStatus: event.target.id,
                                                                        }))
                                                                    }
                                                                />
                                                                <label htmlFor="app1" className="ml-1" style={{ fontSize: '11px', marginBottom: '-2px' }}>
                                                                    App Level 1
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <input
                                                                    type="radio"
                                                                    name="status"
                                                                    id="semua"
                                                                    className="form-radio h-4 w-4"
                                                                    checked={stateFiilterData.selectedOptionStatus === 'semua'}
                                                                    onChange={(event) =>
                                                                        setStateFilterData((prevState: any) => ({
                                                                            ...prevState,
                                                                            selectedOptionStatus: event.target.id,
                                                                        }))
                                                                    }
                                                                />
                                                                <label htmlFor="semua" className="ml-1" style={{ fontSize: '11px', marginBottom: '-2px' }}>
                                                                    Semua
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <input
                                                                    type="radio"
                                                                    name="status"
                                                                    id="app2"
                                                                    className="form-radio h-4 w-4"
                                                                    checked={stateFiilterData.selectedOptionStatus === 'app2'}
                                                                    onChange={(event) =>
                                                                        setStateFilterData((prevState: any) => ({
                                                                            ...prevState,
                                                                            selectedOptionStatus: event.target.id,
                                                                        }))
                                                                    }
                                                                />
                                                                <label htmlFor="app2" className="ml-1" style={{ fontSize: '11px', marginBottom: '-2px' }}>
                                                                    App Level 2
                                                                </label>
                                                            </div>
                                                        </div>

                                                        <div className="mt-2 flex justify-between">
                                                            <div className="font-bold">
                                                                <span style={{ fontWeight: 'bold', fontSize: 11 }}>Lunas</span>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-x-4">
                                                            <div className="flex items-center">
                                                                <input
                                                                    type="radio"
                                                                    name="lunas"
                                                                    id="lunas"
                                                                    className="form-radio h-4 w-4"
                                                                    checked={stateFiilterData.selectedOptionLunas === 'lunas'}
                                                                    onChange={(event) =>
                                                                        setStateFilterData((prevState: any) => ({
                                                                            ...prevState,
                                                                            selectedOptionLunas: event.target.id,
                                                                        }))
                                                                    }
                                                                />
                                                                <label htmlFor="lunas" className="ml-1" style={{ fontSize: '11px', marginBottom: '-2px' }}>
                                                                    Lunas
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <input
                                                                    type="radio"
                                                                    name="lunas"
                                                                    id="lunasSebagian"
                                                                    className="form-radio h-4 w-4"
                                                                    checked={stateFiilterData.selectedOptionLunas === 'lunasSebagian'}
                                                                    onChange={(event) =>
                                                                        setStateFilterData((prevState: any) => ({
                                                                            ...prevState,
                                                                            selectedOptionLunas: event.target.id,
                                                                        }))
                                                                    }
                                                                />
                                                                <label htmlFor="lunasSebagian" className="ml-1" style={{ fontSize: '11px', marginBottom: '-2px' }}>
                                                                    Lunas Sebagian
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <input
                                                                    type="radio"
                                                                    name="lunas"
                                                                    id="belumLunas"
                                                                    className="form-radio h-4 w-4"
                                                                    checked={stateFiilterData.selectedOptionLunas === 'belumLunas'}
                                                                    onChange={(event) =>
                                                                        setStateFilterData((prevState: any) => ({
                                                                            ...prevState,
                                                                            selectedOptionLunas: event.target.id,
                                                                        }))
                                                                    }
                                                                />
                                                                <label htmlFor="belumLunas" className="ml-1" style={{ fontSize: '11px', marginBottom: '-2px' }}>
                                                                    Belum Lunas
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <input
                                                                    type="radio"
                                                                    name="lunas"
                                                                    id="semua"
                                                                    className="form-radio h-4 w-4"
                                                                    checked={stateFiilterData.selectedOptionLunas === 'semua'}
                                                                    onChange={(event) =>
                                                                        setStateFilterData((prevState: any) => ({
                                                                            ...prevState,
                                                                            selectedOptionLunas: event.target.id,
                                                                        }))
                                                                    }
                                                                />
                                                                <label htmlFor="semua" className="ml-1" style={{ fontSize: '11px', marginBottom: '-2px' }}>
                                                                    Semua
                                                                </label>
                                                            </div>
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
                                                                        // pilis(mergerObject);
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
                            <div className="e-content">
                                <div style={{ width: '100%', height: '100%', marginTop: '5px' }}>
                                    <GridComponent
                                        // key={gridKey}
                                        // key={`key-${refreshGrid}`}
                                        id="gridListData"
                                        locale="id"
                                        // ref={(g) => (gridListData = g)}
                                        ref={gridListDataKonsolidasiRbaRef}
                                        // dataSource={stateDataHeaderList.searchNoPhe !== '' || stateDataHeaderList.searchBayar !== '' ? filteredDataRpe : recordsDataKonsolidasiRbaRef.current}
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
                                        height={547}
                                        gridLines={'Both'}
                                        // loadingIndicator={{ indicatorType: 'Shimmer' }}
                                        queryCellInfo={queryCell}
                                        rowDataBound={rowDataBound}
                                        rowSelected={(args) => {
                                            const mergerObject = {
                                                ...handleParamsObject,
                                            };
                                            // handleRowSelectedOD(args, 'od', mergerObject);
                                            handleRowSelectedKonsolidasiRba(args, mergerObject);
                                        }}
                                        recordDoubleClick={(args) => {
                                            const mergerObject = {
                                                ...handleParamsObject,
                                            };
                                            handleDoubleClickKonsolidasiRba(args, mergerObject);
                                        }}
                                        recordClick={rowClick}
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
                                                field="no_rpeba"
                                                headerText="No. BA"
                                                headerTextAlign="Center"
                                                textAlign="Center"
                                                //autoFit
                                                width="125"
                                            />
                                            <ColumnDirective
                                                field="tgl_rpeba"
                                                headerText="Tanggal"
                                                headerTextAlign="Center"
                                                textAlign="Center"
                                                //autoFit
                                                width="100"
                                                type="date"
                                                format={formatDate}
                                            />
                                            <ColumnDirective
                                                field="nama_relasi"
                                                headerText="Supplier/Pabrik"
                                                headerTextAlign="Center"
                                                textAlign="Left"
                                                //autoFit
                                                width="320"
                                            />
                                            <ColumnDirective
                                                field="tgl_sj"
                                                headerText="Surat Jalan Pabrik"
                                                headerTextAlign="Center"
                                                textAlign="Center"
                                                //autoFit
                                                width="100"
                                                type="date"
                                                format={formatDate}
                                                headerTemplate={headerTemplateSuratJalanPabrik}
                                            />
                                            <ColumnDirective
                                                field="nopol"
                                                headerText="No. Kendaraan"
                                                headerTextAlign="Center"
                                                textAlign="Center"
                                                //autoFit
                                                width="100"
                                            />
                                            <ColumnDirective
                                                field="tgl_fj"
                                                headerText="Tgl. Faktur"
                                                headerTextAlign="Center"
                                                textAlign="Center"
                                                //autoFit
                                                width="100"
                                                type="date"
                                                format={formatDate}
                                            />
                                            <ColumnDirective
                                                field="no_fj"
                                                headerText="No. Faktur"
                                                headerTextAlign="Center"
                                                textAlign="Left"
                                                //autoFit
                                                width="125"
                                            />
                                            <ColumnDirective
                                                columns={[
                                                    {
                                                        field: 'jumlah_pabrik',
                                                        headerText: 'Acc. Pabrik',
                                                        format: 'N2',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Right',
                                                        //autoFit
                                                        width: '110',
                                                        valueAccessor: checkValueAccessorAccPabrik,
                                                    },
                                                    {
                                                        field: 'jumlah_cabang',
                                                        headerText: 'Beban Cabang',
                                                        format: 'N2',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Right',
                                                        //autoFit
                                                        width: '110',
                                                        valueAccessor: checkValueAccessorBebanCabang,
                                                    },
                                                ]}
                                                headerText="Jumlah"
                                                textAlign="Center"
                                            />
                                            <ColumnDirective
                                                columns={[
                                                    {
                                                        field: 'status_app',
                                                        headerText: 'Level 1',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        //autoFit
                                                        width: '50',
                                                        valueAccessor: checkValueAccessorLevel1,
                                                    },
                                                    {
                                                        field: 'app',
                                                        headerText: 'Level 2',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        //autoFit
                                                        width: '50',
                                                        valueAccessor: checkValueAccessorLevel2,
                                                    },
                                                ]}
                                                headerText="Approval"
                                                textAlign="Center"
                                            />
                                            {/* <ColumnDirective
                                                    field="sub_total"
                                                    headerText="Total Klaim"
                                                    format="N2"
                                                    headerTextAlign="Center"
                                                    textAlign="Right"
                                                    //autoFit
                                                    width="110"
                                                /> */}

                                            <ColumnDirective
                                                field="gagal1"
                                                // headerTemplate={headerProduksi}
                                                headerText="Pilih"
                                                headerTextAlign="Center"
                                                textAlign="Center"
                                                // template={templatePilih}
                                                valueAccessor={templatePilihDok}
                                                width="50"
                                                clipMode="EllipsisWithTooltip"
                                            />
                                            <ColumnDirective
                                                field="kirim_pabrik"
                                                headerTemplate={headerTemplateProsesDokumen}
                                                headerText="Proses Dokumen"
                                                headerTextAlign="Center"
                                                textAlign="Center"
                                                // template={checkboxTemplateProsesDokumen}
                                                valueAccessor={templateProsesDokumen}
                                                width="50"
                                                clipMode="EllipsisWithTooltip"
                                            />
                                            <ColumnDirective
                                                field="tgl_pabrik"
                                                headerText="Tgl. Proses RBA"
                                                headerTextAlign="Center"
                                                textAlign="Center"
                                                //autoFit
                                                width="80"
                                                type="date"
                                                format={formatDate}
                                                // template={editTemplateTglProsesRBA}
                                                headerTemplate={headerTemplateTglProsesRba}
                                            />
                                            <ColumnDirective
                                                field="catatan_konsol"
                                                headerText="Catatan Konsolidasi"
                                                headerTextAlign="Center"
                                                textAlign="Left"
                                                //autoFit
                                                width="300"
                                                // clipMode="EllipsisWithTooltip"
                                                // template={editTemplateCatatanKonsolidasi}
                                            />
                                        </ColumnsDirective>
                                        <AggregatesDirective>
                                            <AggregateDirective>
                                                <AggregateColumnsDirective>
                                                    <AggregateColumnDirective field="jumlah_pabrik" type="Custom" customAggregate={totJumlahPabrik} footerTemplate={CustomSumJumlahpabrik} />
                                                    <AggregateColumnDirective field="jumlah_cabang" type="Custom" customAggregate={totJumlahCabang} footerTemplate={CustomSumJumlahcabang} />
                                                </AggregateColumnsDirective>
                                            </AggregateDirective>
                                        </AggregatesDirective>
                                        <Inject services={[Aggregate, Page, Selection, Edit, /*Toolbar,*/ Sort, Group, Filter, Resize, Reorder /*, Freeze,*/, ExcelExport, PdfExport]} />
                                    </GridComponent>
                                </div>
                            </div>

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
                        <div className="flex" style={{ marginTop: '52px', marginLeft: '12px' }}>
                            <div style={{ width: '137px' }}>
                                <CheckBoxComponent
                                    label="No. Pilih Semua Data"
                                    checked={stateChecked.isNoPilihSemua}
                                    change={(args: ChangeEventArgsButton) => {
                                        const value: any = args.checked;
                                        pilihSemuaData(value);
                                    }}
                                    style={{ borderRadius: 3, borderColor: 'gray' }}
                                />
                            </div>
                            <div style={{ width: '33px' }}>
                                <button className="flex" style={{ height: 27, marginTop: '-3px', width: '26px', borderRadius: '5px', background: 'white', borderColor: 'white' }}>
                                    <FontAwesomeIcon icon={faRefresh} className="ml-2" width="15" height="15" style={{ margin: '7px 2px 0px 6px' }} />
                                </button>
                            </div>
                            <div style={{ width: '100px' }}>
                                <button className="flex" style={{ height: 27, marginTop: '-3px', width: '26px', borderRadius: '5px', background: 'white', borderColor: 'white' }}>
                                    <FontAwesomeIcon icon={faFilter} className="ml-2" width="15" height="15" style={{ margin: '7px 2px 0px 6px' }} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/*==================================================================================================*/}
            {/*=================================== Modal dialog untuk form RBA =============================*/}
            {/*==================================================================================================*/}

            <DialogRba
                userid={userid}
                kode_entitas={kode_entitas}
                entitas={entitas}
                masterKodeDokumen={masterKodeDokumen}
                masterDataState={masterDataState}
                dataEntitas={stateDataHeaderList.dataEntitas}
                isOpen={dialogInputDataVisibleRba}
                onClose={() => {
                    setDialogInputDataVisibleRba(false);
                }}
                onRefresh={handleRefreshDataLoad}
                kode_user={kode_user}
                refreshKey={refreshKey}
                onOpen={() => {
                    setDialogInputDataVisibleRba(true);
                }}
                token={token}
                valueAppBackdate={valueAppBackdate}
                stateDataHeaderList={stateDataHeaderList}
            />

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

            <Modal isOpen={isModalOpen} progress={progress} isError={isError} message={message} />

            {/* Modal Preview TTDFile Pendukung Images */}
            {stateDataHeaderList.plagInputCatatanKonsol === true ? (
                <>
                    <Draggable disabled={true}>
                        <div className={`${styles.modalDetailDragable}`} style={modalPositionKet}>
                            <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                                <div style={{ marginBottom: 21 }}>
                                    <span style={{ fontSize: 18, fontWeight: 500 }}>Catatan Konsol</span>
                                </div>
                                <hr style={{ borderTop: '1px solid #000', margin: '10px 0' }} />
                                <div className="panel-input" style={{ width: '100%', height: '200px' }}>
                                    <TextBoxComponent
                                        id="vCatatanKonsol"
                                        ref={(t) => {
                                            textareaObj = t;
                                        }}
                                        multiline={true}
                                        // created={onCreateMultiline}
                                        value={stateDataHeaderList.inputCatatanKonsol || undefined}
                                        input={(args: FocusInEventArgs) => {
                                            const value: any = args.value;
                                            setStateDataHeaderList((prevState) => ({
                                                ...prevState,
                                                inputCatatanKonsol: value,
                                            }));
                                        }}
                                        cssClass={styles['custom-textbox']}
                                    />
                                </div>
                            </div>
                            <button className={`${styles.closeButtonDetailDragable}`} onClick={closeModalCatatanKonsole}>
                                <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                            </button>
                            <div className="flex justify-end">
                                <div style={{ width: '100px' }}>
                                    <>
                                        <button
                                            style={{
                                                backgroundColor: '#e6e6e6',
                                                color: 'black',
                                                borderColor: '#4c4949',
                                                fontWeight: 'bold',
                                                boxShadow: 'none',
                                                width: '90%',
                                                marginTop: '10px',
                                            }}
                                            type="button"
                                            onClick={() => {
                                                simpanDataList('catatanKonsol', '', '');
                                            }}
                                            className="btn btn-primary mb-2 md:mb-0 md:mr-2"
                                        >
                                            <FontAwesomeIcon icon={faSave} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                            Simpan
                                        </button>
                                    </>
                                </div>
                                <div style={{ width: '100px' }}>
                                    <>
                                        <button
                                            style={{
                                                backgroundColor: '#e6e6e6',
                                                color: 'black',
                                                borderColor: '#4c4949',
                                                fontWeight: 'bold',
                                                boxShadow: 'none',
                                                width: '90%',
                                                marginTop: '10px',
                                            }}
                                            type="button"
                                            onClick={closeModalCatatanKonsole}
                                            className="btn btn-primary mb-2 md:mb-0 md:mr-2"
                                        >
                                            <FontAwesomeIcon icon={faTimes} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                            Batal
                                        </button>
                                    </>
                                </div>
                            </div>
                        </div>
                    </Draggable>
                </>
            ) : null}
            {/* ============================================================ */}
            {/* <GlobalProgressBar /> */}
        </div>
    );
};

// export { getServerSideProps };

export default KonsolidasiRba;
