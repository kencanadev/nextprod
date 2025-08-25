import { useSession } from '@/pages/api/sessionContext';
import { useRef, useState, useEffect, Fragment } from 'react';
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
} from '@syncfusion/ej2-react-grids';
import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton, RadioButtonComponent } from '@syncfusion/ej2-react-buttons';
import { ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent, FocusInEventArgs } from '@syncfusion/ej2-react-inputs';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown } from '@syncfusion/ej2-react-dropdowns';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { MenuEventArgs } from '@syncfusion/ej2-react-splitbuttons';
import { SidebarComponent, SidebarType, ContextMenuComponent, MenuItemModel } from '@syncfusion/ej2-react-navigations';
import { Dialog, DialogComponent, Tooltip, TooltipComponent, TooltipEventArgs, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import Draggable from 'react-draggable';
import PerfectScrollbar from 'react-perfect-scrollbar';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json'; // To load the culture based first day of week
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
import idIDLocalization from 'public/syncfusion/locale.json';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    getCheckedItems,
    HandleApprovalList,
    HandlePengajuanList,
    HandlePilihSemuaApprovalList,
    HandlePilihSemuaPengajuanList,
    HandlePilihSemuaTransaksiList,
    HandleTransaksiList,
    chTransaksi,
    chPengajuan,
    chApproval,
    Item,
    toggleCheckboxes,
    handleCheckboxChange,
    handleInputChange,
    // rowDataBound,
    QueryCellInfoListData,
    handleSearchList,
} from './functions/fpmbFunctions';
import { myAlertGlobal, usersMenu } from '@/utils/routines';
import { FetchDataListFpmb } from './api/api';
import './customStyles/styles.module.css';
import { ProgressBarComponent, ProgressAnnotation } from '@syncfusion/ej2-react-progressbar';
import { myAlertGlobal2 } from '@/utils/global/fungsi';
import FrmFpmb from './component/fpMb';

L10n.load(idIDLocalization);

