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
import { motion } from 'framer-motion';

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
import { RiRefreshFill } from 'react-icons/ri';
import GridRPEKonsol from './GridRPEKonsol';
import DialogFormRpe from '../../inventory/rpe/component/dialogFormRpe';
import stylesIndex from '@styles/index.module.css';

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
    const entitas = sessionData?.entitas ?? '';
    const { startProgress, updateProgress, endProgress, setLoadingMessage } = useProgress();

    const gridPembatalanReff = useRef<any>(null);
    const [selectedRowBeban, setSelectedRowBeban] = useState<any>({});

    const [modalPersediaan, setModalPersediaan] = useState(false);

    const kode_menu = '60204'; // kode menu FPP
    const gridListDataRef = useRef<any>(null);

    // Styling
    const styleButton = { width: 57 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#3b3f5c' };

    const [isShowTaskMenu, setIsShowTaskMenu] = useState(false);
    const [panelVisible, setPanelVisible] = useState(true);
    const [masterState, setMasterState] = useState('');
    const [modalRpe, setModalRpe] = useState(false);
    const vRefreshData = useRef(0);

    const [filterTabJenis, setFilterTabJenis] = useState('Filter');
    const [listKelompok, setlistKelompok] = useState<any>([]);
    const [merekList, setMerekList] = useState<any>([]);
    const [listBarang, setlistBarang] = useState([]);

    // Date State Management

    const [filterState, setFilterState] = useState({
        tanggal_awal: moment(),
        tanggal_akhir: moment(),
        no_rpe: '',
        nama_ekspedisi: '',
        no_faktur: '',
        status_approval: 'all',
    });
    const [checkboxState, setCheckboxState] = useState({
        tanggal: false,
        no_rpe: false,
        nama_ekspedisi: false,
        no_faktur: false,
        status_approval: false,
    });

    const useSelectedEntitas = (entitasLogin: string) => {
        // Ambil dari localStorage berdasarkan entitas yang sedang login
        const [selectedEntitas, setSelectedEntitas] = useState<string[]>(() => {
            const storedData = localStorage.getItem(`selectedEntitas_${entitasLogin}`);
            return storedData ? JSON.parse(storedData) : [];
        });

        // Simpan ke localStorage setiap kali `selectedEntitas` berubah
        useEffect(() => {
            localStorage.setItem(`selectedEntitas_${entitasLogin}`, JSON.stringify(selectedEntitas));
        }, [selectedEntitas, entitasLogin]);

        return { selectedEntitas, setSelectedEntitas };
    };

    // const [selectedEntitas, setSelectedEntitas] = useState<any>([]);
    const { selectedEntitas, setSelectedEntitas } = useSelectedEntitas(kode_entitas);
    const [listEntitas, setListEntitas] = useState<any>([]);

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

    const getAllEntitas = async () => {
        try {
            const response = await axios.get(`${apiUrl}/erp/entitas_pajak?`, {
                params: {
                    // Belum Sesuai Jumlah Data yang Muncul = [Semua, A-F]
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const filteredData = response.data.data.filter((item: any) => item.tampil === 'Y' && item.kodecabang !== '898');

            setListEntitas(filteredData);
        } catch (error) {
            console.log();
        }
    };

    const handleCheckboxChange = (kode: any) => {
        console.log(`selectedEntitas.includes(${kode})`, selectedEntitas.includes(kode));

        setSelectedEntitas((prevSelectedEntitas: any) => {
            // Check if kode is already selected
            if (prevSelectedEntitas.includes(kode)) {
                // Remove the kode from selected codes if already selected
                return prevSelectedEntitas.filter((item: any) => item !== kode);
            } else {
                // Add kode to selected codes if not already selected
                return [...prevSelectedEntitas, kode];
            }
        });
    };

    const handleTogglePanel = () => {
        setPanelVisible(!panelVisible);
    };

    const handleFilterClick = () => {
        setPanelVisible(true);
    };

    const pilihSemua = async () => {
        if (selectedEntitas.length !== listEntitas.length) {
            const cabang: any = [];
            await Promise.all(
                listEntitas.map((item: any) => {
                    return cabang.push(item.kodecabang);
                })
            );
            setSelectedEntitas([...cabang]);
        } else {
            setSelectedEntitas([]);
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

    const selectedRowHanlde = (args: any) => {
        setSelectedRow(args.data);
        console.log('args.data', args.data);
    };

    const approveHandle = () => {
        setMasterState('APPROVE');
        setModalRpe(true);
        vRefreshData.current += 1;
    };

    const batalHandle = () => {
        setMasterState('BATAL_APPROVE');
        setModalRpe(true);
        vRefreshData.current += 1;
    };

    const handleTgl = async (date: any, tipe: string) => {
        if (tipe === 'tanggal_awal') {
            setFilterState((oldData: any) => ({
                ...oldData,
                tanggal_awal: moment(date).format('YYYY-MM-DD'),
            }));
            setCheckboxState((oldData) => ({
                ...oldData,
                tanggal: true,
            }));
        } else if (tipe === 'tanggal_akhir') {
            setFilterState((oldData: any) => ({
                ...oldData,
                tanggal_akhir: moment(date).format('YYYY-MM-DD'),
            }));
            setCheckboxState((oldData) => ({
                ...oldData,
                tanggal: true,
            }));
        }
    };

    const refreshListData = async () => {
        try {
            startProgress();
            let param1 = checkboxState.no_rpe ? filterState.no_rpe : 'all';
            let param2 = checkboxState.tanggal ? moment(filterState.tanggal_awal).format('YYYY-MM-DD') : 'all';
            let param3 = checkboxState.tanggal ? moment(filterState.tanggal_akhir).format('YYYY-MM-DD') : 'all';
            let param4 = checkboxState.nama_ekspedisi ? filterState.nama_ekspedisi : 'all';
            let param5 = checkboxState.no_faktur ? filterState.no_faktur : 'all';
            let param6 = filterState.status_approval;

            let arrayPush: any = [];

            // const lastKondisi =

            // console.log('gudangTerpilihData', gudangTerpilihData);

            for (let index = 0; index < selectedEntitas.length; index++) {
                const res = await axios.get(`${apiUrl}/erp/list_rpe?`, {
                    params: {
                        entitas: selectedEntitas[index],
                        param1: param1,
                        param2: param2,
                        param3: param3,
                        param4: param4,
                        param5: param5,
                        param6: param6,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const mod = res.data.data.map((item: any) => ({
                    ...item,
                    entitas: selectedEntitas[index],
                    bayar_mu: SpreadNumber(item.bayar_mu),
                    biaya_lain: SpreadNumber(item.biaya_lain),
                    kurs: SpreadNumber(item.kurs),
                    lunas_mu: SpreadNumber(item.lunas_mu),
                    memo_mu: SpreadNumber(item.memo_mu),
                    netto_mu: SpreadNumber(item.netto_mu),
                    potongan_lain: SpreadNumber(item.potongan_lain),
                    sub_total: SpreadNumber(item.sub_total),
                    total_berat_ekspedisi: SpreadNumber(item.total_berat_ekspedisi),
                    total_berat_pabrik: SpreadNumber(item.total_berat_pabrik),
                    total_klaim: SpreadNumber(item.total_klaim),
                    total_klaim_ekspedisi: SpreadNumber(item.total_klaim_ekspedisi),
                    total_klaim_pabrik: SpreadNumber(item.total_klaim_pabrik),
                    total_mu: SpreadNumber(item.total_mu),
                    total_pph: SpreadNumber(item.total_pph),
                    total_tambahan: SpreadNumber(item.total_tambahan),
                }));

                arrayPush.push(...mod);
            }
            endProgress();
            gridListDataRef.current!.setProperties({ dataSource: arrayPush });
        } catch (error) {
            endProgress();
            console.log('error', error);
        }
    };

    // console.log('gudang terpilih', gudangTerpilihData);

    // get data persiapan filter
    useEffect(() => {
        if (token) {
            dataKelompok();
            dataMerk();
            dataItem();
            getAllEntitas();
        }
    }, [token]);

    return (
        <div style={{ height: 500 }}>
            <div className={`Main ${stylesIndex.scale75Monitor}`} id="main-target">
                {/* {masterState !== 'APPROVE' && masterState !== 'BATAL_APPROVE' ? <GlobalProgressBar /> : null} */}
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
                            className="box-border h-[28px] w-[140px] rounded-md bg-[#3a3f5c] px-4 py-1.5  text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                            onClick={approveHandle}
                        >
                            ▶ <u>A</u>pproval
                        </button>
                        <button
                            className="box-border h-[28px] w-[230px] rounded-md bg-[#3a3f5c] px-4 py-1.5  text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                            onClick={batalHandle}
                        >
                            ▶ Ba<u>t</u>al Approval
                        </button>
                        <div className="flex flex-col border-r border-black  pr-1"> &nbsp;</div>

                        {/* <div className="flex items-center space-x-2 border-l border-gray-400 pl-2">
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
                    </div> */}
                    </div>

                    <div className="ml-3 mr-1 w-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <span className="mb-1 text-right" style={{ fontSize: '18px', fontFamily: 'Times New Roman' }}>
                            Konsolidasi Realisasi Pembayaran {`(RPE)`}
                        </span>
                    </div>
                </div>

                {/* === Filter & Table === */}
                <div className={`relative flex h-[calc(100%_-_40px)]  gap-3 `}>
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
                                    {tabJenis.map((item) => (
                                        <motion.button
                                            key={item.jenis}
                                            onClick={async () => {
                                                setFilterTabJenis(item.jenis);
                                            }}
                                            className={`whitespace-nowrap px-3 py-2 text-xs font-semibold ${
                                                filterTabJenis === item.jenis ? 'border-b-2 border-orange-500 text-black' : 'text-gray-500 hover:text-black'
                                            }`}
                                            whileTap={{ scale: 1.1 }} // Menambahkan animasi scale saat ditekan
                                            transition={{ duration: 0.2 }}
                                        >
                                            {item.jenis}
                                        </motion.button>
                                    ))}
                                </div>
                                <div className="mb-1 h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>
                                <PerfectScrollbar className={`growltr:-mr3.5 ltr:pr3.5 relative h-[90%] rtl:-ml-3.5 rtl:pl-3.5 ${filterTabJenis === 'Filter' ? 'block' : 'hidden'}`}>
                                    <div className="flex h-full flex-col overflow-auto">
                                        <div className="mb-1 flex w-full flex-col items-start">
                                            <label className="mb-0.5 flex items-center gap-2 text-xs">
                                                <input
                                                    type="checkbox"
                                                    checked={checkboxState.no_rpe}
                                                    onChange={(e) =>
                                                        setCheckboxState((prev) => ({
                                                            ...prev,
                                                            no_rpe: e.target.checked,
                                                        }))
                                                    }
                                                />{' '}
                                                {formatString('no_rpe')}
                                            </label>
                                            <input
                                                type="text"
                                                id="no_rpe"
                                                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                placeholder={formatString('no_rpe')}
                                                name="no_rpe"
                                                // value={filterState.no_rpe}
                                                onChange={handleInputChange}
                                                // style={{ height: '4vh' }}
                                                autoComplete="off"
                                            />
                                        </div>

                                        <div className="mb-1 flex w-full flex-col items-start">
                                            <label className="mb-0.5 flex items-center gap-2 text-xs">
                                                <input
                                                    type="checkbox"
                                                    checked={checkboxState.tanggal}
                                                    onChange={(e) =>
                                                        setCheckboxState((prev) => ({
                                                            ...prev,
                                                            tanggal: e.target.checked,
                                                        }))
                                                    }
                                                />{' '}
                                                {formatString('tanggal')}
                                            </label>
                                            <div className="flex w-full items-center">
                                                <span className="flex h-[5vh] w-[45%] items-center rounded-md border border-gray-300 bg-gray-50 p-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
                                                    <DatePickerComponent
                                                        locale="id"
                                                        cssClass="e-custom-style"
                                                        enableMask={true}
                                                        showClearButton={false}
                                                        format="dd-MM-yyyy"
                                                        width="100%"
                                                        value={moment(filterState.tanggal_awal).toDate()}
                                                        change={(args: ChangeEventArgsCalendar) => {
                                                            handleTgl(args.value, 'tanggal_awal');
                                                        }}
                                                    >
                                                        <Inject services={[MaskedDateTime]} />
                                                    </DatePickerComponent>
                                                </span>

                                                <label className="mr-1 flex w-[10%] text-xs" style={{ marginBottom: -2 }}>
                                                    S/D
                                                </label>
                                                <span className="flex h-[5vh] w-[45%] items-center rounded-md border border-gray-300 bg-gray-50 p-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
                                                    <DatePickerComponent
                                                        locale="id"
                                                        cssClass="e-custom-style"
                                                        enableMask={true}
                                                        showClearButton={false}
                                                        format="dd-MM-yyyy"
                                                        width="100%"
                                                        value={moment(filterState.tanggal_akhir).toDate()}
                                                        change={(args: ChangeEventArgsCalendar) => {
                                                            handleTgl(args.value, 'tanggal_akhir');
                                                        }}
                                                    >
                                                        <Inject services={[MaskedDateTime]} />
                                                    </DatePickerComponent>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mb-1 flex w-full flex-col items-start">
                                            <label className="mb-0.5 flex items-center gap-2 text-xs">
                                                <input
                                                    type="checkbox"
                                                    checked={checkboxState.nama_ekspedisi}
                                                    onChange={(e) =>
                                                        setCheckboxState((prev) => ({
                                                            ...prev,
                                                            nama_ekspedisi: e.target.checked,
                                                        }))
                                                    }
                                                />{' '}
                                                {formatString('nama_ekspedisi')}
                                            </label>
                                            <input
                                                type="text"
                                                id="nama_ekspedisi"
                                                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                placeholder={formatString('nama_ekspedisi')}
                                                name="nama_ekspedisi"
                                                // value={filterState.nama_ekspedisi}
                                                onChange={handleInputChange}
                                                // style={{ height: '4vh' }}
                                                autoComplete="off"
                                            />
                                        </div>

                                        <div className="mb-1 flex w-full flex-col items-start">
                                            <label className="mb-0.5 flex items-center gap-2 text-xs">
                                                <input
                                                    type="checkbox"
                                                    checked={checkboxState.no_faktur}
                                                    onChange={(e) =>
                                                        setCheckboxState((prev) => ({
                                                            ...prev,
                                                            no_faktur: e.target.checked,
                                                        }))
                                                    }
                                                />{' '}
                                                {formatString('no_faktur_ekspedisi')}
                                            </label>
                                            <input
                                                type="text"
                                                id="no_faktur"
                                                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                placeholder={formatString('no_faktur')}
                                                name="no_faktur"
                                                // value={filterState.no_faktur}
                                                onChange={handleInputChange}
                                                // style={{ height: '4vh' }}
                                                autoComplete="off"
                                            />
                                        </div>
                                        <label className="mb-2 text-xs font-semibold text-gray-700">Status Approval</label>
                                        <div className="mb-1 grid w-full grid-cols-2  items-start">
                                            <label className="flex items-center text-xs font-medium text-gray-800">
                                                <input
                                                    type="radio"
                                                    name="status_approval"
                                                    value="Y"
                                                    checked={filterState.status_approval === 'all'}
                                                    onChange={handleInputChange}
                                                    className="h-4 w-4 border-gray-300 text-blue-500 focus:ring-blue-400"
                                                />
                                                <span className="ml-2">Semua</span>
                                            </label>
                                            <label className="flex items-center text-xs font-medium text-gray-800">
                                                <input
                                                    type="radio"
                                                    name="status_approval"
                                                    value="N"
                                                    checked={filterState.status_approval === 'N'}
                                                    onChange={handleInputChange}
                                                    className="h-4 w-4 border-gray-300 text-blue-500 focus:ring-blue-400"
                                                />
                                                <span className="ml-2">Ditolak</span>
                                            </label>
                                            <label className="flex items-center text-xs font-medium text-gray-800">
                                                <input
                                                    type="radio"
                                                    name="status_approval"
                                                    value="X"
                                                    checked={filterState.status_approval === 'X'}
                                                    onChange={handleInputChange}
                                                    className="h-4 w-4 border-gray-300 text-blue-500 focus:ring-blue-400"
                                                />
                                                <span className="ml-2">Baru</span>
                                            </label>
                                            <label className="flex items-center text-xs font-medium text-gray-800">
                                                <input
                                                    type="radio"
                                                    name="status_approval"
                                                    value="C"
                                                    checked={filterState.status_approval === 'C'}
                                                    onChange={handleInputChange}
                                                    className="h-4 w-4 border-gray-300 text-blue-500 focus:ring-blue-400"
                                                />
                                                <span className="ml-2">Koreksi</span>
                                            </label>
                                            <label className="flex items-center text-xs font-medium text-gray-800">
                                                <input
                                                    type="radio"
                                                    name="status_approval"
                                                    value="all"
                                                    checked={filterState.status_approval === '4'}
                                                    onChange={handleInputChange}
                                                    className="h-4 w-4 border-gray-300 text-blue-500 focus:ring-blue-400"
                                                />
                                                <span className="ml-2">Disetujui</span>
                                            </label>
                                            <label className="flex items-center text-xs font-medium text-gray-800">
                                                <input
                                                    type="radio"
                                                    name="status_approval"
                                                    value="B"
                                                    checked={filterState.status_approval === 'B'}
                                                    onChange={handleInputChange}
                                                    className="h-4 w-4 border-gray-300 text-blue-500 focus:ring-blue-400"
                                                />
                                                <span className="ml-2">Dibatalkan</span>
                                            </label>
                                        </div>
                                    </div>
                                </PerfectScrollbar>
                                <PerfectScrollbar className={`growltr:-mr3.5 ltr:pr3.5 relative h-[90%] rtl:-ml-3.5 rtl:pl-3.5 ${filterTabJenis === 'Konsolidasi' ? 'block' : 'hidden'}`}>
                                    <div className="flex h-full flex-col overflow-auto">
                                        <div className="mb-1 flex w-full flex-col items-start">
                                            <label className="mb-0.5 flex items-center gap-2 text-xs">{formatString('kantor_pusat')}</label>
                                            <div className="box-border h-[250px] w-full flex-grow overflow-x-auto rounded-md bg-white p-2">
                                                <div className="mb-0.5 flex items-center">
                                                    <input type="checkbox" id="all-entitas" onChange={pilihSemua} checked={listEntitas.length === selectedEntitas.length} />
                                                    <label htmlFor={`all-entitas`} className="m-0 text-xs text-gray-900">
                                                        {`pilih semua`}
                                                    </label>
                                                </div>
                                                {listEntitas.map((item: any) => (
                                                    <div key={item.kodecabang} className="mb-0.5 flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id={`checkbox-${item.kodecabang}`}
                                                            value={item.kodecabang}
                                                            checked={selectedEntitas.includes(item.kodecabang)}
                                                            onChange={() => handleCheckboxChange(item.kodecabang)}
                                                        />
                                                        <label htmlFor={`checkbox-${item.kodecabang}`} className="m-0 text-xs text-gray-900">
                                                            {`[${item.kodecabang}] ${item.cabang}`}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </PerfectScrollbar>
                                <div className="growltr:-mr3.5 ltr:pr3.5 relative flex h-[10%] items-center justify-center rtl:-ml-3.5 rtl:pl-3.5">
                                    <button
                                        onClick={refreshListData}
                                        className="ml-3 flex h-7 items-center rounded-md bg-[#3a3f5c] p-2 py-1 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#2f3451]"
                                    >
                                        <RiRefreshFill className="text-md" />
                                        Refresh Data
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className={`overlay absolute z-[5] hidden h-full w-full rounded-md bg-black/60 `} onClick={() => setIsShowTaskMenu(isShowTaskMenu)}></div>

                    {/* Table */}
                    <div className="h-full flex-1 overflow-auto">
                        <Tab.Group defaultIndex={0}>
                            <Tab.Panels className="h-[100%]">
                                <GridRPEKonsol gridListDataRef={gridListDataRef} selectedRowHanlde={selectedRowHanlde} />
                            </Tab.Panels>
                        </Tab.Group>
                    </div>
                </div>

                <DialogFormRpe
                    userid={userid}
                    kode_entitas={selectedRow.entitas ?? kode_entitas}
                    entitas={entitas}
                    masterKodeDokumen={selectedRow.kode_rpe}
                    masterDataState={masterState}
                    isOpen={modalRpe}
                    onClose={() => {
                        setModalRpe(false);
                        setMasterState('');
                    }}
                    onRefresh={refreshListData}
                    kode_user={kode_user}
                    token={token}
                    onRefreshTipe={vRefreshData.current}
                    handleRefreshData={refreshListData}
                />
            </div>
        </div>
    );
};

export default RpeKonsol;
