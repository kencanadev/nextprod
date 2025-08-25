// components/AnimatedTabs.tsx
import { Tab } from '@headlessui/react';
import { Fragment, SetStateAction, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FocusInEventArgs, ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import { Tooltip, TooltipComponent, TooltipEventArgs } from '@syncfusion/ej2-react-popups';
import { ButtonComponent, RadioButtonComponent, ChangeEventArgs as ChangeEventArgsButton, CheckBoxComponent } from '@syncfusion/ej2-react-buttons';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { Predicate } from '@syncfusion/ej2-data';

import { useRouter } from 'next/router';
import { useSession } from '@/pages/api/sessionContext';
import axios from 'axios';

import { Internationalization, loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import idIDLocalization from 'public/syncfusion/locale.json';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json';
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
L10n.load(idIDLocalization);

import FrmItemDlg from './components/frmItemDlg';
import { Query } from '@syncfusion/ej2/data';
import { Aggregate, Filter, Group, RowDeselectEventArgs, RowSelectEventArgs, Search, Sort } from '@syncfusion/ej2/grids';
import moment, { Moment } from 'moment';

import { ProgressBarComponent, ProgressAnnotation } from '@syncfusion/ej2-react-progressbar';
import { myAlertGlobal2, myAlertGlobal3, sendTelegramMessage, settingTelegram } from '@/utils/routines';
// import { ContentTemplate } from '@syncfusion/ej2-react-progressbar';
import { FilterState, resetFilters as resetFiltersUtil, getFilters } from './filters/praPpFilters';
import { createPraPpListHandlers } from './handlers/praPpListHandlers';
import { handleOrderKePraPP, handleResetData, handleHapusData, checkAlasan, handleTolakData } from './handlers/praPpHandlers';
// import { handleRefreshPraPpAppList, handleRefreshPraPpList, handleRefreshTolakList } from './handlers/praPpListRefreshHandlers';
import { handleGenerateTolakData } from './handlers/handleTolakData';
import { result } from 'lodash';
import { exportToPusat, handleKirimTele } from './handlers/exportData';
import { exitCode } from 'process';
import { cancelOutstanding, handleRefreshList, HandleRowSelected, handleSplitClick, RowSelectingListData, setDetailPraPp } from './functions/praPpFunctions';
import Draggable from 'react-draggable';
import styles from '../prapp/prapp.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

let dgPreOrder: Grid;
let dgPraPp: Grid;
let gridListData: Grid | any;

let dgBreak: Grid;
let dgPraPPList: Grid;
let dgPraPPApp: Grid;
let dgTolakPreOrder: Grid;
let dgDlgBarang: Grid;
let vtBreak: any[] = [];

const PreOrderForm = () => {
    const router = useRouter();
    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    if (!isLoading) {
        // console.log('....LOADNG');
        //   fetchDataBasedOnTabId();
    }

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [searchText, setSearchText] = useState('');
    const [search, setSearch] = useState('');

    const [searchEntitas, setSearchEntitas] = useState('');
    const [searchBulan, setSearchBulan] = useState('');

    const [gridQuery, setGridQuery] = useState(new Query());

    const [showDialogBarang, setShowDialogBarang] = useState(false);
    const [jenisDlgItem, setJenisDlgItem] = useState('');

    const stateDokumen = {
        kode_entitas: kode_entitas, //sessionData?.kode_entitas ?? '',
        userid: userid, //sessionData?.userid ?? '',
        kode_user: kode_user, //sessionData?.kode_user ?? '',
        token: token, //sessionData?.token ?? '',
        apiUrl: apiUrl,
    };

    const [isLoadingPraPpList, setIsLoadingPraPpList] = useState(false);
    const [isLoadingPraPpAppList, setIsLoadingPraPpAppList] = useState(false);
    const [isLoadingTolakList, setIsLoadingTolakList] = useState(false);

    const [isTabLoading, setIsTabLoading] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [displayedProgress, setDisplayedProgress] = useState(0);

    const [filterState, setFilterState] = useState<FilterState>({
        selectAll: false,
        searchNamaBarang: '',
        isNoPraPpListChecked: false,
        noPraPpList: '',
        isTanggalPraPpListChecked: true,
        date1PraPpList: moment(),
        date2PraPpList: moment().endOf('month'),
        isNamaBarangPraPpChecked: false,
        namaBarangPraPpList: '',
        selectedOption: 'N',
        isNoPraPpListAppChecked: false,
        noPraPpAppList: '',
        isTanggalPraPpListAppChecked: true,
        date1PraPpAppList: moment(),
        date2PraPpAppList: moment().endOf('month'),
        isNamaBarangPraPpAppChecked: false,
        namaBarangPraPpAppList: '',
        selectedOptionApp: 'Y',
        isNoTolakChecked: false,
        noTolakList: '',
        isTanggalTolakChecked: true,
        date1TolakList: moment(),
        date2TolakList: moment().endOf('month'),
        isTanggalPreOrderTolakChecked: false,
        date1PreOrderTolakList: moment(),
        date2PreOrderTolakList: moment().endOf('month'),
        isNamaBarangTolakChecked: false,
        namaBarangTolakList: '',
    });

    const [loadingMessage, setLoadingMessage] = useState('Initializing...');

    const [selectedRow, setSelectedRow] = useState('');
    const [dataHeaderDetailPrapp, setDataHeaderDetailPrapp] = useState({ no_prapp: '', tgl_prapp: '' });
    const [detailDok, setDetailDok] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const [modalPosition, setModalPosition] = useState({ top: '3%', right: '2%', height: '33%', width: '100%', background: '#dedede' });

    // Initialize handlers
    const praPpListHandlers = createPraPpListHandlers({
        setSelectedOption: (value: SetStateAction<string>) => updateFilterState({ selectedOption: value as string }),
        setDate1PraPpList: (value: SetStateAction<Moment>) => updateFilterState({ date1PraPpList: value as Moment }),
        setDate2PraPpList: (value: SetStateAction<Moment>) => updateFilterState({ date2PraPpList: value as Moment }),
        setNamaBarangPraPpList: (value: SetStateAction<string>) => updateFilterState({ namaBarangPraPpList: value as string }),
        setIsNamaBarangPraPpChecked: (value: SetStateAction<boolean>) => updateFilterState({ isNamaBarangPraPpChecked: value as boolean }),
        setNoPraPpList: (value: SetStateAction<string>) => updateFilterState({ noPraPpList: value as string }),
        setIsNoPraPpListChecked: (value: SetStateAction<boolean>) => updateFilterState({ isNoPraPpListChecked: value as boolean }),
    });

    // Update filter state helper
    const updateFilterState = (updates: Partial<FilterState>) => {
        setFilterState((prev) => ({ ...prev, ...updates }));
    };

    // Replace resetFilters with new implementation
    const handleResetFilters = (tabIndex: number) => {
        resetFiltersUtil(tabIndex, updateFilterState);
    };

    // Replace Filters object with getFilters call
    const filters = getFilters(filterState, kode_entitas);

    const handleCheckboxChangePraPpList = (event: any, uniqId: any) => {
        const grid = tabs[selectedIndex].dataGrid;
        const updatedData = (grid.dataSource as any[]).map((item: any) => (item.uniqId === uniqId ? { ...item, pilih: event.target.checked ? 'Y' : 'N' } : item));
        grid.dataSource = updatedData;
    };

    const checkBoxTemplatePraPpList = (props: any) => {
        return (
            // <label className="inline-flex">
            <input
                type="checkbox"
                name={props.uniqId}
                id={props.uniqId}
                className="form-checkbox text-dark"
                checked={props.pilih === 'Y'}
                onChange={(e) => handleCheckboxChangePraPpList(e, props.uniqId)}
            />
            // </label>
        );
    };

    // const handleRefreshList = async (type: 'praPpList' | 'praPpAppList' | 'tolakList') => {
    //     const currentGrid = tabs[selectedIndex].dataGrid;
    //     // console.log('tabs[selectedIndex].dataGri', tabs[selectedIndex].dataGrid);
    //     // console.log('currentGrid', currentGrid);
    //     // console.log('tabs[selectedIndex]', tabs[selectedIndex]);

    //     const handlers = {
    //         praPpList: {
    //             handler: handleRefreshPraPpList,
    //             setLoading: setIsLoadingPraPpList,
    //         },
    //         praPpAppList: {
    //             handler: handleRefreshPraPpAppList,
    //             setLoading: setIsLoadingPraPpAppList,
    //         },
    //         tolakList: {
    //             handler: handleRefreshTolakList,
    //             setLoading: setIsLoadingTolakList,
    //         },
    //     };

    //     const { handler, setLoading } = handlers[type];
    //     handler({
    //         currentGrid,
    //         apiUrl,
    //         token,
    //         filters,
    //         setIsLoading: setLoading,
    //         setProgressValue,
    //     });
    // };

    //GLOBAL

    const handleSelectedDialog = (dataObject: any) => {
        // console.log('dataObject', dataObject);
        // setSearchText(dataObject);
        // setSearchNamaBarang(dataObject.nama_item);
        if (jenisDlgItem === 'filter') {
            updateFilterState({ searchNamaBarang: dataObject.nama_item });
        } else if (jenisDlgItem === 'tambah') {
            // console.log('untuk tambah');

            // if (tabs[0].dataGrid) {
            // const grid = tabs[selectedIndex].dataGrid;
            const grid = tabs[0].dataGrid;
            let newDataSource: any = grid.dataSource;
            const payload = {
                kode_item: dataObject.kode_item,
                diskripsi: dataObject.nama_item,
                no_item: dataObject.no_item,
                entitas: kode_entitas,
                tgl_preorder: moment().format('DD-MM-YYYY'),
                tolak: 'N',
                berat: dataObject.berat,
                berat_order: 0,
                berat_sisa: 0,
                berat_acc: 0,
                kode_preorder: '0',
                id_preorder: 0,
                uniqId: 't' + '_' + moment().format('mm:ss') + '_' + kode_entitas + '_' + dataObject.no_item,
            };
            newDataSource.push(payload);
            // console.log(newDataSource);
            grid.dataSource = newDataSource;

            // grid.addRecord(updatedData);
            grid.refresh();
            // console.log('updatedData', updatedData);

            // }
        }
    };

    const gridRef = (g: any) => {
        if (g) {
            tabs[selectedIndex].dataGrid = g;
            // Trigger data fetch after grid is initialized
            // fetchDataBasedOnTabId(tabs[selectedIndex].id);
        }
    };

    const handleSelectAll = (checked: boolean) => {
        updateFilterState({ selectAll: checked });
        if (tabs[selectedIndex].dataGrid) {
            const grid = tabs[selectedIndex].dataGrid;

            const updatedData = (grid.dataSource as any[]).map((item: any) => ({
                ...item,
                pilih: checked ? 'Y' : 'N',
            }));
            grid.dataSource = updatedData;
        }
    };

    const handleCheckboxChange = (event: any, uniqId: any) => {
        const grid = tabs[selectedIndex].dataGrid;
        const updatedData = (grid.dataSource as any[]).map((item: any) => (item.uniqId === uniqId ? { ...item, pilih: event.target.checked ? 'Y' : 'N' } : item));
        grid.dataSource = updatedData;
        // grid.refresh();
    };

    const checkBoxTemplate = (props: any) => {
        if (props.tolak === 'Y') {
            return <div className="text-center">❌</div>;
        }
        return (
            <input type="checkbox" name={props.uniqId} id={props.uniqId} className="form-checkbox text-dark" checked={props.pilih === 'Y'} onChange={(e) => handleCheckboxChange(e, props.uniqId)} />
        );

        // return <input type="checkbox" name={props.uniqId} id={props.uniqId} className="form-checkbox text-dark" checked={props.pilih} onChange={(e) => handleCheckboxChange(e, props.uniqId)} />;
    };

    // const editTemplateAlasanTolak = (args: any, idName: any) => {
    const editTemplateAlasanTolak = (event: any, uniqId: any) => {
        return (
            <div>
                <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                    <input
                        style={{ background: 'transparent' }}
                        id={'alasanTolak'}
                        name={'alasanTolak'}
                        defaultValue={event.alasan_tolak} // Set the initial value from the event
                        onBlur={(e) => {
                            // console.log('Current Value:', e.target.value);
                            // console.log('Updating item with uniqId:', uniqId);

                            const grid = tabs[selectedIndex].dataGrid;
                            const updatedData = (grid.dataSource as any[]).map(
                                (item: any) =>
                                    item.uniqId === uniqId
                                        ? { ...item, alasan_tolak: e.target.value } // Update the alasan_tolak value
                                        : item // Keep the other items unchanged
                            );

                            // console.log('Before Update:', grid.dataSource);
                            // Update the grid's data source
                            grid.dataSource = updatedData;
                            // console.log('After Update:', grid.dataSource);
                            grid.refresh(); // Refresh the grid to reflect changes
                        }}
                    />
                </div>
            </div>
        );
    };

    const editTemplateBeratPraPp = (event: any, uniqId: any) => {
        // console.log(uniqId);
        const inputString = uniqId;
        const UniqIdAwal = inputString.split('_')[0]; // Mengambil nilai awal
        // console.log(UniqIdAwal);
        const initialValue = event.berat_acc; // Simpan nilai awal
        return (
            <div>
                <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                    <input
                        style={{ background: 'transparent' }}
                        id={'beratAcc'}
                        name={'beratAcc'}
                        defaultValue={initialValue} // Set the initial value from the event
                        onBlur={(e) => {
                            const value: any = e.target.value;
                            let updatedData: any;
                            // Validate input to ensure it's a number
                            if (!isNaN(value) && value.trim() !== '') {
                                const grid = tabs[selectedIndex].dataGrid;

                                if (UniqIdAwal !== 't') {
                                    updatedData = (grid.dataSource as any[]).map(
                                        (item: any) =>
                                            item.uniqId === uniqId
                                                ? { ...item, berat_acc: parseFloat(value) } // Update the berat_acc value
                                                : item // Keep the other items unchanged
                                    );
                                } else if (UniqIdAwal === 't') {
                                    // console.log('masuk sini mas');
                                    updatedData = (grid.dataSource as any[]).map(
                                        (item: any) =>
                                            item.uniqId === uniqId
                                                ? { ...item, berat_acc: parseFloat(value), berat_sisa: parseFloat(value), berat_order: parseFloat(value) } // Update the berat_acc value
                                                : item // Keep the other items unchanged
                                    );
                                }

                                // console.log('xxxx', updatedData);
                                grid.dataSource = updatedData;
                                grid.refresh(); // Refresh the grid to reflect changes
                            } else {
                                // Kembalikan nilai sebelumnya jika input tidak valid
                                const grid = tabs[selectedIndex].dataGrid;
                                const updatedData = (grid.dataSource as any[]).map(
                                    (item: any) =>
                                        item.uniqId === uniqId
                                            ? { ...item, berat_acc: initialValue } // Kembalikan nilai sebelumnya
                                            : item // Keep the other items unchanged
                                );

                                grid.dataSource = updatedData;
                                grid.refresh(); // Refresh the grid untuk mencerminkan perubahan
                                alert('Please enter a valid number for Berat Pra PP. Returning to previous value.');
                            }
                        }}
                    />
                </div>
            </div>
        );
    };

    const editTemplateBeratSplit = (event: any, index: number, detailDok: any) => {
        const initialValue = detailDok[index].berat_split; // Store the initial value

        return (
            <div>
                <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                    <input
                        style={{ background: 'transparent' }}
                        id={'beratSplit'}
                        name={'beratSplit'}
                        defaultValue={initialValue} // Set the initial value from the event
                        onBlur={(e) => {
                            const newBeratSplit = parseFloat(e.target.value); // Get the new berat_split value

                            // Validate input to ensure it's a number
                            if (!isNaN(newBeratSplit) && newBeratSplit <= event.berat_acc) {
                                const grid = gridListData; // Ensure gridListData is correctly referenced
                                const updatedData = (grid.dataSource as any[]).map(
                                    (item: any, i: number) =>
                                        i === index
                                            ? { ...item, berat_split: newBeratSplit } // Update the berat_split value
                                            : item // Keep the other items unchanged
                                );

                                // Update the grid's data source and refresh
                                grid.dataSource = updatedData;
                                setDetailDok(updatedData); // Ensure detailDok is updated
                                grid.refresh(); // Refresh the grid to reflect changes
                            } else {
                                // If input is invalid, revert to initial value
                                const grid = gridListData;
                                const updatedData = (grid.dataSource as any[]).map(
                                    (item: any, i: number) =>
                                        i === index
                                            ? { ...item, berat_split: initialValue } // Revert to initial value
                                            : item // Keep the other items unchanged
                                );

                                grid.dataSource = updatedData;
                                grid.refresh(); // Refresh the grid to reflect changes
                                alert('Please enter a valid number for Berat Split. Returning to previous value.');
                            }
                        }}
                    />
                </div>
            </div>
        );
    };

    const closeModal = () => {
        setSelectedItem(null);
    };

    const tambahBrang = () => {
        setJenisDlgItem('tambah');
        setShowDialogBarang(true);
    };
    const tabs = [
        // Pre Order Cabang
        {
            id: 'preOrderCabang',
            name: 'Pre Order Cabang',
            endpoint: '/erp/pre_order_cabang',
            params: { entitas: sessionData?.kode_entitas ?? 'KOSONG' },
            dataGrid: dgPreOrder,
            content: (
                <div>
                    {/* <pre>{JSON.stringify(dataSource, null, 2)}</pre> */}

                    <div className="flex items-center justify-between bg-gray-200 p-2">
                        <div className="flex space-x-2">
                            <label>Pre Order Cabang</label>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                className="bg-red-500 px-4 py-2 text-white"
                                onClick={async () => {
                                    // console.log('tabs[selectedIndex].dataGrid', tabs[selectedIndex].dataGrid.dataSource);
                                    // console.log('tabs[selectedIndex].dataGrid', tabs[selectedIndex].dataGrid);

                                    await handleGenerateTolakData(tabs[selectedIndex].dataGrid, dgPraPp, kode_entitas, userid, token).then(async (result) => {
                                        // console.log('result', result);
                                        if (result) {
                                            await fetchDataBasedOnTabId(tabs[selectedIndex].id);
                                        }
                                    });
                                }}
                            >
                                Generate Tolak
                            </button>
                            <button
                                className="bg-green-500 px-4 py-2 text-white"
                                onClick={async () => {
                                    await exportToPusat(tabs[selectedIndex].dataGrid, dgPraPp, vtBreak, kode_entitas, userid, token).then(async (result) => {
                                        // console.log('result generate', result);
                                        if (result) {
                                            await fetchDataBasedOnTabId(tabs[selectedIndex].id);
                                        }
                                    });
                                }}
                            >
                                Generate
                            </button>
                        </div>
                    </div>

                    <div className="flex space-x-11">
                        <div className="mt-2 flex items-center space-x-2">
                            <input type="checkbox" className="cursor-pointer" checked={filterState.selectAll} onChange={(e) => handleSelectAll(e.target.checked)} />
                            <label>Pilih Semua</label>
                        </div>

                        <div className="mt-2 flex items-center space-x-2">
                            <label>Cari</label>
                            <div className="mt-1 flex justify-between">
                                <div className="container form-input">
                                    <TextBoxComponent
                                        placeholder="Entitas"
                                        name="edEntitas"
                                        showClearButton={true}
                                        input={async (args: any) => {
                                            const value: any = args.value;
                                            setSearchEntitas(args.value as string);
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="mt-1 flex justify-between">
                                <div className="container form-input">
                                    <TextBoxComponent
                                        placeholder="Bulan"
                                        name="edBulan"
                                        showClearButton={true}
                                        input={async (args: any) => {
                                            const value: any = args.value;
                                            setSearchBulan(args.value as string);
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="mt-1 flex justify-between">
                                <div className="container form-input">
                                    <TextBoxComponent
                                        placeholder="Nama Barang"
                                        name="edNamabarang"
                                        value={filterState.searchNamaBarang}
                                        showClearButton={true}
                                        input={async (args: any) => {
                                            const value: any = args.value;
                                            // setSearchNamaBarang(args.value as string);
                                            updateFilterState({ searchNamaBarang: args.value });
                                        }}
                                    />
                                </div>
                                <ButtonComponent
                                    id="buItem"
                                    name="buItem"
                                    type="button"
                                    cssClass="e-primary e-small e-round"
                                    iconCss="e-icons e-small e-search"
                                    onClick={() => {
                                        setJenisDlgItem('filter');
                                        setShowDialogBarang(true);
                                    }}
                                    style={{ marginTop: 5, marginLeft: -25, backgroundColor: '#3b3f5c' }}
                                />
                            </div>
                        </div>

                        <div className="mt-2 flex items-center space-x-2">
                            <button
                                className="bg-blue-500 px-4 py-2 text-white"
                                onClick={async () => {
                                    // console.log('tabs[selectedIndex].dataGrid', tabs[selectedIndex].dataGrid.dataSource);
                                    // console.log('tabs[selectedIndex].dataGrid', tabs[selectedIndex].dataGrid);
                                    tambahBrang();
                                }}
                            >
                                Tambah Barang 898
                            </button>
                            {/* <button className="bg-blue-500 px-4 py-2 text-white">Tambah Barang 898</button> */}
                        </div>
                    </div>

                    {/* END HEADER */}

                    <div className="grid min-h-screen grid-cols-12">
                        {/* batas 1 GRID dgPreOrder*/}
                        <div className="col-span-6">
                            <div className="mt-2 bg-gray-200 p-2">
                                <GridComponent
                                    id="dgPreOrder"
                                    // ref={(g: any) => (tabs[0].dataGrid = g)}
                                    // ref={(g: any) => (tabs[selectedIndex].dataGrid = g)}
                                    ref={gridRef}
                                    dataSource={search}
                                    height={501}
                                    allowResizing={true}
                                    autoFit={true}
                                    allowTextWrap={true}
                                    // editSettings={{ allowAdding: true, allowEditing: true, allowDeleting: true, newRowPosition: 'Bottom' }}
                                    editSettings={{ allowEditing: true }}
                                    textWrapSettings={{ wrapMode: 'Header' }}
                                    // selectionSettings={{ type: 'Multiple', checkboxOnly: true }}
                                    // searchSettings={{ fields: ['entitas', 'nama_bulan', 'diskripsi'], key: searchText }}
                                    // searchSettings={{
                                    //     fields: ['entitas', 'nama_bulan', 'diskripsi'],
                                    //     operator: 'and',
                                    //     key: '',
                                    //     ignoreCase: true,
                                    // }}
                                    query={gridQuery}
                                    pageSettings={{ pageSize: 25 }}
                                    allowPaging={true}
                                    allowSorting={true}
                                    selectionSettings={{
                                        type: 'Multiple',
                                        mode: 'Both',
                                        checkboxOnly: true,
                                        persistSelection: true,
                                    }}
                                    sortSettings={{ columns: [] }}
                                    // sortSettings={{ columns: [{ field: 'entitas', direction: 'Ascending' }] }}
                                    aggregates={[
                                        {
                                            columns: [
                                                {
                                                    type: 'Sum',
                                                    field: 'berat_order',
                                                    format: 'N2',
                                                    footerTemplate: (props: any) => {
                                                        return <div className="px-2 text-right">{props.Sum.toLocaleString('id-ID', { minimumFractionDigits: 2 })}</div>;
                                                    },
                                                },
                                                {
                                                    type: 'Sum',
                                                    field: 'berat_sisa',
                                                    format: 'N2',
                                                    footerTemplate: (props: any) => {
                                                        return <div className="px-2 text-right">{props.Sum.toLocaleString('id-ID', { minimumFractionDigits: 2 })}</div>;
                                                    },
                                                },
                                                {
                                                    type: 'Sum',
                                                    field: 'berat_acc',
                                                    format: 'N2',
                                                    footerTemplate: (props: any) => {
                                                        return <div className="px-2 text-right">{props.Sum.toLocaleString('id-ID', { minimumFractionDigits: 2 })}</div>;
                                                    },
                                                },
                                                {
                                                    type: 'Count',
                                                    field: 'diskripsi',
                                                    footerTemplate: (props: any) => {
                                                        return <div className="px-2 text-left">Records: {props.Count}</div>;
                                                    },
                                                },
                                            ],
                                        },
                                    ]}
                                >
                                    <ColumnsDirective>
                                        {/* <ColumnDirective field="uniqId" headerText="UniqId" width="200" /> */}
                                        <ColumnDirective
                                            field="pilih"
                                            headerText="Pilih"
                                            textAlign="Center"
                                            width="50"
                                            allowEditing={false}
                                            // template={() => <i className="fas fa-check"></i>}
                                            // allowSorting={false}
                                            template={checkBoxTemplate}
                                            // headerTemplate={HeaderCheckbox}
                                            // template={(props: any) => <input type="checkbox" checked={props.pilih} onChange={(e) => handleCheckboxChange(e.target.checked, props)} />}
                                        />
                                        {/* <ColumnDirective allowEditing={false} field="kode_preorder" headerTextAlign="Center" textAlign="Center" headerText="Entitas" width="50" /> */}

                                        <ColumnDirective allowEditing={false} field="entitas" headerTextAlign="Center" textAlign="Center" headerText="Entitas" width="50" />
                                        <ColumnDirective allowEditing={false} field="tgl_preorder" headerTextAlign="Center" textAlign="Center" headerText="Tgl. Pre Order" width="80" />
                                        <ColumnDirective allowEditing={false} field="nama_bulan" headerTextAlign="Center" textAlign="Center" headerText="Untuk Bulan" width="80" />
                                        <ColumnDirective allowEditing={false} field="no_item" headerTextAlign="Center" textAlign="Center" headerText="No. Barang" width="80" />
                                        <ColumnDirective allowEditing={false} field="diskripsi" headerTextAlign="Center" textAlign="Left" headerText="Nama Barang" width="200" />
                                        <ColumnDirective allowEditing={false} field="berat_order" headerTextAlign="Center" textAlign="Right" format="N2" headerText="Berat Order (Kg)" width="110" />
                                        <ColumnDirective allowEditing={false} field="berat_sisa" headerTextAlign="Center" textAlign="Right" format="N2" headerText="Berat Sisa (Kg)" width="110" />
                                        <ColumnDirective
                                            field="berat_acc"
                                            format="N2"
                                            headerTextAlign="Center"
                                            textAlign="Right"
                                            headerText="Berat Pra PP (Kg)"
                                            width="110"
                                            allowEditing={true}
                                            headerTemplate={() => <div className="h-full w-full bg-yellow-200 px-2 py-1 text-center">Berat Pra PP (Kg)</div>}
                                            template={(props: any) => (
                                                <div className="h-full w-full bg-green-500 px-2 py-1 text-right">{props.berat_acc.toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>
                                            )}
                                            editTemplate={(props: any) => editTemplateBeratPraPp(props, props.uniqId)}
                                        />
                                        <ColumnDirective
                                            field="alasan_order"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            headerText="Alasan Order"
                                            width="200"
                                            allowEditing={false}
                                            headerTemplate={() => <div className="h-full w-full bg-red-800 px-2 py-1 text-center text-white">Alasan Order</div>}
                                        />
                                        <ColumnDirective
                                            field="alasan_tolak"
                                            headerTextAlign="Center"
                                            textAlign="Left"
                                            headerText="Alasan Tolak"
                                            width="200"
                                            editType="stringedit" // Set the edit type to stringedit for text input
                                            allowEditing={true}
                                            editTemplate={(props: any) => editTemplateAlasanTolak(props, props.uniqId)}
                                        />
                                    </ColumnsDirective>
                                    <Inject services={[Page, Sort, Selection, Aggregate, Edit]} />
                                </GridComponent>
                                {/* <div className="mt-2">Record(s): 541</div> */}
                            </div>
                        </div>
                        {/* batas 2 TOMBOL TENGAH*/}
                        <div className="col-span-1 items-center justify-between">
                            <div className="bg-white-200 mt-20 p-1">
                                {/* <div className="mt-2 flex space-x-2"> */}
                                <div className="flex flex-col items-center space-y-2">
                                    <TooltipComponent content="Order Ke Pra PP" opensOn="Hover" openDelay={50} position="BottomCenter">
                                        <ButtonComponent
                                            id="buTransfer"
                                            type="button" //Solusi tdk refresh halaman saat selesai onClick
                                            cssClass="e-primary e-large"
                                            iconCss="e-icons e-large e-arrow-right"
                                            style={{
                                                // marginTop: 0 + 'em',
                                                // marginRight: 0.3 + 'em',
                                                backgroundColor: '#3b3f5c',
                                                width: '115px',
                                                height: '36px',
                                                fontSize: '10px',
                                                // width: '120px', // Adjust this width as needed
                                                // whiteSpace: 'normal',
                                                // height: 'auto',
                                                // minHeight: '50px',
                                            }}
                                            // onClick={() => handleOrderClick()}
                                            onClick={() => handleGridAction('order')}
                                        >
                                            Order Ke Pra PP
                                        </ButtonComponent>
                                    </TooltipComponent>
                                    <TooltipComponent content="Ditolak" opensOn="Hover" openDelay={50} position="BottomCenter">
                                        <ButtonComponent
                                            id="buTolak"
                                            type="button" //Solusi tdk refresh halaman saat selesai onClick
                                            cssClass="e-primary e-large"
                                            iconCss="e-icons e-large e-close"
                                            style={{
                                                // marginTop: 1 + 'em', marginRight: 0.3 + 'em',
                                                backgroundColor: '#3b3f5c',
                                                width: '115px',
                                                height: '36px',
                                                fontSize: '10px',
                                            }}
                                            // onClick={() => handleTolakData()}
                                            onClick={() => handleGridAction('tolak')}
                                        >
                                            Ditolak
                                        </ButtonComponent>
                                    </TooltipComponent>
                                    <TooltipComponent content="Reset Data" opensOn="Hover" openDelay={50} position="BottomCenter">
                                        <ButtonComponent
                                            id="buReset"
                                            type="button" //Solusi tdk refresh halaman saat selesai onClick
                                            cssClass="e-primary e-large"
                                            iconCss="e-icons e-large e-reset"
                                            style={{
                                                // marginTop: 1 + 'em', marginRight: 0.3 + 'em',
                                                backgroundColor: '#3b3f5c',
                                                width: '115px',
                                                height: '36px',
                                                fontSize: '10px',
                                            }}
                                            // onClick={() => handleResetData()}
                                            onClick={() => handleGridAction('reset')}
                                        >
                                            Reset Data
                                        </ButtonComponent>
                                    </TooltipComponent>
                                    <TooltipComponent content="Refresh All" opensOn="Hover" openDelay={50} position="BottomCenter">
                                        <ButtonComponent
                                            id="buRefreshAll"
                                            type="button" //Solusi tdk refresh halaman saat selesai onClick
                                            cssClass="e-primary e-large"
                                            iconCss="e-icons e-large e-refresh"
                                            style={{
                                                // marginTop: 1 + 'em', marginRight: 0.3 + 'em',
                                                backgroundColor: '#3b3f5c',
                                                width: '115px',
                                                height: '36px',
                                                fontSize: '10px',
                                            }}
                                            onClick={() => handleRefreshAll()}
                                        >
                                            Refresh All
                                        </ButtonComponent>
                                    </TooltipComponent>
                                    <TooltipComponent content="Kirim Tele" opensOn="Hover" openDelay={50} position="BottomCenter">
                                        <ButtonComponent
                                            id="buKirimTele"
                                            type="button" //Solusi tdk refresh halaman saat selesai onClick
                                            cssClass="e-primary e-large"
                                            iconCss="e-icons e-large e-refresh"
                                            style={{
                                                // marginTop: 1 + 'em', marginRight: 0.3 + 'em',
                                                backgroundColor: '#3b3f5c',
                                                width: '115px',
                                                height: '36px',
                                                fontSize: '10px',
                                            }}
                                            onClick={async () => await handleKirimTele(tabs[selectedIndex].dataGrid, token)}
                                        >
                                            Tes Telegram
                                        </ButtonComponent>
                                    </TooltipComponent>

                                    {/* <button className="flex items-center justify-between bg-gray-300 px-4 py-2">
                                            Refresh All
                                            <FontAwesomeIcon icon={faRedo} className="ml-2" style={{ width: '22px', height: '22px', cursor: 'pointer' }} />
                                        </button> */}
                                </div>
                                {/* </div> */}
                            </div>
                        </div>
                        {/* batas 3 GRID dgPraPP*/}
                        <div className="col-span-4">
                            <div className="mt-2 bg-gray-200 p-2">
                                <GridComponent
                                    id="dgPraPp"
                                    ref={(g: any) => (dgPraPp = g)}
                                    dataSource={search}
                                    height={501}
                                    allowResizing={true}
                                    autoFit={true}
                                    allowTextWrap={true}
                                    textWrapSettings={{ wrapMode: 'Header' }}
                                    pageSettings={{ pageSize: 25 }}
                                    selectionSettings={{
                                        type: 'Multiple',
                                        mode: 'Row',
                                        persistSelection: true, // Add this to maintain selection state
                                    }}
                                >
                                    <ColumnsDirective>
                                        <ColumnDirective field="no_item" headerTextAlign="Center" headerText="No. Barang" width="80" textAlign="Left" />
                                        <ColumnDirective field="diskripsi" headerTextAlign="Center" headerText="Nama Barang" width="200" textAlign="Left" />
                                        <ColumnDirective field="berat_order" headerTextAlign="Center" textAlign="Right" format="N2" headerText="Berat Order (Kg)" width="80" />
                                    </ColumnsDirective>
                                    <Inject services={[Page]} />
                                </GridComponent>
                            </div>
                        </div>
                        {/* batas 4 */}
                        <div className="col-span-1">
                            <div className="bg-white-200 mt-10 p-2">
                                <TooltipComponent content="Refresh All" opensOn="Hover" openDelay={50} position="BottomCenter">
                                    <ButtonComponent
                                        id="buHapus"
                                        type="button" //Solusi tdk refresh halaman saat selesai onClick
                                        cssClass="e-primary e-large"
                                        iconCss="e-icons e-large e-trash"
                                        style={{
                                            // marginTop: 1 + 'em', marginRight: 0.3 + 'em',
                                            backgroundColor: '#3b3f5c',
                                            width: '100px',
                                            height: '36px',
                                            fontSize: '10px',
                                        }}
                                        // onClick={() => handleHapusData()}
                                        onClick={() => handleGridAction('hapus')}
                                    >
                                        Hapus
                                    </ButtonComponent>
                                </TooltipComponent>
                                {/* <button className="mt-2 flex items-center justify-between bg-gray-300 px-4 py-2">
                                        Hapus
                                        <FontAwesomeIcon icon={faTrash} className="ml-2" style={{ width: '22px', height: '22px', cursor: 'pointer' }} />
                                    </button> */}
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        // Pra PP List
        {
            id: 'praPpList',
            name: 'Pra PP List',
            endpoint: '/erp/list_prapp',
            params: {
                entitas: filters.praPpList.entitas,
                param1: filters.praPpList.param1,
                param2: filters.praPpList.param2,
                param3: filters.praPpList.param3,
                param4: filters.praPpList.param4,
                param5: filters.praPpList.param5,
            },
            dataGrid: dgPraPPList,
            content: (
                <div>
                    {/* Content for Pra PP List */}

                    <div className="flex items-center justify-between bg-gray-200 p-2">
                        <div className="flex space-x-2">
                            <label>Pra PP List</label>
                        </div>

                        <div className="flex space-x-2">
                            <ButtonComponent
                                className="bg-red-500 px-4 py-2 text-white"
                                cssClass="e-primary"
                                onClick={() => {
                                    if (tabs[1].dataGrid) {
                                        praPpListHandlers.handleGroupingClick(tabs[1].dataGrid, token, kode_entitas, userid, filters, setIsLoadingPraPpList, setProgressValue);
                                    }
                                }}
                            >
                                Grouping
                            </ButtonComponent>
                            <ButtonComponent
                                className="bg-green-500 px-4 py-2 text-white"
                                cssClass="e-success"
                                onClick={async () => {
                                    await praPpListHandlers.handleApprovalClick(tabs[1].dataGrid, token, kode_entitas, userid, filters, setIsLoadingPraPpList, setProgressValue);
                                    setTimeout(() => {
                                        setDataHeaderDetailPrapp({ no_prapp: '', tgl_prapp: '' });
                                        setSelectedRow('');
                                        setSelectedItem(null);
                                        setDetailDok([]);
                                    }, 1000);
                                }}
                            >
                                Approval
                            </ButtonComponent>
                            <ButtonComponent
                                className="bg-green-500 px-4 py-2 text-white"
                                cssClass="e-success"
                                onClick={() => {
                                    setDetailPraPp('detailDok', selectedRow, kode_entitas, dataHeaderDetailPrapp, router, setSelectedItem, setDetailDok, token, 'detail pra pp');
                                }}
                            >
                                Detail Pra PP
                            </ButtonComponent>
                        </div>
                    </div>

                    <div className="grid grid-cols-12">
                        {/* panel */}

                        <div className="col-span-3 mt-1 bg-gray-100 p-4">
                            {/* <div className="filters"> */}
                            <h2 className="mb-2 font-bold">Filters</h2>

                            <div className="mb-1 block">
                                <div className="flex">
                                    <CheckBoxComponent
                                        label="No. Pra PP"
                                        checked={filterState.isNoPraPpListChecked}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            updateFilterState({ isNoPraPpListChecked: value });
                                        }}
                                        style={{ borderRadius: 3, borderColor: 'gray' }}
                                    />
                                </div>
                                <div className="mt-1 flex justify-between">
                                    <div className="container form-input">
                                        <TextBoxComponent placeholder="" value={filterState.noPraPpList} input={(args) => praPpListHandlers.handleNoInputChange(args.value)} />
                                    </div>
                                </div>
                                {/* <input type="text" className="w-full rounded border p-1" /> */}
                            </div>
                            <div className="mb-2">
                                <div className="mb-1 mt-2 block  justify-between">
                                    <CheckBoxComponent
                                        label="Tanggal Pra Pp"
                                        checked={filterState.isTanggalPraPpListChecked}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            updateFilterState({ isTanggalPraPpListChecked: value });
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
                                            value={moment(filterState.date1PraPpList).toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                praPpListHandlers.handleTgl(args.value, 'tanggalAwal', () => updateFilterState({ isTanggalPraPpListChecked: true }));
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
                                            value={moment(filterState.date2PraPpList).toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                praPpListHandlers.handleTgl(args.value, 'tanggalAkhir', () => updateFilterState({ isTanggalPraPpListChecked: true }));
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-2">
                                {/* <label className="mb-1 block">Nama Barang</label>
                                <input type="text" className="w-full rounded border p-1" /> */}
                                <div className="flex">
                                    <CheckBoxComponent
                                        label="Nama Barang"
                                        checked={filterState.isNamaBarangPraPpChecked}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            updateFilterState({ isNamaBarangPraPpChecked: value });
                                        }}
                                        style={{ borderRadius: 3, borderColor: 'gray' }}
                                    />
                                </div>
                                <div className="mt-1 flex justify-between">
                                    <div className="container form-input">
                                        <TextBoxComponent placeholder="" value={filterState.namaBarangPraPpList} input={(args) => praPpListHandlers.handleNamaBarangPraPpInputChange(args.value)} />
                                    </div>
                                </div>
                            </div>

                            <div className="mb-2">
                                <label className="mb-1 block">Sudah dialokasi PO Pusat</label>
                                <div className="flex items-center">
                                    <RadioButtonComponent
                                        label="Ya"
                                        name="rgLengkapY"
                                        value="Y"
                                        className="mr-1"
                                        checked={filterState.selectedOption === 'Y'}
                                        onChange={() => praPpListHandlers.handleOptionChange('Y')}
                                    />
                                    <RadioButtonComponent
                                        label="Tidak"
                                        name="rgLengkapN"
                                        value="N"
                                        className="ml-4 mr-1"
                                        checked={filterState.selectedOption === 'N'}
                                        onChange={() => praPpListHandlers.handleOptionChange('N')}
                                    />
                                    <RadioButtonComponent
                                        label="Semua"
                                        name="rgLengkapAll"
                                        value="all"
                                        className="ml-4 mr-1"
                                        checked={filterState.selectedOption === 'all'}
                                        onChange={() => praPpListHandlers.handleOptionChange('all')}
                                    />
                                </div>
                            </div>
                            <ButtonComponent
                                cssClass="e-primary"
                                onClick={() => handleRefreshList('praPpList', tabs[selectedIndex].dataGrid, apiUrl, token, filters, setIsLoadingPraPpList, setProgressValue)}
                            >
                                Refresh
                            </ButtonComponent>
                            {isLoadingPraPpList && (
                                <div className="mt-2">
                                    <ProgressBarComponent
                                        type="Linear"
                                        height="4"
                                        value={100}
                                        animation={{
                                            enable: true,
                                            duration: 2000,
                                            delay: 0,
                                        }}
                                    />
                                </div>
                            )}
                            <div className="mt-4">
                                <div className="mb-1 flex items-center">
                                    <div className="mr-2 h-4 w-4 bg-blue-500"></div>
                                    <span>Belum dialokasi PO Pusat</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="mr-2 h-4 w-4 bg-black"></div>
                                    <span>Sudah dialokasi PO Pusat</span>
                                </div>
                            </div>
                        </div>
                        {/* grid */}
                        <div className="table-container col-span-9 ml-1 mt-1">
                            <div className="w-full bg-white">
                                <div className="mb-2 flex items-center">
                                    <TextBoxComponent
                                        placeholder="Search..."
                                        cssClass="e-outline"
                                        showClearButton={true}
                                        //  value={searchQuery} input={onSearchChange}
                                        input={(args: any) => {
                                            if (tabs[selectedIndex].dataGrid) {
                                                tabs[selectedIndex].dataGrid.search(args.value);
                                            }
                                        }}
                                    />
                                </div>
                                <GridComponent
                                    id="dgPraPPList"
                                    // ref={(g: any) => (tabs[selectedIndex].dataGrid = g)}
                                    ref={gridRef}
                                    dataSource={search}
                                    height={501}
                                    allowResizing={true}
                                    autoFit={true}
                                    allowTextWrap={true}
                                    textWrapSettings={{ wrapMode: 'Header' }}
                                    allowPaging={true}
                                    allowSorting={true}
                                    // toolbar={['Search']}
                                    pageSettings={{ pageSize: 25 }}
                                    sortSettings={{ columns: [] }}
                                    searchSettings={{
                                        fields: ['tgl_prapp', 'no_prapp', 'no_item', 'diskripsi', 'keterangan'],
                                        operator: 'contains',
                                        // key: '',
                                        ignoreCase: true,
                                        // immediate: true,
                                    }}
                                    aggregates={[
                                        {
                                            columns: [
                                                {
                                                    type: 'Sum',
                                                    field: 'berat_order',
                                                    format: 'N2',
                                                    footerTemplate: (props: any) => {
                                                        return <div className="px-2 text-right">{props.Sum.toLocaleString('id-ID', { minimumFractionDigits: 2 })}</div>;
                                                    },
                                                },
                                                {
                                                    type: 'Count',
                                                    field: 'diskripsi',
                                                    footerTemplate: (props: any) => {
                                                        return <div className="px-2 text-left">Records: {props.Count}</div>;
                                                    },
                                                },
                                            ],
                                        },
                                    ]}
                                    rowSelected={(args) => HandleRowSelected(args, setSelectedRow)}
                                    rowSelecting={(args) => RowSelectingListData(args, setDataHeaderDetailPrapp, kode_entitas, setDetailDok, token, 'detail pra pp')}
                                >
                                    <ColumnsDirective>
                                        <ColumnDirective field="tgl_prapp" headerText="Tgl. Pra PP" width="80" textAlign="Center" />
                                        <ColumnDirective field="no_prapp" headerText="No. Pra PP" width="110" textAlign="Center" />
                                        <ColumnDirective field="no_item" headerText="No. Item" width="80" textAlign="Center" />
                                        <ColumnDirective field="diskripsi" headerTextAlign="Center" headerText="Diskripsi" width="210" textAlign="Left" />
                                        <ColumnDirective field="berat" headerTextAlign="Center" textAlign="Right" format="N2" headerText="Berat" width="80" />
                                        <ColumnDirective field="berat_order" headerTextAlign="Center" textAlign="Right" format="N2" headerText="Berat Order" width="110" />
                                        <ColumnDirective field="berat_sp" headerTextAlign="Center" textAlign="Right" format="N2" headerText="Berat PO" width="80" />
                                        <ColumnDirective field="pilih" headerText="Pilih" textAlign="Center" width="50" template={checkBoxTemplatePraPpList} />
                                        <ColumnDirective field="keterangan" headerText="Keterangan" width="300" textAlign="Center" />
                                    </ColumnsDirective>
                                    <Inject services={[Page, Toolbar, Filter, Sort, Search, Aggregate]} />
                                </GridComponent>
                            </div>
                        </div>
                    </div>

                    {selectedItem && (
                        <Draggable>
                            <div className={`${styles.modalDetailDragable}`} style={modalPosition}>
                                <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                                    <div className="flex items-center justify-between bg-gray-200 p-2">
                                        <div className="flex items-center">
                                            <i className="fas fa-h mr-2 text-2xl text-red-600"></i>
                                            <span className="font-bold">
                                                Detail Pra PP : {dataHeaderDetailPrapp.no_prapp} - {dataHeaderDetailPrapp.tgl_prapp}
                                            </span>
                                        </div>
                                        {/* <button className="rounded bg-green-500 px-2 py-1 text-white">Split Pra PP</button> */}
                                        <ButtonComponent
                                            className="bg-green-500 px-4 py-2 text-white"
                                            cssClass="e-success"
                                            onClick={async () => {
                                                await handleSplitClick(selectedRow, detailDok, kode_entitas, userid, dataHeaderDetailPrapp.no_prapp, token).then(async (result: any) => {
                                                    if (result) {
                                                        closeModal();
                                                        setTimeout(async () => {
                                                            await handleRefreshList('praPpList', tabs[1].dataGrid, apiUrl, token, filters, setIsLoadingPraPpList, setProgressValue);
                                                        }, 500);
                                                    }
                                                });
                                            }}
                                        >
                                            Split Pra PP
                                        </ButtonComponent>
                                    </div>
                                    <div className="overflow-auto" style={{ maxHeight: '300px' }} onMouseDown={(e) => e.stopPropagation()}>
                                        <GridComponent
                                            dataSource={detailDok}
                                            height={'75%'}
                                            width={'100%'}
                                            gridLines={'Both'}
                                            allowResizing={true}
                                            allowSorting={true}
                                            editSettings={{ allowEditing: true }}
                                            autoFit={true}
                                            ref={(g) => (gridListData = g)}
                                            rowSelected={(args) => HandleRowSelected(args, setSelectedRow)}

                                            // rowSelecting={(args) => RowSelectingListData(args, setDataHeaderDetailPrapp, kode_entitas, setDetailDok, token, 'detail pra pp')}
                                        >
                                            <ColumnsDirective>
                                                <ColumnDirective field="entitas" headerText="Entitas" width="50" textAlign="Center" headerTextAlign="Center" />
                                                <ColumnDirective field="tgl_preorder" headerText="Tgl. Preorder" width="80" textAlign="Left" headerTextAlign="Left" />
                                                <ColumnDirective field="nama_bulan" headerText="Untuk Bulan" width="80" textAlign="Center" headerTextAlign="Center" />
                                                <ColumnDirective field="no_item" headerText="No. Barang" width="80" textAlign="Center" headerTextAlign="Center" />
                                                <ColumnDirective field="nama_item" headerText="Diskripsi" width="200" textAlign="Left" headerTextAlign="Center" />
                                                <ColumnDirective
                                                    allowEditing={false}
                                                    field="berat_order"
                                                    headerText="Berat Order"
                                                    format="N2"
                                                    width="80"
                                                    textAlign="Right"
                                                    headerTextAlign="Center"
                                                    template={(props: any) => <div>{props.berat_order.toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>}
                                                />
                                                <ColumnDirective
                                                    allowEditing={false}
                                                    field="berat_sisa"
                                                    format="N2"
                                                    headerText="Berat Sisa"
                                                    width="80"
                                                    textAlign="Right"
                                                    headerTextAlign="Center"
                                                    template={(props: any) => <div>{props.berat_sisa.toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>}
                                                />
                                                <ColumnDirective
                                                    allowEditing={false}
                                                    field="berat_acc"
                                                    format="N2"
                                                    headerText="Berat Acc"
                                                    width="80"
                                                    textAlign="Right"
                                                    headerTextAlign="Center"
                                                    template={(props: any) => <div>{props.berat_acc.toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>}
                                                />
                                                <ColumnDirective allowEditing={false} field="berat_fdo" format="N2" headerText="Berat FDO" width="80" textAlign="Right" headerTextAlign="Center" />
                                                <ColumnDirective
                                                    allowEditing={false}
                                                    field="berat_ost"
                                                    // format="N0"
                                                    headerText="Berat Ost FDO"
                                                    width="80"
                                                    textAlign="Right"
                                                    headerTextAlign="Center"
                                                    template={(props: any) => <div>{props.berat_ost.toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>}
                                                />
                                                <ColumnDirective
                                                    allowEditing={true}
                                                    field="berat_split"
                                                    format="N2"
                                                    // headerText="Berat Split"
                                                    width="80"
                                                    textAlign="Right"
                                                    headerTextAlign="Center"
                                                    headerTemplate={() => <div className="h-full w-full bg-yellow-200 px-2 py-1 text-center">Berat Split</div>}
                                                    template={(props: any) => (
                                                        <div className="h-full w-full bg-green-500 px-2 py-1 text-right">{props.berat_split.toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>
                                                    )}
                                                    editTemplate={(props: any) => editTemplateBeratSplit(props, props.index, detailDok)}
                                                />
                                            </ColumnsDirective>

                                            <Inject services={[Page, Sort, Filter, Group, Edit]} />
                                        </GridComponent>
                                    </div>
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
            ),
        },
        // Pra PP Approved
        {
            id: 'praPpApproved',
            endPoint: '/erp/list_prapp_app',
            name: 'Pra PP Approved',
            params: {
                entitas: filters.praPpAppList.entitas,
                param1: filters.praPpAppList.param1,
                param2: filters.praPpAppList.param2,
                param3: filters.praPpAppList.param3,
                param4: filters.praPpAppList.param4,
                param5: filters.praPpAppList.param5,
            },
            dataGrid: dgPraPPApp,
            content: (
                <div>
                    {/* Content for Pra PP Approved */}
                    <div className="flex items-center justify-between bg-gray-200 p-2">
                        <div className="flex space-x-2">
                            <label>Pra PP Approved</label>
                        </div>
                        <div className="flex space-x-2">
                            {/* <button className="bg-red-500 px-4 py-2 text-white">Batal OTD FDO</button> */}
                            <ButtonComponent
                                className="bg-red-500 px-4 py-2 text-white"
                                cssClass="e-success"
                                onClick={async () => {
                                    await cancelOutstanding(tabs[2].dataGrid, selectedRow, token, kode_entitas, userid, filters, setIsLoadingPraPpAppList, setProgressValue);
                                    setTimeout(() => {
                                        setDataHeaderDetailPrapp({ no_prapp: '', tgl_prapp: '' });
                                        setSelectedRow('');
                                        setSelectedItem(null);
                                        setDetailDok([]);
                                    }, 1000);
                                }}
                            >
                                Batal OTD FDO
                            </ButtonComponent>
                            {/* <button className="bg-green-500 px-4 py-2 text-white">Detail Pra PP</button> */}
                            <ButtonComponent
                                className="bg-green-500 px-4 py-2 text-white"
                                cssClass="e-success"
                                onClick={() => {
                                    // console.log('batal OTD');
                                    setDetailPraPp('detailDok', selectedRow, kode_entitas, dataHeaderDetailPrapp, router, setSelectedItem, setDetailDok, token, 'detail approved');
                                }}
                            >
                                Detail Pra PP
                            </ButtonComponent>
                        </div>
                    </div>
                    <div className="grid grid-cols-12">
                        {/* panel */}
                        <div className="col-span-3 mt-1 bg-gray-100 p-4">
                            {/* <div className="filters"> */}
                            <h2 className="mb-2 font-bold">Filters</h2>

                            <div className="mb-1 block">
                                <div className="flex">
                                    <CheckBoxComponent
                                        label="No. Pra PP"
                                        checked={filterState.isNoPraPpListAppChecked}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            updateFilterState({ isNoPraPpListAppChecked: value });
                                        }}
                                        style={{ borderRadius: 3, borderColor: 'gray' }}
                                    />
                                </div>
                                <div className="mt-1 flex justify-between">
                                    <div className="container form-input">
                                        <TextBoxComponent placeholder="" value={filterState.noPraPpAppList} input={(args) => updateFilterState({ noPraPpAppList: args.value })} />
                                    </div>
                                </div>
                                {/* <input type="text" className="w-full rounded border p-1" /> */}
                            </div>
                            <div className="mb-2">
                                <div className="mb-1 mt-2 block  justify-between">
                                    <CheckBoxComponent
                                        label="Tanggal Pra Pp"
                                        checked={filterState.isTanggalPraPpListAppChecked}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            updateFilterState({ isTanggalPraPpListAppChecked: value });
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
                                            value={moment(filterState.date1PraPpAppList).toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                if (args.value) {
                                                    updateFilterState({
                                                        date1PraPpAppList: moment(args.value),
                                                        isTanggalPraPpListAppChecked: true,
                                                    });
                                                }
                                            }}
                                            style={{ borderRadius: 3, borderColor: 'gray' }}
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
                                            value={moment(filterState.date2PraPpAppList).toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                if (args.value) {
                                                    updateFilterState({
                                                        date2PraPpAppList: moment(args.value),
                                                        isTanggalPraPpListAppChecked: true,
                                                    });
                                                }
                                            }}
                                            style={{ borderRadius: 3, borderColor: 'gray' }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-2">
                                <div className="flex">
                                    <CheckBoxComponent
                                        label="Nama Barang"
                                        checked={filterState.isNamaBarangPraPpAppChecked}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            updateFilterState({ isNamaBarangPraPpAppChecked: value });
                                        }}
                                        style={{ borderRadius: 3, borderColor: 'gray' }}
                                    />
                                </div>
                                <div className="mt-1 flex justify-between">
                                    <div className="container form-input">
                                        <TextBoxComponent placeholder="" value={filterState.namaBarangPraPpAppList} input={(args) => updateFilterState({ namaBarangPraPpAppList: args.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="mb-2">
                                <label className="mb-1 block">Pra PP Approved Outstanding</label>
                                <div className="flex items-center">
                                    <RadioButtonComponent
                                        label="Ya"
                                        name="rgOtdY"
                                        value="Y"
                                        className="mr-1"
                                        checked={filterState.selectedOptionApp === 'Y'}
                                        onChange={() => updateFilterState({ selectedOptionApp: 'Y' })}
                                    />
                                    <RadioButtonComponent
                                        label="Tidak"
                                        name="rgOtdN"
                                        value="N"
                                        className="ml-4 mr-1"
                                        checked={filterState.selectedOptionApp === 'N'}
                                        onChange={() => updateFilterState({ selectedOptionApp: 'N' })}
                                    />
                                    <RadioButtonComponent
                                        label="Semua"
                                        name="rgOtdAll"
                                        value="all"
                                        className="ml-4 mr-1"
                                        checked={filterState.selectedOptionApp === 'all'}
                                        onChange={() => updateFilterState({ selectedOptionApp: 'all' })}
                                    />
                                </div>
                            </div>
                            <ButtonComponent
                                cssClass="e-primary"
                                onClick={() => handleRefreshList('praPpAppList', tabs[selectedIndex].dataGrid, apiUrl, token, filters, setIsLoadingPraPpAppList, setProgressValue)}
                            >
                                Refresh
                            </ButtonComponent>
                            <div className="mt-4">
                                <div className="mb-1 flex items-center">
                                    <div className="mr-2 h-4 w-4 bg-blue-500"></div>
                                    <span>Belum dialokasi PO Pusat</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="mr-2 h-4 w-4 bg-black"></div>
                                    <span>Sudah dialokasi PO Pusat</span>
                                </div>
                            </div>
                        </div>
                        {/* grid */}
                        <div className="table-container col-span-9 ml-1 mt-1">
                            <div className="w-full bg-white">
                                <div className="mb-2 flex items-center">
                                    <TextBoxComponent
                                        placeholder="Search..."
                                        cssClass="e-outline"
                                        showClearButton={true}
                                        //  value={searchQuery} input={onSearchChange}
                                        input={(args: any) => {
                                            if (tabs[selectedIndex].dataGrid) {
                                                tabs[selectedIndex].dataGrid.search(args.value);
                                            }
                                        }}
                                    />
                                </div>
                                <GridComponent
                                    id="dgPraPPApp"
                                    // ref={(g: any) => (tabs[selectedIndex].dataGrid = g)}
                                    ref={gridRef}
                                    dataSource={search}
                                    height={501}
                                    allowResizing={true}
                                    autoFit={true}
                                    allowTextWrap={true}
                                    textWrapSettings={{ wrapMode: 'Header' }}
                                    allowPaging={true}
                                    allowSorting={true}
                                    // toolbar={['Search']}
                                    pageSettings={{ pageSize: 25 }}
                                    searchSettings={{
                                        fields: ['tgl_prapp', 'no_prapp', 'no_item', 'diskripsi', 'app', 'tgl_app', 'no_pp'],
                                        operator: 'contains',
                                        key: '',
                                        ignoreCase: true,
                                    }}
                                    rowSelected={(args) => HandleRowSelected(args, setSelectedRow)}
                                    rowSelecting={(args) => RowSelectingListData(args, setDataHeaderDetailPrapp, kode_entitas, setDetailDok, token, 'detail approved')}
                                >
                                    <ColumnsDirective>
                                        <ColumnDirective field="tgl_prapp" headerTextAlign="Center" headerText="Tgl. Pra PP" width="100" textAlign="Center" />
                                        <ColumnDirective field="no_prapp" headerTextAlign="Center" headerText="No. Pra PP" width="150" textAlign="Center" />
                                        <ColumnDirective field="no_item" headerTextAlign="Center" headerText="No. Item" width="100" textAlign="Left" />
                                        <ColumnDirective field="diskripsi" headerTextAlign="Center" headerText="Diskripsi" width="200" textAlign="Left" />
                                        <ColumnDirective field="berat" headerTextAlign="Center" headerText="Berat" width="100" format="N2" textAlign="Right" />
                                        <ColumnDirective field="berat_order" headerTextAlign="Center" headerText="Berat Order" format="N2" width="150" textAlign="Right" />
                                        <ColumnDirective field="berat_sp" headerTextAlign="Center" headerText="Berat PO" format="N2" width="150" textAlign="Right" />
                                        <ColumnDirective field="berat_fdo" headerTextAlign="Center" headerText="Berat FDO" format="N2" width="150" textAlign="Right" />
                                        <ColumnDirective field="app" headerTextAlign="Center" headerText="Approve" width="100" textAlign="Left" />
                                        <ColumnDirective field="tgl_app" headerTextAlign="Center" headerText="Tgl. Approve" width="100" textAlign="Left" />
                                        <ColumnDirective field="no_pp" headerTextAlign="Center" headerText="No. PP" width="100" textAlign="Left" />
                                    </ColumnsDirective>
                                    <Inject services={[Page, Toolbar, Filter, Sort, Search]} />
                                </GridComponent>
                            </div>
                        </div>
                    </div>
                    {/* <div className="rounded-b-lg bg-gray-300 p-2 text-right">
                        <span>41,136.00</span>
                    </div> */}
                    {selectedItem && (
                        <Draggable>
                            <div className={`${styles.modalDetailDragable}`} style={modalPosition}>
                                <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                                    <div style={{ marginBottom: 21 }}>
                                        <span style={{ fontSize: 18, fontWeight: 500 }}>
                                            Detail Pra PP : {dataHeaderDetailPrapp.no_prapp} - {dataHeaderDetailPrapp.tgl_prapp}
                                        </span>
                                    </div>
                                    {/* <div className="flex items-center justify-between bg-gray-200 p-2">
                                        <div className="flex items-center">
                                            <i className="fas fa-h mr-2 text-2xl text-red-600"></i>
                                            <span className="font-bold">
                                                Detail Pra PP : {dataHeaderDetailPrapp.no_prapp} - {dataHeaderDetailPrapp.tgl_prapp}
                                            </span>
                                        </div>
                                        <button className="rounded bg-green-500 px-2 py-1 text-white">Split Pra PP</button>
                                    </div> */}
                                    <GridComponent dataSource={detailDok} height={'75%'} width={'100%'} gridLines={'Both'} allowResizing={true} allowSorting={true} ref={(g) => (gridListData = g)}>
                                        <ColumnsDirective>
                                            <ColumnDirective field="entitas" headerText="Entitas" width="15" textAlign="Center" headerTextAlign="Center" />
                                            <ColumnDirective field="tgl_preorder" headerText="Tgl. Preorder" width="40" textAlign="Left" headerTextAlign="Left" />
                                            <ColumnDirective field="nama_bulan" headerText="Untuk Bulan" width="30" textAlign="Center" headerTextAlign="Center" />
                                            <ColumnDirective field="no_item" headerText="No. Barang" width="30" textAlign="Center" headerTextAlign="Center" />
                                            <ColumnDirective field="nama_item" headerText="Diskripsi" width="50" textAlign="Left" headerTextAlign="Center" />
                                            <ColumnDirective
                                                field="berat_order"
                                                headerText="Berat Order"
                                                format="N2"
                                                width="30"
                                                textAlign="Right"
                                                headerTextAlign="Center"
                                                template={(props: any) => <div>{props.berat_order.toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>}
                                            />
                                            <ColumnDirective
                                                field="berat_sisa"
                                                format="N2"
                                                headerText="Berat Sisa"
                                                width="30"
                                                textAlign="Right"
                                                headerTextAlign="Center"
                                                template={(props: any) => <div>{props.berat_sisa.toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>}
                                            />
                                            <ColumnDirective
                                                field="berat_acc"
                                                format="N2"
                                                headerText="Berat Acc"
                                                width="30"
                                                textAlign="Right"
                                                headerTextAlign="Center"
                                                template={(props: any) => <div>{props.berat_acc.toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>}
                                            />
                                            <ColumnDirective field="berat_fdo" format="N2" headerText="Berat FDO" width="30" textAlign="Right" headerTextAlign="Center" />
                                            <ColumnDirective
                                                field="berat_ost"
                                                // format="N0"
                                                headerText="Berat Ost FDO"
                                                width="30"
                                                textAlign="Right"
                                                headerTextAlign="Center"
                                                template={(props: any) => <div>{props.berat_ost.toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>}
                                            />
                                            <ColumnDirective field="catatan" headerText="catatan" width="50" textAlign="Left" headerTextAlign="Center" />
                                        </ColumnsDirective>

                                        <Inject services={[Page, Sort, Filter, Group]} />
                                    </GridComponent>
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
            ),
        },
        // Penolakan Pre Order
        {
            id: 'penolakanPreOrder',
            endPoint: '/erp/list_preorder_prapp',
            name: 'Penolakan Pre Order',
            params: {
                entitas: filters.praPpTolakList.entitas,
                param1: filters.praPpTolakList.param1,
                param2: filters.praPpTolakList.param2,
                param3: filters.praPpTolakList.param3,
                param4: filters.praPpTolakList.param4,
                param5: filters.praPpTolakList.param5,
                param6: filters.praPpTolakList.param6,
            },
            dataGrid: dgTolakPreOrder,
            content: (
                <div>
                    {/* Content for Pra PP Approved */}
                    <div className="flex items-center justify-between bg-gray-200 p-2">
                        <div className="flex space-x-2">
                            <label>Penolakan Pre Order</label>
                        </div>
                    </div>
                    <div className="grid grid-cols-12">
                        {/* panel */}
                        <div className="col-span-3 mt-1 bg-gray-100 p-4">
                            {/* <div className="filters"> */}
                            <h2 className="mb-2 font-bold">Filters</h2>
                            <div className="mb-1 block">
                                <div className="flex">
                                    <CheckBoxComponent
                                        label="No. Pre Order"
                                        checked={filterState.isNoTolakChecked}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            updateFilterState({ isNoTolakChecked: value });
                                        }}
                                        style={{ borderRadius: 3, borderColor: 'gray' }}
                                    />
                                </div>
                                <div className="mt-1 flex justify-between">
                                    <div className="container form-input">
                                        <TextBoxComponent placeholder="" value={filterState.noTolakList} input={(args) => updateFilterState({ noTolakList: args.value })} />
                                    </div>
                                </div>
                            </div>
                            <div className="mb-2">
                                <div className="mb-1 mt-2 block  justify-between">
                                    <CheckBoxComponent
                                        label="Tanggal Tolak"
                                        checked={filterState.isTanggalTolakChecked}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            updateFilterState({ isTanggalTolakChecked: value });
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
                                            value={moment(filterState.date1TolakList).toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                if (args.value) {
                                                    updateFilterState({
                                                        date1TolakList: moment(args.value),
                                                        isTanggalTolakChecked: true,
                                                    });
                                                }
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
                                            value={moment(filterState.date2TolakList).toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                if (args.value) {
                                                    updateFilterState({
                                                        date2TolakList: moment(args.value),
                                                        isTanggalTolakChecked: true,
                                                    });
                                                }
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-2">
                                <div className="mb-1 mt-2 block  justify-between">
                                    <CheckBoxComponent
                                        label="Tanggal Pre Order"
                                        checked={filterState.isTanggalPreOrderTolakChecked}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            updateFilterState({ isTanggalPreOrderTolakChecked: value });
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
                                            value={moment(filterState.date1PreOrderTolakList).toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                if (args.value) {
                                                    updateFilterState({
                                                        date1PreOrderTolakList: moment(args.value),
                                                        isTanggalPreOrderTolakChecked: true,
                                                    });
                                                }
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
                                            value={moment(filterState.date2PreOrderTolakList).toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                if (args.value) {
                                                    updateFilterState({
                                                        date2PreOrderTolakList: moment(args.value),
                                                        isTanggalPreOrderTolakChecked: true,
                                                    });
                                                }
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-2">
                                <div className="flex">
                                    <CheckBoxComponent
                                        label="Nama Barang"
                                        checked={filterState.isNamaBarangTolakChecked}
                                        change={(args: ChangeEventArgsButton) => {
                                            const value: any = args.checked;
                                            updateFilterState({ isNamaBarangTolakChecked: value });
                                        }}
                                        style={{ borderRadius: 3, borderColor: 'gray' }}
                                    />
                                </div>
                                <div className="mt-1 flex justify-between">
                                    <div className="container form-input">
                                        <TextBoxComponent placeholder="" value={filterState.namaBarangTolakList} input={(args) => updateFilterState({ namaBarangTolakList: args.value })} />
                                    </div>
                                </div>
                            </div>

                            <ButtonComponent
                                cssClass="e-primary"
                                onClick={() => handleRefreshList('tolakList', tabs[selectedIndex].dataGrid, apiUrl, token, filters, setIsLoadingTolakList, setProgressValue)}
                            >
                                Refresh
                            </ButtonComponent>
                        </div>
                        {/* grid */}
                        <div className="table-container col-span-9 ml-1 mt-1">
                            <div className="w-full bg-white">
                                <div className="mb-2 flex items-center">
                                    <TextBoxComponent
                                        placeholder="Search..."
                                        cssClass="e-outline"
                                        showClearButton={true}
                                        //  value={searchQuery} input={onSearchChange}
                                        input={(args: any) => {
                                            if (tabs[selectedIndex].dataGrid) {
                                                tabs[selectedIndex].dataGrid.search(args.value);
                                            }
                                        }}
                                    />
                                </div>
                                <GridComponent
                                    id="dgTolakPreOrder"
                                    // ref={(g: any) => (tabs[selectedIndex].dataGrid = g)}
                                    ref={gridRef}
                                    dataSource={search}
                                    height={501}
                                    allowResizing={true}
                                    autoFit={true}
                                    allowTextWrap={true}
                                    textWrapSettings={{ wrapMode: 'Header' }}
                                    allowPaging={true}
                                    allowSorting={true}
                                    // toolbar={['Search']}
                                    pageSettings={{ pageSize: 25 }}
                                    searchSettings={{
                                        fields: ['entitas', 'tgl_update_tolak', 'tgl_preorder', 'no_preorder', 'no_item', 'diskripsi', 'tolak', 'alasan_tolak'],
                                        operator: 'contains',
                                        ignoreCase: true,
                                    }}
                                >
                                    <ColumnsDirective>
                                        <ColumnDirective field="entitas" headerTextAlign="Center" headerText="Entitas" width="50" textAlign="Left" />
                                        <ColumnDirective field="tgl_update_tolak" headerTextAlign="Center" headerText="Tgl. Tolak" width="100" textAlign="Left" />
                                        <ColumnDirective field="tgl_preorder" headerTextAlign="Center" headerText="Tgl. Pre Order" width="100" textAlign="Left" />
                                        <ColumnDirective field="no_preorder" headerTextAlign="Center" headerText="No. Pre Order" width="110" textAlign="Left" />
                                        <ColumnDirective field="no_item" headerTextAlign="Center" headerText="No. Item" width="100" textAlign="Left" />
                                        <ColumnDirective field="diskripsi" headerTextAlign="Center" headerText="Diskripsi" width="200" textAlign="Left" />
                                        <ColumnDirective field="berat" headerTextAlign="Center" headerText="Berat" format="N2" width="80" textAlign="Right" />
                                        <ColumnDirective field="berat_order" headerTextAlign="Center" headerText="Berat Order" format="N2" width="80" textAlign="Right" />
                                        <ColumnDirective field="berat_sisa" headerTextAlign="Center" headerText="Berat Sisa" format="N2" width="80" textAlign="Right" />
                                        <ColumnDirective field="tolak" headerTextAlign="Center" headerText="Tolak" width="50" textAlign="Center" />
                                        <ColumnDirective field="alasan_tolak" headerTextAlign="Center" headerText="Alasan Tolak" width="500" textAlign="Left" />
                                    </ColumnsDirective>
                                    <Inject services={[Page, Toolbar, Filter, Sort, Search]} />
                                </GridComponent>
                            </div>
                        </div>
                    </div>
                    {/* <div className="rounded-b-lg bg-gray-300 p-2 text-right">
                        <span>41,136.00</span>
                    </div> */}
                </div>
            ),
        },
    ];

    const validateEntitas = async () => {
        if (sessionData?.kode_entitas === '899' || sessionData?.kode_entitas === '698') {
            return true;
        }

        return false;
    };

    const fetchDataBasedOnTabId = async (tabId?: string) => {
        if (!kode_entitas) {
            return;
        }
        if (await validateEntitas()) {
            // console.log('fetchDataBasedOnTabId', tabId);
            const tab = tabs.find(({ id }) => id === tabId || 'preOrderCabang');
            if (!tab) {
                console.error(`No configuration found for tab: ${tabId}`);
                return; // Exit if tab configuration is not found
            }

            // const currentGrid = tabs[selectedIndex].dataGrid;
            // console.log('currentGrid', currentGrid);
            // console.log('tabs', tabs[selectedIndex]);
            // setIsLoadingTabData(true);
            // setProgressValue(0);
            let interval: any;
            try {
                const response = await axios.get(`${apiUrl}${tabs[selectedIndex].endpoint}`, {
                    params: tabs[selectedIndex].params,
                    headers: { Authorization: `Bearer ${token}` }, // Include authorization header
                });
                const resultFetchDataBasedOnTabId = response.data.data;

                if (tabId === 'preOrderCabang' || tabId === 'praPpList') {
                    // console.log('masuk sini', tabId);
                    const initializedData = await resultFetchDataBasedOnTabId.map((item: any) => ({
                        ...item,
                        tgl_preorder: item.tgl_preorder === null ? '' : moment(item.tgl_preorder).format('DD-MM-YYYY'),
                        tgl_prapp: item.tgl_prapp === null ? '' : moment(item.tgl_prapp).format('DD-MM-YYYY'),
                        uniqId: tabId === 'preOrderCabang' ? `${item.kode_preorder}_${item.entitas}_${item.no_item}` : `${item.kode_prapp}_${item.entitas}_${item.no_item}`,
                        pilih: 'N', //false,
                    }));
                    // console.log('initializedData', initializedData);
                    tabs[selectedIndex].dataGrid.dataSource = initializedData; //resultFetchDataBasedOnTabId;
                } else {
                    // console.log('masuk sini 2');
                    const initializedData = await resultFetchDataBasedOnTabId.map((item: any) => ({
                        ...item,
                        tgl_prapp: item.tgl_prapp === null ? '' : moment(item.tgl_prapp).format('DD-MM-YYYY'),
                        tgl_update_tolak: item.tgl_update_tolak === null ? '' : moment(item.tgl_update_tolak).format('DD-MM-YYYY'),
                        tgl_app: item.tgl_app === null ? '' : moment(item.tgl_app).format('DD-MM-YYYY HH:MM:ss'),
                        tgl_preorder: item.tgl_preorder === null ? '' : moment(item.tgl_preorder).format('DD-MM-YYYY'),
                        uniqId: tabId === 'preOrderCabang' ? `${item.kode_preorder}_${item.entitas}_${item.no_item}` : `${item.kode_prapp}_${item.entitas}_${item.no_item}`,
                        pilih: 'N', //false,
                    }));

                    // console.log('initializedData', initializedData);

                    tabs[selectedIndex].dataGrid.dataSource = initializedData; //resultFetchDataBasedOnTabId;
                    // tabs[selectedIndex].dataGrid.refresh();
                }
                tabs[selectedIndex].dataGrid.refresh();
                // console.log('masuk refresh');
            } catch (error: any) {
                console.error('Error fetchDataBasedOnTabId fetching data :', error);
            }
            // return;
        } else {
            // console.log('kode_entitas', kode_entitas);
            myAlertGlobal2('hanya digunakan untuk Entitas 898', 'frmPraPp');
        }
    };

    const fetchDataBarang = async () => {
        try {
            const response = await axios.get(`${apiUrl}/erp/item_dlg_pre_order_cabang`, {
                params: {
                    entitas: kode_entitas,
                },
                headers: { Authorization: `Bearer ${token}` },
            });

            const resultFetchDataBarang = response.data.data;
            // console.log('resultFetchDataBarang', resultFetchDataBarang);
            dgDlgBarang.dataSource = resultFetchDataBarang;
            // setListItem(resultFetchDataBarang);
        } catch (error: any) {
            console.error('Error fetching data:', error);
        }
    };

    const handleGridAction = (action: 'tolak' | 'order' | 'reset' | 'hapus') => {
        const currentGrid = tabs[selectedIndex].dataGrid;

        const actions = {
            tolak: () => handleTolakData(currentGrid),
            order: () => {
                const selectedDataCheckedBreak = (currentGrid.dataSource as any[]).filter((item: any) => item.pilih === 'Y' && item.tolak === 'N');
                handleOrderKePraPP(currentGrid, dgPraPp);
                vtBreak = [...vtBreak, ...selectedDataCheckedBreak];
                // console.log('vtBreak order ', vtBreak);
            },
            reset: async () => await handleResetData(currentGrid, dgPraPp, 'manual'),
            hapus: async () => {
                // console.log('vtBreak sebelum hapus ', vtBreak);
                const selectedIndexes = dgPraPp.getSelectedRowIndexes();
                const currentData = dgPraPp.dataSource as any[];
                const selectedRecords = selectedIndexes.map((index: number) => currentData[index]);

                handleHapusData(currentGrid, dgPraPp);
                // vtBreak = await handleHapusData(currentGrid, dgPraPp, vtBreak);
                const vtBreakData = vtBreak || [];
                const updatedVtBreak = vtBreakData.filter((item: any) => !selectedRecords.some((selected: any) => selected.no_item === item.no_item));
                vtBreak = updatedVtBreak;
                // console.log('vtBreak setelah hapus', vtBreak);
                // dgPraPp.refresh();
            },
        };

        return actions[action]();
    };

    const handleRefreshAll = async () => {
        // Validate entity
        if (!(await validateEntitas())) {
            myAlertGlobal2('hanya digunakan untuk Entitas 898', 'frmPraPp');
            return;
        }

        // Confirm refresh
        if (!(await myAlertGlobal3('Apakah data akan di refresh semua?', 'frmPraPp'))) {
            return;
        }

        // Start loading state
        setIsLoadingPraPpList(true);
        setProgressValue(0);

        try {
            // Step 1: Reset data (20%)
            setLoadingMessage('Resetting data...');
            setProgressValue(10);
            await resetAllGridData();
            setProgressValue(20);

            // Step 2: Refresh all grids in parallel (20-80%)
            const refreshTasks = [
                {
                    name: 'Pra PP List',
                    endpoint: '/erp/list_prapp',
                    params: filters.praPpList,
                    gridIndex: 1,
                    progressStart: 20,
                    progressEnd: 40,
                    loadingMessage: 'Refreshing Pra PP List...',
                },
                {
                    name: 'Pra PP Approved',
                    endpoint: '/erp/list_prapp_app',
                    params: filters.praPpAppList,
                    gridIndex: 2,
                    progressStart: 40,
                    progressEnd: 60,
                    loadingMessage: 'Refreshing Pra PP Approved...',
                },
                {
                    name: 'Pre Order Cabang',
                    endpoint: '/erp/pre_order_cabang',
                    params: { entitas: sessionData?.kode_entitas },
                    gridIndex: 0,
                    progressStart: 60,
                    progressEnd: 80,
                    loadingMessage: 'Refreshing Pre Order Cabang...',
                },
            ];

            await Promise.all(
                refreshTasks.map(async (task) => {
                    try {
                        setProgressValue(task.progressStart);
                        setLoadingMessage(task.loadingMessage);

                        const response = await axios.get(`${apiUrl}${task.endpoint}`, {
                            params: task.params,
                            headers: { Authorization: `Bearer ${token}` },
                        });

                        const resultData = response.data.data;
                        const initializedData = resultData.map((item: any) => ({
                            ...item,
                            uniqId: `${task.endpoint.includes('pre_order_cabang') ? 'kode_preorder' : 'kode_prapp'}_${item.entitas}_${item.no_item}`,
                            pilih: 'N',
                        }));

                        const grid = tabs[task.gridIndex].dataGrid;
                        if (grid) {
                            grid.dataSource = initializedData;
                            grid.refresh();
                        }

                        setProgressValue(task.progressEnd);
                        console.log(`${task.name} refreshed successfully`);
                    } catch (error) {
                        console.error(`Error refreshing ${task.name}:`, error);
                        throw error;
                    }
                })
            );

            // Complete progress
            setLoadingMessage('Completing refresh...');
            setProgressValue(100);
        } catch (error) {
            console.error('Error during refresh:', error);
            myAlertGlobal2('Error refreshing data', 'frmPraPp');
        } finally {
            // Reset loading state after a delay
            setTimeout(() => {
                setIsLoadingPraPpList(false);
                setProgressValue(0);
                setLoadingMessage('Initializing...');
                dgPraPp.refresh();
            }, 1000);
        }
    };

    // const handleKirimTele = async (currentGrid: any) => {
    //     const filteredItems = (currentGrid.dataSource as any[]).filter((item) => item.pilih === 'Y' && item.tolak === 'Y');
    //     // console.log('filteredItems', filteredItems);
    //     // throw exitCode;
    //     // Use Promise.all to handle multiple asynchronous operations concurrently
    //     await Promise.all(
    //         filteredItems.map(async (item) => {
    //             const teleSettings: any[] = await settingTelegram(item.entitas, token);
    //             // console.log('teleSettings', teleSettings[0].token5);
    //             if (teleSettings) {
    //                 // Prepare telegram message
    //                 const message =
    //                     `Informasi PRE ORDER Penolakan HO :\n\n` +
    //                     `Terdapat barang Pre Order cabang ${item.entitas} yang Ditolak !\n` +
    //                     `Tanggal : ${moment(item.tgl_preorder).format('DD-MM-YYYY')}\n` +
    //                     `Nomor Pre Order : ${item.no_preorder}\n` +
    //                     `No. Barang : ${item.no_item}\n` +
    //                     `Nama Barang : ${item.diskripsi}\n` +
    //                     `Alasan : ${item.alasan_tolak}\n\n` +
    //                     `Enitas : ${item.entitas}\n\n` +
    //                     `Segera lakukan pengecekan.\n`;

    //                 // Send messages based on available settings
    //                 const sendMessages = [
    //                     teleSettings[0].tele_regional && sendTelegramMessage(teleSettings[0].token5, teleSettings[0].tele_regional, `tele_regional ${message}`),
    //                     teleSettings[0].tele_manager && sendTelegramMessage(teleSettings[0].token5, teleSettings[0].tele_manager, `tele_manager ${message}`),
    //                 ].filter(Boolean); // Filter out any undefined promises
    //                 const results = await Promise.all(sendMessages);
    //                 console.log('send results', results); // Wait for all messages to be sent
    //             }
    //         })
    //     );
    // };

    // Helper function to reset grid data
    const resetAllGridData = async () => {
        try {
            const currentGrid = tabs[selectedIndex].dataGrid;
            const praPpData = (dgPraPp.dataSource as any[]) || [];
            const sourceData = (currentGrid.dataSource as any[]) || [];

            // Reset all items
            const resetData = [...sourceData, ...praPpData].map((item) => ({
                ...item,
                pilih: 'N',
                tolak: 'N',
            }));

            // Update grids
            currentGrid.dataSource = resetData;
            currentGrid.refresh();
            dgPraPp.dataSource = [];
            dgPraPp.refresh();
        } catch (error) {
            console.error('Error resetting data:', error);
            throw new Error('Failed to reset grid data');
        }
    };

    useEffect(() => {
        const initializeForm = async () => {
            try {
                await fetchDataBasedOnTabId(tabs[selectedIndex].id);
                await fetchDataBarang();
            } finally {
                // Hide progress bar after initial data load
                setTimeout(() => {
                    setIsTabLoading(false);
                }, 1000);
            }
        };

        initializeForm();
    }, [selectedIndex, isLoading, tabs[selectedIndex].id]); // Empty dependency array for initial load only

    // Modify handleTabChange to also fetch data
    const handleTabChange = async (index: number) => {
        setIsTabLoading(true);
        setSelectedIndex(index);
        handleResetFilters(index);

        try {
            await fetchDataBasedOnTabId(tabs[index].id);
        } finally {
            setTimeout(() => {
                setIsTabLoading(false);
            }, 1000);
        }
    };

    useEffect(() => {
        let predicate: Predicate | undefined;

        if (searchEntitas) {
            predicate = new Predicate('entitas', 'contains', searchEntitas, true);
        }

        if (searchBulan) {
            const bulanPredicate = new Predicate('nama_bulan', 'contains', searchBulan, true);
            predicate = predicate ? predicate.and(bulanPredicate) : bulanPredicate;
        }

        if (filterState.searchNamaBarang) {
            const barangPredicate = new Predicate('diskripsi', 'contains', filterState.searchNamaBarang, true);
            predicate = predicate ? predicate.and(barangPredicate) : barangPredicate;
        }

        const newQuery = new Query();
        if (predicate) {
            newQuery.where(predicate);
        }

        setGridQuery(newQuery);
    }, [searchEntitas, searchBulan, filterState.searchNamaBarang]);

    useEffect(() => {
        if (progressValue > displayedProgress) {
            const timer = setTimeout(() => {
                setDisplayedProgress((prev) => Math.min(prev + 1, progressValue));
            }, 20); // Adjust this value to control animation speed
            return () => clearTimeout(timer);
        } else if (progressValue < displayedProgress) {
            setDisplayedProgress(progressValue);
        }
    }, [progressValue, displayedProgress]);

    return (
        // <div className="mx-auto mt-10 w-full max-w-md">
        <>
            {(isLoadingPraPpList || isLoadingPraPpAppList || isLoadingTolakList) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="rounded-lg bg-white p-6 shadow-lg">
                        {/* <div className="mb-4 text-center text-lg font-semibold">Loading Data...{tabs[selectedIndex].id}</div> */}
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
                                            duration: 2000, // Match this with the total time of the counter animation
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
            <div id="frmPraPp" className="mx-auto mt-10 w-full ">
                <Tab.Group selectedIndex={selectedIndex} onChange={handleTabChange}>
                    <div className="relative">
                        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
                            {tabs.map((tab, index) => (
                                <Tab as={Fragment} key={index}>
                                    {({ selected }) => (
                                        <button
                                            className={classNames(
                                                'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700',
                                                selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                                            )}
                                        >
                                            {tab.name}
                                        </button>
                                    )}
                                </Tab>
                            ))}
                        </Tab.List>
                        {/* Add progress bar below tabs */}
                        {isTabLoading && (
                            <div className="absolute bottom-0 left-0 w-full transform">
                                <ProgressBarComponent
                                    type="Linear"
                                    height="2"
                                    value={100}
                                    animation={{
                                        enable: true,
                                        duration: 1000,
                                        delay: 0,
                                    }}
                                    style={{ transform: 'translateY(2px)' }}
                                />
                            </div>
                        )}
                    </div>
                    <Tab.Panels>
                        {tabs.map((tab, index) => (
                            <Tab.Panel key={index} className="mt-4">
                                <motion.div
                                    key={index}
                                    initial={{ x: selectedIndex > index ? -100 : 100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: selectedIndex > index ? 100 : -100, opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <div className="rounded-lg bg-white p-4 shadow">{tab.content}</div>
                                </motion.div>
                            </Tab.Panel>
                        ))}
                    </Tab.Panels>
                </Tab.Group>
            </div>
            <FrmItemDlg
                isOpen={showDialogBarang}
                onClose={() => {
                    setShowDialogBarang(false);
                }}
                onBatal={() => {
                    setShowDialogBarang(false);
                }}
                selectedData={(dataObject: any) => handleSelectedDialog(dataObject)}
                target={'frmPraPp'}
                stateDokumen={stateDokumen}
            />
        </>
    );
};

export default PreOrderForm;
