import { useEffect, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowsRotate, faBook, faMagnifyingGlass, faPlay, faSquareCaretDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import 'tippy.js/dist/tippy.css';
import styles from './polist.module.css';
import stylesIndex from '@styles/index.module.css';
import Dropdown from '../../../../../components/Dropdown';
import { useRouter } from 'next/router';
import sortBy from 'lodash/sortBy';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import swal from 'sweetalert2';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/id';
import { frmNumber, showLoading, usersMenu } from '@/utils/routines';
import FormatNumber from './component/formatNumber';
import JenisTransaksi from './modal/jenisTransaksi';
import { AccDireksi, dataDetailDok, listPo, refreshListData } from './model/api';
import Draggable from 'react-draggable';
import { Dialog, Transition } from '@headlessui/react';
import {
    OnClick_CetakDaftarPP,
    OnClick_CetakFormPo,
    OnClick_CetakFormPoBarangProduksiModel2,
    OnClick_CetakFormPoBarangProduksiModel3,
    OnClick_CetakFormPoBarangProduksiModel4,
    OnClick_CetakFormPoTanpaHarga,
    OnClick_CetakFormPraPpBarangProduksiModel2,
    OnClick_CetakFormPraPpBarangProduksiModel3,
    OnClick_CetakFormPraPpBarangProduksiModel4,
    buttonAccDireksi,
    buttonApproval,
    buttonDetailDok,
    buttonHapusRows,
    buttonPembatalan,
    buttonUbah,
    rowDoubleClick,
    buttonUpdateFile,
    OnClick_CetakFormPoNonPkp,
} from './component/fungsi';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { SidebarComponent, SidebarType, ContextMenuComponent, MenuItemModel } from '@syncfusion/ej2-react-navigations';
import { MenuEventArgs } from '@syncfusion/ej2-react-splitbuttons';
import { Tab as Tabsheadle } from '@headlessui/react';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
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
// interface POListProps {
//     userid: any;
//     kode_entitas: any;
//     nip: any;
// }
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json'; // To load the culture based first day of week

loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);

import idIDLocalization from 'public/syncfusion/locale.json';
L10n.load(idIDLocalization);

import { useSession } from '@/pages/api/sessionContext';

interface QueryParams {
    [key: string]: string;
}

