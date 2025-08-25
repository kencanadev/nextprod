import { useSession } from '@/pages/api/sessionContext';
import { useRef, useState, useEffect, Fragment, useCallback, useMemo } from 'react';
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
    IEditCell,
    EditSettingsModel,
    ToolbarItems,
} from '@syncfusion/ej2-react-grids';
import { NumericTextBox, TextBox } from '@syncfusion/ej2-inputs';
import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton, RadioButtonComponent, CheckBox } from '@syncfusion/ej2-react-buttons';
import { ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent, FocusInEventArgs } from '@syncfusion/ej2-react-inputs';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown } from '@syncfusion/ej2-react-dropdowns';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { MenuEventArgs } from '@syncfusion/ej2-react-splitbuttons';
import { SidebarComponent, SidebarType, ContextMenuComponent, MenuItemModel /*Tab, TabComponent*/, ClickEventArgs } from '@syncfusion/ej2-react-navigations';
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
import { faArrowRightToFile, faFile, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { myAlertGlobal2, myAlertGlobal22, usersMenu } from '@/utils/routines';

import { ProgressBarComponent, ProgressAnnotation } from '@syncfusion/ej2-react-progressbar';

import { Aggregate, BatchChanges, changedRecords, Row } from '@syncfusion/ej2/grids';

import { SplitterComponent, PanesDirective, PaneDirective, Panel } from '@syncfusion/ej2-react-layouts';
import { handleDaftarBank, handleData, handleEdit, handleEntitasAll, handleInputChange, handleKlikNamaBank, handleQuBank } from '../handler/fungsi';
import { getDaftarBankApi, getEntitasAllApi } from '../model/api';
import DlgDaftarBank from './dlgDaftarBank';
import { createPortal } from 'react-dom';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { frmNumber, generateNU, myAlertGlobal, myAlertGlobal2, myAlertGlobal3 } from '@/utils/global/fungsi';
import { DataManager, Query } from '@syncfusion/ej2/data';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { exitCode } from 'process';
import { DropDownList } from '@syncfusion/ej2-dropdowns';
import '../customStyles/grid.module.css';
L10n.load(idIDLocalization);

interface UserMenuState {
    baru: any;
    edit: any;
    hapus: any;
    cetak: any;
}

type quMTrxBankType = {
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

type quDTrxbankType = {
    kode_transaksi: any;
    id_transaksi: any;
    id_tab: any;
    entitas: any;
    no_rekening: any;
    nama_rekening: any;
    nama_bank: any;
    kode_akun: any;
    nama_akun: any;
    saldo_endap: any;
    saldo_akhir: any;
    saldo_real: any;
    nominal_ready: any;
    tgl_update: any;
    deskripsi: any;
    kode_eBranch1: any;
    nominal1: any;
    kode_eBranch2: any;
    nominal2: any;
    kode_eBranch3: any;
    nominal3: any;
    kode_eBranch4: any;
    nominal4: any;
    kode_eBranch5: any;
    nominal5: any;
};

type quDTrxBankDetailType = {
    kode_transaksi: any;
    id_transaksi: any;
    jenis_pengeluaran: any;
    entitas: any;
    nama_bank: any;
    no_rekening: any;
    nama_rekening: any;
    kode_akun: any;
    nama_akun: any;
    keterangan: any;
    sumber: any;
    kode_dokumen_sumber: any;
    no_dokumen_sumber: any;
    kode_vendor: any;
    nama_vendor: any;
    tgl_jtp: any;
    nominal_tagihan: any;
    nominal_bayar: any;
    proses_bayar: any;
    nominal_sisa: any;
    kode_eBranch1: any;
    nama_bank1: any;
    no_rekening1: any;
    nama_rekening1: any;
    kode_eBranch2: any;
    nominal1: any;
    nama_bank2: any;
    no_rekening2: any;
    nama_rekening2: any;
    nominal2: any;
    kode_eBranch3: any;
    nama_bank3: any;
    no_rekening3: any;
    nama_rekening3: any;
    nominal3: any;
    kode_eBranch4: any;
    nama_bank4: any;
    no_rekening4: any;
    nama_rekening4: any;
    nominal4: any;
    kode_eBranch5: any;
    nama_bank5: any;
    no_rekening5: any;
    nama_rekening5: any;
    nominal5: any;
};

interface TransaksiBankProps {
    setStateDokumen: Function;
    stateDokumen: any;
    isOpen: boolean;
    onClose: () => void;
    onRefresh: any;
    onRefreshTipe: any;
    listEntitas: any;
}

// let dgTrxBank: Grid;
// let dgTrxBankDetail: Grid;
let gridListData: Grid | any;

const TransaksiBank: React.FC<TransaksiBankProps> = ({ setStateDokumen, stateDokumen, isOpen, onClose, onRefresh, onRefreshTipe, listEntitas }) => {
    // console.log('stateDokumen ', stateDokumen);
    let priceElem: HTMLElement;
    let priceObj: NumericTextBox;
    let nominalReadyElem: HTMLElement;
    let nominalReadyObj: NumericTextBox;
    let nominalTagihanElem: HTMLElement;
    let nominalTagihanObj: NumericTextBox;
    // let nominalRealElem: HTMLInputElement;
    let nominalRealElem: HTMLElement;
    let nominalRealObj: NumericTextBox;
    let nominalAtasElem: HTMLElement;
    let nominalAtasObj: NumericTextBox;
    let nominalElem: HTMLElement;
    let nominalObj: NumericTextBox;
    let textElem: HTMLElement;
    let textObj: TextBox;
    let textDrop: HTMLElement;
    let dropObj: DropDownList;

    let vnoMinalReady = 0;
    // let vTotalNominalReady = 0;
    var vTotalNominalReady = 0;
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    const toolbarOptions: ToolbarItems[] = ['Add', 'Edit', 'Delete', 'Update', 'Cancel'];

    const dgTrxBankRef = useRef<Grid | any>(null);
    const dgTrxBankDetailRef = useRef<Grid | any>(null);

    const [headerState, setHeaderState] = useState<quMTrxBankType>();
    const [detailState, setDetailState] = useState<quDTrxbankType[]>([]);
    const [bankDetailState, setBankDetailState] = useState<quDTrxBankDetailType[]>([]);

    const [isLoadingProgress, setIsLoadingProgress] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [displayedProgress, setDisplayedProgress] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState('Loading Data...');
    // const [listEntitas, setListEntitas] = useState<object[]>([]);
    const [daftarbank, setDaftarBank] = useState([]);

    const [modalDaftarbank, setModalDaftarbank] = useState(false);
    const [dialogPosition, setDialogPosition] = useState({ X: 0, Y: 0 });
    const [activeField, setActiveField] = useState<string>('');
    const [showDaftarBank, setShowDaftarBank] = useState<boolean>(false);
    const [formData, setFormData] = useState<any>({});

    const [namaVendor, setNamaVendor] = useState('');
    const [uniqId, setUniqId] = useState('');
    const [namaBankState, setNamaBankState] = useState('');
    const [dariBatch, setDariBatch] = useState(false);
    const [dariBatchBawah, setDariBatchBawah] = useState(false);

    const [mounted, setMounted] = useState(false);
    const [dataFetched, setDataFetched] = useState(false);

    const [tambahTop, setTambahTop] = useState(false);
    const [tambahBottom, setTambahBottom] = useState(false);

    const [editTop, setEditTop] = useState(false);
    const [editBottom, setEditBottom] = useState(false);

    const [selectedRowIndexTop, setSelectedRowIndexTop] = useState(0);
    const [selectedIdTransaksi, setSelectedIdTransaksi] = useState(0);

    const [selectedRowIndexBottom, setSelectedRowIndexBottom] = useState(0);

    const [gnominalBayar, setGnominalBayar] = useState(0);
    const [gnominalReady, setGnominalReady] = useState(0);
    const [gnominal1Atas, setGnominal1Atas] = useState(0);
    const [gnominal1Bawah, setGnominal1Bawah] = useState(0);
    const [totalNominalbawah, setTotalNominalbawah] = useState(0);
    const [totalNominalBayar, setTotalNominalBayar] = useState(0);
    const [disabledSimpan, setDisabledSimpan] = useState(false);

    let nominalReady: number = 0;
    let interval: any;
    let selectedIDTrx: number;

    const handleDetailTrxBank = async (dariTombol: any, um: any, vch: any, phe: any, fpp: any) => {
        try {
            const existingData = Array.isArray(dgTrxBankDetailRef.current?.dataSource) ? dgTrxBankDetailRef.current?.dataSource : [];

            const resultBankDetail = await handleData(
                stateDokumen?.kode_entitas,
                stateDokumen?.masterNamaBank,
                setBankDetailState,
                // bankDetailState,
                existingData,
                stateDokumen?.token,
                setIsLoadingProgress,
                setProgressValue,
                setDisplayedProgress,
                setLoadingMessage,
                stateDokumen?.masterTransaksiKe,
                formDataState,
                dariTombol,
                um, //um
                vch, //vch
                phe, //phe
                fpp //fpp
            );

            const filteredResult = resultBankDetail.filter((item: any) => !item.kode_transaksi);
            // console.log('filteredResult', filteredResult);

            if (dgTrxBankDetailRef.current) {
                if (stateDokumen?.masterDataState === 'BARU') {
                    // setProgressValue(50);
                    // setDisplayedProgress(50);
                    // setLoadingMessage('resultBankDetail...');
                    const uniqueBankDetail = resultBankDetail.filter((item: any, index: any, self: any) => index === self.findIndex((t: any) => t.uniqeKode === item.uniqeKode));

                    let idCounter = 0;
                    // console.log('uniqueBankDetail', uniqueBankDetail);
                    // console.log('resultBankDetail.length 1', resultBankDetail.length);
                    // console.log('uniqueBankDetail.length 1', uniqueBankDetail.length);

                    const modifiedUniqueBankDetail = uniqueBankDetail.map((item: any) => {
                        const newItem = {
                            ...item,
                            index: idCounter,
                            id_transaksi: idCounter,
                            proses_bayar: false,
                            nominal_bayar: 0,
                            uniqId: `${idCounter}`,
                            //   uniqeKode: `${item.entitas}_${item.kode_dokumen_sumber}`,
                        };
                        idCounter++; // increment setelah assign
                        return newItem;
                    });
                    dgTrxBankDetailRef.current.dataSource = modifiedUniqueBankDetail; //resultBankDetail;
                    // console.log('modifiedUniqueBankDetail ', modifiedUniqueBankDetail);
                    // console.log('resultBankDetail.length ', modifiedUniqueBankDetail.length);
                } else {
                    const existingData = Array.isArray(dgTrxBankDetailRef.current.dataSource) ? dgTrxBankDetailRef.current.dataSource : [];

                    const maxIdTransaksi = existingData.reduce((max: any, item: any) => (item.id_transaksi > max ? item.id_transaksi : max), 0);

                    let newIdTransaksi = maxIdTransaksi;
                    const updatedData = existingData.map((item: any) => {
                        if (item.kode_transaksi === '') {
                            newIdTransaksi + 1; // Increment ID
                            return { ...item, kode_transaksi: headerState?.kode_transaksi, id_transaksi: newIdTransaksi, uniqId: newIdTransaksi };
                        }
                        return item;
                    });

                    dgTrxBankDetailRef.current.dataSource = updatedData;
                }
            }
        } finally {
            // setProgressValue(100);
            // setDisplayedProgress(100);
            // setLoadingMessage('Complete!');
            // setTimeout(() => {
            //     setIsLoadingProgress(false);
            //     setProgressValue(0);
            //     setDisplayedProgress(0);
            // }, 1000);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setDataFetched(true); // Tandai bahwa data sudah diambil
                if (stateDokumen?.masterDataState === 'BARU') {
                    try {
                        const result = await generateNU(stateDokumen?.kode_entitas, '', '29', moment().format('YYYYMM'));
                        if (result) {
                            // setHeaderState(result);
                            setHeaderState((prevFormData: any) => ({
                                ...prevFormData,
                                no_transaksi: result,
                            }));
                        } else {
                            console.error('undefined');
                        }

                        await handleQuBank(
                            stateDokumen?.kode_entitas,
                            stateDokumen?.masterNamaBank,
                            setDetailState,
                            stateDokumen?.token,
                            setIsLoadingProgress,
                            setProgressValue,
                            setDisplayedProgress,
                            setLoadingMessage,
                            stateDokumen?.masterTransaksiKe
                        ).then(async (result: any) => {
                            if (dgTrxBankRef.current) {
                                dgTrxBankRef.current.dataSource = result;
                                // const dataWithIds = result.map((item: any, index: number) => ({
                                //     ...item,
                                //     id_transaksi: item.id_transaksi || index + 1,
                                // }));
                                // dgTrxBankRef.current.dataSource = dataWithIds;
                            }
                        });
                        await handleDetailTrxBank('0', true, true, true, true).then((result: any) => {});
                    } finally {
                        // setIsLoadingProgress(true);
                        // setProgressValue(100);
                        // setDisplayedProgress(Math.round(100));
                        // setLoadingMessage('Fetching data...');
                        //     setTimeout(() => {
                        //         setIsLoadingProgress(false);
                        //         setProgressValue(0);
                        //         setDisplayedProgress(0);
                        //     }, 500);
                    }
                } else if (stateDokumen?.masterDataState === 'EDIT') {
                    const result = await handleEdit(
                        setIsLoadingProgress,
                        setProgressValue,
                        setDisplayedProgress,
                        setLoadingMessage,
                        stateDokumen?.kode_entitas,
                        stateDokumen?.masterKodeDokumen,
                        stateDokumen?.token,
                        setHeaderState,
                        setDetailState,
                        setBankDetailState
                    );

                    if (dgTrxBankRef.current && dgTrxBankDetailRef.current) {
                        dgTrxBankRef.current.dataSource = result.detail;
                        dgTrxBankDetailRef.current.dataSource = result.bankDetail;
                    }
                }
                // }
            } catch (error) {
                console.error('Terjadi kesalahan saat memuat data:', error);
            }
        };

        fetchData();
    }, [isOpen]);

    const saveDoc = async () => {
        let isValid = true;

        // throw exitCode;
        try {
            let responseAPI: any;
            setDisabledSimpan(true);
            setIsLoadingProgress(true);
            setProgressValue(0);
            interval = setInterval(() => {
                setProgressValue((prev) => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 2;
                });
            }, 40);

            setLoadingMessage('create JSON...');
            setProgressValue(20);
            const totalNominalBayar = ((dgTrxBankDetailRef.current?.dataSource as any[]) || []).reduce((total, item) => total + (item.nominal_bayar || 0), 0);
            // const nominalTagihan = ((dgTrxBankDetailRef.current?.dataSource as any[]) || []).reduce((total, item) => total + (item.nominal_tagihan || 0), 0);
            const totalNominalReady = ((dgTrxBankRef.current?.dataSource as any[]) || []).reduce((total, item) => total + (item.nominal_ready || 0), 0);

            if (totalNominalReady <= 0 || totalNominalBayar <= 0) {
                Swal.fire({
                    timer: 10,
                    showConfirmButton: false,
                });
                myAlertGlobal(
                    `Total Nominal Ready :  ${frmNumber(totalNominalReady)}
                    Total Nominal Bayar :  ${frmNumber(totalNominalBayar)}
                    Dokumen tidak dapat disimpan. Silahkan cek transaksi.`,
                    'transaksiBank'
                );
                isValid = false;
            }
            // if ((stateDokumen?.masterDataState = 'BARU')) {
            setHeaderState((prevState: any) => ({
                ...prevState,
                nominal_ready: totalNominalReady,
                total_bayar: totalNominalBayar,
            }));
            // }

            const gridAtas = dgTrxBankRef.current;
            const dataSourceAtas = Array.isArray(gridAtas.dataSource) ? gridAtas.dataSource : [];
            // const filteredData = dataSourceAtas.filter((item: any) => item.proses_bayar === 'Y' || item.proses_bayar === true);

            // throw exitCode;
            const gridBawah = dgTrxBankDetailRef.current;
            const dataSourceBawah = Array.isArray(gridBawah.dataSource) ? gridBawah.dataSource : [];
            const filteredDataBawah = dataSourceBawah.filter((item: any) => item.proses_bayar === 'Y' || item.proses_bayar === true);
            let gridBawahPay: any[] = [];

            if (stateDokumen.masterDataState === 'BARU') {
                gridBawahPay = dataSourceBawah.filter((item: any) => item.proses_bayar === 'Y' || item.proses_bayar === true);
            } else {
                gridBawahPay = Array.isArray(gridBawah.dataSource) ? gridBawah.dataSource : [];
            }
            const reqBody = {
                entitas: stateDokumen?.kode_entitas,
                kode_transaksi: stateDokumen?.masterDataState === 'BARU' ? '' : headerState?.kode_transaksi,
                no_transaksi: headerState?.no_transaksi,
                userid: stateDokumen?.userid,
                tgl_transaksi: moment(headerState?.tgl_transaksi).format('YYYY-MM-DD HH:mm:ss'),
                nominal_ready: totalNominalReady,
                total_bayar: totalNominalBayar,
                transaksi_bank: stateDokumen?.masterNamaBank,
                jenis_transaksi: stateDokumen?.masterNamaBank === 'BCA' ? '1' : '0',
                transaksi_ke: stateDokumen?.masterTransaksiKe,
                status_jurnal: stateDokumen?.masterDataState === 'BARU' ? 'N' : headerState?.status_jurnal,
                warna: gnominalBayar > gnominalReady ? 'Y' : 'N',
                status_form: '0',
                detail: dataSourceAtas.map((data: any) => ({
                    ...data,
                    id_transaksi: data.id_transaksi,
                    id_tab: stateDokumen?.masterTransaksiKe,
                    entitas: data.entitas,
                    no_rekening: data.no_rekening,
                    nama_rekening: data.nama_rekening,
                    nama_bank: data.nama_bank,
                    kode_akun: data.kode_akun,
                    nama_akun: data.nama_akun,
                    saldo_endap: data.saldo_endap === null ? 0 : data.saldo_endap,
                    saldo_akhir: data.saldo_akhir === null ? 0 : data.saldo_akhir,
                    saldo_real: data.saldo_real === null ? 0 : data.saldo_real,
                    nominal_ready: data.nominal_ready === null ? 0 : data.nominal_ready,
                    deskripsi: null,
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                    kode_eBranch1: data.kode_eBranch1,
                    nominal1: data.nominal1 === null ? 0 : data.nominal1,
                    kode_eBranch2: data.kode_eBranch2,
                    nominal2: data.nominal2 === null ? 0 : data.nominal2,
                    kode_eBranch3: data.kode_eBranch3,
                    nominal3: data.nominal3 === null ? 0 : data.nominal3,
                    kode_eBranch4: data.kode_eBranch4,
                    nominal4: data.nominal4 === null ? 0 : data.nominal4,
                    kode_eBranch5: data.kode_eBranch5,
                    nominal5: data.nominal5 === null ? 0 : data.nominal5,
                })),
                // pay: filteredDataBawah.map((data: any) => ({
                pay: gridBawahPay.map((data: any) => ({
                    ...data,
                    id_transaksi: data.id_transaksi,
                    jenis_pengeluaran: null,
                    entitas: data.entitas,
                    nama_bank: '', //data.sumber === 'VCH' ? '' : data.nama_bank,
                    no_rekening: '', //data.no_rekening,
                    nama_rekening: '', //data.nama_rekening,
                    kode_akun: '', //data.kode_akun,
                    nama_akun: '', //data.nama_akun,
                    keterangan: data.keterangan,
                    sumber: data.sumber,
                    kode_dokumen_sumber: data.kode_dokumen_sumber,
                    no_dokumen_sumber: data.no_dokumen_sumber,
                    kode_vendor: data.kode_vendor,
                    nama_vendor: data.nama_vendor,
                    tgl_jtp: moment(data.tgl_jtp).format('YYYY-MM-DD HH:mm:ss'),
                    nominal_tagihan: data.nominal_tagihan === null ? 0 : data.nominal_tagihan,
                    nominal_bayar: data.nominal_bayar === null ? 0 : data.nominal_bayar,
                    nominal_sisa: data.nominal_sisa === null ? 0 : data.nominal_sisa,
                    proses_bayar: data.proses_bayar === true ? 'Y' : 'N',
                    kode_eBranch1: data.kode_eBranch1,
                    nama_bank1: data.nama_bank1,
                    no_rekening1: data.no_rekening1,
                    nama_rekening1: data.nama_rekening1,
                    nominal1: data.nominal1 === null ? 0 : data.nominal1,
                    kode_eBranch2: data.kode_eBranch2,
                    nama_bank2: data.nama_bank2,
                    no_rekening2: data.no_rekening2,
                    nama_rekening2: data.nama_rekening2,
                    nominal2: data.nominal2 === null ? 0 : data.nominal2,
                    kode_eBranch3: data.kode_eBranch3,
                    nama_bank3: data.nama_bank3,
                    no_rekening3: data.no_rekening3,
                    nama_rekening3: data.nama_rekening3,
                    nominal3: data.nominal3 === null ? 0 : data.nominal3,
                    kode_eBranch4: data.kode_eBranch4,
                    nama_bank4: data.nama_bank4,
                    no_rekening4: data.no_rekening4,
                    nama_rekening4: data.nama_rekening4,
                    nominal4: data.nominal4 === null ? 0 : data.nominal4,
                    kode_eBranch5: data.kode_eBranch5,
                    nama_bank5: data.nama_bank5,
                    no_rekening5: data.no_rekening5,
                    nama_rekening5: data.nama_rekening5,
                    nominal5: data.nominal5 === null ? 0 : data.nominal5,
                })),
            };
            // console.log('reqBody ', reqBody);
            // throw exitCode;
            if (isValid) {
                if (stateDokumen?.masterDataState === 'BARU') {
                    setLoadingMessage('simpan dokumen baru...');
                    setProgressValue(40);
                    responseAPI = await axios.post(`${apiUrl}/erp/simpan_transaksi_bank`, reqBody, {
                        headers: {
                            Authorization: `Bearer ${stateDokumen?.token}`,
                        },
                    });
                } else if (stateDokumen?.masterDataState === 'EDIT') {
                    setLoadingMessage('simpan dokumen baru...');
                    setProgressValue(40);
                    responseAPI = await axios.patch(`${apiUrl}/erp/update_transaksi_bank`, reqBody, {
                        headers: {
                            Authorization: `Bearer ${stateDokumen?.token}`,
                        },
                    });
                }

                if (stateDokumen?.masterDataState === 'BARU' && responseAPI?.data.status === true) {
                    setLoadingMessage('generate no dokumen...');
                    setProgressValue(60);
                    await generateNU(stateDokumen?.kode_entitas, responseAPI?.data.data.no_transaksi, '29', moment().format('YYYYMM'));
                }
                if (responseAPI?.data.status === true) {
                    myAlertGlobal(`Data berhasil disimpan `, 'transaksiBank');
                }
            } else {
                Swal.fire({
                    timer: 10,
                    showConfirmButton: false,
                });
                myAlertGlobal2(`cek data- `, 'jurnalBank');
            }
        } finally {
            // Reset loading state after a delay
            // throw exitCode;
            setProgressValue(80);

            setProgressValue(100);
            clearInterval(interval);

            setTimeout(() => {
                setIsLoadingProgress(false);
                setProgressValue(0);
                setLoadingMessage('Initializing...');
                setDisabledSimpan(false);

                if (isValid) {
                    onClose();
                    onRefresh();
                } else {
                    Swal.fire({
                        timer: 10,
                        showConfirmButton: false,
                    });
                    myAlertGlobal2(`cek data-- `, 'jurnalBank');
                }
            }, 1000);
        }
    };

    const [formDataState, setFormDataState] = useState({
        ch1: true,
        ch2: true,
        ch3: false,
        ch4: false,
        chFPP: false,
        chPhe: false,
        chVch: false,
        chUm: false,
    });
    const handleCheckboxBottomGrid = (name: any, value: any) => {
        setFormDataState((prevFormData: any) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const headerTemplateBranch1 = () => {
        return <div className="bg-red-700 text-white">E-Branch 1</div>;
    };
    const headerTemplateBranch2 = () => {
        return <div className="bg-blue-700 text-white">E-Branch 2</div>;
    };
    const headerTemplateBranch3 = () => {
        return <div className="bg-red-700 text-white">E-Branch 3</div>;
    };
    const headerTemplateBranch4 = () => {
        return <div className="bg-blue-700 text-white">E-Branch 4</div>;
    };
    const headerTemplateBranch5 = () => {
        return <div className="bg-red-700 text-white">E-Branch 5</div>;
    };
    const handleSelectedDialog = (dataObject: any) => {
        if (!dariBatch) {
            if (dgTrxBankDetailRef.current) {
                const updatedData = (dgTrxBankDetailRef.current.dataSource as any[]).map((item: any) => {
                    if (item.uniqId === dataObject.uniqId) {
                        if (dataObject.namaBankState === 'nama_bank1') {
                            return { ...item, nama_bank1: dataObject.nama_bank, no_rekening1: dataObject.no_rekening, nama_rekening1: dataObject.nama_rekening };
                        } else if (dataObject.namaBankState === 'nama_bank2') {
                            return { ...item, nama_bank2: dataObject.nama_bank, no_rekening2: dataObject.no_rekening, nama_rekening2: dataObject.nama_rekening };
                        } else if (dataObject.namaBankState === 'nama_bank3') {
                            return { ...item, nama_bank3: dataObject.nama_bank, no_rekening3: dataObject.no_rekening, nama_rekening3: dataObject.nama_rekening };
                        } else if (dataObject.namaBankState === 'nama_bank4') {
                            return { ...item, nama_bank4: dataObject.nama_bank, no_rekening4: dataObject.no_rekening, nama_rekening4: dataObject.nama_rekening };
                        } else if (dataObject.namaBankState === 'nama_bank5') {
                            return { ...item, nama_bank5: dataObject.nama_bank, no_rekening5: dataObject.no_rekening, nama_rekening5: dataObject.nama_rekening };
                        }
                    } else {
                        if (dataObject.namaBankState === 'nama_bank1') {
                            return { ...item, nama_bank1: item.nama_bank1, no_rekening1: item.no_rekening1, nama_rekening1: item.nama_rekening1 };
                        } else if (dataObject.namaBankState === 'nama_bank2') {
                            return { ...item, nama_bank2: item.nama_bank2, no_rekening2: item.no_rekening2, nama_rekening2: item.nama_rekening2 };
                        } else if (dataObject.namaBankState === 'nama_bank3') {
                            return { ...item, nama_bank3: item.nama_bank3, no_rekening3: item.no_rekening3, nama_rekening3: item.nama_rekening3 };
                        } else if (dataObject.namaBankState === 'nama_bank4') {
                            return { ...item, nama_bank4: item.nama_bank4, no_rekening4: item.no_rekening4, nama_rekening4: item.nama_rekening4 };
                        } else if (dataObject.namaBankState === 'nama_bank5') {
                            return { ...item, nama_bank5: item.nama_bank5, no_rekening5: item.no_rekening5, nama_rekening5: item.nama_rekening5 };
                        }
                    }
                });
                dgTrxBankDetailRef.current.dataSource = updatedData;
            }
        } else {
            if (dgTrxBankDetailRef.current) {
                const grid = dgTrxBankDetailRef.current;
                const batchChanges = grid.getBatchChanges();

                const matchedRecord = grid.contentModule.rows;
                matchedRecord.map((item: any, index: number) => {
                    if (item?.changes) {
                        if (item?.changes?.id_transaksi === uniqId) {
                            if (dataObject.namaBankState === 'nama_bank1') {
                                grid.updateCell(index, 'nama_bank1', dataObject.nama_bank);
                                grid.updateCell(index, 'no_rekening1', dataObject.no_rekening);
                                grid.updateCell(index, 'nama_rekening1', dataObject.nama_rekening);
                            } else if (dataObject.namaBankState === 'nama_bank2') {
                                grid.updateCell(index, 'nama_bank2', dataObject.nama_bank);
                                grid.updateCell(index, 'no_rekening2', dataObject.no_rekening);
                                grid.updateCell(index, 'nama_rekening2', dataObject.nama_rekening);
                            } else if (dataObject.namaBankState === 'nama_bank3') {
                                grid.updateCell(index, 'nama_bank3', dataObject.nama_bank);
                                grid.updateCell(index, 'no_rekening3', dataObject.no_rekening);
                                grid.updateCell(index, 'nama_rekening3', dataObject.nama_rekening);
                            } else if (dataObject.namaBankState === 'nama_bank4') {
                                grid.updateCell(index, 'nama_bank4', dataObject.nama_bank);
                                grid.updateCell(index, 'no_rekening4', dataObject.no_rekening);
                                grid.updateCell(index, 'nama_rekening4', dataObject.nama_rekening);
                            } else if (dataObject.namaBankState === 'nama_bank5') {
                                grid.updateCell(index, 'nama_bank5', dataObject.nama_bank);
                                grid.updateCell(index, 'no_rekening5', dataObject.no_rekening);
                                grid.updateCell(index, 'nama_rekening5', dataObject.nama_rekening);
                            }
                        }
                    }
                });
            }
        }
    };

    const createStatusCell = (data: any, namaBank: string) => {
        return `
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <div>
                ${data[namaBank]}
            </div>
          <div class="icon-container" style="cursor: pointer;" title="Lihat Jurnal">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                width="2em"
                height="2em"
                >
                <path
                    fill="currentColor"
                    d="m29.772 26.433l-7.126-7.126a10.43 10.43 0 0 0 1.524-5.42c0-5.794-4.692-10.486-10.482-10.488c-5.79 0-10.484 4.693-10.484 10.485c0 5.79 4.693 10.48 10.484 10.48c1.987 0 3.84-.562 5.422-1.522l7.128 7.127l3.534-3.537zM7.202 13.885a6.496 6.496 0 0 1 6.485-6.486a6.493 6.493 0 0 1 6.484 6.485a6.494 6.494 0 0 1-6.483 6.484a6.496 6.496 0 0 1-6.484-6.485z"
                ></path>
                </svg>
                        </div>
                    </div>`;
    };

    const queryCellInfoListData = (args: any) => {
        const field = args.column?.field;
        const data = args.data;

        if (data) {
            const namaBank = ['nama_bank1', 'nama_bank2', 'nama_bank3', 'nama_bank4', 'nama_bank5'];

            namaBank.map((item) => {
                if (field.startsWith(item)) {
                    args.cell.innerHTML = createStatusCell(data, item);

                    const iconContainer = args.cell.querySelector('.icon-container');
                    if (iconContainer) {
                        iconContainer.addEventListener('click', async () => {
                            const grid = dgTrxBankDetailRef.current;
                            const rowsx = grid?.getBatchChanges();
                            const sel = rowsx?.addedRecords?.filter((item: any) => item.id_transaksi === args.data.id_transaksi);

                            if (sel.length === 0) {
                                await handleKlikNamaBank(data.nama_vendor ?? '').then((result) => {
                                    if (result) {
                                        setNamaVendor(data.nama_vendor);
                                        setUniqId(data.uniqId);
                                        setNamaBankState(item);
                                        setShowDaftarBank(true);
                                        setDariBatchBawah(false);
                                    } else {
                                        myAlertGlobal2('Nama Supplier kosong. Silahkan input manual', 'transaksiBank');
                                    }
                                });
                            } else {
                                await handleKlikNamaBank(sel[0]?.nama_vendor ?? '').then((result) => {
                                    if (result) {
                                        setNamaVendor(sel[0].nama_vendor);
                                        setUniqId(sel[0].id_transaksi);
                                        setNamaBankState(item);
                                        setShowDaftarBank(true);
                                        setDariBatchBawah(true);
                                        selectedIDTrx = sel[0].id_transaksi;
                                    } else {
                                        myAlertGlobal2('Nama Supplier kosong. Silahkan input manual', 'transaksiBank');
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
    };

    const handleGridDetail_EndEdit = async (jenis: any) => {
        if (jenis === 'quDTrxbank' && dgTrxBankRef.current) {
            dgTrxBankRef.current.endEdit();
        } else if (jenis === 'quDTrxBankDetail' && dgTrxBankDetailRef.current) {
            dgTrxBankDetailRef.current.endEdit();
        }
    };

    const rowSelectingGridDetail = (args: any, jenis: any) => {
        // console.log('jenis ', jenis);
        if (jenis === 'quDTrxbank') {
            // save('trxAtas');
            setSelectedIdTransaksi(args.data.id_transaksi);
        } else if (jenis === 'quDtrxBankDetail') {
            // console.log('args.data.id_transaksi ', args.data.id_transaksi);
            setSelectedIdTransaksi(args.data.id_transaksi);
        }
        // setSelectedRowIndexTop(args.rowIndex);
    };

    const deleteData = (deletedId: any, jenis: any) => {
        if (dgTrxBankRef.current.dataSource.length > 0 && jenis === 'qudTrxBank') {
            const selectedRecord = dgTrxBankRef.current.getSelectedRecords()?.[0];
            if (!selectedRecord?.id_transaksi) {
                myAlertGlobal2('Silahkan pilih transaksi yang akan dihapus', 'transaksiBank');
                return;
            }
            withReactContent(Swal)
                .fire({
                    html: `Hapus id transaksi ${deletedId}?`,
                    width: '15%',
                    target: '#transaksiBank',
                    showCancelButton: true,
                    confirmButtonText: '<p style="font-size:10px">Ya</p>',
                    cancelButtonText: '<p style="font-size:10px">Tidak</p>',
                })
                .then((result) => {
                    if (result.isConfirmed) {
                        const gridInstance = dgTrxBankRef.current;
                        const updatedData = gridInstance.dataSource.filter((item: any) => item.id_transaksi !== deletedId);
                        gridInstance.dataSource = updatedData;
                        gridInstance.refresh(); // Refresh grid agar data terbaru terlihat
                    } else {
                        console.log('cancel');
                    }
                });
        } else if (dgTrxBankDetailRef.current.dataSource.length > 0 && jenis === 'qudTrxBankDetail') {
            const selectedRecord = dgTrxBankDetailRef.current.getSelectedRecords()?.[0];
            if (!selectedRecord?.id_transaksi) {
                myAlertGlobal2('Silahkan pilih transaksi yang akan dihapus', 'transaksiBank');
                return;
            }
            withReactContent(Swal)
                .fire({
                    html: `Hapus id transaksi ${deletedId}?`,
                    width: '15%',
                    target: '#transaksiBank',
                    showCancelButton: true,
                    confirmButtonText: '<p style="font-size:10px">Ya</p>',
                    cancelButtonText: '<p style="font-size:10px">Tidak</p>',
                })
                .then((result) => {
                    if (result.isConfirmed) {
                        const gridInstance = dgTrxBankDetailRef.current;
                        const updatedData = gridInstance.dataSource.filter((item: any) => item.id_transaksi !== deletedId);
                        gridInstance.dataSource = updatedData;
                        gridInstance.refresh(); // Refresh grid agar data terbaru terlihat
                    } else {
                        console.log('cancel');
                    }
                });
        }
    };

    const actionCompleteGridDetail = async (args: any, jenis: any) => {
        // await recalc();
        // console.log('rgs.requestType', args.requestType);
        switch (args.requestType) {
            case 'save':
                if (jenis === 'quDtrxBank' && dgTrxBankRef.current) {
                } else if (jenis === 'quDtrxBankDetail' && dgTrxBankDetailRef.current) {
                }
                recalc(args);

                break;
            case 'batchsave':
                if (jenis === 'quDtrxBank' && dgTrxBankRef.current) {
                } else if (jenis === 'quDtrxBankDetail' && dgTrxBankDetailRef.current) {
                }
                recalc(args);
                break;
            case 'beginEdit':
                if (jenis === 'quDtrxBank' && dgTrxBankRef.current) {
                    setTambahTop(false);
                    setEditTop(true);
                    // // Recalc();
                } else if (jenis === 'quDtrxBankDetail' && dgTrxBankDetailRef.current) {
                    setTambahBottom(false);
                    setEditBottom(true);
                }

                break;
            case 'refresh':
                if (jenis === 'quDtrxBank' && dgTrxBankRef.current) {
                    // Recalc();
                    setTambahTop(false);
                    setEditTop(false);
                    // save();
                } else if (jenis === 'quDtrxBankDetail' && dgTrxBankDetailRef.current) {
                    setTambahBottom(false);
                    setEditBottom(false);
                }
                recalc(args);
                break;
        }
    };

    const sumber: object[] = [
        { value: 'FPP', text: 'FPP' },
        { value: 'PHE', text: 'PHE' },
        { value: 'VCH', text: 'VCH' },
        { value: 'MANUAL', text: 'MANUAL' },
    ];

    const sumberParams: IEditCell = {
        params: {
            actionComplete: () => false,
            dataSource: new DataManager(sumber),
            fields: { text: 'text', value: 'value' },
            query: new Query(),
            change: (args: any) => {
                const grid = dgTrxBankDetailRef.current;
                const selectedRow = grid.getSelectedRecords()[0];

                if (selectedRow) {
                    const dataSource = dgTrxBankDetailRef.current.dataSource as any[]; //grid.dataSource as any[];
                    const rowIndex = dataSource.findIndex((row: any) => row.id_transaksi === selectedRow.id_transaksi);
                    const rowsx = grid.getBatchChanges();
                    // console.log('rowsx ', rowsx);
                    // console.log('rowIndex ', rowIndex);

                    // console.log('dataSource ', dataSource);
                    // console.log('selectedRow ', selectedRow);
                    // console.log('dataSource[rowIndex] ', dataSource[rowIndex]);

                    if (rowIndex >= 0 && dataSource[rowIndex]) {
                        dataSource[rowIndex].sumber = args.value;
                        // grid.updateCell(rowIndex, 'entitas', args.value);
                        // grid.endEdit(); // End edit mode before saving
                        save('trxBawah');
                    }
                }
            },
            close: () => {
                const grid = dgTrxBankDetailRef.current;
                if (grid) {
                    setTimeout(() => {
                        grid.endEdit();
                    }, 50); // atau 100ms kalau perlu
                }
            },
        },
    };

    const sumberEntitasBawah: IEditCell = {
        params: {
            actionComplete: () => false,
            dataSource: new DataManager(listEntitas),
            fields: { text: 'kodeCabang', value: 'kodeCabang' },
            query: new Query(),
            change: (args: any) => {
                const grid = dgTrxBankDetailRef.current;
                const selectedRow = grid.getSelectedRecords()[0];

                if (selectedRow) {
                    const dataSource = grid.dataSource as any[];
                    const rowIndex = dataSource.findIndex((row: any) => row.id_transaksi === selectedRow.id_transaksi);

                    if (rowIndex >= 0 && dataSource[rowIndex]) {
                        dataSource[rowIndex].entitas = args.value;
                        // grid.updateCell(rowIndex, 'entitas', args.value);
                        // grid.endEdit(); // End edit mode before saving
                        save('trxBawah');
                    }
                }
            },
            close: () => {
                const grid = dgTrxBankDetailRef.current;
                if (grid) {
                    setTimeout(() => {
                        grid.endEdit();
                    }, 50); // atau 100ms kalau perlu
                }
            },
        },
    };

    const sumberEntitasAtas: IEditCell = {
        params: {
            actionComplete: () => false,
            dataSource: new DataManager(listEntitas),
            fields: { text: 'kodeCabang', value: 'kodeCabang' },
            query: new Query(),
            change: (args: any) => {
                const grid = dgTrxBankRef.current;
                const selectedRow = grid.getSelectedRecords()[0];
                console.log('grid ', grid);
                if (selectedRow) {
                    const dataSource = grid.dataSource as any[];
                    const rowIndex = dataSource.findIndex((row: any) => row.id_transaksi === selectedRow.id_transaksi);

                    if (rowIndex >= 0 && dataSource[rowIndex]) {
                        dataSource[rowIndex].entitas = args.value;
                        // grid.updateCell(rowIndex, 'entitas', args.value);
                        // grid.endEdit(); // End edit mode before saving
                        save('trxAtas');
                    }
                }
            },
            close: () => {
                const grid = dgTrxBankRef.current;
                if (grid) {
                    setTimeout(() => {
                        grid.endEdit();
                    }, 50); // atau 100ms kalau perlu
                }
            },
        },
    };

    const atasNama: object[] = [
        { value: 'TUNAI', text: 'TUNAI' },
        { value: 'CEK', text: 'CEK' },
    ];

    const atasNamaParams: IEditCell = {
        params: {
            actionComplete: (args) => {
                console.log('Edit action completed', args);
            },
            dataSource: new DataManager(atasNama),
            fields: { text: 'text', value: 'value' },
            query: new Query(),
            // change: () => save('trxAtas'),
            change: (args: any) => {
                const grid = dgTrxBankRef.current;
                const selectedRow = grid.getSelectedRecords()[0];

                if (selectedRow) {
                    const dataSource = grid.dataSource as any[];
                    const rowIndex = dataSource.findIndex((row: any) => row.id_transaksi === selectedRow.id_transaksi);

                    if (rowIndex >= 0 && dataSource[rowIndex]) {
                        dataSource[rowIndex].nama_rekening = args.value;

                        save('trxAtas');
                    }
                }
            },
            close: () => {
                const grid = dgTrxBankRef.current;
                if (grid) {
                    setTimeout(() => {
                        grid.endEdit();
                    }, 50); // atau 100ms kalau perlu
                }
            },
        },
    };

    const noRekAtas: IEditCell = {
        params: {
            actionComplete: () => false,
            dataSource: new DataManager(atasNama),
            fields: { text: 'text', value: 'value' },
            query: new Query(),
            // change: () => save('trxAtas'),
            change: (args: any) => {
                const grid = dgTrxBankRef.current;
                const selectedRow = grid.getSelectedRecords()[0];

                if (selectedRow) {
                    const dataSource = grid.dataSource as any[];
                    const rowIndex = dataSource.findIndex((row: any) => row.id_transaksi === selectedRow.id_transaksi);

                    if (rowIndex >= 0 && dataSource[rowIndex]) {
                        dataSource[rowIndex].no_rekening = args.value;

                        save('trxAtas');
                    }
                }
            },
            close: () => {
                const grid = dgTrxBankRef.current;
                if (grid) {
                    setTimeout(() => {
                        grid.endEdit();
                    }, 50); // atau 100ms kalau perlu
                }
            },
        },
    };

    const kodeAtas: IEditCell = {
        params: {
            actionComplete: () => false,
            // dataSource: new DataManager(atasNama),
            // fields: { text: 'text', value: 'value' },
            // query: new Query(),
            change: (args: any) => {
                const grid = dgTrxBankRef.current;
                const selectedRow = grid.getSelectedRecords()[0];
                const dataSource = grid.dataSource as any[];
                const rowIndex = dataSource.findIndex((row: any) => row.id_transaksi === selectedRow.id_transaksi);

                const editCell = grid.element.querySelector('.e-editedbatchcell, .e-editedcell');
                // console.log('editCell ', editCell);
                if (editCell) {
                    const colIndex = parseInt(editCell.getAttribute('aria-colindex'), 10);
                    const columns = grid.getColumns();
                    const activeColumn = columns[colIndex - 1];
                    if (rowIndex >= 0 && dataSource[rowIndex] && activeColumn?.field) {
                        dataSource[rowIndex][activeColumn.field] = args.value;
                        // Update the field based on which column is being edited
                        // if (activeColumn.field === 'kode_eBranch1') {
                        //     dataSource[rowIndex].kode_eBranch1 = args.value;
                        //     // grid.updateCell(rowIndex, 'kode_eBranch1', args.value);
                        // } else if (activeColumn?.field === 'kode_eBranch2') {
                        //     dataSource[rowIndex].kode_eBranch2 = args.value;
                        //     // grid.updateCell(rowIndex, 'kode_eBranch2', args.value);
                        // } else if (activeColumn?.field === 'kode_eBranch3') {
                        //     dataSource[rowIndex].kode_eBranch3 = args.value;
                        //     // grid.updateCell(rowIndex, 'kode_eBranch3', args.value);
                        // } else if (activeColumn?.field === 'kode_eBranch4') {
                        //     dataSource[rowIndex].kode_eBranch4 = args.value;
                        //     // grid.updateCell(rowIndex, 'kode_eBranch4', args.value);
                        // } else if (activeColumn?.field === 'kode_eBranch5') {
                        //     dataSource[rowIndex].kode_eBranch5 = args.value;
                        //     // grid.updateCell(rowIndex, 'kode_eBranch5', args.value);
                        // }
                        // grid.endEdit();
                        save('trxAtas');
                    }
                } else {
                    console.log('No active column found');
                }

                // if (selectedRow) {
                //     const dataSource = grid.dataSource as any[];
                //     const rowIndex = dataSource.findIndex((row: any) => row.id_transaksi === selectedRow.id_transaksi);

                //     // Get the current edit state from the grid
                //     const editState = grid.editSettings;
                //     const tesKolom = grid.getColumns(); //[0].field
                //     const activeColumn = grid.getColumns().find((col: any) => col.field === 'kode_eBranch1')?.field;
                //     console.log('tesKolom ', tesKolom);
                //     console.log('editState ', editState);

                //     if (rowIndex >= 0 && dataSource[rowIndex] && currentField) {
                //         // Update the field based on which column is being edited
                //         if (currentField === 'kode_eBranch1') {
                //             dataSource[rowIndex].kode_eBranch1 = args.value;
                //             grid.updateCell(rowIndex, 'kode_eBranch1', args.value);
                //         } else if (currentField === 'kode_eBranch2') {
                //             dataSource[rowIndex].kode_eBranch2 = args.value;
                //             grid.updateCell(rowIndex, 'kode_eBranch2', args.value);
                //         } else if (currentField === 'kode_eBranch3') {
                //             dataSource[rowIndex].kode_eBranch3 = args.value;
                //             grid.updateCell(rowIndex, 'kode_eBranch3', args.value);
                //         } else if (currentField === 'kode_eBranch4') {
                //             dataSource[rowIndex].kode_eBranch4 = args.value;
                //             grid.updateCell(rowIndex, 'kode_eBranch4', args.value);
                //         } else if (currentField === 'kode_eBranch5') {
                //             dataSource[rowIndex].kode_eBranch5 = args.value;
                //             grid.updateCell(rowIndex, 'kode_eBranch5', args.value);
                //         }
                //         // grid.endEdit();
                //         save('trxAtas');
                //     }
                // }
            },
            close: () => {
                const grid = dgTrxBankRef.current;
                if (grid) {
                    setTimeout(() => {
                        grid.endEdit();
                    }, 50); // atau 100ms kalau perlu
                }
            },
        },
    };

    const textParams: IEditCell = {
        params: {
            actionComplete: () => false,
            change: () => save('all'),
        },
    };

    const textParamsKetBawah: IEditCell = {
        params: {
            actionComplete: () => false,
            //  dataSource: new DataManager(atasNama),
            // fields: { text: 'text', value: 'value' },
            // query: new Query(),
            change: (args: any) => {
                const grid = dgTrxBankDetailRef.current;
                const selectedRow = grid.getSelectedRecords()[0];
                const dataSource = grid.dataSource as any[];
                const rowIndex = dataSource.findIndex((row: any) => row.id_transaksi === selectedRow.id_transaksi);

                const editCell = grid.element.querySelector('.e-editedbatchcell, .e-editedcell');
                // console.log('editCell ', editCell);
                if (editCell) {
                    const colIndex = parseInt(editCell.getAttribute('aria-colindex'), 10);
                    const columns = grid.getColumns();
                    const activeColumn = columns[colIndex - 1];
                    if (rowIndex >= 0 && dataSource[rowIndex] && activeColumn?.field) {
                        dataSource[rowIndex][activeColumn.field] = args.value;

                        save('trxBawah');
                    }
                } else {
                    console.log('No active column found');
                }
            },
            close: () => {
                const grid = dgTrxBankDetailRef.current;
                if (grid) {
                    setTimeout(() => {
                        grid.endEdit();
                    }, 50); // atau 100ms kalau perlu
                }
            },
        },
    };

    const textParamsNoDokBawah: IEditCell = {
        create: () => {
            textElem = document.createElement('input');
            return textElem;
        },
        read: () => {
            return textObj?.value;
        },
        destroy: () => {
            textObj?.destroy();
        },
        write: (args: any) => {
            let rowData = args.rowData;
            const targetId = args.rowData.id_transaksi;
            let updatedValue = '';

            textObj = new TextBox({
                value: args.rowData[args.column.field],
                change: function (args) {
                    const dataSource = dgTrxBankDetailRef.current.dataSource as any[];
                    const rowIndex = dataSource.findIndex((row: any) => row.id_transaksi === targetId);
                    const grid = dgTrxBankDetailRef.current;
                    updatedValue = args.value;

                    if (rowIndex >= 0 && dataSource[rowIndex]) {
                        dataSource[rowIndex]['no_dokumen_sumber'] = updatedValue;
                    }
                    save('trxBawah');
                },
            });
            textObj.appendTo(textElem);
        },
    };

    const textParamsVendorBawah: IEditCell = {
        create: () => {
            textElem = document.createElement('input');
            return textElem;
        },
        read: () => {
            return textObj?.value;
        },
        destroy: () => {
            textObj?.destroy();
        },
        write: (args: any) => {
            let rowData = args.rowData;
            const targetId = args.rowData.id_transaksi;
            let updatedValue = '';

            textObj = new TextBox({
                value: args.rowData[args.column.field],
                change: function (args) {
                    const dataSource = dgTrxBankDetailRef.current.dataSource as any[];
                    const rowIndex = dataSource.findIndex((row: any) => row.id_transaksi === targetId);
                    const grid = dgTrxBankDetailRef.current;
                    updatedValue = args.value;

                    if (rowIndex >= 0 && dataSource[rowIndex]) {
                        dataSource[rowIndex]['nama_vendor'] = updatedValue;
                    }
                    save('trxBawah');
                },
            });
            textObj.appendTo(textElem);
        },
    };

    const templateEntitas = (args: any) => {
        return (
            <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6">
                <DropDownListComponent
                    id="entitas"
                    name="entitas"
                    dataSource={listEntitas}
                    fields={{ value: 'kodeCabang', text: 'kodeCabang' }}
                    floatLabelType="Never"
                    placeholder={args.kodeCabang}
                    onChange={(e: any) => {
                        // console.log('args', args);
                        // console.log('e', e);
                        const targetId = args.id_transaksi;
                        const grid = dgTrxBankDetailRef.current;
                        const dataSource = dgTrxBankDetailRef.current.dataSource as any[];
                        const rowIndex = dataSource.findIndex((row: any) => row.id_transaksi === targetId);

                        // console.log('e.value ', e.value);
                        // console.log('args.index ', args.index);
                        // console.log('targetId ', targetId);
                        // console.log('rowIndex ', rowIndex);

                        // if (rowIndex >= 0 && dataSource[rowIndex]) {
                        //     dataSource[rowIndex]['entitas'] = e.value;
                        // }
                        // save('trxBawah');

                        // dgTrxBankDetailRef.current.endEdit();
                        // vRefreshData.current += 1;
                        if (dgTrxBankDetailRef.current) {
                            dgTrxBankDetailRef.current.dataSource[rowIndex] = {
                                ...dgTrxBankDetailRef.current.dataSource[rowIndex],
                                entitas: e.value,
                            };
                            // dgTrxBankDetailRef.current.refresh();
                            // save('trxBawah');
                        }
                    }}
                />
            </div>
        );
    };

    const datepickerparams: IEditCell = {
        params: {
            showClearButton: false,
            showTodayButton: true,
            format: 'dd-MM-yyyy',
            change: () => save('all'),
        },
    };

    const prosesBayarEdit: IEditCell = {
        create: () => {
            const element = document.createElement('input');
            element.type = 'checkbox';
            element.classList.add('e-checkbox');
            return element;
        },
        read: (element: HTMLInputElement) => element.checked, // Mengembalikan status checkbox (true/false)

        write: (args: any) => {
            let rowData = args.rowData;
            // let rowIndex = dgTrxBankDetailRef.current.getRowInfo(args.row).rowIndex;
            const targetId = args.rowData.id_transaksi;
            let nominal_bayar = 0;
            let nominal_sisa = 0;
            let nominal1 = 0;
            let total_dibayarkan = 0;
            let total_dibayarkan_uncek = 0;
            let nominal_sisa_uncek = 0;
            const inputElement = args.element as HTMLInputElement;
            inputElement.checked = args.rowData[args.column.field] === true; // Atur nilai awal checkbox

            inputElement.addEventListener('change', (event: Event) => {
                const grid = dgTrxBankDetailRef.current;

                const dataSource = dgTrxBankDetailRef.current.dataSource as any[];
                const rowIndex = dataSource.findIndex((row: any) => row.id_transaksi === targetId);
                const checkbox = event.target as HTMLInputElement;
                nominal1 = rowData.nominal_sisa;
                nominal_bayar = rowData.nominal_sisa;
                total_dibayarkan = nominal_bayar + rowData.nominal2 + rowData.nominal3 + rowData.nominal4 + rowData.nominal5;
                nominal_sisa = rowData.nominal_tagihan - total_dibayarkan;
                total_dibayarkan_uncek = rowData.nominal_sisa + rowData.nominal1 + rowData.nominal2 + rowData.nominal3 + rowData.nominal4 + rowData.nominal5;
                nominal_sisa_uncek = total_dibayarkan_uncek;
                if (rowData.nominal_tagihan === 0) {
                    myAlertGlobal2(
                        ` Proses pembayaran tidak dapat dilakukan.
                         Nominal Tagihan: ${frmNumber(rowData.nominal_tagihan)}`,
                        'transaksiBank'
                    );
                    checkbox.checked = false; // Kembalikan status checkbox ke false
                    return;
                } else {
                    const rowsx = grid.getBatchChanges();

                    const nominalBayar = ((dgTrxBankDetailRef.current?.dataSource as any[]) || []).reduce((total, item) => total + (item.nominal_bayar || 0), 0);
                    const nominalTagihan = ((dgTrxBankDetailRef.current?.dataSource as any[]) || []).reduce((total, item) => total + (item.nominal_tagihan || 0), 0);
                    const totalNominalReady = ((dgTrxBankRef.current?.dataSource as any[]) || []).reduce((total, item) => total + (item.nominal_ready || 0), 0);

                    const totalNominalBayar = nominalBayar + nominal_bayar;

                    if (checkbox.checked) {
                        if (totalNominalBayar > totalNominalReady) {
                            myAlertGlobal(
                                `Total Saldo Bank: ${frmNumber(totalNominalReady)}
                         Nominal Tagihan: ${frmNumber(nominalTagihan)}
                         Total Nominal Bayar: ${frmNumber(totalNominalBayar)}
                         Transaksi detail nominal bayar tidak boleh lebih besar dari saldo API / Saldo Real.`,
                                'transaksiBank'
                            );
                            checkbox.checked = false; // Kembalikan status checkbox ke false
                            return;
                        }

                        if (rowIndex >= 0 && dataSource[rowIndex]) {
                            dataSource[rowIndex]['proses_bayar'] = true;
                            dataSource[rowIndex]['nominal_bayar'] = nominal_bayar;
                            dataSource[rowIndex]['nominal_sisa'] = nominal_sisa;
                            dataSource[rowIndex]['nominal1'] = nominal1;
                        }
                    } else {
                        nominal_bayar = 0;
                        rowData.nominal1 = 0;
                        rowData.nominal2 = 0;
                        rowData.nominal3 = 0;
                        rowData.nominal4 = 0;
                        rowData.nominal5 = 0;

                        if (rowIndex >= 0 && dataSource[rowIndex]) {
                            dataSource[rowIndex]['proses_bayar'] = false;
                            dataSource[rowIndex]['nominal_bayar'] = 0;
                            dataSource[rowIndex]['nominal_sisa'] = total_dibayarkan_uncek;
                            dataSource[rowIndex]['nominal1'] = 0;
                            dataSource[rowIndex]['nominal2'] = 0;
                            dataSource[rowIndex]['nominal3'] = 0;
                            dataSource[rowIndex]['nominal4'] = 0;
                            dataSource[rowIndex]['nominal5'] = 0;
                        }
                    }
                    save('trxBawah');
                }
            });
        },

        params: {
            disabled: false,
        },
    };

    const nominalBayarEdit: IEditCell = {
        create: () => {
            priceElem = document.createElement('input');
            return priceElem;
        },
        read: () => {
            return priceObj?.value;
        },
        destroy: () => {
            priceObj?.destroy();
        },
        write: (args: any) => {
            let rowData = args.rowData;

            // let rowIndex = dgTrxBankDetailRef.current.getRowInfo(args.row).rowIndex;
            const targetId = args.rowData.id_transaksi;
            let nominalSisa = 0;
            let nominal_bayar = 0;
            let nominal_tagihan = 0;
            let nominal_sisa = 0;
            let nominal1 = 0;
            let total_dibayarkan = 0;
            let updatedValue = 0;

            priceObj = new NumericTextBox({
                value: args.rowData[args.column.field],
                showSpinButton: false,
                change: function (args) {
                    const dataSource = dgTrxBankDetailRef.current.dataSource as any[];
                    const rowIndex = dataSource.findIndex((row: any) => row.id_transaksi === targetId);
                    const grid = dgTrxBankDetailRef.current;
                    updatedValue = args.value;
                    nominalSisa = rowData['nominal_tagihan'] - updatedValue;
                    nominal_bayar = args.value;
                    nominal1 = updatedValue;
                    total_dibayarkan = nominal_bayar + rowData.nominal2 + rowData.nominal3 + rowData.nominal4 + rowData.nominal5;
                    nominal_sisa = rowData.nominal_tagihan - total_dibayarkan;

                    const totalNominalReady = (dgTrxBankRef.current?.dataSource as any[]).reduce((total, item) => total + (item.nominal_ready || 0), 0);
                    const nominalBayar = (dgTrxBankDetailRef.current.dataSource as any[]).reduce((total, item) => total + (item.nominal_bayar || 0), 0);
                    const nominal_tagihan = (dgTrxBankDetailRef.current.dataSource as any[]).reduce((total, item) => total + (item.nominal_tagihan || 0), 0);
                    const totalNominalTagihan = nominal_tagihan - updatedValue;
                    const totalNominalBayar = nominalBayar + updatedValue;

                    // if (totalNominalBayar > vTotalNominalReady || (totalNominalBayar === 0 && vTotalNominalReady === 0)) {
                    if (totalNominalBayar > totalNominalReady || (totalNominalBayar === 0 && totalNominalReady === 0)) {
                        // setTimeout(() => {
                        myAlertGlobal(
                            `Total Saldo Bank :  ${frmNumber(totalNominalReady)}
                          Nominal Tagihan :  ${frmNumber(totalNominalTagihan)}
                          Total Nominal Bayar : ${frmNumber(totalNominalBayar)}
                          Transaksi detail nominal bayar tidak boleh lebih besar dari saldo API / Saldo Real`,
                            'transaksiBank'
                        );
                        // }, 0);

                        dgTrxBankDetailRef.current.refresh();
                    } else {
                        if (rowIndex >= 0 && dataSource[rowIndex]) {
                            dataSource[rowIndex]['proses_bayar'] = true;
                            dataSource[rowIndex].nominal_bayar = updatedValue;
                            dataSource[rowIndex].nominal_sisa = nominalSisa;
                            dataSource[rowIndex].nominal1 = updatedValue;
                        }
                        // grid.updateCell(rowIndex, 'proses_bayar', true);
                        // grid.updateCell(rowIndex, 'nominal_sisa', rowData['nominal_tagihan'] - updatedValue);
                        // grid.updateCell(rowIndex, 'nominal1', updatedValue);

                        // dataSource[rowIndex].nominal_bayar = updatedValue;
                        // dataSource[rowIndex].proses_bayar = true;

                        save('trxBawah');
                        // handleDataChange();
                    }
                },
            });
            priceObj.appendTo(priceElem);
        },
    };

    const nominalRealEdit: IEditCell = {
        create: () => {
            nominalRealElem = document.createElement('input');
            return nominalRealElem;
        },
        read: () => {
            return nominalRealObj?.value;
        },
        destroy: () => {
            nominalRealObj?.destroy();
        },
        write: (args: any) => {
            let rowData = args.rowData;
            // let rowIndex = dgTrxBankRef.current.getRowInfo(args.row).rowIndex;
            const targetId = args.rowData.id_transaksi;
            let updatedValue = 0;
            let saldoEndap = rowData.saldo_endap;
            let nominalReadyx = 0;

            nominalRealObj = new NumericTextBox({
                value: args.rowData[args.column.field],
                showSpinButton: false,
                change: function (args) {
                    let totalNominalReady = 0;
                    const dataSource = dgTrxBankRef.current.dataSource as any[];
                    const rowIndex = dataSource.findIndex((row: any) => {
                        return row.id_transaksi === targetId;
                    });

                    const grid = dgTrxBankRef.current;
                    updatedValue = args.value;
                    const rowsx = grid.getBatchChanges();
                    const allRecords = [...(rowsx.addedRecords || []), ...(rowsx.changedRecords || [])];
                    const totalNominalReadyExisting = (dgTrxBankRef.current?.dataSource as any[]).reduce((total, item) => total + (item.nominal_ready || 0), 0);
                    const batchNominalReady = (allRecords as any[]).reduce((total, item) => total + (item.nominal_ready || 0), 0);

                    totalNominalReady += updatedValue + batchNominalReady;
                    vTotalNominalReady = totalNominalReady + totalNominalReadyExisting;

                    if (updatedValue === 0) {
                        nominalReadyx = updatedValue;
                    } else {
                        nominalReadyx = updatedValue - saldoEndap;
                    }

                    if (updatedValue != 0) {
                        if (updatedValue < saldoEndap) {
                            myAlertGlobal2(
                                `Saldo Bank yang di input :  ${frmNumber(updatedValue)}
                         Saldo Endap :  ${frmNumber(saldoEndap)}
                          Saldo Real tidak boleh lebih kecil dari saldo endap `,
                                'transaksiBank'
                            );
                            dgTrxBankRef.current.refresh();
                        } else {
                            if (rowIndex >= 0 && dataSource[rowIndex]) {
                                dataSource[rowIndex].saldo_real = updatedValue;
                                dataSource[rowIndex].nominal_ready = nominalReadyx;
                                dataSource[rowIndex].nominal1 = nominalReadyx;
                                if (updatedValue === 0) {
                                    dataSource[rowIndex].nominal2 = 0;
                                    dataSource[rowIndex].nominal3 = 0;
                                    dataSource[rowIndex].nominal4 = 0;
                                    dataSource[rowIndex].nominal5 = 0;
                                }
                            }
                            // grid.updateCell(rowIndex, 'nominal_ready', nominalReadyx);
                            // grid.updateCell(rowIndex, 'nominal1', nominalReadyx);
                            // if (updatedValue === 0) {
                            //     grid.updateCell(rowIndex, 'nominal2', nominalReadyx);
                            //     grid.updateCell(rowIndex, 'nominal3', nominalReadyx);
                            //     grid.updateCell(rowIndex, 'nominal4', nominalReadyx);
                            //     grid.updateCell(rowIndex, 'nominal5', nominalReadyx);
                            // }

                            // dataSource[rowIndex].nominal_ready = nominalReadyx;
                            // dataSource[rowIndex].nominal1 = nominalReadyx;
                            save('trxAtas');
                        }
                    } else {
                        if (rowIndex >= 0 && dataSource[rowIndex]) {
                            dataSource[rowIndex].saldo_real = updatedValue;
                            dataSource[rowIndex].nominal_ready = nominalReadyx;
                            dataSource[rowIndex].nominal1 = nominalReadyx;
                            if (updatedValue === 0) {
                                dataSource[rowIndex].nominal2 = 0;
                                dataSource[rowIndex].nominal3 = 0;
                                dataSource[rowIndex].nominal4 = 0;
                                dataSource[rowIndex].nominal5 = 0;
                            }
                        }
                        // grid.updateCell(rowIndex, 'nominal_ready', nominalReadyx);
                        // grid.updateCell(rowIndex, 'nominal1', nominalReadyx);
                        // if (updatedValue === 0) {
                        //     grid.updateCell(rowIndex, 'nominal2', nominalReadyx);
                        //     grid.updateCell(rowIndex, 'nominal3', nominalReadyx);
                        //     grid.updateCell(rowIndex, 'nominal4', nominalReadyx);
                        //     grid.updateCell(rowIndex, 'nominal5', nominalReadyx);
                        // }
                        save('trxAtas');
                    }
                },
            });
            nominalRealObj.appendTo(nominalRealElem);
            // save();
        },
    };

    const nominalReadyEdit: IEditCell = {
        create: () => {
            nominalReadyElem = document.createElement('input');
            return nominalReadyElem;
        },
        read: () => {
            return nominalReadyObj?.value;
        },
        destroy: () => {
            nominalReadyObj?.destroy();
        },
        write: (args: any) => {
            let rowData = args.rowData;
            // let rowIndex = dgTrxBankRef.current.getRowInfo(args.row).rowIndex;
            const targetId = args.rowData.id_transaksi;
            let updatedValue = 0;
            let saldoReal = rowData.saldo_real;
            let nominalReadyx = rowData.saldo_real;

            nominalReadyObj = new NumericTextBox({
                value: args.rowData[args.column.field],
                showSpinButton: false,
                change: function (args) {
                    let totalNominalReady = 0;
                    const dataSource = dgTrxBankRef.current.dataSource as any[];
                    const rowIndex = dataSource.findIndex((row: any) => row.id_transaksi === targetId);
                    const grid = dgTrxBankRef.current;
                    updatedValue = args.value;
                    const rowsx = grid.getBatchChanges();

                    const allRecords = [...(rowsx.addedRecords || []), ...(rowsx.changedRecords || [])];
                    const totalNominalReadyExisting = (dgTrxBankRef.current?.dataSource as any[]).reduce((total, item) => total + (item.nominal_ready || 0), 0);
                    const batchNominalReady = (allRecords as any[]).reduce((total, item) => total + (item.nominal_ready || 0), 0);

                    totalNominalReady += updatedValue + batchNominalReady;
                    vTotalNominalReady = totalNominalReady + totalNominalReadyExisting;

                    if (updatedValue > saldoReal) {
                        myAlertGlobal2(
                            `Nominal ready yang di input :  ${frmNumber(updatedValue)}
                         Saldo Real :  ${frmNumber(saldoReal)}
                          Nominal ready tidak boleh lebih besar dari saldo real `,
                            'transaksiBank'
                        );
                        dgTrxBankRef.current.refresh();
                    } else if (saldoReal === 0) {
                        myAlertGlobal2(`Saldo real tidak ada atau belum di input `, 'transaksiBank');
                        dgTrxBankRef.current.refresh();
                    } else {
                        // grid.updateCell(rowIndex, 'nominal_ready', updatedValue);
                        if (rowIndex >= 0 && dataSource[rowIndex]) {
                            dataSource[rowIndex].nominal_ready = updatedValue;
                            dataSource[rowIndex].nominal1 = updatedValue;
                        }
                        grid.updateCell(rowIndex, 'nominal1', updatedValue);
                        // dataSource[rowIndex].nominal1 = updatedValue;
                        save('trxAtas');
                        // handleDataChange();
                    }
                },
            });
            nominalReadyObj.appendTo(nominalReadyElem);
        },
    };

    const nominalTagihanEditBawah: IEditCell = {
        create: () => {
            nominalTagihanElem = document.createElement('input');
            return nominalTagihanElem;
        },
        read: () => {
            return nominalTagihanObj?.value;
        },
        destroy: () => {
            nominalTagihanObj?.destroy();
        },
        write: (args: any) => {
            let rowData = args.rowData;
            // let rowIndex = dgTrxBankDetailRef.current.getRowInfo(args.row).rowIndex;
            const targetId = args.rowData.id_transaksi;
            let updatedValue = 0;
            // let saldoReal = rowData.saldo_real;
            // let nominalReadyx = rowData.saldo_real;
            const vNamaVendor = args.rowData.nama_vendor;

            nominalTagihanObj = new NumericTextBox({
                value: args.rowData[args.column.field],
                showSpinButton: false,
                change: function (args) {
                    if (vNamaVendor !== '') {
                        const dataSource = dgTrxBankDetailRef.current.dataSource as any[];
                        const rowIndex = dataSource.findIndex((row: any) => row.id_transaksi === targetId);
                        const grid = dgTrxBankDetailRef.current;
                        updatedValue = args.value;
                        if (rowIndex >= 0 && dataSource[rowIndex]) {
                            dataSource[rowIndex].nominal_tagihan = updatedValue;
                            dataSource[rowIndex].nominal_sisa = updatedValue;
                            dataSource[rowIndex].nominal_bayar = 0;
                        }

                        // grid.updateCell(rowIndex, 'nominal_sisa', updatedValue);
                        // grid.updateCell(rowIndex, 'nominal_bayar', 0);

                        // grid.updateCell(rowIndex, 'nominal_tagihan', updatedValue);
                        // dataSource[rowIndex].nominal_tagihan = updatedValue;
                        // dataSource[rowIndex].nominal_sisa = updatedValue;
                        // dataSource[rowIndex].nominal_bayar = 0;
                        save('trxBawah');
                    } else {
                        myAlertGlobal('Nama vendor / supplier tidak boleh kosong', 'transaksiBank');
                        setTimeout(() => {
                            dgTrxBankDetailRef.current.refresh();
                        }, 1000);
                        return;
                    }

                    // }
                },
            });
            nominalTagihanObj.appendTo(nominalTagihanElem);
        },
    };

    const nominalBranchAtasEdit: IEditCell = {
        create: () => {
            nominalAtasElem = document.createElement('input');
            return nominalAtasElem;
        },
        read: () => {
            return nominalAtasObj?.value;
        },
        destroy: () => {
            nominalAtasObj?.destroy();
        },
        write: (args: any) => {
            let rowData = args.rowData;
            // let rowIndex = dgTrxBankRef.current.getRowInfo(args.row).rowIndex;
            const targetId = args.rowData.id_transaksi; // Ambil ID data yang ingin dicari index-nya

            const namaFieldEdit = args?.column?.field;

            nominalAtasObj = new NumericTextBox({
                value: args.rowData[args.column?.field],
                showSpinButton: false,
                change: function (args) {
                    let totalNominal = 0;
                    let updateNominal1 = 0;
                    let nomReady = 0;
                    const updatedValue = args.value;
                    const nominalReady = rowData.nominal_ready;
                    const dataSource = dgTrxBankRef.current.dataSource as any[];
                    const rowIndex = dataSource.findIndex((row: any) => row.id_transaksi === targetId);

                    const grid = dgTrxBankRef.current;
                    if (updatedValue > nominalReady) {
                        let pesan: any;
                        if (namaFieldEdit === 'nominal1') {
                            pesan = `Total Nominal Ready :  ${frmNumber(nominalReady)}
                              Nominal 1 :  ${frmNumber(updatedValue)}
                              Data tidak dapat di input. Nilai nominal 1 lebih besar dari nominal ready. `;
                        } else if (namaFieldEdit === 'nominal2') {
                            pesan = `Total Nominal Ready :  ${frmNumber(nominalReady)}
                              Nominal 2 :  ${frmNumber(updatedValue)}
                              Data tidak dapat di input. Nilai nominal 2 lebih besar dari nominal ready. `;
                        } else if (namaFieldEdit === 'nominal3') {
                            pesan = `Total Nominal Ready :  ${frmNumber(nominalReady)}
                              Nominal 3 :  ${frmNumber(updatedValue)}
                              Data tidak dapat di input. Nilai nominal 3 lebih besar dari nominal ready. `;
                        } else if (namaFieldEdit === 'nominal4') {
                            pesan = `Total Nominal Ready :  ${frmNumber(nominalReady)}
                              Nominal 4 :  ${frmNumber(updatedValue)}
                              Data tidak dapat di input. Nilai nominal 4 lebih besar dari nominal ready. `;
                        } else if (namaFieldEdit === 'nominal5') {
                            pesan = `Total Nominal Ready :  ${frmNumber(nominalReady)}
                              Nominal 5 :  ${frmNumber(updatedValue)}
                              Data tidak dapat di input. Nilai nominal 5 lebih besar dari nominal ready. `;
                        }
                        myAlertGlobal2(pesan, 'transaksiBank');

                        dgTrxBankRef.current.refresh();
                    } else if (updatedValue === nominalReady) {
                        let pesan: any;
                        if (namaFieldEdit === 'nominal1') {
                            pesan = `Total Nominal Ready :  ${frmNumber(nominalReady)}
                              Nominal 1 :  ${frmNumber(updatedValue)}
                              Data tidak dapat di input. Nilai nominal 1 sama dengan nominal ready. Silahkan input melalui Nominal Ready`;
                        } else if (namaFieldEdit === 'nominal2') {
                            pesan = `Total Nominal Ready :  ${frmNumber(nominalReady)}
                              Nominal 2 :  ${frmNumber(updatedValue)}
                              Data tidak dapat di input. Nilai nominal 2 sama dengan nominal 1 (E-Branch 1). `;
                        } else if (namaFieldEdit === 'nominal3') {
                            pesan = `Total Nominal Ready :  ${frmNumber(nominalReady)}
                              Nominal 3 :  ${frmNumber(updatedValue)}
                              Data tidak dapat di input. Nilai nominal 3 sama dengan nominal 1 (E-Branch 1). `;
                        } else if (namaFieldEdit === 'nominal4') {
                            pesan = `Total Nominal Ready :  ${frmNumber(nominalReady)}
                              Nominal 4 :  ${frmNumber(updatedValue)}
                              Data tidak dapat di input. Nilai nominal 4 sama dengan nominal 1 (E-Branch 1). `;
                        } else if (namaFieldEdit === 'nominal5') {
                            pesan = `Total Nominal Ready :  ${frmNumber(nominalReady)}
                              Nominal 5 :  ${frmNumber(updatedValue)}
                              Data tidak dapat di input. Nilai nominal 5 sama dengan nominal 1 (E-Branch 1). `;
                        }
                        myAlertGlobal2(pesan, 'transaksiBank');

                        dgTrxBankRef.current.refresh();
                    } else {
                        if (rowIndex >= 0 && dataSource[rowIndex]) {
                            if (namaFieldEdit === 'nominal1') {
                                nomReady = rowData.nominal_ready;
                                totalNominal = rowData.nominal1 + rowData.nominal3 + rowData.nominal4 + rowData.nominal5;
                                updateNominal1 = updatedValue;
                            } else if (namaFieldEdit === 'nominal2') {
                                nomReady = rowData.nominal_ready;
                                totalNominal = updatedValue + rowData.nominal3 + rowData.nominal4 + rowData.nominal5;
                                updateNominal1 = nominalReady - totalNominal;
                                dataSource[rowIndex].nominal2 = updatedValue;
                                dataSource[rowIndex].nominal1 = updateNominal1;
                            } else if (namaFieldEdit === 'nominal3') {
                                nomReady = rowData.nominal_ready;
                                totalNominal = updatedValue + +rowData.nominal2 + rowData.nominal4 + rowData.nominal5;
                                updateNominal1 = nominalReady - totalNominal;
                                dataSource[rowIndex].nominal3 = updatedValue;
                                dataSource[rowIndex].nominal1 = updateNominal1;
                            } else if (namaFieldEdit === 'nominal4') {
                                nomReady = rowData.nominal_ready;
                                totalNominal = updatedValue + +rowData.nominal2 + rowData.nominal3 + rowData.nominal5;
                                updateNominal1 = nominalReady - totalNominal;
                                dataSource[rowIndex].nominal4 = updatedValue;
                                dataSource[rowIndex].nominal1 = updateNominal1;
                            } else if (namaFieldEdit === 'nominal5') {
                                nomReady = rowData.nominal_ready;
                                totalNominal = updatedValue + +rowData.nominal2 + rowData.nominal3 + rowData.nominal4;
                                updateNominal1 = nominalReady - totalNominal;
                                dataSource[rowIndex].nominal5 = updatedValue;
                                dataSource[rowIndex].nominal1 = updateNominal1;
                            }
                        } else {
                            if (namaFieldEdit === 'nominal1') {
                                nomReady = rowData.nominal_ready;
                                totalNominal = rowData.nominal1 + rowData.nominal3 + rowData.nominal4 + rowData.nominal5;
                                updateNominal1 = updatedValue;
                            } else if (namaFieldEdit === 'nominal2') {
                                nomReady = rowData.nominal_ready;
                                totalNominal = updatedValue + rowData.nominal3 + rowData.nominal4 + rowData.nominal5;
                                updateNominal1 = nomReady - totalNominal;
                                // dgTrxBankRef.current.updateCell(rowIndex, 'nominal1', updateNominal1);
                            } else if (namaFieldEdit === 'nominal3') {
                                nomReady = rowData.nominal_ready;
                                totalNominal = updatedValue + +rowData.nominal2 + rowData.nominal4 + rowData.nominal5;
                                updateNominal1 = nomReady - totalNominal;
                                // dgTrxBankRef.current.updateCell(rowIndex, 'nominal1', updateNominal1);
                            } else if (namaFieldEdit === 'nominal4') {
                                nomReady = rowData.nominal_ready;
                                totalNominal = updatedValue + +rowData.nominal2 + rowData.nominal3 + rowData.nominal5;
                                updateNominal1 = nomReady - totalNominal;
                                // dgTrxBankRef.current.updateCell(rowIndex, 'nominal1', updateNominal1);
                            } else if (namaFieldEdit === 'nominal5') {
                                nomReady = rowData.nominal_ready;
                                totalNominal = updatedValue + +rowData.nominal2 + rowData.nominal3 + rowData.nominal4;
                                updateNominal1 = nomReady - totalNominal;
                                // dgTrxBankRef.current.updateCell(rowIndex, 'nominal1', updateNominal1);
                            }
                        }

                        // dgTrxBankRef.current.updateCell(rowIndex, 'nominal1', updateNominal1);
                        save('trxAtas');
                    }
                    // }
                },
            });
            nominalAtasObj.appendTo(nominalAtasElem);
        },
    };

    const nominalBranchBawahEdit: IEditCell = {
        create: () => {
            nominalElem = document.createElement('input');
            return nominalElem;
        },
        read: () => {
            return nominalObj?.value;
        },
        destroy: () => {
            nominalObj?.destroy();
        },
        write: (args: any) => {
            let rowData = args.rowData;

            // let rowIndex = dgTrxBankDetailRef.current.getRowInfo(args.row).rowIndex;
            // const sortedData = dgTrxBankDetailRef.current.getCurrentViewRecords();
            const targetId = args.rowData.id_transaksi; // Ambil ID data yang ingin dicari index-nya
            // const rowIndex = sortedData.findIndex((row: any) => row.id_transaksi === targetId);

            const namaFieldEdit = args?.column?.field;

            nominalObj = new NumericTextBox({
                value: args.rowData[args.column?.field],
                showSpinButton: false,
                change: function (args) {
                    let totalNominal = 0;
                    let updateNominal1 = 0;
                    let nomBayar = 0;
                    // const updatedValue = args.value === '' || args.value === null ? 0 : args.value;
                    const updatedValue = args.value;

                    const nominalBayar = rowData.nominal_bayar;
                    const dataSource = dgTrxBankDetailRef.current.dataSource as any[];
                    const rowIndex = dataSource.findIndex((row: any) => row.id_transaksi === targetId);

                    if (updatedValue > nominalBayar) {
                        let pesan: any;
                        if (namaFieldEdit === 'nominal1') {
                            pesan = `Total Nominal Bayar :  ${frmNumber(nominalBayar)}
                              Nominal 1 :  ${frmNumber(updatedValue)}
                              Data tidak dapat di input. Nilai nominal 1 lebih besar dari nominal bayar. `;
                        } else if (namaFieldEdit === 'nominal2') {
                            pesan = `Total Nominal Bayar :  ${frmNumber(nominalBayar)}
                              Nominal 2 :  ${frmNumber(updatedValue)}
                              Data tidak dapat di input. Nilai nominal 2 lebih besar dari nominal bayar. `;
                        } else if (namaFieldEdit === 'nominal3') {
                            pesan = `Total Nominal Bayar :  ${frmNumber(nominalBayar)}
                              Nominal 3 :  ${frmNumber(updatedValue)}
                              Data tidak dapat di input. Nilai nominal 3 lebih besar dari nominal bayar. `;
                        } else if (namaFieldEdit === 'nominal4') {
                            pesan = `Total Nominal Bayar :  ${frmNumber(nominalBayar)}
                              Nominal 4 :  ${frmNumber(updatedValue)}
                              Data tidak dapat di input. Nilai nominal 4 lebih besar dari nominal bayar. `;
                        } else if (namaFieldEdit === 'nominal5') {
                            pesan = `Total Nominal Bayar :  ${frmNumber(nominalBayar)}
                              Nominal 5 :  ${frmNumber(updatedValue)}
                              Data tidak dapat di input. Nilai nominal 5 lebih besar dari nominal bayar. `;
                        }
                        myAlertGlobal2(pesan, 'transaksiBank');

                        dgTrxBankDetailRef.current.refresh();
                    } else if (updatedValue === nominalBayar) {
                        let pesan: any;
                        if (namaFieldEdit === 'nominal1') {
                            pesan = `Total Nominal Bayar :  ${frmNumber(nominalBayar)}
                              Nominal 1 :  ${frmNumber(updatedValue)}
                              Data tidak dapat di input. Nilai nominal 1 sama dengan nominal bayar. Silahkan input melalui Nominal Bayar`;
                        } else if (namaFieldEdit === 'nominal2') {
                            pesan = `Total Nominal Bayar :  ${frmNumber(nominalBayar)}
                              Nominal 2 :  ${frmNumber(updatedValue)}
                              Data tidak dapat di input. Nilai nominal 2 sama dengan nominal 1 (E-Branch 1). `;
                        } else if (namaFieldEdit === 'nominal3') {
                            pesan = `Total Nominal Bayar :  ${frmNumber(nominalBayar)}
                              Nominal 3 :  ${frmNumber(updatedValue)}
                              Data tidak dapat di input. Nilai nominal 3 sama dengan nominal 1 (E-Branch 1). `;
                        } else if (namaFieldEdit === 'nominal4') {
                            pesan = `Total Nominal Bayar :  ${frmNumber(nominalBayar)}
                              Nominal 4 :  ${frmNumber(updatedValue)}
                              Data tidak dapat di input. Nilai nominal 4 sama dengan nominal 1 (E-Branch 1). `;
                        } else if (namaFieldEdit === 'nominal5') {
                            pesan = `Total Nominal Bayar :  ${frmNumber(nominalBayar)}
                              Nominal 5 :  ${frmNumber(updatedValue)}
                              Data tidak dapat di input. Nilai nominal 5 sama dengan nominal 1 (E-Branch 1). `;
                        }
                        myAlertGlobal2(pesan, 'transaksiBank');

                        dgTrxBankDetailRef.current.refresh();
                    } else {
                        if (rowIndex >= 0 && dataSource[rowIndex]) {
                            if (namaFieldEdit === 'nominal1') {
                                nomBayar = rowData.nominal_bayar;
                                totalNominal = rowData.nominal1 + rowData.nominal3 + rowData.nominal4 + rowData.nominal5;
                                updateNominal1 = updatedValue;
                            } else if (namaFieldEdit === 'nominal2') {
                                nomBayar = rowData.nominal_bayar;
                                totalNominal = updatedValue + rowData.nominal3 + rowData.nominal4 + rowData.nominal5;
                                updateNominal1 = nomBayar - totalNominal;
                                dataSource[rowIndex].nominal2 = updatedValue;
                                dataSource[rowIndex].nominal1 = updateNominal1;
                            } else if (namaFieldEdit === 'nominal3') {
                                nomBayar = rowData.nominal_bayar;
                                totalNominal = updatedValue + +rowData.nominal2 + rowData.nominal4 + rowData.nominal5;
                                updateNominal1 = nomBayar - totalNominal;
                                dataSource[rowIndex].nominal3 = updatedValue;
                                dataSource[rowIndex].nominal1 = updateNominal1;
                            } else if (namaFieldEdit === 'nominal4') {
                                nomBayar = rowData.nominal_bayar;
                                totalNominal = updatedValue + +rowData.nominal2 + rowData.nominal3 + rowData.nominal5;
                                updateNominal1 = nomBayar - totalNominal;
                                dataSource[rowIndex].nominal4 = updatedValue;
                                dataSource[rowIndex].nominal1 = updateNominal1;
                            } else if (namaFieldEdit === 'nominal5') {
                                nomBayar = rowData.nominal_bayar;
                                totalNominal = updatedValue + +rowData.nominal2 + rowData.nominal3 + rowData.nominal4;
                                updateNominal1 = nomBayar - totalNominal;
                                dataSource[rowIndex].nominal5 = updatedValue;
                                dataSource[rowIndex].nominal1 = updateNominal1;
                            }
                            // dgTrxBankDetailRef.current.updateCell(rowIndex, 'nominal1', updateNominal1);
                        } else {
                            if (namaFieldEdit === 'nominal1') {
                                nomBayar = rowData.nominal_bayar;
                                totalNominal = rowData.nominal1 + rowData.nominal3 + rowData.nominal4 + rowData.nominal5;
                                updateNominal1 = updatedValue;
                                // dgTrxBankDetailRef.current.updateCell(rowIndex, 'nominal1', updateNominal1);
                            } else if (namaFieldEdit === 'nominal2') {
                                nomBayar = rowData.nominal_bayar;
                                totalNominal = updatedValue + rowData.nominal3 + rowData.nominal4 + rowData.nominal5;
                                updateNominal1 = nomBayar - totalNominal;
                                // dgTrxBankDetailRef.current.updateCell(rowIndex, 'nominal1', updateNominal1);
                            } else if (namaFieldEdit === 'nominal3') {
                                nomBayar = rowData.nominal_bayar;
                                totalNominal = updatedValue + +rowData.nominal2 + rowData.nominal4 + rowData.nominal5;
                                updateNominal1 = nomBayar - totalNominal;
                                // dgTrxBankDetailRef.current.updateCell(rowIndex, 'nominal1', updateNominal1);
                            } else if (namaFieldEdit === 'nominal4') {
                                nomBayar = rowData.nominal_bayar;
                                totalNominal = updatedValue + +rowData.nominal2 + rowData.nominal3 + rowData.nominal5;
                                updateNominal1 = nomBayar - totalNominal;
                                // dgTrxBankDetailRef.current.updateCell(rowIndex, 'nominal1', updateNominal1);
                            } else if (namaFieldEdit === 'nominal5') {
                                nomBayar = rowData.nominal_bayar;
                                totalNominal = updatedValue + +rowData.nominal2 + rowData.nominal3 + rowData.nominal4;
                                updateNominal1 = nomBayar - totalNominal;
                                // dgTrxBankDetailRef.current.updateCell(rowIndex, 'nominal1', updateNominal1);
                            }
                            // dgTrxBankDetailRef.current.updateCell(rowIndex, 'nominal1', updateNominal1);
                        }
                        // dgTrxBankDetailRef.current.updateCell(rowIndex, 'nominal1', updateNominal1);
                        save('trxBawah');
                    }
                    // }
                },
            });
            nominalObj.appendTo(nominalElem);
        },
    };

    const save = async (jenis: any) => {
        if (jenis === 'trxAtas') {
            (dgTrxBankRef.current as GridComponent).editModule.batchSave();
        } else if (jenis === 'trxBawah') {
            (dgTrxBankDetailRef.current as GridComponent).editModule.batchSave();
        } else if (jenis === 'all') {
            try {
                if (dgTrxBankRef.current) {
                    (dgTrxBankRef.current as GridComponent).editModule.batchSave();
                }
            } finally {
                if (dgTrxBankDetailRef.current) {
                    (dgTrxBankDetailRef.current as GridComponent).editModule.batchSave();
                }
            }
        }
    };

    const handleBeginEdit = (args: any) => {
        const gridInstance = dgTrxBankDetailRef.current; // Pastikan dgTrxBankRef adalah referensi ke grid Anda
        if (gridInstance) {
            const rowIndex = args.rowIndex; // Ambil index baris yang sedang diedit
            const rowElement = gridInstance.getRowByIndex(rowIndex); // Dapatkan elemen baris
            if (rowElement) {
                const inputElement = rowElement.querySelector('input'); // Cari elemen input di dalam baris
                if (inputElement) {
                    inputElement.focus(); // Memfokuskan input
                    inputElement.select(); // Memilih teks dalam input

                    // Tambahkan logika untuk menghitung nominal_sisa dan memperbarui data

                    setTimeout(() => {
                        inputElement.addEventListener(
                            'change',
                            (event: any) => {
                                const nominalBayar = parseFloat(event.target.value) || 0; // Ambil nilai nominal_bayar dari input
                                const dataSource = gridInstance.dataSource as any[]; // Ambil data source
                                const updatedData = dataSource.map((item) => {
                                    if (item.id_transaksi === args.rowData.id_transaksi) {
                                        const nominalSisa = item.nominal_tagihan - nominalBayar; // Hitung nominal_sisa
                                        return {
                                            ...item,
                                            proses_bayar: 'Y', // Ubah proses_bayar menjadi 'Y'
                                            nominal1: nominalBayar, // Update nominal1 sesuai input
                                            nominal_sisa: nominalSisa, // Update nominal_sisa
                                        };
                                    } else {
                                        return item; // Kembalikan item tanpa perubahan
                                    }
                                });

                                gridInstance.dataSource = updatedData; // Update data source
                                gridInstance.refresh(); // Refresh grid agar data terbaru terlihat
                            },
                            0
                        );
                    });
                } else {
                    console.error('Input element not found in the row');
                }
            } else {
                console.error('Row element not found');
            }
        } else {
            console.error('Grid instance is undefined');
        }
    };

    const recalc = async (args: any) => {
        // const dataSource = dgTrxBankRef.current?.getCurrentViewRecords() || [];
        const dataSource1 = dgTrxBankRef.current?.dataSource || [];
        if (dataSource1?.length > 0) {
            const totalNominalReady = dataSource1.reduce((total: any, item: any) => {
                return total + (item.nominal_ready || 0);
            }, 0);

            // const dataSource2 = dgTrxBankDetailRef.current?.getCurrentViewRecords() || [];
            const dataSource2 = dgTrxBankDetailRef.current?.dataSource || [];

            const totalNominalBayar = dataSource2.reduce((total: any, item: any) => {
                return total + (item.nominal_bayar || 0);
            }, 0);
            const totalNominal1 = dataSource2.reduce((total: any, item: any) => {
                return total + (item.nominal1 || 0);
            }, 0);
            const totalNominal2 = dataSource2.reduce((total: any, item: any) => {
                return total + (item.nominal2 || 0);
            }, 0);
            const totalNominal3 = dataSource2.reduce((total: any, item: any) => {
                return total + (item.nominal3 || 0);
            }, 0);
            const totalNominal4 = dataSource2.reduce((total: any, item: any) => {
                return total + (item.nominal4r || 0);
            }, 0);
            const totalNominal5 = dataSource2.reduce((total: any, item: any) => {
                return total + (item.nominal5 || 0);
            }, 0);

            let totalNominalBawah = totalNominal1 + totalNominal2 + totalNominal3 + totalNominal4 + totalNominal5;
            setTotalNominalBayar(totalNominalBayar);
            setTotalNominalbawah(totalNominalBawah);

            setHeaderState((prevState: any) => ({
                ...prevState,
                nominal_ready: totalNominalReady,
                total_bayar: totalNominalBayar,
            }));
            await calculateTotals();
        }
    };

    const calculateTotals = async () => {
        // const dataSource = dgTrxBankRef.current?.getCurrentViewRecords() || [];
        // const dataSourceDetail = dgTrxBankDetailRef.current?.getCurrentViewRecords() || [];
        const dataSource = dgTrxBankRef.current?.dataSource || [];
        const dataSourceDetail = dgTrxBankDetailRef.current?.dataSource || [];
        let x1 = 0,
            x2 = 0,
            x3 = 0,
            x4 = 0;

        dataSource.forEach((item: any) => {
            x1 += item.nominal_ready || 0;
            x2 += item.nominal1 || 0;
        });

        dataSourceDetail.forEach((item: any) => {
            x3 += item.nominal_bayar || 0;
            x4 += item.nominal1 || 0;
        });
        // console.log('setGnominalReady ', x1);
        // console.log('setGnominalBayar ', x3);
        setGnominalReady(x1);
        setGnominal1Atas(x2);
        setGnominalBayar(x3);
        setGnominal1Bawah(x4);
    };

    const [footerColor, setFooterColor] = useState('bg-gray-200 text-black');
    // Update data pada grid secara dinamis
    const refreshGrid = (gridInstance: any) => {
        if (gridInstance) {
            gridInstance.refresh();
        }
    };

    const updateFooterColor = () => {
        const topGridData = dgTrxBankRef.current?.dataSource || [];
        const bottomGridData = dgTrxBankDetailRef.current?.dataSource || [];

        const nominalBayarSum = bottomGridData.reduce((sum: any, item: any) => sum + (item.nominal_bayar || 0), 0);
        const nominalReadySum = topGridData.reduce((sum: any, item: any) => sum + (item.nominal_ready || 0), 0);
        setGnominalBayar(nominalBayarSum);
        setGnominalReady(nominalReadySum);

        const newColor = nominalBayarSum === nominalReadySum ? 'bg-green-500 text-white' : 'bg-red-500 text-white';

        // Set footer color dengan cara async menggunakan callback
        setFooterColor((prevColor) => {
            if (prevColor !== newColor) {
                // console.log('Footer color changed:', newColor);
                // Paksa render ulang dengan mengganti key
                refreshGrid(dgTrxBankRef.current);
                refreshGrid(dgTrxBankDetailRef.current);
                return newColor;
            }
            return prevColor;
        });

        // Paksa refresh grid setelah update warna footer
        dgTrxBankRef.current?.refresh();
        dgTrxBankDetailRef.current?.refresh();

        // // Log perubahan state setelah update
        // console.log('Update Footer Color');
        // console.log('nominalBayarSum:', nominalBayarSum);
        // console.log('nominalReadySum:', nominalReadySum);
        // console.log('newColor:', newColor);
    };

    useEffect(() => {
        updateFooterColor();
        refreshGrid(dgTrxBankRef.current);
        refreshGrid(dgTrxBankDetailRef.current);
        // }, [gnominalBayar, gnominalReady, dgTrxBankRef.current?.dataSource, dgTrxBankDetailRef.current?.dataSource]);
    }, [gnominalBayar, gnominalReady]);

    const footerTemplateWithCondition = (props: any) => {
        if (!props || props.Sum === undefined || props.Sum === null) {
            return <div className="bg-gray-200 px-2 text-right">0,00</div>;
        }
        return (
            <div className={`px-2 text-right ${footerColor}`} key={footerColor + Math.random()}>
                {props.Sum.toLocaleString('id-ID', { minimumFractionDigits: 0 })}
            </div>
        );
    };

    const label = footerColor.includes('bg-green') ? 'OK' : 'Ada Selisih';

    const handleDataChange = () => {
        refreshGrid(dgTrxBankRef.current);
        refreshGrid(dgTrxBankDetailRef.current);
    };

    const toolbarClick2 = (jenis: any) => {
        if (jenis === 'topGrid_add') {
            setDariBatch(true);
            // args.cancel = true;

            const grid = dgTrxBankRef.current;
            const rowsx = grid.getBatchChanges();
            const hasEmptyFields = rowsx.addedRecords instanceof Array ? rowsx.addedRecords.some((row: { nama_rekening: string }) => row.nama_rekening === '') : false;
            const hasEmptyFieldsGrid = dgTrxBankRef.current.dataSource.some((row: { nama_rekening: string }) => row.nama_rekening === '');
            const changed = rowsx.changedRecords.length >= 1;

            // if (changed && (hasEmptyFields || hasEmptyFieldsGrid)) {
            // if (hasEmptyFields || (hasEmptyFieldsGrid && !changed)) {
            if (hasEmptyFields) {
                myAlertGlobal2('Silahkan melengkapi data sebelum menambah data baru', 'transaksiBank');
            } else {
                const lastRowGrid = grid.dataSource.length;
                const lastRowBatch = rowsx.addedRecords.length + 1;
                const newId = lastRowGrid + lastRowBatch;

                // console.log('lastRowGrid ', lastRowGrid);
                // console.log('lastRowBatch ', lastRowBatch);

                const existingData = Array.isArray(dgTrxBankRef.current.dataSource) ? dgTrxBankRef.current.dataSource : [];
                const maxIdTransaksi = existingData.reduce((max: any, item: any) => (item.id_transaksi > max ? item.id_transaksi : max), 0);
                let newIdTransaksi = maxIdTransaksi + lastRowBatch;

                // console.log('newId atas', newId);
                // console.log('newIdTransaksi atas', newIdTransaksi);
                // const maxId = Math.max(...grid.dataSource.map((row: any) => row.id_transaksi), 0);
                // const newId = maxId + 1;
                const newRecord = {
                    kode_transaksi: stateDokumen?.masterDataState === 'BARU' ? '' : stateDokumen?.masterKodeDokumen,
                    // id_transaksi: stateDokumen?.masterDataState === 'BARU' ? newId : newIdTransaksi, //newId,
                    id_transaksi: newIdTransaksi, //newId,

                    id_tab: stateDokumen?.masterTransaksiKe, //dgTrxBankRef.current.dataSource[0].kode_transaksi, //stateDokumen?.masterTransaksiKe,
                    entitas: '',
                    no_rekening: '',
                    nama_rekening: '',
                    nama_bank: '',
                    kode_akun: '',
                    nama_akun: '',
                    saldo_endap: 0,
                    saldo_akhir: 0,
                    saldo_real: 0,
                    nominal_ready: 0,
                    tgl_update: '',
                    deskripsi: '',
                    kode_eBranch1: '',
                    nominal1: 0,
                    kode_eBranch2: '',
                    nominal2: 0,
                    kode_eBranch3: '',
                    nominal3: 0,
                    kode_eBranch4: '',
                    nominal4: 0,
                    kode_eBranch5: '',
                    nominal5: 0,
                    uniqId: newId,
                };
                (grid as GridComponent).addRecord(newRecord);
            }
            // }

            // }
        } else if (jenis === 'topGrid_delete') {
            deleteData(selectedIdTransaksi, 'qudTrxBank');
        } else if (jenis === 'topGrid_cancel') {
            const grid = dgTrxBankRef.current;
            grid.refresh();
            setDariBatch(false);
        } else if (jenis === 'bottomGrid_add') {
            // dgTrxBankDetailRef.current.refresh();
            setDariBatchBawah(true);
            // args.cancel = true;

            const grid = dgTrxBankDetailRef.current;
            const rowsx = grid.getBatchChanges();
            const hasEmptyFields = rowsx.addedRecords instanceof Array ? rowsx.addedRecords.some((row: { nama_vendor: string }) => row.nama_vendor === '') : false;
            const hasEmptyFieldsGrid = dgTrxBankDetailRef.current.dataSource.some((row: { nama_vendor: string }) => row.nama_vendor === '');
            const changed = rowsx.changedRecords.length >= 1;

            if (hasEmptyFields) {
                myAlertGlobal2('Silahkan melengkapi data sebelum menambah data baru', 'transaksiBank');
            } else {
                const lastRowGrid = grid.dataSource.length;
                const lastRowBatch = rowsx.addedRecords.length + 1;

                // console.log('lastRowGrid ', lastRowGrid);
                // console.log('lastRowBatch ', lastRowBatch);

                const newId = lastRowGrid + lastRowBatch;

                const existingData = Array.isArray(dgTrxBankDetailRef.current.dataSource) ? dgTrxBankDetailRef.current.dataSource : [];
                // console.log('existingData ', existingData);
                const maxIdTransaksi = existingData.reduce((max: any, item: any) => (item.id_transaksi > max ? item.id_transaksi : max), 0);
                let newIdTransaksi = maxIdTransaksi + lastRowBatch;
                // console.log('newId', newId);
                // console.log('newIdTransaksi', newIdTransaksi);

                const newRecord = {
                    kode_transaksi: stateDokumen?.masterDataState === 'BARU' ? '' : stateDokumen?.masterKodeDokumen, //dgTrxBankDetailRef.current.dataSource[0]?.kode_transaksi,
                    // id_transaksi: stateDokumen?.masterDataState === 'BARU' ? newId : newIdTransaksi,
                    id_transaksi: newIdTransaksi,
                    jenis_pengeluaran: '',
                    entitas: '',
                    nama_bank: '',
                    no_rekening: '',
                    nama_rekening: '',
                    kode_akun: '',
                    nama_akun: '',
                    keterangan: '',
                    sumber: '',
                    kode_dokumen_sumber: '',
                    no_dokumen_sumber: '',
                    kode_vendor: '',
                    nama_vendor: '',
                    tgl_jtp: '',
                    nominal_tagihan: 0,
                    nominal_bayar: 0,
                    proses_bayar: '',
                    nominal_sisa: 0,
                    kode_eBranch1: '',
                    nama_bank1: '',
                    no_rekening1: '',
                    nama_rekening1: '',
                    kode_eBranch2: '',
                    nominal1: 0,
                    nama_bank2: '',
                    no_rekening2: '',
                    nama_rekening2: '',
                    nominal2: 0,
                    kode_eBranch3: '',
                    nama_bank3: '',
                    no_rekening3: '',
                    nama_rekening3: '',
                    nominal3: 0,
                    kode_eBranch4: '',
                    nama_bank4: '',
                    no_rekening4: '',
                    nama_rekening4: '',
                    nominal4: 0,
                    kode_eBranch5: '',
                    nama_bank5: '',
                    no_rekening5: '',
                    nama_rekening5: '',
                    nominal5: 0,
                    uniqId: newId,
                };
                (grid as GridComponent).addRecord(newRecord);
            }
        } else if (jenis === 'bottomGrid_delete') {
            deleteData(selectedIdTransaksi, 'quDTrxBankDetail');
        } else if (jenis === 'bottomGrid_cancel') {
            const grid = dgTrxBankDetailRef.current;
            grid.refresh();
            setDariBatchBawah(false);
        }
    };

    const createdTopGrid = () => {
        dgTrxBankRef.current.getContentTable().addEventListener('click', (args: any) => {
            if (args.target.classList.contains('e-rowcell')) {
                dgTrxBankRef.current.editModule.editCell(parseInt(args.target.getAttribute('index')), dgTrxBankRef.current.getColumnByIndex(parseInt(args.target.getAttribute('data-colindex'))).field);
            }
        });
        dgTrxBankRef.current.element.addEventListener('keydown', (e: any) => {
            var closesttd = e.target.closest('td');
            if (e.keyCode === 39 && !isNullOrUndefined(closesttd.nextSibling)) {
                editACell(closesttd.nextSibling);
            }
            if (
                e.keyCode === 37 &&
                !isNullOrUndefined(closesttd.previousSibling) &&
                !dgTrxBankRef.current.getColumnByIndex(parseInt(closesttd.previousSibling.getAttribute('data-colindex'))).isPrimaryKey
            ) {
                editACell(closesttd.previousSibling);
            }
            if (e.keyCode === 40 && !isNullOrUndefined(closesttd.closest('tr').nextSibling)) {
                editACell(closesttd.closest('tr').nextSibling.querySelectorAll('td')[parseInt(closesttd.getAttribute('data-colindex'))]);
            }
            if (e.keyCode === 38 && !isNullOrUndefined(closesttd.closest('tr').previousSibling)) {
                editACell(closesttd.closest('tr').previousSibling.querySelectorAll('td')[parseInt(closesttd.getAttribute('data-colindex'))]);
            }
        });
    };

    const editACell = (args: any) => {
        dgTrxBankRef.current.editModule.editCell(parseInt(args.getAttribute('index')), dgTrxBankRef.current.getColumnByIndex(parseInt(args.getAttribute('data-colindex'))).field);
    };

    const [gridHeight, setGridHeight] = useState('100%');
    const [gridHeightBottom, setGridHeightBottom] = useState('100%');

    // Fungsi untuk mengatur ulang tinggi grid
    const adjustGridHeight = () => {
        if (dgTrxBankRef.current) {
            const panel = document.querySelector('.p-splitter-panel'); // Ambil panel utama

            if (panel) {
                const availableHeight = panel.clientHeight;
                // const newHeight = availableHeight * 0.5; // Kurangi 20px untuk memberikan ruang
                const newHeight = panel.clientHeight - 120; // Kurangi 20px untuk memberikan ruang
                // console.log('newHeight atas', newHeight);

                setGridHeight(newHeight + 'px');
                dgTrxBankRef.current.refresh();
            }
        }
        if (dgTrxBankDetailRef.current) {
            const panel = document.querySelector('.p-splitter-panel');
            if (panel) {
                const availableHeight = panel.clientHeight;
                // const newHeight = availableHeight * 0.5; // Kurangi 20px untuk memberikan ruang
                const newHeight = panel.clientHeight - 90; // Kurangi 20px untuk memberikan ruang
                // console.log('newHeight bawah', newHeight);
                const newHeight2 = newHeight + 60;
                // console.log('newHeight2 bawah', newHeight2);

                setGridHeightBottom(newHeight2 + 'px');
                dgTrxBankDetailRef.current.refresh();
            }
        }
    };

    // Pemanggilan awal saat komponen dimuat
    useEffect(() => {
        adjustGridHeight();
        window.addEventListener('resize', adjustGridHeight); // Update saat jendela diubah ukurannya
        return () => {
            window.removeEventListener('resize', adjustGridHeight);
        };
    }, []);

    return (
        <div className="relative">
            <DialogComponent
                id="transaksiBank"
                isModal={true}
                width="95%"
                height="100vh" //"85%"
                visible={isOpen}
                close={() => {
                    // dialogClose();
                }}
                showCloseIcon={false}
                target="#trxBankList"
                closeOnEscape={false}
                allowDragging={true}
                animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                position={{ X: 'center', Y: 'top' }}
                resizeHandles={['All']}
                header={() => {
                    return (
                        <div className="mb-2 flex w-full items-center justify-between">
                            <div>
                                <span className="text-2xl font-bold">
                                    {/* {stateDokumen?.masterDataState === 'BARU' ? `Transaksi Bank ${stateDokumen?.masterNamaBank} - ${stateDokumen?.masterTransaksiKe}` : `${stateDokumen?.masterNamaBank}`} */}
                                    {`Transaksi Bank ${stateDokumen?.masterNamaBank} - ${stateDokumen?.masterTransaksiKe}`}
                                </span>
                            </div>
                        </div>
                    );
                }}
            >
                <div style={{ height: '100%', width: '100%' }}>
                    <div className={`flex items-center gap-3 ${footerColor}`}>
                        <div className="mb-2 flex items-center justify-end gap-3">
                            <div className="flex items-center justify-center gap-3">
                                <label className="block text-sm font-medium">Tanggal Transaksi</label>
                                <div className="text-smt mt-1 rounded border bg-white px-1">
                                    <DatePickerComponent
                                        locale="id"
                                        name="edTglAwal1"
                                        // cssClass="e-custom-style rounded border p-1 text-sm"
                                        // renderDayCell={onRenderDayCell}
                                        enableMask={true}
                                        maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                        showClearButton={false}
                                        format="dd-MM-yyyy"
                                        // value={moment(formListState.edTglAwal1).toDate()}
                                        value={moment(headerState?.tgl_transaksi).toDate()}
                                        // value={stateDokumen?.masterDataState === 'BARU' ? moment().format('DD-MM-YYYY') : (moment(headerState?.tgl_transaksi).format('DD-MM-YYYY') as Date)}
                                        change={(args: ChangeEventArgsCalendar) => {
                                            // handleInputChange('edTglAwal1', moment(args.value).format('YYYY-MM-DD'), 'chbTanggal', setHeaderState);
                                            handleInputChange('tgl_transaksi', moment(args.value).format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss'), 'chbTanggal', setHeaderState);
                                        }}
                                    >
                                        <Inject services={[MaskedDateTime]} />
                                    </DatePickerComponent>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-3">
                                <label className="block text-sm font-medium">No. Transaksi</label>
                                <input type="text" value={headerState?.no_transaksi} className="rounded border p-1 text-black" />
                            </div>
                        </div>
                        <div className="mb-2 flex items-center justify-end gap-3">
                            <label className={`rounded px-2 py-1 font-bold ${footerColor}`}>{footerColor.includes('bg-green') ? 'Tidak Ada Selisih' : 'Ada Selisih'}</label>
                        </div>
                    </div>

                    <Splitter style={{ height: '100vh' }} layout="vertical" onResizeEnd={adjustGridHeight}>
                        <SplitterPanel size={70} minSize={30} className="align-items-center justify-content-center flex-grow-1" style={{ overflow: 'auto', flex: 1, height: '100%' }}>
                            {/* <SplitterPanel size={50} className="align-items-center justify-content-center flex-grow-1" style={{ overflow: 'auto', flex: 1 }}> */}
                            {/* <div className="p-2"> */}
                            <div className="splitter-container">
                                <div className="grid-wrapper">
                                    <GridComponent
                                        id="topGrid"
                                        ref={(g: any) => {
                                            dgTrxBankRef.current = g;
                                        }}
                                        textWrapSettings={{ wrapMode: 'Header' }}
                                        selectionSettings={{ mode: 'Row', type: 'Single' }}
                                        allowTextWrap={true}
                                        allowSorting={true}
                                        autoFit={true}
                                        frozenRows={0}
                                        rowHeight={20}
                                        height={gridHeight}
                                        width="100%"
                                        // height={300}
                                        // height={'calc(100vh - 50px)'}
                                        gridLines="Both"
                                        allowResizing={true}
                                        actionComplete={(args: any) => {
                                            actionCompleteGridDetail(args, 'quDtrxBank');
                                        }}
                                        allowReordering={true} // Mengaktifkan drag and drop kolom
                                        actionBegin={async (args: any) => {
                                            // console.log('args.requestType ', args.requestType);
                                            let grid = dgTrxBankRef.current as GridComponent;
                                            if (args.requestType === 'sorting' && grid) {
                                                const gridx = dgTrxBankRef.current;
                                                const rowsx = gridx.getBatchChanges();
                                                const hasEmptyFields =
                                                    rowsx.addedRecords instanceof Array ? rowsx.addedRecords.some((row: { nama_rekening: string }) => row.nama_rekening === '') : false;
                                                if (hasEmptyFields) {
                                                    args.cancel = true; // Batalkan sorting
                                                    // alert('Sorting ditunda! Ada nama_rekening yang kosong.');
                                                    myAlertGlobal(`Atas Nama tidak boleh kosong `, 'transaksiBank');
                                                } else {
                                                    save('trxAtas');
                                                    setDariBatch(false);
                                                    setDariBatchBawah(false);
                                                }
                                            }
                                        }}
                                        rowSelecting={(args: any) => {
                                            rowSelectingGridDetail(args, 'quDTrxbank');
                                        }}
                                        editSettings={{
                                            allowAdding: true,
                                            allowEditing: true,
                                            allowDeleting: true,
                                            newRowPosition: 'Bottom',
                                            // mode: 'Normal',
                                            mode: 'Batch',
                                            showConfirmDialog: false,
                                        }}
                                        recordDoubleClick={(args) => {
                                            setTambahTop(false);
                                            setEditTop(true);
                                        }}
                                        aggregates={[
                                            {
                                                columns: [
                                                    {
                                                        type: 'Sum',
                                                        field: 'saldo_akhir',
                                                        format: 'N0',
                                                        // footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props),
                                                    },
                                                    {
                                                        type: 'Sum',
                                                        field: 'saldo_real',
                                                        format: 'N0',
                                                        // footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props),
                                                    },
                                                    {
                                                        type: 'Sum',
                                                        field: 'saldo_endap',
                                                        format: 'N0',
                                                        // footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props),
                                                    },
                                                    {
                                                        type: 'Sum',
                                                        field: 'nominal_ready',
                                                        format: 'N0',
                                                        // footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props),
                                                    },
                                                    {
                                                        type: 'Sum',
                                                        field: 'nominal1',
                                                        format: 'N0',
                                                        // footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props),
                                                    },
                                                    {
                                                        type: 'Sum',
                                                        field: 'nominal2',
                                                        format: 'N0',
                                                        // footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props),
                                                    },
                                                    {
                                                        type: 'Sum',
                                                        field: 'nominal3',
                                                        format: 'N0',
                                                        // footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props),
                                                    },
                                                    {
                                                        type: 'Sum',
                                                        field: 'nominal4',
                                                        format: 'N0',
                                                        // footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props),
                                                    },
                                                    {
                                                        type: 'Sum',
                                                        field: 'nominal5',
                                                        format: 'N0',
                                                        // footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props),
                                                    },
                                                ],
                                            },
                                        ]}
                                    >
                                        <ColumnsDirective>
                                            {/* <ColumnDirective field="kode_transaksi" headerText="Kode Trx" width={100} textAlign="Left" headerTextAlign="Center" /> */}
                                            {/* <ColumnDirective field="id_transaksi" allowEditing={false} isPrimaryKey={true} headerText="ID" width={50} textAlign="Left" headerTextAlign="Center" /> */}

                                            <ColumnDirective field="no_rekening" headerText="No. Rekening" width={100} headerTextAlign="Center" edit={noRekAtas} />

                                            <ColumnDirective
                                                field="entitas"
                                                headerText="Entitas"
                                                width={100}
                                                editType="dropdownedit"
                                                textAlign="Center"
                                                headerTextAlign="Center"
                                                edit={sumberEntitasAtas}
                                            />

                                            <ColumnDirective
                                                field="nama_rekening"
                                                headerText="Atas Nama"
                                                width={200}
                                                edit={atasNamaParams}
                                                editType="dropdownedit"
                                                textAlign="Left"
                                                headerTextAlign="Center"
                                            />

                                            <ColumnDirective
                                                field="saldo_real"
                                                edit={nominalRealEdit}
                                                headerText="Saldo Bank (Real)"
                                                width={125}
                                                format="N2"
                                                textAlign="Right"
                                                headerTextAlign="Center"
                                            />

                                            <ColumnDirective field="saldo_endap" headerText="Saldo Endap" width={125} format="N2" textAlign="Right" headerTextAlign="Center" allowEditing={false} />
                                            <ColumnDirective
                                                field="nominal_ready"
                                                editType="numericedit"
                                                edit={nominalReadyEdit}
                                                headerText="Nominal Ready"
                                                width={125}
                                                format="N0"
                                                textAlign="Right"
                                                headerTextAlign="Center"
                                            />

                                            <ColumnDirective
                                                columns={[
                                                    {
                                                        field: 'kode_eBranch1',
                                                        headerText: 'Kode 1',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 80,
                                                        edit: kodeAtas,
                                                    },
                                                    {
                                                        field: 'nominal1',
                                                        headerText: 'Nominal 1',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Right',
                                                        format: 'N0',
                                                        width: 120,
                                                        allowEditing: false,
                                                        edit: nominalBranchAtasEdit,
                                                    },
                                                ]}
                                                headerText="E-Branch 1"
                                                headerTemplate={headerTemplateBranch1}
                                                textAlign="Center"
                                            />
                                            <ColumnDirective
                                                columns={[
                                                    {
                                                        field: 'kode_eBranch2',
                                                        headerText: 'Kode 2',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 80,
                                                        edit: kodeAtas,
                                                    },
                                                    {
                                                        field: 'nominal2',
                                                        headerText: 'Nominal 2',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Right',
                                                        format: 'N0',
                                                        width: 120,
                                                        edit: nominalBranchAtasEdit,
                                                    },
                                                ]}
                                                headerText="E-Branch 2"
                                                headerTemplate={headerTemplateBranch2}
                                                textAlign="Center"
                                            />
                                            <ColumnDirective
                                                columns={[
                                                    {
                                                        field: 'kode_eBranch3',
                                                        headerText: 'Kode 3',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 80,
                                                        edit: kodeAtas,
                                                    },
                                                    {
                                                        field: 'nominal3',
                                                        headerText: 'Nominal 3',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Right',
                                                        format: 'N0',
                                                        width: 120,
                                                        edit: nominalBranchAtasEdit,
                                                    },
                                                ]}
                                                headerText="E-Branch 3"
                                                headerTemplate={headerTemplateBranch3}
                                                textAlign="Center"
                                            />
                                            <ColumnDirective
                                                columns={[
                                                    {
                                                        field: 'kode_eBranch4',
                                                        headerText: 'Kode 4',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 80,
                                                        edit: kodeAtas,
                                                    },
                                                    {
                                                        field: 'nominal4',
                                                        headerText: 'Nominal 4',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Right',
                                                        format: 'N0',
                                                        width: 120,
                                                        edit: nominalBranchAtasEdit,
                                                    },
                                                ]}
                                                headerText="E-Branch 4"
                                                headerTemplate={headerTemplateBranch4}
                                                textAlign="Center"
                                            />
                                            <ColumnDirective
                                                columns={[
                                                    {
                                                        field: 'kode_eBranch5',
                                                        headerText: 'Kode 5',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 80,
                                                        edit: atasNamaParams,
                                                    },
                                                    {
                                                        field: 'nominal5',
                                                        headerText: 'Nominal 5',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Right',
                                                        format: 'N0',
                                                        width: 120,
                                                        edit: nominalBranchAtasEdit,
                                                    },
                                                ]}
                                                headerText="E-Branch 5"
                                                headerTemplate={headerTemplateBranch5}
                                                textAlign="Center"
                                            />
                                        </ColumnsDirective>
                                        <Inject services={[Page, Selection, Sort, CommandColumn, Toolbar, Filter, Resize, Edit]} />
                                    </GridComponent>
                                    {/* </div> */}
                                    <div style={{ padding: 2 }} className="panel-pager">
                                        <div className="mt-1 flex">
                                            <TooltipComponent content="Tambah" opensOn="Hover" openDelay={1000} position="TopRight" target="#buAdd1">
                                                <ButtonComponent
                                                    id="buAdd1"
                                                    type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                    cssClass="e-primary e-small"
                                                    iconCss="e-icons e-small e-plus"
                                                    style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                                                    onClick={(args) => {
                                                        toolbarClick2('topGrid_add');
                                                        // handleDetailBaru('quDTrxbank')}
                                                    }}
                                                />
                                            </TooltipComponent>
                                            <TooltipComponent content="Cancel" opensOn="Hover" openDelay={1000} position="TopRight" target="#buCancel1">
                                                <ButtonComponent
                                                    id="buCancel1"
                                                    type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                    cssClass="e-warning e-small"
                                                    iconCss="e-icons e-small e-close"
                                                    style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
                                                    onClick={() => {
                                                        toolbarClick2('topGrid_cancel');

                                                        // deleteData(selectedIdTransaksi, 'qudTrxBank')}
                                                    }}
                                                />
                                            </TooltipComponent>
                                            <TooltipComponent content="Hapus" opensOn="Hover" openDelay={1000} position="TopRight" target="#buDelete1">
                                                <ButtonComponent
                                                    id="buDelete1"
                                                    type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                    cssClass="e-warning e-small"
                                                    iconCss="e-icons e-small e-trash"
                                                    style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
                                                    onClick={() => {
                                                        toolbarClick2('topGrid_delete');

                                                        // deleteData(selectedIdTransaksi, 'qudTrxBank')}
                                                    }}
                                                    disabled={dariBatch}
                                                />
                                            </TooltipComponent>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SplitterPanel>

                        {/* <SplitterPanel className="align-items-center justify-content-center  flex-grow-0" style={{ overflow: 'auto', flex: 1 }}> */}
                        <SplitterPanel size={70} className="align-items-center justify-content-center " style={{ overflow: 'auto', flex: 1 }}>
                            {/* <div className="w-full p-2"> */}
                            <div className="splitter-container">
                                <div className="grid-wrapper">
                                    <div className="mb-1 flex flex-none items-center justify-between px-3">
                                        <div className="flex items-center gap-3 ">
                                            <div className="rounded border border-gray-400 bg-green-600 p-1 px-2 py-1">
                                                <CheckBoxComponent
                                                    label="> Jatuh Tempo"
                                                    checked={true}
                                                    name="ch1"
                                                    change={(args: ChangeEventArgsButton) => {
                                                        const value: any = args.checked;
                                                        handleCheckboxBottomGrid('ch1', value);
                                                    }}
                                                />
                                            </div>
                                            <div className="rounded border border-gray-400 bg-yellow-300 p-1 px-2 py-1">
                                                <CheckBoxComponent
                                                    label="Jatuh Tempo Hari Ini"
                                                    checked={true}
                                                    name="ch2"
                                                    change={(args: ChangeEventArgsButton) => {
                                                        const value: any = args.checked;
                                                        handleCheckboxBottomGrid('ch2', value);
                                                    }}
                                                />
                                            </div>
                                            <div className="rounded border border-gray-400 bg-blue-200 p-1 px-2 py-1">
                                                <CheckBoxComponent
                                                    label="Jatuh Tempo > 1 Minggu"
                                                    name="ch3"
                                                    change={(args: ChangeEventArgsButton) => {
                                                        const value: any = args.checked;
                                                        handleCheckboxBottomGrid('ch3', value);
                                                    }}
                                                />
                                            </div>
                                            <div className="rounded border border-gray-400 bg-gray-400 p-1 px-2 py-1">
                                                <CheckBoxComponent
                                                    label="Jatuh Tempo > 2 Minggu"
                                                    name="ch4"
                                                    change={(args: ChangeEventArgsButton) => {
                                                        const value: any = args.checked;
                                                        handleCheckboxBottomGrid('ch4', value);
                                                    }}
                                                />
                                            </div>

                                            <TooltipComponent content="Ambil data yang ditampilkan" opensOn="Hover" openDelay={1000} position="BottomCenter">
                                                <ButtonComponent
                                                    cssClass="e-primary e-small"
                                                    iconCss="e-icons e-medium e-export"
                                                    content="Ambil Data"
                                                    style={{ backgroundColor: '#3b3f5c' }}
                                                    onClick={async () => {
                                                        if (!formDataState.chUm && !formDataState.chVch && !formDataState.chPhe && !formDataState.chFPP) {
                                                            myAlertGlobal('Silahkan pilih data yang akan di ambil!', 'transaksiBank');
                                                        } else {
                                                            const grid = dgTrxBankDetailRef.current;
                                                            const rowsx = grid.getBatchChanges();

                                                            const hasEmptyFields =
                                                                rowsx.addedRecords instanceof Array ? rowsx.addedRecords.some((row: { nama_rekening: string }) => row.nama_rekening === '') : false;

                                                            if (hasEmptyFields) {
                                                                setDariBatch(false);
                                                                setDariBatchBawah(false);

                                                                myAlertGlobal('Silahkan melengkapi / hapus row data kosong sebelum Ambil Data', 'transaksiBank');
                                                            } else {
                                                                try {
                                                                    save('all');
                                                                } finally {
                                                                    await handleDetailTrxBank('1', formDataState.chUm, formDataState.chVch, formDataState.chPhe, formDataState.chFPP);
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />
                                            </TooltipComponent>
                                            <div className="rounded border border-gray-400 bg-yellow-300 p-1 px-2 py-1">
                                                <CheckBoxComponent
                                                    label="FPP"
                                                    name="chFPP"
                                                    change={(args: ChangeEventArgsButton) => {
                                                        const value: any = args.checked;
                                                        handleCheckboxBottomGrid('chFPP', value);
                                                    }}
                                                />
                                            </div>
                                            <div className="rounded border border-gray-400 bg-blue-200 p-1 px-2 py-1">
                                                <CheckBoxComponent
                                                    label="PHE"
                                                    name="chPhe"
                                                    change={(args: ChangeEventArgsButton) => {
                                                        const value: any = args.checked;
                                                        handleCheckboxBottomGrid('chPhe', value);
                                                    }}
                                                />
                                            </div>
                                            <div className="rounded border border-gray-400 bg-gray-400 p-1 px-2 py-1">
                                                <CheckBoxComponent
                                                    label="VCH"
                                                    name="chVch"
                                                    change={(args: ChangeEventArgsButton) => {
                                                        const value: any = args.checked;
                                                        handleCheckboxBottomGrid('chVch', value);
                                                    }}
                                                />
                                            </div>
                                            <div className="rounded border border-gray-400 bg-blue-200 p-1 px-2 py-1">
                                                <CheckBoxComponent
                                                    label="UM"
                                                    name="chUm"
                                                    change={(args: ChangeEventArgsButton) => {
                                                        const value: any = args.checked;
                                                        handleCheckboxBottomGrid('chUm', value);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <GridComponent
                                        id="bottomGrid"
                                        locale="id"
                                        ref={(g: any) => {
                                            dgTrxBankDetailRef.current = g;
                                        }}
                                        textWrapSettings={{ wrapMode: 'Header' }}
                                        selectionSettings={{ mode: 'Row', type: 'Multiple' }}
                                        allowTextWrap={true}
                                        allowSorting={true}
                                        autoFit={true}
                                        // height={'400px'}
                                        // height={'300px'}
                                        frozenRows={0}
                                        rowHeight={20}
                                        // height={300}
                                        height={gridHeightBottom}
                                        width="100%"
                                        gridLines="Both"
                                        allowResizing={true}
                                        actionComplete={(args: any) => {
                                            actionCompleteGridDetail(args, 'quDtrxBankDetail');
                                        }}
                                        allowReordering={true} // Mengaktifkan drag and drop kolom
                                        actionBegin={async (args: any) => {
                                            let grid = dgTrxBankDetailRef.current as GridComponent;
                                            if (args.requestType === 'sorting' && grid) {
                                                // if (!(await myAlertGlobal3('Sorting data ?', 'transaksiBank'))) {
                                                //     return;
                                                // }

                                                save('trxBawah');
                                                // dgTrxBankDetailRef.current.refresh();
                                                setDariBatch(false);
                                                setDariBatchBawah(false);
                                            }
                                        }}
                                        rowSelecting={(args: any) => {
                                            rowSelectingGridDetail(args, 'quDtrxBankDetail');
                                        }}
                                        editSettings={{
                                            allowAdding: true,
                                            allowEditing: true,
                                            allowDeleting: true,
                                            newRowPosition: 'Bottom',
                                            mode: 'Batch',
                                            showConfirmDialog: false,
                                        }}
                                        queryCellInfo={queryCellInfoListData}
                                        recordDoubleClick={(args) => {
                                            setTambahBottom(false);
                                            setEditBottom(true);
                                        }}
                                        rowSelected={async (args: any) => {
                                            setNamaVendor(args.data.nama_vendor);
                                        }}
                                        // loadingIndicator={{ indicatorType: 'Shimmer' }}
                                        aggregates={[
                                            {
                                                columns: [
                                                    {
                                                        type: 'Sum',
                                                        field: 'nominal_tagihan',
                                                        format: 'N0',
                                                        // footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props),
                                                    },
                                                    {
                                                        type: 'Sum',
                                                        field: 'nominal_bayar',
                                                        format: 'N0',
                                                        // footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props),
                                                    },
                                                    {
                                                        type: 'Sum',
                                                        field: 'nominal_sisa',
                                                        format: 'N0',
                                                        // footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props),
                                                    },
                                                    {
                                                        type: 'Sum',
                                                        field: 'nominal1',
                                                        format: 'N0',
                                                        // footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props),
                                                    },
                                                    {
                                                        type: 'Sum',
                                                        field: 'nominal2',
                                                        format: 'N0',
                                                        // footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props),
                                                    },
                                                    {
                                                        type: 'Sum',
                                                        field: 'nominal3',
                                                        format: 'N0',
                                                        // footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props),
                                                    },
                                                    {
                                                        type: 'Sum',
                                                        field: 'nominal4',
                                                        format: 'N0',
                                                        // footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props),
                                                    },
                                                    {
                                                        type: 'Sum',
                                                        field: 'nominal5',
                                                        format: 'N0',
                                                        // footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props),
                                                    },
                                                ],
                                            },
                                        ]}
                                        // batchChange={onBatchChange}
                                    >
                                        <ColumnsDirective>
                                            {/* <ColumnDirective field="kode_transaksi" headerText="Kode Trx" width={100} textAlign="Left" headerTextAlign="Center" /> */}
                                            {/* <ColumnDirective field="index" allowEditing={false} isPrimaryKey={true} headerText="index" width={50} textAlign="Left" headerTextAlign="Center" /> */}
                                            {/* <ColumnDirective field="id_transaksi" allowEditing={false} isPrimaryKey={true} headerText="ID" width={50} textAlign="Left" headerTextAlign="Center" /> */}

                                            <ColumnDirective
                                                field="sumber"
                                                headerText="Sumber"
                                                width={100}
                                                // editTemplate={templateSumber}
                                                edit={sumberParams}
                                                editType="dropdownedit"
                                                textAlign="Left"
                                                headerTextAlign="Center"
                                            />
                                            <ColumnDirective
                                                field="entitas"
                                                headerText="Entitas"
                                                width={100}
                                                // editTemplate={templateEntitas}
                                                // edit={sumberEntitasBawah}
                                                editType="dropdownedit"
                                                textAlign="Center"
                                                headerTextAlign="Center"
                                                // editTemplate={templateEntitas}
                                                edit={sumberEntitasBawah}
                                            />
                                            <ColumnDirective field="no_dokumen_sumber" edit={textParamsNoDokBawah} headerText="No. Dokumen" width={125} textAlign="Center" headerTextAlign="Center" />
                                            <ColumnDirective
                                                field="nama_vendor"
                                                edit={textParamsVendorBawah}
                                                headerText="Nama Vendor / Supplier"
                                                width={200}
                                                headerTextAlign="Center"
                                                // editTemplate={templateEntitas}
                                            />
                                            <ColumnDirective
                                                field="tgl_jtp"
                                                headerText="Tgl. Jatuh Tempo"
                                                width={80}
                                                textAlign="Right"
                                                headerTextAlign="Center"
                                                format="dd-MM-yyyy"
                                                editType="datepickeredit"
                                                edit={datepickerparams}
                                                valueAccessor={(field: string, data: any) => {
                                                    const date = new Date(data[field]);
                                                    return isNaN(date.getTime()) ? '' : date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                                }}
                                            />
                                            <ColumnDirective field="keterangan" edit={textParamsKetBawah} headerText="Keterangan" width={200} headerTextAlign="Center" />
                                            <ColumnDirective
                                                field="nominal_tagihan"
                                                editType="numericedit"
                                                edit={nominalTagihanEditBawah}
                                                headerText="Nominal Tagihan"
                                                width={125}
                                                format="N2"
                                                textAlign="Right"
                                                headerTextAlign="Center"
                                            />
                                            <ColumnDirective
                                                field="proses_bayar"
                                                headerText="Proses Pembayaran"
                                                width={75}
                                                // type="boolean"
                                                displayAsCheckBox={true}
                                                textAlign="Center"
                                                headerTextAlign="Center"
                                                // template={checkBoxTemplate}
                                                editType="booleanedit"
                                                edit={prosesBayarEdit}
                                                // isPrimaryKey={true}
                                                // template={CheckboxCustomerCustom()}
                                            />
                                            {/* <ColumnDirective type="checkbox" width="50" /> */}

                                            <ColumnDirective
                                                field="nominal_bayar"
                                                editType="numericedit"
                                                edit={nominalBayarEdit}
                                                headerText="Nominal Bayar"
                                                width={125}
                                                format="N2"
                                                textAlign="Right"
                                                headerTextAlign="Center"
                                            />
                                            <ColumnDirective field="nominal_sisa" headerText="Nominal Sisa" width={125} format="N2" textAlign="Right" headerTextAlign="Center" />
                                            <ColumnDirective
                                                columns={[
                                                    {
                                                        field: 'nama_bank1',
                                                        headerText: 'Nama Bank',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 80,
                                                        // template: bank1Template,
                                                        edit: textParams,
                                                    },
                                                    {
                                                        field: 'nama_rekening1',
                                                        headerText: 'Nama Rekening',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 180,
                                                        // template: rekening1Template,
                                                        edit: textParams,
                                                    },
                                                    {
                                                        field: 'no_rekening1',
                                                        headerText: 'No. Rekening',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 130,
                                                        // template: noRekening1Template,
                                                        edit: textParams,
                                                    },
                                                    {
                                                        field: 'nominal1',
                                                        headerText: 'Nominal 1',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Right',
                                                        format: 'N0',
                                                        width: 120,
                                                        // edit: nominal1Edit,
                                                        // edit: nominalBranchBawahEdit,
                                                        allowEditing: false,
                                                    },
                                                ]}
                                                headerText="E-Branch 1"
                                                headerTemplate={headerTemplateBranch1}
                                                textAlign="Center"
                                                // edit={namaBank1}
                                                // editTemplate={tombolDetailDlgDaftar}
                                            />
                                            <ColumnDirective
                                                columns={[
                                                    {
                                                        field: 'nama_bank2',
                                                        headerText: 'Nama Bank',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 80,
                                                        // template: bank2Template,
                                                        edit: textParams,
                                                    },
                                                    {
                                                        field: 'nama_rekening2',
                                                        headerText: 'Nama Rekening',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 180,
                                                        // template: rekening2Template,
                                                        edit: textParams,
                                                    },
                                                    {
                                                        field: 'no_rekening2',
                                                        headerText: 'No. Rekening',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 130,
                                                        // template: noRekening2Template,
                                                        edit: textParams,
                                                    },
                                                    {
                                                        field: 'nominal2',
                                                        headerText: 'Nominal 2',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Right',
                                                        format: 'N0',
                                                        width: 120,
                                                        edit: nominalBranchBawahEdit,
                                                    },
                                                ]}
                                                headerText="E-Branch 2"
                                                headerTemplate={headerTemplateBranch2}
                                                textAlign="Center"
                                            />
                                            <ColumnDirective
                                                columns={[
                                                    {
                                                        field: 'nama_bank3',
                                                        headerText: 'Nama Bank',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 80,
                                                        edit: textParams,
                                                        // template: bank3Template,
                                                    },
                                                    {
                                                        field: 'nama_rekening3',
                                                        headerText: 'Nama Rekening',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 180,
                                                        edit: textParams,
                                                        // template: rekening3Template,
                                                    },
                                                    {
                                                        field: 'no_rekening3',
                                                        headerText: 'No. Rekening',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 130,
                                                        edit: textParams,
                                                        // template: noRekening3Template,
                                                    },
                                                    {
                                                        field: 'nominal3',
                                                        headerText: 'Nominal 3',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Right',
                                                        format: 'N0',
                                                        width: 120,
                                                        edit: nominalBranchBawahEdit,
                                                    },
                                                ]}
                                                headerText="E-Branch 3"
                                                headerTemplate={headerTemplateBranch3}
                                                textAlign="Center"
                                            />
                                            <ColumnDirective
                                                columns={[
                                                    {
                                                        field: 'nama_bank4',
                                                        headerText: 'Nama Bank',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 80,
                                                        edit: textParams,
                                                        // template: bank4Template,
                                                    },
                                                    {
                                                        field: 'nama_rekening4',
                                                        headerText: 'Nama Rekening',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 180,
                                                        edit: textParams,
                                                        // template: rekening4Template,
                                                    },
                                                    {
                                                        field: 'no_rekening4',
                                                        headerText: 'No. Rekening',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 130,
                                                        edit: textParams,
                                                        // template: noRekening4Template,
                                                    },
                                                    {
                                                        field: 'nominal4',
                                                        headerText: 'Nominal 4',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Right',
                                                        format: 'N0',
                                                        width: 120,
                                                        edit: nominalBranchBawahEdit,
                                                    },
                                                ]}
                                                headerText="E-Branch 4"
                                                headerTemplate={headerTemplateBranch4}
                                                textAlign="Center"
                                            />
                                            <ColumnDirective
                                                columns={[
                                                    {
                                                        field: 'nama_bank5',
                                                        headerText: 'Nama Bank',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 80,
                                                        edit: textParams,
                                                        // template: bank5Template,
                                                    },
                                                    {
                                                        field: 'nama_rekening5',
                                                        headerText: 'Nama Rekening',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 180,
                                                        edit: textParams,
                                                        // template: rekening5Template,
                                                    },
                                                    {
                                                        field: 'no_rekening5',
                                                        headerText: 'No. Rekening',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 130,
                                                        edit: textParams,
                                                        // template: noRekening5Template,
                                                    },
                                                    {
                                                        field: 'nominal5',
                                                        headerText: 'Nominal 5',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Right',
                                                        format: 'N0',
                                                        width: 120,
                                                        edit: nominalBranchBawahEdit,
                                                    },
                                                ]}
                                                headerText="E-Branch 5"
                                                headerTemplate={headerTemplateBranch5}
                                                textAlign="Center"
                                            />
                                        </ColumnsDirective>
                                        <Inject services={[Page, Selection, Sort, CommandColumn, Toolbar, Filter, Resize, Edit]} />
                                    </GridComponent>
                                    <div style={{ padding: 2 }} className="panel-pager">
                                        <div className="mt-1 flex">
                                            <TooltipComponent content="Cancel" opensOn="Hover" openDelay={1000} position="TopRight" target="#buAdd2">
                                                <ButtonComponent
                                                    id="buAdd2"
                                                    type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                    cssClass="e-primary e-small"
                                                    iconCss="e-icons e-small e-plus"
                                                    style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                                                    onClick={() => {
                                                        toolbarClick2('bottomGrid_add');

                                                        // handleDetailBaru('quDTrxBankDetail')}
                                                    }}
                                                />
                                            </TooltipComponent>

                                            <TooltipComponent content="Cancel" opensOn="Hover" openDelay={1000} position="TopRight" target="#buCancel2">
                                                <ButtonComponent
                                                    id="buCancel2"
                                                    type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                    cssClass="e-warning e-small"
                                                    iconCss="e-icons e-small e-close"
                                                    style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
                                                    onClick={() => {
                                                        toolbarClick2('bottomGrid_cancel');

                                                        // deleteData(selectedIdTransaksi, 'qudTrxBank')}
                                                    }}
                                                />
                                            </TooltipComponent>
                                            <TooltipComponent content="Cancel" opensOn="Hover" openDelay={1000} position="TopRight" target="#buDelete2">
                                                <ButtonComponent
                                                    id="buDelete2"
                                                    type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                    cssClass="e-warning e-small"
                                                    iconCss="e-icons e-small e-trash"
                                                    style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
                                                    onClick={() => {
                                                        toolbarClick2('bottomGrid_delete');

                                                        // deleteData(selectedIdTransaksi, 'qudTrxBankDetail')}
                                                    }}
                                                    disabled={dariBatchBawah}
                                                />
                                            </TooltipComponent>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SplitterPanel>
                    </Splitter>
                    <style>
                        {`
                                    .p-splitter-gutter {
                                        background-color: #ff9800 !important;
                                        height: 10px !important;
                                        border: 3px solid #aaa !important;
                                    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
                                    cursor: ns-resize;
                                    position: relative;
                                    }
                                    .p-splitter-gutter:hover {
                                    background-color: #2980b9 !important; /* Warna saat hover */
                                    }
                                    .p-splitter-gutter::before {
                                        content: "⋮";
                                        position: absolute;
                                        top: 50%;
                                        left: 50%;
                                        width: 10%; /* Panjang garis */
                                        height: 4px; /* Ketebalan garis */
                                        background-color: #ffffff; /* Warna garis */
                                        transform: translate(-50%, -50%);
                                        border-radius: 2px;
                                    }
                                `}
                    </style>

                    <div
                        style={{
                            backgroundColor: '#F2FDF8',
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            borderBottomLeftRadius: '6px',
                            borderBottomRightRadius: '6px',
                            width: '100%',
                            height: '55px',
                            display: 'inline-block',
                            overflowX: 'scroll',
                            overflowY: 'hidden',
                            scrollbarWidth: 'none',
                        }}
                    >
                        <div className="flex justify-between">
                            <div className="w-[100%]">
                                <ButtonComponent
                                    id="buBatalDokumen1"
                                    content="Batal"
                                    cssClass="e-primary e-small"
                                    iconCss="e-icons e-small e-close"
                                    style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: '#3b3f5c' }}
                                    onClick={() => {
                                        setStateDokumen((prevState: any) => ({
                                            ...prevState,
                                            kode_entitas: '',
                                            userid: '',
                                            kode_user: '',
                                            token: '',
                                            masterKodeDokumen: '',
                                            masterDataState: '',
                                            masterNamaBank: '',
                                            masterTransaksiKe: 1,
                                            masterJenisTransaksi: 1,
                                            statusJurnal: 'N',
                                        }));
                                        onClose();
                                    }}
                                />
                                <ButtonComponent
                                    id="buSimpanDokumen1"
                                    content="Simpan"
                                    cssClass="e-primary e-small"
                                    iconCss="e-icons e-small e-save"
                                    style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                                    onClick={async (args: any) => {
                                        // const grid = dgTrxBankRef.current;
                                        // await save('trxAtas');
                                        // const rowsx = grid.getBatchChanges();
                                        // // grid.refresh();

                                        // // save('trxAtas');
                                        // save('all');
                                        try {
                                            await recalc('');
                                            await save('all');
                                            setDariBatch(false);
                                            setDariBatchBawah(false);
                                        } finally {
                                            await saveDoc();
                                            setStateDokumen((prevState: any) => ({
                                                ...prevState,
                                                kode_entitas: '',
                                                userid: '',
                                                kode_user: '',
                                                token: '',
                                                masterKodeDokumen: '',
                                                masterDataState: '',
                                                masterNamaBank: '',
                                                masterTransaksiKe: 1,
                                                masterJenisTransaksi: 1,
                                                statusJurnal: 'N',
                                            }));
                                        }
                                    }}
                                    disabled={stateDokumen?.statusJurnal === 'Y' ? true : !footerColor.includes('bg-green')}
                                    // disabled={stateDokumen?.statusJurnal === 'Y' ? true : false} //{footerColor.includes('bg-green') ?
                                />
                            </div>
                        </div>
                    </div>
                    {/* </div> */}
                </div>
                {isLoadingProgress && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="rounded-lg bg-white p-6 shadow-lg">
                            <div className="mb-4 text-center text-lg font-semibold">{loadingMessage}</div>
                            <div className="mb-4 text-center text-lg font-semibold">{progressValue} %</div>
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
                                                duration: 2000,
                                                delay: 0,
                                            }}
                                            value={progressValue}
                                        >
                                            <Inject services={[ProgressAnnotation]} />
                                        </ProgressBarComponent>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {showDaftarBank && (
                    <DlgDaftarBank
                        isOpenModal={showDaftarBank}
                        visible={showDaftarBank}
                        stateDokumen={stateDokumen}
                        onHide={() => {
                            setShowDaftarBank(false);
                        }}
                        onClose={() => {
                            setShowDaftarBank(false);
                        }}
                        activeField={activeField}
                        // onSelect={handleBankSelect}
                        selectedData={(dataObject: any) => handleSelectedDialog(dataObject)}
                        namaVendor={namaVendor}
                        uniqId={uniqId}
                        namaBankState={namaBankState}
                    />
                )}
            </DialogComponent>
        </div>
    );
};

export default TransaksiBank;
