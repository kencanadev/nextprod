import React, { Fragment, useEffect, useRef, useState } from 'react';

// Syncfusion
import { GridComponent, ColumnDirective, ColumnsDirective, Page, Edit, Sort, Filter, Group, Resize, Reorder, Selection, CommandColumn, VirtualScroll } from '@syncfusion/ej2-react-grids';
import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, Inject } from '@syncfusion/ej2-react-calendars';
import { loadCldr, L10n, enableRipple } from '@syncfusion/ej2-base';
import idIDLocalization from 'public/syncfusion/locale.json';

// Others
import PerfectScrollbar from 'react-perfect-scrollbar';

import { useSession } from '@/pages/api/sessionContext';
import { gridOptions, jenisOpnameList, jenisTransaksiOpnameList, MainTabList, statusOpnameList } from './constants';
import { Tab } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faTimes } from '@fortawesome/free-solid-svg-icons';

import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json';
import moment from 'moment';
import { FocusInEventArgs, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { handleJenisCheckbox, handleJenisTransaksiCheckbox, handleStatusCheckbox } from './functions';
import { deleteJadwalHasilStokOpname, fetchDetailOpname, fetchUserApp, getListJadwalHasilStokOpname } from './api';
import { FillFromSQL } from '@/utils/routines';
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
L10n.load(idIDLocalization);
enableRipple(true);

import 'moment/locale/id'; // Import locale Indonesia
import { TemplateHasilOpname, TemplateHasilTimbang } from './template';
import DialogGenerateJadwal from './components/DialogGenerateJadwal';
import DialogHasilOpname from './components/DialogHasilOpname';
import Swal from 'sweetalert2';
import DialogAlasanKoreksi from './components/DialogAlasanKoreksi';

moment.locale('id'); // Set locale ke Indonesia

const styleButton = { height: '28px', backgroundColor: '#3b3f5c' };

export const offlineTemplate = (field: string, data: any, column: any) => {
    return data[field] === 'Y' ? '✔️' : ''; // If the value is 0, return empty string
};

const JadwalHasilStokOpname = () => {
    // Sessions
    const { sessionData, isLoading } = useSession();

    const entitas_user = sessionData?.entitas ?? '';
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';

    if (isLoading) {
        return;
    }

    // Dialog State Management
    const [showDialogGenerate, setShowDialogGenerate] = useState(false);
    const [showDialogOpname, setShowDialogOpname] = useState(false);
    const [showDialogKoreksi, setShowDialogKoreksi] = useState(false);

    // Global State Management
    const [data, setData] = useState([]);
    const [detailData, setDetailData] = useState([]);
    const [activeTab, setActiveTab] = useState('besi');
    const [isShowTaskMenu, setIsShowTaskMenu] = useState(false);
    const [panelVisible, setPanelVisible] = useState(true);
    const [selectedItem, setSelectedItem] = useState<any>({});

    const [checkDetailTransaksi, setCheckDetailTransaksi] = useState(false);

    const [statusPage, setStatusPage] = useState('UPDATE');
    const [userApp, setUserApp] = useState('');

    const [kategori, setKategori] = useState([]);
    const [kelompok, setKelompok] = useState([]);

    // Filter State Management
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

    const updateStateFilter = (field: any, value: any) => {
        setFilterData((prev: any) => ({
            ...prev,
            [field]: value,
        }));
    };

    const listGridRef = useRef<GridComponent | any>(null);
    const detailGridRef = useRef<GridComponent | any>(null);
    // Global Functions

    // Fetch Data
    const fetchData = async () => {
        const params = {
            entitas: kode_entitas,
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
        try {
            const response = await getListJadwalHasilStokOpname({ params, token });
            let filteredData;
            if (activeTab === 'besi') {
                filteredData = response
                    .filter((item: any) => item.dok_opname === 'OB')
                    .map((item: any) => ({
                        ...item,
                        tgl_opname: moment(item.tgl_opname).format('dddd, DD-MM-YYYY'),
                        alasan_koreksi: item.alasan_koreksi === null ? '' : item.alasan_koreksi.split('\r')[0],
                    }));
            } else {
                filteredData = response
                    .filter((item: any) => item.dok_opname === 'ON')
                    .map((item: any) => ({
                        ...item,
                        tgl_opname: moment(item.tgl_opname).format('dddd, DD-MM-YYYY'),
                    }));
            }

            setData(filteredData);
            // listGridRef.current.setProperties({ dataSource: filteredData });
            // listGridRef.current.refresh();
        } catch (error) {
            console.error(error);
        }
    };

    // Fetch Detail Data
    const fetchDetailData = async () => {
        try {
            const params = {
                entitas: kode_entitas,
                param1: selectedItem.kode_opname,
                param2: 'D',
            };
            const res = await fetchDetailOpname({ params, token });

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

    const fetchRequiredData = () => {
        // Kategori
        FillFromSQL(kode_entitas, 'kategori')
            .then((res) => {
                setKategori(res);
            })
            .catch((err) => {
                console.error(err);
            });

        // Kelompok
        FillFromSQL(kode_entitas, 'kelompok')
            .then((res) => {
                setKelompok(res);
            })
            .catch((err) => {
                console.error(err);
            });
    };

    const handleDoubleClick = (args: any) => {
        if (args.column.field === 'alasan_koreksi') {
            setShowDialogKoreksi(true);
        } else {
            const { applevel, komplit } = args.rowData;
            console.log({
                applevel,
                komplit,
            });
            if (applevel === '0' || applevel === '8' || applevel === '9') {
                setStatusPage('UPDATE');
            } else {
                setStatusPage('PREVIEW');
                if (komplit === 'Y') {
                    // alert('Data opname sudah komplit');
                    Swal.fire({
                        text: 'Data opname sudah komplit.',
                        icon: 'warning',
                        timer: 2000,
                        target: '#main-target',
                        backdrop: true,
                        showConfirmButton: false,
                    });
                } else {
                    // alert(`Data opname sudah diapproval level #${applevel}`);
                    Swal.fire({
                        text: `Data opname sudah diapproval level #${applevel}.`,
                        icon: 'warning',
                        timer: 2000,
                        target: '#main-target',
                        backdrop: true,
                        showConfirmButton: false,
                    });
                }
            }
            setShowDialogOpname(true);
        }
    };

    const handleDeleteJadwal = async () => {
        if (!selectedItem.kode_opname) return;
        try {
            const body = {
                entitas: kode_entitas,
                kode_opname: selectedItem.kode_opname,
            };
            Swal.fire({
                title: 'Hapus jadwal opname?',
                html: `
        <p>Tanggal : ${selectedItem.tgl_opname}</p>
        <p>Klasifikasi : ${selectedItem.klasifikasi}</p>
        <p>Nama Barang : ${selectedItem.nama_item}</p>
        `,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: '<p style="font-size:10px">Ya</p>',
                cancelButtonText: '<p style="font-size:10px">Tidak</p>',
            }).then((result) => {
                if (result.isConfirmed) {
                    deleteJadwalHasilStokOpname({ body, token }).then((res) => {
                        if (res.status) {
                            fetchData();
                        }
                    });
                }
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleHasilOpname = () => {
        if (!selectedItem.kode_opname) return;
        if (selectedItem.applevel === '0' || selectedItem.applevel === '8' || selectedItem.applevel === '9') {
            setStatusPage('UPDATE');
        } else {
            setStatusPage('PREVIEW');
        }
        setShowDialogOpname(true);
    };

    const handleApproval = () => {
        if (!selectedItem.kode_opname) return;
        if (selectedItem.hasil !== 'Y') {
            Swal.fire({
                text: 'Belum ada hasil opname',
                icon: 'warning',
                backdrop: true,
            });
            return;
        }

        if (selectedItem.applevel === '9') {
            Swal.fire({
                text: 'Status dokumen masih perlu dikoreksi',
                icon: 'warning',
                backdrop: true,
            });
            return;
        }

        if (selectedItem.komplit === 'Y') {
            Swal.fire({
                text: 'Data opname sudah disetujui',
                icon: 'warning',
                backdrop: true,
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
        }

        if (lvlDokumen === 9) {
            lvlUser = 9;
        }

        if (lvlDokumen !== lvlUser) {
            Swal.fire({
                text: 'Anda belum berhak untuk approval data ini',
                icon: 'warning',
                backdrop: true,
            });
            return;
        }

        if (lvlDokumen === 9) {
            lvlDokumen = 1;
        }

        setStatusPage('APPROVAL');
        setShowDialogOpname(true);
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    useEffect(() => {
        const getUserApp = async () => {
            const params = {
                entitas: kode_entitas,
                param1: userid,
            };
            const data = await fetchUserApp({ params, token });
            console.log(data);
            setUserApp(data[0].app_opname);
        };

        getUserApp();
        fetchRequiredData();
    }, []);

    useEffect(() => {
        if (selectedItem.kode_opname) {
            fetchDetailData();
        }
    }, [selectedItem]);

    return (
        <div className={`Main ${showDialogOpname ? 'h-[100vh]' : 'h-[calc(100vh-230px)]'}`} id="main-target">
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
                    .e-grid .e-rowcell {
                        font-size: 11px !important;
                    }
                        #checkbox-grid-column8 {
                           margin-left: auto;
                        }
                `}
            </style>
            <div style={{ minHeight: '40px' }} className="flex">
                {/* === Button Group === */}
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
                    <ButtonComponent id="btnGenerate" cssClass="e-primary e-small" style={styleButton} onClick={() => setShowDialogGenerate(true)} content="Generate Jadwal" />
                    <ButtonComponent id="btnHapus" cssClass="e-primary e-small" style={styleButton} onClick={handleDeleteJadwal} content="Hapus Jadwal" />
                    <ButtonComponent id="btnHasil" cssClass="e-primary e-small" style={styleButton} onClick={handleHasilOpname} content="Hasil Opname" />
                    <ButtonComponent id="btnApproval" cssClass="e-primary e-small" style={styleButton} onClick={handleApproval} content="Approval" />
                </div>
                {/* === Title Page === */}
                <div className="ml-3 mr-1 w-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <span className="mb-1 text-right" style={{ fontSize: '18px', fontFamily: 'Times New Roman' }}>
                        Jadwal dan Hasil Stok Opname
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
                            <div className="mb-1 h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>
                            <PerfectScrollbar className="growltr:-mr3.5 ltr:pr3.5 relative h-full rtl:-ml-3.5 rtl:pl-3.5">
                                <div className="flex h-full flex-col overflow-auto">
                                    <div>
                                        {/* Tanggal */}
                                        <div>
                                            <div className="mt-2 flex justify-between">
                                                <CheckBoxComponent
                                                    label="Tanggal Batas Waktu"
                                                    checked={filterData.isTglChecked}
                                                    change={(args: ChangeEventArgsButton) => {
                                                        const value: any = args.checked;
                                                        updateStateFilter('isTglChecked', value);
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
                                                            updateStateFilter('tglAwal', moment(args.value));
                                                            updateStateFilter('isTglChecked', true);
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
                                                            updateStateFilter('tglAkhir', moment(args.value));
                                                            updateStateFilter('isTglChecked', true);
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
                                                        updateStateFilter('isNamaChecked', value);
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
                                                            updateStateFilter('namaValue', value);
                                                            updateStateFilter('isNamaChecked', value.length > 0);
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
                                                        updateStateFilter('isKategoriChecked', value);
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
                                                            updateStateFilter('kategoriValue', value);
                                                            updateStateFilter('isKategoriChecked', value?.length > 0 ? true : false);
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
                                                        updateStateFilter('isKelompokChecked', value);
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
                                                            updateStateFilter('kelompokValue', value);
                                                            updateStateFilter('isKelompokChecked', value?.length > 0 ? true : false);
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
                                                            onChange={(e) => updateStateFilter('hasilOpname', e.target.value)}
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
                                    {/* === Refresh Button === */}
                                    <div className="flex justify-center">
                                        <button type="button" onClick={fetchData} className="btn mt-2 bg-black text-white">
                                            <FontAwesomeIcon icon={faArrowsRotate} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                            Refresh Data
                                        </button>
                                    </div>
                                </div>
                            </PerfectScrollbar>
                        </div>
                    </div>
                )}
                <div className={`overlay absolute z-[5] hidden h-full w-full rounded-md bg-black/60 `} onClick={() => setIsShowTaskMenu(isShowTaskMenu)}></div>

                {/* === Table & Detail List === */}
                <div className="flex h-full flex-col overflow-auto">
                    <div className="h-full ">
                        <Tab.Group defaultIndex={0}>
                            <Tab.List className="flex gap-2 ">
                                {MainTabList.map((item) => (
                                    <Tab as={Fragment} key={item.key}>
                                        {({ selected }) => (
                                            <button
                                                onClick={() => setActiveTab(item.key)}
                                                className={`${
                                                    selected ? '!border-white-light !border-b-white font-bold text-gray-900 dark:!border-[#191e3a] dark:!border-b-black' : 'text-gray-400'
                                                } -mb-[1px] flex h-[30px] items-center border border-transparent p-3.5 py-2 !outline-none transition duration-300 hover:text-danger`}
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
                                                        if (args.column.field === 'status_app' && args.data.status_app === 'Disetujui') {
                                                            args.cell.style.backgroundColor = '#5AE523';
                                                            args.cell.style.color = 'black';
                                                        }
                                                    }}
                                                    ref={listGridRef}
                                                    dataSource={data.length > 0 ? data : []}
                                                    {...gridOptions}
                                                    gridLines="Both"
                                                    height={'100%'}
                                                    rowHeight={23}
                                                    recordDoubleClick={handleDoubleClick}
                                                    rowSelected={(args: any) => setSelectedItem(args.data)}
                                                >
                                                    <ColumnsDirective>
                                                        <ColumnDirective field="kode_opname" headerText="Kode Opname" headerTextAlign="Center" width={100} />
                                                        <ColumnDirective field="tgl_opname" headerText="Tanggal Batas Waktu" headerTextAlign="Center" textAlign="Center" width={110} />
                                                        <ColumnDirective field="nama_item" headerText="Nama Barang" headerTextAlign="Center" width={215} />
                                                        <ColumnDirective field="jenis" headerText="Jenis Opname" headerTextAlign="Center" width={90} />
                                                        <ColumnDirective field="hasil" valueAccessor={offlineTemplate} headerText="Hasil Opname" headerTextAlign="Center" width={60} />
                                                        <ColumnDirective field="timbang" valueAccessor={offlineTemplate} headerText="Hasil Timbang" headerTextAlign="Center" width={60} />
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
                                                        <ColumnDirective field="dokumen" headerText="Dokumen" headerTextAlign="Center" width={50} />
                                                        <ColumnDirective field="nama_asal" headerText="Gudang Asal" headerTextAlign="Center" width={150} />
                                                        <ColumnDirective field="nama_tujuan" headerText="Gudang Tujuan" headerTextAlign="Center" width={150} />
                                                        <ColumnDirective field="qty" format={'N'} headerText="Kuantitas" headerTextAlign="Center" textAlign="Right" width={80} />
                                                        <ColumnDirective field="no_ref" headerText="No MB/PS" headerTextAlign="Center" width={120} />
                                                    </ColumnsDirective>
                                                </GridComponent>
                                            </div>
                                        </div>
                                        <div className="flex h-[30px] gap-1 border bg-[#dedede] px-3 py-1">
                                            <input type="checkbox" checked={checkDetailTransaksi} onChange={(e) => setCheckDetailTransaksi(e.target.checked)} />
                                            <span className="text-xs text-black">Tampilkan detail transaksi</span>
                                        </div>
                                    </div>
                                ) : null}
                            </Tab.Panels>
                        </Tab.Group>
                    </div>
                </div>
            </div>
            {/* Dialog Generate Jadwal */}
            {showDialogGenerate && (
                <DialogGenerateJadwal
                    onClose={() => setShowDialogGenerate(false)}
                    isOpen={showDialogGenerate}
                    activeTab={activeTab}
                    kode_entitas={kode_entitas}
                    token={token}
                    userid={userid}
                    onRefresh={fetchData}
                />
            )}
            {/* Dialog Hasil Opname */}
            {showDialogOpname && (
                <DialogHasilOpname
                    onClose={() => setShowDialogOpname(false)}
                    isOpen={showDialogOpname}
                    approved={selectedItem.applevel >= '1'}
                    selectedItem={selectedItem}
                    kode_entitas={kode_entitas}
                    entitas_zip={kode_entitas}
                    token={token}
                    onRefresh={fetchData}
                    statusPage={statusPage}
                    userid={userid}
                />
            )}
            {/* Dialog Alasan Koreksi */}
            {showDialogKoreksi && (
                <DialogAlasanKoreksi isOpen={showDialogKoreksi} onClose={() => setShowDialogKoreksi(false)} kode_opname={selectedItem.kode_opname} kode_entitas={kode_entitas} token={token} />
            )}
        </div>
    );
};

export default JadwalHasilStokOpname;
