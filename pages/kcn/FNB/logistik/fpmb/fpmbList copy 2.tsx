import { useSession } from '@/pages/api/sessionContext';
// import React, { useRef, useState, useEffect, Fragment } from 'react';
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
import { SidebarComponent, SidebarType, ContextMenuComponent, MenuItemModel /*Tab, TabComponent*/ } from '@syncfusion/ej2-react-navigations';
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
    chTransaksi, // Importing from fpmbFunctions
    chPengajuan, // Importing from fpmbFunctions
    chApproval,
    Item, // Importing from fpmbFunctions
    toggleCheckboxes,
    handleCheckboxChange,
    handleInputChange,
    // rowDataBound,
    QueryCellInfoListData,
    handleSearchList,
} from './functions/fpmbFunctions';
import { usersMenu } from '@/utils/routines';
import { FetchDataListFpmb } from './api/api';
import './customStyles/styles.module.css';

L10n.load(idIDLocalization);

const FpmbList = () => {
    let dgFPMBLst: Grid | any;
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

    const [data] = useState(
        Array.from({ length: 25 }).map((_, index) => ({
            jenisTransaksi: 'Ekspedisi',
            noPengajuan: `1287.1109.0000${index + 1}`,
            noMB: `1223.1108.0000${index + 1}`,
            pabrikAsal: `Pabrik Asal ${index + 1}`,
            namaEkspedisi: `Nama Ekspedisi ${index + 1}`,
            pengajuan: 'Baru',
            tglPengajuan: '06-04-2023 1:12:27 PM',
            approval: true,
            tglApproval: '06-04-2023 1:31:07 PM',
        }))
    );
    const [masterKodeDokumen, setMasterKodeDokumen] = useState<string>('BARU');
    const [masterDataState, setMasterDataState] = useState<string>('');

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
            await FetchDataListFpmb(paramList, dgFPMBLst, stateDokumen.token);
        } catch (error) {
            console.error(error);
        }
    };

    // const handleCheckboxChange = (name: any, value: any) => {
    //     setFormListDataState((prevFormData: any) => ({
    //         ...prevFormData,
    //         [name]: value,
    //     }));
    // };

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
        param7: formListDataState.jenisTransaksi.replace(/"/g, ''), //formListDataState.jenisTransaksi,
        param8: formListDataState.cbMB ? formListDataState.edMB : 'all',
        param9: formListDataState.cbExp ? formListDataState.edExp : 'all',
        param10: formListDataState.cbNopol ? formListDataState.edNopol : 'all',
        param11: formListDataState.jenisPengajuan,
        param12: formListDataState.jenisApproval,
    };

    useEffect(() => {
        // const allCheckedTransaksi = transaksiChecked.every((checked) => checked);
        // const allCheckedPengajuan = pengajuanChecked.every((checked) => checked);
        // const allCheckedApproval = approvalChecked.every((checked) => checked);
        // setFormListDataState((prevState) => ({
        //     ...prevState,
        //     jenisTransaksi: allCheckedTransaksi ? 'all' : jenisTransaksiChecked || 'all',
        //     jenisPengajuan: allCheckedPengajuan ? 'all' : jenisPengajuanChecked || 'all',
        //     jenisApproval: allCheckedApproval ? 'all' : jenisApprovalChecked || 'all',
        // }));
        setFormListDataState((prevState) => ({
            ...prevState,
            jenisTransaksi: jenisTransaksiChecked || 'all',
            jenisPengajuan: jenisPengajuanChecked || 'all',
            jenisApproval: jenisApprovalChecked || 'all',
        }));
    }, [jenisTransaksiChecked, jenisPengajuanChecked, jenisApprovalChecked]);

    useEffect(() => {
        fetchDataUseEffect();
    }, []);

    const stateDokumen = {
        kode_entitas: kode_entitas, //sessionData?.kode_entitas ?? '',
        userid: userid, //sessionData?.userid ?? '',
        kode_user: kode_user, //sessionData?.kode_user ?? '',
        token: token, //sessionData?.token ?? '',
        masterKodeDokumen: masterKodeDokumen,
        masterDataState: masterDataState,
    };

    return (
        <div className="flex h-screen flex-col" id="fpmbList">
            {/* HEADER FORM MENU LIST*/}
            <div className="flex w-full flex-grow">
                <div className="w-full">
                    {/* <div className="p-4"> */}
                    <div className="mb-4 items-center justify-between rounded-md border-b bg-white p-4 pb-2  shadow-md md:flex">
                        <div className="grid grid-cols-12">
                            <div className="mt-1p-4 col-span-3 mb-2 items-center justify-between border-b pb-2 md:flex">
                                {' '}
                                <div className="flex space-x-2">
                                    <div className="relative">
                                        <ButtonComponent
                                            // className="rounded bg-blue-600 px-4 py-2 text-white"
                                            id="btnBaru"
                                            cssClass="e-primary e-small"
                                            style={styleButton}
                                            // disabled={disabledBaru}
                                            // onClick={showNewRecord}
                                            content="Baru"
                                        ></ButtonComponent>

                                        <ButtonComponent
                                            // className="rounded bg-blue-600 px-4 py-2 text-white"
                                            id="btnEdit"
                                            cssClass="e-primary e-small"
                                            style={styleButton}
                                            // disabled={disabledEdit}
                                            // onClick={() => {
                                            //     // showEditRecord('Edit Biasa');

                                            //     showEditRecord();
                                            // }}
                                            content="Ubah"
                                        ></ButtonComponent>
                                        <ButtonComponent
                                            // className="rounded bg-gray-300 px-4 py-2 text-white"
                                            content="Filter"
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
                                        ></ButtonComponent>

                                        <ContextMenuComponent
                                            // className="rounded bg-blue-600 px-4 py-2 text-white"
                                            id="cMenuCetak"
                                            // ref={(scope) => (cMenuCetak = scope as ContextMenuComponent)}
                                            // items={menuCetakItems}
                                            // select={menuCetakSelect}
                                            // animationSettings={{ duration: 800, effect: 'FadeIn' }}
                                        />

                                        <ButtonComponent
                                            className="rounded bg-blue-600 px-4 py-2 text-white"
                                            id="btnCetak"
                                            cssClass="e-primary e-small"
                                            style={{ ...styleButton, width: 75 + 'px' }}
                                            // // disabled={disabledCetak}
                                            // // onClick={btnPrintClick}
                                            // content="Cetak"
                                            iconCss="e-icons e-medium e-chevron-down"
                                            // iconPosition="Right"
                                        ></ButtonComponent>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-1p-4 col-span-6 mb-2 items-center justify-between border-b pb-2 md:flex">
                                {' '}
                                <div className="flex items-center text-center">
                                    <button className="absolute right-0 top-0 p-2 text-gray-600 hover:text-gray-900" onClick={handleTogglePanel}>
                                        <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                                    </button>

                                    <ButtonComponent
                                        id="btnApproval"
                                        cssClass="e-primary e-small"
                                        style={styleButtonAppoval}
                                        // disabled={approvalButtonCabang}
                                        // onClick={() => {
                                        //     // showEditRecord('Edit Approved');

                                        //     handleApproveCabang();
                                        // }}
                                        content="Approval Cabang"
                                    ></ButtonComponent>
                                    <ButtonComponent
                                        id="btnUpdateFilePendukung"
                                        cssClass="e-primary e-small"
                                        style={styleButtonAppoval}
                                        // disabled={approvalButtonPusat}
                                        // onClick={() => {
                                        //     // showEditRecord('Edit File Pendukung');
                                        //     // setConFPB('Approve_Pusat');
                                        //     // setDialogFrmFpb(true);
                                        //     handleApprovePusat();
                                        // }}
                                        content="Approval Pusat"
                                    ></ButtonComponent>
                                    <ButtonComponent
                                        id="btnBatal"
                                        cssClass="e-primary e-small"
                                        style={styleButtonAppoval}
                                        disabled={false}
                                        content="Pembatalan"
                                        // onClick={() => {
                                        //     selectDataGrid = dgFpbList.getSelectedRecords();

                                        //     if (selectDataGrid.length > 0) {
                                        //         setKirimLangsung(selectDataGrid[0]?.kirim_langsung_cabang);
                                        //         setIsCabang(false);
                                        //         if (selectDataGrid[0]?.status === 'Terbuka' && selectDataGrid[0]?.status_app !== 'Disetujui' && selectDataGrid[0]?.kontrak === 'N') {
                                        //             setConFPB('batal fpb');
                                        //             setDialogFrmFpb(true);
                                        //         } else {
                                        //             myAlertGlobal(`Status dok. "Tertutup" atau Status App "Disetujui"  tidak dapat dibatalkan.`, 'main-target');
                                        //         }
                                        //     } else {
                                        //         myAlertGlobal(`Silahkan pilih data terlebih dahulu`, 'main-target');
                                        //     }
                                        // }}
                                    ></ButtonComponent>
                                    <ButtonComponent
                                        id="btnDetail"
                                        cssClass="e-primary e-small"
                                        style={styleButtonAppoval}
                                        disabled={false}
                                        // onClick={() => {
                                        //     SetDataDokumen(
                                        //         'detailDok',
                                        //         stateDokumen.masterKodeDokumen, //stateDokumen[0].masterKodeDokumen,
                                        //         stateDokumen.kode_entitas,
                                        //         detailListDokumen,
                                        //         router,
                                        //         setSelectedItem,
                                        //         setDetailDok,
                                        //         stateDokumen.token,
                                        //         jenisTab
                                        //     );
                                        // }}
                                        content="Detail Dok."
                                    ></ButtonComponent>
                                </div>
                            </div>
                            <div className="mt-1p-4 col-span-3 mb-2 items-center justify-between border-b pb-2 md:flex">
                                <div className="text-xl font-semibold">Form Pengajuan Mutasi Barang (FPMB)</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* PANEL KIRI FORM MENU LIST*/}
            <div className="relative flex h-full gap-3 sm:h-[calc(100vh_-_100px)]">
                {/* <div className="relative flex gap-3 sm:h-[calc(100vh_-_100px)]"> */}
                {panelVisible && (
                    <div
                        // className={`panel absolute z-10 hidden h-full w-[300px] max-w-full flex-none space-y-4 p-4 dark:border-[#191e3a] xl:relative xl:block xl:h-auto ltr:rounded-r-none ltr:xl:rounded-r-md rtl:rounded-l-none rtl:xl:rounded-l-md ${
                        className={`panel absolute z-10 hidden  w-[300px] max-w-full flex-none space-y-4 overflow-auto p-4 dark:border-[#191e3a] xl:relative xl:block xl:h-auto ltr:rounded-r-none ltr:xl:rounded-r-md rtl:rounded-l-none rtl:xl:rounded-l-md ${
                            isShowTaskMenu && '!block'
                        }`}
                        style={{ background: '#dedede' }}
                        // style={{ background: 'green' }}
                    >
                        {/* <div className="flex h-full flex-col overflow-auto"> */}
                        <div className="flex h-auto flex-col overflow-auto">
                            <div className="pb-5">
                                <div className="flex items-center text-center">
                                    <button className="absolute right-0 top-0 p-2 text-gray-600 hover:text-gray-900" onClick={handleTogglePanel}>
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
                            </div>

                            <div className="mb-5 h-px w-full border-b border-black dark:border-[#1b2e4b]"></div>
                            {/* KOMPONEN FILTER */}
                            <PerfectScrollbar style={sampleContainer} className="ltr:-mr3.5 ltr:pr3 relative mb-5 h-full  grow rtl:-ml-3.5 rtl:pl-3 ">
                                {/* <PerfectScrollbar className="ltr:-mr3.5 ltr:pr3 relative mb-5 h-full  grow rtl:-ml-3.5 rtl:pl-3 "> */}
                                <div className="flex h-full flex-col gap-2 overflow-auto">
                                    <div id="inputFilter">
                                        {/* NO FPB */}
                                        <div className="flex">
                                            <CheckBoxComponent
                                                label="No. Pengajuan"
                                                // label=<span className="font-bold">No. Pengajuan</span>
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
                                        {/* TANGGAL */}
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
                                                    // renderDayCell={onRenderDayCell}
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
                                                    // renderDayCell={onRenderDayCell}
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
                                        {/* TANGGAL BERLAKU */}
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
                                                    // renderDayCell={onRenderDayCell}
                                                    enableMask={true}
                                                    maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                    showClearButton={false}
                                                    format="dd-MM-yyyy"
                                                    value={moment(formListDataState.edTglApproval1).toDate()}
                                                    // onChange={(args: any) => handleInputChange(args.target.name, moment(args.value).format('YYYY-MM-DD'), 'chbTanggalBerlaku')}
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
                                                    // renderDayCell={onRenderDayCell}
                                                    enableMask={true}
                                                    maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                    showClearButton={false}
                                                    format="dd-MM-yyyy"
                                                    value={moment(formListDataState.edTglApproval2).toDate()} //{tglAkhir.toDate()}
                                                    // onChange={(args: any) => handleInputChange(args.target.name, moment(args.value).format('YYYY-MM-DD'), 'chbTanggalBerlaku')}
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
                                                    // onChange={() => HandlePilihSemuaTransaksiList(transaksiChecked, setTransaksiChecked)}
                                                    // onChange={() => {
                                                    //     const newCheckedState = transaksiChecked.map(() => !transaksiChecked.every((checked: any) => checked)); // Toggle all
                                                    //     setTransaksiChecked(newCheckedState);
                                                    // }}
                                                    // onChange={() => handleCheckboxChange(!transaksiChecked.every((checked: any) => checked))} // Call the new function
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
                                                                checked={transaksiChecked[index]} // Atur checked berdasarkan defaultAlasanChecked atau alasanChecked
                                                                onChange={() => HandleTransaksiList(index, transaksiChecked, setTransaksiChecked)}
                                                            />
                                                            <span>{item.label}</span>
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* NAMA SUPPLIER */}
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
                                                    // onChange={() => HandlePilihSemuaPengajuanList(pengajuanChecked, setPengajuanChecked)}
                                                    // onChange={() => {
                                                    //     const newCheckedState = pengajuanChecked.map(() => !pengajuanChecked.every((checked: any) => checked)); // Toggle all
                                                    //     setPengajuanChecked(newCheckedState);
                                                    // }}
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
                                                    // onChange={() => HandlePilihSemuaApprovalList(approvalChecked, setApprovalChecked)}
                                                    // onChange={() => {
                                                    // //     const newCheckedState = approvalChecked.map(() => !approvalChecked.every((checked: any) => checked)); // Toggle all
                                                    // //     setApprovalChecked(newCheckedState);
                                                    // // }}
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
                                </div>
                            </PerfectScrollbar>
                            {/* TOMBOL REFRESH DATA BAWAH */}
                            <div className="mt-6 flex justify-center">
                                <TooltipComponent content="Refresh data yang ditampilkan" opensOn="Hover" openDelay={1000} position="BottomCenter">
                                    <ButtonComponent
                                        cssClass="e-primary e-small"
                                        iconCss="e-icons e-medium e-refresh"
                                        content="Refresh Data"
                                        style={{ backgroundColor: '#3b3f5c', marginTop: '15px' }}
                                        onClick={() => handleRefreshData()}
                                    />
                                </TooltipComponent>
                            </div>
                        </div>
                    </div>
                )}

                {/* BEGIN BUTTON APPROVAL*/}

                <div className="h-full flex-1 overflow-auto ">
                    <div className="panel h-auto  flex-1" style={{ background: '#dedede', margin: panelVisible ? '' : 'auto auto auto ', overflowY: 'auto' }}>
                        <div className="panel-data w-full ">
                            <div className="mb-2  w-full items-center border border-black bg-white" style={{ display: 'inline-block' }}>
                                <TextBoxComponent
                                    id="cariData"
                                    name="edCari"
                                    // className="cariData"
                                    placeholder="Search..."
                                    cssClass="e-outline"
                                    showClearButton={true}
                                    input={(args: FocusInEventArgs) => {
                                        // const value: any = args.value;
                                        handleSearchList(args.value, dgFPMBLst);
                                    }}

                                    // input={(args: any) => {
                                    // if (tabs[selectedIndex].dataGrid) {
                                    //     tabs[selectedIndex].dataGrid.search(args.value);
                                    // }
                                    // }}
                                />
                            </div>
                            {/* TAB BUAT GRID */}
                            <div className="overflow-hidden" style={{ background: '#dedede', width: '100%' }}>
                                {/*  */}

                                <GridComponent
                                    id="gridListData"
                                    locale="id"
                                    ref={(g) => (dgFPMBLst = g)}
                                    allowExcelExport={true}
                                    // excelExportComplete={ExportComplete}
                                    // allowPdfExport={true}
                                    // pdfExportComplete={ExportComplete}
                                    // rowDataBound={rowDataBound}
                                    queryCellInfo={QueryCellInfoListData}
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
                                    width={'100%'}
                                    height={612} //{400}
                                    // {545}
                                    gridLines={'Both'}
                                    // loadingIndicator={{ indicatorType: 'Shimmer' }}
                                    // queryCellInfo={QueryCellInfoListData}

                                    // recordDoubleClick={async (args: any) => {
                                    //     if (dgFpbList) {
                                    //         const rowIndex: number = args.row.rowIndex;
                                    //         dgFpbList.selectRow(rowIndex);
                                    //         await showEditRecord();
                                    //     }
                                    // }}
                                    // rowSelected={async (args) => {
                                    //     // HandleRowSelected(args, setMasterKodeDokumen);

                                    //     setDetailListDokumen({
                                    //         ...detailListDokumen,
                                    //         no_dokumen: args.data?.no_fpb,
                                    //         tgl_dokumen: moment(args.data?.tgl_fpb).format('YYYY-MM-DD'),
                                    //     });
                                    //     setMasterKodeDokumen(args.data?.kode_fpb);
                                    //     ListDetailDok(args.data?.kode_fpb, jenisTab, stateDokumen.kode_entitas, setDetailDok, stateDokumen.token);
                                    // }}
                                    // rowSelecting={(args) => rowSelectingListData(args, setDetailListPraBkk, kode_entitas, setDetailDok, stateDokumen[0].token, jenisTab)}
                                    allowTextWrap={true}
                                    textWrapSettings={{ wrapMode: 'Header' }}
                                >
                                    <ColumnsDirective>
                                        <ColumnDirective
                                            field="jenis"
                                            headerText="Jenis Transaksi"
                                            headerTextAlign="Center"
                                            textAlign="Center"
                                            //autoFit
                                            width="100"
                                            clipMode="EllipsisWithTooltip" /*freeze="Left"*/
                                        />
                                        <ColumnDirective
                                            field="no_fpmb"
                                            headerText="No. Pengajuan"
                                            headerTextAlign="Center"
                                            textAlign="Center"
                                            //autoFit
                                            width="110"
                                            clipMode="EllipsisWithTooltip" /*freeze="Left"*/
                                        />
                                        <ColumnDirective
                                            field="no_mb"
                                            headerText="No. MB"
                                            headerTextAlign="Center"
                                            textAlign="Center"
                                            //autoFit
                                            width="110"
                                            clipMode="EllipsisWithTooltip" /*freeze="Left"*/
                                        />
                                        <ColumnDirective
                                            field="pabrik_asal"
                                            headerText="Pabrik Asal"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            //autoFit
                                            width="220"
                                            clipMode="EllipsisWithTooltip" /*freeze="Left"*/
                                        />
                                        <ColumnDirective
                                            field="nama_ekspedisi"
                                            headerText="Nama Ekspedisi"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            //autoFit
                                            width="170"
                                            clipMode="EllipsisWithTooltip" /*freeze="Left"*/
                                        />
                                        <ColumnDirective
                                            field="pengajuan"
                                            headerText="Pengajuan"
                                            headerTextAlign="Center"
                                            textAlign="Center"
                                            //autoFit
                                            width="70"
                                            clipMode="EllipsisWithTooltip" /*freeze="Left"*/
                                        />
                                        <ColumnDirective
                                            field="tgl_fpmb"
                                            headerText="Tanggal"
                                            headerTextAlign="Center"
                                            textAlign="Center"
                                            //autoFit
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
                                            //autoFit
                                            width="50"
                                            clipMode="EllipsisWithTooltip"
                                            template={(props: any) => (
                                                <span className={props.approval === 'Y' ? 'checkmark' : 'crossmark'}>
                                                    {props.approval === 'Y' ? '✔️' : '❌'} {/* Display checkmark if approval is 'Y' */}
                                                </span>
                                            )}
                                            // template={(props: any) => (
                                            //     <span style={{ color: props.approval === 'Y' ? 'green' : 'red' }}>
                                            //         {props.approval === 'Y' ? '✔️' : ''} {/* Display checkmark if approval is 'Y' */}
                                            //     </span>
                                            // )}
                                        />
                                        <ColumnDirective
                                            field="tgl_approval"
                                            headerText="Tgl. Approval"
                                            headerTextAlign="Center"
                                            textAlign="Center"
                                            //autoFit
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
            {/* GRID FORM MENU LIST*/}

            {/*}
            <div className="flex items-center justify-between bg-gray-300 p-2">
                <div className="text-lg font-bold">Form Pengajuan Mutasi Barang</div>
                <div className="flex space-x-2">
                    <ButtonComponent cssClass="e-primary">Approval</ButtonComponent>
                    <ButtonComponent cssClass="e-danger">Batal Approved</ButtonComponent>
                </div>
            </div>
            <div className="flex flex-1 overflow-hidden">
                <div className="w-1/4 overflow-y-auto bg-gray-400 p-4">
                    <div className="mb-4">
                        <label className="mb-1 block">No. Pengajuan</label>
                        <input type="text" className="w-full rounded border p-2" />
                    </div>
                    <div className="mb-4">
                        <label className="mb-1 block">Pabrik Asal</label>
                        <input type="text" className="w-full rounded border p-2" />
                    </div>
                    <div className="mb-4">
                        <label className="mb-1 block">Tanggal Pengajuan</label>
                        <div className="flex space-x-2">
                            <DatePickerComponent className="w-1/2 rounded border p-2" />
                            <DatePickerComponent className="w-1/2 rounded border p-2" />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="mb-1 block">Tanggal Approval</label>
                        <div className="flex space-x-2">
                            <DatePickerComponent className="w-1/2 rounded border p-2" />
                            <DatePickerComponent className="w-1/2 rounded border p-2" />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="mb-1 block">Jenis Transaksi</label>
                        <div className="space-y-2">
                            <div>
                                <CheckBoxComponent label="Ekspedisi" />
                            </div>
                            <div>
                                <CheckBoxComponent label="Mobil Sendiri Kirim Gudang" />
                            </div>
                            <div>
                                <CheckBoxComponent label="Mobil Sendiri Kirim Langsung" />
                            </div>
                            <div>
                                <CheckBoxComponent label="GV. Customer" />
                            </div>
                            <div>
                                <CheckBoxComponent label="GV. TTB" />
                            </div>
                            <div>
                                <CheckBoxComponent label="Mutasi Full" />
                            </div>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="mb-1 block">No. MB</label>
                        <input type="text" className="w-full rounded border p-2" />
                    </div>
                    <div className="mb-4">
                        <label className="mb-1 block">Nama Ekspedisi</label>
                        <input type="text" className="w-full rounded border p-2" />
                    </div>
                    <div className="mb-4">
                        <label className="mb-1 block">No. Kendaraan</label>
                        <input type="text" className="w-full rounded border p-2" />
                    </div>
                    <div className="mb-4">
                        <label className="mb-1 block">Pengajuan</label>
                        <div className="space-y-2">
                            <div>
                                <RadioButtonComponent label="Baru (Y)" name="pengajuan" />
                            </div>
                            <div>
                                <RadioButtonComponent label="Koreksi" name="pengajuan" />
                            </div>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="mb-1 block">Approval</label>
                        <div className="space-y-2">
                            <div>
                                <RadioButtonComponent label="Belum Approved (N)" name="approval" />
                            </div>
                            <div>
                                <RadioButtonComponent label="Approved (Y)" name="approval" />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <ButtonComponent cssClass="e-primary">Refresh</ButtonComponent>
                        <ButtonComponent cssClass="e-primary">Update File Pendukung</ButtonComponent>
                    </div>
                </div>
                <div className="flex-1 overflow-auto bg-white p-4">
                    <GridComponent dataSource={data} allowPaging={true} pageSettings={{ pageSize: 10 }}>
                        <ColumnsDirective>
                            <ColumnDirective field="jenisTransaksi" headerText="Jenis Transaksi" width="150" textAlign="Left" />
                            <ColumnDirective field="noPengajuan" headerText="No. Pengajuan" width="150" textAlign="Left" />
                            <ColumnDirective field="noMB" headerText="No. MB" width="150" textAlign="Left" />
                            <ColumnDirective field="pabrikAsal" headerText="Pabrik Asal" width="150" textAlign="Left" />
                            <ColumnDirective field="namaEkspedisi" headerText="Nama Ekspedisi" width="150" textAlign="Left" />
                            <ColumnDirective field="pengajuan" headerText="Pengajuan" width="100" textAlign="Left" />
                            <ColumnDirective field="tglPengajuan" headerText="Tgl. Pengajuan" width="150" textAlign="Left" />
                            <ColumnDirective
                                field="approval"
                                headerText="Approval"
                                width="100"
                                textAlign="Center"
                                template={(props: any) => <i className={`fas fa-${props.approval ? 'check' : 'times'} text-${props.approval ? 'green' : 'red'}-500`}></i>}
                            />
                            <ColumnDirective field="tglApproval" headerText="Tgl. Approval" width="150" textAlign="Left" />
                        </ColumnsDirective>
                        <Inject services={[Page]} />
                    </GridComponent>
                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm">Tampilkan semua atau limit</div>
                        <div className="flex space-x-2">
                            <input type="number" className="w-12 rounded border p-2" defaultValue="0" />
                            <input type="number" className="w-12 rounded border p-2" defaultValue="25" />
                            <div className="text-sm">data.</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-gray-300 p-2 text-right">
                <div className="text-sm">Record (s) : 25</div>
            </div>
            */}
        </div>
    );
};

export default FpmbList;
