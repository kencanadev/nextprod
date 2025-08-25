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

// import classNames from 'classnames';

const FpbList = () => {
    const router = useRouter();
    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';
    interface UserMenuState {
        baru: any;
        edit: any;
        hapus: any;
        cetak: any;
    }
    let dgFpbList: Grid | any;
    let dgDetailDok: Grid | any;
    let disabledCetak = false;
    let disabledBaru = false;
    let disabledEdit = false;
    let disabledHapus = false;
    let selectDataGrid: any[] = [];
    // let diabledbtnAppCabang: boolean;
    // let diabledbtnAppPusat: boolean;
    let cMenuCetak: ContextMenuComponent;

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

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

    const styleButton = { width: 57 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#3b3f5c' };
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
    const [userMenu, setUserMenu] = useState<UserMenuState>({ baru: '', edit: '', hapus: '', cetak: '' });

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
    };

    const paramList = {
        entitas: stateDokumen.kode_entitas,
        param1: formListDataState.chbKode ? formListDataState.edKode : 'all',
        param2: formListDataState.chbTanggal ? formListDataState.edTglAwal : 'all',
        param3: formListDataState.chbTanggal ? moment(formListDataState.edTglAkhir).format('YYYY-MM-DD') : 'all',
        param4: formListDataState.chbTanggalBerlaku ? formListDataState.edTglAwalBerlaku : 'all',
        param5: formListDataState.chbTanggalBerlaku ? moment(formListDataState.edTglAkhirBerlaku).format('YYYY-MM-DD') : 'all',
        param6: formListDataState.chbTanggalKirim ? formListDataState.edTglAwalKirim : 'all',
        param7: formListDataState.chbTanggalKirim ? moment(formListDataState.edTglAkhirKirim).format('YYYY-MM-DD') : 'all',
        param8: formListDataState.chbSupplier ? formListDataState.edSupp : 'all',
        param9: formListDataState.chbStatus ? formListDataState.cbStatus : 'all',
        param10: formListDataState.chbStatApproval ? formListDataState.cbStatApproval : 'all',
        param11: formListDataState.chbEntitas ? formListDataState.edEntitas : 'all',
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

    const handleRefreshData = async () => {
        try {
            await FetchDataListFpb(paramList, dgFpbList, stateDokumen.token);
        } catch (error) {
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
        // console.log(value);
    };

    const handleDialogJenisPengiriman = async (jenis: any) => {
        // console.log(jenis);
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
            // console.log(tipeFpb);
            setModalJenisTransaksi(true);
        } else {
            // console.log('kontrak');
            setDialogFrmFpb(true);
            setIsCabang(true);
        }
    };

    useEffect(() => {
        const tanggalSekarang = moment();
        // Menentukan tanggal awal bulan
        const tanggalAwalBulan = tanggalSekarang.startOf('month');
        // Menentukan tanggal akhir bulan dengan moment.js
        const tanggalHariIni = moment(new Date()).format('YYYY-MM-DD');
        const tanggalAkhirBulan = moment(tanggalAwalBulan.endOf('month')).format('YYYY-MM-DD');
        const kode_menu = '30800'; // kode menu PO
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

                if (responseApp?.fpba1 === 'Y' || responseApp?.kode_user === 'ADMIN') {
                    setApprovalButtonCabang(false);
                } else {
                    setApprovalButtonCabang(true);
                }
                if (responseApp?.fpba2 === 'Y' || responseApp?.kode_user === 'ADMIN') {
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
            // console.log('selectDataGrid[0]?.kontrak ', selectDataGrid[0]?.kontrak);
            if ((selectDataGrid[0]?.status === 'Terbuka' && selectDataGrid[0]?.approval2 === '') || selectDataGrid[0]?.status === 'C') {
                setKirimLangsung(selectDataGrid[0]?.kirim_langsung_cabang);
                setIsCabang(false);
                setConFPB('fpb');
                setMasterDataState('EDIT');
                setDialogFrmFpb(true);
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
        // console.log(selectDataGrid.length);
        if (selectDataGrid.length > 0) {
            setKirimLangsung(selectDataGrid[0]?.kirim_langsung_cabang);
            setIsCabang(false);
            if (selectDataGrid[0]?.status === 'Terbuka' && selectDataGrid[0]?.status_app === 'Baru') {
                setConFPB('Approve_Cabang');
                setDialogFrmFpb(true);
            } else {
                myAlertGlobal(`Status approval Cabang ${selectDataGrid[0]?.status_app} tidak dapat dikoreksi`, 'main-target');
            }
        } else {
            myAlertGlobal(`Silahkan pilih data terlebih dahulu`, 'main-target');
        }
    };

    const handleApprovePusat = () => {
        selectDataGrid = dgFpbList.getSelectedRecords();
        // console.log(selectDataGrid.length);
        if (selectDataGrid.length > 0) {
            setKirimLangsung(selectDataGrid[0]?.kirim_langsung_cabang);
            setIsCabang(false);
            if (selectDataGrid[0]?.status === 'Terbuka' && selectDataGrid[0]?.status_app2 === 'Disetujui' && selectDataGrid[0]?.kontrak === 'N') {
                setConFPB('Approve_Pusat');
                setDialogFrmFpb(true);
            } else if (selectDataGrid[0]?.kontrak === 'Y') {
                myAlertGlobal(`Approval untuk kontrak hanya bisa dilakukan di KPB !!`, 'main-target');
            } else {
                myAlertGlobal(`Status approval Cabang ${selectDataGrid[0]?.status_app2} tidak dapat diapprove`, 'main-target');
            }
        } else {
            myAlertGlobal(`Silahkan pilih data terlebih dahulu`, 'main-target');
        }
    };

    const QueryCellInfoListData = (args: any) => {
        // console.log('args.column?.field ', args.column?.field);
        // if (args.column?.field === 'status_app2') {
        if (getValue('status_app2', args.data) === 'Disetujui' && getValue('status_app', args.data) === 'Disetujui') {
            args.cell.style.color = 'green';
            // args.cell.style.backgroundColor = '#FDF3CC';
        } else if (getValue('status_app2', args.data) === 'Disetujui' && getValue('status_app', args.data) === 'Baru') {
            args.cell.style.color = 'blue';
            // args.cell.style.backgroundColor = '#FDF3CC';
        } else if (getValue('status', args.data) == 'C') {
            args.cell.style.color = '#000080FF';
            // args.cell.style.backgroundColor = '#FDF3CC';
        }
        // }
        if (args.column?.field === 'status_batal') {
            if (getValue('statstatus_batalus_app', args.data) == 'Y') {
                args.cell.style.color = 'maroon';
            }
        }
    };

    return (
        <>
            <div className="Main" id="main-target">
                <div>
                    {' '}
                    {/* {showLoader && contentLoader()} */}
                    {/* HEADER MENU BARU */}
                    <div className="flex">
                        <div className="w-[19%]">
                            <TooltipComponent content="Tampilkan filter data" opensOn="Hover" openDelay={1000} target="#btnFilter">
                                <TooltipComponent content="Refresh data yang ditampilkan" opensOn="Hover" openDelay={1000} target="#btnRefresh">
                                    <TooltipComponent content="Membuat memo kredit baru" opensOn="Hover" openDelay={1000} target="#btnBaru">
                                        <TooltipComponent content="Edit data memo kredit" opensOn="Hover" openDelay={1000} target="#btnEdit">
                                            <TooltipComponent content="Hapus data memo kredit" opensOn="Hover" openDelay={1000} target="#btnHapus">
                                                <TooltipComponent content="Cetak data memo kredit" opensOn="Hover" openDelay={1000} target="#btnCetak">
                                                    <TooltipComponent content="Tampilkan detail memo kredit" opensOn="Hover" openDelay={1000} target="#btnDetail">
                                                        <ButtonComponent
                                                            id="btnBaru"
                                                            cssClass="e-primary e-small"
                                                            style={styleButton}
                                                            disabled={disabledBaru}
                                                            onClick={showNewRecord}
                                                            content="Baru"
                                                        ></ButtonComponent>

                                                        <ButtonComponent
                                                            id="btnEdit"
                                                            cssClass="e-primary e-small"
                                                            style={styleButton}
                                                            disabled={disabledEdit}
                                                            onClick={() => {
                                                                // showEditRecord('Edit Biasa');
                                                                // console.log(tipeFpb);
                                                                showEditRecord();
                                                            }}
                                                            content="Ubah"
                                                        ></ButtonComponent>
                                                        <ButtonComponent
                                                            content="Filter"
                                                            id="btnFilter"
                                                            type="submit"
                                                            cssClass="e-primary e-small"
                                                            style={
                                                                panelVisible
                                                                    ? {
                                                                          width: '57px',
                                                                          height: '28px',
                                                                          marginBottom: '0.5em',
                                                                          marginTop: '0.5em',
                                                                          marginRight: '0.8em',
                                                                      }
                                                                    : { ...styleButton, color: 'white' }
                                                            }
                                                            onClick={handleFilterClick}
                                                            disabled={panelVisible}
                                                        ></ButtonComponent>

                                                        {/* <ButtonComponent
                                                                id="btnHapus"
                                                                cssClass="e-primary e-small"
                                                                style={styleButton}
                                                                disabled={disabledHapus}
                                                                // onCslick={showDeleteRecord}
                                                                content="Hapus"
                                                            ></ButtonComponent> */}

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
                                                            style={{ ...styleButton, width: 75 + 'px' }}
                                                            disabled={disabledCetak}
                                                            onClick={btnPrintClick}
                                                            content="Cetak"
                                                            iconCss="e-icons e-medium e-chevron-down"
                                                            iconPosition="Right"
                                                        ></ButtonComponent>
                                                    </TooltipComponent>
                                                </TooltipComponent>
                                            </TooltipComponent>
                                        </TooltipComponent>
                                    </TooltipComponent>
                                </TooltipComponent>
                            </TooltipComponent>
                        </div>
                        <div className="ml-1 flex w-[81%] justify-between">
                            <div className="flex" style={{ minHeight: '40px', marginTop: '-3px', marginBottom: '11px' }}>
                                <div className="form-input ml-3 mr-1" style={{ width: '200px', display: 'inline-block' }}>
                                    <TextBoxComponent
                                        id="cariNoBk"
                                        name="edCariNoBk"
                                        className="cariNoBk"
                                        placeholder="<Pencarian Data List>"
                                        showClearButton={true}
                                        // value={searchNamaCust}
                                        input={(args: FocusInEventArgs) => {
                                            const value: any = args.value;
                                            handleSearch(args.value);
                                        }}
                                    />
                                </div>

                                <div className="container form-input" style={{ width: '200px', display: 'inline-block' }}>
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
                            </div>

                            <div className="flex justify-end">
                                <span className="mt-1" style={{ fontSize: '20px', fontFamily: 'Times New Roman' }}>
                                    Form Pengadaan Barang (FPB)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative flex h-full gap-3 sm:h-[calc(100vh_-_100px)]">
                    {panelVisible && (
                        <div
                            className={`panel absolute z-10 hidden h-full w-[300px] max-w-full flex-none space-y-4 p-4 dark:border-[#191e3a] xl:relative xl:block xl:h-auto ltr:rounded-r-none ltr:xl:rounded-r-md rtl:rounded-l-none rtl:xl:rounded-l-md ${
                                isShowTaskMenu && '!block'
                            }`}
                            style={{ background: '#dedede' }}
                        >
                            <div className="flex h-full flex-col overflow-auto">
                                <div className="pb-5">
                                    <div className="flex items-center text-center">
                                        <button className="absolute right-0 top-0 p-2 text-gray-600 hover:text-gray-900" onClick={handleTogglePanel}>
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
                                </div>
                                <div className="mb-5 h-px w-full border-b border-black dark:border-[#1b2e4b]"></div>
                                {/* KOMPONEN FILTER */}
                                <PerfectScrollbar className="growltr:-mr3.5 ltr:pr3 relative mb-5 h-full rtl:-ml-3.5 rtl:pl-3 ">
                                    <div className="flex h-full flex-col gap-2 overflow-auto">
                                        <div id="inputFilter">
                                            {/* NO FPB */}
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
                                                        renderDayCell={onRenderDayCell}
                                                        enableMask={true}
                                                        maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                        showClearButton={false}
                                                        format="dd-MM-yyyy"
                                                        value={moment(formListDataState.edTglAwal).toDate()}
                                                        // onChange={(args: any) => handleInputChange(args.target.name, moment(args.value).format('YYYY-MM-DD'), 'chbTanggal')}
                                                        change={(args: ChangeEventArgsCalendar) => {
                                                            // console.log(args.value);
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
                                                        renderDayCell={onRenderDayCell}
                                                        enableMask={true}
                                                        maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                        showClearButton={false}
                                                        format="dd-MM-yyyy"
                                                        value={moment(formListDataState.edTglAkhir).toDate()} //{tglAkhir.toDate()}
                                                        // onChange={(args: any) => handleInputChange(args.target.name, moment(args.value).format('YYYY-MM-DD'), 'chbTanggal')}
                                                        change={(args: ChangeEventArgsCalendar) => {
                                                            // console.log(args.value);
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
                                                        renderDayCell={onRenderDayCell}
                                                        enableMask={true}
                                                        maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                        showClearButton={false}
                                                        format="dd-MM-yyyy"
                                                        value={moment(formListDataState.edTglAwalBerlaku).toDate()}
                                                        // onChange={(args: any) => handleInputChange(args.target.name, moment(args.value).format('YYYY-MM-DD'), 'chbTanggalBerlaku')}
                                                        change={(args: ChangeEventArgsCalendar) => {
                                                            // console.log(args.value);
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
                                                        renderDayCell={onRenderDayCell}
                                                        enableMask={true}
                                                        maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                        showClearButton={false}
                                                        format="dd-MM-yyyy"
                                                        value={moment(formListDataState.edTglAkhirBerlaku).toDate()} //{tglAkhir.toDate()}
                                                        // onChange={(args: any) => handleInputChange(args.target.name, moment(args.value).format('YYYY-MM-DD'), 'chbTanggalBerlaku')}
                                                        change={(args: ChangeEventArgsCalendar) => {
                                                            // console.log(args.value);
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
                                                        renderDayCell={onRenderDayCell}
                                                        enableMask={true}
                                                        maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                        showClearButton={false}
                                                        format="dd-MM-yyyy"
                                                        value={moment(formListDataState.edTglAwalKirim).toDate()}
                                                        // onChange={(args: any) => handleInputChange(args.target.name, moment(args.value).format('YYYY-MM-DD'), 'chbTanggalKirim')}
                                                        change={(args: ChangeEventArgsCalendar) => {
                                                            // console.log(args.value);
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
                                                        renderDayCell={onRenderDayCell}
                                                        enableMask={true}
                                                        maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                        showClearButton={false}
                                                        format="dd-MM-yyyy"
                                                        value={moment(formListDataState.edTglAkhirKirim).toDate()} //{tglAkhir.toDate()}
                                                        // onChange={(args: any) => handleInputChange(args.target.name, moment(args.value).format('YYYY-MM-DD'), 'chbTanggalKirim')}
                                                        change={(args: ChangeEventArgsCalendar) => {
                                                            // console.log(args.value);
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
                                                        name="edsupp"
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
                                    </div>
                                </PerfectScrollbar>
                                {/* TOMBOL REFRESH DATA BAWAH */}
                                <div className="mt-6 flex justify-center">
                                    <TooltipComponent content="Refresh data yang ditampilkan" opensOn="Hover" openDelay={1000} position="BottomCenter">
                                        <ButtonComponent
                                            cssClass="e-primary e-small"
                                            iconCss="e-icons e-medium e-refresh"
                                            content="Refresh Data"
                                            style={{ backgroundColor: '#3b3f5c', marginTop: '15px' }}
                                            onClick={() => handleRefreshData()}
                                        />
                                    </TooltipComponent>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BEGIN BUTTON APPROVAL*/}
                    <div
                        className={`overlay absolute z-[5] hidden h-full w-full rounded-md bg-black/60 ${isShowTaskMenu && '!block xl:!hidden'}`}
                        onClick={() => setIsShowTaskMenu(!isShowTaskMenu)}
                    ></div>

                    <div className="h-full flex-1 overflow-auto">
                        <div className="flex items-center ltr:mr-3 rtl:ml-3">
                            <button type="button" className="block hover:text-primary xl:hidden ltr:mr-3 rtl:ml-3" onClick={() => setIsShowTaskMenu(!isShowTaskMenu)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 7L4 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path opacity="0.5" d="M20 12L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M20 17L4 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>
                        {/*  */}
                        <div
                            className={`panel bg-white-200/50 absolute z-10 mb-1 hidden h-auto w-[300px] max-w-full flex-none p-4 dark:border-[#191e3a] xl:relative xl:block xl:h-auto ltr:rounded-r-none ltr:xl:rounded-r-md rtl:rounded-l-none rtl:xl:rounded-l-md`}
                            style={{ background: '#dedede', margin: panelVisible ? '' : 'auto auto auto ', overflowY: 'auto', width: '100%' }}
                        >
                            <div className="flex items-center text-center">
                                <button className="absolute right-0 top-0 p-2 text-gray-600 hover:text-gray-900" onClick={handleTogglePanel}>
                                    <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                                </button>

                                <ButtonComponent
                                    id="btnApproval"
                                    cssClass="e-primary e-small"
                                    style={styleButtonAppoval}
                                    disabled={approvalButtonCabang}
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
                                        // console.log(stateDokumen.masterKodeDokumen);

                                        selectDataGrid = dgFpbList.getSelectedRecords();
                                        // console.log(selectDataGrid.length);
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
                                        // console.log(stateDokumen.masterKodeDokumen);
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

                        {/* END BUTTON APPROVAL */}
                        {/* BEGIN PANEL GRID */}
                        <div className="panel h-full flex-1 " style={{ background: '#dedede', margin: panelVisible ? '' : 'auto auto auto ', overflowY: 'auto' }}>
                            <div className="panel-data" style={{ width: '100%' }}>
                                {/* TAB BUAT GRID */}
                                <Tab.Group>
                                    <Tab.List className="flex space-x-1 overflow-x-auto rounded-xl  p-1">
                                        {tabKategori.map((jenisKategoriTab, index) => (
                                            // <Tab
                                            //     key={index}
                                            //     as={Fragment}
                                            //     className={({ selected }: any) =>
                                            //         classNames(
                                            //             'px-2.5 py-1.5 text-xs  font-medium focus:outline-none',
                                            //             selected ? 'rounded-t-md border-b-2 border-blue-400 bg-blue-200/50 text-blue-600' : ' text-gray-900 hover:border-b-2 hover:border-blue-400'
                                            //         )
                                            //     }

                                            //     disabled={jenisKategoriTab.disabled}
                                            // >
                                            //     <button className="whitespace-nowrap " id={`${index}`} onClick={() => setJenisTab(jenisKategoriTab.name)}>
                                            //         {jenisKategoriTab.caption}
                                            //     </button>
                                            // </Tab>

                                            <Tab as={Fragment} key={index}>
                                                {({ selected }) => (
                                                    <button
                                                        className={`px-2.5 py-1.5 text-xs  font-medium focus:outline-none ${
                                                            selected ? 'rounded-t-md border-b-2 border-blue-400 bg-blue-200/50 text-blue-600' : 'text-gray-900 hover:border-b-2 hover:border-blue-400'
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
                                        {/*  */}
                                        {tabKategori.map((item) => (
                                            <Tab.Panel key={item.name}>
                                                <div className="overflow-hidden" style={{ background: '#dedede', width: '100%' }}>
                                                    {/*  */}
                                                    <GridComponent
                                                        id="gridListData"
                                                        locale="id"
                                                        ref={(g) => (dgFpbList = g)}
                                                        allowExcelExport={true}
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
                                                        // loadingIndicator={{ indicatorType: 'Shimmer' }}
                                                        queryCellInfo={QueryCellInfoListData}
                                                        // rowDataBound={rowDataBoundListData}
                                                        // dataBound={() => {
                                                        //     if (dgFpbList) {
                                                        //         dgFpbList.selectRow(rowIdxListData.current);
                                                        //     }
                                                        // }}
                                                        recordDoubleClick={async (args: any) => {
                                                            if (dgFpbList) {
                                                                const rowIndex: number = args.row.rowIndex;
                                                                dgFpbList.selectRow(rowIndex);
                                                                await showEditRecord();
                                                            }
                                                        }}
                                                        rowSelected={async (args) => {
                                                            // HandleRowSelected(args, setMasterKodeDokumen);
                                                            // console.log(args.data?.kode_fpb);
                                                            setDetailListDokumen({
                                                                ...detailListDokumen,
                                                                no_dokumen: args.data?.no_fpb,
                                                                tgl_dokumen: moment(args.data?.tgl_fpb).format('YYYY-MM-DD'),
                                                            });
                                                            setMasterKodeDokumen(args.data?.kode_fpb);
                                                            ListDetailDok(args.data?.kode_fpb, jenisTab, stateDokumen.kode_entitas, setDetailDok, stateDokumen.token);
                                                        }}
                                                        // rowSelecting={(args) => rowSelectingListData(args, setDetailListPraBkk, kode_entitas, setDetailDok, stateDokumen[0].token, jenisTab)}
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
                                                                width="110"
                                                                clipMode="EllipsisWithTooltip" /*freeze="Left"*/
                                                            />
                                                            <ColumnDirective
                                                                field="tgl_fpb"
                                                                headerText="Tanggal"
                                                                headerTextAlign="Center"
                                                                textAlign="Center"
                                                                //autoFit
                                                                width="100"
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
                                                                width="100"
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
                                                                width="100"
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
                                                                width="110"
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
                                                                width="85"
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
                                                                width="60"
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
                                                                width="80"
                                                                clipMode="EllipsisWithTooltip"
                                                            />
                                                        </ColumnsDirective>
                                                        <Inject services={[Page, Selection, Edit, Toolbar, Sort, Group, Filter, Resize, Reorder, /*Freeze,*/ ExcelExport, PdfExport]} />
                                                    </GridComponent>
                                                </div>
                                            </Tab.Panel>
                                        ))}
                                        {/*  */}
                                    </Tab.Panels>
                                </Tab.Group>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DETAIL DOK */}
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
            <FrmFpb
                stateDokumen={stateDokumen}
                isOpen={dialogFrmFpb}
                onClose={() => {
                    setDialogFrmFpb(false);
                }}
                onRefresh={handleRefreshData}
            />
        </>
    );
};

export default FpbList;
