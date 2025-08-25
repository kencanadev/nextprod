import { useState, useRef } from 'react';
import 'flatpickr/dist/flatpickr.css';
import 'tippy.js/dist/tippy.css';
import styles from './spplist.module.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/light.css';
import { useRouter } from 'next/router';
import moment from 'moment';
import 'moment/locale/id';
import { generateNU, showLoading, frmNumber } from '@/utils/routines';
import { FillFromSQL } from '@/utils/routines';
import React from 'react';
import { faSort, faSortUp, faSortDown, faCircle, faCirclePlus, faCircleMinus } from '@fortawesome/free-solid-svg-icons';
import { faPlusCircle, faCamera, faMagnifyingGlass, faPlay, faList, faSave, faBackward, faPrint, faTrash, faCancel, faFileArchive, faTableList } from '@fortawesome/free-solid-svg-icons';
import { Table, Header, HeaderRow, Body, Row, HeaderCell, Cell } from '@table-library/react-table-library/table';
import { useTheme } from '@table-library/react-table-library/theme';
import { useSort } from '@table-library/react-table-library/sort';

import axios from 'axios';

import { FaPlusCircle } from 'react-icons/fa';
import ItemDlg from './modal/itemdlg';
import { constant, noConflict, result } from 'lodash';
import { json } from 'stream/consumers';
import { alertTitleClasses } from '@mui/material';
import { error } from 'console';
import Swal from 'sweetalert2';

import { HeaderCellSelect, CellSelect, SelectClickTypes, SelectTypes, useRowSelect } from '@table-library/react-table-library/select';
import { abort, exit } from 'process';

import TableBarangJadi from './component/tableBarangJadi';
import TableBarangProduksi from './component/tableProduksi';
import { format } from 'path';
import { string } from 'yup';
import { parseJsonText } from 'typescript';
import { stringify } from 'querystring';
import { ReCalcDataNodes, ReCalcDataNodesApprove, ReCalcDataNodesBatal, ReCalcDataNodesEdit } from './component/reCalc';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs, Inject } from '@syncfusion/ej2-react-calendars';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
import idIDLocalization from 'public/syncfusion/locale.json';
L10n.load(idIDLocalization);
enableRipple(true);

const key = 'Pagination';

// interface PPProps {
//     userid: any;
//     kode_entitas: any;
// }

import { useSession } from '@/pages/api/sessionContext';
import { SpreadNumber } from '@/pages/kcn/ERP/fa/fpp/utils';

