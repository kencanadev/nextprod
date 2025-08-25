/* eslint-disable react-hooks/rules-of-hooks */
import { Fragment, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
// import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faMagnifyingGlass, faPlay, faSquareCaretDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import Dropdown from '../../../../../components/Dropdown';
import moment from 'moment';
import swal from 'sweetalert2';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import styles from './mpblist.module.css';
import { Tab } from '@headlessui/react';

import { frmNumber, showLoading } from '@/utils/routines';
//import PilihBaruModal from './modal/pilihbaru';
import { FillFromSQL } from '@/utils/routines';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Select from 'react-select';
// import TabelDetailMpb from './component/tabelDetailMpb';
import TabelListMpb from './component/tabelListMpb';
import TabelDetailDokList from './modal/mdlDetailDokList';
// import { TabelListMpb, TabelDetailDokList } from './component/';
import { MpbListApi } from './model/api';
import { FirstDayInPeriod } from '@/utils/routines';
import SweetAlerts from './component/SweetAlertsNotif';
import Draggable from 'react-draggable';

// interface MPBListProps {
//     userid: any;
//     kode_entitas: any;
//     kode_user: any;
// }

import { useSession } from '@/pages/api/sessionContext';
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
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json'; // To load the culture based first day of week

loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);

import idIDLocalization from 'public/syncfusion/locale.json';
L10n.load(idIDLocalization);

