import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useSession } from '@/pages/api/sessionContext';

import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, Inject, Page, Edit, Sort, Filter, Group, Resize, Reorder, Selection, ExcelExport, PdfExport } from '@syncfusion/ej2-react-grids';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown } from '@syncfusion/ej2-react-dropdowns';
import { ButtonComponent, CheckBoxComponent, ChangeEventArgs as ChangeEventArgsButton } from '@syncfusion/ej2-react-buttons';
import { ContextMenuComponent, MenuEventArgs, MenuItemModel, TabComponent } from '@syncfusion/ej2-react-navigations';
import { FocusInEventArgs, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Draggable from 'react-draggable';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faTimes } from '@fortawesome/free-solid-svg-icons';
import withReactContent from 'sweetalert2-react-content';
import swal from 'sweetalert2';

// import styles from './historyJurnal.module.css';
import moment from 'moment';

import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json';
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
import idIDLocalization from 'public/syncfusion/locale.json';
import { Tab } from '@headlessui/react';
import axios from 'axios';
import { generateNU, usersMenu } from '@/utils/routines';
import GridPembebananRps from './GridPembebananRps';
import { motion } from 'framer-motion';
import GridPembatalan from './GridPembatalan';
import GridHitungPenyesuainStok from './GridHitungPenyesuainStok';
import Swal from 'sweetalert2';
import GlobalProgressBar from '@/components/GlobalProgressBar';
import { useProgress } from '@/context/ProgressContext';
import DIalogKoreksiApp from './modal/DIalogKoreksiApp';
import { HandleTglPSB } from './function/function';
L10n.load(idIDLocalization);
enableRipple(true);

const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

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

const tabJenis = [
    {
        jenis: 'Pengajuan Pembenan',
    },
    {
        jenis: 'Hitung Penyesuaian Stok',
    },
    {
        jenis: 'Pembatalan',
    },
];

interface UserMenuState {
    baru: any;
    edit: any;
    hapus: any;
    cetak: any;
}

const SpreadNumber = (number: any | number | string) => {
    const temp = parseFloat(parseFloat(number).toFixed(2));
    return temp;
};

