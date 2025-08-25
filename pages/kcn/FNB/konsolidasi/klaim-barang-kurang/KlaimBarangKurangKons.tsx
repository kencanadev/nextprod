import React, { useContext, useEffect, useRef, useState } from 'react';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import idIDLocalization from 'public/syncfusion/locale.json';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import { Inject } from '@syncfusion/ej2-react-grids';
import * as weekData from 'cldr-data/supplemental/weekData.json';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import moment from 'moment';
import axios from 'axios';
import { useSession } from '@/pages/api/sessionContext';
import { useRouter } from 'next/router';
import GridKonsolKBK from './GridKonsolKBK';
import { useProgress } from '@/context/ProgressContext';
import GlobalProgressBar from '@/components/GlobalProgressBar';
import { createContext } from 'react';
import DialogHistory from './DialogHistory';

import dynamic from 'next/dynamic';
import { ExampleProvider, useExample } from '../../../../../utils/konsolidasi/klaim-barang-kurang/ContexKlaimBarangKurang';
const GridDetail = dynamic(() => import('./GridDetail'), { ssr: false });

loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
L10n.load(idIDLocalization);
enableRipple(true);

function KlaimBarangKurangKons() {
    const { sessionData } = useSession();
    const { dialogOpen, setDialogOpen } = useExample();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const router = useRouter();
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const { startProgress, isLoading, updateProgress, endProgress, setLoadingMessage } = useProgress();
    const gridKBK = useRef<any>(null);
    const gridHistory = useRef<any>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [supplierPabrikList, setSupplierPabrikList] = useState<any>([]);
    const [showHistoryBayar, setShowHistoryBayar] = useState(false);
    const [selectedKBK, setSelectedKBK] = useState(0);
    const [filterState, setFilterState] = useState({
        tanggal_awal: moment().format('YYYY-MM-DD'),
        tanggal_akhir: moment().endOf('month').format('YYYY-MM-DD'),
        no_ba: '',
        no_faktur_jual: '',
        rba: 'all',
        status_pelunasan: '',
        nilai_umur: '',
    });

    const [checkboxState, setCheckboxState] = useState({
        tanggal_input: false,
        no_ba: false,
        no_faktur_jual: false,
        supplier_pabrik: false,
    });

    const [listEntitas, setListEntitas] = useState<any>([]);

    const [selectedEntitas, setSelectedEntitas] = useState<any>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<any>([]);

    function formatString(input: string) {
        // Split berdasarkan underscore (_)
        const words = input.split('_');

        // Kapitalisasi huruf pertama setiap kata
        const formattedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

        // Gabungkan kembali dengan spasi
        return formattedWords.join(' ');
    }

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
        } else if (tipe === 'tanggal_akhir') {
            setFilterState((oldData: any) => ({
                ...oldData,
                tanggal_akhir: moment(date).format('YYYY-MM-DD'),
            }));
            setCheckboxState((oldData: any) => ({
                ...oldData,
                tanggal_input: true,
            }));
        }
    };

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

    const pilihSemuaSupplier = async () => {
        if (selectedSupplier.length !== supplierPabrikList.length) {
            const cabang: any = [];
            await Promise.all(
                supplierPabrikList.map((item: any) => {
                    return cabang.push(item.nama_relasi);
                })
            );
            setSelectedSupplier([...cabang]);

            setCheckboxState((oldData) => ({
                ...oldData,
                supplier_pabrik: true,
            }));
        } else {
            setSelectedSupplier([]);
            setCheckboxState((oldData) => ({
                ...oldData,
                supplier_pabrik: false,
            }));
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

    const handleCheckboxChangeSupplier = (kode: any) => {
        console.log(`selectedEntitas.includes(${kode})`, selectedEntitas.includes(kode));

        setSelectedSupplier((prevSelectedEntitas: any) => {
            // Check if kode is already selected
            if (prevSelectedEntitas.includes(kode)) {
                // Remove the kode from selected codes if already selected
                const rev = prevSelectedEntitas.filter((item: any) => item !== kode);
                if (rev.length === 0) {
                    setCheckboxState((oldData) => ({
                        ...oldData,
                        supplier_pabrik: false,
                    }));
                }
                return rev;
            } else {
                setCheckboxState((oldData) => ({
                    ...oldData,
                    supplier_pabrik: true,
                }));
                // Add kode to selected codes if not already selected
                return [...prevSelectedEntitas, kode];
            }
        });
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
            const filteredData = response.data.data.filter((item: any) => {
                const kode = SpreadNumber(item.kodecabang); // angka
                const excluded = ['999', '01', '02', '206', '208', '800', '801', '802'];

                return item.tampil === 'Y' && !excluded.includes(item.kodecabang) && !(kode >= 500 && kode < 600);
            });

            setListEntitas(filteredData);
        } catch (error) {
            console.log();
        }
    };

    const handleStatusLunas = (e: any) => {
        const { name, value, checked } = e.target;

        let selected = filterState.status_pelunasan ? filterState.status_pelunasan.split(', ') : [];

        if (checked) {
            selected.push(value);
        } else {
            selected = selected.filter((item) => item !== value);
        }

        const temp = selected.join(', ');

        setFilterState((oldData) => ({
            ...oldData,
            status_pelunasan: temp,
        }));
    };

    const handleCekNilaiUmur = (e: any) => {
        const { name, value, checked } = e.target;

        let selected = filterState.nilai_umur ? filterState.nilai_umur.split(', ') : [];

        if (checked) {
            selected.push(value);
        } else {
            selected = selected.filter((item) => item !== value);
        }

        const temp = selected.join(', ');

        setFilterState((oldData) => ({
            ...oldData,
            nilai_umur: temp,
        }));
    };

    const SpreadNumber = (number: any | number | string) => {
        const temp = isNaN(parseFloat(parseFloat(number).toFixed(2))) ? 0 : parseFloat(parseFloat(number).toFixed(2));
        return temp;
    };

    // console.log(filterState);

    const refreshData = async () => {
        startProgress();
        function encodeSupplierName(name: string): string {
            return encodeURIComponent(name.trim()).replace(/%20$/, '');
        }

        try {
            const baseURL = 'http://10.10.1.109/api/v1/report/konsolidasi?';
            console.log('selectedSupplier', selectedEntitas);

            setLoadingMessage('Mengambil Data');
            const param1 = `param1=${selectedEntitas.join(',')}`;
            const param2 = `&param2=${selectedSupplier.map((supplier: any) => encodeSupplierName(supplier)).join(';')}`;
            // &param2=BAJA%20PERKASA%20SENTOSA,%20PT

            let param3, param4;
            if (checkboxState.tanggal_input) {
                param3 = `&param3=${moment(filterState.tanggal_awal).format('YYYY-MM-DD')}`;
                param4 = `&param4=${moment(filterState.tanggal_akhir).format('YYYY-MM-DD')}`;
            } else {
                param3 = `&param3=2000-01-01`;
                param4 = `&param4=${moment().add(7, 'days').format('YYYY-MM-DD')}`; // 7 hari ke depan
            }

            const param5 = checkboxState.no_ba ? `&param5=${filterState.no_ba}` : '&param5=all';
            const param6 = checkboxState.no_faktur_jual ? `&param6=${filterState.no_faktur_jual}` : '&param6=all';

            const isCheckedLunas = (document.getElementById('status_lunas_id') as HTMLInputElement)?.checked;

            let SFilter = filterState.status_pelunasan.replace(/, /g, '|');
            console.log('isCheckedLunas', SFilter);
            const param7 = isCheckedLunas ? `&param7=${SFilter}` : '&param7=all';
            // const param7 = '&param7=all';

            let param8 = `&param8=${filterState.rba}`;
            // if (rgRBa.itemIndex === 0) param8 = "&param8=Y";
            // else if (rgRBa.itemIndex === 1) param8 = "&param8=N";

            // SFilter = getFilterUmur().replace(/"/g, "");
            // const param9 = chbUmur.checked || SFilter !== "" ? `&param9=${SFilter}` : "&param9=all";
            const isCheckedUmur = (document.getElementById('status_umur_id') as HTMLInputElement)?.checked;

            let SFilterUmur = filterState.nilai_umur.replace(/, /g, '|');
            const param9 = isCheckedUmur ? `&param9=${SFilterUmur}` : '&param9=all';

            // const paramLimit = chTampil.checked ? "&paramLimit=all" : `&paramLimit=${edMax.value}`;
            const paramLimit = '&paramLimit=all';

            let param10 = '&param10=all';
            // if (rgKlasifikasi.itemIndex === 0) param10 = "&param10=ditolak";
            // else if (rgKlasifikasi.itemIndex === 1) param10 = "&param10=acc";
            // else if (rgKlasifikasi.itemIndex === 2) param10 = "&param10=sebagian";

            // const param11 = `&param11=all`;

            const fullURL = `${baseURL}${param1}${param2}${param3}${param4}${param5}${param6}${param7}${param8}${param9}${paramLimit}${param10}`;
            console.log('fullURL', `${fullURL.toString()}`);

            console.log('Fetching data from:', fullURL);

            const response = await axios.post(
                fullURL,
                {},
                {
                    onDownloadProgress: (progressEvent) => {
                        const total = progressEvent.total || 1; // Pastikan `total` tidak nol
                        const currentProgress = Math.round((progressEvent.loaded / total) * 100);
                        updateProgress(currentProgress); // Perbarui progress
                    },
                }
            );
            setLoadingMessage('Menyusun Data');
            updateProgress(40);
            const modData = response.data.content.map((item: any) => ({
                ...item,
                pabrik: decodeURIComponent(item.pabrik).replace(/[\x00-\x1F\x7F]/g, ''),
                tgl_fbm: moment(item.tgl_fbm, 'DD-MM-YYYY').isValid() ? moment(item.tgl_fbm, 'DD-MM-YYYY').toDate() : null,
                tgl_fj: moment(item.tgl_fj, 'DD-MM-YYYY').isValid() ? moment(item.tgl_fj, 'DD-MM-YYYY').toDate() : null,
                tgl_ba_dikirim: moment(item.tgl_ba_dikirim, 'YYYY-MM-DD HH:mm:ss').isValid() ? moment(item.tgl_ba_dikirim, 'YYYY-MM-DD HH:mm:ss').toDate() : null,
                tgl_rba: moment(item.tgl_rba, 'DD-MM-YYYY').isValid() ? moment(item.tgl_rba, 'DD-MM-YYYY').toDate() : null,
                jatuh_tempo: moment(item.jatuh_tempo, 'DD-MM-YYYY').isValid() ? moment(item.jatuh_tempo, 'DD-MM-YYYY').toDate() : null,
                pu_tanggal: moment(item.pu_tanggal, 'YYYY-MM-DD HH:mm:ss').isValid() ? moment(item.pu_tanggal, 'YYYY-MM-DD HH:mm:ss').toDate() : null,
                pu_ket_tanggal: moment(item.pu_ket_tanggal, 'YYYY-MM-DD HH:mm:ss').isValid() ? moment(item.pu_ket_tanggal, 'YYYY-MM-DD HH:mm:ss').toDate() : null,
                ku_tanggal: moment(item.ku_tanggal, 'YYYY-MM-DD HH:mm:ss').isValid() ? moment(item.ku_tanggal, 'YYYY-MM-DD HH:mm:ss').toDate() : null,
                ku_ket_tanggal: moment(item.ku_ket_tanggal, 'YYYY-MM-DD HH:mm:ss').isValid() ? moment(item.ku_ket_tanggal, 'YYYY-MM-DD HH:mm:ss').toDate() : null,
                nominal: SpreadNumber(item.nominal),
                umur: SpreadNumber(item.umur),
                nominal_rba: SpreadNumber(item.nominal_rba),
                sisa_nominal: SpreadNumber(item.sisa_nominal),
                dummyUser: userid.toUpperCase(),
            }));
            console.log('modData', modData, response.data.content);
            updateProgress(80);
            gridKBK.current.setProperties({ dataSource: modData });
            setLoadingMessage('');
            endProgress();
            // return response.data;
        } catch (error) {
            console.error('Error fetching konsolidasi data:', error);
            endProgress();
            return null;
        }
    };

    const getSupplierPabrik = async () => {
        if (kode_entitas === '999') {
            const res = await axios.get(`${apiUrl}/erp/list_supplier?entitas=999&param1=all&param2=all&param3=all&param4=all&param5=all&param6=all`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const modified = res.data.data.filter((item: any) => item.jenis_pabrik === 'Y');
            setSupplierPabrikList(modified.sort((a: any, b: any) => a.nama_relasi.localeCompare(b)));
        } else if (kode_entitas === '898' || kode_entitas === '698') {
            const res = await axios.get(`${apiUrl}/erp/list_supplier?entitas=${kode_entitas}&param1=all&param2=all&param3=all&param4=all&param5=all&param6=all`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const modified = res.data.data.filter((item: any) => item.jenis_pabrik === 'Y');
            const sortedSuppliers = modified.sort((a: any, b: any) => a.nama_relasi.trim().toLowerCase().localeCompare(b.nama_relasi.trim().toLowerCase()));
            console.log('modified temp', sortedSuppliers);

            setSupplierPabrikList(sortedSuppliers);
        } else {
            // const res = axios.get(`${apiUrl}/list_supplier?entitas=${}&param1=all&param2=all&param3=all&param4=all&param5=all&param6=all`)
        }
    };

    useEffect(() => {
        if (token) {
            getAllEntitas();
            getSupplierPabrik();
        }
    }, [token]);

    const formatDate: Object = { type: 'date', format: 'dd-MM-yyyy' };

    const handleSelect = (args: any) => {};
    const handleRecordDoubleClick = (args: any) => {};

    return (
        <ExampleProvider>
            <div className="flex h-[620px] w-full flex-col " id="main-target">
                {showHistoryBayar && <DialogHistory visible={showHistoryBayar} onClose={() => setShowHistoryBayar(false)} gridRef={gridKBK} indexSelect={selectedKBK} gridHistory={gridHistory} />}

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
                    .e-grid .e-rowcell {
                        font-size: 11px !important;
                    }
                        #checkbox-grid-column8 {
                           margin-left: auto;
                        }
                `}
                </style>
                <div className="flex w-full flex-grow gap-1 ">
                    <div className="flex h-full min-w-[300px] flex-col rounded-lg bg-[#dedede]">
                        <div className="box-border flex h-[10%] items-center justify-between border-b border-b-black px-2 text-lg font-bold">
                            <h2 className="">FILTER</h2>
                        </div>
                        <div className="box-border h-[550px] overflow-x-auto px-3">
                            <div className="mb-1 flex flex-col">
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
                                    Tanggal Input
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

                                <div className="mb-1 flex w-full flex-col items-start">
                                    <label className="mb-1 flex items-center gap-2 text-xs">
                                        <input
                                            type="checkbox"
                                            checked={checkboxState.supplier_pabrik}
                                            onChange={(e: any) =>
                                                setCheckboxState((prev) => ({
                                                    ...prev,
                                                    supplier_pabrik: e.target.checked,
                                                }))
                                            }
                                        />{' '}
                                        Supplier / Pabrik {`(MASTER 898)`}
                                    </label>
                                    <label className="mb-0.5 flex items-center gap-2 text-xs">{formatString('')}</label>
                                    <div className="box-border h-[250px] w-full flex-grow overflow-x-auto rounded-md bg-white p-2">
                                        <div className="mb-0.5 flex items-center">
                                            <input type="checkbox" id="all-entitas" onChange={pilihSemuaSupplier} checked={supplierPabrikList.length === selectedSupplier.length} />
                                            <label htmlFor={`all-entitas`} className="m-0 text-xs text-gray-900">
                                                {`pilih semua`}
                                            </label>
                                        </div>
                                        {supplierPabrikList.map((item: any) => (
                                            <div key={item.kode_supp} className="mb-0.5 flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`checkbox-${item.nama_relasi}`}
                                                    value={item.nama_relasi}
                                                    checked={selectedSupplier.includes(item.nama_relasi)}
                                                    onChange={() => handleCheckboxChangeSupplier(item.nama_relasi)}
                                                />
                                                <label htmlFor={`checkbox-${item.kode_supp}`} className="m-0 text-xs text-gray-900">
                                                    {item.nama_relasi}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-1 flex w-full flex-col items-start">
                                    <label className="mb-0.5 flex items-center gap-2 text-xs">
                                        <input
                                            type="checkbox"
                                            checked={checkboxState.no_ba}
                                            onChange={(e) =>
                                                setCheckboxState((prev) => ({
                                                    ...prev,
                                                    no_ba: e.target.checked,
                                                }))
                                            }
                                        />{' '}
                                        {formatString('no_ba')}
                                    </label>
                                    <input
                                        type="text"
                                        id="no_ba"
                                        className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder={formatString('no_ba')}
                                        name="no_ba"
                                        value={filterState.no_ba}
                                        onChange={handleInputChange}
                                        // style={{ height: '4vh' }}
                                        autoComplete="off"
                                    />
                                </div>

                                <div className="mb-1 flex w-full flex-col items-start">
                                    <label className="mb-0.5 flex items-center gap-2 text-xs">
                                        <input
                                            type="checkbox"
                                            checked={checkboxState.no_faktur_jual}
                                            onChange={(e) =>
                                                setCheckboxState((prev) => ({
                                                    ...prev,
                                                    no_faktur_jual: e.target.checked,
                                                }))
                                            }
                                        />{' '}
                                        {formatString('no_faktur_jual')}
                                    </label>
                                    <input
                                        type="text"
                                        id="no_faktur_jual"
                                        className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder={formatString('no_faktur_jual')}
                                        name="no_faktur_jual"
                                        value={filterState.no_faktur_jual}
                                        onChange={handleInputChange}
                                        // style={{ height: '4vh' }}
                                        autoComplete="off"
                                    />
                                </div>

                                <div className="mb-1 flex w-full flex-col items-start">
                                    <label className="mb-1 flex items-center gap-2 text-xs">
                                        <input id="status_lunas_id" type="checkbox" checked={filterState.status_pelunasan.length !== 0} readOnly /> Status Lunas
                                    </label>
                                    <div className="box-border h-[100px] w-full flex-grow overflow-x-auto rounded-md bg-white p-2">
                                        <div className="mb-0.5 flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`checkbox-belum-lunas`}
                                                name="belum_lunas"
                                                value="Belum Lunas"
                                                checked={filterState.status_pelunasan.includes('Belum Lunas')}
                                                onChange={handleStatusLunas}
                                            />
                                            <label htmlFor={`checkbox-belum-lunas`} className="m-0 text-xs text-gray-900">
                                                {`${formatString('belum_lunas')}`}
                                            </label>
                                        </div>

                                        <div className="mb-0.5 flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`checkbox-lunas-sebagian`}
                                                name="lunas_sebagian"
                                                value="Lunas Sebagian"
                                                checked={filterState.status_pelunasan.includes('Lunas Sebagian')}
                                                onChange={handleStatusLunas}
                                            />
                                            <label htmlFor={`checkbox-lunas-sebagian`} className="m-0 text-xs text-gray-900">
                                                {`${formatString('lunas_sebagian')}`}
                                            </label>
                                        </div>

                                        <div className="mb-0.5 flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`checkbox-lunas_semua`}
                                                name="lunas_semua"
                                                value="Lunas Semua"
                                                checked={filterState.status_pelunasan.includes('Lunas Semua')}
                                                onChange={handleStatusLunas}
                                            />
                                            <label htmlFor={`checkbox-lunas-sebagian`} className="m-0 text-xs text-gray-900">
                                                {`${formatString('lunas_semua')}`}
                                            </label>
                                        </div>

                                        <div className="mb-0.5 flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`checkbox-tanpa_faktur`}
                                                name="tanpa_faktur"
                                                value="Tanpa Faktur"
                                                checked={filterState.status_pelunasan.includes('Tanpa Faktur')}
                                                onChange={handleStatusLunas}
                                            />
                                            <label htmlFor={`checkbox-lunas-sebagian`} className="m-0 text-xs text-gray-900">
                                                {`${formatString('tanpa_faktur')}`}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-1 flex w-full flex-col items-start">
                                    <label className="mb-2 text-xs font-semibold text-gray-700">RBA</label>
                                    <div className="flex space-x-6">
                                        <label className="flex items-center text-xs font-medium text-gray-800">
                                            <input
                                                type="radio"
                                                name="rba"
                                                value="Y"
                                                checked={filterState.rba === 'Y'}
                                                onChange={handleInputChange}
                                                className="h-4 w-4 border-gray-300 text-blue-500 focus:ring-blue-400"
                                            />
                                            <span className="ml-2">Ya</span>
                                        </label>
                                        <label className="flex items-center text-xs font-medium text-gray-800">
                                            <input
                                                type="radio"
                                                name="rba"
                                                value="N"
                                                checked={filterState.rba === 'N'}
                                                onChange={handleInputChange}
                                                className="h-4 w-4 border-gray-300 text-blue-500 focus:ring-blue-400"
                                            />
                                            <span className="ml-2">Tidak</span>
                                        </label>
                                        <label className="flex items-center text-xs font-medium text-gray-800">
                                            <input
                                                type="radio"
                                                name="rba"
                                                value="all"
                                                checked={filterState.rba === 'all'}
                                                onChange={handleInputChange}
                                                className="h-4 w-4 border-gray-300 text-blue-500 focus:ring-blue-400"
                                            />
                                            <span className="ml-2">Semua</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="mb-1 flex w-full flex-col items-start">
                                    <label className="mb-1 flex items-center gap-2 text-xs">
                                        <input id="status_umur_id" type="checkbox" checked={filterState.nilai_umur.length !== 0} readOnly /> Nilai Umur
                                    </label>
                                    <div className="box-border h-[100px] w-full flex-grow overflow-x-auto rounded-md bg-white p-2">
                                        <div className="mb-0.5 flex items-center">
                                            <input type="checkbox" id={`checkbox-0-14`} name="0-14" value="00-14" checked={filterState.nilai_umur.includes('00-14')} onChange={handleCekNilaiUmur} />
                                            <label htmlFor={`checkbox-0-14`} className="m-0 text-xs text-gray-900">
                                                {`${formatString('0-14')}`}
                                            </label>
                                        </div>

                                        <div className="mb-0.5 flex items-center">
                                            <input type="checkbox" id={`checkbox-15-30`} name="15-30" value="15-30" checked={filterState.nilai_umur.includes('15-30')} onChange={handleCekNilaiUmur} />
                                            <label htmlFor={`checkbox-15-30`} className="m-0 text-xs text-gray-900">
                                                {`${formatString('15-30')}`}
                                            </label>
                                        </div>

                                        <div className="mb-0.5 flex items-center">
                                            <input type="checkbox" id={`checkbox-31-45`} name="31-45" value="31-45" checked={filterState.nilai_umur.includes('31-45')} onChange={handleCekNilaiUmur} />
                                            <label htmlFor={`checkbox-31-45`} className="m-0 text-xs text-gray-900">
                                                {`${formatString('31-45')}`}
                                            </label>
                                        </div>

                                        <div className="mb-0.5 flex items-center">
                                            <input type="checkbox" id={`checkbox-46-60`} name="46-60" value="46-60" checked={filterState.nilai_umur.includes('46-60')} onChange={handleCekNilaiUmur} />
                                            <label htmlFor={`checkbox-46-60`} className="m-0 text-xs text-gray-900">
                                                {`${formatString('46-60')}`}
                                            </label>
                                        </div>

                                        <div className="mb-0.5 flex items-center">
                                            <input type="checkbox" id={`checkbox-60`} name=">60" value="00-99" checked={filterState.nilai_umur.includes('00-99')} onChange={handleCekNilaiUmur} />
                                            <label htmlFor={`checkbox-60`} className="m-0 text-xs text-gray-900">
                                                {`${formatString('>60')}`}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex h-[10%] items-center justify-center">
                            <button className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]" onClick={refreshData}>
                                Refresh
                            </button>
                        </div>
                    </div>
                    <div className="flex h-full flex-grow flex-col gap-1 overflow-x-auto rounded-lg border bg-[#dedede] p-1">
                        <div className="flex h-[30px] w-full justify-between">
                            <button
                                className="rounded-md bg-[#3a3f5c] px-4 py-1.5 text-xs font-semibold text-white  transition-colors duration-200 hover:bg-[#2f3451]"
                                onClick={() => {
                                    setShowHistoryBayar(true);
                                }}
                            >
                                History Bayar
                            </button>

                            <h2 className="text-lg">Konsolidasi Klaim Barang Kurang</h2>
                        </div>

                        <div className="w-full flex-grow rounded-lg bg-white p-2">
                            <GridKonsolKBK
                                showDetail={showDetail}
                                handleSelect={handleSelect}
                                handleRecordDoubleClick={handleRecordDoubleClick}
                                formatDate={formatDate}
                                gridKBK={gridKBK}
                                selectedKBK={selectedKBK}
                                setSelectedKBK={setSelectedKBK}
                                dialogOpen={dialogOpen}
                                refreshData={refreshData}
                                setDialogOpen={setDialogOpen}
                            />
                        </div>
                        {showDetail && (
                            <div className="w-full flex-grow rounded-lg bg-white p-2">
                                <GridDetail gridRef={gridKBK} indexSelect={selectedKBK} />
                            </div>
                        )}

                        <div className="flex h-[15px] w-full justify-between">
                            <label className="mb-0.5 flex items-center gap-2 text-xs">
                                <input type="checkbox" checked={showDetail} onChange={(e) => setShowDetail(!showDetail)} /> {formatString('tampilkan_detail_barang')}
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </ExampleProvider>
    );
}

export default KlaimBarangKurangKons;
