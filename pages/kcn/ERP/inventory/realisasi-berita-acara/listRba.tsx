import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { SidebarComponent, SidebarType, ContextMenuComponent } from '@syncfusion/ej2-react-navigations';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar } from '@syncfusion/ej2-react-calendars';
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
import { swalToast } from '@/lib/fa/konsolidasi-phe/functional/fungsiForm';
import { usersApp, appBackdate, usersMenu } from '@/utils/global/fungsi';
import { Tab } from '@headlessui/react';
import { MenuItemModel } from '@syncfusion/ej2-react-navigations';
import { MenuEventArgs } from '@syncfusion/ej2-react-splitbuttons';
import DialogRba from '../../inventory/realisasi-berita-acara/component/dialogRba';
import { GetAllEntitas, GetCekAppRba, getListRba } from '@/lib/inventory/realisasi-berita-acara/api/api';
import { checkValueAccessorAccPabrik, checkValueAccessorBebanCabang, checkValueAccessorLevel1, checkValueAccessorLevel2 } from '@/utils/inventory/realisasi-berita-acara/interface/fungsi';
import styles from '@styles/index.module.css';
import { handleDoubleClickRba, handleRowSelectedRba } from '@/lib/inventory/realisasi-berita-acara/functional/fungsiForm';
import { useProgress } from '@/context/ProgressContext';
import { frmNumber } from '@/utils/routines';

enableRipple(true);

