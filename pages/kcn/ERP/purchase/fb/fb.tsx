import { useState } from 'react';
import 'flatpickr/dist/flatpickr.css';
import 'tippy.js/dist/tippy.css';
import styles from './fblist.module.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/light.css';
import moment from 'moment';
import 'moment/locale/id';
import React from 'react';
import { faMagnifyingGlass, faCamera, faTimes, faCancel } from '@fortawesome/free-solid-svg-icons';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { Table, Header, HeaderRow, Body, Row, HeaderCell, Cell } from '@table-library/react-table-library/table';
import { useTheme } from '@table-library/react-table-library/theme';
import axios from 'axios';
import Supplier from './modal/supplier';
import ListPB from './modal/listPB';
import { FirstDayInPeriod, generateNofakturFB } from '@/utils/routines';
import { fetchPreferensi } from '@/utils/routines';
import { useRouter } from 'next/router';
import Draggable from 'react-draggable';
import SweetAlerts from './component/SweetAlertsNotif';
import { useSession } from '@/pages/api/sessionContext';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json'; // To load the culture based first day of week

loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);

import idIDLocalization from 'public/syncfusion/locale.json';
L10n.load(idIDLocalization);

enableRipple(true);
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, Inject, Page, Edit, Sort, Filter, Group, Resize, Reorder, Selection, ExcelExport, PdfExport } from '@syncfusion/ej2-react-grids';