const POList = () => {
    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const nip = sessionData?.nip ?? '';

    if (isLoading) {
        return;
    }

    let decodedData: string = '';
    let routeKodePBValue: any,
        routeNoPo: any,
        routeNamaSupp: any,
        routeNamaBarang: any,
        routeTipeDokumen: any,
        routeTglAwal: any,
        routeTglAkhir: any,
        routeTglBerlaku1: any,
        routeTglBerlaku2: any,
        routeTglKirim1: any,
        routeTglKirim2: any,
        routeNoPoChecked: any,
        routeNamaSuppChecked: any,
        routeNamaBarangChecked: any,
        routeStatusDok: any,
        routeStatusApp: any,
        routeTanggalChecked: any,
        routeIsPoKontrakChecked: any,
        routeIsPoNonKontrakChecked: any,
        routeIsPoBarangProduksiChecked: any,
        routeIsPoDenganPajakChecked: any,
        routeIsKirimanLangsungChecked: any,
        routeIsPembatalanOrderChecked: any,
        routeIsBelumAccDireksiChecked: any,
        routeIsSudahAccDireksiChecked: any;
    const router = useRouter();

    const { str } = router.query;

    if (typeof str === 'string') {
        decodedData = Buffer.from(str, 'base64').toString('ascii');

        const parseValue = (value: string): any => {
            if (value === 'true') return true;
            if (value === 'false') return false;
            return value;
        };

        const queryParams = decodedData.split('&').reduce((acc: QueryParams, keyValue) => {
            const [key, value] = keyValue.split('=');
            acc[key] = parseValue(value);
            return acc;
        }, {} as QueryParams);

        const {
            tglAwal,
            tglAkhir,
            tglBerlaku1,
            tglBerlaku2,
            tglKirim1,
            tglKirim2,
            vTipeDokumen,
            noPo,
            namaSupp,
            namaBarang,

            isPoKontrakChecked,
            isPoNonKontrakChecked,
            isPoBarangProduksiChecked,
            isPoDenganPajakChecked,
            isKirimanLangsungChecked,
            isPembatalanOrderChecked,
            isBelumAccDireksiChecked,
            isSudahAccDireksiChecked,

            noPoChecked,
            namaSuppChecked,
            namaBarangChecked,
            statusDok,
            statusApp,
            vTanggalChecked,
        } = queryParams;

        routeTglAwal = tglAwal;
        routeTglAkhir = tglAkhir;
        routeTglBerlaku1 = tglBerlaku1;
        routeTglBerlaku2 = tglBerlaku2;
        routeTglKirim1 = tglKirim1;
        routeTglKirim2 = tglKirim2;
        routeTipeDokumen = vTipeDokumen;
        routeNoPo = noPo;
        routeNamaSupp = namaSupp;
        routeNamaBarang = namaBarang;

        routeIsPoKontrakChecked = isPoKontrakChecked;
        routeIsPoNonKontrakChecked = isPoNonKontrakChecked;
        routeIsPoBarangProduksiChecked = isPoBarangProduksiChecked;
        routeIsPoDenganPajakChecked = isPoDenganPajakChecked;
        routeIsKirimanLangsungChecked = isKirimanLangsungChecked;
        routeIsPembatalanOrderChecked = isPembatalanOrderChecked;
        routeIsBelumAccDireksiChecked = isBelumAccDireksiChecked;
        routeIsSudahAccDireksiChecked = isSudahAccDireksiChecked;

        routeNoPoChecked = noPoChecked;
        routeNamaSuppChecked = namaSuppChecked;
        routeNamaBarangChecked = namaBarangChecked;
        routeStatusDok = statusDok;
        routeStatusApp = statusApp;
        routeTanggalChecked = vTanggalChecked;
    }

    type POListItem = {
        kode_sp: string;
        no_sp: any;
        tgl_sp: any;
        tgl_berlaku: any;
        tgl_kirim: any;
        nama_relasi: any;
        nama_termin: any;
        kirim_mu: any;
        netto_mu: any;
        pajak: any;
        total_berat: any;
        status: any;
        status_app: any;
        produksi: any;
        approval: any;
        ket: any;
        nip2: any;
        tipe_dokumen: any;
        status_batal: any;
        kontrak: any;
    };

    const styleButton = { width: 57 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#3b3f5c' };
    const styleButtonApp = { fontWeight: 'bold', width: 57 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#e6e6e6' };
    const styleButtonDisabled = { width: 57 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#ece7f5' };
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [windowHeight, setWindowHeight] = useState(0);
    const gridWidth = sidebarVisible ? 'calc(100% - 315px)' : '100%';
    let sidebarObj: SidebarComponent;
    let type: SidebarType = 'Push';
    let mediaQueryState: string = '(min-width: 600px)';
    const [tipeDokumen, setTipeDokumen] = useState(routeTipeDokumen === undefined ? 'yes' : routeTipeDokumen);

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

    const toggleClick = () => {
        setSidebarVisible(true);
    };
    const closeClick = () => {
        setSidebarVisible(false);
    };

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [25, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'kode_pp',
        direction: 'asc',
    });

    const [totalRecords, setTotalRecords] = useState(0);
    const [allRecords, setAllRecords] = useState<POListItem[]>([]);

    //checkbox filter
    const [noPOValue, setNoPOValue] = useState<string>(routeNoPo === undefined ? '' : routeNoPo);
    const [isNoPOChecked, setIsNoPOChecked] = useState<boolean>(routeNoPo === undefined || routeNoPo === '' || routeNoPo === null ? false : true);

    // const [date1, setDate1] = useState<moment.Moment>(moment());
    const [date1, setDate1] = useState<moment.Moment>(routeTglAwal === undefined ? moment() : moment(routeTglAwal));
    // const [date2, setDate2] = useState<moment.Moment>(moment().endOf('month'));
    const [date2, setDate2] = useState<moment.Moment>(routeTglAkhir === undefined ? moment().endOf('month') : moment(routeTglAkhir));
    const [isTanggalChecked, setIsTanggalChecked] = useState<boolean>(
        routeTanggalChecked === undefined || routeTanggalChecked === '' || routeTanggalChecked === null ? true : routeTanggalChecked === 'false' ? false : true
    );

    const [dateberlaku1, setDateberlaku1] = useState<moment.Moment>(routeTglBerlaku1 === undefined ? moment() : moment(routeTglBerlaku1));
    const [dateberlaku2, setDateberlaku2] = useState<moment.Moment>(routeTglBerlaku2 === undefined ? moment().endOf('month') : moment(routeTglBerlaku2));
    const [isTanggalberlakuChecked, setIsTanggalberlakuChecked] = useState<boolean>(false);

    const [datekirim1, setDatekirim1] = useState<moment.Moment>(routeTglKirim1 === undefined ? moment() : moment(routeTglKirim1));
    const [datekirim2, setDatekirim2] = useState<moment.Moment>(routeTglKirim2 === undefined ? moment().endOf('month') : moment(routeTglKirim2));
    const [isTanggalkirimChecked, setIsTanggalkirimChecked] = useState<boolean>(false);

    const [statusDokValue, setStatusDokValue] = useState<string>(routeStatusDok === undefined ? '' : routeStatusDok);
    const [isStatusDokChecked, setIsStatusDokChecked] = useState<boolean>(routeStatusDok === undefined || routeStatusDok === '' || routeStatusDok === null ? false : true);

    const [statusAppValue, setStatusAppValue] = useState<string>(routeStatusApp === undefined ? '' : routeStatusApp);
    const [isStatusAppChecked, setIsStatusAppChecked] = useState<boolean>(routeStatusApp === undefined || routeStatusApp === '' || routeStatusApp === null ? false : true);

    const [isProduksiChecked, setIsProduksiChecked] = useState<boolean>(false);
    const [isPembatalanChecked, setIsPembatalanChecked] = useState<boolean>(false);

    // ==========
    const [isNamaSuppChecked, setIsNamaSuppChecked] = useState<boolean>(routeNamaSupp === undefined || routeNamaSupp === '' || routeNamaSupp === null ? false : true);
    const [namaSuppValue, setNamaSuppValue] = useState<string>(routeNamaSupp === undefined ? '' : routeNamaSupp);

    const [isNamaBarangChecked, setIsNamaBarangChecked] = useState<boolean>(routeNamaBarang === undefined || routeNamaBarang === '' || routeNamaBarang === null ? false : true);
    const [namaBarangValue, setNamaBarangValue] = useState<string>(routeNamaBarang === undefined ? '' : routeNamaBarang);

    const [isPoKontrakChecked, setIsPoKontrakChecked] = useState<boolean>(routeIsPoKontrakChecked === undefined ? false : routeIsPoKontrakChecked);
    const [isPoNonKontrakChecked, setIsPoNonKontrakChecked] = useState<boolean>(routeIsPoNonKontrakChecked === undefined ? false : routeIsPoNonKontrakChecked);
    const [isPoBarangProduksiChecked, setIsPoBarangProduksiChecked] = useState<boolean>(routeIsPoBarangProduksiChecked === undefined ? false : routeIsPoBarangProduksiChecked);
    const [isPoDenganPajakChecked, setIsPoDenganPajakChecked] = useState<boolean>(routeIsPoDenganPajakChecked === undefined ? false : routeIsPoDenganPajakChecked);

    const [isKirimanLangsungChecked, setIsKirimanLangsungChecked] = useState<boolean>(routeIsKirimanLangsungChecked === undefined ? false : routeIsKirimanLangsungChecked);
    const [isPembatalanOrderChecked, setIsPembatalanOrderChecked] = useState<boolean>(routeIsPembatalanOrderChecked === undefined ? false : routeIsPembatalanOrderChecked);
    const [isBelumAccDireksiChecked, setIsBelumAccDireksiChecked] = useState<boolean>(routeIsBelumAccDireksiChecked === undefined ? false : routeIsBelumAccDireksiChecked);
    const [isSudahAccDireksiChecked, setIsSudahAccDireksiChecked] = useState<boolean>(routeIsSudahAccDireksiChecked === undefined ? false : routeIsSudahAccDireksiChecked);
    // ===========

    // Radio Button
    const [kelSupp, setKelSupp] = useState<string>('');
    // const [kelSuppSemua, setKelSuppSemua] = useState<string>('');
    // const [kelSuppBesi, setKelSuppBesi] = useState<string>('');
    // const [kelSuppNonBesi, setKelSuppNonBesi] = useState<string>('');
    // const [kelSuppBesidanNonBesi, setKelSuppBesidanNonBesi] = useState<string>('');

    //pencarian
    const [searchNoPo, setSearchNoPo] = useState('');
    const [searchKeterangan, setSearchKeterangan] = useState('');

    const pencarianNoPo = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.target.value;
        setSearchNoPo(searchValue);
    };

    const pencarianKet = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.target.value;
        setSearchKeterangan(searchValue);
    };

    //handle input filter
    const handleNoPOInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setNoPOValue(newValue);
        setIsNoPOChecked(newValue.length > 0);
    };
    const handleStatusDokInputChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = event.target.value;
        setStatusDokValue(newValue);
        setIsStatusDokChecked(newValue.length > 0);
    };
    const handleStatusAppInputChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = event.target.value;
        setStatusAppValue(newValue);
        setIsStatusAppChecked(newValue.length > 0);
    };

    const handleNamaSuppInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setNamaSuppValue(newValue);
        setIsNamaSuppChecked(newValue.length > 0);
    };

    const handleNamaBarangChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setNamaBarangValue(newValue);
        setIsNamaBarangChecked(newValue.length > 0);
    };

    // const handleKelSuppSemua = () => {};
    const handleKelSupp = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        // alert(newValue);
        setKelSupp(newValue);
    };

    const handleTipeDok = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setTipeDokumen(newValue);
    };

    //select baris
    const [selectedRow, setSelectedRow] = useState('');
    const [selectedTipeJenisBarang, setSelectedTipeJenisBarang] = useState('');
    const [statusDok, setStatusDok] = useState('');
    const [noSp, setNoSp] = useState('');
    const [tglSp, setTglSp] = useState('');
    const [filterTipeDokumen, setFilterTipeDokumen] = useState('');
    const [kontrak, setKontrak] = useState('');

    const handleRowClick = (kontrak: any, tipe_dokumen: any, kode_sp: any, produksi: any, status: any, no_sp: any, tgl_sp: any) => {
        setSelectedRow(kode_sp);
        setSelectedTipeJenisBarang(produksi);
        setStatusDok(status);
        setNoSp(no_sp);
        setTglSp(tgl_sp);
        listDetailDok(kode_sp);
        setFilterTipeDokumen(tipe_dokumen);
        setKontrak(kontrak);
    };

    const handleRowDoubleClick = (kontrak: any, tipe_dokumen: any, kode_sp: any, produksi: any, status: any) => {
        setSelectedRow(kode_sp);
        setStatusDok(status);
        if (userMenu.edit !== 'N' || userid === 'administrator') {
            const result = rowDoubleClick(
                kontrak,
                produksi,
                kode_sp,
                tipe_dokumen,
                date1,
                date2,
                dateberlaku1,
                dateberlaku2,
                datekirim1,
                datekirim2,
                tipeDokumen,
                noPOValue,
                namaSuppValue,
                namaBarangValue,

                isPoKontrakChecked,
                isPoNonKontrakChecked,
                isPoBarangProduksiChecked,
                isPoDenganPajakChecked,
                isKirimanLangsungChecked,
                isPembatalanOrderChecked,
                isBelumAccDireksiChecked,
                isSudahAccDireksiChecked,

                isNoPOChecked,
                isNamaSuppChecked,
                isNamaBarangChecked,
                statusDokValue,
                statusAppValue,
                isTanggalChecked
            );
            router.push({ pathname: './po', query: { str: result } });
        }
        setFilterTipeDokumen(tipe_dokumen);
    };

    //modal
    const [baru, setBaru] = useState(false);
    const [baruSelected, setbaruSelected] = useState();
    const handleSelectedData = (selectedData: any) => {
        setbaruSelected(selectedData);
    };

    // Fetch and process data
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const [recordsData, setRecordsData] = useState<POListItem[]>([]);
    const [poa, setPoa] = useState(''); // akses untuk bisa approval
    const [accPo, setAccPo] = useState(''); // akses untuk bisa ACC Direksi
    interface UserMenuState {
        baru: any;
        edit: any;
        hapus: any;
        cetak: any;
    }
    const [userMenu, setUserMenu] = useState<UserMenuState>({ baru: '', edit: '', hapus: '', cetak: '' });

    useEffect(() => {
        const tanggalSekarang = moment();
        // Menentukan tanggal awal bulan
        const tanggalAwalBulan = tanggalSekarang.startOf('month');
        // Menentukan tanggal akhir bulan dengan moment.js
        const tanggalHariIni = moment(new Date()).format('YYYY-MM-DD');
        const tanggalAkhirBulan = moment(tanggalAwalBulan.endOf('month')).format('YYYY-MM-DD');
        const kode_menu = '30200'; // kode menu PO
        const fetchDataUseEffect = async () => {
            showLoading();

            try {
                const responseData = await listPo(
                    isTanggalChecked,
                    isTanggalberlakuChecked,
                    isTanggalkirimChecked,
                    date1,
                    date2,
                    dateberlaku1,
                    dateberlaku2,
                    datekirim1,
                    datekirim2,
                    kode_entitas,
                    tipeDokumen,
                    isNoPOChecked,
                    noPOValue,
                    isNamaSuppChecked,
                    namaSuppValue,
                    isNamaBarangChecked,
                    namaBarangValue,
                    isStatusDokChecked,
                    statusDokValue,
                    isStatusAppChecked,
                    statusAppValue,

                    isPoKontrakChecked,
                    isPoNonKontrakChecked,
                    isPoBarangProduksiChecked,
                    isPoDenganPajakChecked,
                    isKirimanLangsungChecked,
                    isPembatalanOrderChecked,
                    isBelumAccDireksiChecked,
                    isSudahAccDireksiChecked
                );
                if (responseData !== undefined && 'responseData' in responseData) {
                    const transformedData: POListItem[] = (responseData as { responseData: any[] }).responseData.map((item: any) => ({
                        kode_sp: item.kode_sp,
                        no_sp: item.no_sp,
                        tgl_sp: moment(item.tgl_sp).format('DD-MM-YYYY'),
                        tgl_berlaku: moment(item.tgl_berlaku).format('DD-MM-YYYY'),
                        tgl_kirim: moment(item.tgl_kirim).format('DD-MM-YYYY'),
                        nama_relasi: item.nama_relasi,
                        nama_termin: item.nama_termin,
                        kirim_mu: item.kirim_mu,
                        netto_mu: item.netto_mu,
                        pajak: item.pajak,
                        total_berat: item.total_berat,
                        status: item.status,
                        status_app: item.status_app,
                        produksi: item.produksi,
                        approval: item.approval,
                        ket: item.ket,
                        nip2: item.nip2,
                        tipe_dokumen: item.tipe_dokumen,
                        status_batal: item.status_batal,
                        kontrak: item.kontrak,
                    }));
                    setAllRecords(transformedData);
                    setTotalRecords(transformedData.length);
                }
                // const {transformedData, length} = result;

                // setAllRecords(transformedData);
                // setTotalRecords(length);
                const usersApp = await axios.get(`${apiUrl}/erp/users_app`, {
                    params: {
                        entitas: kode_entitas,
                        param1: userid,
                    },
                });
                const users_app = usersApp.data.data;
                setPoa(users_app[0].poa);
                setAccPo(users_app[0].acc_po);

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
            } catch (error) {
                console.error('Error fetching data:', error);
            }
            swal.close();
        };
        fetchDataUseEffect();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [pageSize, searchNoPo, searchKeterangan]);

    useEffect(() => {
        //  const Pagination = (records: any, page: any, totalRecords: any, recordsDataSetter: any) => {
        const from = (page - 1) * pageSize;
        const to = Math.min(from + pageSize, totalRecords);

        const sortedData = [...allRecords].sort((a, b) => {
            const columnAccessor = sortStatus.columnAccessor as keyof POListItem;
            const direction = sortStatus.direction === 'asc' ? 1 : -1;

            if (a[columnAccessor] < b[columnAccessor]) return -direction;
            if (a[columnAccessor] > b[columnAccessor]) return direction;
            return 0;
        });

        // filter berdasarkan kata kunci pencarian
        let filteredData = sortedData;

        if (searchNoPo) {
            filteredData = recordsData.filter((item) => item.no_sp.toLowerCase().startsWith(searchNoPo.toLowerCase()));
        }

        if (searchKeterangan) {
            filteredData = recordsData.filter((item) => item.ket.toLowerCase().includes(searchKeterangan.toLowerCase()));
        }

        const dataToDisplay = filteredData.slice(from, to);
        setRecordsData(dataToDisplay);
    }, [page, pageSize, sortStatus, allRecords, totalRecords, searchNoPo, searchKeterangan]);

    // Visible panel sidebar
    const [panelVisible, setPanelVisible] = useState(true);

    const handleTogglePanel = () => {
        setPanelVisible(!panelVisible);
    };
    const handleFilterClick = () => {
        setPanelVisible(true);
    };

    // Fungsi Refresh data Filter
    const refreshData = async () => {
        showLoading();
        if (kode_entitas !== null || kode_entitas !== '') {
            try {
                let vNoPo = 'all';
                let vTglAwal = 'all';
                let vTglAkhir = 'all';
                let vTglBerlakuAwal = 'all';
                let vTglBerlakuAkhir = 'all';
                let vTglKirimAwal = 'all';
                let vTglKirimAkhir = 'all';
                let vNamaSupp = 'all';
                let vNamaBarang = 'all';
                let vStatusDokumen = 'all';
                let vStatusApproval = 'all';
                let vKelSupplier = 'all';
                let vPoKontak = 'all';
                let vPoNonKontrak = 'all';
                let vPoBarangProduksi = 'all';
                let vPoDenganPajak = 'all';
                let vKirimLangsung = 'all';
                let vPembatalanOrder = 'all';
                let vBelumAccDireksi = 'all';
                let vSudahAccDireksi = 'all';
                let vTipeDokumen = 'Persediaan';
                let vLimit = '10000';

                if (isNoPOChecked) {
                    vNoPo = `${noPOValue}`;
                }

                if (isTanggalChecked) {
                    const formattedDate1 = date1.format('YYYY-MM-DD');
                    const formattedDate2 = date2.format('YYYY-MM-DD');
                    vTglAwal = `${formattedDate1}`;
                    vTglAkhir = `${formattedDate2}`;
                }

                if (isTanggalberlakuChecked) {
                    const formattedDate1 = date1.format('YYYY-MM-DD');
                    const formattedDate2 = date2.format('YYYY-MM-DD');
                    vTglBerlakuAwal = `${formattedDate1}`;
                    vTglBerlakuAkhir = `${formattedDate2}`;
                }

                if (isTanggalkirimChecked) {
                    const formattedDate1 = date1.format('YYYY-MM-DD');
                    const formattedDate2 = date2.format('YYYY-MM-DD');
                    vTglKirimAwal = `${formattedDate1}`;
                    vTglKirimAkhir = `${formattedDate2}`;
                }

                if (isNamaSuppChecked) {
                    vNamaSupp = `${namaSuppValue}`;
                }

                if (isNamaBarangChecked) {
                    vNamaBarang = `${namaBarangValue}`;
                }

                if (isStatusDokChecked) {
                    vStatusDokumen = `${statusDokValue}`;
                }

                if (isStatusAppChecked) {
                    vStatusApproval = `${statusAppValue}`;
                }

                // Radio Button belum
                if (kelSupp !== '') {
                    vKelSupplier = `${kelSupp}`;
                }

                if (isPoKontrakChecked) {
                    vPoKontak = `Y`;
                }

                if (isPoNonKontrakChecked) {
                    vPoNonKontrak = `Y`;
                }

                if (isPoBarangProduksiChecked) {
                    vPoBarangProduksi = 'Y';
                }

                if (isPoDenganPajakChecked) {
                    vPoDenganPajak = 'I';
                }

                if (isKirimanLangsungChecked) {
                    vKirimLangsung = 'Y';
                }

                if (isPembatalanOrderChecked) {
                    vPembatalanOrder = 'Y';
                }

                if (isBelumAccDireksiChecked) {
                    vBelumAccDireksi = 'Y';
                }

                if (isSudahAccDireksiChecked) {
                    vSudahAccDireksi = 'Y';
                }

                if (tipeDokumen === 'tipeAll') {
                    vTipeDokumen = `all`;
                } else if (tipeDokumen === 'yes') {
                    vTipeDokumen = 'Persediaan';
                } else {
                    vTipeDokumen = 'Non Persediaan';
                }

                let dataObject: any;

                dataObject = {
                    kode_entitas: kode_entitas,
                    vNoPo: vNoPo,
                    vTglAwal: vTglAwal,
                    vTglAkhir: vTglAkhir,
                    vTglBerlakuAwal: vTglBerlakuAwal,
                    vTglBerlakuAkhir: vTglBerlakuAkhir,
                    vTglKirimAwal: vTglKirimAwal,
                    vTglKirimAkhir: vTglKirimAkhir,
                    vNamaSupp: vNamaSupp,
                    vNamaBarang: vNamaBarang,
                    vStatusDokumen: vStatusDokumen,
                    vStatusApproval: vStatusApproval,
                    vKelSupplier: vKelSupplier,
                    vPoKontak: vPoKontak,
                    vPoNonKontrak: vPoNonKontrak,
                    vPoBarangProduksi: vPoBarangProduksi,
                    vPoDenganPajak: vPoDenganPajak,
                    vKirimLangsung: vKirimLangsung,
                    vPembatalanOrder: vPembatalanOrder,
                    vBelumAccDireksi: vBelumAccDireksi,
                    vSudahAccDireksi: vSudahAccDireksi,
                    vLimit: vLimit,
                    vTipeDokumen: vTipeDokumen,
                };

                const responseData = await refreshListData(dataObject);
                const transformedData: POListItem[] = responseData.map((item: any) => ({
                    kode_sp: item.kode_sp,
                    no_sp: item.no_sp,
                    tgl_sp: moment(item.tgl_sp).format('DD-MM-YYYY'),
                    tgl_berlaku: moment(item.tgl_berlaku).format('DD-MM-YYYY'),
                    tgl_kirim: moment(item.tgl_kirim).format('DD-MM-YYYY'),
                    nama_relasi: item.nama_relasi,
                    nama_termin: item.nama_termin,
                    kirim_mu: item.kirim_mu,
                    netto_mu: item.netto_mu,
                    pajak: item.pajak,
                    total_berat: item.total_berat,
                    status: item.status,
                    status_app: item.status_app,
                    produksi: item.produksi,
                    approval: item.approval,
                    ket: item.ket,
                    nip2: item.nip2,
                    tipe_dokumen: item.tipe_dokumen,
                    status_batal: item.status_batal,
                    kontrak: item.kontrak,
                }));
                console.log('transformedData = ', transformedData);
                setAllRecords(transformedData);
                setTotalRecords(transformedData.length);
            } catch (error) {
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
    //End

    const [detailDok, setDetailDok] = useState<any[]>([]);

    const listDetailDok = async (kode_sp: any) => {
        try {
            const result: any[] = await dataDetailDok(kode_sp, kode_entitas);
            setDetailDok(result);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const setDataDokumenPo = (tipe: string) => {
        if (selectedRow !== '') {
            if (tipe === 'ubah') {
                const result = buttonUbah(
                    kontrak,
                    selectedTipeJenisBarang,
                    selectedRow,
                    filterTipeDokumen,
                    date1,
                    date2,
                    dateberlaku1,
                    dateberlaku2,
                    datekirim1,
                    datekirim2,
                    tipeDokumen,
                    noPOValue,
                    namaSuppValue,
                    namaBarangValue,
                    isNoPOChecked,
                    isNamaSuppChecked,
                    isNamaBarangChecked,
                    statusDokValue,
                    statusAppValue,
                    isTanggalChecked
                );
                router.push({ pathname: './po', query: { str: result } });
            } else if (tipe === 'approval') {
                const result = buttonApproval(
                    statusDok,
                    selectedTipeJenisBarang,
                    selectedRow,
                    filterTipeDokumen,
                    date1,
                    date2,
                    dateberlaku1,
                    dateberlaku2,
                    datekirim1,
                    datekirim2,
                    tipeDokumen,
                    noPOValue,
                    namaSuppValue,
                    namaBarangValue,

                    isPoKontrakChecked,
                    isPoNonKontrakChecked,
                    isPoBarangProduksiChecked,
                    isPoDenganPajakChecked,
                    isKirimanLangsungChecked,
                    isPembatalanOrderChecked,
                    isBelumAccDireksiChecked,
                    isSudahAccDireksiChecked,

                    isNoPOChecked,
                    isNamaSuppChecked,
                    isNamaBarangChecked,
                    statusDokValue,
                    statusAppValue,
                    isTanggalChecked
                );
                if (result !== '') {
                    router.push({ pathname: './po', query: { str: result } });
                }
            } else if (tipe === 'pembatalan') {
                const result = buttonPembatalan(
                    statusDok,
                    selectedTipeJenisBarang,
                    selectedRow,
                    filterTipeDokumen,
                    date1,
                    date2,
                    dateberlaku1,
                    dateberlaku2,
                    datekirim1,
                    datekirim2,
                    tipeDokumen,
                    noPOValue,
                    namaSuppValue,
                    namaBarangValue,

                    isPoKontrakChecked,
                    isPoNonKontrakChecked,
                    isPoBarangProduksiChecked,
                    isPoDenganPajakChecked,
                    isKirimanLangsungChecked,
                    isPembatalanOrderChecked,
                    isBelumAccDireksiChecked,
                    isSudahAccDireksiChecked,

                    isNoPOChecked,
                    isNamaSuppChecked,
                    isNamaBarangChecked,
                    statusDokValue,
                    statusAppValue,
                    isTanggalChecked
                );
                if (result !== '') {
                    router.push({ pathname: './po', query: { str: result } });
                }
            } else if (tipe === 'accDireksi') {
                buttonAccDireksi(noSp, tglSp, selectedRow, kode_entitas, nip);
            } else if (tipe === 'detailDok') {
                const result = buttonDetailDok(selectedRow);
                setSelectedItem(result);
                listDetailDok(result);
            } else if (tipe === 'hapusRows') {
                buttonHapusRows(noSp, tglSp, selectedRow, kode_entitas, nip);
            } else if (tipe === 'updateFile') {
                const result = buttonUpdateFile(
                    selectedTipeJenisBarang,
                    selectedRow,
                    filterTipeDokumen,
                    date1,
                    date2,
                    dateberlaku1,
                    dateberlaku2,
                    datekirim1,
                    datekirim2,
                    tipeDokumen,
                    noPOValue,
                    namaSuppValue,
                    namaBarangValue,

                    isPoKontrakChecked,
                    isPoNonKontrakChecked,
                    isPoBarangProduksiChecked,
                    isPoDenganPajakChecked,
                    isKirimanLangsungChecked,
                    isPembatalanOrderChecked,
                    isBelumAccDireksiChecked,
                    isSudahAccDireksiChecked,

                    isNoPOChecked,
                    isNamaSuppChecked,
                    isNamaBarangChecked,
                    statusDokValue,
                    statusAppValue,
                    isTanggalChecked
                );
                router.push({ pathname: './po', query: { str: result } });
            }
        } else {
            swal.fire({
                title: 'Pilih Data terlebih dahulu.',
                icon: 'error',
            });
        }
    };

    const [modalPosition, setModalPosition] = useState({ top: '35%', right: '10%', width: '100%', background: '#dedede' });
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const closeModal = () => {
        setSelectedItem(null);
    };

    const colorNonApproval = { color: '#66AAEE', fontWeight: 'bold' };
    const colorApprovalY = { color: '#64ab64', fontWeight: 'bold' };
    const colorApprovalC = { color: '#cf972b', fontWeight: 'bold' };
    const colorApprovalN = { color: '#FF4500', fontWeight: 'bold' };
    const colorBelumApproval = { color: '#0000FF', fontWeight: 'bold' };
    const colorBatal = { color: '#914848', fontWeight: 'bold' };

    const [modalTanggal, setModalTanggal] = useState(false);
    const [dateStart, setDateStart] = useState<any>(moment());
    const [dateEnd, setDateEnd] = useState<any>(moment().endOf('month'));
    const [flatpickrClicked, setFlatpickrClicked] = useState(false);

    const handleCloseModals = () => {
        setModalTanggal(false);
        setFlatpickrClicked(false);
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

    const handleTglBerlaku = async (date: any, tipe: string) => {
        if (tipe === 'tanggalBerlakuAwal') {
            setDateberlaku1(date);
            setIsTanggalberlakuChecked(true);
        } else {
            setDateberlaku2(date);
            setIsTanggalberlakuChecked(true);
        }
    };

    const handleTglKirim = async (date: any, tipe: string) => {
        if (tipe === 'tanggalKirimAwal') {
            setDatekirim1(date);
            setIsTanggalkirimChecked(true);
        } else {
            setDatekirim2(date);
            setIsTanggalkirimChecked(true);
        }
    };

    const [isShowTaskMenu, setIsShowTaskMenu] = useState(false);

    // ============ untuk menampilkan dropdown cetak dan fungsi pemanggilan nya =================
    let cMenuCetak: ContextMenuComponent;
    function btnPrintClick(e: any): void {
        var clientRect = (e.target as Element).getBoundingClientRect();
        cMenuCetak.open(clientRect.bottom, clientRect.left);
    }

    let menuCetakItems: MenuItemModel[] = [
        {
            id: 'pkp',
            text: 'Form Surat Order Pembelian Dengan Harga - (PKP)',
        },
        {
            id: 'non_pkp',
            text: 'Form Surat Order Pembelian Dengan Harga - (NON PKP)',
        },
        {
            id: 'report1',
            text: 'Form Surat Order Pembelian',
        },
        {
            id: 'report2',
            text: 'Form PO Barang Produksi (Model 1) - (PKP)',
        },
        {
            id: 'report3',
            text: 'Form PO Barang Produksi (Model 2) - (PKP)',
        },
        {
            id: 'report4',
            text: 'Form PO Barang Produksi (Model 3) - (NON PKP)',
        },
        {
            id: 'report5',
            text: 'Form PO Barang Produksi (Model 4) - (PKP)',
        },
        {
            id: 'report6',
            text: 'Form PraPP Barang Produksi (Model 2) - (PKP)',
        },
        {
            id: 'report7',
            text: 'Form PraPP Barang Produksi (Model 3) - (NON PKP)',
        },
        {
            id: 'report8',
            text: 'Form PraPP Barang Produksi (Model 4) - (PKP)',
        },
        {
            id: 'report9',
            text: 'Daftar Surat Order Pembeli',
        },
    ];

    function menuCetakSelect(args: MenuEventArgs) {
        if (args.item.id === 'pkp') {
            OnClick_CetakFormPo(selectedRow, statusDok, kode_entitas);
        } else if (args.item.id === 'non_pkp') {
            OnClick_CetakFormPoNonPkp(selectedRow, statusDok, kode_entitas);
        } else if (args.item.id === 'report1') {
            OnClick_CetakFormPoTanpaHarga(selectedRow, statusDok, kode_entitas);
        } else if (args.item.id === 'report2') {
        } else if (args.item.id === 'report3') {
            OnClick_CetakFormPoBarangProduksiModel2(selectedRow, statusDok, selectedTipeJenisBarang, noSp, kode_entitas);
        } else if (args.item.id === 'report4') {
            OnClick_CetakFormPoBarangProduksiModel3(selectedRow, statusDok, selectedTipeJenisBarang, noSp, kode_entitas);
        } else if (args.item.id === 'report5') {
            OnClick_CetakFormPoBarangProduksiModel4(selectedRow, statusDok, selectedTipeJenisBarang, noSp, kode_entitas);
        } else if (args.item.id === 'report6') {
            OnClick_CetakFormPraPpBarangProduksiModel2(selectedRow, statusDok, selectedTipeJenisBarang, noSp, kode_entitas);
        } else if (args.item.id === 'report7') {
            OnClick_CetakFormPraPpBarangProduksiModel3(selectedRow, statusDok, selectedTipeJenisBarang, noSp, kode_entitas);
        } else if (args.item.id === 'report8') {
            OnClick_CetakFormPraPpBarangProduksiModel4(selectedRow, statusDok, selectedTipeJenisBarang, noSp, kode_entitas);
        } else if (args.item.id === 'report9') {
            setModalTanggal(true);
        }
    }
    // ===========================================================================================

    return (
        <div className="h-full w-full ">
            <div className={`Main ${stylesIndex.scale75Monitor}`} id="main-target">
                {/* Header Bar */}
                <div className="-mt-[3px] mb-[11px] flex h-[40px] items-center justify-between ">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <ButtonComponent
                            id="btnBaru"
                            cssClass="e-primary e-small"
                            style={userMenu.baru === 'Y' || userid === 'administrator' || userid === 'ADMINISTRATOR' ? { ...styleButton } : { ...styleButtonDisabled, color: '#1c1b1f61' }}
                            disabled={userMenu.baru === 'Y' || userid === 'administrator' || userid === 'ADMINISTRATOR' ? false : true}
                            // onClick={() => HandleButtonClick('BARU', 'baru', router)}
                            onClick={() => setBaru(true)}
                            content="Baru"
                        ></ButtonComponent>

                        <ButtonComponent
                            id="btnEdit"
                            cssClass="e-primary e-small"
                            style={userMenu.edit === 'Y' || userid === 'administrator' || userid === 'ADMINISTRATOR' ? { ...styleButton } : { ...styleButtonDisabled, color: '#1c1b1f61' }}
                            disabled={userMenu.edit === 'Y' || userid === 'administrator' || userid === 'ADMINISTRATOR' ? false : true}
                            onClick={() => setDataDokumenPo('ubah')}
                            content="Ubah"
                        ></ButtonComponent>

                        <ButtonComponent
                            id="btnFilter"
                            cssClass="e-primary e-small"
                            style={sidebarVisible ? { width: '57px', height: '28px', marginBottom: '0.5em', marginTop: '0.5em', marginRight: '0.8em' } : { ...styleButton, color: 'white' }}
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
                            style={{ marginRight: '8px', backgroundColor: '#e6e6e6', color: 'green', borderColor: '#e6e6e6', fontWeight: 'bold', boxShadow: 'none' }} // --tw-shadow-colored: none;
                            disabled={poa === 'Y' || userid === 'administrator' ? false : true}
                            // disabled={true}
                            onClick={() => {
                                setDataDokumenPo('approval');
                            }}
                            content="Approval"
                            iconCss="e-icons e-medium e-chevron-right"
                            iconPosition="Left"
                        ></ButtonComponent>

                        <ButtonComponent
                            id="btnPembatalan"
                            cssClass="e-primary e-small"
                            style={{ marginRight: '8px', backgroundColor: '#e6e6e6', color: 'red', borderColor: '#e6e6e6', fontWeight: 'bold', boxShadow: 'none' }}
                            onClick={() => {
                                setDataDokumenPo('pembatalan');
                            }}
                            content="Pembatalan"
                            iconCss="e-icons e-medium e-chevron-right"
                            iconPosition="Left"
                        ></ButtonComponent>

                        <ButtonComponent
                            id="btnUpdateFile"
                            cssClass="e-primary e-small"
                            style={{ marginRight: '8px', backgroundColor: '#e6e6e6', color: 'black', borderColor: '#e6e6e6', fontWeight: 'bold', boxShadow: 'none' }}
                            onClick={() => {
                                setDataDokumenPo('updateFile');
                            }}
                            content="Update File"
                            iconCss="e-icons e-medium e-chevron-right"
                            iconPosition="Left"
                        ></ButtonComponent>

                        <ButtonComponent
                            id="btnAccDireksi"
                            cssClass="e-primary e-small"
                            style={{ marginRight: '8px', backgroundColor: '#e6e6e6', color: 'green', borderColor: '#e6e6e6', fontWeight: 'bold', boxShadow: 'none' }}
                            disabled={accPo === 'Y' || userid === 'administrator' ? false : true}
                            onClick={() => {
                                setDataDokumenPo('accDireksi');
                            }}
                            content="Acc Direksi"
                            iconCss="e-icons e-medium e-chevron-right"
                            iconPosition="Left"
                            title="ACC Direksi setelah menerima notice dari pabrik"
                        ></ButtonComponent>

                        <ButtonComponent
                            id="btnDetail"
                            cssClass="e-primary e-small"
                            style={{
                                width: 100 + 'px',
                                marginBottom: '0.5em',
                                marginTop: 0.5 + 'em',
                                marginRight: 0.8 + 'em',
                                backgroundColor: '#e6e6e6',
                                color: 'black',
                            }}
                            disabled={false}
                            onClick={() => {
                                setDataDokumenPo('detailDok');
                            }}
                            iconCss="e-icons e-medium e-chevron-down"
                            content="Detail Dok"
                        ></ButtonComponent>

                        <form className="ml-2 flex flex-col items-center gap-1 font-semibold md:flex-row">
                            <label className="ml-3 mt-2">Cari</label>
                            <input type="text" placeholder="Nomor PO" className="form-input mb-2 md:mb-0 md:w-auto" value={searchNoPo} onChange={pencarianNoPo} />
                            <input type="text" placeholder="Keterangan" className="form-input md:w-auto" value={searchKeterangan} onChange={pencarianKet} />
                        </form>
                    </div>
                    <div className="flex">
                        <span className="mt-1" style={{ fontSize: '20px', fontFamily: 'Times New Roman' }}>
                            PO List Data
                        </span>
                    </div>
                </div>
                <div className=" mb-3 flex justify-between">
                    <div className="flex">
                        <div className="relative">
                            <div className="dropdown">
                                <Transition appear show={modalTanggal}>
                                    <Dialog as="div" open={modalTanggal} onClose={handleCloseModals}>
                                        <Transition.Child
                                            enter="ease-out duration-300"
                                            enterFrom="opacity-0"
                                            enterTo="opacity-100"
                                            leave="ease-in duration-200"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <div className="fixed inset-0" />
                                        </Transition.Child>
                                        <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                                            <div className="flex min-h-screen items-center justify-center px-4">
                                                <Transition.Child
                                                    enter="ease-out duration-300"
                                                    enterFrom="opacity-0 scale-95"
                                                    enterTo="opacity-100 scale-100"
                                                    leave="ease-in duration-200"
                                                    leaveFrom="opacity-100 scale-100"
                                                    leaveTo="opacity-0 scale-95"
                                                >
                                                    <Dialog.Panel
                                                        as="div"
                                                        className={`panel max-w-$4xl my-8 w-[80vh] overflow-hidden rounded-lg border-0 bg-[#dedede] p-0 text-black dark:text-white-dark`}
                                                    >
                                                        <div className="p-5">
                                                            Periode Tanggal :
                                                            <Flatpickr
                                                                value={dateStart.format('DD-MM-YYYY HH:mm:ss')}
                                                                options={{
                                                                    dateFormat: 'd-m-Y',
                                                                    clickOpens: flatpickrClicked,
                                                                }}
                                                                className={` ${styles.inputTableBasicDate}`}
                                                                style={{ width: '100px', marginLeft: '5px', marginRight: '5px' }}
                                                                onChange={(date) => {
                                                                    const selectedDate = moment(date[0]);
                                                                    selectedDate.set({
                                                                        hour: moment().hour(),
                                                                        minute: moment().minute(),
                                                                        second: moment().second(),
                                                                    });
                                                                    setDateStart(selectedDate);
                                                                }}
                                                                onFocus={() => setFlatpickrClicked(true)}
                                                            />
                                                            S/D
                                                            <Flatpickr
                                                                value={dateEnd.format('DD-MM-YYYY HH:mm:ss')}
                                                                options={{
                                                                    dateFormat: 'd-m-Y',
                                                                }}
                                                                className={` ${styles.inputTableBasicDate}`}
                                                                style={{ width: '100px', marginLeft: '5px' }}
                                                                onChange={(date) => {
                                                                    const selectedDate = moment(date[0]);
                                                                    selectedDate.set({
                                                                        hour: moment().hour(),
                                                                        minute: moment().minute(),
                                                                        second: moment().second(),
                                                                    });
                                                                    setDateEnd(selectedDate);
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="mr-3 flex items-center justify-between">
                                                            <div className="flex items-center space-x-4"></div>

                                                            <div className="mb-3 flex space-x-4">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-primary"
                                                                    onClick={() => OnClick_CetakDaftarPP(kode_entitas, dateStart, dateEnd)}
                                                                    style={{ width: '8vh', height: '4vh' }}
                                                                >
                                                                    OK
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-danger"
                                                                    onClick={() => {
                                                                        handleCloseModals();
                                                                    }}
                                                                    style={{ width: '8vh', height: '4vh' }}
                                                                >
                                                                    Batal
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </Dialog.Panel>
                                                </Transition.Child>
                                            </div>
                                        </div>
                                    </Dialog>
                                </Transition>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex h-full w-full flex-col">
                    <div className="flex h-full w-full ">
                        <div className="h-full w-[300px] ">
                            <div className="panel-filter h-full w-full">
                                {/* <div style={{ marginBottom: '7px' }}></div> */}
                                <div className="panel-data" style={{ background: '#b6beca', width: '113%', height: '100%', marginLeft: '-17px', marginTop: '-15px' }}>
                                    <label
                                        style={{
                                            backgroundColor: '#5c7ba0',
                                            padding: '5px 10px',
                                            fontSize: '14px',
                                            color: 'white',
                                            display: 'inline-block',
                                            width: '100%',
                                            position: 'sticky',
                                            height: '30px',
                                        }}
                                    >
                                        Filters
                                    </label>
                                    <button
                                        style={{ color: 'white' }}
                                        className="absolute right-0 top-0 mb-[16px] p-2 text-gray-600 hover:text-gray-900"
                                        //onClick={toggleFilterData}
                                        onClick={handleTogglePanel}
                                    >
                                        <FontAwesomeIcon icon={faTimes} width="20" height="20" />
                                    </button>
                                    <div style={{ marginTop: '-22px', marginLeft: '0px' }} className="h-full overflow-auto p-4 ">
                                        <div className="e-content ml-[-14px] mr-[-14px] mt-[12px]">
                                            <label className=" flex cursor-pointer items-center">
                                                <input type="checkbox" className="form-checkbox" checked={isNoPOChecked} onChange={() => setIsNoPOChecked(!isNoPOChecked)} />
                                                <span style={{ fontWeight: 'bold' }}>No. PO</span>
                                            </label>
                                            <input style={{ marginTop: '-5px' }} type="text" placeholder="" className="form-input" value={noPOValue} onChange={handleNoPOInputChange} />
                                            <label className="mt-3 flex cursor-pointer items-center">
                                                <input type="checkbox" className="form-checkbox" checked={isTanggalChecked} onChange={() => setIsTanggalChecked(!isTanggalChecked)} />
                                                <span style={{ fontWeight: 'bold' }}>Tanggal</span>
                                            </label>
                                            <div style={{ marginTop: '-5px' }} className={`grid grid-cols-1 justify-between gap-1 sm:flex `}>
                                                <div className="form-input mt-1 flex justify-between" style={{ height: '30px', padding: '0px 1px 8px 10px' }}>
                                                    <DatePickerComponent
                                                        locale="id"
                                                        cssClass="e-custom-style"
                                                        // renderDayCell={onRenderDayCell}
                                                        enableMask={true}
                                                        maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                        showClearButton={false}
                                                        format="dd-MM-yyyy"
                                                        value={date1.toDate()}
                                                        change={(args: ChangeEventArgsCalendar) => {
                                                            setDate1(moment(args.value));
                                                            setIsTanggalChecked(true);
                                                        }}
                                                    >
                                                        <Inject services={[MaskedDateTime]} />
                                                    </DatePickerComponent>
                                                </div>{' '}
                                                <p className="mt-1" style={{ fontWeight: 'bold', marginTop: '11px' }}>
                                                    S/D
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
                                                        value={date2.toDate()}
                                                        change={(args: ChangeEventArgsCalendar) => {
                                                            setDate2(moment(args.value));
                                                            setIsTanggalChecked(true);
                                                        }}
                                                    >
                                                        <Inject services={[MaskedDateTime]} />
                                                    </DatePickerComponent>
                                                </div>
                                            </div>
                                            <label className="mt-3 flex cursor-pointer items-center">
                                                <input
                                                    type="checkbox"
                                                    className="form-checkbox"
                                                    checked={isTanggalberlakuChecked}
                                                    onChange={() => setIsTanggalberlakuChecked(!isTanggalberlakuChecked)}
                                                />
                                                <span style={{ fontWeight: 'bold' }}>Tanggal Berlaku</span>
                                            </label>
                                            <div style={{ marginTop: '-5px' }} className={`grid grid-cols-1 justify-between gap-1 sm:flex `}>
                                                <div className="form-input mt-1 flex justify-between" style={{ height: '30px', padding: '0px 1px 8px 10px' }}>
                                                    <DatePickerComponent
                                                        locale="id"
                                                        cssClass="e-custom-style"
                                                        // renderDayCell={onRenderDayCell}
                                                        enableMask={true}
                                                        maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                        showClearButton={false}
                                                        format="dd-MM-yyyy"
                                                        value={dateberlaku1.toDate()}
                                                        change={(args: ChangeEventArgsCalendar) => {
                                                            setDateberlaku1(moment(args.value));
                                                            setIsTanggalberlakuChecked(true);
                                                        }}
                                                    >
                                                        <Inject services={[MaskedDateTime]} />
                                                    </DatePickerComponent>
                                                </div>{' '}
                                                <p className="mt-1" style={{ fontWeight: 'bold', marginTop: '11px' }}>
                                                    S/D
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
                                                        value={dateberlaku2.toDate()}
                                                        change={(args: ChangeEventArgsCalendar) => {
                                                            setDateberlaku2(moment(args.value));
                                                            setIsTanggalberlakuChecked(true);
                                                        }}
                                                    >
                                                        <Inject services={[MaskedDateTime]} />
                                                    </DatePickerComponent>
                                                </div>
                                            </div>
                                            <label className="mt-3 flex cursor-pointer items-center">
                                                <input type="checkbox" className="form-checkbox" checked={isTanggalkirimChecked} onChange={() => setIsTanggalkirimChecked(!isTanggalkirimChecked)} />
                                                <span style={{ fontWeight: 'bold' }}>Tanggal Kirim</span>
                                            </label>
                                            <div style={{ marginTop: '-5px' }} className={`grid grid-cols-1 justify-between gap-1 sm:flex `}>
                                                <div className="form-input mt-1 flex justify-between" style={{ height: '30px', padding: '0px 1px 8px 10px' }}>
                                                    <DatePickerComponent
                                                        locale="id"
                                                        cssClass="e-custom-style"
                                                        // renderDayCell={onRenderDayCell}
                                                        enableMask={true}
                                                        maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                        showClearButton={false}
                                                        format="dd-MM-yyyy"
                                                        value={datekirim1.toDate()}
                                                        change={(args: ChangeEventArgsCalendar) => {
                                                            setDatekirim1(moment(args.value));
                                                            setIsTanggalkirimChecked(true);
                                                        }}
                                                    >
                                                        <Inject services={[MaskedDateTime]} />
                                                    </DatePickerComponent>
                                                </div>{' '}
                                                <p className="mt-1" style={{ fontWeight: 'bold', marginTop: '11px' }}>
                                                    S/D
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
                                                        value={datekirim2.toDate()}
                                                        change={(args: ChangeEventArgsCalendar) => {
                                                            setDatekirim2(moment(args.value));
                                                            setIsTanggalkirimChecked(true);
                                                        }}
                                                    >
                                                        <Inject services={[MaskedDateTime]} />
                                                    </DatePickerComponent>
                                                </div>
                                            </div>
                                            <label className=" mt-3 flex cursor-pointer items-center">
                                                <input type="checkbox" className="form-checkbox" checked={isNamaSuppChecked} onChange={() => setIsNamaSuppChecked(!isNamaSuppChecked)} />
                                                <span style={{ fontWeight: 'bold' }}>Nama Supplier</span>
                                            </label>
                                            <input style={{ marginTop: '-5px' }} type="text" placeholder="" className="form-input" value={namaSuppValue} onChange={handleNamaSuppInputChange} />

                                            <label className=" mt-3 flex cursor-pointer items-center">
                                                <input type="checkbox" className="form-checkbox" checked={isNamaBarangChecked} onChange={() => setIsNamaBarangChecked(!isNamaBarangChecked)} />
                                                <span style={{ fontWeight: 'bold' }}>Nama Barang</span>
                                            </label>
                                            <input style={{ marginTop: '-5px' }} type="text" placeholder="" className="form-input" value={namaBarangValue} onChange={handleNamaBarangChange} />

                                            <div className="mt-3 flex justify-between">
                                                <label className="flex cursor-pointer items-center">
                                                    <input type="checkbox" className="form-checkbox" checked={isStatusDokChecked} onChange={() => setIsStatusDokChecked(!isStatusDokChecked)} />
                                                    <span style={{ fontWeight: 'bold' }}>Status Dokumen</span>
                                                </label>
                                            </div>
                                            <div style={{ marginTop: '-5px' }}>
                                                <select id="ctnSelect1" className="form-select " value={statusDokValue} onChange={handleStatusDokInputChange}>
                                                    <option value="" disabled hidden>
                                                        {'--Silahkan Pilih--'}
                                                    </option>
                                                    <option>Terbuka</option>
                                                    <option>Proses</option>
                                                    <option>Tertutup</option>
                                                </select>
                                            </div>
                                            <label className="mt-3 flex cursor-pointer items-center">
                                                <input type="checkbox" className="form-checkbox" checked={isStatusAppChecked} onChange={() => setIsStatusAppChecked(!isStatusAppChecked)} />
                                                <span style={{ fontWeight: 'bold' }}>Status Approval</span>
                                            </label>
                                            <div style={{ marginTop: '-5px' }}>
                                                <select id="ctnSelect2" className="form-select " value={statusAppValue} onChange={handleStatusAppInputChange}>
                                                    <option value="" disabled hidden>
                                                        {'--Silahkan Pilih--'}
                                                    </option>
                                                    <option>Disetujui</option>
                                                    <option>Ditolak</option>
                                                    <option>Koreksi</option>
                                                    <option>Baru</option>
                                                </select>
                                            </div>
                                            <div className="mt-2 space-y-1">
                                                <div className="font-bold">Kelompok Supplier</div>
                                                <div style={{ marginTop: '-5px' }}>
                                                    <label className="mt-1 inline-flex">
                                                        <input type="radio" name="default_text_color" className="peer form-radio" value="A" onChange={handleKelSupp} />
                                                        <span className="peer-checked:text-primary">Semua</span>
                                                    </label>
                                                </div>
                                                <div style={{ marginTop: '-7px' }}>
                                                    <label className="inline-flex">
                                                        <input type="radio" name="default_text_color" className="peer form-radio text-success" value="B" onChange={handleKelSupp} />
                                                        <span className="peer-checked:text-success">Besi</span>
                                                    </label>
                                                </div>
                                                <div style={{ marginTop: '-7px' }}>
                                                    <label className="inline-flex">
                                                        <input type="radio" name="default_text_color" className="peer form-radio text-secondary" value="N" onChange={handleKelSupp} />
                                                        <span className="peer-checked:text-secondary">Non Besi</span>
                                                    </label>
                                                </div>
                                                <div style={{ marginTop: '-7px' }}>
                                                    <label className="inline-flex">
                                                        <input type="radio" name="default_text_color" className="peer form-radio text-danger" value="V" onChange={handleKelSupp} />
                                                        <span className="peer-checked:text-danger">Besi dan Non Besi</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="mt-1 space-y-1">
                                                <div className="font-bold">Tipe Dokumen</div>
                                                <div style={{ marginTop: '-5px' }}>
                                                    <label className="mt-1 inline-flex">
                                                        <input
                                                            type="radio"
                                                            name="default_text_color"
                                                            className="peer form-radio"
                                                            value="yes"
                                                            checked={tipeDokumen === 'yes'}
                                                            onChange={handleTipeDok}
                                                        />
                                                        <span className="peer-checked:text-primary">Persediaan</span>
                                                    </label>
                                                </div>
                                                <div style={{ marginTop: '-7px' }}>
                                                    <label className="inline-flex">
                                                        <input
                                                            type="radio"
                                                            name="default_text_color"
                                                            className="peer form-radio text-success"
                                                            value="no"
                                                            checked={tipeDokumen === 'no'}
                                                            onChange={handleTipeDok}
                                                        />
                                                        <span className="peer-checked:text-success">Non Persediaan</span>
                                                    </label>
                                                </div>
                                                <div style={{ marginTop: '-7px' }}>
                                                    <label className="inline-flex">
                                                        <input
                                                            type="radio"
                                                            name="default_text_color"
                                                            className="peer form-radio text-secondary"
                                                            value="tipeAll"
                                                            checked={tipeDokumen === 'tipeAll'}
                                                            onChange={handleTipeDok}
                                                        />
                                                        <span className="peer-checked:text-secondary">Semua</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="mt-3 space-y-1">
                                                <div style={{ marginTop: '-7px' }}>
                                                    <label className="inline-flex">
                                                        <input
                                                            type="checkbox"
                                                            className="peer form-checkbox"
                                                            checked={isPoKontrakChecked}
                                                            onChange={() => setIsPoKontrakChecked(!isPoKontrakChecked)}
                                                        />
                                                        <span className="peer-checked:text-primary">PO Kontrak</span>
                                                    </label>
                                                </div>
                                                <div style={{ marginTop: '-7px' }}>
                                                    <label className="inline-flex">
                                                        <input
                                                            type="checkbox"
                                                            className="peer form-checkbox"
                                                            checked={isPoNonKontrakChecked}
                                                            onChange={() => setIsPoNonKontrakChecked(!isPoNonKontrakChecked)}
                                                        />
                                                        <span className="peer-checked:text-success">PO Non Kontrak</span>
                                                    </label>
                                                </div>
                                                <div style={{ marginTop: '-7px' }}>
                                                    <label className="inline-flex">
                                                        <input
                                                            type="checkbox"
                                                            className="peer form-checkbox"
                                                            checked={isPoBarangProduksiChecked}
                                                            onChange={() => setIsPoBarangProduksiChecked(!isPoBarangProduksiChecked)}
                                                        />
                                                        <span className="peer-checked:text-success">PO Barang Produksi</span>
                                                    </label>
                                                </div>
                                                <div style={{ marginTop: '-7px' }}>
                                                    <label className="inline-flex">
                                                        <input
                                                            type="checkbox"
                                                            className="peer form-checkbox"
                                                            checked={isPoDenganPajakChecked}
                                                            onChange={() => setIsPoDenganPajakChecked(!isPoDenganPajakChecked)}
                                                        />
                                                        <span className="peer-checked:text-success">PO dengan Pajak</span>
                                                    </label>
                                                </div>
                                                <div style={{ marginTop: '-7px' }}>
                                                    <label className="inline-flex">
                                                        <input
                                                            type="checkbox"
                                                            className="peer form-checkbox"
                                                            checked={isKirimanLangsungChecked}
                                                            onChange={() => setIsKirimanLangsungChecked(!isKirimanLangsungChecked)}
                                                        />
                                                        <span className="peer-checked:text-success">Kiriman Langsungan</span>
                                                    </label>
                                                </div>
                                                <div style={{ marginTop: '-7px' }}>
                                                    <label className="inline-flex">
                                                        <input
                                                            type="checkbox"
                                                            className="peer form-checkbox"
                                                            checked={isPembatalanOrderChecked}
                                                            onChange={() => setIsPembatalanOrderChecked(!isPembatalanOrderChecked)}
                                                        />
                                                        <span className="peer-checked:text-success">Pembatalan Order</span>
                                                    </label>
                                                </div>
                                                <div style={{ marginTop: '-7px' }}>
                                                    <label className="inline-flex">
                                                        <input
                                                            type="checkbox"
                                                            className="peer form-checkbox"
                                                            checked={isBelumAccDireksiChecked}
                                                            onChange={() => setIsBelumAccDireksiChecked(!isBelumAccDireksiChecked)}
                                                        />
                                                        <span className="peer-checked:text-success">Belum ACC Direksi</span>
                                                    </label>
                                                </div>
                                                <div style={{ marginTop: '-7px' }}>
                                                    <label className="inline-flex">
                                                        <input
                                                            type="checkbox"
                                                            className="peer form-checkbox"
                                                            checked={isSudahAccDireksiChecked}
                                                            onChange={() => setIsSudahAccDireksiChecked(!isSudahAccDireksiChecked)}
                                                        />
                                                        <span className="peer-checked:text-success">Sudah ACC Direksi</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div onClick={refreshData} style={{ minHeight: '51px' }}>
                                    <div className="mt-3 flex justify-center">
                                        <ButtonComponent
                                            cssClass="e-primary e-small"
                                            iconCss="e-icons e-medium e-refresh"
                                            content="Refresh Data"
                                            style={{ backgroundColor: '#3b3f5c', marginTop: '1px', marginBottom: '17px' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="h-full w-[calc(100%-300px)]">
                            <div className="panel h-full w-full">
                                <div className="flex h-full flex-col">
                                    <Tabs className="flex h-full w-full flex-col">
                                        <TabList>
                                            <Tab>Data List</Tab>
                                        </TabList>

                                        <TabPanel className="h-full min-h-0 w-full flex-1">
                                            <div className="flex h-full min-h-0 w-full flex-col">
                                                <div className="h-full min-h-0 justify-between gap-5 sm:flex">
                                                    <div className="grid h-full min-h-0 grid-cols-1 gap-6 xl:grid-cols-1">
                                                        <DataTable
                                                            withBorder={true}
                                                            withColumnBorders={true}
                                                            highlightOnHover
                                                            className={`ticky-table table-hover h-full w-full whitespace-nowrap`}
                                                            striped
                                                            style={{ background: '#e8e8e8' }}
                                                            records={recordsData}
                                                            rowStyle={(record) => ({
                                                                backgroundColor: record.nip2 === null ? '' : '#d4edda',
                                                            })}
                                                            columns={[
                                                                {
                                                                    accessor: 'no_po',
                                                                    title: 'No. PO',
                                                                    sortable: true,
                                                                    render: ({ kontrak, tipe_dokumen, no_sp, tgl_sp, kode_sp, produksi, approval, status, status_batal }) => (
                                                                        <div
                                                                            style={{ textAlign: 'right', cursor: 'pointer' }}
                                                                            onClick={() => handleRowClick(kontrak, tipe_dokumen, kode_sp, produksi, status, no_sp, tgl_sp)}
                                                                            onDoubleClick={() => handleRowDoubleClick(kontrak, tipe_dokumen, kode_sp, produksi, status)}
                                                                        >
                                                                            {selectedRow === kode_sp ? (
                                                                                <div style={colorNonApproval}> {no_sp}</div>
                                                                            ) : approval === 'Y' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalY}> {no_sp}</div>
                                                                            ) : approval === 'C' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalC}> {no_sp}</div>
                                                                            ) : approval === 'N' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalN}> {no_sp}</div>
                                                                            ) : (approval === 'Y' && status_batal === 'Y') ||
                                                                              (approval === 'C' && status_batal === 'Y') ||
                                                                              (approval === 'N' && status_batal === 'Y') ? (
                                                                                <div style={colorBatal}> {no_sp}</div>
                                                                            ) : (
                                                                                <div style={colorBelumApproval}> {no_sp}</div>
                                                                            )}
                                                                        </div>
                                                                    ),
                                                                },
                                                                {
                                                                    accessor: 'tgl_sp',
                                                                    title: 'Tanggal',
                                                                    sortable: true,
                                                                    render: ({ kontrak, tipe_dokumen, no_sp, tgl_sp, kode_sp, produksi, approval, status, status_batal }) => (
                                                                        <div
                                                                            style={{ textAlign: 'center', cursor: 'pointer' }}
                                                                            onClick={() => handleRowClick(kontrak, tipe_dokumen, kode_sp, produksi, status, no_sp, tgl_sp)}
                                                                            onDoubleClick={() => handleRowDoubleClick(kontrak, tipe_dokumen, kode_sp, produksi, status)}
                                                                        >
                                                                            {selectedRow === kode_sp ? (
                                                                                <div style={colorNonApproval}> {tgl_sp}</div>
                                                                            ) : approval === 'Y' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalY}> {tgl_sp}</div>
                                                                            ) : approval === 'C' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalC}> {tgl_sp}</div>
                                                                            ) : approval === 'N' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalN}> {tgl_sp}</div>
                                                                            ) : (approval === 'Y' && status_batal === 'Y') ||
                                                                              (approval === 'C' && status_batal === 'Y') ||
                                                                              (approval === 'N' && status_batal === 'Y') ? (
                                                                                <div style={colorBatal}> {tgl_sp}</div>
                                                                            ) : (
                                                                                <div style={colorBelumApproval}> {tgl_sp}</div>
                                                                            )}
                                                                        </div>
                                                                    ),
                                                                },
                                                                {
                                                                    accessor: 'tgl_berlaku',
                                                                    title: 'Tgl. Berlaku',
                                                                    sortable: true,
                                                                    render: ({ kontrak, tipe_dokumen, no_sp, tgl_sp, tgl_berlaku, kode_sp, produksi, approval, status, status_batal }) => (
                                                                        <div
                                                                            style={{ textAlign: 'center', cursor: 'pointer' }}
                                                                            onClick={() => handleRowClick(kontrak, tipe_dokumen, kode_sp, produksi, status, no_sp, tgl_sp)}
                                                                            onDoubleClick={() => handleRowDoubleClick(kontrak, tipe_dokumen, kode_sp, produksi, status)}
                                                                        >
                                                                            {selectedRow === kode_sp ? (
                                                                                <div style={colorNonApproval}> {tgl_berlaku}</div>
                                                                            ) : approval === 'Y' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalY}> {tgl_berlaku}</div>
                                                                            ) : approval === 'C' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalC}> {tgl_berlaku}</div>
                                                                            ) : approval === 'N' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalN}> {tgl_berlaku}</div>
                                                                            ) : (approval === 'Y' && status_batal === 'Y') ||
                                                                              (approval === 'C' && status_batal === 'Y') ||
                                                                              (approval === 'N' && status_batal === 'Y') ? (
                                                                                <div style={colorBatal}> {tgl_berlaku}</div>
                                                                            ) : (
                                                                                <div style={colorBelumApproval}> {tgl_berlaku}</div>
                                                                            )}
                                                                        </div>
                                                                    ),
                                                                },
                                                                {
                                                                    accessor: 'tgl_kirim',
                                                                    title: 'Est. Pengiriman',
                                                                    sortable: true,
                                                                    render: ({ kontrak, tipe_dokumen, no_sp, tgl_sp, tgl_kirim, kode_sp, produksi, approval, status, status_batal }) => (
                                                                        <div
                                                                            style={{ textAlign: 'center', cursor: 'pointer' }}
                                                                            onClick={() => handleRowClick(kontrak, tipe_dokumen, kode_sp, produksi, status, no_sp, tgl_sp)}
                                                                            onDoubleClick={() => handleRowDoubleClick(kontrak, tipe_dokumen, kode_sp, produksi, status)}
                                                                        >
                                                                            {selectedRow === kode_sp ? (
                                                                                <div style={colorNonApproval}> {tgl_kirim}</div>
                                                                            ) : approval === 'Y' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalY}> {tgl_kirim}</div>
                                                                            ) : approval === 'C' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalC}> {tgl_kirim}</div>
                                                                            ) : approval === 'N' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalN}> {tgl_kirim}</div>
                                                                            ) : (approval === 'Y' && status_batal === 'Y') ||
                                                                              (approval === 'C' && status_batal === 'Y') ||
                                                                              (approval === 'N' && status_batal === 'Y') ? (
                                                                                <div style={colorBatal}> {tgl_kirim}</div>
                                                                            ) : (
                                                                                <div style={colorBelumApproval}> {tgl_kirim}</div>
                                                                            )}
                                                                        </div>
                                                                    ),
                                                                },
                                                                {
                                                                    accessor: 'tipe_dokumen',
                                                                    title: 'Dokumen',
                                                                    sortable: true,
                                                                    render: ({ kontrak, tipe_dokumen, no_sp, tgl_sp, tgl_kirim, kode_sp, produksi, approval, status, status_batal }) => (
                                                                        <div
                                                                            style={{ textAlign: 'left', cursor: 'pointer' }}
                                                                            onClick={() => handleRowClick(kontrak, tipe_dokumen, kode_sp, produksi, status, no_sp, tgl_sp)}
                                                                            onDoubleClick={() => handleRowDoubleClick(kontrak, tipe_dokumen, kode_sp, produksi, status)}
                                                                        >
                                                                            {selectedRow === kode_sp ? (
                                                                                <div style={colorNonApproval}> {tipe_dokumen}</div>
                                                                            ) : approval === 'Y' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalY}> {tipe_dokumen}</div>
                                                                            ) : approval === 'C' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalC}> {tipe_dokumen}</div>
                                                                            ) : approval === 'N' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalN}> {tipe_dokumen}</div>
                                                                            ) : (approval === 'Y' && status_batal === 'Y') ||
                                                                              (approval === 'C' && status_batal === 'Y') ||
                                                                              (approval === 'N' && status_batal === 'Y') ? (
                                                                                <div style={colorBatal}> {tipe_dokumen}</div>
                                                                            ) : (
                                                                                <div style={colorBelumApproval}> {tipe_dokumen}</div>
                                                                            )}
                                                                        </div>
                                                                    ),
                                                                },
                                                                {
                                                                    accessor: 'nama_relasi',
                                                                    title: 'Supplier',
                                                                    sortable: true,
                                                                    render: ({ kontrak, tipe_dokumen, no_sp, tgl_sp, nama_relasi, kode_sp, produksi, approval, status, status_batal }) => (
                                                                        <div
                                                                            style={{ textAlign: 'left', cursor: 'pointer' }}
                                                                            onClick={() => handleRowClick(kontrak, tipe_dokumen, kode_sp, produksi, status, no_sp, tgl_sp)}
                                                                            onDoubleClick={() => handleRowDoubleClick(kontrak, tipe_dokumen, kode_sp, produksi, status)}
                                                                        >
                                                                            {selectedRow === kode_sp ? (
                                                                                <div style={colorNonApproval}> {nama_relasi}</div>
                                                                            ) : approval === 'Y' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalY}> {nama_relasi}</div>
                                                                            ) : approval === 'C' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalC}> {nama_relasi}</div>
                                                                            ) : approval === 'N' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalN}> {nama_relasi}</div>
                                                                            ) : (approval === 'Y' && status_batal === 'Y') ||
                                                                              (approval === 'C' && status_batal === 'Y') ||
                                                                              (approval === 'N' && status_batal === 'Y') ? (
                                                                                <div style={colorBatal}> {nama_relasi}</div>
                                                                            ) : (
                                                                                <div style={colorBelumApproval}> {nama_relasi}</div>
                                                                            )}
                                                                        </div>
                                                                    ),
                                                                },
                                                                {
                                                                    accessor: 'nama_termin',
                                                                    title: 'Termin',
                                                                    sortable: true,
                                                                    render: ({ kontrak, tipe_dokumen, no_sp, tgl_sp, nama_termin, kode_sp, produksi, approval, status, status_batal }) => (
                                                                        <div
                                                                            style={{ textAlign: 'left', cursor: 'pointer' }}
                                                                            onClick={() => handleRowClick(kontrak, tipe_dokumen, kode_sp, produksi, status, no_sp, tgl_sp)}
                                                                            onDoubleClick={() => handleRowDoubleClick(kontrak, tipe_dokumen, kode_sp, produksi, status)}
                                                                        >
                                                                            {selectedRow === kode_sp ? (
                                                                                <div style={colorNonApproval}> {nama_termin}</div>
                                                                            ) : approval === 'Y' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalY}> {nama_termin}</div>
                                                                            ) : approval === 'C' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalC}> {nama_termin}</div>
                                                                            ) : approval === 'N' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalN}> {nama_termin}</div>
                                                                            ) : (approval === 'Y' && status_batal === 'Y') ||
                                                                              (approval === 'C' && status_batal === 'Y') ||
                                                                              (approval === 'N' && status_batal === 'Y') ? (
                                                                                <div style={colorBatal}> {nama_termin}</div>
                                                                            ) : (
                                                                                <div style={colorBelumApproval}> {nama_termin}</div>
                                                                            )}
                                                                        </div>
                                                                    ),
                                                                },
                                                                {
                                                                    accessor: 'kirim_mu',
                                                                    title: 'Biaya Pengiriman',
                                                                    sortable: true,
                                                                    render: ({ kontrak, tipe_dokumen, no_sp, tgl_sp, kirim_mu, kode_sp, produksi, approval, status, status_batal }) => (
                                                                        <div
                                                                            style={{ textAlign: 'right', cursor: 'pointer' }}
                                                                            onClick={() => handleRowClick(kontrak, tipe_dokumen, kode_sp, produksi, status, no_sp, tgl_sp)}
                                                                            onDoubleClick={() => handleRowDoubleClick(kontrak, tipe_dokumen, kode_sp, produksi, status)}
                                                                        >
                                                                            {selectedRow === kode_sp ? (
                                                                                <div style={colorNonApproval}> {FormatNumber({ number: kirim_mu })}</div>
                                                                            ) : approval === 'Y' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalY}> {FormatNumber({ number: kirim_mu })}</div>
                                                                            ) : approval === 'C' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalC}> {FormatNumber({ number: kirim_mu })}</div>
                                                                            ) : approval === 'N' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalN}> {FormatNumber({ number: kirim_mu })}</div>
                                                                            ) : (approval === 'Y' && status_batal === 'Y') ||
                                                                              (approval === 'C' && status_batal === 'Y') ||
                                                                              (approval === 'N' && status_batal === 'Y') ? (
                                                                                <div style={colorBatal}> {FormatNumber({ number: kirim_mu })}</div>
                                                                            ) : (
                                                                                <div style={colorBelumApproval}> {FormatNumber({ number: kirim_mu })}</div>
                                                                            )}
                                                                        </div>
                                                                    ),
                                                                },
                                                                {
                                                                    accessor: 'netto_mu',
                                                                    title: 'Netto (MU)',
                                                                    sortable: true,
                                                                    render: ({ kontrak, tipe_dokumen, no_sp, tgl_sp, netto_mu, kode_sp, produksi, approval, status, status_batal }) => (
                                                                        <div
                                                                            style={{ textAlign: 'right', cursor: 'pointer' }}
                                                                            onClick={() => handleRowClick(kontrak, tipe_dokumen, kode_sp, produksi, status, no_sp, tgl_sp)}
                                                                            onDoubleClick={() => handleRowDoubleClick(kontrak, tipe_dokumen, kode_sp, produksi, status)}
                                                                        >
                                                                            {selectedRow === kode_sp ? (
                                                                                <div style={colorNonApproval}> {FormatNumber({ number: netto_mu })}</div>
                                                                            ) : approval === 'Y' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalY}> {FormatNumber({ number: netto_mu })}</div>
                                                                            ) : approval === 'C' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalC}> {FormatNumber({ number: netto_mu })}</div>
                                                                            ) : approval === 'N' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalN}> {FormatNumber({ number: netto_mu })}</div>
                                                                            ) : (approval === 'Y' && status_batal === 'Y') ||
                                                                              (approval === 'C' && status_batal === 'Y') ||
                                                                              (approval === 'N' && status_batal === 'Y') ? (
                                                                                <div style={colorBatal}> {FormatNumber({ number: netto_mu })}</div>
                                                                            ) : (
                                                                                <div style={colorBelumApproval}> {FormatNumber({ number: netto_mu })}</div>
                                                                            )}
                                                                        </div>
                                                                    ),
                                                                },
                                                                {
                                                                    accessor: 'pajak',
                                                                    title: 'Pajak',
                                                                    sortable: true,
                                                                    render: ({ kontrak, tipe_dokumen, no_sp, tgl_sp, pajak, kode_sp, produksi, approval, status, status_batal }) => (
                                                                        <div
                                                                            style={{ textAlign: 'left', cursor: 'pointer' }}
                                                                            onClick={() => handleRowClick(kontrak, tipe_dokumen, kode_sp, produksi, status, no_sp, tgl_sp)}
                                                                            onDoubleClick={() => handleRowDoubleClick(kontrak, tipe_dokumen, kode_sp, produksi, status)}
                                                                        >
                                                                            {selectedRow === kode_sp ? (
                                                                                <div style={colorNonApproval}> {pajak}</div>
                                                                            ) : approval === 'Y' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalY}> {pajak}</div>
                                                                            ) : approval === 'C' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalC}> {pajak}</div>
                                                                            ) : approval === 'N' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalN}> {pajak}</div>
                                                                            ) : (approval === 'Y' && status_batal === 'Y') ||
                                                                              (approval === 'C' && status_batal === 'Y') ||
                                                                              (approval === 'N' && status_batal === 'Y') ? (
                                                                                <div style={colorBatal}> {pajak}</div>
                                                                            ) : (
                                                                                <div style={colorBelumApproval}> {pajak}</div>
                                                                            )}
                                                                        </div>
                                                                    ),
                                                                },
                                                                {
                                                                    accessor: 'total_berat',
                                                                    title: 'Berat (Kg)',
                                                                    sortable: true,
                                                                    render: ({ kontrak, tipe_dokumen, no_sp, tgl_sp, total_berat, kode_sp, produksi, approval, status, status_batal }) => (
                                                                        <div
                                                                            style={{ textAlign: 'right', cursor: 'pointer' }}
                                                                            onClick={() => handleRowClick(kontrak, tipe_dokumen, kode_sp, produksi, status, no_sp, tgl_sp)}
                                                                            onDoubleClick={() => handleRowDoubleClick(kontrak, tipe_dokumen, kode_sp, produksi, status)}
                                                                        >
                                                                            {selectedRow === kode_sp ? (
                                                                                <div style={colorNonApproval}> {FormatNumber({ number: total_berat })}</div>
                                                                            ) : approval === 'Y' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalY}> {FormatNumber({ number: total_berat })}</div>
                                                                            ) : approval === 'C' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalC}> {FormatNumber({ number: total_berat })}</div>
                                                                            ) : approval === 'N' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalN}> {FormatNumber({ number: total_berat })}</div>
                                                                            ) : (approval === 'Y' && status_batal === 'Y') ||
                                                                              (approval === 'C' && status_batal === 'Y') ||
                                                                              (approval === 'N' && status_batal === 'Y') ? (
                                                                                <div style={colorBatal}> {FormatNumber({ number: total_berat })}</div>
                                                                            ) : (
                                                                                <div style={colorBelumApproval}> {FormatNumber({ number: total_berat })}</div>
                                                                            )}
                                                                        </div>
                                                                    ),
                                                                },
                                                                {
                                                                    accessor: 'status',
                                                                    title: 'Status. Dok',
                                                                    sortable: true,
                                                                    render: ({ kontrak, tipe_dokumen, no_sp, tgl_sp, status, kode_sp, produksi, approval, status_batal }) => (
                                                                        <div
                                                                            style={{ cursor: 'pointer' }}
                                                                            onClick={() => handleRowClick(kontrak, tipe_dokumen, kode_sp, produksi, status, no_sp, tgl_sp)}
                                                                            onDoubleClick={() => handleRowDoubleClick(kontrak, tipe_dokumen, kode_sp, produksi, status)}
                                                                        >
                                                                            {selectedRow === kode_sp ? (
                                                                                <div style={colorNonApproval}> {status}</div>
                                                                            ) : approval === 'Y' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalY}> {status}</div>
                                                                            ) : approval === 'C' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalC}> {status}</div>
                                                                            ) : approval === 'N' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalN}> {status}</div>
                                                                            ) : (approval === 'Y' && status_batal === 'Y') ||
                                                                              (approval === 'C' && status_batal === 'Y') ||
                                                                              (approval === 'N' && status_batal === 'Y') ? (
                                                                                <div style={colorBatal}> {status}</div>
                                                                            ) : (
                                                                                <div style={colorBelumApproval}> {status}</div>
                                                                            )}
                                                                        </div>
                                                                    ),
                                                                },
                                                                {
                                                                    accessor: 'status_app',
                                                                    title: 'Status. App',
                                                                    sortable: true,
                                                                    render: ({ kontrak, tipe_dokumen, no_sp, tgl_sp, status_app, kode_sp, produksi, approval, status, status_batal }) => (
                                                                        <div
                                                                            style={{ cursor: 'pointer' }}
                                                                            onClick={() => handleRowClick(kontrak, tipe_dokumen, kode_sp, produksi, status, no_sp, tgl_sp)}
                                                                            onDoubleClick={() => handleRowDoubleClick(kontrak, tipe_dokumen, kode_sp, produksi, status)}
                                                                        >
                                                                            {selectedRow === kode_sp ? (
                                                                                <div style={colorNonApproval}> {status_app}</div>
                                                                            ) : approval === 'Y' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalY}> {status_app}</div>
                                                                            ) : approval === 'C' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalC}> {status_app}</div>
                                                                            ) : approval === 'N' && status_batal === 'N' ? (
                                                                                <div style={colorApprovalN}> {status_app}</div>
                                                                            ) : (approval === 'Y' && status_batal === 'Y') ||
                                                                              (approval === 'C' && status_batal === 'Y') ||
                                                                              (approval === 'N' && status_batal === 'Y') ? (
                                                                                <div style={colorBatal}> {status_app}</div>
                                                                            ) : (
                                                                                <div style={colorBelumApproval}> {status_app}</div>
                                                                            )}
                                                                        </div>
                                                                    ),
                                                                },
                                                            ]}
                                                            totalRecords={totalRecords}
                                                            recordsPerPage={pageSize}
                                                            page={page}
                                                            onPageChange={(p) => setPage(p)}
                                                            recordsPerPageOptions={PAGE_SIZES}
                                                            onRecordsPerPageChange={setPageSize}
                                                            sortStatus={sortStatus}
                                                            onSortStatusChange={setSortStatus}
                                                            height={'100vh'}
                                                            paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                                                        />
                                                    </div>
                                                    {selectedItem && (
                                                        <Draggable>
                                                            <div className={`${styles.modalDetailDragable}`} style={modalPosition}>
                                                                <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                                                                    {' '}
                                                                    {/* Adjust the maxHeight as needed */}
                                                                    <table className={styles.table}>
                                                                        <thead>
                                                                            <tr>
                                                                                <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '7%' }}>No. Barang</th>
                                                                                <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '17%' }}>Nama Barang</th>
                                                                                <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '5%' }}>Satuan</th>
                                                                                <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '5%' }}>Kuantitas</th>
                                                                                <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '6%' }}>Berat</th>
                                                                                <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '5%' }}>MU</th>
                                                                                <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '9%' }}>Harga</th>
                                                                                <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '5%' }}>Diskon</th>
                                                                                <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '8%' }}>Potongan</th>
                                                                                <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '8%' }}>Pajak</th>
                                                                                <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '10%' }}>Jumlah</th>
                                                                                <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '7%' }}>Outstanding</th>
                                                                                <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '7%' }}>Proses PB</th>
                                                                                <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '7%' }}>Dibatalkan</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {detailDok?.map((item: any) => (
                                                                                <tr key={item.id_sp}>
                                                                                    {/* <td>{headerFetch[0]?.no_lpb}</td>
                                                                <td  >{headerFetch[0]?.no_sj}</td> */}
                                                                                    <td style={{ background: 'white', textAlign: 'left' }}>{item.no_item}</td>
                                                                                    <td style={{ background: 'white', textAlign: 'left' }}>{item.diskripsi}</td>
                                                                                    <td style={{ background: 'white' }}>{item.satuan}</td>
                                                                                    <td style={{ background: 'white', textAlign: 'left' }}>{frmNumber(item.qty)}</td>
                                                                                    <td style={{ background: 'white', textAlign: 'left' }}>{frmNumber(item.berat)}</td>
                                                                                    <td style={{ background: 'white' }}>{item.kode_mu}</td>
                                                                                    <td style={{ background: 'white', textAlign: 'right' }}>{frmNumber(item.harga_mu)}</td>
                                                                                    <td style={{ background: 'white', textAlign: 'left' }}>{frmNumber(item.diskon)}</td>
                                                                                    <td style={{ background: 'white', textAlign: 'right' }}>{frmNumber(item.potongan_mu)}</td>
                                                                                    <td style={{ background: 'white', textAlign: 'right' }}>{frmNumber(item.pajak_mu)}</td>
                                                                                    <td style={{ background: 'white', textAlign: 'right' }}>{frmNumber(item.jumlah_mu)}</td>
                                                                                    <td style={{ background: 'white' }}></td>
                                                                                    <td style={{ background: 'white' }}></td>
                                                                                    <td style={{ background: 'white', textAlign: 'left' }}>{frmNumber(item.qty_batal)}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
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
                                                </div>
                                            </div>
                                        </TabPanel>
                                    </Tabs>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="my-5 flex justify-between">
                    <div className="flex"></div>
                </div>
                <JenisTransaksi
                    isOpen={baru}
                    onClose={() => setBaru(false)}
                    onSelectData={(selectedData: any) => handleSelectedData(selectedData)}
                    date1={date1}
                    date2={date2}
                    dateberlaku1={dateberlaku1}
                    dateberlaku2={dateberlaku2}
                    datekirim1={datekirim1}
                    datekirim2={datekirim2}
                    tipeDokumen={tipeDokumen}
                    noPOValue={noPOValue}
                    namaSuppValue={namaSuppValue}
                    namaBarangValue={namaBarangValue}
                    isPoKontrakChecked={isPoKontrakChecked}
                    isPoNonKontrakChecked={isPoNonKontrakChecked}
                    isPoBarangProduksiChecked={isPoBarangProduksiChecked}
                    isPoDenganPajakChecked={isPoDenganPajakChecked}
                    isKirimanLangsungChecked={isKirimanLangsungChecked}
                    isPembatalanOrderChecked={isPembatalanOrderChecked}
                    isBelumAccDireksiChecked={isBelumAccDireksiChecked}
                    isSudahAccDireksiChecked={isSudahAccDireksiChecked}
                    isNoPOChecked={isNoPOChecked}
                    isNamaSuppChecked={isNamaSuppChecked}
                    isNamaBarangChecked={isNamaBarangChecked}
                    statusDokValue={statusDokValue}
                    statusAppValue={statusAppValue}
                    isTanggalChecked={isTanggalChecked}
                />
                {/*  detail dok   */}
            </div>
        </div>
    );
};

export default POList;
