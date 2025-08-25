import React, { Fragment, useEffect, useRef, useState } from 'react';

// Syncfusion Import
import { GridComponent, ColumnDirective, ColumnsDirective, Page, Edit, Sort, Filter, Group, Resize, Reorder, Selection, CommandColumn, VirtualScroll, Inject } from '@syncfusion/ej2-react-grids';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar } from '@syncfusion/ej2-react-calendars';
import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { FocusInEventArgs, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { loadCldr, L10n, enableRipple } from '@syncfusion/ej2-base';
import idIDLocalization from 'public/syncfusion/locale.json';
// Others Import
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Tab } from '@headlessui/react';

import moment from 'moment';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json';

import { useSession } from '@/pages/api/sessionContext';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faTimes } from '@fortawesome/free-solid-svg-icons';
import { gridOptions, jenisOpnameList, jenisTransaksiOpnameList, MainTabList, statusOpnameList } from './constants';
import { handleJenisCheckbox, handleJenisTransaksiCheckbox, handleStatusCheckbox } from './functions';
import { TemplateHasilOpname, TemplateHasilTimbang } from './template';
import { GetAllEntitas, getAllListOpname, getDetailOpname, getEntitasPajak, getUserApp } from './api';
import { FillFromSQL } from '@/utils/routines';
import Loader from './components/Loader';
import Swal from 'sweetalert2';
import DialogHasilOpname from '../../../inventory/stok-opname/jadwal-dan-hasil/components/DialogHasilOpname';

loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
L10n.load(idIDLocalization);
enableRipple(true);

// Styles
const styleButton = { height: '28px', backgroundColor: '#3b3f5c' };

export const offlineTemplate = (field: string, data: any, column: any) => {
    return data[field] === 'Y' ? '✔️' : ''; // If the value is 0, return empty string
};

