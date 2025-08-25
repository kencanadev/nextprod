import { useSession } from '@/pages/api/sessionContext';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useRef, useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import swal from 'sweetalert2';
import Draggable from 'react-draggable';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { MenuEventArgs } from '@syncfusion/ej2-react-splitbuttons';
import { SidebarComponent, SidebarType, ContextMenuComponent, MenuItemModel /*Tab, TabComponent*/ } from '@syncfusion/ej2-react-navigations';
import { Dialog, DialogComponent, Tooltip, TooltipComponent, TooltipEventArgs, ButtonPropsModel } from '@syncfusion/ej2-react-popups';

import {
    Grid,
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
    Toolbar,
    CommandColumn,
} from '@syncfusion/ej2-react-grids';
import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton, RadioButtonComponent } from '@syncfusion/ej2-react-buttons';
import { ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent, FocusInEventArgs } from '@syncfusion/ej2-react-inputs';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown } from '@syncfusion/ej2-react-dropdowns';

import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json'; // To load the culture based first day of week
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
import idIDLocalization from 'public/syncfusion/locale.json';
L10n.load(idIDLocalization);

import withReactContent from 'sweetalert2-react-content';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faTimes } from '@fortawesome/free-solid-svg-icons';

import styles from './fpblist.module.css';
import { log } from 'console';
import Link from 'next/link';
import { sortBy } from 'lodash';
import { Tab } from '@headlessui/react';
import { classNames } from 'primereact/utils';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { FetchDataListFpb } from './model/api';
import { ListDetailDok, SetDataDokumen } from './component/fungsi';
import { FirstDayInPeriod, myAlertGlobal, showLoading, usersMenu } from '@/utils/routines';
import ReportDlgCabang from './component/frmReportDlgFpbCabang';
import FrmFpb from './component/frmFpb';
import { truncate } from 'fs';
import { text } from 'stream/consumers';
import { SelectionSettingsModel } from '@syncfusion/ej2/grids';
import { ProgressBarComponent, ProgressAnnotation } from '@syncfusion/ej2-react-progressbar';