let routeTglAwal: any, routeTglAkhir: any, routeTipeDokumen: any;
const spp = () => {
    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';

    if (isLoading) {
        return;
    }

    const router = useRouter();
    const rowData = [];

    const [kodePPValue, setKodePPValue] = useState<string>('');
    const [noPPValue, setNoPPValue] = useState<any>('');
    const [date1, setDate1] = useState<moment.Moment | any>(moment());
    const [tanggalPPValue, setTanggalPPValue] = useState<any>(moment());
    const [kodedeptValue, setKodedeptValue] = useState<any[]>([]);
    const [keteranganValue, setKeteranganValue] = useState<any>('');

    const [selectedKodedept, setSelectedKodedept] = useState<any>(['']);
    const [DisableTanggalValue, setDisableTanggalValue] = useState(true);

    const [tgl_update, settgl_update] = useState<moment.Moment>(moment());

    const [selectcellid_ppValue, setselectcellid_ppValue] = useState<any>('');
    //footer
    const [TotalBeratValue, setTotalBeratValue] = useState<any>(0);

    // Fetch and process data
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    const [dataDetail, setDataDetail] = useState({ nodes: [] });

    const [JenisTabelValue, setJenisTabelValue] = useState<string>('');
    const [JenisFormValue, setJenisFormValue] = useState<any>(moment());
    const [StatusValue, setStatusValue] = useState<string>('');
    const [ProduksiValue, setProduksiValue] = useState<string>('');
    const [TombolSimpanValue, setTombolSimpanValue] = useState<boolean>(false);
    const [TombolAppValue, setTombolAppValue] = useState<boolean>(false);
    const [TombolBatalValue, setTombolBatalValue] = useState<boolean>(false);

    const mounted = useRef(false);
    // console.log(tanggalPPValue, 'tanggalPPValue');

    useEffect(() => {
        const { kode_pp, name, form_app, tglAwal, tglAkhir, vTipeDokumen } = router.query;
        if (!mounted.current) {
            mounted.current = true;
            routeTglAwal = tglAwal;
            routeTglAkhir = tglAkhir;
            routeTipeDokumen = vTipeDokumen;
            if (userid === 'administrator') {
                setDisableTanggalValue(false);
            } else {
                setDisableTanggalValue(true);
            }

            if (name === 'produksi') {
                setJenisTabelValue(name);
                handleSubmit();
            } else if (name === 'barangjadi' || name === 'nonPersediaan') {
                setJenisTabelValue(name);
                handleSubmit();
            }

            if (form_app === 'Y') {
                setTombolSimpanValue(false);
                setTombolAppValue(true);
                setTombolBatalValue(false);
            } else if (form_app === 'N') {
                setTombolSimpanValue(true);
                setTombolAppValue(false);
                setTombolBatalValue(false);
            } else if (form_app === 'B') {
                setTombolSimpanValue(false);
                setTombolAppValue(false);
                setTombolBatalValue(true);
            } else if (form_app === 'ViewOnly') {
                setTombolSimpanValue(false);
                setTombolAppValue(false);
                setTombolBatalValue(false);
            } else {
                setTombolSimpanValue(true);
                setTombolAppValue(false);
                setTombolBatalValue(false);
            }

            if (kode_pp !== '' && kode_pp !== 'BARU') {
                // edit load header =================================
                setJenisFormValue('EDIT');
                const fetchDataHeader = async () => {
                    try {
                        const responseHeader = await axios.get(`${apiUrl}/erp/list_pp_header?`, {
                            params: {
                                entitas: kode_entitas,
                                param1: kode_pp, //'PP0000013083',
                            },
                        });

                        const resultHeader = responseHeader.data;

                        if (resultHeader.status) {
                            const EditDataHeader = resultHeader.data.map((item: any) => {
                                setKodePPValue(item.kode_pp);
                                setNoPPValue(item.no_pp);
                                setTanggalPPValue(item.tgl_pp);
                                setSelectedKodedept(item.kode_dept);
                                setKeteranganValue(item.keterangan);
                                setStatusValue(item.status);
                                setProduksiValue(item.produksi);
                            });
                        }
                    } catch (error) {
                        console.error('Error fetching data:', error);
                    }
                };
                fetchDataHeader();

                //edit load detail ==============================

                const fetchData = async () => {
                    try {
                        const response = await axios.get(`${apiUrl}/erp/list_pp_detail?`, {
                            params: {
                                entitas: kode_entitas,
                                param1: kode_pp, //'PP0000013083',
                            },
                        });

                        const result = response.data;
                        //  console.log(result.data,'sfsfsfsf');

                        if (result.status) {
                            setDataDetail((state: any) => {
                                const EditDataDetail = result.data.map((item: any) => {
                                    const id_fpp_qty = document.getElementById('id_fpp_qty' + item.id_pp) as HTMLInputElement;
                                    const id_fpp_diameter = document.getElementById('id_fpp_diameter' + item.id_pp) as HTMLInputElement;
                                    const id_fpp_jarak = document.getElementById('id_fpp_jarak' + item.id_pp) as HTMLInputElement;
                                    const id_fpp_kg = document.getElementById('id_fpp_kg' + item.id_pp) as HTMLInputElement;
                                    const id_fpp_harga_kg = document.getElementById('id_fpp_harga_kg' + item.id_pp) as HTMLInputElement;
                                    const id_fpp_btg = document.getElementById('id_fpp_btg' + item.id_pp) as HTMLInputElement;
                                    const id_fpp_harga_btg = document.getElementById('id_fpp_harga_btg' + item.id_pp) as HTMLInputElement;
                                    const id_qty = document.getElementById('id_qty' + item.id_pp) as HTMLInputElement;
                                    const id_berat = document.getElementById('id_berat' + item.id_pp) as HTMLInputElement;

                                    // display biar tidak default value
                                    if (id_fpp_qty) {
                                        id_fpp_qty.value = frmNumber(item.fpp_qty);
                                    }
                                    if (id_fpp_diameter) {
                                        id_fpp_diameter.value = frmNumber(item.fpp_diameter);
                                    }
                                    if (id_fpp_jarak) {
                                        id_fpp_jarak.value = frmNumber(item.fpp_jarak);
                                    }
                                    if (id_fpp_kg) {
                                        id_fpp_kg.value = frmNumber(item.fpp_kg);
                                    }
                                    if (id_fpp_harga_kg) {
                                        id_fpp_harga_kg.value = frmNumber(item.fpp_harga_kg);
                                    }
                                    if (id_fpp_btg) {
                                        id_fpp_btg.value = frmNumber(item.fpp_btg);
                                    }
                                    if (id_fpp_harga_btg) {
                                        id_fpp_harga_btg.value = frmNumber(item.fpp_harga_btg);
                                    }
                                    if (id_qty) {
                                        id_qty.value = frmNumber(item.qty);
                                    }
                                    if (id_berat) {
                                        id_berat.value = frmNumber(item.berat);
                                    }

                                    // load detail
                                    return {
                                        // [property]: item.kode_pp,

                                        kode_pp: item.kode_pp,
                                        id_pp: item.id_pp,
                                        id: item.id,
                                        id_ket: item.id_ket,
                                        stok: item.stok,
                                        kode_item: item.kode_item,
                                        diskripsi: item.diskripsi,
                                        satuan: item.satuan,
                                        qty: frmNumber(item.qty),
                                        sat_std: item.sat_std,
                                        qty_std: frmNumber(item.qty_std),
                                        qty_sisa: frmNumber(item.qty_sisa),
                                        qty_batal: frmNumber(item.qty_batal),
                                        tgl_butuh: item.tgl_butuh,
                                        fpp_qty: frmNumber(item.fpp_qty),
                                        fpp_diameter: frmNumber(item.fpp_diameter),
                                        fpp_kg: frmNumber(item.fpp_kg),
                                        fpp_btg: frmNumber(item.fpp_btg),
                                        fpp_harga_kg: frmNumber(item.fpp_harga_kg),
                                        fpp_harga_btg: frmNumber(item.fpp_harga_btg),
                                        fpp_jarak: frmNumber(item.fpp_jarak),
                                        kode_prapp: item.kode_prapp,
                                        id_prapp: item.id_prapp,
                                        no_item: item.no_item,
                                        brt: item.brt,
                                        berat: frmNumber(item.berat),
                                        sisa: item.sisa,
                                        stokhi: item.stokhi,
                                        dijual: item.dijual,
                                        dibeli: item.dibeli,
                                        status: item.status,
                                        panjang: item.panjang,
                                        tgl_pp: item.tgl_pp,
                                        tgl_update: item.tgl_update,
                                        approval: item.approval,
                                        tgl_approval: item.tgl_approval,
                                    };
                                });

                                // const existingNodes = state.nodes.filter((node: any) => node.no_pp === noPp);
                                const newNodes = [...EditDataDetail];

                                return { ...state, nodes: newNodes }; // Memperbarui nodes dengan data yang diperbarui
                            });
                        }
                    } catch (error) {
                        console.error('Error fetching data:', error);
                    }
                };
                fetchData();
            }
            //jika baru ===========================
            else {
                setJenisFormValue('BARU');
                setStatusValue('Terbuka');
                // global function
                generateNU(kode_entitas, '', '01', moment(date1).format('YYYYMM'))
                    .then((result) => {
                        setNoPPValue(result);
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            }
        } else {
        }
    }, [router.query]);

    const sort = useSort(
        dataDetail,
        {
            onChange: onSortChange,
        },
        {
            sortFns: {
                NO_BARANG: (array) => array.sort((a, b) => a.no_item.localeCompare(b.no_item)),
            },
        }
    );

    function onSortChange(action: any, state: any) {
        //  console.log(action, state);
    }

    const getIcon = (sortKey: any) => {
        if (sort.state.sortKey === sortKey && sort.state.reverse) {
            return <FontAwesomeIcon icon={faSortDown} className="ml-2 mt-1" width="15" height="15" />;
        }

        if (sort.state.sortKey === sortKey && !sort.state.reverse) {
            return <FontAwesomeIcon icon={faSortUp} className="ml-2 mt-1" width="15" height="15" />;
        }

        return <FontAwesomeIcon icon={faSort} className="ml-2 mt-1" width="15" height="15" />;
    };

    useEffect(() => {
        FillFromSQL(kode_entitas, 'departemen')
            .then((result) => {
                setKodedeptValue(result);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }, []);

    //recalc
    useEffect(() => {
        const { kode_pp, name } = router.query;
        if (kode_pp !== '' && kode_pp !== 'BARU') {
            const total = dataDetail.nodes.reduce((Recalc, item: any) => Recalc + newFrmNumber(item.qty) * newFrmNumber(item.brt), 0);
            // setTotalBeratValue(
            //     parseFloat(toString( total)).toLocaleString('en-US', {
            //         minimumFractionDigits: 2,
            //     })
            // );
            setTotalBeratValue(total);
        }
    }, [dataDetail]);

    const handleSubmit = () => {
        //   const id = Math.floor(Math.random() * (9990 - 0 + 1)) + 0;
        const id = dataDetail.nodes.length + 1;

        const newNode = {
            kode_pp: '',
            id_pp: id,
            id: id,
            id_ket: id,
            stok: 'Y',
            kode_item: '',
            no_item: '',
            diskripsi: '',
            satuan: '',
            qty: 0,
            sat_std: '',
            qty_std: 0,
            qty_sisa: 0,
            qty_batal: 0,
            tgl_butuh: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
            panjang: 0,
            fpp_qty: 0,
            fpp_diameter: 0,
            fpp_kg: 0,
            fpp_harga: 0,
            fpp_btg: 0,
            fpp_harga_kg: 0,
            fpp_harga_btg: 0,
            fpp_jarak: 0,
            brt: 0,
            berat: 0,
        };

        const hasEmptyFields = dataDetail.nodes.some((row: { no_item: string }) => row.no_item === '');
        const hasQtyNol = dataDetail.nodes.some((row: { qty: number }) => row.qty <= 0);

        if (hasEmptyFields) {
            Swal.fire({
                title: 'Harap isi Data Barang sebelum tambah data.',
                icon: 'error',
            });
            throw 'exit';
        } else if (hasQtyNol) {
            Swal.fire({
                title: 'Qty tidak boleh lebih kecil atau sama dengan Nol.',
                icon: 'error',
            });
            throw 'exit';
        } else {
            setDataDetail((state: any) => ({
                ...state,
                nodes: state.nodes.concat(newNode),
            }));
        }

        // event.preventDefault();
    };

    const handleselectcell = async (vid_pp: any) => {
        setselectcellid_ppValue(vid_pp);

        //   console.log(vid_pp,'vid pp');
    };

    function roundTo(value: any, digit: any) {
        const factor = Math.pow(10, -digit);
        return Math.round(value / factor) * factor;
    }

    const handleRemove = () => {
        if (dataDetail.nodes.length === 1) {
            Swal.fire({
                title: 'Tidak bisa menghapus baris data terakhir, sisakan setidaknya 1 baris data untuk ditampilkan.',
                icon: 'error',
            });
        } else {
            Swal.fire({
                title: 'Hapus Data Barang ?',
                showCancelButton: true,
                confirmButtonText: 'Ya',
                cancelButtonText: 'Batal',
            }).then((result) => {
                if (result.isConfirmed) {
                    setDataDetail((state) => ({
                        ...state,
                        nodes: state.nodes.filter((node: any) => node.id_pp !== selectcellid_ppValue),
                    }));
                }
            });
        }
    };

    const handleRemoveAll = () => {
        Swal.fire({
            title: 'Hapus Semua Data Barang ?',
            showCancelButton: true,
            confirmButtonText: 'Ya',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                setDataDetail((state) => ({
                    ...state,
                    nodes: state.nodes.filter((node: any) => node.id_pp === -1),
                }));

                handleSubmit();
            }
        });
    };

    const handleBatal = (id: any) => {
        router.push({ pathname: './spplist', query: { name: '', tglAwal: `${routeTglAwal}`, tglAkhir: `${routeTglAkhir}`, vTipeDokumen: `${routeTipeDokumen}` } });
    };

    const backPage = () => {
        router.push({ pathname: './spplist', query: { name: '', tglAwal: `${routeTglAwal}`, tglAkhir: `${routeTglAkhir}`, vTipeDokumen: `${routeTipeDokumen}` } });
    };

    const [nilaiValueNoItem, setNilaiValueNoItem] = useState('');
    const [nilaiValueNamaItem, setNilaiValueNamaItem] = useState('');

    const tanpaKoma = (stringNilai: string) => {
        const tanpaKoma = stringNilai.replace(/,/g, '');
        return tanpaKoma;
    };

    const frmNumber = (value: any) => {
        // Menggunakan fungsi Number() untuk mengonversi string menjadi angka
        const numericValue = Number(value);

        // Menggunakan fungsi Number.toLocaleString() untuk memformat angka
        const formattedValue = numericValue.toLocaleString('en-US', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        return formattedValue;
    };

    const newFrmNumber = (value: any) => {
        try {
            const cleaned = String(value).replace(/,/g, '').trim();
            const number = SpreadNumber(cleaned);
            return number;
        } catch (error) {
            return value;
        }
    };

    // const handleUpdate = async (
    //     value: any,
    //     id_pp: any,
    //     property: any,
    //     brt: any,
    //     satuan: any,
    //     kode_item: any,
    //     tipe: any,
    //     fpp_diameter: any,
    //     fpp_kg: any,
    //     panjang: any,
    //     fpp_harga_kg: any,
    //     fpp_qty: any
    // ) => {
    //     if (tipe === 'tipeNoItem') {
    //         setNilaiValueNoItem(value);
    //         setNilaiValueNamaItem('');
    //     } else if (tipe === 'tipeNamaItem') {
    //         setNilaiValueNoItem('');
    //         setNilaiValueNamaItem(value);
    //     } else {
    //         let totalBerat = 0;
    //         await setDataDetail((state: any) => {
    //             const newNodes = state.nodes.map((node: any) => {
    //                 if (node.id_pp === id_pp) {
    //                     if (property === 'qty') {
    //                         //  console.log(kode_item,'cccccccc')
    //                         const display_qty = document.getElementById('id_qty' + node.id_pp) as HTMLInputElement;
    //                         console.log(value, 'cccccccc');
    //                         // Membersihkan nilai input diskon
    //                         if (display_qty) {
    //                             // display_qty.value = frmNumber(value);
    //                             display_qty.value = frmNumber(value !== '' ? String(parseFloat(tanpaKoma(value))) : '0');
    //                         }
    //                         const display_berat = document.getElementById('id_berat' + node.id_pp) as HTMLInputElement;
    //                         // Membersihkan nilai input diskon
    //                         if (display_berat) {
    //                             display_berat.value = frmNumber(value !== '' ? String(parseFloat(tanpaKoma(value)) * brt) : '0');
    //                         }

    //                         return {
    //                             ...node,
    //                             [property]: value,
    //                             berat: value !== '' ? String(parseFloat(tanpaKoma(value)) * brt) : '0',
    //                             qty_std: value,
    //                             qty_sisa: value,
    //                             tgl_butuh: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
    //                         };
    //                     } else if (property === 'no_item') {
    //                         return {
    //                             ...node,
    //                             [property]: value,
    //                             kode_item: kode_item,
    //                             no_item: value,
    //                             brt: brt,
    //                             satuan: satuan,
    //                             sat_std: satuan,
    //                             berat: 0,
    //                             qty: 0,
    //                             qty_std: value,
    //                             qty_sisa: value,
    //                             tgl_butuh: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
    //                             fpp_diameter: fpp_diameter,
    //                             panjang: panjang,
    //                             fpp_kg: fpp_kg,
    //                             fpp_harga_kg: 0,
    //                         };
    //                     } else if (property === 'diskripsi') {
    //                         return {
    //                             ...node,
    //                             [property]: value,
    //                             diskripsi: value,
    //                             brt: brt,
    //                             satuan: satuan,
    //                             sat_std: satuan,
    //                             kode_item: kode_item,
    //                             berat: 0,
    //                             qty: 0,
    //                             qty_std: value,
    //                             qty_sisa: value,
    //                             tgl_butuh: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
    //                             fpp_diameter: fpp_diameter,
    //                             panjang: panjang,
    //                             fpp_kg: fpp_kg,
    //                             fpp_harga_kg: 0,
    //                         };
    //                     } else if (property === 'fpp_qty') {
    //                         const display_fpp_qty = document.getElementById('id_fpp_qty' + node.id_pp) as HTMLInputElement;
    //                         if (display_fpp_qty) {
    //                             display_fpp_qty.value = frmNumber(newFrmNumber(value));
    //                             console.log('display_fpp_qty', display_fpp_qty.value);
    //                         }
    //                         const display_fpp_btg = document.getElementById('id_fpp_btg' + node.id_pp) as HTMLInputElement;
    //                         if (display_fpp_btg) {
    //                             display_fpp_btg.value = frmNumber(value !== '' ? String(Math.ceil(newFrmNumber(String(value)) / newFrmNumber(fpp_kg))) : '0');
    //                         }
    //                         const display_fpp_harga_btg = document.getElementById('id_fpp_harga_btg' + node.id_pp) as HTMLInputElement;
    //                         if (display_fpp_harga_btg) {
    //                             display_fpp_harga_btg.value = frmNumber(value !== '' ? String(newFrmNumber(fpp_kg) * newFrmNumber(fpp_harga_kg)) : '0');
    //                         }

    //                         // alert(String(Math.ceil(parseFloat(value) / fpp_kg)));
    //                         console.log(Math.ceil(newFrmNumber(fpp_kg) * newFrmNumber(fpp_harga_kg)));
    //                         return {
    //                             ...node,
    //                             [property]: value,
    //                             //  fpp_btg: value !== '' ? String(Math.ceil(parseFloat(tanpaKoma(value)) / fpp_kg)) : '0',
    //                             fpp_btg: value !== '' ? String(Math.ceil(parseFloat(value) / fpp_kg)) : '0',
    //                             fpp_harga_btg: value !== '' ? String(Math.ceil(parseFloat(fpp_kg) * fpp_harga_kg)) : '0',
    //                             tgl_butuh: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
    //                         };
    //                     } else if (property === 'fpp_kg') {
    //                         const display_fpp_kg = document.getElementById('id_fpp_kg' + node.id_pp) as HTMLInputElement;
    //                         if (display_fpp_kg) {
    //                             display_fpp_kg.value = frmNumber(newFrmNumber(value));
    //                         }
    //                         const display_fpp_btg = document.getElementById('id_fpp_btg' + node.id_pp) as HTMLInputElement;
    //                         if (display_fpp_btg) {
    //                             const temp = frmNumber(value !== '' ? String(Math.ceil(newFrmNumber(fpp_qty) / newFrmNumber(value))) : '0');

    //                             display_fpp_btg.value = temp;
    //                         }
    //                         const display_fpp_harga_btg = document.getElementById('id_fpp_harga_btg' + node.id_pp) as HTMLInputElement;
    //                         if (display_fpp_harga_btg) {
    //                             display_fpp_harga_btg.value = frmNumber(value !== '' ? String(newFrmNumber(value) * newFrmNumber(fpp_harga_kg)) : '0');
    //                         }

    //                         return {
    //                             ...node,
    //                             [property]: value,
    //                             //  fpp_btg: value !== '' ? String(Math.ceil(parseFloat(tanpaKoma(value)) / fpp_kg)) : '0',
    //                             fpp_btg: value !== '' ? String(Math.ceil(newFrmNumber(fpp_qty) / newFrmNumber(value))) : '0',
    //                             fpp_harga_btg: value !== '' ? String(Math.ceil(newFrmNumber(value) * newFrmNumber(fpp_harga_kg))) : '0',
    //                             tgl_butuh: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
    //                         };
    //                     } else if (property === 'fpp_harga_kg') {
    //                         console.log('fpp_qty', fpp_qty, fpp_kg);

    //                         const display_fpp_harga_kg = document.getElementById('id_fpp_harga_kg' + node.id_pp) as HTMLInputElement;
    //                         if (display_fpp_harga_kg) {
    //                             display_fpp_harga_kg.value = frmNumber(String(newFrmNumber(value)));
    //                         }
    //                         const display_fpp_btg = document.getElementById('id_fpp_btg' + node.id_pp) as HTMLInputElement;
    //                         if (display_fpp_btg) {
    //                             display_fpp_btg.value = frmNumber(value !== '' ? String(Math.ceil(newFrmNumber(fpp_qty) / newFrmNumber(fpp_kg))) : '0');
    //                         }
    //                         const display_fpp_harga_btg = document.getElementById('id_fpp_harga_btg' + node.id_pp) as HTMLInputElement;
    //                         if (display_fpp_harga_btg) {
    //                             display_fpp_harga_btg.value = frmNumber(value !== '' ? String(newFrmNumber(fpp_kg) * newFrmNumber(value)) : '0');
    //                         }

    //                         return {
    //                             ...node,
    //                             [property]: value,
    //                             fpp_btg: value !== '' ? String(Math.ceil(fpp_qty / fpp_kg)) : '0',
    //                             fpp_harga_btg: value !== '' ? String(Math.ceil(parseFloat(fpp_kg) * parseFloat(value))) : '0',
    //                             tgl_butuh: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
    //                         };
    //                     } else if (property === 'fpp_diameter') {
    //                         const display_fpp_diameter = document.getElementById('id_fpp_diameter' + node.id_pp) as HTMLInputElement;
    //                         if (display_fpp_diameter) {
    //                             display_fpp_diameter.value = frmNumber(value);
    //                         }
    //                         const display_fpp_kg = document.getElementById('id_fpp_kg' + node.id_pp) as HTMLInputElement;
    //                         if (display_fpp_kg) {
    //                             display_fpp_kg.value = frmNumber(value !== '' ? String(newFrmNumber(value) * newFrmNumber(value) * 0.006165 * panjang) : '0');
    //                         }
    //                         const display_fpp_btg = document.getElementById('id_fpp_btg' + node.id_pp) as HTMLInputElement;
    //                         if (display_fpp_btg) {
    //                             const temp = frmNumber(value !== '' ? String(Math.ceil(newFrmNumber(fpp_qty) / SpreadNumber(newFrmNumber(value) * newFrmNumber(value) * 0.006165 * panjang))) : '0');
    //                             display_fpp_btg.value = temp;
    //                             console.log(`rumus btg ${newFrmNumber(fpp_qty)} / (${newFrmNumber(value)}  * ${newFrmNumber(value)} * ${0.006165} * ${newFrmNumber(panjang)}) = ${temp}`);
    //                         }

    //                         return {
    //                             ...node,
    //                             [property]: value,
    //                             fpp_kg: value !== '' ? String(newFrmNumber(value) * newFrmNumber(value) * 0.006165 * panjang) : '0',
    //                             fpp_btg: value !== '' ? String(Math.ceil(fpp_qty / (newFrmNumber(value) * newFrmNumber(value) * 0.006165 * panjang))) : '0',
    //                             tgl_butuh: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
    //                         };
    //                     } else if (property === 'fpp_jarak') {
    //                         const display_fpp_jarak = document.getElementById('id_fpp_jarak' + node.id_pp) as HTMLInputElement;
    //                         if (display_fpp_jarak) {
    //                             display_fpp_jarak.value = frmNumber(value);
    //                         }
    //                     }

    //                     return { ...node, [property]: value };
    //                 }

    //                 return node;
    //             });
    //             totalBerat = newNodes.reduce((acc: number, node: any) => {
    //                 return acc + newFrmNumber(node.berat);
    //             }, 0);
    //             console.log('totalBerat', totalBerat);

    //             setTotalBeratValue(totalBerat);

    //             return {
    //                 nodes: newNodes,
    //                 // totalBerat: totalBerat.toFixed(2),
    //             };
    //         });
    //     }
    // };

    const handleUpdate = async (
        value: any,
        id_pp: any,
        property: any,
        brt: any,
        satuan: any,
        kode_item: any,
        tipe: any,
        fpp_diameter: any,
        fpp_kg: any,
        panjang: any,
        fpp_harga_kg: any,
        fpp_qty: any
    ) => {
        if (tipe === 'tipeNoItem') {
            setNilaiValueNoItem(value);
            setNilaiValueNamaItem('');
        } else if (tipe === 'tipeNamaItem') {
            setNilaiValueNoItem('');
            setNilaiValueNamaItem(value);
        } else {
            let totalBerat = 0;
            await setDataDetail((state: any) => {
                const newNodes = state.nodes.map((node: any) => {
                    if (node.id_pp === id_pp) {
                        if (property === 'qty') {
                            //  console.log(kode_item,'cccccccc')
                            const display_qty = document.getElementById('id_qty' + node.id_pp) as HTMLInputElement;
                            // console.log(value, 'cccccccc');
                            // Membersihkan nilai input diskon
                            if (display_qty) {
                                // display_qty.value = frmNumber(value);
                                display_qty.value = frmNumber(value !== '' ? String(parseFloat(tanpaKoma(value))) : '0');
                            }
                            const display_berat = document.getElementById('id_berat' + node.id_pp) as HTMLInputElement;
                            // Membersihkan nilai input diskon
                            if (display_berat) {
                                display_berat.value = frmNumber(value !== '' ? String(parseFloat(tanpaKoma(value)) * brt) : '0');
                            }

                            return {
                                ...node,
                                [property]: value,
                                berat: value !== '' ? String(parseFloat(tanpaKoma(value)) * brt) : '0',
                                qty_std: value,
                                qty_sisa: value,
                                tgl_butuh: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
                            };
                        } else if (property === 'no_item') {
                            return {
                                ...node,
                                [property]: value,
                                kode_item: kode_item,
                                no_item: value,
                                brt: brt,
                                satuan: satuan,
                                sat_std: satuan,
                                berat: 0,
                                qty: 0,
                                qty_std: value,
                                qty_sisa: value,
                                tgl_butuh: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
                                fpp_diameter: fpp_diameter,
                                panjang: panjang,
                                fpp_kg: fpp_kg,
                                fpp_harga_kg: 0,
                            };
                        } else if (property === 'diskripsi') {
                            return {
                                ...node,
                                [property]: value,
                                diskripsi: value,
                                brt: brt,
                                satuan: satuan,
                                sat_std: satuan,
                                kode_item: kode_item,
                                berat: 0,
                                qty: 0,
                                qty_std: value,
                                qty_sisa: value,
                                tgl_butuh: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
                                fpp_diameter: fpp_diameter,
                                panjang: panjang,
                                fpp_kg: fpp_kg,
                                fpp_harga_kg: 0,
                            };
                        } else if (property === 'fpp_qty') {
                            const display_fpp_qty = document.getElementById('id_fpp_qty' + node.id_pp) as HTMLInputElement;
                            if (display_fpp_qty) {
                                display_fpp_qty.value = frmNumber(newFrmNumber(value));
                                // console.log('display_fpp_qty', display_fpp_qty.value);
                            }
                            const display_fpp_btg = document.getElementById('id_fpp_btg' + node.id_pp) as HTMLInputElement;
                            if (display_fpp_btg) {
                                display_fpp_btg.value = frmNumber(value !== '' ? String(SpreadNumber(newFrmNumber(String(value)) / newFrmNumber(fpp_kg))) : '0');
                            }
                            const display_fpp_harga_btg = document.getElementById('id_fpp_harga_btg' + node.id_pp) as HTMLInputElement;
                            if (display_fpp_harga_btg) {
                                display_fpp_harga_btg.value = frmNumber(value !== '' ? String(newFrmNumber(fpp_kg) * newFrmNumber(fpp_harga_kg)) : '0');
                            }

                            // alert(String(SpreadNumber(parseFloat(value) / fpp_kg)));
                            console.log('asep', newFrmNumber(fpp_kg) * newFrmNumber(fpp_harga_kg));

                            return {
                                ...node,
                                [property]: value,
                                //  fpp_btg: value !== '' ? String(SpreadNumber(parseFloat(tanpaKoma(value)) / fpp_kg)) : '0',
                                fpp_btg: value !== '' ? String(SpreadNumber(parseFloat(value) / fpp_kg)) : '0',
                                fpp_harga_btg: value !== '' ? String(SpreadNumber(newFrmNumber(fpp_kg) * newFrmNumber(fpp_harga_kg))) : '0',
                                tgl_butuh: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
                            };
                        } else if (property === 'fpp_kg') {
                            const display_fpp_kg = document.getElementById('id_fpp_kg' + node.id_pp) as HTMLInputElement;
                            if (display_fpp_kg) {
                                display_fpp_kg.value = frmNumber(newFrmNumber(value));
                            }
                            const display_fpp_btg = document.getElementById('id_fpp_btg' + node.id_pp) as HTMLInputElement;
                            if (display_fpp_btg) {
                                const temp = frmNumber(value !== '' ? String(SpreadNumber(newFrmNumber(fpp_qty) / newFrmNumber(value))) : '0');

                                display_fpp_btg.value = temp;
                            }
                            const display_fpp_harga_btg = document.getElementById('id_fpp_harga_btg' + node.id_pp) as HTMLInputElement;
                            if (display_fpp_harga_btg) {
                                display_fpp_harga_btg.value = frmNumber(value !== '' ? String(newFrmNumber(value) * newFrmNumber(fpp_harga_kg)) : '0');
                            }

                            return {
                                ...node,
                                [property]: value,
                                //  fpp_btg: value !== '' ? String(SpreadNumber(parseFloat(tanpaKoma(value)) / fpp_kg)) : '0',
                                fpp_btg: value !== '' ? String(SpreadNumber(newFrmNumber(fpp_qty) / newFrmNumber(value))) : '0',
                                fpp_harga_btg: value !== '' ? String(SpreadNumber(newFrmNumber(value) * newFrmNumber(fpp_harga_kg))) : '0',
                                tgl_butuh: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
                            };
                        } else if (property === 'fpp_harga_kg') {
                            const display_fpp_harga_kg = document.getElementById('id_fpp_harga_kg' + node.id_pp) as HTMLInputElement;
                            if (display_fpp_harga_kg) {
                                display_fpp_harga_kg.value = frmNumber(String(newFrmNumber(value)));
                            }
                            const display_fpp_btg = document.getElementById('id_fpp_btg' + node.id_pp) as HTMLInputElement;
                            if (display_fpp_btg) {
                                display_fpp_btg.value = frmNumber(value !== '' ? String(SpreadNumber(newFrmNumber(fpp_qty) / newFrmNumber(fpp_kg))) : '0');
                            }
                            const display_fpp_harga_btg = document.getElementById('id_fpp_harga_btg' + node.id_pp) as HTMLInputElement;
                            if (display_fpp_harga_btg) {
                                display_fpp_harga_btg.value = frmNumber(value !== '' ? String(newFrmNumber(fpp_kg) * newFrmNumber(value)) : '0');
                            }

                            return {
                                ...node,
                                [property]: value,
                                fpp_btg: value !== '' ? String(SpreadNumber(newFrmNumber(fpp_qty) / newFrmNumber(fpp_kg))) : '0',
                                fpp_harga_btg: value !== '' ? String(SpreadNumber(newFrmNumber(fpp_kg) * newFrmNumber(value))) : '0',
                                tgl_butuh: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
                            };
                        } else if (property === 'fpp_diameter') {
                            const display_fpp_diameter = document.getElementById('id_fpp_diameter' + node.id_pp) as HTMLInputElement;
                            if (display_fpp_diameter) {
                                display_fpp_diameter.value = frmNumber(value);
                            }
                            const display_fpp_kg = document.getElementById('id_fpp_kg' + node.id_pp) as HTMLInputElement;
                            if (display_fpp_kg) {
                                display_fpp_kg.value = frmNumber(value !== '' ? String(newFrmNumber(value) * newFrmNumber(value) * 0.006165 * panjang) : '0');
                            }
                            const display_fpp_btg = document.getElementById('id_fpp_btg' + node.id_pp) as HTMLInputElement;
                            if (display_fpp_btg) {
                                const temp = frmNumber(value !== '' ? String(SpreadNumber(newFrmNumber(fpp_qty) / SpreadNumber(newFrmNumber(value) * newFrmNumber(value) * 0.006165 * panjang))) : '0');
                                display_fpp_btg.value = temp;
                                console.log(`rumus btg ${newFrmNumber(fpp_qty)} / (${newFrmNumber(value)}  * ${newFrmNumber(value)} * ${0.006165} * ${newFrmNumber(panjang)}) = ${temp}`);
                            }

                            return {
                                ...node,
                                [property]: value,
                                fpp_kg: value !== '' ? String(SpreadNumber(newFrmNumber(value) * newFrmNumber(value) * 0.006165 * panjang)) : '0',
                                fpp_btg: value !== '' ? String(SpreadNumber(newFrmNumber(fpp_qty) / SpreadNumber(newFrmNumber(value) * newFrmNumber(value) * 0.006165 * panjang))) : '0',
                                tgl_butuh: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
                            };
                        } else if (property === 'fpp_jarak') {
                            const display_fpp_jarak = document.getElementById('id_fpp_jarak' + node.id_pp) as HTMLInputElement;
                            if (display_fpp_jarak) {
                                display_fpp_jarak.value = frmNumber(value);
                            }
                        }

                        return { ...node, [property]: value };
                    }

                    return node;
                });
                totalBerat = newNodes.reduce((acc: number, node: any) => {
                    return acc + newFrmNumber(node.berat);
                }, 0);

                setTotalBeratValue(totalBerat);

                return {
                    nodes: newNodes,
                    // totalBerat: totalBerat.toFixed(2),
                };
            });
        }
    };

    const SaveDoc = async (app_value: any) => {
        const { kode_pp, name, form_app } = router.query;
        const hasEmptyFields = dataDetail.nodes.some((row: { no_item: string }) => row.no_item === '');
        const hasQtyNol = dataDetail.nodes.some((row: { qty: number }) => row.qty <= 0);

        if (selectedKodedept[0] === '') {
            Swal.fire({
                title: 'Departemen Peminta belum diisi !',
                icon: 'error',
            });
            throw 'exit';
        }

        if (hasQtyNol) {
            Swal.fire({
                title: 'Qty tidak boleh lebih kecil atau sama dengan Nol !',
                icon: 'error',
            });
            throw 'exit';
        }

        if (hasEmptyFields) {
            Swal.fire({
                title: 'Data Barang masih ada yang belum terisi !',
                icon: 'error',
            });
            throw 'exit';
        }

        showLoading();
        let no_pp = '';
        let produksi = '';

        if (JenisTabelValue === 'produksi') {
            produksi = 'Y';
        } else {
            produksi = 'N';
        }

        let getno_pp = await generateNU(kode_entitas, '', '01', moment(date1).format('YYYYMM'))
            .then((result) => {
                no_pp = result;
            })
            .catch((error) => {
                console.error('Error:', error);
            });

        // if (form_app==='B'){
        //         await setDataDetail((state: any) => {
        //         const newNodes = state.nodes.map((node: any) => {
        //             return {
        //                 ...node,
        //                 qty_batal:node.qty_sisa,
        //                 qty_sisa:0,
        //             };
        //         });
        //          console.log(newNodes,'fgfg')
        //         return {
        //             nodes: newNodes,
        //         };
        //     });
        // }

        let jsonSave: any;
        if (JenisFormValue === 'BARU') {
            //alert(JSON.stringify(dataDetail));
            await ReCalcDataNodes(dataDetail, produksi)
                .then((result) => {
                    jsonSave = {
                        entitas: kode_entitas,
                        kode_pp: '',
                        no_pp: no_pp,
                        tgl_pp: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
                        dokumen: JenisTabelValue === 'nonPersediaan' ? 'Non Persediaan' : 'Persediaan',
                        peminta: userid,
                        kode_dept: selectedKodedept,
                        keterangan: keteranganValue,
                        status: StatusValue,
                        userid: userid,
                        tgl_update: tgl_update.format('YYYY-MM-DD HH:mm:ss'),
                        produksi: produksi,
                        detail: result.detailJson,
                    };
                    //console.log(result.detailJson);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            //alert(JSON.stringify(jsonSave));
            const response = await axios.post(`${apiUrl}/erp/simpan_pp`, jsonSave);

            const result = response.data;
            const status = result.status;
            const errormsg = result.serverMessage;
            if (status === true) {
                let getcounterno_pp = await generateNU(kode_entitas, no_pp, '01', moment(date1).format('YYYYMM'))
                    .then((result) => {
                        // alert(result);
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                        Swal.fire({
                            title: 'Penambahan Counter No PP Gagal',
                            icon: 'warning',
                        });
                    });

                Swal.fire({
                    title: 'Data Berhasil di Simpan.',
                    icon: 'success',
                });
                //back to pp list
                // router.push({ pathname: './spplist', query: { name: '' } });
                backPage();
            } else {
                Swal.fire({
                    title: errormsg,
                    icon: 'warning',
                });
            }
        } else {
            //jika bukan approval

            if (app_value === '') {
                if (form_app === 'B') {
                    await ReCalcDataNodesBatal(dataDetail)
                        .then((result) => {
                            jsonSave = {
                                entitas: kode_entitas,
                                kode_pp: kodePPValue,
                                no_pp: noPPValue,
                                // tgl_pp: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
                                tgl_pp: moment(tanggalPPValue).format('YYYY-MM-DD HH:mm:ss'),
                                dokumen: JenisTabelValue === 'nonPersediaan' ? 'Non Persediaan' : 'Persediaan',
                                peminta: userid,
                                kode_dept: selectedKodedept,
                                keterangan: keteranganValue,
                                status: StatusValue,
                                userid: userid,
                                tgl_update: tgl_update.format('YYYY-MM-DD HH:mm:ss'),
                                produksi: ProduksiValue,
                                detail: result.detailJson,
                            };
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                        });
                    //  alert(JSON.stringify(jsonSave));
                } else {
                    await ReCalcDataNodesEdit(dataDetail)
                        .then((result) => {
                            jsonSave = {
                                entitas: kode_entitas,
                                kode_pp: kodePPValue,
                                no_pp: noPPValue,
                                // tgl_pp: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
                                tgl_pp: moment(tanggalPPValue).format('YYYY-MM-DD HH:mm:ss'),
                                dokumen: JenisTabelValue === 'nonPersediaan' ? 'Non Persediaan' : 'Persediaan',
                                peminta: userid,
                                kode_dept: selectedKodedept,
                                keterangan: keteranganValue,
                                status: StatusValue,
                                userid: userid,
                                tgl_update: tgl_update.format('YYYY-MM-DD HH:mm:ss'),
                                produksi: ProduksiValue,
                                detail: result.detailJson,
                            };
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                        });
                    //  alert(JSON.stringify(jsonSave));
                }

                //  alert(JSON.stringify( jsonSave));
                const response = await axios.patch(`${apiUrl}/erp/update_pp`, jsonSave);

                const result = response.data;
                const status = result.status;
                const errormsg = result.serverMessage;
                if (status === true) {
                    Swal.fire({
                        title: 'Data Berhasil di Update.',
                        icon: 'success',
                    });

                    // router.push({ pathname: './spplist', query: { name: '' } });
                    backPage();
                } else {
                    Swal.fire({
                        title: errormsg,
                        icon: 'warning',
                    });
                }
            } else {
                await ReCalcDataNodesApprove(dataDetail)
                    .then((result) => {
                        jsonSave = {
                            entitas: kode_entitas,
                            kode_pp: kodePPValue,
                            no_pp: noPPValue,
                            // tgl_pp: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
                            tgl_pp: moment(tanggalPPValue).format('YYYY-MM-DD HH:mm:ss'),
                            dokumen: JenisTabelValue === 'nonPersediaan' ? 'Non Persediaan' : 'Persediaan',
                            peminta: userid,
                            kode_dept: selectedKodedept,
                            keterangan: keteranganValue,
                            status: StatusValue,
                            userid: userid,
                            tgl_update: tgl_update.format('YYYY-MM-DD HH:mm:ss'),
                            produksi: ProduksiValue,
                            approval: app_value,
                            tgl_approval: tgl_update.format('YYYY-MM-DD HH:mm:ss'),
                            detail: result.detailJson,
                        };
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });

                //  alert(JSON.stringify( jsonSave));
                const response = await axios.patch(`${apiUrl}/erp/update_pp`, jsonSave);

                const result = response.data;
                const status = result.status;
                const errormsg = result.serverMessage;
                if (status === true) {
                    Swal.fire({
                        title: 'Data Berhasil di Update.',
                        icon: 'success',
                    });

                    // router.push({ pathname: './spplist', query: { name: '' } });
                    backPage();
                } else {
                    Swal.fire({
                        title: errormsg,
                        icon: 'warning',
                    });
                }
            }
        }

        Swal.close();
    };

    // modal
    const [modal1, setModal1] = useState(false);

    const { id } = router.query;

    const [selectedName, setSelectedName] = useState('');

    const rowClick = (e: any, row: any) => {
        setSelectedName(row.getData().no_item);
    };

    const [totalNum, setTotalNum] = useState(0);
    const [tipeValue, setTipeValue] = useState('');

    const handleModalItemChange = (value: any, tipe: string, id: any) => {
        setTotalNum((prevTotal) => prevTotal + Number(id));
        setRowId(id);

        if (tipe === 'tipeNoItem') {
            setNilaiValueNoItem(value);
            setNilaiValueNamaItem('');
            setTipeValue(tipe);
            setModalItemDlg(true);
        } else if (tipe === 'tipeNamaItem') {
            setNilaiValueNoItem('');
            setNilaiValueNamaItem(value);
            setTipeValue(tipe);
            setModalItemDlg(true);
        }
    };

    const [modalItemDlg, setModalItemDlg] = useState(false);

    const [rowid, setRowId] = useState<any>(0);
    const [modalTipeCari, setModalTipeCari] = useState('');

    const jenisFilterBarangRef = useRef('');
    const vRefreshData = useRef(0);

    const handleModalItem = async (tipe: string, id: any, jenisFilterBarang: any) => {
        console.log('sdsf = ', jenisFilterBarang, tipe, id);
        vRefreshData.current += 1;
        jenisFilterBarangRef.current = jenisFilterBarang;
        setRowId(id);
        if (tipe === 'tipeNoItem') {
            setModalItemDlg(true);
            setModalTipeCari('searchno_barang');
        } else if (tipe === 'tipeNamaItem') {
            setModalItemDlg(true);
            setModalTipeCari('searchdiskripsi');
        }
    };

    const [vselectedfpp_kg, setvselectedfpp_kg] = useState<any>(0);
    const [vselectedfpp_diameter, setvselectedfpp_diameter] = useState<any>(0);

    const handleSelectedData = async (dataObject: any) => {
        // setButtonDisabled(true);
        const { selectedkode_item, property, selectedno_item, selectednama_item, selectedsatuan, selectedberat, selectedfpp_diameter, selectedfpp_kg, selectedpanjang } = dataObject;
        // const { name } = router.query;

        // alert(selectedno_item);
        if (JenisTabelValue === 'barangjadi' || JenisTabelValue === 'nonPersediaan') {
            setvselectedfpp_kg(0);
            setvselectedfpp_diameter(0);
        } else if (JenisTabelValue === 'produksi') {
            setvselectedfpp_kg(selectedfpp_kg);
            setvselectedfpp_diameter(selectedfpp_diameter);
        }

        await setDataDetail((state: any) => {
            const newNodes = state.nodes.map((node: any) => {
                if (node.id === rowid) {
                    // Logika perubahan pada setiap baris
                    return {
                        ...node,
                        [property]: selectedkode_item,
                        kode_pp: kodePPValue,
                        // id_pp: id,
                        // id: id,
                        // id_ket: id,
                        stok: 'Y',
                        kode_item: selectedkode_item,
                        no_item: selectedno_item,
                        diskripsi: selectednama_item,
                        satuan: selectedsatuan,
                        qty: 0,
                        sat_std: selectedsatuan,
                        qty_std: 0,
                        qty_batal: 0,
                        tgl_butuh: moment(date1).format('YYYY-MM-DD HH:mm:ss'),
                        panjang: selectedpanjang,
                        fpp_qty: 0,
                        fpp_diameter: selectedfpp_diameter, //selectedfpp_diameter,
                        fpp_kg: selectedfpp_kg,
                        fpp_harga: 0,
                        fpp_btg: 0,
                        fpp_harga_kg: 0,
                        fpp_harga_btg: 0,
                        fpp_jarak: 0,
                        brt: selectedberat,
                        berat: 0,
                    };
                } else {
                    return node;
                }
            });
            // Mendapatkan elemen input diskonResult
            const display_qty = document.getElementById('id_qty' + rowid) as HTMLInputElement;
            const display_fpp_qty = document.getElementById('id_fpp_qty' + rowid) as HTMLInputElement;
            const display_fpp_diameter = document.getElementById('id_fpp_diameter' + rowid) as HTMLInputElement;
            const display_fpp_jarak = document.getElementById('id_fpp_jarak' + rowid) as HTMLInputElement;
            const display_fpp_kg = document.getElementById('id_fpp_kg' + rowid) as HTMLInputElement;
            const display_fpp_harga_kg = document.getElementById('id_fpp_harga_kg' + rowid) as HTMLInputElement;

            // Membersihkan nilai input diskon
            if (display_qty) {
                display_qty.value = '0';
            }
            if (display_fpp_qty) {
                display_fpp_qty.value = '0';
            }
            if (display_fpp_diameter) {
                display_fpp_diameter.value = selectedfpp_diameter;
            }
            if (display_fpp_jarak) {
                display_fpp_jarak.value = '0';
            }
            if (display_fpp_kg) {
                display_fpp_kg.value = selectedfpp_kg;
            }
            if (display_fpp_harga_kg) {
                display_fpp_harga_kg.value = '0';
            }

            return {
                nodes: newNodes,
            };
        });
    };

    return (
        <div>
            {/* Form Grid Layouts */}
            <div className="table-responsive panel mb-3" style={{ background: '#dedede' }}>
                <div className="mb-5">
                    <div className="flex" style={{ alignItems: 'center' }}>
                        <div className={styles.titleText}>Permintaan Pembelian </div>
                    </div>
                    <table className={styles.table} style={{ width: 700 }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'center', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Tanggal</th>
                                <th style={{ textAlign: 'center', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>No. PP</th>
                                <th style={{ textAlign: 'center', width: '50%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Departemen Peminta</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ textAlign: 'center' }}>
                                    <div className="form-input mt-1 flex justify-between">
                                        <DatePickerComponent
                                            locale="id"
                                            style={{ fontSize: '12px' }}
                                            cssClass="e-custom-style"
                                            //   renderDayCell={onRenderDayCell}
                                            enableMask={true}
                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                            showClearButton={false}
                                            format="dd-MM-yyyy"
                                            value={JenisFormValue === 'BARU' ? moment(date1).toDate() : moment(tanggalPPValue).toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                JenisFormValue === 'BARU' ? setDate1(moment(args.value)) : setTanggalPPValue(moment(tanggalPPValue));
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                    {/* <Flatpickr
                                        // value={
                                        //     tgl_trxlpb
                                        //         ? tgl_trxlpb
                                        //         : headerDataFetch && headerDataFetch.length > 0
                                        //         ? moment(headerDataFetch[0]?.tgl_trxfb).format('DD-MM-YYYY HH:mm:ss')
                                        //         : date2.format('DD-MM-YYYY HH:mm:ss')
                                        //     }

                                        value={JenisFormValue === 'BARU' ? moment(date1).format('DD-MM-YYYY HH:mm:ss') : moment(tanggalPPValue).format('DD-MM-YYYY HH:mm:ss')}
                                        onChange={(date) => {
                                            const selectedDate = moment(date[0]);
                                            selectedDate.set({
                                                hour: moment().hour(),
                                                minute: moment().minute(),
                                                second: moment().second(),
                                            });
                                            setDate1(selectedDate);
                                        }}
                                        options={{
                                            dateFormat: 'd-m-Y',
                                        }}
                                        style={{ width: '15vh', marginLeft: '0vh' }}
                                        className={` ${styles.inputTableBasicDate}`}
                                        disabled={DisableTanggalValue}
                                    /> */}
                                </td>
                                <td>
                                    <input className={`${styles.inputTableBasic}`} type="text" disabled={true} placeholder="Masukkan Nomor PP" id="NoPP" value={noPPValue} />
                                </td>
                                <td>
                                    <div className="flex">
                                        <select
                                            id="cbdepartement"
                                            className={`form-select `}
                                            style={{ border: 'none' }}
                                            value={kodedeptValue.length > 0 ? selectedKodedept : ''}
                                            onChange={(e) => setSelectedKodedept(e.target.value)}
                                        >
                                            <option value="" disabled>
                                                --Pilih Departemen--
                                            </option>
                                            {kodedeptValue.map((dept: any) => (
                                                <option key={dept.kode_dept} value={dept.kode_dept}>
                                                    {dept.nama_dept}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <Tabs>
                <TabList>
                    <Tab>Data Barang</Tab>
                </TabList>

                <TabPanel>
                    <div className="panel" style={{ background: '#dedede' }}>
                        <div className="grid grid-cols-8 justify-between gap-5 sm:flex">
                            <div className="grid grid-cols-1 gap-6 xl:grid-cols-1">
                                <div
                                    style={{
                                        maxHeight: '200px',
                                        minHeight: '5px',
                                    }}
                                >
                                    <div className="mb-1.5 flex" style={{ marginLeft: '95%' }}>
                                        <button title="Tambah Barang" type="submit" onClick={handleSubmit} style={{ display: 'flex', alignItems: 'center' }}>
                                            <FontAwesomeIcon icon={faCirclePlus} className="shrink-0 ltr:mr-2 rtl:ml-2" width="30" height="30" />
                                        </button>
                                        <button title="Hapus Barang" type="submit" onClick={handleRemove} style={{ display: 'flex', alignItems: 'center' }}>
                                            <FontAwesomeIcon icon={faCircleMinus} className="shrink-0 ltr:mr-2 rtl:ml-2" width="30" height="30" />
                                        </button>
                                    </div>

                                    {JenisTabelValue === 'produksi' ? (
                                        <TableBarangProduksi
                                            dataApi={dataDetail}
                                            handleUpdate={handleUpdate}
                                            handleselectcell={handleselectcell}
                                            kode_entitas={kode_entitas}
                                            userid={userid}
                                            nilaiValueNoItem={nilaiValueNoItem}
                                            nilaiValueNamaItem={nilaiValueNamaItem}
                                            handleModalItemChange={handleModalItemChange}
                                            nilaiTotalId={totalNum}
                                            tipeValue={tipeValue}
                                            handleModalItem={handleModalItem}
                                        />
                                    ) : (
                                        <TableBarangJadi
                                            dataApi={dataDetail}
                                            handleUpdate={handleUpdate}
                                            handleselectcell={handleselectcell}
                                            kode_entitas={kode_entitas}
                                            userid={userid}
                                            nilaiValueNoItem={nilaiValueNoItem}
                                            nilaiValueNamaItem={nilaiValueNamaItem}
                                            handleModalItemChange={handleModalItemChange}
                                            nilaiTotalId={totalNum}
                                            tipeValue={tipeValue}
                                            handleModalItem={(tipe: any, id: any, jenisFilterBarang: any) => handleModalItem(tipe, id, jenisFilterBarang)}
                                            jenisFilterBarang={JenisTabelValue}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="my-5 mt-10 flex justify-between">
                            <div className="flex" style={{ alignItems: 'center' }}>
                                <span>Total Berat</span>
                                <span style={{ margin: '0 30px' }}>{frmNumber(String(SpreadNumber(TotalBeratValue)))}</span>
                                <span style={{ margin: '0 30px' }}>Kg</span>
                            </div>

                            <div className="flex">
                                {/* <span>STotal Berat</span> 
                                <span style={{ margin: '0 5px' }}></span>{' '} */}
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </Tabs>

            <div className="panel mt-3" style={{ background: '#dedede' }}>
                <div className={styles['grid-containerNote']}>
                    <div className={styles['grid-leftNote']}>
                        <div>
                            <label htmlFor="catatan">Catatan:</label>
                            <form>
                                <div className="mb-4 w-full rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600">
                                    <div className="rounded-b-lg bg-white px-4 py-2 dark:bg-gray-800">
                                        <label className="sr-only">Publish post</label>
                                        <textarea
                                            id="editor"
                                            rows={3}
                                            value={keteranganValue}
                                            onChange={(e) => setKeteranganValue(e.target.value)}
                                            className=" form-input block w-full border-0 bg-white px-0 text-sm text-gray-800 outline-0 focus:ring-0 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                                            placeholder=""
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                            </form>
                        </div>
                        {/* <p className="mt-3">Terbilang:</p>
                        <p className="text-green-500">Nol</p> */}
                    </div>
                    <div className={styles['grid-rightNote']}></div>
                </div>
            </div>
            <div className="my-5 flex justify-between">
                <div className="flex">
                    {/* <button  type="submit" className="btn btn-secondary mr-1" style={{ background: `#5c5a5a`, borderColor: `#5c5a5a` }}>
                        <FontAwesomeIcon icon={faPlay} className="shrink-0 ltr:mr-2 rtl:ml-2" width="17" height="17" />
                        Lanjut
                    </button> */}
                    {TombolSimpanValue && (
                        <button type="submit" onClick={() => SaveDoc('')} className="btn btn-secondary mr-1" style={{ background: `#5c5a5a`, borderColor: `#5c5a5a` }}>
                            <FontAwesomeIcon icon={faSave} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                            Simpan
                        </button>
                    )}
                    {TombolAppValue && (
                        <button type="submit" onClick={() => SaveDoc('Y')} className="btn btn-secondary mr-1" style={{ background: `#5c5a5a`, borderColor: `#5c5a5a` }}>
                            <FontAwesomeIcon icon={faSave} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                            Disetujui
                        </button>
                    )}
                    {TombolAppValue && (
                        <button type="submit" onClick={() => SaveDoc('C')} className="btn btn-secondary mr-1" style={{ background: `#5c5a5a`, borderColor: `#5c5a5a` }}>
                            <FontAwesomeIcon icon={faSave} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                            Koreksi
                        </button>
                    )}
                    {TombolAppValue && (
                        <button type="submit" onClick={() => SaveDoc('N')} className="btn btn-secondary mr-1" style={{ background: `#5c5a5a`, borderColor: `#5c5a5a` }}>
                            <FontAwesomeIcon icon={faSave} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                            Ditolak
                        </button>
                    )}
                    {TombolBatalValue && (
                        <button type="submit" onClick={() => SaveDoc('')} className="btn btn-secondary mr-1" style={{ background: `#5c5a5a`, borderColor: `#5c5a5a` }}>
                            <FontAwesomeIcon icon={faSave} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                            Dibatalkan
                        </button>
                    )}
                    <button type="submit" onClick={handleBatal} className="btn btn-secondary mr-1" style={{ background: `#5c5a5a`, borderColor: `#5c5a5a` }}>
                        <FontAwesomeIcon icon={faCancel} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                        Batal
                    </button>
                    {/* <button type="submit" className="btn btn-secondary mr-1" style={{ background: `#5c5a5a`, borderColor: `#5c5a5a` }}>
                        <FontAwesomeIcon icon={faPrint} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                        Cetak
                    </button> */}
                </div>

                <div className="flex">
                    {/* <button type="submit" className="btn btn-secondary mr-1" style={{ background: `#5c5a5a`, borderColor: `#5c5a5a` }}>
                        <FontAwesomeIcon icon={faTrash} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                        Hapus
                    </button> */}
                    <button type="submit" onClick={handleRemoveAll} className="btn btn-secondary mr-1" style={{ background: `#5c5a5a`, borderColor: `#5c5a5a` }}>
                        <FontAwesomeIcon icon={faBackward} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                        Bersihkan
                    </button>
                    {/* <button type="submit" className="btn btn-secondary mr-1" style={{ background: `#5c5a5a`, borderColor: `#5c5a5a` }}>
                        <FontAwesomeIcon icon={faList} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                        Info Customer
                    </button> */}
                </div>
            </div>
            <ItemDlg
                isOpen={modalItemDlg}
                onClose={() => setModalItemDlg(false)}
                onSelectData={(dataObject: any) => handleSelectedData(dataObject)}
                kode_entitas={kode_entitas}
                userid={userid}
                searchtype={modalTipeCari}
                cariNo={nilaiValueNoItem}
                cariNama={nilaiValueNamaItem}
                // nilaiTotalId={nilaiTotalId}
                tipeValue={tipeValue}
                jenisFilterBarang={jenisFilterBarangRef.current}
                // jenisFilterBarang={JenisTabelValue}
                vRefreshData={vRefreshData.current}
            />
        </div>
    );
};

export default spp;