const MpbList = () => {
    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';

    if (isLoading) {
        return;
    }

    const router = useRouter();

    //=============================DEFINISI FIELD DATASET=====================================================//
    //========================================================================================================//
    type MPBListGrid = {
        kode_mpb: string;
        no_mpb: string;
        tgl_mpb: any;
        kode_gudang: string;
        kode_supp: string;
        via: string;
        pengemudi: string;
        nopol: string;
        total_rp: any;
        total_diskon_rp: any;
        total_pajak_rp: any;
        netto_rp: any;
        keterangan: string;
        status: string;
        userid: string;
        tgl_update: string;
        nama_gudang: string;
        nama_supp: string;
    };
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [25, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

    const [date1, setDate1] = useState<moment.Moment>(moment());
    const [date2, setDate2] = useState<moment.Moment>(moment().endOf('month'));
    const [isTanggalChecked, setIsTanggalChecked] = useState<boolean>(true);

    // HANDLE VISIBLE PANEL FILTERING
    const [panelVisible, setPanelVisible] = useState(true);
    const handleTogglePanel = () => {
        setPanelVisible(!panelVisible);
    };

    const handleFilterClick = () => {
        setPanelVisible(true);
    };

    //HANDLE INPUT FILTER ONCHANGE
    const [noMpbValue, setNoMpbValue] = useState<string>('');
    const [isNoMpbChecked, SetIsNoMpbChecked] = useState<boolean>(false);
    const handleNoMpbInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setNoMpbValue(newValue);
        SetIsNoMpbChecked(newValue.length > 0);
    };

    const [namaSuppValue, setNamaSuppValue] = useState<string>('');
    const [isNamaSuppChecked, setIsNamaSuppChecked] = useState<boolean>(false);
    const handleNamaSuppInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setNamaSuppValue(newValue);
        setIsNamaSuppChecked(newValue.length > 0);
    };

    const [apiGudangValue, setApiGudangValue] = useState<any[]>([]);
    const [selectedKodeGudang, setSelectedKodeGudang] = useState<any>('');
    const [namaGudangValue, setNamaGudangValue] = useState<string>('');
    const [isNamaGudangChecked, setIsNamaGudangChecked] = useState<boolean>(false);
    const handleNamaGudangInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setNamaGudangValue(newValue);
        setIsNamaGudangChecked(newValue.length > 0);
    };

    const opsiGudang = apiGudangValue.map((gudang) => ({
        value: gudang.kode_gudang,
        label: gudang.nama_gudang,
    }));

    const namaGudang = (e: any) => {
        // console.log('E' + e);
        setSelectedKodeGudang(e);
        setIsNamaGudangChecked(e.length > 0);
    };

    const [statusDokumenValue, setStatusDokumenValue] = useState<string>('');
    const [isStatusDokumenChecked, setIsStatusDokumenChecked] = useState<boolean>(false);
    const handleStatusDokumenInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setStatusDokumenValue(newValue);
        setIsStatusDokumenChecked(newValue.length > 0);
    };

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'kode_mpb',
        direction: 'asc',
    });

    const [editSelected, setEditSelected] = useState();
    const handleEditData = (selectedEditData: any) => {
        setEditSelected(selectedEditData);
    };

    // const [baru, setBaru] = useState(false);
    const [baruSelected, setbaruSelected] = useState();
    const handleButtonBaru = (id: any) => {
        router.push(`./mpb`);
        // router.push({ pathname: './mpb', query: { name: 'no_mpb' } });
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const refreshData = async () => {
        try {
            await MpbListApi(kode_entitas, noMpbValue, isTanggalChecked, date1, date2, namaSuppValue, selectedKodeGudang, statusDokumenValue)
                .then((result: any) => {
                    setMpbListApi(result);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        // showLoading();
    };

    // Fetch and process data
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    //REFRESH DATA LIST
    const [mpbListApi, setMpbListApi] = useState<MPBListGrid[]>([]);
    const [listDetailDok, setListDetailDok] = useState<MPBListGrid[]>([]);

    const mounted = useRef(false);
    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            FillFromSQL(kode_entitas, 'gudang', kode_user)
                .then((result: any) => {
                    setApiGudangValue(result);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            // showLoading();
            refreshData();
        } else {
        }
    }, [kode_entitas, kode_user, refreshData]);

    const [isShowTaskMenu, setIsShowTaskMenu] = useState(false);
    const tabChanged = () => {
        setIsShowTaskMenu(false);
    };

    //select baris
    const [selectedRow, setSelectedRow] = useState('');
    const [tglDokumenMpb, setTglDokumenMpb] = useState<any>(moment().format('DD-MM-YYYY HH:mm:ss'));
    // const [tglDokumenMpb, setTglDokumenMpb] = useState<any>(moment());
    const [statusMpb, setStatusMpb] = useState('');

    // const handleRowClick = (pKodeMpb: any) => {
    //     setSelectedRow(pKodeMpb);
    // };

    const ambilDataDariListKodeMpb = async (pKodeMpb: any) => {
        // console.log(pKodeMpb);
        setSelectedRow(pKodeMpb);
    };

    const ambilDataDariListNoMpb = async (pNoMpb: any) => {
        setNoMpbValue(pNoMpb);
    };

    const ambilDataDariListTglMpb = async (pTglMpb: any) => {
        // console.log(pTglMpb);
        setTglDokumenMpb(pTglMpb);
    };

    const ambilDataDariListStatusMpb = async (pStatus: any) => {
        // console.log(pStatus);
        setStatusMpb(pStatus);
    };

    const [periode, setPeriode] = useState('');
    const fromFirstDayInPeriod = async () => {
        try {
            const periode = await FirstDayInPeriod(kode_entitas);
            setPeriode(periode);
            // console.log(periode);
        } catch (error) {}
    };

    fromFirstDayInPeriod();

    const handleNavigateLink = (jenis: any) => {
        if (jenis === 'baru') {
        } else if (jenis === '<MPB Baru>') {
            router.push(`./mpb`);
        } else if (jenis === 'edit') {
            // router.push({ pathname: './edit_mpb', query: { kode_mpb: `${selectedRow}` } });
            // alert('selectedRow ' + selectedRow);

            if (!selectedRow) {
                // alert('Pilih List MPB yang akan diedit');
            } else {
                // console.log('tglDokumenMpb aja 1 ' + moment(tglDokumenMpb, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss'));
                // console.log('tglDokumenMpb aja 2 ' + tglDokumenMpb);
                // console.log('periode aja ' + periode);
                if (moment(tglDokumenMpb).format('YYYY-MM-DD HH:mm:ss') < periode) {
                    SweetAlerts.showAlertBlockingPeriodeAkuntansi(13);
                } else if (statusMpb != 'Terbuka') {
                    SweetAlerts.showAlertStatusDokumen(2, statusMpb);
                } else {
                    const x = Buffer.from(`entitas=${kode_entitas}&kode_mpb=${selectedRow}&jenis=edit`).toString('base64');
                    router.push({ pathname: './mpb', query: { x_: x } });
                    // const EncoDeStr = btoa(`entitas=${kode_entitas}&kode_mpb=${selectedRow},jenis=edit`);
                    // router.push({ pathname: './mpb', query: { EncoDeStr, jenis: 'edit' } });
                    // router.push({ pathname: './mpb', query: { pKodeMpb: `${selectedRow}`, jenis: 'edit' } });
                }
            }
        }
    };

    const ShowDmpb = (tag: any) => {
        // console.log(nominal);
        if (selectedRow === '') {
            // alert('Silahkan pilih data terlebih dahulu');
            swal.fire({
                title: 'Pilih Data terlebih dahulu.',
                icon: 'error',
            });
        } else {
            const param = {
                entitas: kode_entitas,
                param1: `${selectedRow}`,
            };
            // // Encode Base64
            const strCommand = btoa(JSON.stringify(param));
            // const strCommand = Buffer.from(JSON.stringify(param)).toString('base64');
            // console.log('strCommand ' + strCommand);
            let height = window.screen.availHeight - 150;
            let width = window.screen.availWidth - 200;
            let leftPosition = window.screen.width / 2 - (width / 2 + 10);
            let topPosition = window.screen.height / 2 - (height / 2 + 50);

            if (tag === 1) {
                let iframe = `
                <html><head>
                <title>Memo Pengembalian Barang | Next KCN Sytem</title>
                <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
                </head><body>
                <iframe src="./report/form_mpb?cmd=${strCommand}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
                </body></html>`;

                let win = window.open(
                    '',
                    '_blank',
                    `status=no,width=${width},height=${height},resizable=yes
              ,left=${leftPosition},top=${topPosition}
              ,screenX=${leftPosition},screenY=${topPosition}
              ,toolbar=no,menubar=no,scrollbars=no,location=no,directories=no`
                );

                if (win) {
                    let link = win.document.createElement('link');
                    link.type = 'image/png';
                    link.rel = 'shortcut icon';
                    link.href = '/favicon.png';
                    win.document.getElementsByTagName('head')[0].appendChild(link);
                    win.document.write(iframe);
                } else {
                    console.error('Window failed to open.');
                }
            } else if (tag === 2) {
                let iframe = `
                <html><head>
                <title>Memo Debet | Next KCN Sytem</title>
                <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
                </head><body>
                <iframe src="./report/rpDMpbRp?cmd=${strCommand}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
                </body></html>`;

                let win = window.open(
                    '',
                    '_blank',
                    `status=no,width=${width},height=${height},resizable=yes
              ,left=${leftPosition},top=${topPosition}
              ,screenX=${leftPosition},screenY=${topPosition}
              ,toolbar=no,menubar=no,scrollbars=no,location=no,directories=no`
                );

                if (win) {
                    let link = win.document.createElement('link');
                    link.type = 'image/png';
                    link.rel = 'shortcut icon';
                    link.href = '/favicon.png';
                    win.document.getElementsByTagName('head')[0].appendChild(link);
                    win.document.write(iframe);
                } else {
                    console.error('Window failed to open.');
                }
            }
        }
    };
    const listDetailDokMpb = async () => {
        // console.log(selectedRow);
        try {
            const detailMPB = await axios.get(`${apiUrl}/erp/detail_mpb?`, {
                params: {
                    entitas: kode_entitas,
                    param1: selectedRow,
                },
            });
            // console.log(detailMPB);
            const hasilDetailDok = detailMPB.data.data;
            // const detail: hasilDetailDok.nodes.map((data: any) => ({
            //      ...data,
            //      qty: parseFloat(data.qty)
            //  }),
            const hasilDetailDok2 = hasilDetailDok.map((data: any) => ({
                ...data,
                qty: frmNumber(data.qty),
            }));
            // console.log(hasilDetailDok2);
            setListDetailDok(hasilDetailDok2);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    // fromFirstDayInPeriod();
    useEffect(() => {
        listDetailDokMpb();
    }, [selectedRow]);

    const [mdlDetailDok, setMdlDetailDok] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: '35%', right: '10%', width: '100%', background: '#dedede' });
    const ambilDetailDok = async () => {
        // console.log('masuk sini')
        if (!selectedRow) {
            alert('Pilih List MPB');
        } else {
            await listDetailDokMpb();
            await setMdlDetailDok(true);
        }
    };
    const closeModal = () => {
        setMdlDetailDok(false);
    };

    return (
        <div>
            <div className=" mb-5 flex justify-between">
                <div className="flex">
                    {/* <button type="submit" className="btn btn-primary mb-2 md:mb-0 md:mr-2" onClick={() => setBaru(true)}>
                        Baru
                    </button>
                    <PilihBaruModal isOpen={baru} onClose={() => setBaru(false)} onSelectData={(selectedData: any) => handleSelectedData(selectedData)} /> */}
                    <button type="submit" className="btn btn-primary mb-2 md:mb-0 md:mr-2" onClick={() => handleNavigateLink('<MPB Baru>')}>
                        {/* handleButtonBaru('<MPB Baru>')}> */}
                        Baru
                    </button>
                    {/* <PilihBaruModal isOpen={baru} onClose={() => setBaru(false)} onSelectData={(selectedData: any) => handleSelectedData(selectedData)} /> */}
                    <button type="submit" className="btn btn-warning mb-2 md:mb-0 md:mr-2" onClick={() => handleNavigateLink('edit')}>
                        Ubah
                    </button>
                    {/* <button type="submit" className="btn btn-danger mb-2 md:mb-0 md:mr-2">
                        Hapus
                    </button> */}
                    <button type="submit" className={`btn btn-success mb-2 md:mb-0 md:mr-2 ${panelVisible ? 'pointer-events-none opacity-50' : ''}`} onClick={handleFilterClick}>
                        Filter
                    </button>
                    <div className="relative">
                        <div className="dropdown">
                            <Dropdown
                                offset={[0, 5]}
                                placement={`bottom-end`}
                                btnClassName="btn btn-info md:mr-1"
                                button={
                                    <>
                                        Cetak
                                        <FontAwesomeIcon icon={faSquareCaretDown} className="ml-2" width="18" height="18" />
                                    </>
                                }
                            >
                                <ul>
                                    <li>
                                        {/* <button type="button">List Cetak 1</button> */}
                                        <button type="button" onClick={() => ShowDmpb(1)}>
                                            Form Memo Pengembalian Barang{' '}
                                        </button>
                                    </li>
                                    <li>
                                        {/* <button type="button">List Cetak 2</button> */}
                                        <button type="button" onClick={() => ShowDmpb(2)}>
                                            Form Memo Debet{' '}
                                        </button>
                                    </li>
                                    <li>{/* <button type="button">List Cetak 3</button> */}</li>
                                    {/* <button type="button" onClick={() => ShowDmpbList('false')}>
                                        Daftar Memo Pengembalian Barang{' '}
                                    </button> */}
                                </ul>
                            </Dropdown>
                        </div>
                    </div>
                    <div className="flex">
                        {/* <button type="submit" className="btn btn-secondary mr-1">
                            <FontAwesomeIcon icon={faPlay} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                            Approval
                        </button>
                        <button type="submit" className="btn btn-secondary mr-1">
                            <FontAwesomeIcon icon={faPlay} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                            Pembatalan
                        </button> */}
                        <button type="submit" className="btn btn-secondary mr-1" onClick={() => ambilDetailDok()}>
                            <FontAwesomeIcon icon={faPlay} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                            Detail Dok
                        </button>
                    </div>
                    {/* <form className="ml-2 flex flex-col items-center gap-1 font-semibold md:flex-row">
                        <label className="ml-3 mt-2">Cari</label>
                        <input type="text" placeholder="Nomor MPB" className="form-input mb-2 md:mb-0 md:w-auto" value={searchnopp} onChange={(e) => setsearchnopp(e.target.value)} />
                        <input type="text" placeholder="Keterangan" className="form-input md:w-auto" value={searchketerangan} onChange={(e) => setsearchketerangan(e.target.value)} />
                    </form> */}
                </div>

                <div className="flex">
                    <span className="mt-1" style={{ fontSize: '20px', fontFamily: 'Times New Roman' }}>
                        MPB List Data
                    </span>
                </div>
            </div>
            {/* <div className={styles['flex-container']}> */}
            {/* {panelVisible && ( */}
            <div className="relative flex h-full gap-6 sm:h-[calc(100vh_-_150px)]">
                {panelVisible && (
                    <div
                        className={`panel absolute z-10 hidden h-full w-[300px] max-w-full flex-none space-y-4 border border-2 border-black-light p-4 dark:border-[#191e3a] xl:relative xl:block xl:h-auto ltr:rounded-r-none ltr:xl:rounded-r-md rtl:rounded-l-none rtl:xl:rounded-l-md ${
                            isShowTaskMenu && '!block'
                        }`}
                        style={{ background: '#d7d0d2' }}
                        // style={{ background: '#c5c5c5' }}
                        // style={{ background: '#e3dedf' }}
                    >
                        {/*    <div
                            className={`panel '!block' } absolute z-10 hidden h-full w-[275px] max-w-full flex-none space-y-4 p-4 xl:relative xl:block xl:h-auto ltr:rounded-r-none ltr:xl:rounded-r-md  rtl:rounded-l-none
                        rtl:xl:rounded-l-md`}
                            //style={{ background: '#dedede' }}
                        > */}
                        <div className="flex h-full flex-col pb-16">
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
                                    <h3 className="text-lg font-bold ltr:ml-3 rtl:mr-3">Filtering Data</h3>
                                </div>
                            </div>
                            {/* <div className="mb-5 h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div> */}
                            <div className="mb-5 h-px w-full border-b border-black dark:border-[#1b2e4b]"></div>
                            <PerfectScrollbar className="relative h-full grow ltr:-mr-3.5 ltr:pr-3.5 rtl:-ml-3.5 rtl:pl-3.5">
                                <div className="space-y-1">
                                    <button
                                        type="button"
                                        className={`'bg-gray-100 dark:text-primary' : '' } flex h-10 w-full items-center justify-between rounded-md p-2 font-medium text-primary hover:bg-white-dark/10 hover:text-primary dark:bg-[#181F32] dark:hover:bg-[#181F32]
                                    dark:hover:text-primary`}
                                    >
                                        <div className="flex items-center">
                                            <label className=" flex cursor-pointer items-center">
                                                <input type="checkbox" className="form-checkbox" checked={isNoMpbChecked} onChange={() => SetIsNoMpbChecked(!isNoMpbChecked)} />
                                                <div className="font-bold ltr:ml-3 rtl:mr-3">No. MPB</div>
                                            </label>
                                        </div>
                                        {/* <div className="whitespace-nowrap rounded-md bg-primary-light px-2 py-0.5 font-semibold dark:bg-[#060818]"></div> */}
                                    </button>

                                    <input
                                        type="text"
                                        placeholder="--No. MPB--"
                                        className="form-input"
                                        value={noMpbValue}
                                        onChange={handleNoMpbInputChange}
                                        style={{
                                            //border: '2px solid #2684ff',
                                            outline: '0px',
                                        }}
                                    />

                                    <button
                                        type="button"
                                        className={`'complete' && 'bg-gray-100 dark:text-primary' } flex h-10 w-full items-center justify-between rounded-md p-2 font-medium text-primary hover:bg-white-dark/10 hover:text-primary dark:bg-[#181F32] dark:hover:bg-[#181F32]
                                    dark:hover:text-primary`}
                                    >
                                        <div className="flex items-center">
                                            <label className="mt-3 flex cursor-pointer items-center">
                                                <input type="checkbox" className="form-checkbox" checked={isTanggalChecked} onChange={() => setIsTanggalChecked(!isTanggalChecked)} />
                                                <div className="font-bold ltr:ml-3 rtl:mr-3">Tanggal</div>
                                            </label>
                                        </div>
                                        {/* <div className="whitespace-nowrap rounded-md bg-primary-light px-2 py-0.5 font-semibold dark:bg-[#060818]"></div> */}
                                    </button>
                                    <div className={`grid grid-cols-1 justify-between gap-1 sm:flex `}>
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
                                                }}
                                            >
                                                <Inject services={[MaskedDateTime]} />
                                            </DatePickerComponent>
                                        </div>{' '}
                                        <p className="mt-1" style={{ marginTop: '10px' }}>
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
                                                }}
                                            >
                                                <Inject services={[MaskedDateTime]} />
                                            </DatePickerComponent>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className={`selectedTab === 'important' && 'bg-gray-100 dark:text-primary' } flex h-10 w-full items-center justify-between rounded-md p-2 font-medium text-primary hover:bg-white-dark/10 hover:text-primary dark:bg-[#181F32] dark:hover:bg-[#181F32]
                                    dark:hover:text-primary`}
                                    >
                                        <div className="flex items-center">
                                            <label className=" flex cursor-pointer items-center">
                                                <input type="checkbox" className="form-checkbox" checked={isNamaSuppChecked} onChange={() => setIsNamaSuppChecked(!isNamaSuppChecked)} />
                                                <div className="font-bold ltr:ml-3 rtl:mr-3">Nama Supplier</div>
                                            </label>
                                        </div>
                                        {/* <div className="whitespace-nowrap rounded-md bg-primary-light px-2 py-0.5 font-semibold dark:bg-[#060818]"></div> */}
                                    </button>
                                    <input type="text" placeholder="--Supplier--" className="form-input" value={namaSuppValue} onChange={handleNamaSuppInputChange} />

                                    <button
                                        type="button"
                                        className={`selectedTab === 'trash' && 'bg-gray-100 dark:text-primary' } flex h-10 w-full items-center justify-between rounded-md p-2 font-medium text-primary hover:bg-white-dark/10 hover:text-primary dark:bg-[#181F32] dark:hover:bg-[#181F32]
                                    dark:hover:text-primary`}
                                    >
                                        <div className="flex items-center">
                                            <label className="flex cursor-pointer items-center">
                                                <input type="checkbox" className="form-checkbox" checked={isNamaGudangChecked} onChange={() => setIsNamaGudangChecked(!isNamaGudangChecked)} />
                                                <div className="font-bold ltr:ml-3 rtl:mr-3">Nama Gudang</div>
                                            </label>
                                        </div>
                                    </button>
                                    {/* <div className="flex"> */}
                                    <div className="mb-5">
                                        {/* <select
                                            id="cbGudang"
                                            className={`form-select `}
                                            //style={{ border: 'none' }}
                                            value={KodeGudangValue.length > 0 ? selectedKodeGudang : ''}
                                            onChange={(e) => setSelectedKodeGudang([e.target.value])}
                                        >
                                            <option value="" disabled>
                                                --Pilih Gudang--
                                            </option>
                                            {KodeGudangValue.map((gudang: any) => (
                                                <option key={gudang.kode_gudang} value={gudang.kode_gudang}>
                                                    {gudang.nama_gudang}
                                                </option>
                                            ))}
                                        </select> */}
                                        {/* <Select id="cbGudang" placeholder="Pilih gudang" options={opsiGudang} onChange={(e) => setSelectedKodeGudang([e?.value])} /> */}
                                        <Select id="cbGudang" placeholder="Pilih gudang" options={opsiGudang} onChange={(e) => namaGudang(e?.value)} />
                                    </div>
                                    {/* <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div> */}
                                    {/* <div className="px-1 py-3 text-white-dark">Tags</div> */}
                                    {/* <button
                                        type="button"
                                        className={`selectedTab === 'team' && 'bg-gray-100 rtl:pr-3' } flex h-10 w-full items-center rounded-md p-1
                                        font-medium text-success duration-300 hover:bg-white-dark/10 dark:bg-[#181F32] dark:hover:bg-[#181F32] ltr:pl-3 ltr:hover:pl-3
                                    rtl:hover:pr-3`}
                                    > */}
                                    <button
                                        type="button"
                                        className={`selectedTab === 'trash' && 'bg-gray-100 dark:text-primary' } flex h-10 w-full items-center justify-between rounded-md p-2 font-medium text-primary hover:bg-white-dark/10 hover:text-primary dark:bg-[#181F32] dark:hover:bg-[#181F32]
                                    dark:hover:text-primary`}
                                    >
                                        <div className="mt-3 flex justify-between">
                                            <label className="flex cursor-pointer items-center">
                                                <input type="checkbox" className="form-checkbox" checked={isStatusDokumenChecked} onChange={() => setIsStatusDokumenChecked(!isStatusDokumenChecked)} />
                                                <div className="font-bold ltr:ml-3 rtl:mr-3">Status Dokumen</div>
                                            </label>
                                        </div>
                                    </button>
                                    <select id="StatusDok" className="form-select " onChange={(e) => setStatusDokumenValue(e.target.value)} value={statusDokumenValue}>
                                        <option value="" disabled hidden>
                                            {'-- Silahkan Pilih Data--'}
                                        </option>
                                        <option value="Terbuka">Terbuka</option>
                                        <option value="Proses">Proses</option>
                                        <option value="Tertutup">Tertutup</option>
                                    </select>
                                </div>
                            </PerfectScrollbar>

                            <div className="absolute bottom-0 w-full p-4 ltr:left-0 rtl:right-0">
                                <button className="btn btn-primary w-full" type="button" onClick={() => refreshData()}>
                                    <svg
                                        className="h-5 w-5 shrink-0 ltr:mr-2 rtl:ml-2"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        {/* <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line> */}
                                        <FontAwesomeIcon icon={faArrowsRotate} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                    </svg>
                                    <div className="font-bold ltr:ml-3 rtl:mr-3">Refresh Data</div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className={`overlay absolute z-[5] hidden h-full w-full rounded-md bg-black/60 ${isShowTaskMenu && '!block xl:!hidden'}`} onClick={() => setIsShowTaskMenu(!isShowTaskMenu)}></div>
                {/* INI YG DI TUTUP PANEL BACKGROUNDNYA */}
                <div
                    className="panel h-full flex-1 space-y-4 border border-2 border-black-light p-4 dark:border-[#191e3a] xl:relative xl:block xl:h-auto ltr:rounded-r-none ltr:xl:rounded-r-md rtl:rounded-l-none rtl:xl:rounded-l-md "
                    //  style={{ background: '#e3dedf' }}
                    // style={{ background: '#c0b5b7' }}
                    // style={{ background: '#ccc2c4' }}
                    style={{ background: '#d7d0d2' }}
                >
                    <div className="flex h-full flex-col">
                        {/* <div className="flex w-full flex-col gap-4 p-4 sm:flex-row sm:items-center"> */}
                        <div className="flex items-center p-1 ltr:mr-3 rtl:ml-3">
                            <button type="button" className="block hover:text-primary xl:hidden ltr:mr-3 rtl:ml-3" onClick={() => setIsShowTaskMenu(!isShowTaskMenu)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 7L4 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path opacity="0.5" d="M20 12L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M20 17L4 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>
                        {/* <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div> */}
                        {/* PANEL KANAN */}
                        {/* {pagedTasks.length ? ( */}
                        {/* <div className="grid grid-cols-1 gap-4"> */}
                        {/* INI YG DI TUTUP PANEL BACKGROUNDNYA ID DETAIL*/}
                        {/* <div className="panel absolute h-full flex-1 " id="detail" style={{ background: '#e3dedf' }}> */}
                        <div className="mb-5">
                            {/* <h5 className="text-lgfont-semibold dark:text-white-light">DETAIL</h5> */}
                            <Tab.Group>
                                <Tab.List className="mt-3 flex flex-wrap">
                                    <Tab as={Fragment}>
                                        {({ selected }) => (
                                            <button
                                                className={`${selected ? 'text-secondary !outline-none before:!w-full' : ''}
                                            relative -mb-[1px] flex items-center p-5 py-3 before:absolute before:bottom-0 before:left-0 before:right-0 before:m-auto before:inline-block before:h-[1px] before:w-0 before:bg-secondary before:transition-all before:duration-700 hover:text-secondary hover:before:w-full`}
                                                id="1"
                                            >
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ltr:mr-2 rtl:ml-2">
                                                    <path
                                                        opacity="0.5"
                                                        d="M2 12.2039C2 9.91549 2 8.77128 2.5192 7.82274C3.0384 6.87421 3.98695 6.28551 5.88403 5.10813L7.88403 3.86687C9.88939 2.62229 10.8921 2 12 2C13.1079 2 14.1106 2.62229 16.116 3.86687L18.116 5.10812C20.0131 6.28551 20.9616 6.87421 21.4808 7.82274C22 8.77128 22 9.91549 22 12.2039V13.725C22 17.6258 22 19.5763 20.8284 20.7881C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.7881C2 19.5763 2 17.6258 2 13.725V12.2039Z"
                                                        stroke="currentColor"
                                                        stroke-width="1.5"
                                                    ></path>
                                                    <path d="M12 15L12 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
                                                </svg>
                                                <div className="font-bold ltr:ml-3 rtl:mr-3">1. List Data MPB</div>
                                            </button>
                                        )}
                                    </Tab>
                                    {/* <Tab as={Fragment}>
                                                {({ selected }) => (
                                                    <button
                                                        className={`${selected ? 'text-secondary !outline-none before:!w-full' : ''}
                                            relative -mb-[1px] flex items-center p-5 py-3 before:absolute before:bottom-0 before:left-0 before:right-0 before:m-auto before:inline-block before:h-[1px] before:w-0 before:bg-secondary before:transition-all before:duration-700 hover:text-secondary hover:before:w-full`}
                                                        id="1"
                                                    >
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ltr:mr-2 rtl:ml-2">
                                                            <path
                                                                opacity="0.5"
                                                                d="M2 12.2039C2 9.91549 2 8.77128 2.5192 7.82274C3.0384 6.87421 3.98695 6.28551 5.88403 5.10813L7.88403 3.86687C9.88939 2.62229 10.8921 2 12 2C13.1079 2 14.1106 2.62229 16.116 3.86687L18.116 5.10812C20.0131 6.28551 20.9616 6.87421 21.4808 7.82274C22 8.77128 22 9.91549 22 12.2039V13.725C22 17.6258 22 19.5763 20.8284 20.7881C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.7881C2 19.5763 2 17.6258 2 13.725V12.2039Z"
                                                                stroke="currentColor"
                                                                stroke-width="1.5"
                                                            ></path>
                                                            <path d="M12 15L12 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
                                                        </svg>
                                                        1. List Data MPB
                                                    </button>
                                                )}
                                            </Tab> */}
                                </Tab.List>
                                <Tab.Panels>
                                    <Tab.Panel>
                                        <div className="active pt-5">
                                            <div className="grid grid-cols-8 justify-between gap-5 sm:flex">
                                                <div className="grid grid-cols-1 gap-6 xl:grid-cols-1"></div>
                                            </div>
                                            {/* BUAT TABLENYA */}
                                            {/* <TabelDetailMpb userid={userid} kode_entitas={kode_entitas} kode_user={kode_user} kodeSupp={''} kodeGudang={''} /> */}
                                            <TabelListMpb
                                                userid={userid}
                                                kode_entitas={kode_entitas}
                                                propsMpbListApi={mpbListApi}
                                                propsUserid={userid}
                                                propsKode_entitas={kode_entitas}
                                                propsKirimDataListKodeMpb={(pKodeMpb: any) => ambilDataDariListKodeMpb(pKodeMpb)}
                                                propsKirimDataListNoMpb={(noMpbValue: any) => ambilDataDariListNoMpb(noMpbValue)}
                                                propsKirimDataListTglMpb={(tglDokumenValue: any) => ambilDataDariListTglMpb(tglDokumenValue)}
                                                propsKirimDataListStatus={(statusValue: any) => ambilDataDariListStatusMpb(statusValue)}
                                            />
                                            {/* <TabelDetailDokList
                                                isOpen={mdlDetailDok}
                                                onClose={() => setMdlDetailDok(false)}
                                                userid={userid}
                                                kode_entitas={kode_entitas}
                                                kode_mpb={selectedRow}
                                                dataApi={listDetailDok}
                                            /> */}
                                            {/* END TABLE */}
                                        </div>
                                    </Tab.Panel>
                                </Tab.Panels>
                            </Tab.Group>

                            {mdlDetailDok && (
                                <Draggable>
                                    <div className={`${styles.modalDetailDragable}`} style={modalPosition}>
                                        <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                                            {' '}
                                            {/* Adjust the maxHeight as needed */}
                                            <table className={styles.table}>
                                                <thead>
                                                    <tr>
                                                        <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '2%' }}>No. LPB</th>
                                                        <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '2%' }}>No. Barang</th>
                                                        <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '17%' }}>Nama Barang</th>
                                                        <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '2%' }}>Satuan</th>
                                                        <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '2%' }}>Kuantitas</th>
                                                        <th style={{ backgroundColor: 'rgb(94, 98, 98)', color: 'white', width: '8%' }}>Keterangan</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {listDetailDok?.map((item: any) => (
                                                        <tr key={item.id_mpb}>
                                                            {/* <td>{headerFetch[0]?.no_lpb}</td>
                                                                <td  >{headerFetch[0]?.no_sj}</td> */}
                                                            <td style={{ background: 'white', textAlign: 'left' }}>{item.no_dok}</td>
                                                            <td style={{ background: 'white', textAlign: 'left' }}>{item.no_item}</td>
                                                            <td style={{ background: 'white', textAlign: 'left' }}>{item.diskripsi}</td>
                                                            <td style={{ background: 'white' }}>{item.satuan}</td>
                                                            {/* <td style={{ background: 'white', textAlign: 'left' }}>{frmNumber(item.qty)}</td> */}
                                                            <td style={{ background: 'white', textAlign: 'left' }}>{item.qty}</td>
                                                            <td style={{ background: 'white' }}>{item.ket}</td>
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
                        {/* </div> */}
                        {/* </div> */}
                        {/* ) : (
                        <div className="flex h-full min-h-[400px] items-center justify-center text-lg font-semibold sm:min-h-[300px]">No data available</div>
                    )} */}
                    </div>
                </div>
            </div>
            {/* )} */}
            {/* </div> */}
        </div>
    );
};

//================================== END RETURN UI ===========================================================//

export default MpbList;