// import classNames from 'classnames';
let dgFpbList: Grid | any;
let dgDetailDok: Grid | any;
const FpbList = () => {
    const router = useRouter();
    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const entitas = sessionData?.entitas ?? '';
    const token = sessionData?.token ?? '';
    interface UserMenuState {
        baru: any;
        edit: any;
        hapus: any;
        cetak: any;
    }

    let disabledCetak = false;
    let disabledBaru = false;
    let disabledEdit = false;
    let disabledHapus = false;
    let selectDataGrid: any[] = [];
    // let diabledbtnAppCabang: boolean;
    // let diabledbtnAppPusat: boolean;
    let cMenuCetak: ContextMenuComponent;

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const [userMenu, setUserMenu] = useState<UserMenuState>({ baru: '', edit: '', hapus: '', cetak: '' });
    const kode_menu = '30800';
    // const [fpba1, setFpba1] = useState('');
    // const [fpba2, setFpba2] = useState('');

    const [isLoadingProgress, setIsLoadingProgress] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [displayedProgress, setDisplayedProgress] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState('Loading Data...');

    const [sidebarVisible, setSidebarVisible] = useState(true);
    const gridWidth = sidebarVisible ? 'calc(100% - 315px)' : '100%';
    let sidebarObj: SidebarComponent;
    let type: SidebarType = 'Push';
    let mediaQueryState: string = '(min-width: 600px)';

    const swalToast = swal.mixin({
        toast: true,
        position: 'center',
        customClass: {
            popup: 'colored-toast',
        },
        showConfirmButton: false,
        timer: 2000,
        showClass: {
            popup: `
              animate__animated
              animate__zoomIn
              animate__faster
            `,
        },
        hideClass: {
            popup: `
              animate__animated
              animate__zoomOut
              animate__faster
            `,
        },
    });

    const styleButton = {
        clasname: 'rounded bg-blue-600 px-4 py-2 text-white',
        width: 57 + 'px',
        height: '28px',
        marginBottom: '0.5em',
        marginTop: 0.5 + 'em',
        marginRight: 0.8 + 'em',
        backgroundColor: '#3b3f5c',
    };

    const [isSelectedRow, setSelectedRow] = useState(false);
    const styleButtonAppoval = { width: 150 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#3b3f5c' };
    const formatFloat: Object = { skeleton: 'C3', format: ',0.####;-,0.#####;#', maximumFractionDigits: 4 };
    const [panelVisible, setPanelVisible] = useState(true);
    const [isShowTaskMenu, setIsShowTaskMenu] = useState(false);
    const [jenisTab, setJenisTab] = useState('tbData');
    const [masterKodeDokumen, setMasterKodeDokumen] = useState<string>('BARU');
    const [detailDok, setDetailDok] = useState<any[]>([]);
    const [modalPosition, setModalPosition] = useState({ top: '3%', right: '2%', width: '40%', background: '#dedede' });
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [detailListDokumen, setDetailListDokumen] = useState({ no_dokumen: '', tgl_dokumen: '' });
    const [showLoader, setShowLoader] = useState(true);

    const [selectedApproval, setSelectedApproval] = useState(true);
    const [selectedStatusBatal, setSelectedStatusBatal] = useState(true);

    const [modalJenisTransaksi, setModalJenisTransaksi] = useState(false);
    const [approvalButtonCabang, setApprovalButtonCabang] = useState(false);
    const [approvalButtonPusat, setApprovalButtonPusat] = useState(false);
    const [dialogFrmFpb, setDialogFrmFpb] = useState(false);

    const [jenisTransaksi, setJenisTransaksi] = useState<any>('1');
    const [masterDataState, setMasterDataState] = useState<string>('');
    const [kirimCabang, setKirimCabang] = useState<string>('');
    const [tipeFpb, setTipeFpb] = useState<string>('N');
    const [conFPB, setConFPB] = useState<string>('');
    const [isCabang, setIsCabang] = useState<boolean>(false);
    const [kirimLangsung, setKirimLangsung] = useState<string>('N');
    const [koreksi, setKoreksi] = useState<string>('');

    // STATE DIALOG
    const [showReportDlgFpbCabang, setShowReportDlgFpbCabang] = useState(false);
    const [formListDataState, setFormListDataState] = useState({
        chbKode: false,
        edKode: 'all',
        chbTanggal: true,
        edTglAwal: moment().format('YYYY-MM-DD'),
        edTglAkhir: moment().endOf('month'),
        chbTanggalBerlaku: false,
        edTglAwalBerlaku: moment().format('YYYY-MM-DD'),
        edTglAkhirBerlaku: moment().endOf('month'),
        chbTanggalKirim: false,
        edTglAwalKirim: moment().format('YYYY-MM-DD'),
        edTglAkhirKirim: moment().endOf('month'),
        chbSupplier: false,
        edSupp: 'all',
        chbCust: false,
        edCust: 'all',
        chbStatus: false,
        cbStatus: 'all',
        chbStatApproval: false,
        cbStatApproval: 'all',
        chbEntitas: false,
        edEntitas: 'all',
        chbBatal: false,
    });

    const stateDokumen = {
        kode_entitas: kode_entitas, //sessionData?.kode_entitas ?? '',
        userid: userid, //sessionData?.userid ?? '',
        kode_user: kode_user, //sessionData?.kode_user ?? '',
        token: token, //sessionData?.token ?? '',
        CON_FPB: conFPB,
        masterKodeDokumen: masterKodeDokumen,
        tipeFpb: tipeFpb,
        isCabang: isCabang,
        KirimLangsung: kirimLangsung,
        masterDataState: masterDataState,
        koreksi: koreksi,
    };

    const paramList = {
        entitas: kode_entitas,
        param1: formListDataState.chbKode ? formListDataState.edKode : 'all',
        param2: formListDataState.chbTanggal ? formListDataState.edTglAwal : 'all',
        param3: formListDataState.chbTanggal ? moment(formListDataState.edTglAkhir).format('YYYY-MM-DD') : 'all',
        param4: formListDataState.chbTanggalBerlaku ? formListDataState.edTglAwalBerlaku : 'all',
        param5: formListDataState.chbTanggalBerlaku ? moment(formListDataState.edTglAkhirBerlaku).format('YYYY-MM-DD') : 'all',
        param6: formListDataState.chbTanggalKirim ? formListDataState.edTglAwalKirim : 'all',
        param7: formListDataState.chbTanggalKirim ? moment(formListDataState.edTglAkhirKirim).format('YYYY-MM-DD') : 'all',
        param8: formListDataState.chbSupplier ? formListDataState.edSupp : 'all',
        param9: formListDataState.chbStatus ? formListDataState.cbStatus : 'all',
        param10: formListDataState.chbEntitas ? (entitas === '899' ? formListDataState.edEntitas : entitas) : entitas === '899' ? 'all' : entitas,
        param11: formListDataState.chbStatApproval ? formListDataState.cbStatApproval : 'all',
        // param11: formListDataState.chbEntitas ? formListDataState.edEntitas : 'all',
        param12: formListDataState.chbBatal ? 'Y' : 'N',
        param13: tipeFpb, //jenisTab, // === 'Baru' ? 'baru' : jenisTab === 'Approved' ? 'approved' : 'all',
    };

    const formatDate: Object = { type: 'date', format: 'dd-MM-yyyy' };
    // if (isLoading) {
    //     return;
    // }

    const tabKategori = [
        {
            caption: '1. FPB Cabang',
            name: 'tbData',
            disabled: false,
        },
        {
            caption: '2. FPB Kontrak Detail',
            name: 'tbDetail',
            disabled: true,
        },
        {
            caption: '3. KPB Pusat',
            name: 'tbKpb',
            disabled: true,
        },
    ];

    function btnPrintClick(e: any): void {
        var clientRect = (e.target as Element).getBoundingClientRect();
        cMenuCetak.open(clientRect.bottom, clientRect.left);
    }

    const handleTogglePanel = () => {
        setPanelVisible(!panelVisible);
    };
    const handleFilterClick = () => {
        setPanelVisible(true);
    };

    const handleCheckboxChange = (name: any, value: any) => {
        setFormListDataState((prevFormData: any) => ({
            ...prevFormData,
            [name]: value,
        }));
    };
    const handleInputChange = (name: any, value: any, cekBoxname: any) => {
        setFormListDataState((prevFormData: any) => ({
            ...prevFormData,
            [name]: value,
            [cekBoxname]: value !== '',
            // [`checked_${name}`]: value !== '',
        }));
    };

    function onRenderDayCell(args: RenderDayCellEventArgs): void {
        if ((args.date as Date).getDay() === 0) {
            args.isDisabled = true;
        }
    }

    const ExportComplete = (): void => {
        dgFpbList.hideSpinner();
    };

    let interval: any;

    const handleRefreshData = async () => {
        try {
            setIsLoadingProgress(true);
            setProgressValue(0);
            setDisplayedProgress(0);
            setLoadingMessage('Fetching data...');
            // console.log('paramList ', paramList);
            await FetchDataListFpb(paramList, dgFpbList, stateDokumen.token, (progress) => {
                setProgressValue(progress);
                setDisplayedProgress(Math.round(progress));

                if (progress < 30) {
                    setLoadingMessage('Initializing data fetch...');
                } else if (progress < 60) {
                    setLoadingMessage('Processing records...');
                } else if (progress < 90) {
                    setLoadingMessage('Almost complete...');
                } else {
                    setLoadingMessage('Finalizing...');
                }
            });

            // Complete the progress
            setProgressValue(100);
            setDisplayedProgress(100);
            setLoadingMessage('Complete!');

            setTimeout(() => {
                setIsLoadingProgress(false);
                setProgressValue(0);
                setDisplayedProgress(0);
            }, 500);
        } catch (error) {
            setIsLoadingProgress(false);
            setProgressValue(0);
            setDisplayedProgress(0);
            console.error(error);
        }
    };

    const handleSearch = (value: any) => {
        if (dgFpbList) {
            dgFpbList.search(value);
        }
    };

    const closeModal = () => {
        setSelectedItem(null);
    };

    function menuCetakSelect(args: MenuEventArgs) {
        OnClick_CetakForm(masterKodeDokumen, args.item.id, args.item.text);
        // SetDataDokumenMk('cetak', selectedRowKodeMk, kode_entitas, dataDetailDokMk, router, setSelectedItem, setDetailDok);
    }

    let menuCetakItems: MenuItemModel[] = [
        {
            iconCss: 'e-icons e-thumbnail',
            text: 'Form Pemesanan Barang',
        },
        {
            iconCss: 'e-icons e-thumbnail',
            text: 'Daftar Form Pemesanan Barang',
        },
    ];

    const OnClick_CetakForm = (selectedRowKode: any, tag: any, namaMenuCetak: any) => {
        let height = window.screen.availHeight - 150;
        let width = window.screen.availWidth - 200;
        let leftPosition = window.screen.width / 2 - (width / 2 + 10);
        let topPosition = window.screen.height / 2 - (height / 2 + 50);

        if (jenisTab === 'tbData') {
            // if (tag === '1') {
            if (namaMenuCetak === 'Form Pemesanan Barang') {
                if (selectedRowKode === '' || selectedRowKode === 'BARU') {
                    withReactContent(swalToast).fire({
                        icon: 'warning',
                        title: '<p style="font-size:12px;color:white;">Silahkan pilih data FPB terlebih dahulu</p>',
                        width: '100%',
                        customClass: {
                            popup: styles['colored-popup'], // Custom class untuk sweetalert
                        },
                    });
                    return;
                } else {
                    let iframe = `
                        <html><head>
                        <title>Form Pemesanan Barang | Next KCN Sytem</title>
                        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
                        </head><body>
                        <iframe src="./report/Dfpb_rp?entitas=${stateDokumen.kode_entitas}&param1=${selectedRowKode}&token=${stateDokumen.token}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
                        setShowLoader(true);
                        setTimeout(() => {
                            let link: any = win?.document.createElement('link');
                            link.type = 'image/png';
                            link.rel = 'shortcut icon';
                            link.href = '/favicon.png';
                            win?.document.getElementsByTagName('head')[0].appendChild(link);
                            win?.document.write(iframe);
                            setShowLoader(false);
                        }, 300);
                    } else {
                        console.error('Window failed to open.');
                    }
                }

                // } else if (tag === '2') {
            } else if (namaMenuCetak === 'Daftar Form Pemesanan Barang') {
                setShowReportDlgFpbCabang(true);
                // const vParamsList1 = {
                //     param1: formListDataState.chbTanggal ? moment(formListDataState.edTglAwal).format('YYYY-MM-DD') : 'all',
                // };
                // const vParamsList2 = {
                //     param2: formListDataState.chbTanggal ? moment(formListDataState.edTglAkhir).format('YYYY-MM-DD') : 'all',
                // };
                // const vParamsList3 = {
                //     token: token,
                // };
                //         let iframe = `
                //     <html><head>
                //     <title>Daftar Pemesanan Barang | Next KCN Sytem</title>
                //     <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
                //     </head><body>
                //       <iframe src="./report/Dfpb_rp?entitas=${stateDokumen.kode_entitas}&param1=${selectedRowKode}&token=${stateDokumen.token}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
                //     </body></html>`;
                //         let win = window.open(
                //             '',
                //             '_blank',
                //             `status=no,width=${width},height=${height},resizable=yes
                //   ,left=${leftPosition},top=${topPosition}
                //   ,screenX=${leftPosition},screenY=${topPosition}
                //   ,toolbar=no,menubar=no,scrollbars=no,location=no,directories=no`
                //         );
                //         if (win) {
                //             let link = win.document.createElement('link');
                //             link.type = 'image/png';
                //             link.rel = 'shortcut icon';
                //             link.href = '/favicon.png';
                //             win.document.getElementsByTagName('head')[0].appendChild(link);
                //             win.document.write(iframe);
                //         } else {
                //             console.error('Window failed to open.');
                //         }
                //         // } else if (tag === '3') {
                //         // } else if (namaMenuCetak === 'Form Kecil') {
            }
        } else {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: '<p style="font-size:12px;color:white;">Data belum tersedia untuk di print.</p>',
                width: '100%',
                customClass: {
                    popup: styles['colored-popup'], // Custom class untuk sweetalert
                },
            });
        }
    };

    const changeModalJenisTransaksi = async (value: any) => {
        setJenisTransaksi(value);
    };

    const handleDialogJenisPengiriman = async (jenis: any) => {
        setModalJenisTransaksi(false);

        if (jenis === '1') {
            setIsCabang(true);
            setKirimLangsung('N');
            setDialogFrmFpb(true);
        } else if (jenis === '2') {
            setIsCabang(false);
            setKirimLangsung('Y');
            setDialogFrmFpb(true);
        }
    };

    const showNewRecord = async () => {
        setMasterDataState('BARU');
        setMasterKodeDokumen('BARU');
        setConFPB('fpb');
        if (tipeFpb === 'N') {
            setModalJenisTransaksi(true);
        } else {
            setDialogFrmFpb(true);
            setIsCabang(true);
        }
    };

    useEffect(() => {
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, []);

    useEffect(() => {
        const tanggalSekarang = moment();
        // Menentukan tanggal awal bulan
        const tanggalAwalBulan = tanggalSekarang.startOf('month');
        // Menentukan tanggal akhir bulan dengan moment.js
        const tanggalHariIni = moment(new Date()).format('YYYY-MM-DD');
        const tanggalAkhirBulan = moment(tanggalAwalBulan.endOf('month')).format('YYYY-MM-DD');
        // const kode_menu = '30200'; // kode menu PO
        const fetchDataUseEffect = async () => {
            showLoading();
            try {
                const response_approval = await axios.get(`${apiUrl}/erp/users_app`, {
                    params: {
                        entitas: kode_entitas, //stateDokumen.kode_entitas,
                        param1: userid, //stateDokumen.userid,
                    },
                });
                const responseApp = response_approval.data?.data[0];
                // console.log('responseApp ', responseApp);
                if (responseApp?.fpba2 === 'Y' || responseApp?.kode_user === 'ADMIN') {
                    setApprovalButtonCabang(false);
                } else {
                    setApprovalButtonCabang(true);
                }
                if (responseApp?.fpba1 === 'Y' || responseApp?.kode_user === 'ADMIN') {
                    setApprovalButtonPusat(false);
                } else {
                    setApprovalButtonPusat(true);
                }
                await usersMenu(kode_entitas, userid, kode_menu)
                    // await usersMenu(sessionData.kode_entitas?, sessionData?.userid, kode_menu)
                    .then((result) => {
                        const { baru, edit, hapus, cetak } = result;
                        setUserMenu((prevState: any) => ({
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
            } catch (error) {
                console.error('Error fetching data:', error);
            }
            swal.close();
        };
        fetchDataUseEffect();

        // }, [stateDokumen.kode_user]);
    }, [kode_user]);

    useEffect(() => {
        if (dgFpbList) {
            handleRefreshData();
        }
        // handleRefreshData();
        // FetchDataListFpb(paramList, dgFpbList, stateDokumen.token);
    }, [stateDokumen.kode_entitas]);

    const handleObjekParameter = async (objekParameter: any) => {
        setShowReportDlgFpbCabang(false);

        let height = window.screen.availHeight - 150;
        let width = window.screen.availWidth - 200;
        let leftPosition = window.screen.width / 2 - (width / 2 + 10);
        let topPosition = window.screen.height / 2 - (height / 2 + 50);
        let iframe = `
             <html><head>
             <title>Daftar Pemesanan Barang | Next KCN Sytem</title>
             <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
             </head><body>
             <iframe src="./report/rpMfpb?entitas=${objekParameter.entitas}&param1=${objekParameter.param1}&param2=${objekParameter.param2}&param3=${objekParameter.param3}&param4=${objekParameter.param4}&param5=${objekParameter.param5}&param6=${objekParameter.param6}&token=${stateDokumen.token}" style="height:calc(100% - 4px);width:calc(100% - 4px)"
             >
             </iframe>
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

    if (isLoading) {
        return;
    }

    const showEditRecord = async () => {
        if (masterKodeDokumen === '') {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: '<p style="font-size:12px; color:white;">Silahkan pilih data terlebih dahulu</p>',
                width: '100%',
                customClass: {
                    popup: styles['colored-popup'], // Custom class untuk sweetalert
                },
            });
            return;
        } else {
            selectDataGrid = dgFpbList.getSelectedRecords();

            if (selectDataGrid[0]?.status === 'Terbuka' && (selectDataGrid[0]?.approval2 === '' || selectDataGrid[0]?.approval2 === 'C' || selectDataGrid[0]?.approval2 === null)) {
                setKirimLangsung(selectDataGrid[0]?.kirim_langsung_cabang);
                setIsCabang(false);
                setConFPB('fpb');
                setMasterDataState('EDIT');
                setDialogFrmFpb(true);
                setKoreksi(selectDataGrid[0]?.approval2);
            } else {
                setKirimLangsung(selectDataGrid[0]?.kirim_langsung_cabang);
                setIsCabang(false);
                setConFPB('preview');
                setMasterDataState('EDIT');
                setDialogFrmFpb(true);
            }
        }
    };

    const handleApproveCabang = () => {
        selectDataGrid = dgFpbList.getSelectedRecords();
        console.log('selectDataGrid ', selectDataGrid);

        if (selectDataGrid.length > 0) {
            if (selectDataGrid[0].status_app2 === 'Disetujui') {
                myAlertGlobal(`Approval cabang sudah disetujui`, 'main-target');
            } else {
                setKirimLangsung(selectDataGrid[0]?.kirim_langsung_cabang);
                setIsCabang(false);
                if (selectDataGrid[0]?.status === 'Terbuka' && selectDataGrid[0]?.status_app === 'Baru') {
                    setConFPB('Approve_Cabang');
                    setMasterDataState('Approve Cabang');
                    setDialogFrmFpb(true);
                } else {
                    myAlertGlobal(`Status approval Cabang ${selectDataGrid[0]?.status_app} tidak dapat dikoreksi`, 'main-target');
                }
            }
        } else {
            myAlertGlobal(`Silahkan pilih data terlebih dahulu`, 'main-target');
        }
    };

    const handleApprovePusat = () => {
        selectDataGrid = dgFpbList.getSelectedRecords();

        if (selectDataGrid.length > 0) {
            if (selectDataGrid[0].status_app === 'Disetujui') {
                myAlertGlobal(`Approval pusat sudah disetujui`, 'main-target');
            } else {
                setKirimLangsung(selectDataGrid[0]?.kirim_langsung_cabang);
                setIsCabang(false);
                if (selectDataGrid[0]?.status === 'Terbuka' && selectDataGrid[0]?.status_app2 === 'Disetujui' && selectDataGrid[0]?.kontrak === 'N') {
                    setConFPB('Approve_Pusat');
                    setMasterDataState('Approve Pusat');
                    setDialogFrmFpb(true);
                } else if (selectDataGrid[0]?.kontrak === 'Y') {
                    myAlertGlobal(`Approval untuk kontrak hanya bisa dilakukan di KPB !!`, 'main-target');
                } else {
                    myAlertGlobal(`Status approval Cabang ${selectDataGrid[0]?.status_app2} tidak dapat diapprove`, 'main-target');
                }
            }
        } else {
            myAlertGlobal(`Silahkan pilih data terlebih dahulu`, 'main-target');
        }
    };

    // const QueryCellInfoListData = (args: any) => {
    //     console.log('args', args.data);
    //     // if (args.column?.field === 'status_app2') {
    //     if (getValue('status_app2', args.data) === 'Disetujui' && getValue('status_app', args.data) === 'Disetujui') {
    //         args.cell.style.color = 'green';
    //         // args.cell.style.backgroundColor = '#FDF3CC';
    //     } else if (getValue('status_app2', args.data) === 'Disetujui' && getValue('status_app', args.data) === 'Baru') {
    //         args.cell.style.color = 'blue';
    //         // args.cell.style.backgroundColor = '#FDF3CC';
    //     } else if (getValue('status', args.data) == 'C') {
    //         args.cell.style.color = '#000080FF';
    //         // args.cell.style.backgroundColor = '#FDF3CC';
    //     }
    //     // }
    //     if (args.column?.field === 'status_batal') {
    //         if (getValue('statstatus_batalus_app', args.data) == 'Y') {
    //             args.cell.style.color = 'maroon';
    //         }
    //     }
    // };

    // const QueryCellInfoListData = (args: any) => {
    //     // console.log('args', args.data);
    //     // if (args.column?.field === 'status_app2') {
    //     if (getValue('approval', args.data) === 'Y') {
    //         args.cell.style.color = 'green';
    //         // args.cell.style.backgroundColor = '#FDF3CC';
    //     } else if (getValue('approval', args.data) === 'N') {
    //         args.cell.style.color = 'red';
    //         // args.cell.style.backgroundColor = '#FDF3CC';
    //     } else if (getValue('approval', args.data) === 'C') {
    //         args.cell.style.color = '#000080FF';
    //         // args.cell.style.backgroundColor = '#FDF3CC';
    //     }
    //     // }
    //     if (args.column?.field === 'status_batal') {
    //         if (getValue('status_batal', args.data) === 'Y') {
    //             args.cell.style.color = 'maroon';
    //         }
    //     }
    // };
    const selectionSettings: SelectionSettingsModel = { mode: 'Row', type: 'Single' };
    const rowDataBoundListData = (args: any) => {
        if (args.row) {
            if (getValue('status', args.data) == 'Tertutup') {
                args.row.style.background = '#f5f4f4';
            } else if (getValue('status', args.data) == 'Proses') {
                args.row.style.background = '#fbffc8';
            } else {
                args.row.style.background = '#ffffff';
            }
        }
    };
    const QueryCellInfoListData = (args: any) => {
        // console.log('args:', args);
        // Set default colors
        args.cell.style.color = 'black'; // Default font color
        // args.cell.style.backgroundColor = 'white'; // Default background color

        const approvalStatus = getValue('approval', args.data);
        const approvalStatusCabang = getValue('approval2', args.data);

        console.log('approvalStatusCabang', approvalStatusCabang);
        if (approvalStatusCabang === 'Y' && approvalStatus === 'Y') {
            args.cell.style.color = 'green';
        } else if (approvalStatusCabang === 'N' || approvalStatus === 'N') {
            args.cell.style.color = 'red';
        } else if (approvalStatusCabang === 'C' || approvalStatus === 'C') {
            // args.cell.style.color = '#000080FF'; // Custom color
            args.cell.style.color = '#ff7f00'; // Custom color
        } else {
            args.cell.style.color = 'blue'; // Default color for other cases
        }

        // if (approvalStatusCabang === 'Y') {
        //     args.cell.style.color = 'green';
        // } else if (approvalStatusCabang === 'N') {
        //     args.cell.style.color = 'red';
        // } else if (approvalStatusCabang === 'C') {
        //     args.cell.style.color = '#000080FF'; // Custom color
        // } else {
        //     args.cell.style.color = 'blue'; // Default color for other cases
        // }

        if (getValue('status_batal', args.data) === 'Y') {
            args.cell.style.color = 'maroon';
        }
    };

    const sampleContainer = {
        maxHeight: '500px',
    };

    const onCreate = () => {
        sidebarObj.element.style.visibility = '';
    };
    const toggleClick = () => {
        setSidebarVisible(true);
    };
    const closeClick = () => {
        setSidebarVisible(false);
    };

    return (
        <div>
            {isLoadingProgress && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="rounded-lg bg-white p-6 shadow-lg">
                        {/* <div className="mb-4 text-center text-lg font-semibold">Loading Data...{tabs[selectedIndex].id}</div> */}
                        <div className="mb-4 text-center text-lg font-semibold">{loadingMessage}</div>
                        <div className="flex justify-center">
                            {progressValue > 0 && (
                                <div className="relative">
                                    <ProgressBarComponent
                                        id="circular-progress"
                                        type="Circular"
                                        height="160px"
                                        width="160px"
                                        trackThickness={15}
                                        progressThickness={15}
                                        cornerRadius="Round"
                                        trackColor="#f3f3f3"
                                        progressColor="#3b3f5c"
                                        animation={{
                                            enable: true,
                                            duration: 2000, // Match this with the total time of the counter animation
                                            delay: 0,
                                        }}
                                        value={progressValue}
                                    >
                                        <Inject services={[ProgressAnnotation]} />
                                    </ProgressBarComponent>
                                    <div className="absolute left-0 right-0 top-0 flex h-full items-center justify-center">
                                        <div className="text-center">
                                            <span className="text-2xl font-bold">{`${displayedProgress}%`}</span>
                                            <div className="text-sm text-gray-500">Complete</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <div className="Main flex h-screen flex-col" id="main-target">
                {/* <div className="flex w-full flex-grow"> */}
                <div className="flex h-auto  w-full">
                    <div className="w-full">
                        <div className="mb-4 items-center justify-between rounded-md border-b bg-white p-4 pb-2  shadow-md md:flex">
                            <div className="grid w-full grid-cols-12 border-b">
                                <div className="col-span-3 mb-2 mt-1 items-center justify-between p-4  pb-2 md:flex">
                                    {/* HEADER FORM (BARU UBAH HAPUS CETAK) */}

                                    <TooltipComponent content="Tampilkan filter data" opensOn="Hover" openDelay={1000} target="#btnFilter">
                                        <TooltipComponent content="Refresh data yang ditampilkan" opensOn="Hover" openDelay={1000} target="#btnRefresh">
                                            <TooltipComponent content="Membuat Pengeluaran Lain (BK) baru" opensOn="Hover" openDelay={1000} target="#btnBaru">
                                                <TooltipComponent content="Edit data Pengeluaran Lain (BK)" opensOn="Hover" openDelay={1000} target="#btnEdit">
                                                    <TooltipComponent content="Hapus data Pengeluaran Lain (BK)" opensOn="Hover" openDelay={1000} target="#btnHapus">
                                                        <TooltipComponent content="Cetak data Pengeluaran Lain (BK)" opensOn="Hover" openDelay={1000} target="#btnCetak">
                                                            <TooltipComponent content="Tampilkan detail Pengeluaran Lain (BK)" opensOn="Hover" openDelay={1000} target="#btnDetail">
                                                                {/* <TooltipComponent content="Persetujuan dokumen" opensOn="Hover" openDelay={1000} target="#btnApproval"> */}
                                                                <div className="flex space-x-2">
                                                                    <div className="relative">
                                                                        <ButtonComponent
                                                                            // className="rounded bg-blue-600 px-4 py-2 text-white"
                                                                            id="btnBaru"
                                                                            cssClass="e-primary e-small"
                                                                            style={styleButton}
                                                                            // disabled={disabledBaru}
                                                                            disabled={userMenu.baru === 'Y' || userid === 'administrator' ? false : true}
                                                                            onClick={showNewRecord}
                                                                            content="Baru"
                                                                        ></ButtonComponent>

                                                                        <ButtonComponent
                                                                            // className="rounded bg-blue-600 px-4 py-2 text-white"
                                                                            id="btnEdit"
                                                                            cssClass="e-primary e-small"
                                                                            style={styleButton}
                                                                            // disabled={disabledEdit}
                                                                            disabled={userMenu.edit === 'Y' || userid === 'administrator' ? false : true}
                                                                            onClick={() => {
                                                                                // showEditRecord('Edit Biasa');

                                                                                showEditRecord();
                                                                            }}
                                                                            content="Ubah"
                                                                        ></ButtonComponent>
                                                                        <ButtonComponent
                                                                            // className="rounded bg-gray-300 px-4 py-2 text-white"
                                                                            content="Filter"
                                                                            id="btnFilter"
                                                                            type="submit"
                                                                            cssClass="e-primary e-small"
                                                                            // style={
                                                                            //     panelVisible
                                                                            //         ? {
                                                                            //               width: '57px',
                                                                            //               height: '28px',
                                                                            //               marginBottom: '0.5em',
                                                                            //               marginTop: '0.5em',
                                                                            //               marginRight: '0.8em',
                                                                            //           }
                                                                            //         : { ...styleButton, color: 'white' }
                                                                            // }
                                                                            // onClick={handleFilterClick}
                                                                            // disabled={panelVisible}
                                                                            style={
                                                                                sidebarVisible
                                                                                    ? { width: '57px', height: '28px', marginBottom: '0.5em', marginTop: '0.5em', marginRight: '0.8em' }
                                                                                    : { ...styleButton, color: 'white' }
                                                                            }
                                                                            onClick={toggleClick}
                                                                            disabled={sidebarVisible}
                                                                        ></ButtonComponent>

                                                                        <ContextMenuComponent
                                                                            // className="rounded bg-blue-600 px-4 py-2 text-white"
                                                                            id="cMenuCetak"
                                                                            ref={(scope) => (cMenuCetak = scope as ContextMenuComponent)}
                                                                            items={menuCetakItems}
                                                                            select={menuCetakSelect}
                                                                            animationSettings={{ duration: 800, effect: 'FadeIn' }}
                                                                        />

                                                                        <ButtonComponent
                                                                            className="rounded bg-blue-600 px-4 py-2 text-white"
                                                                            id="btnCetak"
                                                                            cssClass="e-primary e-small"
                                                                            style={{ ...styleButton, width: 75 + 'px' }}
                                                                            // disabled={disabledCetak}
                                                                            disabled={userMenu.cetak === 'Y' || userid === 'administrator' ? false : true}
                                                                            onClick={btnPrintClick}
                                                                            content="Cetak"
                                                                            iconCss="e-icons e-medium e-chevron-down"
                                                                            iconPosition="Right"
                                                                        ></ButtonComponent>
                                                                    </div>
                                                                </div>

                                                                {/* </TooltipComponent> */}
                                                            </TooltipComponent>
                                                        </TooltipComponent>
                                                    </TooltipComponent>
                                                </TooltipComponent>
                                            </TooltipComponent>
                                        </TooltipComponent>
                                    </TooltipComponent>
                                </div>
                                <div className="col-span-7 mb-2 mt-1 items-center justify-between p-4  pb-2 md:flex">
                                    <div className="flex space-x-2">
                                        <div className="relative">
                                            <div className="container form-input" style={{ border: '2px solid black', marginRight: '1rem', width: '150px', display: 'inline-block' }}>
                                                <DropDownListComponent
                                                    name="cbStatus"
                                                    dataSource={[
                                                        { value: 'Y', text: 'Kontrak' },
                                                        { value: 'N', text: 'Non Kontrak' },
                                                    ]}
                                                    placeholder="--Silahkan Pilih--"
                                                    value={tipeFpb}
                                                    fields={{ text: 'text', value: 'value' }}
                                                    // onChange={(args: any) => handleInputChange(args.target.name, args.value, 'chbStatus')}
                                                    onChange={(args: any) => {
                                                        setTipeFpb(args.value);
                                                    }}
                                                />
                                            </div>
                                            <ButtonComponent
                                                id="btnApproval"
                                                cssClass="e-primary e-small"
                                                style={styleButtonAppoval}
                                                disabled={approvalButtonCabang}
                                                // disabled={fpba2 === 'Y' || userid === 'administrator' ? false : true}
                                                onClick={() => {
                                                    // showEditRecord('Edit Approved');

                                                    handleApproveCabang();
                                                }}
                                                content="Approval Cabang"
                                            ></ButtonComponent>
                                            <ButtonComponent
                                                id="btnUpdateFilePendukung"
                                                cssClass="e-primary e-small"
                                                style={styleButtonAppoval}
                                                disabled={approvalButtonPusat}
                                                onClick={() => {
                                                    // showEditRecord('Edit File Pendukung');
                                                    // setConFPB('Approve_Pusat');
                                                    // setDialogFrmFpb(true);
                                                    handleApprovePusat();
                                                }}
                                                content="Approval Pusat"
                                            ></ButtonComponent>
                                            <ButtonComponent
                                                id="btnBatal"
                                                cssClass="e-primary e-small"
                                                style={styleButtonAppoval}
                                                disabled={false}
                                                content="Pembatalan"
                                                onClick={() => {
                                                    selectDataGrid = dgFpbList.getSelectedRecords();

                                                    if (selectDataGrid.length > 0) {
                                                        setKirimLangsung(selectDataGrid[0]?.kirim_langsung_cabang);
                                                        setIsCabang(false);
                                                        if (selectDataGrid[0]?.status === 'Terbuka' && selectDataGrid[0]?.status_app !== 'Disetujui' && selectDataGrid[0]?.kontrak === 'N') {
                                                            setConFPB('batal fpb');
                                                            setDialogFrmFpb(true);
                                                        } else {
                                                            myAlertGlobal(`Status dok. "Tertutup" atau Status App "Disetujui"  tidak dapat dibatalkan.`, 'main-target');
                                                        }
                                                    } else {
                                                        myAlertGlobal(`Silahkan pilih data terlebih dahulu`, 'main-target');
                                                    }
                                                }}
                                            ></ButtonComponent>
                                            <ButtonComponent
                                                id="btnDetail"
                                                cssClass="e-primary e-small"
                                                style={styleButtonAppoval}
                                                disabled={false}
                                                onClick={() => {
                                                    SetDataDokumen(
                                                        'detailDok',
                                                        stateDokumen.masterKodeDokumen, //stateDokumen[0].masterKodeDokumen,
                                                        stateDokumen.kode_entitas,
                                                        detailListDokumen,
                                                        router,
                                                        setSelectedItem,
                                                        setDetailDok,
                                                        stateDokumen.token,
                                                        jenisTab
                                                    );
                                                }}
                                                content="Detail Dok."
                                            ></ButtonComponent>
                                        </div>
                                    </div>
                                </div>
                                {/* END HEADER Form (BARU UBAH HAPUS CETAK*/}
                                <div className="col-span-2 mb-2 mt-1 items-center justify-between p-4  pb-2 md:flex">
                                    <div className="text-right text-xl font-semibold">Form Pengadaan Barang (FPB)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* </div> */}
                <div className="flex h-auto w-full  ">
                    <div className="w-full ">
                        <div className="mb-4 items-center justify-between rounded-md border-b bg-white p-2 pb-2 shadow-[2px_2px_8px_rgba(0,0,0,0.25)] md:flex">
                            {/* <div id="main-content" style={{ position: 'sticky', overflow: 'hidden' }} className="flex !gap-6 "> */}
                            <div id="main-content" style={{ position: 'sticky', height: 'calc(100vh - 130px)', overflow: 'hidden' }} className="flex h-auto w-full ">
                                <SidebarComponent
                                    id="default-sidebar"
                                    target={'#main-content'}
                                    ref={(Sidebar) => (sidebarObj = Sidebar as SidebarComponent)}
                                    // style={{ background: 'transparent', visibility: 'hidden', marginRight: '0.8em' }}
                                    style={{
                                        background: '#dedede',
                                        marginRight: '2rem',
                                        display: 'block',
                                        visibility: sidebarVisible ? 'visible' : 'hidden',
                                        // maxHeight: `100px`,
                                        overflowY: 'auto',
                                        // borderRight:'2px',
                                    }}
                                    created={onCreate}
                                    //showBackdrop={showBackdrop}
                                    type={type}
                                    // width="315px"
                                    width="315px"
                                    height={200}
                                    mediaQuery={mediaQueryState}
                                    isOpen={true}
                                    open={() => setSidebarVisible(true)}
                                    close={() => setSidebarVisible(false)}
                                >
                                    {/* <div className="panel-filter p-3" style={{ background: '#dedede', width: '100%' }}> */}
                                    <div className="overpanel-filter p-3" style={{ background: '#dedede', width: '100%', height: 'calc(100vh - 130px)' }}>
                                        <div className="flex items-center text-center">
                                            <button
                                                className="absolute right-0 top-0 p-2 text-gray-600 hover:text-gray-900"
                                                //onClick={toggleFilterData}
                                                onClick={closeClick}
                                            >
                                                <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                                            </button>
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
                                            <h5 className="text-lg font-bold ltr:ml-3 rtl:mr-3">Filtering Data</h5>
                                        </div>
                                        <div className="mb-5 mt-3 h-px w-full border-b border-black dark:border-[#1b2e4b]"></div>
                                        <div className="flex flex-col items-center justify-between" id="Candil">
                                            <div id="inputFilter">
                                                <div className="flex">
                                                    <CheckBoxComponent
                                                        label="No. FPB"
                                                        name="chbKode"
                                                        checked={formListDataState.chbKode}
                                                        change={(args: ChangeEventArgsButton) => {
                                                            const value: any = args.checked;
                                                            handleCheckboxChange('chbKode', value);
                                                        }}
                                                        style={{ borderRadius: 3, borderColor: 'gray' }}
                                                    />
                                                </div>
                                                <div className="mt-1 flex justify-between">
                                                    <div className="container form-input">
                                                        <TextBoxComponent
                                                            name="edKode"
                                                            placeholder="No. Dokumen"
                                                            value={formListDataState.edKode === 'all' ? '' : formListDataState.edKode}
                                                            onChange={(args: any) => handleInputChange(args.target.name, args.value, 'chbKode')}
                                                        />
                                                    </div>
                                                </div>
                                                {/* TANGGAL */}
                                                <div className="mt-2 flex justify-between">
                                                    <CheckBoxComponent
                                                        label="Tanggal"
                                                        name="chbTanggal"
                                                        checked={formListDataState.chbTanggal}
                                                        change={(args: ChangeEventArgsButton) => {
                                                            const value: any = args.checked;
                                                            handleCheckboxChange('chbTanggal', value);
                                                        }}
                                                    />
                                                </div>
                                                <div className={`grid grid-cols-1 justify-between gap-1 sm:flex `}>
                                                    <div className="form-input mt-1 flex justify-between">
                                                        <DatePickerComponent
                                                            locale="id"
                                                            name="edTglAwal"
                                                            cssClass="e-custom-style"
                                                            // renderDayCell={onRenderDayCell}
                                                            enableMask={true}
                                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                            showClearButton={false}
                                                            format="dd-MM-yyyy"
                                                            value={moment(formListDataState.edTglAwal).toDate()}
                                                            // onChange={(args: any) => handleInputChange(args.target.name, moment(args.value).format('YYYY-MM-DD'), 'chbTanggal')}
                                                            change={(args: ChangeEventArgsCalendar) => {
                                                                handleInputChange('edTglAwal', moment(args.value).format('YYYY-MM-DD'), 'chbTanggal');
                                                            }}
                                                        >
                                                            <Inject services={[MaskedDateTime]} />
                                                        </DatePickerComponent>
                                                    </div>
                                                    <p className="set-font-11 ml-0.5 mr-0.5 mt-3 flex justify-between">s/d</p>
                                                    <div className="form-input mt-1 flex justify-between">
                                                        <DatePickerComponent
                                                            locale="id"
                                                            name="edTglAkhir"
                                                            cssClass="e-custom-style"
                                                            // renderDayCell={onRenderDayCell}
                                                            enableMask={true}
                                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                            showClearButton={false}
                                                            format="dd-MM-yyyy"
                                                            value={moment(formListDataState.edTglAkhir).toDate()} //{tglAkhir.toDate()}
                                                            // onChange={(args: any) => handleInputChange(args.target.name, moment(args.value).format('YYYY-MM-DD'), 'chbTanggal')}
                                                            change={(args: ChangeEventArgsCalendar) => {
                                                                handleInputChange('edTglAkhir', moment(args.value).format('YYYY-MM-DD'), 'chbTanggal');
                                                            }}
                                                        >
                                                            <Inject services={[MaskedDateTime]} />
                                                        </DatePickerComponent>
                                                    </div>
                                                </div>
                                                {/* TANGGAL BERLAKU */}
                                                <div className="mt-2 flex justify-between">
                                                    <CheckBoxComponent
                                                        label="Tanggal Berlaku"
                                                        name="chbTanggalBerlaku"
                                                        checked={formListDataState.chbTanggalBerlaku}
                                                        change={(args: ChangeEventArgsButton) => {
                                                            const value: any = args.checked;
                                                            handleCheckboxChange('chbTanggalBerlaku', value);
                                                        }}
                                                    />
                                                </div>
                                                <div className={`grid grid-cols-1 justify-between gap-1 sm:flex `}>
                                                    <div className="form-input mt-1 flex justify-between">
                                                        <DatePickerComponent
                                                            locale="id"
                                                            name="edTglAwalBerlaku"
                                                            cssClass="e-custom-style"
                                                            // renderDayCell={onRenderDayCell}
                                                            enableMask={true}
                                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                            showClearButton={false}
                                                            format="dd-MM-yyyy"
                                                            value={moment(formListDataState.edTglAwalBerlaku).toDate()}
                                                            // onChange={(args: any) => handleInputChange(args.target.name, moment(args.value).format('YYYY-MM-DD'), 'chbTanggalBerlaku')}
                                                            change={(args: ChangeEventArgsCalendar) => {
                                                                handleInputChange('edTglAwalBerlaku', moment(args.value).format('YYYY-MM-DD'), 'chbTanggalBerlaku');
                                                            }}
                                                        >
                                                            <Inject services={[MaskedDateTime]} />
                                                        </DatePickerComponent>
                                                    </div>
                                                    <p className="set-font-11 ml-0.5 mr-0.5 mt-3 flex justify-between">s/d</p>
                                                    <div className="form-input mt-1 flex justify-between">
                                                        <DatePickerComponent
                                                            locale="id"
                                                            name="edTglAkhirBerlaku"
                                                            cssClass="e-custom-style"
                                                            // renderDayCell={onRenderDayCell}
                                                            enableMask={true}
                                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                            showClearButton={false}
                                                            format="dd-MM-yyyy"
                                                            value={moment(formListDataState.edTglAkhirBerlaku).toDate()} //{tglAkhir.toDate()}
                                                            // onChange={(args: any) => handleInputChange(args.target.name, moment(args.value).format('YYYY-MM-DD'), 'chbTanggalBerlaku')}
                                                            change={(args: ChangeEventArgsCalendar) => {
                                                                handleInputChange('edTglAkhirBerlaku', moment(args.value).format('YYYY-MM-DD'), 'chbTanggalBerlaku');
                                                            }}
                                                        >
                                                            <Inject services={[MaskedDateTime]} />
                                                        </DatePickerComponent>
                                                    </div>
                                                </div>
                                                {/* TANGGAL KIRIM */}
                                                <div className="mt-2 flex justify-between">
                                                    <CheckBoxComponent
                                                        label="Tanggal Kirim"
                                                        name="chbTanggalKirim"
                                                        checked={formListDataState.chbTanggalKirim}
                                                        change={(args: ChangeEventArgsButton) => {
                                                            const value: any = args.checked;
                                                            handleCheckboxChange('chbTanggalKirim', value);
                                                        }}
                                                    />
                                                </div>
                                                <div className={`grid grid-cols-1 justify-between gap-1 sm:flex `}>
                                                    <div className="form-input mt-1 flex justify-between">
                                                        <DatePickerComponent
                                                            locale="id"
                                                            name="edTglAwalKirim"
                                                            cssClass="e-custom-style"
                                                            // renderDayCell={onRenderDayCell}
                                                            enableMask={true}
                                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                            showClearButton={false}
                                                            format="dd-MM-yyyy"
                                                            value={moment(formListDataState.edTglAwalKirim).toDate()}
                                                            // onChange={(args: any) => handleInputChange(args.target.name, moment(args.value).format('YYYY-MM-DD'), 'chbTanggalKirim')}
                                                            change={(args: ChangeEventArgsCalendar) => {
                                                                handleInputChange('edTglAwalKirim', moment(args.value).format('YYYY-MM-DD'), 'chbTanggalKirim');
                                                            }}
                                                        >
                                                            <Inject services={[MaskedDateTime]} />
                                                        </DatePickerComponent>
                                                    </div>
                                                    <p className="set-font-11 ml-0.5 mr-0.5 mt-3 flex justify-between">s/d</p>
                                                    <div className="form-input mt-1 flex justify-between">
                                                        <DatePickerComponent
                                                            locale="id"
                                                            name="edTglAkhirKirim"
                                                            cssClass="e-custom-style"
                                                            // renderDayCell={onRenderDayCell}
                                                            enableMask={true}
                                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                            showClearButton={false}
                                                            format="dd-MM-yyyy"
                                                            value={moment(formListDataState.edTglAkhirKirim).toDate()} //{tglAkhir.toDate()}
                                                            // onChange={(args: any) => handleInputChange(args.target.name, moment(args.value).format('YYYY-MM-DD'), 'chbTanggalKirim')}
                                                            change={(args: ChangeEventArgsCalendar) => {
                                                                handleInputChange('edTglAkhirKirim', moment(args.value).format('YYYY-MM-DD'), 'chbTanggalKirim');
                                                            }}
                                                        >
                                                            <Inject services={[MaskedDateTime]} />
                                                        </DatePickerComponent>
                                                    </div>
                                                </div>
                                                {/* NAMA SUPPLIER */}
                                                <div className="flex">
                                                    <CheckBoxComponent
                                                        label="Nama Supplier"
                                                        name="chbSupplier"
                                                        checked={formListDataState.chbSupplier}
                                                        change={(args: ChangeEventArgsButton) => {
                                                            const value: any = args.checked;
                                                            handleCheckboxChange('chbSupplier', value);
                                                        }}
                                                        style={{ borderRadius: 3, borderColor: 'gray' }}
                                                    />
                                                </div>
                                                <div className="mt-1 flex justify-between">
                                                    <div className="container form-input">
                                                        <TextBoxComponent
                                                            name="edSupp"
                                                            placeholder="Nama Supplier"
                                                            value={formListDataState.edSupp === 'all' ? '' : formListDataState.edSupp}
                                                            onChange={(args: any) => handleInputChange(args.target.name, args.value, 'chbSupplier')}
                                                        />
                                                    </div>
                                                </div>
                                                {/* STATUS DOKUMEN */}
                                                <div className="mt-2 flex justify-between">
                                                    <CheckBoxComponent
                                                        label="Status Dokumen"
                                                        name="chbStatus"
                                                        checked={formListDataState.chbStatus}
                                                        change={(args: ChangeEventArgsButton) => {
                                                            const value: any = args.checked;
                                                            handleCheckboxChange('chbStatus', value);
                                                        }}
                                                    />
                                                </div>
                                                <div className="mt-1 flex justify-between">
                                                    <div className="container form-input">
                                                        <DropDownListComponent
                                                            name="cbStatus"
                                                            dataSource={['Terbuka', 'Proses', 'Tertutup']}
                                                            placeholder="--Silahkan Pilih--"
                                                            value={formListDataState.cbStatus}
                                                            onChange={(args: any) => handleInputChange(args.target.name, args.value, 'chbStatus')}
                                                        />
                                                    </div>
                                                </div>
                                                {/* STATUS APPROVAL */}
                                                <div className="mt-2 flex justify-between">
                                                    <CheckBoxComponent
                                                        label="Status Approval"
                                                        name="chbStatApproval"
                                                        checked={formListDataState.chbStatApproval}
                                                        change={(args: ChangeEventArgsButton) => {
                                                            const value: any = args.checked;
                                                            handleCheckboxChange('chbStatApproval', value);
                                                        }}
                                                    />
                                                </div>
                                                <div className="mt-1 flex justify-between">
                                                    <div className="container form-input">
                                                        <DropDownListComponent
                                                            name="cbStatApproval"
                                                            dataSource={['Disetujui', 'Ditolak', 'Koreksi', 'Baru']}
                                                            placeholder="--Silahkan Pilih--"
                                                            value={formListDataState.cbStatApproval}
                                                            onChange={(args: any) => handleInputChange(args.target.name, args.value, 'chbStatApproval')}
                                                        />
                                                    </div>
                                                </div>
                                                {/* ENTITAS */}
                                                <div className="flex">
                                                    <CheckBoxComponent
                                                        label="Entitas"
                                                        name="chbEntitas"
                                                        checked={formListDataState.chbEntitas}
                                                        change={(args: ChangeEventArgsButton) => {
                                                            const value: any = args.checked;
                                                            handleCheckboxChange('chbEntitas', value);
                                                        }}
                                                        style={{ borderRadius: 3, borderColor: 'gray' }}
                                                    />
                                                </div>
                                                <div className="mt-1 flex justify-between">
                                                    <div className="container form-input">
                                                        <TextBoxComponent
                                                            name="edEntitas"
                                                            placeholder="~Entitas~"
                                                            value={formListDataState.edEntitas === 'all' ? '' : formListDataState.edEntitas}
                                                            onChange={(args: any) => handleInputChange(args.target.name, args.value, 'chbEntitas')}
                                                        />
                                                    </div>
                                                </div>
                                                {/* PEMBATALAN PESANAN */}
                                                <div className="mt-1 space-y-1">
                                                    <CheckBoxComponent
                                                        label="Pembatalan Pesanan"
                                                        name="chbBatal"
                                                        checked={formListDataState.chbBatal}
                                                        change={(args: ChangeEventArgsButton) => {
                                                            const value: any = args.checked;
                                                            handleCheckboxChange('chbBatal', value);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="mb-2 mt-6 flex justify-center">
                                                <TooltipComponent content="Refresh data yang ditampilkan" opensOn="Hover" openDelay={1000} position="BottomCenter">
                                                    <ButtonComponent
                                                        cssClass="e-primary e-small"
                                                        iconCss="e-icons e-medium e-refresh"
                                                        content="Refresh Data"
                                                        style={{ backgroundColor: '#3b3f5c' }}
                                                        onClick={() => handleRefreshData()}
                                                    />
                                                </TooltipComponent>
                                            </div>
                                        </div>
                                    </div>
                                </SidebarComponent>
                                <div
                                    className="panel w-full border-l-[5px] border-white"
                                    // style={{ background: '#dedede', width: gridWidth, margin: 'auto auto auto' + (sidebarVisible ? ' 315px' : ' 0'), overflowY: 'auto' }}
                                    // style={{ margin: 'auto auto auto' + (sidebarVisible ? ' 315px' : ' 0'), overflowY: 'auto' }}
                                    style={{
                                        width: gridWidth,
                                        background: '#dedede',
                                        margin: '0 auto auto' + (sidebarVisible ? ' 315px' : ' 0'),
                                        // height: '100%', // Changed to 100%
                                        height: 'calc(100vh - 130px)',
                                        overflow: 'auto',
                                    }}
                                >
                                    <div className="panel-data " style={{ width: '100%' }}>
                                        <div className="mb-2  w-full items-center border border-black bg-white" style={{ display: 'inline-block' }}>
                                            <TextBoxComponent
                                                id="cariNoBk"
                                                name="edCariNoBk"
                                                className="cariNoBk"
                                                placeholder="search..."
                                                showClearButton={true}
                                                // value={searchNamaCust}
                                                input={(args: FocusInEventArgs) => {
                                                    const value: any = args.value;
                                                    handleSearch(args.value);
                                                }}
                                            />
                                        </div>
                                        {/* TAB BUAT GRID */}
                                        <Tab.Group>
                                            <Tab.List className="flex space-x-1 overflow-x-auto rounded-xl  p-1">
                                                {tabKategori.map((jenisKategoriTab, index) => (
                                                    <Tab as={Fragment} key={index}>
                                                        {({ selected }) => (
                                                            <button
                                                                className={`px-2.5 py-1.5 text-xs  font-medium focus:outline-none ${
                                                                    selected
                                                                        ? 'rounded-t-md border-b-2 border-blue-400 bg-blue-200/50 text-blue-600'
                                                                        : 'text-gray-900 hover:border-b-2 hover:border-blue-400'
                                                                }`}
                                                                id={`${index}`}
                                                                onClick={() => setJenisTab(jenisKategoriTab.name)}
                                                                disabled={jenisKategoriTab.disabled}
                                                            >
                                                                {jenisKategoriTab.caption}
                                                            </button>
                                                        )}
                                                    </Tab>
                                                ))}
                                            </Tab.List>
                                            <Tab.Panels>
                                                {tabKategori.map((item) => (
                                                    <Tab.Panel key={item.name}>
                                                        <div className="overflow-hidden" style={{ background: '#dedede', width: '100%' }}>
                                                            <GridComponent
                                                                id="gridListData"
                                                                locale="id"
                                                                // dataSource={recordsDataDetailList}
                                                                // toolbar={['Search']}
                                                                ref={(g: any) => (dgFpbList = g)}
                                                                // created={created}
                                                                allowExcelExport={true}
                                                                loadingIndicator={{ indicatorType: 'Spinner' }}
                                                                excelExportComplete={ExportComplete}
                                                                allowPdfExport={true}
                                                                pdfExportComplete={ExportComplete}
                                                                editSettings={{ allowDeleting: true }}
                                                                selectionSettings={{
                                                                    mode: 'Row',
                                                                    type: 'Single',
                                                                }}
                                                                allowPaging={true}
                                                                allowSorting={true}
                                                                allowFiltering={false}
                                                                allowResizing={true}
                                                                autoFit={true}
                                                                allowReordering={true}
                                                                pageSettings={{
                                                                    pageSize: 25,
                                                                    pageCount: 5,
                                                                    pageSizes: ['25', '50', '100', 'All'],
                                                                }}
                                                                rowHeight={22}
                                                                width={'100%'}
                                                                height={545}
                                                                gridLines={'Both'}
                                                                queryCellInfo={QueryCellInfoListData}
                                                                recordDoubleClick={async (args: any) => {
                                                                    if (userMenu.edit === 'Y' || userid === 'administrator') {
                                                                        if (dgFpbList) {
                                                                            const rowIndex: number = args.row.rowIndex;
                                                                            dgFpbList.selectRow(rowIndex);
                                                                            await showEditRecord();
                                                                        }
                                                                    }
                                                                }}
                                                                rowSelected={async (args) => {
                                                                    // HandleRowSelected(args, setMasterKodeDokumen);
                                                                    setSelectedRow(true);

                                                                    setDetailListDokumen({
                                                                        ...detailListDokumen,
                                                                        no_dokumen: args.data?.no_fpb,
                                                                        tgl_dokumen: moment(args.data?.tgl_fpb).format('YYYY-MM-DD'),
                                                                    });
                                                                    setMasterKodeDokumen(args.data?.kode_fpb);
                                                                    ListDetailDok(args.data?.kode_fpb, jenisTab, stateDokumen.kode_entitas, setDetailDok, stateDokumen.token);
                                                                }}
                                                                // rowSelecting={(args) => rowSelectingListData(args, setDetailListPraBkk, kode_entitas, setDetailDok, stateDokumen?.token, jenisTab)}
                                                                allowTextWrap={true}
                                                                textWrapSettings={{ wrapMode: 'Header' }}
                                                            >
                                                                <ColumnsDirective>
                                                                    <ColumnDirective
                                                                        field="kode_entitas"
                                                                        headerText="Entitas"
                                                                        headerTextAlign="Center"
                                                                        textAlign="Center"
                                                                        //autoFit
                                                                        width="50"
                                                                        clipMode="EllipsisWithTooltip" /*freeze="Left"*/
                                                                    />
                                                                    <ColumnDirective
                                                                        field="no_fpb"
                                                                        headerText="No. FPB"
                                                                        headerTextAlign="Center"
                                                                        textAlign="Center"
                                                                        //autoFit
                                                                        width="150"
                                                                        clipMode="EllipsisWithTooltip" /*freeze="Left"*/
                                                                    />
                                                                    <ColumnDirective
                                                                        field="tgl_fpb"
                                                                        headerText="Tanggal"
                                                                        headerTextAlign="Center"
                                                                        textAlign="Center"
                                                                        //autoFit
                                                                        width="80"
                                                                        clipMode="EllipsisWithTooltip"
                                                                        type="date"
                                                                        format={formatDate}
                                                                    />
                                                                    <ColumnDirective
                                                                        field="tgl_berlaku"
                                                                        headerText="Tgl. Berlaku"
                                                                        headerTextAlign="Center"
                                                                        textAlign="Center"
                                                                        //autoFit
                                                                        width="80"
                                                                        clipMode="EllipsisWithTooltip"
                                                                        type="date"
                                                                        format={formatDate}
                                                                    />
                                                                    <ColumnDirective
                                                                        field="tgl_kirim"
                                                                        headerText="Est. Pengiriman"
                                                                        headerTextAlign="Center"
                                                                        textAlign="Center"
                                                                        //autoFit
                                                                        width="80"
                                                                        clipMode="EllipsisWithTooltip"
                                                                        type="date"
                                                                        format={formatDate}
                                                                    />
                                                                    <ColumnDirective
                                                                        field="nama_relasi"
                                                                        headerText="Supplier"
                                                                        headerTextAlign="Center"
                                                                        textAlign="Left"
                                                                        //autoFit
                                                                        width="150"
                                                                        clipMode="EllipsisWithTooltip"
                                                                    />

                                                                    <ColumnDirective
                                                                        field="nama_termin"
                                                                        headerText="Termin"
                                                                        headerTextAlign="Center"
                                                                        textAlign="Center"
                                                                        //autoFit
                                                                        width="50"
                                                                        clipMode="EllipsisWithTooltip"
                                                                    />

                                                                    <ColumnDirective
                                                                        field="netto_mu"
                                                                        headerText="Netto (MU)"
                                                                        format={formatFloat}
                                                                        headerTextAlign="Center"
                                                                        textAlign="Right"
                                                                        //autoFit
                                                                        width="110"
                                                                        clipMode="EllipsisWithTooltip"
                                                                    />

                                                                    <ColumnDirective
                                                                        field="total_berat"
                                                                        headerText="Berat (Kg)"
                                                                        format={formatFloat}
                                                                        headerTextAlign="Center"
                                                                        textAlign="Right"
                                                                        //autoFit
                                                                        width="70"
                                                                        clipMode="EllipsisWithTooltip"
                                                                    />

                                                                    <ColumnDirective
                                                                        field="status"
                                                                        headerText="Status Dok"
                                                                        // format={formatFloat}
                                                                        headerTextAlign="Center"
                                                                        textAlign="Right"
                                                                        //autoFit
                                                                        width="80"
                                                                        clipMode="EllipsisWithTooltip"
                                                                    />
                                                                    <ColumnDirective
                                                                        field="kirim_langsung_cabang"
                                                                        headerText="Kirim Langsung"
                                                                        // format={formatFloat}
                                                                        headerTextAlign="Center"
                                                                        textAlign="Center"
                                                                        //autoFit
                                                                        width="70"
                                                                        clipMode="EllipsisWithTooltip"
                                                                    />

                                                                    <ColumnDirective
                                                                        field="kontrak"
                                                                        headerText="Kontrak"
                                                                        headerTextAlign="Center"
                                                                        textAlign="Center"
                                                                        //autoFit
                                                                        width="50"
                                                                        clipMode="EllipsisWithTooltip" /*freeze="Left"*/
                                                                    />

                                                                    <ColumnDirective
                                                                        field="status_app2"
                                                                        headerText="App Cabang"
                                                                        // format={formatFloat}
                                                                        headerTextAlign="Center"
                                                                        textAlign="Center"
                                                                        //autoFit
                                                                        width="80"
                                                                        clipMode="EllipsisWithTooltip"
                                                                    />
                                                                    <ColumnDirective
                                                                        field="status_app"
                                                                        headerText="App Pusat"
                                                                        // format={formatFloat}
                                                                        headerTextAlign="Center"
                                                                        textAlign="Center"
                                                                        //autoFit
                                                                        width="80"
                                                                        clipMode="EllipsisWithTooltip"
                                                                    />
                                                                    <ColumnDirective
                                                                        field="status_export"
                                                                        headerText="Status Export"
                                                                        // format={formatFloat}
                                                                        headerTextAlign="Center"
                                                                        textAlign="Center"
                                                                        //autoFit
                                                                        width="60"
                                                                        clipMode="EllipsisWithTooltip"
                                                                    />
                                                                </ColumnsDirective>

                                                                <Inject services={[Page, Selection, Edit, Toolbar, Sort, Group, Filter, Resize, Reorder, ExcelExport, PdfExport]} />
                                                            </GridComponent>
                                                        </div>
                                                    </Tab.Panel>
                                                ))}
                                            </Tab.Panels>
                                        </Tab.Group>
                                        {/* </TooltipComponent> */}
                                        {/*============ Tampilkan popup menu untuk print dan simpan ke file ================*/}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {selectedItem && (
                    <Draggable>
                        <div className={`${styles.modalDetailDragable}`} style={modalPosition}>
                            <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                                <div style={{ marginBottom: 21 }}>
                                    <span style={{ fontSize: 18, fontWeight: 500 }}>
                                        Detail Form Pemesanan Barang : {detailListDokumen.no_dokumen} - {moment(detailListDokumen.tgl_dokumen).format('DD-MM-YYYY')}
                                    </span>
                                </div>
                                <GridComponent dataSource={detailDok} height={200} width={'100%'} gridLines={'Both'} allowSorting={true} ref={(g) => (dgDetailDok = g)}>
                                    <ColumnsDirective>
                                        <ColumnDirective field="no_item" headerText="No. Barang" width="75" textAlign="Center" headerTextAlign="Center" />
                                        <ColumnDirective field="diskripsi" headerText="Nama Barang" width="150" textAlign="Left" headerTextAlign="Center" />
                                        <ColumnDirective field="satuan" headerText="Satuan" width="50" textAlign="Right" headerTextAlign="Center" />
                                        <ColumnDirective field="qty" format="N2" headerText="Kuantitas" width="100" textAlign="Right" headerTextAlign="Center" />
                                        <ColumnDirective field="sisa" format="N2" headerText="Outstanding" width="100" textAlign="Right" headerTextAlign="Center" />
                                        <ColumnDirective field="berat" format="N2" headerText="Berat" width="80" textAlign="Right" headerTextAlign="Center" />
                                        <ColumnDirective field="kode_mu" format="N2" headerText="MU" width="50" textAlign="Right" headerTextAlign="Center" />
                                        <ColumnDirective field="harga_mu" format="N2" headerText="Harga" width="100" textAlign="Right" headerTextAlign="Center" />
                                        <ColumnDirective field="diskon" headerText="Diskon" width="125" textAlign="Right" headerTextAlign="Center" />
                                        <ColumnDirective field="potongan_mu" format="N2" headerText="Potongan" width="100" textAlign="Right" headerTextAlign="Center" />
                                        <ColumnDirective field="pajak_mu" format="N2" headerText="Pajak" width="100" textAlign="Right" headerTextAlign="Center" />
                                        <ColumnDirective field="jumlah_mu" format="N2" headerText="Jumlah" width="100" textAlign="Right" headerTextAlign="Center" />
                                    </ColumnsDirective>
                                    <Inject services={[Page, Sort, Filter, Group]} />
                                </GridComponent>
                            </div>
                            <button
                                className={`${styles.closeButtonDetailDragable}`}
                                onClick={() => {
                                    closeModal();
                                }}
                            >
                                <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                            </button>
                        </div>
                    </Draggable>
                )}

                {modalJenisTransaksi && (
                    <DialogComponent
                        id="dialogJenisTransaksi"
                        name="dialogJenisTransaksi"
                        className="dialogJenisTransaksi"
                        target="#main-target"
                        header="Jenis Pengiriman"
                        visible={modalJenisTransaksi}
                        isModal={true}
                        animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                        resizeHandles={['All']}
                        allowDragging={true}
                        showCloseIcon={true}
                        width="17%" //"70%"
                        height="24%"
                        position={{ X: 'center', Y: 350 }}
                        style={{ position: 'fixed' }}
                        close={() => {
                            // setJenisTransaksi('1');
                            setModalJenisTransaksi(false);
                        }}
                    >
                        <div>
                            <span style={{ fontWeight: 'bold', fontSize: 14, padding: 10 }}>[ Jenis Transaksi ]</span>
                        </div>
                        <hr style={{ marginBottom: 5 }}></hr>
                        <div style={{ padding: 10 }} className="flex items-center">
                            <RadioButtonComponent
                                id="1"
                                label="1. Kirim Gudang Cabang(Kirim Cabang)"
                                name="size"
                                checked={jenisTransaksi === '1'}
                                change={async () => await changeModalJenisTransaksi('1')}
                                cssClass="e-small"
                            />
                        </div>
                        <div className="flex items-center" style={{ padding: 10, marginTop: -5 }}>
                            <RadioButtonComponent
                                id="2"
                                label="2. Kirim Customer langsung (Kirim Langsung)"
                                name="size"
                                checked={jenisTransaksi === '2'}
                                change={async () => await changeModalJenisTransaksi('2')}
                                cssClass="e-small"
                            />
                        </div>

                        <div className="mb-5 ml-2 mr-2 mt-4 flex items-center justify-between">
                            <ButtonComponent
                                //
                                cssClass="e-secondary e-small"
                                style={{ width: '45%' }}
                                onClick={() => handleDialogJenisPengiriman(jenisTransaksi)}
                            >
                                OK
                            </ButtonComponent>
                            <ButtonComponent
                                cssClass="e-secondary e-small"
                                style={{ width: '45%' }}
                                onClick={() => {
                                    changeModalJenisTransaksi('1');
                                    setModalJenisTransaksi(false);
                                }}
                            >
                                Batal
                            </ButtonComponent>
                        </div>
                    </DialogComponent>
                )}
            </div>
            {showReportDlgFpbCabang && (
                <ReportDlgCabang
                    stateDokumen={stateDokumen}
                    isOpen={showReportDlgFpbCabang}
                    onClose={() => {
                        setShowReportDlgFpbCabang(false);
                    }}
                    onBatal={() => {
                        setShowReportDlgFpbCabang(false);
                    }}
                    target={'main-target'}
                    objekParameter={(objekParameter: any) => handleObjekParameter(objekParameter)}
                />
            )}
            {dialogFrmFpb && (
                <FrmFpb
                    stateDokumen={stateDokumen}
                    isOpen={dialogFrmFpb}
                    onClose={async () => {
                        // console.log('onClose');
                        setDialogFrmFpb(false);

                        if (dgFpbList) {
                            handleRefreshData();
                        }
                    }}
                    onRefresh={handleRefreshData}
                />
            )}
        </div>
    );
};

export default FpbList;
