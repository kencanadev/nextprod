import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useSession } from '@/pages/api/sessionContext';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs, Inject } from '@syncfusion/ej2-react-calendars';
import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import PerfectScrollbar from 'react-perfect-scrollbar';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

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

import Swal from 'sweetalert2';
import GlobalProgressBar from '@/components/GlobalProgressBar';
import { useProgress } from '@/context/ProgressContext';

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
        jenis: 'Filter',
    },
    {
        jenis: 'Konsolidasi',
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

const RpeKonsol = () => {
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
        tanggal_akhir: moment(),
        no_rpe: '',
        nama_ekspedisi: '',
        no_faktur: '',
        status_approval: '',
    });
    const [checkboxState, setCheckboxState] = useState({
        tanggal: false,
        no_rpe: false,
        nama_ekspedisi: false,
        no_faktur: false,
        status_approval: false,
    });

    const [gudangTerpilihData, setGudangTerpilihData] = useState<any>([]);
    const [selectedRow, setSelectedRow] = useState<any>({});
    const [searchState, setSearchState] = useState({
        no_item: '',
        nama_item: '',
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

    const showEditRecord = () => {
        setModalPersediaan(true);
    };

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
            dataKelompok();
            dataMerk();
            dataItem();
        }
    }, [token]);

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
                    <button className="box-border h-[28px] w-[170px] rounded-md bg-[#3a3f5c] px-4 py-1.5  text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]">
                        ▶ <u>A</u>pproval
                    </button>
                    <button className="box-border h-[28px] w-[270px] rounded-md bg-[#3a3f5c] px-4 py-1.5  text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]">
                        ▶ Ba<u>t</u>al Approval
                    </button>
                    <div className="flex flex-col border-r border-black  pr-1"> &nbsp;</div>

                    <div className="flex items-center space-x-2 border-l border-gray-400 pl-2">
                        <span className="mr-2">Cari</span>
                        <input
                            type="text"
                            id="<No Dokumen>"
                            className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="<No. RPE>"
                            name="No_Dokumen_Search"
                            value={searchState.no_item}
                            // onChange={(e: any) => {
                            //     HandleSearchNoitem(e.target.value, setSearchState, setListStok, originalDataSource);
                            // }}
                            // onFocus={(e: any) => {
                            //     HandleSearchNoitem(e.target.value, setSearchState, setListStok, originalDataSource);
                            // }}
                            // style={{ height: '4vh' }}
                            autoComplete="off"
                        />
                        <input
                            type="text"
                            id="No_Distributor_Search"
                            className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="<Nama Ekspedisi>"
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
                        Konsolidasi Realisasi Pembayaran {`(RPE)`}
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
                                <div className="flex h-full flex-col gap-6 overflow-auto"></div>
                            </PerfectScrollbar>
                            <div className="growltr:-mr3.5 ltr:pr3.5 relative flex h-[10%] items-center justify-center rtl:-ml-3.5 rtl:pl-3.5">Refresh</div>
                        </div>
                    </div>
                )}
                <div className={`overlay absolute z-[5] hidden h-full w-full rounded-md bg-black/60 `} onClick={() => setIsShowTaskMenu(isShowTaskMenu)}></div>

                {/* Table */}
                <div className="h-full flex-1 overflow-auto">
                    <Tab.Group defaultIndex={0}>
                        <Tab.Panels className="h-[100%]"></Tab.Panels>
                    </Tab.Group>
                </div>
            </div>
        </div>
    );
};

export default RpeKonsol;