const KonsolidasiJhso = () => {
    // Sessions
    const { sessionData, isLoading: isLoadingSession } = useSession();

    const entitas_user = sessionData?.entitas ?? '';
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';

    if (isLoadingSession) {
        return;
    }

    // Global State Management
    const [data, setData] = useState<any>([]);
    const [detailData, setDetailData] = useState([]);
    const [listPajakData, setListPajakData] = useState([]);
    const [listEntitas, setListEntitas] = useState<any>([]);
    const [selectedItem, setSelectedItem] = useState<any>({});

    const [panelVisible, setPanelVisible] = useState(true);
    const [isShowTaskMenu, setIsShowTaskMenu] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('besi');
    const [filterTab, setFilterTab] = useState('filters');

    const [userApp, setUserApp] = useState('');

    const [checkDetailTransaksi, setCheckDetailTransaksi] = useState(false);

    const [kategori, setKategori] = useState([]);
    const [kelompok, setKelompok] = useState([]);
    const [fetchEnt, setFetchEnt] = useState<any>('');

    const [statusPage, setStatusPage] = useState('');
    const [showDialogOpname, setShowDialogOpname] = useState(false);

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

    // Filter State Management
    const [checkedEnt, setCheckedEnt] = useState<any>({});
    const [isAllEntChecked, setIsAllEntChecked] = useState(false);
    const [filterData, setFilterData] = useState<any>({
        // Tanggal
        isTglChecked: true,
        tglAwal: moment().startOf('years'),
        tglAkhir: moment().endOf('years'),

        // Others
        isNamaChecked: false,
        namaValue: '',
        isKategoriChecked: false,
        kategoriValue: '',
        isKelompokChecked: false,
        kelompokValue: '',
        jenisOpname: ['M', 'P', 'T', 'A'],
        hasilOpname: 'Semua',
        statusOpname: ['9', '8', '0', '1', '2', '3', '4'],
        jenisTransaksiOpname: [],
    });

    const updateFilterState = (field: any, value: any) => {
        setFilterData((prev: any) => ({
            ...prev,
            [field]: value,
        }));
    };

    // const handleCheckboxEnt = (id: any, kode: any) => {
    //     const newCheckedItems: any = { ...checkedEnt };
    //     if (newCheckedItems[id]) {
    //         delete newCheckedItems[id];
    //     } else {
    //         newCheckedItems[id] = kode;
    //     }
    //     setCheckedEnt(newCheckedItems);
    //     setIsAllEntChecked(Object.keys(newCheckedItems).length === listPajakData.length);
    // };

    const handleCheckboxEnt = async () => {
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

    // const handleSelectAll = () => {
    //     if (isAllEntChecked) {
    //         setCheckedEnt({});
    //         setIsAllEntChecked(false);
    //     } else {
    //         const allItems: any = {};
    //         listPajakData.forEach((item: any) => {
    //             allItems[item.id] = item.kode;
    //         });
    //         setCheckedEnt(allItems);
    //         setIsAllEntChecked(true);
    //     }
    // };

    const handleSelectAll = (kode: any) => {
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

    // REFERENCE
    const listGridRef = useRef<GridComponent | any>(null);
    const detailGridRef = useRef<GridComponent | any>(null);

    // Fetch Data
    const fetchListData = async () => {
        const arrEnt = Object.values(checkedEnt);
        const allData = [];

        try {
            setIsLoading(true);
            for (const data of selectedEntitas) {
                setFetchEnt(data);
                const params = {
                    entitas: data,
                    param1: filterData.isTglChecked ? filterData.tglAwal.format('YYYY-MM-DD') : 'all',
                    param2: filterData.isTglChecked ? filterData.tglAkhir.format('YYYY-MM-DD') : 'all',
                    param3: filterData.isNamaChecked ? filterData.namaValue : 'all',
                    param4: filterData.isKategoriChecked ? filterData.kategoriValue : 'all',
                    param5: filterData.isKelompokChecked ? filterData.kelompokValue : 'all',
                    param6: Object.keys(filterData.jenisOpname).length > 0 ? filterData.jenisOpname.join(';') : 'all',
                    param7: filterData.hasilOpname === 'Semua' ? 'all' : filterData.hasilOpname === 'Ya' ? 0 : 1,
                    param8: Object.keys(filterData.statusOpname).length > 0 ? filterData.statusOpname.join(';') : 'all',
                    param9: Object.keys(filterData.jenisTransaksiOpname).length > 0 ? filterData.jenisTransaksiOpname.join(';') : 'all',
                };

                const response = await getAllListOpname({ params, token });
                let filteredData;
                if (activeTab === 'besi') {
                    filteredData = response
                        .filter((item: any) => item.dok_opname === 'OB')
                        .map((item: any) => ({
                            ...item,
                            tgl_opname: moment(item.tgl_opname).format('dddd, DD-MM-YYYY'),
                            alasan_koreksi: item.alasan_koreksi === null ? '' : item.alasan_koreksi.split('\r')[0],
                            kode_entitas: data,
                        }));
                    allData.push(...filteredData);
                } else {
                    filteredData = response
                        .filter((item: any) => item.dok_opname === 'ON')
                        .map((item: any) => ({
                            ...item,
                            tgl_opname: moment(item.tgl_opname).format('dddd, DD-MM-YYYY'),
                            kode_entitas: data,
                        }));
                    allData.push(...filteredData);
                }
            }

            setData(allData);
            listGridRef.current.setProperties({ dataSource: allData });
            listGridRef.current.refresh();
            // console.log('allData: ', allData);
        } catch (error) {
            console.error('Error fetching list data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDetailData = async () => {
        try {
            const params = {
                entitas: selectedItem.kode_entitas,
                param1: selectedItem.kode_opname,
                param2: 'D',
            };
            const res = await getDetailOpname({ params, token });

            const formattedData = res.map((item: any) => ({
                ...item,
                qty: parseFloat(item.qty),
            }));

            setDetailData(formattedData);
            detailGridRef.current.setProperties({ dataSource: formattedData });
            detailGridRef.current.refresh();
        } catch (error) {
            console.error(error);
        }
    };

    const fetchEntitasPajak = async () => {
        try {
            const allEntitas = await GetAllEntitas(kode_entitas, token);
            console.log('allEntitas = ', allEntitas);

            setListEntitas(allEntitas);

            const params = {
                entitas: kode_entitas,
                param1: userid,
            };
            const response = await getEntitasPajak({ params, token });
            const modifiedData = response.map((item: any, index: number) => ({
                id: index + 1,
                kode: item.kodecabang,
                name: `[${item.kodecabang}] - ${item.cabang}`,
            }));
            setListPajakData(modifiedData);
        } catch (error) {
            console.error('Error fetching entitas pajak:', error);
        }
    };

    const fetchRequiredData = () => {
        FillFromSQL(kode_entitas, 'kategori')
            .then((res: any) => {
                setKategori(res);
            })
            .catch((err: any) => {
                console.error('Error fetching kategori:', err);
            });

        FillFromSQL(kode_entitas, 'kelompok')
            .then((res: any) => {
                setKelompok(res);
            })
            .catch((err: any) => {
                console.error('Error fetching kelompok:', err);
            });
    };

    // Global Func
    const handleApprovalClick = () => {
        if (!selectedItem.kode_opname) return;
        if (selectedItem.hasil !== 'Y') {
            Swal.fire({
                text: 'Belum ada hasil opname.',
                icon: 'warning',
                backdrop: true,
                showConfirmButton: false,
                timer: 2000,
                target: '#main-target',
            });
            return;
        }

        if (selectedItem.applevel === '9') {
            Swal.fire({
                text: 'Status dokumen masih perlu dikoreksi.',
                icon: 'warning',
                backdrop: true,
                showConfirmButton: false,
                timer: 2000,
                target: '#main-target',
            });
            return;
        }

        if (selectedItem.komplit === 'Y') {
            Swal.fire({
                text: 'Data opname sudah disetujui.',
                icon: 'warning',
                backdrop: true,
                showConfirmButton: false,
                timer: 2000,
                target: '#main-target',
            });
            return;
        }

        let lvlDokumen = Number(selectedItem.applevel) + 1;
        let lvlUser = Number(userApp);

        if (lvlUser === 5) {
            if (lvlDokumen === 1 || lvlDokumen === 2) {
                lvlUser = lvlDokumen;
            }
        } else if (lvlUser === 6) {
            if (lvlDokumen === 2 || lvlDokumen === 3) {
                lvlUser = lvlDokumen;
            }
        } else if (lvlUser === 7) {
            if (lvlDokumen === 3 || lvlDokumen === 4) {
                lvlUser = lvlDokumen;
            }
        }

        if (lvlDokumen === 9) {
            lvlUser = 9;
        }

        if (lvlDokumen != lvlUser) {
            Swal.fire({
                text: 'Anda belum berhak untuk approval data ini.',
                icon: 'warning',
                backdrop: true,
                showConfirmButton: false,
                timer: 2000,
                target: '#main-target',
            });
            return;
        }

        if (lvlDokumen === 9) {
            lvlDokumen = 1;
        }

        setStatusPage('APPROVAL');
        setShowDialogOpname(true);
    };

    const handlePreviewClick = () => {
        setStatusPage('PREVIEW');
        setShowDialogOpname(true);
    };

    const entName = listPajakData.filter((item: any) => item.kode === selectedItem.kode_entitas).map((item: any) => item.name);

    // Render Effect
    useEffect(() => {
        // fetchListData();
        fetchEntitasPajak();
        fetchRequiredData();
    }, []);

    useEffect(() => {
        if (selectedItem.kode_opname) {
            fetchDetailData();
        }
    }, [selectedItem]);

    // useEffect(() => {
    //     fetchListData();
    // }, [activeTab]);

    const [hasClickedTab, setHasClickedTab] = useState(false);

    useEffect(() => {
        if (!hasClickedTab) return; // skip kalau belum klik
        fetchListData();
    }, [activeTab, hasClickedTab]);

    useEffect(() => {
        const fetchUserApp = async () => {
            const params = {
                entitas: kode_entitas,
                param1: userid,
            };
            const data = await getUserApp({ params, token });
            setUserApp(data[0].app_opname);
        };

        fetchUserApp();
    }, []);

    return (
        <div className={`Main ${showDialogOpname ? 'h-[100vh]' : 'h-[calc(100vh-230px)]'}`} id="main-target">
            {/* === Button Group === */}
            <div className="flex min-h-[40px]">
                {/* === Button === */}
                <div className="flex gap-2">
                    <ButtonComponent
                        disabled={panelVisible}
                        style={
                            panelVisible
                                ? {
                                      width: '57px',
                                      height: '28px',
                                  }
                                : { ...styleButton, color: 'white' }
                        }
                        onClick={() => setPanelVisible(true)}
                        id="btnFilter"
                        cssClass="e-primary e-small"
                        content="Filter"
                    />
                    <ButtonComponent id="btnApproval" cssClass="e-primary e-small" style={styleButton} onClick={handleApprovalClick} content="Approval" />
                    <ButtonComponent id="btnApproval2" cssClass="e-primary e-small" style={styleButton} onClick={handleApprovalClick} content="Approval 2" />
                    <ButtonComponent id="btnApproval3" cssClass="e-primary e-small" style={styleButton} onClick={handleApprovalClick} content="Approval 3" />
                    <ButtonComponent id="btnApproval4" cssClass="e-primary e-small" style={styleButton} onClick={handleApprovalClick} content="Approval 4" />
                </div>
                {/* === Title === */}
                <div className="ml-3 mr-1 w-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <span className="mb-1 text-right" style={{ fontSize: '18px', fontFamily: 'Times New Roman' }}>
                        Konsolidasi - Jadwal dan Hasil Stok Opname
                    </span>
                </div>
            </div>

            {/* === Filter & Table === */}
            <div className="relative flex h-full gap-1">
                {/* === Filter === */}
                {panelVisible && (
                    <div
                        className={`panel absolute z-10 hidden h-full w-[320px] max-w-full flex-none space-y-4 p-4 dark:border-[#191e3a] xl:relative xl:block xl:h-auto ltr:rounded-r-none ltr:xl:rounded-r-md rtl:rounded-l-none rtl:xl:rounded-l-md ${
                            isShowTaskMenu && '!block'
                        }`}
                        style={{ background: '#dedede' }}
                    >
                        <div className="flex h-full flex-col pb-3">
                            <div className="pb-5">
                                <div className="flex items-center text-center">
                                    <button className="absolute right-0 top-0 p-2 text-gray-600 hover:text-gray-900" onClick={() => setPanelVisible(!panelVisible)}>
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
                            <PerfectScrollbar className="growltr:-mr3.5 ltr:pr3.5 relative h-full rtl:-ml-3.5 rtl:pl-3.5">
                                <div className="flex h-full flex-col overflow-auto">
                                    <Tab.Group>
                                        <Tab.List className="flex gap-2">
                                            <Tab as={Fragment}>
                                                {({ selected }) => (
                                                    <button
                                                        onClick={() => setFilterTab('filters')}
                                                        className={`${
                                                            selected ? '!border-white-light !border-b-white font-bold text-gray-900 dark:!border-[#191e3a] dark:!border-b-black' : 'text-gray-400'
                                                        } -mb-[1px] flex items-center border border-transparent p-3.5 py-2 !outline-none transition duration-300 hover:text-danger`}
                                                    >
                                                        Filters
                                                    </button>
                                                )}
                                            </Tab>
                                            <Tab as={Fragment}>
                                                {({ selected }) => (
                                                    <button
                                                        onClick={() => setFilterTab('konsolidasi')}
                                                        className={`${
                                                            selected ? '!border-white-light !border-b-white font-bold text-gray-900 dark:!border-[#191e3a] dark:!border-b-black' : 'text-gray-400'
                                                        } -mb-[1px] flex items-center border border-transparent p-3.5 py-2 !outline-none transition duration-300 hover:text-danger`}
                                                    >
                                                        Konsolidasi
                                                    </button>
                                                )}
                                            </Tab>
                                        </Tab.List>
                                        <div className="mb-1 h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>
                                        <Tab.Panels>
                                            {filterTab === 'filters' && (
                                                <div>
                                                    {/* Tanggal */}
                                                    <div>
                                                        <div className="mt-2 flex justify-between">
                                                            <CheckBoxComponent
                                                                label="Tanggal Batas Waktu"
                                                                checked={filterData.isTglChecked}
                                                                change={(args: ChangeEventArgsButton) => {
                                                                    const value: any = args.checked;
                                                                    updateFilterState('isTglChecked', value);
                                                                }}
                                                            />
                                                        </div>
                                                        <div className={`grid grid-cols-1 justify-between gap-2 sm:flex `}>
                                                            <div className="form-input mt-1 flex justify-between">
                                                                <DatePickerComponent
                                                                    locale="id"
                                                                    style={{ fontSize: '12px' }}
                                                                    cssClass="e-custom-style"
                                                                    strictMode
                                                                    enableMask={true}
                                                                    maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                                    showClearButton={false}
                                                                    format="dd-MM-yyyy"
                                                                    value={filterData.tglAwal.toDate()}
                                                                    change={(args: ChangeEventArgsCalendar) => {
                                                                        // HandleTgl(moment(args.value), 'tanggalAwal', setDate1, setDate2, setIsDateRangeChecked);
                                                                        updateFilterState('tglAwal', moment(args.value));
                                                                        updateFilterState('isTglChecked', true);
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
                                                                    strictMode
                                                                    enableMask={true}
                                                                    maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                                    showClearButton={false}
                                                                    format="dd-MM-yyyy"
                                                                    value={filterData.tglAkhir.toDate()}
                                                                    change={(args: ChangeEventArgsCalendar) => {
                                                                        updateFilterState('tglAkhir', moment(args.value));
                                                                        updateFilterState('isTglChecked', true);
                                                                    }}
                                                                >
                                                                    <Inject services={[MaskedDateTime]} />
                                                                </DatePickerComponent>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Nama Barang */}
                                                    <div>
                                                        <div className="mt-2 flex">
                                                            <CheckBoxComponent
                                                                label="Nama Barang"
                                                                checked={filterData.isNamaChecked}
                                                                change={(args: ChangeEventArgsButton) => {
                                                                    const value: any = args.checked;
                                                                    updateFilterState('isNamaChecked', value);
                                                                }}
                                                                style={{ borderRadius: 3, borderColor: 'gray' }}
                                                            />
                                                        </div>
                                                        <div className="mt-1 flex justify-between">
                                                            <div className="container form-input">
                                                                <TextBoxComponent
                                                                    placeholder=""
                                                                    value={filterData.namaValue}
                                                                    input={(args: FocusInEventArgs) => {
                                                                        const value: any = args.value;
                                                                        updateFilterState('namaValue', value);
                                                                        updateFilterState('isNamaChecked', value.length > 0);
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Kategori */}
                                                    <div>
                                                        <div className="mt-2 flex">
                                                            <CheckBoxComponent
                                                                label="Kategori"
                                                                checked={filterData.isKategoriChecked}
                                                                change={(args: ChangeEventArgsButton) => {
                                                                    const value: any = args.checked;
                                                                    updateFilterState('isKategoriChecked', value);
                                                                }}
                                                                style={{ borderRadius: 3, borderColor: 'gray' }}
                                                            />
                                                        </div>
                                                        <div className="mt-1 flex justify-between">
                                                            <div className="container form-input">
                                                                <ComboBoxComponent
                                                                    autofill
                                                                    showClearButton={false}
                                                                    id="kategori"
                                                                    className="form-select"
                                                                    dataSource={kategori}
                                                                    fields={{ value: 'grp', text: 'grp' }}
                                                                    placeholder="--Silahkan Pilih--"
                                                                    value={filterData.kategoriValue}
                                                                    change={(args: any) => {
                                                                        const value = args.value;
                                                                        updateFilterState('kategoriValue', value);
                                                                        updateFilterState('isKategoriChecked', value?.length > 0 ? true : false);
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Kelompok Produk */}
                                                    <div>
                                                        <div className="mt-2 flex">
                                                            <CheckBoxComponent
                                                                label="Kelompok Produk"
                                                                checked={filterData.isKelompokChecked}
                                                                change={(args: ChangeEventArgsButton) => {
                                                                    const value: any = args.checked;
                                                                    updateFilterState('isKelompokChecked', value);
                                                                }}
                                                                style={{ borderRadius: 3, borderColor: 'gray' }}
                                                            />
                                                        </div>
                                                        <div className="mt-1 flex justify-between">
                                                            <div className="container form-input">
                                                                <ComboBoxComponent
                                                                    autofill
                                                                    showClearButton={false}
                                                                    id="kelompok"
                                                                    className="form-select"
                                                                    dataSource={kelompok}
                                                                    fields={{ value: 'kel', text: 'kel' }}
                                                                    placeholder="--Silahkan Pilih--"
                                                                    value={filterData.kelompokValue}
                                                                    change={(args: any) => {
                                                                        const value = args.value;
                                                                        updateFilterState('kelompokValue', value);
                                                                        updateFilterState('isKelompokChecked', value?.length > 0 ? true : false);
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Jenis Opname */}
                                                    <div className="mt-2 p-1">
                                                        <div className="mb-1">
                                                            <span>Jenis Opname</span>
                                                        </div>

                                                        <div>
                                                            {jenisOpnameList.map((item: any) => (
                                                                <div key={item.id} className="flex items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`${item.value}`}
                                                                        className="cursor-pointer bg-black !text-black"
                                                                        checked={filterData.jenisOpname.includes(item.value)}
                                                                        onChange={(e) => handleJenisCheckbox(item.value, e.target.checked, setFilterData)}
                                                                    />
                                                                    <label htmlFor={`${item.value}`} className="ml-1 cursor-pointer text-xs text-black">
                                                                        {item.text}
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {/* Hasil Opname */}
                                                    <div>
                                                        <div className="mt-2">
                                                            <span>Hasil Opname</span>
                                                        </div>
                                                        <div className="mt-1 flex flex-wrap items-center gap-8">
                                                            {['Ya', 'Tidak', 'Semua'].map((option) => (
                                                                <label key={option} className="inline-flex items-center">
                                                                    <input
                                                                        type="radio"
                                                                        name="hasil-opname"
                                                                        value={option}
                                                                        checked={filterData.hasilOpname === option}
                                                                        onChange={(e) => updateFilterState('hasilOpname', e.target.value)}
                                                                        className="form-radio !text-black"
                                                                    />
                                                                    <span className="ml-1">{option}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {/* Status Opname */}
                                                    <div className="p-1">
                                                        <div className="mb-1">
                                                            <span>Hasil Opname</span>
                                                        </div>

                                                        <div>
                                                            {statusOpnameList.map((item: any) => (
                                                                <div key={item.id} className="flex items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`${item.value}`}
                                                                        className="cursor-pointer !text-black"
                                                                        checked={filterData.statusOpname.includes(item.value)}
                                                                        onChange={(e) => handleStatusCheckbox(item.value, e.target.checked, setFilterData)}
                                                                    />
                                                                    <label htmlFor={`${item.value}`} className="ml-1 cursor-pointer text-xs text-gray-900">
                                                                        {item.text}
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {/* Jenis Transaksi Opname */}
                                                    <div className="p-1">
                                                        <div className="mb-1">
                                                            <span>Jenis Transaksi Opname</span>
                                                        </div>

                                                        <div>
                                                            {jenisTransaksiOpnameList.map((item: any) => (
                                                                <div key={item.id} className="flex items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`${item.value}`}
                                                                        className="cursor-pointer !text-black"
                                                                        checked={filterData.jenisTransaksiOpname.includes(item.value)}
                                                                        onChange={(e) => handleJenisTransaksiCheckbox(item.value, e.target.checked, setFilterData)}
                                                                    />
                                                                    <label htmlFor={`${item.value}`} className="ml-1 cursor-pointer text-xs text-gray-900">
                                                                        {item.text}
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {filterTab === 'konsolidasi' && (
                                                // <div>
                                                //     <div className="mb-2 flex items-center justify-between">
                                                //         {/* <span className="font-semibold">Kategori</span> */}
                                                //         <button className="text-xs font-semibold text-black hover:text-gray-700" onClick={handleSelectAll}>
                                                //             {isAllEntChecked ? 'Hapus Pilihan' : 'Pilih Semua'}
                                                //         </button>
                                                //     </div>

                                                //     <div className="h-72 overflow-x-auto overflow-y-scroll rounded bg-gray-300 p-2">
                                                //         {listPajakData.map((item: any) => (
                                                //             <div key={item.id} className="mb-1 flex items-center">
                                                //                 <input
                                                //                     type="checkbox"
                                                //                     id={`checkbox-${item.id}`}
                                                //                     checked={!!checkedEnt[item.id]}
                                                //                     onChange={() => handleCheckboxEnt(item.id, item.kode)}
                                                //                     className="cursor-pointer"
                                                //                 />
                                                //                 <label htmlFor={`checkbox-${item.id}`} className="m-0 ml-1 cursor-pointer text-xs text-gray-900">
                                                //                     {item.name}
                                                //                 </label>
                                                //             </div>
                                                //         ))}
                                                //     </div>
                                                // </div>

                                                <div>
                                                    {/* // <div className="mb-[-20px] ml-[-19px] mt-[-16px] h-[40%] overflow-x-auto p-1"> */}
                                                    <div className="mb-0.5 flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id="all-entitas"
                                                            checked={listEntitas.length === selectedEntitas.length}
                                                            onChange={() => {
                                                                // const mergerObject = {
                                                                //     ...handleParamsObject,
                                                                // };
                                                                // pilis(mergerObject);
                                                                handleCheckboxEnt();
                                                            }}
                                                        />
                                                        <label style={{ marginLeft: '5px' }} htmlFor={`all-entitas`} className="m-0 text-xs text-gray-900">
                                                            {`Pilih Semua`}
                                                        </label>
                                                    </div>
                                                    {listEntitas.map((item: any) => (
                                                        <div key={item.kodecabang} className="mb-0.5 flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                id={`checkbox-${item.kodecabang}`}
                                                                value={item.kodecabang}
                                                                checked={selectedEntitas.includes(item.kodecabang)}
                                                                onChange={() => {
                                                                    // const mergerObject = {
                                                                    //     ...handleParamsObject,
                                                                    // };
                                                                    handleSelectAll(item.kodecabang);
                                                                }}
                                                            />
                                                            <label style={{ marginLeft: '5px' }} htmlFor={`checkbox-${item.kodecabang}`} className="m-0 text-xs text-gray-900">
                                                                {`[${item.kodecabang}] ${item.cabang}`}
                                                            </label>
                                                        </div>
                                                    ))}
                                                    {/* </div> */}
                                                </div>
                                            )}
                                        </Tab.Panels>
                                    </Tab.Group>
                                </div>
                            </PerfectScrollbar>
                            {/* === Refresh Button === */}
                            <div className="flex justify-center">
                                <button type="button" onClick={fetchListData} className="btn mt-2 bg-black text-white">
                                    <FontAwesomeIcon icon={faArrowsRotate} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                    Refresh Data
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className={`overlay absolute z-[5] hidden h-full w-full rounded-md bg-black/60 `} onClick={() => setIsShowTaskMenu(isShowTaskMenu)}></div>

                {/* === Table & Detail === */}
                <div className="flex h-full  flex-col overflow-auto">
                    <div className="h-full ">
                        <Tab.Group defaultIndex={0}>
                            <Tab.List className="flex gap-2">
                                {MainTabList.map((item) => (
                                    <Tab as={Fragment} key={item.key}>
                                        {({ selected }) => (
                                            <button
                                                onClick={() => {
                                                    setActiveTab(item.key);
                                                    setHasClickedTab(true);
                                                }}
                                                className={`${
                                                    selected ? '!border-white-light !border-b-white font-bold text-gray-900 dark:!border-[#191e3a] dark:!border-b-black' : 'text-gray-400'
                                                } -mb-[1px] flex items-center border border-transparent p-3.5 py-2 !outline-none transition duration-300 hover:text-danger`}
                                            >
                                                {item.title}
                                            </button>
                                        )}
                                    </Tab>
                                ))}
                            </Tab.List>
                            <Tab.Panels className="h-[calc(100%-37px)] ">
                                {activeTab === 'besi' || activeTab === 'non-besi' ? (
                                    <div className="flex h-full flex-col">
                                        <div className="flex h-[calc(100%-30px)] flex-col">
                                            <div className={` ${checkDetailTransaksi ? 'h-[calc(100%-120px)]' : 'h-[100%]'}`}>
                                                <GridComponent
                                                    autoFit
                                                    locale="id"
                                                    queryCellInfo={(args: any) => {
                                                        if (args.column.field === 'status_app') {
                                                            if (args.data.status_app === 'Disetujui') {
                                                                args.cell.style.backgroundColor = '#5AE523';
                                                                args.cell.style.color = 'black';
                                                            }
                                                            if (args.data.status_app === 'Sudah dikoreksi') {
                                                                args.cell.style.backgroundColor = '#00ffff';
                                                                args.cell.style.color = 'black';
                                                            }
                                                            if (args.data.status_app.includes('Level')) {
                                                                args.cell.style.backgroundColor = '#ffff00';
                                                                args.cell.style.color = 'black';
                                                            }
                                                            if (args.data.status_app === 'Koreksi') {
                                                                args.cell.style.backgroundColor = '#ff8000';
                                                                args.cell.style.color = 'black';
                                                            }
                                                        }
                                                    }}
                                                    ref={listGridRef}
                                                    dataSource={data.length > 0 ? data : []}
                                                    {...gridOptions}
                                                    gridLines="Both"
                                                    height={'100%'}
                                                    recordDoubleClick={handlePreviewClick}
                                                    rowSelected={(args: any) => setSelectedItem(args.data)}
                                                >
                                                    <ColumnsDirective>
                                                        <ColumnDirective field="kode_opname" headerText="Kode Opname" headerTextAlign="Center" width={120} />
                                                        <ColumnDirective field="tgl_opname" headerText="Tanggal Batas Waktu" headerTextAlign="Center" textAlign="Center" width={170} />
                                                        <ColumnDirective field="kode_entitas" headerText="Entitas" headerTextAlign="Center" textAlign="Center" width={80} />
                                                        <ColumnDirective field="nama_item" headerText="Nama Barang" headerTextAlign="Center" width={180} />
                                                        <ColumnDirective field="jenis" headerText="Jenis Opname" headerTextAlign="Center" textAlign="Center" width={90} />
                                                        <ColumnDirective field="hasil" headerText="Hasil Opname" valueAccessor={offlineTemplate} headerTextAlign="Center" width={60} />
                                                        <ColumnDirective field="timbang" headerText="Hasil Timbang" valueAccessor={offlineTemplate} headerTextAlign="Center" width={60} />
                                                        <ColumnDirective field="status_app" headerText="Status Approval" headerTextAlign="Center" textAlign="Center" width={100} />
                                                        <ColumnDirective field="tgl_app1" type="date" format="dd-MM-yyyy" headerText="Tgl. App Cabang" headerTextAlign="Center" width={100} />
                                                        <ColumnDirective field="tgl_app2" type="date" format="dd-MM-yyyy" headerText="Tgl. App Pusat" headerTextAlign="Center" width={100} />
                                                        <ColumnDirective field="tgl_app3" type="date" format="dd-MM-yyyy" headerText="Tgl. App Level 3" headerTextAlign="Center" width={100} />
                                                        <ColumnDirective field="tgl_app4" type="date" format="dd-MM-yyyy" headerText="Tgl. App Level 4" headerTextAlign="Center" width={100} />
                                                        <ColumnDirective field="tgl_sistem" type="date" format="dd-MM-yyyy" headerText="Tgl. Proses/Transaksi" headerTextAlign="Center" width={100} />
                                                        <ColumnDirective field="tgl_generate" type="date" format="dd-MM-yyyy" headerText="Tgl. Generate" headerTextAlign="Center" width={100} />
                                                        <ColumnDirective field="alasan_koreksi" headerText="Alasan Koreksi" headerTextAlign="Center" width={200} />
                                                    </ColumnsDirective>
                                                    <Inject services={[Page, Selection, Edit, Sort, Group, Filter, Resize, Reorder, CommandColumn, VirtualScroll]} />
                                                </GridComponent>
                                            </div>
                                            <div className={`${checkDetailTransaksi ? 'h-[100px]' : 'hidden'}`}>
                                                <GridComponent autoFit locale="id" gridLines="Both" rowHeight={22} dataSource={detailData} ref={detailGridRef} height={'100'}>
                                                    <ColumnsDirective>
                                                        <ColumnDirective field="kode_opname" headerText="Kode Opname" headerTextAlign="Center" width={120} />
                                                        <ColumnDirective field="dokumen" headerText="Dokumen" headerTextAlign="Center" width={60} />
                                                        <ColumnDirective field="nama_asal" headerText="Gudang Asal" headerTextAlign="Center" width={150} />
                                                        <ColumnDirective field="nama_tujuan" headerText="Gudang Tujuan" headerTextAlign="Center" width={150} />
                                                        <ColumnDirective field="qty" format={'N'} headerText="Kuantitas" headerTextAlign="Center" textAlign="Right" width={80} />
                                                        <ColumnDirective field="no_ref" headerText="No MB/PS" headerTextAlign="Center" width={120} />
                                                    </ColumnsDirective>
                                                </GridComponent>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between bg-[#dedede] px-3 py-1">
                                            <div className="flex items-center gap-1">
                                                <input type="checkbox" checked={checkDetailTransaksi} onChange={(e) => setCheckDetailTransaksi(e.target.checked)} />
                                                <span className="text-xs text-black">Tampilkan detail transaksi</span>
                                            </div>

                                            <div onClick={() => console.log('eeeee: ', checkedEnt)}>
                                                <span className="text-lg text-red-500">{entName}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </Tab.Panels>
                        </Tab.Group>
                    </div>
                </div>
            </div>

            {/* Dialog Hasil Opname */}
            {showDialogOpname ? (
                <DialogHasilOpname
                    onClose={() => setShowDialogOpname(false)}
                    isOpen={showDialogOpname}
                    approved={selectedItem.applevel >= '1'}
                    selectedItem={selectedItem}
                    selectedAppLevel={{
                        ...selectedItem,
                        applevel: statusPage === 'APPROVAL' ? String(Number(selectedItem.applevel) + 1) : selectedItem.applevel,
                    }}
                    kode_entitas={kode_entitas}
                    entitas_zip={selectedItem.kode_entitas}
                    token={token}
                    onRefresh={fetchListData}
                    statusPage={statusPage}
                    userid={userid}
                />
            ) : null}

            {/* Loader */}
            {isLoading ? <Loader entitas={fetchEnt} /> : null}
        </div>
    );
};

export default KonsolidasiJhso;