const FpmbList = () => {
    let dgFPMBLst: Grid | any;
    let sidebarObj: SidebarComponent;
    let type: SidebarType = 'Push';
    let mediaQueryState: string = '(min-width: 600px)';
    let selectDataGrid: any[] = [];
    const [modalJenisTransaksi, setModalJenisTransaksi] = useState(false);
    const [modalJenisTransaksiKirimLangsung, setModalJenisTransaksiKirimLangsung] = useState(false);
    const [jenisTransaksi, setJenisTransaksi] = useState<any>('1');
    const [modalFpmb, setModalFpmb] = useState(false);
    const [modalFpmbMblKg, setModalFpmbMblKg] = useState(false);
    const [isLoadingProgress, setIsLoadingProgress] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [displayedProgress, setDisplayedProgress] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState('Loading Data...');
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const gridWidth = sidebarVisible ? 'calc(100% - 315px)' : '100%';
    const router = useRouter();
    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';
    interface UserMenuState {
        baru: any;
        edit: any;
        hapus: any;
        cetak: any;
    }
    const [userMenu, setUserMenu] = useState<UserMenuState>({ baru: '', edit: '', hapus: '', cetak: '' });
    const kode_menu = '31700'; // kode menu PO
    const [gridHeight, setGridHeight] = useState<number>(0);
    const [masterKodeMb, setMasterKodeMb] = useState<string>('BARU');
    const [noMb, setNoMb] = useState<string>('');
    const [masterKodeRencek, setMasterKodeRencek] = useState<string>('');
    const [masterKodeFpmb, setMasterKodeFpmb] = useState<string>('');
    const [masterDataState, setMasterDataState] = useState<string>('');
    const [jenisFpmb, setJenisFpmb] = useState<string>('');
    const [jenisPengajuan, setJenisPengajuan] = useState<string>('');
    const [statusPengajuan, setStatusPengajuan] = useState<string>('');
    const [tipePengajuan, setTipePengajuan] = useState<string>('');
    const [updateFilePendukung, setUpdateFilePendukung] = useState<string>('');
    const [statusApp, setStatusApp] = useState<string>('');
    const [statusFinalisasi, setStatusFinalisasi] = useState<string>('');
    const [pAppFPMB, setpAppFPMB] = useState<string>('');
    const [detailDok, setDetailDok] = useState<any[]>([]);
    const [panelVisible, setPanelVisible] = useState(true);
    const [isShowTaskMenu, setIsShowTaskMenu] = useState(false);
    const styleButtonAppoval = { width: 150 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#3b3f5c' };
    const styleButton = {
        clasname: 'rounded bg-blue-600 px-4 py-2 text-white',
        width: 57 + 'px',
        height: '28px',
        marginBottom: '0.5em',
        marginTop: 0.5 + 'em',
        marginRight: 0.8 + 'em',
        backgroundColor: '#3b3f5c',
    };
    const sampleContainer = {
        maxHeight: '500px',
    };
    const sampleContainerGridList = {
        maxHeight: 'auto',
    };
    const handleTogglePanel = () => {
        setPanelVisible(!panelVisible);
    };
    const handleFilterClick = () => {
        setPanelVisible(true);
    };
    const formatFloat: Object = { skeleton: 'C3', format: ',0.####;-,0.#####;#', maximumFractionDigits: 4 };
    const formatDate: Object = { type: 'date', format: 'dd-MM-yyyy' };
    const [chTransaksiState, setChtransaksi] = useState<Item<number>[]>(chTransaksi);
    const [transaksiChecked, setTransaksiChecked] = useState<boolean[]>(Array(chTransaksiState.length).fill(false));
    const [chPengajuanState, setChPengajuan] = useState<Item<number>[]>(chPengajuan);
    const [pengajuanChecked, setPengajuanChecked] = useState<boolean[]>(Array(chPengajuanState.length).fill(false));
    const [chApprovalState, setChApproval] = useState<Item<string>[]>(chApproval);
    const [approvalChecked, setApprovalChecked] = useState<boolean[]>(Array(chApprovalState.length).fill(false));
    const [isDraggingSidebar, setIsDraggingSidebar] = useState(false);

    const changeModalJenisTransaksi = (value: any) => {
        setJenisTransaksi(value);
    };

    const handleNavigateLink = async (jenis: any, type: string = 'baru') => {
        if (type === 'baru') {
            setTipePengajuan('1');

            if (jenis === '1') {
                setModalJenisTransaksi(false);
                setModalFpmb(true);
                setJenisFpmb('KG');
                setJenisPengajuan('0');
            } else if (jenis === '2') {
                setModalJenisTransaksiKirimLangsung(true);
                setModalJenisTransaksi(false);
            } else if (jenis === '3') {
                setModalJenisTransaksi(false);
                myAlertGlobal2(`Transaksi Mutasi GV Customer masih dalam tahap pengembangan.`, 'fpmbList');
            } else if (jenis === '4') {
                setModalJenisTransaksi(false);
                myAlertGlobal2(`Transaksi Mutasi GV TTB masih dalam tahap pengembangan.`, 'fpmbList');
            } else if (jenis === '5') {
                setModalJenisTransaksi(false);
                myAlertGlobal2(`Transaksi Mutasi pemindahan GV TTB (mutasi full) masih dalam tahap pengembangan.`, 'fpmbList');
            }
        } else {
            if (jenis === '1') {
                setModalJenisTransaksi(false);
                setModalFpmb(true);
            } else if (jenis === '2') {
                setModalJenisTransaksiKirimLangsung(true);
                setModalJenisTransaksi(false);
            } else if (jenis === '3') {
                myAlertGlobal2(`Transaksi Mutasi GV Customer masih dalam tahap pengembangan.`, 'fpmbList');
                setModalJenisTransaksi(false);
            } else if (jenis === '4') {
                setModalJenisTransaksi(false);
                myAlertGlobal2(`Transaksi Mutasi GV TTB masih dalam tahap pengembangan.`, 'fpmbList');
            } else if (jenis === '5') {
                setModalJenisTransaksi(false);
                myAlertGlobal2(`Transaksi Mutasi pemindahan GV TTB (mutasi full) masih dalam tahap pengembangan.`, 'fpmbList');
            }
        }
    };

    const handleNavigateLinkKirimLangsung = async (jenis: any, type: string = 'baru') => {
        if (type === 'baru') {
            if (jenis === '1') {
                setModalJenisTransaksiKirimLangsung(false);
                setModalFpmb(true);
                setJenisFpmb('MKG');
                setJenisPengajuan('1');
            } else if (jenis === '2') {
                setModalJenisTransaksiKirimLangsung(false);
                setModalFpmb(true);
                setJenisFpmb('MKL');
                setJenisPengajuan('2');
            }
        } else {
            // if (jenis === '2') {
            //     console.log('FPMB Mobil Sendiri/Customer KL Baru');
            //     setModalJenisTransaksiKirimLangsung(false);
            //     setModalFpmb(true);
            // }
        }
    };

    const fetchDataUseEffect = async () => {
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
    };

    const handleRefreshData = async () => {
        try {
            setIsLoadingProgress(true);
            setProgressValue(0);
            setDisplayedProgress(0);
            setLoadingMessage('Fetching data...');
            await FetchDataListFpmb(paramList, dgFPMBLst, stateDokumen.token, (progress) => {
                setProgressValue(progress);
                setDisplayedProgress(Math.round(progress));

                if (progress < 30) {
                    setLoadingMessage('Initializing data fetch...');
                } else if (progress < 60) {
                    setLoadingMessage('Processing records...');
                } else if (progress < 90) {
                    setLoadingMessage('Almost complete...');
                } else {
                    setLoadingMessage('Finalizing...');
                }
            });
            setProgressValue(100);
            setDisplayedProgress(100);
            setLoadingMessage('Complete!');

            setTimeout(() => {
                setIsLoadingProgress(false);
                setProgressValue(0);
                setDisplayedProgress(0);
            }, 500);
        } catch (error) {
            setIsLoadingProgress(false);
            setProgressValue(0);
            setDisplayedProgress(0);
            console.error(error);
        }
    };

    const jenisTransaksiChecked = getCheckedItems(chTransaksi, transaksiChecked, false);
    const jenisPengajuanChecked = getCheckedItems(chPengajuan, pengajuanChecked, false);
    const jenisApprovalChecked = getCheckedItems(chApproval, approvalChecked, true);

    const [formListDataState, setFormListDataState] = useState({
        cbNo: false,
        edNo: 'all',
        cbSupplier: false,
        edSupplier: 'all',
        cbTglPengajuan: true,
        edTglAwal1: moment().format('YYYY-MM-DD'),
        edTglAkhir1: moment().endOf('month'),
        cbTglApproval: false,
        edTglApproval1: moment().format('YYYY-MM-DD'),
        edTglApproval2: moment().endOf('month'),
        jenisTransaksi: 'all',
        cbMB: false,
        edMB: 'all',
        cbExp: false,
        edExp: 'all',
        cbNopol: false,
        edNopol: 'all',
        jenisPengajuan: 'all',
        jenisApproval: 'all',
    });

    const paramList = {
        entitas: kode_entitas,
        param1: formListDataState.cbNo ? formListDataState.edNo : 'all',
        param2: formListDataState.cbSupplier ? formListDataState.edSupplier : 'all',
        param3: formListDataState.cbTglPengajuan ? formListDataState.edTglAwal1 : 'all',
        param4: formListDataState.cbTglPengajuan ? moment(formListDataState.edTglAkhir1).format('YYYY-MM-DD') : 'all',
        param5: formListDataState.cbTglApproval ? formListDataState.edTglApproval1 : 'all',
        param6: formListDataState.cbTglApproval ? moment(formListDataState.edTglApproval2).format('YYYY-MM-DD') : 'all',
        param7: formListDataState.jenisTransaksi.replace(/"/g, ''),
        param8: formListDataState.cbMB ? formListDataState.edMB : 'all',
        param9: formListDataState.cbExp ? formListDataState.edExp : 'all',
        param10: formListDataState.cbNopol ? formListDataState.edNopol : 'all',
        param11: formListDataState.jenisPengajuan,
        param12: formListDataState.jenisApproval,
    };

    useEffect(() => {
        setFormListDataState((prevState) => ({
            ...prevState,
            jenisTransaksi: jenisTransaksiChecked || 'all',
            jenisPengajuan: jenisPengajuanChecked || 'all',
            jenisApproval: jenisApprovalChecked || 'all',
        }));
    }, [jenisTransaksiChecked, jenisPengajuanChecked, jenisApprovalChecked]);

    useEffect(() => {
        if (kode_entitas || token || userid || kode_user) {
            fetchDataUseEffect();
            handleRefreshData();
        }
    }, [token, kode_entitas, userid, kode_user]);

    useEffect(() => {
        const calculateGridHeight = () => {
            const windowHeight = window.innerHeight;
            const availableHeight = windowHeight - 220;
            setGridHeight(availableHeight);
        };

        calculateGridHeight();
        window.addEventListener('resize', calculateGridHeight);

        return () => {
            window.removeEventListener('resize', calculateGridHeight);
        };
    }, []);

    const stateDokumen = {
        kode_entitas: kode_entitas,
        userid: userid,
        kode_user: kode_user,
        token: token,
        masterKodeDokumen: masterKodeMb,
        stateNoMb: noMb,
        masterKodeRencek: masterKodeRencek,
        masterKodeFpmb: masterKodeFpmb,
        masterDataState: masterDataState,
        jenisFpmb: jenisFpmb,
        jenisPengajuan: jenisPengajuan,
        tipePengajuan: tipePengajuan,
        statusPengajuan: statusPengajuan,
        updateFilePendukung: updateFilePendukung,
        statusApp: statusApp,
        pAppFPMB: pAppFPMB,
        statusFinalisasi: statusFinalisasi,
    };

    const onCreate = () => {
        sidebarObj.element.style.visibility = '';
    };
    const toggleClick = () => {
        setSidebarVisible(true);
    };
    const closeClick = () => {
        setSidebarVisible(false);
    };

    const handleMouseDown = () => setIsDraggingSidebar(true);
    const handleMouseUp = () => setIsDraggingSidebar(false);

    // Tambahkan ke event listener global (opsional)
    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);

        // Add click listener to handle sidebar closing
        const handleDocumentClick = (event: MouseEvent) => {
            // Only close sidebar if clicking the close button specifically
            const target = event.target as HTMLElement;
            const isCloseButton = target.closest('button')?.className?.includes('absolute right-0 top-0');

            if (sidebarVisible && !isDraggingSidebar && isCloseButton) {
                setSidebarVisible(false);
            }
        };

        document.addEventListener('click', handleDocumentClick);

        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('click', handleDocumentClick);
        };
    }, [sidebarVisible, isDraggingSidebar]);

    // Function to check if click is outside sidebar area
    const isClickOutsideSidebar = (event: MouseEvent) => {
        const sidebar = document.getElementById('default-sidebar');
        const mainContent = document.getElementById('main-content');

        if (!sidebar || !mainContent) return false;

        const sidebarRect = sidebar.getBoundingClientRect();
        const mainContentRect = mainContent.getBoundingClientRect();

        // Check if click is within sidebar bounds
        const isInSidebar = event.clientX >= sidebarRect.left && event.clientX <= sidebarRect.right && event.clientY >= sidebarRect.top && event.clientY <= sidebarRect.bottom;

        // Check if click is within main content bounds (grid area)
        const isInMainContent = event.clientX >= mainContentRect.left && event.clientX <= mainContentRect.right && event.clientY >= mainContentRect.top && event.clientY <= mainContentRect.bottom;

        // Check if click is on the close button (X button)
        const closeButton = event.target as HTMLElement;
        const isCloseButton = closeButton?.closest('button')?.className?.includes('absolute right-0 top-0');

        // Only close if click is outside both sidebar and main content, or if it's the close button
        return (!isInSidebar && !isInMainContent) || isCloseButton;
    };

    return (
        <div className="flex h-screen flex-col" id="fpmbList">
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
                                    <div className="absolute left-0 right-0 top-0 flex h-full items-center justify-center">
                                        <div className="text-center">
                                            <span className="text-2xl font-bold">{`${displayedProgress}%`}</span>
                                            <div className="text-sm text-gray-500">Complete</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex h-auto  w-full">
                <div className="w-full">
                    <div className="mb-4 items-center justify-between rounded-md border-b bg-white p-4 pb-2  shadow-md md:flex">
                        <div className="grid w-full grid-cols-12 border-b">
                            <div className="col-span-3 mb-2 mt-1 items-center justify-between p-4  pb-2 md:flex">
                                <div className="flex space-x-2">
                                    <div className="relative">
                                        <ButtonComponent
                                            id="btnBaru"
                                            cssClass="e-primary e-small"
                                            style={styleButton}
                                            disabled={userMenu.baru === 'Y' || userid === 'administrator' ? false : true}
                                            onClick={() => {
                                                setMasterDataState('BARU');
                                                setUpdateFilePendukung('1');
                                                setMasterKodeMb('BARU');
                                                setMasterKodeFpmb('');
                                                setStatusApp('');
                                                setStatusPengajuan('');
                                                setStatusFinalisasi('');
                                                setNoMb('');
                                                setModalJenisTransaksi(true);
                                            }}
                                            content="Baru"
                                        ></ButtonComponent>

                                        <ButtonComponent
                                            id="btnEdit"
                                            cssClass="e-primary e-small"
                                            style={styleButton}
                                            disabled={userMenu.edit === 'Y' || userid === 'administrator' ? false : true}
                                            onClick={() => {
                                                selectDataGrid = dgFPMBLst.getSelectedRecords();
                                                console.log('selectDataGrid Edit', selectDataGrid);
                                                if (selectDataGrid.length > 0) {
                                                    setUpdateFilePendukung('1');
                                                    setMasterDataState('EDIT');
                                                    setMasterKodeMb(selectDataGrid[0]?.kode_mb);

                                                    setMasterKodeFpmb(selectDataGrid[0]?.kode_fpmb);
                                                    setStatusApp(selectDataGrid[0]?.approval);
                                                    setStatusPengajuan(selectDataGrid[0]?.pengajuan);
                                                    setStatusFinalisasi(selectDataGrid[0]?.finalisasi);
                                                    setJenisPengajuan(selectDataGrid[0]?.jenis_pengajuan);
                                                    setNoMb(selectDataGrid[0]?.no_mb);
                                                    setModalFpmb(true);
                                                } else {
                                                    myAlertGlobal('Silahkan Pilih data yang akan di edit', 'fpmbList');
                                                    return;
                                                }
                                            }}
                                            content="Ubah"
                                        ></ButtonComponent>
                                        <ButtonComponent
                                            content="Filter"
                                            id="btnFilter"
                                            type="submit"
                                            cssClass="e-primary e-small"
                                            style={
                                                sidebarVisible ? { width: '57px', height: '28px', marginBottom: '0.5em', marginTop: '0.5em', marginRight: '0.8em' } : { ...styleButton, color: 'white' }
                                            }
                                            onClick={toggleClick}
                                            disabled={sidebarVisible}
                                        ></ButtonComponent>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-6 mb-2 mt-1 items-center justify-between p-4  pb-2 md:flex">
                                <div className="flex space-x-2">
                                    <div className="relative">
                                        <ButtonComponent
                                            id="btnApproval"
                                            cssClass="e-primary e-small"
                                            style={styleButtonAppoval}
                                            onClick={() => {
                                                selectDataGrid = dgFPMBLst.getSelectedRecords();
                                                if (selectDataGrid.length > 0) {
                                                    if (selectDataGrid[0].approval === 'N') {
                                                        setpAppFPMB('Approval');
                                                        setMasterDataState('APPROVAL');
                                                        setUpdateFilePendukung('1');
                                                        setMasterKodeMb(selectDataGrid[0]?.kode_mb);
                                                        // setMasterKodeRencek(selectDataGrid[0]?.kode_fpmb);
                                                        setMasterKodeFpmb(selectDataGrid[0]?.kode_fpmb);
                                                        setStatusApp(selectDataGrid[0]?.approval);
                                                        setStatusPengajuan(selectDataGrid[0]?.pengajuan);
                                                        setStatusFinalisasi(selectDataGrid[0]?.finalisasi);
                                                        setJenisPengajuan(selectDataGrid[0]?.jenis_pengajuan);
                                                        setNoMb(selectDataGrid[0]?.no_mb);
                                                        setModalFpmb(true);
                                                    } else {
                                                        myAlertGlobal('Data sudah diapproved', 'fpmbList');
                                                        return;
                                                    }
                                                    // setTipePengajuan('1');
                                                } else {
                                                    myAlertGlobal('Silahkan Pilih data yang akan di approve', 'fpmbList');
                                                    return;
                                                }
                                            }}
                                            content="Approval"
                                        ></ButtonComponent>
                                        <ButtonComponent
                                            id="btnBatal"
                                            cssClass="e-primary e-small"
                                            style={styleButtonAppoval}
                                            disabled={false}
                                            content="Pembatalan"
                                            onClick={() => {
                                                selectDataGrid = dgFPMBLst.getSelectedRecords();
                                                if (selectDataGrid.length > 0) {
                                                    if (selectDataGrid[0].approval === 'Y') {
                                                        setpAppFPMB('UnApproval');
                                                        setMasterDataState('UNAPPROVAL');
                                                        setUpdateFilePendukung('1');
                                                        setMasterKodeMb(selectDataGrid[0]?.kode_mb);
                                                        // setMasterKodeRencek(selectDataGrid[0]?.kode_fpmb);
                                                        setMasterKodeFpmb(selectDataGrid[0]?.kode_fpmb);
                                                        setStatusApp(selectDataGrid[0]?.approval);
                                                        setStatusPengajuan(selectDataGrid[0]?.pengajuan);
                                                        setStatusFinalisasi(selectDataGrid[0]?.finalisasi);
                                                        setJenisPengajuan(selectDataGrid[0]?.jenis_pengajuan);
                                                        setNoMb(selectDataGrid[0]?.no_mb);
                                                        setModalFpmb(true);
                                                    } else {
                                                        myAlertGlobal('Data belum diapproved', 'fpmbList');
                                                        return;
                                                    }
                                                } else {
                                                    myAlertGlobal('Silahkan Pilih data yang akan di batal approved', 'fpmbList');
                                                    return;
                                                }
                                            }}
                                        ></ButtonComponent>
                                        <ButtonComponent
                                            id="btnUpdateFilePendukung"
                                            cssClass="e-primary e-small"
                                            style={styleButtonAppoval}
                                            onClick={() => {
                                                selectDataGrid = dgFPMBLst.getSelectedRecords();
                                                if (selectDataGrid.length > 0) {
                                                    setUpdateFilePendukung('0');
                                                    setMasterDataState('FILE PENDUKUNG');
                                                    setMasterKodeMb(selectDataGrid[0]?.kode_mb);
                                                    // setMasterKodeRencek(selectDataGrid[0]?.kode_fpmb);
                                                    setMasterKodeFpmb(selectDataGrid[0]?.kode_fpmb);
                                                    setStatusApp(selectDataGrid[0]?.approval);
                                                    setStatusPengajuan(selectDataGrid[0]?.pengajuan);
                                                    setStatusFinalisasi(selectDataGrid[0]?.finalisasi);
                                                    setJenisPengajuan(selectDataGrid[0]?.jenis_pengajuan);
                                                    setNoMb(selectDataGrid[0]?.no_mb);
                                                    setModalFpmb(true);
                                                } else {
                                                    myAlertGlobal('Silahkan Pilih data yang akan di update file pendukungnya', 'fpmbList');
                                                    return;
                                                }
                                            }}
                                            content="Update File Pendukung"
                                        ></ButtonComponent>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-3 mb-2 mt-1 items-center justify-between p-4  pb-2 md:flex">
                                <div className="text-right text-lg font-semibold">Form Pengajuan Mutasi Barang (FPMB)</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex h-auto  w-full">
                <div className="w-full">
                    <div className="mb-4 items-center justify-between rounded-md border-b bg-white p-2 pb-2 shadow-[2px_2px_8px_rgba(0,0,0,0.25)] md:flex">
                        <div
                            id="main-content"
                            style={{ position: 'sticky', height: 'calc(100vh - 130px)', overflow: 'hidden' }}
                            className="flex h-auto w-full"
                            onMouseDown={(e) => {
                                // Prevent sidebar from closing when clicking in main content area
                                const target = e.target as HTMLElement;
                                const isInSidebar = target.closest('#default-sidebar');
                                if (!isInSidebar) {
                                    e.stopPropagation();
                                }
                            }}
                            onClick={(e) => {
                                // Prevent sidebar from closing when clicking in main content area
                                const target = e.target as HTMLElement;
                                const isInSidebar = target.closest('#default-sidebar');
                                if (!isInSidebar) {
                                    e.stopPropagation();
                                }
                            }}
                            onMouseUp={(e) => {
                                // Prevent sidebar from closing when releasing mouse in main content area
                                const target = e.target as HTMLElement;
                                const isInSidebar = target.closest('#default-sidebar');
                                if (!isInSidebar) {
                                    e.stopPropagation();
                                }
                            }}
                        >
                            <SidebarComponent
                                id="default-sidebar"
                                target={'#main-content'}
                                ref={(Sidebar) => (sidebarObj = Sidebar as SidebarComponent)}
                                style={{
                                    background: '#dedede',
                                    marginRight: '2rem',
                                    display: 'block',
                                    visibility: sidebarVisible ? 'visible' : 'hidden',
                                    overflowY: 'auto',
                                    height: 'calc(100vh - 130px)',
                                }}
                                created={onCreate}
                                type={type}
                                width="315px"
                                mediaQuery={mediaQueryState}
                                isOpen={true}
                                open={() => setSidebarVisible(true)}
                                close={(event: any) => {
                                    console.log('Sidebar close event triggered');
                                    // Only close if clicking the close button specifically
                                    const target = event?.target as HTMLElement;
                                    const isCloseButton = target?.closest('button')?.className?.includes('absolute right-0 top-0');
                                    if (isCloseButton) {
                                        setSidebarVisible(false);
                                    }
                                }}
                                closeOnDocumentClick={false}
                                enableGestures={false}
                                enableDock={false}
                            >
                                <div
                                    className="overpanel-filter p-3"
                                    style={{ background: '#dedede', width: '100%', height: 'calc(100vh - 130px)' }}
                                    onMouseDown={(e) => {
                                        // Prevent sidebar from closing when clicking in sidebar content area
                                        e.stopPropagation();
                                    }}
                                    onClick={(e) => {
                                        // Prevent sidebar from closing when clicking in sidebar content area
                                        e.stopPropagation();
                                    }}
                                    onMouseUp={(e) => {
                                        // Prevent sidebar from closing when releasing mouse in sidebar content area
                                        e.stopPropagation();
                                    }}
                                >
                                    <div className="flex items-center text-center">
                                        <button
                                            className="absolute right-0 top-0 p-2 text-gray-600 hover:text-gray-900"
                                            onClick={(e) => {
                                                // Prevent sidebar from closing when clicking close button
                                                e.stopPropagation();
                                                closeClick();
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                                        </button>
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
                                        <h5 className="text-lg font-bold ltr:ml-3 rtl:mr-3">Filtering Data</h5>
                                    </div>
                                    <div className="mb-5 mt-3 h-px w-full border-b border-black dark:border-[#1b2e4b]"></div>
                                    <div
                                        className="flex flex-col items-center justify-between"
                                        id="Candil"
                                        onMouseDown={(e) => {
                                            // Prevent sidebar from closing when clicking in Candil area
                                            e.stopPropagation();
                                        }}
                                        onClick={(e) => {
                                            // Prevent sidebar from closing when clicking in Candil area
                                            e.stopPropagation();
                                        }}
                                        onMouseUp={(e) => {
                                            // Prevent sidebar from closing when releasing mouse in Candil area
                                            e.stopPropagation();
                                        }}
                                    >
                                        <PerfectScrollbar style={sampleContainer} className="ltr:-mr3.5 ltr:pr3 relative mb-5 h-full  grow rtl:-ml-3.5 rtl:pl-3">
                                            <div
                                                id="inputFilter"
                                                onMouseDown={(e) => {
                                                    // Prevent sidebar from closing when clicking in input filter area
                                                    e.stopPropagation();
                                                }}
                                                onClick={(e) => {
                                                    // Prevent sidebar from closing when clicking in input filter area
                                                    e.stopPropagation();
                                                }}
                                                onMouseUp={(e) => {
                                                    // Prevent sidebar from closing when releasing mouse in input filter area
                                                    e.stopPropagation();
                                                }}
                                            >
                                                <div className="flex">
                                                    <CheckBoxComponent
                                                        label="No. Pengajuan"
                                                        name="cbNo"
                                                        checked={formListDataState.cbNo}
                                                        change={(args: ChangeEventArgsButton) => {
                                                            const value: any = args.checked;
                                                            handleCheckboxChange('cbNo', value, setFormListDataState);
                                                        }}
                                                        style={{ fontWeight: 'bold', borderRadius: 3, borderColor: 'gray' }}
                                                    />
                                                </div>
                                                <div className="mt-1 flex justify-between">
                                                    <div className="container form-input">
                                                        <TextBoxComponent
                                                            name="edNo"
                                                            placeholder="No. Pengajuan"
                                                            value={formListDataState.edNo === 'all' ? '' : formListDataState.edNo}
                                                            onChange={(args: any) => handleInputChange(args.target.name, args.value, 'cbNo', setFormListDataState)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex">
                                                    <CheckBoxComponent
                                                        label="Pabrik Asal"
                                                        name="cbSupplier"
                                                        checked={formListDataState.cbSupplier}
                                                        change={(args: ChangeEventArgsButton) => {
                                                            const value: any = args.checked;
                                                            handleCheckboxChange('cbSupplier', value, setFormListDataState);
                                                        }}
                                                        style={{ borderRadius: 3, borderColor: 'gray' }}
                                                    />
                                                </div>
                                                <div className="mt-1 flex justify-between">
                                                    <div className="container form-input">
                                                        <TextBoxComponent
                                                            name="edSupplier"
                                                            placeholder="Pabrik Asal"
                                                            value={formListDataState.edSupplier === 'all' ? '' : formListDataState.edSupplier}
                                                            onChange={(args: any) => handleInputChange(args.target.name, args.value, 'cbSupplier', setFormListDataState)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-2 flex justify-between">
                                                    <CheckBoxComponent
                                                        label="Tanggal Pengajuan"
                                                        name="cbTglPengajuan"
                                                        checked={formListDataState.cbTglPengajuan}
                                                        change={(args: ChangeEventArgsButton) => {
                                                            const value: any = args.checked;
                                                            handleCheckboxChange('cbTglPengajuan', value, setFormListDataState);
                                                            // handleCheckboxChange('cbTglPengajuan', value);
                                                        }}
                                                    />
                                                </div>
                                                <div className={`grid grid-cols-1 justify-between gap-1 sm:flex `}>
                                                    <div className="form-input mt-1 flex justify-between">
                                                        <DatePickerComponent
                                                            locale="id"
                                                            name="edTglAwal1"
                                                            cssClass="e-custom-style"
                                                            enableMask={true}
                                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                            showClearButton={false}
                                                            format="dd-MM-yyyy"
                                                            value={moment(formListDataState.edTglAwal1).toDate()}
                                                            // onChange={(args: any) => handleInputChange(args.target.name, moment(args.value).format('YYYY-MM-DD'), 'chbTanggal')}
                                                            change={(args: ChangeEventArgsCalendar) => {
                                                                handleInputChange('edTglAwal1', moment(args.value).format('YYYY-MM-DD'), 'cbTglPengajuan', setFormListDataState);
                                                            }}
                                                        >
                                                            <Inject services={[MaskedDateTime]} />
                                                        </DatePickerComponent>
                                                    </div>
                                                    <p className="set-font-11 ml-0.5 mr-0.5 mt-3 flex justify-between">s/d</p>
                                                    <div className="form-input mt-1 flex justify-between">
                                                        <DatePickerComponent
                                                            locale="id"
                                                            name="edTglAkhir1"
                                                            cssClass="e-custom-style"
                                                            enableMask={true}
                                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                            showClearButton={false}
                                                            format="dd-MM-yyyy"
                                                            value={moment(formListDataState.edTglAkhir1).toDate()} //{tglAkhir.toDate()}
                                                            // onChange={(args: any) => handleInputChange(args.target.name, moment(args.value).format('YYYY-MM-DD'), 'chbTanggal')}
                                                            change={(args: ChangeEventArgsCalendar) => {
                                                                handleInputChange('edTglAkhir1', moment(args.value).format('YYYY-MM-DD'), 'cbTglPengajuan', setFormListDataState);
                                                            }}
                                                        >
                                                            <Inject services={[MaskedDateTime]} />
                                                        </DatePickerComponent>
                                                    </div>
                                                </div>

                                                <div className="mt-2 flex justify-between">
                                                    <CheckBoxComponent
                                                        label="Tanggal Approval"
                                                        name="cbTglApproval"
                                                        checked={formListDataState.cbTglApproval}
                                                        change={(args: ChangeEventArgsButton) => {
                                                            const value: any = args.checked;
                                                            handleCheckboxChange('cbTglApproval', value, setFormListDataState);
                                                        }}
                                                    />
                                                </div>
                                                <div className={`grid grid-cols-1 justify-between gap-1 sm:flex `}>
                                                    <div className="form-input mt-1 flex justify-between">
                                                        <DatePickerComponent
                                                            locale="id"
                                                            name="edTglApproval1"
                                                            cssClass="e-custom-style"
                                                            enableMask={true}
                                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                            showClearButton={false}
                                                            format="dd-MM-yyyy"
                                                            value={moment(formListDataState.edTglApproval1).toDate()}
                                                            change={(args: ChangeEventArgsCalendar) => {
                                                                handleInputChange('edTglApproval1', moment(args.value).format('YYYY-MM-DD'), 'cbTglApproval', setFormListDataState);
                                                            }}
                                                        >
                                                            <Inject services={[MaskedDateTime]} />
                                                        </DatePickerComponent>
                                                    </div>
                                                    <p className="set-font-11 ml-0.5 mr-0.5 mt-3 flex justify-between">s/d</p>
                                                    <div className="form-input mt-1 flex justify-between">
                                                        <DatePickerComponent
                                                            locale="id"
                                                            name="edTglApproval2"
                                                            cssClass="e-custom-style"
                                                            enableMask={true}
                                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                            showClearButton={false}
                                                            format="dd-MM-yyyy"
                                                            value={moment(formListDataState.edTglApproval2).toDate()}
                                                            change={(args: ChangeEventArgsCalendar) => {
                                                                handleInputChange('edTglApproval2', moment(args.value).format('YYYY-MM-DD'), 'cbTglApproval', setFormListDataState);
                                                            }}
                                                        >
                                                            <Inject services={[MaskedDateTime]} />
                                                        </DatePickerComponent>
                                                    </div>
                                                </div>
                                                <div className="mb-2 mt-2 border p-3" style={{ backgroundColor: 'white', borderRadius: 6, fontSize: 11 }}>
                                                    <div className="mb-2" style={{ marginBottom: 4 }}>
                                                        <input
                                                            type="checkbox"
                                                            className="form-checkbox"
                                                            checked={transaksiChecked.every((checked: any) => checked)}
                                                            onChange={() => setTransaksiChecked(toggleCheckboxes(transaksiChecked))} // Use the new function
                                                        />
                                                        <span style={{ fontWeight: 'bold' }}>Pilih Semua (Jenis Transaksi)</span>
                                                    </div>
                                                    <div className="ml-4">
                                                        {chTransaksi.map((item, index) => (
                                                            <div key={index} className="mb-2" style={{ marginBottom: -2 }}>
                                                                <label className="mt-1 inline-flex">
                                                                    <input
                                                                        type="checkbox"
                                                                        name={item.label}
                                                                        className="peer form-checkbox"
                                                                        checked={transaksiChecked[index]}
                                                                        onChange={() => HandleTransaksiList(index, transaksiChecked, setTransaksiChecked)}
                                                                    />
                                                                    <span>{item.label}</span>
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex">
                                                    <CheckBoxComponent
                                                        label="No. MB"
                                                        name="cbMB"
                                                        checked={formListDataState.cbMB}
                                                        change={(args: ChangeEventArgsButton) => {
                                                            const value: any = args.checked;
                                                            handleCheckboxChange('cbMB', value, setFormListDataState);
                                                        }}
                                                        style={{ borderRadius: 3, borderColor: 'gray' }}
                                                    />
                                                </div>
                                                <div className="mt-1 flex justify-between">
                                                    <div className="container form-input">
                                                        <TextBoxComponent
                                                            name="edMB"
                                                            placeholder="No. MB"
                                                            value={formListDataState.edMB === 'all' ? '' : formListDataState.edMB}
                                                            onChange={(args: any) => handleInputChange(args.target.name, args.value, 'cbMB', setFormListDataState)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-2 flex">
                                                    <CheckBoxComponent
                                                        label="Nama Ekspedisi"
                                                        name="cbExp"
                                                        checked={formListDataState.cbExp}
                                                        change={(args: ChangeEventArgsButton) => {
                                                            const value: any = args.checked;
                                                            handleCheckboxChange('cbExp', value, setFormListDataState);
                                                        }}
                                                        style={{ borderRadius: 3, borderColor: 'gray' }}
                                                    />
                                                </div>
                                                <div className="mt-1 flex justify-between">
                                                    <div className="container form-input">
                                                        <TextBoxComponent
                                                            name="edExp"
                                                            placeholder="Nama Ekspedisi"
                                                            value={formListDataState.edExp === 'all' ? '' : formListDataState.edExp}
                                                            onChange={(args: any) => handleInputChange(args.target.name, args.value, 'cbExp', setFormListDataState)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-2 flex">
                                                    <CheckBoxComponent
                                                        label="No. Kendaraan"
                                                        name="cbNopol"
                                                        checked={formListDataState.cbNopol}
                                                        change={(args: ChangeEventArgsButton) => {
                                                            const value: any = args.checked;
                                                            handleCheckboxChange('cbNopol', value, setFormListDataState);
                                                        }}
                                                        style={{ borderRadius: 3, borderColor: 'gray' }}
                                                    />
                                                </div>

                                                <div className="mt-1 flex justify-between">
                                                    <div className="container form-input">
                                                        <TextBoxComponent
                                                            name="edNopol"
                                                            placeholder="No. Kendaraan"
                                                            value={formListDataState.edNopol === 'all' ? '' : formListDataState.edNopol}
                                                            onChange={(args: any) => handleInputChange(args.target.name, args.value, 'cbNopol', setFormListDataState)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mb-2 mt-2 border p-3" style={{ backgroundColor: 'white', borderRadius: 6, fontSize: 11 }}>
                                                    <div className="mb-2" style={{ marginBottom: 4 }}>
                                                        <input
                                                            type="checkbox"
                                                            className="form-checkbox"
                                                            checked={pengajuanChecked.every((checked: any) => checked)}
                                                            onChange={() => setPengajuanChecked(toggleCheckboxes(pengajuanChecked))} // Use the new function
                                                        />
                                                        <span style={{ fontWeight: 'bold' }}>Pilih Semua (Pengajuan)</span>
                                                    </div>
                                                    <div className="ml-4">
                                                        {chPengajuan.map((item, index) => (
                                                            <div key={index} className="mb-2" style={{ marginBottom: -2 }}>
                                                                <label className="mt-1 inline-flex">
                                                                    <input
                                                                        type="checkbox"
                                                                        name={item.label}
                                                                        className="peer form-checkbox"
                                                                        checked={pengajuanChecked[index]} // Atur checked berdasarkan defaultAlasanChecked atau alasanChecked
                                                                        onChange={() => HandlePengajuanList(index, pengajuanChecked, setPengajuanChecked)}
                                                                    />
                                                                    <span>{item.label}</span>
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="mb-2 mt-2 border p-3" style={{ backgroundColor: 'white', borderRadius: 6, fontSize: 11 }}>
                                                    <div className="mb-2" style={{ marginBottom: 4 }}>
                                                        <input
                                                            type="checkbox"
                                                            className="form-checkbox"
                                                            checked={approvalChecked.every((checked: any) => checked)}
                                                            onChange={() => setApprovalChecked(toggleCheckboxes(approvalChecked))} // Use the new function
                                                        />
                                                        <span style={{ fontWeight: 'bold' }}>Pilih Semua (Approval)</span>
                                                    </div>
                                                    <div className="ml-4">
                                                        {chApproval.map((item, index) => (
                                                            <div key={index} className="mb-2" style={{ marginBottom: -2 }}>
                                                                <label className="mt-1 inline-flex">
                                                                    <input
                                                                        type="checkbox"
                                                                        name={item.label}
                                                                        className="peer form-checkbox"
                                                                        checked={approvalChecked[index]} // Atur checked berdasarkan defaultAlasanChecked atau alasanChecked
                                                                        onChange={() => HandleApprovalList(index, approvalChecked, setApprovalChecked)}
                                                                    />
                                                                    <span>{item.label}</span>
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </PerfectScrollbar>

                                        <div
                                            className="mb-2 flex justify-center"
                                            onMouseDown={(e) => {
                                                // Prevent sidebar from closing when clicking in refresh button area
                                                e.stopPropagation();
                                            }}
                                            onClick={(e) => {
                                                // Prevent sidebar from closing when clicking in refresh button area
                                                e.stopPropagation();
                                            }}
                                            onMouseUp={(e) => {
                                                // Prevent sidebar from closing when releasing mouse in refresh button area
                                                e.stopPropagation();
                                            }}
                                        >
                                            <TooltipComponent content="Refresh data yang ditampilkan" opensOn="Hover" openDelay={1000} position="BottomCenter">
                                                <ButtonComponent
                                                    cssClass="e-primary e-small"
                                                    iconCss="e-icons e-medium e-refresh"
                                                    content="Refresh Data"
                                                    style={{ backgroundColor: '#3b3f5c' }}
                                                    onClick={(e) => {
                                                        // Prevent sidebar from closing when clicking refresh button
                                                        e.stopPropagation();
                                                        handleRefreshData();
                                                    }}
                                                />
                                            </TooltipComponent>
                                        </div>
                                    </div>
                                </div>
                            </SidebarComponent>

                            <div
                                className="panel w-full border-l-[5px] border-white"
                                style={{
                                    width: gridWidth,
                                    background: '#dedede',
                                    margin: '0 auto auto' + (sidebarVisible ? ' 315px' : ' 0'),

                                    height: 'calc(100vh - 130px)',
                                    overflow: 'auto',
                                }}
                                onMouseDown={(e) => {
                                    // Prevent sidebar from closing when clicking in panel area
                                    e.stopPropagation();
                                }}
                                onClick={(e) => {
                                    // Prevent sidebar from closing when clicking in panel area
                                    e.stopPropagation();
                                }}
                                onMouseUp={(e) => {
                                    // Prevent sidebar from closing when releasing mouse in panel area
                                    e.stopPropagation();
                                }}
                            >
                                <div
                                    className="panel-data h-full w-full"
                                    onMouseDown={(e) => {
                                        // Prevent sidebar from closing when clicking in panel data area
                                        e.stopPropagation();
                                    }}
                                    onClick={(e) => {
                                        // Prevent sidebar from closing when clicking in panel data area
                                        e.stopPropagation();
                                    }}
                                    onMouseUp={(e) => {
                                        // Prevent sidebar from closing when releasing mouse in panel data area
                                        e.stopPropagation();
                                    }}
                                >
                                    <div
                                        className="mb-2  w-full items-center border border-black bg-white"
                                        style={{ display: 'inline-block' }}
                                        onMouseDown={(e) => {
                                            // Prevent sidebar from closing when clicking in search area
                                            e.stopPropagation();
                                        }}
                                        onClick={(e) => {
                                            // Prevent sidebar from closing when clicking in search area
                                            e.stopPropagation();
                                        }}
                                        onMouseUp={(e) => {
                                            // Prevent sidebar from closing when releasing mouse in search area
                                            e.stopPropagation();
                                        }}
                                    >
                                        <TextBoxComponent
                                            id="cariData"
                                            name="edCari"
                                            placeholder="Search..."
                                            cssClass="e-outline"
                                            showClearButton={true}
                                            input={(args: FocusInEventArgs) => {
                                                handleSearchList(args.value, dgFPMBLst);
                                            }}
                                        />
                                    </div>

                                    <div
                                        className="overflow-hidden"
                                        style={{ background: '#dedede', width: '100%', height: 'calc(100vh - 200px)' }}
                                        onMouseDown={(e) => {
                                            // Prevent sidebar from closing when clicking in grid area
                                            e.stopPropagation();
                                        }}
                                        onClick={(e) => {
                                            // Prevent sidebar from closing when clicking in grid area
                                            e.stopPropagation();
                                        }}
                                        onMouseUp={(e) => {
                                            // Prevent sidebar from closing when releasing mouse in grid area
                                            e.stopPropagation();
                                        }}
                                    >
                                        <GridComponent
                                            id="gridListData"
                                            locale="id"
                                            ref={(g) => (dgFPMBLst = g)}
                                            allowExcelExport={true}
                                            queryCellInfo={QueryCellInfoListData}
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
                                            width={'100%'}
                                            height={'calc(100% - 80px)'}
                                            gridLines={'Both'}
                                            recordDoubleClick={async (args: any) => {
                                                if (dgFPMBLst) {
                                                    const rowIndex: number = args.row.rowIndex;
                                                    dgFPMBLst.selectRow(rowIndex);
                                                    setUpdateFilePendukung('1');
                                                    setMasterDataState('EDIT');
                                                    setModalFpmb(true);
                                                }
                                            }}
                                            rowSelected={async (args) => {
                                                setMasterKodeMb(args.data?.kode_mb);
                                                setMasterKodeFpmb(args.data?.kode_fpmb);
                                                setStatusApp(args.data?.approval);
                                                setStatusPengajuan(args.data?.pengajuan);
                                                setStatusFinalisasi(args.data?.finalisasi);
                                                setJenisPengajuan(args.data?.jenis_pengajuan);
                                                setNoMb(args.data?.no_mb);
                                            }}
                                            allowTextWrap={true}
                                            textWrapSettings={{ wrapMode: 'Header' }}
                                        >
                                            <ColumnsDirective>
                                                <ColumnDirective field="jenis" headerText="Jenis Transaksi" headerTextAlign="Center" textAlign="Center" width="100" clipMode="EllipsisWithTooltip" />
                                                <ColumnDirective field="no_fpmb" headerText="No. Pengajuan" headerTextAlign="Center" textAlign="Center" width="110" clipMode="EllipsisWithTooltip" />
                                                <ColumnDirective field="no_mb" headerText="No. MB" headerTextAlign="Center" textAlign="Center" width="110" clipMode="EllipsisWithTooltip" />
                                                <ColumnDirective field="pabrik_asal" headerText="Pabrik Asal" headerTextAlign="Center" textAlign="Left" width="220" clipMode="EllipsisWithTooltip" />
                                                <ColumnDirective
                                                    field="nama_ekspedisi"
                                                    headerText="Nama Ekspedisi"
                                                    headerTextAlign="Center"
                                                    textAlign="Left"
                                                    width="170"
                                                    clipMode="EllipsisWithTooltip"
                                                />
                                                <ColumnDirective field="pengajuan" headerText="Pengajuan" headerTextAlign="Center" textAlign="Center" width="70" clipMode="EllipsisWithTooltip" />
                                                <ColumnDirective
                                                    field="tgl_fpmb"
                                                    headerText="Tanggal"
                                                    headerTextAlign="Center"
                                                    textAlign="Center"
                                                    width="80"
                                                    clipMode="EllipsisWithTooltip"
                                                    type="date"
                                                    format={formatDate}
                                                />
                                                <ColumnDirective
                                                    field="approval"
                                                    headerText="Approval"
                                                    headerTextAlign="Center"
                                                    textAlign="Center"
                                                    width="50"
                                                    clipMode="EllipsisWithTooltip"
                                                    template={(props: any) => <span className={props.approval === 'Y' ? 'checkmark' : 'crossmark'}>{props.approval === 'Y' ? '✔️' : ''}</span>}
                                                />
                                                <ColumnDirective
                                                    field="tgl_approval"
                                                    headerText="Tgl. Approval"
                                                    headerTextAlign="Center"
                                                    textAlign="Center"
                                                    width="80"
                                                    clipMode="EllipsisWithTooltip"
                                                    type="date"
                                                    format={formatDate}
                                                />
                                            </ColumnsDirective>
                                            <Inject services={[Page, Selection, Edit, Toolbar, Sort, Group, Filter, Resize, Reorder, /*Freeze,*/ ExcelExport, PdfExport]} />
                                        </GridComponent>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {modalJenisTransaksi && (
                <DialogComponent
                    id="dlgJenisTransaksi"
                    name="dlgJenisTransaksi"
                    className="dlgJenisTransaksi"
                    target="#fpmbList"
                    header="Form Pengajuan Mutasi Barang"
                    visible={modalJenisTransaksi}
                    isModal={true}
                    animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                    resizeHandles={['All']}
                    allowDragging={true}
                    showCloseIcon={true}
                    width="22%"
                    height="30%"
                    position={{ X: 'center', Y: 350 }}
                    style={{ position: 'fixed' }}
                    close={() => {
                        setModalJenisTransaksi(false);
                    }}
                >
                    <div>
                        <span style={{ fontWeight: 'bold', fontSize: 14, padding: 10 }}>[ Jenis Transaksi ]</span>
                    </div>
                    <hr style={{ marginBottom: 5 }}></hr>
                    <div style={{ padding: 10 }} className="flex items-center">
                        <RadioButtonComponent id="1" label="FBM Mobil Ekspedisi" name="size" checked={jenisTransaksi === '1'} change={() => changeModalJenisTransaksi('1')} cssClass="e-small" />
                    </div>
                    <div className="flex items-center" style={{ padding: 10, marginTop: -5 }}>
                        <RadioButtonComponent id="2" label="Mobil Sendiri / Customer" name="size" checked={jenisTransaksi === '2'} change={() => changeModalJenisTransaksi('2')} cssClass="e-small" />
                    </div>
                    <div className="flex items-center" style={{ padding: 10, marginTop: -5 }}>
                        <RadioButtonComponent id="3" label="Form Mutasi GV Customer" name="size" checked={jenisTransaksi === '3'} change={() => changeModalJenisTransaksi('3')} cssClass="e-small" />
                    </div>
                    <div className="flex items-center" style={{ padding: 10, marginTop: -5 }}>
                        <RadioButtonComponent id="4" label="Form Mutasi GV TTB" name="size" checked={jenisTransaksi === '4'} change={() => changeModalJenisTransaksi('4')} cssClass="e-small" />
                    </div>
                    <div className="flex items-center" style={{ padding: 10, marginTop: -5 }}>
                        <RadioButtonComponent
                            id="5"
                            label="Form Mutasi pemindahan GV TTB (mutasi full)"
                            name="size"
                            checked={jenisTransaksi === '5'}
                            change={() => changeModalJenisTransaksi('4')}
                            cssClass="e-small"
                        />
                    </div>
                    <div className="mb-5 ml-2 mr-2 mt-4 flex items-center justify-between">
                        <ButtonComponent cssClass="e-secondary e-small" style={{ width: '45%' }} onClick={() => handleNavigateLink(jenisTransaksi)}>
                            OK
                        </ButtonComponent>
                        <ButtonComponent cssClass="e-secondary e-small" style={{ width: '45%' }} onClick={() => setModalJenisTransaksi(false)}>
                            Batal
                        </ButtonComponent>
                    </div>
                </DialogComponent>
            )}
            {modalJenisTransaksiKirimLangsung && (
                <DialogComponent
                    id="dlgJenisTransaksiLangsung"
                    name="dlgJenisTransaksiLangsung"
                    className="dlgJenisTransaksiLangsung"
                    target="#fpmbList"
                    header="Form Pengajuan Mutasi Barang"
                    visible={modalJenisTransaksiKirimLangsung}
                    isModal={true}
                    animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                    resizeHandles={['All']}
                    allowDragging={true}
                    showCloseIcon={true}
                    width="22%"
                    height="25%"
                    position={{ X: 'center', Y: 350 }}
                    style={{ position: 'fixed' }}
                    close={() => {
                        setModalJenisTransaksiKirimLangsung(false);
                    }}
                >
                    <div>
                        <span style={{ fontWeight: 'bold', fontSize: 14, padding: 10 }}>[ Jenis Transaksi Langsung]</span>
                    </div>
                    <hr style={{ marginBottom: 5 }}></hr>
                    <div style={{ padding: 10 }} className="flex items-center">
                        <RadioButtonComponent id="1" label="Kirim Gudang" name="size" checked={jenisTransaksi === '1'} change={() => changeModalJenisTransaksi('1')} cssClass="e-small" />
                    </div>
                    <div className="flex items-center" style={{ padding: 10, marginTop: -5 }}>
                        <RadioButtonComponent id="2" label="Kirim Langsung" name="size" checked={jenisTransaksi === '2'} change={() => changeModalJenisTransaksi('2')} cssClass="e-small" />
                    </div>
                    <div className="mb-5 ml-2 mr-2 mt-4 flex items-center justify-between">
                        <ButtonComponent cssClass="e-secondary e-small" style={{ width: '45%' }} onClick={() => handleNavigateLinkKirimLangsung(jenisTransaksi)}>
                            OK
                        </ButtonComponent>
                        <ButtonComponent cssClass="e-secondary e-small" style={{ width: '45%' }} onClick={() => setModalJenisTransaksiKirimLangsung(false)}>
                            Batal
                        </ButtonComponent>
                    </div>
                </DialogComponent>
            )}
            {modalFpmb && (
                <FrmFpmb
                    stateDokumen={stateDokumen}
                    isOpen={modalFpmb}
                    onClose={() => {
                        setModalFpmb(false);
                        setJenisFpmb('');
                        setJenisPengajuan('');
                        setTipePengajuan('');
                        setpAppFPMB('');
                        setMasterDataState('');
                        setUpdateFilePendukung('');
                        setMasterKodeMb('');
                        setMasterKodeRencek('');
                        setMasterKodeFpmb('');
                        setStatusApp('');
                        setStatusPengajuan('');
                        setStatusFinalisasi('');
                        setNoMb('');
                    }}
                    onRefresh={handleRefreshData}
                    isFilePendukung={'isFilePendukungBk'}
                    onRefreshTipe={0}
                />
            )}
        </div>
    );
};

export default FpmbList;
