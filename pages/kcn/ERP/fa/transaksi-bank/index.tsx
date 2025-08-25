import { useSession } from '@/pages/api/sessionContext';
import { useRef, useState, useEffect, Fragment } from 'react';
import moment from 'moment';
import { useRouter } from 'next/router';
import axios from 'axios';

import { Tab } from '@headlessui/react';
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
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { MenuEventArgs } from '@syncfusion/ej2-react-splitbuttons';
import { SidebarComponent, SidebarType, ContextMenuComponent, MenuItemModel /*Tab, TabComponent*/ } from '@syncfusion/ej2-react-navigations';
import { Dialog, DialogComponent, Tooltip, TooltipComponent, TooltipEventArgs, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { AggregateColumnsDirective, AggregateColumnDirective, AggregateDirective, AggregatesDirective } from '@syncfusion/ej2-react-grids';

import Draggable from 'react-draggable';
import PerfectScrollbar from 'react-perfect-scrollbar';

import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json'; // To load the culture based first day of week
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
import idIDLocalization from 'public/syncfusion/locale.json';
import { faArrowRightToFile, faFile, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { myAlertGlobal, usersMenu } from '@/utils/routines';
import './customStyles/styles.module.css';
import { ProgressBarComponent, ProgressAnnotation } from '@syncfusion/ej2-react-progressbar';
import { myAlertGlobal2 } from '@/utils/global/fungsi';
import { handleCekExistingTrx, handleCheckboxChange, handleEntitasAll, handleInputChange, handleRefreshDataList } from './handler/fungsi';
import { Aggregate } from '@syncfusion/ej2/grids';
import TransaksiBank from './components/transaksiBank';
import JurnalBank from './components/jurnalbank';

L10n.load(idIDLocalization);

interface UserMenuState {
    baru: any;
    edit: any;
    hapus: any;
    cetak: any;
}

type TrxListField = {
    kode_transaksi_1: any;
    no_transaksi_1: any;
    tgl_transaksi: any;
    total_BRI_1: any;
    kode_transaksi_2: any;
    no_transaksi_2: any;
    total_BRI_2: any;
    kode_transaksi_3: any;
    no_transaksi_3: any;
    total_BCA_3: any;
    kode_transaksi_4: any;
    no_transaksi_4: any;
    total_BCA_4: any;
    kode_transaksi_5: any;
    no_transaksi_5: any;
    total_BCA_5: any;
    total_All: any;
    userid: any;
    status_jurnal_1: any;
    status_jurnal_2: any;
    status_jurnal_3: any;
    status_jurnal_4: any;
    status_jurnal_5: any;
    warna1: any;
    warna2: any;
    warna3: any;
    warna4: any;
    warna5: any;
};

type TrxField = {
    kode_transaksi: any;
    no_transaksi: any;
    userid: any;
    tgl_transaksi: any;
    nominal_ready: any;
    total_bayar: any;
    transaksi_bank: any;
    jenis_transaksi: any;
    transaksi_ke: any;
    status_jurnal: any;
    warna: any;
    status_form: any;
};

// Add interface for tglTransaksi type
interface TglTransaksi {
    tgl_transaksi: any;
    // Add other properties if needed
}

let dgTrxBankList: Grid;
const TransaksiBankList = () => {
    let dgJurnalBankList: Grid | any;

    let sidebarObj: SidebarComponent;
    let type: SidebarType = 'Push';
    let mediaQueryState: string = '(min-width: 600px)';
    let selectDataGrid: any[] = [];

    const [userMenu, setUserMenu] = useState<UserMenuState>({ baru: '', edit: '', hapus: '', cetak: '' });
    const kode_menu = '60505';
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const gridWidth = '100%';
    //sidebarVisible ? 'calc(100% - 315px)' : '100%';
    const [gridHeight, setGridHeight] = useState<number>(0);
    const styleButton = {
        clasname: 'rounded bg-blue-600 px-4 py-2 text-white',
        width: 57 + 'px',
        height: '28px',
        marginBottom: '0.5em',
        marginTop: 0.5 + 'em',
        marginRight: 0.8 + 'em',
        backgroundColor: '#3b3f5c',
    };

    const [modalJenisTransaksi, setModalJenisTransaksi] = useState(false);
    const [jenisTransaksi, setJenisTransaksi] = useState<any>(1);

    const [modalTrxBank, setModalTrxBank] = useState(false);

    const [modalJurnalBank, setModalJurnalBank] = useState(false);
    const [listEntitas, setListEntitas] = useState<any>([]);

    const [recordsDataDetailList, setRecordsDataDetailList] = useState<TrxListField[]>([]);
    const [recordsTransaksi, setRecordsTransaksi] = useState<TrxField[]>([]);
    const [tglTransaksi, setTglTransaksi] = useState<TglTransaksi[]>([]);

    const router = useRouter();
    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';
    const [masterKodeTransaksi, setMasterKodeTransaksi] = useState<string>('');
    const [masterDataState, setMasterDataState] = useState<string>('');
    const [masterNamaBank, setMasterNamaBank] = useState<string>('');
    const [masterTransaksiKe, setMasterTransaksiKe] = useState(0);

    const [isLoadingProgress, setIsLoadingProgress] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [displayedProgress, setDisplayedProgress] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState('Loading Data...');
    const [activeTab, setActiveTab] = useState('listTransaksi');

    // const stateDokumen = {
    //     kode_entitas: kode_entitas,
    //     userid: userid,
    //     kode_user: kode_user,
    //     token: token,
    //     masterKodeDokumen: masterKodeTransaksi,
    //     masterDataState: masterDataState,
    //     masterNamaBank: masterNamaBank,
    //     masterTransaksiKe: masterTransaksiKe,
    //     masterJenisTransaksi: jenisTransaksi,
    // };

    const [stateDokumen, setStateDokumen] = useState({
        kode_entitas: sessionData?.kode_entitas ?? '',
        userid: sessionData?.userid ?? '',
        kode_user: sessionData?.kode_user ?? '',
        token: sessionData?.token ?? '',
        masterKodeDokumen: '',
        masterDataState: '',
        masterNamaBank: '',
        masterTransaksiKe: 1,
        masterJenisTransaksi: 1,
        statusJurnal: 'N',
    });

    // const onCreate = () => {
    //     sidebarObj.element.style.visibility = '';
    // };

    const toggleClick = () => {
        setSidebarVisible(true);
    };
    const closeClick = () => {
        setSidebarVisible(false);
    };

    useEffect(() => {
        const calculateGridHeight = () => {
            const windowHeight = window.innerHeight;
            // Kurangi tinggi header (180px) dan elemen pencarian (~40px)
            const availableHeight = windowHeight - 220;
            setGridHeight(availableHeight);
        };

        calculateGridHeight();
        window.addEventListener('resize', calculateGridHeight);

        return () => {
            window.removeEventListener('resize', calculateGridHeight);
        };
    }, []);

    useEffect(() => {
        // console.log('useEffects');
        if (token !== '') {
            const fetchDataRefresh = async () => {
                await handleRefreshDataList(
                    paramList,
                    setRecordsDataDetailList,
                    setRecordsTransaksi,
                    setTglTransaksi,
                    dgTrxBankList,
                    token,
                    'bank',
                    setIsLoadingProgress,
                    setProgressValue,
                    setDisplayedProgress,
                    setLoadingMessage
                );

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
            };
            // console.log(stateDokumen);
            fetchDataRefresh();
        }
    }, [token]);

    const zeroValueAccessor = (field: string, data: any, column: any) => {
        return data[field] === 0 ? '' : data[field]; // If the value is 0, return empty string
    };

    const qtyParams = { params: { format: 'N2', decimals: 4, showClearButton: false, showSpinButton: false } };
    const formatFloat: Object = { skeleton: 'C2', format: ',0.####;-,0.#####;#', maximumFractionDigits: 2 };
    const formatFloat2: Object = { format: ',0.####;-,0.####;#', maximumFractionDigits: 3 };

    // const formatFloat: Object = { format: 'N2', maximumFractionDigits: 2 };

    const headerTemplateBri1 = () => {
        return <div className="bg-red-700 text-white">SETORAN CAB - 1</div>;
    };
    const headerTemplateBri2 = () => {
        return <div className="bg-red-700 text-white">SETORAN CAB - 2</div>;
    };
    const headerTemplateBca1 = () => {
        return <div className="bg-blue-700 text-white">BCA - 1</div>;
    };
    const headerTemplateBca2 = () => {
        return <div className="bg-blue-700 text-white">BCA - 2</div>;
    };
    const headerTemplateBca3 = () => {
        return <div className="bg-blue-700 text-white">BCA- 3</div>;
    };

    const createStatusCell = (data: any, statusKey: string) => {
        return `
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <div style="color: green; font-weight: bold; font-size: 14px;">
                ${
                    data[statusKey] === 'Y'
                        ? `
                <div style="position: relative; display: inline-block;">
                    <input
                        readOnly="true"
                        style="width: 100%; height: 100%; text-align: left; background-color: transparent; border-radius: 5px; font-size: 16px;"
                        value="✔"
                    />
                </div>`
                        : ''
                }
            </div>
            ${
                data[statusKey] === 'Y'
                    ? `
            <div class="icon-container" style="cursor: pointer;" title="Lihat Jurnal">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" id="Hand-Held-Tablet-Writing--Streamline-Core" height="16" width="16"><desc>Hand Held Tablet Writing Streamline Icon: https://streamlinehq.com</desc><g id="hand-held-tablet-writing--tablet-kindle-device-electronics-ipad-writing-digital-paper-notepad"><path id="Union" fill="#8fbffa" fill-rule="evenodd" d="M1.867 0.094C0.923 0.094 0.203 0.879 0.203 1.79v10.418c0 0.912 0.72 1.697 1.664 1.697h8.225c0.944 0 1.664 -0.785 1.664 -1.697V1.844a1.75 1.75 0 0 0 -1.75 -1.75H1.867Z" clip-rule="evenodd" stroke-width="1"></path><path id="Union_2" fill="#2859c5" fill-rule="evenodd" d="M0.953 10.25h-0.75l0 0.75 0 1.21c0 0.911 0.72 1.696 1.664 1.696h8.225c0.944 0 1.664 -0.785 1.664 -1.697l0 -1.209 0 -0.75H0.953Z" clip-rule="evenodd" stroke-width="1"></path><path id="Union_3" fill="#2859c5" fill-rule="evenodd" d="M2.828 3.007a0.625 0.625 0 0 0 0 1.25h2.495a0.625 0.625 0 1 0 0 -1.25H2.828Zm0 2.868a0.625 0.625 0 0 0 0 1.25h1.248a0.625 0.625 0 1 0 0 -1.25H2.828Z" clip-rule="evenodd" stroke-width="1"></path><path id="Vector" fill="#2859c5" d="M9.402 7.394a0.5 0.5 0 0 1 -0.266 0.14l-2.148 0.386a0.5 0.5 0 0 1 -0.582 -0.573l0.359 -2.182a0.5 0.5 0 0 1 0.14 -0.273L11.021 0.796a1 1 0 0 1 1.42 0l1.06 1.06a1 1 0 0 1 0 1.42L9.402 7.394Z" stroke-width="1"></path></g></svg>
            </div>`
                    : // : ''
                      `
            <div class="icon-container" style="cursor: pointer;" title="Lihat Jurnal">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" id="Hand-Held-Tablet-Writing--Streamline-Core" height="16" width="16"><desc>Hand Held Tablet Writing Streamline Icon: https://streamlinehq.com</desc><g id="hand-held-tablet-writing--tablet-kindle-device-electronics-ipad-writing-digital-paper-notepad"><path id="Union" fill="#8fbffa" fill-rule="evenodd" d="M1.867 0.094C0.923 0.094 0.203 0.879 0.203 1.79v10.418c0 0.912 0.72 1.697 1.664 1.697h8.225c0.944 0 1.664 -0.785 1.664 -1.697V1.844a1.75 1.75 0 0 0 -1.75 -1.75H1.867Z" clip-rule="evenodd" stroke-width="1"></path><path id="Union_2" fill="#2859c5" fill-rule="evenodd" d="M0.953 10.25h-0.75l0 0.75 0 1.21c0 0.911 0.72 1.696 1.664 1.696h8.225c0.944 0 1.664 -0.785 1.664 -1.697l0 -1.209 0 -0.75H0.953Z" clip-rule="evenodd" stroke-width="1"></path><path id="Union_3" fill="#2859c5" fill-rule="evenodd" d="M2.828 3.007a0.625 0.625 0 0 0 0 1.25h2.495a0.625 0.625 0 1 0 0 -1.25H2.828Zm0 2.868a0.625 0.625 0 0 0 0 1.25h1.248a0.625 0.625 0 1 0 0 -1.25H2.828Z" clip-rule="evenodd" stroke-width="1"></path><path id="Vector" fill="#2859c5" d="M9.402 7.394a0.5 0.5 0 0 1 -0.266 0.14l-2.148 0.386a0.5 0.5 0 0 1 -0.582 -0.573l0.359 -2.182a0.5 0.5 0 0 1 0.14 -0.273L11.021 0.796a1 1 0 0 1 1.42 0l1.06 1.06a1 1 0 0 1 0 1.42L9.402 7.394Z" stroke-width="1"></path></g></svg>
            </div>`
            }
        </div>`;
    };

    const [selectedValue, setSelectedValue] = useState(null);
    const rowSelected = (args: any) => {
        // const selectedRowData = args.data;
        // const valueByName = selectedRowData.kode_transaksi_3; // Replace 'name' with your column name
        // setSelectedValue(valueByName);
        // getFieldNames();
    };

    const gridRef = useRef(null);
    const getFieldNames = () => {
        return dgTrxBankList.getSelectedColumnsUid().map((uid: any) => dgTrxBankList.getColumnByUid(uid).field);
        // if (gridRef.current && gridRef.current.columns) {
        //     const columns = gridRef.current.columns;
        //     const fieldNames = columns.map((column: any) => column.field);

        // }
    };

    const queryCellInfoListData = (args: any) => {
        const field = args.column?.field;
        const data = args.data;

        // const pengajuan = getValue('total_BCA_3', args.data);

        if (data) {
            if (field.startsWith('status_jurnal_')) {
                const statusIndex = field.split('_')[2]; // Extract the index from the field name
                // if (data[`status_jurnal_${statusIndex}`] === 'Y') {
                //     args.cell.innerHTML = createStatusCell(data, `status_jurnal_${statusIndex}`);
                //     // args.cell.setAttribute('title', `Status Jurnal: ${data[`status_jurnal_${statusIndex}`] === 'Y' ? 'Aktif' : 'Tidak Aktif'}`);
                //     const iconContainer = args.cell.querySelector('.icon-container');
                //     // if (iconContainer) {
                //     //     iconContainer.addEventListener('click', () => {

                //     //         // Aksi lain yang ingin dijalankan saat klik
                //     //     });
                //     // }
                // } else {
                //     args.cell.innerHTML = `<span class="crossmark"></span>`;
                // }
                if (data[`status_jurnal_${statusIndex}`] === 'Y' || data[`status_jurnal_${statusIndex}`] === 'N') {
                    args.cell.innerHTML = createStatusCell(data, `status_jurnal_${statusIndex}`);
                    // args.cell.setAttribute('title', `Status Jurnal: ${data[`status_jurnal_${statusIndex}`] === 'Y' ? 'Aktif' : 'Tidak Aktif'}`);
                    const iconContainer = args.cell.querySelector('.icon-container');
                    // if (iconContainer) {
                    //     iconContainer.addEventListener('click', () => {

                    //         // Aksi lain yang ingin dijalankan saat klik
                    //     });
                    // }
                } else {
                    args.cell.innerHTML = `<span class="crossmark"></span>`;
                }
            }
            const statusIndex = field.split('_')[2]; // Extract the index from the field name

            if (data[`warna${statusIndex}`] === 'Y') {
                args.cell.style.color = 'red';
                // args.cell.style.backgroundColor = 'red';
            }
        }
    };

    const [formListState, setFormListState] = useState({
        chbTanggal: true,
        edTglAwal1: moment().format('YYYY-MM-DD'),
        edTglAkhir1: moment().endOf('month'),
    });

    const paramList = {
        entitas: kode_entitas,
        // param1: '2024-01-01',
        // param2: '2024-01-31',
        param1: formListState.chbTanggal ? formListState.edTglAwal1 : '2000-01-01', //'all',
        param2: formListState.chbTanggal ? moment(formListState.edTglAkhir1).format('YYYY-MM-DD') : 'all', // tglAkhir.format('YYYY-MM-DD') : 'all',
    };
    const roundUp = (value: number) => Math.ceil(value * 100) / 100;
    const filterRecordsByDate = async () => {
        let vtA: TrxListField[] = [];

        for (const record of tglTransaksi) {
            // console.log('record ', record);
            const filterTrxBankList = recordsTransaksi.filter((item) => item.tgl_transaksi === record.tgl_transaksi);
            if (filterTrxBankList.length > 0) {
                const objectVT: TrxListField = {
                    kode_transaksi_1: '',
                    no_transaksi_1: '',
                    tgl_transaksi: record.tgl_transaksi,
                    total_BRI_1: '',
                    kode_transaksi_2: '',
                    no_transaksi_2: '',
                    total_BRI_2: '',
                    kode_transaksi_3: '',
                    no_transaksi_3: '',
                    total_BCA_3: '',
                    kode_transaksi_4: '',
                    no_transaksi_4: '',
                    total_BCA_4: '',
                    kode_transaksi_5: '',
                    no_transaksi_5: '',
                    total_BCA_5: '',
                    total_All: '',
                    userid: filterTrxBankList[0].userid,
                    status_jurnal_1: '',
                    status_jurnal_2: '',
                    status_jurnal_3: '',
                    status_jurnal_4: '',
                    status_jurnal_5: '',
                    warna1: '',
                    warna2: '',
                    warna3: '',
                    warna4: '',
                    warna5: '',
                };

                let recordForDate = { ...objectVT };
                // console.log('filterTrxBankList forEach ', filterTrxBankList);

                filterTrxBankList.forEach((trx) => {
                    if (trx.transaksi_bank === 'SETORAN CAB') {
                        if (trx.transaksi_ke === 1) {
                            recordForDate = {
                                ...recordForDate,
                                kode_transaksi_1: trx.kode_transaksi,
                                no_transaksi_1: trx.no_transaksi,
                                total_BRI_1: roundUp(trx.total_bayar),
                                status_jurnal_1: trx.status_jurnal,
                                warna1: trx.warna,
                            };
                        } else if (trx.transaksi_ke === 2) {
                            recordForDate = {
                                ...recordForDate,
                                kode_transaksi_2: trx.kode_transaksi,
                                no_transaksi_2: trx.no_transaksi,
                                total_BRI_2: roundUp(trx.total_bayar),
                                status_jurnal_2: trx.status_jurnal,
                                warna2: trx.warna,
                            };
                        }
                    } else if (trx.transaksi_bank === 'BCA') {
                        if (trx.transaksi_ke === 1) {
                            recordForDate = {
                                ...recordForDate,
                                kode_transaksi_3: trx.kode_transaksi,
                                no_transaksi_3: trx.no_transaksi,
                                total_BCA_3: roundUp(trx.total_bayar),
                                status_jurnal_3: trx.status_jurnal,
                                warna3: trx.warna,
                            };
                        } else if (trx.transaksi_ke === 2) {
                            recordForDate = {
                                ...recordForDate,
                                kode_transaksi_4: trx.kode_transaksi,
                                no_transaksi_4: trx.no_transaksi,
                                total_BCA_4: roundUp(trx.total_bayar),
                                status_jurnal_4: trx.status_jurnal,
                                warna4: trx.warna,
                            };
                        } else if (trx.transaksi_ke === 3) {
                            recordForDate = {
                                ...recordForDate,
                                kode_transaksi_5: trx.kode_transaksi,
                                no_transaksi_5: trx.no_transaksi,
                                total_BCA_5: roundUp(trx.total_bayar),
                                status_jurnal_5: trx.status_jurnal,
                                warna5: trx.warna,
                            };
                        }
                    }
                });

                // console.log('recordForDate ', recordForDate);

                vtA.push(recordForDate);

                // Calculate total_All
                const total = [recordForDate.total_BRI_1 || 0, recordForDate.total_BRI_2 || 0, recordForDate.total_BCA_3 || 0, recordForDate.total_BCA_4 || 0, recordForDate.total_BCA_5 || 0].reduce(
                    (sum, val) => sum + (parseFloat(val) || 0),
                    0
                );

                recordForDate.total_All = roundUp(total);
                // vtA.push(recordForDate);
            }
        }

        setTimeout(() => {
            console.log('vtA ', vtA);
            setRecordsDataDetailList(vtA);
        }, 500);
        // dgTrxBankList.refresh();
    };

    const handleNavigateLink = async (argsCellIndex: any, jenis: any) => {
        // if (argsCellIndex === 0) {
        //     // setMasterNamaBank('BRI');
        //     setStateDokumen((prevState: any) => ({
        //         ...prevState,
        //         masterNamaBank: 'BRI',
        //     }));
        // } else if (argsCellIndex === 1) {
        //     setMasterNamaBank('BCA');
        // }
        setStateDokumen((prevState: any) => ({
            ...prevState,
            kode_entitas: sessionData?.kode_entitas ?? '',
            userid: sessionData?.userid ?? '',
            kode_user: sessionData?.kode_user ?? '',
            token: sessionData?.token ?? '',
        }));
        // if (stateDokumen.masterDataState === 'BARU') {
        if (jenis === 'baru') {
            // console.log('masuk sini');
            const modalIndex = [0, 1, 3, 5, 7, 9].includes(argsCellIndex) ? 'modalTrxBank' : 'modalJurnalBank';

            if (modalIndex === 'modalTrxBank') {
                // await handleCekExistingTrx(kode_entitas, argsCellIndex, token).then((result: any) => {

                //     setMasterTransaksiKe(result);
                // });
                await handleCekExistingTrx(kode_entitas, stateDokumen.masterJenisTransaksi, token).then((result: any) => {
                    // setMasterTransaksiKe(result);

                    if (result === 'false BRI') {
                        myAlertGlobal('Transaksi SETORAN CAB sudah melebihi batas harian.', 'trxBankList');
                        setModalJenisTransaksi(false);
                    } else if (result === 'false BCA') {
                        myAlertGlobal('Transaksi BCA sudah melebihi batas harian.', 'trxBankList');
                        setModalJenisTransaksi(false);
                    } else {
                        // console.log('masuk else ');
                        setStateDokumen((prevState: any) => ({
                            ...prevState,
                            kode_entitas: sessionData?.kode_entitas ?? '',
                            userid: sessionData?.userid ?? '',
                            kode_user: sessionData?.kode_user ?? '',
                            token: sessionData?.token ?? '',
                            masterNamaBank: prevState.masterJenisTransaksi === 0 ? 'SETORAN CAB' : 'BCA',
                            masterTransaksiKe: result,
                            masterKodeDokumen: '',
                            // masterDataState: '',
                            statusJurnal: 'N',
                        }));
                        setModalTrxBank(true);
                        setModalJenisTransaksi(false);
                    }
                });
            } else if (modalIndex === 'modalJurnalBank') {
                setModalJurnalBank(true);
            }
            // } else if (stateDokumen.masterDataState === 'EDIT') {
        } else if (jenis === 'edit') {
            // console.log('masuk else');
            const modalIndex = [0, 1, 3, 5, 7, 9].includes(argsCellIndex) ? 'modalTrxBank' : 'modalJurnalBank';
            if (modalIndex === 'modalTrxBank') {
                setModalTrxBank(true);
            } else if (modalIndex === 'modalJurnalBank') {
                setModalJurnalBank(true);
            }
        }
    };
    const fetchDataAll = async () => {
        const resultEntitas = await handleEntitasAll(kode_entitas, setListEntitas, token);
        // console.log('resultEntitas ', resultEntitas);
        setListEntitas(resultEntitas);
    };

    // useEffect(() => {
    //     const fetchData = async () => {
    //         // dgTrxBankList;
    //         if (recordsTransaksi.length > 0 && tglTransaksi.length > 0) {
    //             await filterRecordsByDate();
    //         }
    //     };
    //     fetchData();
    // }, [recordsTransaksi, tglTransaksi]);

    const changeModalJenisTransaksi = (value: any) => {
        // setJenisTransaksi(value);
        setStateDokumen((prevState: any) => ({
            ...prevState,
            masterNamaBank: value === 0 ? 'SETORAN CAB' : 'BCA',
            masterJenisTransaksi: value,
        }));
    };

    return (
        <>
            <div className="main min-h-screen" id="trxBankList">
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
                <div className="w-full rounded-md border-b bg-white p-2 shadow-[2px_2px_8px_rgba(0,0,0,0.25)]">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-3">
                            <ButtonComponent
                                // className="rounded bg-blue-600 px-4 py-2 text-white"
                                id="btnBaru"
                                cssClass="e-primary e-small"
                                style={styleButton}
                                // disabled={disabledBaru}
                                disabled={userMenu.baru === 'Y' || userid === 'administrator' ? false : true}
                                onClick={() => {
                                    // setMasterDataState('BARU');
                                    setStateDokumen((prevState: any) => ({
                                        ...prevState,
                                        kode_entitas: sessionData?.kode_entitas ?? '',
                                        userid: sessionData?.userid ?? '',
                                        kode_user: sessionData?.kode_user ?? '',
                                        token: sessionData?.token ?? '',
                                        masterKodeDokumen: '',
                                        masterDataState: 'BARU',
                                    }));
                                    setModalJenisTransaksi(true);
                                    fetchDataAll();
                                }}
                                content="Baru"
                            ></ButtonComponent>
                            {/* <ButtonComponent
                                // className="rounded bg-blue-600 px-4 py-2 text-white"
                                id="btnEdit"
                                cssClass="e-primary e-small"
                                style={styleButton}
                                disabled={userMenu.edit === 'Y' || userid === 'administrator' ? false : true}
                                // disabled={disabledEdit}
                                onClick={() => {

                                    selectDataGrid = dgTrxBankList.getSelectedRecords();

                                    if (selectDataGrid.length > 0) {
                                        // setMasterDataState('EDIT');
                                    } else {
                                        myAlertGlobal('Silahkan Pilih data yang akan di edit', 'fpmbList');
                                        return;
                                    }
                                }}
                                content="Ubah"
                            ></ButtonComponent> */}
                            <ButtonComponent
                                // className="rounded bg-gray-300 px-4 py-2 text-white"
                                content="Filter"
                                id="btnFilter"
                                type="submit"
                                cssClass="e-primary e-small"
                                style={sidebarVisible ? { width: '57px', height: '28px', marginBottom: '0.5em', marginTop: '0.5em', marginRight: '0.8em' } : { ...styleButton, color: 'white' }}
                                onClick={toggleClick}
                                disabled={sidebarVisible}
                            ></ButtonComponent>
                        </div>
                        <div className="text-right">
                            <div className="ml-auto text-right text-lg font-semibold">Form Transaksi & Jurnal Bank</div>
                        </div>
                    </div>
                </div>
                <div className="flex">
                    <div className="mt-2 w-full items-center justify-between rounded-md border-b bg-white p-2 shadow-[2px_2px_8px_rgba(0,0,0,0.25)] ">
                        <div
                            id="main-content"
                            // style={{ position: 'sticky', height: 'calc(100vh - 130px)', overflow: 'hidden' }}
                            className="flex flex-col gap-1 overflow-auto"
                        >
                            <div className="flex flex-none items-center justify-between px-3">
                                <div className="flex items-center gap-3">
                                    <CheckBoxComponent
                                        label="Tanggal Approval"
                                        name="chbTanggal"
                                        checked={formListState.chbTanggal}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            handleCheckboxChange('chbTanggal', value, setFormListState);
                                        }}
                                    />
                                    <div className={`grid grid-cols-1 justify-between gap-1 sm:flex `}>
                                        <div className="form-input mt-1 flex justify-between">
                                            <DatePickerComponent
                                                locale="id"
                                                name="edTglAwal1"
                                                cssClass="e-custom-style"
                                                // renderDayCell={onRenderDayCell}
                                                enableMask={true}
                                                maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                showClearButton={false}
                                                format="dd-MM-yyyy"
                                                // value={moment(formListState.edTglAwal1).toDate()}
                                                value={moment(formListState.edTglAwal1).toDate()}
                                                change={(args: ChangeEventArgsCalendar) => {
                                                    handleInputChange('edTglAwal1', moment(args.value).format('YYYY-MM-DD'), 'chbTanggal', setFormListState);
                                                }}
                                            >
                                                <Inject services={[MaskedDateTime]} />
                                            </DatePickerComponent>
                                        </div>
                                        <p className="set-font-11 ml-0.5 mr-0.5 mt-3 flex justify-between">s/d</p>
                                        <div className="form-input mt-1 flex justify-between">
                                            <DatePickerComponent
                                                locale="id"
                                                name="edTglAkhir1"
                                                cssClass="e-custom-style"
                                                // renderDayCell={onRenderDayCell}
                                                enableMask={true}
                                                maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                showClearButton={false}
                                                format="dd-MM-yyyy"
                                                value={moment(formListState.edTglAkhir1).toDate()} //{tglAkhir.toDate()}
                                                // onChange={(args: any) => handleInputChange(args.target.name, moment(args.value).format('YYYY-MM-DD'), 'chbTanggal')}
                                                change={(args: ChangeEventArgsCalendar) => {
                                                    handleInputChange('edTglAkhir1', moment(args.value).format('YYYY-MM-DD'), 'chbTanggal', setFormListState);
                                                }}
                                            >
                                                <Inject services={[MaskedDateTime]} />
                                            </DatePickerComponent>
                                        </div>
                                    </div>
                                    <TooltipComponent content="Refresh data yang ditampilkan" opensOn="Hover" openDelay={1000} position="BottomCenter">
                                        <ButtonComponent
                                            cssClass="e-primary e-small"
                                            iconCss="e-icons e-medium e-refresh"
                                            content="Refresh Data"
                                            style={{ backgroundColor: '#3b3f5c' }}
                                            onClick={async () => {
                                                await handleRefreshDataList(
                                                    paramList,
                                                    setRecordsDataDetailList,
                                                    setRecordsTransaksi,
                                                    setTglTransaksi,
                                                    dgTrxBankList,
                                                    token,
                                                    'bank',
                                                    setIsLoadingProgress,
                                                    setProgressValue,
                                                    setDisplayedProgress,
                                                    setLoadingMessage
                                                );
                                                dgTrxBankList.refresh();
                                                // console.log();
                                            }}
                                        />
                                    </TooltipComponent>
                                </div>
                            </div>

                            <div>
                                <div className="flex h-full flex-col">
                                    <div className="flex h-[5%] overflow-auto">
                                        <div className=" flex border-b border-gray-300">
                                            <button
                                                onClick={() => setActiveTab('listTransaksi')}
                                                className={`px-3 py-2 text-xs font-semibold ${
                                                    activeTab === 'listTransaksi' ? 'border-b-2 border-orange-500 text-black' : 'text-gray-500 hover:text-black'
                                                }`}
                                            >
                                                List Transaksi Bank
                                            </button>
                                            <button
                                                hidden
                                                onClick={() => setActiveTab('listJurnal')}
                                                className={`px-3 py-2 text-xs font-semibold ${
                                                    activeTab === 'listJurnal' ? 'border-b-2 border-orange-500 text-black' : 'text-gray-500 hover:text-black'
                                                }`}
                                            >
                                                List Jurnal Transaksi Bank
                                            </button>
                                        </div>
                                    </div>

                                    {/* <div className="e-content"> */}
                                    <div className={`${activeTab === 'listTransaksi' ? 'block' : 'hidden'}`}>
                                        {/* <div className="panel-data h-full w-full"> */}
                                        <div
                                            className="h-full"
                                            // style={{ background: '#dedede', width: '100%', height: 'calc(100vh - 200px)' }}
                                        >
                                            <GridComponent
                                                id="dgBankList"
                                                locale="id"
                                                ref={(g) => (dgTrxBankList = g as GridComponent)}
                                                dataSource={recordsDataDetailList}
                                                allowExcelExport={true}
                                                selectionSettings={{
                                                    mode: 'Both',
                                                    type: 'Single',
                                                }}
                                                allowPaging={true}
                                                allowSorting={true}
                                                allowFiltering={false}
                                                // allowResizing={true}
                                                // autoFit={true}
                                                allowReordering={true}
                                                pageSettings={{
                                                    pageSize: 25,
                                                    pageCount: 5,
                                                    pageSizes: ['25', '50', '100', 'All'],
                                                }}
                                                rowHeight={22}
                                                width={'100%'}
                                                height={'100%'}
                                                gridLines={'Both'}
                                                recordDoubleClick={async (args: any) => {
                                                    // if (dgTrxBankList) {
                                                    //     setMasterDataState('EDIT');
                                                    //     const cellIndex = args.cellIndex;
                                                    //     const transactionKeys = ['kode_transaksi_1', 'kode_transaksi_2', 'kode_transaksi_3', 'kode_transaksi_4', 'kode_transaksi_5'];
                                                    //     const index = Math.floor(cellIndex / 2); // Calculate the index based on cellIndex
                                                    //     if (index < transactionKeys.length) {
                                                    //         handleNavigateLink(cellIndex);
                                                    //         setMasterKodeTransaksi(args.rowData[transactionKeys[index]]);
                                                    //     }
                                                    // }

                                                    if (dgTrxBankList) {
                                                        // console.log('args.cellInde ', args.cellIndex);
                                                        if (args.cellIndex === 1) {
                                                            // setMasterDataState('EDIT');
                                                            // setMasterKodeTransaksi(args.rowData.kode_transaksi_1);

                                                            // setTimeout(() => {
                                                            //     setMasterNamaBank('BRI');
                                                            //     setMasterTransaksiKe(1);
                                                            // }, 2000);
                                                            setStateDokumen((prevState: any) => ({
                                                                ...prevState,
                                                                masterKodeDokumen: args.rowData.kode_transaksi_1,
                                                                masterDataState: 'EDIT',
                                                                masterNamaBank: 'SETORAN CAB',
                                                                masterTransaksiKe: 1,
                                                                masterJenisTransaksi: 0,
                                                                statusJurnal: args.rowData.status_jurnal_1,
                                                            }));
                                                            handleNavigateLink(1, 'edit');
                                                        } else if (args.cellIndex === 3) {
                                                            // setMasterDataState('EDIT');
                                                            // setMasterKodeTransaksi(args.rowData.kode_transaksi_2);

                                                            // setTimeout(() => {
                                                            //     setMasterNamaBank('BRI');
                                                            //     setMasterTransaksiKe(2);
                                                            // }, 2000);
                                                            setStateDokumen((prevState: any) => ({
                                                                ...prevState,
                                                                masterKodeDokumen: args.rowData.kode_transaksi_2,
                                                                masterDataState: 'EDIT',
                                                                masterNamaBank: 'SETORAN CAB',
                                                                masterTransaksiKe: 2,
                                                                masterJenisTransaksi: 0,
                                                                statusJurnal: args.rowData.status_jurnal_2,
                                                            }));
                                                            handleNavigateLink(3, 'edit');
                                                        } else if (args.cellIndex === 5) {
                                                            // setMasterDataState('EDIT');
                                                            // setMasterKodeTransaksi(args.rowData.kode_transaksi_3);
                                                            // stateDokumen.masterTransaksiKe = 1;
                                                            // setTimeout(() => {
                                                            //     // setMasterNamaBank('BCA');
                                                            //     // setMasterTransaksiKe(100);

                                                            // }, 50);
                                                            setStateDokumen((prevState: any) => ({
                                                                ...prevState,
                                                                masterKodeDokumen: args.rowData.kode_transaksi_3,
                                                                masterDataState: 'EDIT',
                                                                masterNamaBank: 'BCA',
                                                                masterTransaksiKe: 1,
                                                                masterJenisTransaksi: 1,
                                                                statusJurnal: args.rowData.status_jurnal_3,
                                                            }));
                                                            handleNavigateLink(5, 'edit');
                                                        } else if (args.cellIndex === 7) {
                                                            // setMasterDataState('EDIT');
                                                            // setMasterKodeTransaksi(args.rowData.kode_transaksi_4);

                                                            // setTimeout(() => {
                                                            //     setMasterNamaBank('BCA');
                                                            //     setMasterTransaksiKe(2);
                                                            // }, 2000);
                                                            setStateDokumen((prevState: any) => ({
                                                                ...prevState,
                                                                masterKodeDokumen: args.rowData.kode_transaksi_4,
                                                                masterDataState: 'EDIT',
                                                                masterNamaBank: 'BCA',
                                                                masterTransaksiKe: 2,
                                                                masterJenisTransaksi: 1,
                                                                statusJurnal: args.rowData.status_jurnal_4,
                                                            }));
                                                            handleNavigateLink(7, 'edit');
                                                        } else if (args.cellIndex === 9) {
                                                            // setMasterDataState('EDIT');
                                                            // setMasterKodeTransaksi(args.rowData.kode_transaksi_5);

                                                            // setTimeout(() => {
                                                            //     setMasterNamaBank('BCA');
                                                            //     setMasterTransaksiKe(3);
                                                            // }, 2000);
                                                            setStateDokumen((prevState: any) => ({
                                                                ...prevState,
                                                                masterKodeDokumen: args.rowData.kode_transaksi_5,
                                                                masterDataState: 'EDIT',
                                                                masterNamaBank: 'BCA',
                                                                masterTransaksiKe: 3,
                                                                masterJenisTransaksi: 1,
                                                                statusJurnal: args.rowData.status_jurnal_5,
                                                            }));
                                                            handleNavigateLink(9, 'edit');
                                                        } else if (args.cellIndex === 2) {
                                                            if (args.rowData.status_jurnal_1 === 'Y') {
                                                                // setMasterDataState('EDIT');
                                                                // setMasterKodeTransaksi(args.rowData.kode_transaksi_1);
                                                                // setTimeout(() => {
                                                                //     setMasterNamaBank('BRI');
                                                                //     setMasterTransaksiKe(1);
                                                                // }, 2000);
                                                                setStateDokumen((prevState: any) => ({
                                                                    ...prevState,
                                                                    masterKodeDokumen: args.rowData.kode_transaksi_1,
                                                                    masterDataState: 'EDIT',
                                                                    masterNamaBank: 'SETORAN CAB',
                                                                    masterTransaksiKe: 1,
                                                                    masterJenisTransaksi: 0,
                                                                    statusJurnal: args.rowData.status_jurnal_1,
                                                                }));
                                                                handleNavigateLink(2, 'edit');
                                                            } else if (args.rowData.status_jurnal_1 === 'N') {
                                                                // setMasterDataState('BARU');
                                                                // setMasterKodeTransaksi(args.rowData.kode_transaksi_1);
                                                                // setTimeout(() => {
                                                                //     setMasterNamaBank('BRI');
                                                                //     setMasterTransaksiKe(1);
                                                                // }, 2000);
                                                                setStateDokumen((prevState: any) => ({
                                                                    ...prevState,
                                                                    masterKodeDokumen: args.rowData.kode_transaksi_1,
                                                                    masterDataState: 'BARU',
                                                                    masterNamaBank: 'SETORAN CAB',
                                                                    masterTransaksiKe: 1,
                                                                    masterJenisTransaksi: 0,
                                                                    statusJurnal: args.rowData.status_jurnal_1,
                                                                }));
                                                                handleNavigateLink(2, 'baru');
                                                            }
                                                        } else if (args.cellIndex === 4) {
                                                            console.log('args.rowData.status_jurnal_2 ', args.rowData.status_jurnal_2);
                                                            if (args.rowData.status_jurnal_2 === 'Y') {
                                                                // setMasterDataState('EDIT');
                                                                // setMasterKodeTransaksi(args.rowData.kode_transaksi_2);
                                                                // setTimeout(() => {
                                                                //     setMasterNamaBank('BRI');
                                                                //     setMasterTransaksiKe(2);
                                                                // }, 2000);
                                                                // handleNavigateLink(4);
                                                                setStateDokumen((prevState: any) => ({
                                                                    ...prevState,
                                                                    masterKodeDokumen: args.rowData.kode_transaksi_2,
                                                                    masterDataState: 'EDIT',
                                                                    masterNamaBank: 'SETORAN CAB',
                                                                    masterTransaksiKe: 2,
                                                                    masterJenisTransaksi: 0,
                                                                    statusJurnal: args.rowData.status_jurnal_2,
                                                                }));
                                                                handleNavigateLink(4, 'edit');
                                                            } else if (args.rowData.status_jurnal_2 === 'N') {
                                                                // setMasterDataState('BARU');
                                                                // setMasterKodeTransaksi(args.rowData.kode_transaksi_2);
                                                                // setTimeout(() => {
                                                                //     setMasterNamaBank('BRI');
                                                                //     setMasterTransaksiKe(2);
                                                                // }, 2000);
                                                                setStateDokumen((prevState: any) => ({
                                                                    ...prevState,
                                                                    masterKodeDokumen: args.rowData.kode_transaksi_2,
                                                                    masterDataState: 'BARU',
                                                                    masterNamaBank: 'SETORAN CAB',
                                                                    masterTransaksiKe: 2,
                                                                    masterJenisTransaksi: 0,
                                                                    statusJurnal: args.rowData.status_jurnal_2,
                                                                }));
                                                                handleNavigateLink(4, 'baru');
                                                            }
                                                        } else if (args.cellIndex === 6) {
                                                            if (args.rowData.status_jurnal_3 === 'Y') {
                                                                // setMasterDataState('EDIT');
                                                                // setMasterKodeTransaksi(args.rowData.kode_transaksi_3);
                                                                // setTimeout(() => {
                                                                //     setMasterNamaBank('BCA');
                                                                //     setMasterTransaksiKe(1);
                                                                // }, 2000);
                                                                setStateDokumen((prevState: any) => ({
                                                                    ...prevState,
                                                                    masterKodeDokumen: args.rowData.kode_transaksi_3,
                                                                    masterDataState: 'EDIT',
                                                                    masterNamaBank: 'BCA',
                                                                    masterTransaksiKe: 1,
                                                                    masterJenisTransaksi: 1,
                                                                    statusJurnal: args.rowData.status_jurnal_3,
                                                                }));
                                                                handleNavigateLink(6, 'edit');
                                                            } else if (args.rowData.status_jurnal_3 === 'N') {
                                                                // setMasterDataState('BARU');
                                                                // setMasterKodeTransaksi(args.rowData.kode_transaksi_3);
                                                                // setTimeout(() => {
                                                                //     setMasterNamaBank('BCA');
                                                                //     setMasterTransaksiKe(1);
                                                                // }, 2000);
                                                                setStateDokumen((prevState: any) => ({
                                                                    ...prevState,
                                                                    masterKodeDokumen: args.rowData.kode_transaksi_3,
                                                                    masterDataState: 'BARU',
                                                                    masterNamaBank: 'BCA',
                                                                    masterTransaksiKe: 1,
                                                                    masterJenisTransaksi: 1,
                                                                    statusJurnal: args.rowData.status_jurnal_3,
                                                                }));
                                                                handleNavigateLink(6, 'baru');
                                                            }
                                                        } else if (args.cellIndex === 8) {
                                                            if (args.rowData.status_jurnal_4 === 'Y') {
                                                                // setMasterDataState('EDIT');
                                                                // setMasterKodeTransaksi(args.rowData.kode_transaksi_4);

                                                                // setTimeout(() => {
                                                                //     setMasterNamaBank('BCA');
                                                                //     setMasterTransaksiKe(2);
                                                                // }, 2000);
                                                                setStateDokumen((prevState: any) => ({
                                                                    ...prevState,
                                                                    masterKodeDokumen: args.rowData.kode_transaksi_4,
                                                                    masterDataState: 'EDIT',
                                                                    masterNamaBank: 'BCA',
                                                                    masterTransaksiKe: 2,
                                                                    masterJenisTransaksi: 1,
                                                                    statusJurnal: args.rowData.status_jurnal_4,
                                                                }));
                                                                handleNavigateLink(8, 'edit');
                                                            } else if (args.rowData.status_jurnal_4 === 'N') {
                                                                // setMasterDataState('BARU');
                                                                // setMasterKodeTransaksi(args.rowData.kode_transaksi_4);

                                                                // setTimeout(() => {
                                                                //     setMasterNamaBank('BCA');
                                                                //     setMasterTransaksiKe(2);
                                                                // }, 2000);
                                                                setStateDokumen((prevState: any) => ({
                                                                    ...prevState,
                                                                    masterKodeDokumen: args.rowData.kode_transaksi_4,
                                                                    masterDataState: 'BARU',
                                                                    masterNamaBank: 'BCA',
                                                                    masterTransaksiKe: 2,
                                                                    masterJenisTransaksi: 1,
                                                                    statusJurnal: args.rowData.status_jurnal_4,
                                                                }));
                                                                handleNavigateLink(8, 'baru');
                                                            }
                                                        } else if (args.cellIndex === 10) {
                                                            if (args.rowData.status_jurnal_5 === 'Y') {
                                                                // setMasterDataState('EDIT');
                                                                // setMasterKodeTransaksi(args.rowData.kode_transaksi_5);

                                                                // setTimeout(() => {
                                                                //     setMasterNamaBank('BCA');
                                                                //     setMasterTransaksiKe(3);
                                                                // }, 2000);
                                                                setStateDokumen((prevState: any) => ({
                                                                    ...prevState,
                                                                    masterKodeDokumen: args.rowData.kode_transaksi_5,
                                                                    masterDataState: 'EDIT',
                                                                    masterNamaBank: 'BCA',
                                                                    masterTransaksiKe: 3,
                                                                    masterJenisTransaksi: 1,
                                                                    statusJurnal: args.rowData.status_jurnal_5,
                                                                }));
                                                                handleNavigateLink(10, 'edit');
                                                            } else if (args.rowData.status_jurnal_5 === 'N') {
                                                                // setMasterDataState('BARU');
                                                                // setMasterKodeTransaksi(args.rowData.kode_transaksi_5);

                                                                // setTimeout(() => {
                                                                //     setMasterNamaBank('BCA');
                                                                //     setMasterTransaksiKe(3);
                                                                // }, 2000);
                                                                setStateDokumen((prevState: any) => ({
                                                                    ...prevState,
                                                                    masterKodeDokumen: args.rowData.kode_transaksi_5,
                                                                    masterDataState: 'BARU',
                                                                    masterNamaBank: 'BCA',
                                                                    masterTransaksiKe: 3,
                                                                    masterJenisTransaksi: 1,
                                                                    statusJurnal: args.rowData.status_jurnal_5,
                                                                }));
                                                                handleNavigateLink(10, 'baru');
                                                            }
                                                        }
                                                    }
                                                }}
                                                queryCellInfo={queryCellInfoListData}
                                                // rowSelected={async (args) => {
                                                //     //
                                                //     // setMasterKodeTransaksi(args.data?.kode_transaksi);

                                                // }}
                                                // rowSelected={rowSelected}
                                                allowTextWrap={true}
                                                textWrapSettings={{ wrapMode: 'Header' }}
                                                // cellSelected={(args) => {
                                                //     if (args.cellIndex.cellIndex == 1) {
                                                //         setMasterKodeTransaksi(args.data.kode_transaksi_1);

                                                //     } else if (args.cellIndex.cellIndex == 3) {
                                                //         setMasterKodeTransaksi(args.data.kode_transaksi_2);

                                                //     } else if (args.cellIndex.cellIndex == 5) {
                                                //         setMasterKodeTransaksi(args.data.kode_transaksi_3);

                                                //     } else if (args.cellIndex.cellIndex == 7) {
                                                //         setMasterKodeTransaksi(args.data.kode_transaksi_4);

                                                //     } else if (args.cellIndex.cellIndex == 9) {
                                                //         setMasterKodeTransaksi(args.data.kode_transaksi_5);

                                                //     } else if (args.cellIndex.cellIndex == 2) {
                                                //         setMasterKodeTransaksi(args.data.kode_transaksi_1);

                                                //     } else if (args.cellIndex.cellIndex == 4) {
                                                //         setMasterKodeTransaksi(args.data.kode_transaksi_2);

                                                //     } else if (args.cellIndex.cellIndex == 6) {
                                                //         setMasterKodeTransaksi(args.data.kode_transaksi_3);

                                                //     } else if (args.cellIndex.cellIndex == 8) {
                                                //         setMasterKodeTransaksi(args.data.kode_transaksi_4);

                                                //     } else if (args.cellIndex.cellIndex == 10) {
                                                //         setMasterKodeTransaksi(args.data.kode_transaksi_5);

                                                //     }
                                                // }}
                                                aggregates={[
                                                    {
                                                        columns: [
                                                            {
                                                                type: 'Sum',
                                                                field: 'total_BRI_1',
                                                                format: 'N0',
                                                                footerTemplate: (props: any) => {
                                                                    return props.Sum !== undefined && props.Sum !== null ? (
                                                                        <div className="px-2 text-right">{props.Sum.toLocaleString('id-ID', { minimumFractionDigits: 2 })}</div>
                                                                    ) : (
                                                                        <div className="px-2 text-right">0,00</div>
                                                                    );
                                                                },
                                                            },
                                                            {
                                                                type: 'Sum',
                                                                field: 'total_BRI_2',
                                                                format: 'N0',
                                                                footerTemplate: (props: any) => {
                                                                    return props.Sum !== undefined && props.Sum !== null ? (
                                                                        <div className="px-2 text-right">{props.Sum.toLocaleString('id-ID', { minimumFractionDigits: 2 })}</div>
                                                                    ) : (
                                                                        <div className="px-2 text-right">0,00</div>
                                                                    );
                                                                },
                                                            },
                                                            {
                                                                type: 'Sum',
                                                                field: 'total_BCA_3',
                                                                format: 'N0',
                                                                footerTemplate: (props: any) => {
                                                                    return props.Sum !== undefined && props.Sum !== null ? (
                                                                        <div className="px-2 text-right">{props.Sum.toLocaleString('id-ID', { minimumFractionDigits: 2 })}</div>
                                                                    ) : (
                                                                        <div className="px-2 text-right">0,00</div>
                                                                    );
                                                                },
                                                            },
                                                            {
                                                                type: 'Sum',
                                                                field: 'total_BCA_4',
                                                                format: 'N0',
                                                                footerTemplate: (props: any) => {
                                                                    return props.Sum !== undefined && props.Sum !== null ? (
                                                                        <div className="px-2 text-right">{props.Sum.toLocaleString('id-ID', { minimumFractionDigits: 2 })}</div>
                                                                    ) : (
                                                                        <div className="px-2 text-right">0,00</div>
                                                                    );
                                                                },
                                                            },
                                                            {
                                                                type: 'Sum',
                                                                field: 'total_BCA_5',
                                                                format: 'N0',
                                                                footerTemplate: (props: any) => {
                                                                    return props.Sum !== undefined && props.Sum !== null ? (
                                                                        <div className="px-2 text-right">{props.Sum.toLocaleString('id-ID', { minimumFractionDigits: 2 })}</div>
                                                                    ) : (
                                                                        <div className="px-2 text-right">0,00</div>
                                                                    );
                                                                },
                                                            },
                                                            {
                                                                type: 'Sum',
                                                                field: 'total_All',
                                                                format: 'N0',
                                                                footerTemplate: (props: any) => {
                                                                    return props.Sum !== undefined && props.Sum !== null ? (
                                                                        <div className="px-2 text-right">{props.Sum.toLocaleString('id-ID', { minimumFractionDigits: 2 })}</div>
                                                                    ) : (
                                                                        <div className="px-2 text-right">0,00</div>
                                                                    );
                                                                },
                                                            },
                                                        ],
                                                    },
                                                ]}
                                            >
                                                <ColumnsDirective>
                                                    <ColumnDirective
                                                        field="tgl_transaksi"
                                                        format="dd/MM/yyyy"
                                                        headerText="Tanggal Transaksi"
                                                        width="80"
                                                        textAlign="Center"
                                                        template={(props: any) => {
                                                            const date = new Date(props.tgl_transaksi);
                                                            return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                                        }}
                                                    />
                                                    <ColumnDirective
                                                        columns={[
                                                            {
                                                                field: 'total_BRI_1',
                                                                headerText: 'Total Transaksi',
                                                                // format: 'N0',
                                                                format: formatFloat,
                                                                // edit: qtyParams,
                                                                headerTextAlign: 'Center',
                                                                textAlign: 'Right',
                                                                width: 120,
                                                                // clipMode: 'EllipsisWithTooltip',
                                                                // valueAccessor: zeroValueAccessor,
                                                            },
                                                            {
                                                                field: 'status_jurnal_1',
                                                                headerText: 'Status Jurnal',
                                                                headerTextAlign: 'Center',
                                                                textAlign: 'Center',
                                                                width: 70,
                                                                // valueAccessor: zeroValueAccessor,
                                                                // clipMode: 'EllipsisWithTooltip',
                                                            },
                                                        ]}
                                                        headerText="SETORAN CAB - 1"
                                                        headerTemplate={headerTemplateBri1}
                                                        textAlign="Center"
                                                        format="N0"

                                                        // template={templateStatusJurnal}
                                                    />
                                                    <ColumnDirective
                                                        columns={[
                                                            {
                                                                field: 'total_BRI_2',
                                                                headerText: 'Total Transaksi',
                                                                // format: 'N0',
                                                                format: formatFloat,
                                                                // edit: qtyParams,
                                                                headerTextAlign: 'Center',
                                                                textAlign: 'Right',
                                                                width: 120,
                                                                // clipMode: 'EllipsisWithTooltip',
                                                                // valueAccessor: zeroValueAccessor,
                                                            },
                                                            {
                                                                field: 'status_jurnal_2',
                                                                headerText: 'Status Jurnal',
                                                                headerTextAlign: 'Center',
                                                                textAlign: 'Center',
                                                                width: 70,
                                                                // valueAccessor: zeroValueAccessor,
                                                                // clipMode: 'EllipsisWithTooltip',
                                                                // headerTemplate: (props: any) => statusTemplate(props, 2),
                                                            },
                                                        ]}
                                                        headerText="SETORAN CAB - 2"
                                                        headerTemplate={headerTemplateBri2}
                                                        textAlign="Center"
                                                        format="N0"
                                                    />
                                                    <ColumnDirective
                                                        columns={[
                                                            {
                                                                field: 'total_BCA_3',
                                                                headerText: 'Total Transaksi',
                                                                // format: 'N0',
                                                                format: formatFloat,
                                                                // edit: qtyParams,
                                                                headerTextAlign: 'Center',
                                                                textAlign: 'Right',
                                                                width: 120,
                                                                // clipMode: 'EllipsisWithTooltip',
                                                                // valueAccessor: zeroValueAccessor,
                                                            },
                                                            {
                                                                field: 'status_jurnal_3',
                                                                headerText: 'Status Jurnal',
                                                                headerTextAlign: 'Center',
                                                                textAlign: 'Center',
                                                                width: 70,
                                                                // valueAccessor: zeroValueAccessor,
                                                                // clipMode: 'EllipsisWithTooltip',
                                                            },
                                                        ]}
                                                        headerText="BCA - 1"
                                                        headerTemplate={headerTemplateBca1}
                                                        textAlign="Center"
                                                        format="N0"
                                                    />
                                                    <ColumnDirective
                                                        columns={[
                                                            {
                                                                field: 'total_BCA_4',
                                                                headerText: 'Total Transaksi',
                                                                // format: 'N0',
                                                                format: formatFloat,
                                                                // edit: qtyParams,
                                                                headerTextAlign: 'Center',
                                                                textAlign: 'Right',
                                                                width: 120,
                                                                // clipMode: 'EllipsisWithTooltip',
                                                                // valueAccessor: zeroValueAccessor,
                                                            },
                                                            {
                                                                field: 'status_jurnal_4',
                                                                headerText: 'Status Jurnal',
                                                                headerTextAlign: 'Center',
                                                                textAlign: 'Center',
                                                                width: 70,
                                                                // valueAccessor: zeroValueAccessor,
                                                                // clipMode: 'EllipsisWithTooltip',
                                                            },
                                                        ]}
                                                        headerText="BCA - 2"
                                                        headerTemplate={headerTemplateBca2}
                                                        textAlign="Center"
                                                        format="N0"
                                                    />
                                                    <ColumnDirective
                                                        columns={[
                                                            {
                                                                field: 'total_BCA_5',
                                                                headerText: 'Total Transaksi',
                                                                // format: 'N0',
                                                                format: formatFloat,
                                                                // edit: qtyParams,
                                                                headerTextAlign: 'Center',
                                                                textAlign: 'Right',
                                                                width: 120,
                                                                // clipMode: 'EllipsisWithTooltip',
                                                                // valueAccessor: zeroValueAccessor,
                                                            },
                                                            {
                                                                field: 'status_jurnal_5',
                                                                headerText: 'Status Jurnal',
                                                                headerTextAlign: 'Center',
                                                                textAlign: 'Center',
                                                                width: 70,
                                                                // valueAccessor: zeroValueAccessor,
                                                                // clipMode: 'EllipsisWithTooltip',
                                                            },
                                                        ]}
                                                        headerText="BCA - 3"
                                                        headerTemplate={headerTemplateBca3}
                                                        textAlign="Center"
                                                        format="N0"
                                                    />

                                                    <ColumnDirective
                                                        field="total_All"
                                                        headerText="Total Transaksi Harian"
                                                        // format="N0"
                                                        format={formatFloat}
                                                        headerTextAlign="Center"
                                                        textAlign="Right"
                                                        width="130"
                                                    />
                                                </ColumnsDirective>

                                                <Inject services={[Page, Sort, Aggregate, Filter, Selection, Edit, CommandColumn, Resize, Toolbar]} />
                                            </GridComponent>
                                        </div>
                                        {/* </div> */}
                                    </div>

                                    {/* </div> */}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* </div> */}
                </div>

                {modalJenisTransaksi && (
                    <DialogComponent
                        id="dlgJenisTransaksi"
                        name="dlgJenisTransaksi"
                        className="dlgJenisTransaksi"
                        target="#trxBankList"
                        header="Jenis Transaksi Bank"
                        visible={modalJenisTransaksi}
                        isModal={true}
                        animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                        resizeHandles={['All']}
                        allowDragging={true}
                        // showCloseIcon={true}
                        width="10%" //"70%"
                        height="22%"
                        position={{ X: 'center', Y: 350 }}
                        style={{ position: 'fixed' }}
                        close={() => {
                            setModalJenisTransaksi(false);
                        }}
                    >
                        <div>
                            <span style={{ fontWeight: 'bold', fontSize: 14, padding: 10 }}>[ Transaksi Bank ]</span>
                        </div>
                        <hr style={{ marginBottom: 5 }}></hr>
                        <div style={{ padding: 10 }} className="flex items-center">
                            <RadioButtonComponent
                                id="1"
                                label="SETORAN CAB"
                                name="size"
                                // checked={jenisTransaksi === 0}
                                checked={stateDokumen.masterJenisTransaksi === 0}
                                change={() => changeModalJenisTransaksi(0)}
                                cssClass="e-small"
                            />
                        </div>
                        <div className="flex items-center" style={{ padding: 10, marginTop: -5 }}>
                            <RadioButtonComponent
                                id="2"
                                label="BCA"
                                name="size"
                                // checked={jenisTransaksi === 1}
                                checked={stateDokumen.masterJenisTransaksi === 1}
                                change={() => changeModalJenisTransaksi(1)}
                                cssClass="e-small"
                            />
                        </div>

                        <div className="mb-5 ml-2 mr-2 mt-4 flex items-center justify-between">
                            <ButtonComponent
                                cssClass="e-secondary e-small"
                                style={{ width: '45%' }}
                                onClick={async () => {
                                    // await handleCekExistingTrx(kode_entitas, stateDokumen.masterJenisTransaksi, token).then((result: any) => {
                                    //     // setMasterTransaksiKe(result);
                                    //     console.log('result ', result);
                                    //     setStateDokumen((prevState: any) => ({
                                    //         ...prevState,
                                    //         kode_entitas: sessionData?.kode_entitas ?? '',
                                    //         userid: sessionData?.userid ?? '',
                                    //         kode_user: sessionData?.kode_user ?? '',
                                    //         token: sessionData?.token ?? '',
                                    //         masterNamaBank: prevState.masterJenisTransaksi === 0 ? 'BRI' : 'BCA',
                                    //         masterTransaksiKe: result,
                                    //     }));
                                    // });
                                    handleNavigateLink(stateDokumen.masterJenisTransaksi, 'baru');
                                }}
                            >
                                OK
                            </ButtonComponent>
                            <ButtonComponent cssClass="e-secondary e-small" style={{ width: '45%' }} onClick={() => setModalJenisTransaksi(false)}>
                                Batal
                            </ButtonComponent>
                        </div>
                    </DialogComponent>
                )}
                {modalTrxBank && (
                    <TransaksiBank
                        setStateDokumen={setStateDokumen}
                        stateDokumen={stateDokumen}
                        isOpen={modalTrxBank}
                        onClose={async () => {
                            // setStateDokumen((prevState: any) => ({
                            //     ...prevState,
                            //     kode_entitas: sessionData?.kode_entitas ?? '',
                            //     userid: sessionData?.userid ?? '',
                            //     kode_user: sessionData?.kode_user ?? '',
                            //     token: sessionData?.token ?? '',
                            //     masterKodeDokumen: '',
                            //     masterDataState: '',
                            //     masterNamaBank: '',
                            //     masterTransaksiKe: 1,
                            //     masterJenisTransaksi: 1,
                            //     statusJurnal: 'N',
                            // }));
                            setModalTrxBank(false);
                            await handleRefreshDataList(
                                paramList,
                                setRecordsDataDetailList,
                                setRecordsTransaksi,
                                setTglTransaksi,
                                dgTrxBankList,
                                token,
                                'bank',
                                setIsLoadingProgress,
                                setProgressValue,
                                setDisplayedProgress,
                                setLoadingMessage
                            );
                        }}
                        onRefresh={async () => {
                            await handleRefreshDataList(
                                paramList,
                                setRecordsDataDetailList,
                                setRecordsTransaksi,
                                setTglTransaksi,
                                dgTrxBankList,
                                token,
                                'bank',
                                setIsLoadingProgress,
                                setProgressValue,
                                setDisplayedProgress,
                                setLoadingMessage
                            );
                        }}
                        onRefreshTipe={0}
                        listEntitas={listEntitas}
                    />
                )}
                {modalJurnalBank && (
                    <JurnalBank
                        stateDokumen={stateDokumen}
                        isOpen={modalJurnalBank}
                        onClose={async () => {
                            // setStateDokumen((prevState: any) => ({
                            //     ...prevState,
                            //     kode_entitas: sessionData?.kode_entitas ?? '',
                            //     userid: sessionData?.userid ?? '',
                            //     kode_user: sessionData?.kode_user ?? '',
                            //     token: sessionData?.token ?? '',
                            //     masterKodeDokumen: '',
                            //     masterDataState: '',
                            //     masterNamaBank: '',
                            //     masterTransaksiKe: 1,
                            //     masterJenisTransaksi: 1,
                            //     statusJurnal: 'N',
                            // }));
                            setModalJurnalBank(false);
                            // setMasterTransaksiKe(0);
                            await handleRefreshDataList(
                                paramList,
                                setRecordsDataDetailList,
                                setRecordsTransaksi,
                                setTglTransaksi,
                                dgTrxBankList,
                                token,
                                'bank',
                                setIsLoadingProgress,
                                setProgressValue,
                                setDisplayedProgress,
                                setLoadingMessage
                            );
                        }}
                        onRefresh={async () => {
                            await handleRefreshDataList(
                                paramList,
                                setRecordsDataDetailList,
                                setRecordsTransaksi,
                                setTglTransaksi,
                                dgTrxBankList,
                                token,
                                'bank',
                                setIsLoadingProgress,
                                setProgressValue,
                                setDisplayedProgress,
                                setLoadingMessage
                            );
                        }}
                        onRefreshTipe={0}
                        listEntitas={listEntitas}
                    />
                )}
            </div>
        </>
    );
};

export default TransaksiBankList;