let textareaObj: any;
const ListRba = () => {
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
        noRBaValue: '',
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
        isNoRBaChecked: false,
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
        app_fpp: any;
    }
    const [userMenu, setUserMenu] = useState<UserMenuState>({ baru: '', edit: '', hapus: '', cetak: '', app_fpp: '' });
    const kode_menu = '31600'; // kode menu Konsolidasi PHE
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

    const [listEntitas, setListEntitas] = useState<any>([]);
    const [masterDataState, setMasterDataState] = useState<string>('BARU');
    const [masterKodeDokumen, setMasterKodeDokumen] = useState<string>('BARU');
    const [dialogInputDataVisibleRba, setDialogInputDataVisibleRba] = useState(false);

    //=========== Setting format tanggal sesuai locale ID ===========
    const formatDate: Object = { type: 'date', format: 'dd-MM-yyyy' };

    // let gridListData: Grid | any;
    const gridListDataKonsolidasiRbaRef = useRef<GridComponent>(null);
    const gridListRbaRef = useRef<GridComponent>(null);

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

    const [selectedEntitas, setSelectedEntitas] = useState<any>([]);
    // ====================== FUNGSI FUNGSI BARU PHE ==========================

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
            app_fpp: respUsersApp[0].app_fpp,
        }));

        const allEntitas = await GetAllEntitas(kode_entitas, token);
        setListEntitas(allEntitas);

        const cekAppRba = await GetCekAppRba(kode_entitas, token, kodeUser);

        setStateDataHeaderList((prevState: any) => ({
            ...prevState,
            appRba: cekAppRba[0].app_rba,
        }));
        // console.log('respUsersApp = ', respUsersApp[0].app_fpp);
    };

    const refreshData = async () => {
        let noRba = 'all';
        let tglAwal = tanggalHariIni; //tanggalHariIni
        let tglAkhir = tanggalAkhirBulan; //tanggalAkhirBulan

        let namaEkspedisi = 'all';
        let namaSupplier = 'all';
        let noReff = 'all';
        let noFbm = 'all';
        let noFj = 'all';
        let status = 'all';

        const paramObject = {
            kode_entitas: kode_entitas,
            noRba: noRba,
            tglAwal: tglAwal, //tanggalHariIni
            tglAkhir: tglAkhir, //tanggalAkhirBulan

            namaEkspedisi: namaEkspedisi,
            namaSupplier: namaSupplier,
            noReff: noReff,
            noFbm: noFbm,
            noFj: noFj,
            status: status,
            token: token,
        };

        const responseDataListRba = await getListRba(paramObject);
        const responseListRbaFix = responseDataListRba.map((Data: any) => ({
            ...Data,
            total_pusat: parseFloat(Data.total_pusat),
            total_mu: parseFloat(Data.total_mu),
            netto_mu: parseFloat(Data.netto_mu),
            jumlah_pabrik: parseFloat(Data.jumlah_pabrik),
            jumlah_cabang: parseFloat(Data.jumlah_cabang),
        }));

        gridListRbaRef.current?.setProperties({ dataSource: responseListRbaFix });
        gridListRbaRef.current?.refresh();
    };

    useEffect(() => {
        fetchDataUseEffect();
        refreshData();
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
        if (args.column.field === 'jumlah_cabang' && args.data.jumlah_cabang > 0) {
            // Contoh: Warnai berdasarkan nilai
            args.cell.style.backgroundColor = 'yellow';
        }

        if (args.column.field === 'jumlah_pabrik' && args.data.jumlah_pabrik > 0) {
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
            kode_entitas: kode_entitas,
            kode_rpeba: masterKodeDokumen,
            token: token,
            jumlah_cabang: stateDataHeaderList.jumlahCabang,
            jumlah_pabrik: stateDataHeaderList.jumlahPabrik,
        };
        if (args.item.id === 'pkp') {
            // if (stateDataHeaderList.jumlahCabang > 0 && stateDataHeaderList.jumlahPabrik > 0) {
            // } else {
            //     OnClick_CetakRbaPKP(paramObject);
            // }
            OnClick_CetakRbaPKP(paramObject);
        } else if (args.item.id === 'non_pkp') {
            OnClick_CetakRbaNONPKP(paramObject);
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

    const handleRefreshData = async () => {
        vRefreshData.current += 1;
        // await showLoading1(true);
        // startProgress();
        if (kode_entitas !== null || kode_entitas !== '') {
            try {
                let noRba = 'all';
                let tglAwal = 'all'; //tanggalHariIni
                let tglAkhir = 'all'; //tanggalAkhirBulan

                let namaEkspedisi = 'all';
                let namaSupplier = 'all';
                let noReff = 'all';
                let noFbm = 'all';
                let noFj = 'all';
                let status = 'all';

                if (stateChecked.isNoRBaChecked) {
                    noRba = `${stateFiilterData.noRBaValue}`;
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

                const paramObject = {
                    kode_entitas: kode_entitas,
                    noRba: noRba,
                    tglAwal: tglAwal, //tanggalHariIni
                    tglAkhir: tglAkhir, //tanggalAkhirBulan

                    namaEkspedisi: namaEkspedisi,
                    namaSupplier: namaSupplier,
                    noReff: noReff,
                    noFbm: noFbm,
                    noFj: noFj,
                    status: status,
                    token: token,
                };

                const responseDataListRba = await getListRba(paramObject);
                const responseListRbaFix = responseDataListRba.map((Data: any) => ({
                    ...Data,
                    total_pusat: parseFloat(Data.total_pusat),
                    total_mu: parseFloat(Data.total_mu),
                    netto_mu: parseFloat(Data.netto_mu),
                    jumlah_pabrik: parseFloat(Data.jumlah_pabrik),
                    jumlah_cabang: parseFloat(Data.jumlah_cabang),
                }));

                gridListRbaRef.current?.setProperties({ dataSource: responseListRbaFix });
                gridListRbaRef.current?.refresh();

                // showLoading1(false);
                // endProgress();
            } catch (error: any) {
                console.error(error);
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
                setMasterDataState('APPROVAL');
                setDialogInputDataVisibleRba(true);
            }
        } else if (tipe === 'mergePdf') {
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
            iframeSrc = `./report/rba_pkp_beban_cabang?entitas=${paramObject.kode_entitas}&kode_rpeba=${paramObject.kode_rpeba}&token=${paramObject.token}`;
        } else if (paramObject.jumlah_cabang <= 0 && paramObject.jumlah_pabrik > 0) {
            iframeSrc = `./report/rba_pkp_acc_pabrik?entitas=${paramObject.kode_entitas}&kode_rpeba=${paramObject.kode_rpeba}&token=${paramObject.token}`;
        } else if (paramObject.jumlah_cabang > 0 && paramObject.jumlah_pabrik > 0) {
            iframeSrc = `./report/rba_pkp_acc_pabrik_beban_cabang?entitas=${paramObject.kode_entitas}&kode_rpeba=${paramObject.kode_rpeba}&token=${paramObject.token}`;
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
            iframeSrc = `./report/rba_nonpkp_beban_cabang?entitas=${paramObject.kode_entitas}&kode_rpeba=${paramObject.kode_rpeba}&token=${paramObject.token}`;
        } else if (paramObject.jumlah_cabang <= 0 && paramObject.jumlah_pabrik > 0) {
            iframeSrc = `./report/rba_nonpkp_acc_pabrik?entitas=${paramObject.kode_entitas}&kode_rpeba=${paramObject.kode_rpeba}&token=${paramObject.token}`;
        } else if (paramObject.jumlah_cabang > 0 && paramObject.jumlah_pabrik > 0) {
            iframeSrc = `./report/rba_nonpkp_acc_pabrik_beban_cabang?entitas=${paramObject.kode_entitas}&kode_rpeba=${paramObject.kode_rpeba}&token=${paramObject.token}`;
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

    const showEditRecord = async () => {
        setRefreshKey((prevKey: any) => prevKey + 1);
        setMasterDataState('EDIT');
        setDialogInputDataVisibleRba(true);
    };

    const showNewRecord = async () => {
        setRefreshKey((prevKey: any) => prevKey + 1);
        setMasterDataState('BARU');
        setDialogInputDataVisibleRba(true);
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
                                                style={
                                                    userMenu.app_fpp === '2' || userid === 'administrator' || userid === 'ADMINISTRATOR'
                                                        ? { ...styleButtonApp, width: 100 + 'px', color: 'green' }
                                                        : { ...styleButtonDisabled, width: 100 + 'px', color: '#1c1b1f61' }
                                                }
                                                disabled={userMenu.app_fpp === '2' || userid === 'administrator' || userid === 'ADMINISTRATOR' ? false : true}
                                                // disabled={true}
                                                onClick={() => handleOnclickButton('approval')}
                                                content="Approval"
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
                            Realisasi Berita Acara (RBA)
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
                                    <div className="panel-data" style={{ background: '#b6beca', width: '109%', height: '657px', marginLeft: '-13px', marginTop: '-15px' }}>
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
                                                Filters
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
                                                                checked={stateChecked.isNoRBaChecked}
                                                                change={(args: ChangeEventArgsButton) => {
                                                                    const value: any = args.checked;
                                                                    setStateChecked((prevState: any) => ({
                                                                        ...prevState,
                                                                        isNoRBaChecked: value,
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
                                                                value={stateFiilterData?.noRBaValue}
                                                                onChange={(event) => {
                                                                    const value: any = event.target.value;
                                                                    setStateChecked((prevState: any) => ({
                                                                        ...prevState,
                                                                        isNoRBaChecked: value,
                                                                    }));
                                                                    setStateFilterData((prevState: any) => ({
                                                                        ...prevState,
                                                                        noRBaValue: value,
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
                                                        <div className="flex flex-col gap-x-4">
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
                                        ref={gridListRbaRef}
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
                                        height={530}
                                        gridLines={'Both'}
                                        // loadingIndicator={{ indicatorType: 'Shimmer' }}
                                        queryCellInfo={queryCell}
                                        rowDataBound={rowDataBound}
                                        rowSelected={(args) => {
                                            const mergerObject = {
                                                ...handleParamsObject,
                                            };
                                            // handleRowSelectedOD(args, 'od', mergerObject);
                                            handleRowSelectedRba(args, mergerObject);
                                        }}
                                        recordDoubleClick={(args) => {
                                            const mergerObject = {
                                                ...handleParamsObject,
                                            };
                                            handleDoubleClickRba(args, mergerObject);
                                        }}
                                    >
                                        <ColumnsDirective>
                                            <ColumnDirective
                                                field="no_rpeba"
                                                headerText="No. RBA"
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
                                                field="jumlah_pabrik"
                                                headerText="Acc. Pabrik"
                                                format="N2"
                                                headerTextAlign="Center"
                                                textAlign="Right"
                                                autoFit
                                                width="125"
                                                valueAccessor={checkValueAccessorAccPabrik}
                                            />
                                            <ColumnDirective
                                                field="jumlah_cabang"
                                                headerText="Beban Cabang"
                                                format="N2"
                                                headerTextAlign="Center"
                                                textAlign="Right"
                                                autoFit
                                                width="125"
                                                valueAccessor={checkValueAccessorBebanCabang}
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
                    ></div>
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
                dataEntitas={kode_entitas}
                isOpen={dialogInputDataVisibleRba}
                onClose={() => {
                    setDialogInputDataVisibleRba(false);
                }}
                onRefresh={handleRefreshData}
                kode_user={kode_user}
                refreshKey={refreshKey}
                onOpen={() => {
                    setDialogInputDataVisibleRba(true);
                }}
                token={token}
                valueAppBackdate={valueAppBackdate}
                stateDataHeaderList={stateDataHeaderList}
            />
        </div>
    );
};

// export { getServerSideProps };

export default ListRba;