const FppList = () => {
    const { sessionData, isLoading } = useSession();

    if (isLoading) {
        return;
    }

    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const kode_user = sessionData?.kode_user ?? '';
    const token = sessionData?.token ?? '';
    const [dsTab1, setDsTab1] = useState([]);
    const { startProgress, updateProgress, endProgress, setLoadingMessage } = useProgress();

    // State Baru Untuk FPP

    const [userApp, setUserApp] = useState('');
    const [userMenu, setUserMenu] = useState<UserMenuState>({ baru: '', edit: '', hapus: '', cetak: '' });
    const GridPembebananReff = useRef<any>(null);
    const GridHitungPenyesuainStokReff = useRef<any>(null);
    const gridPembatalanReff = useRef<any>(null);
    const [selectedRowBeban, setSelectedRowBeban] = useState<any>({});
    const [masterState, setMasterState] = useState('');
    const [masterData, setMasterData] = useState({});
    const [visibleDialog, setVisibleDialog] = useState(false);
    const kode_menu = '60204'; // kode menu FPP
    const [list_pembebanan, setList_pembebanan] = useState<any>([])

    // Styling
    const styleButton = { width: 57 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#3b3f5c' };

    // Global State Management
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isShowTaskMenu, setIsShowTaskMenu] = useState(false);
    const [panelVisible, setPanelVisible] = useState(true);
    const [searchNoFpp, setSearchNoFpp] = useState('');
    const [searchKeterangan, setSearchKeterangan] = useState('');
    const [selectedRow, setSelectedRow] = useState('');
    const [selectedItems, setSelectedItems] = useState<any>(null);
    const [filterTabJenis, setFilterTabJenis] = useState('Pengajuan Pembenan');
    const [terpilih, setTerpilih] = useState<any>([]);
    const [userLevel, setUserLevel] = useState<any>({});

    // Date State Management

    const [filterState, setFilterState] = useState({
        tanggal_awal: moment(),
        tanggal_akhir: moment().endOf('month'),
        no_rps: '',
        status: 'O',
    });
    const [checkboxState, setCheckboxState] = useState({
        no_rps: false,
        status: false,
        tanggal_input: false,
    });

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

    // Filter State Management

    const handleTogglePanel = () => {
        setPanelVisible(!panelVisible);
    };

    const handleFilterClick = () => {
        setPanelVisible(true);
    };

    const recordDoubleClick = () => {
        setMasterData(selectedRowBeban);
        setMasterState('PREVIEW');
        setVisibleDialog(true);
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
            // setList_pembebanan(responseTab2)
            const tambahID = responseTab2.data.data.map((item: any,index: any) => ({
                ...item,
                id_rps: index + 1
            }))

            GridHitungPenyesuainStokReff.current.setProperties({ dataSource: tambahID });
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
                        tgl_app1: moment(dataOld.master.tgl_app1).format('YYYY-MM-DD HH:mm:ss'),
                        tgl_app2: moment(dataOld.master.tgl_app2).format('YYYY-MM-DD HH:mm:ss'),
                        tgl_app3: moment(dataOld.master.tgl_app3).format('YYYY-MM-DD HH:mm:ss'),
                        tgl_app4: moment(dataOld.master.tgl_app4).format('YYYY-MM-DD HH:mm:ss'),
                        tgl_app5: moment(dataOld.master.tgl_app5).format('YYYY-MM-DD HH:mm:ss'),
                        tgl_app6: moment(dataOld.master.tgl_app6).format('YYYY-MM-DD HH:mm:ss'),
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
                    Jurnal2.debet_rp = 0;
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
                        Jurnal3.kode_dokumen = null;
                        Jurnal3.id_dokumen = 3;
                        Jurnal3.dokumen = 'JU';
                        Jurnal3.tgl_dokumen = moment().format('YYYY-MM-DD HH:mm:ss');
                        Jurnal3.kode_akun = quSetting.kode_akun_pendbulat;
                        Jurnal3.kode_subledger = null;
                        Jurnal3.kurs = 1;
                        Jurnal3.debet_rp = 0;
                        Jurnal3.kredit_rp = SpreadNumber(dataOld.master.jml_perusahaan) * -1;
                        Jurnal3.jumlah_rp = SpreadNumber(dataOld.master.jml_perusahaan);
                        Jurnal3.jumlah_mu = SpreadNumber(dataOld.master.jml_perusahaan);
                        Jurnal3.catatan = KetDokumen;
                        Jurnal3.no_warkat = null;
                        Jurnal3.tgl_valuta = moment().format('YYYY-MM-DD HH:mm:ss');
                        Jurnal3.persen = 0;
                        Jurnal3.kode_dept = null;
                        Jurnal3.kode_kerja = null;
                        Jurnal3.approval = 'N';
                        Jurnal3.posting = 'N';
                        Jurnal3.rekonsiliasi = 'N';
                        Jurnal3.tgl_rekonsil = null;
                        Jurnal3.userid = userid.toUpperCase();
                        Jurnal3.tgl_update = moment().format('YYYY-MM-DD HH:mm:ss');
                        Jurnal3.audit = null;
                        Jurnal3.kode_kry = null;
                        Jurnal3.kode_jual = null;
                        Jurnal3.no_kontrak_um = null;
                    }

                    const JU = [Jurnal1, Jurnal2, Jurnal3];

                    const JUKirim = {
                        ...JUMaster,
                        entitas: kode_entitas,
                        jurnal: JU.filter((item: any) => Object.keys(item).length > 0),
                    };

                    // console.log('JUKirim',  JUKirim);

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

    useEffect(() => {
        const fetchUserMenu = async () => {
            await usersMenu(kode_entitas, userid, kode_menu)
                .then((res) => {
                    const { baru, edit, hapus, cetak } = res;
                    // setUserMenu((prevState) => ({
                    //     ...prevState,
                    //     baru,
                    //     edit,
                    //     hapus,
                    //     cetak,
                    // }));
                })
                .catch((err) => {
                    console.error('Error: ', err);
                });
        };

        const fetchUserApp = async () => {
            await axios
                .get(`${apiUrl}/erp/users_app`, {
                    params: { entitas: kode_entitas, param1: userid },
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => {
                    setUserApp(res.data.data[0].app_fpp);
                })
                .catch((err) => {
                    console.log('Error fetching user app: ', err);
                });
        };

        fetchUserMenu();
        fetchUserApp();
        getUsersLevel();
        getRps();
    }, []);

    return (
        <div className="Main h-[calc(100vh-220px)]" id="main-target">
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
            {/* === Search Group & Button Group === */}
            <div style={{ minHeight: '40px' }} className="mb-1 flex flex-col md:flex-row">
                {/*=== Button Group ===*/}
                <div className="gap-2 sm:flex">
                    <div className="flex items-center space-x-4 pl-2">
                        <button
                            onClick={prosesKoreksi}
                            className="flex h-[28px]  w-[100px] items-center rounded-md border border-green-500 bg-green-50 px-4 py-1 text-xs font-medium text-green-700 shadow-sm transition duration-200 ease-in-out hover:bg-green-100 hover:text-green-800"
                        >
                            <span className="mr-2 text-xs">▶</span>
                            Koreksi
                        </button>

                        <button onClick={prosesBatal} className="flex  h-[28px] items-center rounded border border-red-500 px-4 py-1  text-xs font-medium text-red-700 hover:text-red-900">
                            <span className="mr-1">▶</span> Pembatalan
                        </button>
                        {Object.keys(selectedRowBeban).length !== 0 && (
                            <button
                                onClick={prosesPosting}
                                className="flex h-[28px]   w-[130px] items-center rounded border border-green-500 px-4 py-1  text-xs font-medium text-green-700 hover:text-green-900"
                            >
                                <span className="mr-1">▶</span> {selectedRowBeban?.level_app === '6' && selectedRowBeban?.app === 'Y' ? 'Posting' : 'Approval #' + selectedRowBeban?.level_app}
                            </button>
                        )}
                    </div>
                    <div className="flex flex-col pr-1 sm:border-r md:flex-row"></div>
                    <ButtonComponent
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
                        content="Filter"
                    />
                </div>

                <div className="ml-3 mr-1 w-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <span className="mb-1 text-right" style={{ fontSize: '18px', fontFamily: 'Times New Roman' }}>
                        Pembebanan Selisih Barang
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-3 space-x-2  p-1">
                {tabJenis.map((item) => (
                    <motion.button
                        key={item.jenis}
                        onClick={async () => {
                            setFilterTabJenis(item.jenis);
                        }}
                        className={`whitespace-nowrap px-3 py-2 text-xs font-semibold ${filterTabJenis === item.jenis ? 'border-b-2 border-orange-500 text-black' : 'text-gray-500 hover:text-black'}`}
                        whileTap={{ scale: 1.1 }} // Menambahkan animasi scale saat ditekan
                        transition={{ duration: 0.2 }}
                    >
                        {item.jenis}
                    </motion.button>
                ))}
            </div>
            {/* === Filter & Table === */}
            <div className={`relative flex h-[calc(100%_-_40px)]  gap-3 ${filterTabJenis === 'Pengajuan Pembenan' ? 'block' : 'hidden'}`}>
                {/* Filter */}
                {panelVisible && (
                    <div
                        className={`panel absolute z-10 hidden h-full w-[330px] max-w-full flex-none space-y-4 p-4 dark:border-[#191e3a] xl:relative xl:block xl:h-auto ltr:rounded-r-none ltr:xl:rounded-r-md rtl:rounded-l-none rtl:xl:rounded-l-md ${
                            isShowTaskMenu && '!block'
                        }`}
                        style={{ background: '#dedede' }}
                    >
                        <div className="flex h-full flex-col pb-3">
                            <div className="h-[10%] pb-5">
                                <div className="flex items-center text-center">
                                    <button className="absolute right-0 top-0 p-2 text-gray-600 hover:text-gray-900" onClick={handleTogglePanel}>
                                        <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                                    </button>
                                    <div className="shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                            {/* prettier-ignore */}
                                            <path
                            stroke="currentColor"
                            strokeWidth="1.5"
                            d="M22 5.814v.69c0 1.038 0 1.557-.26 1.987-.26.43-.733.697-1.682 1.231l-2.913 1.64c-.636.358-.955.538-1.182.735a2.68 2.68 0 00-.9 1.49c-.063.285-.063.619-.063 1.286v2.67c0 1.909 0 2.863-.668 3.281-.668.418-1.607.05-3.486-.684-.895-.35-1.342-.524-1.594-.879C9 18.907 9 18.451 9 17.542v-2.67c0-.666 0-1-.064-1.285a2.68 2.68 0 00-.898-1.49c-.228-.197-.547-.377-1.183-.735l-2.913-1.64c-.949-.534-1.423-.8-1.682-1.23C2 8.06 2 7.541 2 6.503v-.69"
                        />
                                            <path
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                d="M22 5.815c0-1.327 0-1.99-.44-2.403C21.122 3 20.415 3 19 3H5c-1.414 0-2.121 0-2.56.412C2 3.824 2 4.488 2 5.815"
                                                opacity="0.5"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold ltr:ml-3 rtl:mr-3">Filtering Data</h3>
                                </div>
                            </div>
                            <div className="mb-1 h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>
                            <PerfectScrollbar className="growltr:-mr3.5 ltr:pr3.5 relative h-[80%] rtl:-ml-3.5 rtl:pl-3.5">
                                <div className="flex h-full flex-col gap-6 overflow-auto">
                                    <div>
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
                                        {/* // TANGGAL DOKUMEN // */}
                                        <div className="mt-2 flex justify-between">
                                            <CheckBoxComponent
                                                label="Tanggal"
                                                checked={checkboxState.tanggal_input}
                                                change={(args: ChangeEventArgsButton) => {
                                                    const value: any = args.checked;
                                                    setCheckboxState((oldData) => ({
                                                        ...oldData,
                                                        tanggal_input: !checkboxState.tanggal_input,
                                                    }));
                                                }}
                                            />
                                        </div>

                                        <div className={`grid grid-cols-1 justify-between gap-2 sm:flex `}>
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
                                                    value={filterState.tanggal_awal.toDate()}
                                                    change={(args: ChangeEventArgsCalendar) => {
                                                        HandleTglPSB(moment(args.value), 'tanggal_awal', setFilterState, setCheckboxState);
                                                    }}
                                                >
                                                    <Inject services={[MaskedDateTime]} />
                                                </DatePickerComponent>
                                            </div>
                                            <p className="set-font-9 ml-0.5 mr-0.5 mt-3 flex w-[50px] justify-between">s/d</p>
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
                                                    value={filterState.tanggal_akhir.toDate()}
                                                    change={(args: ChangeEventArgsCalendar) => {
                                                        HandleTglPSB(moment(args.value), 'tanggal_akhir', setFilterState, setCheckboxState);
                                                    }}
                                                >
                                                    <Inject services={[MaskedDateTime]} />
                                                </DatePickerComponent>
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
                                </div>
                            </PerfectScrollbar>
                            <div className='className="h-[10%]'>
                                <div className="flex justify-center">
                                    <button type="button" onClick={getRps} className="btn btn-primary mt-2">
                                        <FontAwesomeIcon icon={faArrowsRotate} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                        Refresh Data
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className={`overlay absolute z-[5] hidden h-full w-full rounded-md bg-black/60 `} onClick={() => setIsShowTaskMenu(isShowTaskMenu)}></div>

                {/* Table */}
                <div className="h-full flex-1 overflow-auto">
                    <Tab.Group defaultIndex={0}>
                        <Tab.Panels className="h-[100%]">
                            <GridPembebananRps GridPembebananRpsReff={GridPembebananReff} dsTab1={dsTab1} setSelectedRowBeban={setSelectedRowBeban} recordDoubleClick={recordDoubleClick} />
                        </Tab.Panels>
                    </Tab.Group>
                </div>
            </div>
            <div className={`relative flex h-[calc(100%_-_40px)]  gap-3 ${filterTabJenis === 'Hitung Penyesuaian Stok' ? 'block' : 'hidden'}`}>
                <div className="h-full flex-1">
                <Tab.Group defaultIndex={0}>
                <Tab.Panels className="h-[100%]">
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
                            </Tab.Panels>
                            </Tab.Group>
                </div>
            </div>
            <div className={`relative flex h-[calc(100%_-_40px)]  gap-3 ${filterTabJenis === 'Pembatalan' ? 'block' : 'hidden'}`}>
                <div className="h-full flex-1 overflow-auto">
                    <Tab.Group defaultIndex={0}>
                        <Tab.Panels className="h-[100%]">
                            <GridPembatalan gridPembatalanReff={gridPembatalanReff} />
                        </Tab.Panels>
                    </Tab.Group>
                </div>
            </div>
        </div>
    );
};

export default FppList;
