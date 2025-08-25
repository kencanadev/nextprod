import React, { useEffect, useRef, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { RiRefreshFill } from 'react-icons/ri';
import idIDLocalization from 'public/syncfusion/locale.json';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as weekData from 'cldr-data/supplemental/weekData.json';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs, Inject } from '@syncfusion/ej2-react-calendars';
import moment from 'moment';
import { useSession } from '@/pages/api/sessionContext';
import { useRouter } from 'next/router';
import GridPembebananRps from './GridPembebananRps';
import { motion } from 'framer-motion';
import GlobalProgressBar from '@/components/GlobalProgressBar';
import axios from 'axios';
import { useProgress } from '@/context/ProgressContext';
import GridHitungPenyesuainStok from './GridHitungPenyesuainStok';
import GridPembatalan from './GridPembatalan';
import DIalogKoreksiApp from './modal/DIalogKoreksiApp';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { generateNU } from '@/utils/routines';
import 'moment/locale/id';
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
L10n.load(idIDLocalization);
enableRipple(true);

const tabJenis = [
    {
        jenis: 'Pengajuan Pembenanan',
    },
    {
        jenis: 'Hitung Penyesuaian Stok',
    },
    {
        jenis: 'Pembatalan',
    },
];

const PembebananSBList = () => {
    const { sessionData } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const router = useRouter();
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';
    const header = 'test';
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    const GridPembebananReff = useRef<any>(null);
    const GridHitungPenyesuainStokReff = useRef<any>(null);
    const gridPembatalanReff = useRef<any>(null);

    const [terpilih, setTerpilih] = useState<any>([]);
    const [filterTabJenis, setFilterTabJenis] = useState('Pengajuan Pembenanan');
    const { startProgress, updateProgress, endProgress, setLoadingMessage } = useProgress();
    const [selectedRowBeban, setSelectedRowBeban] = useState<any>({});
    const [filterState, setFilterState] = useState({
        tanggal_awal: moment().format('YYYY-MM-DD'),
        tanggal_akhir: moment().endOf('month').format('YYYY-MM-DD'),
        no_rps: '',
        status: 'O',
    });
    const [checkboxState, setCheckboxState] = useState({
        no_rps: false,
        status: false,
        tanggal_input: false,
    });
    const [masterState, setMasterState] = useState('');
    const [masterData, setMasterData] = useState({});

    const [userLevel, setUserLevel] = useState<any>({});

    const [dsTab1, setDsTab1] = useState([]);

    const [visibleDialog, setVisibleDialog] = useState(false);

    const swalCOnfirm = Swal.mixin({
        toast: true,
        position: 'center',
        customClass: {
            popup: 'colored-toast',
        },
        showConfirmButton: true,
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

    const showLoading = async () => {
        startProgress(); // Tampilkan progress bar
        setLoadingMessage('test');
        try {
            const test = await axios.get('https://jsonplaceholder.typicode.com/posts');
            console.log('test', test);
        } catch (error) {
            console.error('Error fetching data:', error);
            endProgress();
        } finally {
            endProgress(); // Selesaikan progress bar
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

    useEffect(() => {
        if (kode_entitas) {
            getRps();
            getUsersLevel();
        }
    }, [kode_entitas]);

    const getUsersLevel = async () => {
        const users_app = await axios.get(`${apiUrl}/erp/users_app`, {
            params: {
                entitas: kode_entitas,
                param1: userid,
            },
            headers: { Authorization: `Bearer ${token}` },
        });

        setUserLevel(users_app.data.data[0]);
    };

    const SpreadNumber = (number: any | number | string) => {
        const temp = parseFloat(parseFloat(number).toFixed(2));
        return temp;
    };

    const getRps = async () => {
        let param2 = checkboxState.no_rps ? filterState.no_rps + '%' : 'all';
        let param3 = checkboxState.tanggal_input ? moment(filterState.tanggal_awal).format('YYYY-MM-DD') : 'all';
        let param4 = checkboxState.tanggal_input ? moment(filterState.tanggal_akhir).format('YYYY-MM-DD') : 'all'; 
        let param5 = filterState.status !== 'all' ? filterState.status : 'all';

        try {
            const responseTab1 = await axios.get(`${apiUrl}/erp/list_pembebenan_selisih_barang?`, {
                params: {
                    entitas: kode_entitas,
                    param1: 0,
                    param2,
                    param3,
                    param4,
                    param5,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const modData = responseTab1.data.data.map((item: any) => {
                return {
                    ...item,
                    jml_beban: SpreadNumber(item.jml_beban),
                };
            });
            setSelectedRowBeban(responseTab1.data.data[0] ?? {});
            console.log('modData', modData);
            GridPembebananReff.current.setProperties({ dataSource: modData });
            GridPembebananReff.current!.refresh();
            setDsTab1(responseTab1.data.data);

            const responseTab2 = await axios.get(`${apiUrl}/erp/list_pembebenan_selisih_barang?`, {
                params: {
                    entitas: kode_entitas,
                    param1: 1,
                    param2: 'all',
                    param3: 'all',
                    param4: 'all',
                    param5: 'all',
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('responseTab2', responseTab2);

            GridHitungPenyesuainStokReff.current.setProperties({ dataSource: responseTab2.data.data });
            GridHitungPenyesuainStokReff.current!.refresh();

            const responseTab3 = await axios.get(`${apiUrl}/erp/list_pembebenan_selisih_barang?`, {
                params: {
                    entitas: kode_entitas,
                    param1: 2,
                    param2: 'all',
                    param3: 'all',
                    param4: 'all',
                    param5: 'all',
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('responseTab2', responseTab2);

            gridPembatalanReff.current.setProperties({ dataSource: responseTab3.data.data });
            gridPembatalanReff.current!.refresh();
        } catch (error) {}
    };

    const prosesPosting = () => {
        if (Object.keys(selectedRowBeban).length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                target: '#main-target',
                text: `Gagal Posting : Pilih data pengajuan pembebanan`,
            });
            return false;
        }

        if (selectedRowBeban.posting === 'Y') {
            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                target: '#main-target',
                text: `Gagal Posting : Karena Dokumen Telah Terposting`,
            });
            return false;
        }

        if (Object.keys(userLevel).length !== 0 && selectedRowBeban.level_app === '6' && selectedRowBeban.app === 'Y') {
            postingRPS();
            return;
        }
        console.log('selectedRowBeban', selectedRowBeban);
        if (Object.keys(userLevel).length !== 0 && selectedRowBeban.level_app == userLevel.app_rps) {
            if (selectedRowBeban.app === 'Y') {
                postingRPS();
            } else {
                setMasterState(`APPROVAL#${selectedRowBeban?.level_app}`);
            }

            setMasterData(selectedRowBeban);
            setVisibleDialog(true);
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                target: '#main-target',
                text: `Gagal Posting : Level Approval Tidak Sesuai`,
            });
            return false;
        }
    };

    const postingRPS = async () => {
        console.log('posting');
        const responseSetting = await axios.get(`${apiUrl}/erp/setting?`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                entitas: kode_entitas,
            },
        });

        const quSetting = responseSetting.data.data[0];
        if (quSetting.kode_akun_pika === '') {
            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                target: '#main-target',
                text: `Gagal Posting : Kode akun piutang karyawan belum disetting.`,
            });
            return false;
        }

        if (quSetting.kode_sub_pika === '') {
            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                target: '#main-target',
                text: `Gagal Posting : Kode subledger piutang karyawan global belum disetting.'`,
            });
            return false;
        }

        withReactContent(swalCOnfirm)
            .fire({
                icon: 'warning',
                title: `Posting Pengajuan Pembebanan   [${selectedRowBeban.no_rps}] 
                No. Dokumen :  [${selectedRowBeban.no_rps}] 
                Tanggal     :  [${moment().format('DD-MM-YYYY')}] 
                `,
                width: '100%',
                target: '#dialogJenisTransaksiMB',
                showConfirmButton: true,
                confirmButtonText: 'Yakin',
                showDenyButton: true,
                denyButtonText: 'Tidak',
            })
            .then(async (e) => {
                if (e.isConfirmed) {
                    startProgress();
                    console.log('batal');
                    const responseTab1 = await axios.get(`${apiUrl}/erp/master_detail_rps?`, {
                        params: {
                            entitas: kode_entitas,
                            param1: selectedRowBeban.kode_rps,
                        },
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    const dataOld = responseTab1.data.data;

                    console.log('dataOld', dataOld);

                    const noJU = await generateNU(kode_entitas, '', '20', moment().format('YYYYMM'));

                    const kirimMaster = {
                        ...dataOld.master,
                        entitas: kode_entitas,
                        tgl_rps: moment(dataOld.master.tgl_rps).format('YYYY-MM-DD HH:mm:ss'),
                        tgl_pic: moment(dataOld.master.tgl_pic).format('YYYY-MM-DD HH:mm:ss'),
                        tgl_update: moment(dataOld.master.tgl_update).format('YYYY-MM-DD HH:mm:ss'),
                        app: 'Y',
                        posting: 'Y',
                        user_posting: userid.toUpperCase(),
                        tgl_posting: moment().format('YYYY-MM-DD HH:mm:ss'),
                        detail: [...dataOld.detail],
                    };

                    const getNoPS = dataOld.DataPS.map((item: any) => item.no_ps.split('.')[2]);
                    const sortedArrNoPS = getNoPS.sort((a: any, b: any) => parseInt(a) - parseInt(b));
                    console.log('getNoPS', sortedArrNoPS);

                    const KetDokumen = `REKLAS PS ${sortedArrNoPS.join(', ')} TGL. ${moment().format('D MMM YYYY').toUpperCase()} ke piutang karyawan atas pembebanan selisih barang`.toUpperCase();

                    const JUMaster = {
                        kode_dokumen: null,
                        dokumen: 'JU',
                        no_dokumen: noJU,
                        tgl_dokumen: moment().format('YYYY-MM-DD HH:mm:ss'),
                        no_warkat: null,
                        tgl_valuta: null,
                        kode_cust: null,
                        kode_akun_debet: null,
                        kode_supp: null,
                        kode_akun_kredit: null,
                        kode_akun_diskon: null,
                        kurs: null,
                        debet_rp: SpreadNumber(dataOld.master.jml_beban),
                        kredit_rp: SpreadNumber(dataOld.master.jml_beban),
                        jumlah_rp: SpreadNumber(dataOld.master.jml_beban),
                        jumlah_mu: SpreadNumber(dataOld.master.jml_beban),
                        pajak: null,
                        kosong: null,
                        kepada: null,
                        catatan: KetDokumen,
                        status: 'Terbuka',
                        userid: userid.toUpperCase(),
                        tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                        status_approved: null,
                        tgl_approved: null,
                        tgl_pengakuan: null,
                        no_TTP: null,
                        tgl_TTP: null,
                        kode_sales: null,
                        kode_fk: null,
                        approval: null,
                        tgl_setorgiro: null,
                        faktur: 'N',
                        barcode: null,
                        komplit: 'N',
                        validasi1: 'N',
                        validasi2: 'N',
                        validasi3: 'N',
                        validasi_ho2: 'N',
                        validasi_ho3: 'N',
                        validasi_catatan: null,
                        tolak_catatan: null,
                        kode_kry: null,
                        tgl_trxdokumen: moment().format('YYYY-MM-DD HH:mm:ss'),
                        api_id: 0,
                        api_pending: 'N',
                        api_catatan: null,
                        api_norek: null,
                        kode_aktiva: null,
                        kode_rpe: null,
                        kode_phe: null,
                        kode_rps: dataOld.master.kode_rps,
                        kode_um: null,
                        no_kontrak_um: null,
                        bm_pos: 'N',
                    };

                    const Jurnal1: any = {};
                    Jurnal1.kode_dokumen = null;
                    Jurnal1.id_dokumen = 1;
                    Jurnal1.dokumen = 'JU';
                    Jurnal1.tgl_dokumen = moment().format('YYYY-MM-DD HH:mm:ss');
                    Jurnal1.kode_akun = quSetting.kode_akun_pika;
                    Jurnal1.kode_subledger = quSetting.kode_sub_pika;
                    Jurnal1.kurs = 1;
                    Jurnal1.debet_rp = SpreadNumber(dataOld.master.jml_beban);
                    Jurnal1.kredit_rp = 0;
                    Jurnal1.jumlah_rp = SpreadNumber(dataOld.master.jml_beban);
                    Jurnal1.jumlah_mu = SpreadNumber(dataOld.master.jml_beban);
                    Jurnal1.catatan = KetDokumen;
                    Jurnal1.no_warkat = null;
                    Jurnal1.tgl_valuta = moment().format('YYYY-MM-DD HH:mm:ss');
                    Jurnal1.persen = 0;
                    Jurnal1.kode_dept = null;
                    Jurnal1.kode_kerja = null;
                    Jurnal1.approval = 'N';
                    Jurnal1.posting = 'N';
                    Jurnal1.rekonsiliasi = 'N';
                    Jurnal1.tgl_rekonsil = null;
                    Jurnal1.userid = userid.toUpperCase();
                    Jurnal1.tgl_update = moment().format('YYYY-MM-DD HH:mm:ss');
                    Jurnal1.audit = null;
                    Jurnal1.kode_kry = null;
                    Jurnal1.kode_jual = null;
                    Jurnal1.no_kontrak_um = null;

                    const Jurnal2: any = {};
                    Jurnal2.kode_dokumen = null;
                    Jurnal2.id_dokumen = 2;
                    Jurnal2.dokumen = 'JU';
                    Jurnal2.tgl_dokumen = moment().format('YYYY-MM-DD HH:mm:ss');
                    Jurnal2.kode_akun = quSetting.kode_akun_kerusakan_barang;
                    Jurnal2.kode_subledger = null;
                    Jurnal2.kurs = 1;
                    Jurnal2.debet_rp = SpreadNumber(dataOld.master.jml_beban);
                    if (SpreadNumber(dataOld.master.jml_perusahaan) < 0) {
                        Jurnal2.kredit_rp = SpreadNumber(dataOld.master.jumlah);
                        Jurnal2.jumlah_rp = SpreadNumber(dataOld.master.jumlah) * -1;
                        Jurnal2.jumlah_mu = SpreadNumber(dataOld.master.jumlah) * -1;
                    } else {
                        Jurnal2.kredit_rp = SpreadNumber(dataOld.master.jml_beban);
                        Jurnal2.jumlah_rp = SpreadNumber(dataOld.master.jml_beban) * -1;
                        Jurnal2.jumlah_mu = SpreadNumber(dataOld.master.jml_beban) * -1;
                    }
                    Jurnal2.catatan = KetDokumen;
                    Jurnal2.no_warkat = null;
                    Jurnal2.tgl_valuta = moment().format('YYYY-MM-DD HH:mm:ss');
                    Jurnal2.persen = 0;
                    Jurnal2.kode_dept = null;
                    Jurnal2.kode_kerja = null;
                    Jurnal2.approval = 'N';
                    Jurnal2.posting = 'N';
                    Jurnal2.rekonsiliasi = 'N';
                    Jurnal2.tgl_rekonsil = null;
                    Jurnal2.userid = userid.toUpperCase();
                    Jurnal2.tgl_update = moment().format('YYYY-MM-DD HH:mm:ss');
                    Jurnal2.audit = null;
                    Jurnal2.kode_kry = null;
                    Jurnal2.kode_jual = null;
                    Jurnal2.no_kontrak_um = null;

                    const Jurnal3: any = {};
                    if (SpreadNumber(dataOld.master.jml_perusahaan) < 0) {
                        Jurnal1.kode_dokumen = null;
                        Jurnal1.id_dokumen = 3;
                        Jurnal1.dokumen = 'JU';
                        Jurnal1.tgl_dokumen = moment().format('YYYY-MM-DD HH:mm:ss');
                        Jurnal1.kode_akun = quSetting.kode_akun_pendbulat;
                        Jurnal1.kode_subledger = null;
                        Jurnal1.kurs = 1;
                        Jurnal1.debet_rp = 0;
                        Jurnal1.kredit_rp = SpreadNumber(dataOld.master.jml_perusahaan) * -1;
                        Jurnal1.jumlah_rp = SpreadNumber(dataOld.master.jml_perusahaan);
                        Jurnal1.jumlah_mu = SpreadNumber(dataOld.master.jml_perusahaan);
                        Jurnal1.catatan = KetDokumen;
                        Jurnal1.no_warkat = null;
                        Jurnal1.tgl_valuta = moment().format('YYYY-MM-DD HH:mm:ss');
                        Jurnal1.persen = 0;
                        Jurnal1.kode_dept = null;
                        Jurnal1.kode_kerja = null;
                        Jurnal1.approval = 'N';
                        Jurnal1.posting = 'N';
                        Jurnal1.rekonsiliasi = 'N';
                        Jurnal1.tgl_rekonsil = null;
                        Jurnal1.userid = userid.toUpperCase();
                        Jurnal1.tgl_update = moment().format('YYYY-MM-DD HH:mm:ss');
                        Jurnal1.audit = null;
                        Jurnal1.kode_kry = null;
                        Jurnal1.kode_jual = null;
                        Jurnal1.no_kontrak_um = null;
                    }

                    const JU = [Jurnal1, Jurnal2, Jurnal3];

                    const JUKirim = {
                        ...JUMaster,
                        entitas: kode_entitas,
                        jurnal: JU.filter((item: any) => Object.keys(item).length > 0),
                    };

                    console.log('JUKirim', JUKirim);

                    try {
                        const responseAPI = await axios.post(`${apiUrl}/erp/simpan_ju`, JUKirim, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        if (responseAPI.data.status === true) {
                            await generateNU(kode_entitas, noJU, '20', moment().format('YYYYMM'));
                            const response: any = await axios.patch(`${apiUrl}/erp/update_pembebenan_selisih_barang?`, kirimMaster, {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            });
                            await getRps();
                            Swal.fire({
                                icon: 'success',
                                title: 'Berhasil Posting',
                                target: '#main-target',
                                text: `Berhasil Posting untuk No. Dokument : ` + dataOld.master.no_rps,
                            });
                        }
                        endProgress();
                    } catch (error: any) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Gagal Posting',
                            target: '#main-target',
                            text: `Gagal Posting : ${error?.response?.data?.message}`,
                        });
                        endProgress();
                        return false;
                    }

                    endProgress();
                }
                if (e.dismiss || e.isDenied || e.isDismissed) {
                    return console.log('cancel');
                }
            })
            .catch((e) => {
                console.log(e);
            });
        console.log('quSetting');
    };

    const prosesBatal = () => {
        if (Object.keys(selectedRowBeban).length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                target: '#main-target',
                text: `Gagal Batal : Pilih data pengajuan pembebanan`,
            });
            return false;
        }

        if (selectedRowBeban.posting === 'Y') {
            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                target: '#main-target',
                text: `Gagal Batal : Karena Dokumen Sudah Terposting`,
            });
            return false;
        }

        if (selectedRowBeban.level_app !== '1') {
            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                target: '#main-target',
                text: `Gagal Batal : Karena Dokumen Sedang tahap Approval`,
            });
            return false;
        }

        withReactContent(swalCOnfirm)
            .fire({
                icon: 'warning',
                title: `Lanjutkan Pembatalan  [${selectedRowBeban.no_rps}] 
                No. Dokumen :  [${selectedRowBeban.no_rps}] 
                Tanggal     :  [${moment().format('DD-MM-YYYY')}] 
                `,
                width: '100%',
                target: '#dialogJenisTransaksiMB',
                showConfirmButton: true,
                confirmButtonText: 'Yakin',
                showDenyButton: true,
                denyButtonText: 'Tidak',
            })
            .then(async (e) => {
                if (e.isConfirmed) {
                    startProgress();
                    console.log('batal');
                    const responseTab1 = await axios.get(`${apiUrl}/erp/master_detail_rps?`, {
                        params: {
                            entitas: kode_entitas,
                            param1: selectedRowBeban.kode_rps,
                        },
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    const dataOld = responseTab1.data.data;

                    const kirimMaster = {
                        ...dataOld.master,
                        entitas: kode_entitas,
                        tgl_rps: moment(dataOld.master.tgl_rps).format('YYYY-MM-DD HH:mm:ss'),
                        tgl_pic: moment(dataOld.master.tgl_pic).format('YYYY-MM-DD HH:mm:ss'),
                        tgl_update: moment(dataOld.master.tgl_update).format('YYYY-MM-DD HH:mm:ss'),
                        app: null,
                        posting: null,
                        detail: [...dataOld.detail],
                    };

                    try {
                        const response: any = await axios.patch(`${apiUrl}/erp/update_pembebenan_selisih_barang?`, kirimMaster, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        await getRps();
                        Swal.fire({
                            icon: 'success',
                            title: 'Berhasil Batal',
                            target: '#main-target',
                            text: `Berhasil Gagal`,
                        });
                        endProgress();
                    } catch (error: any) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Gagal Batal',
                            target: '#main-target',
                            text: `Gagal Batal : ${error?.response?.data?.message}`,
                        });
                        endProgress();
                        return false;
                    }
                }
                if (e.dismiss || e.isDenied || e.isDismissed) {
                    return console.log('cancel');
                }
            })
            .catch((e) => {
                console.log(e);
            });
    };

    const prosesKoreksi = () => {
        if (Object.keys(selectedRowBeban).length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                target: '#main-target',
                text: `Gagal Koreksi : Pilih data pengajuan pembebanan`,
            });
            return false;
        }

        if (selectedRowBeban.posting === 'Y') {
            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                target: '#main-target',
                text: `Gagal Koreksi : Karena Dokumen Sudah Terposting`,
            });
            return false;
        }

        if (selectedRowBeban.level_app !== '1') {
            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                target: '#main-target',
                text: `Gagal Koreksi : Karena Dokumen Sedang tahap Approval`,
            });
            return false;
        }

        setMasterData(selectedRowBeban);
        setMasterState('KOREKSI');
        setVisibleDialog(true);
    };

    const recordDoubleClick = () => {
        setMasterData(selectedRowBeban);
        setMasterState('PREVIEW');
        setVisibleDialog(true);
    };
    return (
        <div className="Main overflow-visible" id="main-target">
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
                `}
            </style>
            {visibleDialog && (
                <DIalogKoreksiApp
                    visible={visibleDialog}
                    onClose={() => setVisibleDialog(false)}
                    terpilih={GridHitungPenyesuainStokReff.current.dataSource.filter((item: any) => item.pilih === 'Y')}
                    masterState={masterState}
                    masterData={masterData}
                    getRps={getRps}
                />
            )}
            {/*  */}
            <div className="h-full w-full flex-col">
                <div className="flex items-center justify-between gap-3  space-x-2 p-1">
                    <div className="flex space-x-4  pl-2">
                        <button
                            onClick={prosesKoreksi}
                            className="flex items-center rounded-md border border-green-500 bg-green-50 px-4 py-1 text-xs font-medium text-green-700 shadow-sm transition duration-200 ease-in-out hover:bg-green-100 hover:text-green-800"
                        >
                            <span className="mr-2 text-xs">▶</span>
                            Koreksi
                        </button>

                        <button onClick={prosesBatal} className="flex items-center rounded border border-red-500 px-4 py-1  text-xs font-medium text-red-700 hover:text-red-900">
                            <span className="mr-1">▶</span> Pembatalan
                        </button>
                        {Object.keys(selectedRowBeban).length !== 0 && (
                            <button onClick={prosesPosting} className="flex items-center rounded border border-green-500 px-4 py-1  text-xs font-medium text-green-700 hover:text-green-900">
                                <span className="mr-1">▶</span> {selectedRowBeban?.level_app === '6' && selectedRowBeban?.app === 'Y' ? 'Posting' : 'Approval #' + selectedRowBeban?.level_app}
                            </button>
                        )}
                    </div>
                    <h3 className="text-lg font-bold">Pembebanan Selisih Barang</h3>
                </div>
                <div className="flex items-center gap-3 space-x-2  p-1">
                    {tabJenis.map((item) => (
                        <motion.button
                            key={item.jenis}
                            onClick={async () => {
                                setFilterTabJenis(item.jenis);
                            }}
                            className={`whitespace-nowrap px-3 py-2 text-xs font-semibold ${
                                filterTabJenis === item.jenis ? 'border-b-2 border-orange-500 text-black' : 'text-gray-500 hover:text-black'
                            }`}
                            whileTap={{ scale: 1.1 }} // Menambahkan animasi scale saat ditekan
                            transition={{ duration: 0.2 }}
                        >
                            {item.jenis}
                        </motion.button>
                    ))}
                </div>
                <div className={`flex h-full w-full gap-1 ${filterTabJenis === 'Pengajuan Pembenanan' ? 'block' : 'hidden'}`}>
                    <div className="relative flex w-[20%] flex-col  ">
                        <div className="h-[30px] w-full rounded-t-md bg-gray-300 py-1 pl-2">Filter</div>
                        <div className={`flex h-full w-full flex-col rounded border border-black-light `}>
                            <div className="h-[90%] overflow-x-auto bg-gray-300 p-1">
                                <div className="mb-0.5 flex flex-col items-start">
                                    <label className="mb-0.5 flex items-center gap-2 text-xs">
                                        <input
                                            type="checkbox"
                                            checked={checkboxState.no_rps}
                                            onChange={(e) =>
                                                setCheckboxState((prev) => ({
                                                    ...prev,
                                                    no_rps: e.target.checked,
                                                }))
                                            }
                                        />{' '}
                                        No. Dokumen
                                    </label>
                                    <input
                                        type="text"
                                        id="no_rps"
                                        className="w-full rounded-sm border border-gray-400 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                        placeholder="Nomor Dokumen"
                                        name="no_rps"
                                        value={filterState.no_rps}
                                        onChange={handleInputChange}
                                        style={{ height: '3vh' }}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="mb-0.5 flex items-center gap-2 text-xs">
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
                                        <span className="flex h-[4vh] w-[100px] items-center rounded border bg-white">
                                            <DatePickerComponent
                                                locale="id"
                                                cssClass="e-custom-style"
                                                enableMask={true}
                                                showClearButton={false}
                                                format="dd-MM-yyyy"
                                                width={180}
                                                value={moment(filterState.tanggal_awal).toDate()}
                                                change={(args: ChangeEventArgsCalendar) => {
                                                    handleTgl(args.value, 'tanggal_awal');
                                                }}
                                                style={{
                                                    width: 70,
                                                }}
                                            >
                                                <Inject services={[MaskedDateTime]} />
                                            </DatePickerComponent>
                                        </span>

                                        <label className="mr-1 flex w-6 text-xs" style={{ marginBottom: -2 }}>
                                            S/D
                                        </label>
                                        <span className="flex h-[4vh] w-[100px] items-center rounded border bg-white">
                                            <DatePickerComponent
                                                locale="id"
                                                cssClass="e-custom-style"
                                                enableMask={true}
                                                showClearButton={false}
                                                format="dd-MM-yyyy"
                                                width={180}
                                                value={moment(filterState.tanggal_akhir).toDate()}
                                                change={(args: ChangeEventArgsCalendar) => {
                                                    handleTgl(args.value, 'tanggal_akhir');
                                                }}
                                                style={{
                                                    width: 70,
                                                }}
                                            >
                                                <Inject services={[MaskedDateTime]} />
                                            </DatePickerComponent>
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <label className="mb-0.5 text-xs font-semibold text-gray-700">Status</label>
                                    <div className="flex flex-col pl-4">
                                        <label className="flex items-center text-xs">
                                            <input type="radio" name="status" value="O" checked={filterState.status === 'O'} onChange={handleInputChange} className="mr-1" />
                                            Proses Outstanding
                                        </label>
                                        <label className="flex items-center text-xs">
                                            <input type="radio" name="status" value="H" checked={filterState.status === 'H'} onChange={handleInputChange} className="mr-1" />
                                            Proses Pengajuan
                                        </label>
                                        <label className="flex items-center text-xs">
                                            <input type="radio" name="status" value="A" checked={filterState.status === 'A'} onChange={handleInputChange} className="mr-1" />
                                            Proses Approval
                                        </label>
                                        <label className="flex items-center text-xs">
                                            <input type="radio" name="status" value="1" checked={filterState.status === '1'} onChange={handleInputChange} className="mr-1" />
                                            App Level 1
                                        </label>
                                        <label className="flex items-center text-xs">
                                            <input type="radio" name="status" value="2" checked={filterState.status === '2'} onChange={handleInputChange} className="mr-1" />
                                            App Level 2
                                        </label>
                                        <label className="flex items-center text-xs">
                                            <input type="radio" name="status" value="3" checked={filterState.status === '3'} onChange={handleInputChange} className="mr-1" />
                                            App Level 3
                                        </label>
                                        <label className="flex items-center text-xs">
                                            <input type="radio" name="status" value="4" checked={filterState.status === '4'} onChange={handleInputChange} className="mr-1" />
                                            App Level 4
                                        </label>
                                        <label className="flex items-center text-xs">
                                            <input type="radio" name="status" value="5" checked={filterState.status === '5'} onChange={handleInputChange} className="mr-1" />
                                            App Level 5
                                        </label>
                                        <label className="flex items-center text-xs">
                                            <input type="radio" name="status" value="6" checked={filterState.status === '6'} onChange={handleInputChange} className="mr-1" />
                                            App Level 6
                                        </label>
                                        <label className="flex items-center text-xs">
                                            <input type="radio" name="status" value="F" checked={filterState.status === 'F'} onChange={handleInputChange} className="mr-1" />
                                            Full Approved
                                        </label>
                                        <label className="flex items-center text-xs">
                                            <input type="radio" name="status" value="P" checked={filterState.status === 'P'} onChange={handleInputChange} className="mr-1" />
                                            Posted
                                        </label>
                                        <label className="flex items-center text-xs">
                                            <input type="radio" name="status" value="C" checked={filterState.status === 'C'} onChange={handleInputChange} className="mr-1" />
                                            Dibatalkan
                                        </label>
                                        <label className="flex items-center text-xs">
                                            <input type="radio" name="status" value="all" checked={filterState.status === 'all'} onChange={handleInputChange} className="mr-1" />
                                            Semua
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="flex h-[10%] w-full items-center justify-center rounded-b-md bg-white">
                                <button
                                    onClick={async () => await getRps()}
                                    className="ml-3 flex h-7 items-center rounded-md bg-[#3a3f5c] p-2 py-1 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#2f3451]"
                                >
                                    <RiRefreshFill className="text-md" />
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="relative flex h-full w-[80%] ">
                        <GridPembebananRps GridPembebananRpsReff={GridPembebananReff} dsTab1={dsTab1} setSelectedRowBeban={setSelectedRowBeban} recordDoubleClick={recordDoubleClick} />
                    </div>
                </div>
                <div className={`flex h-[70vh] w-full ${filterTabJenis === 'Hitung Penyesuaian Stok' ? 'block' : 'hidden'}`}>
                    <GridHitungPenyesuainStok
                        GridHitungPenyesuainStokReff={GridHitungPenyesuainStokReff}
                        apiUrl={apiUrl}
                        kode_entitas={kode_entitas}
                        token={token}
                        terpilih={terpilih}
                        setTerpilih={setTerpilih}
                        setMasterState={setMasterState}
                        setVisibleDialog={setVisibleDialog}
                        swalCOnfirm={swalCOnfirm}
                        userid={userid}
                        getRps={getRps}
                        filterTabJenis={filterTabJenis}
                    />
                </div>
                <div className={`flex h-[70vh] w-full ${filterTabJenis === 'Pembatalan' ? 'block' : 'hidden'}`}>
                    <GridPembatalan gridPembatalanReff={gridPembatalanReff} />
                </div>
            </div>
        </div>
    );
};

export default PembebananSBList;
