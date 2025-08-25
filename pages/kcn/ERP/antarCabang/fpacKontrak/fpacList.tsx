import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { MenuEventArgs } from '@syncfusion/ej2-react-splitbuttons';
import { SidebarComponent, SidebarType, ContextMenuComponent, MenuItemModel, TabComponent } from '@syncfusion/ej2-react-navigations';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { Tooltip, TooltipComponent, TooltipEventArgs } from '@syncfusion/ej2-react-popups';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { ChangeEventArgs as ChangeEventArgsInput, FocusInEventArgs } from '@syncfusion/ej2-react-inputs';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown } from '@syncfusion/ej2-react-dropdowns';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, Inject, Page, Edit, Sort, Filter, Group, Resize, Reorder, Selection, ExcelExport, PdfExport } from '@syncfusion/ej2-react-grids';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json';
import * as React from 'react';
import { useEffect, useState, useCallback, useRef } from 'react';
import moment from 'moment';
import swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import styles from './fpacKontrak.module.css';
import Draggable from 'react-draggable';
import withReactContent from 'sweetalert2-react-content';
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
import idIDLocalization from 'public/syncfusion/locale.json';
L10n.load(idIDLocalization);
enableRipple(true);
import { useSession } from '@/pages/api/sessionContext';
import axios from 'axios';
import DialogCreateFPAC from './component/DialogCreateFPAC';
import ReportDlgCabang from './component/frmReportDlg';
import { useApprovalPusat } from './hooks/useApprovalPusat';
import DialogPembatalanFPAC from './component/DialogPembatalanFPAC';
import { usePembatalanPusat } from './hooks/usePembatalanPusat';
import Loader from './component/Loader';

