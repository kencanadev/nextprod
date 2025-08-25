import React, { Fragment, useEffect, useRef, useState } from 'react';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faTimes } from '@fortawesome/free-solid-svg-icons';
import PerfectScrollbar from 'react-perfect-scrollbar';

import { ButtonComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';

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
    rowSelected,
} from '@syncfusion/ej2-react-grids';
import { ContextMenuComponent, MenuItemModel } from '@syncfusion/ej2-react-navigations';

import axios from 'axios';
import swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useRouter } from 'next/router';
import { Tab } from '@headlessui/react';
// import '../../../../../node_modules/@syncfusion/ej2-react-calendars/styles/material.css';
import { useSession } from '@/pages/api/sessionContext';
// import IdleChecker from '@/components/IdleChecker';
import DialogBaruEditSupplier from './components/DialogBaruEditSupplier';
import DialogDetailSupplier from './components/DialogDetailSupplier';
import { HandleSearchNoSupplier } from './function/search';

const Supplier = () => {
    //////////// respon data user dari login ////////////

    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const token = sessionData?.token ?? '';
    const userid = sessionData?.userid ?? '';
    const router = useRouter();
    const { norelasi, isRedirectFromSupp } = router.query;

    if (isLoading) {
        return;
    }

    const masterStateUrl = router.query.masterState;
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const [showLoader, setShowLoader] = useState(true);

    const [dataSourceSupplier, setDataSourceSupplier] = useState<[]>([]);
    const [originalDataSource, setOriginalDataSource] = useState<[]>([]);
    const [masterState, setMasterState] = useState('BARU');
    const [masterKodeSupplierState, setMasterKodeSupplierState] = useState([]);
    const [dataFromSupp, setDataFromSupp] = useState<any[]>([]);
    const [dataState, setDataState] = useState([]);
    const [selectedDetailSupplierForEdit, setSelectedDetailSupplierForEdit] = useState([]);

    //============== Inisialisasi modal dialog ====================
    const [dialogInfoKlasifikasi, setDialogInfoKlasifikasi] = useState(false);
    const [dialogDetailSupplier, setDialogDetailSupplier] = useState(false);
    const [dialogBaruEditSupplier, setDialogBaruEditSupplier] = useState(false);
    const noSuppReff = useRef<HTMLInputElement>(null);
    const namaSuppReff = useRef<HTMLInputElement>(null);

    //============== Inisialisasi DATA FROM API ====================
    // Text Input
    const [klasifikasiState, setKlasifikasiState] = useState('all'); //Kelas
    const [noSupplierState, setNoSupplierState] = useState('');
    const [namaSupplierState, setNamaSupplierState] = useState('');
    const [personalContactState, setPersonalContactState] = useState('');

    // CheckBox Input // Kelas
    const [isNoSupplierChecked, setNoSupplierChecked] = useState<boolean>(false);
    const [isNamaSupplierChecked, setNamaSupplierChecked] = useState<boolean>(false);
    const [isContactPersonalChecked, setKontakPersonalChecked] = useState<boolean>(false);
    const [searchNoSupp, setSearchNoSupp] = useState<string>('');
    const [searchNamaSupp, setSearchNamaSupp] = useState<string>('');

    //==========  Popup menu untuk header grid List Data ===========
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
    function menuHeaderSelect(args: any) {
        if (args.item.text === 'Cetak ke printer') {
            gridListData.print();
        } else if (args.item.text === 'PDF') {
            gridListData.showSpinner();
            gridListData.pdfExport();
        } else if (args.item.text === 'XLSX') {
            gridListData.showSpinner();
            gridListData.excelExport();
        } else if (args.item.text === 'CSV') {
            gridListData.showSpinner();
            gridListData.csvExport();
        }
    }
    // ============== Format cell pada grid List Data ===============
    const queryCellInfoListData = (args: any) => {
        const field = args.column?.field;
        const data = args.data;

        if (field === 'nama_relasi') {
            if (data && data.terima_dokumen === 'N') {
                args.cell.style.background = '#FADFBF';
                args.cell.style.color = '#F70000';
            }
            if (data && data.kelas === 'N') {
                args.cell.style.background = '#00ffffa2';
                args.cell.style.color = '#003cff'; // Hitam jika latar belakang terang, putih jika latar belakang gelap
            }
        }

        if (data && data.aktif !== 'Y') {
            args.cell.style.color = 'rgba(52, 52, 52, 0.7)';
        }

        if (field === 'no_cust') {
            if (data && data.recNo % 2 === 0) {
                args.cell.style.background = '#FFFFF0'; // AlternatingRowColor
            }
        }

        if (field === 'tgl_selesai') {
            args.cell.style.background = '#80FFFF';
        }
    };

    function classNames(...classes: any) {
        return classes.filter(Boolean).join(' ');
    }
    let disabledBaru = false;

    const [panelVisible, setPanelVisible] = useState(true);
    let disabledHapus = false;
    const handleTogglePanel = () => {
        setPanelVisible(!panelVisible);
    };
    const handleFilterClick = () => {
        setPanelVisible(true);
    };

    const [isShowTaskMenu, setIsShowTaskMenu] = useState(false);
    // Settings Tabs
    const tabKlasifikasiArray = [
        {
            Klasifikasi: 'Semua',
            kelas: 'all',
        },
        {
            Klasifikasi: 'Klasifikasi-A',
            kelas: 'A',
        },
        {
            Klasifikasi: 'Klasifikasi-B',
            kelas: 'B',
        },
        {
            Klasifikasi: 'Klasifikasi-C',
            kelas: 'C',
        },
        {
            Klasifikasi: 'Klasifikasi-D',
            kelas: 'D',
        },
        {
            Klasifikasi: 'Klasifikasi-E',
            kelas: 'E',
        },
    ];

    let gridListData: Grid | any;
    let selectedListData: any[] = [];
    const ExportComplete = (): void => {
        gridListData.hideSpinner();
    };

    const rowIdxListData = useRef(0);
    const rowSelectingListData = (args: any) => {
        rowIdxListData.current = args.rowIndex;
        if (args.data != undefined) {
            if (dialogDetailSupplier) {
                setMasterKodeSupplierState(args.data.no_cust);
            }
        }
    };
    const handleInfoDetailClick = async () => {
        selectedListData = gridListData.getSelectedRecords();

        if (selectedListData.length > 0) {
            setMasterState('DETAIL');
            setDataState(selectedListData[0]);
            setDataFromSupp(selectedListData[0]);
            setDialogDetailSupplier(true);
        } else {
            showPilihDokumen();
        }
    };

    const handleBaruClick = () => {
        setMasterState('BARU');
        setMasterKodeSupplierState([]);

        setDialogBaruEditSupplier(true);
    };
    // function edit
    const showEditRecord = () => {
        selectedListData = gridListData.getSelectedRecords();
        if (selectedListData.length > 0) {
            // console.log('showEditRecord: ' + selectedListData[0].kode_supp);
            setMasterState('EDIT');
            setMasterKodeSupplierState(selectedListData[0].kode_supp);
            setDataState(selectedListData[0]);

            setDialogBaruEditSupplier(true);
        } else {
            showPilihDokumen();
        }
    };

    //================= Fungsi tombol utama List Data ==============
    const showPilihDokumen = () => {
        withReactContent(swalToast).fire({
            icon: 'warning',
            title: '<p style="font-size:12px">Silahkan Pilih Data Supplier Terlebih Dahulu</p>',
            width: '100%',
        });
    };
    //======= Setting tampilan sweet alert  =========
    const swalDialog = swal.mixin({
        customClass: {
            confirmButton: 'btn btn-primary btn-sm',
            cancelButton: 'btn btn-dark btn-sm ltr:mr-3 rtl:ml-3',
            popup: 'sweet-alerts',
        },
        buttonsStyling: false,
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
    const swalToast = swal.mixin({
        toast: true,
        position: 'center',
        customClass: {
            popup: 'colored-toast',
        },
        showConfirmButton: false,
        timer: 2000,
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

    // Handle Input & CheckBox
    const handleNoSupplierInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setNoSupplierState(newValue);
        setNoSupplierChecked(newValue.length > 0);
    };
    const handleNamaSupplierInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setNamaSupplierState(newValue);
        setNamaSupplierChecked(newValue.length > 0);
    };

    const handlePersonalContactInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setPersonalContactState(newValue);
        setKontakPersonalChecked(newValue.length > 0);
    };

    const handleClearSearchNoSupp = () => {
        setSearchNoSupp('');
        setDataSourceSupplier(originalDataSource);
    };

    const handleClearSearchNamaSupp = () => {
        setSearchNamaSupp('');
        setDataSourceSupplier(originalDataSource);
    };

    const refreshListData = async (itemRef: any = '') => {
        if (kode_entitas !== null && kode_entitas !== '') {
            setShowLoader(true);
            try {
                let paramKelas = itemRef !== '' ? itemRef : 'all';
                let paramAktif = selectedOptionAktif;
                let paramKelasBarang = selectedGroup;
                let paramNoSupp = 'all';
                let paramNamaRelasi = 'all';
                let paramPersonal = 'all';
                if (noSupplierState !== '' && noSupplierState !== null && isNoSupplierChecked === true) {
                    paramNoSupp = noSupplierState + '%';
                }

                if (namaSupplierState !== '' && namaSupplierState !== null && isNamaSupplierChecked === true) {
                    paramNamaRelasi = namaSupplierState + '%';
                }

                if (personalContactState !== '' && personalContactState !== null && isContactPersonalChecked === true) {
                    paramPersonal = personalContactState + '%';
                }

                const response = await axios.get(`${apiUrl}/erp/list_supplier?`, {
                    params: {
                        entitas: kode_entitas,
                        param1: paramAktif,
                        param2: paramKelas,
                        param3: paramKelasBarang,
                        param4: paramNoSupp,
                        param5: paramNamaRelasi,
                        param6: paramPersonal,
                        // Belum Sesuai Jumlah Data yang Muncul = [Semua, A-F]
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const responseData = response.data.data;
                // console.log('response supplier : ', { responseData });

                setDataSourceSupplier(responseData);
                setOriginalDataSource(responseData);
                // setTimeout(() => {
                // }, 300);
            } catch (error) {
                setShowLoader(false);
                console.error('Error fetching data refreshListData:', error);
            } finally {
                setShowLoader(false);
            }
        } else {
            withReactContent(swalDialog).fire({
                title: `<p style="font-size:12px">Sesi login telah habis, silahkan login kembali.</p>`,
                icon: 'error',
                width: '360px',
                heightAuto: true,
            });

            // setTimeout(() => {
            //     router.push({ pathname: '/' });
            // }, 1000);
        }
    };

    useEffect(() => {
        refreshListData();
    }, []);

    useEffect(() => {
        if (norelasi || masterStateUrl) {
            if (masterStateUrl === 'BARU') {
                handleBaruClick();
            } else {
                setMasterState('EDIT');
                setDialogBaruEditSupplier(true);
            }
        } else if (isRedirectFromSupp) {
            handleBaruClick();
        }
    }, [norelasi, masterStateUrl, isRedirectFromSupp]);

    const styleButton = {
        width: 57 + 'px',
        height: '28px',
        marginBottom: '0.5em',
        marginTop: 0.5 + 'em',
        marginRight: 0.8 + 'em',
        backgroundColor: '#3b3f5c',
    };

    const [selectedOptionAktif, setSelectedOptionAktif] = useState<string | null>('Y');

    const handleradioChange = (value: string) => {
        setSelectedOptionAktif(value);
    };

    const [selectedGroup, setSelectedGroup] = useState<string>('all');

    const handleRadioChange = (value: string) => {
        setSelectedGroup(value);
    };

    const handleChangeSearchNoSupp = (e: any) => {
        setSearchNoSupp(e.target.value);
        let temp: any = originalDataSource.filter((item: any) => item.no_supp.toLowerCase().includes(e.target.value.toLowerCase()));
        setDataSourceSupplier(temp);
    };

    const handleChangeSearchNamaSupp = (e: any) => {
        setSearchNamaSupp(e.target.value);
        let temp: any = originalDataSource.filter((item: any) => item.nama_relasi.toLowerCase().includes(e.target.value.toLowerCase()));
        setDataSourceSupplier(temp);
    };

    return (

            <div className="w-full h-[calc(100vh-220px)]  flex flex-col" id="main-target">
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
                {/*==================================================================================================*/}
                {/*================================ Tampilan Supplier =============================*/}
                {/*==================================================================================================*/}
           
                    {/* screen loader */}
                    {/* {showLoader && contentLoader()} */}

                    <div style={{ minHeight: '40px' }} className="mb-4 flex flex-col justify-between md:flex-row  md:justify-normal">
                        <TooltipComponent content="Tampilkan filter data" opensOn="Hover" openDelay={1000} target="#btnFilter">
                            <TooltipComponent content="Daftarkan Supplier baru" opensOn="Hover" openDelay={1000} target="#btnBaru">
                                <TooltipComponent content="Edit data Supplier" opensOn="Hover" openDelay={1000} target="#btnEdit">
                                    <TooltipComponent content="Hapus data Supplier" opensOn="Hover" openDelay={1000} target="#btnHapus">
                                        <TooltipComponent content="Tampilkan detail Supplier" opensOn="Hover" openDelay={1000} target="#btnDetail">
                                            <div className="gap-2 sm:flex">
                                                <div className="flex flex-col sm:border-r md:flex-row">
                                                    <ButtonComponent id="btnBaru" disabled={disabledBaru} type="submit" style={styleButton} className="e-primary e-small" onClick={handleBaruClick}>
                                                        Baru
                                                    </ButtonComponent>
                                                    {/* Component Modal Tambah Data Relasi */}
                                                    <ButtonComponent id="btnEdit" onClick={showEditRecord} type="submit" style={styleButton} className="e-primary e-small">
                                                        Ubah
                                                    </ButtonComponent>
                                                    {/* Component Modal Edit Data Relasi */}
                                                    {/* <ButtonComponent id="btnHapus" type="submit" cssClass="e-primary e-small" style={styleButton} disabled={disabledHapus}>
                                                        Hapus
                                                    </ButtonComponent> */}
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
                                                    >
                                                        Filter
                                                    </ButtonComponent>
                                                    {/* <ButtonComponent
                                                        id="btnFilter"
                                                        type="submit"
                                                        cssClass="e-primary e-small"
                                                        onClick={handleTesting}
                                                    >
                                                        Testing
                                                    </ButtonComponent> */}
                                                </div>
                                                <div className="flex flex-col md:flex-row">
                                                    <ButtonComponent
                                                        id="btnInfoDetail"
                                                        type="submit"
                                                        iconCss="e-icons e-medium e-chevron-right"
                                                        cssClass="e-primary e-small"
                                                        style={{
                                                            width: 100 + 'px',
                                                            marginBottom: '0.5em',
                                                            marginTop: 0.5 + 'em',
                                                            marginRight: 0.8 + 'em',
                                                            backgroundColor: '#e6e6e6',
                                                            color: 'black',
                                                        }}
                                                        onClick={handleInfoDetailClick}
                                                    >
                                                        Info Detail
                                                    </ButtonComponent>
                                                </div>
                                            </div>
                                        </TooltipComponent>
                                    </TooltipComponent>
                                </TooltipComponent>
                            </TooltipComponent>
                        </TooltipComponent>
                        <div className="flex max-w-xl items-center gap-4 ">
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    id="searchNoSupp"
                                    name="searchNoSupp"
                                    className="mb-1 w-full rounded-lg border border-gray-300 bg-white p-3 pr-10 text-sm text-gray-900 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                    placeholder="No Supplier"
                                    style={{ height: '4vh' }}
                                    value={searchNoSupp}
                                    ref={noSuppReff}
                                    onChange={(e) => HandleSearchNoSupplier(e.target.value, setSearchNoSupp, setDataSourceSupplier, originalDataSource)}
                                />
                                {searchNoSupp && (
                                    <button
                                        type="button"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 transform text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                                        onClick={handleClearSearchNoSupp}
                                    >
                                        &times;
                                    </button>
                                )}
                            </div>

                            <div className="relative w-full">
                                <input
                                    type="text"
                                    id="searchNamaSupp"
                                    name="searchNamaSupp"
                                    className="mb-1 w-full rounded-lg border border-gray-300 bg-white p-3 pr-10 text-sm text-gray-900 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                    placeholder="Nama Supplier"
                                    style={{ height: '4vh' }}
                                    value={searchNamaSupp}
                                    onChange={handleChangeSearchNamaSupp}
                                />
                                {searchNamaSupp && (
                                    <button
                                        type="button"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 transform text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                                        onClick={handleClearSearchNamaSupp}
                                    >
                                        &times;
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
            
                <div className="relative flex h-[calc(100%-40px)] gap-3 ">
                    {panelVisible && (
                        <div
                            className={`panel absolute z-10 hidden h-full w-[300px] max-w-full flex-none space-y-4 p-4 dark:border-[#191e3a] xl:relative xl:block xl:h-auto ltr:rounded-r-none ltr:xl:rounded-r-md rtl:rounded-l-none rtl:xl:rounded-l-md ${
                                isShowTaskMenu && '!block'
                            }`}
                            style={{ background: '#dedede' }}
                        >
                            <div className="flex h-full flex-col overflow-auto">
                                <div className="pb-5">
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
                                            ></path>
                                                <path
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    d="M22 5.815c0-1.327 0-1.99-.44-2.403C21.122 3 20.415 3 19 3H5c-1.414 0-2.121 0-2.56.412C2 3.824 2 4.488 2 5.815"
                                                    opacity="0.5"
                                                ></path>
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold ltr:ml-3 rtl:mr-3">Filtering Data</h3>
                                    </div>
                                </div>
                                <div className="mb-5 h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>
                                <PerfectScrollbar className="growltr:-mr3.5 ltr:pr3.5 relative mb-5 h-full rtl:-ml-3.5 rtl:pl-3.5">
                                    <div className="flex h-full flex-col gap-6 overflow-auto">
                                        <div className="mb-5">
                                            <div>
                                                <label className="mt-3 flex cursor-pointer items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="no_cust_checked"
                                                        name="no_cust_checked"
                                                        className="form-checkbox"
                                                        checked={isNoSupplierChecked}
                                                        style={{
                                                            borderColor: '#ffffff',
                                                        }}
                                                        onChange={() => setNoSupplierChecked(!isNoSupplierChecked)}
                                                    />
                                                    <span>No. Supplier</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="--- No. Supplier ---"
                                                    className="form-input"
                                                    name="no_cust"
                                                    value={noSupplierState}
                                                    autoComplete="off"
                                                    onChange={handleNoSupplierInputChange}
                                                />
                                            </div>
                                            <div>
                                                <label className="mt-3 flex cursor-pointer items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="nama_relasi_checked"
                                                        name="nama_relasi_checked"
                                                        className="form-checkbox"
                                                        checked={isNamaSupplierChecked}
                                                        style={{
                                                            borderColor: '#ffffff',
                                                        }}
                                                        onChange={() => setNamaSupplierChecked(!isNamaSupplierChecked)}
                                                    />
                                                    <span>Nama Supplier</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="--- Nama Supplier ---"
                                                    className="form-input"
                                                    autoComplete="off"
                                                    name="nama_relasi"
                                                    value={namaSupplierState}
                                                    onChange={handleNamaSupplierInputChange}
                                                />
                                            </div>
                                            <div>
                                                <label className="mt-3 flex cursor-pointer items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="personal_checked"
                                                        name="personal_checked"
                                                        className="form-checkbox"
                                                        style={{
                                                            borderColor: '#ffffff',
                                                        }}
                                                        checked={isContactPersonalChecked}
                                                        onChange={() => setKontakPersonalChecked(!isContactPersonalChecked)}
                                                    />
                                                    <span>Kontak Personal</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="--- Kontak Personal ---"
                                                    className="form-input"
                                                    name="personal"
                                                    value={personalContactState}
                                                    autoComplete="off"
                                                    onChange={handlePersonalContactInputChange}
                                                />
                                            </div>
                                            <div className="">
                                                <div className="mt-3 font-bold">
                                                    <span>Non aktif</span>
                                                </div>
                                                <div className="mt-1 flex items-start gap-2">
                                                    <label className="inline-flex items-center">
                                                        <input type="radio" value="Y" checked={selectedOptionAktif === 'Y'} onChange={() => handleradioChange('Y')} className="form-radio" />
                                                        <span className="ml-2">Aktif</span>
                                                    </label>
                                                    <label className="inline-flex items-center">
                                                        <input type="radio" value="N" checked={selectedOptionAktif === 'N'} onChange={() => handleradioChange('N')} className="form-radio" />
                                                        <span className="ml-2">Non Aktif</span>
                                                    </label>
                                                    <label className="inline-flex items-center">
                                                        <input type="radio" value="all" checked={selectedOptionAktif === 'all'} onChange={() => handleradioChange('all')} className="form-radio" />
                                                        <span className="ml-2">Semua</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="">
                                                <div className="mt-3 font-bold">
                                                    <span>Kelompok Supplier</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <label className="inline-flex items-center">
                                                        <input type="radio" value="all" checked={selectedGroup === 'all'} onChange={() => handleRadioChange('all')} className="form-radio" />
                                                        <span className="ml-2">Semua</span>
                                                    </label>
                                                    <label className="inline-flex items-center">
                                                        <input type="radio" value="B" checked={selectedGroup === 'B'} onChange={() => handleRadioChange('B')} className="form-radio" />
                                                        <span className="ml-2">Besi</span>
                                                    </label>
                                                    <label className="inline-flex items-center">
                                                        <input type="radio" value="N" checked={selectedGroup === 'N'} onChange={() => handleRadioChange('N')} className="form-radio" />
                                                        <span className="ml-2">Non Besi</span>
                                                    </label>
                                                    <label className="inline-flex items-center">
                                                        <input type="radio" value="A" checked={selectedGroup === 'A'} onChange={() => handleRadioChange('A')} className="form-radio" />
                                                        <span className="ml-2">Besi dan Non Besi</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </PerfectScrollbar>
                                <div className="flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            refreshListData();
                                        }}
                                        className="btn btn-primary mt-2 w-full"
                                    >
                                        <FontAwesomeIcon icon={faArrowsRotate} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                        Refresh Data
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    <div
                        className={`overlay absolute z-[5] hidden h-full w-full rounded-md bg-black/60 ${isShowTaskMenu && '!block xl:!hidden'}`}
                        onClick={() => setIsShowTaskMenu(!isShowTaskMenu)}
                    ></div>
                    <div className=" flex-1 bg-bla">
                        <div className="flex items-center ltr:mr-3 rtl:ml-3">
                            <button type="button" className="block hover:text-primary xl:hidden ltr:mr-3 rtl:ml-3" onClick={() => setIsShowTaskMenu(!isShowTaskMenu)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 7L4 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path opacity="0.5" d="M20 12L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M20 17L4 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>
                        <div className="panel h-full border-bla flex-1 overflow-x-auto" style={{ background: '#dedede' }}>
                            <div className="panel-data" style={{ width: '100%' }}>
                                <Tab.Group>
                                    <Tab.List className="flex space-x-1 overflow-x-auto rounded-xl  p-1">
                                        {tabKlasifikasiArray.map((item) => (
                                            <Tab key={item.kelas} as={Fragment}>
                                                {({ selected }) => (
                                                    <button
                                                        className={classNames(
                                                            'w-full px-2.5 py-1.5 text-xs font-medium focus:outline-none',
                                                            selected ? 'rounded-t-md border-b-2 border-blue-400 bg-blue-200/50 text-blue-600' : 'text-gray-900 hover:border-b-2 hover:border-blue-400'
                                                        )}
                                                        id={`${item.kelas}`}
                                                        onClick={() => refreshListData(item.kelas)}
                                                    >
                                                        {item.Klasifikasi}
                                                    </button>
                                                )}
                                            </Tab>
                                        ))}
                                    </Tab.List>
                                    <Tab.Panels>
                                        {tabKlasifikasiArray.map((item) => (
                                            <Tab.Panel key={item.kelas}>
                                                <div className="active pt-2">
                                                    <div className="h-full w-full overflow-hidden" style={{ background: '#dedede', width: '100%' }}>
                                                        <GridComponent
                                                            id="gridListData"
                                                            locale="id"
                                                            dataSource={dataSourceSupplier}
                                                            allowExcelExport={true}
                                                            ref={(g) => (gridListData = g)}
                                                            excelExportComplete={ExportComplete}
                                                            allowPdfExport={true}
                                                            pdfExportComplete={ExportComplete}
                                                            editSettings={{ allowDeleting: true }}
                                                            selectionSettings={{
                                                                mode: 'Row',
                                                                type: 'Single',
                                                            }}
                                                            allowPaging={true}
                                                            allowSorting={true}
                                                            allowFiltering={false}
                                                            allowResizing={true}
                                                            autoFit={true}
                                                            allowReordering={true}
                                                            pageSettings={{
                                                                pageSize: 25,
                                                                pageCount: 5,
                                                                pageSizes: ['25', '50', '100', 'All'],
                                                            }}
                                                            rowHeight={22}
                                                            height={'100%'}
                                                            gridLines={'Both'}
                                                            // loadingIndicator={{ indicatorType: 'Shimmer' }}
                                                            recordDoubleClick={(args: any) => {
                                                                if (gridListData) {
                                                                    const rowIndex: number = args.row.rowIndex;
                                                                    gridListData.selectRow(rowIndex);
                                                                    showEditRecord();
                                                                }
                                                            }}
                                                            rowSelecting={rowSelectingListData}
                                                            // rowDataBound={rowDataBound}
                                                            // ref={gridCashCount}
                                                        >
                                                            <ColumnsDirective>
                                                                <ColumnDirective
                                                                    field="no_supp"
                                                                    headerText="No. Supplier"
                                                                    headerTextAlign="Center"
                                                                    textAlign="Center"
                                                                    width="80"
                                                                    clipMode="EllipsisWithTooltip"
                                                                />
                                                                <ColumnDirective
                                                                    field="nama_relasi"
                                                                    headerText="Nama"
                                                                    headerTextAlign="Center"
                                                                    textAlign="Left"
                                                                    width={300}
                                                                    clipMode="EllipsisWithTooltip"
                                                                />
                                                                <ColumnDirective
                                                                    field="personal"
                                                                    headerText="Kontak"
                                                                    headerTextAlign="Center"
                                                                    textAlign="Center"
                                                                    width={200}
                                                                    clipMode="EllipsisWithTooltip"
                                                                />
                                                                <ColumnDirective
                                                                    field="telp"
                                                                    headerText="Telp"
                                                                    headerTextAlign="Center"
                                                                    textAlign="Center"
                                                                    width={120}
                                                                    clipMode="EllipsisWithTooltip"
                                                                />
                                                                <ColumnDirective
                                                                    field="kode_mu"
                                                                    headerText="Mata Uang"
                                                                    headerTextAlign="Center"
                                                                    textAlign="Center"
                                                                    // autoFit
                                                                    width="100"
                                                                    clipMode="EllipsisWithTooltip"
                                                                />
                                                                <ColumnDirective
                                                                    field="kelompok_supplier"
                                                                    headerText="kelompok supplier"
                                                                    headerTextAlign="Center"
                                                                    textAlign="Center"
                                                                    width="100"
                                                                    clipMode="EllipsisWithTooltip"
                                                                />
                                                            </ColumnsDirective>
                                                            <Inject services={[Page, Selection, Edit, Sort, Group, Filter, Resize, Reorder, ExcelExport, PdfExport]} />
                                                        </GridComponent>
                                                    </div>
                                                </div>
                                            </Tab.Panel>
                                        ))}
                                    </Tab.Panels>
                                </Tab.Group>
                            </div>
                            {/* <div className="flex h-full flex-col"> */}

                            {/* </div> */}
                        </div>
                    </div>
                </div>
            {dialogDetailSupplier && (
                <DialogDetailSupplier
                    dataFromSupp={dataFromSupp}
                    setDataFromSupp={setDataFromSupp}
                    DataState={dataState}
                    isOpen={dialogDetailSupplier}
                    onClose={() => {
                        setDialogDetailSupplier(false);
                    }}
                    masterState={masterState}
                    setMasterState={setMasterState}
                    token={token}
                    entitas={kode_entitas}
                    userid={userid}
                    setSelectedDetailSupplierForEdit={setSelectedDetailSupplierForEdit}
                    setDialogBaruEditSupplier={setDialogBaruEditSupplier}
                    originalDataSource={originalDataSource}
                />
            )}
            {dialogBaruEditSupplier && (
                <DialogBaruEditSupplier
                    setDataState={setDataState}
                    DataState={dataState}
                    isOpen={dialogBaruEditSupplier}
                    onClose={() => {
                        setDialogBaruEditSupplier(false);
                        setMasterState('');
                    }}
                    refreshListData={refreshListData}
                    userid={userid}
                    masterState={masterState}
                    token={token}
                    originalDataSource={originalDataSource}
                    selectedDetailSupplierForEdit={selectedDetailSupplierForEdit}
                    setSelectedDetailSupplierForEdit={setSelectedDetailSupplierForEdit}
                    entitas={kode_entitas}
                />
            )}
            </div>

 
    );
};

export default Supplier;
