import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useSession } from '@/pages/api/sessionContext';

import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, Inject, Page, Edit, Sort, Filter, Group, Resize, Reorder, Selection, ExcelExport, PdfExport } from '@syncfusion/ej2-react-grids';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown } from '@syncfusion/ej2-react-dropdowns';
import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { ContextMenuComponent, MenuEventArgs, MenuItemModel, TabComponent } from '@syncfusion/ej2-react-navigations';
import { FocusInEventArgs, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Draggable from 'react-draggable';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faTimes } from '@fortawesome/free-solid-svg-icons';
import withReactContent from 'sweetalert2-react-content';
import swal from 'sweetalert2';

// import styles from './historyJurnal.module.css';
import moment from 'moment';

import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json';
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
import idIDLocalization from 'public/syncfusion/locale.json';
import { Tab } from '@headlessui/react';
import axios from 'axios';
import { generateNU, usersMenu } from '@/utils/routines';

import Swal from 'sweetalert2';
import GlobalProgressBar from '@/components/GlobalProgressBar';
import { useProgress } from '@/context/ProgressContext';
import { HandleSearchNoitem, HandleTglInformasiStok } from './function/function';
import ModalBarang from './modal/ModalBarang';
import KartuStockAll from './modal/KartuStockAll';
import GridStok from './GridStok';
import KartuStockGudang from './modal/KartuStockGudang';
import DaftarPaket from './modal/DaftarPaket';
import Alternatif from './modal/Alternatif';
import DetailStokPerGudang from './modal/DetailStokPerGudang';
import DialogBaruEditPersediaan from '../../master/daftarPersediaan/components/dialog/DialogBaruEditPersediaan';
import GridStokDumy from './GridStokDummy';

L10n.load(idIDLocalization);
enableRipple(true);

const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