const FPACList = () => {
    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';
    const entitasUser = sessionData?.entitas ?? '';

    if (isLoading) {
        return;
    }

    const [isDisabled, setIsDisabled] = useState(false);

    //======= Setting hak akses user ... ========
    let disabledBaru = false;
    let disabledEdit = false;
    let disabledHapus = false;
    let disabledCetak = false;

    // State Baru Untuk FPAC
    interface UserMenuState {
        baru: any;
        edit: any;
        hapus: any;
        cetak: any;
    }

    let gridListData: Grid | any;

    const [selectedItem, setSelectedItem] = useState<any>(null);

    const [modalPosition, setModalPosition] = useState({ top: '3%', right: '2%', width: '100%', background: '#dedede' });
    const [dataHeaderDok, setDataHeaderDok] = useState({ no_dokumen: '', tgl_dokumen: '' });
    const [showModalPembatalan, setShowModalPembatalan] = useState(false);

    const styleButton = { width: 57 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#3b3f5c' };
    const styleButtonFilePendukung = { width: 140 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#3b3f5c' };
    const styleButtonApproval = { width: 110 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#3b3f5c' };
    const styleButtonPembatalan = { width: 130 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#3b3f5c' };

    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [windowHeight, setWindowHeight] = useState(0);
    const [data, setData] = useState<any>();

    //======== Setting hint / tooltip untuk grid List Data ========
    let tooltipListData: Tooltip | any;

    //////////////////////////
    // ** FILTER SIDEBAR ** //
    //////////////////////////

    /* // TANGGAL DOKUMEN // */
    const [date1, setDate1] = useState<moment.Moment>(moment());
    const [date2, setDate2] = useState<moment.Moment>(moment().endOf('month'));

    const [isDateRangeChecked, setIsDateRangeChecked] = useState<boolean>(true);

    const HandleTgl = async (date: any, tipe: string, setDate1: Function, setDate2: Function, setIsDateRangeChecked: Function) => {
        if (tipe === 'tanggalAwal') {
            setDate1(date);
            setIsDateRangeChecked(true);
        } else {
            setDate2(date);
            setIsDateRangeChecked(true);
        }
    };

    //* // TANGGAL EFEKTIF // *//
    const [date3, setDate3] = useState<moment.Moment>(moment());
    const [date4, setDate4] = useState<moment.Moment>(moment().endOf('month'));

    const [isDateRangeChecked2, setIsDateRangeChecked2] = useState<boolean>(false);

    const HandleTgl2 = async (date: any, tipe: string, setDate3: Function, setDate4: Function, setIsDateRangeChecked2: Function) => {
        if (tipe === 'tanggalAwal') {
            setDate3(date);
            setIsDateRangeChecked2(true);
        } else {
            setDate4(date);
            setIsDateRangeChecked2(true);
        }
    };

    // TANGGAL BERLAKU //
    const [date5, setDate5] = useState<moment.Moment>(moment());
    const [date6, setDate6] = useState<moment.Moment>(moment().endOf('month'));

    const [isDateRangeChecked3, setIsDateRangeChecked3] = useState<boolean>(false);

    const HandleTgl3 = async (date: any, tipe: string, setDate3: Function, setDate4: Function, setIsDateRangeChecked2: Function) => {
        if (tipe === 'tanggalAwal') {
            setDate5(date);
            setIsDateRangeChecked3(true);
        } else {
            setDate6(date);
            setIsDateRangeChecked3(true);
        }
    };

    /* // TANGGAL KIRIM // */
    const [date7, setDate7] = useState<moment.Moment>(moment());
    const [date8, setDate8] = useState<moment.Moment>(moment().endOf('month'));

    const [isDateRangeChecked4, setIsDateRangeChecked4] = useState<boolean>(false);

    const HandleTgl4 = async (date: any, tipe: string, setDate3: Function, setDate4: Function, setIsDateRangeChecked2: Function) => {
        if (tipe === 'tanggalAwal') {
            setDate7(date);
            setIsDateRangeChecked4(true);
        } else {
            setDate8(date);
            setIsDateRangeChecked4(true);
        }
    };

    // NO FPAC
    const [noFpacValue, setNoFpacValue] = useState<string>('');
    const [isNoFpac, setIsNoFpac] = useState<boolean>(false);

    // NAMA SUPPLIER
    const [namaSupplierValue, setNamaSupplierValue] = useState<string>('');
    const [isNamaSupplier, setIsNamaSupplier] = useState<boolean>(false);

    // NAMA CUSTOMER
    const [namaCustomerValue, setNamaCustomerValue] = useState<string>('');
    const [isNamaCustomer, setIsNamaCustomer] = useState<boolean>(false);

    // ENTITAS
    const [entitasValue, setEntitasValue] = useState<string>('');
    const [isEntitas, setIsEntitas] = useState<boolean>(false);

    const handleInputChange = (event: string, setValue: Function, setIsValue: Function) => {
        const newValue = event;
        setValue(newValue);
        setIsValue(newValue.length > 0);
    };

    // STATUS DOKUMEN
    const [selectedOptionStatusDokumen, setSelectedOptionStatusDokumen] = useState<string>('');
    const [isStatusDokumen, setIsStatusDokumen] = useState<boolean>(false);

    const HandleStatusDokumenChange = (event: string, setSelectedOptionStatusDokumen: Function, setIsStatusDokumen: Function) => {
        const newValue = event;
        setSelectedOptionStatusDokumen(newValue);
        setIsStatusDokumen(newValue.length > 0);
    };

    // STATUS APPROVAL
    const [selectedOptionStatusApproval, setSelectedOptionStatusApproval] = useState<string>('');
    const [isStatusApproval, setIsStatusApproval] = useState<boolean>(false);

    const HandleStatusApprovalChange = (event: string, setSelectedOptionStatusApproval: Function, setIsStatusApproval: Function) => {
        const newValue = event;
        setSelectedOptionStatusApproval(newValue);
        setIsStatusApproval(newValue.length > 0);
    };

    // PEMBATALAN PESANANAN
    const [isPembatalanPesananan, setIsPembatalanPesananan] = useState<boolean>(false);

    // Console.log FIlter Sidebar
    // console.log(noFpacValue, 'noFpacValue');
    // console.log(isNoFpac, 'isNoFpac')
    // console.log(isPembatalanPesananan, 'isPembatalanPesananan');
    // console.log(namaSupplierValue, 'namaSupplierValue');
    // console.log(namaCustomerValue, 'namaCustomerValue');
    // console.log(entitasValue, 'entitasValue');
    // console.log(selectedOptionStatusDokumen, 'selectedOptionStatusDokumen');
    // console.log(selectedOptionStatusApproval, 'selectedOptionStatusApproval');
    // console.log(date1.format('YYYY-MM-DD'), 'Tanggal Dokumen Awal');
    // console.log(date2.format('YYYY-MM-DD'), 'Tanggal Dokumen Akhir');
    // console.log(date3.format('YYYY-MM-DD'), 'Tanggal Efektif Awal');
    // console.log(date4.format('YYYY-MM-DD'), 'Tanggal Efektif Akhir');
    // console.log(date5.format('YYYY-MM-DD'), 'Tanggal Berlaku Awal');
    // console.log(date6.format('YYYY-MM-DD'), 'Tanggal Berlaku Akhir');
    // console.log(date7.format('YYYY-MM-DD'), 'Tanggal Kirim Awal');
    // console.log(date8.format('YYYY-MM-DD'), 'Tanggal Kiirm AKhir');

    //////////////////////////////
    // ** END FILTER SIDEBAR ** //
    //////////////////////////////

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
            gridListData.print();
        } else if (args.item.text === 'PDF') {
            gridListData.showSpinner();
            gridListData.pdfExport();
        } else if (args.item.text === 'XLSX') {
            gridListData.showSpinner();
            gridListData.excelExport();
        } else if (args.item.text === 'CSV') {
            gridListData.showSpinner();
            gridListData.csvExport();
        }
    }

    const ExportComplete = (): void => {
        gridListData.hideSpinner();
    };

    //================ Disable hari minggu di calendar ==============
    function onRenderDayCell(args: RenderDayCellEventArgs): void {
        if ((args.date as Date).getDay() === 0) {
            args.isDisabled = true;
        }
    }

    // ===========================================================================================

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

    // ===========================================================================================

    const closeModal = () => {
        setSelectedItem(null);
    };

    const [selectedRow, setSelectedRow] = useState<any>('');
    const [selectedItems, setSelectedItems] = useState<any>({});

    const handleRowSelected = (args: any) => {
        setSelectedRow(args.data.kode_fpac);
        setSelectedItems(args.data);
    };

    const masterFpac = async () => {
        const response = await axios.get(`${apiUrl}/erp/master_detail_FPAC?entitas=${kode_entitas}&param1=${selectedRow}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        setMasterData(response.data.data);
        setData(response.data);
    };

    useEffect(() => {
        masterFpac();
    }, [selectedRow]);

    useEffect(() => {
        masterFpac();
    }, []);

    /// DETAIL DOK ///
    const [state, setState] = useState({
        content: 'Detail Dok',
        iconCss: 'e-icons e-medium e-chevron-down',
    });

    const [detailDok, setDetailDok] = useState<any[]>([]);

    const DataDetailDok = async (selectedRow: any): Promise<any[]> => {
        const response = await axios.get(`${apiUrl}/erp/detail_dok_fpac?`, {
            params: {
                entitas: kode_entitas,
                param1: selectedRow,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const listDetailDok = response.data.data;
        return listDetailDok;
    };

    const ListDetailDok = async (selectedRow: any, setDetailDok: Function) => {
        try {
            const result: any[] = await DataDetailDok(selectedRow);
            setDetailDok(result);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const ButtonDetailDok = (selectedRow: any) => {
        return selectedRow;
    };

    const SetDataDokumen = async (tipe: string, selectedRow: string, setSelectedItem: Function, setDetailDok: Function) => {
        if (selectedRow !== '') {
            if (tipe === 'detailDok') {
                const result = ButtonDetailDok(selectedRow);
                setSelectedItem(result);
                ListDetailDok(result, setDetailDok);
            }
        } else {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: '<p style="font-size:12px; color:white;">Silahkan pilih data terlebih dahulu</p>',
                width: '100%',
                customClass: {
                    popup: styles['colored-popup'],
                },
            });
        }
    };

    const swalToast = swal.mixin({
        toast: true,
        position: 'center',
        customClass: {
            popup: 'colored-toast',
        },
        showConfirmButton: false,
        timer: 3000,
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

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    const RowSelectingListData = (args: any, setDataHeaderDok: Function, setDetailDok: Function) => {
        ListDetailDok(args.data.kode_fpac, setDetailDok);
        setDataHeaderDok((prevState: any) => ({
            ...prevState,
            no_dokumen: args.data.no_fpac,
            tgl_dokumen: args.data.tgl_fpac,
        }));
    };

    //// ##CETAK## ////
    const [showReportDlgFpbCabang, setShowReportDlgFpbCabang] = useState(false);

    const stateDokumen = {
        kode_entitas: sessionData?.kode_entitas ?? '',
        userid: sessionData?.userid ?? '',
        kode_user: sessionData?.kode_user ?? '',
        token: sessionData?.token ?? '',
    };

    let cMenuCetak: ContextMenuComponent;

    function btnPrintClick(e: any): void {
        var clientRect = (e.target as Element).getBoundingClientRect();
        cMenuCetak.open(clientRect.bottom, clientRect.left);
    }

    const handleObjekParameter = async (objekParameter: any) => {
        setShowReportDlgFpbCabang(false);

        let height = window.screen.availHeight - 150;
        let width = window.screen.availWidth - 200;
        let leftPosition = window.screen.width / 2 - (width / 2 + 10);
        let topPosition = window.screen.height / 2 - (height / 2 + 50);
        let iframe = `
             <html><head>
             <title>Daftar Order Pembelian | Next KCN Sytem</title>
             <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
             </head><body>
             <iframe src="./report/DaftarFormPembelianAntarCabang?entitas=${objekParameter.entitas}&param1=${objekParameter.param1}&param2=${objekParameter.param2}&param3=${objekParameter.param3}&param4=${objekParameter.param4}&param5=${objekParameter.param5}&param6=${objekParameter.param6}&token=${token}" style="height:calc(100% - 4px);width:calc(100% - 4px)"
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

    let menuCetakItems: MenuItemModel[] = [
        {
            iconCss: 'e-icons e-thumbnail',
            text: 'Form Pembelian Antar Barang',
        },
        {
            iconCss: 'e-icons e-thumbnail',
            text: 'Daftar Form Pembelian Antar Cabang',
        },
    ];

    function menuCetakSelect(args: MenuEventArgs) {
        OnClick_CetakForm(selectedRow, args.item.id, args.item.text);
    }

    const OnClick_CetakForm = (selectedRowKode: any, tag: any, namaMenuCetak: any) => {
        let height = window.screen.availHeight - 150;
        let width = window.screen.availWidth - 200;
        let leftPosition = window.screen.width / 2 - (width / 2 + 10);
        let topPosition = window.screen.height / 2 - (height / 2 + 50);

        if (namaMenuCetak === 'Form Pembelian Antar Barang') {
            if (!selectedRow) {
                withReactContent(swalToast).fire({
                    icon: 'warning',
                    title: '<p style="font-size:12px;color:white;">Silahkan pilih data terlebih dahulu</p>',
                    width: '100%',
                    customClass: {
                        popup: styles['colored-popup'],
                    },
                });
                return;
            } else {
                let iframe = `
                        <html><head>
                        <title>Form Permintaan Barang | Next KCN Sytem</title>
                        <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
                        </head><body>
                        <iframe src="./report/formPembelianAntarBarang?entitas=${kode_entitas}&param1=${selectedRow}&token=${token}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
                    setTimeout(() => {
                        let link = win!.document.createElement('link');
                        link.type = 'image/png';
                        link.rel = 'shortcut icon';
                        link.href = '/favicon.png';
                        win!.document.getElementsByTagName('head')[0].appendChild(link);
                        win!.document.write(iframe);
                    }, 300);
                } else {
                    console.error('Window failed to open.');
                }
            }
        } else if (namaMenuCetak === 'Daftar Form Pembelian Antar Cabang') {
            setShowReportDlgFpbCabang(true);
        }
    };

    const [modalHandleDataFPAC, setModalHandleDataFPAC] = useState(false);
    const [statusPage, setStatusPage] = useState('');
    const [isApprovalCabang, setIsApprovalCabang] = useState(false);
    const [isApprovalPusat, setIsApprovalPusat] = useState(false);
    const [selectedData, setSelectedData] = useState<any>();

    const handleNavigateLink = (jenis: any) => {
        setModalHandleDataFPAC(false);
        if (jenis === 'edit') {
            if (selectedRow) {
                setStatusPage('EDIT');
                setIsApprovalCabang(false);
                setIsApprovalPusat(false);
                setModalHandleDataFPAC(true);
            } else {
                swal.fire({
                    title: 'Warning',
                    text: 'Silahkan pilih data terlebih dahulu.',
                    icon: 'warning',
                });
            }
        } else if (jenis === 'create') {
            setStatusPage('CREATE');
            setSelectedItems(null);
            setIsApprovalCabang(false);
            setIsApprovalPusat(false);
            setModalHandleDataFPAC(true);
        } else if (jenis === 'approvalCabang') {
            if (selectedRow) {
                if (selectedData.status_app === 'Disetujui') {
                    swal.fire({
                        title: 'Warning',
                        text: 'Status Approval Cabang telah disetujui!',
                        icon: 'warning',
                    });
                    return;
                }

                setStatusPage('EDIT');
                setIsApprovalCabang(true);
                setIsApprovalPusat(false);
                setModalHandleDataFPAC(true);
            } else {
                swal.fire({
                    title: 'Warning',
                    text: 'Silahkan pilih data terlebih dahulu.',
                    icon: 'warning',
                });
            }
        } else if (jenis === 'approvalPusat') {
            if (selectedRow) {
                if (selectedData.status_app2 === 'Baru') {
                    swal.fire({
                        title: 'Warning',
                        text: 'Status Approval Cabang Baru, Tidak Dapat Di Approve.',
                        icon: 'warning',
                    });
                    return;
                }

                if (selectedData.status_app2 === 'Koreksi') {
                    swal.fire({
                        title: 'Warning',
                        text: 'Status Approval Cabang Koreksi, Tidak Dapat Di Approve.',
                        icon: 'warning',
                    });
                    return;
                }

                if (selectedData.status_app === 'Disetujui') {
                    swal.fire({
                        title: 'Warning',
                        text: 'Status Approval Pusat sudah disetujui.',
                        icon: 'warning',
                    });
                    return;
                }

                // if (selectedData.approval.toLowerCase() === 'n') {
                //   swal.fire({
                //     title: 'Warning',
                //     text: 'Status Approval Cabang Baru, Tidak Dapat Di Approve.',
                //     icon: 'warning',
                //   });
                //   return;
                // }

                // setTimeout(() => {
                //   setIsDisabled(true);
                // }, 9000);

                setStatusPage('EDIT');
                setIsApprovalCabang(false);
                setIsApprovalPusat(true);
                setModalHandleDataFPAC(true);
            } else {
                swal.fire({
                    title: 'Warning',
                    text: 'Silahkan pilih data terlebih dahulu.',
                    icon: 'warning',
                });
            }
        }
    };

    const [recordsDataFPAC, setrecordsDataFPAC] = useState<any[]>([]);

    const refreshData = async () => {
        const paramObject = {
            entitas: kode_entitas,
            param1: isNoFpac ? noFpacValue : 'all',
            param2: isDateRangeChecked ? date1.format('YYYY-MM-DD') : 'all',
            param3: isDateRangeChecked ? date2.format('YYYY-MM-DD') : 'all',
            param4: isDateRangeChecked2 ? date3.format('YYYY-MM-DD') : 'all',
            param5: isDateRangeChecked2 ? date4.format('YYYY-MM-DD') : 'all',
            param6: isDateRangeChecked3 ? date5.format('YYYY-MM-DD') : 'all',
            param7: isDateRangeChecked3 ? date6.format('YYYY-MM-DD') : 'all',
            param8: isDateRangeChecked4 ? date7.format('YYYY-MM-DD') : 'all',
            param9: isDateRangeChecked4 ? date8.format('YYYY-MM-DD') : 'all',
            param10: isNamaSupplier ? namaSupplierValue : 'all', // Nama Supplier
            param11: isStatusDokumen ? selectedOptionStatusDokumen : 'all', // Status Dokumen
            param12: isEntitas ? entitasValue : 'all', // entitas
            param13: isPembatalanPesananan ? 'Y' : 'N', // Pembatalan Pesanan
            param14: isStatusApproval ? selectedOptionStatusApproval : 'all', // Status
        };

        try {
            const response = await axios.get(`${apiUrl}/erp/list_fpac`, {
                params: paramObject,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const formattedData = response.data.data.map((item: any) => ({
                ...item,
                tgl_fpac: moment(item.tgl_fpac).format('DD-MM-YYYY'),
                tgl_trxfpac: moment(item.tgl_trxfpac).format('DD-MM-YYYY'),
                netto_mu: parseFloat(item.netto_mu).toLocaleString('en-US', { minimumFractionDigits: 2 }),
                total_berat: parseFloat(item.total_berat).toLocaleString('en-US', { minimumFractionDigits: 2 }),
            }));
            let filteredData;
            if (entitasUser === '898' || userid.toLowerCase() === 'administrator') {
                filteredData = formattedData;
            } else {
                filteredData = formattedData.filter((item: any) => item.kode_entitas === entitasUser);
            }
            setrecordsDataFPAC(filteredData);
            gridListData.setProperties({ dataSource: filteredData });
            gridListData.refresh();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        refreshData();
    }, [kode_entitas, apiUrl, token]);

    const toggleClick = () => {
        setSidebarVisible(true);
    };

    const SvgComponent: React.FC = () => {
        return (
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
        );
    };

    const handleShowFilter = (value: any) => {
        if (value) {
            setSidebarVisible(true);
        } else {
            setSidebarVisible(false);
        }
    };

    const gridWidth = sidebarVisible ? 'calc(100% - 315px)' : '100%';

    const { handleBatalClick, setMasterData, status } = usePembatalanPusat(data?.data);
    const [isLoadingPembatalan, setIsLoadingPembatalan] = useState(false);

    const handlePembatalanFPAC = () => {
        if (!selectedData) {
            swal.fire({
                icon: 'warning',
                text: 'Silahkan pilih data terlebih dahulu.',
            });
            return;
        }

        if ((selectedData.status_app2 === 'Disetujui' || selectedData.status_app2 === 'Baru') && (selectedData.status_export === 'Disetujui' || selectedData.status_export === 'Baru')) {
            swal.fire({
                icon: 'warning',
                // text: `Pembatalan Transaksi FPAC tidak dapat diproses. Belum ada proses transaksi Antar Cabang yang terbentuk / Dokumen sudah dibatalkan.`,
                text: `Pembatalan Transaksi FPAC dengan No. ${selectedData.no_fpac} tidak dapat diproses...`,
            });
            return;
        }

        if (selectedData.status_export === 'Dibatalkan') {
            swal.fire({
                icon: 'error',
                // text: `Pembatalan Transaksi FPAC tidak dapat diproses. Belum ada proses transaksi Antar Cabang yang terbentuk / Dokumen sudah dibatalkan.`,
                text: `Pembatalan Transaksi FPAC dengan No. ${selectedData.no_fpac} tidak dapat diproses. Belum ada proses transaksi Antar Cabang yang terbentuk / Dokumen sudah dibatalkan.`,
            });
            return;
        }

        setShowModalPembatalan(true);
    };

    const handlePembatalanFPACSubmit = async () => {
        try {
            setShowModalPembatalan(false);
            setTimeout(() => {
                setIsLoadingPembatalan(true);
            }, 300);
            const status = await handleBatalClick();
            // await new Promise((resolve) => setTimeout(resolve, 3000));
            if (status) {
                swal.fire({
                    timer: 10,
                    showConfirmButton: false,
                });

                swal.fire({
                    icon: 'success',
                    text: 'Pembatalan Transaksi FPAC berhasil.',
                });
            } else {
                swal.fire({
                    timer: 10,
                    showConfirmButton: false,
                });

                swal.fire({
                    icon: 'error',
                    text: 'Pembatalan Transaksi FPAC gagal.',
                });
            }
        } catch (error) {
            setIsLoadingPembatalan(false);
            swal.fire({
                icon: 'error',
                text: 'Pembatalan Transaksi FPAC gagal.',
            });
        } finally {
            swal.fire({
                timer: 10,
                showConfirmButton: false,
            });

            setIsLoadingPembatalan(false);
        }

        refreshData();
    };

    return (
        <div className={`main ${modalHandleDataFPAC ? 'h-[100vh] min-h-[100vh]' : ''}`} id="main-target">
            <div style={{ minHeight: '40px', marginTop: '-3px', marginBottom: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="flex flex-wrap items-center">
                    <ButtonComponent id="btnBaru" cssClass="e-primary e-small" style={styleButton} content="Baru" onClick={() => handleNavigateLink('create')}></ButtonComponent>

                    <ButtonComponent id="btnUbah" cssClass="e-primary e-small" style={styleButton} disabled={disabledEdit} content="Ubah" onClick={() => handleNavigateLink('edit')} />

                    <ButtonComponent
                        id="btnApprovalCabang"
                        cssClass="e-primary e-small"
                        style={styleButtonApproval}
                        disabled={disabledEdit}
                        content="Approval Cabang"
                        onClick={() => handleNavigateLink('approvalCabang')}
                    />

                    <ButtonComponent
                        id="btnApprovalPust"
                        cssClass="e-primary e-small"
                        style={styleButtonApproval}
                        disabled={disabledEdit}
                        content="Approval Pusat"
                        onClick={() => handleNavigateLink('approvalPusat')}
                    />

                    <ButtonComponent
                        id="btnPembatalanFpac"
                        cssClass="e-primary e-small"
                        style={styleButtonPembatalan}
                        disabled={disabledEdit}
                        content="Pembatalan FPAC"
                        onClick={handlePembatalanFPAC}
                    />

                    <ButtonComponent
                        id="btnFilter"
                        cssClass="e-primary e-small"
                        style={sidebarVisible ? { width: '57px', height: '28px', marginBottom: '0.5em', marginTop: '0.5em', marginRight: '0.8em' } : { ...styleButton, color: 'white' }}
                        disabled={sidebarVisible}
                        content="Filter"
                        onClick={toggleClick}
                    ></ButtonComponent>

                    <ContextMenuComponent
                        id="cMenuCetak"
                        ref={(scope) => (cMenuCetak = scope as ContextMenuComponent)}
                        items={menuCetakItems}
                        select={menuCetakSelect}
                        animationSettings={{ duration: 800, effect: 'FadeIn' }}
                    />

                    {/* <ButtonComponent id="btnUpdateFilePendukung" cssClass="e-primary e-small" style={styleButtonFilePendukung} disabled={disabledEdit} content="Update FIle Pendukung" /> */}

                    <ButtonComponent
                        id="btnDetail"
                        cssClass="e-primary e-small"
                        style={{ width: 100 + 'px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#e6e6e6', color: 'black' }}
                        disabled={false}
                        onClick={() => SetDataDokumen('detailDok', selectedRow, setSelectedItem, setDetailDok)}
                        iconCss={state.iconCss}
                        content={state.content}
                    ></ButtonComponent>

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
                </div>

                <div className="mt-2 flex items-center md:mt-0">
                    <span style={{ fontSize: 16 }} className="font-serif text-xl">
                        Form Pembelian Antar Barang (FPAC) - KONTRAK
                    </span>
                </div>
            </div>

            <div id="main-content" style={{ position: 'sticky', overflow: 'hidden' }} className="flex !gap-6">
                {/* ==============================FILTER============================================== */}
                <SidebarComponent
                    id="default-sidebar"
                    target={'#main-content'}
                    style={{
                        background: '#dedede',
                        marginRight: '2rem',
                        display: 'block',
                        overflowY: 'auto',
                        borderRadius: 7,
                    }}
                    width="305px"
                    height={200}
                    isOpen={sidebarVisible}
                    open={() => setSidebarVisible(true)}
                    close={() => setSidebarVisible(false)}
                    enableGestures={false}
                >
                    <div className="panel-filter " style={{ background: '#dedede', height: '100%' }}>
                        <div className="flex items-center text-center">
                            <button className="absolute right-0 top-0 p-2 text-gray-600 hover:text-gray-900" onClick={() => handleShowFilter(false)}>
                                <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                            </button>
                            <SvgComponent />
                            <h5 className="text-lg font-bold ltr:ml-3 rtl:mr-3">Filtering Data</h5>
                        </div>
                        <div className="mb-5 mt-3 h-px w-full border-b border-black dark:border-[#1b2e4b]"></div>
                        <div className="flex flex-col items-center justify-between" id="Candil">
                            <div id="inputFilter">
                                <div className="mt-2 flex">
                                    <CheckBoxComponent
                                        label="No. FPAC"
                                        checked={isNoFpac}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            setIsNoFpac(value);
                                        }}
                                        style={{ borderRadius: 3, borderColor: 'gray' }}
                                    />
                                </div>
                                <div className="mt-1 flex justify-between">
                                    <div className="container form-input">
                                        <TextBoxComponent
                                            placeholder=""
                                            value={noFpacValue}
                                            input={(args: FocusInEventArgs) => {
                                                const value: any = args.value;
                                                handleInputChange(value, setNoFpacValue, setIsNoFpac);
                                            }}
                                        />
                                    </div>
                                </div>
                                {/* // TANGGAL DOKUMEN // */}
                                <div className="mt-2 flex justify-between">
                                    <CheckBoxComponent
                                        label="Tanggal Dokumen"
                                        checked={isDateRangeChecked}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            setIsDateRangeChecked(value);
                                        }}
                                    />
                                </div>

                                <div className={`grid grid-cols-1 justify-between gap-1 sm:flex `}>
                                    <div className="form-input mt-1 flex justify-between">
                                        <DatePickerComponent
                                            locale="id"
                                            style={{ fontSize: '12px' }}
                                            cssClass="e-custom-style"
                                            renderDayCell={onRenderDayCell}
                                            enableMask={true}
                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                            showClearButton={false}
                                            format="dd-MM-yyyy"
                                            value={date1.toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                HandleTgl(moment(args.value), 'tanggalAwal', setDate1, setDate2, setIsDateRangeChecked);
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                    <p className="set-font-9 ml-0.5 mr-0.5 mt-3 flex justify-between">s/d</p>
                                    <div className="form-input mt-1 flex justify-between">
                                        <DatePickerComponent
                                            locale="id"
                                            style={{ fontSize: '12px' }}
                                            cssClass="e-custom-style"
                                            renderDayCell={onRenderDayCell}
                                            enableMask={true}
                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                            showClearButton={false}
                                            format="dd-MM-yyyy"
                                            value={date2.toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                HandleTgl(moment(args.value), 'tanggalAkhir', setDate1, setDate2, setIsDateRangeChecked);
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                </div>

                                {/* // TANGGAL EFEKTIF // */}
                                <div className="mt-2 flex justify-between">
                                    <CheckBoxComponent
                                        label="Tanggal Efektif"
                                        checked={isDateRangeChecked2}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            setIsDateRangeChecked2(value);
                                        }}
                                    />
                                </div>

                                <div className={`grid grid-cols-1 justify-between gap-1 sm:flex `}>
                                    <div className="form-input mt-1 flex justify-between">
                                        <DatePickerComponent
                                            locale="id"
                                            style={{ fontSize: '12px' }}
                                            cssClass="e-custom-style"
                                            renderDayCell={onRenderDayCell}
                                            enableMask={true}
                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                            showClearButton={false}
                                            format="dd-MM-yyyy"
                                            value={date3.toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                HandleTgl2(moment(args.value), 'tanggalAwal', setDate3, setDate4, setIsDateRangeChecked2);
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                    <p className="set-font-9 ml-0.5 mr-0.5 mt-3 flex justify-between">s/d</p>
                                    <div className="form-input mt-1 flex justify-between">
                                        <DatePickerComponent
                                            locale="id"
                                            style={{ fontSize: '12px' }}
                                            cssClass="e-custom-style"
                                            renderDayCell={onRenderDayCell}
                                            enableMask={true}
                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                            showClearButton={false}
                                            format="dd-MM-yyyy"
                                            value={date4.toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                HandleTgl2(moment(args.value), 'tanggalAkhir', setDate3, setDate4, setIsDateRangeChecked2);
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                </div>

                                {/* // TANGGAL BERLAKU // */}
                                <div className="mt-2 flex justify-between">
                                    <CheckBoxComponent
                                        label="Tanggal Berlaku"
                                        checked={isDateRangeChecked3}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            setIsDateRangeChecked3(value);
                                        }}
                                    />
                                </div>

                                <div className={`grid grid-cols-1 justify-between gap-1 sm:flex `}>
                                    <div className="form-input mt-1 flex justify-between">
                                        <DatePickerComponent
                                            locale="id"
                                            style={{ fontSize: '12px' }}
                                            cssClass="e-custom-style"
                                            renderDayCell={onRenderDayCell}
                                            enableMask={true}
                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                            showClearButton={false}
                                            format="dd-MM-yyyy"
                                            value={date5.toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                HandleTgl3(moment(args.value), 'tanggalAwal', setDate5, setDate6, setIsDateRangeChecked3);
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                    <p className="set-font-9 ml-0.5 mr-0.5 mt-3 flex justify-between">s/d</p>
                                    <div className="form-input mt-1 flex justify-between">
                                        <DatePickerComponent
                                            locale="id"
                                            style={{ fontSize: '12px' }}
                                            cssClass="e-custom-style"
                                            renderDayCell={onRenderDayCell}
                                            enableMask={true}
                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                            showClearButton={false}
                                            format="dd-MM-yyyy"
                                            value={date6.toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                HandleTgl3(moment(args.value), 'tanggalAkhir', setDate5, setDate6, setIsDateRangeChecked3);
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                </div>

                                {/* // TANGGAL KIRIM // */}
                                <div className="mt-2 flex justify-between">
                                    <CheckBoxComponent
                                        label="Tanggal Kirim"
                                        checked={isDateRangeChecked4}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            setIsDateRangeChecked4(value);
                                        }}
                                    />
                                </div>

                                <div className={`grid grid-cols-1 justify-between gap-1 sm:flex `}>
                                    <div className="form-input mt-1 flex justify-between">
                                        <DatePickerComponent
                                            locale="id"
                                            style={{ fontSize: '12px' }}
                                            cssClass="e-custom-style"
                                            renderDayCell={onRenderDayCell}
                                            enableMask={true}
                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                            showClearButton={false}
                                            format="dd-MM-yyyy"
                                            value={date7.toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                HandleTgl4(moment(args.value), 'tanggalAwal', setDate7, setDate8, setIsDateRangeChecked4);
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                    <p className="set-font-9 ml-0.5 mr-0.5 mt-3 flex justify-between">s/d</p>
                                    <div className="form-input mt-1 flex justify-between">
                                        <DatePickerComponent
                                            locale="id"
                                            style={{ fontSize: '12px' }}
                                            cssClass="e-custom-style"
                                            renderDayCell={onRenderDayCell}
                                            enableMask={true}
                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                            showClearButton={false}
                                            format="dd-MM-yyyy"
                                            value={date8.toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                HandleTgl4(moment(args.value), 'tanggalAkhir', setDate7, setDate8, setIsDateRangeChecked4);
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                </div>

                                {/* NAMA SUPPLIER */}
                                <div className="mt-2 flex">
                                    <CheckBoxComponent
                                        label="Nama Supplier"
                                        checked={isNamaSupplier}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            setIsNamaSupplier(value);
                                        }}
                                        style={{ borderRadius: 3, borderColor: 'gray' }}
                                    />
                                </div>
                                <div className="mt-1 flex justify-between">
                                    <div className="container form-input">
                                        <TextBoxComponent
                                            placeholder=""
                                            value={namaSupplierValue}
                                            input={(args: FocusInEventArgs) => {
                                                const value: any = args.value;
                                                handleInputChange(value, setNamaSupplierValue, setIsNamaSupplier);
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* NAMA CUSTOMER */}
                                <div className="mt-2 flex">
                                    <CheckBoxComponent
                                        label="Nama Customer"
                                        checked={isNamaCustomer}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            setIsNamaCustomer(value);
                                        }}
                                        style={{ borderRadius: 3, borderColor: 'gray' }}
                                    />
                                </div>
                                <div className="mt-1 flex justify-between">
                                    <div className="container form-input">
                                        <TextBoxComponent
                                            placeholder=""
                                            value={namaCustomerValue}
                                            input={(args: FocusInEventArgs) => {
                                                const value: any = args.value;
                                                handleInputChange(value, setNamaCustomerValue, setIsNamaCustomer);
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* STATUS DOKUMEN */}
                                <div className="mt-2 flex justify-between">
                                    <CheckBoxComponent
                                        label="Status Dokumen"
                                        checked={isStatusDokumen}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            setIsStatusDokumen(value);
                                        }}
                                    />
                                </div>

                                <div className="mt-1 flex justify-between">
                                    <div className="container form-input">
                                        <DropDownListComponent
                                            id="statusdokumen"
                                            className="form-select"
                                            dataSource={['Terbuka', 'Proses', 'Tertutup']}
                                            placeholder="--Silahkan Pilih--"
                                            change={(args: ChangeEventArgsDropDown) => {
                                                const value: any = args.value;
                                                HandleStatusDokumenChange(value, setSelectedOptionStatusDokumen, setIsStatusDokumen);
                                            }}
                                            value={selectedOptionStatusDokumen}
                                        />
                                    </div>
                                </div>

                                {/* STATUS APPROVAL */}
                                <div className="mt-2 flex justify-between">
                                    <CheckBoxComponent
                                        label="Status Approval"
                                        checked={isStatusApproval}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            setIsStatusApproval(value);
                                        }}
                                    />
                                </div>

                                <div className="mt-1 flex justify-between">
                                    <div className="container form-input">
                                        <DropDownListComponent
                                            id="statusapproval"
                                            className="form-select"
                                            dataSource={['Disetujui', 'Ditolak', 'Koreksi', 'Baru']}
                                            placeholder="--Silahkan Pilih--"
                                            change={(args: ChangeEventArgsDropDown) => {
                                                const value: any = args.value;
                                                HandleStatusApprovalChange(value, setSelectedOptionStatusApproval, setIsStatusApproval);
                                            }}
                                            value={selectedOptionStatusApproval}
                                        />
                                    </div>
                                </div>

                                {/* ENTITAS */}
                                <div className="mt-2 flex">
                                    <CheckBoxComponent
                                        label="Entitas"
                                        checked={isEntitas}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            setIsEntitas(value);
                                        }}
                                        style={{ borderRadius: 3, borderColor: 'gray' }}
                                    />
                                </div>
                                <div className="mt-1 flex justify-between">
                                    <div className="container form-input">
                                        <TextBoxComponent
                                            placeholder=""
                                            value={entitasValue}
                                            input={(args: FocusInEventArgs) => {
                                                const value: any = args.value;
                                                handleInputChange(value, setEntitasValue, setIsEntitas);
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* PEMBATALAN PESANAN */}
                                <div>
                                    <label className="inline-flex" style={{ fontSize: 11 }}>
                                        <input type="checkbox" className="peer form-checkbox" checked={isPembatalanPesananan} onChange={() => setIsPembatalanPesananan(!isPembatalanPesananan)} />
                                        <span className="peer-checked:text-primary">Pembatalan Pesanan</span>
                                    </label>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-center">
                                <TooltipComponent content="Refresh data yang ditampilkan" opensOn="Hover" openDelay={1000} position="BottomCenter">
                                    <ButtonComponent
                                        cssClass="e-primary e-small"
                                        iconCss="e-icons e-medium e-refresh"
                                        content="Refresh Data"
                                        style={{ backgroundColor: '#3b3f5c' }}
                                        onClick={refreshData}
                                    />
                                </TooltipComponent>
                            </div>
                        </div>
                    </div>
                </SidebarComponent>
                {/* ==============================END FILTER============================================== */}

                {/* Form Grid Layouts */}
                <div
                    className="panel border-l-[5px] border-white"
                    style={{ background: '#dedede', width: gridWidth, margin: 'auto auto auto' + (sidebarVisible ? ' 305px' : ' 0'), overflowY: 'auto', borderRadius: 7 }}
                >
                    <div className="panel-data" style={{ width: '100%' }}>
                        <div className="e-content">
                            <div>
                                <TooltipComponent ref={(t) => (tooltipListData = t)} target=".e-headertext">
                                    <TabComponent selectedItem={0} animation={{ previous: { effect: 'None' }, next: { effect: 'None' } }} height="100%">
                                        <div className="e-content">
                                            <div style={{ marginTop: -5, fontSize: '12px', fontWeight: 'bold', padding: '10px 12px', cursor: 'pointer', borderBottom: '3px solid transparent' }}>
                                                <div>
                                                    <GridComponent
                                                        ref={(g) => (gridListData = g)}
                                                        dataSource={recordsDataFPAC}
                                                        allowExcelExport={true}
                                                        excelExportComplete={ExportComplete}
                                                        allowPdfExport={true}
                                                        pdfExportComplete={ExportComplete}
                                                        allowPaging={true}
                                                        allowSorting={true}
                                                        allowFiltering={false}
                                                        allowResizing={true}
                                                        autoFit={true}
                                                        allowReordering={true}
                                                        pageSettings={{ pageSize: 25, pageCount: 5, pageSizes: ['25', '50', '100', 'All'] }}
                                                        rowHeight={22}
                                                        width={'100%'}
                                                        height={505}
                                                        gridLines={'Both'}
                                                        loadingIndicator={{ indicatorType: 'Shimmer' }}
                                                        rowSelected={handleRowSelected}
                                                        rowSelecting={(args) => RowSelectingListData(args, setDataHeaderDok, setDetailDok)}
                                                        recordDoubleClick={() => handleNavigateLink('edit')}
                                                        recordClick={(args) => {
                                                            setSelectedData(args.rowData);
                                                        }}
                                                        queryCellInfo={(args) => {
                                                            if (args.data.status_export === 'Berhasil') {
                                                                args.cell.style.color = '#1ECB24';
                                                            } else if (args.data.status_export === 'Dibatalkan') {
                                                                args.cell.style.color = '#DB1E1F';
                                                            } else if (args.data.approval === 'C') {
                                                                args.cell.style.color = '#fc8403';
                                                            } else if (args.data.approval === 'N') {
                                                                args.cell.style.color = '#DB1E1F';
                                                            } else {
                                                                args.cell.style.color = '';
                                                            }
                                                        }}
                                                        // rowDataBound={(args) => {
                                                        //   if (args.data.status_export === 'Berhasil') {
                                                        //     args.row.style.backgroundColor = '#80EA84';
                                                        //     args.row.style.color = '#1ECB24';
                                                        //   } else if (args.data.status_export === 'Dibatalkan') {
                                                        //     args.row.style.backgroundColor = '#DB1E1F';
                                                        //     args.row.style.color = '#DB1E1F';
                                                        //   } else {
                                                        //     args.row.style.color = '';
                                                        //     args.row.style.backgroundColor = '';
                                                        //   }
                                                        // }}
                                                    >
                                                        <ColumnsDirective>
                                                            <ColumnDirective field="no_fpac" headerText="No FPAC" width="120" textAlign="Center" headerTextAlign="Center" />
                                                            <ColumnDirective field="tgl_fpac" headerText="Tanggal" width="100" textAlign="Center" headerTextAlign="Center" />
                                                            <ColumnDirective field="tgl_trxfpac" headerText="Tanggal Efektif" width="100" textAlign="Center" headerTextAlign="Center" />
                                                            <ColumnDirective field="entitas_cabang_jual" headerText="Entitas Penjual" width="100" textAlign="Center" headerTextAlign="Center" />
                                                            <ColumnDirective field="kode_entitas" headerText="Entitas Pembeli" width="100" textAlign="Center" headerTextAlign="Center" />
                                                            <ColumnDirective field="nama_relasi" headerText="Supplier" width="150" textAlign="Center" headerTextAlign="Center" />
                                                            <ColumnDirective field="no_reff" headerText="No Kontrak/Reff" width="100" textAlign="Left" headerTextAlign="Center" />
                                                            <ColumnDirective field="nama_termin" headerText="Termin" width="80" textAlign="Left" headerTextAlign="Center" />
                                                            <ColumnDirective field="netto_mu" headerText="Netto (MU)" width="100" textAlign="Right" headerTextAlign="Center" />
                                                            <ColumnDirective field="total_berat" headerText="Berat (KG)" width="100" textAlign="Center" headerTextAlign="Center" />
                                                            <ColumnDirective field="status" headerText="Status Dok" width="100" textAlign="Center" headerTextAlign="Center" />
                                                            <ColumnDirective field="status_app2" headerText="App Cabang" width="100" textAlign="Center" headerTextAlign="Center" />
                                                            <ColumnDirective field="status_app" headerText="App Pusat" width="100" textAlign="Center" headerTextAlign="Center" />
                                                            <ColumnDirective field="status_export" headerText="Status Export" width="100" textAlign="Center" headerTextAlign="Center" />
                                                            <ColumnDirective field="export_cabang_beli" headerText="Exp C. Pembeli" width="100" textAlign="Center" headerTextAlign="Center" />
                                                            <ColumnDirective field="export_cabang_jual" headerText="Exp C. Penjual" width="100" textAlign="Center" headerTextAlign="Center" />
                                                            <ColumnDirective field="export_pusat" headerText="Exp Pusat" width="100" textAlign="Center" headerTextAlign="Center" />
                                                        </ColumnsDirective>
                                                        <Inject services={[Page, Selection, Edit, /*Toolbar,*/ Sort, Group, Filter, Resize, Reorder /*, Freeze,*/, ExcelExport, PdfExport]} />
                                                    </GridComponent>
                                                    <ContextMenuComponent
                                                        id="contextmenu"
                                                        target=".e-gridheader"
                                                        items={menuHeaderItems}
                                                        select={menuHeaderSelect}
                                                        animationSettings={{ duration: 500, effect: 'FadeIn' }}
                                                    />
                                                    <style>
                                                        {`
                                                    .e-row .e-rowcell:hover {
                                                        cursor: pointer;
                                                    }ss
                                                    .e-row.e-selectionbackground {
                                                        cursor: pointer;
                                                    }
                                                    .e-grid .e-headertext {
                                                        font-size: 11px !important;
                                                    }
                                                    .e-grid .e-rowcell {
                                                        font-size: 11px !important;
                                                    }
                                                `}
                                                    </style>
                                                </div>
                                            </div>
                                        </div>
                                    </TabComponent>
                                </TooltipComponent>
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
            </div>

            {selectedItem && (
                <Draggable>
                    <div className={`${styles.modalDetailDragable}`} style={modalPosition}>
                        <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                            <div style={{ marginBottom: 21 }}>
                                <span style={{ fontSize: 18, fontWeight: 500 }}>
                                    Detail Form Pembelian Antar Cabang : {dataHeaderDok.no_dokumen} - {dataHeaderDok.tgl_dokumen}
                                </span>
                            </div>
                            <GridComponent dataSource={detailDok} width={'100%'} rowHeight={30} gridLines={'Both'} allowSorting={true}>
                                <ColumnsDirective>
                                    <ColumnDirective field="no_item" headerText="No Akun" width="100" textAlign="Center" headerTextAlign="Center" />
                                    <ColumnDirective field="diskripsi" headerText="Nama Barang" width="250" textAlign="Center" headerTextAlign="Center" />
                                    <ColumnDirective field="satuan" headerText="Satuan" width="100" textAlign="Center" headerTextAlign="Center" />
                                    <ColumnDirective field="qty" headerText="Kuantitas" width="100" textAlign="Center" headerTextAlign="Center" />
                                    <ColumnDirective field="sisa" headerText="Outstanding" width="100" textAlign="Center" headerTextAlign="Center" />
                                    <ColumnDirective
                                        field="berat"
                                        headerText="Berat"
                                        width="100"
                                        textAlign="Center"
                                        headerTextAlign="Center"
                                        template={(props: any) => {
                                            return <span>{props.berat ? parseFloat(props.berat).toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                        }}
                                    />
                                    <ColumnDirective field="kode_mu" headerText="MU" width="100" textAlign="Center" headerTextAlign="Center" />
                                    <ColumnDirective
                                        field="harga_mu"
                                        headerText="Harga"
                                        width="100"
                                        textAlign="Center"
                                        headerTextAlign="Center"
                                        template={(props: any) => {
                                            return <span>{props.harga_mu ? parseFloat(props.harga_mu).toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                        }}
                                    />
                                    <ColumnDirective
                                        field="diskon_mu"
                                        headerText="Diskon"
                                        width="100"
                                        textAlign="Center"
                                        headerTextAlign="Center"
                                        template={(props: any) => {
                                            return <span>{props.diskon_mu ? parseFloat(props.diskon_mu).toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                        }}
                                    />
                                    <ColumnDirective
                                        field="potongan_mu"
                                        headerText="Potongan"
                                        width="100"
                                        textAlign="Center"
                                        headerTextAlign="Center"
                                        template={(props: any) => {
                                            return <span>{props.potongan_mu ? parseFloat(props.potongan_mu).toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                        }}
                                    />
                                    <ColumnDirective
                                        field="pajak_mu"
                                        headerText="Pajak"
                                        width="100"
                                        textAlign="Center"
                                        headerTextAlign="Center"
                                        template={(props: any) => {
                                            return <span>{props.pajak_mu ? parseFloat(props.pajak_mu).toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                        }}
                                    />
                                    <ColumnDirective
                                        field="jumlah_mu"
                                        headerText="jumlah_mu"
                                        width="100"
                                        textAlign="Center"
                                        headerTextAlign="Center"
                                        template={(props: any) => {
                                            return <span>{props.jumlah_mu ? parseFloat(props.jumlah_mu).toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                        }}
                                    />
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

            {isLoadingPembatalan && <Loader />}

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

            {modalHandleDataFPAC && (
                <DialogCreateFPAC
                    userid={userid}
                    kode_entitas={kode_entitas}
                    isOpen={modalHandleDataFPAC}
                    onClose={() => {
                        setModalHandleDataFPAC(false);
                        setStatusPage('');
                    }}
                    kode_user={kode_user}
                    onRefresh={refreshData}
                    kode_dokumen={selectedRow}
                    isApprovalCabang={isApprovalCabang}
                    isApprovalPusat={isApprovalPusat}
                    statusPage={statusPage}
                    token={token}
                    selectedItem={selectedItems}
                    isDisabled={isDisabled}
                />
            )}

            {showModalPembatalan && (
                <DialogPembatalanFPAC
                    isOpen={showModalPembatalan}
                    onClose={() => {
                        setShowModalPembatalan(false);
                    }}
                    onBatal={handlePembatalanFPACSubmit}
                    data={data.data}
                    kode_entitas={kode_entitas}
                />
            )}
        </div>
    );
};

export default FPACList;
