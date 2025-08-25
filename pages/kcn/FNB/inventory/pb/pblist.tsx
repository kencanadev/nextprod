import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faMagnifyingGlass, faPlay, faSquareCaretDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import 'tippy.js/dist/tippy.css';
import stylesIndex from '@styles/index.module.css';
import Dropdown from '../../../../../components/Dropdown';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import styles from './spplist.module.css';
import sortBy from 'lodash/sortBy';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import swal from 'sweetalert2';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/id';
import { MenuEventArgs } from '@syncfusion/ej2-react-splitbuttons';
import { Tooltip, TooltipComponent } from '@syncfusion/ej2-react-popups';
import PilihBaruModal from './modal/pilihbaru';
import { showLoading, usersMenu } from '@/utils/routines';
import Draggable from 'react-draggable';
import Swal from 'sweetalert2';
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
    Freeze,
    ExcelExport,
    PdfExport,
} from '@syncfusion/ej2-react-grids';
import { useState, useEffect } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { SidebarComponent, SidebarType, ContextMenuComponent, MenuItemModel, TabComponent } from '@syncfusion/ej2-react-navigations';
import { useSession } from '@/pages/api/sessionContext';
import withReactContent from 'sweetalert2-react-content';
import { Internationalization, loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import idIDLocalization from 'public/syncfusion/locale.json';
import { ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent, FocusInEventArgs } from '@syncfusion/ej2-react-inputs';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown } from '@syncfusion/ej2-react-dropdowns';
import { ButtonComponent, RadioButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json';
import * as React from 'react';
import { FaCross } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
L10n.load(idIDLocalization);
let gridListData: Grid;
let gridListDataPra: Grid | any;
let tooltipListData: Tooltip | any;
// let tabTtbList: TabComponent | any;

// interface PBListProps {
//     userid: any;
//     kode_entitas: any;
// }

interface QueryParams {
    [key: string]: string;
}

const tabKlasifikasiArray = ['baru', 'approved'];

const PenerimaanBarangList = () => {
    let decodedData: string = '';
    let routeKodePBValue: any,
        routeTipeDokumen: any,
        routeTglAwal: any,
        routeTglAkhir: any,
        routeTglSjSuppAwal: any,
        routeTglSjSuppAkhir: any,
        routeEditValue: any,
        routeKontrakValue: any,
        routeNoPBValue: any,
        routeNoSJValue: any,
        routeSupplierValue: any,
        routeSelectedGudang: any,
        routeNamaBarangValue: any,
        routeSelectedStatus: any,
        routeSelectedOptionRadio: any,
        routeFilePendukungValue: any;
    const router = useRouter();

    const { str } = router.query;

    if (typeof str === 'string') {
        decodedData = Buffer.from(str, 'base64').toString('ascii');

        const queryParams = decodedData.split('&').reduce((acc: QueryParams, keyValue) => {
            const [key, value] = keyValue.split('=');
            acc[key] = value;
            return acc;
        }, {} as QueryParams);

        const { kode_lpb, edit, kontrak, updatefilependukung, tglAwal, tglAkhir, tglSjSuppAwal, tglSjSuppAkhir, vTipeDokumen, vNoPB, vNoSJ, vSupp, vKodeGudang, vNamaBarang, vStatus, vPbKontrak } =
            queryParams;
        // routeKodePBValue = kode_lpb;
        // routeEditValue = edit;
        // routeKontrakValue = kontrak;

        console.log('qqqqqqqqqqqqqqqqqq = ', vNoPB, vNoSJ, vSupp);

        routeTglAwal = tglAwal;
        routeTglAkhir = tglAkhir;
        routeTglSjSuppAwal = tglSjSuppAwal;
        routeTglSjSuppAkhir = tglSjSuppAkhir;
        routeTipeDokumen = vTipeDokumen;
        routeNoPBValue = vNoPB;
        routeNoSJValue = vNoSJ;
        routeSupplierValue = vSupp;
        routeSelectedGudang = vKodeGudang;
        routeNamaBarangValue = vNamaBarang;
        routeSelectedStatus = vStatus;
        routeSelectedOptionRadio = vPbKontrak;
        // setDate1(moment(tglAwal));
        // setDate2(moment(tglAkhir));
        // routeFilePendukungValue = updatefilependukung;
    }

    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';

    //select baris
    const [selectedRow, setSelectedRow] = useState('');
    const [selectedRowPersediaan, setSelectedRowPersediaan] = useState('');
    const [tabAktif, setTabAktif] = useState('baru');
    const [selectedKontrak, setSelectedKontrak] = useState('');
    const [jenisList, setJenisList] = useState('');
    const [statusList, setStatus] = useState('');
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalRecords2, setTotalRecords2] = useState(0);
    const [allRecords, setAllRecords] = useState<PBListItem[]>([]);
    const [allRecordsPra, setAllRecordsPra] = useState<PBListItem[]>([]);

    //modal
    const [baru, setBaru] = useState(false);
    const [modalApproval, setModalApproval] = useState(false);
    // modal
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [modalPosition, setModalPosition] = useState({ top: '15%', left: '10%' });
    const [baruSelected, setbaruSelected] = useState();

    // fetchdetail
    const [headerFetch, setHeaderFetch] = useState<any>([]);
    const [detailFetch, setDetailFetch] = useState<any>([]);

    //checkbox filter
    const [noPBValue, setNoPBValue] = useState<string>(routeNoPBValue === undefined ? '' : routeNoPBValue);
    const [noSJValue, setNoSJValue] = useState<string>(routeNoSJValue === undefined ? '' : routeNoSJValue);
    const [SupplierValue, setSupplierValue] = useState<string>(routeSupplierValue === undefined ? '' : routeSupplierValue);
    const [NamaBarangValue, setNamaBarangValue] = useState(routeNamaBarangValue === undefined ? '' : routeNamaBarangValue);
    const [isNoPBChecked, setIsNoPBChecked] = useState<boolean>(routeNoPBValue === undefined || routeNoPBValue === '' || routeNoPBValue === null ? false : true);
    const [isNoSJChecked, setIsNoSJChecked] = useState<boolean>(routeNoSJValue === undefined || routeNoSJValue === '' || routeNoSJValue === null ? false : true);
    const [isSupplierChecked, setIsSupplierChecked] = useState<boolean>(routeSupplierValue === undefined || routeSupplierValue === '' || routeSupplierValue === null ? false : true);

    const [date1, setDate1] = useState<moment.Moment>(routeTglAwal === undefined ? moment() : moment(routeTglAwal));
    const [date2, setDate2] = useState<moment.Moment>(routeTglAkhir === undefined ? moment().endOf('month') : moment(routeTglAkhir));
    const [isTanggalChecked, setIsTanggalChecked] = useState<boolean>(true);
    const [date3, setDate3] = useState<moment.Moment>(routeTglSjSuppAwal === undefined ? moment() : moment(routeTglSjSuppAwal));
    const [date4, setDate4] = useState<moment.Moment>(routeTglSjSuppAkhir === undefined ? moment().endOf('month') : moment(routeTglSjSuppAkhir));
    const [isTanggalSJChecked, setIsTanggalSJChecked] = useState<boolean>(false);
    const [selectedOptionRadio, setSelectedOptionRadio] = useState(routeSelectedOptionRadio === undefined ? 'all' : routeSelectedOptionRadio);

    const [listGudang, setListGudang] = useState([]);
    const [selectedGudang, setSelectedGudang] = useState(routeSelectedGudang === undefined ? '' : routeSelectedGudang);
    const [isGudangChecked, setIsGudangChecked] = useState(routeSelectedGudang === undefined || routeSelectedGudang === '' || routeSelectedGudang === null ? false : true);
    const [isNamaBarangChecked, setIsNamaBarangChecked] = useState(routeNamaBarangValue === undefined || routeNamaBarangValue === '' || routeNamaBarangValue === null ? false : true);
    const [selectedStatus, setSelectedStatus] = useState(routeSelectedStatus === undefined ? '' : routeSelectedStatus);
    const [isStatusChecked, setIsStatusChecked] = useState(routeSelectedStatus === undefined || routeSelectedStatus === '' || routeSelectedStatus === null ? false : true);
    const [selectedDetail, setSelectedDetail] = useState<any>('');
    const [userMenu, setUserMenu] = useState<UserMenuState>({ baru: '', edit: '', hapus: '', cetak: '' });
    //pencarian
    const [searchnopp, setsearchnopp] = useState('');
    const [searchketerangan, setsearchketerangan] = useState('');

    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [showLoader, setShowLoader] = useState(true);
    const [selectedTipeDokumenValue, setSelectedTipeDokumenValue] = useState<string | null>(routeTipeDokumen === undefined ? 'yes' : routeTipeDokumen);

    // end

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!selectedRow || !kode_entitas) {
                    return;
                } // Handle condition inside the effect

                let responseDetail;
                if (jenisList === 'approved') {
                    responseDetail = await axios.get(`${apiUrl}/erp/detail_approved_pb?entitas=${kode_entitas}&param1=${selectedRow}`);
                } else {
                    responseDetail = await axios.get(`${apiUrl}/erp/app_detail_prapb?entitas=${kode_entitas}&param1=${selectedRow}`);
                }

                setDetailFetch(responseDetail.data.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [kode_entitas, selectedRow, jenisList]);

    useEffect(() => {
        const fetchDataUseEffect = async () => {
            setShowLoader(true); // Show loader while fetching data

            // Setting user menu based on userid
            if (userid !== 'administrator') {
                try {
                    const result = await usersMenu(kode_entitas, userid, kode_menu);
                    const { baru, edit, hapus, cetak } = result;

                    setUserMenu({
                        baru: baru,
                        edit: edit,
                        hapus: hapus,
                        cetak: cetak,
                    });
                } catch (error) {
                    console.error('Error fetching user menu:', error);
                }
            } else {
                setUserMenu({
                    baru: 'Y',
                    edit: 'Y',
                    hapus: 'Y',
                    cetak: 'Y',
                });
            }

            try {
                // Initialize parameters for API requests
                const params = {
                    entitas: kode_entitas,
                    param1: isNoPBChecked ? noPBValue : 'all',
                    param2: isNoSJChecked ? noSJValue : 'all',
                    param3: isTanggalChecked ? moment(date1).format('YYYY-MM-DD') : 'all',
                    param4: isTanggalChecked ? moment(date2).format('YYYY-MM-DD') : 'all',
                    param5: 'all',
                    param6: 'all',
                    param7: isSupplierChecked ? SupplierValue : 'all',
                    param8: isGudangChecked ? selectedGudang : 'all',
                    param9: isNamaBarangChecked ? NamaBarangValue : 'all',
                    param10: isStatusChecked ? selectedStatus : 'all',
                    param11: selectedOptionRadio === 'all' ? 'all' : selectedOptionRadio === 'Y' ? 'Y' : 'N',
                    param12: selectedTipeDokumenValue === 'tipeAll' ? 'all' : selectedTipeDokumenValue === 'yes' ? 'Y' : 'N',
                };

                // Set additional parameters based on checked states
                if (isNoPBChecked) {
                    params.param1 = `${noPBValue}`;
                }
                if (isNoSJChecked) {
                    params.param2 = `${noSJValue}`;
                }

                // Fetching data from two endpoints
                // const response = await axios.get(`${apiUrl}/erp/list_pb`, { params: params });
                // const response2 = await axios.get(`${apiUrl}/erp/list_pra_pb`, { params: params });
                console.log('params 12= ', params);
                const response = await axios.get(`${apiUrl}/erp/list_pb_filter`, { params: params });
                const response2 = await axios.get(`${apiUrl}/erp/list_pra_pbFilter`, { params: params });

                // Transform the fetched data
                const transformedData = response.data.data.map((item: any) => ({
                    kode_lpb: item.kode_lpb,
                    no_lpb: item.no_lpb,
                    tgl_lpb: moment(item.tgl_lpb).format('DD-MM-YYYY'),
                    no_reff: item.no_reff,
                    peminta: item.peminta,
                    kode_dept: item.kode_dept,
                    nama_relasi: item.nama_relasi,
                    nama_gudang: item.nama_gudang,
                    userid: item.userid,
                    tgl_update: item.tgl_update,
                    approval: item.approval,
                    tgl_approval: item.tgl_approval,
                    fdo: item.fdo,
                    produksi: item.produksi,
                    tgl_sj: moment(item.tgl_sj).format('DD-MM-YYYY'),
                    dokumen: item.dokumen,
                    status_batal: item.status_batal,
                    via: item.via,
                    nopol: item.nopol,
                    pengemudi: item.pengemudi,
                    status: item.status,
                    status_dok: item.status_dok,
                    kontrak: item.kontrak,
                    persediaan: item.persediaan === 'Y' ? 'Persediaan' : 'Non Persediaan',
                }));

                const transformedData2 = response2.data.data.map((item: any) => ({
                    kode_lpb: item.kode_lpb,
                    no_lpb: item.no_lpb,
                    tgl_lpb: moment(item.tgl_lpb).format('DD-MM-YYYY'),
                    no_reff: item.no_reff,
                    peminta: item.peminta,
                    kode_dept: item.kode_dept,
                    nama_relasi: item.nama_relasi,
                    nama_gudang: item.nama_gudang,
                    userid: item.userid,
                    tgl_update: item.tgl_update,
                    approval: item.approval,
                    tgl_approval: item.tgl_approval,
                    fdo: item.fdo,
                    produksi: item.produksi,
                    tgl_sj: moment(item.tgl_sj).format('DD-MM-YYYY'),
                    dokumen: item.dokumen,
                    status_batal: item.status_batal,
                    via: item.via,
                    nopol: item.nopol,
                    pengemudi: item.pengemudi,
                    status: item.status,
                    status_dok: item.status_dok,
                    kontrak: item.kontrak,
                    persediaan: item.persediaan === 'Y' ? 'Persediaan' : 'Non Persediaan',
                }));

                // Update the grid data
                gridListData.dataSource = transformedData;
                gridListDataPra.dataSource = transformedData2;
                setTotalRecords(transformedData.length);
                setTotalRecords2(transformedData2.length);

                // Fetching warehouse list for filtering
                const responseListGudang = await axios.get(`${apiUrl}/erp/list_gudang_forfilter`, {
                    params: {
                        entitas: kode_entitas,
                        param1: 'ADMIN', // Assuming ADMIN is a placeholder
                    },
                });

                const responseGudang = responseListGudang.data.data;
                setListGudang(responseGudang);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setShowLoader(false); // Hide loader after fetching
                swal.close(); // Close any open SweetAlert
            }
        };

        fetchDataUseEffect(); // Call the fetch function
    }, [kode_entitas, userid]); // Dependencies that trigger the effect

    if (isLoading) {
        return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    interface UserMenuState {
        baru: any;
        edit: any;
        hapus: any;
        cetak: any;
    }

    const kode_menu = '40100'; // kode menu PB

    //==========  Popup menu untuk header grid List Data ===========
    const swalToast = swal.mixin({
        toast: true,
        position: 'center',
        customClass: {
            popup: 'colored-toast',
        },
        showConfirmButton: false,
        timer: 3500,
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

    const templatePO = () => {
        return (
            <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 11, textAlign: 'center' }}>PO</span>
            </div>
        );
    };

    const templateColumnPO: any = [
        {
            field: 'sat_sp',
            headerText: 'Satuan',
            width: 80,
            minWidth: 10,
            textAlign: 'left',
            headerTextAlign: 'center',
        },
        {
            field: 'qty_po',
            headerText: 'Kuantitas',
            width: 80,
            minWidth: 10,
            textAlign: 'right',
            headerTextAlign: 'center',
            format: 'N2',
        },
    ];

    const templateSJ = () => {
        return (
            <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 11, textAlign: 'center' }}>SJ Supplier</span>
            </div>
        );
    };

    const templateColumnSJ: any = [
        {
            field: 'sat_sj',
            headerText: 'Satuan',
            width: 80,
            minWidth: 10,
            textAlign: 'left',
            headerTextAlign: 'center',
        },
        {
            field: 'qty_sj',
            headerText: 'Kuantitas',
            width: 80,
            minWidth: 10,
            textAlign: 'right',
            headerTextAlign: 'center',
            format: 'N2',
        },
    ];

    const templatePB = () => {
        return (
            <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 11, textAlign: 'center' }}>PB</span>
            </div>
        );
    };

    const templateColumnPB: any = [
        {
            field: 'satuan',
            headerText: 'Satuan',
            width: 40,
            minWidth: 10,
            textAlign: 'left',
            headerTextAlign: 'center',
        },
        {
            field: 'qty',
            headerText: 'Kuantitas',
            width: 40,
            minWidth: 10,
            textAlign: 'right',
            headerTextAlign: 'center',
            format: 'N2',
        },
    ];

    const myAlert = (text: any) => {
        withReactContent(swalToast).fire({
            icon: 'warning',
            title: `<p style="font-size:12px">${text}</p>`,
            width: '100%',
            target: '#dialogMBList',
        });
    };
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

    const menuHeaderSelect = (args: MenuEventArgs) => {
        if (!args || !args.item) {
            return;
        }
        const { text } = args.item;
        if (text === 'Cetak ke printer') {
            gridListData.print();
        } else if (text === 'PDF') {
            gridListData.showSpinner();
            gridListData.pdfExport();
        } else if (text === 'XLSX') {
            gridListData.showSpinner();
            gridListData.excelExport();
        } else if (text === 'CSV') {
            gridListData.showSpinner();
            gridListData.csvExport();
        } else {
            console.log('Unhandled menu item:', text);
        }
    };
    const ExportComplete = (): void => {
        gridListData.hideSpinner();
    };
    //=============================================================

    type PBListItem = {
        kode_lpb: string;
        no_lpb: any;
        tgl_lpb: any;
        tgl_sj: any;
        no_reff: any;
        dokumen: any;
        kode_gudang: any;
        kode_supp: any;
        fob: any;
        via: any;
        pengemudi: any;
        nopol: any;
        persediaan: any;
        total_rp: any;
        total_diskon_rp: any;
        total_pajak_rp: any;
        netto_rp: any;
        keterangan: any;
        total_berat: any;
        status: any;
        userid: any;
        tgl_update: any;
        kirim: any;
        kirim_mu: any;
        diskon_dok: any;
        diskon_dok_rp: any;
        kena_pajak: any;
        kode_termin: any;
        kontrak: any;
        status_export: any;
        fdo: any;
        tgl_trxlpb: any;
        status_dok: any;
        no_pralpb: any;
        tgl_pralpb: any;
        nama_relasi: any;
        nama_gudang: any;
    };

    const gridWidth = sidebarVisible ? 'calc(100% - 290px)' : '100%';

    const handleRadioChange = (e: any) => {
        setSelectedOptionRadio(e.target.id);
        // alert(e.target.value);
    };

    const handleRadioTipeDokumenChange = (e: any) => {
        setSelectedTipeDokumenValue(e.target.id);
        // alert(e.target.value);
    };

    //pindah approval
    const handleNavigateLink = (jenis: any) => {
        if (jenis === 'approve') {
            // button approve
            if (!selectedRow) {
                myAlert(`Pilih PB baru yang akan diapprove.`);
            } else {
                if (jenisList === 'approved') {
                    // const encode = Buffer.from(`kode_lpb=${selectedRow}&view=true&status=terbuka`).toString('base64');
                    // router.push({ pathname: './approval_pb', query: { str: encode } });

                    // alert('Pilih data PB Baru yang belum diapproval');
                    if (statusList === 'Terbuka') {
                        // console.log('MASUK SINI');
                        const encode = Buffer.from(
                            `selectedOptionRadio=${selectedOptionRadio}&selectedStatus=${selectedStatus}&NamaBarangValue=${NamaBarangValue}&selectedGudang=${selectedGudang}&SupplierValue=${SupplierValue}&noSJValue=${noSJValue}&noPBValue=${noPBValue}&kode_lpb=${selectedRow}&view=true&status=terbuka&vTipeDokumen=${selectedTipeDokumenValue}&tglAwal=${date1}&tglAkhir=${date2}&tglSjSuppAwal=${date3}&tglSjSuppAkhir=${date4}`
                        ).toString('base64');
                        router.push({ pathname: './approval_pb', query: { str: encode } });
                    } else if (statusList === 'Approval') {
                        myAlert(`Pilih data PB Baru yang belum diapproval.`);
                    } else if (statusList === 'Faktur') {
                        myAlert(`Pilih data PB Baru yang belum diapproval.`);
                    } else if (statusList === 'Proses') {
                        myAlert(`Pilih data PB Baru yang belum proses.`);
                    }
                } else if (jenisList === 'baru') {
                    const encode = Buffer.from(
                        `selectedOptionRadio=${selectedOptionRadio}&selectedStatus=${selectedStatus}&NamaBarangValue=${NamaBarangValue}&selectedGudang=${selectedGudang}&SupplierValue=${SupplierValue}&noSJValue=${noSJValue}&noPBValue=${noPBValue}&kode_lpb=${selectedRow}&view=false&status=app_pra_pb&vTipeDokumen=${selectedTipeDokumenValue}&tglAwal=${date1}&tglAkhir=${date2}&tglSjSuppAwal=${date3}&tglSjSuppAkhir=${date4}`
                    ).toString('base64');
                    router.push({ pathname: './approval_pb', query: { str: encode } });
                }
            }
        } else if (jenis === 'edit') {
            // button ubah
            if (!selectedRow) {
                myAlert(`Pilih PB baru yang akan diedit.`);
            } else {
                if (jenisList === 'approved') {
                    if (statusList === 'Faktur') {
                        // edit approved yang masih Faktur
                        const encode = Buffer.from(
                            `selectedOptionRadio=${selectedOptionRadio}&selectedStatus=${selectedStatus}&NamaBarangValue=${NamaBarangValue}&selectedGudang=${selectedGudang}&SupplierValue=${SupplierValue}&noSJValue=${noSJValue}&noPBValue=${noPBValue}&kode_lpb=${selectedRow}&vTipeDokumen=${selectedTipeDokumenValue}&tglAwal=${date1}&tglAkhir=${date2}&tglSjSuppAwal=${date3}&tglSjSuppAkhir=${date4}&view=true&status=terfaktur`
                        ).toString('base64');
                        router.push({ pathname: './approval_pb', query: { str: encode } });
                    } else if (statusList === 'Terbuka') {
                        // MASIH BISA EDIT SIMPAN
                        // edit approved yang masih terbuka
                        const encode = Buffer.from(
                            `selectedOptionRadio=${selectedOptionRadio}&selectedStatus=${selectedStatus}&NamaBarangValue=${NamaBarangValue}&selectedGudang=${selectedGudang}&SupplierValue=${SupplierValue}&noSJValue=${noSJValue}&noPBValue=${noPBValue}&kode_lpb=${selectedRow}&vTipeDokumen=${selectedTipeDokumenValue}&tglAwal=${date1}&tglAkhir=${date2}&tglSjSuppAwal=${date3}&tglSjSuppAkhir=${date4}&view=true&status=terbuka`
                        ).toString('base64');
                        router.push({ pathname: './approval_pb', query: { str: encode } });
                    } else {
                        // alert('Data Approved');
                        // router.push({ pathname: './approval_pb', query: { name: selectedRow, view: true } });
                        const encode = Buffer.from(
                            `selectedOptionRadio=${selectedOptionRadio}&selectedStatus=${selectedStatus}&NamaBarangValue=${NamaBarangValue}&selectedGudang=${selectedGudang}&SupplierValue=${SupplierValue}&noSJValue=${noSJValue}&noPBValue=${noPBValue}&kode_lpb=${selectedRow}&vTipeDokumen=${selectedTipeDokumenValue}&tglAwal=${date1}&tglAkhir=${date2}&tglSjSuppAwal=${date3}&tglSjSuppAkhir=${date4}&view=true`
                        ).toString('base64');
                        router.push({ pathname: './approval_pb', query: { str: encode } });
                    }
                } else if (jenisList === 'baru') {
                    // router.push({ pathname: './new_pb', query: { name: selectedRow, edit: true, kontrak: selectedKontrak } });

                    const encode = Buffer.from(
                        `tipe=${
                            selectedRowPersediaan === 'Non Persediaan' ? 'nonPersediaan' : 'Persediaan'
                        }&selectedOptionRadio=${selectedOptionRadio}&selectedStatus=${selectedStatus}&NamaBarangValue=${NamaBarangValue}&selectedGudang=${selectedGudang}&SupplierValue=${SupplierValue}&noSJValue=${noSJValue}&noPBValue=${noPBValue}&kode_lpb=${selectedRow}&edit=true&kontrak=${selectedKontrak}&vTipeDokumen=${selectedTipeDokumenValue}&tglAwal=${date1}&tglAkhir=${date2}&tglSjSuppAwal=${date3}&tglSjSuppAkhir=${date4}`
                    ).toString('base64');
                    router.push({ pathname: './new_pb', query: { str: encode } });
                }
            }
        } else if (jenis === 'updatefilependukung') {
            // button ubah
            if (!selectedRow) {
                myAlert(`Pilih PB yang akan diupdate file pendukung.`);
            } else {
                if (jenisList === 'approved') {
                    if (statusList === 'Faktur') {
                        // edit approved yang masih Faktur
                        const encode = Buffer.from(
                            `selectedOptionRadio=${selectedOptionRadio}&selectedStatus=${selectedStatus}&NamaBarangValue=${NamaBarangValue}&selectedGudang=${selectedGudang}&SupplierValue=${SupplierValue}&noSJValue=${noSJValue}&noPBValue=${noPBValue}&kode_lpb=${selectedRow}&vTipeDokumen=${selectedTipeDokumenValue}&tglAwal=${date1}&tglAkhir=${date2}&tglSjSuppAwal=${date3}&tglSjSuppAkhir=${date4}&view=true&status=terfaktur&updatefilependukung=true`
                        ).toString('base64');
                        router.push({ pathname: './approval_pb', query: { str: encode } });
                    } else if (statusList === 'Terbuka') {
                        // MASIH BISA EDIT SIMPAN
                        // edit approved yang masih terbuka
                        const encode = Buffer.from(
                            `selectedOptionRadio=${selectedOptionRadio}&selectedStatus=${selectedStatus}&NamaBarangValue=${NamaBarangValue}&selectedGudang=${selectedGudang}&SupplierValue=${SupplierValue}&noSJValue=${noSJValue}&noPBValue=${noPBValue}&kode_lpb=${selectedRow}&vTipeDokumen=${selectedTipeDokumenValue}&tglAwal=${date1}&tglAkhir=${date2}&tglSjSuppAwal=${date3}&tglSjSuppAkhir=${date4}&view=true&status=terbuka&updatefilependukung=true`
                        ).toString('base64');
                        router.push({ pathname: './approval_pb', query: { str: encode } });
                    } else {
                        // alert('Data Approved');
                        // router.push({ pathname: './approval_pb', query: { name: selectedRow, view: true } });
                        const encode = Buffer.from(
                            `selectedOptionRadio=${selectedOptionRadio}&selectedStatus=${selectedStatus}&NamaBarangValue=${NamaBarangValue}&selectedGudang=${selectedGudang}&SupplierValue=${SupplierValue}&noSJValue=${noSJValue}&noPBValue=${noPBValue}&kode_lpb=${selectedRow}&vTipeDokumen=${selectedTipeDokumenValue}&tglAwal=${date1}&tglAkhir=${date2}&tglSjSuppAwal=${date3}&tglSjSuppAkhir=${date4}&view=true&updatefilependukung=true`
                        ).toString('base64');
                        router.push({ pathname: './approval_pb', query: { str: encode } });
                    }
                } else if (jenisList === 'baru') {
                    // router.push({ pathname: './new_pb', query: { name: selectedRow, edit: true, kontrak: selectedKontrak } });
                    const encode = Buffer.from(
                        `selectedOptionRadio=${selectedOptionRadio}&selectedStatus=${selectedStatus}&NamaBarangValue=${NamaBarangValue}&selectedGudang=${selectedGudang}&SupplierValue=${SupplierValue}&noSJValue=${noSJValue}&noPBValue=${noPBValue}&kode_lpb=${selectedRow}&edit=true&kontrak=${selectedKontrak}&updatefilependukung=true&vTipeDokumen=${selectedTipeDokumenValue}&tglAwal=${date1}&tglAkhir=${date2}&tglSjSuppAwal=${date3}&tglSjSuppAkhir=${date4}`
                    ).toString('base64');
                    router.push({ pathname: './new_pb', query: { str: encode } });
                }
            }
        }
    };

    //handle input filter
    const handleNoPBInputChange = (value: any) => {
        setNoPBValue(value);
        setIsNoPBChecked(value.length > 0);
    };
    //handle input filter
    const handleNoSJInputChange = (value: any) => {
        setNoSJValue(value);
        setIsNoSJChecked(value.length > 0);
    };

    const handleSupplierInputChange = (value: any) => {
        setSupplierValue(value);
        setIsSupplierChecked(value.length > 0);
    };

    const handleSelectedGudang = (value: any) => {
        // alert(event.target.value);
        setSelectedGudang(value);
        setIsGudangChecked(value.length > 0);
    };

    const handleNamaBarangInputChange = (value: any) => {
        // alert(event.target.value);
        setNamaBarangValue(value);
        setIsNamaBarangChecked(value.length > 0);
    };

    const handleSelectedStatus = (value: any) => {
        // alert(event.target.value);
        setSelectedStatus(value);
        setIsStatusChecked(value.length > 0);
    };

    const handleRowClick = (persediaan: any, kode_lpb: any, kontrak: any, jenisList: any, status: any) => {
        // console.log(kode_lpb, kontrak, jenisList, status);
        setSelectedRow(kode_lpb);
        setSelectedKontrak(kontrak);
        setJenisList(jenisList);
        setStatus(status);
        setSelectedRowPersediaan(persediaan);
        // alert(status);
    };

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             if (jenisList === 'approved') {
    //                 var responseDetail = await axios.get(`${apiUrl}/erp/detail_approved_pb?entitas=${kode_entitas}&param1=${selectedRow}`);
    //             } else {
    //                 var responseDetail = await axios.get(`${apiUrl}/erp/app_detail_prapb?entitas=${kode_entitas}&param1=${selectedRow}`);
    //             }
    //             // const responseHeader = await axios.get(`${apiUrl}/erp/app_header_prapb?entitas=${kode_entitas}&param1=${selectedRow}`);
    //             // setHeaderFetch(responseHeader.data.data);
    //             setDetailFetch(responseDetail.data.data);
    //             // console.log(responseHeader.data.data);
    //             console.log(selectedRow);
    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //         }
    //     };
    //     fetchData();
    // }, [kode_entitas, selectedRow]);
    // Ensure that useEffect is always called in the same order

    // useEffect(() => {
    //     const fetchDataUseEffect = async () => {
    //         setShowLoader(true);

    //         if (userid !== 'administrator') {
    //             await usersMenu(kode_entitas, userid, kode_menu)
    //                 .then((result) => {
    //                     const { baru, edit, hapus, cetak } = result;
    //                     setUserMenu((prevState) => ({
    //                         ...prevState,
    //                         baru: baru,
    //                         edit: edit,
    //                         hapus: hapus,
    //                         cetak: cetak,
    //                     }));
    //                 })
    //                 .catch((error) => {
    //                     console.error('Error:', error);
    //                 });
    //         } else {
    //             setUserMenu((prevState) => ({
    //                 ...prevState,
    //                 baru: 'Y',
    //                 edit: 'Y',
    //                 hapus: 'Y',
    //                 cetak: 'Y',
    //             }));
    //         }

    //         try {
    //             let vno_pb = 'all';
    //             let vno_sj = 'all';
    //             let vtgl_awal = 'all';
    //             let vtgl_akhir = 'all';
    //             let vstatus_dok = 'all';
    //             let vdokumen = 'all';
    //             let vproduksi = 'all';
    //             let vpembatalan = 'all';
    //             let vlimit = '10000';

    //             if (isNoPBChecked) {
    //                 vno_pb = `${noPBValue}`;
    //             }

    //             if (isTanggalChecked) {
    //                 const formattedDate1 = moment(date1).format('YYYY-MM-DD');
    //                 const formattedDate2 = moment(date2).format('YYYY-MM-DD');
    //                 vtgl_awal = `${formattedDate1}`;
    //                 vtgl_akhir = `${formattedDate2}`;
    //             }

    //             if (isNoSJChecked) {
    //                 vno_sj = `${noSJValue}`;
    //             }

    //             // if (isStatusAppChecked) {
    //             //     vdokumen = `${StatusAppValue}`;
    //             // }

    //             // if (isProduksiChecked) {
    //             //     vproduksi = `Y`;
    //             // }

    //             // if (isPembatalanChecked) {
    //             //     vpembatalan = `Y`;
    //             // }

    //             const response = await axios.get(`${apiUrl}/erp/list_pb?`, {
    //                 params: {
    //                     entitas: kode_entitas,
    //                     param1: 'all',
    //                     param2: 'all',
    //                     param3: vtgl_awal,
    //                     param4: vtgl_akhir,
    //                     param5: 'all',
    //                     param6: 'all',
    //                     param7: 'all',
    //                     param8: 'all',
    //                     param9: 'all',
    //                     param10: 'all',
    //                     param11: 'all',
    //                     param12: 1000,
    //                 },
    //             });

    //             const response2 = await axios.get(`${apiUrl}/erp/list_pra_pb?`, {
    //                 params: {
    //                     entitas: kode_entitas,
    //                     param1: 'all',
    //                     param2: 'all',
    //                     param3: vtgl_awal,
    //                     param4: vtgl_akhir,
    //                     param5: 'all',
    //                     param6: 'all',
    //                     param7: 'all',
    //                     param8: 'all',
    //                     param9: 'all',
    //                     param10: 'all',
    //                     param11: 'all',
    //                     param12: 1000,
    //                 },
    //             });

    //             const responseData = response.data.data;
    //             const responseData2 = response2.data.data;

    //             const transformedData: PBListItem[] = responseData.map((item: any) => ({
    //                 kode_lpb: item.kode_lpb,
    //                 no_lpb: item.no_lpb,
    //                 tgl_lpb: moment(item.tgl_lpb).format('DD-MM-YYYY'),
    //                 no_reff: item.no_reff,
    //                 peminta: item.peminta,
    //                 kode_dept: item.kode_dept,
    //                 nama_relasi: item.nama_relasi,
    //                 nama_gudang: item.nama_gudang,
    //                 userid: item.userid,
    //                 tgl_update: item.tgl_update,
    //                 approval: item.approval,
    //                 tgl_approval: item.tgl_approval,
    //                 fdo: item.fdo,
    //                 produksi: item.produksi,
    //                 tgl_sj: moment(item.tgl_sj).format('DD-MM-YYYY'),
    //                 dokumen: item.dokumen,
    //                 status_batal: item.status_batal,
    //                 via: item.via,
    //                 nopol: item.nopol,
    //                 pengemudi: item.pengemudi,
    //                 status: item.status,
    //                 status_dok: item.status_dok,
    //                 kontrak: item.kontrak,
    //             }));

    //             const transformedData2: PBListItem[] = responseData2.map((item: any) => ({
    //                 kode_lpb: item.kode_lpb,
    //                 no_lpb: item.no_lpb,
    //                 tgl_lpb: moment(item.tgl_lpb).format('DD-MM-YYYY'),
    //                 no_reff: item.no_reff,
    //                 peminta: item.peminta,
    //                 kode_dept: item.kode_dept,
    //                 nama_relasi: item.nama_relasi,
    //                 nama_gudang: item.nama_gudang,
    //                 userid: item.userid,
    //                 tgl_update: item.tgl_update,
    //                 approval: item.approval,
    //                 tgl_approval: item.tgl_approval,
    //                 fdo: item.fdo,
    //                 produksi: item.produksi,
    //                 tgl_sj: moment(item.tgl_sj).format('DD-MM-YYYY'),
    //                 dokumen: item.dokumen,
    //                 status_batal: item.status_batal,
    //                 via: item.via,
    //                 nopol: item.nopol,
    //                 pengemudi: item.pengemudi,
    //                 status: item.status,
    //                 status_dok: item.status_dok,
    //                 kontrak: item.kontrak,
    //             }));

    //             // setAllRecords(transformedData);
    //             gridListData.dataSource = transformedData;
    //             // setAllRecordsPra(transformedData2);
    //             gridListDataPra.dataSource = transformedData2;
    //             setTotalRecords(transformedData.length);
    //             setTotalRecords2(transformedData2.length);

    //             const responseListGudang = await axios.get(`${apiUrl}/erp/list_gudang_forfilter?`, {
    //                 params: {
    //                     entitas: kode_entitas,
    //                     param1: 'ADMIN', // sementara
    //                 },
    //             });

    //             const responseGudang = responseListGudang.data.data;
    //             setListGudang(responseGudang);
    //             setShowLoader(false);
    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //         }
    //         swal.close();
    //     };
    //     fetchDataUseEffect();
    // }, []);

    // Visible panel sidebar
    // const [panelVisible, setPanelVisible] = useState(true);

    function formatString(input: string) {
        // Split berdasarkan underscore (_)
        const words = input.split('_');

        // Kapitalisasi huruf pertama setiap kata
        const formattedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

        // Gabungkan kembali dengan spasi
        return formattedWords.join(' ');
    }

    const handleShowFilter = (value: any) => {
        if (value) {
            setSidebarVisible(true);
        } else {
            setSidebarVisible(false);
        }
    };

    // const refreshData = () => {
    //     alert(noPBValue);
    // };

    const refreshData = async () => {
        // alert(SupplierValue);
        setShowLoader(true);
        if (kode_entitas !== null || kode_entitas !== '') {
            try {
                let vno_pb = 'all';
                let vno_sj = 'all';
                let vtgl_awal = 'all';
                let vtgl_akhir = 'all';
                let vtglsj_awal = 'all';
                let vtglsj_akhir = 'all';
                let vsupplier = 'all';
                let vgudang = 'all';
                let vnama_barang = 'all';
                let vstatus = 'all';
                let vtipeDokumen = 'yes';

                if (isNoPBChecked) {
                    vno_pb = `${noPBValue}`;
                }

                if (isNoSJChecked) {
                    vno_sj = `${noSJValue}`;
                }

                if (isTanggalChecked) {
                    const formattedDate1 = moment(date1).format('YYYY-MM-DD');
                    const formattedDate2 = moment(date2).format('YYYY-MM-DD');
                    vtgl_awal = `${formattedDate1}`;
                    vtgl_akhir = `${formattedDate2}`;
                }

                if (isTanggalSJChecked) {
                    const formattedDate1 = moment(date3).format('YYYY-MM-DD');
                    const formattedDate2 = moment(date4).format('YYYY-MM-DD');
                    vtglsj_awal = `${formattedDate1}`;
                    vtglsj_akhir = `${formattedDate2}`;
                }

                if (isSupplierChecked) {
                    vsupplier = `${SupplierValue}`;
                }

                if (isGudangChecked) {
                    vgudang = `${selectedGudang}`;
                }

                if (isNamaBarangChecked) {
                    vnama_barang = NamaBarangValue;
                }

                if (isStatusChecked) {
                    vstatus = selectedStatus;
                }

                if (selectedTipeDokumenValue === 'tipeAll') {
                    vtipeDokumen = 'all';
                } else if (selectedTipeDokumenValue === 'yes') {
                    vtipeDokumen = 'Y';
                } else {
                    vtipeDokumen = 'N';
                }

                const response = await axios.get(`${apiUrl}/erp/list_pb_filter?`, {
                    params: {
                        entitas: kode_entitas,
                        param1: vno_pb,
                        param2: vno_sj,
                        param3: vtgl_awal,
                        param4: vtgl_akhir,
                        param5: vtglsj_awal,
                        param6: vtglsj_akhir,
                        param7: vsupplier,
                        param8: vgudang,
                        param9: vnama_barang,
                        param10: vstatus,
                        param11: selectedOptionRadio,
                        param12: vtipeDokumen,
                    },
                });

                const response2 = await axios.get(`${apiUrl}/erp/list_pra_pbFilter?`, {
                    params: {
                        entitas: kode_entitas,
                        param1: vno_pb,
                        param2: vno_sj,
                        param3: vtgl_awal,
                        param4: vtgl_akhir,
                        param5: vtglsj_awal,
                        param6: vtglsj_akhir,
                        param7: vsupplier,
                        param8: vgudang,
                        param9: vnama_barang,
                        param10: vstatus,
                        param11: selectedOptionRadio,
                        param12: vtipeDokumen,
                    },
                });

                const responseData = response.data.data;
                const responseData2 = response2.data.data;
                const transformedData: PBListItem[] = responseData.map((item: any) => ({
                    kode_lpb: item.kode_lpb,
                    no_lpb: item.no_lpb,
                    tgl_lpb: moment(item.tgl_lpb).format('DD-MM-YYYY'),
                    no_reff: item.no_reff,
                    peminta: item.peminta,
                    kode_dept: item.kode_dept,
                    nama_relasi: item.nama_relasi,
                    nama_gudang: item.nama_gudang,
                    userid: item.userid,
                    tgl_update: item.tgl_update,
                    approval: item.approval,
                    tgl_approval: item.tgl_approval,
                    fdo: item.fdo,
                    produksi: item.produksi,
                    tgl_sj: moment(item.tgl_sj).format('DD-MM-YYYY'),
                    dokumen: item.dokumen,
                    status_batal: item.status_batal,
                    via: item.via,
                    nopol: item.nopol,
                    pengemudi: item.pengemudi,
                    status: item.status,
                    status_dok: item.status_dok,
                    kontrak: item.kontrak,
                    persediaan: item.persediaan === 'Y' ? 'Persediaan' : 'Non Persediaan',
                }));

                const transformedData2: PBListItem[] = responseData2.map((item: any) => ({
                    kode_lpb: item.kode_lpb,
                    no_lpb: item.no_lpb,
                    tgl_lpb: moment(item.tgl_lpb).format('DD-MM-YYYY'),
                    no_reff: item.no_reff,
                    peminta: item.peminta,
                    kode_dept: item.kode_dept,
                    nama_relasi: item.nama_relasi,
                    nama_gudang: item.nama_gudang,
                    userid: item.userid,
                    tgl_update: item.tgl_update,
                    approval: item.approval,
                    tgl_approval: item.tgl_approval,
                    fdo: item.fdo,
                    produksi: item.produksi,
                    tgl_sj: moment(item.tgl_sj).format('DD-MM-YYYY'),
                    dokumen: item.dokumen,
                    status_batal: item.status_batal,
                    via: item.via,
                    nopol: item.nopol,
                    pengemudi: item.pengemudi,
                    status: item.status,
                    status_dok: item.status_dok,
                    kontrak: item.kontrak,
                    persediaan: item.persediaan === 'Y' ? 'Persediaan' : 'Non Persediaan',
                }));

                // setAllRecords(transformedData);
                gridListData.dataSource = transformedData;
                setTotalRecords(transformedData.length);
                // setAllRecordsPra(transformedData2);
                gridListDataPra.dataSource = transformedData2;
                setTotalRecords2(transformedData2.length);
                setShowLoader(false);
            } catch (error) {
                setShowLoader(false);
                console.error(error);
            }
        }
        if (kode_entitas == null || kode_entitas == '') {
            alert('Silahkan Login Kembali, Session Habis');
            setTimeout(() => {
                router.push({ pathname: '/' });
            }, 1000);
        }
        swal.close();
    };

    const openModal = (item: any) => {
        setSelectedItem(item);
    };

    const closeModal = () => {
        setSelectedItem(null);
    };

    const OnClick_CetakFormPB = (nominal: any) => {
        if (selectedRow === '') {
            myAlert(`Silahkan pilih data terlebih dahulu.`);
        } else {
            const param = {
                entitas: kode_entitas,
                param1: `${selectedRow}`,
            };
            // Encode Base64
            const strCommand = btoa(JSON.stringify(param));

            let height = window.screen.availHeight - 150;
            let width = window.screen.availWidth - 200;
            let leftPosition = window.screen.width / 2 - (width / 2 + 10);
            let topPosition = window.screen.height / 2 - (height / 2 + 50);

            if (jenisList === 'approved') {
                if (nominal === 'false') {
                    let iframe = `
                    <html><head>
                    <title>Form Penerimaan Barang | Next KCN Sytem</title>
                    <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
                    </head><body>
                    <iframe src="./report/form_pb?cmd=${strCommand}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
                    }
                } else if (nominal === 'true') {
                    let iframe = `
                    <html><head>
                    <title>Form Penerimaan Barang (Dengan Harga) | Next KCN Sytem</title>
                    <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
                    </head><body>
                    <iframe src="./report/form_pb_nominal?cmd=${strCommand}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
                    }
                }
            } else if (jenisList === 'baru') {
                // prapb
                if (nominal === 'false') {
                    let iframe = `
                   <html><head>
                   <title>Form Pra Penerimaan Barang | Next KCN Sytem</title>
                   <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
                   </head><body>
                   <iframe src="./report/form_prapb?cmd=${strCommand}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
                    }
                } else if (nominal === 'true') {
                    let iframe = `
                    <html><head>
                    <title>Form Pra Penerimaan Barang (Dengan Harga) | Next KCN Sytem</title>
                    <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
                    </head><body>
                    <iframe src="./report/form_prapb_nominal?cmd=${strCommand}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
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
                    }
                }
            } else {
                console.error('Window failed to open.');
            }
        }
    };

    const BatalApproval = async () => {
        if (selectedRow) {
            if (jenisList === 'approved') {
                if (statusList === 'Faktur') {
                    myAlert(`Dokumen ini telah difaktur.`);
                } else if (statusList === 'Approval') {
                    Swal.fire({
                        title: 'Pembatalan !!!',
                        text: `Apakah anda yakin akan melakukan pembatalan approval PB`,
                        // icon: 'warning',
                        showCancelButton: true, // Menampilkan tombol Batal
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Ya, Batalkan!',
                        cancelButtonText: 'Batal',
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            try {
                                const response: any = await ApiBatal('Approval');
                                if (response.data.status === true) {
                                    Swal.fire({
                                        title: 'Berhasil Pembatalan Approval PB',
                                        icon: 'success',
                                    }).then(() => {
                                        // Reload halaman
                                        window.location.reload();
                                    });
                                } else {
                                    console.error('Respons tidak valid');
                                }
                            } catch (error) {
                                console.error('Terjadi kesalahan:', error);
                                Swal.fire('Error', 'Terjadi kesalahan saat membatalkan.', 'error');
                            }
                        }
                    });
                } else if (statusList === 'Terbuka') {
                    Swal.fire({
                        title: '<h>Pembatalan !!!</h>',
                        text: `Apakah anda yakin akan melakukan pembatalan dengan mengembalikan ke Pra PB `,
                        icon: 'warning',
                        showCancelButton: true, // Menampilkan tombol Batal
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Ya, Batalkan!',
                        cancelButtonText: 'Batal',
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            try {
                                const response: any = await ApiBatal('Terbuka');
                                if (response.data.status === true) {
                                    Swal.fire({
                                        title: 'Berhasil Pembatalan Approval PB',
                                        icon: 'success',
                                    }).then(() => {
                                        // Reload halaman
                                        window.location.reload();
                                    });
                                } else {
                                    console.error('Respons tidak valid');
                                }
                            } catch (error) {
                                console.error('Terjadi kesalahan:', error);
                                Swal.fire('Error', 'Terjadi kesalahan saat membatalkan.', 'error');
                            }
                        }
                    });
                }
            } else {
                myAlert(`Pilih data yang telah diapproved.`);
            }
        } else {
            myAlert(`Pilih data terlebih dulu.`);
        }
    };

    const ApiBatal = async (batal: any) => {
        // if (batal === 'Terbuka') {
        const modifiedData = {
            entitas: kode_entitas,
            kode_lpb: selectedRow,
        };

        return await axios.post(`${apiUrl}/erp/batal_approval`, modifiedData);
        // } else if (batal === 'Approval') {
        //     const modifiedData = {
        //         entitas: kode_entitas,
        //         kode_lpb: selectedRow,
        //     };

        //     return await axios.post(`${apiUrl}/erp/batal_approvalpbflag`, modifiedData);
        // }
    };

    const handleTgl = async (date: any, tipe: string) => {
        if (tipe === 'tanggalAwal') {
            setDate1(date);
            setIsTanggalChecked(true);
        } else {
            setDate2(date);
            setIsTanggalChecked(true);
        }
    };

    const handleTglSJ = async (date: any, tipe: string) => {
        if (tipe === 'tanggalAwal') {
            setDate3(date);
            setIsTanggalSJChecked(true);
        } else {
            setDate4(date);
            setIsTanggalSJChecked(true);
        }
    };

    const handleKontrak = (tipe: any) => {
        const encode = Buffer.from(
            `selectedOptionRadio=${selectedOptionRadio}&selectedStatus=${selectedStatus}&NamaBarangValue=${NamaBarangValue}&selectedGudang=${selectedGudang}&SupplierValue=${SupplierValue}&noSJValue=${noSJValue}&noPBValue=${noPBValue}&kontrak=Y&vTipeDokumen=${selectedTipeDokumenValue}&vTipeDokumen=${selectedTipeDokumenValue}&tglAwal=${date1}&tglAkhir=${date2}&tglSjSuppAwal=${date3}&tglSjSuppAkhir=${date4}&tipe=${tipe}`
        ).toString('base64');
        router.push({ pathname: './new_pb', query: { str: encode } });
    };

    const handleNonKontrak = (tipe: any) => {
        const encode = Buffer.from(
            `selectedOptionRadio=${selectedOptionRadio}&selectedStatus=${selectedStatus}&NamaBarangValue=${NamaBarangValue}&selectedGudang=${selectedGudang}&SupplierValue=${SupplierValue}&noSJValue=${noSJValue}&noPBValue=${noPBValue}&kontrak=N&vTipeDokumen=${selectedTipeDokumenValue}&vTipeDokumen=${selectedTipeDokumenValue}&tglAwal=${date1}&tglAkhir=${date2}&tglSjSuppAwal=${date3}&tglSjSuppAkhir=${date4}&tipe=${tipe}`
        ).toString('base64');
        router.push({ pathname: './new_pb', query: { str: encode } });
    };

    const styleButton = {
        display: 'flex',
        alignItems: 'center',
        fontSize: 11,
        backgroundColor: 'rgb(59 63 92)',
        color: 'white',
        padding: '1.5px 12px',
        borderRadius: '4px',
        fontFamily: 'Roboto',
        marginLeft: 5,
        fontWeight: 500,
        transition: 'box-shadow 0.3s ease-in-out',
    };
    const styleButtonDisable = {
        display: 'flex',
        alignItems: 'center',
        fontSize: 11,
        backgroundColor: '#dedede',
        color: 'white',
        padding: '1.5px 12px',
        borderRadius: '4px',
        fontFamily: 'Roboto',
        marginLeft: 5,
        fontWeight: 500,
        transition: 'box-shadow 0.3s ease-in-out',
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

    const contentLoader = () => {
        return (
            <div className="screen_loader animate__animated fixed inset-0 z-[60] grid place-content-center bg-[#ffffff00] dark:bg-[#060818]">
                <svg width="64" height="64" viewBox="0 0 135 135" xmlns="http://www.w3.org/2000/svg" fill="#4361ee">
                    <path d="M67.447 58c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10zm9.448 9.447c0 5.523 4.477 10 10 10 5.522 0 10-4.477 10-10s-4.478-10-10-10c-5.523 0-10 4.477-10 10zm-9.448 9.448c-5.523 0-10 4.477-10 10 0 5.522 4.477 10 10 10s10-4.478 10-10c0-5.523-4.477-10-10-10zM58 67.447c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10z">
                        <animateTransform attributeName="transform" type="rotate" from="0 67 67" to="-360 67 67" dur="2.5s" repeatCount="indefinite" />
                    </path>
                    <path d="M28.19 40.31c6.627 0 12-5.374 12-12 0-6.628-5.373-12-12-12-6.628 0-12 5.372-12 12 0 6.626 5.372 12 12 12zm30.72-19.825c4.686 4.687 12.284 4.687 16.97 0 4.686-4.686 4.686-12.284 0-16.97-4.686-4.687-12.284-4.687-16.97 0-4.687 4.686-4.687 12.284 0 16.97zm35.74 7.705c0 6.627 5.37 12 12 12 6.626 0 12-5.373 12-12 0-6.628-5.374-12-12-12-6.63 0-12 5.372-12 12zm19.822 30.72c-4.686 4.686-4.686 12.284 0 16.97 4.687 4.686 12.285 4.686 16.97 0 4.687-4.686 4.687-12.284 0-16.97-4.685-4.687-12.283-4.687-16.97 0zm-7.704 35.74c-6.627 0-12 5.37-12 12 0 6.626 5.373 12 12 12s12-5.374 12-12c0-6.63-5.373-12-12-12zm-30.72 19.822c-4.686-4.686-12.284-4.686-16.97 0-4.686 4.687-4.686 12.285 0 16.97 4.686 4.687 12.284 4.687 16.97 0 4.687-4.685 4.687-12.283 0-16.97zm-35.74-7.704c0-6.627-5.372-12-12-12-6.626 0-12 5.373-12 12s5.374 12 12 12c6.628 0 12-5.373 12-12zm-19.823-30.72c4.687-4.686 4.687-12.284 0-16.97-4.686-4.686-12.284-4.686-16.97 0-4.687 4.686-4.687 12.284 0 16.97 4.686 4.687 12.284 4.687 16.97 0z">
                        <animateTransform attributeName="transform" type="rotate" from="0 67 67" to="360 67 67" dur="8s" repeatCount="indefinite" />
                    </path>
                </svg>
            </div>
        );
    };

    const statusOptions = [
        { text: 'Terbuka', value: 'Terbuka' },
        { text: 'Approval', value: 'Approval' },
        { text: 'Faktur', value: 'Faktur' },
    ];

    useEffect(() => {
        if(tabAktif === 'baru') {
            refreshData();
        } else {
            refreshData();
        }
    },[tabAktif])

    return (
        <div className="h-[calc(100vh-200px)] w-full ">
            <div className={`main h-full w-full ${stylesIndex.scale85Monitor}`} id="main-target">
                {showLoader && contentLoader()}
                {/* =================================BUTTON=================================== */}
                <div style={{ minHeight: '30px', marginTop: '-3px', marginBottom: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="flex flex-wrap items-center">
                        <ButtonComponent
                            id="btnBaru"
                            cssClass="e-primary e-small"
                            onClick={() => setBaru(true)}
                            disabled={userMenu.baru === 'Y' ? false : true}
                            content="Baru"
                            style={{ backgroundColor: 'rgb(59 63 92)' }}
                        ></ButtonComponent>

                        <ButtonComponent
                            id="btnUbah"
                            cssClass="e-primary e-small"
                            onClick={() => handleNavigateLink('edit')}
                            disabled={userMenu.edit === 'Y' ? false : true}
                            content="Ubah"
                            style={{ backgroundColor: 'rgb(59 63 92)', marginLeft: 5 }}
                        ></ButtonComponent>
                        <ButtonComponent
                            id="btnFilter"
                            cssClass="e-primary e-small"
                            onClick={handleShowFilter}
                            disabled={sidebarVisible}
                            content="Filter"
                            style={sidebarVisible ? { color: 'white', marginLeft: 5, backgroundColor: '#dedede' } : { backgroundColor: 'rgb(59 63 92)', marginLeft: 5, color: 'white' }}
                        ></ButtonComponent>
                        <div style={{ marginLeft: 5, marginRight: 5 }} className="relative">
                            <div className="dropdown">
                                <Dropdown
                                    offset={[0, 5]}
                                    placement={`bottom-start`}
                                    // btnClassName="btn btn-dark md:mr-1"
                                    button={
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                fontSize: 11,
                                                backgroundColor: 'rgb(59 63 92)',
                                                color: 'white',
                                                padding: '2.5px 10px',
                                                borderRadius: '4px',
                                                fontFamily: 'Roboto',
                                            }}
                                        >
                                            Cetak
                                            <FontAwesomeIcon icon={faSquareCaretDown} className="ml-2" width="15" height="15" />
                                        </div>
                                    }
                                >
                                    <ul style={{ width: '300px', fontSize: 12, textAlign: 'left' }}>
                                        <li>
                                            <button
                                                type="button"
                                                onClick={() => OnClick_CetakFormPB('false')}
                                                disabled={userMenu.cetak === 'Y' ? false : true}
                                                style={
                                                    userMenu.cetak !== 'Y'
                                                        ? {
                                                              color: '#888',
                                                              cursor: 'not-allowed',
                                                              pointerEvents: 'none',
                                                          }
                                                        : {}
                                                }
                                            >
                                                Form Penerimaan Barang
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                type="button"
                                                onClick={() => OnClick_CetakFormPB('true')}
                                                disabled={userMenu.cetak === 'Y' ? false : true}
                                                style={
                                                    userMenu.cetak !== 'Y'
                                                        ? {
                                                              color: '#888',
                                                              cursor: 'not-allowed',
                                                              pointerEvents: 'none',
                                                          }
                                                        : {}
                                                }
                                            >
                                                Form Penerimaan Barang (Dengan Harga)
                                            </button>
                                        </li>
                                    </ul>
                                </Dropdown>
                            </div>
                        </div>
                        <ButtonComponent
                            id="Approval"
                            cssClass="e-primary e-small"
                            onClick={() => handleNavigateLink('approve')}
                            content="Approval"
                            style={{ backgroundColor: 'rgb(59 63 92)' }}
                        ></ButtonComponent>
                        <ButtonComponent
                            id="btlApproval"
                            cssClass="e-primary e-small"
                            onClick={() => BatalApproval()}
                            content="Batal Approval"
                            style={{ backgroundColor: 'rgb(59 63 92)', marginLeft: 5 }}
                        ></ButtonComponent>
                        <ButtonComponent
                            id="updatefilependukung"
                            cssClass="e-primary e-small"
                            onClick={() => handleNavigateLink('updatefilependukung')}
                            content="Update File Pendukung"
                            style={{ backgroundColor: 'rgb(59 63 92)', marginLeft: 5 }}
                        ></ButtonComponent>
                        <ButtonComponent
                            id="dokDetail"
                            cssClass="e-primary e-small"
                            onClick={() => openModal(selectedRow)}
                            content="Detail Dok"
                            style={{ backgroundColor: 'rgb(59 63 92)', marginLeft: 5 }}
                        ></ButtonComponent>
                    </div>

                    <div className="mt-2 flex items-center md:mt-0">
                        <span style={{ fontSize: 16, fontFamily: 'roboto' }} className="font-serif text-xl font-bold">
                            Penerimaan Barang (PB)
                        </span>
                    </div>
                </div>
                {/* =================================END BUTTON=================================== */}
                <div id="main-content " style={{ position: 'sticky', overflow: 'hidden' }} className="flex h-[calc(100%-33px)] w-full gap-2">
                    {/* ==============================FILTER============================================== */}
                    <div className={`min-w-[250px] max-w-[300px] rounded-lg bg-[#dedede] ${sidebarVisible ? 'block' : 'hidden'}`}>
                        <div className="flex h-full w-full flex-col p-2">
                            <div className="flex h-[30px] w-full justify-between border-black border-b">
                                <div className="flex h-full items-center ">
                                    <button className="absolute right-0 top-0 p-2 text-gray-600 hover:text-gray-900" onClick={() => handleShowFilter(false)}>
                                        <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                                    </button>
                                    <SvgComponent />
                                    <h5 className="text-lg font-bold ltr:ml-3 rtl:mr-3">Filtering Data</h5>
                                </div>
                                <div onClick={() => setSidebarVisible(false)} className="h-full cursor-pointer items-center">
                                    <IoMdClose />
                                </div>
                            </div>
                            <div className="flex h-[calc(100%-64px)] w-full flex-col overflow-y-auto px-1">
                                <div className="mt-2 flex justify-between">
                                    <CheckBoxComponent
                                        label="No. PB"
                                        checked={isNoPBChecked}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            setIsNoPBChecked(value);
                                        }}
                                        style={{ borderRadius: 3, borderColor: 'gray' }}
                                    />
                                </div>
                                <div className="mt-1 flex justify-between">
                                    <div className="container form-input">
                                        <TextBoxComponent placeholder="" value={noPBValue} input={(args) => handleNoPBInputChange(args.value)} />
                                    </div>
                                </div>

                                <div className="mt-2 flex justify-between">
                                    <CheckBoxComponent
                                        label="No. SJ Supplier"
                                        checked={isNoSJChecked}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            setIsNoSJChecked(value);
                                        }}
                                        style={{ borderRadius: 3, borderColor: 'gray' }}
                                    />
                                </div>
                                <div className="mt-1 flex justify-between">
                                    <div className="container form-input">
                                        <TextBoxComponent placeholder="" value={noSJValue} input={(args) => handleNoSJInputChange(args.value)} />
                                    </div>
                                </div>

                                <div className="mt-2 flex justify-between">
                                    <CheckBoxComponent
                                        label="Tanggal PB"
                                        checked={isTanggalChecked}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            setIsTanggalChecked(value);
                                        }}
                                    />
                                </div>

                                <div className={`grid grid-cols-1 justify-between gap-1 sm:flex `}>
                                    <div className="form-input mt-1 flex justify-between">
                                        <DatePickerComponent
                                            locale="id"
                                            cssClass="e-custom-style"
                                            enableMask={true}
                                            showClearButton={false}
                                            format="dd-MM-yyyy"
                                            value={moment(date1).toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                handleTgl(args.value, 'tanggalAwal');
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                    <p className="set-font-11 ml-0.5 mr-0.5 mt-3 flex justify-between">s/d</p>
                                    <div className="form-input mt-1 flex justify-between">
                                        <DatePickerComponent
                                            locale="id"
                                            cssClass="e-custom-style"
                                            enableMask={true}
                                            showClearButton={false}
                                            format="dd-MM-yyyy"
                                            value={moment(date2).toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                handleTgl(args.value, 'tanggalAkhir');
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                </div>

                                <div className="mt-2 flex justify-between">
                                    <CheckBoxComponent
                                        label="Tanggal SJ Supplier"
                                        checked={isTanggalSJChecked}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            setIsTanggalSJChecked(value);
                                        }}
                                    />
                                </div>
                                <div className={`grid grid-cols-1 justify-between gap-1 sm:flex `}>
                                    <div className="form-input mt-1 flex justify-between">
                                        <DatePickerComponent
                                            locale="id"
                                            cssClass="e-custom-style"
                                            enableMask={true}
                                            showClearButton={false}
                                            format="dd-MM-yyyy"
                                            value={moment(date3).toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                handleTglSJ(args.value, 'tanggalAwal');
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                    <p className="set-font-11 ml-0.5 mr-0.5 mt-3 flex justify-between">s/d</p>
                                    <div className="form-input mt-1 flex justify-between">
                                        <DatePickerComponent
                                            locale="id"
                                            cssClass="e-custom-style"
                                            enableMask={true}
                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                            showClearButton={false}
                                            format="dd-MM-yyyy"
                                            value={moment(date4).toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                handleTglSJ(args.value, 'tanggalAkhir');
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                </div>

                                <div className="mt-2 flex justify-between">
                                    <CheckBoxComponent
                                        label="Supplier"
                                        checked={isSupplierChecked}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            setIsSupplierChecked(value);
                                        }}
                                    />
                                </div>
                                <div className="mt-1 flex justify-between">
                                    <div className="container form-input">
                                        <TextBoxComponent
                                            placeholder=""
                                            value={SupplierValue}
                                            input={(args: FocusInEventArgs) => {
                                                const value: any = args.value;
                                                handleSupplierInputChange(value);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="mt-2 flex justify-between">
                                    <CheckBoxComponent
                                        label="Gudang Asal"
                                        checked={isGudangChecked}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            setIsGudangChecked(value);
                                        }}
                                    />
                                </div>
                                <div className="mt-1 flex justify-between">
                                    <div className="container form-input">
                                        <DropDownListComponent
                                            id="gudangasal"
                                            className="form-select"
                                            fields={{ text: 'text', value: 'value' }}
                                            dataSource={listGudang.map((data: any) => ({ text: data.nama_gudang, value: data.kode_gudang }))}
                                            placeholder="--Silahkan Pilih--"
                                            change={(args: ChangeEventArgsDropDown) => {
                                                const value: any = args.value;

                                                handleSelectedGudang(value);
                                            }}
                                            value={selectedGudang}
                                        />
                                    </div>
                                </div>

                                <div className="mt-2 flex justify-between">
                                    <CheckBoxComponent
                                        label="Nama Barang"
                                        checked={isNamaBarangChecked}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            setIsNamaBarangChecked(value);
                                        }}
                                    />
                                </div>
                                <div className="mt-1 flex justify-between">
                                    <div className="container form-input">
                                        <TextBoxComponent
                                            placeholder=""
                                            value={NamaBarangValue}
                                            input={(args: FocusInEventArgs) => {
                                                const value: any = args.value;
                                                handleNamaBarangInputChange(value);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="mt-2 flex justify-between">
                                    <CheckBoxComponent
                                        label="Status Dokumen"
                                        checked={isStatusChecked}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            setIsStatusChecked(value);
                                        }}
                                    />
                                </div>
                                <div className="mt-1 flex justify-between">
                                    <div className="container form-input">
                                        <DropDownListComponent
                                            id="status"
                                            className="form-select"
                                            fields={{ text: 'text', value: 'value' }}
                                            dataSource={statusOptions}
                                            placeholder="--Silahkan Pilih--"
                                            change={(args: ChangeEventArgsDropDown) => {
                                                const value: any = args.value;

                                                handleSelectedStatus(value);
                                            }}
                                            value={selectedStatus}
                                        />
                                    </div>
                                </div>

                                <div className="mt-1">
                                    <div>
                                        <h3 style={{ fontWeight: 'bold' }}>PB Kontrak Pabrik</h3>
                                    </div>
                                    <div>
                                        <div>
                                            <RadioButtonComponent id="Y" label="Ya" name="pbkontrakpabrik" cssClass="e-small" checked={selectedOptionRadio === 'Y'} onChange={handleRadioChange} />
                                            <RadioButtonComponent id="N" label="Tidak" name="pbkontrakpabrik" cssClass="e-small" checked={selectedOptionRadio === 'N'} onChange={handleRadioChange} />
                                            <RadioButtonComponent
                                                id="all"
                                                label="Semua"
                                                name="pbkontrakpabrik"
                                                cssClass="e-small"
                                                checked={selectedOptionRadio === 'all'}
                                                onChange={handleRadioChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <div className="font-bold">
                                        <span style={{ fontWeight: 'bold' }}>Tipe Dokumen</span>
                                    </div>
                                </div>
                                <div className="mt-1">
                                    <div className="flex">
                                        <RadioButtonComponent
                                            id="yes"
                                            label="Persediaan"
                                            name="tipeDokumen"
                                            cssClass="e-small"
                                            checked={selectedTipeDokumenValue === 'yes'}
                                            onChange={handleRadioTipeDokumenChange}
                                        />
                                    </div>

                                    <div className="flex" style={{ marginTop: '7px' }}>
                                        <RadioButtonComponent
                                            id="no"
                                            label="Non Persediaan"
                                            name="tipeDokumen"
                                            cssClass="e-small"
                                            checked={selectedTipeDokumenValue === 'no'}
                                            onChange={handleRadioTipeDokumenChange}
                                        />
                                    </div>
                                    <div className="flex" style={{ marginTop: '7px' }}>
                                        <RadioButtonComponent
                                            id="tipeAll"
                                            label="Semua"
                                            name="tipeDokumen"
                                            cssClass="e-small"
                                            checked={selectedTipeDokumenValue === 'tipeAll'}
                                            onChange={handleRadioTipeDokumenChange}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex h-[34px] w-full items-center justify-center py-2 " >
                                <button
                                     onClick={refreshData}
                                    className="box-border h-[28px] w-[120px] rounded-md bg-[#3a3f5c] px-4 py-1.5  text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                                >
                                    🔃 <u>R</u>efresh
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* ==============================END FILTER============================================== */}

                    {/* ===============  GRID ========================   */}
                    <div className={`panel ${sidebarVisible ? 'w-[calc(100%-250px)]' : 'w-full'}`} style={{ background: '#dedede', overflowY: 'auto', borderRadius: 7 }}>
                        <div className=" flex h-[30px] w-full overflow-x-auto overflow-y-hidden border-b border-gray-300">
                            {tabKlasifikasiArray.map((item: any) => (
                                <motion.button
                                    key={item.Klasifikasi}
                                    onClick={async () => {
                                        setTabAktif(item);
                                    }}
                                    className={`whitespace-nowrap px-3 py-2 text-xs font-semibold ${
                                        tabAktif === item ? 'border-b-2 border-orange-500 text-black' : 'text-gray-500 hover:text-black'
                                    }`}
                                    whileTap={{ scale: 1.1 }} // Menambahkan animasi scale saat ditekan
                                    transition={{ duration: 0.2 }}
                                >
                                    {formatString(item)}
                                </motion.button>
                            ))}
                        </div>
                        <div className={`h-[calc(100%-30px)] w-full ${tabAktif === 'baru' ? 'block' : 'hidden'}`}>
                            <GridComponent
                                id="gridListDataBaru"
                                locale="id"
                                ref={(g) => (gridListDataPra = g)}
                                // dataSource={allRecordsPra}
                                allowExcelExport={true}
                                excelExportComplete={ExportComplete}
                                allowPdfExport={true}
                                pdfExportComplete={ExportComplete}
                                height={'100%'}
                                width={'100%'}
                                gridLines={'Both'}
                                allowPaging={true}
                                // pageSettings={pageSettings}
                                allowSorting={true}
                                selectionSettings={{ type: 'Single' }}
                                rowSelected={(args) => handleRowClick(args.data.persediaan, args.data.kode_lpb, args.data.kontrak, 'baru', args.data.status)}
                                recordDoubleClick={(args: any) => {
                                    const selectedItems = args.rowData;

                                    setSelectedRow(selectedItems.kode_lpb);
                                    setSelectedRowPersediaan(selectedItems.persediaan);
                                    handleNavigateLink('edit');
                                }}
                                rowHeight={23}
                                pageSettings={{ pageSize: 25, pageCount: 5, pageSizes: ['25', '50', '100', 'All'] }}
                                // queryCellInfo={queryCellInfoListData}
                                allowResizing={true}
                                autoFit={true}
                                rowSelecting={(args: any) => {
                                    setSelectedDetail(args.data);
                                }}
                                // rowDataBound={rowDataBoundListData}
                            >
                                <ColumnsDirective>
                                    <ColumnDirective field="no_lpb" headerText="No. PB" width="120" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                    <ColumnDirective field="tgl_lpb" headerText="Tgl. PB" width="80" textAlign="Center" clipMode="EllipsisWithTooltip" />
                                    <ColumnDirective field="persediaan" headerText="Dokumen" width="100" textAlign="Left" clipMode="EllipsisWithTooltip" />
                                    <ColumnDirective field="no_reff" headerText="No. SJ Supplier" width="190" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                    <ColumnDirective field="tgl_sj" headerText="Tgl. SJ" width="80" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                    <ColumnDirective field="nama_relasi" headerText="Supplier" width="250" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                    <ColumnDirective field="nama_gudang" headerText="Gudang" width="190" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                    <ColumnDirective field="dokumen" headerText="Cara Kirim" width="100" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                    <ColumnDirective field="via" headerText="Pengiriman Via" width="150" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                    <ColumnDirective field="nopol" headerText="No. Kendaraan" width="100" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                    <ColumnDirective field="pengemudi" headerText="Pengemudi" width="100" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                    <ColumnDirective field="status" headerText="Status Dok" width="80" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                    <ColumnDirective field="status_dok" headerText="Status PB" width="80" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                </ColumnsDirective>
                                <Inject services={[Page, Selection, Edit, /*Toolbar,*/ Sort, Group, Filter, Resize, Reorder /*, Freeze,*/, ExcelExport, PdfExport]} />
                            </GridComponent>
                        </div>

                        <div className={`h-[calc(100%-30px)] w-full ${tabAktif === 'approved' ? 'block' : 'hidden'}`}>
                            <GridComponent
                                id="gridListDataApproved"
                                locale="id"
                                ref={(g) => (gridListData = g as Grid)}
                                // dataSource={allRecords}
                                allowExcelExport={true}
                                excelExportComplete={ExportComplete}
                                allowPdfExport={true}
                                pdfExportComplete={ExportComplete}
                                height={'100%'}
                                width={'100%'}
                                gridLines={'Both'}
                                allowPaging={true}
                                // pageSettings={pageSettings}
                                allowSorting={true}
                                selectionSettings={{ type: 'Single' }}
                                rowSelected={(args) => {
                                    handleRowClick(args.data.persediaan, args.data.kode_lpb, args.data.kontrak, 'approved', args.data.status);
                                }}
                                recordDoubleClick={(args: any) => {
                                    const selectedItems = args.rowData;

                                    setSelectedRow(selectedItems.kode_lpb);
                                    handleNavigateLink('edit');
                                }}
                                rowHeight={23}
                                pageSettings={{ pageSize: 25, pageCount: 5, pageSizes: ['25', '50', '100', 'All'] }}
                                // queryCellInfo={queryCellInfoListData}
                                allowResizing={true}
                                autoFit={true}
                                rowSelecting={(args: any) => {
                                    setSelectedDetail(args.data);
                                }}
                                // rowDataBound={rowDataBoundListData}
                            >
                                <ColumnsDirective>
                                    <ColumnDirective field="no_lpb" headerText="No. PB" width="120" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                    <ColumnDirective field="tgl_lpb" headerText="Tgl. PB" width="80" textAlign="Center" clipMode="EllipsisWithTooltip" />
                                    <ColumnDirective field="persediaan" headerText="Dokumen" width="100" textAlign="Left" clipMode="EllipsisWithTooltip" />

                                    <ColumnDirective field="no_reff" headerText="No. SJ Supplier" width="190" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                    <ColumnDirective field="tgl_sj" headerText="Tgl. SJ" width="80" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                    <ColumnDirective field="nama_relasi" headerText="Supplier" width="250" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                    <ColumnDirective field="nama_gudang" headerText="Gudang" width="190" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                    <ColumnDirective field="dokumen" headerText="Cara Kirim" width="100" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                    <ColumnDirective field="via" headerText="Pengiriman Via" width="150" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                    <ColumnDirective field="nopol" headerText="No. Kendaraan" width="100" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                    <ColumnDirective field="pengemudi" headerText="Pengemudi" width="100" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                    <ColumnDirective field="status" headerText="Status Dok" width="80" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                    <ColumnDirective field="status_dok" headerText="Status PB" width="80" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                </ColumnsDirective>
                                <Inject services={[Page, Selection, Edit, /*Toolbar,*/ Sort, Group, Filter, Resize, Reorder /*, Freeze,*/, ExcelExport, PdfExport]} />
                            </GridComponent>
                        </div>
                    </div>
                    {/* ===============  END GRID ========================   */}
                    {selectedItem && (
                        <DialogComponent
                            id="dialogJenisTransaksiMB"
                            name="dialogJenisTransaksiMB"
                            className="dialogJenisTransaksiMB"
                            // target="#main-target"
                            header={`Detail Penerimaan Barang : ${selectedDetail.no_lpb} - ${selectedDetail.tgl_lpb}`}
                            visible={selectedItem}
                            // isModal={true}
                            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                            enableResize={true}
                            resizeHandles={['All']}
                            allowDragging={true}
                            showCloseIcon={true}
                            width="900"
                            height="550"
                            position={{ X: 'right', Y: '50' }}
                            style={{ position: 'fixed' }}
                            close={() => {
                                closeModal();
                            }}
                        >
                            <div className="h-full w-full overflow-auto">
                                <GridComponent
                                    gridLines={'Both'}
                                    allowResizing={true}
                                    locale="id"
                                    // style={{ width: '100%', height: '68%' }}
                                    dataSource={detailFetch}
                                    selectionSettings={{ mode: 'Row', type: 'Single' }}
                                    autoFit={true}
                                    rowHeight={22}
                                    width={'100%'}
                                    height={'100%'}
                                >
                                    <ColumnsDirective>
                                        <ColumnDirective field="no_sp" headerText="No. PO" width="110" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                        <ColumnDirective field="no_item" headerText="No. Barang" width="100" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                        <ColumnDirective field="diskripsi" headerText="Nama Barang" width="210" textAlign="Left" headerTextAlign="Center" clipMode="EllipsisWithTooltip" />
                                        <ColumnDirective headerTemplate={templatePO} width="160" columns={templateColumnPO} />
                                        <ColumnDirective headerTemplate={templateSJ} width="160" columns={templateColumnSJ} />
                                        <ColumnDirective headerTemplate={templatePB} width="160" columns={templateColumnPB} />
                                    </ColumnsDirective>
                                    <Inject services={[Page, Sort, Filter, Group, Resize]} />
                                </GridComponent>
                                {/* <ContextMenuComponent id="contextmenu" target=".e-gridheader" items={menuHeaderItems} select={menuHeaderSelect} animationSettings={{ duration: 500, effect: 'FadeIn' }} /> */}
                                <style>
                                    {`
                    .e-row .e-rowcell:hover {
                        cursor: pointer;
                    }

                    .e-row.e-selectionbackground {
                        cursor: pointer;
                    }
                `}
                                </style>
                            </div>
                        </DialogComponent>
                    )}
                </div>
                {baru && (
                    <DialogComponent
                        id="dialogJenisTransaksiMB"
                        name="dialogJenisTransaksiMB"
                        className="dialogJenisTransaksiMB"
                        target="#main-target"
                        header="Jenis Transaksi"
                        visible={baru}
                        isModal={true}
                        animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                        // enableResize={true}
                        resizeHandles={['All']}
                        allowDragging={true}
                        showCloseIcon={true}
                        width="50"
                        height="175"
                        position={{ X: 'center', Y: 'center' }}
                        style={{ position: 'fixed' }}
                        close={() => {
                            setBaru(false);
                        }}
                        // buttons={buttonInputData}
                    >
                        <div style={{ marginLeft: 30, marginBottom: 10 }}>
                            <ButtonComponent cssClass="e-secondary e-small" style={{ width: '85%' }} onClick={() => handleKontrak('persediaan')}>
                                Kontrak
                            </ButtonComponent>
                        </div>
                        <div style={{ marginLeft: 30, marginBottom: 10 }}>
                            <ButtonComponent cssClass="e-secondary e-small" style={{ width: '85%' }} onClick={() => handleNonKontrak('persediaan')}>
                                Non Kontrak
                            </ButtonComponent>
                        </div>
                        <br></br>
                        <div style={{ marginLeft: 30, marginBottom: 10 }}>
                            <ButtonComponent cssClass="e-secondary e-small" style={{ width: '85%' }} onClick={() => handleNonKontrak('nonPersediaan')}>
                                Barang Non Persediaan
                            </ButtonComponent>
                        </div>
                    </DialogComponent>
                )}
            </div>
        </div>
    );
};

export default PenerimaanBarangList;
