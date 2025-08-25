import * as React from 'react';
import { ButtonComponent, CheckBoxComponent } from '@syncfusion/ej2-react-buttons';
import { Dialog, DialogComponent, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { Tab, TabComponent } from '@syncfusion/ej2-react-navigations';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { FocusInEventArgs } from '@syncfusion/ej2-react-inputs';
import { ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import LookupComboBox from './LookupComboBox';
import 'flatpickr/dist/flatpickr.css';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json'; // To load the culture based first day of week
import idIDLocalization from 'public/syncfusion/locale.json';
import { useEffect, useState } from 'react';
import axios from 'axios';
import swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import styles from '../daftarRelasi.module.css';
import moment from 'moment';
import { useRouter } from 'next/router';
import GridKontak from './GridKontak';
L10n.load(idIDLocalization);
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
enableRipple(true);
interface dialogRelasiProps {
    token: any;
    userid: any;
    kode_entitas: any;
    masterKodeRelasi: any;
    masterDataState: any;
    isOpen: boolean;
    onClose: any;
    onRefresh?: any;
    target?: string;
}

interface ProvinsiStateAPI {
    nama_propinsi: string;
}
interface KotaStateAPI {
    nama_propinsi: string;
    nama_kota: string;
}
interface KecamatanStateAPI {
    nama_kecamatan: string;
}
interface KelurahanStateAPI {
    nama_kecamatan: string;
    nama_kelurahan: string;
    nama_kodepos: string;
}

interface DetailRelasi {
    kode_relasi: string;
    id_relasi: string;
    nama_lengkap: string;
    nama_person: string;
    jab: string;
    hubungan: string;
    bisnis: string;
    bisnis2: string;
    telp: string;
    hp: string;
    hp2: string;
    fax: string;
    email: string;
    catatan: string;
    file_kuasa: string;
    file_ktp: string;
    file_ttd: string;
    aktif_kontak: string;
}
const DialogRelasi: React.FC<dialogRelasiProps> = ({ userid, kode_entitas, masterKodeRelasi, masterDataState, isOpen, onClose, onRefresh, token, target }: dialogRelasiProps) => {
    // Base URL API Data
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const router = useRouter();
    const { norelasi, isRedirectFromSupp, masterState, nomor_supplier } = router.query;
    const [masterKeterangan, setMasterKeterangan] = useState<any>(null);

    const [provinsiList, setProvinsiList] = useState<ProvinsiStateAPI[] | any>([]);
    const [kotaList, setKotaList] = useState<KotaStateAPI[] | any>([]);
    const [kecamatanList, setKecamatanList] = useState<KecamatanStateAPI[] | any>([]);
    const [kelurahanList, setKelurahanList] = useState<KelurahanStateAPI[] | any>([]);
    const gridDetailRelasi = React.useRef<any>(null);
    const [stateBrowse, setStateBrowse] = useState<boolean>(true);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const tabId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('tabId') || '' : '';

    //======================= State Data Master ====================
    const [masterData, setMasterData] = useState<any>({
        entitas: kode_entitas,
        kode_relasi: '',
        tipe: 'Badan Hukum',
        nama_relasi: '',
        alamat: '',
        alamat2: '',
        kota: '',
        propinsi: '',
        kodepos: '',
        negara: '',
        telp: '',
        telp2: '',
        hp: '',
        hp2: '',
        fax: '',
        email: '',
        website: '',
        npwp: '',
        siup: '',
        personal: '',
        ktp: '',
        sim: '',
        tgl_relasi: moment(),
        catatan: '',
        userid: userid,
        tgl_update: moment(),
        kecamatan: '',
        kelurahan: '',
    });
    const [kontakRelasiForm, setKontakRelasiForm] = useState<DetailRelasi[] | any>([]);

    // Loading data indicator
    const [showLoader, setShowLoader] = useState(true);
    const closeDialogRelasi = () => {
        if (norelasi) {
            const targetUrl = '/kcn/ERP/master/supplier/supplier';
            const queryParams = {
                tabId: tabId,
                norelasi: norelasi,
                masterState: masterState,
                nomor_supplier: nomor_supplier ? nomor_supplier : '',
            };
            return router.push({
                pathname: targetUrl,
                query: queryParams,
            });
        } else if (isRedirectFromSupp) {
            const targetUrl = '/kcn/ERP/master/supplier/supplier';
            const queryParams = {
                isRedirectFromSupp: isRedirectFromSupp,
            };
            return router.push({
                pathname: targetUrl,
                query: queryParams,
            });
        }

        onClose();
        setTimeout(() => {
            if (onRefresh) {
                onRefresh();
            }
        }, 100);
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
        timer: 3500,
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
    const convertDateToString = (date: Date) => {
        // Konversi tanggal ke string dengan format YYYY-MM-DD HH:mm:ss
        return date.toISOString().slice(0, 19).replace('T', ' ');
    };
    const postingInputData = async (data: any) => {
        let jsonSave: any;
        if (masterDataState === 'BARU') {
            jsonSave = {
                entitas: kode_entitas,
                tipe: masterData.tipe,
                nama_relasi: masterData.nama_relasi,
                alamat: masterData.alamat,
                alamat2: masterData.alamat2,
                kota: masterData.kota,
                propinsi: masterData.propinsi,
                kodepos: masterData.kodepos,
                negara: masterData.negara,
                telp: masterData.telp,
                telp2: masterData.telp2,
                hp: masterData.hp,
                hp2: masterData.hp2,
                fax: masterData.fax,
                email: masterData.email,
                website: masterData.website,
                npwp: masterData.npwp,
                siup: masterData.siup,
                personal: masterData.personal,
                ktp: masterData.ktp,
                sim: masterData.sim,
                tgl_relasi: moment(masterData.tgl_relasi).format('YYYY-MM-DD HH:mm:ss'),
                catatan: masterData.catatan,
                userid: userid,
                tgl_update: moment(masterData.tgl_update).format('YYYY-MM-DD HH:mm:ss'),
                kecamatan: masterData.kecamatan,
                kelurahan: masterData.kelurahan,
                detail: gridDetailRelasi.current.dataSource,
            };
            console.log('save', jsonSave);

            const response = await axios.post(`${apiUrl}/erp/simpan_relasi`, jsonSave);
            const result = response.data;
            const status = result.status;
            const errormsg = result.serverMessage;
            if (status === true) {
                withReactContent(swalToast).fire({
                    title: ``,
                    html: '<p style="font-size:12px">Data Relasi Baru berhasil disimpan</p>',
                    icon: 'success',
                    width: '350px',
                    heightAuto: true,
                    showConfirmButton: false,
                    timer: 1500,
                    target: target ?? '#main-target',
                });
                if (norelasi) {
                    const targetUrl = '/kcn/ERP/master/supplier/supplier';
                    const queryParams = {
                        tabId: tabId,
                        norelasi: norelasi,
                        masterState: masterState,
                        nomor_supplier: nomor_supplier ? nomor_supplier : '',
                    };
                    return router.push({
                        pathname: targetUrl,
                        query: queryParams,
                    });
                } else if (isRedirectFromSupp) {
                    const targetUrl = '/kcn/ERP/master/supplier/supplier';
                    const queryParams = {
                        isRedirectFromSupp: isRedirectFromSupp,
                    };
                    return router.push({
                        pathname: targetUrl,
                        query: queryParams,
                    });
                }
                closeDialogRelasi();
                setDialogKontakRelasiVisible(false);
            } else {
                withReactContent(swalToast).fire({
                    icon: 'error',
                    title: '<p style="font-size:12px">' + errormsg + '</p>',
                    width: '100%',
                    target: '#DialogRelasi',
                });
            }
        } else if (masterDataState == 'EDIT') {
            jsonSave = {
                entitas: kode_entitas,
                kode_relasi: masterData.kode_relasi,
                tipe: masterData.tipe,
                nama_relasi: masterData.nama_relasi,
                alamat: masterData.alamat,
                alamat2: masterData.alamat2,
                kota: masterData.kota,
                propinsi: masterData.propinsi,
                kodepos: masterData.kodepos,
                negara: masterData.negara,
                telp: masterData.telp,
                telp2: masterData.telp2,
                hp: masterData.hp,
                hp2: masterData.hp2,
                fax: masterData.fax,
                email: masterData.email,
                website: masterData.website,
                npwp: masterData.npwp,
                siup: masterData.siup,
                personal: masterData.personal,
                ktp: masterData.ktp,
                sim: masterData.sim,
                tgl_relasi: moment(masterData.tgl_relasi).format('YYYY-MM-DD HH:mm:ss'),
                catatan: masterData.catatan,
                userid: masterData.userid,
                tgl_update: moment(masterData.tgl_update).format('YYYY-MM-DD HH:mm:ss'),
                kecamatan: masterData.kecamatan,
                kelurahan: masterData.kelurahan,
                detail: gridDetailRelasi.current.dataSource,
            };
            // console.log(masterData.tgl_relasi);
            const response = await axios.patch(`${apiUrl}/erp/update_relasi`, jsonSave);
            const result = response.data;
            const status = result.status;
            const errormsg = result.serverMessage;
            if (status === true) {
                withReactContent(swalToast).fire({
                    title: ``,
                    html: '<p style="font-size:12px">Data Relasi berhasil disimpan</p>',
                    icon: 'success',
                    width: '350px',
                    heightAuto: true,
                    showConfirmButton: false,
                    timer: 1500,
                    target: target ?? '#main-target',
                });
                if (norelasi) {
                    const targetUrl = '/kcn/ERP/master/supplier/supplier';
                    const queryParams = {
                        tabId: tabId,
                        norelasi: norelasi,
                        masterState: masterState,
                        nomor_supplier: nomor_supplier ? nomor_supplier : '',
                    };
                    return router.push({
                        pathname: targetUrl,
                        query: queryParams,
                    });
                } else if (isRedirectFromSupp) {
                    const targetUrl = '/kcn/ERP/master/supplier/supplier';
                    const queryParams = {
                        isRedirectFromSupp: isRedirectFromSupp,
                    };
                    return router.push({
                        pathname: targetUrl,
                        query: queryParams,
                    });
                }
                closeDialogRelasi();
            } else {
                withReactContent(swalToast).fire({
                    icon: 'error',
                    title: '<p style="font-size:12px">' + errormsg + '</p>',
                    width: '100%',
                    target: '#dialogKontakRelasi',
                });
            }
        }
    };
    const simpanData = async (data: any) => {
        if (!masterData.nama_relasi) {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: 'Perusahaan Belum Diisi',
                width: '100%',
                target: '#DialogRelasi',
            });
        } else if (!masterData.alamat) {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: 'Alamat Belum Diisi',
                width: '100%',
                target: '#DialogRelasi',
            });
        } else if (!masterData.kodepos) {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: 'Kode Pos Belum Diisi',
                width: '100%',
                target: '#DialogRelasi',
            });
        } else if (!masterData.kota) {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: 'Kota Belum Diisi',
                width: '100%',
                target: '#DialogRelasi',
            });
        } else if (!masterData.telp) {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: 'Telepon Belum Diisi',
                width: '100%',
                target: '#DialogRelasi',
            });
        } else if (!masterData.personal) {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: 'Personal Belum Diisi',
                width: '100%',
                target: '#DialogRelasi',
            });
        } else {
            await postingInputData(data);
        }
    };
    useEffect(() => {
        const refreshDatasource = async () => {
            setShowLoader(true);
            if (masterDataState === 'BARU') {
                setMasterData({
                    entitas: kode_entitas,
                    kode_relasi: '',
                    tipe: 'Badan Hukum',
                    nama_relasi: '',
                    alamat: '',
                    alamat2: '',
                    kota: '',
                    propinsi: '',
                    kodepos: '',
                    negara: '',
                    telp: '',
                    telp2: '',
                    hp: '',
                    hp2: '',
                    fax: '',
                    email: '',
                    website: '',
                    npwp: '',
                    siup: '',
                    personal: '',
                    ktp: '',
                    sim: '',
                    tgl_relasi: moment(),
                    catatan: '',
                    userid: '',
                    tgl_update: moment(),
                    kecamatan: '',
                    kelurahan: '',
                });
                setKontakRelasiForm([
                    {
                        kode_relasi: masterDataState === 'BARU' ? '' : masterData.kode_relasi,
                        id_relasi: '',
                        nama_lengkap: '',
                        nama_person: '',
                        jab: '',
                        hubungan: '',
                        bisnis: '',
                        bisnis2: '',
                        telp: '',
                        hp: '',
                        hp2: '',
                        fax: '',
                        email: '',
                        catatan: '',
                        file_kuasa: '',
                        file_ktp: '',
                        file_ttd: '',
                        aktif_kontak: 'Y',
                    },
                ]);
            }

            if (masterDataState == 'EDIT') {
                const responseHeader = await axios.get(`${apiUrl}/erp/master_daftar_relasi?`, {
                    params: {
                        entitas: kode_entitas,
                        param1: masterKodeRelasi,
                        param2: 'all',
                        param3: 'all',
                        paramLimit: 1,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const responseDataHeader = responseHeader.data.data[0];
                setMasterData(responseDataHeader);

                const responseDetail = await axios.get(`${apiUrl}/erp/detail_daftar_relasi?`, {
                    params: {
                        entitas: kode_entitas,
                        param1: masterKodeRelasi,
                    },
                });

                const responseDataDetail = responseDetail.data.data;
                gridDetailRelasi.current!.setProperties({ dataSource: responseDataDetail });

                // Menunggu beberapa saat sebelum mengeksekusi kode selanjutnya
                setTimeout(() => {
                    // Kode selanjutnya setelah pengaturan data selesai
                    setShowLoader(false);
                }, 300);
            } else {
                setShowLoader(false);
            }
        };
        refreshDatasource();
    }, [masterKodeRelasi, masterDataState]);

    useEffect(() => {
        const dialogElement = document.getElementById('DialogRelasi');
        if (dialogElement) {
            dialogElement.style.maxHeight = 'none';
            dialogElement.style.maxWidth = 'none';
        }
    }, []);

    let tabDialogRelasi: Tab | any;
    let buttonInputData: ButtonPropsModel[];
    buttonInputData = [
        {
            buttonModel: {
                content: 'Tutup',
                cssClass: 'e-danger e-small',
                // isPrimary: true,
            },
            isFlat: false,
            click: closeDialogRelasi,
        },
    ];
    //======= Disable hari minggu di calendar ========
    function onRenderDayCell(args: RenderDayCellEventArgs): void {
        if ((args.date as Date).getDay() === 0) {
            args.isDisabled = true;
        }
    }
    const apiTipeRelasi = [
        {
            tipe: 'Perorangan',
        },
        {
            tipe: 'Badan Hukum',
        },
    ];
    let textareaObj: any;
    function onCreateMultiline(): void {
        textareaObj.addAttributes({ rows: 1 });
        textareaObj.respectiveElement.style.height = 'auto';
        textareaObj.respectiveElement.style.height = '60px'; //textareaObj.respectiveElement.scrollHeight + 'px';
    }
    function onInputMultiline(args: FocusInEventArgs): void {
        textareaObj.respectiveElement.style.height = 'auto';
        textareaObj.respectiveElement.style.height = Math.max(textareaObj.respectiveElement.scrollHeight, 60) + 'px';

        const value: any = args.value;
        setMasterKeterangan(value);
    }

    let setFocus: any;

    // UseEffect untuk data Wilayah
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch data Provinsi jika daftarnya masih kosong
                if (provinsiList.length === 0) {
                    const responseProvinsi = await axios.get(
                        `${apiUrl}/erp/list_wilayah_daftar_relasi?` +
                            new URLSearchParams({
                                entitas: kode_entitas,
                                param1: 'provinsi',
                            })
                    );
                    const dataProvinsi = responseProvinsi.data.data;

                    // Menggunakan map() untuk remap data
                    const remap = Array.isArray(dataProvinsi)
                        ? dataProvinsi.map((item: any) => ({
                              value: item.nama_propinsi,
                              label: item.nama_propinsi,
                          }))
                        : Object.values(dataProvinsi).map((item: any) => ({
                              value: item.nama_propinsi,
                              label: item.nama_propinsi,
                          }));

                    setProvinsiList(remap);
                }

                // Fetch data Kota jika daftarnya masih kosong
                if (kotaList.length === 0) {
                    const responseKota = await axios.get(`${apiUrl}/erp/list_wilayah_daftar_relasi?`, {
                        params: {
                            entitas: kode_entitas,
                            param1: 'kota',
                        },
                    });

                    const dataKota = await responseKota.data.data;

                    const remap = Array.isArray(dataKota)
                        ? dataKota.map((item: any) => ({
                              value: item.nama_kota,
                              label: item.nama_kota,
                          }))
                        : Object.values(dataKota).map((item: any) => ({
                              value: item.nama_kota,
                              label: item.nama_kota,
                          }));

                    setKotaList(remap);
                }

                // Fetch data Kecamatan jika daftarnya masih kosong
                if (kecamatanList.length === 0) {
                    const responseKecamatan = await axios.get(`${apiUrl}/erp/list_wilayah_daftar_relasi?`, {
                        params: {
                            entitas: kode_entitas,
                            param1: 'kecamatan',
                        },
                    });
                    const dataKecamatan = responseKecamatan.data.data;
                    const remap = Array.isArray(dataKecamatan)
                        ? dataKecamatan.map((item: any) => ({
                              value: item.nama_kecamatan,
                              label: item.nama_kecamatan,
                          }))
                        : Object.values(dataKecamatan).map((item: any) => ({
                              value: item.nama_kecamatan,
                              label: item.nama_kecamatan,
                          }));

                    setKecamatanList(remap);
                }

                // Fetch data Kelurahan jika daftarnya masih kosong
                if (kelurahanList.length === 0) {
                    const responsekelurahan = await axios.get(`${apiUrl}/erp/list_wilayah_daftar_relasi?`, {
                        params: {
                            entitas: kode_entitas,
                            param1: 'kelurahan',
                        },
                    });
                    const datakelurahan = responsekelurahan.data.data;
                    const remap = Array.isArray(datakelurahan)
                        ? datakelurahan.map((item: any) => ({
                              value: item.nama_kelurahan,
                              label: item.nama_kelurahan,
                          }))
                        : Object.values(datakelurahan).map((item: any) => ({
                              value: item.nama_kelurahan,
                              label: item.nama_kelurahan,
                          }));

                    setKelurahanList(remap);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [masterKodeRelasi]); // Empty dependency array to run only once when component mounts
    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setMasterData({
            ...masterData,
            [name]: value,
        });
    };
    const fetchLookupData = async (jenis: string, lookup: string, name: string) => {
        const responseData = await axios.get(`${apiUrl}/erp/list_wilayah_daftar_relasi?`, {
            params: {
                entitas: kode_entitas,
                param1: name,
                param2: `${'nama_' + jenis} LIKE "%${lookup}%"`,
            },
        });
        if (responseData.data.data.length > 0) {
            if (name === 'kota') {
                const data = await responseData.data.data;

                const remap = Array.isArray(data)
                    ? data.map((item: any) => ({
                          value: item.nama_kota,
                          label: item.nama_kota,
                      }))
                    : Object.values(data).map((item: any) => ({
                          value: item.nama_kota,
                          label: item.nama_kota,
                      }));

                setKotaList(remap);
            } else if (name === 'kelurahan') {
                const datakelurahan = responseData.data.data;
                const remap = Array.isArray(datakelurahan)
                    ? datakelurahan.map((item: any) => ({
                          value: item.nama_kelurahan,
                          label: item.nama_kelurahan,
                      }))
                    : Object.values(datakelurahan).map((item: any) => ({
                          value: item.nama_kelurahan,
                          label: item.nama_kelurahan,
                      }));

                setKelurahanList(remap);
            }
        }
    };

    const setKodePos = async (text: string) => {
        const responseData = await axios.get(`${apiUrl}/erp/list_wilayah_daftar_relasi?`, {
            params: {
                entitas: kode_entitas,
                param1: 'kelurahan',
                param2: `${'nama_kelurahan'} = "${text}"`,
            },
        });

        if (responseData.data.data.length > 0) {
            setMasterData({
                ...masterData,
                kodepos: responseData.data.data[0]?.nama_kodepos ?? '',
                kelurahan: text
            });
        }
    };
    const rowDataBoundDetailRelasi = (args: any) => {
        if (args.row) {
            if (getValue('kode_relasi', args.data) == 'ADDROW') {
                args.row.style.background = '#F2FDF8';
            } else {
                args.row.style.background = '#ffffff';
            }
        }
    };

    //============= Format cell pada grid Detail Barang =============
    const queryCellInfoDetailRelasi = (args: any) => {
        if ((args.column?.field === 'fpp_btg' || args.column?.field === 'fpp_harga_btg' || args.column?.field === 'berat') && !args.column?.isSelected) {
            args.cell.style.color = '#B6B5B5';
        }
    };
    //======= Fungsi menampilkan window/tab baru tanpa kena blok di Browser ========
    const [TotalRelasi, setTotalRelasi] = useState(0);
    const [TotalRecords, setTotalRecords] = useState(0);

    const [idRelasi, setIdRelasi] = useState(0);
    const [rowIdxDetailBarang, setRowIdxDetailBarang] = useState(0);
    let dialogKontakRelasi: Dialog | any;
    const [dialogKontakRelasiVisible, setDialogKontakRelasiVisible] = useState(false);
    const addDetailRelasi = async () => {
        console.log(masterDataState === 'BARU' ? '' : masterData.kode_relasi);
        setEditModeDetail(false);
        setSelectedListData({
            kode_relasi: masterDataState === 'BARU' ? '' : masterData.kode_relasi,
            id_relasi: '',
            nama_lengkap: '',
            nama_person: '',
            jab: '',
            hubungan: '',
            bisnis: '',
            bisnis2: '',
            telp: '',
            hp: '',
            hp2: '',
            fax: '',
            email: '',
            catatan: '',
            file_kuasa: '',
            file_ktp: '',
            file_ttd: '',
            aktif_kontak: 'Y',
        });
        setDialogKontakRelasiVisible(true);
    };
    useEffect(() => {
        if (masterDataState === 'BARU') {
            setSelectedListData({
                kode_relasi: masterDataState === 'BARU' ? '' : masterData.kode_relasi,
                id_relasi: '',
                nama_lengkap: '',
                nama_person: '',
                jab: '',
                hubungan: '',
                bisnis: '',
                bisnis2: '',
                telp: '',
                hp: '',
                hp2: '',
                fax: '',
                email: '',
                catatan: '',
                file_kuasa: '',
                file_ktp: '',
                file_ttd: '',
                aktif_kontak: 'Y',
            });
        }
    }, [masterDataState]);

    const [inputValue, setInputValue] = useState({
        kode_relasi: masterDataState === 'BARU' ? '' : masterData.kode_relasi,
        id_relasi: '',
        nama_lengkap: '',
        nama_person: '',
        jab: '',
        hubungan: '',
        bisnis: '',
        bisnis2: '',
        telp: '',
        hp: '',
        hp2: '',
        fax: '',
        email: '',
        catatan: '',
        file_kuasa: '',
        file_ktp: '',
        file_ttd: '',
        aktif_kontak: 'Y',
    });

    const handleInputChange = (event: any) => {
        const target = event.target || event.currentTarget;
        const { name, type, checked, value } = target;
        const newValue = type === 'checkbox' ? (checked ? 'N' : 'Y') : value;
        setInputValue({ ...inputValue, [name]: newValue });
    };
    const [editModeDetail, setEditModeDetail] = useState(false);

    let buttonKontakRelasi: ButtonPropsModel[];
    buttonKontakRelasi = [
        {
            buttonModel: {
                content: 'Simpan',
                //iconCss: 'e-icons e-save',
                cssClass: 'e-primary e-small',
            },
            isFlat: false,
            click: () => {
                if (!editModeDetail) {
                    let totalLine = gridDetailRelasi.current.dataSource?.length;
                    const id = idRelasi + totalLine + 1;

                    const newObject = {
                        ...inputValue,
                        id_relasi: (totalLine + 1).toString() as string,
                    };
                    gridDetailRelasi.current!.addRecord(newObject);
                    setRowIdxDetailBarang(id);
                    setDialogKontakRelasiVisible(false);
                    gridDetailRelasi.current!.refresh();

                    setInputValue({
                        kode_relasi: masterDataState === 'BARU' ? '' : masterData.kode_relasi,
                        id_relasi: '',
                        nama_lengkap: '',
                        nama_person: '',
                        jab: '',
                        hubungan: '',
                        bisnis: '',
                        bisnis2: '',
                        telp: '',
                        hp: '',
                        hp2: '',
                        fax: '',
                        email: '',
                        catatan: '',
                        file_kuasa: '',
                        file_ktp: '',
                        file_ttd: '',
                        aktif_kontak: 'Y',
                    });
                } else {
                    const rowIndex = gridDetailRelasi.current!.getSelectedRowIndexes();
                    const existingData = gridDetailRelasi.current!.properties.dataSource;
                    const updatedArray = (existingData[rowIndex] = {
                        ...inputValue,
                    });

                    kontakRelasiForm[rowIndex] = {
                        ...updatedArray,
                    };
                    gridDetailRelasi.current!.refresh();
                    setDialogKontakRelasiVisible(false);
                    setInputValue({
                        kode_relasi: masterDataState === 'BARU' ? '' : masterData.kode_relasi,
                        id_relasi: '',
                        nama_lengkap: '',
                        nama_person: '',
                        jab: '',
                        hubungan: '',
                        bisnis: '',
                        bisnis2: '',
                        telp: '',
                        hp: '',
                        hp2: '',
                        fax: '',
                        email: '',
                        catatan: '',
                        file_kuasa: '',
                        file_ktp: '',
                        file_ttd: '',
                        aktif_kontak: 'Y',
                    });
                }
            },
        },
        {
            buttonModel: {
                content: 'Batal',
                //iconCss: 'e-icons e-close',
                cssClass: 'e-danger e-small',
                // isPrimary: true,
            },
            isFlat: false,
            click: () => {
                console.log(kontakRelasiForm);
                setEditModeDetail(false);

                // setDialogKontakRelasiVisible(false);
                setInputValue({
                    kode_relasi: masterDataState === 'BARU' ? '' : masterData.kode_relasi,
                    id_relasi: '',
                    nama_lengkap: '',
                    nama_person: '',
                    jab: '',
                    hubungan: '',
                    bisnis: '',
                    bisnis2: '',
                    telp: '',
                    hp: '',
                    hp2: '',
                    fax: '',
                    email: '',
                    catatan: '',
                    file_kuasa: '',
                    file_ktp: '',
                    file_ttd: '',
                    aktif_kontak: 'Y',
                });
            },
        },
    ];

    const [isAktifKontakChecked, setIsAktifKontakChecked] = useState<boolean>(false);
    const [selectedListData, setSelectedListData] = useState({
        kode_relasi: masterDataState === 'BARU' ? '' : masterData.kode_relasi,
        id_relasi: '',
        nama_lengkap: '',
        nama_person: '',
        jab: '',
        hubungan: '',
        bisnis: '',
        bisnis2: '',
        telp: '',
        hp: '',
        hp2: '',
        fax: '',
        email: '',
        catatan: '',
        file_kuasa: '',
        file_ktp: '',
        file_ttd: '',
        aktif_kontak: 'Y',
    }); // State untuk data terpilih dari grid

    const showEditRecord = () => {
        setEditModeDetail(true);
        const selectedData = gridDetailRelasi.current!.getSelectedRecords();

        if (selectedData.length > 0 && masterDataState === 'EDIT' && masterKodeRelasi === selectedData[0].kode_relasi) {
            setSelectedListData(selectedData);
            setInputValue(selectedData[0]);
            setDialogKontakRelasiVisible(true);
        } else {
            withReactContent(swalDialog).fire({
                title: 'Pilih Data Detail yang Akan di Update!',
                icon: 'info',
                target: '#DialogRelasi',
                width: '350px',
            });
        }
    };

    const hubunganKepemilikanArray = [
        {
            name: 'Anggota Keluarga Pemilik',
        },
        {
            name: 'Manager Keuangan',
        },
        {
            name: 'Manager Pembelian',
        },
        {
            name: 'Admin Keuangan',
        },
        {
            name: 'Admin Pembelian',
        },
        {
            name: 'karyawan Toko',
        },
        {
            name: 'Lainnya',
        },
    ];
    const jabatanArray = [
        {
            name: 'Pemilik',
        },
        {
            name: 'Suami / Istri Pemilik',
        },
        {
            name: 'Anak Pemilik',
        },
        {
            name: 'Orang Tua Pemilik',
        },
        {
            name: 'Saudara Lain',
        },
        {
            name: 'Orang Lain (Tidak Memiliki Hub dengan Pemilik',
        },
        {
            name: 'Lainnya',
        },
    ];
    return (
        <>
            <div>
                {/* prettier-ignore */}
                <DialogComponent
                    id="DialogRelasi"
                    name="DialogRelasi"
                    className="DialogRelasi"
                    target={target ?? '#main-target'}
                    header={() => {
                        let header: string = '';
                        if (masterDataState === 'BARU') {
                            header = 'Daftar Relasi Baru';
                        } else if (masterDataState == 'EDIT') {
                            header = 'Edit Relasi';
                        }
                        return header;
                    }}
                    visible={isOpen}
                    isModal={true}
                    animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                    enableResize={true}
                    resizeHandles={['All']}
                    allowDragging={true}
                    //showCloseIcon={true}
                    width="80%" //"70%"
                    height="100%"
                    position={{ X: 'center', Y: 'center' }}
                    style={{ position: 'fixed' }}
                    buttons={buttonInputData}
                    close={() => {
                        closeDialogRelasi;
                    }}
                    closeOnEscape={false}
                    open={(args: any) => {
                        args.preventFocus = true;
                    }}
                >
                    <div style={{ minWidth: '430px', overflow: 'auto' }}>
                        <div>
                            {/* screen loader  */}
                            {/* {showLoader && contentLoader()} */}
                            <div>
                                {/* ===============  Master Header Data ========================   */}
                                <div className="mb-1">
                                    <div className="panel-tabel">
                                        <table className={styles.table} style={{ width: '100%' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '110px' }}>No. Register</th>
                                                    <th style={{ width: '150px' }}>Tipe Relasi</th>
                                                    <th style={{ width: '150px' }}>Relasi Sejak</th>
                                                    <th style={{ width: '300px' }}>Perusahaan</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <TextBoxComponent placeholder="No. Register" value={masterData.kode_relasi} readonly={true} />
                                                    </td>
                                                    <td>
                                                        <div className="flex">
                                                        <select
                                                                value={masterData.tipe} // Menetapkan nilai default
                                                                name="tipe"
                                                                onChange={handleChange}
                                                                className="block w-full text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"

                                                            >
                                                                
                                                                {apiTipeRelasi.map((tipe, index) => 
                                                                
                                                                    <option value={tipe.tipe} key={index}>
                                                                        {tipe.tipe}
                                                                    </option> 
                                                                
                                                            )}
                                                            </select>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <DatePickerComponent
                                                            locale="id"
                                                            // cssClass="e-custom-style"
                                                            // renderDayCell={onRenderDayCell}
                                                            placeholder="Tgl. Relasi"
                                                            enableMask={true}
                                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                                            showClearButton={false}
                                                            format="dd-MM-yyyy"
                                                            value={moment(masterData.tgl_relasi).toDate()}
                                                            change={(args: ChangeEventArgsCalendar) => {
                                                                if (args.value) {
                                                                    
                                                                    setMasterData({
                                                                        ...masterData,
                                                                        tgl_relasi: moment(args.value).format('YYYY-MM-DD HH:mm:ss'),
                                                                        tgl_update: moment(args.value).format('YYYY-MM-DD HH:mm:ss'),
                                                                    });
                                                                } else {
                                                                    setMasterData({
                                                                        ...masterData,
                                                                        tgl_relasi: moment().format('YYYY-MM-DD HH:mm:ss'),
                                                                        tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            <Inject services={[MaskedDateTime]} />
                                                        </DatePickerComponent>
                                                    </td>
                                                    <td>
                                                        <TextBoxComponent
                                                            id="searchNamaItem"
                                                            name="nama_relasi"
                                                            className="nama_relasi"
                                                            placeholder="<Nama Perusahaan>"
                                                            showClearButton={true}
                                                            value={masterData.nama_relasi}
                                                            input={(args: FocusInEventArgs) => {
                                                                const value: any = args.value;
                                                                setMasterData({
                                                                    ...masterData,
                                                                    nama_relasi: value,
                                                                });
                                                            }}
                                                        />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* ===============  Detail Data ========================   */}
                                <div className="panel-tab" style={{ background: '#fff', width: '100%', height: 'auto' }}>
                                    <TabComponent
                                        ref={(t) => (tabDialogRelasi = t)}
                                        selectedItem={0}
                                        animation={{ previous: { effect: 'None' }, next: { effect: 'None' } }}
                                        height="100%"
                                    >
                                        <div className="e-tab-header">
                                            <div tabIndex={0}>Informasi</div>
                                            <div tabIndex={1}>Kontak</div>
                                        </div>
                                        {/*===================== Content menampilkan data barang =======================*/}
                                        <div className="e-content">
                                            <div style={{ width: 'auto', height: 'auto', marginTop: '5px' }} className="p-4">
                                                <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                                                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                                                    <div className="w-full">
                                                            <LookupComboBox trigger={(t: string) => fetchLookupData('propinsi',t, 'kota')} name={'propinsi'} setSelectedOption={setMasterData} selectedOption={masterData.propinsi} options={provinsiList}  />
                                                        </div>
                                                        <div className="w-full">
                                                            <LookupComboBox   disabled={masterData.propinsi === ''}name={'kota'} setSelectedOption={setMasterData} selectedOption={masterData.kota} options={kotaList}/>
                                                        </div>
                                                        <div className="w-full">
                                                            <LookupComboBox  disabled={masterData.kota === ''} trigger={(t: string) => fetchLookupData('kecamatan',t, 'kelurahan')} name={'kecamatan'} setSelectedOption={setMasterData} selectedOption={masterData.kecamatan} options={kecamatanList} />
                                                        </div>
                                                        <div className="w-full">
                                                            <LookupComboBox  disabled={masterData.kecamatan === ''} name={'kelurahan'} setSelectedOption={setMasterData} selectedOption={masterData.kelurahan} options={kelurahanList} trigger={(t: string) => setKodePos(t)} />
                                                        </div>
                                                        <div className="w-full">
                                                            <label
                                                                htmlFor="kode_pos"
                                                                className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white"
                                                            >
                                                                Kode Pos
                                                            </label>
                                                            <input
                                                                value={masterData.kodepos || ''} // Menetapkan nilai default atau string kosong jika null
                                                                name="kodepos"
                                                                onChange={handleChange}
                                                                id="kode_pos"
                                                                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                placeholder="Cth: 401513"
                                                                
                                                            />
                                                        </div>
                                                        <div className="w-full">
                                                         <LookupComboBox name={'negara'} setSelectedOption={setMasterData} selectedOption={masterData.negara} options={[{value: 'Indonesia', label: 'Indonesia'}]} />
                                                        </div>
                                                        <div className="sm:col-span-2">
                                                            <label
                                                                htmlFor="no_npwp"
                                                                className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white"
                                                            >
                                                                No. NPWP
                                                            </label>
                                                            <input
                                                                name="npwp"
                                                                value={masterData.npwp || ''}
                                                                onChange={handleChange}
                                                                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                placeholder="Cth: 1234567890123456"
                                                                
                                                            />
                                                        </div>
                                                        <div className="sm:col-span-2">
                                                            <label
                                                                htmlFor="no_siup"
                                                                className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white"
                                                            >
                                                                No. SIUP
                                                            </label>
                                                            <input
                                                                name="siup"
                                                                id="no_siup"
                                                                
                                                                value={masterData.siup || ''}
                                                                onChange={handleChange}
                                                                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                placeholder="Cth: 1234567890123456"
                                                                
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                                                        <div className="sm:col-span-2 ">
                                                            <label
                                                                htmlFor="personal"
                                                                className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white"
                                                            >
                                                                Personal
                                                            </label>
                                                            <input
                                                                name="personal"
                                                                value={masterData.personal || ''}
                                                                onChange={handleChange}
                                                                type="text"
                                                                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                placeholder="Cth: 1234567890123456"
                                                                
                                                            />
                                                        </div>
                                                        <div className="sm:col-span-2">
                                                            <label
                                                                htmlFor="no_siup"
                                                                className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white"
                                                            >
                                                                No. KTP
                                                            </label>
                                                            <input
                                                                name="ktp"
                                                                onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                    e.target.value = e.target.value.replace(/[^0-9.-]/g, ''); // Hapus karakter non-angka
                                                                }}
                                                                value={masterData.ktp || ''}
                                                                onChange={handleChange}
                                                                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                placeholder="Cth: 1234567890123456"
                                                                
                                                            />
                                                        </div>
                                                        <div className="sm:col-span-2">
                                                            <label
                                                                htmlFor="no_siup"
                                                                className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white"
                                                            >
                                                                No. SIM
                                                            </label>
                                                            <input
                                                                name="sim"
                                                                value={masterData.sim || ''}
                                                                onChange={handleChange}
                                                                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                placeholder="Cth: 1234567890123456"
                                                                
                                                            />
                                                        </div>
                                                        <div className="w-full">
                                                            <label
                                                                htmlFor="telp"
                                                                className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white"
                                                            >
                                                                Telepon 1
                                                            </label>
                                                            <input
                                                                name="telp"
                                                                onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                    e.target.value = e.target.value.replace(/[^0-9.-]/g, ''); // Hapus karakter non-angka
                                                                }}
                                                                value={masterData.telp || ''}
                                                                onChange={handleChange}
                                                                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                placeholder="Cth: 1234567890123456"
                                                                
                                                            />
                                                        </div>
                                                        <div className="w-full">
                                                            <label
                                                                htmlFor="telp2"
                                                                className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white"
                                                            >
                                                                Telepon 2
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="telp2"
                                                                onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                    e.target.value = e.target.value.replace(/[^0-9.-]/g, ''); // Hapus karakter non-angka
                                                                }}
                                                                value={masterData.telp2 || ''}
                                                                onChange={handleChange}
                                                                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                placeholder="Cth: 1234567890123456"
                                                                
                                                            />
                                                        </div>
                                                        <div className="w-full">
                                                            <label
                                                                htmlFor="hp"
                                                                className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white"
                                                            >
                                                                Handphone 1
                                                            </label>
                                                            <input
                                                                name="hp"
                                                                onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                    e.target.value = e.target.value.replace(/[^0-9.-]/g, ''); // Hapus karakter non-angka
                                                                }}
                                                                value={masterData.hp || ''}
                                                                onChange={handleChange}
                                                                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                placeholder="Cth: 1234567890123456"
                                                                
                                                            />
                                                        </div>
                                                        <div className="w-full">
                                                            <label
                                                                htmlFor="hp2"
                                                                className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white"
                                                            >
                                                                Whatsapp
                                                            </label>
                                                            <input
                                                                name="hp2"
                                                                onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                    e.target.value = e.target.value.replace(/[^0-9.-]/g, ''); // Hapus karakter non-angka
                                                                }}
                                                                value={masterData.hp2 || ''}
                                                                onChange={handleChange}
                                                                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                placeholder="Cth: 1234567890123456"
                                                                
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <label
                                                            htmlFor="fax"
                                                            className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white"
                                                        >
                                                            Facimile
                                                        </label>
                                                        <input
                                                            name="fax"
                                                            onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                e.target.value = e.target.value.replace(/[^0-9.-]/g, ''); // Hapus karakter non-angka
                                                            }}
                                                            value={masterData.fax || ''}
                                                            onChange={handleChange}
                                                            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                            placeholder="Cth: 1234567890123456"
                                                            
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <label
                                                            htmlFor="email"
                                                            className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white"
                                                        >
                                                            Email
                                                        </label>
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={masterData.email || ''}
                                                            onChange={handleChange}
                                                            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                            placeholder="Cth: admin@kcngroup.com"
                                                            
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <label
                                                            htmlFor="email"
                                                            className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white"
                                                        >
                                                            Website
                                                        </label>
                                                        <div className="flex">
                                                            <span className="rounded-e-0 inline-flex items-center rounded-s-md border border-gray-300 bg-gray-200 px-2 text-[12px] text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400">
                                                                www.
                                                            </span>
                                                            <input
                                                                name="website"
                                                                value={masterData.website || ''}
                                                                onChange={handleChange}
                                                                type="text"
                                                                id="website-admin"
                                                                className="block w-full rounded-r-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                                placeholder="kencanagroup.com"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <label
                                                            htmlFor="alamat"
                                                            className="mb-2 block text-[12px] font-medium text-gray-900 dark:text-white"
                                                        >
                                                            Alamat
                                                        </label>
                                                        <input
                                                            name="alamat"
                                                            className="block w-full rounded-lg border border-gray-300 mb-1 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                            placeholder="Cth: Jln. Terusan Pasir Koja"
                                                            value={masterData.alamat}
                                                            onChange={(e) => {
                                                                const newValue = e.target.value.substring(0, 50); // Batasi hanya 50 karakter
                                                                setMasterData((oldData: any) => ({
                                                                    ...oldData,
                                                                    alamat: newValue
                                                                }))
                                                            }}
                                                        />
                                                        <input
                                                            name="alamat2"
                                                            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                                            placeholder="Cth: RT 05 RW 06, belakang sd"
                                                            value={masterData.alamat2}
                                                            onChange={(e) => {
                                                                const newValue = e.target.value.substring(0, 50); // Batasi hanya 50 karakter
                                                                setMasterData((oldData: any) => ({
                                                                    ...oldData,
                                                                    alamat2: newValue
                                                                }))
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            {/*================= Content menampilkan file pendukung =================*/}
                                            <div className="set-font-11" style={{ width: '100%', height: '100%', marginTop: '1px' }}>
                                                <GridKontak gridKontak={gridDetailRelasi} masterDataState={masterDataState} kode_dokumen={masterDataState === "BARU" ? "" :masterKodeRelasi } />
                                                {/* <GridComponent
                                                    id="gridDetailRelasi"
                                                    name="gridDetailRelasi"
                                                    className="gridDetailRelasi"
                                                    locale="id"
                                                    ref={gridDetailRelasi}
                                                    dataSource={kontakRelasiForm}
                                                    editSettings={{ allowAdding:true, allowEditing: false, allowDeleting: true, newRowPosition: 'Bottom', }}
                                                    selectionSettings={{ mode: 'Row', type: 'Single' }}
                                                    allowResizing={true}
                                                    // editSettings={editOptions}
                                                    autoFit={true}
                                                    rowHeight={22}
                                                    height={170} //170 barang jadi 150 barang produksi
                                                    gridLines={'Both'}
                                                    recordDoubleClick={(args: any) => {
                                                        if (gridDetailRelasi) {
                                                            const rowIndex: number = args.row.rowIndex;
                                                            gridDetailRelasi.current!.selectRow(rowIndex);
                                                            // showEditRecord();
                                                            // gridDetailRelasi.current!.editModule.closeEdit();
                                                        }
                                                    }}
                                                >
                                                    <ColumnsDirective>
                                                    <ColumnDirective
                                                            field="id_relasi"
                                                            isPrimaryKey={true}
                                                            visible={false}
                                                            headerText="id"
                                                            headerTextAlign="Center"
                                                            textAlign="Left"
                                                            width="200"
                                                            clipMode="EllipsisWithTooltip"
                                                        />
                                                        <ColumnDirective
                                                            field="nama_lengkap"
                                                            headerText="Nama Lengkap"
                                                            headerTextAlign="Center"
                                                            textAlign="Left"
                                                            width="200"
                                                            clipMode="EllipsisWithTooltip"
                                                        />
                                                        <ColumnDirective
                                                            field="jab"
                                                            headerText="Jabatan"
                                                            headerTextAlign="Center"
                                                            textAlign="Left"
                                                            width="200"
                                                            clipMode="EllipsisWithTooltip"
                                                        />
                                                        <ColumnDirective
                                                            field="hubungan"
                                                            headerText="Hubungan Kepemilikan"
                                                            headerTextAlign="Center"
                                                            textAlign="Left"
                                                            width="200"
                                                            clipMode="EllipsisWithTooltip"
                                                        />
                                                        <ColumnDirective
                                                            field="bisnis"
                                                            headerText="Telp. Kantor"
                                                            headerTextAlign="Center"
                                                            textAlign="Left"
                                                            width="200"
                                                            clipMode="EllipsisWithTooltip"
                                                        />
                                                        <ColumnDirective
                                                            field="hp2"
                                                            headerText="WhatsApp"
                                                            headerTextAlign="Center"
                                                            textAlign="Left"
                                                            width="200"
                                                            clipMode="EllipsisWithTooltip"
                                                        />
                                                    </ColumnsDirective>

                                                    <Inject services={[Page, Selection, Edit, CommandColumn, Toolbar, Resize]} />
                                                </GridComponent>
                                                <div className="panel-pager">
                                                    <TooltipComponent content="Baru" opensOn="Hover" openDelay={50} target="#buAdd1">
                                                        <TooltipComponent content="Ubah" opensOn="Hover" openDelay={50} target="#buEdit">
                                                        <TooltipComponent content="Hapus" opensOn="Hover" openDelay={50} target="#buDel">
                                                            <div className="mt-1 flex">
                                                                <ButtonComponent
                                                                    id="buAdd1"
                                                                    type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                    cssClass="e-primary e-small"
                                                                    iconCss="e-icons e-small e-plus"
                                                                    style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
                                                                    disabled={!stateBrowse}
                                                                    onClick={addDetailRelasi}
                                                                />
                                                                
                                                                <ButtonComponent
                                                                    id="buEdit"
                                                                    type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                    cssClass="e-warning e-small"
                                                                    iconCss="e-icons e-small e-edit"
                                                                    style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
                                                                    disabled={!stateBrowse}
                                                                    onClick={() => showEditRecord()}
                                                                />
                                                                <ButtonComponent
                                                                    id="buDel"
                                                                    type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                    cssClass="e-danger e-small"
                                                                    iconCss="e-icons e-small e-trash"
                                                                    style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
                                                                    disabled={!stateBrowse}
                                                                    onClick={() => gridDetailRelasi.current!.deleteRecord()}
                                                                />
                                                            </div>
                                                        
                                                        </TooltipComponent>
                                                        </TooltipComponent>
                                                    </TooltipComponent>
                                                </div> */}
                                            </div>
                                            {/*======================================================================*/}
                                        </div>
                                    </TabComponent>
                                </div>
                            </div>
                            <div>
                                {/* ===============  Master Footer Data ========================   */}
                                <div className="mt-1">
                                    <p className="set-font-11">
                                        <b>Catatan :</b>
                                    </p>
                                    <div className="panel-input" style={{ width: '80%' }}>
                                        <TextBoxComponent
                                            ref={(t) => {
                                                textareaObj = t;
                                            }}
                                            multiline={true}
                                            name='catatan'
                                            created={onCreateMultiline}
                                            value={masterData.catatan || ''}
                                            input={(args: FocusInEventArgs) => {
                                                const value: any = args.value;
                                                setMasterData({
                                                    ...masterData,
                                                    catatan: value,
                                                });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* =================  Tombol action dokumen ==================== */}
                        <div
                            style={{
                                backgroundColor: '#F2FDF8',
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                borderBottomLeftRadius: '6px',
                                borderBottomRightRadius: '6px',
                                width: '100%',
                                height: '55px',
                                display: 'inline-block',
                                overflowX: 'scroll',
                                overflowY: 'hidden',
                                scrollbarWidth: 'none',
                            }}
                        >
                            {(masterDataState === 'BARU' || masterDataState == 'EDIT') && (
                                <ButtonComponent
                                    id="buBatalDokumen1"
                                    content="Batal"
                                    cssClass="e-danger e-small"
                                    iconCss="e-icons e-small e-close"
                                    style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 3.2 + 'em' }}
                                    onClick={closeDialogRelasi}
                                />
                            )}
                            {(masterDataState === 'BARU' || masterDataState == 'EDIT') && (
                                <ButtonComponent
                                    id="buSimpanDokumen1"
                                    content="Simpan"
                                    cssClass="e-primary e-small"
                                    iconCss="e-icons e-small e-save"
                                    style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 0.3 + 'em' }}
                                    onClick={() => {simpanData(kontakRelasiForm)}}
                                />
                            )}
                        </div>
                    </div>
                </DialogComponent>
            </div>
        </>
    );
};

export default DialogRelasi;
