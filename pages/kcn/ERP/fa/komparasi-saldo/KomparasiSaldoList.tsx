import React, { useEffect, useRef, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { RiRefreshFill } from 'react-icons/ri';
import GridListSaldo from './GridListSaldo';
import idIDLocalization from 'public/syncfusion/locale.json';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as weekData from 'cldr-data/supplemental/weekData.json';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import moment from 'moment';
import { Inject } from '@syncfusion/ej2-react-grids';
import AkunKas from './modal/AkunKas';
import { useSession } from '@/pages/api/sessionContext';
import { useRouter } from 'next/router';
import axios from 'axios';
import GlobalProgressBar from '@/components/GlobalProgressBar';
import { useProgress } from '@/context/ProgressContext';


loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
L10n.load(idIDLocalization);
enableRipple(true);

export default function KomparasiSaldoList() {
    const { sessionData } = useSession();
    const tabId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('tabId') || '' : '';
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const router = useRouter();
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const { startProgress, updateProgress, endProgress, setLoadingMessage } = useProgress();


    const gridSaldo = useRef<any>(null);

    const [isSidebarVisible, setSidebarVisible] = useState(true);
    const [filterState, setFilterState] = useState({
        tanggal_awal: moment().format('YYYY-MM-DD'),
        no_akun: '',
        nama_akun: '',
        kode_akun: '',
        nama_pemilik: '',
        no_rekening: '',
        no_account: '',
        bank: '',
        aktif: 'Y'
    });
    const [checkboxState, setCheckboxState] = useState({
        tanggal_input: true,
        akun: false,
        nama_pemilik: false,
        no_rekening: false,
        bank: false,
    });
    const [modalAkun, setModalAkun] = useState(false);
    const handleTgl = async (date: any, tipe: string) => {
        if (tipe === 'tanggal_awal') {
            setFilterState((oldData: any) => ({
                ...oldData,
                tanggal_awal: moment(date).format('YYYY-MM-DD'),
            }));
            setCheckboxState((oldData: any) => ({
                ...oldData,
                tanggal_input: true,
            }));
        }
    };
    console.log(filterState);
    
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
    const refereshData = async () => {
        startProgress();
        setLoadingMessage('Get Data Komparasi Saldo');
        try {
            let param1 = checkboxState.tanggal_input ? moment(filterState.tanggal_awal).format('YYYY-MM-DD') : 'all';
            let param2 = checkboxState.akun && filterState.no_account !== '' ? filterState.no_account : 'all';
            let param3 = checkboxState.bank && filterState.bank !== '' ? filterState.bank : 'all';
            let param4 = checkboxState.nama_pemilik && filterState.nama_pemilik !== '' ? filterState.nama_pemilik : 'all';
            let param5 = checkboxState.no_rekening && filterState.no_rekening !== '' ? filterState.no_rekening : 'all';
            const response = await axios.get(`${apiUrl}/erp/list_komparasi_saldo_akhir?`, {
                params: {
                    entitas: kode_entitas,
                    param1,
                    param2,
                    param3,
                    param4,
                    param5,
                    // Belum Sesuai Jumlah Data yang Muncul = [Semua, A-F]
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                onDownloadProgress: (progressEvent) => {
                    const total = progressEvent.total || 1; // Pastikan `total` tidak nol
                    const currentProgress = Math.round((progressEvent.loaded / total) * 100);
                    updateProgress(currentProgress); // Perbarui progress
                  },
            });
            console.log('response',response);
            const modfiedData = response.data.data.map((item: any) => {
                return {
                    ...item,
                    saldo_akhir: SpreadNumber(item.saldo_akhir),
                    balance: SpreadNumber(item.balance),
                    selisih: SpreadNumber(item.selisih),
                }
            })
            let temp: any;
            if(filterState.aktif == 'Y') {
                temp = modfiedData.filter((item: any) => item.aktif === 'Y')
            } else if (filterState.aktif == 'N') {
                temp = modfiedData.filter((item: any) => item.aktif === 'N')
            } else {
                temp = modfiedData
            }
            gridSaldo.current!.setProperties({dataSource: temp})
            gridSaldo.current!.refresh();
            endProgress();
            
            // const transformedData = response.data.data.map((item: any) => {
            //     return {
            //         ...item,
            //         liter: SpreadNumber(item.liter),
            //         nominal: SpreadNumber(item.nominal),
            //         servis: SpreadNumber(item.servis),
            //         kmawal: SpreadNumber(item.kmawal),
            //         kmakhir: SpreadNumber(item.kmakhir),
            //         kmjarak: SpreadNumber(item.kmjarak),
            //         jalan: SpreadNumber(item.jalan),
            //         kenek: SpreadNumber(item.kenek),
            //         parkir: SpreadNumber(item.parkir),
            //         tol: SpreadNumber(item.tol),
            //         bongkar: SpreadNumber(item.bongkar),
            //         mel: SpreadNumber(item.mel),
            //         lain: SpreadNumber(item.lain),
            //         rasio: SpreadNumber(item.rasio),
            //         jumlah_mu: SpreadNumber(item.jumlah_mu),
            //         pilih: 'N',
            //     };
            // });
            // setOriginalDataSource(transformedData);
            // setBokList(transformedData);
            // setOriginalNonModified(response.data.data);
            // setFilterKlasifikasi('semua');
        } catch (error: any) {
            endProgress();
            if (error.response.status === 401) {
                console.log('tidak ter otirasi');
            }
        }
    };
    useEffect(() => {
        if (kode_entitas) {
            refereshData();
        }
    }, [kode_entitas]);
    return (
        <div className="Main overflow-visible" id="main-target">
            <GlobalProgressBar />
            {modalAkun && (
                <AkunKas 
                apiUrl={apiUrl}
                kode_entitas={kode_entitas}
                visible={modalAkun}
                onClose={() => setModalAkun(false)}
                token={token}
                setCheckboxState={setCheckboxState}
                setHeaderDialogState={setFilterState}
                />
            )}
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
            <div className="flex items-center gap-3 space-x-2  p-1 ">
                <button
                    className={`rounded-md px-4 py-1.5 text-xs font-semibold  transition-colors duration-200 ${
                        isSidebarVisible ? 'bg-gray-200 text-gray-500' : 'bg-[#3a3f5c] text-white hover:bg-[#2f3451]'
                    }`}
                    onClick={() => setSidebarVisible(!isSidebarVisible)}
                >
                    Filter
                </button>
            </div>
            <div className="relative flex  h-full w-full gap-1">
                {isSidebarVisible && (
                    <div className="relative flex min-w-[250px] max-w-[260px] flex-col items-center justify-between overflow-hidden rounded-lg border-blue-400 bg-gray-300">
                        <div className="h-[30px]  w-full bg-[#dedede] py-1 pl-2">
                            Filter
                            <button
                                className="absolute right-3 top-1 flex items-center justify-center rounded-full border border-black p-0.5 text-xs"
                                onClick={() => setSidebarVisible(!isSidebarVisible)}
                            >
                                <IoClose />
                            </button>
                        </div>
                        <div className={`flex h-full w-full flex-col items-center rounded border border-black-light `}>
                            <div className="flex h-full w-full flex-col items-center overflow-x-auto bg-[#dedede] p-1 px-1.5">
                                <div className="mb-1 flex w-full flex-col">
                                    <label className="mb-1 flex items-center gap-2 text-xs">
                                        <input
                                            type="checkbox"
                                            checked={checkboxState.tanggal_input}
                                            onChange={(e) =>
                                                setCheckboxState((prev) => ({
                                                    ...prev,
                                                    tanggal_input: e.target.checked,
                                                }))
                                            }
                                        />{' '}
                                        Tanggal
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
                                    </div>
                                </div>

                                <div className="mb-1 flex w-full flex-col items-start gap-1 ">
                                    <label className="mb-0.5 flex items-center gap-2 text-xs">
                                        <input
                                            type="checkbox"
                                            checked={checkboxState.akun}
                                            onChange={(e) =>
                                                setCheckboxState((prev) => ({
                                                    ...prev,
                                                    akun: !prev.akun,
                                                }))
                                            }
                                        />{' '}
                                        {formatString('no_akun')}
                                    </label>
                                    <input
                                        type="text"
                                        id="no_akun"
                                        className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder={formatString('no_akun')}
                                        name="no_akun"
                                        value={filterState.no_akun}
                                        readOnly
                                        onChange={(e) => {setModalAkun(true); handleInputChange(e.target.value)}}
                                        // style={{ height: '4vh' }}
                                        autoComplete="off"
                                    />
                                    <div className="relative w-full">
                                        <input
                                            type="text"
                                            id="nama_akun"
                                            className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 pr-10 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            placeholder={formatString('nama_akun')}
                                            name="nama_akun"
                                            autoComplete="off"
                                            value={filterState.nama_akun}
                                        readOnly
                                        onChange={(e) => {setModalAkun(true); handleInputChange(e.target.value)}}
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
                                            checked={checkboxState.bank}
                                            onChange={(e) =>
                                                setCheckboxState((prev) => ({
                                                    ...prev,
                                                    bank: e.target.checked,
                                                }))
                                            }
                                        />{' '}
                                        {formatString('bank')}
                                    </label>
                                    <input
                                        type="text"
                                        id="bank"
                                        className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder={formatString('bank')}
                                        name="bank"
                                        value={filterState.bank}
                                        onChange={handleInputChange}
                                        // style={{ height: '4vh' }}
                                        autoComplete="off"
                                    />
                                </div>

                                <div className="mb-1 flex w-full flex-col items-start">
                                    <label className="mb-0.5 flex items-center gap-2 text-xs">
                                        <input
                                            type="checkbox"
                                            checked={checkboxState.no_rekening}
                                            onChange={(e) =>
                                                setCheckboxState((prev) => ({
                                                    ...prev,
                                                    no_rekening: e.target.checked,
                                                }))
                                            }
                                        />{' '}
                                        {formatString('no_rekening')}
                                    </label>
                                    <input
                                        type="text"
                                        id="no_rekening"
                                        className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder={formatString('no_rekening')}
                                        name="no_rekening"
                                        value={filterState.no_rekening}
                                        onChange={handleInputChange}
                                        
                                        // style={{ height: '4vh' }}
                                        autoComplete="off"
                                    />
                                </div>

                                <div className="mb-1 flex w-full flex-col items-start">
                                    <label className="mb-0.5 flex items-center gap-2 text-xs">
                                        <input
                                            type="checkbox"
                                            checked={checkboxState.nama_pemilik}
                                            onChange={(e) =>
                                                setCheckboxState((prev) => ({
                                                    ...prev,
                                                    nama_pemilik: e.target.checked,
                                                }))
                                            }
                                        />{' '}
                                        {formatString('nama_pemilik')}
                                    </label>
                                    <input
                                        type="text"
                                        id="nama_pemilik"
                                        className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder={formatString('nama_pemilik')}
                                        name="nama_pemilik"
                                        value={filterState.nama_pemilik}
                                        onChange={handleInputChange}
                                        // style={{ height: '4vh' }}
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="mb-1 flex w-full flex-col items-start">
                                    <label className="mb-2 text-xs font-semibold text-gray-700">Aktif</label>
                                    <div className="flex space-x-6">
                                        <label className="flex items-center text-xs font-medium text-gray-800">
                                            <input
                                                type="radio"
                                                name="aktif"
                                                value="Y"
                                                checked={filterState.aktif === 'Y'}
                                                onChange={handleInputChange}
                                                className="h-4 w-4 border-gray-300 text-blue-500 focus:ring-blue-400"
                                            />
                                            <span className="ml-2">Ya</span>
                                        </label>
                                        <label className="flex items-center text-xs font-medium text-gray-800">
                                            <input
                                                type="radio"
                                                name="aktif"
                                                value="N"
                                                checked={filterState.aktif === 'N'}
                                                onChange={handleInputChange}
                                                className="h-4 w-4 border-gray-300 text-blue-500 focus:ring-blue-400"
                                            />
                                            <span className="ml-2">Tidak</span>
                                        </label>
                                        <label className="flex items-center text-xs font-medium text-gray-800">
                                            <input
                                                type="radio"
                                                name="aktif"
                                                value="all"
                                                checked={filterState.aktif === 'all'}
                                                onChange={handleInputChange}
                                                className="h-4 w-4 border-gray-300 text-blue-500 focus:ring-blue-400"
                                            />
                                            <span className="ml-2">Semua</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="flex h-[10%] w-full items-center justify-center bg-white">
                                <button
                                    onClick={() => refereshData()}
                                    // ref={refRefresh}
                                    className="ml-3 flex h-7 items-center rounded-md bg-[#3a3f5c] p-2 py-1 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#2f3451]"
                                >
                                    <RiRefreshFill className="text-md" />
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className={` flex-1 overflow-x-auto rounded  bg-[#dedede] p-2`}>
                    <div className="h-ful w-full rounded bg-white p-1 ">
                        <div className="overflow-y-auto">
                            <GridListSaldo
                            gridSaldo={gridSaldo}
                            // rowSelecting={rowSelecting}
                            // bokList={bokList}
                            // handleSelect={handleSelect}
                            // handleRecordDoubleClick={handleRecordDoubleClick}
                            // formatDate={formatDate}
                            // gridBok={gridBok}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
