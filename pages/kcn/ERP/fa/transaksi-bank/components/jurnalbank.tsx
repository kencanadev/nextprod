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

import { Aggregate, BatchChanges, Row } from '@syncfusion/ej2/grids';

import { SplitterComponent, PanesDirective, PaneDirective } from '@syncfusion/ej2-react-layouts';
import { handleDaftarBank, handleData, handleEdit, handleEntitasAll, handleInputChange, handleJurnal, handleKlikNamaBank, handleQuBank } from '../handler/fungsi';
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

type quDJurnalbankType = {
    kode_transaksi: any;
    id_transaksi: any;
    entitas: any;
    no_rekening: any;
    nama_rekening: any;
    nama_bank: any;
    tgl_jurnal: any;
    nominal1: any;
    nominal2: any;
    nominal3: any;
    nominal4: any;
    nominal5: any;
    jurnal_ho: any;
    jurnal_cabang: any;
    keterangan_jurnal: any;
    userid: any;
};

type quDJurnalBankDetailType = {
    kode_transaksi: any;
    id_transaksi: any;
    entitas: any;
    jenis_pengeluaran: any;
    deskripsi: any;
    nama_bank: any;
    no_rekening: any;
    nama_rekening: any;
    sumber: any;
    kode_dokumen_sumber: any;
    no_dokumen_sumber: any;
    kode_vendor: any;
    nama_vendor: any;
    nominal_bayar: any;
    jurnal_ho: any;
    jurnal_cabang: any;
    keterangan_jurnal: any;
    userid: any;
    tgl_jurnal: any;
    kode_eBranch1: any;
    nama_bank1: any;
    no_rekening1: any;
    nama_rekening1: any;
    nominal1: any;
    kode_eBranch2: any;
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

interface JurnalBankProps {
    stateDokumen: any;
    isOpen: boolean;
    onClose: () => void;
    onRefresh: any;
    onRefreshTipe: any;
    listEntitas: any;
}

// let dgTrxBank: Grid;
// let dgTrxBankDetail: Grid;

const JurnalBank: React.FC<JurnalBankProps> = ({ stateDokumen, isOpen, onClose, onRefresh, onRefreshTipe, listEntitas }) => {
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
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    const toolbarOptions: ToolbarItems[] = ['Add', 'Edit', 'Delete', 'Update', 'Cancel'];

    const dgTrxBankRef = useRef<Grid | any>(null); // Create a ref for dgTrxBank
    const dgTrxBankDetailRef = useRef<Grid | any>(null); // Create a ref for dgTrxBank

    const [headerState, setHeaderState] = useState<quMTrxBankType>();
    const [detailState, setDetailState] = useState<quDTrxbankType[]>([]);
    const [bankDetailState, setBankDetailState] = useState<quDTrxBankDetailType[]>([]);
    const [jurnalState, setJurnalState] = useState<quDJurnalbankType[]>([]);
    const [jurnalDetailState, setJurnalDetailState] = useState<quDJurnalBankDetailType[]>([]);

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

    const handleDetailTrxBank = async (dariTombol: any, um: any, vch: any, phe: any, fpp: any) => {
        const resultBankDetail = await handleData(
            stateDokumen?.kode_entitas,
            stateDokumen?.masterNamaBank,
            setBankDetailState,
            bankDetailState,
            stateDokumen?.token,
            setIsLoadingProgress,
            setProgressValue,
            setDisplayedProgress,
            setLoadingMessage,
            stateDokumen.masterTransaksiKe,
            formDataState,
            dariTombol,
            um, //um
            vch, //vch
            phe, //phe
            fpp //fpp
        );

        setBankDetailState(resultBankDetail);

        if (dgTrxBankDetailRef.current) {
            dgTrxBankDetailRef.current.dataSource = resultBankDetail;
        }
    };
    useEffect(() => {
        const fetchData = async () => {
            try {
                setDataFetched(true);

                const result = await handleJurnal(
                    setIsLoadingProgress,
                    setProgressValue,
                    setDisplayedProgress,
                    setLoadingMessage,
                    stateDokumen?.kode_entitas,
                    stateDokumen?.masterKodeDokumen,
                    stateDokumen?.token,
                    stateDokumen?.masterDataState,
                    setHeaderState,
                    setDetailState,
                    setBankDetailState,
                    setJurnalState,
                    setJurnalDetailState
                );
                // setHeaderState(result.master);
                if (dgTrxBankRef.current && dgTrxBankDetailRef.current) {
                    dgTrxBankRef.current.dataSource = result.jurnal;
                    dgTrxBankDetailRef.current.dataSource = result.jurnalDetail;
                }

                // }
            } catch (error) {
                console.error('Terjadi kesalahan saat memuat data:', error);
            }
        };

        fetchData();
    }, [isOpen]);

    let interval: any;

    const saveDoc = async () => {
        let isValid = true;
        try {
            dgTrxBankRef.current.endEdit();
            dgTrxBankDetailRef.current.endEdit();
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
            // if (gnominalReady <= 0 || gnominalBayar <= 0) {
            //     myAlertGlobal2(
            //         `Total Nominal Ready :  ${frmNumber(gnominalReady)}
            //         Total Nominal Bayar :  ${frmNumber(gnominalBayar)}
            //         Dokumen tidak dapat disimpan. Silahkan cek transaksi.`,
            //         'jurnalBank'
            //     );
            //     isValid = false;
            // }
            const allEmptyJurnalAtas = dgTrxBankRef.current.dataSource.every((item: any) => !item.jurnal_ho && !item.jurnal_cabang);
            const allEmptyJurnalBawah = dgTrxBankDetailRef.current.dataSource.every((item: any) => !item.jurnal_ho && !item.jurnal_cabang);

            if (allEmptyJurnalAtas) {
                Swal.fire({
                    timer: 10,
                    showConfirmButton: false,
                });
                myAlertGlobal2(`Detail / Data jurnal atas belum di isi `, 'jurnalBank');
                // myAlertGlobal2(``, 'jurnalBank');
                isValid = false;
                // return;
            }

            if (allEmptyJurnalBawah) {
                Swal.fire({
                    timer: 10,
                    showConfirmButton: false,
                });
                myAlertGlobal2(`Detail / Data jurnal bawah belum di isi `, 'jurnalBank');
                // myAlertGlobal2(``, 'jurnalBank');
                isValid = false;
                // return;
            }

            const gridAtas = dgTrxBankRef.current;
            const dataSourceAtas = Array.isArray(gridAtas.dataSource) ? gridAtas.dataSource : [];
            const gridBawah = dgTrxBankDetailRef.current;
            const dataSourceBawah = Array.isArray(gridBawah.dataSource) ? gridBawah.dataSource : [];
            // console.log('dataSourceAtas ', dataSourceAtas);
            const reqBody = {
                entitas: stateDokumen?.kode_entitas,
                kode_transaksi: headerState?.kode_transaksi,
                // no_transaksi: headerState?.no_transaksi,
                // userid: stateDokumen?.userid,
                // tgl_transaksi: moment(headerState?.tgl_transaksi).format('YYYY-MM-DD HH:mm:ss'),
                // nominal_ready: gnominalReady,
                // total_bayar: gnominalBayar,
                // transaksi_bank: stateDokumen?.masterNamaBank,
                // jenis_transaksi: stateDokumen?.masterNamaBank === 'BCA' ? '1' : '0',
                // transaksi_ke: stateDokumen?.masterTransaksiKe,
                status_jurnal: stateDokumen?.masterDataState === 'BARU' ? 'Y' : headerState?.status_jurnal,
                // warna: gnominalBayar > gnominalReady ? 'Y' : 'N',
                // status_form: '0',
                jurnal: dataSourceAtas.map((data: any) => ({
                    ...data,
                    kode_transaksi: data.kode_transaksi,
                    id_transaksi: data.id_transaksi,
                    entitas: data.entitas,
                    no_rekening: data.no_rekening,
                    nama_rekening: data.nama_rekening,
                    nama_bank: data.nama_bank,
                    tgl_jurnal: moment().format('YYYY-MM-DD HH:mm:ss'),
                    nominal1: data.nominal1 === null ? 0 : data.nominal1,
                    nominal2: data.nominal2 === null ? 0 : data.nominal2,
                    nominal3: data.nominal3 === null ? 0 : data.nominal3,
                    nominal4: data.nominal4 === null ? 0 : data.nominal4,
                    nominal5: data.nominal5 === null ? 0 : data.nominal5,
                    jurnal_ho: data.jurnal_ho,
                    jurnal_cabang: data.jurnal_cabang,
                    keterangan_jurnal: data.keterangan_jurnal,
                    userid: stateDokumen?.userid,
                })),
                jurnalDetail: dataSourceBawah.map((data: any) => ({
                    ...data,
                    kode_transaksi: data.kode_transaksi,
                    id_transaksi: data.id_transaksi,
                    entitas: data.entitas,
                    jenis_pengeluaran: data.jenis_pengeluaran,
                    deskripsi: data.deskripsi,
                    nama_bank: data.nama_bank,
                    no_rekening: data.no_rekening,
                    nama_rekening: data.nama_rekening,
                    sumber: data.sumber,
                    kode_dokumen_sumber: data.kode_dokumen_sumber,
                    no_dokumen_sumber: data.no_dokumen_sumber,
                    kode_vendor: data.kode_vendor,
                    nama_vendor: data.nama_vendor,
                    nominal_bayar: data.nominal_bayar,
                    jurnal_ho: data.jurnal_ho,
                    jurnal_cabang: data.jurnal_cabang,
                    keterangan_jurnal: data.keterangan_jurnal,
                    userid: stateDokumen?.userid,
                    tgl_jurnal: moment().format('YYYY-MM-DD HH:mm:ss'),
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
                    responseAPI = await axios.post(`${apiUrl}/erp/simpan_transaksi_bank_jurnal`, reqBody, {
                        headers: {
                            Authorization: `Bearer ${stateDokumen?.token}`,
                        },
                    });
                } else if (stateDokumen?.masterDataState === 'EDIT') {
                    setLoadingMessage('simpan dokumen baru...');
                    setProgressValue(40);
                    responseAPI = await axios.patch(`${apiUrl}/erp/update_transaksi_bank_jurnal`, reqBody, {
                        headers: {
                            Authorization: `Bearer ${stateDokumen?.token}`,
                        },
                    });
                }
                // setProgressValue(60);
                // if (stateDokumen?.masterDataState === 'BARU' && responseAPI?.data.status === true) {
                if (responseAPI?.data.status === true) {
                    // setLoadingMessage('generate no dokumen...');
                    myAlertGlobal(`Data berhasil disimpan `, 'jurnalBank');
                    setProgressValue(60);
                    // await generateNU(stateDokumen?.kode_entitas, responseAPI?.data.data.no_transaksi, '29', moment().format('YYYYMM'));
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

    const handleCheckboxChange = async (event: React.ChangeEvent<HTMLInputElement>, uniqId: any) => {
        if (!dariBatch) {
            if (dgTrxBankDetailRef.current) {
                const updatedData = (dgTrxBankDetailRef.current.dataSource as any[]).map((item: any) => {
                    if (item.id_transaksi === uniqId) {
                        let nominal_bayar = 0;
                        let nominal_sisa = 0;
                        let nominal1 = 0;
                        let total_dibayarkan = 0;

                        if (event.target.checked) {
                            const totalNominalBayar = (dgTrxBankDetailRef.current.dataSource as any[]).reduce((total, item) => total + (item.nominal_bayar || 0), 0);
                            const totalNominalTagihan = (dgTrxBankDetailRef.current.dataSource as any[]).reduce((total, item) => total + (item.nominal_tagihan || 0), 0);

                            const totalNominalReady = (dgTrxBankRef.current?.dataSource as any[]).reduce((total, item) => total + (item.nominal_ready || 0), 0);

                            if (totalNominalBayar + item.nominal_sisa > totalNominalReady) {
                                // setTimeout(() => {
                                myAlertGlobal2(
                                    `Total Saldo Bank :  ${frmNumber(totalNominalReady)}
                                  Nominal Tagihan :  ${frmNumber(totalNominalTagihan)}
                                  Total Nominal Bayar : ${frmNumber(totalNominalBayar)}
                                  Transaksi detail nominal bayar tidak boleh lebih besar dari saldo API / Saldo Real`,
                                    'jurnalBank'
                                );
                                // }, 3000);
                                return item; // Kembali item tanpa perubahan
                            } else {
                                // nominal1 = Math.max(nominal_bayar - item.nominal2 - item.nominal3 - item.nominal4 - item.nominal5, 0);
                                nominal_bayar = item.nominal_sisa; // item.nominal_tagihan;
                                nominal1 = nominal_bayar;

                                total_dibayarkan = nominal1 + item.nominal2 + item.nominal3 + item.nominal4 + item.nominal5;

                                nominal_sisa = item.nominal_tagihan - total_dibayarkan; //nominal_bayar - item.nominal1 - item.nominal2 - item.nominal3 - item.nominal4 - item.nominal5;
                            }
                        } else {
                            total_dibayarkan = item.nominal_sisa + item.nominal1 + item.nominal2 + item.nominal3 + item.nominal4 + item.nominal5;
                            nominal_sisa = total_dibayarkan;
                            nominal_bayar = 0;
                            item.nominal1 = 0;
                            item.nominal2 = 0;
                            item.nominal3 = 0;
                            item.nominal4 = 0;
                            item.nominal5 = 0;
                        }

                        return {
                            ...item,
                            proses_bayar: event.target.checked ? 'Y' : 'N',
                            nominal_bayar,
                            nominal_sisa,
                            nominal1,
                        };
                    } else {
                        return { ...item }; // Kembalikan item tanpa perubahan
                    }
                });

                dgTrxBankDetailRef.current.dataSource = updatedData;
                dgTrxBankDetailRef.current.refresh(); // Pastikan untuk memicu pembaruan tampilan
            }
        } else {
            if (dgTrxBankDetailRef.current) {
                const grid = dgTrxBankDetailRef.current;
                const batchChanges = grid.getBatchChanges();

                const isChecked = event.target.checked; // Nilai checkbox (true/false)

                const matchedRecord = grid.contentModule.rows;
                // const sel = matchedRecord?.changes?.filter((item: any) => {

                //     item.id_transaksi === uniqId;
                // });

                matchedRecord.map((item: any, index: number) => {
                    if (item?.changes) {
                        if (item?.changes?.id_transaksi === uniqId) {
                            grid.updateCell(index, 'proses_bayar', isChecked ? 'Y' : 'N');

                            // grid.refresh();
                        }
                    }
                });

                // const rowData = event.data; // Data baris yang diedit
            }
            setDariBatch(false);
            // (dgTrxBankDetailRef.current as GridComponent).editModule.batchSave();
        }
    };

    // Simulasi fungsi untuk menggantikan query `quCek`:
    const fetchCekData = async (kode_transaksi: string, id_transaksi: string) => {
        // Simulasi data dari query quCek
        const dummyData = {
            nominal_tagihan: 100000,
            bayar: 50000,
        };

        // Di real case, ganti ini dengan fetch atau query ke database
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(dummyData);
            }, 500); // Simulasi delay 500ms
        });
    };

    const handleDropDownChange = (event: any, uniqId: any, tipe: any) => {
        if (event.value) {
            if (tipe === 'sumber' && dgTrxBankDetailRef.current) {
                const updatedData = (dgTrxBankDetailRef.current.dataSource as any[]).map((item: any) => {
                    if (item.id_transaksi === uniqId) {
                        return { ...item, sumber: event.value };
                    }
                    return item;
                });
                // dgTrxBankDetailRef.current.dataSource = updatedData;
                // dgTrxBankDetailRef.current.refresh();
            } else if (tipe === 'entitas' && dgTrxBankDetailRef.current) {
                const updatedData = (dgTrxBankDetailRef.current.dataSource as any[]).map((item: any) => {
                    if (item.id_transaksi === uniqId) {
                        return { ...item, entitas: event.value };
                    }
                    return item;
                });
                dgTrxBankDetailRef.current.dataSource = updatedData;
                dgTrxBankDetailRef.current.refresh();
            } else if (tipe === 'nama_rekening' && dgTrxBankRef.current) {
                const updatedData = (dgTrxBankRef.current.dataSource as any[]).map((item: any) => {
                    if (item.id_transaksi === uniqId) {
                        return { ...item, nama_rekening: event.value };
                    }
                    return item;
                });
                dgTrxBankRef.current.dataSource = updatedData;
                dgTrxBankRef.current.refresh();
            }
        }
    };

    const handleDropDownBlur = (event: any, uniqId: any, originalValue: any, tipe: any) => {
        if (event.type === 'close' && (!event.value || event.value === '')) {
            if (tipe === 'sumber' && dgTrxBankDetailRef.current) {
                const updatedData = (dgTrxBankDetailRef.current.dataSource as any[]).map((item: any) => {
                    if (item.uniqId === uniqId) {
                        return { ...item, sumber: originalValue }; // Kembalikan ke nilai asli
                    }
                    return item;
                });
                dgTrxBankDetailRef.current.dataSource = updatedData;
                dgTrxBankDetailRef.current.refresh();
            } else if (tipe === 'entitas' && dgTrxBankDetailRef.current) {
                const updatedData = (dgTrxBankDetailRef.current.dataSource as any[]).map((item: any) => {
                    if (item.uniqId === uniqId) {
                        return { ...item, entitas: originalValue }; // Kembalikan ke nilai asli
                    }
                    return item;
                });
                dgTrxBankDetailRef.current.dataSource = updatedData;
                dgTrxBankDetailRef.current.refresh();
            } else if (tipe === 'nama_rekening' && dgTrxBankRef.current) {
                const updatedData = (dgTrxBankRef.current.dataSource as any[]).map((item: any) => {
                    if (item.uniqId === uniqId) {
                        return { ...item, nama_rekening: originalValue }; // Kembalikan ke nilai asli
                    }
                    return item;
                });
                dgTrxBankRef.current.dataSource = updatedData;
                dgTrxBankRef.current.refresh();
            }
        }
    };

    const templateNamaRekening = (args: any) => {
        return (
            <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6">
                <DropDownListComponent
                    // id={`nama_rekening_${args.uniqId}`}
                    id={args.id_transaksi}
                    name="nama_rekening"
                    // dataSource={[
                    //     { value: 'TUNAI', text: 'TUNAI' },
                    //     { value: 'CEK', text: 'CEK' },
                    // ]}
                    fields={{ value: 'value', text: 'text' }}
                    floatLabelType="Never"
                    placeholder={args.nama_rekening}
                    value={args.nama_rekening}
                    // change={(e: any) => handleDropDownChange(e, args.id_transaksi, 'nama_rekening')}
                    // close={(e: any) => handleDropDownBlur(e, args.uniqId, args.nama_rekening, 'nama_rekening')}
                    // disabled={true}
                />
            </div>
        );
    };

    const headerTemplateJurnal = () => {
        return <div className="bg-lime-700 text-white">Jurnal</div>;
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
    let selectedIDTrx: number;
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
                                        setDariBatch(false);
                                    } else {
                                        myAlertGlobal2('Nama Supplier kosong. Silahkan input manual', 'jurnalBank');
                                    }
                                });
                            } else {
                                await handleKlikNamaBank(sel[0]?.nama_vendor ?? '').then((result) => {
                                    if (result) {
                                        setNamaVendor(sel[0].nama_vendor);
                                        setUniqId(sel[0].id_transaksi);
                                        setNamaBankState(item);
                                        setShowDaftarBank(true);
                                        setDariBatch(true);
                                        selectedIDTrx = sel[0].id_transaksi;
                                    } else {
                                        myAlertGlobal2('Nama Supplier kosong. Silahkan input manual', 'jurnalBank');
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

    const handleDetailBaru = async (jenis: any) => {
        if (jenis === 'quDTrxbank') {
            await handleGridDetail_EndEdit(jenis);

            if (dgTrxBankRef.current) {
                let totalLine = dgTrxBankRef.current.dataSource.length + 1;

                const hasEmptyFields = dgTrxBankRef.current.dataSource instanceof Array ? dgTrxBankRef.current.dataSource.some((row: { entitas: string }) => row.entitas === '') : false;
                if (!hasEmptyFields) {
                    const existingData = dgTrxBankRef.current.dataSource as quDTrxbankType[];
                    const modifiedDetail = {
                        kode_transaksi: dgTrxBankRef.current.dataSource[0].kode_transaksi,
                        id_transaksi: totalLine + 1,
                        id_tab: dgTrxBankRef.current.dataSource[0].kode_transaksi, //stateDokumen.masterTransaksiKe,
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
                    };

                    if (dgTrxBankRef.current) {
                        const realindex = dgTrxBankRef.current.dataSource.length;
                        const updatedData = [...existingData, modifiedDetail];

                        dgTrxBankRef.current.addRecord(modifiedDetail, realindex);

                        setTambahTop(true);

                        setDetailState(dgTrxBankRef.current?.dataSource as quDTrxbankType[]);
                    }
                    // setTambahTop(false);
                } else {
                    document.getElementById('topGrid')?.focus();
                    myAlertGlobal2('Silahkan melengkapi data sebelum menambah data baru', 'jurnalBank');
                }
            } else {
                console.error('dgTrxBankRef.current is null');
            }
        } else if (jenis === 'quDTrxBankDetail') {
            await handleGridDetail_EndEdit(jenis);

            if (dgTrxBankDetailRef.current) {
                let totalLine = dgTrxBankDetailRef.current.dataSource.length + 1;

                const hasEmptyFields = dgTrxBankDetailRef.current.dataSource instanceof Array ? dgTrxBankDetailRef.current.dataSource.some((row: { entitas: string }) => row.entitas === '') : false;
                if (!hasEmptyFields) {
                    const modifiedDetail = {
                        kode_transaksi: dgTrxBankDetailRef.current.dataSource[0].kode_transaksi,
                        id_transaksi: totalLine + 1,
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
                    };

                    if (dgTrxBankDetailRef.current) {
                        setTambahBottom(true);
                        const realindex = dgTrxBankDetailRef.current.dataSource.length;

                        dgTrxBankDetailRef.current.addRecord(modifiedDetail, realindex);

                        setBankDetailState(dgTrxBankDetailRef.current?.dataSource as quDTrxBankDetailType[]);
                    }
                } else {
                    document.getElementById('bottomGrid')?.focus();
                    myAlertGlobal2('Silahkan melengkapi data sebelum menambah data baru', 'jurnalBank');
                }
            } else {
                console.error('dgTrxBankDetailRef.current is null');
            }
        }
    };
    const rowSelectingGridDetail = (args: any, jenis: any) => {
        if (jenis === 'quDTrxbank') {
            setSelectedIdTransaksi(args.data.id_transaksi);
        } else if (jenis === 'quDTrxBankDetail') {
            setSelectedIdTransaksi(args.data.id_transaksi);
        }
        // setSelectedRowIndexTop(args.rowIndex);
    };

    const deleteData = (deletedId: any, jenis: any) => {
        if (dgTrxBankRef.current.dataSource.length > 0 && jenis === 'qudTrxBank') {
            const selectedRecord = dgTrxBankRef.current.getSelectedRecords()?.[0];
            if (!selectedRecord?.id_transaksi) {
                myAlertGlobal2('Silahkan pilih transaksi yang akan dihapus', 'jurnalBank');
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
                myAlertGlobal2('Silahkan pilih transaksi yang akan dihapus', 'jurnalBank');
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
        // console.log('args.requestType', args.requestType);
        switch (args.requestType) {
            case 'save':
                if (jenis === 'quDtrxBank' && dgTrxBankRef.current) {
                    const gridInstance = dgTrxBankRef.current;
                    const updatedData = gridInstance.dataSource.map((item: any) => (item.id_transaksi === args.data.id_transaksi ? args.data : item));
                    gridInstance.dataSource = updatedData;

                    gridInstance.refresh();
                    recalc(args);
                } else if (jenis === 'quDtrxBankDetail' && dgTrxBankDetailRef.current) {
                    const gridInstance = dgTrxBankDetailRef.current;
                    const updatedData = gridInstance.dataSource.map((item: any) => (item.id_transaksi === args.data.id_transaksi ? args.data : item));
                    gridInstance.dataSource = updatedData;

                    gridInstance.refresh();
                }

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
        },
    };

    const sumberEntitas: IEditCell = {
        params: {
            actionComplete: () => false,
            dataSource: new DataManager(listEntitas),

            fields: { text: 'kodeCabang', value: 'kodeCabang' },
            query: new Query(),
        },
    };

    const datepickerparams: IEditCell = {
        params: {
            showClearButton: false,
            showTodayButton: true,
            format: 'dd-MM-yyyy',
        },
    };

    const namaBank1: IEditCell = {
        params: {
            showClearButton: true,
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
            let rowIndex = dgTrxBankDetailRef.current.getRowInfo(args.row).rowIndex;
            let nominal_bayar = 0;
            let nominal_sisa = 0;
            let nominal1 = 0;
            let total_dibayarkan = 0;

            const inputElement = args.element as HTMLInputElement;
            inputElement.checked = args.rowData[args.column.field] === true; // Atur nilai awal checkbox

            inputElement.addEventListener('change', (event: Event) => {
                const grid = dgTrxBankDetailRef.current;
                const dataSource = dgTrxBankDetailRef.current.dataSource as any[];
                const checkbox = event.target as HTMLInputElement;

                // if (checkbox.checked) {
                //     dataSource[rowIndex]['nominal_bayar'] = 7000;
                //     grid.updateCell(rowIndex, 'nominal_bayar', 7000);
                // }
                if (rowData.nominal_tagihan === 0) {
                    myAlertGlobal2(
                        ` Proses pembayaran tidak dapat dilakukan.
                         Nominal Tagihan: ${frmNumber(rowData.nominal_tagihan)}`,
                        'jurnalBank'
                    );
                    checkbox.checked = false; // Kembalikan status checkbox ke false
                    return;
                } else {
                    if (checkbox.checked) {
                        const totalNominalBayar = ((dgTrxBankRef.current?.dataSource as any[]) || []).reduce((total, item) => total + (item.nominal_bayar || 0), 0);
                        const totalNominalTagihan = ((dgTrxBankRef.current?.dataSource as any[]) || []).reduce((total, item) => total + (item.nominal_tagihan || 0), 0);
                        const totalNominalReady = ((dgTrxBankRef.current?.dataSource as any[]) || []).reduce((total, item) => total + (item.nominal_ready || 0), 0);

                        if (totalNominalBayar + rowData.nominal_sisa > totalNominalReady) {
                            myAlertGlobal2(
                                `Total Saldo Bank: ${frmNumber(totalNominalReady)}
                         Nominal Tagihan: ${frmNumber(totalNominalTagihan)}
                         Total Nominal Bayar: ${frmNumber(totalNominalBayar)}
                         Transaksi detail nominal bayar tidak boleh lebih besar dari saldo API / Saldo Real.`,
                                'jurnalBank'
                            );
                            checkbox.checked = false; // Kembalikan status checkbox ke false
                            return;
                        }
                        if (rowIndex >= 0 && dataSource[rowIndex]) {
                            nominal_bayar = rowData.nominal_sisa;
                            nominal1 = rowData.nominal_sisa;
                            total_dibayarkan = nominal_bayar + rowData.nominal2 + rowData.nominal3 + rowData.nominal4 + rowData.nominal5;
                            nominal_sisa = rowData.nominal_tagihan - total_dibayarkan;
                            // Baris sudah ada di dataSource
                            dataSource[rowIndex]['proses_bayar'] = true;
                            dataSource[rowIndex]['nominal_bayar'] = nominal_bayar;
                            dataSource[rowIndex]['nominal_sisa'] = nominal_sisa;
                            dataSource[rowIndex]['nominal1'] = nominal1;
                        } else {
                            nominal_bayar = rowData.nominal_sisa;
                            nominal1 = rowData.nominal_sisa;
                            total_dibayarkan = nominal_bayar + rowData.nominal2 + rowData.nominal3 + rowData.nominal4 + rowData.nominal5;
                            nominal_sisa = rowData.nominal_tagihan - total_dibayarkan;
                            const newRow = {
                                ...rowData,
                                nominal_bayar: nominal_bayar,
                                proses_bayar: true,
                                nominal_sisa: nominal_sisa,
                                nominal1: nominal1,
                                // Set nilai nominal_bayar untuk row baru
                            };
                            dataSource.push(newRow); // Tambahkan row baru ke dataSource
                        }

                        // Perbarui sel di grid
                        grid.updateCell(rowIndex, 'nominal_bayar', nominal_bayar);
                        grid.updateCell(rowIndex, 'nominal_sisa', nominal_sisa);
                        grid.updateCell(rowIndex, 'nominal1', nominal1);

                        // Pastikan perubahan tercatat di dataSource
                        dgTrxBankDetailRef.current.dataSource = [...dataSource];
                    } else {
                        total_dibayarkan = rowData.nominal_sisa + rowData.nominal1 + rowData.nominal2 + rowData.nominal3 + rowData.nominal4 + rowData.nominal5;
                        nominal_sisa = total_dibayarkan;
                        nominal_bayar = 0;
                        rowData.nominal1 = 0;
                        rowData.nominal2 = 0;
                        rowData.nominal3 = 0;
                        rowData.nominal4 = 0;
                        rowData.nominal5 = 0;
                        dataSource[rowIndex]['proses_bayar'] = false;
                        dataSource[rowIndex]['nominal_bayar'] = nominal_bayar;
                        dataSource[rowIndex]['nominal_sisa'] = nominal_sisa;
                        dataSource[rowIndex]['nominal1'] = nominal1;

                        grid.updateCell(rowIndex, 'nominal_bayar', 0);
                        grid.updateCell(rowIndex, 'nominal_sisa', total_dibayarkan);
                        grid.updateCell(rowIndex, 'nominal1', 0);
                        grid.updateCell(rowIndex, 'nominal2', 0);
                        grid.updateCell(rowIndex, 'nominal3', 0);
                        grid.updateCell(rowIndex, 'nominal4', 0);
                        grid.updateCell(rowIndex, 'nominal5', 0);
                    }
                }
            });
        },

        params: {
            disabled: false,
        },
    };

    const checkboxTemplate = (props: any) => {
        return <input type="checkbox" className="e-checkbox" checked={props.proses_bayar || false} onChange={(e) => handleCheckboxChange(e, props)} />;
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

            let rowIndex = dgTrxBankDetailRef.current.getRowInfo(args.row).rowIndex;
            let totalCostValue = 0;
            let nominal_bayar = 0;
            let nominal_sisa = 0;
            let nominal1 = 0;
            let total_dibayarkan = 0;
            let updatedValue = 0;

            priceObj = new NumericTextBox({
                value: args.rowData[args.column.field],
                change: function (args) {
                    const dataSource = dgTrxBankDetailRef.current.dataSource as any[];
                    const grid = dgTrxBankDetailRef.current;

                    const totalNominalReady = (dgTrxBankRef.current?.dataSource as any[]).reduce((total, item) => total + (item.nominal_ready || 0), 0);
                    const totalNominalBayar = (dgTrxBankDetailRef.current.dataSource as any[]).reduce((total, item) => total + (item.nominal_bayar || 0), 0);
                    const totalNominalTagihan = (dgTrxBankDetailRef.current.dataSource as any[]).reduce((total, item) => total + (item.nominal_tagihan || 0), 0);

                    if (totalNominalBayar > totalNominalReady || (totalNominalBayar === 0 && totalNominalReady === 0)) {
                        // setTimeout(() => {
                        myAlertGlobal2(
                            `Total Saldo Bank :  ${frmNumber(totalNominalReady)}
                          Nominal Tagihan :  ${frmNumber(totalNominalTagihan)}
                          Total Nominal Bayar : ${frmNumber(totalNominalBayar)}
                          Transaksi detail nominal bayar tidak boleh lebih besar dari saldo API / Saldo Real`,
                            'jurnalBank'
                        );
                        // }, 0);

                        dgTrxBankDetailRef.current.refresh();
                    } else {
                        if (rowIndex >= 0 && dataSource[rowIndex]) {
                            updatedValue = args.value;
                            totalCostValue = rowData['nominal_tagihan'] - updatedValue;
                            nominal_bayar = args.value;
                            nominal1 = updatedValue;
                            total_dibayarkan = nominal_bayar + rowData.nominal2 + rowData.nominal3 + rowData.nominal4 + rowData.nominal5;
                            nominal_sisa = rowData.nominal_tagihan - total_dibayarkan;

                            dataSource[rowIndex].nominal_sisa = totalCostValue;
                            dataSource[rowIndex].nominal1 = updatedValue;
                        } else {
                            updatedValue = args.value;
                            totalCostValue = rowData['nominal_tagihan'] - updatedValue;
                            nominal_bayar = args.value;
                            nominal1 = updatedValue; //rowData.nominal_sisa;
                            total_dibayarkan = nominal_bayar + rowData.nominal2 + rowData.nominal3 + rowData.nominal4 + rowData.nominal5;
                            nominal_sisa = rowData.nominal_tagihan - total_dibayarkan;
                            const newRow = {
                                ...rowData,
                                nominal_bayar: updatedValue,
                                nominal_sisa: totalCostValue,
                                nominal1: updatedValue,
                            };
                            dataSource.push(newRow);
                        }

                        grid.updateCell(rowIndex, 'nominal_sisa', totalCostValue);
                        grid.updateCell(rowIndex, 'nominal1', nominal1);
                        grid.updateCell(rowIndex, 'proses_bayar', true);

                        dataSource[rowIndex].nominal_bayar = updatedValue;
                        dataSource[rowIndex].proses_bayar = true;
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
            let rowIndex = dgTrxBankRef.current.getRowInfo(args.row).rowIndex;
            let updatedValue = 0;
            let saldoEndap = rowData.saldo_endap;
            let nominalReadyx = 0;

            nominalRealObj = new NumericTextBox({
                value: args.rowData[args.column.field],
                change: function (args) {
                    const dataSource = dgTrxBankRef.current.dataSource as any[];
                    const grid = dgTrxBankRef.current;
                    updatedValue = args.value;
                    nominalReadyx = updatedValue - saldoEndap;
                    if (updatedValue < saldoEndap) {
                        myAlertGlobal2(
                            `Saldo Bank yang di input :  ${frmNumber(updatedValue)}
                         Saldo Endap :  ${frmNumber(saldoEndap)}
                          Saldo Real tidak boleh lebih kecil dari saldo endap `,
                            'jurnalBank'
                        );
                        dgTrxBankRef.current.refresh();
                    } else {
                        if (rowIndex >= 0 && dataSource[rowIndex]) {
                            dataSource[rowIndex].saldo_real = updatedValue;
                            dataSource[rowIndex].nominal_ready = nominalReadyx;
                            dataSource[rowIndex].nominal1 = nominalReadyx;
                        } else {
                            updatedValue = args.value;

                            const newRow = {
                                ...rowData,
                                saldo_real: updatedValue,
                                nominal_ready: nominalReadyx,
                                nominal1: nominalReadyx,
                            };

                            dataSource.push(newRow);
                        }

                        grid.updateCell(rowIndex, 'nominal_ready', nominalReadyx);
                        grid.updateCell(rowIndex, 'nominal1', nominalReadyx);
                        dataSource[rowIndex].nominal_ready = nominalReadyx;
                        dataSource[rowIndex].nominal1 = nominalReadyx;
                        // save('trxAtas');
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
            let rowIndex = dgTrxBankRef.current.getRowInfo(args.row).rowIndex;
            let updatedValue = 0;
            let saldoReal = rowData.saldo_real;
            let nominalReadyx = rowData.saldo_real;

            nominalReadyObj = new NumericTextBox({
                value: args.rowData[args.column.field],
                change: function (args) {
                    const dataSource = dgTrxBankRef.current.dataSource as any[];
                    const grid = dgTrxBankRef.current;
                    updatedValue = args.value;

                    nominalReadyx = updatedValue - saldoReal;

                    if (updatedValue > saldoReal) {
                        myAlertGlobal2(
                            `Nominal ready yang di input :  ${frmNumber(updatedValue)}
                         Saldo Real :  ${frmNumber(saldoReal)}
                          Nominal ready tidak boleh lebih besar dari saldo real `,
                            'jurnalBank'
                        );
                        dgTrxBankRef.current.refresh();
                    } else if (saldoReal === 0) {
                        myAlertGlobal2(`Saldo real tidak ada atau belum di input `, 'jurnalBank');
                        dgTrxBankRef.current.refresh();
                    } else {
                        if (rowIndex >= 0 && dataSource[rowIndex]) {
                            dataSource[rowIndex].nominal_ready = updatedValue;
                            dataSource[rowIndex].nominal1 = updatedValue;
                        } else {
                            updatedValue = args.value;

                            const newRow = {
                                ...rowData,
                                nominal_ready: updatedValue,
                                nominal1: updatedValue,
                            };

                            dataSource.push(newRow);
                        }

                        grid.updateCell(rowIndex, 'nominal1', updatedValue);
                        dataSource[rowIndex].nominal1 = updatedValue;
                        // save('trxAtas');
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
            let rowIndex = dgTrxBankDetailRef.current.getRowInfo(args.row).rowIndex;
            let updatedValue = 0;
            // let saldoReal = rowData.saldo_real;
            // let nominalReadyx = rowData.saldo_real;

            nominalTagihanObj = new NumericTextBox({
                value: args.rowData[args.column.field],
                change: function (args) {
                    const dataSource = dgTrxBankDetailRef.current.dataSource as any[];
                    const grid = dgTrxBankDetailRef.current;
                    updatedValue = args.value;

                    // nominalReadyx = updatedValue - saldoReal;
                    if (stateDokumen.masterDataState === 'BARU') {
                    } else {
                        if (rowIndex >= 0 && dataSource[rowIndex]) {
                            dataSource[rowIndex].nominal_tagihan = updatedValue;
                        } else {
                            updatedValue = args.value;

                            const newRow = {
                                ...rowData,
                                nominal_tagihan: updatedValue,
                            };

                            dataSource.push(newRow);
                        }
                        // grid.updateCell(rowIndex, 'nominal_tagihan', updatedValue);
                        dataSource[rowIndex].nominal_tagihan = updatedValue;
                        // save('trxAtas');
                    }
                },
            });
            nominalTagihanObj.appendTo(nominalTagihanElem);
        },
    };

    const nominal1Edit: IEditCell = {
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
            let rowIndex = dgTrxBankDetailRef.current.getRowInfo(args.row).rowIndex;
            const namaFieldEdit = args?.column?.field;

            priceObj = new NumericTextBox({
                value: args.rowData[args.column?.field],
                change: function (args) {
                    const updatedValue = args.value;
                    const nominalBayar = rowData.nominal_bayar;

                    if (updatedValue > nominalBayar) {
                        let pesan: any;
                        if (namaFieldEdit === 'nominal1') {
                            pesan = `Total Nominal Bayar :  ${frmNumber(nominalBayar)}
                              Nominal 1 :  ${frmNumber(updatedValue)}
                              Data tidak dapat di input. Nilai nominal 1 lebih besar dari nominal bayar. `;
                        }
                        myAlertGlobal2(pesan, 'jurnalBank');
                        dgTrxBankDetailRef.current.refresh();
                    } else {
                        let totalNominal: any;
                        if (namaFieldEdit === 'nominal2') {
                            totalNominal = rowData.nominal1 + rowData.nominal3 + rowData.nominal4 + rowData.nominal5;
                        } else if (namaFieldEdit === 'nominal3') {
                            totalNominal = rowData.nominal1 + rowData.nominal2 + rowData.nominal4 + rowData.nominal5;
                        } else if (namaFieldEdit === 'nominal4') {
                            totalNominal = rowData.nominal1 + rowData.nominal2 + rowData.nominal3 + rowData.nominal5;
                        } else if (namaFieldEdit === 'nominal5') {
                            totalNominal = rowData.nominal1 + rowData.nominal2 + rowData.nominal3 + rowData.nominal4;
                        }
                        const updateNominal1 = totalNominal - updatedValue;

                        // const totalCostValue = rowData['nominal_tagihan'] - updatedValue;
                        dgTrxBankDetailRef.current.updateCell(
                            rowIndex,
                            namaFieldEdit === 'nominal2' ? 'nominal2' : namaFieldEdit === 'nominal3' ? 'nominal3' : namaFieldEdit === 'nominal4' ? 'nominal4' : 'nominal5',
                            updatedValue
                        );

                        // Update dataSource secara langsung
                        const dataSource = dgTrxBankDetailRef.current.dataSource as any[];
                        dataSource[rowIndex].nominal1 = updateNominal1;
                        if (namaFieldEdit === 'nominal2') {
                            dataSource[rowIndex].nominal2 = updatedValue;
                        } else if (namaFieldEdit === 'nominal3') {
                            dataSource[rowIndex].nominal3 = updatedValue;
                        }
                        if (namaFieldEdit === 'nominal4') {
                            dataSource[rowIndex].nominal4 = updatedValue;
                        }
                        if (namaFieldEdit === 'nominal5') {
                            dataSource[rowIndex].nominal5 = updatedValue;
                        }

                        dgTrxBankDetailRef.current.setProperties({ dataSource: dataSource });
                        dgTrxBankDetailRef.current.refresh();
                    }
                    // }
                },
            });
            priceObj.appendTo(priceElem);
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
            let rowIndex = dgTrxBankRef.current.getRowInfo(args.row).rowIndex;
            const namaFieldEdit = args?.column?.field;

            nominalAtasObj = new NumericTextBox({
                value: args.rowData[args.column?.field],
                change: function (args) {
                    let totalNominal = 0;
                    let updateNominal1 = 0;
                    let nomReady = 0;
                    const updatedValue = args.value;
                    const nominalReady = rowData.nominal_ready;
                    const dataSource = dgTrxBankRef.current.dataSource as any[];

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
                        myAlertGlobal2(pesan, 'jurnalBank');

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
                        myAlertGlobal2(pesan, 'jurnalBank');

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
                                updateNominal1 = nomReady - totalNominal;
                            } else if (namaFieldEdit === 'nominal3') {
                                nomReady = rowData.nominal_ready;
                                totalNominal = updatedValue + +rowData.nominal2 + rowData.nominal4 + rowData.nominal5;
                                updateNominal1 = nomReady - totalNominal;
                            } else if (namaFieldEdit === 'nominal4') {
                                nomReady = rowData.nominal_ready;
                                totalNominal = updatedValue + +rowData.nominal2 + rowData.nominal3 + rowData.nominal5;
                                updateNominal1 = nomReady - totalNominal;
                            } else if (namaFieldEdit === 'nominal5') {
                                nomReady = rowData.nominal_ready;
                                totalNominal = updatedValue + +rowData.nominal2 + rowData.nominal3 + rowData.nominal4;
                                updateNominal1 = nomReady - totalNominal;
                            }
                        } else {
                            const newRow = {
                                ...rowData,
                                nominal1: updateNominal1,
                                nominal2: namaFieldEdit === 'nominal2' ? updatedValue : rowData.nominal2,
                                nominal3: namaFieldEdit === 'nominal3' ? updatedValue : rowData.nominal3,
                                nominal4: namaFieldEdit === 'nominal4' ? updatedValue : rowData.nominal4,
                                nominal5: namaFieldEdit === 'nominal5' ? updatedValue : rowData.nominal5,
                            };

                            dataSource.push(newRow);
                        }

                        dgTrxBankRef.current.updateCell(rowIndex, 'nominal1', updateNominal1);

                        dataSource[rowIndex].nominal1 = updateNominal1;

                        if (namaFieldEdit === 'nominal2') {
                            dataSource[rowIndex].nominal2 = updatedValue;
                        } else if (namaFieldEdit === 'nominal3') {
                            dataSource[rowIndex].nominal3 = updatedValue;
                        }
                        if (namaFieldEdit === 'nominal4') {
                            dataSource[rowIndex].nominal4 = updatedValue;
                        }
                        if (namaFieldEdit === 'nominal5') {
                            dataSource[rowIndex].nominal5 = updatedValue;
                        }

                        // dgTrxBankDetailRef.current.setProperties({ dataSource: dataSource });
                        // dgTrxBankDetailRef.current.refresh();
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
            let rowIndex = dgTrxBankDetailRef.current.getRowInfo(args.row).rowIndex;
            const namaFieldEdit = args?.column?.field;

            nominalObj = new NumericTextBox({
                value: args.rowData[args.column?.field],
                change: function (args) {
                    let totalNominal = 0;
                    let updateNominal1 = 0;
                    let nomBayar = 0;
                    const updatedValue = args.value;
                    const nominalBayar = rowData.nominal_bayar;
                    const dataSource = dgTrxBankDetailRef.current.dataSource as any[];

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
                        myAlertGlobal2(pesan, 'jurnalBank');

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
                        myAlertGlobal2(pesan, 'jurnalBank');

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
                            } else if (namaFieldEdit === 'nominal3') {
                                nomBayar = rowData.nominal_bayar;
                                totalNominal = updatedValue + +rowData.nominal2 + rowData.nominal4 + rowData.nominal5;
                                updateNominal1 = nomBayar - totalNominal;
                            } else if (namaFieldEdit === 'nominal4') {
                                nomBayar = rowData.nominal_bayar;
                                totalNominal = updatedValue + +rowData.nominal2 + rowData.nominal3 + rowData.nominal5;
                                updateNominal1 = nomBayar - totalNominal;
                            } else if (namaFieldEdit === 'nominal5') {
                                nomBayar = rowData.nominal_bayar;
                                totalNominal = updatedValue + +rowData.nominal2 + rowData.nominal3 + rowData.nominal4;
                                updateNominal1 = nomBayar - totalNominal;
                            }
                        } else {
                            const newRow = {
                                ...rowData,
                                nominal1: updateNominal1,
                                nominal2: namaFieldEdit === 'nominal2' ? updatedValue : rowData.nominal2,
                                nominal3: namaFieldEdit === 'nominal3' ? updatedValue : rowData.nominal3,
                                nominal4: namaFieldEdit === 'nominal4' ? updatedValue : rowData.nominal4,
                                nominal5: namaFieldEdit === 'nominal5' ? updatedValue : rowData.nominal5,
                            };

                            dataSource.push(newRow);
                        }

                        dgTrxBankDetailRef.current.updateCell(rowIndex, 'nominal1', updateNominal1);

                        dataSource[rowIndex].nominal1 = updateNominal1;

                        if (namaFieldEdit === 'nominal2') {
                            dataSource[rowIndex].nominal2 = updatedValue;
                        } else if (namaFieldEdit === 'nominal3') {
                            dataSource[rowIndex].nominal3 = updatedValue;
                        }
                        if (namaFieldEdit === 'nominal4') {
                            dataSource[rowIndex].nominal4 = updatedValue;
                        }
                        if (namaFieldEdit === 'nominal5') {
                            dataSource[rowIndex].nominal5 = updatedValue;
                        }

                        // dgTrxBankDetailRef.current.setProperties({ dataSource: dataSource });
                        // dgTrxBankDetailRef.current.refresh();
                    }
                    // }
                },
            });
            nominalObj.appendTo(nominalElem);
        },
    };

    const cellEdit = (args: any) => {
        if (args.columnName == 'nominal_sisa') {
            args.cancel = true;
        }
    };

    const save = async (jenis: any) => {
        if (jenis === 'trxAtas') {
            (dgTrxBankRef.current as GridComponent).editModule.batchSave();
        } else if (jenis === 'trxBawah') {
            (dgTrxBankDetailRef.current as GridComponent).editModule.batchSave();
        } else if (jenis === 'all') {
            try {
                if (dgTrxBankRef.current) {
                    dgTrxBankRef.current.endEdit();
                    // const gridInstance = dgTrxBankRef.current;
                    // const updatedData = gridInstance.dataSource.map((item: any) => (item.id_transaksi === args.data.id_transaksi ? args.data : item));
                    // gridInstance.dataSource = updatedData;

                    // gridInstance.refresh();
                    // (dgTrxBankRef.current as GridComponent).editModule.batchSave();
                }
            } finally {
                if (dgTrxBankDetailRef.current) {
                    dgTrxBankDetailRef.current.endEdit();

                    // const gridInstance = dgTrxBankRef.current;
                    // const updatedData = gridInstance.dataSource.map((item: any) => (item.id_transaksi === args.data.id_transaksi ? args.data : item));
                    // gridInstance.dataSource = updatedData;

                    // gridInstance.refresh();
                    // (dgTrxBankDetailRef.current as GridComponent).editModule.batchSave();
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
        const dataSource = dgTrxBankRef.current?.dataSource || [];
        if (dataSource?.length > 0) {
            const totalNominalReady = dataSource.reduce((total: any, item: any) => {
                return total + (item.nominal_ready || 0), 0;
            });

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

        setGnominalReady(x1);
        setGnominal1Atas(x2);
        setGnominalBayar(x3);
        setGnominal1Bawah(x4);
    };

    // const checkCondition = () => {
    //     if (gnominalBayar !== gnominalReady) {
    //         return true;
    //     }
    //     return false;
    // };
    // const checkCondition = () => gnominalBayar !== gnominalReady;
    // const footerTemplateWithCondition = (props: any, gnominalBayar: number, gnominalReady: number) => {
    //     let bgColor = 'bg-white'; // Default color
    //     if (gnominalBayar > gnominalReady) {
    //         bgColor = 'bg-red-500 text-white';
    //     } else {
    //         bgColor = 'bg-green-500 text-white';
    //     }
    //     return <div className={`px-2 text-right ${bgColor}`}>{props.Sum !== undefined && props.Sum !== null ? props.Sum.toLocaleString('id-ID', { minimumFractionDigits: 2 }) : '0,00'}</div>;
    // };

    // const footerTemplateWithCondition = (props: any, gnominalBayar: number, gnominalReady: number) => {
    //     const checkCondition = () => gnominalBayar !== gnominalReady;
    //     const bgColor = checkCondition() ? 'bg-red-500 text-white' : 'bg-green-500 text-white';

    //     return <div className={`px-2 text-right ${bgColor}`}>{props.Sum !== undefined && props.Sum !== null ? props.Sum.toLocaleString('id-ID', { minimumFractionDigits: 2 }) : '0,00'}</div>;
    // };

    const footerTemplateWithCondition = (props: any, gnominalBayar: number, gnominalReady: number) => {
        if (props === undefined || props.Sum === undefined || props.Sum === null) {
            return <div className="bg-gray-200 px-2 text-right">0,00</div>;
        }

        const checkCondition = () => gnominalBayar !== gnominalReady;
        const bgColor = checkCondition() ? 'bg-red-500 text-white' : 'bg-green-500 text-white';

        return <div className={`px-2 text-right ${bgColor}`}>{props.Sum.toLocaleString('id-ID', { minimumFractionDigits: 0 })}</div>;
    };

    const recalculateNominal = async () => {
        const dataSourceDetail = dgTrxBankDetailRef.current?.getCurrentViewRecords() || [];

        const updatedDetails = dataSourceDetail.map((detail: any) => {
            const nominal1 = Math.max(detail.nominal_bayar - detail.nominal2 - detail.nominal3 - detail.nominal4 - detail.nominal5, 0);

            return { ...detail, nominal1 };
        });

        dgTrxBankDetailRef.current.dataSource = updatedDetails;

        setBankDetailState(updatedDetails);
    };

    const validateNominals = () => {
        // const dataSourceDetail = dgTrxBankDetailRef.current?.getCurrentViewRecords() || [];
        const dataSourceDetail = dgTrxBankDetailRef.current?.dataSource || [];

        const hasDuplicateNominals = dataSourceDetail.some((detail: any) => {
            const { nominal1, nominal2, nominal3, nominal4, nominal5 } = detail;
            const nominals = [nominal1, nominal2, nominal3, nominal4, nominal5].filter((n) => n > 0);
            return new Set(nominals).size !== nominals.length;
        });

        if (hasDuplicateNominals) {
            alert('Mohon cek kembali nominal e-branch yang diinput ada yang sama');
        }
    };

    const toolbarClick = (args: ClickEventArgs) => {
        if (args.item.id === 'topGrid_add') {
            setDariBatch(true);
            args.cancel = true;

            const grid = dgTrxBankRef.current;

            const rowsx = grid.getBatchChanges();

            if (rowsx.addedRecords.length <= 0) {
                const lastRowGrid = grid.dataSource[grid.dataSource.length - 1];
                const lastRowBatch = rowsx.addedRecords.length + 1;
                const newId = lastRowGrid.id_transaksi + lastRowBatch;

                const newRecord = {
                    kode_transaksi: dgTrxBankRef.current.dataSource[0].kode_transaksi,
                    id_transaksi: newId,
                    id_tab: dgTrxBankRef.current.dataSource[0].kode_transaksi, //stateDokumen.masterTransaksiKe,
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
                };
                (grid as GridComponent).addRecord(newRecord);
            } else {
                const hasEmptyFields = rowsx.addedRecords instanceof Array ? rowsx.addedRecords.some((row: { nama_rekening: string }) => row.nama_rekening === '') : false;

                if (hasEmptyFields) {
                    myAlertGlobal2('Silahkan melengkapi data sebelum menambah data baru', 'jurnalBank');
                } else {
                    const lastRowGrid = grid.dataSource[grid.dataSource.length - 1];
                    const lastRowBatch = rowsx.addedRecords.length + 1;
                    const newId = lastRowGrid.id_transaksi + lastRowBatch;

                    const newRecord = {
                        kode_transaksi: dgTrxBankRef.current.dataSource[0].kode_transaksi,
                        id_transaksi: newId,
                        id_tab: dgTrxBankRef.current.dataSource[0].kode_transaksi, //stateDokumen.masterTransaksiKe,
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
                    };
                    (grid as GridComponent).addRecord(newRecord);
                    // const newData = [...dgTrxBankDetailRef.current, { id: dgTrxBankDetailRef.current.length + 1, name: '', age: '' }];
                    // setGridData(newData);
                    // dgTrxBankDetailRef.current.dataSource = newData;
                }
            }

            // }
        } else if (args.item.id === 'topGrid_delete') {
        } else if (args.item.id === 'topGrid_cancel') {
        } else if (args.item.id === 'bottomGrid_add') {
            setDariBatch(true);
            args.cancel = true;

            const grid = dgTrxBankDetailRef.current;

            const rowsx = grid.getBatchChanges();

            if (rowsx.addedRecords.length <= 0) {
                const lastRow = grid.dataSource[grid.dataSource.length - 1];
                const newId = lastRow ? lastRow.id_transaksi + 1 : 1; // ID baru berdasarkan ID terakhir

                const newRecord = {
                    kode_transaksi: dgTrxBankDetailRef.current.dataSource[0]?.kode_transaksi,
                    id_transaksi: newId,
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
                };
                (grid as GridComponent).addRecord(newRecord);
            } else {
                const hasEmptyFields = rowsx.addedRecords instanceof Array ? rowsx.addedRecords.some((row: { nama_vendor: string }) => row.nama_vendor === '') : false;

                if (hasEmptyFields) {
                    myAlertGlobal2('Silahkan melengkapi data sebelum menambah data baru', 'jurnalBank');
                } else {
                    const lastRowGrid = grid.dataSource[grid.dataSource.length - 1];
                    // const lastRowBatch = rowsx.addedRecords.length + 1;
                    const lastRowBatch = rowsx.addedRecords.length + 1;

                    const newId = lastRowGrid.id_transaksi + lastRowBatch;

                    // const newId = lastRow ? lastRow.id_transaksi + 1 : 1; // ID baru berdasarkan ID terakhir

                    const newRecord = {
                        kode_transaksi: dgTrxBankDetailRef.current.dataSource[0]?.kode_transaksi,
                        id_transaksi: newId,
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
                    };
                    (grid as GridComponent).addRecord(newRecord);
                    // const newData = [...dgTrxBankDetailRef.current, { id: dgTrxBankDetailRef.current.length + 1, name: '', age: '' }];
                    // setGridData(newData);
                    // dgTrxBankDetailRef.current.dataSource = newData;
                }
            }

            // }
        } else if (args.item.id === 'bottomGrid_delete') {
        } else if (args.item.id === 'bottomGrid_cancel') {
        }
    };

    const toolbarClick2 = (jenis: any) => {
        if (jenis === 'topGrid_add') {
            setDariBatch(true);
            // args.cancel = true;

            const grid = dgTrxBankRef.current;

            const rowsx = grid.getBatchChanges();

            if (rowsx.addedRecords.length <= 0) {
                const lastRowGrid = grid.dataSource[grid.dataSource.length - 1];
                const lastRowBatch = rowsx.addedRecords.length + 1;
                const newId = lastRowGrid.id_transaksi + lastRowBatch;

                const newRecord = {
                    kode_transaksi: dgTrxBankRef.current.dataSource[0].kode_transaksi,
                    id_transaksi: newId,
                    id_tab: dgTrxBankRef.current.dataSource[0].kode_transaksi, //stateDokumen.masterTransaksiKe,
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
                };
                (grid as GridComponent).addRecord(newRecord);
            } else {
                const hasEmptyFields = rowsx.addedRecords instanceof Array ? rowsx.addedRecords.some((row: { nama_rekening: string }) => row.nama_rekening === '') : false;

                if (hasEmptyFields) {
                    myAlertGlobal2('Silahkan melengkapi data sebelum menambah data baru', 'jurnalBank');
                } else {
                    const lastRowGrid = grid.dataSource[grid.dataSource.length - 1];
                    const lastRowBatch = rowsx.addedRecords.length + 1;
                    const newId = lastRowGrid.id_transaksi + lastRowBatch;

                    const newRecord = {
                        kode_transaksi: dgTrxBankRef.current.dataSource[0].kode_transaksi,
                        id_transaksi: newId,
                        id_tab: dgTrxBankRef.current.dataSource[0].kode_transaksi, //stateDokumen.masterTransaksiKe,
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
                    };
                    (grid as GridComponent).addRecord(newRecord);
                    // const newData = [...dgTrxBankDetailRef.current, { id: dgTrxBankDetailRef.current.length + 1, name: '', age: '' }];
                    // setGridData(newData);
                    // dgTrxBankDetailRef.current.dataSource = newData;
                }
            }

            // }
        } else if (jenis === 'topGrid_delete') {
        } else if (jenis === 'topGrid_cancel') {
        } else if (jenis === 'bottomGrid_add') {
            setDariBatch(true);
            // args.cancel = true;

            const grid = dgTrxBankDetailRef.current;

            const rowsx = grid.getBatchChanges();

            if (rowsx.addedRecords.length <= 0) {
                const lastRow = grid.dataSource[grid.dataSource.length - 1];
                const newId = lastRow ? lastRow.id_transaksi + 1 : 1; // ID baru berdasarkan ID terakhir

                const newRecord = {
                    kode_transaksi: dgTrxBankDetailRef.current.dataSource[0]?.kode_transaksi,
                    id_transaksi: newId,
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
                };
                (grid as GridComponent).addRecord(newRecord);
            } else {
                const hasEmptyFields = rowsx.addedRecords instanceof Array ? rowsx.addedRecords.some((row: { nama_vendor: string }) => row.nama_vendor === '') : false;

                if (hasEmptyFields) {
                    myAlertGlobal2('Silahkan melengkapi data sebelum menambah data baru', 'jurnalBank');
                } else {
                    const lastRowGrid = grid.dataSource[grid.dataSource.length - 1];
                    // const lastRowBatch = rowsx.addedRecords.length + 1;
                    const lastRowBatch = rowsx.addedRecords.length + 1;

                    const newId = lastRowGrid.id_transaksi + lastRowBatch;

                    // const newId = lastRow ? lastRow.id_transaksi + 1 : 1; // ID baru berdasarkan ID terakhir

                    const newRecord = {
                        kode_transaksi: dgTrxBankDetailRef.current.dataSource[0]?.kode_transaksi,
                        id_transaksi: newId,
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
                    };
                    (grid as GridComponent).addRecord(newRecord);
                    // const newData = [...dgTrxBankDetailRef.current, { id: dgTrxBankDetailRef.current.length + 1, name: '', age: '' }];
                    // setGridData(newData);
                    // dgTrxBankDetailRef.current.dataSource = newData;
                }
            }

            // }
        } else if (jenis === 'bottomGrid_delete') {
        } else if (jenis === 'bottomGrid_cancel') {
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

    const adjustGridHeight = () => {
        if (dgTrxBankRef.current) {
            const panel = document.querySelector('.p-splitter-panel'); // Ambil panel utama

            if (panel) {
                const availableHeight = panel.clientHeight;
                // const newHeight = availableHeight * 0.5; // Kurangi 20px untuk memberikan ruang
                const newHeight = panel.clientHeight - 120; // Kurangi 20px untuk memberikan ruang
                console.log('newHeight atas', newHeight);

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
                console.log('newHeight bawah', newHeight);
                const newHeight2 = newHeight + 60;
                console.log('newHeight2 bawah', newHeight2);

                setGridHeightBottom(newHeight2 + 'px');
                dgTrxBankDetailRef.current.refresh();
            }
        }
    };
    return (
        <div className="relative">
            <DialogComponent
                id="jurnalBank"
                isModal={true}
                width="95%"
                height="85%"
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
                                    {/* {stateDokumen.masterDataState === 'BARU' ? `Transaksi Bank ${stateDokumen.masterNamaBank} - ${stateDokumen.masterTransaksiKe}` : `${stateDokumen.masterNamaBank}`} */}
                                    {`Jurnal Transaksi Bank ${stateDokumen.masterNamaBank} - ${stateDokumen.masterTransaksiKe}`}
                                </span>
                            </div>
                        </div>
                    );
                }}
            >
                <div style={{ height: '100%', width: '100%' }}>
                    <div className="mb-2 flex items-center justify-end gap-3">
                        <div className="flex items-center justify-center gap-3">
                            <label className="block text-sm font-medium">Tanggal Transaksi</label>
                            <div className="text-smt rounded border bg-white px-1">
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
                                    // value={stateDokumen?.masterDataState === 'BARU' ? moment().format('DD-MM-YYYY') : headerState?.tgl_transaksi}
                                    // value={moment(headerState?.tgl_transaksi).format('DD-MM-YYYY')}
                                    change={(args: ChangeEventArgsCalendar) => {
                                        handleInputChange('tgl_transaksi', args.value, 'chbTanggal', setHeaderState);
                                    }}
                                >
                                    <Inject services={[MaskedDateTime]} />
                                </DatePickerComponent>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                            <label className="block text-sm font-medium">No. Transaksi</label>
                            <input type="text" value={headerState?.no_transaksi} className="rounded border p-1 text-sm" readOnly />
                        </div>
                    </div>

                    {/* <div style={{ height: '100%', width: '100%' }}> */}
                    <Splitter style={{ height: '100vh' }} layout="vertical" onResizeEnd={adjustGridHeight}>
                        {/* <Splitter layout="vertical"> */}
                        {/* <SplitterPanel size={50} className="align-items-center justify-content-center flex-grow-1" style={{ overflow: 'auto', flex: 1 }}> */}
                        <SplitterPanel size={70} minSize={30} className="align-items-center justify-content-center flex-grow-1" style={{ overflow: 'auto', flex: 1, height: '100%' }}>
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
                                        // height={'300px'}
                                        frozenRows={0}
                                        rowHeight={20}
                                        height={gridHeight}
                                        gridLines="Both"
                                        allowResizing={true}
                                        actionComplete={(args: any) => {
                                            actionCompleteGridDetail(args, 'quDtrxBank');
                                        }}
                                        enableHover={false}
                                        // created={createdTopGrid}
                                        // toolbar={toolbarOptions}
                                        // toolbarClick={toolbarClick}
                                        rowSelecting={rowSelectingGridDetail}
                                        editSettings={{
                                            allowAdding: true,
                                            allowEditing: true,
                                            allowDeleting: true,
                                            newRowPosition: 'Bottom',
                                            mode: 'Normal',
                                            // mode: 'Batch',
                                            showConfirmDialog: false,
                                        }}
                                        autoFit={true}
                                        // recordDoubleClick={(args) => {
                                        //     // setSelectedRowIndexTop(args.rowIndex);
                                        //     setTambahTop(false);
                                        //     setEditTop(true);
                                        // }}
                                        aggregates={[
                                            {
                                                columns: [
                                                    {
                                                        type: 'Sum',
                                                        field: 'nominal1',
                                                        format: 'N0',
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                    },
                                                    {
                                                        type: 'Sum',
                                                        field: 'nominal2',
                                                        format: 'N0',
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                    },
                                                    {
                                                        type: 'Sum',
                                                        field: 'nominal3',
                                                        format: 'N0',
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                    },
                                                    {
                                                        type: 'Sum',
                                                        field: 'nominal4',
                                                        format: 'N0',
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                    },
                                                    {
                                                        type: 'Sum',
                                                        field: 'nominal5',
                                                        format: 'N0',
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                    },
                                                ],
                                            },
                                        ]}
                                    >
                                        <ColumnsDirective>
                                            {/* <ColumnDirective field="kode_transaksi" headerText="Kode Trx" width={100} textAlign="Left" headerTextAlign="Center" />
                                            <ColumnDirective field="id_transaksi" isPrimaryKey={true} headerText="ID" width={100} headerTextAlign="Center" /> */}

                                            <ColumnDirective field="entitas" allowEditing={false} headerText="Entitas" width={40} headerTextAlign="Center" />
                                            <ColumnDirective field="no_rekening" allowEditing={false} headerText="No. Rekening" width={100} headerTextAlign="Center" />
                                            <ColumnDirective
                                                field="nama_rekening"
                                                allowEditing={false}
                                                headerText="Atas Nama"
                                                width={200}
                                                headerTextAlign="Center"
                                                editTemplate={templateNamaRekening}
                                            />

                                            <ColumnDirective
                                                field="nominal1"
                                                // editType="numericedit"
                                                // edit={nominalRealEdit}
                                                headerText="Nominal 1"
                                                width={125}
                                                format="N2"
                                                textAlign="Right"
                                                headerTextAlign="Center"
                                                allowEditing={false}
                                            />

                                            <ColumnDirective
                                                field="nominal2"
                                                // editType="numericedit"
                                                // edit={nominalRealEdit}
                                                headerText="Nominal 2"
                                                width={125}
                                                format="N2"
                                                textAlign="Right"
                                                headerTextAlign="Center"
                                                allowEditing={false}
                                            />
                                            <ColumnDirective
                                                field="nominal3"
                                                // editType="numericedit"
                                                // edit={nominalRealEdit}
                                                headerText="Nominal 3"
                                                width={125}
                                                format="N2"
                                                textAlign="Right"
                                                headerTextAlign="Center"
                                                allowEditing={false}
                                            />
                                            <ColumnDirective
                                                field="nominal4"
                                                // editType="numericedit"
                                                // edit={nominalRealEdit}
                                                headerText="Nominal 4"
                                                width={125}
                                                format="N2"
                                                textAlign="Right"
                                                headerTextAlign="Center"
                                                allowEditing={false}
                                            />
                                            <ColumnDirective
                                                field="nominal5"
                                                // editType="numericedit"
                                                // edit={nominalRealEdit}
                                                headerText="Nominal 5"
                                                width={125}
                                                format="N2"
                                                textAlign="Right"
                                                headerTextAlign="Center"
                                                allowEditing={false}
                                            />
                                            <ColumnDirective
                                                columns={[
                                                    {
                                                        field: 'jurnal_ho',
                                                        headerText: 'Jurnal HO',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 60,
                                                        // edit: stringParams,
                                                        // template: bank1Template,
                                                    },
                                                    {
                                                        field: 'jurnal_cabang',
                                                        headerText: 'Jurnal Cabang',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 60,
                                                        // edit: stringParams,
                                                        // template: rekening1Template,
                                                    },
                                                    {
                                                        field: 'keterangan_jurnal',
                                                        headerText: 'Keterangan Jurnal',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 500,
                                                        // edit: stringParams,
                                                        // template: rekening1Template,
                                                    },
                                                ]}
                                                headerText="Jurnal"
                                                headerTemplate={headerTemplateJurnal}
                                                textAlign="Center"
                                            />
                                            {/* <ColumnDirective field="keterangan_jurnal" textAlign="Left" headerText="Keterangan Jurnal" width={500} headerTextAlign="Center" /> */}
                                        </ColumnsDirective>
                                        <Inject services={[Page, Selection, Edit, CommandColumn, Toolbar, Resize]} />
                                    </GridComponent>
                                    {/* </div> */}
                                    {/* <div style={{ padding: 2 }} className="panel-pager mb-10">
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
                                            />
                                        </TooltipComponent>
                                    </div>
                                </div> */}
                                </div>
                            </div>
                        </SplitterPanel>
                        {/* <SplitterPanel className="align-items-center justify-content-center h-[400px] flex-grow-0" style={{ overflow: 'auto', flex: 1 }}> */}
                        {/* <div className="h-full w-full p-2"> */}
                        {/* <SplitterPanel className="align-items-center justify-content-center flex-grow-0" style={{ overflow: 'auto', flex: 1 }}> */}
                        <SplitterPanel size={70} className="align-items-center justify-content-center " style={{ overflow: 'auto', flex: 1 }}>
                            {/* <div className="w-full p-2"> */}
                            <div className="splitter-container">
                                <div className="grid-wrapper">
                                    <GridComponent
                                        id="bottomGrid"
                                        locale="id"
                                        ref={(g: any) => {
                                            dgTrxBankDetailRef.current = g;
                                        }}
                                        textWrapSettings={{ wrapMode: 'Header' }}
                                        // selectionSettings={{ mode: 'Row', type: 'Multiple' }}
                                        allowTextWrap={true}
                                        allowSorting={true}
                                        // height={'400px'}
                                        // height={'auto'}
                                        frozenRows={0}
                                        rowHeight={20}
                                        height={gridHeightBottom}
                                        gridLines="Both"
                                        allowResizing={true}
                                        actionComplete={(args: any) => {
                                            actionCompleteGridDetail(args, 'quDtrxBankDetail');
                                        }}
                                        autoFit={true}
                                        // toolbar={toolbarOptions}
                                        // toolbarClick={toolbarClick}
                                        // cellSaved={save}
                                        // cellEdit={cellEdit}
                                        rowSelecting={rowSelectingGridDetail}
                                        editSettings={{
                                            allowAdding: true,
                                            allowEditing: true,
                                            allowDeleting: true,
                                            newRowPosition: 'Bottom',
                                            mode: 'Normal',
                                            // mode: 'Batch',
                                            showConfirmDialog: false,
                                        }}
                                        // queryCellInfo={queryCellInfoListData}
                                        recordDoubleClick={(args) => {
                                            setTambahBottom(false);
                                            setEditBottom(true);
                                        }}
                                        rowSelected={async (args: any) => {
                                            setNamaVendor(args.data.nama_vendor);
                                        }}
                                        aggregates={[
                                            {
                                                columns: [
                                                    {
                                                        type: 'Sum',
                                                        field: 'nominal_bayar',
                                                        format: 'N0',
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                    },
                                                    {
                                                        type: 'Sum',
                                                        field: 'nominal_sisa',
                                                        format: 'N0',
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                    },
                                                    {
                                                        type: 'Sum',
                                                        field: 'nominal1',
                                                        format: 'N0',
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                    },
                                                    {
                                                        type: 'Sum',
                                                        field: 'nominal2',
                                                        format: 'N0',
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                    },
                                                    {
                                                        type: 'Sum',
                                                        field: 'nominal3',
                                                        format: 'N0',
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                    },
                                                    {
                                                        type: 'Sum',
                                                        field: 'nominal4',
                                                        format: 'N0',
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                    },
                                                    {
                                                        type: 'Sum',
                                                        field: 'nominal5',
                                                        format: 'N0',
                                                        footerTemplate: (props: any) => footerTemplateWithCondition(props, gnominalBayar, gnominalReady),
                                                    },
                                                ],
                                            },
                                        ]}
                                        // batchChange={onBatchChange}
                                    >
                                        <ColumnsDirective>
                                            {/* <ColumnDirective field="kode_transaksi" headerText="Kode Trx" width={100} textAlign="Left" headerTextAlign="Center" />
                                            <ColumnDirective field="id_transaksi" headerText="ID" width={100} textAlign="Left" headerTextAlign="Center" /> */}
                                            <ColumnDirective field="entitas" allowEditing={false} headerText="Entitas" width={40} textAlign="Left" headerTextAlign="Center" />
                                            <ColumnDirective
                                                field="sumber"
                                                headerText="Sumber"
                                                width={60}
                                                // editTemplate={templateSumber}
                                                edit={sumberParams}
                                                editType="dropdownedit"
                                                textAlign="Left"
                                                headerTextAlign="Center"
                                                allowEditing={false}
                                            />

                                            <ColumnDirective field="no_dokumen_sumber" headerText="No. Dokumen" width={125} textAlign="Center" headerTextAlign="Center" allowEditing={false} />
                                            <ColumnDirective field="nama_vendor" headerText="Nama Vendor / Supplier" width={200} headerTextAlign="Center" allowEditing={false} />
                                            <ColumnDirective field="deskripsi" headerText="Keterangan" width={200} textAlign="Left" headerTextAlign="Center" />
                                            <ColumnDirective
                                                field="nominal_bayar"
                                                editType="numericedit"
                                                // edit={nominalBayarEdit}
                                                headerText="Nominal Bayar"
                                                width={125}
                                                format="N2"
                                                textAlign="Right"
                                                headerTextAlign="Center"
                                                allowEditing={false}
                                            />
                                            <ColumnDirective field="nominal_sisa" headerText="Nominal Sisa" width={125} format="N2" textAlign="Right" headerTextAlign="Center" allowEditing={false} />
                                            <ColumnDirective
                                                columns={[
                                                    {
                                                        field: 'jurnal_ho',
                                                        headerText: 'Jurnal HO',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 60,
                                                        // template: bank1Template,
                                                    },
                                                    {
                                                        field: 'jurnal_cabang',
                                                        headerText: 'Jurnal Cabang',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 60,
                                                        // template: rekening1Template,
                                                    },

                                                    {
                                                        field: 'keterangan_jurnal',
                                                        headerText: 'Keterangan Jurnal',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Left',
                                                        format: 'N0',
                                                        width: 500,
                                                        // edit: nominal1Edit,
                                                        // edit: nominalBranchBawahEdit,
                                                    },
                                                ]}
                                                headerText="Jurnal"
                                                headerTemplate={headerTemplateJurnal}
                                                textAlign="Center"
                                                // edit={namaBank1}
                                                // editTemplate={tombolDetailDlgDaftar}
                                            />
                                            <ColumnDirective
                                                columns={[
                                                    {
                                                        field: 'nama_bank1',
                                                        headerText: 'Nama Bank',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 80,
                                                        // template: bank1Template,
                                                    },
                                                    {
                                                        field: 'nama_rekening1',
                                                        headerText: 'Nama Rekening',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 180,
                                                        // template: rekening1Template,
                                                    },
                                                    {
                                                        field: 'no_rekening1',
                                                        headerText: 'No. Rekening',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 130,
                                                        // template: noRekening1Template,
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
                                                    },
                                                    {
                                                        field: 'nama_rekening2',
                                                        headerText: 'Nama Rekening',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 180,
                                                        // template: rekening2Template,
                                                    },
                                                    {
                                                        field: 'no_rekening2',
                                                        headerText: 'No. Rekening',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 130,
                                                        // template: noRekening2Template,
                                                    },
                                                    {
                                                        field: 'nominal2',
                                                        headerText: 'Nominal 2',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Right',
                                                        format: 'N0',
                                                        width: 120,
                                                        // edit: nominalBranchBawahEdit,
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
                                                        // template: bank3Template,
                                                    },
                                                    {
                                                        field: 'nama_rekening3',
                                                        headerText: 'Nama Rekening',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 180,
                                                        // template: rekening3Template,
                                                    },
                                                    {
                                                        field: 'no_rekening3',
                                                        headerText: 'No. Rekening',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 130,
                                                        // template: noRekening3Template,
                                                    },
                                                    {
                                                        field: 'nominal3',
                                                        headerText: 'Nominal 3',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Right',
                                                        format: 'N0',
                                                        width: 120,
                                                        // edit: nominalBranchBawahEdit,
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
                                                        // template: bank4Template,
                                                    },
                                                    {
                                                        field: 'nama_rekening4',
                                                        headerText: 'Nama Rekening',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 180,
                                                        // template: rekening4Template,
                                                    },
                                                    {
                                                        field: 'no_rekening4',
                                                        headerText: 'No. Rekening',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 130,
                                                        // template: noRekening4Template,
                                                    },
                                                    {
                                                        field: 'nominal4',
                                                        headerText: 'Nominal 4',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Right',
                                                        format: 'N0',
                                                        width: 120,
                                                        // edit: nominalBranchBawahEdit,
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
                                                        // template: bank5Template,
                                                    },
                                                    {
                                                        field: 'nama_rekening5',
                                                        headerText: 'Nama Rekening',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 180,
                                                        // template: rekening5Template,
                                                    },
                                                    {
                                                        field: 'no_rekening5',
                                                        headerText: 'No. Rekening',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Center',
                                                        width: 130,
                                                        // template: noRekening5Template,
                                                    },
                                                    {
                                                        field: 'nominal5',
                                                        headerText: 'Nominal 5',
                                                        headerTextAlign: 'Center',
                                                        textAlign: 'Right',
                                                        format: 'N0',
                                                        width: 120,
                                                        // edit: nominalBranchBawahEdit,
                                                    },
                                                ]}
                                                headerText="E-Branch 5"
                                                headerTemplate={headerTemplateBranch5}
                                                textAlign="Center"
                                            />
                                        </ColumnsDirective>
                                        <Inject services={[Page, Selection, Sort, CommandColumn, Toolbar, Filter, Resize, Edit]} />
                                    </GridComponent>
                                    {/* <div style={{ padding: 2 }} className="panel-pager mb-10">
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
                                                />
                                            </TooltipComponent>
                                        </div>
                                    </div> */}
                                    {/* </div> */}
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
                                        // try {
                                        //     dgTrxBankRef.current.endEdit();
                                        //     dgTrxBankDetailRef.current.endEdit();

                                        //     // await save('all');
                                        //     const allEmptyJurnalAtas = dgTrxBankRef.current.dataSource.every((item: any) => !item.jurnal_ho && !item.jurnal_cabang);
                                        //     const allEmptyJurnalBawah = dgTrxBankDetailRef.current.dataSource.every((item: any) => !item.jurnal_ho && !item.jurnal_cabang);

                                        //     if (allEmptyJurnalAtas) {
                                        //         myAlertGlobal2(`Detail / Data jurnal atas belum di isi `, 'jurnalBank');
                                        //         console.log('Semua jurnal_ho dan jurnal_cabang kosong! Proses dihentikan.');
                                        //         return; // Hentikan proses
                                        //     }

                                        //     if (allEmptyJurnalBawah) {
                                        //         myAlertGlobal2(`Detail / Data jurnal bawah belum di isi `, 'jurnalBank');
                                        //         console.log('Semua jurnal_ho dan jurnal_cabang kosong! Proses dihentikan.');
                                        //         return; // Hentikan proses
                                        //     }

                                        //     // Lanjutkan proses jika tidak semuanya kosong
                                        //     console.log('Lanjutkan proses...');
                                        // } finally {
                                        //     //
                                        // }

                                        try {
                                            await recalc('');
                                            await save('all');
                                        } finally {
                                            await saveDoc();
                                        }
                                    }}
                                />
                                {/* <ButtonComponent
                                        id="buSimpanDokumen1"
                                        content="TESSSSS"
                                        cssClass="e-primary e-small"
                                        iconCss="e-icons e-small e-save"
                                        style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                                        onClick={async (args: any) => {
                                            // console.log('gnominalReady ', gnominalReady);
                                            // console.log('gnominalBayar ', gnominalBayar);
                                            // // recalc('');
                                            // console.log('dgTrxBankRef ', dgTrxBankRef.current.dataSource);
                                            // console.log('dgTrxBankDetailRef ', dgTrxBankDetailRef.current.dataSource);

                                            console.log('stateDokumen', stateDokumen);
                                        }}
                                        // disabled={stateDokumen.statusJurnal === 'Y' ? true : false}
                                    /> */}
                            </div>
                        </div>
                    </div>
                    {/* </div> */}
                </div>
                {isLoadingProgress && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="rounded-lg bg-white p-6 shadow-lg">
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
                        onHide={() => setShowDaftarBank(false)}
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

export default JurnalBank;