const fbbDetail = () => {
    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';

    if (isLoading) {
        return;
    }

    const nodes = [{}];

    const entitasUser = kode_entitas === '99999' ? '999' : kode_entitas;

    // #FETCH DETAIL DATA FB (MASTER DAN DETAIL FB)# //
    //ID DETAIL
    const router = useRouter();
    const { id } = router.query;

    // FETCH HEADER DAN DETAIL
    const [headerDataFetch, setHeaderDataFetch] = useState<any[]>([]);
    const [detailDataFetch, setDetailDataFetch] = useState<any>({ nodes });

    useEffect(() => {
        const fetchData = async () => {
            try {
                //fetch master :
                const headerResponse = await axios.get(`${apiUrl}/erp/header_fb?`, {
                    params: {
                        entitas: entitasUser,
                        param1: id,
                    },
                });

                const responseData = headerResponse.data.data;
                const transformedData: any[] = responseData.map((item: any) => {
                    const transformedItem: any = {};
                    for (const key in item) {
                        if (key === 'total_rp' || key === 'diskon_dok_rp' || key === 'netto_rp' || key === 'total_pajak_rp') {
                            transformedItem[key] = parseFloat(item[key]).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                            });
                        } else {
                            transformedItem[key] = item[key];
                        }
                    }
                    return transformedItem;
                });
                setHeaderDataFetch(transformedData);

                //fetch detail :
                const detailResponse = await axios.get(`${apiUrl}/erp/detail_fb?`, {
                    params: {
                        entitas: entitasUser,
                        param1: id,
                    },
                });

                const newData = detailResponse.data.data.map((item: any) => {
                    const transformedItem: any = {};
                    for (const key in item) {
                        if (key === 'harga_mu' || key === 'diskon_mu' || key === 'jumlah_mu' || key === 'potongan_mu') {
                            transformedItem[key] = parseFloat(item[key]).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                            });
                        } else if (key === 'qty') {
                            transformedItem[key] = parseFloat(item[key]).toLocaleString('en-US');
                        } else {
                            transformedItem[key] = item[key];
                        }
                    }
                    return transformedItem;
                });

                setDetailDataFetch({
                    nodes: newData,
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    // #REACT-TABLE# //
    const [emptyData] = React.useState({ nodes });
    const [dataApi, setDataApi] = useState<any>({ nodes: [] });

    // #CSS STYLING# //
    const theme = useTheme({
        Header: `
            .th {
              border-bottom: 1px solid #a0a8ae;
            }
          `,
        Row: `
          &:nth-of-type(odd) {
            background-color: #f9fafb;
          }
          &:nth-of-type(even) {
            background-color: white;
          }
          &:not(:last-of-type) .td {
            border-bottom: 1px solid #a0a8ae;
          }
        `,
        BaseCell: `
            &:not(:last-of-type) {
              border-right: 1px solid #a0a8ae;
            }
          `,
        Table: `
          --data-table-library_grid-template-columns: 8% 15% 7% 7% 10% 7% 10% 10% 10% 10%  minmax(200px, 1fr);
        `,
    });

    const handleUpdate = (value: any, id_fb: any, property: any) => {
        no_lpbSelected
            ? setDataApi((state: any) => ({
                  ...state,
                  nodes: state.nodes.map((node: any) => {
                      if (node.id_fb === id_fb) {
                          return { ...node, [property]: value };
                      } else {
                          return node;
                      }
                  }),
              }))
            : setDetailDataFetch((state: any) => ({
                  ...state,
                  nodes: state.nodes.map((node: any) => {
                      if (node.id_fb === id_fb) {
                          return { ...node, [property]: value };
                      } else {
                          return node;
                      }
                  }),
              }));
    };

    ////////////
    // MASTER //
    ////////////

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const [no_lpbSelected, setNo_lpbSelected] = useState();
    const [namaRelasiSelected, setnamaRelasiSelected] = useState();
    const [kodeSupplierSelected, setKodeSupplierSelected] = useState();
    const [kode_lpbSelected, setKode_lpbSelected] = useState();

    const [date1, setDate1] = useState<moment.Moment>(moment()); // Tanggal Dokumen Sebelum PB dipilih
    const [date2, setDate2] = useState<moment.Moment>(moment()); // Tanggal Diterima Sebelum PB dipilih

    // NO. FAKTUR PAJAK
    const [fakturPajakValue, setFakturPajakValue] = useState('');

    const handleFakturPajakChange = (event?: any) => {
        const newValue = event.target.value;
        setFakturPajakValue(newValue);
    };

    const [terminSelected, setterminSelected] = useState(); // Termin

    //MODAL
    const [modalSupplier, setModalSupplier] = useState(false);
    const [modalPB, setModalPB] = useState(false);

    useEffect(() => {
        const fetchAndTransformData = async () => {
            try {
                const result = await generateNofakturFB(apiUrl, entitasUser, no_lpbSelected);
                setNoLpbTransformed(result);
            } catch (error) {
                console.error('Error fetching and transforming data:', error);
            }
        };
        fetchAndTransformData();
    }, [no_lpbSelected]);

    const handleSelectedDataSupplier = (namaRelasi: any, termin: any, noSupplier: any) => {
        setterminSelected(termin);
        setnamaRelasiSelected(namaRelasi);
        setKodeSupplierSelected(noSupplier);
    };

    const handleSelectedDataPBB = (kode_lpbSelected: any, no_lpbSelected: any) => {
        setKode_lpbSelected(kode_lpbSelected);
        setNo_lpbSelected(no_lpbSelected);

        //saat PB dipilih, set date2 menjadi tanggal hari ini (digunakan di post & patch)
        const currentDateAndTime = moment();
        setDate2(currentDateAndTime);
    };

    const [masterPB, setMasterPB] = useState<any[]>([]); // list all dlg_header_pb

    const [noLpbTransformed, setNoLpbTransformed] = useState<string | undefined>(undefined); // No. Faktur yang sudah ditransformasi

    useEffect(() => {
        const fetchDataUseMasterPB = async () => {
            try {
                const response = await axios.get(`${apiUrl}/erp/dlg_header_pb?`, {
                    params: {
                        entitas: entitasUser,
                        ucode: kodeSupplierSelected ? kodeSupplierSelected : headerDataFetch[0]?.kode_supp,
                        tanggal: date1,
                    },
                });
                const responseData = response.data.data;
                const transformedData: any[] = responseData.map((item: any) => ({
                    no_lpb: item.no_lpb,
                    no_reff: item.no_reff,
                    pjk: item.pjk,
                    tgl_lpb: moment(item.tgl_lpb).format('DD-MM-YYYY HH:mm:ss'),
                    tgl_trxlpb: moment(item.tgl_trxlpb).format('DD-MM-YYYY HH:mm:ss'),
                    total_rp:
                        item.total_rp !== '0.0000'
                            ? parseFloat(item.total_rp).toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                              })
                            : '',
                    diskon_dok_rp:
                        item.diskon_dok_rp !== '0.0000'
                            ? parseFloat(item.diskon_dok_rp).toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                              })
                            : '',
                    total_pajak_rp:
                        item.total_pajak_rp !== '0.0000'
                            ? parseFloat(item.total_pajak_rp).toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                              })
                            : '',
                    netto_rp:
                        item.netto_rp !== '0.0000'
                            ? parseFloat(item.netto_rp).toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                              })
                            : '',
                    kode_termin: item.kode_termin,
                    kena_pajak: item.kena_pajak,
                    diskon_dok: item.diskon_dok,
                    total_diskon_rp: item.total_diskon_rp,
                    kirim_mu: item.kirim_mu,
                    total_berat: item.total_berat,
                    status: item.status,
                    fdo: item.fdo,
                }));
                setMasterPB(transformedData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchDataUseMasterPB();
    }, [kodeSupplierSelected, headerDataFetch[0]?.kode_supp]);

    const filteredMasterPB = no_lpbSelected ? masterPB.filter((item) => item.no_lpb === no_lpbSelected) : []; // proses filter, cari data dengan no_lpb (dari fetch api dlg_header_pb) === no_lpbSelected (no_lpb yang dipilih)

    const masterPBData = filteredMasterPB.length > 0 ? filteredMasterPB[0] : {}; // ambil array 0 dari filteredMasterPB (1 data diperoleh untuk ditampilkan di master table)

    const {
        tgl_lpb,
        tgl_trxlpb,
        no_reff,
        pjk: pajak,
        total_rp,
        diskon_dok_rp,
        total_pajak_rp,
        netto_rp,
        kode_termin,
        kena_pajak,
        diskon_dok,
        total_diskon_rp,
        kirim_mu,
        total_berat,
        fdo,
    } = masterPBData;

    //Tgl Transaksi FB
    const [formattedDate] = useState<moment.Moment>(moment());
    const today = formattedDate.format('YYYY-MM-DD HH:mm:ss');

    //PPN
    const [ppn, setPpn] = useState<any>(false);
    const handleCheckboxChange = () => {
        setPpn(!ppn);
    };

    useEffect(() => {
        setPpn(headerDataFetch[0]?.ppn === 'Y');
    }, [headerDataFetch]);

    //Kode Akun
    const [kodeAkun, setKodeAkun] = useState<any[]>([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const transformedData = await fetchPreferensi(entitasUser, apiUrl);
                setKodeAkun(transformedData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    //Keterangan
    const [keterangan, setKeterangan] = useState('');
    const handleTextareaChange = (event: any) => {
        setKeterangan(event.target.value);
    };

    ////////////
    // DETAIL //
    ////////////

    let idFB = 0;

    const fetchDataDetailPB = async () => {
        try {
            const response = await axios.get(`${apiUrl}/erp/dlg_detail_pb?`, {
                params: {
                    entitas: entitasUser,
                    ucode: kode_lpbSelected,
                },
            });

            const result = response.data;

            if (result.status) {
                const newData = result.data.map((item: any, index: number) => ({
                    id: item.kode_item,
                    no_item: item.no_item,
                    kode_fb: item.kode_fb,
                    id_fb: ++idFB,
                    kode_lpb: item.kode_lpb,
                    id_lpb: item.id_lpb,
                    kode_sp: item.kode_sp,
                    id_sp: item.id_sp,
                    kode_pp: item.kode_pp,
                    id_pp: item.id_pp,
                    kode_item: item.kode_item,
                    diskripsi: item.diskripsi,
                    satuan: item.satuan,
                    qty: item.qty,
                    sat_std: item.sat_std,
                    qty_std: item.qty_std,
                    kode_mu: item.kode_mu,
                    kurs: item.kurs,
                    kurs_pajak: item.kurs_pajak,
                    harga_mu: parseFloat(item.harga_mu).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                    }),
                    diskon: item.diskon,
                    diskon_mu: parseFloat(item.diskon_mu).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                    }),
                    potongan_mu: parseFloat(item.potongan_mu).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                    }),
                    kode_pajak: item.kode_pajak,
                    pajak: item.pajak,
                    include: item.include,
                    pajak_mu: item.pajak_mu,
                    jumlah_mu: parseFloat(item.jumlah_mu).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                    }),
                    jumlah_rp: item.jumlah_rp,
                    ket: item.ket,
                    kode_dept: item.kode_dept,
                    ket_pajak: item.ket_pajak,
                }));
                setDataApi({
                    nodes: newData,
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const [postTanggalDiterima, setPostTanggalDiterima] = useState('');
    useEffect(() => {
        const formattedDate =
            date2.format('YYYY-MM-DD HH:mm:ss') !== moment().format('YYYY-MM-DD HH:mm:ss')
                ? date2.format('YYYY-MM-DD HH:mm:ss')
                : tgl_trxlpb
                ? moment(tgl_trxlpb, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')
                : headerDataFetch[0]?.tgl_trxfb;

        setPostTanggalDiterima(formattedDate);
    }, [date2.format('YYYY-MM-DD HH:mm:ss'), tgl_trxlpb]);

    useEffect(() => {
        fetchDataDetailPB();
    }, [kode_lpbSelected, date1, date2.format('YYYY-MM-DD HH:mm:ss'), tgl_trxlpb]);

    // #SAVE DOC# //
    async function saveDoc() {
        const apiPost = `${apiUrl}/erp/simpan_fb?`;
        const apiUpdate = `${apiUrl}/erp/update_fb?`;

        // MASTER //
        const ppnValue = ppn ? 'Y' : 'N';

        const formattedDiskon_dok_rp = diskon_dok_rp === '' ? '0.0000' : parseFloat(diskon_dok_rp?.replace(/,/g, '')).toFixed(4);
        const formattedTotal_pajak_rp = total_pajak_rp === '' ? '0.0000' : parseFloat(total_pajak_rp?.replace(/,/g, '')).toFixed(4);

        const formattedDiskon_dok_rp_Detail = headerDataFetch[0]?.diskon_dok_rp === '' ? '0.0000' : parseFloat(headerDataFetch[0]?.diskon_dok_rp?.replace(/,/g, '')).toFixed(4);
        const formattedTotal_pajak_Detail = headerDataFetch[0]?.total_pajak_rp === '' ? '0.0000' : parseFloat(headerDataFetch[0]?.total_pajak_rp?.replace(/,/g, '')).toFixed(4);

        // DETAIL //
        const dataToMap = no_lpbSelected ? dataApi.nodes : detailDataFetch.nodes;
        const filteredDataDetail = dataToMap.map((item: any) => ({
            id_fb: detailDataFetch.nodes.length === 0 ? ++idFB : item.id_fb,
            kode_fb: detailDataFetch.nodes.length === 0 ? '' : headerDataFetch[0]?.kode_fb,
            kode_lpb: item.kode_lpb,
            id_lpb: item.id_lpb,
            kode_sp: item.kode_sp,
            id_sp: item.id_sp,
            kode_pp: item.kode_pp,
            id_pp: item.id_pp,
            kode_item: item.kode_item,
            diskripsi: item.diskripsi,
            satuan: item.satuan,
            qty: item.qty,
            sat_std: item.sat_std,
            qty_std: item.qty_std,
            kode_mu: item.kode_mu,
            kurs: item.kurs,
            kurs_pajak: item.kurs_pajak,
            harga_mu: parseFloat(item.harga_mu.replace(/,/g, '')).toFixed(4),
            diskon: item.diskon,
            diskon_mu: parseFloat(item.diskon_mu.replace(/,/g, '')).toFixed(4),
            potongan_mu: parseFloat(item.potongan_mu.replace(/,/g, '')).toFixed(4),
            kode_pajak: item.kode_pajak,
            pajak: parseFloat(item.pajak.replace(/,/g, '')).toFixed(4),
            include: item.include,
            pajak_mu: item.pajak_mu,
            jumlah_mu: parseFloat(item.jumlah_mu.replace(/,/g, '')).toFixed(4),
            jumlah_rp: item.jumlah_rp,
            ket: item.ket,
            kode_dept: item.kode_dept,
        }));

        // REQUEST BODY //
        const requestBody: any = {
            entitas: entitasUser,
            kode_fb: headerDataFetch.length === 0 ? '' : headerDataFetch[0]?.kode_fb,
            no_fb: no_lpbSelected ? noLpbTransformed : headerDataFetch[0]?.no_fb,
            tgl_fb: tgl_lpb ? moment(tgl_lpb, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') : headerDataFetch[0]?.tgl_fb, // tanggal dokumen
            tgl_buku: tgl_lpb ? moment(tgl_lpb, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') : headerDataFetch[0]?.tgl_buku, // saat post tgl_buku == tgl_fb
            kode_supp: kodeSupplierSelected ? kodeSupplierSelected : headerDataFetch[0]?.kode_supp,
            kode_termin: kode_termin ? kode_termin : headerDataFetch[0]?.kode_termin,
            kode_mu: 'IDR',
            kurs: '1.0000',
            kurs_pajak: '1.0000',
            kena_pajak: kena_pajak ? kena_pajak : headerDataFetch[0]?.kena_pajak,
            no_faktur_pajak: fakturPajakValue ? fakturPajakValue : headerDataFetch[0]?.no_faktur_pajak,
            total_mu: total_rp ? parseFloat(total_rp.replace(/,/g, '')).toFixed(4) : headerDataFetch[0]?.total_mu,
            diskon_dok: diskon_dok ? diskon_dok : headerDataFetch[0]?.diskon_dok,
            diskon_dok_mu: no_lpbSelected ? formattedDiskon_dok_rp : headerDataFetch[0]?.diskon_dok_mu,
            total_diskon_mu: total_diskon_rp ? total_diskon_rp : headerDataFetch[0]?.total_diskon_mu,
            total_pajak_mu: no_lpbSelected ? formattedTotal_pajak_rp : headerDataFetch[0]?.total_pajak_mu,
            kirim_mu: kirim_mu ? kirim_mu : headerDataFetch[0]?.kirim_mu,
            netto_mu: netto_rp ? parseFloat(netto_rp.replace(/,/g, '')).toFixed(4) : headerDataFetch[0]?.netto_mu,
            memo_mu: '0.0000',
            lunas_mu: '0.0000',
            memo_pajak: '0.0000',
            lunas_pajak: '0.0000',
            total_rp: total_rp ? parseFloat(total_rp.replace(/,/g, '')).toFixed(4) : parseFloat(headerDataFetch[0]?.total_rp.replace(/,/g, '')).toFixed(4),
            diskon_dok_rp: no_lpbSelected ? formattedDiskon_dok_rp : formattedDiskon_dok_rp_Detail,
            total_diskon_rp: total_diskon_rp ? total_diskon_rp : headerDataFetch[0]?.total_diskon_rp,
            total_pajak_rp: no_lpbSelected ? formattedTotal_pajak_rp : formattedTotal_pajak_Detail,
            kirim_rp: kirim_mu ? kirim_mu : headerDataFetch[0]?.kirim_rp,
            netto_rp: netto_rp ? parseFloat(netto_rp.replace(/,/g, '')).toFixed(4) : parseFloat(headerDataFetch[0]?.netto_rp.replace(/,/g, '')).toFixed(4),
            total_berat: total_berat ? total_berat : headerDataFetch[0]?.total_berat,
            kode_akun_kirim: kodeAkun[0]?.kode_akun_pengiriman,
            kode_akun_diskon_termin: kodeAkun[0]?.kode_akun_diskon_item,
            kode_akun_diskon_dok: kodeAkun[0]?.kode_akun_diskon_beli,
            keterangan: keterangan ? keterangan : headerDataFetch[0]?.keterangan,
            status: 'Terbuka',
            userid: userid,
            tgl_update: today,
            kode_lpb: kode_lpbSelected ? kode_lpbSelected : headerDataFetch[0]?.kode_lpb,
            fdo: fdo ? fdo : headerDataFetch[0]?.fdo,
            tgl_trxfb: postTanggalDiterima
                ? moment(postTanggalDiterima).isValid()
                    ? postTanggalDiterima
                    : moment().format('YYYY-MM-DD HH:mm:ss')
                : moment(headerDataFetch[0]?.tgl_trxfb).isValid()
                ? headerDataFetch[0]?.tgl_trxfb
                : moment().format('YYYY-MM-DD HH:mm:ss'), // tanggal diterima
            nota: null,
            ppn: ppnValue,
            detail: filteredDataDetail,
        };
        try {
            let response;
            console.log('requestBody = ', requestBody, postTanggalDiterima, headerDataFetch[0]?.tgl_trxfb, moment(postTanggalDiterima).isValid());

            if (headerDataFetch.length == 0 && detailDataFetch.nodes.length == 0) {
                response = await axios.post(apiPost, requestBody);

                console.log('response = ', response);

                if (response.data.status === true) {
                    // Jika POST Master FB berhasil, lanjut POST ke tb_audit
                    try {
                        const auditResponse = await axios.post(`${apiUrl}/erp/simpan_audit`, {
                            entitas: entitasUser,
                            kode_audit: null,
                            dokumen: 'FB',
                            kode_dokumen: response.data.kode_dokumen,
                            no_dokumen: no_lpbSelected,
                            tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                            proses: 'NEW',
                            diskripsi: `FB item = ${dataApi.nodes.length} nilai transaksi ${netto_rp}`,
                            userid: userid,
                            system_user: '', //username login
                            system_ip: '', //ip address
                            system_mac: '', //mac address
                        });

                        // console.log(auditResponse, 'auditResponse');

                        if (auditResponse.data.status === true) {
                            // Jika simpan_audit berhasil
                            const kodeDokumenFromSimpanFB = response.data.kode_dokumen;
                            const allUploadsEmpty = [uploadImages1, uploadImages2, uploadImages3, uploadImages4, uploadImages5].every((images) => images.length === 0);
                            allUploadsEmpty ? SweetAlerts.showAlertSuccess(11, router) : handleUpload(kodeDokumenFromSimpanFB);
                        } else {
                            // Jika simpan_audit gagal
                            SweetAlerts.showAlertFailed(13);
                        }
                    } catch (auditError) {
                        console.error('Error posting data to simpan_audit API:', auditError);
                        SweetAlerts.showAlertFailed(13);
                    }
                } else {
                    SweetAlerts.showAlertFailed(13);
                }
            } else {
                response = await axios.patch(apiUpdate, requestBody);
                // console.log(response, 'edit fb');

                if (response.data.status === true) {
                    // Jika patch berhasil
                    // bersihkan gambar :
                    if (response.data.status === true) {
                        const cleanImageStates = [
                            { state: isCleanImage1, number: 1 },
                            { state: isCleanImage2, number: 2 },
                            { state: isCleanImage3, number: 3 },
                            { state: isCleanImage4, number: 4 },
                            { state: isCleanImage5, number: 5 },
                        ];

                        const deleteImages = cleanImageStates.map(({ state, number }) => {
                            if (state) {
                                return axios
                                    .delete(`${apiUrl}/erp/hapus_file_pendukung?entitas=${entitasUser}&param1=${id}&param2=${number}`)
                                    .then(() => {
                                        console.log(`File image ${number} berhasil didelete`);
                                    })
                                    .catch((error) => {
                                        console.error('Error:', error);
                                        SweetAlerts.showAlertFailed(13);
                                    });
                            }
                            return Promise.resolve();
                        });
                        const kodeDokumenFromSimpanFB = id;
                        const allUploadsEmpty = [uploadImages1, uploadImages2, uploadImages3, uploadImages4, uploadImages5].every((images) => images.length === 0);

                        // setelah proses deleteImages selesai lanjut handleUpload
                        Promise.all([...deleteImages, Promise.resolve(allUploadsEmpty)])
                            .then(() => {
                                if (allUploadsEmpty) {
                                    SweetAlerts.showAlertSuccess(11, router);
                                } else {
                                    allUploadsEmpty ? SweetAlerts.showAlertSuccess(11, router) : handleUpload(kodeDokumenFromSimpanFB);
                                }
                            })
                            .catch((error) => {
                                console.error('Error during deletion or upload:', error);
                            });
                    }
                } else {
                    // Jika patch gagal
                    SweetAlerts.showAlertFailed(13);
                }
            }
        } catch (error) {
            console.error('Error posting data to API:', error);
            SweetAlerts.showAlertFailed(13);
        }
    }

    // #BLOCKING# //
    const [periode, setPeriode] = useState('');
    // console.log(periode, 'periode')

    const fromFirstDayInPeriod = async () => {
        try {
            const periode = await FirstDayInPeriod(entitasUser);
            setPeriode(periode);
        } catch (error) {}
    };

    fromFirstDayInPeriod();

    // #FILE PENDUKUNG# //

    //DETAIL IMAGES
    const [filegambar1, setFilegambar1] = useState<any>(''); //encrypt filegambar Tab1
    const [filegambar2, setFilegambar2] = useState<any>(''); //encrypt filegambar Tab2
    const [filegambar3, setFilegambar3] = useState<any>(''); //encrypt filegambar Tab3
    const [filegambar4, setFilegambar4] = useState<any>(''); //encrypt filegambar Tab4
    const [filegambar5, setFilegambar5] = useState<any>(''); //encrypt filegambar Tab5
    const [resSrc1, setResSrc1] = useState<any>(''); // src tab1
    const [resSrc2, setResSrc2] = useState<any>(''); // src tab2
    const [resSrc3, setResSrc3] = useState<any>(''); // src tab3
    const [resSrc4, setResSrc4] = useState<any>(''); // src tab4
    const [resSrc5, setResSrc5] = useState<any>(''); // src tab5
    const [fileNameDetail1, setfileNameDetail1] = useState<any>(''); // src tab1
    const [fileNameDetail2, setfileNameDetail2] = useState<any>(''); // src tab2
    const [fileNameDetail3, setfileNameDetail3] = useState<any>(''); // src tab3
    const [fileNameDetail4, setfileNameDetail4] = useState<any>(''); // src tab4
    const [fileNameDetail5, setfileNameDetail5] = useState<any>(''); // src tab5

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${apiUrl}/erp/load_images?entitas=${entitasUser}&param1=${id}`);

                if (response.data.status) {
                    const data = response.data.data;

                    const encodeBase64 = (filegambar: any) => Buffer.from(filegambar).toString('base64');

                    const handlePreviewRequest = async (filegambar: any, setResSrc: any) => {
                        if (filegambar) {
                            const res = await axios.get(`${apiUrl}/erp/preview_images?entitas=${entitasUser}&image=${filegambar}`);
                            setResSrc(res.data);
                        }
                    };

                    data.forEach((item: any) => {
                        const { id_dokumen, filegambar } = item;
                        const base64Image = encodeBase64(filegambar);

                        switch (id_dokumen) {
                            case 1:
                                handlePreviewRequest(filegambar1, setResSrc1);
                                setFilegambar1(base64Image);
                                setfileNameDetail1(filegambar);
                                break;
                            case 2:
                                handlePreviewRequest(filegambar2, setResSrc2);
                                setFilegambar2(base64Image);
                                setfileNameDetail2(filegambar);
                                break;
                            case 3:
                                handlePreviewRequest(filegambar3, setResSrc3);
                                setFilegambar3(base64Image);
                                setfileNameDetail3(filegambar);
                                break;
                            case 4:
                                handlePreviewRequest(filegambar4, setResSrc4);
                                setFilegambar4(base64Image);
                                setfileNameDetail4(filegambar);
                                break;
                            case 5:
                                handlePreviewRequest(filegambar5, setResSrc5);
                                setFilegambar5(base64Image);
                                setfileNameDetail5(filegambar);
                                break;
                            default:
                                break;
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [filegambar1, filegambar2, filegambar3, filegambar4, filegambar5]);

    //UPLOAD IMAGES TO FTP & INSERT TB_IMAGES
    const [uploadImages1, setUploadImages1] = useState<any[]>([]); // File Upload 1
    const [uploadImages2, setUploadImages2] = useState<any[]>([]); // File Upload 2
    const [uploadImages3, setUploadImages3] = useState<any[]>([]); // File Upload 3
    const [uploadImages4, setUploadImages4] = useState<any[]>([]); // File Upload 4
    const [uploadImages5, setUploadImages5] = useState<any[]>([]); // File Upload 5

    const [fileNameOriginal1, setFileNameOriginal1] = useState<string | null>(null); // File Name Original 1
    const [fileNameOriginal2, setFileNameOriginal2] = useState<string | null>(null); // File Name Original 2
    const [fileNameOriginal3, setFileNameOriginal3] = useState<string | null>(null); // File Name Original 3
    const [fileNameOriginal4, setFileNameOriginal4] = useState<string | null>(null); // File Name Original 4
    const [fileNameOriginal5, setFileNameOriginal5] = useState<string | null>(null); // File Name Original 5

    const [nameFiles1, setNamaFiles1] = useState<any[]>([]); // Rename Files 1
    const [nameFiles2, setNameFiles2] = useState<any[]>([]); // Rename Files 2
    const [nameFiles3, setNameFiles3] = useState<any[]>([]); // Rename Files 2
    const [nameFiles4, setNameFiles4] = useState<any[]>([]); // Rename Files 2
    const [nameFiles5, setNameFiles5] = useState<any[]>([]); // Rename Files 2

    const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
    const [selectedNamaFiles, setNamaFiles] = useState<any[]>([]);
    const formattedName = moment().format('YYMMDDHHmmss');

    const isInsertTrue = headerDataFetch.length == 0 && detailDataFetch.nodes.length == 0;

    useEffect(() => {
        setSelectedFiles([...uploadImages1, ...uploadImages2, ...uploadImages3, ...uploadImages4, ...uploadImages5]);
        setNamaFiles([...nameFiles1, ...nameFiles2, ...nameFiles3, ...nameFiles4, ...nameFiles5]);
    }, [uploadImages1, uploadImages2, uploadImages3, uploadImages4, uploadImages5, nameFiles1, nameFiles2, nameFiles3, nameFiles4, nameFiles5]);

    const handleFileChange = (event: any, tabNumber: number) => {
        const maxFileSize = 2 * 1024 * 1024; // 2 MB
        const newFiles = [...event.target.files];
        const file = newFiles[0];

        if (file.size > maxFileSize) {
            alert('File size upload tidak boleh melebihi 2 MB');
            event.target.value = '';
            return;
        }

        const newNamaFiles = newFiles.map((file) => `${formattedName}.${file.name.split('.').pop()}`);

        switch (tabNumber) {
            case 0:
                setUploadImages1(() => [...newFiles]);
                isInsertTrue
                    ? setNamaFiles1(() => [...newNamaFiles.map((file) => `FB${file}`)])
                    : fileNameDetail1
                    ? setNamaFiles1(() => [fileNameDetail1])
                    : setNamaFiles1(() => [...newNamaFiles.map((file) => `FB${file}`)]);
                setFileNameOriginal1(event.target.files[0]?.name);
                setIsCleanImage1(false);
                break;
            case 1:
                setUploadImages2(() => [...newFiles]);
                isInsertTrue
                    ? setNameFiles2(() => [...newNamaFiles.map((file) => `FB${file}`)])
                    : fileNameDetail2
                    ? setNameFiles2(() => [fileNameDetail2])
                    : setNameFiles2(() => [...newNamaFiles.map((file) => `FB${file}`)]);
                setFileNameOriginal2(event.target.files[0]?.name);
                setIsCleanImage2(false);
                break;
            case 2:
                setUploadImages3(() => [...newFiles]);
                isInsertTrue
                    ? setNameFiles3(() => [...newNamaFiles.map((file) => `FB${file}`)])
                    : fileNameDetail3
                    ? setNameFiles3(() => [fileNameDetail3])
                    : setNameFiles3(() => [...newNamaFiles.map((file) => `FB${file}`)]);
                setFileNameOriginal3(event.target.files[0]?.name);
                setIsCleanImage3(false);
                break;
            case 3:
                setUploadImages4(() => [...newFiles]);
                isInsertTrue
                    ? setNameFiles4(() => [...newNamaFiles.map((file) => `FB${file}`)])
                    : fileNameDetail4
                    ? setNameFiles4(() => [fileNameDetail4])
                    : setNameFiles4(() => [...newNamaFiles.map((file) => `FB${file}`)]);
                setFileNameOriginal4(event.target.files[0]?.name);
                setIsCleanImage4(false);
                break;
            case 4:
                setUploadImages5(() => [...newFiles]);
                isInsertTrue
                    ? setNameFiles5(() => [...newNamaFiles.map((file) => `FB${file}`)])
                    : fileNameDetail5
                    ? setNameFiles5(() => [fileNameDetail5])
                    : setNameFiles5(() => [...newNamaFiles.map((file) => `FB${file}`)]);
                setFileNameOriginal5(event.target.files[0]?.name);
                setIsCleanImage5(false);
                break;
            default:
                break;
        }
    };

    const handleUpload = (kodeDokumenFromSimpanFB: any) => {
        const formData = new FormData();
        selectedFiles.forEach((file: any, index: any) => {
            formData.append(`myimage`, file); //myimage
            formData.append(`nama_file_image`, `${selectedNamaFiles[index]}`); //nama_file_image
        });
        formData.append('ets', entitasUser); //ets
        axios
            .post(`${apiUrl}/upload`, formData) // insert file image ke folder ftp
            .then(() => {
                console.log('File image berhasil diupload');
                const postData = [];

                if (nameFiles1.length > 0 && !fileNameDetail1) {
                    postData.push({
                        entitas: entitasUser,
                        kode_dokumen: kodeDokumenFromSimpanFB,
                        id_dokumen: '1',
                        dokumen: 'FB',
                        filegambar: isInsertTrue ? `${nameFiles1}` : fileNameDetail1 ? `FB${nameFiles1}` : `${nameFiles1}`,
                        fileoriginal: fileNameOriginal1,
                    });
                }

                if (nameFiles2.length > 0 && !fileNameDetail2) {
                    postData.push({
                        entitas: entitasUser,
                        kode_dokumen: kodeDokumenFromSimpanFB,
                        id_dokumen: '2',
                        dokumen: 'FB',
                        filegambar: isInsertTrue ? `${nameFiles2}` : fileNameDetail2 ? `FB${nameFiles2}` : `${nameFiles2}`,
                    });
                }

                if (nameFiles3.length > 0 && !fileNameDetail3) {
                    postData.push({
                        entitas: entitasUser,
                        kode_dokumen: kodeDokumenFromSimpanFB,
                        id_dokumen: '3',
                        dokumen: 'FB',
                        filegambar: isInsertTrue ? `${nameFiles3}` : fileNameDetail3 ? `FB${nameFiles3}` : `${nameFiles3}`,
                        fileoriginal: fileNameOriginal3,
                    });
                }

                if (nameFiles4.length > 0 && !fileNameDetail4) {
                    postData.push({
                        entitas: entitasUser,
                        kode_dokumen: kodeDokumenFromSimpanFB,
                        id_dokumen: '4',
                        dokumen: 'FB',
                        filegambar: isInsertTrue ? `${nameFiles4}` : fileNameDetail4 ? `FB${nameFiles4}` : `${nameFiles4}`,
                        fileoriginal: fileNameOriginal4,
                    });
                }
                if (nameFiles5.length > 0 && !fileNameDetail5) {
                    postData.push({
                        entitas: entitasUser,
                        kode_dokumen: kodeDokumenFromSimpanFB,
                        id_dokumen: '5',
                        dokumen: 'FB',
                        filegambar: isInsertTrue ? `${nameFiles5}` : fileNameDetail5 ? `FB${nameFiles5}` : `${nameFiles5}`,
                        fileoriginal: fileNameOriginal5,
                    });
                }
                // console.log(postData, 'postData');
                axios
                    .post(`${apiUrl}/erp/simpan_tbimages`, postData) // insert file name images ke tb_images
                    .then(() => {
                        console.log('File name berhasil disimpan ke tb_images');
                        SweetAlerts.showAlertSuccess(11, router);
                    })
                    .catch((error) => {
                        SweetAlerts.showAlertFailed(13);
                    });
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    const [isCleanImage1, setIsCleanImage1] = useState<any>(false);
    const [isCleanImage2, setIsCleanImage2] = useState<any>(false);
    const [isCleanImage3, setIsCleanImage3] = useState<any>(false);
    const [isCleanImage4, setIsCleanImage4] = useState<any>(false);
    const [isCleanImage5, setIsCleanImage5] = useState<any>(false);

    //BERSIHKAN FILES IMAGE
    const removeImageTab = (tabNumber: number) => {
        switch (tabNumber) {
            case 0:
                setUploadImages1([]);
                setFileNameOriginal1(null);
                setNamaFiles1([]);
                setResSrc1('');
                setfileNameDetail1('');
                setShowPreviewModal(false);
                break;
            case 1:
                setUploadImages2([]);
                setFileNameOriginal2(null);
                setNameFiles2([]);
                setResSrc2('');
                setfileNameDetail2('');
                setShowPreviewModal(false);
                break;
            case 2:
                setUploadImages3([]);
                setFileNameOriginal3(null);
                setNameFiles3([]);
                setResSrc3('');
                setfileNameDetail3('');
                setShowPreviewModal(false);
                break;
            case 3:
                setUploadImages4([]);
                setFileNameOriginal4(null);
                setNameFiles4([]);
                setResSrc4('');
                setfileNameDetail4('');
                setShowPreviewModal(false);
                break;
            case 4:
                setUploadImages5([]);
                setFileNameOriginal5(null);
                setNameFiles5([]);
                setResSrc5('');
                setfileNameDetail5('');
                setShowPreviewModal(false);
                break;
            default:
                break;
        }
    };

    const handleCleanImage = (activeTab: any) => {
        switch (activeTab) {
            case 0:
                setIsCleanImage1(true);
                break;
            case 1:
                setIsCleanImage2(true);
                break;
            case 2:
                setIsCleanImage3(true);
                break;
            case 3:
                setIsCleanImage4(true);
                break;
            case 4:
                setIsCleanImage5(true);
                break;
            default:
                break;
        }
    };

    //BERSIHKAN SEMUA IMAGES
    const removeAllImages = () => {
        const imageStates = [
            { setUploadImages: setUploadImages1, setFileNameOriginal: setFileNameOriginal1, setNameFiles: setNamaFiles1, setResSrc: setResSrc1, setFileNameDetail: setfileNameDetail1 },
            { setUploadImages: setUploadImages2, setFileNameOriginal: setFileNameOriginal2, setNameFiles: setNameFiles2, setResSrc: setResSrc2, setFileNameDetail: setfileNameDetail2 },
            { setUploadImages: setUploadImages3, setFileNameOriginal: setFileNameOriginal3, setNameFiles: setNameFiles3, setResSrc: setResSrc3, setFileNameDetail: setfileNameDetail3 },
            { setUploadImages: setUploadImages4, setFileNameOriginal: setFileNameOriginal4, setNameFiles: setNameFiles4, setResSrc: setResSrc4, setFileNameDetail: setfileNameDetail4 },
            { setUploadImages: setUploadImages5, setFileNameOriginal: setFileNameOriginal5, setNameFiles: setNameFiles5, setResSrc: setResSrc5, setFileNameDetail: setfileNameDetail5 },
        ];

        imageStates.forEach((state) => {
            state.setUploadImages([]);
            state.setFileNameOriginal(null);
            state.setNameFiles([]);
            state.setResSrc('');
            state.setFileNameDetail('');
        });
        setShowPreviewModal(false);
    };

    const handleAllCleanImage = () => {
        if (fileNameDetail1) {
            setIsCleanImage1(true);
        }
        if (fileNameDetail2) {
            setIsCleanImage2(true);
        }
        if (fileNameDetail3) {
            setIsCleanImage3(true);
        }
        if (fileNameDetail4) {
            setIsCleanImage4(true);
        }
        if (fileNameDetail5) {
            setIsCleanImage5(true);
        }
    };

    const handleBersihkanSemua = () => {
        handleAllCleanImage();
        removeAllImages();
    };

    // IMAGE UPLOAD PREVIEW
    const generatePreview = (uploadImages: any, index: any) => {
        return uploadImages.map((file: any, index: any) => (
            <img key={index} src={URL.createObjectURL(file)} alt={`Preview ${index}`} style={{ maxWidth: '300px', maxHeight: '200px', margin: '5px' }} />
        ));
    };

    const previewTab1 = generatePreview(uploadImages1, 1);
    const previewTab2 = generatePreview(uploadImages2, 2);
    const previewTab3 = generatePreview(uploadImages3, 3);
    const previewTab4 = generatePreview(uploadImages4, 4);
    const previewTab5 = generatePreview(uploadImages5, 5);

    // SHOW MODAL TO PREVIEW IMAGES
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedImages, setSelectedImages] = useState<any[]>([]);
    const [selectedTab, setSelectedTab] = useState<number>(0);

    const cancelPreview = () => {
        setShowPreviewModal(false);
        setSelectedImages([]);
    };

    const togglePreviewModal = (tabIndex: number) => {
        const images = tabIndex === 0 ? uploadImages1 : tabIndex === 1 ? uploadImages2 : tabIndex === 2 ? uploadImages3 : tabIndex === 3 ? uploadImages4 : uploadImages5;
        setSelectedImages(images);
        setSelectedTab(tabIndex);
        setShowPreviewModal(true);
    };

    const [modalPosition] = useState({ top: '15%', left: '35%' });

    const ImagePreviewModal = () => {
        if (!showPreviewModal) return null;

        return (
            <div className="modal">
                <div className="modal-content">
                    <Draggable>
                        <div className={`${styles.modalPreviewPictureDragable}`} style={modalPosition}>
                            <div className="overflow-auto">
                                {/* modal preview saat insert */}
                                {selectedImages.map((file: any, index: any) => (
                                    <img key={index} src={URL.createObjectURL(file)} alt={`Preview ${index}`} style={{ width: '550px', height: '400px', margin: '5px' }} />
                                ))}
                                {/* modal preview untuk detail */}
                                {selectedTab === 0 && resSrc1 && selectedImages.length == 0 && <img src={resSrc1} alt="Detail Preview" style={{ width: '550px', height: '400px', margin: '5px' }} />}
                                {selectedTab === 1 && resSrc2 && selectedImages.length == 0 && <img src={resSrc2} alt="Detail Preview" style={{ width: '550px', height: '400px', margin: '5px' }} />}
                                {selectedTab === 2 && resSrc3 && selectedImages.length == 0 && <img src={resSrc3} alt="Detail Preview" style={{ width: '550px', height: '400px', margin: '5px' }} />}
                                {selectedTab === 3 && resSrc4 && selectedImages.length == 0 && <img src={resSrc4} alt="Detail Preview" style={{ width: '550px', height: '400px', margin: '5px' }} />}
                                {selectedTab === 4 && resSrc5 && selectedImages.length == 0 && <img src={resSrc5} alt="Detail Preview" style={{ width: '550px', height: '400px', margin: '5px' }} />}

                                {selectedTab === 0 && !resSrc1 && selectedImages.length == 0 && 'Silahkan Upload File Images...'}
                                {selectedTab === 1 && !resSrc2 && selectedImages.length == 0 && 'Silahkan Upload File Images...'}
                                {selectedTab === 2 && !resSrc3 && selectedImages.length == 0 && 'Silahkan Upload File Images...'}
                                {selectedTab === 3 && !resSrc4 && selectedImages.length == 0 && 'Silahkan Upload File Images...'}
                                {selectedTab === 4 && !resSrc5 && selectedImages.length == 0 && 'Silahkan Upload File Images...'}
                            </div>
                            <button
                                className={`${styles.closeButtonDetailDragable}`}
                                onClick={() => {
                                    cancelPreview();
                                }}
                            >
                                <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                            </button>
                        </div>
                    </Draggable>
                </div>
            </div>
        );
    };

    // State untuk menyimpan ID tab yang aktif
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (index: any) => {
        setActiveTab(index);
    };

    const handleBatal = () => {
        router.push({ pathname: './fblist' });
    };

    // console.log(moment(tgl_lpb, 'DD-MM-YYYY').format('YYYY-MM-DD'), 'tgl_lpb');
    // console.log(moment(headerDataFetch[0]?.tgl_fb).format('YYYY-MM-DD'), 'tgl fb');
    // console.log(moment(periode).format('YYYY-MM-DD'), 'periode');

    return (
        <div>
            {/* Form Grid Layouts */}
            <div className="panel mb-3" style={{ background: '#dedede' }}>
                <div className={styles.titleText}> Faktur Pembelian</div>

                <div className="flex justify-between">
                    <div style={{ width: '100%' }}>
                        <div>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Tanggal Dokumen</th>
                                        <th>Tanggal Diterima</th>
                                        <th>No. Faktur</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                                <div
                                                    className="form-input mt-1 flex justify-between"
                                                    style={{
                                                        width: '133px',
                                                        height: '30px',
                                                        padding: '0px 1px 8px 10px',
                                                    }}
                                                >
                                                    <DatePickerComponent
                                                        locale="id"
                                                        cssClass="e-custom-style"
                                                        // renderDayCell={onRenderDayCell}
                                                        enableMask={true}
                                                        maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                        showClearButton={false}
                                                        format="dd-MM-yyyy"
                                                        value={
                                                            tgl_lpb ? tgl_lpb : headerDataFetch && headerDataFetch.length > 0 ? moment(headerDataFetch[0]?.tgl_fb).format('DD-MM-YYYY') : date1.toDate()
                                                        }
                                                        // change={(args: ChangeEventArgsCalendar) => {
                                                        //     // setDate1(moment(args.value));
                                                        //     const selectedDate = moment(args.value);
                                                        //     selectedDate.set({
                                                        //         hour: moment().hour(),
                                                        //         minute: moment().minute(),
                                                        //         second: moment().second(),
                                                        //     });
                                                        //     setDate1(selectedDate);
                                                        // }}
                                                        disabled={true}
                                                    >
                                                        <Inject services={[MaskedDateTime]} />
                                                    </DatePickerComponent>
                                                </div>
                                            </div>

                                            {/* <Flatpickr
                                                disabled
                                                value={
                                                    tgl_lpb
                                                        ? tgl_lpb
                                                        : headerDataFetch && headerDataFetch.length > 0
                                                        ? moment(headerDataFetch[0]?.tgl_fb).format('DD-MM-YYYY HH:mm:ss')
                                                        : date1.format('DD-MM-YYYY HH:mm:ss')
                                                }
                                                options={{
                                                    dateFormat: 'd-m-Y',
                                                }}
                                                className={` ${styles.inputTableBasicDate}`}
                                                onChange={(date) => {
                                                    const selectedDate = moment(date[0]);
                                                    selectedDate.set({
                                                        hour: moment().hour(),
                                                        minute: moment().minute(),
                                                        second: moment().second(),
                                                    });
                                                    setDate1(selectedDate);
                                                }}
                                                style={{ borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}
                                            /> */}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                                <div className="form-input mt-1 flex justify-between" style={{ width: '133px', height: '30px', padding: '0px 1px 8px 10px' }}>
                                                    <DatePickerComponent
                                                        locale="id"
                                                        cssClass="e-custom-style"
                                                        // renderDayCell={onRenderDayCell}
                                                        enableMask={true}
                                                        maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                        showClearButton={false}
                                                        format="dd-MM-yyyy"
                                                        value={
                                                            tgl_trxlpb
                                                                ? tgl_trxlpb
                                                                : headerDataFetch && headerDataFetch.length > 0
                                                                ? moment(headerDataFetch[0]?.tgl_trxfb).format('DD-MM-YYYY')
                                                                : date2.toDate()
                                                        }
                                                        change={(args: ChangeEventArgsCalendar) => {
                                                            const selectedDate = moment(args.value);
                                                            const currentTime = moment();
                                                            selectedDate.set({
                                                                hour: currentTime.hour(),
                                                                minute: currentTime.minute(),
                                                                second: currentTime.second(),
                                                            });
                                                            setDate2(selectedDate);
                                                        }}
                                                    >
                                                        <Inject services={[MaskedDateTime]} />
                                                    </DatePickerComponent>
                                                </div>
                                            </div>
                                            {/* <Flatpickr
                                                value={
                                                    tgl_trxlpb
                                                        ? tgl_trxlpb
                                                        : headerDataFetch && headerDataFetch.length > 0
                                                        ? moment(headerDataFetch[0]?.tgl_trxfb).format('DD-MM-YYYY HH:mm:ss')
                                                        : date2.format('DD-MM-YYYY HH:mm:ss')
                                                }
                                                options={{
                                                    dateFormat: 'd-m-Y',
                                                }}
                                                className={` ${styles.inputTableBasicDate}`}
                                                onChange={(date) => {
                                                    const selectedDate = moment(date[0]);
                                                    const currentTime = moment();
                                                    selectedDate.set({
                                                        hour: currentTime.hour(),
                                                        minute: currentTime.minute(),
                                                        second: currentTime.second(),
                                                    });
                                                    setDate2(selectedDate);
                                                }}
                                                style={{ borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}
                                            /> */}
                                        </td>
                                        <td>
                                            <input
                                                value={noLpbTransformed ? noLpbTransformed : headerDataFetch[0]?.no_fb}
                                                className={`${styles.inputTableBasic}`}
                                                disabled
                                                type="text"
                                                id="nofaktur"
                                                style={{ borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                                <thead>
                                    <tr>
                                        <th>Penerimaan Barang (PB)</th>
                                        <th>No. Surat Jalan Supplier</th>
                                        <th>Supplier</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <div className={`flex`}>
                                                <input
                                                    id="PB"
                                                    disabled
                                                    type="text"
                                                    value={no_lpbSelected ? no_lpbSelected : headerDataFetch[0]?.no_lpb}
                                                    className={`ml-8 mt-1 ltr:rounded-r-none rtl:rounded-l-none ${styles.inputTableBasicSearch}`}
                                                    style={{ textAlign: 'center' }}
                                                />
                                                <div className="flex items-center justify-center border border-white-light bg-[#5E6262] pr-2 font-semibold dark:border-[#17263c] ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0">
                                                    <button
                                                        onClick={() => {
                                                            if (kodeSupplierSelected || detailDataFetch.nodes.length !== 0) {
                                                                setModalPB(true);
                                                            } else {
                                                                SweetAlerts.showAlertSupplier(11, setModalSupplier);
                                                            }
                                                        }}
                                                    >
                                                        <FontAwesomeIcon icon={faMagnifyingGlass} className="ml-2" width="15" color="white" height="15" />
                                                    </button>
                                                    <ListPB
                                                        isOpen={modalPB}
                                                        tanggalDokumen={date1.format('YYYY-MM-DD')}
                                                        kode_entitas={entitasUser}
                                                        onClose={() => setModalPB(false)}
                                                        kodeSupp={kodeSupplierSelected ? kodeSupplierSelected : headerDataFetch[0]?.kode_supp}
                                                        onSelectData={(kode_lpb: any, no_lpb: any) => handleSelectedDataPBB(kode_lpb, no_lpb)}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <input
                                                disabled
                                                value={no_reff ? no_reff : headerDataFetch[0]?.no_sj}
                                                className={`${styles.inputTableBasic}`}
                                                type="text"
                                                id="nojalan"
                                                style={{ borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}
                                            />
                                        </td>
                                        <td>
                                            <div className={`flex`}>
                                                <input
                                                    disabled
                                                    id="supplier"
                                                    value={namaRelasiSelected ? namaRelasiSelected : headerDataFetch[0]?.supplier}
                                                    type="text"
                                                    className={`ml-8 mt-1 ltr:rounded-r-none rtl:rounded-l-none ${styles.inputTableBasicSearch}`}
                                                    style={{ textAlign: 'center' }}
                                                />
                                                <div className="flex items-center justify-center border border-white-light bg-[#5E6262] pr-2 font-semibold dark:border-[#17263c] ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0">
                                                    <button onClick={() => setModalSupplier(true)}>
                                                        <FontAwesomeIcon icon={faMagnifyingGlass} className="ml-2" width="15" height="15" color="white" />
                                                    </button>
                                                    <Supplier
                                                        isOpen={modalSupplier}
                                                        onClose={() => setModalSupplier(false)}
                                                        kode_entitas={entitasUser}
                                                        onSelectData={(namaRelasi: any, termin: any, noSupplier: any) => handleSelectedDataSupplier(namaRelasi, termin, noSupplier)}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                                <thead>
                                    <tr>
                                        <th>Pajak</th>
                                        <th>No. Faktur Pajak</th>
                                        <th>No. Termin</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <input
                                                className={`${styles.inputTableBasic}`}
                                                disabled
                                                value={pajak ? pajak : headerDataFetch[0]?.pjk}
                                                type="text"
                                                id="pajak"
                                                style={{ borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                autoComplete="off"
                                                className={`${styles.inputTableBasic}`}
                                                defaultValue={fakturPajakValue || headerDataFetch[0]?.no_faktur_pajak || ''}
                                                onChange={handleFakturPajakChange}
                                                type="text"
                                                id="nofakturPajak"
                                                style={{ borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                disabled
                                                className={`${styles.inputTableBasic}`}
                                                value={terminSelected ? terminSelected : headerDataFetch[0]?.nama_termin}
                                                type="text"
                                                id="termin"
                                                style={{ borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs>
                <TabList>
                    <Tab>Data Barang</Tab>
                    <Tab>File Pendukung</Tab>
                </TabList>

                <TabPanel>
                    <div className="panel" style={{ background: '#dedede' }}>
                        <div className="flex justify-between">
                            <div></div>
                            <div className="flex">
                                <label style={{ color: 'red' }}>
                                    <input className="form-checkbox mr-2 text-danger" type="checkbox" checked={ppn} onChange={handleCheckboxChange} />
                                    TRANSAKSI PPN
                                </label>
                            </div>
                        </div>
                        <div className="grid grid-cols-8 justify-between gap-5 sm:flex">
                            <div className="grid grid-cols-1 gap-6 xl:grid-cols-1">
                                <div>
                                    <Table
                                        data={no_lpbSelected ? dataApi : detailDataFetch.nodes && detailDataFetch.nodes.length !== 0 ? detailDataFetch : emptyData}
                                        theme={theme}
                                        layout={{ custom: true, horizontalScroll: true, fixedHeader: true }}
                                    >
                                        {(tableList: any[]) => (
                                            <>
                                                <Header>
                                                    <HeaderRow style={{ userSelect: 'none' }}>
                                                        <HeaderCell
                                                            style={{
                                                                textAlign: 'center',
                                                                userSelect: 'none',
                                                                backgroundColor: 'rgb(94, 98, 98)',
                                                                color: 'white',
                                                            }}
                                                        >
                                                            <div className="flex" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                                                                No. Barang
                                                            </div>
                                                        </HeaderCell>

                                                        <HeaderCell
                                                            style={{
                                                                textAlign: 'center',
                                                                userSelect: 'none',
                                                                backgroundColor: 'rgb(94, 98, 98)',
                                                                color: 'white',
                                                            }}
                                                        >
                                                            <div className="flex" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                                                                Nama Barang
                                                            </div>
                                                        </HeaderCell>

                                                        <HeaderCell
                                                            style={{
                                                                textAlign: 'center',
                                                                userSelect: 'none',
                                                                backgroundColor: 'rgb(94, 98, 98)',
                                                                color: 'white',
                                                            }}
                                                        >
                                                            <div className="flex" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                                                                Satuan
                                                            </div>
                                                        </HeaderCell>

                                                        <HeaderCell
                                                            style={{
                                                                textAlign: 'center',
                                                                userSelect: 'none',
                                                                backgroundColor: 'rgb(94, 98, 98)',
                                                                color: 'white',
                                                            }}
                                                        >
                                                            <div className="flex" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                                                                Kuantitas
                                                            </div>
                                                        </HeaderCell>

                                                        <HeaderCell
                                                            style={{
                                                                textAlign: 'center',
                                                                userSelect: 'none',
                                                                backgroundColor: 'rgb(94, 98, 98)',
                                                                color: 'white',
                                                            }}
                                                        >
                                                            <div className="flex" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                                                                Harga
                                                            </div>
                                                        </HeaderCell>

                                                        <HeaderCell
                                                            style={{
                                                                textAlign: 'center',
                                                                userSelect: 'none',
                                                                backgroundColor: 'rgb(94, 98, 98)',
                                                                color: 'white',
                                                            }}
                                                        >
                                                            <div className="flex" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                                                                MU
                                                            </div>
                                                        </HeaderCell>

                                                        <HeaderCell
                                                            style={{
                                                                textAlign: 'center',
                                                                userSelect: 'none',
                                                                backgroundColor: 'rgb(94, 98, 98)',
                                                                color: 'white',
                                                            }}
                                                        >
                                                            <div className="flex" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                                                                Diskon (%)
                                                            </div>
                                                        </HeaderCell>

                                                        <HeaderCell
                                                            style={{
                                                                textAlign: 'center',
                                                                userSelect: 'none',
                                                                backgroundColor: 'rgb(94, 98, 98)',
                                                                color: 'white',
                                                            }}
                                                        >
                                                            <div className="flex" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                                                                Potongan
                                                            </div>
                                                        </HeaderCell>

                                                        <HeaderCell
                                                            style={{
                                                                textAlign: 'center',
                                                                userSelect: 'none',
                                                                backgroundColor: 'rgb(94, 98, 98)',
                                                                color: 'white',
                                                            }}
                                                        >
                                                            <div className="flex" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                                                                Pajak
                                                            </div>
                                                        </HeaderCell>

                                                        <HeaderCell
                                                            style={{
                                                                textAlign: 'center',
                                                                userSelect: 'none',
                                                                backgroundColor: 'rgb(94, 98, 98)',
                                                                color: 'white',
                                                            }}
                                                        >
                                                            <div className="flex" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                                                                Jumlah (Def)
                                                            </div>
                                                        </HeaderCell>

                                                        <HeaderCell
                                                            style={{
                                                                textAlign: 'center',
                                                                userSelect: 'none',
                                                                backgroundColor: 'rgb(94, 98, 98)',
                                                                color: 'white',
                                                            }}
                                                        >
                                                            <div className="flex" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                                                                Keterangan
                                                            </div>
                                                        </HeaderCell>
                                                    </HeaderRow>
                                                </Header>

                                                <Body>
                                                    {tableList.map((item: any) => (
                                                        <Row key={item.id} item={item}>
                                                            <Cell>
                                                                <div className="flex">
                                                                    <input
                                                                        disabled
                                                                        type="text"
                                                                        style={{
                                                                            width: '100%',
                                                                            border: 'none',
                                                                            fontSize: '14px',
                                                                            outline: 'none',
                                                                            background: 'transparent',
                                                                        }}
                                                                        value={item.no_item}
                                                                    />
                                                                </div>
                                                            </Cell>

                                                            <Cell>
                                                                <div className="flex">
                                                                    <input
                                                                        disabled
                                                                        type="text"
                                                                        style={{
                                                                            width: '100%',
                                                                            border: 'none',
                                                                            fontSize: '14px',
                                                                            outline: 'none',
                                                                            background: 'transparent',
                                                                        }}
                                                                        value={item.diskripsi}
                                                                    />
                                                                </div>
                                                            </Cell>

                                                            <Cell>
                                                                <div className="flex">
                                                                    <input
                                                                        disabled
                                                                        type="text"
                                                                        style={{
                                                                            width: '100%',
                                                                            border: 'none',
                                                                            fontSize: '14px',
                                                                            outline: 'none',
                                                                            background: 'transparent',
                                                                            textAlign: 'center',
                                                                        }}
                                                                        value={item.satuan}
                                                                    />
                                                                </div>
                                                            </Cell>

                                                            <Cell>
                                                                <div className="flex">
                                                                    <input
                                                                        disabled
                                                                        type="text"
                                                                        style={{
                                                                            width: '100%',
                                                                            border: 'none',
                                                                            fontSize: '14px',
                                                                            outline: 'none',
                                                                            background: 'transparent',
                                                                            textAlign: 'right',
                                                                        }}
                                                                        value={item.qty}
                                                                    />
                                                                </div>
                                                            </Cell>

                                                            <Cell>
                                                                <div className="flex">
                                                                    <input
                                                                        disabled
                                                                        type="text"
                                                                        style={{
                                                                            width: '100%',
                                                                            border: 'none',
                                                                            fontSize: '14px',
                                                                            outline: 'none',
                                                                            background: 'transparent',
                                                                            textAlign: 'right',
                                                                        }}
                                                                        value={item.harga_mu}
                                                                    />
                                                                </div>
                                                            </Cell>

                                                            <Cell>
                                                                <div className="flex">
                                                                    <input
                                                                        disabled
                                                                        type="text"
                                                                        style={{
                                                                            width: '100%',
                                                                            border: 'none',
                                                                            fontSize: '14px',
                                                                            outline: 'none',
                                                                            background: 'transparent',
                                                                            textAlign: 'center',
                                                                        }}
                                                                        value={item.kode_mu}
                                                                    />
                                                                </div>
                                                            </Cell>

                                                            <Cell>
                                                                <div className="flex">
                                                                    <input
                                                                        disabled
                                                                        type="text"
                                                                        style={{
                                                                            width: '100%',
                                                                            border: 'none',
                                                                            fontSize: '14px',
                                                                            outline: 'none',
                                                                            background: 'transparent',
                                                                            textAlign: 'right',
                                                                        }}
                                                                        value={item.diskon}
                                                                    />
                                                                </div>
                                                            </Cell>

                                                            <Cell>
                                                                <div className="flex">
                                                                    <input
                                                                        disabled
                                                                        type="text"
                                                                        style={{
                                                                            width: '100%',
                                                                            border: 'none',
                                                                            fontSize: '14px',
                                                                            outline: 'none',
                                                                            background: 'transparent',
                                                                            textAlign: 'right',
                                                                        }}
                                                                        value={item.potongan_mu}
                                                                    />
                                                                </div>
                                                            </Cell>

                                                            <Cell>
                                                                <div className="flex">
                                                                    <input
                                                                        disabled
                                                                        type="text"
                                                                        style={{
                                                                            width: '100%',
                                                                            border: 'none',
                                                                            fontSize: '14px',
                                                                            outline: 'none',
                                                                            background: 'transparent',
                                                                        }}
                                                                        value={
                                                                            item.catatan_pajak
                                                                                ? item.catatan_pajak //di detail
                                                                                : item.kode_pajak
                                                                                ? `${item.kode_pajak} - ${item.ket_pajak}` //saat post
                                                                                : item.kode_pajak //state awal
                                                                        }
                                                                    />
                                                                </div>
                                                            </Cell>

                                                            <Cell>
                                                                <div className="flex">
                                                                    <input
                                                                        disabled
                                                                        type="text"
                                                                        style={{
                                                                            width: '100%',
                                                                            border: 'none',
                                                                            fontSize: '14px',
                                                                            outline: 'none',
                                                                            background: 'transparent',
                                                                            textAlign: 'right',
                                                                        }}
                                                                        value={item.jumlah_mu}
                                                                    />
                                                                </div>
                                                            </Cell>

                                                            <Cell>
                                                                <div className="flex">
                                                                    <input
                                                                        type="text"
                                                                        style={{
                                                                            width: '100%',
                                                                            border: 'none',
                                                                            fontSize: '14px',
                                                                            outline: 'none',
                                                                            background: 'transparent',
                                                                        }}
                                                                        value={item.ket}
                                                                        onChange={(event) => handleUpdate(event.target.value, item.id_fb, 'ket')}
                                                                    />
                                                                </div>
                                                            </Cell>
                                                        </Row>
                                                    ))}
                                                </Body>
                                            </>
                                        )}
                                    </Table>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-between">
                            <div></div>

                            <div className="flex">
                                <span>Sub Total</span>
                                <span style={{ margin: '0 5px', fontWeight: 'bold' }}>{total_rp ? total_rp : headerDataFetch[0]?.total_rp}</span>
                            </div>
                        </div>
                    </div>
                </TabPanel>
                {/* File Pendukung */}
                <TabPanel>
                    <div className="panel">
                        <div className={styles['grid-containerFilePendukung']} style={{ height: 250 }}>
                            <div className={styles['grid-left']} style={{ marginTop: -21 }}>
                                <div className="mt-1">
                                    <div>
                                        <Tabs selectedIndex={activeTab} onSelect={handleTabChange}>
                                            <TabList>
                                                <Tab>1</Tab>
                                                <Tab>2</Tab>
                                                <Tab>3</Tab>
                                                <Tab>4</Tab>
                                                <Tab>5</Tab>
                                            </TabList>

                                            <TabPanel>
                                                <div>
                                                    <form>
                                                        {previewTab1.length !== 0 ? (
                                                            previewTab1
                                                        ) : resSrc1 ? (
                                                            <img src={resSrc1} alt="Tab 1" style={{ maxWidth: '300px', maxHeight: '200px', margin: '5px' }} />
                                                        ) : null}
                                                        {fileNameOriginal1 ? fileNameOriginal1 : fileNameDetail1}
                                                    </form>
                                                </div>
                                            </TabPanel>
                                            <TabPanel>
                                                <div>
                                                    <form>
                                                        {previewTab2.length !== 0 ? (
                                                            previewTab2
                                                        ) : resSrc2 ? (
                                                            <img src={resSrc2} alt="Tab 2" style={{ maxWidth: '300px', maxHeight: '200px', margin: '5px' }} />
                                                        ) : null}
                                                        {fileNameOriginal2 ? fileNameOriginal2 : fileNameDetail2}
                                                    </form>
                                                </div>
                                            </TabPanel>
                                            <TabPanel>
                                                <div>
                                                    <form>
                                                        {previewTab3.length !== 0 ? (
                                                            previewTab3
                                                        ) : resSrc3 ? (
                                                            <img src={resSrc3} alt="Tab 3" style={{ maxWidth: '300px', maxHeight: '200px', margin: '5px' }} />
                                                        ) : null}
                                                        {fileNameOriginal3 ? fileNameOriginal3 : fileNameDetail3}
                                                    </form>
                                                </div>
                                            </TabPanel>
                                            <TabPanel>
                                                <div>
                                                    <form>
                                                        {previewTab4.length !== 0 ? (
                                                            previewTab4
                                                        ) : resSrc4 ? (
                                                            <img src={resSrc4} alt="Tab 4" style={{ maxWidth: '300px', maxHeight: '200px', margin: '5px' }} />
                                                        ) : null}
                                                        {fileNameOriginal4 ? fileNameOriginal4 : fileNameDetail4}
                                                    </form>
                                                </div>
                                            </TabPanel>
                                            <TabPanel>
                                                <div>
                                                    <form>
                                                        {previewTab5.length !== 0 ? (
                                                            previewTab5
                                                        ) : resSrc5 ? (
                                                            <img src={resSrc5} alt="Tab 5" style={{ maxWidth: '300px', maxHeight: '200px', margin: '5px' }} />
                                                        ) : null}
                                                        {fileNameOriginal5 ? fileNameOriginal5 : fileNameDetail5}
                                                    </form>
                                                </div>
                                            </TabPanel>
                                        </Tabs>
                                    </div>
                                    <ImagePreviewModal />
                                </div>
                            </div>
                            <div className={styles['grid-right']} style={{ marginTop: '8px' }}>
                                {/* <button disabled type="submit" className="btn btn-gray mb-2 h-[4.5vh]" style={{ backgroundColor: 'gray', color: 'white', width: '14%', height: '15%' }}>
                                    Scanner
                                </button> */}
                                <input type="file" accept="image/jpg, image/jpeg" id={`imageInput${activeTab}`} onChange={(event) => handleFileChange(event, activeTab)} style={{ display: 'none' }} />
                                <label htmlFor={`imageInput${activeTab}`} className="btn btn-gray mb-2 h-[4.5vh]" style={{ backgroundColor: 'gray', color: 'white', width: '20%', height: '15%' }}>
                                    File..
                                </label>
                                <button
                                    type="submit"
                                    onClick={() => {
                                        removeImageTab(activeTab);
                                        handleCleanImage(activeTab);
                                    }}
                                    className="btn btn-gray mb-2 h-[4.5vh]"
                                    style={{ backgroundColor: 'gray', color: 'white', width: '20%', height: '15%' }}
                                >
                                    Bersihkan Gambar
                                </button>
                                <button
                                    onClick={async () => {
                                        handleBersihkanSemua();
                                    }}
                                    type="submit"
                                    className="btn btn-gray mb-2 h-[4.5vh]"
                                    style={{ backgroundColor: 'gray', color: 'white', width: '20%', height: '15%' }}
                                >
                                    Bersihkan Semua
                                </button>
                                <button
                                    onClick={() => togglePreviewModal(activeTab)}
                                    type="submit"
                                    className="btn btn-gray mb-2 h-[4.5vh]"
                                    style={{ backgroundColor: 'gray', color: 'white', width: '20%', height: '15%' }}
                                >
                                    <FontAwesomeIcon icon={faCamera} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                    Preview
                                </button>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </Tabs>

            <div className="panel mt-3" style={{ background: '#dedede' }}>
                <div className={styles['grid-containerNote']}>
                    <div className={styles['grid-leftNote']}>
                        <div>
                            <label>Catatan:</label>
                            <form>
                                <div className="mb-4 w-full rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600">
                                    <div className="rounded-b-lg bg-white px-4 py-2 dark:bg-gray-800">
                                        <label className="sr-only">Publish post</label>
                                        <textarea
                                            id="editor"
                                            defaultValue={keterangan || headerDataFetch[0]?.keterangan}
                                            onChange={handleTextareaChange}
                                            rows={3}
                                            className=" form-input block w-full border-0 bg-white px-0 text-sm text-gray-800 outline-0 focus:ring-0 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                                            placeholder=""
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className={styles['grid-rightNote']}>
                        <div className="mt-5 flex justify-between">
                            <div>
                                <div>Diskon</div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>
                                    {no_lpbSelected ? diskon_dok_rp : headerDataFetch[0]?.diskon_dok_rp !== '0.00' ? headerDataFetch[0]?.diskon_dok_rp : null}
                                    {/* kondisi  */}
                                    {/* Jika no_lpbSelected dipilih, maka tampilkan diskon_dok_rp, jika no_lpbSelected tidak dipilih maka lanjut ke kondisi selanjutnya */}
                                    {/* jika headerDataFetch : diskon_dok_rp nilainya bukan '0.00' maka tampilkan headerDataFetch : diskon_dok_rp */}
                                    {/* jika tidak ada kondisi yang terpenuhi maka tampilkan null */}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <div>
                                <div>DPP</div> {/* Harga Asli Sebelum Ditambah Pajak */}
                            </div>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>
                                    {no_lpbSelected && total_pajak_rp ? total_rp : headerDataFetch[0]?.total_pajak_rp !== '0.00' && !no_lpbSelected ? headerDataFetch[0]?.total_rp : null}
                                    {/* kondisi : */}
                                    {/* jika no_lpbSelected dipilih dan total_pajak_rp memiliki value maka tampilkan total_rp jika tidak lanjut ke kondisi selanjutnya */}
                                    {/* jika headerDataFetch : total_pajak_rp nilainya bukan '0.00' && no_lpbSelected belum dipilih maka tampilkan headerDataFetch : total_rp*/}
                                    {/* jika tidak ada kondisi yang terpenuhi maka tampilkan null */}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <div>
                                <div>Pajak</div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{no_lpbSelected ? total_pajak_rp : headerDataFetch[0]?.total_pajak_rp !== '0.00' ? headerDataFetch[0]?.total_pajak_rp : null}</div>
                            </div>
                        </div>
                        <div className="mt-1 h-2 border-t-2 border-solid border-black"></div>

                        <div className="flex justify-between">
                            <div>
                                <div>Total Keseluruhan</div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{netto_rp ? netto_rp : headerDataFetch[0]?.netto_rp}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex" style={{ marginTop: '10px' }}>
                <div style={{ width: '111px' }}>
                    <button
                        type="submit"
                        onClick={() => {
                            // BLOCKING:
                            // Memeriksa apakah tanggal fb kurang dari tanggal awal periode akuntansi.
                            // Messages : tanggal transaksi tidak dalam periode akuntansi
                            if (moment(tgl_lpb, 'DD-MM-YYYY').format('YYYY-MM-DD') < moment(periode).format('YYYY-MM-DD')) {
                                SweetAlerts.showAlertBlockingTanggalFBKurangdariPeriodeAkuntansi(13);
                            } else if (tgl_lpb == null && moment(headerDataFetch[0]?.tgl_fb).format('YYYY-MM-DD') < moment(periode).format('YYYY-MM-DD')) {
                                SweetAlerts.showAlertBlockingTanggalFBKurangdariPeriodeAkuntansi(13);
                                // Memeriksa apakah tanggal transaksi (dokumen) lebih kecil dari hari ini.
                                // Jika iya, tampilkan konfirmasi kepada pengguna, keluar jika user tidak setuju
                            } else if (moment(tgl_lpb, 'DD-MM-YYYY').format('YYYY-MM-DD') < moment().format('YYYY-MM-DD')) {
                                SweetAlerts.showAlertBlockingTanggalDokumenLebihKecilDariHariIni(11, saveDoc);
                            } else {
                                detailDataFetch.nodes.length === 0 && !no_lpbSelected ? SweetAlerts.showAlertWarning(11) : SweetAlerts.showAlertSimpan(11, saveDoc);
                            }
                        }}
                        className="btn btn-secondary mr-1"
                        style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }}
                    >
                        <FontAwesomeIcon icon={faSave} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                        Simpan
                    </button>
                </div>
                <div style={{ width: '82.5%' }}>
                    <button onClick={handleBatal} type="submit" className="btn btn-secondary mr-1" style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }}>
                        <FontAwesomeIcon icon={faCancel} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                        Batal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default fbbDetail;