const swalCOnfirm = Swal.mixin({
    toast: true,
    position: 'center',
    customClass: {
        popup: 'colored-toast',
    },
    showConfirmButton: true,
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

const tabJenis = [
    {
        jenis: 'Pengajuan Pembenanan',
    },
    {
        jenis: 'Hitung Penyesuaian Stok',
    },
    {
        jenis: 'Pembatalan',
    },
];

interface UserMenuState {
    baru: any;
    edit: any;
    hapus: any;
    cetak: any;
}

function formatString(input: string) {
    // Split berdasarkan underscore (_)
    const words = input.split('_');

    // Kapitalisasi huruf pertama setiap kata
    const formattedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

    // Gabungkan kembali dengan spasi
    return formattedWords.join(' ');
}

const SpreadNumber = (number: any | number | string) => {
    const temp = parseFloat(parseFloat(number).toFixed(2));
    return temp;
};

const InformasiStokAktual = () => {
    const { sessionData, isLoading } = useSession();

    if (isLoading) {
        return;
    }

    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';
    const [dsTab1, setDsTab1] = useState([]);
    const { startProgress, updateProgress, endProgress, setLoadingMessage } = useProgress();

    const gridPembatalanReff = useRef<any>(null);
    const [selectedRowBeban, setSelectedRowBeban] = useState<any>({});

    const [modalPersediaan, setModalPersediaan] = useState(false);

    const kode_menu = '60204'; // kode menu FPP

    // Styling
    const styleButton = { width: 57 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#3b3f5c' };

    const [isShowTaskMenu, setIsShowTaskMenu] = useState(false);
    const [panelVisible, setPanelVisible] = useState(true);

    const [filterTabJenis, setFilterTabJenis] = useState('Pengajuan Pembenanan');
    const [listGudang, setlistGudang] = useState<any>([]);
    const [listKategori, setListKategori] = useState<any>([]);
    const [selectedGudang, setSelectedGudang] = useState<any>([]);
    const [listKelompok, setlistKelompok] = useState<any>([]);
    const [merekList, setMerekList] = useState<any>([]);
    const [modalAkun, setModalAkun] = useState(false);
    const [daftarPaket, setDaftarPaket] = useState(false);
    const [alternatif, setAlternatif] = useState(false);
    const [listBarang, setlistBarang] = useState([]);
    const [detailStokPerGudang, setDetailStokPerGudang] = useState(false);
    const gridStokReff = useRef<any>(null);

    // Date State Management

    const [filterState, setFilterState] = useState({
        tanggal_awal: moment(),
        no_rps: '',
        kondisi_stok: '',
        status_barang: '',
        kode_barang: '',
        kategori_barang: '',
        kelompok_produk: '',
        merek_produk: '',
        jenis_produk: '',
        golongan_produk: '',
        no_barang: '',
        no_item: '',
        nama_item: '',
    });
    const [checkboxState, setCheckboxState] = useState({
        no_rps: false,
        kondisi_stok: false,
        tanggal_input: false,
        status_barang: false,
        kategori_barang: false,
        kelompok_produk: false,
        merek_produk: false,
        jenis_produk: false,
        golongan_produk: false,
        no_barang: false,
        no_item: false,
        nama_item: false,
    });
    const [hashFetch, setHashFetch] = useState(false);
    const [listStok, setListStok] = useState<any>([]);
    const [originalDataSource, setOriginalDataSource] = useState<any>([]);
    const [visibleKartuStokAll, setVisibleKartuStokAll] = useState(false);
    const [visibleKartuStokGudang, setVisibleKartuStokGudang] = useState(false);
    const [stateStokAll, setStateStokAll] = useState({
        tanggal_awal_stok_all: moment(),
        tanggal_akhir_stok_all: moment().endOf('month'),
        no_barang_stok_all: '',
        nama_barang_stok_all: '',
        isNamaBarang: false,
    });
    const [gudangTerpilihData, setGudangTerpilihData] = useState<any>([]);
    const [fixGudang, setFixGudang] = useState([]);
    const [selectedRow, setSelectedRow] = useState<any>({});
    const [searchState, setSearchState] = useState({
        no_item: '',
        nama_item: '',
    });
    const [toggleGrid, setToggleGrid] = useState({
        jumlah_qty: false,
        catatan: false,
        daftar_paket: false,
        alternatif: false,
    });

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;

        // Update filterState
        setFilterState((prev: any) => ({
            ...prev,
            [name]: value,
        }));

        // Update checkboxState
        setCheckboxState((prev: any) => ({
            ...prev,
            [name]: value.trim() !== '',
        }));
    };

    // fungsi ngeget
    const getAllGudang = async () => {
        try {
            const response = await axios.get(`${apiUrl}/erp/master_gudang?`, {
                params: {
                    entitas: kode_entitas,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // const filteredData = response.data.data.filter((item: any) => item.tampil === 'Y' && item.kodecabang !== '898');
            console.log();
            const filteredGudang = response.data.data.sort((a: any, b: any) => a.nama_gudang.localeCompare(b.nama_gudang));

            const selectedKodeGudangPilih = filteredGudang
                .filter((item: any) => item.aktif == 'Y')
                .slice(0, 5)
                .map((item: any) => item.kode_gudang);
            console.log('gudanya', selectedKodeGudangPilih);
            const terpilih: any = [];
            await Promise.all(
                filteredGudang
                    .filter((item: any) => item.aktif == 'Y')
                    .slice(0, 5)
                    .map((item: any) => {
                        return terpilih.push({
                            nama_gudang: item.nama_gudang,
                            kode: item.kode_gudang,
                        });
                    })
            );

            console.log('terpilihhhh', terpilih);

            setGudangTerpilihData(terpilih);

            setSelectedGudang(selectedKodeGudangPilih);
            setlistGudang(filteredGudang.filter((item: any) => item.aktif == 'Y'));
        } catch (error) {
            console.log();
        }
    };

    const dataKategori = async () => {
        const kategoriResponse = await axios.get(`${apiUrl}/erp/kategori?`, {
            params: {
                entitas: kode_entitas,
            },
        });
        setListKategori(kategoriResponse.data.data);
    };

    const showEditRecord = () => {
        setModalPersediaan(true);
    };

    // Filter State Management

    const dataKelompok = async () => {
        const kelompokResponse = await axios.get(`${apiUrl}/erp/kelompok?`, {
            params: {
                entitas: kode_entitas,
            },
        });
        // lanjut_sini
        setlistKelompok(kelompokResponse.data.data);
    };

    const handleCheckboxChange = (kode: any) => {
        setSelectedGudang((prevSelectedGudang: any) => {
            // Check if kode is already selected
            if (prevSelectedGudang.includes(kode)) {
                // Remove the kode from selected codes if already selected
                return prevSelectedGudang.filter((item: any) => item !== kode);
            } else {
                // Add kode to selected codes if not already selected
                return [...prevSelectedGudang, kode];
            }
        });
    };

    const handleTogglePanel = () => {
        setPanelVisible(!panelVisible);
    };

    const handleFilterClick = () => {
        setPanelVisible(true);
    };

    const pilihSemua = async (e: any) => {
        if (e.target.checked) {
            const cabang: any = [];
            const terpilih: any = [];
            await Promise.all(
                listGudang.slice(0, 5).map((item: any) => {
                    cabang.push(item.kode_gudang);
                    return terpilih.push({
                        nama_gudang: item.nama_gudang,
                        kode: item.kode_gudang,
                    });
                })
            );
            setSelectedGudang([...cabang]);
            setGudangTerpilihData(terpilih);
        } else {
            setSelectedGudang([]);
            setGudangTerpilihData([]);
        }
    };

    const dataMerk = async () => {
        const kelompokResponse = await axios.get(`${apiUrl}/erp/merk?`, {
            params: {
                entitas: kode_entitas,
            },
        });
        setMerekList(kelompokResponse.data.data);
    };

    const dataItem = async (filter: any = {}) => {
        if (Object.keys(filter).length !== 0) {
            const kelompokResponse = await axios.get(`${apiUrl}/erp/list_barang?`, {
                params: {
                    entitas: kode_entitas,
                    kode: filter.no_item,
                    nama: filter.nama_item,
                    limit: 25,
                },
            });
            setlistBarang(kelompokResponse.data.data);
        } else {
            const kelompokResponse = await axios.get(`${apiUrl}/erp/list_barang?`, {
                params: {
                    entitas: kode_entitas,
                    kode: 'all',
                    nama: 'all',
                    limit: 25,
                },
            });
            setlistBarang(kelompokResponse.data.data);
        }
    };
    const formatKey = (key: string) => key.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    const handleSearchItem = async (e: any, jenis: any, setTerValue: any, value: any) => {
        // console.log('value', value);

        if (jenis === 'no_item') {
            const temp = {
                ...value,
                no_item: e,
            };
            setTerValue((oldData: any) => ({
                ...oldData,
                no_item: e,
            }));
            await dataItem(temp);
        } else {
            const temp = {
                ...value,
                nama_item: e,
            };
            setTerValue((oldData: any) => ({
                ...oldData,
                nama_item: e,
            }));
            await dataItem(temp);
        }
    };

    // console.log('gudang terpilih', gudangTerpilihData);

    // get data persiapan filter
    useEffect(() => {
        if (token) {
            getAllGudang();
            dataKategori();
            dataKelompok();
            dataMerk();
            dataItem();
        }
    }, [token]);

    const refreshAllHandle = async () => {
        console.log('gudanya', filterState, checkboxState, selectedGudang, gudangTerpilihData);

        setHashFetch(false);
        startProgress();
        let entitas = kode_entitas;
        let param1 = 'GD0000000022'; //temp
        let param2 = moment(filterState.tanggal_awal).format('YYYY-MM-DD');
        let param3 = checkboxState.kondisi_stok ? filterState.kondisi_stok : 'all';
        let param4 = checkboxState.status_barang ? filterState.status_barang : 'all';
        let param5 = checkboxState.no_item ? filterState.kode_barang : 'all'; // temp
        let param6 = checkboxState.kategori_barang ? filterState.kategori_barang : 'all';
        let param7 = checkboxState.kelompok_produk ? filterState.kelompok_produk : 'all';
        let param8 = checkboxState.merek_produk ? filterState.merek_produk : 'all';
        let param9 = checkboxState.jenis_produk ? filterState.jenis_produk : 'all';
        let param10 = checkboxState.golongan_produk ? filterState.golongan_produk : 'all';
        let param11 = userid;

        const arrayPush: any = {};

        // const lastKondisi =

        // console.log('gudangTerpilihData', gudangTerpilihData);

        for (let index = 0; index < gudangTerpilihData.length; index++) {
            const res: any = await axios.get(`${apiUrl}/erp/list_actual_stock`, {
                params: {
                    entitas,
                    param1: gudangTerpilihData[index]?.kode,
                    param2,
                    param3,
                    param4,
                    param5,
                    param6,
                    param7,
                    param8,
                    param9,
                    param10,
                    param11,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const mod = res.data.data.map((item: any) => ({
                ...item,
                harga1: SpreadNumber(item.harga1),
                harga2: SpreadNumber(item.harga2),
                harga3: SpreadNumber(item.harga3),
            }));

            arrayPush[formatKey(gudangTerpilihData[index].nama_gudang)] = mod;
        }

        const blend: any[] = blendGudang(arrayPush);

        const mod = blend.map((item: any) => ({
            ...item,
            jumlah_stok_tersedia: item.jumlah_stok_tersedia - item.order_penjualan,
            kondisi: item.jumlah_stok_tersedia - item.order_penjualan < 0 ? 'Minus' : item.jumlah_stok_tersedia - item.order_penjualan === 0 ? 'Habis' : 'Tersedia Dijual',
        }));
        // gridStokReff.current.setProperties({ dataSource: blend });
        setListStok(mod);
        setOriginalDataSource(mod);
        setSelectedRow(mod[0]);

        console.log('array push', blend, gudangTerpilihData);
        setFixGudang(gudangTerpilihData);
        endProgress();
        setHashFetch(true);
    };

    const blendGudang = (gudangData: any) => {
        const mergedData: any = {};

        Object.entries(gudangData).forEach(([gudang, items]: any) => {
            items.forEach((item: any) => {
                if (!mergedData[item.kode_item]) {
                    mergedData[item.kode_item] = {
                        kode_barang: item.kode_item,
                        no_item: item.no_item,
                        nama_item: item.nama_item,
                        satuan_std: item.satuan,
                        stok_minimal: item.minimal,
                        status: item.status,
                        harga1: parseFloat(item.harga1),
                        harga2: parseFloat(item.harga2),
                        harga3: parseFloat(item.harga3),
                        berat: parseFloat(item.berat),
                        order_penjualan: 0,
                        jumlah_stok_tersedia: 0,
                        order_pembelian: 0,
                        kondisi: 'Habis', // Default kondisi
                    };
                }

                mergedData[item.kode_item][gudang] = item.q1;

                mergedData[item.kode_item].jumlah_stok_tersedia += item.q1;
                // mergedData[item.kode_item].stok_minimal += item.minimal;
                mergedData[item.kode_item].order_penjualan = item.dijual;
                mergedData[item.kode_item].order_pembelian = item.dibeli;

                if (mergedData[item.kode_item].jumlah_stok_tersedia > 0) {
                    mergedData[item.kode_item].kondisi = 'Tersedia dijual';
                } else if (mergedData[item.kode_item].jumlah_stok_tersedia < 0) {
                    mergedData[item.kode_item].kondisi = 'Minus';
                }
            });
        });

        return Object.values(mergedData);
    };

    const recordDoubleClick = (args: any) => {
        if (args.cellIndex === 1) {
            showEditRecord();
        } else {
            setDetailStokPerGudang(true);
        }
    };

    return (
        <div className="Main h-[calc(100vh-220px)]" id="main-target">
            <GlobalProgressBar />
            <style>
                {`
                   .e-row .e-rowcell:hover {
                        cursor: pointer;
                    }

                    .e-row.e-selectionbackground {
                        cursor: pointer;
                    }
                    .e-grid .e-headertext {
                        font-size: 11px !important;

                    }
                        .e-grid .e-columnheader {
                            background-color: black
                        }
                    .e-grid .e-rowcell {
                        font-size: 11px !important;
                    }
                        #checkbox-grid-column8 {
                           margin-left: auto;
                        }

                    .e-grid .e-gridheader tr:first-child th {
                        background: #eeeeee;
                    }
                `}
            </style>
            {/* === Search Group & Button Group === */}
            <div style={{ minHeight: '40px' }} className="mb-1 flex flex-col md:flex-row">
                {/*=== Button Group ===*/}
                <div className="flex items-center gap-2 sm:flex">
                    <ButtonComponent
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
                        content="Filter"
                    />
                    <div className="flex flex-col border-r border-black  pr-1"> &nbsp;</div>
                    <button
                        className="box-border h-[28px] w-[170px] rounded-md bg-[#3a3f5c] px-4 py-1.5  text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                        onClick={() => setVisibleKartuStokAll(true)}
                    >
                        Kartu Stok <u>A</u>LL
                    </button>
                    <button
                        className="box-border h-[28px] w-[170px] rounded-md bg-[#3a3f5c] px-4 py-1.5  text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                        onClick={() => setVisibleKartuStokGudang(true)}
                    >
                        Kartu Stok <u>G</u>dg
                    </button>
                    <div className="flex flex-col border-r border-black  pr-1"> &nbsp;</div>
                    <button
                        className="box-border h-[28px] w-[170px] rounded-md bg-[#3a3f5c] px-4 py-1.5  text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                        onClick={refreshAllHandle}
                    >
                        Refresh <u>ALL</u>
                    </button>
                    <button
                        className="box-border h-[28px] w-[170px] rounded-md bg-[#3a3f5c] px-4 py-1.5  text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                        onClick={refreshAllHandle}
                    >
                        <u>R</u>efresh
                    </button>
                    <div className="flex items-center space-x-2 border-l border-gray-400 pl-2">
                        <span className="mr-2">Cari</span>
                        <input
                            type="text"
                            id="<No Dokumen>"
                            className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="<No. Barang>"
                            name="No_Dokumen_Search"
                            value={searchState.no_item}
                            onChange={(e: any) => {
                                HandleSearchNoitem(e.target.value, setSearchState, setListStok, originalDataSource);
                            }}
                            onFocus={(e: any) => {
                                HandleSearchNoitem(e.target.value, setSearchState, setListStok, originalDataSource);
                            }}
                            // style={{ height: '4vh' }}
                            autoComplete="off"
                        />
                        <input
                            type="text"
                            id="No_Distributor_Search"
                            className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="<Nama Barang>"
                            name="No_Distributor_Search"
                            // onChange={(e: any) => {
                            //     HandleSearchKeteranganDataBok(e.target.value, setFilterState, gridBok.current, originalDataSource, filterKlasifikasi);
                            // }}
                            // onFocus={(e: any) => {
                            //     HandleSearchKeteranganDataBok(e.target.value, setFilterState, gridBok.current, originalDataSource, filterKlasifikasi);
                            // }}
                            // style={{ height: '4vh' }}
                            autoComplete="off"
                        />
                    </div>
                </div>

                <div className="ml-3 mr-1 w-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <span className="mb-1 text-right" style={{ fontSize: '18px', fontFamily: 'Times New Roman' }}>
                        Informasi Stok Aktual
                    </span>
                </div>
            </div>

            {/* === Filter & Table === */}
            <div className={`relative flex h-[calc(100%_-_40px)]  gap-3 ${filterTabJenis === 'Pengajuan Pembenanan' ? 'block' : 'hidden'}`}>
                {/* Filter */}
                {panelVisible && (
                    <div
                        className={`panel absolute z-10 hidden h-full w-[330px] max-w-full flex-none space-y-4 p-4 dark:border-[#191e3a] xl:relative xl:block xl:h-auto ltr:rounded-r-none ltr:xl:rounded-r-md rtl:rounded-l-none rtl:xl:rounded-l-md ${
                            isShowTaskMenu && '!block'
                        }`}
                        style={{ background: '#dedede' }}
                    >
                        <div className="flex h-full flex-col pb-3">
                            <div className="h-[10%] pb-5">
                                <div className="flex items-center text-center">
                                    <button className="absolute right-0 top-0 p-2 text-gray-600 hover:text-gray-900" onClick={handleTogglePanel}>
                                        <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                                    </button>
                                    <div className="shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                            {/* prettier-ignore */}
                                            <path
                            stroke="currentColor"
                            strokeWidth="1.5"
                            d="M22 5.814v.69c0 1.038 0 1.557-.26 1.987-.26.43-.733.697-1.682 1.231l-2.913 1.64c-.636.358-.955.538-1.182.735a2.68 2.68 0 00-.9 1.49c-.063.285-.063.619-.063 1.286v2.67c0 1.909 0 2.863-.668 3.281-.668.418-1.607.05-3.486-.684-.895-.35-1.342-.524-1.594-.879C9 18.907 9 18.451 9 17.542v-2.67c0-.666 0-1-.064-1.285a2.68 2.68 0 00-.898-1.49c-.228-.197-.547-.377-1.183-.735l-2.913-1.64c-.949-.534-1.423-.8-1.682-1.23C2 8.06 2 7.541 2 6.503v-.69"
                        />
                                            <path
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                d="M22 5.815c0-1.327 0-1.99-.44-2.403C21.122 3 20.415 3 19 3H5c-1.414 0-2.121 0-2.56.412C2 3.824 2 4.488 2 5.815"
                                                opacity="0.5"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold ltr:ml-3 rtl:mr-3">Filtering Data</h3>
                                </div>
                            </div>
                            <div className="mb-1 h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>
                            <PerfectScrollbar className="growltr:-mr3.5 ltr:pr3.5 relative h-[90%] rtl:-ml-3.5 rtl:pl-3.5">
                                <div className="flex h-full flex-col gap-6 overflow-auto">
                                    <div>
                                        <div className="mb-1 flex w-full flex-col items-start">
                                            <label className="mb-0.5 flex items-center gap-2 text-xs">{formatString('Gudang_:')}</label>
                                            <div className="box-border h-[250px] w-full flex-grow overflow-x-auto rounded-md bg-white p-2">
                                                <div className="mb-0.5 flex items-center">
                                                    <input type="checkbox" id="all-Gudang" onChange={(e) => pilihSemua(e)} checked={selectedGudang.length === 5} />
                                                    <label htmlFor={`all-Gudang`} className="m-0 text-xs text-gray-900">
                                                        {`pilih semua`}
                                                    </label>
                                                </div>
                                                {listGudang.map((item: any) => (
                                                    <div key={item.kode_gudang} className="mb-0.5 flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id={`checkbox-${item.kode_gudang}`}
                                                            value={item.kode_gudang}
                                                            data-kode={item.kode_gudang}
                                                            data-nama_gudang={item.nama_gudang}
                                                            checked={selectedGudang.includes(item.kode_gudang)}
                                                            onChange={(e: any) => {
                                                                if (e.target.checked && selectedGudang.length === 5) {
                                                                    return;
                                                                }
                                                                handleCheckboxChange(item.kode_gudang);
                                                                console.log('Kurang Lembur', e);
                                                                const nama_gudang = e.target.dataset.nama_gudang;
                                                                const kode = e.target.dataset.kode;
                                                                // const nama_gudang: any = selectedOption.getAttribute('data-nama_gudang');
                                                                // const kode: any = selectedOption.getAttribute('data-kode');
                                                                if (e.target.checked) {
                                                                    setGudangTerpilihData((oldData: any) => [
                                                                        ...oldData,
                                                                        {
                                                                            nama_gudang: nama_gudang,
                                                                            kode: kode,
                                                                        },
                                                                    ]);
                                                                } else {
                                                                    const temp = gudangTerpilihData.filter((item: any) => item.kode !== kode);
                                                                    setGudangTerpilihData(temp);
                                                                }
                                                            }}
                                                        />
                                                        <label htmlFor={`checkbox-${item.kode_gudang}`} className="m-0 text-xs text-gray-900">
                                                            {item.nama_gudang}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mb-0.5 flex flex-col items-start">
                                            <label className="mb-0.5 flex items-center gap-2 text-xs">{formatString('stok_sampai_dengan_tanggal')}</label>
                                            <div className="form-input mt-1 flex justify-between">
                                                <DatePickerComponent
                                                    locale="id"
                                                    style={{ fontSize: '12px' }}
                                                    cssClass="e-custom-style"
                                                    //   renderDayCell={onRenderDayCell}
                                                    enableMask={true}
                                                    maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                    showClearButton={false}
                                                    format="dd-MM-yyyy"
                                                    value={filterState.tanggal_awal.toDate()}
                                                    change={(args: ChangeEventArgsCalendar) => {
                                                        HandleTglInformasiStok(moment(args.value), 'tanggal_awal', setFilterState);
                                                    }}
                                                >
                                                    <Inject services={[MaskedDateTime]} />
                                                </DatePickerComponent>
                                            </div>
                                        </div>
                                        <div className="mb-1 flex w-full flex-col items-start">
                                            <label className="mb-0.5 flex items-center gap-2 text-xs">
                                                <input
                                                    type="checkbox"
                                                    checked={checkboxState.kondisi_stok}
                                                    onChange={(e) =>
                                                        setCheckboxState((prev) => ({
                                                            ...prev,
                                                            kondisi_stok: e.target.checked,
                                                        }))
                                                    }
                                                />{' '}
                                                {formatString('kondisi_stok')}
                                            </label>
                                            <select
                                                name="kondisi_stok"
                                                value={filterState.kondisi_stok}
                                                onChange={handleInputChange}
                                                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                style={{
                                                    maxHeight: 'calc(5 * 1.25rem)', // Menampilkan max 5 opsi dengan tinggi masing-masing 1.25rem
                                                    overflowY: 'auto', // Tambahkan scroll jika opsi lebih dari 5
                                                }}
                                            >
                                                <option value="" disabled selected>
                                                    {formatString('kondisi_stok')}
                                                </option>
                                                <option value="Siap Jual">{formatString('siap_jual')}</option>
                                                <option value="Habis">{formatString('habis')}</option>
                                                <option value="Stok Minus">{formatString('stok_minus')}</option>
                                            </select>
                                        </div>

                                        <div className="mb-1 flex w-full flex-col items-start">
                                            <label className="mb-0.5 flex items-center gap-2 text-xs">
                                                <input
                                                    type="checkbox"
                                                    checked={checkboxState.no_item || checkboxState.nama_item}
                                                    onChange={(e) =>
                                                        setCheckboxState((prev) => ({
                                                            ...prev,
                                                            no_item: e.target.checked,
                                                            nama_item: e.target.checked,
                                                        }))
                                                    }
                                                />{' '}
                                                {formatString('no_item')}
                                            </label>
                                            <div className="relative w-full">
                                                <input
                                                    type="text"
                                                    id="no_item"
                                                    className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 pr-10 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                    placeholder={formatString('no_barang')}
                                                    name="no_item"
                                                    autoComplete="off"
                                                    value={filterState.no_item}
                                                    onChange={(e) => {
                                                        setModalAkun(true);
                                                    }}
                                                />
                                                <span className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3" onClick={() => setModalAkun(true)}>
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M21 21l-4.35-4.35m2.62-4.27a7.37 7.37 0 1 1-14.74 0 7.37 7.37 0 0 1 14.74 0z"
                                                        ></path>
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mb-1 flex w-full flex-col items-start">
                                            <label className="mb-0.5 flex items-center gap-2 text-xs">
                                                <input
                                                    type="checkbox"
                                                    checked={checkboxState.no_item || checkboxState.nama_item}
                                                    onChange={(e) =>
                                                        setCheckboxState((prev) => ({
                                                            ...prev,
                                                            no_item: e.target.checked,
                                                            nama_item: e.target.checked,
                                                        }))
                                                    }
                                                />{' '}
                                                {formatString('nama_item')}
                                            </label>
                                            <div className="relative w-full">
                                                <input
                                                    type="text"
                                                    id="nama_item"
                                                    className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 pr-10 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                    placeholder={formatString('nama_barang')}
                                                    name="nama_item"
                                                    autoComplete="off"
                                                    value={filterState.nama_item}
                                                    onChange={(e) => {
                                                        setModalAkun(true);
                                                    }}
                                                />
                                                <span className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3" onClick={() => setModalAkun(true)}>
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M21 21l-4.35-4.35m2.62-4.27a7.37 7.37 0 1 1-14.74 0 7.37 7.37 0 0 1 14.74 0z"
                                                        ></path>
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mb-1 flex w-full flex-col items-start">
                                            <label className="mb-0.5 flex items-center gap-2 text-xs">
                                                <input
                                                    type="checkbox"
                                                    checked={checkboxState.status_barang}
                                                    onChange={(e) =>
                                                        setCheckboxState((prev) => ({
                                                            ...prev,
                                                            status_barang: e.target.checked,
                                                        }))
                                                    }
                                                />{' '}
                                                {formatString('status_barang')}
                                            </label>
                                            <select
                                                name="status_barang"
                                                value={filterState.status_barang}
                                                onChange={handleInputChange}
                                                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                style={{
                                                    maxHeight: 'calc(5 * 1.25rem)', // Menampilkan max 5 opsi dengan tinggi masing-masing 1.25rem
                                                    overflowY: 'auto', // Tambahkan scroll jika opsi lebih dari 5
                                                }}
                                            >
                                                <option value="" disabled selected>
                                                    {formatString('status_barang')}
                                                </option>
                                                <option value="aktif">{formatString('aktif')}</option>
                                                <option value="slow_moving">{formatString('slow_moving')}</option>
                                                <option value="non_aktif">{formatString('non_aktif')}</option>
                                            </select>
                                        </div>
                                        <div className="mb-1 flex w-full flex-col items-start">
                                            <label className="mb-0.5 flex items-center gap-2 text-xs">
                                                <input
                                                    type="checkbox"
                                                    checked={checkboxState.kategori_barang}
                                                    onChange={(e) =>
                                                        setCheckboxState((prev) => ({
                                                            ...prev,
                                                            kategori_barang: e.target.checked,
                                                        }))
                                                    }
                                                />{' '}
                                                {formatString('kategori_barang')}
                                            </label>
                                            <select
                                                name="kategori_barang"
                                                value={filterState.kategori_barang}
                                                onChange={handleInputChange}
                                                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                style={{
                                                    maxHeight: 'calc(5 * 1.25rem)', // Menampilkan max 5 opsi dengan tinggi masing-masing 1.25rem
                                                    overflowY: 'auto', // Tambahkan scroll jika opsi lebih dari 5
                                                }}
                                            >
                                                <option value="" disabled selected>
                                                    {formatString('kategori_barang')}
                                                </option>
                                                {listKategori.map((item: any, index: number) => (
                                                    <option value={item.grp} key={index}>
                                                        {item.grp}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="mb-1 flex w-full flex-col items-start">
                                            <label className="mb-0.5 flex items-center gap-2 text-xs">
                                                <input
                                                    type="checkbox"
                                                    checked={checkboxState.kelompok_produk}
                                                    onChange={(e) =>
                                                        setCheckboxState((prev) => ({
                                                            ...prev,
                                                            kelompok_produk: e.target.checked,
                                                        }))
                                                    }
                                                />{' '}
                                                {formatString('kelompok_produk')}
                                            </label>
                                            <select
                                                name="kelompok_produk"
                                                value={filterState.kelompok_produk}
                                                onChange={handleInputChange}
                                                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                style={{
                                                    maxHeight: 'calc(5 * 1.25rem)', // Menampilkan max 5 opsi dengan tinggi masing-masing 1.25rem
                                                    overflowY: 'auto', // Tambahkan scroll jika opsi lebih dari 5
                                                }}
                                            >
                                                <option value="" disabled selected>
                                                    {formatString('kelompok_produk')}
                                                </option>
                                                {listKelompok.map((item: any, index: number) => (
                                                    <option value={item.kel} key={index}>
                                                        {item.kel}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="mb-1 flex w-full flex-col items-start">
                                            <label className="mb-0.5 flex items-center gap-2 text-xs">
                                                <input
                                                    type="checkbox"
                                                    checked={checkboxState.merek_produk}
                                                    onChange={(e) =>
                                                        setCheckboxState((prev) => ({
                                                            ...prev,
                                                            merek_produk: e.target.checked,
                                                        }))
                                                    }
                                                />{' '}
                                                {formatString('merek_produk')}
                                            </label>
                                            <select
                                                name="merek_produk"
                                                value={filterState.merek_produk}
                                                onChange={handleInputChange}
                                                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                style={{
                                                    maxHeight: 'calc(5 * 1.25rem)', // Menampilkan max 5 opsi dengan tinggi masing-masing 1.25rem
                                                    overflowY: 'auto', // Tambahkan scroll jika opsi lebih dari 5
                                                }}
                                            >
                                                <option value="" disabled selected>
                                                    {formatString('merek_produk')}
                                                </option>
                                                {merekList.map((item: any, index: any) => (
                                                    <option value={item.merk} key={index}>
                                                        {item.merk}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mb-1 flex w-full flex-col items-start">
                                            <label className="mb-0.5 flex items-center gap-2 text-xs">
                                                <input
                                                    type="checkbox"
                                                    checked={checkboxState.jenis_produk}
                                                    onChange={(e) =>
                                                        setCheckboxState((prev) => ({
                                                            ...prev,
                                                            jenis_produk: e.target.checked,
                                                        }))
                                                    }
                                                />{' '}
                                                {formatString('jenis_produk')}
                                            </label>
                                            <select
                                                name="jenis_produk"
                                                value={filterState.jenis_produk}
                                                onChange={handleInputChange}
                                                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                style={{
                                                    maxHeight: 'calc(5 * 1.25rem)', // Menampilkan max 5 opsi dengan tinggi masing-masing 1.25rem
                                                    overflowY: 'auto', // Tambahkan scroll jika opsi lebih dari 5
                                                }}
                                            >
                                                <option value="" disabled selected>
                                                    {formatString('jenis_produk')}
                                                </option>

                                                <option value={'-'}>{'-'}</option>
                                                <option value={'--'}>{'--'}</option>
                                                <option value={'KONTRAK'}>{'KONTRAK'}</option>
                                                <option value={'Standarisasi'}>{'Standarisasi'}</option>
                                            </select>
                                        </div>

                                        <div className="mb-1 flex w-full flex-col items-start">
                                            <label className="mb-0.5 flex items-center gap-2 text-xs">
                                                <input
                                                    type="checkbox"
                                                    checked={checkboxState.golongan_produk}
                                                    onChange={(e) =>
                                                        setCheckboxState((prev) => ({
                                                            ...prev,
                                                            golongan_produk: e.target.checked,
                                                        }))
                                                    }
                                                />{' '}
                                                {formatString('golongan_produk')}
                                            </label>
                                            <select
                                                name="golongan_produk"
                                                value={filterState.golongan_produk}
                                                onChange={handleInputChange}
                                                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                style={{
                                                    maxHeight: 'calc(5 * 1.25rem)', // Menampilkan max 5 opsi dengan tinggi masing-masing 1.25rem
                                                    overflowY: 'auto', // Tambahkan scroll jika opsi lebih dari 5
                                                }}
                                            >
                                                <option value="" disabled selected>
                                                    {formatString('golongan_produk')}
                                                </option>

                                                <option value={'-'}>{'-'}</option>
                                                <option value={'POLOS'}>{'POLOS'}</option>
                                                <option value={'ULIR'}>{'ULIR'}</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </PerfectScrollbar>
                        </div>
                    </div>
                )}
                <div className={`overlay absolute z-[5] hidden h-full w-full rounded-md bg-black/60 `} onClick={() => setIsShowTaskMenu(isShowTaskMenu)}></div>

                {/* Table */}
                <div className="h-full flex-1 overflow-auto">
                    <Tab.Group defaultIndex={0}>
                        <Tab.Panels className="h-[100%]">
                            <div className={`${toggleGrid.catatan ? 'h-[70%]' : 'h-[90%]'}  w-full`}>
                                {hashFetch ? (
                                    <GridStok
                                        gridStokReff={gridStokReff}
                                        gudangTerpilihData={fixGudang}
                                        listStok={listStok}
                                        setSelectedRow={setSelectedRow}
                                        toggleGrid={toggleGrid}
                                        setToggleGrid={setToggleGrid}
                                        recordDoubleClick={recordDoubleClick}
                                    />
                                ) : (
                                    <GridStokDumy
                                        gridStokReff={gridStokReff}
                                        gudangTerpilihData={fixGudang}
                                        listStok={listStok}
                                        setSelectedRow={setSelectedRow}
                                        toggleGrid={toggleGrid}
                                        setToggleGrid={setToggleGrid}
                                        recordDoubleClick={recordDoubleClick}
                                    />
                                )}
                            </div>
                            <div className={`${toggleGrid.catatan ? 'block' : 'hidden'} h-[20%] w-full pt-2`}>
                                <p>{selectedRow?.catatan?.length === 0 ? `Tidak ada catatan untuk : ${selectedRow?.nama_item}` : `Catatan Barang : ${selectedRow?.nama_item}`}</p>
                                <p>{selectedRow?.catatan}</p>
                            </div>
                            <div className="flex h-[10%] w-full items-center gap-2 pt-3">
                                {/* <label className="flex items-center gap-1">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            setToggleGrid((oldData) => ({
                                                ...oldData,
                                                jumlah_qty: e.target.checked,
                                            }));
                                        }}
                                    />
                                    Jumlah Qty {toggleGrid.jumlah_qty}
                                </label> */}
                                <label className="flex items-center gap-1">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            setToggleGrid((oldData) => ({
                                                ...oldData,
                                                catatan: e.target.checked,
                                            }));
                                        }}
                                    />
                                    Catatan {toggleGrid.catatan}
                                </label>
                                <button
                                    className="box-border h-[30px] w-[130px] rounded-md bg-[#3a3f5c] px-4 py-1.5  text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                                    onClick={() => setDaftarPaket(true)}
                                >
                                    ➡️ Daftar Paket
                                </button>
                                <button
                                    className="box-border h-[30px] w-[130px] rounded-md bg-[#3a3f5c] px-4 py-1.5  text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                                    onClick={() => setAlternatif(true)}
                                >
                                    ➡️ Alternatif
                                </button>
                            </div>
                        </Tab.Panels>
                    </Tab.Group>
                </div>
            </div>
            {modalAkun && (
                <ModalBarang
                    visible={modalAkun}
                    onClose={() => setModalAkun(false)}
                    setHeaderDialogState={setFilterState}
                    setCheckboxState={setCheckboxState}
                    listBarang={listBarang}
                    handleSearchItem={handleSearchItem}
                />
            )}
            {daftarPaket && <DaftarPaket visible={daftarPaket} onClose={() => setDaftarPaket(false)} selectedRow={selectedRow} />}
            {alternatif && <Alternatif visible={alternatif} onClose={() => setAlternatif(false)} selectedRow={selectedRow} />}
            {detailStokPerGudang && <DetailStokPerGudang visible={detailStokPerGudang} onClose={() => setDetailStokPerGudang(false)} selectedRow={selectedRow} />}
            {visibleKartuStokAll && (
                <KartuStockAll selectedRow={selectedRow} visible={visibleKartuStokAll} onClose={() => setVisibleKartuStokAll(false)} stateStokAll={stateStokAll} setStateStokAll={setStateStokAll} />
            )}
            {visibleKartuStokGudang && (
                <KartuStockGudang
                    selectedRow={selectedRow}
                    visible={visibleKartuStokGudang}
                    onClose={() => setVisibleKartuStokGudang(false)}
                    stateStokAll={stateStokAll}
                    setStateStokAll={setStateStokAll}
                    listGudang={listGudang}
                />
            )}
            {modalPersediaan && (
                <DialogBaruEditPersediaan
                    masterState={'EDIT'}
                    entitas={kode_entitas}
                    token={token}
                    userid={userid}
                    itemId={selectedRow.kode_barang}
                    isOpen={modalPersediaan}
                    onClose={() => {
                        setModalPersediaan(false);
                    }}
                />
            )}
        </div>
    );
};

export default InformasiStokAktual;
