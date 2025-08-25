import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { MenuEventArgs } from '@syncfusion/ej2-react-splitbuttons';
import { SidebarComponent, SidebarType, ContextMenuComponent, MenuItemModel, TabComponent } from '@syncfusion/ej2-react-navigations';
import { Tooltip, TooltipComponent, TooltipEventArgs } from '@syncfusion/ej2-react-popups';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { ChangeEventArgs as ChangeEventArgsInput, FocusInEventArgs } from '@syncfusion/ej2-react-inputs';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown } from '@syncfusion/ej2-react-dropdowns';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import {
    Grid,
    GridComponent,
    ColumnDirective,
    ColumnsDirective,
    AggregatesDirective,
    AggregateDirective,
    AggregateColumnsDirective,
    AggregateColumnDirective,
    Aggregate,
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
import { useEffect, useState, useCallback, useRef } from 'react';
import moment from 'moment';
import swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
// import { getServerSideProps } from '@/pages/api/getServerSide';
import styles from './rpelist.module.css';
import stylesIndex from '@styles/index.module.css';

import { GetListTtb, GetListTtbEffect, GetMasterAlasan, GetPeriode } from './model/api';
import { FillFromSQL, frmNumber } from '@/utils/routines';
import { showLoading, usersMenu } from '@/utils/routines';
import Draggable from 'react-draggable';
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
import idIDLocalization from 'public/syncfusion/locale.json';
L10n.load(idIDLocalization);
import { useSession } from '@/pages/api/sessionContext';
import { GetListRpeEffect } from './model/apiRpe';
import { HandleNamaEkspedisiInputChange, HandleNoFakturEksInputChange, HandleNoRpeInputChange, HandleStatusApproval, HandleTgl, PencarianNoRpe } from './functional/fungsiFormRpe';
import {
    CustomBayarMu,
    QueryCellInfoListData,
    RowDataBoundListData,
    SumBayarMu,
    swalToast,
    TemplateBayarMu,
    TemplateNettoMu,
    TemplateTotalBerat,
    TemplateTotalKlaimEkspedisi,
} from './interface/template';
import DialogFormRpe from './component/dialogFormRpe';

enableRipple(true);

const RPEList = () => {
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

    //======= Setting hak akses user ... ========
    let disabledBaru = false;
    let disabledEdit = false;
    let disabledHapus = false;
    let disabledCetak = false;

    let sidebarObj: SidebarComponent;
    let type: SidebarType = 'Push';
    let mediaQueryState: string = '(min-width: 600px)';

    // ini kodingan terbaru TTB dengan tampilan syncfusion

    // State Baru Untuk TTB
    interface UserMenuState {
        baru: any;
        edit: any;
        hapus: any;
        cetak: any;
    }
    const [userMenu, setUserMenu] = useState<UserMenuState>({ baru: '', edit: '', hapus: '', cetak: '' });
    const kode_menu = '31500'; // kode menu RPE

    const [date1, setDate1] = useState<moment.Moment>(moment());
    const [date2, setDate2] = useState<moment.Moment>(moment().endOf('month'));

    //==========================================================================================
    // FUNGSI RPE

    const tanggalSekarang = moment();
    // Menentukan tanggal awal bulan
    const tanggalAwalBulan = tanggalSekarang.startOf('month');
    // Menentukan tanggal akhir bulan dengan moment.js
    const tanggalHariIni = moment(new Date()).format('YYYY-MM-DD');
    const tanggalAkhirBulan = moment(tanggalAwalBulan.endOf('month')).format('YYYY-MM-DD');

    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [windowHeight, setWindowHeight] = useState(0);
    const gridWidth = sidebarVisible ? 'calc(100% - 315px)' : '100%';
    //=========== Setting format tanggal sesuai locale ID ===========
    const formatDate: Object = { type: 'date', format: 'dd-MM-yyyy' };

    const [stateFilteredData, setStateFilteredData] = useState({
        isNoRpeChecked: false,
        noRpeValue: '',
        isTanggalChecked: true,
        date1: moment(),
        date2: moment().endOf('month'),
        isNamaEkspedisiChecked: false,
        namaEkspedisiValue: '',
        isNoFakturEksChecked: false,
        noFakturEksValue: '',
        selectedOptionStatusApproval: 'Semua',
        searchNoRpe: '',
        searchBayarMu: '',
        dialogInputDataVisible: false,
        masterDataState: 'BARU',
        masterKodeDokumen: 'BARU',
    });

    type RpeListItem = {
        kode_rpe: any;
        no_rpe: any;
        tgl_rpe: any;
        via: any;
        kode_termin: any;
        kode_mu: any;
        kurs: any;
        total_berat: any;
        total_mu: any;
        netto_mu: any;
        keterangan: any;
        status: any;
        userid: any;
        tgl_update: any;
        approval: any;
        tgl_approval: any;
        no_reff: any;
        bayar_mu: any;
        total_klaim: any;
        total_berat_ekspedisi: any;
        total_berat_pabrik: any;
        total_klaim_ekspedisi: any;
        total_klaim_pabrik: any;
        total_tambahan: any;
        total_pph: any;
        sub_total: any;
        pph23: any;
        biaya_lain: any;
        ket_biaya: any;
        potongan_lain: any;
        memo_mu: any;
        lunas_mu: any;
        kode_dokumen: any;
        kode_dokumen_rev: any;
        tgl_trxrpe: any;
        status_app: any;
        no_dokumen: any;
        no_dokumen_rev: any;
    };

    const [recordsData, setRecordsData] = useState<RpeListItem[]>([]);
    const recordsDataRef = useRef<RpeListItem[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);

    const gridKey = `${JSON.stringify(recordsDataRef.current)}`;
    const vRefreshData = useRef(0);

    //==================================================================================================
    // Fungsi untuk menampilkan Cetak Form Kecil PHU
    const OnClick_CetakRpe = (kode_rpe: any, kode_entitas: string, token: string) => {
        console.log('kode rpe :', token);
        if (kode_rpe === '') {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: '<p style="font-size:12px;color:white;">Silahkan pilih data RPE terlebih dahulu</p>',
                width: '100%',
                customClass: {
                    popup: styles['colored-popup'], // Custom class untuk sweetalert
                },
            });
            return;
        }

        let height = window.screen.availHeight - 150;
        let width = window.screen.availWidth - 200;
        let leftPosition = window.screen.width / 2 - (width / 2 + 10);
        let topPosition = window.screen.height / 2 - (height / 2 + 50);
        let iframe = `
            <html><head>
            <title>Realisasi Pembayaran Ekspedisi | Next KCN Sytem</title>
            <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
            </head><body>
            <iframe src="./report/rpRpe?entitas=${kode_entitas}&kode_rpe=${kode_rpe}&token=${token}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
    };
    // END

    // ============ untuk menampilkan dropdown cetak dan fungsi pemanggilan nya =================
    let cMenuCetak: ContextMenuComponent;
    function btnPrintClick(e: any): void {
        var clientRect = (e.target as Element).getBoundingClientRect();
        cMenuCetak.open(clientRect.bottom, clientRect.left);
    }

    let menuCetakItems: MenuItemModel[] = [
        {
            iconCss: 'e-icons e-thumbnail',
            text: 'Realisasi Pembayaran Ekspedisi',
            id: 'rpe',
        },
    ];

    function menuCetakSelect(args: MenuEventArgs) {
        if (args.item.id === 'rpe') {
            OnClick_CetakRpe(selectedRowKodeRpe, kode_entitas, token);
            // SetDataDokumenTtb('cetak', selectedRowKodeTtb, kode_entitas, dataDetailDokTtb, router, setSelectedItem, setDetailDok);
        }
    }
    // ===========================================================================================

    // ini saat rows di eksekusi dengan klik
    const HandleRowSelected = (args: any, setSelectedRowKodeRpe: Function, setStatusApproval: Function) => {
        if (args.data !== undefined) {
            setSelectedRowKodeRpe(args.data.kode_rpe);
            setStatusApproval(args.data.status_app);
        }
    };

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
    };

    useEffect(() => {
        const refreshData = async () => {
            let vNoRpe = 'all';
            let vTglAwal = tanggalHariIni; //tanggalHariIni
            let vTglAkhir = tanggalAkhirBulan; //tanggalAkhirBulan

            let vPengiriman = 'all';
            let vNoFaktur = 'all';
            let vStatusApp = 'all';

            let paramObject = {
                kode_entitas: kode_entitas,
                vNoRpe: vNoRpe,
                vTglAwal: vTglAwal,
                vTglAkhir: vTglAkhir,
                vPengiriman: vPengiriman,
                vNoFaktur: vNoFaktur,
                vStatusApp: vStatusApp,
                vToken: token,
            };

            const responseData = await GetListRpeEffect(paramObject);
            setRecordsData(responseData);
            recordsDataRef.current = responseData;
            console.log('Response Data = ', responseData);
        };
        refreshData();
        fetchDataUseEffect();
    }, []);

    // ================== Fungsi Reload untuk Responsive sidebar filter ==========================
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

    const toggleClick = () => {
        setSidebarVisible(true);
    };
    const closeClick = () => {
        setSidebarVisible(false);
    };

    //==========  Popup menu untuk header grid List Data ===========
    let menuHeaderItems: MenuItemModel[] = [
        {
            iconCss: 'e-icons e-print',
            text: 'Cetak ke printer',
        },
        {
            iconCss: 'e-icons',
            text: 'Export ke file',
            items: [
                { iconCss: 'e-icons e-export-pdf', text: 'PDF' },
                { iconCss: 'e-icons e-export-excel', text: 'XLSX' },
                { iconCss: 'e-icons e-export-csv', text: 'CSV' },
            ],
        },
    ];

    function menuHeaderSelect(args: MenuEventArgs) {
        if (args.item.text === 'Cetak ke printer') {
            gridListDataRef.current?.print();
        } else if (args.item.text === 'PDF') {
            gridListDataRef.current?.showSpinner();
            gridListDataRef.current?.pdfExport();
        } else if (args.item.text === 'XLSX') {
            gridListDataRef.current?.showSpinner();
            gridListDataRef.current?.excelExport();
        } else if (args.item.text === 'CSV') {
            gridListDataRef.current?.showSpinner();
            gridListDataRef.current?.csvExport();
        }
    }
    const ExportComplete = (): void => {
        gridListDataRef.current?.hideSpinner();
    };
    // END

    //================ Disable hari minggu di calendar ==============
    function onRenderDayCell(args: RenderDayCellEventArgs): void {
        if ((args.date as Date).getDay() === 0) {
            args.isDisabled = true;
        }
    }

    async function showLoading1(closeWhenDataIsFulfilled: boolean) {
        if (closeWhenDataIsFulfilled) {
            swal.fire({
                padding: '3em',
                imageUrl: '/assets/images/loader-1.gif',
                imageWidth: 170,
                imageHeight: 170,
                imageAlt: 'Custom image',
                background: 'rgba(0,0,0,.0)',
                backdrop: 'rgba(0,0,0,0.0)',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
            });
        } else {
            swal.close(); // Menutup tampilan loading
        }
    }

    const handleRefreshData = async () => {
        vRefreshData.current += 1;

        await showLoading1(true);
        if (kode_entitas !== null || kode_entitas !== '') {
            try {
                let vNoRpe = 'all';
                let vTglAwal = 'all'; //tanggalHariIni
                let vTglAkhir = 'all'; //tanggalAkhirBulan

                let vPengiriman = 'all';
                let vNoFaktur = 'all';
                let vStatusApp = 'all';

                if (stateFilteredData.isNoRpeChecked) {
                    vNoRpe = `${stateFilteredData.noRpeValue}`;
                }

                if (stateFilteredData.isTanggalChecked) {
                    const formattedDate1 = stateFilteredData.date1.format('YYYY-MM-DD');
                    const formattedDate2 = stateFilteredData.date2.format('YYYY-MM-DD');
                    vTglAwal = `${formattedDate1}`;
                    vTglAkhir = `${formattedDate2}`;
                }

                if (stateFilteredData.isNamaEkspedisiChecked) {
                    vPengiriman = `${stateFilteredData.namaEkspedisiValue}%`;
                }

                if (stateFilteredData.isNoFakturEksChecked) {
                    vNoFaktur = `${stateFilteredData.noFakturEksValue}`;
                }

                if (stateFilteredData.selectedOptionStatusApproval === 'Semua') {
                    vStatusApp = 'all';
                } else if (stateFilteredData.selectedOptionStatusApproval === 'Ditolak') {
                    vStatusApp = 'N';
                } else if (stateFilteredData.selectedOptionStatusApproval === 'Baru') {
                    vStatusApp = 'X';
                } else if (stateFilteredData.selectedOptionStatusApproval === 'Koreksi') {
                    vStatusApp = 'C';
                } else if (stateFilteredData.selectedOptionStatusApproval === 'Disetujui') {
                    vStatusApp = 'Y';
                } else if (stateFilteredData.selectedOptionStatusApproval === 'Dibatalkan') {
                    vStatusApp = 'B';
                }

                let paramObject = {
                    kode_entitas: kode_entitas,
                    vNoRpe: vNoRpe,
                    vTglAwal: vTglAwal,
                    vTglAkhir: vTglAkhir,
                    vPengiriman: vPengiriman,
                    vNoFaktur: vNoFaktur,
                    vStatusApp: vStatusApp,
                    vToken: token,
                };
                const responseData = await GetListRpeEffect(paramObject);
                setRecordsData(responseData);
                recordsDataRef.current = responseData;
                console.log('response data = ', responseData);
                showLoading1(false);
            } catch (error) {
                console.error(error);
            }
        }
    };

    // END
    //==========================================================================================

    // let gridListData: Grid | any;
    const gridListDataRef = useRef<GridComponent>(null);
    let selectedListData: any[] = [];
    const [selectedRowKodeRpe, setSelectedRowKodeRpe] = useState('');
    const [statusApproval, setStatusApproval] = useState('');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [detailDok, setDetailDok] = useState<any[]>([]);
    const [modalPosition, setModalPosition] = useState({ top: '3%', right: '2%', width: '40%', background: '#dedede' });
    const [dataDetailDokRpe, setDataDetailDokRpe] = useState({ no_rpe: '', tgl_rpe: '' });

    const styleButton = { width: 57 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#3b3f5c' };
    const styleButtonApp = { color: 'green', fontWeight: 'bold', width: 57 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#e6e6e6' };
    const styleButtonDisabled = { width: 57 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#ece7f5' };

    const closeModal = () => {
        setSelectedItem(null);
    };

    // INI YANG TERBARU
    const [masterDataState, setMasterDataState] = useState<string>('BARU');
    const [masterKodeDokumen, setMasterKodeDokumen] = useState<string>('BARU');
    const [masterBarangProduksi, setMasterBarangProduksi] = useState<string>('Y');
    const [dialogInputDataVisible, setDialogInputDataVisible] = useState(false);

    const [refreshKey, setRefreshKey] = useState(0);
    // const vRefreshData = useRef(0);

    const showNewRecord = async () => {
        vRefreshData.current += 1;
        setStateFilteredData((prevState) => ({
            ...prevState,
            dialogInputDataVisible: true,
            masterDataState: 'BARU',
            masterKodeDokumen: 'BARU',
        }));
    };

    // const showEditRecord = async (args: any) => {
    const showEditRecord = async () => {
        vRefreshData.current += 1;

        if (statusApproval === 'Disetujui') {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: '<p style="font-size:12px; color:white;">Status approval disetujui, tidak dapat di koreksi.</p>',
                width: '100%',
                customClass: {
                    popup: styles['colored-popup'], // Custom class untuk sweetalert
                },
            });
            return;
        }

        if (selectedRowKodeRpe === '') {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: '<p style="font-size:12px; color:white;">Silahkan pilih data Rpe terlebih dahulu</p>',
                width: '100%',
                customClass: {
                    popup: styles['colored-popup'], // Custom class untuk sweetalert
                },
            });
            return;
        }

        const responseData: any[] = await GetPeriode(kode_entitas);
        const periode = responseData[0].periode;
        const tanggalMomentPeriode = moment(periode, 'YYYYMM');
        const periodeTahunBulan = tanggalMomentPeriode.format('YYYYMM');

        const tglPembanding = moment(dataDetailDokRpe.tgl_rpe).format('YYYYMM');

        // Mendapatkan tahun dan bulan dari setiap tanggal
        const yearA = parseInt(periodeTahunBulan.substring(0, 4));
        const monthA = parseInt(periodeTahunBulan.substring(4, 6));

        const yearB = parseInt(tglPembanding.substring(0, 4));
        const monthB = parseInt(tglPembanding.substring(4, 6));

        if (yearB < yearA || (yearB === yearA && monthB < monthA)) {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: '<p style="font-size:12px; color:white;">Tanggal Transaksi lebih kecil dari periode yang sekarang, tidak bisa dikoreksi.</p>',
                width: '100%',
                customClass: {
                    popup: styles['colored-popup'], // Custom class untuk sweetalert
                },
            });
        } else {
            setStateFilteredData((prevState) => ({
                ...prevState,
                dialogInputDataVisible: true,
                masterDataState: 'EDIT',
                masterKodeDokumen: selectedRowKodeRpe,
            }));
        }
    };

    const HandleRowDoubleClicked = (args: any) => {
        vRefreshData.current += 1;
        if (args.rowData.status_app === 'Disetujui') {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: '<p style="font-size:12px; color:white;">Status approval disetujui, tidak dapat di koreksi.</p>',
                width: '100%',
                customClass: {
                    popup: styles['colored-popup'], // Custom class untuk sweetalert
                },
            });
            return;
        } else {
            showEditRecord();
        }

        // setListStateData((prevState: any) => ({
        //     ...prevState,
        //     masterKodeDokumen: args.rowData.kode_dokumen,
        //     masterDataState: 'EDIT',
        //     selectedModalJenisPenerimaan: args.rowData.Jenis,
        //     dialogInputDataVisible: true,
        //     tipeDialog: args.rowData.Jenis,
        //     selectedKodeSupp: args.rowData.kode_supp,
        // }));
    };

    const showApproveRecord = async () => {
        vRefreshData.current += 1;
        if (selectedRowKodeRpe === '') {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: '<p style="font-size:12px; color:white;">Silahkan pilih data Rpe terlebih dahulu</p>',
                width: '100%',
                customClass: {
                    popup: styles['colored-popup'], // Custom class untuk sweetalert
                },
            });
            return;
        }

        if (statusApproval === 'Disetujui') {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: '<p style="font-size:12px; color:white;">Status approval disetujui, tidak dapat di Aprrove kembali.</p>',
                width: '100%',
                customClass: {
                    popup: styles['colored-popup'], // Custom class untuk sweetalert
                },
            });
            return;
        }

        const responseData: any[] = await GetPeriode(kode_entitas);
        const periode = responseData[0].periode;
        const tanggalMomentPeriode = moment(periode, 'YYYYMM');
        const periodeTahunBulan = tanggalMomentPeriode.format('YYYYMM');

        const tglPembanding = moment(dataDetailDokRpe.tgl_rpe).format('YYYYMM');

        // Mendapatkan tahun dan bulan dari setiap tanggal
        const yearA = parseInt(periodeTahunBulan.substring(0, 4));
        const monthA = parseInt(periodeTahunBulan.substring(4, 6));

        const yearB = parseInt(tglPembanding.substring(0, 4));
        const monthB = parseInt(tglPembanding.substring(4, 6));

        if (yearB < yearA || (yearB === yearA && monthB < monthA)) {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: '<p style="font-size:12px; color:white;">Tanggal Transaksi lebih kecil dari periode yang sekarang, tidak bisa dikoreksi.</p>',
                width: '100%',
                customClass: {
                    popup: styles['colored-popup'], // Custom class untuk sweetalert
                },
            });
        } else {
            setStateFilteredData((prevState) => ({
                ...prevState,
                dialogInputDataVisible: true,
                masterDataState: 'APPROVE',
                masterKodeDokumen: selectedRowKodeRpe,
            }));
        }
    };

    const showBatalApproveRecord = async () => {
        vRefreshData.current += 1;
        if (selectedRowKodeRpe === '') {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: '<p style="font-size:12px; color:white;">Silahkan pilih data Rpe terlebih dahulu</p>',
                width: '100%',
                customClass: {
                    popup: styles['colored-popup'], // Custom class untuk sweetalert
                },
            });
            return;
        }

        if (statusApproval !== 'Disetujui') {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: '<p style="font-size:12px; color:white;">Status approval ' + statusApproval + ', tidak dapat di Batal Aprrove kembali.</p>',
                width: '100%',
                customClass: {
                    popup: styles['colored-popup'], // Custom class untuk sweetalert
                },
            });
            return;
        }

        const responseData: any[] = await GetPeriode(kode_entitas);
        const periode = responseData[0].periode;
        const tanggalMomentPeriode = moment(periode, 'YYYYMM');
        const periodeTahunBulan = tanggalMomentPeriode.format('YYYYMM');

        const tglPembanding = moment(dataDetailDokRpe.tgl_rpe).format('YYYYMM');

        // Mendapatkan tahun dan bulan dari setiap tanggal
        const yearA = parseInt(periodeTahunBulan.substring(0, 4));
        const monthA = parseInt(periodeTahunBulan.substring(4, 6));

        const yearB = parseInt(tglPembanding.substring(0, 4));
        const monthB = parseInt(tglPembanding.substring(4, 6));

        if (yearB < yearA || (yearB === yearA && monthB < monthA)) {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: '<p style="font-size:12px; color:white;">Tanggal Transaksi lebih kecil dari periode yang sekarang, tidak bisa dikoreksi.</p>',
                width: '100%',
                customClass: {
                    popup: styles['colored-popup'], // Custom class untuk sweetalert
                },
            });
        } else {
            setStateFilteredData((prevState) => ({
                ...prevState,
                dialogInputDataVisible: true,
                masterDataState: 'BATAL_APPROVE',
                masterKodeDokumen: selectedRowKodeRpe,
            }));
        }
    };

    return (
        <div className="h-[calc(100vh-200px)] w-full ">
            <div className={`Main h-full w-full ${stylesIndex.scale85Monitor}`} >
                {/*==================================================================================================*/}
                {/*================================ Tampilan utama Tanda Terima Barang =============================*/}
                {/*==================================================================================================*/}

                <div style={{ minHeight: '40px', marginTop: '-3px', marginBottom: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <TooltipComponent content="Tampilkan filter data" opensOn="Hover" openDelay={1000} target="#btnFilter">
                            <TooltipComponent content="Refresh data yang ditampilkan" opensOn="Hover" openDelay={1000} target="#btnRefresh">
                                <TooltipComponent content="Membuat RPE baru" opensOn="Hover" openDelay={1000} target="#btnBaru">
                                    <TooltipComponent content="Edit data RPE" opensOn="Hover" openDelay={1000} target="#btnEdit">
                                        <TooltipComponent content="Cetak data RPE" opensOn="Hover" openDelay={1000} target="#btnCetak">
                                            <TooltipComponent content="Approval data RPE" opensOn="Hover" openDelay={1000} target="#btnApp">
                                                <TooltipComponent content="Batal Approval data RPE" opensOn="Hover" openDelay={1000} target="#btnBatalApp">
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
                                                            onClick={showEditRecord}
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

                                                        <ContextMenuComponent
                                                            id="cMenuCetak"
                                                            ref={(scope) => (cMenuCetak = scope as ContextMenuComponent)}
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
                                                            style={{ ...styleButtonApp, width: 100 + 'px' }}
                                                            disabled={disabledCetak}
                                                            onClick={showApproveRecord}
                                                            content="Approval"
                                                            iconCss="e-icons e-medium e-chevron-right"
                                                            iconPosition="Left"
                                                        ></ButtonComponent>

                                                        <ButtonComponent
                                                            id="btnBatalApp"
                                                            cssClass="e-primary e-small"
                                                            style={{ ...styleButtonApp, width: 125 + 'px', color: 'red' }}
                                                            disabled={disabledCetak}
                                                            onClick={showBatalApproveRecord}
                                                            content="Batal Approval"
                                                            iconCss="e-icons e-medium e-chevron-right"
                                                            iconPosition="Left"
                                                        ></ButtonComponent>

                                                        {/* <div className="form-input ml-3 mr-1" style={{ width: '180px', display: 'inline-block' }}> */}
                                                        <div className="form-input ml-3 mr-1" style={{ width: '180px', display: 'inline-block' }}>
                                                            {/* <input
                                                                id="cariNoRpe"
                                                                placeholder="<No RPE>"
                                                                onBlur={(event: any) => PencarianNoRpe(event.target.value, setStateFilteredData, setFilteredData, recordsDataRef.current)}
                                                            /> */}
                                                            <TextBoxComponent
                                                                id="cariNoRpe"
                                                                className="searchtext"
                                                                placeholder="<No RPE>"
                                                                showClearButton={true}
                                                                // input={(args: FocusInEventArgs) => {
                                                                input={(args: ChangeEventArgsInput) => {
                                                                    const value: any = args.value;
                                                                    PencarianNoRpe(value, 'noRpe', setStateFilteredData, setFilteredData, recordsDataRef.current);
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
                                                                    PencarianNoRpe(value, 'bayarMu', setStateFilteredData, setFilteredData, recordsDataRef.current);
                                                                }}
                                                            />
                                                        </div>
                                                    </TooltipComponent>
                                                </TooltipComponent>
                                            </TooltipComponent>
                                        </TooltipComponent>
                                    </TooltipComponent>
                                </TooltipComponent>
                            </TooltipComponent>
                        </TooltipComponent>
                    </div>
                    <div className="ml-3 mr-1" style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="mt-1" style={{ fontSize: '20px', fontFamily: 'Times New Roman' }}>
                            Realisasi Pembayaran Ekspedisi (RPE)
                        </span>
                    </div>
                </div>

                <div className="flex h-[calc(100%-43px)] ">
                    <div className="h-full" style={{ width: '17%', visibility: sidebarVisible ? 'visible' : 'hidden' }}>
                        <div
                            className="panel-filter flex flex-col"
                            style={{ background: '#dedede', width: '100%', height: '100%', overflowY: 'auto', borderBottomLeftRadius: 1, borderBottomRightRadius: 1 }}
                        >
                            <div className="mb-[5px] flex h-[30px] items-center text-center">
                                <div style={{ width: '11%', marginLeft: '17px' }}>
                                    <div className="shrink-0">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
                                            <path
                                                opacity="0.5"
                                                d="M16 4.00195C18.175 4.01406 19.3529 4.11051 20.1213 4.87889C21 5.75757 21 7.17179 21 10.0002V16.0002C21 18.8286 21 20.2429 20.1213 21.1215C19.2426 22.0002 17.8284 22.0002 15 22.0002H9C6.17157 22.0002 4.75736 22.0002 3.87868 21.1215C3 20.2429 3 18.8286 3 16.0002V10.0002C3 7.17179 3 5.75757 3.87868 4.87889C4.64706 4.11051 5.82497 4.01406 8 4.00195"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                            />
                                            <path d="M8 14H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            <path d="M7 10.5H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            <path d="M9 17.5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            <path
                                                d="M8 3.5C8 2.67157 8.67157 2 9.5 2H14.5C15.3284 2 16 2.67157 16 3.5V4.5C16 5.32843 15.3284 6 14.5 6H9.5C8.67157 6 8 5.32843 8 4.5V3.5Z"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <div style={{ width: '79%' }}>
                                    <h5 style={{ textAlign: 'left' }} className="text-lg font-bold">
                                        Filtering Data
                                    </h5>
                                </div>
                                <div style={{ width: '10%', marginLeft: '-25px' }}>
                                    <button
                                        //onClick={toggleFilterData}
                                        onClick={closeClick}
                                    >
                                        <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                                    </button>
                                </div>
                            </div>
                            <div className=" mb-[5px] h-px w-full border-b border-black dark:border-[#1b2e4b]"></div>
                            <div className="flex h-[calc(100%-70px)] flex-col overflow-y-auto">
                                <div className="flex">
                                    <CheckBoxComponent
                                        label="No. RPE"
                                        checked={stateFilteredData.isNoRpeChecked}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            setStateFilteredData((prevState) => ({
                                                ...prevState,
                                                isNoRpeChecked: value,
                                            }));
                                        }}
                                        style={{ borderRadius: 3, borderColor: 'gray' }}
                                    />
                                </div>

                                <div className="mt-1 flex justify-between">
                                    <div className="container form-input">
                                        <TextBoxComponent
                                            placeholder=""
                                            value={stateFilteredData.noRpeValue}
                                            input={(args: FocusInEventArgs) => {
                                                const value: any = args.value;
                                                HandleNoRpeInputChange(value, setStateFilteredData);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="mt-2 flex justify-between">
                                    <CheckBoxComponent
                                        label="Tanggal"
                                        checked={stateFilteredData.isTanggalChecked}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            setStateFilteredData((prevState) => ({
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
                                            value={stateFilteredData.date1.toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                HandleTgl(moment(args.value), 'tanggalAwal', setStateFilteredData);
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                    <p className="set-font-11 ml-0.5 mr-0.5 mt-3 flex justify-between" style={{ width: '48px' }}>
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
                                            value={stateFilteredData.date2.toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                HandleTgl(moment(args.value), 'tanggalAkhir', setStateFilteredData);
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                </div>

                                <div className="mt-2 flex justify-between">
                                    <CheckBoxComponent
                                        label="Nama Ekspedisi"
                                        checked={stateFilteredData.isNamaEkspedisiChecked}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            setStateFilteredData((prevState) => ({
                                                ...prevState,
                                                isNamaEkspedisiChecked: value,
                                            }));
                                        }}
                                    />
                                </div>

                                <div className="mt-1 flex justify-between">
                                    <div className="container form-input">
                                        <TextBoxComponent
                                            placeholder=""
                                            value={stateFilteredData.namaEkspedisiValue}
                                            input={(args: FocusInEventArgs) => {
                                                const value: any = args.value;
                                                HandleNamaEkspedisiInputChange(value, setStateFilteredData);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="mt-2 flex justify-between">
                                    <CheckBoxComponent
                                        label="No. Faktur Ekspedisi"
                                        checked={stateFilteredData.isNoFakturEksChecked}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            setStateFilteredData((prevState) => ({
                                                ...prevState,
                                                isNoFakturEksChecked: value,
                                            }));
                                        }}
                                    />
                                </div>

                                <div className="mt-1 flex justify-between">
                                    <div className="container form-input">
                                        <TextBoxComponent
                                            placeholder=""
                                            value={stateFilteredData.noFakturEksValue}
                                            input={(args: FocusInEventArgs) => {
                                                const value: any = args.value;
                                                HandleNoFakturEksInputChange(value, setStateFilteredData);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="mt-2 flex justify-between">
                                    <div className="font-bold">
                                        <span style={{ fontWeight: 'bold', fontSize: 11 }}>Status Approval</span>
                                    </div>
                                </div>
                                <div className="mt-1 flex">
                                    <input
                                        type="radio"
                                        name="default_text_color"
                                        id="Semua"
                                        className="form-radio"
                                        checked={stateFilteredData.selectedOptionStatusApproval === 'Semua'}
                                        onChange={(event) => HandleStatusApproval(event.target.id, setStateFilteredData)}
                                    />
                                    <label htmlFor="Semua" className="ml-1" style={{ marginBottom: -2, fontSize: 11, marginRight: 10 }}>
                                        Semua
                                    </label>

                                    <input
                                        type="radio"
                                        name="default_text_color"
                                        id="Ditolak"
                                        className="form-radio ml-4"
                                        checked={stateFilteredData.selectedOptionStatusApproval === 'Ditolak'}
                                        onChange={(event) => HandleStatusApproval(event.target.id, setStateFilteredData)}
                                    />
                                    <label htmlFor="Ditolak" className="ml-1" style={{ marginBottom: -2, fontSize: 11 }}>
                                        Ditolak
                                    </label>
                                </div>
                                <div className="mt-1 flex">
                                    <input
                                        type="radio"
                                        name="default_text_color"
                                        id="Baru"
                                        className="form-radio"
                                        checked={stateFilteredData.selectedOptionStatusApproval === 'Baru'}
                                        onChange={(event) => HandleStatusApproval(event.target.id, setStateFilteredData)}
                                    />
                                    <label htmlFor="Baru" className="ml-1" style={{ marginBottom: -2, fontSize: 11, marginRight: 20 }}>
                                        Baru
                                    </label>

                                    <input
                                        type="radio"
                                        name="default_text_color"
                                        id="Koreksi"
                                        className="form-radio ml-4"
                                        checked={stateFilteredData.selectedOptionStatusApproval === 'Koreksi'}
                                        onChange={(event) => HandleStatusApproval(event.target.id, setStateFilteredData)}
                                    />
                                    <label htmlFor="Koreksi" className="ml-1" style={{ marginBottom: -2, fontSize: 11 }}>
                                        Koreksi
                                    </label>
                                </div>

                                <div className="mt-1 flex">
                                    <input
                                        type="radio"
                                        name="default_text_color"
                                        id="Disetujui"
                                        className="form-radio"
                                        checked={stateFilteredData.selectedOptionStatusApproval === 'Disetujui'}
                                        onChange={(event) => HandleStatusApproval(event.target.id, setStateFilteredData)}
                                    />
                                    <label htmlFor="Disetujui" className="ml-1" style={{ marginBottom: -2, fontSize: 11 }}>
                                        Disetujui
                                    </label>

                                    <input
                                        type="radio"
                                        name="default_text_color"
                                        id="Dibatalkan"
                                        className="form-radio ml-4"
                                        checked={stateFilteredData.selectedOptionStatusApproval === 'Dibatalkan'}
                                        onChange={(event) => HandleStatusApproval(event.target.id, setStateFilteredData)}
                                    />
                                    <label htmlFor="Dibatalkan" className="ml-1" style={{ marginBottom: -2, fontSize: 11 }}>
                                        Dibatalkan
                                    </label>
                                </div>
                            </div>
                            <div className="flex h-[30px] w-full items-center justify-center">
                                <ButtonComponent
                                    cssClass="e-primary e-small"
                                    iconCss="e-icons e-medium e-refresh"
                                    content="Refresh Data"
                                    style={{ backgroundColor: '#3b3f5c', marginTop: '15px' }}
                                    onClick={handleRefreshData}
                                    // onClick={RefreshData}
                                />
                            </div>
                        </div>
                    </div>
                    <div style={{ width: '1%', visibility: sidebarVisible ? 'visible' : 'hidden' }}></div>
                    <div style={{ width: '82%' }} className="h-full ">
                        <div className="panel" style={{ height: '100%', background: '#dedede', margin: sidebarVisible ? '' : 'auto auto auto -22%', overflowY: 'auto' }}>
                            <div className="panel-data " style={{ width: '100%', height: '100%' }}>
                                <TabComponent selectedItem={0} animation={{ previous: { effect: 'None' }, next: { effect: 'None' } }} height="100%">
                                    <div className="e-tab-header h-[50px] " style={{ height: '50px' }}>
                                        <div tabIndex={0} className="">
                                            {' '}
                                            Data List{' '}
                                        </div>
                                    </div>
                                    <div className="e-content !h-[calc(100%-50px)] ">
                                        <div className="" style={{ width: '100%', height: '100%', marginTop: '5px' }} tabIndex={0}>
                                            <GridComponent
                                                key={gridKey}
                                                id="gridListData"
                                                locale="id"
                                                // ref={(g) => (gridListData = g)}
                                                ref={gridListDataRef}
                                                dataSource={stateFilteredData.searchNoRpe !== '' || stateFilteredData.searchBayarMu !== '' ? filteredData : recordsDataRef.current}
                                                allowExcelExport={true}
                                                excelExportComplete={ExportComplete}
                                                allowPdfExport={true}
                                                pdfExportComplete={ExportComplete}
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
                                                height={'100%'}
                                                gridLines={'Both'}
                                                // loadingIndicator={{ indicatorType: 'Shimmer' }}
                                                queryCellInfo={QueryCellInfoListData}
                                                rowDataBound={RowDataBoundListData}
                                                rowSelected={(args) => HandleRowSelected(args, setSelectedRowKodeRpe, setStatusApproval)}
                                                recordDoubleClick={HandleRowDoubleClicked}
                                                // HandleRowDoubleClicked(
                                                // args
                                                // userMenu,
                                                // kode_entitas,
                                                // router,
                                                // gridListDataRef.current,
                                                // selectedListData,
                                                // userid,
                                                // setMasterDataState,
                                                // setMasterKodeDokumen,
                                                // setDialogInputDataVisible,
                                                // setRefreshKey
                                                // )
                                                // }
                                                rowSelecting={(args) => {
                                                    if (args.data !== undefined) {
                                                        // ListDetailDok(args.data.kode_ttb, kode_entitas, setDetailDok);
                                                        // ListDetailDok(args.data.kode_ttb, kode_entitas, setDetailDok);
                                                        setDataDetailDokRpe((prevState: any) => ({
                                                            ...prevState,
                                                            no_rpe: args.data.no_rpe,
                                                            tgl_rpe: args.data.tgl_rpe,
                                                        }));
                                                    }
                                                }}
                                                dataBound={() => {
                                                    if (gridListDataRef.current) {
                                                        gridListDataRef.current?.selectRow(rowIdxListData.current);
                                                    }
                                                }}
                                            >
                                                <ColumnsDirective>
                                                    <ColumnDirective
                                                        field="no_rpe"
                                                        headerText="No. RPE"
                                                        headerTextAlign="Center"
                                                        textAlign="Center"
                                                        //autoFit
                                                        width="110"
                                                        clipMode="EllipsisWithTooltip" /*freeze="Left"*/
                                                    />
                                                    <ColumnDirective
                                                        field="tgl_rpe"
                                                        headerText="Tgl. Rpe"
                                                        headerTextAlign="Center"
                                                        textAlign="Center"
                                                        //autoFit
                                                        width="100"
                                                        clipMode="EllipsisWithTooltip"
                                                        type="date"
                                                        format={formatDate}
                                                    />
                                                    <ColumnDirective
                                                        field="via"
                                                        headerText="Ekspedisi"
                                                        headerTextAlign="Center"
                                                        textAlign="Left"
                                                        //autoFit
                                                        width="250"
                                                        clipMode="EllipsisWithTooltip"
                                                    />
                                                    <ColumnDirective
                                                        field="no_reff"
                                                        headerText="No. Faktur Eks"
                                                        headerTextAlign="Center"
                                                        textAlign="Left"
                                                        //autoFit
                                                        width="150"
                                                        clipMode="EllipsisWithTooltip"
                                                    />
                                                    <ColumnDirective
                                                        field="netto_mu"
                                                        headerText="Total Klaim"
                                                        headerTextAlign="Center"
                                                        textAlign="Right"
                                                        //autoFit
                                                        width="115"
                                                        clipMode="EllipsisWithTooltip"
                                                        // template={(args: any) => frmNumber(args.netto_mu)}
                                                        template={TemplateNettoMu}
                                                    />

                                                    <ColumnDirective
                                                        field="total_berat"
                                                        headerText="Total Berat"
                                                        headerTextAlign="Center"
                                                        textAlign="Right"
                                                        //autoFit
                                                        width="115"
                                                        clipMode="EllipsisWithTooltip"
                                                        template={TemplateTotalBerat}
                                                    />
                                                    <ColumnDirective
                                                        field="total_klaim_ekspedisi"
                                                        headerText="Nilai Klaim"
                                                        headerTextAlign="Center"
                                                        textAlign="Right"
                                                        //autoFit
                                                        width="115"
                                                        clipMode="EllipsisWithTooltip"
                                                        template={TemplateTotalKlaimEkspedisi}
                                                    />
                                                    <ColumnDirective
                                                        field="bayar_mu"
                                                        headerText="Total Bayar"
                                                        headerTextAlign="Center"
                                                        textAlign="Right"
                                                        //autoFit
                                                        width="115"
                                                        clipMode="EllipsisWithTooltip"
                                                        template={TemplateBayarMu}
                                                    />
                                                    <ColumnDirective
                                                        field="status"
                                                        headerText="Status"
                                                        headerTextAlign="Center"
                                                        textAlign="Center"
                                                        //autoFit
                                                        width="100"
                                                        clipMode="EllipsisWithTooltip"
                                                    />
                                                    <ColumnDirective
                                                        field="status_app"
                                                        headerText="Approval"
                                                        headerTextAlign="Center"
                                                        textAlign="Center"
                                                        //autoFit
                                                        width="100"
                                                        clipMode="EllipsisWithTooltip"
                                                    />
                                                    <ColumnDirective
                                                        field="no_dokumen"
                                                        headerText="No. Jurnal"
                                                        headerTextAlign="Center"
                                                        textAlign="Left"
                                                        //autoFit
                                                        width="110"
                                                        clipMode="EllipsisWithTooltip"
                                                    />
                                                    <ColumnDirective
                                                        field="no_dokumen_rev"
                                                        headerText="No. Jurnal Rev"
                                                        headerTextAlign="Center"
                                                        textAlign="Left"
                                                        //autoFit
                                                        width="110"
                                                        clipMode="EllipsisWithTooltip"
                                                    />
                                                </ColumnsDirective>
                                                <AggregatesDirective>
                                                    <AggregateDirective>
                                                        <AggregateColumnsDirective>
                                                            <AggregateColumnDirective field="bayar_mu" type="Custom" customAggregate={SumBayarMu} footerTemplate={CustomBayarMu} />
                                                        </AggregateColumnsDirective>
                                                    </AggregateDirective>
                                                </AggregatesDirective>
                                                <Inject services={[Aggregate, Page, Selection, Edit, /*Toolbar,*/ Sort, Group, Filter, Resize, Reorder /*, Freeze,*/, ExcelExport, PdfExport]} />
                                            </GridComponent>
                                        </div>
                                    </div>
                                </TabComponent>
                                {/*============ Tampilkan popup menu untuk print dan simpan ke file ================*/}
                                <ContextMenuComponent
                                    id="contextmenu"
                                    target=".e-gridheader"
                                    items={menuHeaderItems}
                                    select={menuHeaderSelect}
                                    animationSettings={{ duration: 800, effect: 'FadeIn' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        minHeight: '51px',
                        marginTop: '-75px',
                        marginBottom: '11px',
                        width: '17%',
                        backgroundColor: '#dedede',
                        visibility: sidebarVisible ? 'visible' : 'hidden',
                        borderTopLeftRadius: '10px',
                        borderBottomLeftRadius: '10px',
                        borderTopRightRadius: '10px',
                        borderBottomRightRadius: '10px',
                    }}
                >
                    <div className="mt-6 flex justify-center">
                        <TooltipComponent content="Refresh data yang ditampilkan" opensOn="Hover" openDelay={1000} position="BottomCenter"></TooltipComponent>
                    </div>
                </div>

                <DialogFormRpe
                    userid={userid}
                    kode_entitas={kode_entitas}
                    entitas={entitas}
                    masterKodeDokumen={stateFilteredData.masterKodeDokumen}
                    masterDataState={stateFilteredData.masterDataState}
                    isOpen={stateFilteredData.dialogInputDataVisible}
                    onClose={() => {
                        setStateFilteredData((prevState) => ({
                            ...prevState,
                            dialogInputDataVisible: false,
                        }));
                    }}
                    onRefresh={handleRefreshData}
                    kode_user={kode_user}
                    token={token}
                    onRefreshTipe={vRefreshData.current}
                    handleRefreshData={handleRefreshData}
                />
            </div>
        </div>
    );
};

// export { getServerSideProps };

export default RPEList;
