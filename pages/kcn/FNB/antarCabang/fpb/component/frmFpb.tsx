import React, { Suspense } from 'react';
import { DialogComponent, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { Tooltip, TooltipComponent, TooltipEventArgs } from '@syncfusion/ej2-react-popups';
import styles from './fpbtyle.module.css';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import { FocusInEventArgs, ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown } from '@syncfusion/ej2-react-dropdowns';
import { ButtonComponent, RadioButtonComponent, ChangeEventArgs as ChangeEventArgsButton, CheckBoxComponent } from '@syncfusion/ej2-react-buttons';
import { Tab, TabComponent, TabItemDirective, TabItemsDirective } from '@syncfusion/ej2-react-navigations';
import { ProgressBarComponent, ProgressAnnotation } from '@syncfusion/ej2-react-progressbar';
import {
    formatNumber,
    frmNumber,
    generateNU,
    FillFromSQL,
    FirstDayInPeriod,
    tanpaKoma,
    fetchPreferensi,
    overQTYAll,
    GetSuppMapping,
    GetEntitasUser,
    GetEntitasPusat,
    listFromSql,
    myAlertGlobal,
    qty2QtyStd,
    ResetTime2,
    generateNUDivisi,
    myAlertGlobal2,
} from '@/utils/routines';
import { useState, useRef, useEffect, FormEvent } from 'react';
import moment from 'moment';
import withReactContent from 'sweetalert2-react-content';
import swal from 'sweetalert2';
import axios from 'axios';
import stylesTtb from '../fbmlist.module.css';
import { Internationalization, loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import idIDLocalization from 'public/syncfusion/locale.json';
import Swal from 'sweetalert2';
import { useRouter } from 'next/router';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import AnimateHeight from 'react-animate-height';
import { FetchCustomerMapping, FetchDataFpb, FetchDepartemen, FetchQtyMaksimum } from '../model/api';
import FrmItemDlg from './frmItemDlg';
import { swalToast } from './fungsi';
import FrmEntitasDlg from './frmEntitas';
import FrmTerminDlgPusat from './frmTerminDlgPusat';
import FrmTerminDlgCabang from './frmTerminDlgCabang';
import FrmDaftarSoDlg from './frmDaftarSoDlg';
import { exitCode } from 'process';
import FrmGrupDlg from './frmGrupDlg';
import FrmPpnAtasNamaDlg from './frmPpnAtasNama';
import FrmSupplierDlg from './frmSupplierDlg';
import FrmSupplierDlgNoBooking from './frmSupplierDlgNoBooking';
import FrmFpbStokDlg from './frmFpbStokDlg';
import FrmFpbPoOutStanding from './frmFpbPoOutStandingDlg';
import '../component/frmFpb.module.css';
import { cekDataDiDatabase } from '@/utils/global/fungsi';
L10n.load(idIDLocalization);
// import ProgressBar from 'next-progressbar';
// import ProgressBar from '../component/ProgressBar';
// import progressbarstyle from '../component/ProgressBar.module.css'; // CSS untuk styling progress bar

interface FrmFpbProps {
    stateDokumen: any;
    isOpen: boolean;
    onClose: () => void;
    onRefresh: () => void;
}

let jenis_transaksi: any;
let dgDFpb: Grid | any;
const FrmFpb = ({ stateDokumen, isOpen, onClose, onRefresh }: FrmFpbProps) => {
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const [mKodeSupp, setMKodeSupp] = useState('');
    //  const [mNoDokumen, setMNoDokumen] = useState('');
    const [getEntitasPusat, setGetEntitasPusat] = useState('');
    const [disabledSimpan, setDisabledSimpan] = useState(false);

    const [listSatuan, setListSatuan] = useState<any[]>([]);
    const [listDialogBarang, setListDialogBarang] = useState([]);
    const [showDialogBarang, setShowDialogBarang] = useState(false);
    const [showDialogEntitas, setShowDialogEntitas] = useState(false);
    const [showDialogTerminPusat, setShowDialogTerminPusat] = useState(false);
    const [showDialogTerminCabang, setShowDialogTerminCabang] = useState(false);
    const [showDialogPoGrup, setShowDialogPoGrup] = useState(false);
    const [showDialogSo, setShowDialogSo] = useState(false);
    const [showDlgPpnAtasNama, setShowDlgPpnAtasNama] = useState(false);
    const [showDlgSupplier, setShowDlgSupplier] = useState(false);
    const [showDlgSupplierNoBooking, setShowDlgSupplierNoBooking] = useState(false);
    const [showDlgFpbStok, setShowDlgFpbStok] = useState(false);
    const [showDlgPoOutStanding, setShowDlgPoOutStanding] = useState(false);

    const [kodeItem, setKodeItem] = useState('');
    const [diskripsi, setDiskripsi] = useState('');
    const [tglDokumenOrigin, setTglDokumenOrigin] = useState(moment());

    const [selectedRowIndex, setSelectedRowIndex] = useState(0);
    const [totalNilai, setTotalNilai] = useState<any>(0);
    const [tambah, setTambah] = useState(false);
    const [edit, setEdit] = useState(false);

    const [showLoader, setShowLoader] = useState(false);
    const [kodeSuppBooking, setKodeSuppBooking] = useState('');
    const [tokenRedis, setTokenRedis] = useState<any>('');
    
    const [getSupp, setGetSupp] = useState({
        kode_supp: '',
        tipe: '',
        kode_termin: '',
        nama_relasi: '',
        nama_termin: '',
        hari: '',
        persen: '',
        tempo: '',
        kode_pajak: '',
        nilai_pajak: '',
        kode_mu: '',
        kurs: '',
        kurs_pajak: '',
        beban_dikirim: '',
        beban_diambil: '',
        kena_pajak: '', //kode_pajak === 'N' ? 'N' : 'I',
    });

    const [masterFpb, setMasterFpb] = useState({
        kode_fpb: null,
        no_fpb: '', //mNoDokumen,
        tgl_fpb: moment().format('YYYY-MM-DD HH:mm:ss'),
        kode_supp: getSupp.kode_supp,
        tgl_berlaku: moment().format('YYYY-MM-DD HH:mm:ss'), //null,
        tgl_kirim: moment().format('YYYY-MM-DD HH:mm:ss'), //null,
        alamat_kirim: null,
        via: 'Fax',
        fob: 'Dikirim',
        kode_termin: getSupp.kode_termin,
        kode_mu: getSupp.kode_mu,
        kurs: getSupp.kurs,
        kurs_pajak: getSupp.kurs_pajak,
        kena_pajak: getSupp.kode_pajak === 'N' ? 'N' : 'I',
        total_mu: 0,
        diskon_dok: null,
        diskon_dok_mu: 0,
        total_diskon_mu: 0,
        total_pajak_mu: 0,
        kirim_mu: 0,
        netto_mu: 0,
        total_rp: 0,
        diskon_dok_rp: 0,
        total_diskon_rp: 0,
        total_pajak_rp: 0,
        kirim_rp: 0,
        netto_rp: 0,
        total_berat: 0,
        keterangan: null,
        status: 'Terbuka',
        userid: stateDokumen?.userid,
        tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
        approval: '',
        tgl_approval: '',
        kirim_langsung: 'N',
        status_kirim: null,
        no_sjpabrik: null,
        tgl_sjpabrik: null,
        tgl_sjfax: null,
        nota: null,
        kode_entitas: getEntitasPusat,
        kontrak: null,
        approval2: '',
        tgl_approval2: '',
        kirim_langsung_cabang: null,
        kode_so_cabang: null,
        no_so_cabang: null,
        alamat_kirim_cabang: null,
        status_export: 'Baru',
        keterangan_pusat: null,
        kodecabang: null,
        kodegrup: null,
        tgl_trxfpb: moment().format('YYYY-MM-DD HH:mm:ss'),
        kode_termin_pusat: null,
        cara_kirim: null,
        diskon_def: null,
        kode_pajak: getSupp.kode_pajak,
        tipe_supp: getSupp.tipe,
        beban_dikirim: getSupp.tipe === 'grup' ? getSupp.beban_dikirim : '',
        beban_diambil: getSupp.tipe === 'grup' ? getSupp.beban_diambil : '',
        nama_relasi: getSupp.nama_relasi,
        alamat: null,
        nama_termin: getSupp.nama_termin,
        hari: getSupp.hari,
        persen: getSupp.persen,
        tempo: getSupp.tempo,
        nilai_pajak: getSupp.nilai_pajak,
        nama_cabang: null,
        nama_termin_pusat: null,
        genNoSupp: '',
        genNamaSupp: '',
        gKODE_BOOKING: '',
        gID_BOOKING: 0,
        gKODE_TERMIN_PUSAT: '',
        gNAMA_TERMIN_PUSAT: '',
    });

    const [detailFpb, setDetailFpb] = useState([
        {
            kode_fpb: null,
            id_fpb: 1,
            kode_pp: null,
            id_pp: null,
            kode_so: null,
            id_so: null,
            kode_item: null,
            diskripsi: null,
            satuan: null,
            qty: 0,
            sat_std: 0,
            qty_std: 0,
            qty_sisa: 0,
            qty_batal: 0,
            kode_mu: masterFpb.kode_mu,
            kurs: masterFpb.kurs,
            kurs_pajak: masterFpb.kurs_pajak,
            harga_mu: 0,
            diskon: null,
            diskon_mu: 0,
            potongan_mu: 0,
            kode_pajak: masterFpb.kode_pajak,
            pajak: masterFpb.nilai_pajak,
            include: masterFpb.kena_pajak,
            pajak_mu: 0,
            jumlah_mu: 0,
            jumlah_rp: 0,
            kode_dept: null,
            kode_kerja: null,
            harga_jual_mu: 0,
            harga_beli_mu: 0,
            base_kode_fpb: null,
            base_id_fpb: 0,
            tipe_booking: null,
            kode_booking: null,
            id_booking: 0,
            export: null,
            kodecabang: null,
            kodegrup: null,
            kode_preorder: '',
            id_preorder: 0,
            qty_sebelum: 0,
            harga5: 0,
            no_item: null,
            brt: null,
            berat: null,
            sisa: null,
            outstanding: 0,
            nama_dept: null,
            no_kerja: null,
            nama_kerja: null,
            no_pp: null,
            tgl_pp: null,
            grp: null,
            kustom10: null,
            status: null,
            stokhi: 0,
            dijual: 0,
            dibeli: 0,
            no_booking: null,
            nama_booking: null,
            nama_relasi: null,
            kode_entitas: null,
        },
    ]);

    const stateBaru = async () => {
        setMasterFpb({
            kode_fpb: null,
            no_fpb: '', //mNoDokumen,
            tgl_fpb: moment().format('YYYY-MM-DD HH:mm:ss'),
            kode_supp: getSupp.kode_supp,
            tgl_berlaku: moment().format('YYYY-MM-DD HH:mm:ss'), //null,
            tgl_kirim: moment().format('YYYY-MM-DD HH:mm:ss'), //null,
            alamat_kirim: null,
            via: 'Fax',
            fob: 'Dikirim',
            kode_termin: getSupp.kode_termin,
            kode_mu: getSupp.kode_mu,
            kurs: getSupp.kurs,
            kurs_pajak: getSupp.kurs_pajak,
            kena_pajak: getSupp.kode_pajak === 'N' ? 'N' : 'I',
            total_mu: 0,
            diskon_dok: null,
            diskon_dok_mu: 0,
            total_diskon_mu: 0,
            total_pajak_mu: 0,
            kirim_mu: 0,
            netto_mu: 0,
            total_rp: 0,
            diskon_dok_rp: 0,
            total_diskon_rp: 0,
            total_pajak_rp: 0,
            kirim_rp: 0,
            netto_rp: 0,
            total_berat: 0,
            keterangan: null,
            status: 'Terbuka',
            userid: stateDokumen?.userid,
            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
            approval: '',
            tgl_approval: '',
            kirim_langsung: 'N',
            status_kirim: null,
            no_sjpabrik: null,
            tgl_sjpabrik: null,
            tgl_sjfax: null,
            nota: null,
            kode_entitas: '898', //getEntitasUser,
            kontrak: null,
            approval2: '',
            tgl_approval2: '',
            kirim_langsung_cabang: null,
            kode_so_cabang: null,
            no_so_cabang: null,
            alamat_kirim_cabang: null,
            status_export: 'Baru',
            keterangan_pusat: null,
            kodecabang: null,
            kodegrup: null,
            tgl_trxfpb: moment().format('YYYY-MM-DD HH:mm:ss'),
            kode_termin_pusat: null,
            cara_kirim: null,
            diskon_def: null,
            kode_pajak: getSupp.kode_pajak,
            tipe_supp: getSupp.tipe,
            beban_dikirim: getSupp.tipe === 'grup' ? getSupp.beban_dikirim : '',
            beban_diambil: getSupp.tipe === 'grup' ? getSupp.beban_diambil : '',
            nama_relasi: getSupp.nama_relasi,
            alamat: null,
            nama_termin: getSupp.nama_termin,
            hari: getSupp.hari,
            persen: getSupp.persen,
            tempo: getSupp.tempo,
            nilai_pajak: getSupp.nilai_pajak,
            nama_cabang: null,
            nama_termin_pusat: null,
            genNoSupp: '',
            genNamaSupp: '',
            gKODE_BOOKING: '',
            gID_BOOKING: 0,
            gKODE_TERMIN_PUSAT: '',
            gNAMA_TERMIN_PUSAT: '',
        });

        setDetailFpb([
            {
                kode_fpb: null,
                id_fpb: 1,
                kode_pp: null,
                id_pp: null,
                kode_so: null,
                id_so: null,
                kode_item: null,
                diskripsi: null,
                satuan: null,
                qty: 0,
                sat_std: 0,
                qty_std: 0,
                qty_sisa: 0,
                qty_batal: 0,
                kode_mu: masterFpb.kode_mu,
                kurs: masterFpb.kurs,
                kurs_pajak: masterFpb.kurs_pajak,
                harga_mu: 0,
                diskon: null,
                diskon_mu: 0,
                potongan_mu: 0,
                kode_pajak: masterFpb.kode_pajak,
                pajak: masterFpb.nilai_pajak,
                include: masterFpb.kena_pajak,
                pajak_mu: 0,
                jumlah_mu: 0,
                jumlah_rp: 0,
                kode_dept: null,
                kode_kerja: null,
                harga_jual_mu: 0,
                harga_beli_mu: 0,
                base_kode_fpb: null,
                base_id_fpb: 0,
                tipe_booking: null,
                kode_booking: null,
                id_booking: 0,
                export: null,
                kodecabang: null,
                kodegrup: null,
                kode_preorder: '',
                id_preorder: 0,
                qty_sebelum: 0,
                harga5: 0,
                no_item: null,
                brt: null,
                berat: null,
                sisa: null,
                outstanding: 0,
                nama_dept: null,
                no_kerja: null,
                nama_kerja: null,
                no_pp: null,
                tgl_pp: null,
                grp: null,
                kustom10: null,
                status: null,
                stokhi: 0,
                dijual: 0,
                dibeli: 0,
                no_booking: null,
                nama_booking: null,
                nama_relasi: null,
                kode_entitas: null,
            },
        ]);
    };

    // const kalkulasi = async () => {
    //     await dgDFpb.dataSource.map(async (item: any, index: any) => {
    //         if (index === selectedRowIndex && item.qty !== 0 && item.qty !== '' && item.harga_mu !== 0 && item.harga_mu !== '') {
    //             someFunction(stateDokumen?.kode_entitas, item.kode_item, item.satuan, item.sat_std, item.qty)
    //                 .then((result: any) => {
    //                     item.jumlah_mu = result * (parseFloat(item.harga_mu) - parseFloat(item.diskon_mu) - parseFloat(item.potongan_mu));
    //                     item.jumlah_rp = result * (parseFloat(item.harga_mu) - parseFloat(item.diskon_mu) - parseFloat(item.potongan_mu));

    //                     item.berat = result * item.brt;

    //                     item.qty_std = result;
    //                     item.qty_sisa = result;
    //                 })
    //                 .catch((error) => {
    //                     console.error('Error:', error.message);
    //                 });
    //         }
    //     });
    //     // dgDFpb.refresh();
    // };

    const kalkulasi = async () => {
        const promises = dgDFpb.dataSource.map(async (item: any, index: any) => {
            if (index === selectedRowIndex && item.qty !== 0 && item.qty !== '' && item.harga_mu !== 0 && item.harga_mu !== '') {
                try {
                    // Tunggu hasil dari someFunction
                    const result = await someFunction(stateDokumen?.kode_entitas, item.kode_item, item.satuan, item.sat_std, item.qty);

                    // Gunakan nullish coalescing untuk menangani kemungkinan undefined
                    const safeResult = result ?? 0;

                    // Lakukan kalkulasi menggunakan nilai safeResult
                    item.jumlah_mu = safeResult * (parseFloat(item.harga_mu) - parseFloat(item.diskon_mu) - parseFloat(item.potongan_mu));
                    item.jumlah_rp = safeResult * (parseFloat(item.harga_mu) - parseFloat(item.diskon_mu) - parseFloat(item.potongan_mu));
                    item.berat = safeResult * item.brt;
                    item.qty_std = safeResult;
                    item.qty_sisa = safeResult;
                } catch (error) {
                    // console.error('Error:', error.message);
                }
            }
        });

        await Promise.all(promises);

        // dgDFpb.refresh();
    };

    const fetchDokumen = async () => {
        if (stateDokumen?.masterKodeDokumen === 'BARU') {
            const getEntUserMaster: any = await GetEntitasUser(stateDokumen?.kode_entitas, stateDokumen?.userid, stateDokumen?.token);
            setGetEntitasPusat(getEntUserMaster[0].kode_entitas);
            setMasterFpb((prevState: any) => ({
                ...prevState,
                kode_entitas: getEntUserMaster[0].kode_entitas,
            }));
            // const result = await generateNU(stateDokumen?.kode_entitas, '', '80', moment().format('YYYYMM'));
            // if (result) {
            //     // setMNoDokumen(result);
            //     setMasterFpb((prevState: any) => ({
            //         ...prevState,
            //         no_fpb: result,
            //     }));
            // } else {
            //     console.error('undefined');
            // }
            // // }
            // const getEntUser: any = await GetEntitasUser(stateDokumen?.kode_entitas, stateDokumen?.userid, stateDokumen?.token);
            // const getEntPusat: any = await GetEntitasPusat(stateDokumen?.kode_entitas, 'pusat', stateDokumen?.token);
            // const getSuppMapping: any = await GetSuppMapping(stateDokumen?.kode_entitas, getEntUser[0].kode_entitas, stateDokumen?.token);
            // setGetSupp(getSuppMapping[0]);
            // setMasterFpb((prevState: any) => ({
            //     ...prevState,
            //     kode_supp: getSupp.kode_supp,
            //     kode_termin: getSupp.kode_termin,
            //     kode_mu: getSupp.kode_mu,
            //     kurs: getSupp.kurs,
            //     kurs_pajak: getSupp.kurs_pajak,
            //     kena_pajak: getSupp.kode_pajak === 'N' ? 'N' : 'I',
            //     kode_pajak: getSupp.kode_pajak,
            //     tipe_supp: getSupp.tipe,
            //     beban_dikirim: getSupp.tipe === 'grup' ? getSupp.beban_dikirim : '',
            //     beban_diambil: getSupp.tipe === 'grup' ? getSupp.beban_diambil : '',
            //     nama_relasi: getSupp.nama_relasi,
            //     nama_termin: getSupp.nama_termin,
            //     nilai_pajak: getSupp.nilai_pajak,
            // }));
            // setDetailFpb((prevState: any) => [
            //     {
            //         ...prevState,
            //         no_item: '123456',
            //         kode_mu: getSupp.kode_mu,
            //         kurs: getSupp.kurs,
            //         kurs_pajak: getSupp.kurs_pajak,
            //         kode_pajak: getSupp.kode_pajak,
            //         pajak: getSupp.nilai_pajak,
            //         include: getSupp.kode_pajak === 'N' ? 'N' : 'I',
            //     },
            // ]);
            // dgDFpb.dataSource = detail;
        }
        if (stateDokumen?.masterKodeDokumen !== 'BARU') {
            // console.log('masuk sini');
            const paramList = {
                entitas: stateDokumen?.kode_entitas,
                param1: stateDokumen?.masterKodeDokumen,
            };

            try {
                try {
                    await FetchDataFpb(paramList, stateDokumen?.token)
                        .then((result: any) => {
                            const { master, detail } = result;
                            setMasterFpb(master[0]);
                            setDetailFpb(detail);
                            dgDFpb.dataSource = detail;
                        })
                        .catch((error) => {
                            console.error('Error:', error.message);
                        });
                } finally {
                    setTimeout(async () => {
                        // dgDFpb.refresh();
                        await kalkulasi();
                        await Recalc();
                    }, 500);
                    // await kalkulasi();
                    // await Recalc();
                    // dgDFpb.refresh();
                }
            } catch (error) {
                console.error('Error fetching data Edit :', error);
            }
        }
    };

    // HANDLE DATA BARANG
    const addDefaultRowIfEmpty = async (jenis: any) => {
        // console.log('jenis addDefaultRowIfEmpty ', jenis);
        if (jenis === 'created') {
            if (dgDFpb.dataSource.length === 0) {
                const result = await generateNU(stateDokumen?.kode_entitas, '', '80', moment().format('YYYYMM'));
                if (result) {
                    setMasterFpb((prevState: any) => ({
                        ...prevState,
                        no_fpb: result,
                    }));
                } else {
                    console.error('undefined');
                }
                const getEntUser: any = await GetEntitasUser(stateDokumen?.kode_entitas, stateDokumen?.userid, stateDokumen?.token);
                const getEntPusat: any = await GetEntitasPusat(stateDokumen?.kode_entitas, 'pusat', stateDokumen?.token);
                const getSuppMapping: any = await GetSuppMapping(stateDokumen?.kode_entitas, getEntUser[0].kode_entitas, stateDokumen?.token);
                console.log('getEntUser ', getEntUser);
                setGetSupp(getSuppMapping[0]);
                setMasterFpb((prevState: any) => ({
                    ...prevState,
                    kode_supp: getSuppMapping[0].kode_supp,
                    kode_termin: getSuppMapping[0].kode_termin,
                    kode_mu: getSuppMapping[0].kode_mu,
                    kurs: getSuppMapping[0].kurs,
                    kurs_pajak: getSuppMapping[0].kurs_pajak,
                    kena_pajak: getSuppMapping[0].kode_pajak === 'N' ? 'N' : 'I',
                    kode_pajak: getSuppMapping[0].kode_pajak,
                    tipe_supp: getSuppMapping[0].tipe,
                    beban_dikirim: getSuppMapping[0].tipe === 'grup' ? getSuppMapping[0].beban_dikirim : '',
                    beban_diambil: getSuppMapping[0].tipe === 'grup' ? getSuppMapping[0].beban_diambil : '',
                    nama_relasi: getSuppMapping[0].nama_relasi,
                    nama_termin: getSuppMapping[0].nama_termin,
                    nilai_pajak: getSuppMapping[0].nilai_pajak,
                }));
                defaultDetailBaru();
            }
        } else if (jenis === 'new') {
            await handleGridDetail_EndEdit();
            // let totalLine = dgDFpb.dataSource.length + 1; perubahan 24-05-2025
            // Cari ID FPB tertinggi yang ada, lalu tambah 1 untuk ID baru
            const currentMaxIdFpb = Math.max(0, ...dgDFpb.dataSource.map((row: any) => row.id_fpb || 0));
            const totalLine = currentMaxIdFpb + 1;

            const hasEmptyFields = dgDFpb.dataSource.some((row: { no_item: string }) => row.no_item === '');
            const getEntUser: any = await GetEntitasUser(stateDokumen?.kode_entitas, stateDokumen?.userid, stateDokumen?.token);
            const getEntPusat: any = await GetEntitasPusat(stateDokumen?.kode_entitas, 'pusat', stateDokumen?.token);
            const getSuppMapping: any = await GetSuppMapping(stateDokumen?.kode_entitas, getEntUser[0].kode_entitas, stateDokumen?.token);
            setGetSupp(getSuppMapping[0]);

            if (!hasEmptyFields) {
                const newData = detailFpb.map((item) => {
                    return {
                        ...item,
                        id_fpb: totalLine,
                        no_item: '',
                        diskripsi: '',
                        kode_mu: getSuppMapping[0].kode_mu,
                        kurs: getSuppMapping[0].kurs,
                        kurs_pajak: getSuppMapping[0].kurs_pajak,
                        kode_pajak: getSuppMapping[0].kode_pajak,
                        pajak: getSuppMapping[0].nilai_pajak,
                        include: getSuppMapping[0].kode_pajak === 'N' ? 'N' : 'I',
                    };
                });
                dgDFpb.addRecord(newData[0], totalLine);
                dgDFpb.refresh();
            } else {
                document.getElementById('dgDFpb')?.focus();
                myAlertGlobal2('Silahkan melengkapi data sebelum menambah data baru', 'frmFPB');
            }
        }
    };

    const defaultDetailBaru = async () => {
        const getEntUser: any = await GetEntitasUser(stateDokumen?.kode_entitas, stateDokumen?.userid, stateDokumen?.token);
        const getEntPusat: any = await GetEntitasPusat(stateDokumen?.kode_entitas, 'pusat', stateDokumen?.token);
        const getSuppMapping: any = await GetSuppMapping(stateDokumen?.kode_entitas, getEntUser[0].kode_entitas, stateDokumen?.token);
        const newData = detailFpb.map((item) => {
            return {
                ...item,
                id_fpb: 1,
                no_item: '',
                diskripsi: '',
                kode_mu: getSuppMapping[0].kode_mu,
                kurs: getSuppMapping[0].kurs,
                kurs_pajak: getSuppMapping[0].kurs_pajak,
                kode_pajak: getSuppMapping[0].kode_pajak,
                pajak: getSuppMapping[0].nilai_pajak,
                include: getSuppMapping[0].kode_pajak === 'N' ? 'N' : 'I',
            };
        });
        if (dgDFpb) {
            dgDFpb.dataSource = newData;
            dgDFpb.refresh();
        }
    };

    const closeDialog = async () => {
        stateBaru();
        dgDFpb.dataSource = [];
        addDefaultRowIfEmpty('created');
        onClose();
        setTimeout(() => {
            onRefresh();
        }, 100);
    };

    const handleSelectedDialogEntitas = async (dataObject: any) => {
        const getEntUser: any = await GetEntitasUser(stateDokumen?.kode_entitas, stateDokumen?.userid, stateDokumen?.token);
        const getEntPusat: any = await GetEntitasPusat(stateDokumen?.kode_entitas, 'pusat', stateDokumen?.token);
        const getSuppMapping: any = await GetSuppMapping(stateDokumen?.kode_entitas, getEntUser[0].kode_entitas, stateDokumen?.token);
        setGetSupp(getSuppMapping[0]);
        setMasterFpb((prevState: any) => ({
            ...prevState,
            kode_entitas: dataObject.Kode,
            kode_supp: getSuppMapping[0].kode_supp,
            tipe_supp: getSuppMapping[0].tipe,
            kode_termin: getSuppMapping[0].kode_termin,
            nama_relasi: getSuppMapping[0].nama_relasi,
            nama_termin: getSuppMapping[0].nama_termin,
            hari: getSuppMapping[0].hari,
            persen: getSuppMapping[0].persen,
            tempo: getSuppMapping[0].tempo,
            kode_pajak: getSuppMapping[0].kode_pajak,
            nilai_pajak: getSuppMapping[0].nilai_pajak,
            kode_mu: getSuppMapping[0].kode_mu,
            kurs: getSuppMapping[0].kurs,
            kurs_pajak: getSuppMapping[0].kurs_pajak,
            beban_dikirim: getSuppMapping[0].tipe === 'grup' ? getSuppMapping[0].beban_dikirim : '',
            beban_diambil: getSuppMapping[0].tipe === 'grup' ? getSuppMapping[0].beban_diambil : '',
            kena_pajak: getSuppMapping[0].kode_pajak === 'N' ? 'N' : 'I',
        }));

        // setDetailFpb((prevState: any) => [
        //     {
        //         ...prevState,
        //         // no_item: '123456',
        //         // diskripsi: '123456',
        //         kode_mu: getSupp.kode_mu,
        //         kurs: getSupp.kurs,
        //         kurs_pajak: getSupp.kurs_pajak,
        //         kode_pajak: getSupp.kode_pajak,
        //         pajak: getSupp.nilai_pajak,
        //         include: getSupp.kode_pajak === 'N' ? 'N' : 'I',
        //     },
        // ]);
        const modifiedDetail = detailFpb.map((item) => {
            return {
                ...item,
                kode_mu: getSupp.kode_mu,
                kurs: getSupp.kurs,
                kurs_pajak: getSupp.kurs_pajak,
                kode_pajak: getSupp.kode_pajak,
                pajak: getSupp.nilai_pajak,
                include: getSupp.kode_pajak === 'N' ? 'N' : 'I',
            };
        });
        setDetailFpb(modifiedDetail);
    };

    const [nilaiDpp, setNilaiDpp] = useState(0);
    // const Recalc = async () => {
    //     let quMFpbtotal_berat = 0;
    //     let quMFpbtotal_mu = 0;
    //     let qumFpbtotal_diskon_mu = 0;
    //     let qumFpbtotal_pajak_mu = 0;
    //     let qumfpbnetto_mu = 0;
    //     let Ready: boolean;
    //     let cekInclude: any;

    // cekInclude = await dgDFpb.dataSource?.map((item: any) => {
    //     if (masterFpb.kena_pajak !== 'N' && item.kode_pajak === masterFpb.kena_pajak) {
    //         // console.log('masuk a');
    //         if (item.include === 'E') {
    //             return {
    //                 ...item,
    //                 qumfpbnetto_mu: parseFloat(item.jumlah_mu) + parseFloat(item.pajak_mu),
    //                 qumfpbtotal_pajak_mu: 0,
    //             };
    //         } else if (item.include === 'I') {
    //             return {
    //                 ...item,
    //                 qumfpbnetto_mu: parseFloat(item.jumlah_mu),
    //                 qumfpbtotal_pajak_mu: 0,
    //             };
    //         }
    //         return {
    //             ...item,
    //             qumfpbnetto_mu: 0,
    //             qumfpbtotal_pajak_mu: parseFloat(item.pajak_mu),
    //         };
    //     } else {
    //         // console.log('masuk b');
    //         return {
    //             ...item,
    //             qumfpbnetto_mu: parseFloat(item.jumlah_mu),
    //             qumfpbtotal_pajak_mu: 0,
    //         };
    //     }
    // });

    //     quMFpbtotal_berat = await cekInclude.reduce((total: any, item: any) => {
    //         return total + parseFloat(item.berat);
    //     }, 0);
    //     quMFpbtotal_mu = await cekInclude.reduce((total: any, item: any) => {
    //         return total + parseFloat(item.jumlah_mu);
    //     }, 0);
    //     qumFpbtotal_diskon_mu = await cekInclude.reduce((total: any, item: any) => {
    //         return total + item.qty_std * (parseFloat(item.diskon_mu) + parseFloat(item.potongan_mu));
    //     }, 0);
    //     qumFpbtotal_pajak_mu = await cekInclude.reduce((total: any, item: any) => {
    //         return total + item.qumfpbtotal_pajak_mu;
    //     }, 0);
    //     qumfpbnetto_mu = await cekInclude.reduce((total: any, item: any) => {
    //         return total + item.jumlah_mu;
    //     }, 0);

    //     Ready = quMFpbtotal_mu > 0;
    //     qumfpbnetto_mu = qumfpbnetto_mu + parseFloat(frmNumber(masterFpb.kirim_mu)) - parseFloat(frmNumber(masterFpb.diskon_dok_mu));

    //     if (Ready) {
    //         let x: 0;
    //         let dpp: 0;
    //         const cekInclude2 = await dgDFpb.dataSource.map((item: any) => {
    //             if (masterFpb.diskon_dok_mu > 0) {
    //                 return {
    //                     ...item,
    //                     x: item.jumlah_mu - (item.jumlah_mu * masterFpb.diskon_dok_mu) / quMFpbtotal_mu,
    //                 };
    //             } else {
    //                 return {
    //                     ...item,
    //                     x: item.jumlah_mu, //parseFloat(item.qumFpbtotal_diskon_mu),
    //                 };
    //             }
    //         });

    //         x = await cekInclude2.reduce((total: any, item: any) => {
    //             return total + item.x;
    //         }, 0);

    //         const cekInclude3 = await dgDFpb.dataSource.map((item: any) => {
    //             // console.log(item);
    //             if (item.include === 'E') {
    //                 return {
    //                     ...item,
    //                     dpp: x,
    //                 };
    //             } else if (item.include === 'I') {
    //                 return {
    //                     ...item,
    //                     dpp: x - item.pajak_mu,
    //                 };
    //             } else {
    //                 return {
    //                     ...item,
    //                     dpp: 0,
    //                 };
    //             }
    //         });

    //         dpp = await cekInclude3.reduce((total: any, item: any) => {
    //             return total + item.x;
    //         }, 0);
    //         if (masterFpb.kena_pajak === 'N') {
    //             dpp = 0;
    //         }
    //         setNilaiDpp(dpp);
    //     }

    //     // masterFpb.total_mu = quMFpbtotal_mu;
    //     // masterFpb.total_diskon_mu = qumFpbtotal_diskon_mu;
    //     // masterFpb.total_pajak_mu = qumFpbtotal_pajak_mu;
    //     // masterFpb.netto_mu = qumfpbnetto_mu;
    //     // masterFpb.total_berat = quMFpbtotal_berat;
    //     // masterFpb.diskon_dok_rp = parseFloat(masterFpb.kurs) * masterFpb.diskon_dok_mu;
    //     // masterFpb.total_diskon_rp = parseFloat(masterFpb.kurs) * qumFpbtotal_diskon_mu;
    //     // masterFpb.total_pajak_rp = parseFloat(masterFpb.kurs_pajak) * qumFpbtotal_pajak_mu;
    //     // masterFpb.total_rp = parseFloat(masterFpb.kurs) * quMFpbtotal_mu;
    //     // masterFpb.kirim_rp = parseFloat(masterFpb.kurs) * masterFpb.kirim_mu;
    //     // masterFpb.netto_rp = parseFloat(masterFpb.kurs) * qumfpbnetto_mu;

    //     setMasterFpb((prevData: any) => ({
    //         ...prevData,
    //         total_mu: quMFpbtotal_mu,
    //         total_diskon_mu: qumFpbtotal_diskon_mu,
    //         total_pajak_mu: qumFpbtotal_pajak_mu,
    //         netto_mu: qumfpbnetto_mu,
    //         total_berat: quMFpbtotal_berat,
    //         diskon_dok_rp: parseFloat(prevData.kurs) * parseFloat(prevData.diskon_dok_mu),
    //         total_diskon_rp: parseFloat(prevData.kurs) * qumFpbtotal_diskon_mu,
    //         total_pajak_rp: parseFloat(prevData.kurs_pajak) * qumFpbtotal_pajak_mu,
    //         total_rp: parseFloat(prevData.kurs) * quMFpbtotal_mu,
    //         kirim_rp: parseFloat(prevData.kurs) * parseFloat(prevData.kirim_mu),
    //         netto_rp: parseFloat(prevData.kurs) * qumfpbnetto_mu,
    //     }));
    // };

    const Recalc = async () => {
        let Ready: boolean;

        const quMFpbtotal_berat = await dgDFpb.dataSource.reduce((total: any, item: any) => {
            return total + parseFloat(item.berat);
        }, 0);

        const quMFpbtotal_mu = await dgDFpb.dataSource.reduce((total: any, item: any) => {
            return total + parseFloat(item.jumlah_mu);
        }, 0);
        const qumFpbtotal_diskon_mu = await dgDFpb.dataSource.reduce((total: any, item: any) => {
            return total + item.qty_std * (parseFloat(item.diskon_mu) + parseFloat(item.potongan_mu));
        }, 0);

        const qumfpbnetto_mu = await dgDFpb.dataSource.reduce((total: any, item: any) => {
            if (masterFpb.kena_pajak !== 'N' && item.kode_pajak === masterFpb.kena_pajak) {
                if (item.include === 'E') {
                    return total + parseFloat(item.jumlah_mu) + parseFloat(item.pajak_mu);
                } else if (item.include === 'I') {
                    return total + parseFloat(item.jumlah_mu);
                } else {
                    return 0;
                }
            } else {
                return total + item.jumlah_mu;
            }
        }, 0);

        const qumFpbtotal_pajak_mu = await dgDFpb.dataSource.reduce((total: any, item: any) => {
            if (masterFpb.kena_pajak !== 'N' && item.kode_pajak === masterFpb.kena_pajak) {
                if (item.include === 'E') {
                    return 0;
                } else if (item.include === 'I') {
                    return 0;
                } else {
                    return total + parseFloat(item.jumlah_mu);
                }
            } else {
                return 0;
            }
        }, 0);

        Ready = masterFpb.total_mu > 0;
        masterFpb.netto_mu = masterFpb.netto_mu + parseFloat(frmNumber(masterFpb.kirim_mu)) - parseFloat(frmNumber(masterFpb.diskon_dok_mu));

        if (Ready) {
            let x: 0;
            let dpp: 0;
            x = await dgDFpb.dataSource.reduce((total: any, item: any) => {
                if (masterFpb.diskon_dok_mu > 0) {
                    return total + item.jumlah_mu - (item.jumlah_mu * masterFpb.diskon_dok_mu) / masterFpb.total_mu;
                } else {
                    return total + item.jumlah_mu;
                }
            });

            dpp = await dgDFpb.dataSource.reduce((total: any, item: any) => {
                if (item.include === 'E') {
                    return total + x;
                } else if (item.include === 'I') {
                    return total + x - item.pajak_mu;
                }
            }, 0);

            setNilaiDpp(dpp);
        }
        setMasterFpb((prevData: any) => ({
            ...prevData,
            total_mu: quMFpbtotal_mu,
            total_diskon_mu: qumFpbtotal_diskon_mu,
            total_pajak_mu: qumFpbtotal_pajak_mu,
            netto_mu: qumfpbnetto_mu,
            total_berat: quMFpbtotal_berat,
            diskon_dok_rp: parseFloat(prevData.kurs) * parseFloat(prevData.diskon_dok_mu),
            total_diskon_rp: parseFloat(prevData.kurs) * qumFpbtotal_diskon_mu,
            total_pajak_rp: parseFloat(prevData.kurs_pajak) * qumFpbtotal_pajak_mu,
            total_rp: parseFloat(prevData.kurs) * quMFpbtotal_mu,
            kirim_rp: parseFloat(prevData.kurs) * parseFloat(prevData.kirim_mu),
            netto_rp: parseFloat(prevData.kurs) * qumfpbnetto_mu,
        }));
    };

    let resultFetchDataBarang: any;
    let resultDetailSoCabang: any;
    const handleSelectedDaftarSo = async (dataObject: any) => {
        console.log('dataObject = ', dataObject);
        try {
            const response = await axios.get(`${apiUrl}/erp/cek_reff_so`, {
                params: {
                    entitas: stateDokumen?.kode_entitas,
                    param1: masterFpb.kode_entitas,
                    param2: dataObject.kode_dok,
                },
                headers: {
                    Authorization: `Bearer ${stateDokumen?.token}`,
                },
            });

            resultFetchDataBarang = response.data.data;
            if (resultFetchDataBarang.length >= 1) {
                myAlertGlobal2('No. SO sudah pernah direferensi data lain !!', 'frmFPB');
                throw exitCode;
            } else {
                await defaultDetailBaru();
                setMasterFpb((prevState: any) => ({
                    ...prevState,
                    kode_so_cabang: dataObject.kode_dok,
                    no_so_cabang: dataObject.no_dok,
                    alamat_kirim_cabang: dataObject.alamat,
                    cara_kirim: dataObject.cara_kirim,
                }));

                const response = await axios.get(`${apiUrl}/erp/detail_so_cabang`, {
                    params: {
                        entitas: masterFpb.kode_entitas,
                        param1: dataObject.kode_dok,
                    },
                    headers: {
                        Authorization: `Bearer ${stateDokumen?.token}`,
                    },
                });

                resultDetailSoCabang = response.data.data;

                let sidfpb = 1;
                // let resultKodeItem: any;
                // let resultNamaItem: any;
                let newData: any;
                let vItemPusat: any;
                // let vNamaItem: any;
                const detailArrayFpb: any = [];
                // const temp = resultDetailSoCabang.map(async (itemDetailCabang: any) => {
                console.log('resultDetailSoCabang = ', resultDetailSoCabang);

                // await Promise.all(
                //     resultDetailSoCabang.map(async (itemDetailCabang: any) => {
                //         const response = await axios.get(`${apiUrl}/erp/get_item_pusat`, {
                //             params: {
                //                 entitas: stateDokumen?.kode_entitas,
                //                 param1: itemDetailCabang.no_item,
                //             },
                //             headers: {
                //                 Authorization: `Bearer ${stateDokumen?.token}`,
                //             },
                //         });
                //         vItemPusat = response.data.data;
                //         // const response2 = await axios.get(`${apiUrl}/erp/get_item_pusat`, {
                //         //     params: {
                //         //         entitas: stateDokumen?.kode_entitas,
                //         //         param1: itemDetailCabang.no_item,
                //         //     },
                //         //     headers: {
                //         //         Authorization: `Bearer ${stateDokumen?.token}`,
                //         //     },
                //         // });
                //         // vNamaItem = response2.data.data;

                //         newData = dgDFpb.dataSource.map((item: any, index: any) => {
                //             return {
                //                 ...item,
                //                 id_fpb: index,
                //                 kode_so: itemDetailCabang.kode_so,
                //                 no_pp: itemDetailCabang.no_so,
                //                 id_so: itemDetailCabang.id_so,
                //                 no_item: itemDetailCabang.no_item,
                //                 kode_item: vItemPusat[0].kode_item,
                //                 diskripsi: vItemPusat[0].nama_item,
                //                 satuan: itemDetailCabang.satuan,
                //                 sat_std: itemDetailCabang.sat_std,
                //                 tgl_pp: moment(itemDetailCabang.tgl_pp).format('YYYY-MM-DD HH:mm:ss'),
                //                 harga_jual_mu: parseFloat(itemDetailCabang.harga_mu),
                //                 kode_preorder: itemDetailCabang.kode_preorder === null ? '' : itemDetailCabang.id_preorder,
                //                 id_preorder: itemDetailCabang.id_preorder === null ? 0 : itemDetailCabang.id_preorder,
                //                 harga_mu: 1,
                //                 diskon: '',
                //                 potongan_mu: 0,
                //                 qty: itemDetailCabang.qty_sisa,
                //                 sisa: itemDetailCabang.qty_sisa,
                //                 brt: itemDetailCabang.berat,
                //                 berat: itemDetailCabang.berat.toFixed(2) * itemDetailCabang.qty_std,
                //                 kode_dept: itemDetailCabang.kode_dept,
                //                 tgl_so: moment(itemDetailCabang.tgl_so).format('YYYY-MM-DD HH:mm:ss'),
                //                 tgl_jatuh_tempo: moment(itemDetailCabang.tgl_jatuh_tempo).format('YYYY-MM-DD HH:mm:ss'),
                //                 jumlah_mu: itemDetailCabang.qty_std * (1 - parseFloat(itemDetailCabang.diskon_mu) - parseFloat(itemDetailCabang.potongan_mu)),
                //             };
                //         });

                //         detailArrayFpb.push(newData.shift());
                //         // sidfpb++;

                //         console.log('detailArrayFpb = ', detailArrayFpb);

                //         (dgDFpb.dataSource = detailArrayFpb), //detailArrayFpb;
                //             Recalc();
                //     })
                // );
                // diremark ini tanggal 2025-05-28
                // await Promise.all(
                //     resultDetailSoCabang.map(async (itemDetailCabang: any) => {
                //         const response = await axios.get(`${apiUrl}/erp/get_item_pusat`, {
                //             params: {
                //                 entitas: stateDokumen?.kode_entitas,
                //                 param1: itemDetailCabang.no_item,
                //             },
                //             headers: {
                //                 Authorization: `Bearer ${stateDokumen?.token}`,
                //             },
                //         });

                //         const vItemPusat = response.data.data;
                //         const tgl_pp = moment(itemDetailCabang.tgl_pp).format('YYYY-MM-DD HH:mm:ss');
                //         const tgl_so = moment(itemDetailCabang.tgl_so).format('YYYY-MM-DD HH:mm:ss');
                //         const tgl_jatuh_tempo = moment(itemDetailCabang.tgl_jatuh_tempo).format('YYYY-MM-DD HH:mm:ss');

                //         // Ambil hanya 1 item dari dataSource dan proses sebagai satu data FPB
                //         const sourceItem = dgDFpb.dataSource[0]; // Ambil dari index 0
                //         if (!sourceItem) return;

                //         const mappedItem = {
                //             ...sourceItem,
                //             id_fpb: detailArrayFpb.length + 1, // Gunakan panjang array sebagai index
                //             kode_so: itemDetailCabang.kode_so,
                //             no_pp: itemDetailCabang.no_so,
                //             id_so: itemDetailCabang.id_so,
                //             no_item: itemDetailCabang.no_item,
                //             kode_item: vItemPusat[0]?.kode_item || '',
                //             diskripsi: vItemPusat[0]?.nama_item || '',
                //             satuan: itemDetailCabang.satuan,
                //             sat_std: itemDetailCabang.sat_std,
                //             tgl_pp,
                //             harga_jual_mu: parseFloat(itemDetailCabang.harga_mu),
                //             kode_preorder: itemDetailCabang.kode_preorder === null ? '' : itemDetailCabang.id_preorder,
                //             id_preorder: itemDetailCabang.id_preorder === null ? 0 : itemDetailCabang.id_preorder,
                //             harga_mu: 1,
                //             diskon: '',
                //             potongan_mu: 0,
                //             qty: itemDetailCabang.qty_sisa,
                //             sisa: itemDetailCabang.qty_sisa,
                //             brt: itemDetailCabang.berat,
                //             berat: itemDetailCabang.berat.toFixed(2) * itemDetailCabang.qty_std,
                //             kode_dept: itemDetailCabang.kode_dept,
                //             tgl_so,
                //             tgl_jatuh_tempo,
                //             jumlah_mu: itemDetailCabang.qty_std * (1 - parseFloat(itemDetailCabang.diskon_mu) - parseFloat(itemDetailCabang.potongan_mu)),
                //         };

                //         detailArrayFpb.push(mappedItem);
                //     })
                // );
                // Perubahan ini 2025-05-28
                for (const itemDetailCabang of resultDetailSoCabang) {
                    const response = await axios.get(`${apiUrl}/erp/get_item_pusat`, {
                        params: {
                            entitas: stateDokumen?.kode_entitas,
                            param1: itemDetailCabang.no_item,
                        },
                        headers: {
                            Authorization: `Bearer ${stateDokumen?.token}`,
                        },
                    });

                    const vItemPusat = response.data.data;
                    const tgl_pp = moment(itemDetailCabang.tgl_pp).format('YYYY-MM-DD HH:mm:ss');
                    const tgl_so = moment(itemDetailCabang.tgl_so).format('YYYY-MM-DD HH:mm:ss');
                    const tgl_jatuh_tempo = moment(itemDetailCabang.tgl_jatuh_tempo).format('YYYY-MM-DD HH:mm:ss');

                    const sourceItem = dgDFpb.dataSource[0];
                    if (!sourceItem) continue;

                    const mappedItem = {
                        ...sourceItem,
                        id_fpb: detailArrayFpb.length + 1, // Sekarang ini akan benar
                        kode_so: itemDetailCabang.kode_so,
                        no_pp: itemDetailCabang.no_so,
                        id_so: itemDetailCabang.id_so,
                        no_item: itemDetailCabang.no_item,
                        kode_item: vItemPusat[0]?.kode_item || '',
                        diskripsi: vItemPusat[0]?.nama_item || '',
                        satuan: itemDetailCabang.satuan,
                        sat_std: itemDetailCabang.sat_std,
                        tgl_pp,
                        harga_jual_mu: parseFloat(itemDetailCabang.harga_mu),
                        kode_preorder: itemDetailCabang.kode_preorder === null ? '' : itemDetailCabang.id_preorder,
                        id_preorder: itemDetailCabang.id_preorder === null ? 0 : itemDetailCabang.id_preorder,
                        harga_mu: 1,
                        diskon: '',
                        potongan_mu: 0,
                        qty: itemDetailCabang.qty_sisa,
                        sisa: itemDetailCabang.qty_sisa,
                        brt: itemDetailCabang.berat,
                        berat: itemDetailCabang.berat.toFixed(2) * itemDetailCabang.qty_std,
                        kode_dept: itemDetailCabang.kode_dept,
                        tgl_so,
                        tgl_jatuh_tempo,
                        jumlah_mu: itemDetailCabang.qty_std * (1 - parseFloat(itemDetailCabang.diskon_mu) - parseFloat(itemDetailCabang.potongan_mu)),
                    };

                    detailArrayFpb.push(mappedItem);
                }

                //===========================


                // Setelah semua selesai:
                dgDFpb.dataSource = detailArrayFpb;
                Recalc();
                dgDFpb.refresh();
            }
        } catch (error: any) {
            console.error('Error fetching data:', error);
        }
    };

    const detailHeader = (value1: any) => (
        <div style={{ textAlign: 'center', lineHeight: '1.5em' }}>
            {value1}
            {/* <div>{value2}</div> */}
        </div>
    );

    const headerTemplate = () => {
        return (
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center justify-between gap-3">
                    <div>Form Pemesanan Barang</div>
                    <div className="flex gap-2 bg-green-400 p-0.5">
                        <div>Entitas</div>
                        <div className="input-group flex" style={{ alignItems: 'center' }}>
                            <input
                                id="edEntitas"
                                className={`container form-input`}
                                style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }}
                                disabled={true}
                                value={masterFpb.kode_entitas}
                                readOnly
                            ></input>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDialogEntitas(true);
                                        // handleDialogAkun();
                                        // setStateDialog('header');
                                        // setShowFrmDlgAkunJurnal(true);
                                    }}
                                    style={{ width: '10%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    // disabled={stateDokumen[0].CON_BKK === 'PREVIEW_IMAGE' || stateDokumen[0].CON_BKK === 'PREVIEW_IMAGE_ORI' ? true : false}
                                    // disabled={true}
                                >
                                    <FontAwesomeIcon icon={faSearch} className="ml-2" style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-end">
                    {stateDokumen?.CON_FPB === 'Approve_Cabang' ? (
                        <span className="from-neutral-950-bold !text-green-950">APPROVAL CABANG</span>
                    ) : stateDokumen?.CON_FPB === 'Approve_Pusat' ? (
                        <span className="font-neutral-950-bold !text-green-950">APPROVAL PUSAT</span>
                    ) : stateDokumen?.CON_FPB === 'batal fpb' ? (
                        <span className="font-neutral-950-bold !text-red-950">PEMBATALAN</span>
                    ) : null}
                </div>
            </div>
        );
    };
    const [active, setActive] = useState<string>('0');
    const togglePara = (value: string) => {
        setActive((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    let buttonBaru: ButtonPropsModel[];
    let buttonApprove: ButtonPropsModel[];

    const quDFpbsatuanChange = async () => {
        let nilaiQtyStd: number;
        let nilaiHasil: number;
        if (dgDFpb?.dataSource[selectedRowIndex]?.satuan !== 'null' || dgDFpb?.dataSource[selectedRowIndex]?.qty > 0 || dgDFpb?.dataSource[selectedRowIndex]?.kode_item !== '') {
            nilaiHasil = await qty2QtyStd(
                stateDokumen?.kode_entitas,
                dgDFpb?.dataSource[selectedRowIndex]?.kode_item,
                dgDFpb?.dataSource[selectedRowIndex]?.sat_std,
                dgDFpb?.dataSource[selectedRowIndex]?.sat_std,
                dgDFpb?.dataSource[selectedRowIndex]?.qty_sisa
            );

            const newGridSource = dgDFpb.dataSource.map((item: any) => {
                if (dgDFpb?.dataSource[selectedRowIndex]?.kode_item === item.kode_item) {
                    return {
                        ...item,
                        qty_std: nilaiHasil,
                        qty_sisa: nilaiHasil,
                        berat: nilaiHasil * item.brt,
                    };
                } else {
                    return {
                        ...item,
                    };
                }
            });

            dgDFpb.dataSource = newGridSource;
        }
    };

    const templateDetailSatuan = (args: any) => {
        return (
            <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6">
                <DropDownListComponent
                    id="satuan"
                    name="satuan"
                    dataSource={listSatuan[args.index]}
                    fields={{ value: 'satuan', text: 'satuan' }}
                    floatLabelType="Never"
                    placeholder={args.satuan}
                    value={args.satuan}
                    onChange={quDFpbsatuanChange}
                />
            </div>
        );
    };

    const quDFpbQtyChange = async () => {
        if (dgDFpb?.dataSource[selectedRowIndex]?.qudfpbdiskon !== 'null' && dgDFpb?.dataSource[selectedRowIndex]?.qty > 0 && dgDFpb?.dataSource[selectedRowIndex]?.harga_mu > 0) {
            const newGridSource = dgDFpb.dataSource.map((item: any) => {
                if (dgDFpb?.dataSource[selectedRowIndex]?.kode_item === item.kode_item) {
                    return {
                        ...item,
                        jumlah_mu: item.qty_std * (parseFloat(item.harga_mu) - parseFloat(item.diskon_mu) - parseFloat(item.potongan_mu)),
                    };
                } else {
                    return {
                        ...item,
                    };
                }
            });

            dgDFpb.dataSource = newGridSource;
        }
    };

    const EditTemplateKuantitas = (args: any) => {
        return (
            <div>
                <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                    <input
                        style={{ background: 'transparent' }}
                        id="qty"
                        name="qty"
                        // onBlur={(event: any) => {
                        //     inputJumlahMuJurnalRef.current = event.target.value;
                        //     rowIdJumlahMuJurnalRef.current = args.id;
                        //     tipeDetailJurnal.current = 'jumlahMu';
                        //     reCall(tipeDetailJurnal.current, inputJumlahMuJurnalRef.current, setDataJurnal, rowIdJumlahMuJurnalRef.current);
                        // }}
                        defaultValue={args.qty}
                        onFocus={(event: any) => event.target.select()}
                        onKeyDown={(event) => {
                            const char = event.key;
                            const isValidChar = /[0-9.\s]/.test(char) || event.keyCode === 8;
                            if (!isValidChar) {
                                event.preventDefault();
                            }
                            const inputValue = (event.target as HTMLInputElement).value;
                            if (char === '.' && inputValue.includes('.')) {
                                event.preventDefault();
                            }
                        }}
                        onChange={quDFpbQtyChange}
                    />
                </div>
            </div>
        );
    };
    const inputJumlahMuRef = useRef(null);

    const onChangeDetail = async (value: any, field: any) => {
        // let nilaiAwal = dgDFpb?.dataSource[selectedRowIndex]?.harga_jual_mu;

        const newDataSource = dgDFpb.dataSource.map(async (item: any, index: any) => {
            if (index === selectedRowIndex) {
                // console.log('field', field);
                if (field === 'harga_jual_mu') {
                    if (stateDokumen?.KirimLangsung === 'Y') {
                        // if (dgDFpb?.dataSource[selectedRowIndex]?.harga_mu > value || value === null) {
                        if (value > item.harga_jual_mu || item.harga_jual_mu === null) {
                            // console.log('value ', value);
                            // console.log('sssss ', dgDFpb?.dataSource[selectedRowIndex]?.harga_mu);

                            await Swal.fire({
                                title: `Harga Beli lebih besar dari Harga Jual.`,
                                showCancelButton: false,
                                confirmButtonText: 'Ok',
                                // cancelButtonText: 'No',
                                target: '#frmFPB',
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    dgDFpb.refresh();
                                }
                            });
                        } else {
                            console.log('exit');
                        }
                    }
                } else if (field === 'harga_beli_mu') {
                    if (stateDokumen?.KirimLangsung === 'Y') {
                        // if (value > dgDFpb?.dataSource[selectedRowIndex]?.harga_mu || value === null) {
                        if (value > item.harga_mu || value === null) {
                            await Swal.fire({
                                title: `Harga Beli Po lebih besar daripada Harga beli cabang`,
                                showCancelButton: false,
                                confirmButtonText: 'Ok',
                                // cancelButtonText: 'No',
                                target: '#frmFPB',
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    dgDFpb.refresh();
                                }
                            });
                        }
                    }
                }
            } else if (field === 'harga_mu') {
                if (value <= 0) {
                    await Swal.fire({
                        title: `Harga tidak boleh kurang dari nol`,
                        showCancelButton: false,
                        confirmButtonText: 'Ok',
                        // cancelButtonText: 'No',
                        target: '#frmFPB',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            dgDFpb.refresh();
                        }
                    });
                }
            } else if (field === 'jumlah_mu') {
                if (value <= 0) {
                    await Swal.fire({
                        title: `Total Harga tidak boleh kurang dari nol`,
                        showCancelButton: false,
                        confirmButtonText: 'Ok',
                        // cancelButtonText: 'No',
                        target: '#frmFPB',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            dgDFpb.refresh();
                        }
                    });
                }
            }
            //  else if (field === 'qty') {
            //     if (value <= 0) {
            //         await Swal.fire({
            //             title: `Total Harga tidak boleh kurang dari nol`,
            //             showCancelButton: false,
            //             confirmButtonText: 'Ok',
            //             // cancelButtonText: 'No',
            //             target: '#frmFPB',
            //         }).then((result) => {
            //             if (result.isConfirmed) {
            //                 // console.log('dgDFpb.dataSource[selectedRowIndex] ', dgDFpb.dataSource[selectedRowIndex]);
            //                 dgDFpb.refresh();
            //             }
            //         });
            //     }
            // }
        });
    };

    const EditTemplateDetail = (args: any, idName: any) => {
        return (
            <div>
                <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                    <input
                        style={{ background: 'transparent' }}
                        id={idName}
                        name={idName}
                        onBlur={(event: any) => onChangeDetail(event.target.value, 'harga_jual_mu')}
                        defaultValue={args[idName]}
                        onFocus={(event: any) => event.target.select()}
                        onKeyDown={(event) => {
                            const char = event.key;
                            const isValidChar = /[0-9.\s]/.test(char) || event.keyCode === 8;
                            if (!isValidChar) {
                                event.preventDefault();
                            }
                            const inputValue = (event.target as HTMLInputElement).value;
                            if (char === '.' && inputValue.includes('.')) {
                                event.preventDefault();
                            }
                        }}
                        // onChange={quDHargaJualMu}
                    />
                </div>
            </div>
        );
    };

    const templateDetailNoBarang = (args: any) => {
        return (
            <div>
                <TooltipComponent content="Pilih data barang" opensOn="Hover" openDelay={1000} position="TopRight" target="#buNoItem">
                    <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                        <TextBoxComponent value={args.no_item} readOnly={true} showClearButton={false} />
                        <span>
                            <ButtonComponent
                                id="buNoItem1"
                                type="button"
                                cssClass="e-primary e-small e-round"
                                iconCss="e-icons e-small e-search"
                                onClick={() => {
                                    handleDialogAkun();
                                }}
                                style={{ backgroundColor: '#3b3f5c' }}
                            />
                        </span>
                    </div>
                </TooltipComponent>
            </div>
        );
    };

    const handleDialogAkun = async () => {
        if (listDialogBarang.length > 0) {
            setShowDialogBarang(true);
        }
    };

    const tombolDetailDlgItemBarang = (args: any) => {
        return (
            <div>
                <TooltipComponent content="Pilih data barang" opensOn="Hover" openDelay={1000} position="TopRight" target="#buNoItem">
                    <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                        <TextBoxComponent id="no_item" name="no_item" className="no_item" value={args.no_item} readOnly={true} showClearButton={false} />
                        <span>
                            <ButtonComponent
                                id="buNoItem1"
                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                cssClass="e-primary e-small e-round"
                                iconCss="e-icons e-small e-search"
                                onClick={() => {
                                    // if (stateDokumen?.KirimLangsung === 'Y' && (masterFpb.no_so_cabang === '' || masterFpb.no_so_cabang === null)) {
                                    if (stateDokumen?.KirimLangsung === 'Y') {
                                        if (masterFpb.no_so_cabang === '' || masterFpb.no_so_cabang === null) {
                                            myAlertGlobal2('No. SO harus diisi !!', 'frmFPB');
                                        } else {
                                            setShowDialogBarang(true);
                                        }
                                    } else {
                                        setShowDialogBarang(true);
                                    }

                                    // HandleModaliconChange('noItem', dataBarang, quMMKno_cust, setModalDlgTtbMk);
                                }}
                                style={{ backgroundColor: '#3b3f5c' }}
                            />
                        </span>
                    </div>
                </TooltipComponent>
            </div>
        );
    };

    const tombolDetailDlgDiskripsiBarang = (args: any) => {
        return (
            <div>
                <TooltipComponent content="Pilih data barang" opensOn="Hover" openDelay={1000} position="TopRight" target="#buNoItem">
                    <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                        <TextBoxComponent id="diskripsi" name="diskripsi" className="no_item" value={args.diskripsi} readOnly={true} showClearButton={false} />
                        <span>
                            <ButtonComponent
                                id="buNoItem2"
                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                cssClass="e-primary e-small e-round"
                                iconCss="e-icons e-small e-search"
                                onClick={() => {
                                    if (stateDokumen?.KirimLangsung === 'Y') {
                                        if (masterFpb.no_so_cabang === '' || masterFpb.no_so_cabang === null) {
                                            myAlertGlobal2('No. SO harus diisi !!', 'frmFPB');
                                        } else {
                                            setShowDialogBarang(true);
                                        }
                                    } else {
                                        setShowDialogBarang(true);
                                    }

                                    // if ((stateDokumen?.KirimLangsung === 'Y' && masterFpb.no_so_cabang === '') || masterFpb.no_so_cabang === null) {
                                    //     myAlertGlobal('No. SO harus diisi !!', 'frmFPB');
                                    // } else {
                                    //     setShowDialogBarang(true);
                                    // }
                                    // HandleModaliconChange('noItem', dataBarang, quMMKno_cust, setModalDlgTtbMk);
                                }}
                                style={{ backgroundColor: '#3b3f5c' }}
                            />
                        </span>
                    </div>
                </TooltipComponent>
            </div>
        );
    };

    const handleSelectedDialogAkun = (dataObject: any) => {
        dgDFpb.dataSource[selectedRowIndex] = {
            ...dgDFpb.dataSource[selectedRowIndex],
            kode_item: dataObject.kode_item,
            no_item: dataObject.no_item,
            diskripsi: dataObject.nama_item,
            satuan: dataObject.satuan,
            sat_std: dataObject.satuan,
            brt: dataObject.berat,
            status: dataObject.status,
        };

        if (dgDFpb?.dataSource[selectedRowIndex]?.kode_item !== 'undefined') {
            listFromSql(stateDokumen?.kode_entitas, 'satuan', '', stateDokumen?.token, dgDFpb?.dataSource[selectedRowIndex]?.kode_item)
                .then((result: any) => {
                    const modifiedData = result.map((item: any) => ({
                        ...item,
                        satuan: item.satuan,
                    }));
                    let existIndexSatuan = listSatuan[selectedRowIndex];

                    if (existIndexSatuan === undefined) {
                        listSatuan.push(modifiedData);
                    } else {
                        listSatuan[selectedRowIndex] = modifiedData;
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        } else {
            console.log('No Item Belum diisi.');
        }
        dgDFpb.refresh();
    };

    const handleSelectedDialogTerminPusat = async (dataObject: any) => {
        setMasterFpb((prevState: any) => ({
            ...prevState,
            kode_termin_pusat: dataObject.kode_termin,
            nama_termin_pusat: dataObject.nama_termin,
        }));
    };

    const handleSelectedDialogTerminCabang = async (dataObject: any) => {
        setMasterFpb((prevState: any) => ({
            ...prevState,
            kode_termin: dataObject.kode_termin,
            nama_termin: dataObject.nama_termin,
        }));
    };

    const handleSelectedDialogPoGrup = async (dataObject: any) => {
        setMasterFpb((prevState: any) => ({
            ...prevState,
            kodegrup: dataObject.kodegrup,
        }));
    };

    const handleSelectedDialogPpnAtasNama = async (dataObject: any) => {
        setMasterFpb((prevState: any) => ({
            ...prevState,
            kodecabang: dataObject.kodecabang,
            nama_cabang: dataObject.nama_cabang,
        }));
    };

    const handleSelectedDialogSupplier = async (dataObject: any) => {
        // console.log('dataObject.aktif ', dataObject.aktif);
        if (dataObject.aktif !== 'Y') {
            myAlertGlobal2(
                `Supplier tsb terkunci tidak dapat digunakan untuk melakukan transaksi,
                Silahkan menghubungi Bagian Keuangan di kantor pusat untuk konfirmasi.`,
                'frmFPB'
            );
        } else {
            setMasterFpb((prevState: any) => ({
                ...prevState,
                genNoSupp: dataObject.no_supp,
                genNamaSupp: dataObject.nama_relasi,
                gKODE_BOOKING: dataObject.kode_supp,
                gID_BOOKING: 0,
                gKODE_TERMIN_PUSAT: dataObject.kode_termin,
                gNAMA_TERMIN_PUSAT: dataObject.nama_termin,
            }));
        }
    };

    const handleSelectedDialogSupplierNoBooking = async (dataObject: any) => {
        if (dataObject.aktif !== 'Y') {
            await Swal.fire({
                title: `Supplier tsb terkunci tidak dapat digunakan untuk melakukan transaksi,
                       Silahkan menghubungi Bagian Keuangan di kantor pusat untuk konfirmasi.`,
                showCancelButton: false,
                confirmButtonText: 'Ok',
                // cancelButtonText: 'No',
                target: '#frmFPB',
            }).then((result) => {
                if (!result.isConfirmed) {
                    throw exitCode;
                }
            });
        } else {
            dgDFpb.dataSource[selectedRowIndex] = {
                ...dgDFpb.dataSource[selectedRowIndex],
                no_booking: dataObject.no_supp,
                kode_booking: dataObject.kode_supp,
                nama_booking: dataObject.nama_relasi,
                id_booking: 0,
            };
            setKodeSuppBooking(dataObject.kode_supp);
            dgDFpb.refresh();
        }
    };

    const handleSelectedDialogOutStanding = async (dataObject: any) => {
        if (dataObject.length <= 0) {
            await Swal.fire({
                title: `Barang ${dgDFpb.dataSource[selectedRowIndex].diskripsi}
                       belum ada order pembelian.`,
                showCancelButton: false,
                confirmButtonText: 'Ok',
                // cancelButtonText: 'No',
                target: '#frmFPB',
            }).then((result) => {
                if (!result.isConfirmed) {
                    throw exitCode;
                }
            });
        } else {
            dgDFpb.dataSource[selectedRowIndex] = {
                ...dgDFpb.dataSource[selectedRowIndex],
                no_booking: dataObject.no_supp,
                kode_booking: dataObject.kode_supp,
                nama_booking: dataObject.nama_relasi,
                id_booking: dataObject.id_sp,
                stok: dataObject.stok + dgDFpb.dataSource[selectedRowIndex].qty_sebelum,
            };
            dgDFpb.refresh();
        }
    };

    const handleSelectedDialogStok = async (dataObject: any) => {
        if (dataObject.length <= 0) {
            await Swal.fire({
                title: `Barang ${dgDFpb.dataSource[selectedRowIndex].diskripsi}
                       stok tidak tersedia.`,
                showCancelButton: false,
                confirmButtonText: 'Ok',
                // cancelButtonText: 'No',
                target: '#frmFPB',
            }).then((result) => {
                if (!result.isConfirmed) {
                    throw exitCode;
                }
            });
        } else {
            dgDFpb.dataSource[selectedRowIndex] = {
                ...dgDFpb.dataSource[selectedRowIndex],
                no_booking: dataObject.no_supp,
                kode_booking: dataObject.kode_supp,
                nama_booking: dataObject.nama_relasi,
                id_booking: 0,
                stok:
                    dataObject.Kode_gudang === dgDFpb.dataSource[selectedRowIndex].kode_booking
                        ? dataObject.stok + dgDFpb.dataSource[selectedRowIndex].qty_sebelum
                        : dataObject.stok + dgDFpb.dataSource[selectedRowIndex].qty,
            };
            dgDFpb.refresh();
        }
    };

    const handleGridDetail_EndEdit = async () => {
        dgDFpb.endEdit();
    };

    const rowSelectingDetailBarang = (args: any) => {
        setSelectedRowIndex(args.rowIndex);
    };
    // async function someFunction(entitas: any, kode_item: any, satuan: any, sat_std: any, kuantitas: any) {
    const someFunction = async (entitas: any, kode_item: any, satuan: any, sat_std: any, kuantitas: any) => {
        try {
            // Menunggu hingga promise diselesaikan dan mendapatkan nilai aktual
            const qty_std_number = await qty2QtyStd(entitas, kode_item, satuan, sat_std, kuantitas);
            return qty_std_number;

            // Lakukan sesuatu dengan nilai number yang diperoleh
        } catch (error) {
            // Tangani kesalahan jika ada
            console.error('Error:', error);
        }
    };

    const perubahanPajak = async (pjk: any) => {
        let x: any;
        await Promise.all(
            dgDFpb.dataSource.map(async (item: any, index: any) => {
                if ((index === selectedRowIndex && item.jumlah_mu === 0) || masterFpb.total_mu === 0) {
                    throw exitCode;
                }
                if ((index === selectedRowIndex && item.kode_pajak === 'null') || item.kode_pajak === '') {
                    throw exitCode;
                }
                if (pjk !== 'N' && item.kode_pajak === masterFpb.kode_pajak) {
                    if (masterFpb.diskon_dok_mu > 0) {
                        x = item.jumlah_mu - (item.jumlah_mu * masterFpb.diskon_dok_mu) / masterFpb.total_mu;
                    } else {
                        x = item.jumlah_mu;
                    }

                    if (item.include === 'E') {
                        item.pajak_mu = (item.pajak * x) / 100;
                    } else if (item.include === 'I') {
                        item.pajak_mu = x - (x * 100) / (100 + item.pajak);
                    }
                } else {
                    item.pajak_mu = 0;
                }
            })
        ).then(() => {
            Recalc();
        });
    };

    const [requestTipe, setRequestTipe] = useState('');
    const [tes, setTes] = useState([]);
    const actionCompleteDetailBarang = async (args: any) => {
        switch (args.requestType) {
            case 'save':
                if (tambah === false) {
                    const editedData = args.data;
                    dgDFpb.dataSource[args.rowIndex] = editedData;
                    await kalkulasi();
                    await Recalc();
                } else if (edit) {
                    setRequestTipe(args.requestType);
                    kalkulasi();
                    Recalc();
                }
                dgDFpb.refresh();
                break;
            case 'beginEdit':
                setTambah(false);
                setEdit(true);
                break;
            case 'delete':
                dgDFpb.dataSource.forEach((item: any, index: any) => {
                    item.id = index + 1;
                });
                await kalkulasi();
                await Recalc();
                break;
            case 'refresh':
                setTambah(false);
                setEdit(false);
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            fetchDokumen();
            // Penambahan / Perubahan tanggal 2025-06-09
            setTglDokumenOrigin(moment(masterFpb.tgl_fpb));
            const respToken = await axios.get(`${apiUrl}/erp/token_uuid`, {});

            const responseToken = respToken.data.token;
            setTokenRedis(responseToken);
            console.log('responseToken = ', responseToken);
        };
        fetchData();
        // const getEntUserMaster: any = GetEntitasUser(stateDokumen?.kode_entitas, stateDokumen?.userid, stateDokumen?.token);
        // setGetEntitasPusat(getEntUserMaster[0].kode_entitas);
    }, [isOpen]);

    let status: boolean;
    const CekhargaPreOrder = async () => {
        dgDFpb.dataSource.map((item: any) => {
            if (item.harga_mu <= 1) {
                status = true;
            } else {
                status = false;
            }
        });

        return status;
    };

    let statusPreOrder: boolean;
    const CekdariPreOrder = async () => {
        dgDFpb.dataSource.map((item: any) => {
            if (item.id_preorder >= 1) {
                statusPreOrder = true;
            } else {
                statusPreOrder = false;
            }
        });

        return statusPreOrder;
    };

    let statusJumlahMu: boolean;
    let statusNoBooking: boolean;
    const CekhargaMu = async () => {
        dgDFpb.dataSource.map((item: any) => {
            if (item.jumlah_mu <= 0) {
                statusJumlahMu = true;
            } else {
                statusJumlahMu = false;
            }
        });

        return statusJumlahMu;
    };
    let statusBeforePost: boolean;
    const CekBeforePostDetail = async () => {
        const response_approval = await axios.get(`${apiUrl}/erp/users_app`, {
            params: {
                entitas: stateDokumen?.kode_entitas, //stateDokumen?.kode_entitas,
                param1: stateDokumen?.userid, //stateDokumen?.userid,
            },
        });
        const responseApp = response_approval.data?.data[0];
        dgDFpb.dataSource.map((item: any) => {
            if (responseApp.fdo_app1 !== 'Y' && responseApp.fdo_app1 !== 'Y') {
                if (item.harga_beli_mu > item.harga_mu) {
                    myAlertGlobal2('Harga Beli PO lebih besar dari pada Harga beli cabang.', 'frmFPB');
                    throw exitCode;
                }
            }
            if (item.harga_mu <= 0) {
                myAlertGlobal2('Harga tidak boleh kurang dari nol', 'frmFPB');
                throw exitCode;
            }
            if (item.qty <= 0) {
                myAlertGlobal2('Kuantitas item tidak boleh kurang / sama dengan nol', 'frmFPB');
                throw exitCode;
            }
            if (item.jumlah_mu <= 0) {
                myAlertGlobal2('Total Harga tidak boleh kurang dari nol', 'frmFPB');
                throw exitCode;
            }
            if (item.diskon_mu >= item.jumlah_mu) {
                myAlertGlobal2(
                    `Diskon      : ${item.diskon_mu} \n
                                 Total Harga : ${item.jumlah_mu} \n
                                 Diskon tidak boleh melebihi Total harga.`,
                    'frmFPB'
                );
                throw exitCode;
            }
            if (item.potongan_mu >= item.jumlah_mu) {
                myAlertGlobal2(
                    `Potongan      : ${item.diskon_mu} \n
                      Total Harga : ${item.jumlah_mu} \n
                      Potongan tidak boleh melebihi Total harga.`,
                    'frmFPB'
                );
                throw exitCode;
            }
            if (item.satuan === '' || item.satuan === null) {
                myAlertGlobal2('Satuan masih kosong.', 'frmFPB');
                throw exitCode;
            }
            if (stateDokumen?.CON_FPB === 'harga fpb' && item.qty_std !== item.qty_sisa) {
                myAlertGlobal2('Item sudah diproses PO data tidak boleh diupdate.', 'frmFPB');
                throw exitCode;
            }
        });

        return statusJumlahMu;
    };

    const CekNoBooking = async () => {
        let sNoBooking: any;
        sNoBooking = dgDFpb.dataSource[0]?.no_booking;
        dgDFpb.dataSource.map((item: any) => {
            if (sNoBooking !== item.no_booking) {
                statusNoBooking = true;
            } else {
                statusNoBooking = false;
            }
        });

        return statusNoBooking;
    };

    let overBeli = false;
    let sNoSoPusat: any;
    let sNoPoPusat: any;
    let tglDokumenEfektif: any;
    let tglResetTrxDokumen: any;
    let tglDokumenEfektif7Hari: any;
    let appDate: any;
    let sNoPoCabang: any;
    let sNoPpCabang: any;
    let ExportNonKontrak = false;

    const cekValidasi = async () => {
        let pesan = '';
        let status = true;

        if (moment(tglDokumenOrigin).toDate() !== moment(masterFpb.tgl_fpb)?.toDate()) {
            let tglResetDokumen: any;

            const formatTglFpb = moment(masterFpb.tgl_fpb).format('YYYY-MM-DD');
            const formatTglTrxFpb = moment(masterFpb.tgl_trxfpb).format('YYYY-MM-DD');
            await ResetTime2(stateDokumen?.kode_entitas, formatTglFpb).then((result) => {
                tglResetDokumen = result;
            });
            tglResetDokumen = await ResetTime2(stateDokumen?.kode_entitas, formatTglFpb);
            tglResetTrxDokumen = await ResetTime2(stateDokumen?.kode_entitas, formatTglTrxFpb);
            appDate = moment().format('YYYY-MM-DD HH:mm:ss');
            tglDokumenEfektif7Hari = moment(masterFpb.tgl_trxfpb).add(7, 'day').format('YYYY-MM-DD HH:mm:ss');

            masterFpb.tgl_fpb = tglResetDokumen;
            // setMasterFpb((prevData: any) => ({
            //     ...prevData,
            //     tgl_fpb: tglResetDokumen,
            // }));
        }
        tglDokumenEfektif = masterFpb.tgl_trxfpb;

        if (dgDFpb.dataSource?.length < 0 || masterFpb.netto_mu === 0 || masterFpb.netto_mu === null) {
            myAlertGlobal2('Data barang belum diisi.', 'frmFPB');
            throw exitCode;
        }

        const hasEmptyFields = dgDFpb.dataSource.some((row: { diskripsi: string }) => row.diskripsi === '');
        if (hasEmptyFields) {
            // myAlertGlobal2('Nama Barang kosong', 'frmFPB');
            pesan = 'Nama Barang kosong';
            status = false;
            // throw exitCode;
        }

        let vCekhargaPreOrder: boolean; // = await CekhargaPreOrder();
        vCekhargaPreOrder = await CekhargaPreOrder();

        if (vCekhargaPreOrder) {
            // myAlertGlobal2('Harga barang tidak boleh <= (lebih kecil sama dengan)  1 !!', 'frmFPB');
            pesan = 'Harga barang tidak boleh <= (lebih kecil sama dengan)  1 !!';
            status = false;
            // throw exitCode;
        }

        if (stateDokumen?.CON_FPB === 'Approve_Pusat') {
            let vKodeGrup: any;
            if (masterFpb.kodegrup === '' || masterFpb.kodegrup === null) {
                // myAlertGlobal2('PO Grup belum diisi.', 'frmFPB');
                pesan = 'PO Grup belum diisi.';
                status = false;
                // throw exitCode;
            }
            if (masterFpb.nama_termin_pusat === '' || masterFpb.nama_termin_pusat === null) {
                // myAlertGlobal2('Termin Pusat belum diisi.', 'frmFPB');
                pesan = 'Termin Pusat belum diisi.';
                status = false;
                // throw exitCode;
            }

            if (masterFpb.kodecabang === '' || masterFpb.kodecabang === null) {
                vKodeGrup = '';
            } else {
                vKodeGrup = masterFpb.kodegrup;
            }

            dgDFpb.dataSource.map(async (item: any) => {
                return {
                    ...item,
                    kodegrup: vKodeGrup,
                };
            });
        }

        if (vCekhargaPreOrder) {
            // myAlertGlobal2('Harga barang tidak boleh <= (lebih kecil sama dengan)  1 !!', 'frmFPB');
            pesan = 'Harga barang tidak boleh <= (lebih kecil sama dengan)  1 !!';
            status = false;
            // throw exitCode;
        }
        let vCekhargaMu: boolean;
        vCekhargaMu = await CekhargaMu();
        if (vCekhargaMu) {
            // myAlertGlobal2('Jumlah tidak boleh kurang atau sama dengan nol.', 'frmFPB');
            pesan = 'Jumlah tidak boleh kurang atau sama dengan nol.';
            status = false;
            // throw exitCode;
        }

        // await CekBeforePostDetail();
        // ====================
        const response_approval = await axios.get(`${apiUrl}/erp/users_app`, {
            params: {
                entitas: stateDokumen?.kode_entitas, //stateDokumen?.kode_entitas,
                param1: stateDokumen?.userid, //stateDokumen?.userid,
            },
        });
        const responseApp = response_approval.data?.data[0];
        dgDFpb.dataSource.map((item: any) => {
            if (responseApp.fdo_app1 !== 'Y' && responseApp.fdo_app1 !== 'Y') {
                if (item.harga_beli_mu > item.harga_mu) {
                    // myAlertGlobal2('Harga Beli PO lebih besar dari pada Harga beli cabang.', 'frmFPB');
                    pesan = `Harga Beli PO item ${item.diskripsi} lebih besar dari pada Harga beli cabang.`;
                    status = false;
                    // throw exitCode;
                }
            }
            if (item.harga_mu <= 0) {
                // myAlertGlobal2('Harga tidak boleh kurang dari nol', 'frmFPB');
                pesan = `Harga item ${item.diskripsi} tidak boleh kurang dari nol.`;
                status = false;
                // throw exitCode;
            }
            if (item.qty <= 0) {
                // myAlertGlobal2('Kuantitas item tidak boleh kurang / sama dengan nol', 'frmFPB');
                pesan = `Kuantitas item ${item.diskripsi} tidak boleh kurang / sama dengan nol.`;
                status = false;
                // throw exitCode;
            }
            if (item.jumlah_mu <= 0) {
                // myAlertGlobal2('Total Harga tidak boleh kurang dari nol', 'frmFPB');
                pesan = `Total Harga item ${item.diskripsi} tidak boleh kurang dari nol.`;
                status = false;
                // throw exitCode;
            }
            if (item.diskon_mu >= item.jumlah_mu) {
                // myAlertGlobal2(
                //     `Diskon      : ${item.diskon_mu} \n
                //                  Total Harga : ${item.jumlah_mu} \n
                //                  Diskon tidak boleh melebihi Total harga.`,
                //     'frmFPB'
                // );
                pesan = `Diskon      : ${item.diskon_mu} \n
                        Total Harga : ${item.jumlah_mu} \n
                        Diskon tidak boleh melebihi Total harga.`;
                status = false;
                // throw exitCode;
            }
            if (item.potongan_mu >= item.jumlah_mu) {
                // myAlertGlobal2(
                //     `Potongan      : ${item.diskon_mu} \n
                //       Total Harga : ${item.jumlah_mu} \n
                //       Potongan tidak boleh melebihi Total harga.`,
                //     'frmFPB'
                // );
                pesan = `Potongan      : ${item.diskon_mu} \n
                      Total Harga : ${item.jumlah_mu} \n
                      Potongan tidak boleh melebihi Total harga.`;
                status = false;
                // throw exitCode;
            }
            if (item.satuan === '' || item.satuan === null) {
                // myAlertGlobal2('Satuan masih kosong.', 'frmFPB');
                pesan = `Satuan item ${item.diskripsi} masih kosong.`;
                status = false;
                // throw exitCode;
            }
            if (stateDokumen?.CON_FPB === 'harga fpb' && item.qty_std !== item.qty_sisa) {
                // myAlertGlobal2('Item sudah diproses PO data tidak boleh diupdate.', 'frmFPB');
                pesan = `Item ${item.diskripsi} sudah diproses PO, data tidak boleh diupdate.`;
                status = false;
                // throw exitCode;
            }
        });
        //===============================

        let vCekNoBooking: boolean;
        vCekNoBooking = await CekNoBooking();
        if (vCekNoBooking) {
            // myAlertGlobal2('No Booking harus sama.', 'frmFPB');
            pesan = 'No Booking harus sama.';
            status = false;
            // throw exitCode;
        }
        if (stateDokumen?.KirimLangsung === 'Y') {
            if (masterFpb.no_so_cabang === '' || masterFpb.no_so_cabang === null) {
                // myAlertGlobal2('No. SO belum diisi.', 'frmFPB');
                pesan = 'No. SO belum diisi.';
                status = false;
                // throw exitCode;
            }
            if (masterFpb.alamat_kirim_cabang === '' || masterFpb.alamat_kirim_cabang === null) {
                // myAlertGlobal2('Alamat pengiriman belum diisi.', 'frmFPB');
                pesan = 'Alamat pengiriman belum diisi.';
                status = false;
                // throw exitCode;
            }
        }

        if (masterFpb.no_fpb === '' || masterFpb.no_fpb === null) {
            // myAlertGlobal2('Nomor belum diisi.', 'frmFPB');
            pesan = 'Nomor belum diisi.';
            status = false;
            // throw exitCode;
        }

        if (!moment(masterFpb?.tgl_fpb).format('YYYY-MM-DD')) {
            // myAlertGlobal2('Tanggal Dokumen belum diisi.', 'frmFPB');
            pesan = 'Tanggal Dokumen belum diisi.';
            status = false;
            // throw exitCode;
        }

        if (!moment(masterFpb?.tgl_trxfpb).format('YYYY-MM-DD')) {
            // myAlertGlobal2('Tanggal Transaksi belum diisi.', 'frmFPB');
            pesan = 'Tanggal Transaksi belum diisi.';
            status = false;
            // throw exitCode;
        }

        if (masterFpb.nama_relasi === '' || masterFpb.nama_relasi === null) {
            // myAlertGlobal2('Supplier belum diisi.', 'frmFPB');
            pesan = 'Supplier belum diisi.';
            status = false;
            // throw exitCode;
        }

        if (!moment(masterFpb?.tgl_berlaku).format('YYYY-MM-DD')) {
            // myAlertGlobal2('Tanggal Berlaku belum diisi.', 'frmFPB');
            pesan = 'Tanggal Berlaku belum diisi.';
            status = false;
            // throw exitCode;
        }

        if (!moment(masterFpb?.tgl_kirim).format('YYYY-MM-DD')) {
            // myAlertGlobal2('Tanggal Pengiriman belum diisi.', 'frmFPB');
            pesan = 'Tanggal Pengiriman belum diisi.';
            status = false;
            // throw exitCode;
        }

        if (masterFpb.nama_termin === '' || masterFpb.nama_termin === null) {
            // myAlertGlobal2('Kode Termin Pembayaran belum diisi.', 'frmFPB');
            pesan = 'Kode Termin Pembayaran belum diisi.';
            status = false;
            // throw exitCode;
        }

        if (masterFpb.kode_entitas === '' || masterFpb.nama_termin === null) {
            // myAlertGlobal2('Kode Entitas Cabang belum diisi.', 'frmFPB');
            pesan = 'Kode Entitas Cabang belum diisi.';
            status = false;
            // throw exitCode;
        }

        const periode = await FirstDayInPeriod(stateDokumen?.kode_entitas);
        const formatPeriode = moment(periode).format('YYYY-MM-DD');
        const vTglDok = moment(masterFpb.tgl_fpb).format('YYYY-MM-DD');
        const appDateOri = moment().format('YYYY-MM-DD');
        const appDateSubtract = moment().subtract(1, 'day').format('YYYY-MM-DD');

        if (vTglDok < formatPeriode && stateDokumen?.CON_FPB !== 'batal fpb' && stateDokumen?.CON_FPB !== 'harga fpb') {
            // myAlertGlobal2('Tanggal tidak dalam periode akuntansi.', 'frmFPB');
            pesan = 'Tanggal tidak dalam periode akuntansi.';
            status = false;
            // throw exitCode;
        }

        if (vTglDok < formatPeriode) {
            // myAlertGlobal2('Tanggal tidak dalam periode akuntansi.', 'frmFPB');
            pesan = 'Tanggal tidak dalam periode akuntansi.';
            status = false;
            // throw exitCode;
        }

        if (vTglDok < appDateSubtract && stateDokumen?.CON_FPB !== 'batal fpb' && stateDokumen?.CON_FPB !== 'harga fpb') {
            await Swal.fire({
                title: `Tanggal Dokumen lebih kecil dari hari ini, transaksi form pemesanan barang dilanjutkan ? `,
                showCancelButton: true,
                confirmButtonText: 'Ya',
                cancelButtonText: 'Batal',
                target: '#frmFPB',
            }).then((result) => {
                if (!result.isConfirmed) {
                    pesan = '';
                    status = false;
                    // throw exitCode;
                }
            });
        }
        const vTipeSupp = masterFpb.tipe_supp;
        if (vTipeSupp.toLowerCase() === 'grup' && masterFpb.kirim_mu <= 0) {
            await Swal.fire({
                title: `Transaksi antar grup perusahaan tidak ada biaya administrasi pengiriman \n
                Untuk menghitung otomatis gunakan tombol [%] di bawah. \n
                Pilih [Yes] Untuk melanjutkan simpan tanpa biaya administrasi pengiriman, \n
                atau [No] untuk memasukkan kembali data yang tidak lengkap.`,
                showCancelButton: true,
                confirmButtonText: 'Ya',
                cancelButtonText: 'No',
                target: '#frmFPB',
            }).then((result) => {
                if (!result.isConfirmed) {
                    pesan = '';
                    status = false;
                    // throw exitCode;
                }
            });
        }
        const TglDokumenEfektif = moment(masterFpb.tgl_trxfpb).format('YYYY-MM-DD');

        if (stateDokumen?.CON_FPB === 'Approve_Pusat') {
            let Grp = '';
            let Kel = '';
            dgDFpb.dataSource?.map(async (item: any) => {
                if (Grp !== item.grp && Kel !== item.kustom10) {
                    Grp = item.grp;
                    Kel = item.kustom10;
                    const qtyMaksimum = await FetchQtyMaksimum(stateDokumen?.kode_entitas, item.grp, item.kustom10, TglDokumenEfektif, stateDokumen?.token);

                    if (qtyMaksimum[0].q > 0) {
                        if (item.jumlah_rp > qtyMaksimum[0].q) {
                            myAlertGlobal(`Item ${item.diskripsi} melebihi maksimum jumlah pembelian`, 'frmFPB');
                            overBeli = true;
                            pesan = `Item ${item.diskripsi} melebihi maksimum jumlah pembelian`;
                            status = false;
                            // throw exitCode;
                        }
                    }
                }
            });
        }

        let vCekdariPreOrder: boolean; // = await CekhargaPreOrder();
        vCekdariPreOrder = await CekdariPreOrder();
        if (vCekdariPreOrder) {
            masterFpb.approval2 = 'Y';
            masterFpb.tgl_approval2 = moment().format('YYYY-MM-DD HH:mm:ss');
        }

        if (document.getElementById('buApprovalCabang')) {
            masterFpb.approval2 = 'Y';
            masterFpb.tgl_approval2 = moment().format('YYYY-MM-DD HH:mm:ss');
        } else if (document.getElementById('buUnApprovalCabang')) {
            masterFpb.approval2 = 'N';
            masterFpb.tgl_approval2 = moment().format('YYYY-MM-DD HH:mm:ss');
        } else if (document.getElementById('buCorrectionCabang')) {
            masterFpb.approval2 = 'C';
            masterFpb.tgl_approval2 = moment().format('YYYY-MM-DD HH:mm:ss');
        } else if (document.getElementById('buApprovalPusat')) {
            let sAda = 0;
            dgDFpb.dataSource?.map(async (item: any) => {
                if (item.harga_beli_mu === null || item.harga_beli_mu <= 0 || item.no_booking === null || item.no_booking === '') {
                    sAda = 1;
                }

                return sAda;
            });

            if (sAda === 1) {
                // myAlertGlobal2('Harga Beli Supplier atau Kode Booking belum diisi atau Harga Beli Supplier=Nol.', 'frmFPB');
                pesan = 'Harga Beli Supplier atau Kode Booking belum diisi atau Harga Beli Supplier=Nol.';
                status = false;
                // throw exitCode;
            }

            if (masterFpb.status_export === 'Berhasil') {
                // myAlertGlobal2('Export data sudah berhasil.', 'frmFPB');
                pesan = 'Export data sudah berhasil.';
                status = false;
                // throw exitCode;
            } else {
                if (stateDokumen?.tipeFpb === 'Non Kontrak' || stateDokumen?.tipeFpb === 'N') {
                    ExportNonKontrak = true;
                    //ExportNonKontrak
                    // setShowLoader(true);
                }
            }
        } else if (document.getElementById('buUnApprovalPusat')) {
            masterFpb.approval = 'N';
        } else if (document.getElementById('buCorrectionPusat')) {
            masterFpb.approval = 'C';
        } else if (document.getElementById('buCancelFpb')) {
            dgDFpb.dataSource?.map(async (item: any) => {
                return {
                    ...item,
                    qty_batal: item.qty_sisa,
                    qty_sisa: 0,
                };
            });
        }

        return {
            status: status,
            pesan: pesan,
        };
    };

    const [isExporting, setIsExporting] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [displayedProgress, setDisplayedProgress] = useState(0);
    const [progressText, setProgressText] = useState('Memulai proses...');

    useEffect(() => {
        if (progressValue > displayedProgress) {
            // console.log('IF progressValue > displayedProgress', progressValue, displayedProgress);
            const timer = setTimeout(() => {
                // setDisplayedProgress((prev) => Math.min(prev + 1, progressValue));
                setDisplayedProgress((prev) => Math.round((progressValue / 100) * 100));
            }, 20);
            return () => clearTimeout(timer);
        } else if (progressValue < displayedProgress) {
            // console.log('ELSE IF progressValue < displayedProgress', progressValue, displayedProgress);
            setDisplayedProgress(progressValue);
        }
    }, [progressValue, displayedProgress]);

    const exportAntarCabang = async () => {
        // let noDok = stateDokumen?.masterDataState === 'EDIT' ? masterFpb.no_fpb : await generateNU(stateDokumen?.kode_entitas, '', '80', moment().format('YYYYMM'));
        let tipeBookingKosong = false;

        try {
            setIsExporting(true);
            setProgressValue(60);
            setProgressText('Memulai proses Export...');
            // setDisplayedProgress(0);
            // console.log('progressValue 60', progressValue);
            // console.log('displayedProgress 60', displayedProgress);

            dgDFpb.dataSource.forEach((item: any, index: any) => {
                if (item.tipe_booking === '' || item.tipe_booking === null) {
                    tipeBookingKosong = true;
                    return;
                }
            });
            if (!tipeBookingKosong) {
                // console.log('exportAntarCabang');
                let vsNoSoPusat = await generateNUDivisi(stateDokumen?.kode_entitas, '', '01', '10', moment().format('YYYYMM'), moment().format('YYMM') + '01');
                let vsNoPoPusat = await generateNU(stateDokumen?.kode_entitas, '', '02', moment().format('YYYYMM'));
                let vsNoPoCabang = await generateNU(masterFpb.kode_entitas, '', '02', moment().format('YYYYMM'));
                let vsNoPpCabang = await generateNU(masterFpb.kode_entitas, '', '01', moment().format('YYYYMM'));
                const cekDataSoPusat = await cekDataDiDatabase(stateDokumen?.kode_entitas, 'tb_m_so', 'no_so', vsNoSoPusat, stateDokumen?.token);
                const cekDataPoPusat = await cekDataDiDatabase(stateDokumen?.kode_entitas, 'tb_m_sp', 'no_sp', vsNoPoPusat, stateDokumen?.token);
                const cekDataPoCabang = await cekDataDiDatabase(masterFpb.kode_entitas, 'tb_m_sp', 'no_sp', vsNoPoCabang, stateDokumen?.token);
                const cekDataPpCabang = await cekDataDiDatabase(masterFpb.kode_entitas, 'tb_m_pp', 'no_pp', vsNoPpCabang, stateDokumen?.token);

                if (cekDataSoPusat) {
                    // jsonData.no_ttb = defaultNoTtb;
                    await generateNUDivisi(stateDokumen?.kode_entitas, vsNoSoPusat, '01', '10', moment().format('YYYYMM'), moment().format('YYMM') + `01`);
                    const generateNoDok = await generateNUDivisi(stateDokumen?.kode_entitas, '', '01', '10', moment().format('YYYYMM'), moment().format('YYMM') + `01`);
                    sNoSoPusat = generateNoDok;
                } else {
                    sNoSoPusat = vsNoSoPusat;
                }
                if (cekDataPoPusat) {
                    // jsonData.no_ttb = defaultNoTtb;
                    await generateNU(stateDokumen?.kode_entitas, vsNoPoPusat, '02', moment().format('YYYYMM'));
                    const generateNoDok = await generateNU(stateDokumen?.kode_entitas, '', '02', moment().format('YYYYMM'));
                    sNoPoPusat = generateNoDok;
                } else {
                    sNoPoPusat = vsNoPoPusat;
                }
                if (cekDataPoCabang) {
                    // jsonData.no_ttb = defaultNoTtb;
                    await generateNU(masterFpb.kode_entitas, vsNoPoCabang, '02', moment().format('YYYYMM'));
                    const generateNoDok = await generateNU(masterFpb.kode_entitas, '', '02', moment().format('YYYYMM'));
                    sNoPoCabang = generateNoDok;
                } else {
                    sNoPoCabang = vsNoPoCabang;
                }
                if (cekDataPpCabang) {
                    // jsonData.no_ttb = defaultNoTtb;
                    await generateNU(masterFpb.kode_entitas, vsNoPpCabang, '01', moment().format('YYYYMM'));
                    const generateNoDok = await generateNU(masterFpb.kode_entitas, '', '01', moment().format('YYYYMM'));
                    sNoPpCabang = generateNoDok;
                } else {
                    sNoPpCabang = vsNoPpCabang;
                }

                const quCustMapping = await FetchCustomerMapping(stateDokumen?.kode_entitas, masterFpb.kode_entitas, stateDokumen?.token);
                const sKodeDeptPusat = await FetchDepartemen(stateDokumen?.kode_entitas);
                const quCustMappingCabang = await FetchCustomerMapping(stateDokumen?.kode_entitas, masterFpb.kode_entitas, stateDokumen?.token);
                const sKodeDeptCabang = await FetchDepartemen(masterFpb.kode_entitas);
                let approveDate = moment().format('YYYY-MM-DD HH:mm:ss');
                // CEK isOverPlafond Dari BACK END KARENA HARUS GENERATE KODE SO TERLEBIH DAHULU

                let sTotalMUPoPusat = 0;
                let sTotalBeratPoPusat = 0;
                let sTotalMUMbPusat = 0;
                let sTotalBeratMbPusat = 0;

                sTotalMUPoPusat = dgDFpb.dataSource.reduce((total: any, item: any) => {
                    return total + item.qty_std * item.harga_beli_mu;
                }, 0);

                sTotalBeratPoPusat = dgDFpb.dataSource.reduce((total: any, item: any) => {
                    return total + item.qty_std * item.brt;
                }, 0);

                let sNilaiJurnalMb = 0;
                let itemSoPusat = 0;

                // const vDetailFpbPusat = async () => {
                //     const data = await Promise.all(
                //         dgDFpb.dataSource.map((item: any, idSoPusat: any) => {
                //             itemSoPusat++;
                //             return {
                //                 kode_so: '',
                //                 id_so: idSoPusat + 1, //dgDFpb.dataSource[0]?.id_fpb,
                //                 kode_fpb: masterFpb.kode_fpb,
                //                 id_fpb: item.id_fpb,
                //                 kode_item: item.kode_item,
                //                 diskripsi: item.diskripsi,
                //                 satuan: item.satuan,
                //                 qty: item.qty,
                //                 sat_std: item.sat_std,
                //                 qty_std: item.qty_std,
                //                 qty_sisa: item.qty,
                //                 qty_batal: 0,
                //                 qty_sisa_po: item.qty_std,
                //                 kode_mu: item.kode_mu,
                //                 kurs: item.kurs,
                //                 kurs_pajak: item.kurs_pajak,
                //                 harga_mu: item.harga_mu,
                //                 diskon: item.diskon,
                //                 diskon_mu: item.diskon_mu,
                //                 potongan_mu: item.potongan_mu,
                //                 kode_pajak: item.kode_pajak,
                //                 pajak: item.pajak,
                //                 include: item.include,
                //                 pajak_mu: item.pajak_mu,
                //                 jumlah_mu: item.jumlah_mu,
                //                 jumlah_rp: item.jumlah_rp,
                //                 berat: item.berat,
                //                 kode_dept: sKodeDeptPusat[0].dept,
                //                 kode_kerja: null,
                //             };
                //         })
                //     );
                //     return data;
                // };

                const fpbPusatJson = async () => {
                    let sDetailSoPusat = await vDetailSoPusat();
                    const objectFpbPusat = {
                        fpb: {
                            entitas: stateDokumen?.kode_entitas,
                            kode_fpb: stateDokumen?.masterKodeDokumen,
                            no_fpb: masterFpb.no_fpb,
                            tgl_fpb: moment(masterFpb.tgl_fpb).format('YYYY-MM-DD HH:mm:ss'),
                            kode_supp: masterFpb.kode_supp,
                            tgl_berlaku: moment(masterFpb.tgl_berlaku).format('YYYY-MM-DD HH:mm:ss'),
                            tgl_kirim: moment(masterFpb.tgl_kirim).format('YYYY-MM-DD HH:mm:ss'),
                            alamat_kirim: null,
                            via: masterFpb.via,
                            fob: masterFpb.fob,
                            kode_termin: masterFpb.kode_termin,
                            kode_mu: masterFpb.kode_mu,
                            kurs: masterFpb.kurs,
                            kurs_pajak: masterFpb.kurs_pajak,
                            kena_pajak: masterFpb.kena_pajak,
                            total_mu: masterFpb.total_mu,
                            diskon_dok: masterFpb.diskon_dok,
                            diskon_dok_mu: masterFpb.diskon_dok_mu,
                            total_diskon_mu: masterFpb.total_diskon_mu,
                            total_pajak_mu: masterFpb.total_pajak_mu,
                            kirim_mu: masterFpb.kirim_mu,
                            netto_mu: masterFpb.netto_mu,
                            total_rp: masterFpb.total_rp,
                            diskon_dok_rp: masterFpb.diskon_dok_rp,
                            total_diskon_rp: masterFpb.total_diskon_rp,
                            total_pajak_rp: masterFpb.total_pajak_rp,
                            kirim_rp: masterFpb.kirim_rp,
                            netto_rp: masterFpb.netto_rp,
                            total_berat: masterFpb.total_berat,
                            keterangan: masterFpb.keterangan,
                            status: masterFpb.status,
                            userid: stateDokumen?.userid,
                            tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                            approval: masterFpb.approval,
                            tgl_approval: masterFpb.tgl_approval === null || masterFpb.tgl_approval === '' ? null : moment(masterFpb.tgl_approval).format('YYYY-MM-DD HH:mm:ss'),
                            kirim_langsung: stateDokumen?.KirimLangsung, //masterFpb.kirim_langsung,
                            status_kirim: masterFpb.status_kirim,
                            no_sjpabrik: masterFpb.no_sjpabrik,
                            tgl_sjpabrik:
                                (stateDokumen?.masterDataState === 'BARU' ||
                                    stateDokumen?.masterDataState === 'EDIT' ||
                                    stateDokumen?.masterDataState === 'Approve Cabang' ||
                                    stateDokumen?.masterDataState === 'Approve Pusat') &&
                                (masterFpb.tgl_sjpabrik === null || masterFpb.tgl_sjpabrik === '')
                                    ? null
                                    : moment(masterFpb.tgl_sjpabrik).format('YYYY-MM-DD HH:mm:ss'),
                            tgl_sjfax:
                                (stateDokumen?.masterDataState === 'BARU' ||
                                    stateDokumen?.masterDataState === 'EDIT' ||
                                    stateDokumen?.masterDataState === 'Approve Cabang' ||
                                    stateDokumen?.masterDataState === 'Approve Pusat') &&
                                (masterFpb.tgl_sjfax === null || masterFpb.tgl_sjfax === '')
                                    ? null
                                    : moment(masterFpb.tgl_sjfax).format('YYYY-MM-DD HH:mm:ss'),
                            nota: masterFpb.nota,
                            kode_entitas: masterFpb.kode_entitas,
                            kontrak: stateDokumen?.tipeFpb, // === 'Non Kontrak' ? 'N' : 'Y', // masterFpb.kontrak,
                            approval2: masterFpb.approval2,
                            tgl_approval2: masterFpb.tgl_approval2 === null || masterFpb.tgl_approval2 === '' ? null : moment(masterFpb.tgl_approval2).format('YYYY-MM-DD HH:mm:ss'),
                            kirim_langsung_cabang: stateDokumen?.KirimLangsung, //masterFpb.kirim_langsung_cabang,
                            kode_so_cabang: masterFpb.kode_so_cabang,
                            no_so_cabang: masterFpb.no_so_cabang,
                            alamat_kirim_cabang: masterFpb.alamat_kirim_cabang,
                            status_export: masterFpb.status_export,
                            keterangan_pusat: masterFpb.keterangan_pusat,
                            kodecabang: masterFpb.kodecabang,
                            kodegrup: masterFpb.kodegrup,
                            nama_cabang: masterFpb.nama_cabang,

                            tgl_trxfpb: moment(masterFpb.tgl_trxfpb).format('YYYY-MM-DD HH:mm:ss'),
                            kode_termin_pusat: masterFpb.kode_termin_pusat,
                            cara_kirim: masterFpb.cara_kirim,
                            detail: [...dgDFpb.dataSource],
                            audit: {
                                entitas: stateDokumen?.kode_entitas,
                                kode_audit: null,
                                dokumen: 'FPB',
                                kode_dokumen: stateDokumen?.masterKodeDokumen,
                                no_dokumen: masterFpb.no_fpb,
                                tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                                proses: 'EDIT',
                                diskripsi: `FPB item = ${jumlahItem} total berat = ${masterFpb.total_berat} nilai transaksi = ${masterFpb.netto_mu}`,
                                userid: stateDokumen?.userid, // userid login web
                                system_user: '', //username login
                                system_ip: '', //ip address
                                system_mac: '', //mac address
                            },
                        },
                    };
                    let returnObjekFpbPusat = { ...objectFpbPusat };

                    return returnObjekFpbPusat;
                };

                const vDetailSoPusat = async () => {
                    const data = await Promise.all(
                        dgDFpb.dataSource.map((item: any, idSoPusat: any) => {
                            itemSoPusat++;
                            return {
                                kode_so: '',
                                id_so: idSoPusat + 1, //dgDFpb.dataSource[0]?.id_fpb,
                                kode_fpb: masterFpb.kode_fpb,
                                id_fpb: item.id_fpb,
                                kode_item: item.kode_item,
                                diskripsi: item.diskripsi,
                                satuan: item.satuan,
                                qty: item.qty,
                                sat_std: item.sat_std,
                                qty_std: item.qty_std,
                                qty_sisa: item.qty,
                                qty_batal: 0,
                                qty_sisa_po: item.qty_std,
                                kode_mu: item.kode_mu,
                                kurs: item.kurs,
                                kurs_pajak: item.kurs_pajak,
                                harga_mu: item.harga_mu,
                                diskon: item.diskon,
                                diskon_mu: item.diskon_mu,
                                potongan_mu: item.potongan_mu,
                                kode_pajak: item.kode_pajak,
                                pajak: item.pajak,
                                include: item.include,
                                pajak_mu: item.pajak_mu,
                                jumlah_mu: item.jumlah_mu,
                                jumlah_rp: item.jumlah_rp,
                                berat: item.berat,
                                kode_dept: sKodeDeptPusat[0].dept,
                                kode_kerja: null,
                            };
                        })
                    );
                    return data;
                };

                const soPusatJson = async () => {
                    let sDetailSoPusat = await vDetailSoPusat();
                    const objectSoPusat = {
                        so: {
                            kode_so: '',
                            no_so: sNoSoPusat,
                            tgl_so: approveDate, //tglResetTrxDokumen,
                            no_reff: masterFpb.no_fpb,
                            kode_sales: quCustMapping[0].kode_sales,
                            kode_cust: quCustMapping[0].kode_cust,
                            alamat_kirim: quCustMapping[0].alamat_kirim1,
                            via: 'Langsung',
                            fob: 'Dikirim',
                            kode_termin: masterFpb.kode_termin,
                            kode_mu: quCustMapping[0].kode_mu,
                            kurs: quCustMapping[0].kurs,
                            kurs_pajak: quCustMapping[0].kurs_pajak,
                            kena_pajak: 'N',
                            diskon_dok: masterFpb.diskon_dok !== '' ? masterFpb.diskon_dok : null,
                            total_mu: masterFpb.total_mu,
                            diskon_dok_mu: masterFpb.diskon_dok_mu,
                            total_diskon_mu: masterFpb.total_diskon_mu,
                            total_pajak_mu: masterFpb.total_pajak_mu,
                            kirim_mu: masterFpb.kirim_mu,
                            netto_mu: masterFpb.netto_mu,
                            total_rp: masterFpb.total_rp,
                            diskon_dok_rp: masterFpb.diskon_dok_rp,
                            total_diskon_rp: masterFpb.total_diskon_rp,
                            total_pajak_rp: masterFpb.total_pajak_rp,
                            kirim_rp: masterFpb.kirim_rp,
                            netto_rp: masterFpb.netto_rp,
                            total_berat: masterFpb.total_berat,
                            tutup: null,
                            keterangan: 'Dari FPB : ' + masterFpb.no_fpb,
                            status: 'Terbuka',
                            approval: 1,
                            tgl_approval: moment().format('YYYY-MM-DD HH:mm:ss'),
                            userid: stateDokumen?.userid,
                            tgl_update: appDate,
                            tgl_jatuh_tempo: tglDokumenEfektif7Hari,
                            tgl_bpb: moment(appDate).format('YYYY-MM-DD'),
                            tgl_dikirim: moment(masterFpb.tgl_kirim).format('YYYY-MM-DD'),
                            kirim_langsung: 'Y',
                            cara_kirim: 'KP',
                            kode_kirim: quCustMapping[0].kode_kirim,
                            kode_jual: '01',
                            status_kirim: 'N',
                            no_sjpabrik: null,
                            tgl_sjpabrik: null,
                            tgl_sjfax: null,
                            nota: null,
                            detail: [...sDetailSoPusat],
                            audit: {
                                entitas: stateDokumen?.kode_entitas,
                                kode_audit: '',
                                dokumen: 'SO',
                                kode_dokumen: '',
                                no_dokumen: sNoSoPusat,
                                tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                                proses: 'NEW',
                                diskripsi: `Auto SO dan Approval disetujui item =  ${itemSoPusat}  nilai transaksi ${masterFpb.netto_mu.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}`,
                                userid: stateDokumen?.userid, // userid login web
                                system_user: '', //username login
                                system_ip: '', //ip address
                                system_mac: '', //mac address
                            },
                        },
                    };
                    let returnObjekSoPusat = { ...objectSoPusat };
                    return returnObjekSoPusat;
                };

                const cekDataSupp = async () => {
                    const dataSupp = await Promise.all(
                        dgDFpb.dataSource.map(async (item: any, idPoPusat: any) => {
                            if (item.tipe_booking === 'PO') {
                                return {
                                    kode_sp: '',
                                    id_sp: idPoPusat + 1,
                                    kode_pp: '',
                                    id_pp: idPoPusat + 1,
                                    kode_so: '', //Trim(emKodeSO.Lines.Strings[k-1]),//SKODESO,//null,
                                    id_so: idPoPusat + 1,
                                    kode_fpb: masterFpb.kode_fpb,
                                    id_fpb: item.id_fpb,
                                    kode_item: item.kode_item,
                                    diskripsi: item.diskripsi,
                                    satuan: item.satuan,
                                    qty: item.qty,
                                    sat_std: item.sat_std,
                                    qty_std: item.qty_std,
                                    qty_sisa: item.qty_sisa,
                                    qty_batal: item.qty_batal,
                                    kode_mu: item.kode_mu,
                                    kurs: item.kurs,
                                    kurs_pajak: item.kurs_pajak,
                                    harga_mu: item.harga_beli_mu,
                                    diskon: '',
                                    diskon_mu: 0,
                                    potongan_mu: 0,
                                    kode_pajak: 'N',
                                    pajak: 0,
                                    include: 'N',
                                    pajak_mu: 0,
                                    jumlah_mu: item.qty_std * item.harga_beli_mu,
                                    jumlah_rp: item.qty_std * item.harga_beli_mu,
                                    kode_dept: sKodeDeptPusat[0]?.dept,
                                    kode_kerja: null,
                                    kontrak: stateDokumen === 'Non Kontrak' || stateDokumen === 'N' ? 'N' : 'Y',
                                    kodegrup: masterFpb.kodegrup,
                                    kodecabang: masterFpb.kodecabang,
                                    kodepemilik: masterFpb.kode_entitas,
                                    harga_cabang: item.harga_mu,
                                    kode_supp: item.kode_booking,
                                };
                            }
                        })
                    );

                    return dataSupp;
                };

                let itemPoPusat = 0;
                // console.log('dgDFpb.dataSource ccccc', dgDFpb.dataSource);
                const vDetailPoPusat = async () => {
                    const data = await Promise.all(
                        dgDFpb.dataSource.map(async (item: any, idPoPusat: any) => {
                            if (item.tipe_booking === 'PO') {
                                // const response = await axios.get(`${apiUrl}/erp/get_item_pusat`, {
                                //     params: {
                                //         entitas: masterFpb.kode_entitas,
                                //         param1: item.no_item,
                                //     },
                                //     headers: {
                                //         Authorization: `Bearer ${stateDokumen?.token}`,
                                //     },
                                // });
                                // let vItemCabang = response.data.data;
                                itemPoPusat++;
                                return {
                                    kode_sp: '',
                                    id_sp: idPoPusat + 1,
                                    kode_pp: '',
                                    id_pp: idPoPusat + 1,
                                    kode_so: '', //Trim(emKodeSO.Lines.Strings[k-1]),//SKODESO,//null,
                                    id_so: idPoPusat + 1,
                                    kode_fpb: masterFpb.kode_fpb,
                                    id_fpb: item.id_fpb,
                                    kode_item: item.kode_item,
                                    diskripsi: item.diskripsi,
                                    satuan: item.satuan,
                                    qty: item.qty,
                                    sat_std: item.sat_std,
                                    qty_std: item.qty_std,
                                    qty_sisa: item.qty_sisa,
                                    qty_batal: item.qty_batal,
                                    kode_mu: item.kode_mu,
                                    kurs: item.kurs,
                                    kurs_pajak: item.kurs_pajak,
                                    harga_mu: item.harga_beli_mu,
                                    diskon: '',
                                    diskon_mu: 0,
                                    potongan_mu: 0,
                                    kode_pajak: 'N',
                                    pajak: 0,
                                    include: 'N',
                                    pajak_mu: 0,
                                    jumlah_mu: item.qty_std * item.harga_beli_mu,
                                    jumlah_rp: item.qty_std * item.harga_beli_mu,
                                    kode_dept: sKodeDeptPusat[0]?.dept,
                                    kode_kerja: null,
                                    kontrak: stateDokumen === 'Non Kontrak' || stateDokumen === 'N' ? 'N' : 'Y',
                                    kodegrup: masterFpb.kodegrup,
                                    kodecabang: masterFpb.kodecabang,
                                    kodepemilik: masterFpb.kode_entitas,
                                    harga_cabang: item.harga_mu,
                                };
                            }
                        })
                    );

                    return data;
                };
                const poPusatJson = async () => {
                    let getsuppByKode: any;
                    const response = await axios.get(`${apiUrl}/erp/get_supp_by_kode`, {
                        params: {
                            entitas: masterFpb.kode_entitas,
                            param1: kodeSuppBooking,
                        },
                        headers: {
                            Authorization: `Bearer ${stateDokumen?.token}`,
                        },
                    });

                    getsuppByKode = response.data.data;
                    let sDetailPoPusat = await vDetailPoPusat();
                    const objectPoPusat = {
                        po: {
                            kode_sp: '',
                            no_sp: sNoPoPusat,
                            tgl_sp: approveDate, //tglResetTrxDokumen,
                            kode_supp: kodeSuppBooking, //Trim(emKodeSupp.Lines.Strings[i]),
                            tgl_berlaku: masterFpb.tgl_berlaku,
                            tgl_kirim: masterFpb.tgl_kirim,
                            alamat_kirim: masterFpb.alamat_kirim,
                            via: masterFpb.via,
                            fob: masterFpb.fob,
                            kode_termin: masterFpb.kode_termin_pusat, //masterFpb.kode_termin_pusat, //quSupp.FieldValues['kode_termin'],//masterFpb.kode_termin,
                            kode_mu: masterFpb.kode_mu,
                            kurs: masterFpb.kurs,
                            kurs_pajak: masterFpb.kurs_pajak,
                            kena_pajak: masterFpb.kena_pajak,
                            total_mu: sTotalMUPoPusat,
                            diskon_dok: null,
                            diskon_dok_mu: 0,
                            total_diskon_mu: 0,
                            total_pajak_mu: 0,
                            kirim_mu: 0,
                            netto_mu: sTotalMUPoPusat,
                            total_rp: sTotalMUPoPusat,
                            diskon_dok_rp: 0,
                            total_diskon_rp: 0,
                            total_pajak_rp: 0,
                            kirim_rp: 0,
                            netto_rp: sTotalMUPoPusat,
                            total_berat: sTotalBeratPoPusat,
                            // keterangan: '[No FPB : ' + masterFpb.no_fpb + '] ' + masterFpb.keterangan || '', // emKetPusat.Text,
                            // keterangan: '[No FPB : ' + noDok + '] ' + masterFpb.keterangan || '', // emKetPusat.Text,
                            keterangan: `[No FPB : ${masterFpb.no_fpb}]  ${masterFpb.keterangan === null || '' || undefined ? '' : masterFpb.keterangan}`,
                            status: 'Terbuka',
                            userid: stateDokumen?.userid,
                            tgl_update: appDate,
                            approval: 'Y',
                            tgl_approval: moment().format('YYYY-MM-DD HH:mm:ss'),
                            kirim_langsung: 'Y',
                            status_kirim: 'N',
                            no_sjpabrik: null,
                            tgl_sjpabrik: null,
                            tgl_sjfax: null,
                            nota: null,
                            detail: [...sDetailPoPusat],
                            audit: {
                                entitas: stateDokumen?.kode_entitas,
                                kode_audit: '',
                                dokumen: 'SP',
                                kode_dokumen: '',
                                no_dokumen: sNoPoPusat,
                                tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                                proses: 'NEW',
                                diskripsi: `Auto PO dan Approval disetujui item =  ${itemPoPusat}  total berat ${sTotalBeratPoPusat} nilai transaksi ${sTotalMUPoPusat.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}`,
                                userid: stateDokumen?.userid, // userid login web
                                system_user: '', //username login
                                system_ip: '', //ip address
                                system_mac: '', //mac address
                            },
                        },
                    };
                    let returnObjekPoPusat = { ...objectPoPusat };
                    return returnObjekPoPusat;
                };

                let itemPpBeli = 0;
                const vDetailPpCabangBeli = async () => {
                    const tglDokumenEfektifPp7Hari = moment(masterFpb.tgl_trxfpb).subtract(7, 'day').format('YYYY-MM-DD');
                    // Menggunakan Promise.all untuk menunggu semua request selesai
                    const data = await Promise.all(
                        dgDFpb.dataSource.map(async (item: any, idPp: any) => {
                            const response = await axios.get(`${apiUrl}/erp/get_item_pusat`, {
                                params: {
                                    entitas: masterFpb.kode_entitas,
                                    param1: item.no_item,
                                },
                                headers: {
                                    Authorization: `Bearer ${stateDokumen?.token}`,
                                },
                            });
                            let vItemCabang = response.data.data;
                            itemPpBeli++;
                            return {
                                kode_pp: '',
                                id_pp: idPp + 1,
                                id: idPp + 1,
                                id_ket: idPp + 1,
                                stok: 'Y',
                                kode_item: vItemCabang[0].kode_item,
                                diskripsi: vItemCabang[0].nama_item,
                                satuan: item.satuan,
                                qty: item.qty,
                                sat_std: item.sat_std,
                                qty_std: item.qty_std,
                                qty_sisa: item.qty,
                                qty_batal: 0,
                                tgl_butuh: tglDokumenEfektifPp7Hari,
                            };
                        })
                    );

                    return data;
                };
                const ppJson = async () => {
                    if (masterFpb.kirim_langsung_cabang === 'N') {
                        const getEntUser: any = await GetEntitasUser(stateDokumen?.kode_entitas, stateDokumen?.userid, stateDokumen?.token);
                        const getSuppMapping: any = await GetSuppMapping(stateDokumen?.kode_entitas, getEntUser[0].kode_entitas, stateDokumen?.token);

                        const formatTglFpb = moment(masterFpb.tgl_fpb).format('YYYY-MM-DD HH:mm:ss');
                        let TglDokumenEfektifBeli = await ResetTime2(stateDokumen?.kode_entitas, formatTglFpb);
                        let sDetailPpCabang = await vDetailPpCabangBeli();
                        const objectPp = {
                            pp: {
                                kode_pp: '',
                                no_pp: sNoPpCabang,
                                tgl_pp: approveDate, //TglDokumenEfektifBeli,
                                dokumen: 'Persediaan',
                                peminta: stateDokumen?.userid,
                                kode_dept: getSuppMapping[0].kode_dept_pembelian_cabang,
                                keterangan: 'Dari FPB : ' + masterFpb.no_fpb,
                                status: 'Terbuka',
                                userid: stateDokumen?.userid,
                                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                                approval: 'Y',
                                tgl_approval: moment().format('YYYY-MM-DD HH:mm:ss'),
                                detail: [...sDetailPpCabang],
                                audit: {
                                    entitas: masterFpb.kode_entitas,
                                    kode_audit: '',
                                    dokumen: 'PP',
                                    kode_dokumen: '',
                                    no_dokumen: sNoPpCabang,
                                    tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                                    proses: 'NEW',
                                    diskripsi: `Auto PP dan Approval disetujui item =  ${itemPpBeli}  total berat ${masterFpb.total_berat.toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}`,
                                    userid: stateDokumen?.userid, // userid login web
                                    system_user: '', //username login
                                    system_ip: '', //ip address
                                    system_mac: '', //mac address
                                },
                            },
                        };
                        let returnObjekPp = { ...objectPp };
                        return returnObjekPp;
                    } else {
                        return null;
                    }
                };

                let itemPoBeli = 0;
                const vDetailPoCabangBeli = async () => {
                    const data = await Promise.all(
                        dgDFpb.dataSource.map(async (item: any, idPoCabang: any) => {
                            if (item.tipe_booking === 'PO') {
                                const response = await axios.get(`${apiUrl}/erp/get_item_pusat`, {
                                    params: {
                                        entitas: masterFpb.kode_entitas,
                                        param1: item.no_item,
                                    },
                                    headers: {
                                        Authorization: `Bearer ${stateDokumen?.token}`,
                                    },
                                });
                                let vItemCabang = response.data.data;
                                // countPoCabang = countPoCabang++;
                                itemPoBeli++;
                                return {
                                    kode_sp: '',
                                    id_sp: idPoCabang + 1,
                                    kode_pp: masterFpb.kirim_langsung_cabang === 'Y' ? null : 'otomatis',
                                    id_pp: masterFpb.kirim_langsung_cabang === 'Y' ? 0 : idPoCabang + 1, //: 0,
                                    kode_so: masterFpb.kirim_langsung_cabang === 'Y' ? masterFpb.kode_so_cabang : 0,
                                    // id_so: masterFpb.kirim_langsung_cabang === 'Y' ? 0 : idPoCabang + 1, //: 0,
                                    // id_so: masterFpb.kirim_langsung_cabang === 'Y' ? idPoCabang + 1 : 0, //: 0, perubahan 31-05-2025
                                    id_so: masterFpb.kirim_langsung_cabang === 'Y' ? item.id_so : 0,
                                    kode_fpb: masterFpb.kode_fpb,
                                    id_fpb: item.id_fpb,
                                    kode_item: vItemCabang[0].kode_item,
                                    diskripsi: vItemCabang[0].nama_item,
                                    satuan: item.satuan,
                                    qty: item.qty,
                                    sat_std: item.sat_std,
                                    qty_std: item.qty_std,
                                    qty_sisa: item.qty_sisa,
                                    qty_batal: item.qty_batal,
                                    kode_mu: item.kode_mu,
                                    kurs: item.kurs,
                                    kurs_pajak: item.kurs_pajak,
                                    harga_mu: item.harga_mu, //item.harga_beli_mu,
                                    diskon: '',
                                    diskon_mu: 0,
                                    potongan_mu: 0,
                                    kode_pajak: 'N',
                                    pajak: 0,
                                    include: 'N',
                                    pajak_mu: 0,
                                    jumlah_mu: item.qty_std * item.harga_mu, //item.harga_beli_mu,
                                    jumlah_rp: item.qty_std * item.harga_mu, //item.harga_beli_mu,
                                    kode_dept: sKodeDeptCabang[0]?.dept,
                                    kode_kerja: null,
                                    kontrak: stateDokumen === 'Non Kontrak' || stateDokumen === 'N' ? 'N' : 'Y',
                                    kodegrup: masterFpb.kodegrup,
                                    kodecabang: masterFpb.kodecabang,
                                    kodepemilik: masterFpb.kode_entitas,
                                    harga_cabang: null,
                                    //UPDATE TB_D_PREORDER
                                    entitas_tb_d_preorder: masterFpb.kode_entitas,
                                    kode_preorder_tb_d_preorder: item.kode_preorder,
                                    id_preorde_tb_d_preorderr: item.id_preorder,
                                    qty_sisa_tb_d_preorder: item.qty_std,
                                };
                            }
                        })
                    );

                    return data;
                };
                const poCabangBeliJson = async () => {
                    const response = await axios.get(`${apiUrl}/erp/termin_by_where`, {
                        params: {
                            entitas: masterFpb.kode_entitas,
                            param1: `WHERE nama_termin="${masterFpb.nama_termin}"`,
                        },
                        // headers: {
                        //     Authorization: `Bearer ${stateDokumen?.token}`,
                        // },
                    });

                    let getTerminCabang = response.data.data;
                    const sDetailPoCabangBeli = await vDetailPoCabangBeli();
                    // let ket =
                    const objectPoCabang = {
                        po: {
                            kode_sp: '',
                            no_sp: sNoPoCabang,
                            tgl_sp: approveDate, //tglResetTrxDokumen,
                            kode_supp: quCustMappingCabang[0].kode_supp_cabang, //Trim(emKodeSupp.Lines.Strings[i]),
                            tgl_berlaku: masterFpb.tgl_berlaku,
                            tgl_kirim: masterFpb.tgl_kirim,
                            alamat_kirim: masterFpb.alamat_kirim,
                            via: masterFpb.via,
                            fob: masterFpb.fob,
                            kode_termin: getTerminCabang[0]?.kode_termin, //quSupp.FieldValues['kode_termin'],//masterFpb.kode_termin,
                            kode_mu: masterFpb.kode_mu,
                            kurs: masterFpb.kurs,
                            kurs_pajak: masterFpb.kurs_pajak,
                            kena_pajak: masterFpb.kena_pajak,
                            total_mu: masterFpb.total_mu, //sTotalMUPoPusat,
                            diskon_dok: masterFpb.diskon_dok !== '' ? masterFpb.diskon_dok : null,
                            diskon_dok_mu: masterFpb.diskon_dok_mu,
                            total_diskon_mu: masterFpb.total_diskon_mu,
                            total_pajak_mu: masterFpb.total_pajak_mu,
                            kirim_mu: masterFpb.kirim_mu,
                            netto_mu: masterFpb.netto_mu,
                            total_rp: masterFpb.total_rp,
                            diskon_dok_rp: masterFpb.diskon_dok_rp,
                            total_diskon_rp: masterFpb.total_diskon_rp,
                            total_pajak_rp: masterFpb.total_pajak_rp,
                            kirim_rp: masterFpb.kirim_rp,
                            netto_rp: masterFpb.netto_rp,
                            total_berat: masterFpb.total_berat, //sTotalBeratPoPusat,
                            keterangan: `[No FPB : ${masterFpb.no_fpb}]  ${masterFpb.keterangan === null || '' || undefined ? '' : masterFpb.keterangan}`, // emKetPusat.Text,
                            // keterangan: '[No FPB : ' + noDok + '] ' + masterFpb.keterangan || '', // emKetPusat.Text,

                            status: 'Terbuka',
                            userid: stateDokumen?.userid,
                            tgl_update: appDate,
                            approval: 'Y',
                            tgl_approval: moment().format('YYYY-MM-DD HH:mm:ss'),
                            kirim_langsung: masterFpb.kirim_langsung_cabang,
                            status_kirim: 'N',
                            no_sjpabrik: null,
                            tgl_sjpabrik: null,
                            tgl_sjfax: null,
                            nota: null,
                            detail: [...sDetailPoCabangBeli],
                            audit: {
                                entitas: masterFpb.kode_entitas,
                                kode_audit: '',
                                dokumen: 'SP',
                                kode_dokumen: '',
                                no_dokumen: sNoPoCabang,
                                tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                                proses: 'NEW',
                                diskripsi: `Auto PO dan Approval disetujui item =  ${itemPoBeli}  total berat ${masterFpb.total_berat} nilai transaksi ${masterFpb.netto_mu.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}`,
                                userid: stateDokumen?.userid, // userid login web
                                system_user: '', //username login
                                system_ip: '', //ip address
                                system_mac: '', //mac address
                            },
                        },
                    };
                    let returnObjekPoCabang = { ...objectPoCabang };
                    return returnObjekPoCabang;
                };

                const mbJson = async () => {
                    let ada = 0;
                    // console.log('dgDFpb.dataSource ', dgDFpb.dataSource);
                    const data = await Promise.all(
                        dgDFpb.dataSource.map(async (item: any, idMb: any) => {
                            if (item.tipe_booking === 'ST') {
                                let sNoMbPusat = await generateNU(stateDokumen?.kode_entitas, '', '23', moment().format('YYYYMM'));
                                let nilaiHpp: any;
                                let vkodeAkun: any;
                                // countSt = countSt++;
                                const vTgl = moment().format('YYYY-MM-DD HH:mm:ss');

                                const response = await axios.get(`${apiUrl}/erp/hpp_sj?`, {
                                    params: {
                                        entitas: stateDokumen?.kode_entitas,
                                        param1: item.kode_item,
                                        param2: vTgl, // moment(tglDokumen).format('YYYY-MM-DD HH:mm:ss'),
                                        param3: item.kode_booking,
                                    },
                                });

                                const responseData = response.data.data;
                                nilaiHpp = responseData.hpp;
                                const qty_std_number = await qty2QtyStd(stateDokumen?.kode_entitas, item.kode_item, item.satuan, item.sat_std, item.qty);

                                let responseCekGudang = await axios.get(`${apiUrl}/erp/id_master_gudang?`, {
                                    params: {
                                        entitas: stateDokumen?.kode_entitas,
                                        kode_gudang: item.kode_booking, //'GD0000000002', //item.kode_booking,
                                    },
                                });
                                const namaGudang = responseCekGudang.data.data[0].nama_gudang;

                                const responseKodeAkun = await axios.get(`${apiUrl}/erp/get_item_pusat`, {
                                    params: {
                                        entitas: stateDokumen?.kode_entitas,
                                        param1: item.no_item,
                                    },
                                    headers: {
                                        Authorization: `Bearer ${stateDokumen?.token}`,
                                    },
                                });
                                vkodeAkun = responseKodeAkun.data.data;

                                sTotalMUMbPusat = sTotalMUMbPusat + qty_std_number + nilaiHpp;
                                sTotalBeratMbPusat = sTotalBeratMbPusat + item.qty_std * item.brt;
                                sNilaiJurnalMb = sNilaiJurnalMb + qty_std_number * nilaiHpp;

                                let tglResetDokumen: any;
                                await ResetTime2(stateDokumen?.kode_entitas, masterFpb.tgl_berlaku).then((result) => {
                                    tglResetDokumen = result;
                                });

                                const objectMB = {
                                    mb: {
                                        kode_mb: '',
                                        no_mb: sNoMbPusat,
                                        tgl_mb: approveDate, //tglResetDokumen,
                                        tgl_valuta: tglResetDokumen,
                                        kode_gudang: item.kode_booking,
                                        kode_tujuan: quCustMapping[0].kode_gudang,
                                        netto_rp: sTotalMUMbPusat,
                                        total_berat: sTotalBeratMbPusat,
                                        keterangan: '[No FPB : ' + masterFpb.no_fpb + ']',
                                        status: 'Terbuka',
                                        userid: stateDokumen?.userid,
                                        tgl_update: appDate,
                                        persediaan: 'Persediaan',
                                        no_reff: masterFpb.no_fpb,
                                        kode_supp: item.kode_booking,
                                        kode_cust: quCustMapping[0].kode_cust,
                                        nopol: '-',
                                        via: null,
                                        alamat_kirim: quCustMapping[0].alamat_kirim1,
                                        kontrak: 'N',
                                        detail: [
                                            {
                                                kode_mb: '',
                                                id_mb: idMb + 1,
                                                kode_pmb: null,
                                                id_pmb: 0,
                                                kode_item: item.kode_item,
                                                satuan: item.satuan,
                                                qty: item.qty,
                                                sat_std: item.sat_std,
                                                qty_std: qty_std_number,
                                                harga_rp: nilaiHpp,
                                                hpp: nilaiHpp,
                                                jumlah_rp: qty_std_number * nilaiHpp,
                                                berat: item.berat,
                                                no_kontrak: null,
                                            },
                                        ],
                                        jurnal: [
                                            {
                                                kode_dokumen: '',
                                                id_dokumen: 1,
                                                dokumen: 'MB',
                                                tgl_dokumen: moment(masterFpb.tgl_berlaku).format('YYYY-MM-DD HH:mm:ss'),
                                                kode_akun: vkodeAkun,
                                                kode_subledger: null,
                                                kurs: 1,
                                                debet_rp: sNilaiJurnalMb,
                                                kredit_rp: 0,
                                                jumlah_rp: sNilaiJurnalMb,
                                                jumlah_mu: sNilaiJurnalMb / 1,
                                                catatan: `Mutasi barang dari gudang ${namaGudang}`,
                                                no_warkat: null,
                                                tgl_valuta: null,
                                                persen: 0,
                                                kode_dept: null,
                                                kode_kerja: null,
                                                approval: 'N',
                                                posting: 'N',
                                                rekonsiliasi: 'N',
                                                tgl_rekonsil: null,
                                                userid: stateDokumen?.userid,
                                                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                                            },
                                            {
                                                kode_dokumen: '',
                                                id_dokumen: 2,
                                                dokumen: 'MB',
                                                tgl_dokumen: moment(masterFpb.tgl_berlaku).format('YYYY-MM-DD HH:mm:ss'),
                                                kode_akun: vkodeAkun,
                                                kode_subledger: null,
                                                kurs: 1,
                                                debet_rp: 0,
                                                kredit_rp: sNilaiJurnalMb,
                                                jumlah_rp: -1 * sNilaiJurnalMb,
                                                jumlah_mu: -1 * (sNilaiJurnalMb / 1),
                                                catatan: `Mutasi barang ke gudang ${namaGudang}`,
                                                no_warkat: null,
                                                tgl_valuta: null,
                                                persen: 0,
                                                kode_dept: null,
                                                kode_kerja: null,
                                                approval: 'N',
                                                posting: 'N',
                                                rekonsiliasi: 'N',
                                                tgl_rekonsil: null,
                                                userid: stateDokumen?.userid,
                                                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                                            },
                                        ],
                                        audit: {
                                            entitas: masterFpb.kode_entitas,
                                            kode_audit: '',
                                            dokumen: 'MB',
                                            kode_dokumen: '',
                                            no_dokumen: sNoMbPusat,
                                            tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                                            proses: 'NEW',
                                            diskripsi: `Auto MB item =  ${idMb}  nilai transaksi ${sTotalMUMbPusat.toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}`,
                                            userid: stateDokumen?.userid, // userid login web
                                            system_user: '', //username login
                                            system_ip: '', //ip address
                                            system_mac: '', //mac address
                                        },
                                    },
                                };
                                ada += idMb;

                                let returnObjectMB = { ...objectMB };
                                return returnObjectMB;
                            }
                        })
                    );

                    if (ada < 1) {
                        return null;
                    } else {
                        return data;
                    }
                };

                setProgressValue(65);
                setProgressText('Memproses JSON SO Pusat...');
                // console.log('progressValue 65', progressValue);
                // console.log('displayedProgress 65', displayedProgress);
                const vFpbPusatJson = await fpbPusatJson();

                const vSoPusatJson = await soPusatJson();

                setProgressValue(70);
                setProgressText('Memproses JSON PO Pusat...');
                // console.log('progressValue 70', progressValue);
                // console.log('displayedProgress 70', displayedProgress);
                const vPoPusatJson = await poPusatJson();

                // setProgressValue(60);
                // setProgressText('Memproses JSON Mutasi Barang...');
                const vmbJson = (await mbJson()) ?? null;

                let vPPJson = null;
                let vpoCabangBeliJson = null;

                if (vmbJson !== null) {
                    setProgressValue(75);
                    setProgressText('Memproses JSON Mutasi Barang...');

                    setProgressValue(80);
                    setProgressText('Memproses JSON Permintaan Pembelian...');
                    vPPJson = await ppJson();

                    setProgressValue(85);
                    setProgressText('Memproses JSON PO Cabang...');
                    vpoCabangBeliJson = await poCabangBeliJson();
                } else {
                    // Skip MB progress step
                    setProgressValue(75);
                    setProgressText('Memproses JSON Permintaan Pembelian...');
                    // console.log('progressValue 75', progressValue);
                    // console.log('displayedProgress 75', displayedProgress);
                    vPPJson = await ppJson();

                    setProgressValue(80);
                    setProgressText('Memproses JSON PO Cabang...');
                    // console.log('progressValue 80', progressValue);
                    // console.log('displayedProgress 80', displayedProgress);
                    vpoCabangBeliJson = await poCabangBeliJson();
                }

                // setProgressValue(80);
                // setProgressText('Memproses JSON Permintaan Pembelian...');
                // const vPPJson = await ppJson();

                // setProgressValue(90);
                // setProgressText('Memproses JSON PO Cabang...');
                // const vpoCabangBeliJson = await poCabangBeliJson();
                //// const sDetailPoCabangBeli = await vDetailPoCabangBeli();

                setProgressValue(85);
                setProgressText('Menyelesaikan proses export...');
                // console.log('progressValue 85', progressValue);
                // console.log('displayedProgress 85', displayedProgress);
                const jsonOtomatisFpb = {
                    kode_fpb: stateDokumen?.masterKodeDokumen,
                    entitas: stateDokumen?.kode_entitas,
                    token: tokenRedis,
                    pusat: {
                        ...vFpbPusatJson,
                        ...vSoPusatJson,
                        ...vPoPusatJson,
                        ...vmbJson,
                    },
                    entitas_pembeli: masterFpb.kode_entitas,
                    pembeli: {
                        ...vPPJson,
                        ...vpoCabangBeliJson,
                    },
                };
                console.log('jsonOtomatisFpb ', jsonOtomatisFpb);

                return jsonOtomatisFpb;
                // setDataExportOtomatis({ nodes: combinedArray });
            } else {
                myAlertGlobal2('Silahkan isi Tipe Booking', 'frmFPB');
                throw exitCode;
            }
        } catch (error) {
            throw error;
        } finally {
            // Add slight delay before hiding progress
            setTimeout(() => {
                // setIsExporting(false);
                // setProgressValue(0);
                // setDisplayedProgress(0);
                // setProgressText('');
            }, 500);
        }
    };

    const [tipeRequest, setTipeRequest] = useState('');
    const actionBeginGridDetail = (args: any) => {
        setTipeRequest(args.requestType);
    };

    const handleDetailChange = async (args: any) => {
        // Pastikan args memiliki data yang diperlukan
        if (!args.rowData) return;

        // Daftar field yang mempengaruhi kalkulasi
        const calculationFields = ['qty', 'harga_mu', 'diskon_mu', 'potongan_mu', 'pajak_mu', 'jumlah_mu', 'kurs', 'kurs_pajak'];

        // Cek apakah ada perubahan pada field yang mempengaruhi kalkulasi
        const changedField = args.columnName;
        if (changedField && calculationFields.includes(changedField)) {
            await kalkulasi();
            await Recalc();
            dgDFpb.refresh();
        }
    };

    // Handler untuk perubahan data grid
    const handleGridChange = async (args: any) => {
        setTipeRequest(args.requestType);
        switch (args.requestType) {
            case 'save':
                const editedData = args.data;
                dgDFpb.dataSource[args.rowIndex] = editedData;
                // Kalkulasi hanya dijalankan jika ada perubahan pada field yang relevan
                const hasRelevantChanges = Object.keys(editedData).some((key) => ['qty', 'harga_mu', 'diskon_mu', 'potongan_mu', 'pajak_mu', 'jumlah_mu'].includes(key));
                if (hasRelevantChanges) {
                    await handleDetailChange(args);
                }
                break;

            case 'delete':
                dgDFpb.dataSource.forEach((item: any, index: any) => {
                    item.id = index + 1;
                });
                await kalkulasi();
                await Recalc();
                break;

            // Handle kasus lain jika diperlukan
            default:
                break;
        }
    };

    // Gunakan event cellEdit atau valueChange untuk menangkap perubahan per-cell
    const handleCellEdit = (args: any) => {
        if (args.columnName && args.value !== undefined) {
            handleDetailChange({
                field: args.columnName,
                rowIndex: args.rowIndex,
                value: args.value,
            });
        }
    };

    // const saveDoc = async (event: FormEvent<HTMLFormElement>) => {

    const batalUnApprovedKoreksi = async (jenis: any) => {
        // console.log('jenis batalUnApprovedKoreksi', jenis);
        let responseAPI: any;

        const reqBody = {
            entitas: stateDokumen?.kode_entitas,
            proses: jenis,
            kode_fpb: stateDokumen?.masterKodeDokumen,
            // tgl_approval2: jenis === 'buUnApproval2' || jenis === 'buCorrection2' ? moment().format('YYYY-MM-DD HH:mm:ss') : null,
            // approval: jenis === 'buUnApproval' ? 'N' : jenis === 'buCorrection' ? 'C' : null,
            // detail:
            //     jenis === 'buCancelFpb'
            //-         ? dgDFpb.dataSource.map((item: any) => ({
            //               qty_batal: item.qty,
            //           }))
            //         : [],
        };
        // console.log('reqBody', reqBody);

        await axios
            .post(`${apiUrl}/erp/flagging_approval_fpb`, reqBody, {
                headers: {
                    Authorization: `Bearer ${stateDokumen?.token}`,
                },
            })
            .then((result) => {
                responseAPI = result.data;
                //  setProgressValue(50);
                // console.log('progressValue 50', progressValue);
                // console.log('displayedProgress 50', displayedProgress);
            })
            .catch((e: any) => {
                responseAPI = e.response.data;
            });

        if (responseAPI.status === true) {
            let AuditProc: any;
            let AuditDesc: any;
            let jumlahItem = dgDFpb.dataSource.length;

            if (stateDokumen?.CON_FPB === 'batal fpb') {
                AuditProc = 'CANCEL';
            }

            if (jenis === 'buCorrection') {
                AuditDesc = 'APPROVAL DIKOREKSI';
            } else if (jenis === 'buUnApproval') {
                AuditDesc = 'APPROVAL DITOLAK';
            }

            const auditResponse = await axios.post(`${apiUrl}/erp/simpan_audit`, {
                entitas: stateDokumen?.kode_entitas,
                kode_audit: null,
                dokumen: 'FPB',
                kode_dokumen: stateDokumen?.masterKodeDokumen,
                no_dokumen: masterFpb.no_fpb,
                tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                proses: AuditProc,
                diskripsi: `${AuditDesc} item = ${jumlahItem} total berat = ${masterFpb.total_berat} nilai transaksi = ${masterFpb.netto_mu}`,
                userid: stateDokumen?.userid, // userid login web
                system_user: '', //username login
                system_ip: '', //ip address
                system_mac: '', //mac address
            });

            myAlertGlobal2(`Dokumen berhasil diproses ${jenis}`, 'frmFPB').then((result) => {
                if (result.isConfirmed) {
                    setTimeout(() => {
                        closeDialog();
                        // onRefresh();
                    }, 1000);
                }
            });
        } else {
            myAlertGlobal2(`Dokumen gagal diproses ${jenis}`, 'frmFPB').then((result) => {
                if (result.isConfirmed) {
                    setTimeout(() => {
                        closeDialog();
                        // onRefresh();
                    }, 1000);
                }
            });
        }
    };
    let jumlahItem: 0;

    const saveDoc = async () => {
        let responseAPI: any;
        let responseAPIApprovalPusat: any;
        let tesCoba = true;
        try {
            setDisabledSimpan(true);
            // setShowLoader(true);
            // setShowLoader(true);
            setIsExporting(true);
            setProgressValue(10);
            setProgressText('Memulai proses simpan dokumen...');
            // console.log('progressValue 10', progressValue);
            // console.log('displayedProgress 10', displayedProgress);
            const vCekValidasi = await cekValidasi();
            // cekValidasi().then((result: any) => {
            //     console.log('result validasi', result);
            // });
            // console.log('vCekValidasi ', vCekValidasi);
            if (!vCekValidasi.status) {
                myAlertGlobal2(vCekValidasi.pesan, 'frmFPB');
                // myAlertGlobal2('Data belum dapat disimpan, cek data terlebih dahulu', 'frmFPB');
            } else {
                // console.log('validasi ok');
                setProgressValue(20);
                setProgressText('Mempersiapkan data...');
                // console.log('progressValue 20', progressValue);
                // console.log('displayedProgress 20', displayedProgress);

                // let jumlahItem: any;
                let noDok =
                    stateDokumen?.masterDataState === 'EDIT' || stateDokumen?.CON_FPB === 'Approve_Pusat' || stateDokumen?.CON_FPB === 'Approve_Cabang'
                        ? masterFpb.no_fpb
                        : await generateNU(stateDokumen?.kode_entitas, '', '80', moment().format('YYYYMM'));

                const reqBody = {
                    entitas: stateDokumen?.kode_entitas,
                    kode_fpb: stateDokumen?.masterKodeDokumen !== 'BARU' ? stateDokumen?.masterKodeDokumen : '',
                    no_fpb: noDok,
                    tgl_fpb: moment(masterFpb.tgl_fpb).format('YYYY-MM-DD HH:mm:ss'),
                    kode_supp: masterFpb.kode_supp,
                    tgl_berlaku: moment(masterFpb.tgl_berlaku).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_kirim: moment(masterFpb.tgl_kirim).format('YYYY-MM-DD HH:mm:ss'),
                    alamat_kirim: null,
                    via: masterFpb.via,
                    fob: masterFpb.fob,
                    kode_termin: masterFpb.kode_termin,
                    kode_mu: masterFpb.kode_mu,
                    kurs: masterFpb.kurs,
                    kurs_pajak: masterFpb.kurs_pajak,
                    kena_pajak: masterFpb.kena_pajak,
                    total_mu: masterFpb.total_mu,
                    diskon_dok: masterFpb.diskon_dok,
                    diskon_dok_mu: masterFpb.diskon_dok_mu,
                    total_diskon_mu: masterFpb.total_diskon_mu,
                    total_pajak_mu: masterFpb.total_pajak_mu,
                    kirim_mu: masterFpb.kirim_mu,
                    netto_mu: masterFpb.netto_mu,
                    total_rp: masterFpb.total_rp,
                    diskon_dok_rp: masterFpb.diskon_dok_rp,
                    total_diskon_rp: masterFpb.total_diskon_rp,
                    total_pajak_rp: masterFpb.total_pajak_rp,
                    kirim_rp: masterFpb.kirim_rp,
                    netto_rp: masterFpb.netto_rp,
                    total_berat: masterFpb.total_berat,
                    keterangan: masterFpb.keterangan,
                    status: masterFpb.status,
                    userid: stateDokumen?.userid,
                    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                    approval: masterFpb.approval,
                    tgl_approval:
                        (stateDokumen?.masterDataState === 'BARU' || stateDokumen?.masterDataState === 'EDIT') && (masterFpb.tgl_approval === null || masterFpb.tgl_approval === '')
                            ? null
                            : stateDokumen?.masterDataState === 'Approve Cabang'
                            ? null
                            : moment(masterFpb.tgl_approval).format('YYYY-MM-DD HH:mm:ss'),
                    kirim_langsung: stateDokumen?.KirimLangsung, //masterFpb.kirim_langsung,
                    status_kirim: masterFpb.status_kirim,
                    no_sjpabrik: masterFpb.no_sjpabrik,
                    tgl_sjpabrik:
                        (stateDokumen?.masterDataState === 'BARU' ||
                            stateDokumen?.masterDataState === 'EDIT' ||
                            stateDokumen?.masterDataState === 'Approve Cabang' ||
                            stateDokumen?.masterDataState === 'Approve Pusat') &&
                        (masterFpb.tgl_sjpabrik === null || masterFpb.tgl_sjpabrik === '')
                            ? null
                            : moment(masterFpb.tgl_sjpabrik).format('YYYY-MM-DD HH:mm:ss'),
                    tgl_sjfax:
                        (stateDokumen?.masterDataState === 'BARU' ||
                            stateDokumen?.masterDataState === 'EDIT' ||
                            stateDokumen?.masterDataState === 'Approve Cabang' ||
                            stateDokumen?.masterDataState === 'Approve Pusat') &&
                        (masterFpb.tgl_sjfax === null || masterFpb.tgl_sjfax === '')
                            ? null
                            : moment(masterFpb.tgl_sjfax).format('YYYY-MM-DD HH:mm:ss'),
                    nota: masterFpb.nota,
                    kode_entitas: masterFpb.kode_entitas,
                    kontrak: stateDokumen?.tipeFpb, // === 'Non Kontrak' ? 'N' : 'Y', // masterFpb.kontrak,
                    approval2: masterFpb.approval2,
                    tgl_approval2:
                        (stateDokumen?.masterDataState === 'BARU' || stateDokumen?.masterDataState === 'EDIT') && (masterFpb.tgl_approval2 === null || masterFpb.tgl_approval2 === '')
                            ? null
                            : moment(masterFpb.tgl_approval2).format('YYYY-MM-DD HH:mm:ss'),
                    kirim_langsung_cabang: stateDokumen?.KirimLangsung, //masterFpb.kirim_langsung_cabang,
                    kode_so_cabang: masterFpb.kode_so_cabang,
                    no_so_cabang: masterFpb.no_so_cabang,
                    alamat_kirim_cabang: masterFpb.alamat_kirim_cabang,
                    status_export: masterFpb.status_export,
                    keterangan_pusat: masterFpb.keterangan_pusat,
                    kodecabang: masterFpb.kodecabang,
                    kodegrup: masterFpb.kodegrup,
                    nama_cabang: masterFpb.nama_cabang,

                    tgl_trxfpb: moment(masterFpb.tgl_trxfpb).format('YYYY-MM-DD HH:mm:ss'),
                    kode_termin_pusat: masterFpb.kode_termin_pusat,
                    cara_kirim: masterFpb.cara_kirim,
                    detail: [...dgDFpb.dataSource],
                };
                jumlahItem = dgDFpb.dataSource.length;

                // console.log('reqBody ', reqBody);
                // throw exitCode;

                console.log('reqBody = ', reqBody);

                setProgressValue(30);
                setProgressText('Menyimpan data...');
                // console.log('progressValue 30', progressValue);
                // console.log('displayedProgress 30', displayedProgress);
                // console.log('reqBody ', reqBody);
                // try {
                // let responseAPI: any;
                // let responseAPIApprovalPusat: any;

                if (stateDokumen?.masterDataState === 'BARU') {
                    setProgressText('Menyimpan dokumen baru...');
                    await axios
                        .post(`${apiUrl}/erp/simpan_fpb`, reqBody, {
                            headers: {
                                Authorization: `Bearer ${stateDokumen?.token}`,
                            },
                        })
                        .then((result) => {
                            responseAPI = result.data;
                            setProgressValue(50);
                            // console.log('progressValue 50', progressValue);
                            // console.log('displayedProgress 50', displayedProgress);
                        })
                        .catch((e: any) => {
                            responseAPI = e.response.data;
                        });
                } else if (stateDokumen?.CON_FPB === 'fpb' || stateDokumen?.CON_FPB === 'Approve_Cabang') {
                    setProgressText('Mengupdate dokumen...');
                    await axios
                        .patch(`${apiUrl}/erp/update_fpb`, reqBody, {
                            headers: {
                                Authorization: `Bearer ${stateDokumen?.token}`,
                            },
                        })
                        .then((result) => {
                            responseAPI = result.data;
                            setProgressValue(50);
                            // console.log('progressValue 50', progressValue);
                            // console.log('displayedProgress 50', displayedProgress);
                        })
                        .catch((e: any) => {
                            responseAPI = e.response.data;
                        });
                } else if (stateDokumen?.CON_FPB === 'preview') {
                    myAlertGlobal2('Mode Preview - Dokumen tidak di simpan', 'frmFPB');
                    throw exitCode;
                } else if (stateDokumen?.CON_FPB === 'Approve_Pusat') {
                    setProgressText('Memproses approval pusat (Export Antar Cabang Otomatis)...');
                    await Swal.fire({
                        title: `Export Antar Cabang akan dijalankan. Proses ?`,
                        showCancelButton: true,
                        confirmButtonText: 'Ok',
                        cancelButtonText: 'Batal',
                        target: '#frmFPB',
                    }).then(async (result) => {
                        // let e: any;
                        if (result.isConfirmed) {
                            await exportAntarCabang().then(async (result) => {
                                // console.log('result ', result);

                                // throw exitCode;

                                setProgressValue(90);
                                setProgressText('Menyimpan approval pusat...');
                                // console.log('progressValue 90', progressValue);
                                // console.log('displayedProgress 90', displayedProgress);
                                await axios
                                    .post(`${apiUrl}/erp/approval_pusat_fpb`, result, {
                                        headers: {
                                            Authorization: `Bearer ${stateDokumen?.token}`,
                                        },
                                    })
                                    .then(async (result) => {
                                        responseAPIApprovalPusat = result.data;

                                        // tesCoba;
                                    })
                                    .catch((e: any) => {
                                        // console.log('cccc', e.response.data);
                                        responseAPIApprovalPusat = e.response.data;
                                        // tesCoba;
                                    });
                            });
                            // console.log('responseAPIApprovalPusat', responseAPIApprovalPusat.status);

                            if (responseAPIApprovalPusat.status) {
                                // if (tesCoba) {
                                // console.log('masuk sini');
                                setProgressValue(95);
                                setProgressText('Memproses nomor dokumen...');
                                // console.log('progressValue 95', progressValue);
                                // console.log('displayedProgress 95', displayedProgress);
                                masterFpb.approval = 'Y';
                                if (sNoSoPusat !== '') {
                                    await generateNUDivisi(stateDokumen?.kode_entitas, sNoSoPusat, '01', '10', moment().format('YYYYMM'), moment().format('YYMM') + '01');
                                }
                                if (sNoPoPusat !== '') {
                                    await generateNU(stateDokumen?.kode_entitas, sNoPoPusat, '02', moment().format('YYYYMM'));
                                }
                                if (sNoPoCabang !== '') {
                                    await generateNU(masterFpb.kode_entitas, sNoPoCabang, '02', moment().format('YYYYMM'));
                                }
                                if (sNoPpCabang !== '') {
                                    await generateNU(masterFpb.kode_entitas, sNoPpCabang, '01', moment().format('YYYYMM'));
                                }
                            } else {
                                ExportNonKontrak = false;
                                myAlertGlobal2(`Gagal Approve Pusat ${responseAPIApprovalPusat.serverMessage}`, 'frmFPB');
                            }
                        } else {
                            throw exitCode;
                        }
                    });
                } else if (stateDokumen?.CON_FPB === 'preview') {
                    myAlertGlobal2('Mode Preview - Dokumen tidak di simpan', 'frmFPB');
                    throw exitCode;
                }

                let AuditDesc: any;
                let AuditProc: any;
                if (stateDokumen?.CON_FPB === 'Approval_Pusat') {
                    AuditProc = 'APROVAL';
                } else if (stateDokumen?.CON_FPB === 'batal fpb') {
                    AuditProc = 'CANCEL';
                } else if (stateDokumen?.masterKodeDokumen === 'BARU') {
                    AuditProc = 'NEW';
                } else {
                    AuditProc = 'EDIT';
                }

                if (masterFpb.approval === 'Y') {
                    AuditDesc = 'APPROVAL DISETUJUI';
                } else if (masterFpb.approval === 'C') {
                    AuditDesc = 'APPROVAL DIKOREKSI';
                } else if (masterFpb.approval === 'N') {
                    AuditDesc = 'APPROVAL DITOLAK';
                } else {
                    AuditDesc = 'FPB';
                }

                if (stateDokumen?.masterDataState === 'BARU') {
                    setProgressValue(97);
                    setProgressText('Memproses Audit Trail...');
                    // console.log('progressValue 97', progressValue);
                    // console.log('displayedProgress 97', displayedProgress);
                    if (responseAPI.status === true) {
                        await generateNU(stateDokumen?.kode_entitas, noDok, '80', moment().format('YYYYMM'));
                        const auditResponse = await axios.post(`${apiUrl}/erp/simpan_audit`, {
                            entitas: stateDokumen?.kode_entitas,
                            kode_audit: null,
                            dokumen: 'FPB',
                            kode_dokumen: stateDokumen?.masterDataState === 'BARU' ? responseAPI.data.kode_dokumen : stateDokumen?.masterKodeDokumen,
                            no_dokumen: noDok, //masterFpb.no_fpb,
                            tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                            proses: AuditProc,
                            diskripsi: `${AuditDesc} item = ${jumlahItem} total berat = ${masterFpb.total_berat} nilai transaksi = ${masterFpb.netto_mu}`,
                            userid: stateDokumen?.userid, // userid login web
                            system_user: '', //username login
                            system_ip: '', //ip address
                            system_mac: '', //mac address
                        });
                        myAlertGlobal2(`Simpan Dokumen Baru berhasil ${responseAPI.status}`, 'frmFPB').then((result) => {
                            if (result.isConfirmed) {
                                setTimeout(() => {
                                    closeDialog();
                                    // onRefresh();
                                }, 1000);
                            }
                        });
                    } else {
                        myAlertGlobal2(`Gagal Simpan Dokumen Baru - ErrorSaveDoc ${responseAPI.data.serverMessage}`, 'frmFPB');
                    }
                } else if (stateDokumen?.masterDataState === 'EDIT') {
                    setProgressValue(97);
                    setProgressText('Memproses Audit Trail...');
                    // console.log('progressValue 97', progressValue);
                    // console.log('displayedProgress 97', displayedProgress);
                    if (responseAPI.status === true) {
                        const auditResponse = await axios.post(`${apiUrl}/erp/simpan_audit`, {
                            entitas: stateDokumen?.kode_entitas,
                            kode_audit: null,
                            dokumen: 'FPB',
                            kode_dokumen: stateDokumen?.masterDataState === 'BARU' ? responseAPI.data.kode_dokumen : stateDokumen?.masterKodeDokumen,
                            no_dokumen: masterFpb.no_fpb,
                            tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                            proses: AuditProc,
                            diskripsi: `${AuditDesc} item = ${jumlahItem} total berat = ${masterFpb.total_berat} nilai transaksi = ${masterFpb.netto_mu}`,
                            userid: stateDokumen?.userid, // userid login web
                            system_user: '', //username login
                            system_ip: '', //ip address
                            system_mac: '', //mac address
                        });
                        myAlertGlobal2(`Simpan Dokumen Perubahan berhasil ${responseAPI.status}`, 'frmFPB').then((result) => {
                            if (result.isConfirmed) {
                                setTimeout(() => {
                                    closeDialog();
                                    // onRefresh();
                                }, 1000);
                            }
                        });
                    } else {
                        myAlertGlobal2(`Gagal Simpan Dokumen Perubahan - ErrorSaveDoc ${responseAPI.data.serverMessage}`, 'frmFPB');
                    }
                } else if (stateDokumen?.masterDataState === 'Approve Cabang') {
                    if (responseAPI.status === true) {
                        setProgressValue(97);
                        setProgressText('Memproses Audit Trail...');
                        // console.log('progressValue 97', progressValue);
                        // console.log('displayedProgress 97', displayedProgress);
                        const auditResponse = await axios.post(`${apiUrl}/erp/simpan_audit`, {
                            entitas: stateDokumen?.kode_entitas,
                            kode_audit: null,
                            dokumen: 'FPB',
                            kode_dokumen: stateDokumen?.masterDataState === 'BARU' ? responseAPI.data.kode_dokumen : stateDokumen?.masterKodeDokumen,
                            no_dokumen: masterFpb.no_fpb,
                            tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                            proses: AuditProc,
                            diskripsi: `${AuditDesc} item = ${jumlahItem} total berat = ${masterFpb.total_berat} nilai transaksi = ${masterFpb.netto_mu}`,
                            userid: stateDokumen?.userid, // userid login web
                            system_user: '', //username login
                            system_ip: '', //ip address
                            system_mac: '', //mac address
                        });
                        myAlertGlobal2(`Approve Cabang berhasil ${responseAPI.status}`, 'frmFPB').then((result) => {
                            if (result.isConfirmed) {
                                setTimeout(() => {
                                    closeDialog();
                                    // onRefresh();
                                }, 1000);
                            }
                        });
                    } else {
                        myAlertGlobal2(`Gagal Approve Cabang - ErrorSaveDoc ${responseAPI.data.serverMessage}`, 'frmFPB');
                    }
                } else if (stateDokumen?.masterDataState === 'Approve Pusat') {
                    if (responseAPIApprovalPusat.status) {
                        // if (tesCoba) {
                        setProgressValue(97);
                        setProgressText('Memproses Audit Trail...');
                        // console.log('progressValue 97', progressValue);
                        // console.log('displayedProgress 97', displayedProgress);
                        const auditResponse = await axios.post(`${apiUrl}/erp/simpan_audit`, {
                            entitas: stateDokumen?.kode_entitas,
                            kode_audit: null,
                            dokumen: 'FPB',
                            kode_dokumen: stateDokumen?.masterDataState === 'BARU' ? responseAPI.data.kode_dokumen : stateDokumen?.masterKodeDokumen,
                            no_dokumen: masterFpb.no_fpb,
                            tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                            proses: AuditProc,
                            diskripsi: `${AuditDesc} item = ${jumlahItem} total berat = ${masterFpb.total_berat} nilai transaksi = ${masterFpb.netto_mu}`,
                            userid: stateDokumen?.userid, // userid login web
                            system_user: '', //username login
                            system_ip: '', //ip address
                            system_mac: '', //mac address
                        });
                        myAlertGlobal2(`Simpan Approve Pusat berhasil ${responseAPIApprovalPusat.status}`, 'frmFPB').then((result) => {
                            if (result.isConfirmed) {
                                setTimeout(() => {
                                    closeDialog();
                                    // onRefresh();
                                }, 1000);
                            }
                        });
                    } else {
                        myAlertGlobal2(`Gagal Approve Pusat - ErrorSaveDoc ${responseAPIApprovalPusat.serverMessage}`, 'frmFPB');
                    }
                }
                setProgressValue(98);
                setProgressText('Menyelesaikan proses...');
                // console.log('progressValue 98', progressValue);
                // console.log('displayedProgress 98', displayedProgress);
            }
        } catch (error) {
            myAlertGlobal2(`Gagal Simpan All - ErrorSaveDoc ${error + responseAPI?.serverMessage}`, 'frmFPB');
            // myAlertGlobal2(`Gagal Simpan All - ErrorSaveDoc ${responseAPIApprovalPusat.data.serverMessage}`, 'frmFPB');
            // setIsLoading(false);
            setDisabledSimpan(false);
        } finally {
            // setShowLoader(false);
            setProgressValue(100);
            setProgressText('Proses selesai');
            // console.log('progressValue 100', progressValue);
            // console.log('displayedProgress 100', displayedProgress);
            setTimeout(() => {
                setIsExporting(false);
                setProgressValue(0);
                setDisplayedProgress(0);
                setProgressText('');
                setDisabledSimpan(false);

                // setShowLoader(false);
            }, 500);
        }
    };

    // const saveDoc = async () => {
    //     await Recalc();
    //     // await kalkulasi().then(async (result) => {
    //     //     await dgDFpb.refresh();
    //     // });
    // };

    const templateTipeBooking = (args: any) => {
        return (
            <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6">
                <DropDownListComponent
                    id="tipeBooking"
                    name="cbTipeBooking"
                    dataSource={['PO', 'OS', 'ST']}
                    fields={{ value: 'tipe_booking', text: 'tipe_booking' }}
                    // value={masterFpb.fob}
                    floatLabelType="Never"
                    placeholder={args.tipe_booking}
                    onChange={(e: any) => {
                        dgDFpb.dataSource[args.index] = {
                            ...dgDFpb.dataSource[args.index],
                            tipe_booking: e.value,
                            no_booking: '',
                            nama_booking: '',
                            id_booking: '',
                            kode_booking: '',
                        };
                        dgDFpb.refresh();
                    }}
                />
            </div>
        );
    };

    const templateNoBooking = (args: any) => {
        // console.log('stateDokumen?.CON_FPB ', stateDokumen?.CON_FPB);
        if (stateDokumen?.CON_FPB === 'preview') {
            myAlertGlobal('Mode Preview', 'frmFPB');
            // console.log('preview exitCode');
            // throw exitCode;
        } else {
            // console.log('dgDFpb?.dataSource[selectedRowIndex]?.tipe_booking ', dgDFpb?.dataSource[selectedRowIndex]?.tipe_booking);
            if (dgDFpb?.dataSource[selectedRowIndex]?.tipe_booking === 'PO') {
                return (
                    <div>
                        <TooltipComponent content="Pilih data barang" opensOn="Hover" openDelay={1000} position="TopRight" target="#buNoItem">
                            <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                                <TextBoxComponent id="no_booking" name="no_booking" className="no_booking" value={args.no_booking} readOnly={false} showClearButton={false} />
                                <span>
                                    <ButtonComponent
                                        id="buNoBooking"
                                        type="button" //Solusi tdk refresh halaman saat selesai onClick
                                        cssClass="e-primary e-small e-round"
                                        iconCss="e-icons e-small e-search"
                                        onClick={() => {
                                            setShowDlgSupplierNoBooking(true);
                                        }}
                                        style={{ backgroundColor: '#3b3f5c' }}
                                    />
                                </span>
                            </div>
                        </TooltipComponent>
                    </div>
                );
            } else if (dgDFpb?.dataSource[selectedRowIndex]?.tipe_booking === 'OS') {
                return (
                    <div>
                        <TooltipComponent content="PO Outstanding" opensOn="Hover" openDelay={1000} position="TopRight" target="#buNoItem">
                            <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                                <TextBoxComponent id="no_booking" name="no_booking" className="no_booking" value={args.no_booking} readOnly={false} showClearButton={false} />
                                <span>
                                    <ButtonComponent
                                        id="buNoItem1"
                                        type="button" //Solusi tdk refresh halaman saat selesai onClick
                                        cssClass="e-primary e-small e-round"
                                        iconCss="e-icons e-small e-search"
                                        onClick={async () => {
                                            let resultFetchDataDialog: any;

                                            setKodeItem(dgDFpb.dataSource[selectedRowIndex].kode_item);
                                            setDiskripsi(dgDFpb.dataSource[selectedRowIndex].diskripsi);
                                            try {
                                                const response = await axios.get(`${apiUrl}/erp/get_po_outstanding?`, {
                                                    params: {
                                                        entitas: stateDokumen?.kode_entitas,
                                                        param1: kodeItem,
                                                    },
                                                    headers: {
                                                        Authorization: `Bearer ${stateDokumen?.token}`,
                                                    },
                                                });
                                                resultFetchDataDialog = response.data.data;
                                                if (resultFetchDataDialog.length <= 0) {
                                                    await Swal.fire({
                                                        title: `Barang ${diskripsi}
                                                        belum ada order pembelian.`,
                                                        showCancelButton: false,
                                                        confirmButtonText: 'Ok',
                                                        // cancelButtonText: 'No',
                                                        target: '#frmFPB',
                                                    }).then((result) => {
                                                        if (result.isConfirmed) {
                                                            throw exitCode;
                                                        }
                                                    });
                                                } else {
                                                    setShowDlgPoOutStanding(true);
                                                    // dgDialog.dataSource = resultFetchDataDialog;
                                                    // setListItemDialog(resultFetchDataDialog);
                                                }
                                            } catch (error: any) {
                                                console.error('Error fetching data:', error);
                                            }

                                            // setShowDlgPoOutStanding(true);
                                        }}
                                        style={{ backgroundColor: '#3b3f5c' }}
                                    />
                                </span>
                            </div>
                        </TooltipComponent>
                    </div>
                );
            } else if (dgDFpb?.dataSource[selectedRowIndex]?.tipe_booking === 'ST') {
                return (
                    <div>
                        <TooltipComponent content="Stok Per Gudang" opensOn="Hover" openDelay={1000} position="TopRight" target="#buNoItem">
                            <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                                <TextBoxComponent id="no_booking" name="no_booking" className="no_booking" value={args.no_booking} readOnly={false} showClearButton={false} />
                                <span>
                                    <ButtonComponent
                                        id="buNoItem1"
                                        type="button" //Solusi tdk refresh halaman saat selesai onClick
                                        cssClass="e-primary e-small e-round"
                                        iconCss="e-icons e-small e-search"
                                        onClick={async () => {
                                            let resultFetchDataDialog: any;
                                            setKodeItem(dgDFpb.dataSource[selectedRowIndex].kode_item);
                                            setDiskripsi(dgDFpb.dataSource[selectedRowIndex].diskripsi);
                                            try {
                                                const response = await axios.get(`${apiUrl}/erp/list_stok_gudang?`, {
                                                    params: {
                                                        entitas: stateDokumen?.kode_entitas,
                                                        param1: kodeItem,
                                                    },
                                                    headers: {
                                                        Authorization: `Bearer ${stateDokumen?.token}`,
                                                    },
                                                });
                                                resultFetchDataDialog = response.data.data;

                                                if (resultFetchDataDialog.length <= 0) {
                                                    await Swal.fire({
                                                        title: `Barang ${dgDFpb.dataSource[selectedRowIndex].diskripsi}
                                                           stok tidak tersedia.`,
                                                        showCancelButton: false,
                                                        confirmButtonText: 'Ok',
                                                        // cancelButtonText: 'No',
                                                        target: '#frmFPB',
                                                    }).then((result) => {
                                                        if (result.isConfirmed) {
                                                            throw exitCode;
                                                        }
                                                    });
                                                } else {
                                                    setShowDlgFpbStok(true);
                                                    // dgDialog.dataSource = resultFetchDataDialog;
                                                    // setListItemDialog(resultFetchDataDialog);
                                                }
                                            } catch (error: any) {
                                                console.error('Error fetching data:', error);
                                            }
                                            // setShowDlgFpbStok(true);
                                        }}
                                        style={{ backgroundColor: '#3b3f5c' }}
                                    />
                                </span>
                            </div>
                        </TooltipComponent>
                    </div>
                );
            } else if (dgDFpb?.dataSource[selectedRowIndex]?.tipe_booking === 'null' || dgDFpb?.dataSource[selectedRowIndex]?.tipe_booking === '') {
                myAlertGlobal2('Tipe Booking belum dipilih', 'frmFPB');
                throw exitCode;
            }
        }
    };

    const footerTemplateInfoDlg = () => {
        return stateDokumen?.CON_FPB === 'Approve_Pusat' ? (
            // 'APPROVE PUSAT'
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
                <div className="flex justify-between">
                    <div className="w-[100%]">
                        <ButtonComponent
                            id="buBatal"
                            content="BATAL"
                            cssClass="e-primary e-small"
                            iconCss="e-icons e-small e-close"
                            style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: '#3b3f5c' }}
                            onClick={() => closeDialog()}
                            disabled={disabledSimpan}
                        />
                        <ButtonComponent
                            id="buUnApprovalPusat"
                            content="Ditolak"
                            cssClass="e-primary e-small"
                            iconCss="e-icons e-small e-save"
                            style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                            // onClick={saveDoc}
                            onClick={() => {
                                batalUnApprovedKoreksi('buUnApproval');
                            }}
                            disabled={disabledSimpan}
                        />
                        <ButtonComponent
                            id="buCorrectionPusat"
                            content="Koreksi"
                            cssClass="e-primary e-small"
                            iconCss="e-icons e-small e-save"
                            style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                            onClick={() => {
                                // batalUnApprovedKoreksi('buCorrection');
                                batalUnApprovedKoreksi('buCorrection2');
                            }}
                            disabled={disabledSimpan}
                        />
                        <ButtonComponent
                            id="buApprovalPusat"
                            content="Disetujui"
                            cssClass="e-primary e-small"
                            iconCss="e-icons e-small e-save"
                            style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                            onClick={saveDoc} //{exportAntarCabang} //{saveDoc}
                            disabled={disabledSimpan}
                        />
                    </div>
                </div>
            </div>
        ) : stateDokumen?.CON_FPB === 'Approve_Cabang' ? (
            // 'APPROVE CABANG'
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
                <div className="flex justify-between">
                    <div className="w-[100%]">
                        <ButtonComponent
                            id="buBatal"
                            content="BATAL"
                            cssClass="e-primary e-small"
                            iconCss="e-icons e-small e-close"
                            style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: '#3b3f5c' }}
                            onClick={() => closeDialog()}
                        />
                        <ButtonComponent
                            id="buUnApprovalCabang"
                            content="Ditolak"
                            cssClass="e-primary e-small"
                            iconCss="e-icons e-small e-save"
                            style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                            onClick={() => {
                                batalUnApprovedKoreksi('buUnApproval2');
                            }}
                        />
                        <ButtonComponent
                            id="buCorrectionCabang"
                            content="Koreksi"
                            cssClass="e-primary e-small"
                            iconCss="e-icons e-small e-save"
                            style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                            onClick={() => {
                                batalUnApprovedKoreksi('buCorrection2');
                            }}
                            disabled={disabledSimpan}
                        />
                        <ButtonComponent
                            id="buApprovalCabang"
                            content="Disetujui"
                            cssClass="e-primary e-small"
                            iconCss="e-icons e-small e-save"
                            style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                            onClick={saveDoc}
                            disabled={stateDokumen?.CON_FPB === 'preview' || disabledSimpan}
                            // disabled={disabledSimpan}
                        />
                    </div>
                </div>
            </div>
        ) : stateDokumen?.CON_FPB === 'batal fpb' ? (
            // BARU EDIT
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
                <div className="flex justify-between">
                    <div className="w-[100%]">
                        <ButtonComponent
                            id="buBatal"
                            content="BATAL"
                            cssClass="e-primary e-small"
                            iconCss="e-icons e-small e-close"
                            style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: '#3b3f5c' }}
                            onClick={() => closeDialog()}
                        />
                        <ButtonComponent
                            id="buCancelFpb"
                            content="Dibatalkan"
                            cssClass="e-primary e-small"
                            iconCss="e-icons e-small e-save"
                            style={{ float: 'right', width: '100px', marginTop: 1 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                            onClick={() => {
                                batalUnApprovedKoreksi('buCancelFpb');
                            }}
                        />
                    </div>
                </div>
            </div>
        ) : stateDokumen?.CON_FPB === 'preview' ? (
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
                <div className="flex justify-between">
                    <div className="w-[100%]">
                        <ButtonComponent
                            id="buBatal"
                            content="TUTUP"
                            cssClass="e-primary e-small"
                            iconCss="e-icons e-small e-close"
                            style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: '#3b3f5c' }}
                            onClick={() => closeDialog()}
                        />
                    </div>
                </div>
            </div>
        ) : (
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
                <div className="flex justify-between">
                    <div className="w-[100%]">
                        <ButtonComponent
                            id="buBatal"
                            content="BATAL"
                            cssClass="e-primary e-small"
                            iconCss="e-icons e-small e-close"
                            style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: '#3b3f5c' }}
                            onClick={() => closeDialog()}
                            disabled={disabledSimpan}
                        />
                        <ButtonComponent
                            id="buOk"
                            content="OK"
                            cssClass="e-primary e-small"
                            iconCss="e-icons e-small e-save"
                            style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                            onClick={saveDoc}
                            disabled={disabledSimpan}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const handleGenerate = async () => {
        await dgDFpb.dataSource.map(async (item: any, index: any) => {
            if (masterFpb.genNoSupp === '') {
                item.tipe_booking = '';
                item.no_booking = '';
                item.nama_booking = '';
                item.kode_booking = '';
                item.id_booking = '';
                setMasterFpb((prevData: any) => ({
                    ...prevData,
                    kode_termin_pusat: '',
                    nama_termin_pusat: '',
                }));
                dgDFpb.refresh();
            } else {
                item.tipe_booking = 'PO';
                item.no_booking = masterFpb.genNoSupp;
                item.nama_booking = masterFpb.genNamaSupp;
                item.kode_booking = masterFpb.gKODE_BOOKING;
                item.id_booking = masterFpb.gID_BOOKING;
                setMasterFpb((prevData: any) => ({
                    ...prevData,
                    kode_termin_pusat: masterFpb.gKODE_TERMIN_PUSAT,
                    nama_termin_pusat: masterFpb.gNAMA_TERMIN_PUSAT,
                }));
                setKodeSuppBooking(masterFpb.gKODE_BOOKING);
                dgDFpb.refresh();
            }
        });
    };

    const contentLoader = () => {
        return (
            <div className="screen_loader animate__animated fixed inset-0 z-[60] grid place-content-center bg-[#ffffff00] dark:bg-[#060818]">
                <svg width="64" height="64" viewBox="0 0 135 135" xmlns="http://www.w3.org/2000/svg" fill="#4361ee">
                    <path d="M67.447 58c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10zm9.448 9.447c0 5.523 4.477 10 10 10 5.522 0 10-4.477 10-10s-4.478-10-10-10c-5.523 0-10 4.477-10 10zm-9.448 9.448c-5.523 0-10 4.477-10 10 0 5.522 4.477 10 10 10s10-4.478 10-10c0-5.523-4.477-10-10-10zM58 67.447c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10z">
                        <animateTransform attributeName="transform" type="rotate" from="0 67 67" to="-360 67 67" dur="2.5s" repeatCount="indefinite" />
                    </path>
                    <path d="M28.19 40.31c6.627 0 12-5.374 12-12 0-6.628-5.373-12-12-12-6.628 0-12 5.372-12 12 0 6.626 5.372 12 12 12zm30.72-19.825c4.686 4.687 12.284 4.687 16.97 0 4.686-4.686 4.686-12.284 0-16.97-4.686-4.687-12.284-4.687-16.97 0-4.687 4.686-4.687 12.284 0 16.97zm35.74 7.705c0 6.627 5.37 12 12 12 6.626 0 12-5.373 12-12 0-6.628-5.374-12-12-12-6.63 0-12 5.372-12 12zm19.822 30.72c-4.686 4.686-4.686 12.284 0 16.97 4.687 4.686 12.285 4.686 16.97 0 4.687-4.686 4.687-12.284 0-16.97-4.685-4.687-12.283-4.687-16.97 0zm-7.704 35.74c-6.627 0-12 5.37-12 12 0 6.626 5.373 12 12 12s12-5.374 12-12c0-6.63-5.373-12-12-12zm-30.72 19.822c-4.686-4.686-12.284-4.686-16.97 0-4.686 4.687-4.686 12.285 0 16.97 4.686 4.687 12.284 4.687 16.97 0 4.687-4.685 4.687-12.283 0-16.97zm-35.74-7.704c0-6.627-5.372-12-12-12-6.626 0-12 5.373-12 12s5.374 12 12 12c6.628 0 12-5.373 12-12zm-19.823-30.72c4.687-4.686 4.687-12.284 0-16.97-4.686-4.686-12.284-4.686-16.97 0-4.687 4.686-4.687 12.284 0 16.97 4.686 4.687 12.284 4.687 16.97 0z">
                        <animateTransform attributeName="transform" type="rotate" from="0 67 67" to="360 67 67" dur="8s" repeatCount="indefinite" />
                    </path>
                </svg>
            </div>
        );
    };

    const cekDataField = async (args: any) => {
        // const newData = dgDFpb?.dataSource.map(async (item: any, index: any) => {
        //     if (stateDokumen?.KirimLangsung === 'Y') {
        //         if (item.harga_mu > item.harga_jual_mu) {
        //             myAlertGlobal('Harga Beli lebih besar dari Harga Jual .', 'frmFPB');
        //             // throw exitCode;
        //         }
        //     }
        // });
        // return newData;
    };

    const fieldCekValidasi = { params: { format: 'N', decimals: 4, showClearButton: false, showSpinButton: false, change: cekDataField } };
    const DetailBarangDelete = () => {
        if (dgDFpb.dataSource.length > 0) {
            withReactContent(Swal)
                .fire({
                    html: `Hapus data baris ${selectedRowIndex + 1}?`,
                    width: '15%',
                    target: '#frmFPB',
                    showCancelButton: true,
                    confirmButtonText: '<p style="font-size:10px">Ya</p>',
                    cancelButtonText: '<p style="font-size:10px">Tidak</p>',
                })
                .then((result) => {
                    if (result.isConfirmed) {
                        dgDFpb.dataSource.splice(selectedRowIndex, 1);
                        dgDFpb.dataSource.forEach((item: any, index: number) => {
                            item.id_fdo = index + 1;
                        });
                        dgDFpb.refresh();
                        // Recalc();
                    } else {
                        console.log('cancel');
                    }
                });
        }
    };

    const DetailBarangDeleteAll = () => {
        if (dgDFpb.dataSource.length > 0) {
            withReactContent(Swal)
                .fire({
                    html: 'Hapus semua data?',
                    width: '15%',
                    target: '#frmFPB',
                    showCancelButton: true,
                    confirmButtonText: '<p style="font-size:10px">Ya</p>',
                    cancelButtonText: '<p style="font-size:10px">Tidak</p>',
                })
                .then((result) => {
                    if (result.isConfirmed) {
                        dgDFpb.dataSource.splice(0, dgDFpb.dataSource.length);
                        dgDFpb.refresh();
                    } else {
                        console.log('cancel');
                    }
                });
        }
    };
    return (
        <>
            <DialogComponent
                id="frmFPB"
                isModal={true}
                width="80%"
                height="80%"
                visible={isOpen}
                close={async () => {
                    closeDialog();
                    await addDefaultRowIfEmpty('created');
                }}
                header={headerTemplate}
                // showCloseIcon={true}
                target="#main-target"
                closeOnEscape={false}
                allowDragging={true}
                animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                enableResize={true}
                // buttons={stateDokumen?.CON_FPB === 'Approve_Pusat' ? buttonApprovePusat : stateDokumen?.CON_FPB === 'Approve_Cabang' ? buttonApproveCabang : buttonBaru}
                // buttons={stateDokumen?.CON_FPB === 'Approve_Pusat' || stateDokumen?.CON_FPB === 'Approve_Cabang' ? buttonApprove : buttonBaru}
                footerTemplate={footerTemplateInfoDlg}
                position={{ X: 'center', Y: 'top' }}
                cssClass="custom-dialog"
            >
                <div style={{ minWidth: '70%', overflow: 'auto' }}>
                    {/* {showLoader && contentLoader()} */}

                    {isExporting && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="rounded-lg bg-white p-6 shadow-lg">
                                <div className="mb-4 text-center text-lg font-semibold">Memproses Export Antar Cabang</div>
                                <div className="flex flex-col items-center">
                                    <div className="relative mb-4">
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
                                                duration: 2000,
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
                                    {/* Progress Text */}
                                    <div className="mt-2 text-center text-sm font-medium text-gray-600">{progressText}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <div style={{ padding: 2 }}>
                            {/* =======================================  DATA HEADER ============================================================================   */}
                            <div className="panel-tabel" style={{ width: '100%' }}>
                                {/* BARIS KESATU */}
                                <div className={`grid ${stateDokumen?.CON_FPB === 'Approve_Pusat' || stateDokumen?.CON_FPB === 'preview' ? 'grid-cols-8' : 'grid-cols-6'} gap-1`}>
                                    {/* <div className="grid grid-cols-8 gap-1"> */}
                                    <div className="font-weight-bold break-all bg-dark text-center text-sm text-white">Tanggal Dokumen</div>
                                    <div className="font-weight-bold break-all bg-dark text-center text-sm text-white">Tgl. Efektif</div>
                                    <div className="font-weight-bold break-all bg-dark text-center text-sm text-white">No. FPB</div>
                                    <div className="font-weight-bold break-all bg-dark text-center text-sm text-white">Supplier</div>
                                    <>
                                        {stateDokumen?.masterKodeDokumen === 'BARU' && stateDokumen?.isCabang && stateDokumen?.KirimLangsung === 'Y' ? (
                                            <div className="font-weight-bold break-all bg-dark text-center text-sm text-white">Termin Pusat</div>
                                        ) : stateDokumen?.KirimLangsung === 'Y' ? (
                                            <div className="font-weight-bold break-all bg-dark text-center text-sm text-white">Termin Pusat</div>
                                        ) : stateDokumen?.masterKodeDokumen === 'BARU' && stateDokumen?.isCabang ? (
                                            <div className="col-span-1 break-all"></div>
                                        ) : (
                                            // <div className="font-weight-bold break-all bg-dark text-center text-sm text-white">Termin Pusat</div>
                                            <div className="font-weight-bold break-all bg-dark text-center text-sm text-white">Termin Pusat</div>
                                        )}
                                    </>
                                    <div className="font-weight-bold break-all bg-dark text-center text-sm text-white">Termin Cabang</div>
                                    {/* PO GROUP */}
                                    {/* {stateDokumen?.CON_FPB === 'Approve_Pusat' || stateDokumen?.CON_FPB === 'Approve_Cabang' ? ( */}
                                    {stateDokumen?.CON_FPB === 'Approve_Pusat' || stateDokumen?.CON_FPB === 'preview' ? (
                                        // <div className="font-weight-bold col-span-2 row-span-3 break-all bg-yellow-500 text-left text-sm text-black">
                                        //     <div className="ml-1 mt-2 grid grid-cols-3">
                                        //         <div className="col-span-1">
                                        //             <p className="text-start ">PO GROUP</p>
                                        //         </div>
                                        //         <div className="input-group col-span-2 flex" style={{ alignItems: 'center' }}>
                                        //             <input
                                        //                 id="cdGrup"
                                        //                 className={`container form-input w-[70%]`}
                                        //                 style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }}
                                        //                 disabled={true}
                                        //                 value={masterFpb.kodegrup || ''}
                                        //                 readOnly
                                        //             ></input>
                                        //             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        //                 <FontAwesomeIcon
                                        //                     icon={faSearch}
                                        //                     className="ml-1"
                                        //                     onClick={() => {
                                        //                         // console.log('klik ');
                                        //                         setShowDialogPoGrup(true);
                                        //                     }}
                                        //                     style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                        //                 />
                                        //             </div>
                                        //         </div>
                                        //     </div>
                                        //     <div className="ml-1 mt-1 grid grid-cols-3">
                                        //         <div className="col-span-1">
                                        //             <p className="text-start">PPN Atas Nama</p>
                                        //         </div>
                                        //         <div className="input-group col-span-2 mb-3 flex" style={{ alignItems: 'center' }}>
                                        //             <input
                                        //                 id="cdCabang"
                                        //                 className={`container form-input w-[70%]`}
                                        //                 style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }}
                                        //                 disabled={true}
                                        //                 value={masterFpb.nama_cabang || ''}
                                        //                 readOnly
                                        //             ></input>
                                        //             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        //                 <FontAwesomeIcon
                                        //                     icon={faSearch}
                                        //                     className="ml-1"
                                        //                     onClick={() => {
                                        //                         setShowDlgPpnAtasNama(true);
                                        //                     }}
                                        //                     style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                        //                 />
                                        //             </div>
                                        //         </div>
                                        //     </div>
                                        // </div>
                                        <div className="font-weight-bold col-span-2 row-span-3 break-all bg-yellow-500 text-left text-sm text-black">
                                            <div className="ml-1 mt-2 grid grid-cols-3">
                                                <div className="col-span-1">
                                                    <p className="text-start">PO GROUP</p>
                                                </div>
                                                <div className="input-group col-span-2 flex items-center">
                                                    <input
                                                        id="cdGrup"
                                                        className="container form-input ml-1 w-full"
                                                        style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }}
                                                        disabled={true}
                                                        value={masterFpb.kodegrup || ''}
                                                        readOnly
                                                    />
                                                    <div className="mr-2 flex items-center justify-center">
                                                        <FontAwesomeIcon
                                                            icon={faSearch}
                                                            className="ml-1 cursor-pointer"
                                                            onClick={() => setShowDialogPoGrup(true)}
                                                            style={{ width: '20px', height: '20px' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ml-1 mt-1 grid grid-cols-3">
                                                <div className="col-span-1">
                                                    <p className="text-start">PPN Atas Nama</p>
                                                </div>
                                                <div className="input-group col-span-2 mb-3 flex items-center">
                                                    <input
                                                        id="cdCabang"
                                                        className="container form-input ml-1 w-full"
                                                        style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }}
                                                        disabled={true}
                                                        value={masterFpb.nama_cabang || ''}
                                                        readOnly
                                                    />
                                                    <div className="mr-2 flex items-center justify-center">
                                                        <FontAwesomeIcon
                                                            icon={faSearch}
                                                            className="ml-1 cursor-pointer"
                                                            onClick={() => setShowDlgPpnAtasNama(true)}
                                                            style={{ width: '20px', height: '20px' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}

                                    {/* TGL. DOKUMEN */}
                                    <div className="col-start-1">
                                        <DatePickerComponent
                                            id="dtTglFpb"
                                            locale="id"
                                            cssClass="e-custom-style"
                                            placeholder="Tgl. Dokumen"
                                            enableMask={true}
                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                            showClearButton={false}
                                            format="dd-MM-yyyy"
                                            value={moment(masterFpb.tgl_fpb)?.toDate()}
                                            // change={(args: ChangeEventArgsCalendar) => {}}
                                            readOnly
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                    {/* TGL. EFEKTIF */}
                                    <div className="...">
                                        {/* TANGGAL EFEKTIF */}
                                        <DatePickerComponent
                                            id="dtTglTrxFpb"
                                            locale="id"
                                            cssClass="e-custom-style"
                                            placeholder="Tgl. Efektif"
                                            enableMask={true}
                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                            showClearButton={false}
                                            format="dd-MM-yyyy"
                                            value={moment(masterFpb.tgl_trxfpb)?.toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {}}
                                            readOnly
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                    {/* NO. FPB */}
                                    <div className="...">
                                        <input
                                            id="cdNo"
                                            className={`container form-input`}
                                            style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }}
                                            disabled={true}
                                            value={masterFpb?.no_fpb}
                                            readOnly
                                        ></input>
                                    </div>
                                    {/* SUPPLIER */}
                                    <div className="...">
                                        <div className="input-group mb-3 flex" style={{ alignItems: 'center' }}>
                                            <input
                                                id="edSupplier"
                                                className={`container form-input`}
                                                style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }}
                                                disabled={true}
                                                value={masterFpb.nama_relasi}
                                                readOnly
                                            ></input>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        // handleDialogAkun();
                                                        // setStateDialog('header');
                                                        // setShowFrmDlgAkunJurnal(true);
                                                    }}
                                                    style={{ width: '5%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    // disabled={stateDokumen[0].CON_BKK === 'PREVIEW_IMAGE' || stateDokumen[0].CON_BKK === 'PREVIEW_IMAGE_ORI' ? true : false}
                                                    disabled={true}
                                                >
                                                    <FontAwesomeIcon icon={faSearch} className="ml-2" style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {/* TERMIN PUSAT */}
                                    <>
                                        {stateDokumen?.masterKodeDokumen === 'BARU' && stateDokumen?.isCabang && stateDokumen?.KirimLangsung === 'Y' ? (
                                            <div className="...">
                                                {/* TERMIN PUSAT*/}
                                                <div className="flex" style={{ alignItems: 'center' }}>
                                                    <input
                                                        id="edTerminPusat"
                                                        className={`container form-input`}
                                                        style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }}
                                                        disabled={true}
                                                        value={masterFpb.nama_termin_pusat || ''}
                                                        readOnly
                                                    ></input>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <FontAwesomeIcon
                                                            icon={faSearch}
                                                            className="ml-1"
                                                            onClick={() => {
                                                                setShowDialogTerminPusat(true);
                                                            }}
                                                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : stateDokumen?.KirimLangsung === 'Y' ? (
                                            <div className="...">
                                                {/* TERMIN PUSAT*/}
                                                <div className="flex" style={{ alignItems: 'center' }}>
                                                    <input
                                                        id="edTerminPusat"
                                                        className={`container form-input`}
                                                        style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }}
                                                        disabled={true}
                                                        value={masterFpb.nama_termin_pusat || ''}
                                                        readOnly
                                                    ></input>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <FontAwesomeIcon
                                                            icon={faSearch}
                                                            className="ml-1"
                                                            onClick={() => {
                                                                setShowDialogTerminPusat(true);
                                                            }}
                                                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : stateDokumen?.masterKodeDokumen === 'BARU' && stateDokumen?.isCabang ? (
                                            <div className="col-span-1 break-all"></div>
                                        ) : (
                                            <div className="...">
                                                {/* TERMIN PUSAT*/}
                                                <div className="flex" style={{ alignItems: 'center' }}>
                                                    <input
                                                        id="edTerminPusat"
                                                        className={`container form-input`}
                                                        style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }}
                                                        disabled={true}
                                                        value={masterFpb.nama_termin_pusat || ''}
                                                        readOnly
                                                    ></input>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <FontAwesomeIcon
                                                            icon={faSearch}
                                                            className="ml-1"
                                                            onClick={() => {
                                                                setShowDialogTerminPusat(true);
                                                            }}
                                                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                    {/* TERMIN CABANG */}
                                    <div className="...">
                                        <div className="flex" style={{ alignItems: 'center' }}>
                                            <input
                                                id="edTermin"
                                                className={`container form-input`}
                                                style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }}
                                                disabled={true}
                                                value={masterFpb.nama_termin}
                                                readOnly
                                            ></input>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FontAwesomeIcon
                                                    icon={faSearch}
                                                    className="ml-1"
                                                    onClick={() => {
                                                        setShowDialogTerminCabang(true);
                                                    }}
                                                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="font-weight-bold col-start-1 break-all bg-dark text-center text-sm text-white">Tgl. Berlaku PO</div>
                                    <div className="font-weight-bold break-all bg-dark text-center text-sm text-white">Cara Pengiriman</div>
                                    {/* ALAMAT PENGIRIMAN CABANG */}

                                    {stateDokumen?.masterKodeDokumen === 'BARU' && stateDokumen?.isCabang && stateDokumen?.KirimLangsung === 'Y' ? (
                                        // <div className="col-span-3 break-all"></div>
                                        <>
                                            <div className="font-weight-bold col-span-3 break-all bg-dark text-center text-sm text-white">Alamat Pengiriman Customer Cabang</div>
                                        </>
                                    ) : stateDokumen?.KirimLangsung === 'Y' ? (
                                        // <div className="col-span-3 break-all"></div>
                                        <>
                                            <div className="font-weight-bold col-span-3 break-all bg-dark text-center text-sm text-white">Alamat Pengiriman Customer Cabang</div>
                                        </>
                                    ) : (
                                        <div className="col-span-3 break-all"></div>
                                    )}
                                    <div className="font-weight-bold break-all bg-dark text-center text-sm text-white">Pajak</div>

                                    {/* TGL. BERLAKU PO */}
                                    <div className="col-start-1">
                                        <DatePickerComponent
                                            id="edTglBerlaku"
                                            locale="id"
                                            cssClass="e-custom-style"
                                            placeholder="Tgl. Dokumen"
                                            enableMask={true}
                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                            showClearButton={false}
                                            format="dd-MM-yyyy"
                                            value={moment(masterFpb.tgl_berlaku).toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                setMasterFpb((prevData: any) => ({
                                                    ...prevData,
                                                    tgl_berlaku: moment(args.value).format('YYYY-MM-DD HH:mm:ss'),
                                                }));
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                    {/* CARA PENGIRIMAN */}
                                    <div className="...">
                                        <DropDownListComponent
                                            id="cbDok"
                                            className="form-select"
                                            dataSource={['Dikirim', 'Ambil Sendiri']}
                                            placeholder="--Silahkan Pilih--"
                                            value={masterFpb.fob}
                                            change={(args: ChangeEventArgsDropDown) => {
                                                setMasterFpb((prevData: any) => ({
                                                    ...prevData,
                                                    fob: args.value,
                                                }));
                                                // const value: any = args.value;
                                                // HandlePajak(value, setselectedPajak);
                                            }}
                                        />
                                    </div>
                                    {/* ALAMAT PENGIRIMAN CUSTOMER CABANG */}
                                    {stateDokumen?.masterKodeDokumen === 'BARU' && stateDokumen?.isCabang && stateDokumen?.KirimLangsung === 'Y' ? (
                                        <>
                                            {/* {stateDokumen?.isCabang ? ( */}
                                            <div className="col-span-3 row-span-6">
                                                <textarea
                                                    id="edAlamat"
                                                    rows={10}
                                                    className="container"
                                                    style={{
                                                        fontSize: 11,
                                                        borderColor: '#bfc9d4',
                                                        borderRadius: 2,
                                                        resize: 'none',
                                                        // height: '145px',
                                                        borderStyle: 'solid',
                                                        borderWidth: '1px',
                                                        marginTop: '5px',
                                                    }}
                                                    value={masterFpb.alamat_kirim_cabang || ''}
                                                    // onChange={handleTextAreaChange}
                                                    spellCheck="false"
                                                />
                                            </div>
                                            {/* ) : null} */}
                                        </>
                                    ) : stateDokumen?.KirimLangsung === 'Y' ? (
                                        // <div className="col-span-3 row-span-6"></div>
                                        <>
                                            {/* {stateDokumen?.isCabang ? ( */}
                                            <div className="col-span-3 row-span-6">
                                                <textarea
                                                    id="edAlamat"
                                                    rows={10}
                                                    className="container"
                                                    style={{
                                                        fontSize: 11,
                                                        borderColor: '#bfc9d4',
                                                        borderRadius: 2,
                                                        resize: 'none',
                                                        // height: '145px',
                                                        borderStyle: 'solid',
                                                        borderWidth: '1px',
                                                        marginTop: '5px',
                                                    }}
                                                    value={masterFpb.alamat_kirim_cabang || ''}
                                                    // onChange={handleTextAreaChange}
                                                    spellCheck="false"
                                                />
                                            </div>
                                            {/* ) : null} */}
                                        </>
                                    ) : (
                                        <div className="col-span-3 row-span-6 break-all"></div>
                                    )}
                                    {/* PAJAK */}
                                    <div className="...">
                                        <DropDownListComponent
                                            id="pajak"
                                            className="form-select"
                                            // pajak_ui: node.kode_pajak_fj === 'S' ? 'S - PPN 10%' : node.kode_pajak_fj === 'T' ? 'T - PPN 11%' : 'N - Tanpa Pajak',
                                            dataSource={['Tanpa Pajak', 'Include (I)', 'Exclude (E)']}
                                            placeholder="--Silahkan Pilih--"
                                            value={masterFpb.kena_pajak === 'N' ? 'Tanpa Pajak' : masterFpb.kena_pajak === 'I' ? 'Include (I)' : 'Exclude (E)'}
                                            change={(args: ChangeEventArgsDropDown) => {
                                                setMasterFpb((prevData: any) => ({
                                                    ...prevData,
                                                    kena_pajak: args.value === 'Tanpa Pajak' ? 'N' : args.value === 'Include (I)' ? 'I' : 'E',
                                                }));
                                                // const value: any = args.value;
                                                // HandlePajak(value, setselectedPajak);
                                            }}
                                        />
                                    </div>

                                    {/* REFERENSI DARI PO SUPPLIER */}
                                    {/* {stateDokumen?.CON_FPB === 'Approve_Pusat' || stateDokumen?.CON_FPB === 'Approve_Cabang' ? ( */}
                                    {stateDokumen?.CON_FPB === 'Approve_Pusat' ? (
                                        <div className="font-weight-bold col-span-2 row-span-6 break-all text-left text-sm text-black">
                                            <div className="panel  bg-gray-500">
                                                <button
                                                    type="button"
                                                    className={`flex w-full items-center p-4 text-white-light dark:bg-[#1b2e4b] ${active === '1' ? '!text-light' : ''}`}
                                                    onClick={() => togglePara('1')}
                                                >
                                                    Referensi booking dari PO Supplier
                                                    <div className={`ltr:ml-auto rtl:mr-auto ${active === '1' ? 'rotate-180' : ''}`}>
                                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M19 9L12 15L5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </div>
                                                </button>
                                                <div>
                                                    <AnimateHeight duration={200} height={active === '1' ? 'auto' : 0}>
                                                        {/* <div className="space-y-2 border-t border-[#d3d3d3] p-1 text-[13px] text-white-light dark:border-[#1b2e4b]">
                                                            <div className="grid grid-cols-3">
                                                                <div className="col-span-1">
                                                                    <p className="text-start">No. Supplier</p>
                                                                </div>
                                                                <div className="input-group col-span-2 flex" style={{ alignItems: 'center' }}>
                                                                    <input
                                                                        id="cdNoBookingGenerate"
                                                                        className={`container form-input w-[80%]`}
                                                                        style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }}
                                                                        disabled={true}
                                                                        value={masterFpb.genNoSupp || ''}
                                                                        readOnly
                                                                    ></input>
                                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                        <FontAwesomeIcon
                                                                            icon={faSearch}
                                                                            className="ml-1"
                                                                            onClick={() => {
                                                                                setShowDlgSupplier(true);
                                                                            }}
                                                                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="mt-1 grid grid-cols-3 ">
                                                                <div className="col-span-1">
                                                                    <p className="text-start">Nama Supplier</p>
                                                                </div>
                                                                <div className="input-group flex" style={{ alignItems: 'center' }}>
                                                                    <input
                                                                        id="edNamaBookingGenerate"
                                                                        className={`container form-input w-[80%]`}
                                                                        style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }}
                                                                        disabled={true}
                                                                        value={masterFpb.genNamaSupp || ''}
                                                                        readOnly
                                                                    ></input>

                                                                </div>
                                                            </div>
                                                        </div> */}
                                                        <div className="space-y-2 border-t border-[#d3d3d3] p-1 text-[13px] text-white-light dark:border-[#1b2e4b]">
                                                            {/* No. Supplier */}
                                                            <div className="grid grid-cols-3 items-center">
                                                                <div className="col-span-1">
                                                                    <p className="text-start">No. Supplier</p>
                                                                </div>
                                                                <div className="col-span-2 flex items-center gap-1">
                                                                    <input
                                                                        id="cdNoBookingGenerate"
                                                                        className="form-input w-full"
                                                                        style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }}
                                                                        disabled={true}
                                                                        value={masterFpb.genNoSupp || ''}
                                                                        readOnly
                                                                    />
                                                                    <FontAwesomeIcon
                                                                        icon={faSearch}
                                                                        className="cursor-pointer"
                                                                        onClick={() => {
                                                                            setShowDlgSupplier(true);
                                                                        }}
                                                                        style={{ width: '20px', height: '20px' }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Nama Supplier */}
                                                            <div className="mt-1 grid grid-cols-3 items-center">
                                                                <div className="col-span-1">
                                                                    <p className="text-start">Nama Supplier</p>
                                                                </div>
                                                                <div className="col-span-2 flex items-center gap-1">
                                                                    <input
                                                                        id="edNamaBookingGenerate"
                                                                        className="form-input w-full"
                                                                        style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }}
                                                                        disabled={true}
                                                                        value={masterFpb.genNamaSupp || ''}
                                                                        readOnly
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="justify-left mt-0 flex">
                                                            <TooltipComponent content="Refresh data yang ditampilkan" opensOn="Hover" openDelay={1000} position="BottomCenter">
                                                                <ButtonComponent
                                                                    id="buGenerate"
                                                                    cssClass="e-primary e-small"
                                                                    iconCss="e-icons e-medium e-refresh"
                                                                    content="Generate"
                                                                    style={{ backgroundColor: '#3b3f5c', marginTop: '15px' }}
                                                                    onClick={() => handleGenerate()}
                                                                />
                                                            </TooltipComponent>
                                                        </div>
                                                    </AnimateHeight>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}

                                    <div className="font-weight-bold col-start-1 break-all bg-dark text-center text-sm text-white">Tgl. Estimasi Kirim</div>
                                    <div className="font-weight-bold break-all bg-dark text-center text-sm text-white">Pemesanan Via</div>
                                    <div className="font-weight-bold break-all bg-dark text-center text-sm text-white">FPB Tipe</div>

                                    {/* TGL. ESTIMASI KIRIM */}
                                    <div className="col-start-1">
                                        <DatePickerComponent
                                            id="edTglKirim"
                                            locale="id"
                                            cssClass="e-custom-style"
                                            placeholder="Tgl. Dokumen"
                                            enableMask={true}
                                            maskPlaceholder={{ day: 'd', month: 'M', year: 'y' }}
                                            showClearButton={false}
                                            format="dd-MM-yyyy"
                                            value={moment(masterFpb.tgl_kirim).toDate()}
                                            change={(args: ChangeEventArgsCalendar) => {
                                                setMasterFpb((prevData: any) => ({
                                                    ...prevData,
                                                    tgl_kirim: moment(args.value).format('YYYY-MM-DD HH:mm:ss'),
                                                }));
                                            }}
                                        >
                                            <Inject services={[MaskedDateTime]} />
                                        </DatePickerComponent>
                                    </div>
                                    {/* PEMESANAN VIA */}
                                    <div className="...">
                                        <DropDownListComponent
                                            id="cbVia"
                                            className="form-select"
                                            dataSource={['Fax', 'Telephone', 'Langsung']}
                                            placeholder="--Silahkan Pilih--"
                                            value={masterFpb.via}
                                            change={(args: ChangeEventArgsDropDown) => {
                                                // const value: any = args.value;
                                                // HandlePajak(value, setselectedPajak);
                                                setMasterFpb((prevData: any) => ({
                                                    ...prevData,
                                                    via: args.value,
                                                }));
                                            }}
                                        />
                                    </div>
                                    {/* FPB TIPE */}
                                    <div className="panel row-span-3 bg-white-dark">
                                        {stateDokumen?.tipeFpb === 'N' || masterFpb.kontrak === 'N' ? (
                                            <p className="font-weight-bold text-center text-[20px] text-black ">NON KONTRAK</p>
                                        ) : (
                                            //
                                            <p className="font-weight-bold text-center text-[20px] text-black ">KONTRAK</p>
                                        )}
                                        {/* <div className="inline-flex items-center gap-2">
                                            <p className="w-1/5 text-right ">Kurs Pajak</p>
                                            <div>
                                                <input
                                                    className={`container form-input`}
                                                    type="text"
                                                    name=""
                                                    id=""
                                                    // value={objekHeader?.kurs}
                                                    style={{
                                                        textAlign: 'right',
                                                        background: '#eeeeee',
                                                        fontSize: 11,
                                                        marginTop: 0,
                                                        marginLeft: 0,
                                                        borderColor: '#bfc9d4',
                                                        width: '50%',
                                                        borderRadius: 2,
                                                    }}
                                                />
                                                <span className="ml-2" style={{ fontSize: 11, fontWeight: 'bold' }}>
                                                    IDR
                                                </span>
                                            </div>
                                        </div>
                                        <div className="inline-flex items-center gap-2">
                                            <p className="w-1/5 text-right ">Kurs</p>
                                            <div>
                                                <input
                                                    className={`container form-input`}
                                                    type="text"
                                                    name=""
                                                    id=""
                                                    // value={objekHeader?.kurs}
                                                    style={{
                                                        textAlign: 'right',
                                                        background: '#eeeeee',
                                                        fontSize: 11,
                                                        marginTop: 0,
                                                        marginLeft: 0,
                                                        borderColor: '#bfc9d4',
                                                        width: '50%',
                                                        borderRadius: 2,
                                                    }}
                                                />
                                                <span className="ml-2" style={{ fontSize: 11, fontWeight: 'bold' }}>
                                                    IDR
                                                </span>
                                            </div>
                                        </div> */}
                                    </div>
                                    {/* {stateDokumen?.isCabang && <div className="font-weight-bold col-span-2 col-start-1 break-all bg-dark text-center text-sm text-white">No. SO</div>} */}
                                    {/* NO. SO*/}
                                    {stateDokumen?.masterKodeDokumen === 'BARU' && stateDokumen?.isCabang && stateDokumen?.KirimLangsung === 'Y' ? (
                                        //|| stateDokumen?.CON_FPB === 'Approve_Pusat' ||
                                        <>
                                            <div className="font-weight-bold col-span-2 col-start-1 break-all bg-dark text-center text-sm text-white">No. SO</div>
                                            <div className="input-group col-span-2 col-start-1 mb-3 flex" style={{ alignItems: 'center' }}>
                                                <input
                                                    id="edSO"
                                                    className={`container form-input`}
                                                    style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }}
                                                    disabled={true}
                                                    value={masterFpb.no_so_cabang || ''}
                                                    readOnly
                                                ></input>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <FontAwesomeIcon
                                                        icon={faSearch}
                                                        className="ml-1"
                                                        onClick={() => {
                                                            setShowDialogSo(true);
                                                        }}
                                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    ) : stateDokumen?.KirimLangsung === 'Y' ? (
                                        <>
                                            <div className="font-weight-bold col-span-2 col-start-1 break-all bg-dark text-center text-sm text-white">No. SO</div>
                                            <div className="input-group col-span-2 col-start-1 mb-3 flex" style={{ alignItems: 'center' }}>
                                                <input
                                                    id="edSO"
                                                    className={`container form-input`}
                                                    style={{ fontSize: 11, borderColor: '#bfc9d4', borderRadius: 2 }}
                                                    disabled={true}
                                                    value={masterFpb.no_so_cabang || ''}
                                                    readOnly
                                                ></input>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <FontAwesomeIcon
                                                        icon={faSearch}
                                                        className="ml-1"
                                                        onClick={() => {
                                                            setShowDialogSo(true);
                                                        }}
                                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    ) : null}
                                </div>
                            </div>

                            {/* =======================================  DATA DETAIL ============================================================================   */}
                            <div className="panel-tab" style={{ background: '#F7F7F7', width: '100%', height: '315px' }}>
                                <TabComponent
                                    // ref={(t) => (tabMkDetail = t)}
                                    selectedItem={0}
                                    animation={{ previous: { effect: 'None' }, next: { effect: 'None' } }}
                                    height="100%"
                                >
                                    <div className="e-tab-header" style={{ display: 'flex' }}>
                                        <div
                                            tabIndex={0}
                                            style={{ marginTop: 10, fontSize: '12px', fontWeight: 'bold', padding: '10px 20px', cursor: 'pointer', borderBottom: '3px solid transparent' }}
                                        >
                                            1. Data Barang
                                        </div>
                                    </div>

                                    {/*===================== Content menampilkan data barang dan data jurnal=======================*/}
                                    <div className="e-content">
                                        {/*start tab 1*/}
                                        <div style={{ width: '100%', height: '100%', marginTop: '5px', padding: 10 }}>
                                            <TooltipComponent
                                                // ref={(t) => (tooltipDetailBarang = t)}
                                                // beforeRender={beforeRenderDetailBarang}
                                                openDelay={1000}
                                                target=".e-headertext"
                                            >
                                                <GridComponent
                                                    id="dgDFpb"
                                                    name="dgDFpb"
                                                    className="dgDFpb"
                                                    locale="id"
                                                    ref={(g) => (dgDFpb = g)}
                                                    // dataSource={detailFpb}
                                                    editSettings={{ allowAdding: true, allowEditing: stateDokumen?.CON_FPB === 'preview' ? false : true, allowDeleting: true, newRowPosition: 'Bottom' }}
                                                    selectionSettings={{ mode: 'Row', type: 'Single' }}
                                                    allowResizing={true}
                                                    autoFit={true}
                                                    rowHeight={22}
                                                    height={170} //170 barang jadi 150 barang produksi
                                                    gridLines={'Both'}
                                                    loadingIndicator={{ indicatorType: 'Shimmer' }}
                                                    // toolbar={['Add', 'Edit', 'Delete', 'Update', 'Cancel']}
                                                    // rowDataBound={rowDataBoundDetailBarang}
                                                    // queryCellInfo={QueryCellInfoListData}
                                                    recordClick={(args: any) => {
                                                        // currentDaftarBarang = gridMkDetail.getSelectedRecords() || [];
                                                        // if (currentDaftarBarang.length > 0) {
                                                        //     gridMkDetail.startEdit();
                                                        // }
                                                    }}
                                                    rowSelecting={rowSelectingDetailBarang}
                                                    // cellEdit={handleCellEdit}
                                                    // onChange={handleDetailChange}
                                                    actionComplete={actionCompleteDetailBarang}
                                                    created={async () => {
                                                        if (stateDokumen?.masterDataState === 'BARU') {
                                                            await addDefaultRowIfEmpty('created');
                                                        }
                                                    }}
                                                    // actionBegin={handleGridChange}
                                                    actionBegin={actionBeginGridDetail}
                                                    //{actionBeginGridDetail}
                                                    // recordDoubleClick={(args: any) => {
                                                    //     // setFocus = args.column;
                                                    //     console.log('dobel klik');
                                                    // }}
                                                    allowKeyboard={false}
                                                    allowTextWrap={true}
                                                    textWrapSettings={{ wrapMode: 'Header' }}
                                                    // readOnly={stateDokumen?.CON_FPB === 'preview' ? true : false}
                                                >
                                                    <ColumnsDirective>
                                                        {/* <ColumnDirective
                                                            field="id_fpb"
                                                            // isPrimaryKey={true}
                                                            headerText="ID"
                                                            headerTextAlign="Center"
                                                            textAlign="Left"
                                                            width="70"
                                                            clipMode="EllipsisWithTooltip"

                                                            // editTemplate={tombolDetailDlgItemBarang}
                                                        />
                                                        <ColumnDirective
                                                            field="include"
                                                            // isPrimaryKey={true}
                                                            headerText="Include"
                                                            headerTextAlign="Center"
                                                            textAlign="Left"
                                                            width="70"
                                                            clipMode="EllipsisWithTooltip"
                                                            // editTemplate={tombolDetailDlgItemBarang}
                                                        /> */}
                                                        {/* <ColumnDirective
                                                            field="kode_item"
                                                            // isPrimaryKey={true}
                                                            headerText="Kode Item"
                                                            headerTextAlign="Center"
                                                            textAlign="Left"
                                                            width="110"
                                                            clipMode="EllipsisWithTooltip"
                                                            // editTemplate={tombolDetailDlgItemBarang}
                                                        /> */}
                                                        <ColumnDirective
                                                            field="no_item"
                                                            // isPrimaryKey={true}
                                                            headerText="No. Barang"
                                                            headerTextAlign="Center"
                                                            textAlign="Left"
                                                            width="70"
                                                            clipMode="EllipsisWithTooltip"
                                                            editTemplate={tombolDetailDlgItemBarang}
                                                        />
                                                        <ColumnDirective
                                                            field="diskripsi"
                                                            // isPrimaryKey={true}
                                                            headerText="Nama Barang"
                                                            headerTextAlign="Center"
                                                            textAlign="Left"
                                                            width="200"
                                                            clipMode="EllipsisWithTooltip"
                                                            editTemplate={tombolDetailDlgDiskripsiBarang}
                                                        />
                                                        <ColumnDirective
                                                            field="satuan"
                                                            editTemplate={templateDetailSatuan}
                                                            headerText="Satuan"
                                                            headerTextAlign="Center"
                                                            textAlign="Left"
                                                            width="80"
                                                            clipMode="EllipsisWithTooltip"
                                                        />
                                                        <ColumnDirective
                                                            field="qty"
                                                            format="N2" //{formatFloat}
                                                            editType="numericedit"
                                                            edit={{ params: { showSpinButton: false } }}
                                                            // edit={qtyParams}
                                                            // editTemplate={EditTemplateKuantitas}
                                                            // editTemplate={(args: any) => EditTemplateDetail(args, 'qty')}
                                                            headerText="Kuantitas"
                                                            headerTextAlign="Center"
                                                            textAlign="Right"
                                                            width="65"
                                                            clipMode="EllipsisWithTooltip"
                                                        />
                                                        {stateDokumen?.CON_FPB === 'batal_fpb' || stateDokumen?.CON_FPB === 'harga_fpb' || stateDokumen?.CON_FPB === 'preview' ? (
                                                            <ColumnDirective
                                                                field="outstanding"
                                                                format="N2" //{formatFloat}
                                                                // editType="numericedit"
                                                                // edit={qtyParams}
                                                                //editTemplate={editTemplateQty}
                                                                headerText="Outstanding"
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                width="65"
                                                                clipMode="EllipsisWithTooltip"
                                                            />
                                                        ) : null}
                                                        {stateDokumen?.CON_FPB === 'Approve_Pusat' || stateDokumen?.CON_FPB === 'preview' ? (
                                                            <ColumnDirective
                                                                field="harga_beli_mu"
                                                                format="N2" //{formatFloat}
                                                                editTemplate={(args: any) => EditTemplateDetail(args, 'harga_beli_mu')}
                                                                // editType="numericedit"
                                                                headerText="Harga Beli Net Supplier"
                                                                headerTextAlign="Center"
                                                                textAlign="Right"
                                                                width="75"
                                                                clipMode="EllipsisWithTooltip"
                                                            />
                                                        ) : null}
                                                        {stateDokumen?.isCabang === false &&
                                                        (stateDokumen?.masterKodeDokumen === 'BARU' || stateDokumen?.KirimLangsung === 'Y' || stateDokumen?.CON_FPB === 'preview') ? (
                                                            <ColumnDirective
                                                                field="harga_jual_mu"
                                                                format="N2"
                                                                editTemplate={(args: any) => EditTemplateDetail(args, 'harga_jual_mu')}
                                                                // edit={fieldCekValidasi}
                                                                headerText="Harga Jual Customer"
                                                                headerTextAlign="Center"
                                                                // headerTemplate={() => detailHeader('Harga Jual Customer')}
                                                                textAlign="Right"
                                                                width="75"
                                                                clipMode="EllipsisWithTooltip"
                                                            />
                                                        ) : null}
                                                        <ColumnDirective
                                                            field="harga_mu"
                                                            format="N2" //{formatFloat}
                                                            editTemplate={(args: any) => EditTemplateDetail(args, 'harga_mu')}
                                                            headerText="Harga Beli Cabang"
                                                            headerTextAlign="Center"
                                                            textAlign="Right"
                                                            width="75"
                                                            clipMode="EllipsisWithTooltip"
                                                        />
                                                        {/* <ColumnDirective
                                                            field="diskon"
                                                            format="N2"
                                                            headerText="Diskon (%)"
                                                            headerTextAlign="Center"
                                                            textAlign="Right"
                                                            width="60"
                                                            clipMode="EllipsisWithTooltip"
                                                        />
                                                        <ColumnDirective
                                                            field="potongan_mu"
                                                            format="N2"
                                                            headerText="Potongan"
                                                            headerTextAlign="Center"
                                                            textAlign="Right"
                                                            width="75"
                                                            clipMode="EllipsisWithTooltip"
                                                        /> */}
                                                        {/* <ColumnDirective field="kode_pajak" headerText="Pajak" headerTextAlign="Center" textAlign="Left" width="40" clipMode="EllipsisWithTooltip" /> */}
                                                        <ColumnDirective
                                                            field="jumlah_mu"
                                                            format="N2"
                                                            editTemplate={(args: any) => EditTemplateDetail(args, 'jumlah_mu')}
                                                            headerText="Jumlah"
                                                            headerTextAlign="Center"
                                                            textAlign="Right"
                                                            width="100"
                                                            clipMode="EllipsisWithTooltip"
                                                            allowEditing={false}
                                                            // template={(props: any) => {
                                                            //     return <span>{props.jumlah_mu ? parseFloat(props.jumlah_mu).toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                                            // }}
                                                        />
                                                        <ColumnDirective
                                                            field="berat"
                                                            format="N2"
                                                            headerText="Berat (Kg)"
                                                            headerTextAlign="Center"
                                                            textAlign="Right"
                                                            width="80"
                                                            clipMode="EllipsisWithTooltip"
                                                            allowEditing={false}
                                                            template={(props: any) => {
                                                                return <span>{props.berat ? parseFloat(props.berat).toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                                            }}
                                                        />

                                                        {stateDokumen?.CON_FPB === 'Approve_Pusat' || stateDokumen?.CON_FPB === 'preview' ? (
                                                            <ColumnDirective
                                                                field="tipe_booking"
                                                                editTemplate={templateTipeBooking}
                                                                headerText="Tipe Booking"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="70"
                                                                clipMode="EllipsisWithTooltip"
                                                            />
                                                        ) : null}
                                                        {stateDokumen?.CON_FPB === 'Approve_Pusat' || stateDokumen?.CON_FPB === 'preview' ? (
                                                            <ColumnDirective
                                                                field="no_booking"
                                                                editTemplate={templateNoBooking}
                                                                headerText="No. Supp / PO / GD"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="100"
                                                                clipMode="EllipsisWithTooltip"
                                                            />
                                                        ) : null}
                                                        {stateDokumen?.CON_FPB === 'Approve_Pusat' || stateDokumen?.CON_FPB === 'preview' ? (
                                                            <ColumnDirective
                                                                field="nama_booking"
                                                                // editTemplate={editTemplateSatuan}
                                                                headerText="Nama Supplier / Gudang"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="200"
                                                                clipMode="EllipsisWithTooltip"
                                                                allowEditing={false}
                                                            />
                                                        ) : null}
                                                        {(stateDokumen?.CON_FPB === 'Approve_Pusat' || stateDokumen?.CON_FPB === 'preview') &&
                                                        (masterFpb.kontrak === 'Y' || stateDokumen?.CON_FPB === 'preview') ? (
                                                            <ColumnDirective
                                                                field="kode_entitas"
                                                                // editTemplate={editTemplateSatuan}
                                                                headerText="Entitas"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="50"
                                                                clipMode="EllipsisWithTooltip"
                                                            />
                                                        ) : null}
                                                        {/* {stateDokumen?.CON_FPB === 'Approve_Pusat' || stateDokumen?.CON_FPB === 'preview' ? (
                                                            <ColumnDirective
                                                                field="nama_booking"
                                                                // editTemplate={editTemplateSatuan}
                                                                headerText="Nama Booking"
                                                                headerTextAlign="Center"
                                                                textAlign="Left"
                                                                width="80"
                                                                clipMode="EllipsisWithTooltip"
                                                            />
                                                        ) : null}
                                                        {stateDokumen?.CON_FPB === 'Approve_Pusat' || stateDokumen?.CON_FPB === 'preview' ? (
                                                            <>
                                                                <ColumnDirective
                                                                    field="tipe_booking"
                                                                    // editTemplate={editTemplateSatuan}
                                                                    headerText="Tipe Booking"
                                                                    headerTextAlign="Center"
                                                                    textAlign="Left"
                                                                    width="70"
                                                                    clipMode="EllipsisWithTooltip"
                                                                />

                                                                <ColumnDirective
                                                                    field="no_booking"
                                                                    // editTemplate={editTemplateSatuan}
                                                                    headerText="No. Booking"
                                                                    headerTextAlign="Center"
                                                                    textAlign="Left"
                                                                    width="70"
                                                                    clipMode="EllipsisWithTooltip"
                                                                />

                                                                <ColumnDirective
                                                                    field="nama_booking"
                                                                    // editTemplate={editTemplateSatuan}
                                                                    headerText="Nama Booking"
                                                                    headerTextAlign="Center"
                                                                    textAlign="Left"
                                                                    width="80"
                                                                    clipMode="EllipsisWithTooltip"
                                                                />
                                                                {(stateDokumen?.CON_FPB === 'Approve_Pusat' || stateDokumen?.CON_FPB === 'preview') &&
                                                                (masterFpb.kontrak === 'Y' || stateDokumen?.CON_FPB === 'preview') ? (
                                                                    <ColumnDirective
                                                                        field="kode_entitas"
                                                                        // editTemplate={editTemplateSatuan}
                                                                        headerText="Entitas"
                                                                        headerTextAlign="Center"
                                                                        textAlign="Left"
                                                                        width="50"
                                                                        clipMode="EllipsisWithTooltip"
                                                                    />
                                                                ) : null}
                                                            </>
                                                        ) : null} */}
                                                    </ColumnsDirective>

                                                    <Inject services={[Page, Selection, Edit, CommandColumn, Toolbar, Resize]} />
                                                </GridComponent>
                                            </TooltipComponent>
                                            {/* END TAB 1 */}
                                            {/* TOMBOL TAMBAH DATA BARANG */}
                                            <div style={{ padding: 5 }} className="panel-pager">
                                                <div className="flex gap-14">
                                                    <TooltipComponent content="Baru" opensOn="Hover" openDelay={1000} target="#buAdd1">
                                                        <TooltipComponent content="Edit" opensOn="Hover" openDelay={1000} target="#buEdit1">
                                                            <TooltipComponent content="Hapus" opensOn="Hover" openDelay={1000} target="#buDelete1">
                                                                <TooltipComponent content="Bersihkan" opensOn="Hover" openDelay={1000} target="#buDeleteAll1">
                                                                    <TooltipComponent content="Simpan" opensOn="Hover" openDelay={1000} target="#buPost1">
                                                                        <TooltipComponent content="Batal" opensOn="Hover" openDelay={1000} target="#buCancel1">
                                                                            <div className="mt-1 flex">
                                                                                <ButtonComponent
                                                                                    id="buAdd1"
                                                                                    type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                    cssClass="e-primary e-small"
                                                                                    iconCss="e-icons e-small e-plus"
                                                                                    style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                                                                                    onClick={() => addDefaultRowIfEmpty('new')}
                                                                                />
                                                                                {/* <ButtonComponent
                                                                                id="buEdit1"
                                                                                type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                cssClass="e-primary e-small"
                                                                                iconCss="e-icons e-small e-edit"
                                                                                style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                                                                                onClick={() => DetailBarangEdit(gridTtbList)}
                                                                            /> */}
                                                                                <ButtonComponent
                                                                                    id="buDelete1"
                                                                                    type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                    cssClass="e-warning e-small"
                                                                                    iconCss="e-icons e-small e-trash"
                                                                                    style={{ marginTop: 0 + 'em', marginRight: 0.3 + 'em' }}
                                                                                    onClick={() => DetailBarangDelete()}
                                                                                />
                                                                                <ButtonComponent
                                                                                    id="buDeleteAll1"
                                                                                    type="button" //Solusi tdk refresh halaman saat selesai onClick
                                                                                    cssClass="e-danger e-small"
                                                                                    iconCss="e-icons e-small e-erase"
                                                                                    style={{ marginTop: 0 + 'em', marginRight: 1.5 + 'em' }}
                                                                                    onClick={() => DetailBarangDeleteAll()}
                                                                                />
                                                                                {/* <ButtonComponent
                                                                                id="buSimpanDokumen1"
                                                                                content="Daftar SJ"
                                                                                cssClass="e-primary e-small"
                                                                                iconCss="e-icons e-small e-search"
                                                                                style={{ float: 'right', width: '90px', marginRight: 2.3 + 'em', backgroundColor: '#3b3f5c' }}
                                                                                // onClick={DialogDaftarSj}
                                                                            /> */}
                                                                                {/* <div className="set-font-11" style={{ marginRight: 2 + 'em' }}>
                                                                                <b>Jumlah Barang :</b>&nbsp;&nbsp;&nbsp;{TotalBarang}
                                                                            </div> */}
                                                                            </div>
                                                                        </TooltipComponent>
                                                                    </TooltipComponent>
                                                                </TooltipComponent>
                                                            </TooltipComponent>
                                                        </TooltipComponent>
                                                    </TooltipComponent>
                                                    <div className="mt-2 flex justify-between">
                                                        <label className="inline-flex">
                                                            <input
                                                                id="chKirimLangsung"
                                                                type="checkbox"
                                                                style={{
                                                                    borderColor: '#ffffff',
                                                                }}
                                                                className="form-checkbox "
                                                                checked={stateDokumen?.KirimLangsung === 'Y'}
                                                                value={masterFpb.kirim_langsung_cabang || ''}
                                                            />

                                                            <span className="bg-blue-400 p-0.5">Barang dikirim ke customer CABANG (Kirim Langsung)</span>
                                                        </label>
                                                    </div>
                                                    <div className="mb-3 flex justify-between" style={{ paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ fontSize: '11px' }}>
                                                            <b>Total Berat:</b> <b>{frmNumber(masterFpb.total_berat)} Kg</b>
                                                        </div>

                                                        {/* <div style={{ fontSize: '11px', textAlign: 'right' }}>
                                                            <b>Sub total:</b> <b>{frmNumber('totalMu')}</b>
                                                        </div> */}
                                                    </div>
                                                    <div className="mb-3 flex justify-between" style={{ paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ fontSize: '11px' }}>
                                                            <b>Sub Total :</b> <b>{frmNumber(masterFpb.total_mu)}</b>
                                                        </div>

                                                        {/* <div style={{ fontSize: '11px', textAlign: 'right' }}>
                                                            <b>Sub total:</b> <b>{frmNumber('totalMu')}</b>
                                                        </div> */}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabComponent>
                            </div>

                            {/* ===============  DATA FOOTER========================   */}
                            <div className="grid grid-cols-6 gap-2">
                                <div className="col-span-4">
                                    <div className="mt-1">
                                        <p className="set-font-11">
                                            <b>Catatan :</b>
                                        </p>
                                        <div className="panel-input">
                                            <TextBoxComponent
                                                ref={(t) => {
                                                    // textareaObj = t;
                                                }}
                                                multiline={true}
                                                // created={onCreateMultiline}
                                                value={masterFpb.keterangan || ''}
                                                input={(args: FocusInEventArgs) => {
                                                    const value: any = args.value;
                                                    // HandelCatatan(value, setquMMKketerangan);
                                                    setMasterFpb((prevData: any) => ({
                                                        ...prevData,
                                                        keterangan: value, //args.value,
                                                    }));
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ fontSize: '15px', fontWeight: 'bold' }}>
                                        {/* Terbilang : <span style={{ fontSize: '15px', marginTop: '12px', color: 'green', textTransform: 'capitalize' }}>{terbilang}</span> */}
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <div className={styles['grid-rightNote']}>
                                        {/* diskon dok */}
                                        {/* <div className=" flex justify-between">
                                            <div className="invisible flex" style={{ alignItems: 'center' }}>
                                                <label className="mt-4">Diskon(%)</label>
                                                <input
                                                    // disabled={disableUpdateFile}
                                                    placeholder="%"
                                                    type="text"
                                                    id="diskon"
                                                    className="form-input ml-3 mr-1 md:mb-0 md:w-auto"
                                                    style={{ width: '7vh', height: '3.2vh' }}
                                                    // onChange={(event) => handleDiskonHeaderChange(event.target.value, 'diskon')}
                                                />
                                                =
                                                <input
                                                    // disabled={disableUpdateFile}
                                                    placeholder="Diskon.."
                                                    type="text"
                                                    id="diskonResult"
                                                    className="form-input ml-1 md:w-auto"
                                                    style={{ width: '17vh', height: '3.2vh', textAlign: 'right', fontSize: 16 }}
                                                    // onBlur={(event) => handleDiskonHeaderChange(event.target.value, 'nilaiDiskon')}
                                                />
                                            </div>
                                        </div> */}
                                        {/* <text>DPP</text> */}
                                        <div className="flex" style={{ alignItems: 'center' }}>
                                            <label className="mt-1" style={{ width: 212 }}>
                                                DPP:
                                            </label>
                                            <label className="mt-1" style={{ width: 177, fontWeight: 'bold', fontSize: 16, textAlign: 'right' }}>
                                                {frmNumber(nilaiDpp)}
                                            </label>
                                            {/* <input type="text" id="estimasiBiaya" placeholder="Estimasi.." className="form-input ml-2" style={{ width: '19vh', height: '3.2vh' }} disabled /> */}
                                        </div>
                                        {/* pajak */}
                                        <div className="flex" style={{ alignItems: 'center' }}>
                                            <label className="mt-1" style={{ width: 212 }}>
                                                Pajak:
                                            </label>
                                            <label className="mt-1" style={{ width: 177, fontWeight: 'bold', fontSize: 16, textAlign: 'right' }}>
                                                {frmNumber(masterFpb.total_pajak_mu)}
                                            </label>
                                            {/* <input type="text" id="estimasiBiaya" placeholder="Estimasi.." className="form-input ml-2" style={{ width: '19vh', height: '3.2vh' }} disabled /> */}
                                        </div>
                                        {/* Biaya kirim */}
                                        {/* <div className="invisible flex" style={{ alignItems: 'center' }}>
                                            <label className="mt-1">Estimasi Biaya Kirim</label>
                                            <input
                                                // disabled={disableUpdateFile}
                                                type="text"
                                                id="estimasiBiayaKirim"
                                                placeholder="Estimasi.."
                                                onChange={(event) => {
                                                    // HandleEstBiayaKirim(
                                                    //     event.target.value,
                                                    //     dataDetail,
                                                    //     totalJumlahSetelahPajakKirim,
                                                    //     setTotalJumlahSetelahPajakVariabel,
                                                    //     setNilaiBiayaKirim,
                                                    //     totalJumlahSetelahPajakFilter,
                                                    //     nilaiDiskonHeader
                                                    // )
                                                }}
                                                onBlur={(event) => {
                                                    const estBiayaKirim = document.getElementById('estimasiBiayaKirim') as HTMLInputElement;
                                                    if (estBiayaKirim) {
                                                        // estBiayaKirim.value = frmNumber(nilaiBiayaKirim);
                                                    }
                                                }}
                                                className="form-input ml-2"
                                                style={{ width: '23vh', height: '3.2vh', textAlign: 'right', fontSize: 16 }}
                                                onFocus={(event) => event.target.select()}
                                                onKeyDown={(event) => {
                                                    const char = event.key;
                                                    const isValidChar = /[0-9.\s]/.test(char) || event.keyCode === 8;
                                                    if (!isValidChar) {
                                                        event.preventDefault();
                                                    }
                                                    const inputValue = (event.target as HTMLInputElement).value;
                                                    if (char === '.' && inputValue.includes('.')) {
                                                        event.preventDefault();
                                                    }
                                                }}
                                            />
                                        </div> */}
                                        <div className="mt-3 h-2 border-t-2 border-gray-300"></div>
                                        <div className="flex" style={{ alignItems: 'center' }}>
                                            <label className="mt-1" style={{ width: 212 }}>
                                                Total Setelah Pajak:
                                            </label>
                                            <label className="mt-1" style={{ width: 177, fontWeight: 'bold', fontSize: 16, textAlign: 'right', color: 'red' }}>
                                                {frmNumber(masterFpb.netto_mu)}
                                            </label>
                                            {/* <input type="text" id="estimasiBiaya" placeholder="Estimasi.." className="form-input ml-2" style={{ width: '19vh', height: '3.2vh' }} disabled /> */}
                                        </div>
                                        <div className="flex" style={{ alignItems: 'center' }}>
                                            <label className="mt-1" style={{ width: 212 }}></label>
                                            <label className="mt-1" style={{ width: 177, fontWeight: 'bold', fontSize: 16, textAlign: 'right', color: 'blue' }}>
                                                {/* {valueStringPajak} */}
                                            </label>
                                            {/* <input type="text" id="estimasiBiaya" placeholder="Estimasi.." className="form-input ml-2" style={{ width: '19vh', height: '3.2vh' }} disabled /> */}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* TOMBOL SIMPAN */}
                            {/* <div
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
                                <div className="flex justify-between">
                                    <div className="w-[100%]">
                                        <ButtonComponent
                                            id="buBatal"
                                            content="BATAL"
                                            cssClass="e-primary e-small"
                                            iconCss="e-icons e-small e-close"
                                            style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1 + 'em', backgroundColor: '#3b3f5c' }}
                                            onClick={() => onClose()}
                                        />
                                        <ButtonComponent
                                            id="buOk"
                                            content="OK"
                                            cssClass="e-primary e-small"
                                            iconCss="e-icons e-small e-save"
                                            style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                                            // onClick={simpan}
                                        />
                                    </div>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>
            </DialogComponent>
            {showDialogBarang && (
                <FrmItemDlg
                    isOpen={showDialogBarang}
                    onClose={() => {
                        setShowDialogBarang(false);
                    }}
                    onBatal={() => {
                        setShowDialogBarang(false);
                    }}
                    selectedData={(dataObject: any) => handleSelectedDialogAkun(dataObject)}
                    target={'frmFPB'}
                    stateDokumen={stateDokumen}
                    // listAkunJurnalObjek={listAkunJurnal}
                />
            )}
            {showDialogEntitas && (
                <FrmEntitasDlg
                    isOpen={showDialogEntitas}
                    onClose={() => {
                        setShowDialogEntitas(false);
                    }}
                    onBatal={() => {
                        setShowDialogEntitas(false);
                    }}
                    selectedData={(dataObject: any) => handleSelectedDialogEntitas(dataObject)}
                    target={'frmFPB'}
                    stateDokumen={stateDokumen}
                    // listAkunJurnalObjek={listAkunJurnal}
                />
            )}
            {showDialogTerminPusat && (
                <FrmTerminDlgPusat
                    isOpen={showDialogTerminPusat}
                    onClose={() => {
                        setShowDialogTerminPusat(false);
                    }}
                    onBatal={() => {
                        setShowDialogTerminPusat(false);
                    }}
                    selectedData={(dataObject: any) => handleSelectedDialogTerminPusat(dataObject)}
                    target={'frmFPB'}
                    stateDokumen={stateDokumen}
                    // listAkunJurnalObjek={listAkunJurnal}
                />
            )}
            {showDialogTerminCabang && (
                <FrmTerminDlgCabang
                    isOpen={showDialogTerminCabang}
                    onClose={() => {
                        setShowDialogTerminCabang(false);
                    }}
                    onBatal={() => {
                        setShowDialogTerminCabang(false);
                    }}
                    selectedData={(dataObject: any) => handleSelectedDialogTerminCabang(dataObject)}
                    target={'frmFPB'}
                    stateDokumen={stateDokumen}
                    // listAkunJurnalObjek={listAkunJurnal}
                />
            )}
            {showDialogSo && (
                <FrmDaftarSoDlg
                    isOpen={showDialogSo}
                    onClose={() => {
                        setShowDialogSo(false);
                    }}
                    onBatal={() => {
                        setShowDialogSo(false);
                    }}
                    selectedDataDetail={(dataObject: any) => handleSelectedDaftarSo(dataObject)}
                    target={'frmFPB'}
                    stateDokumen={stateDokumen}
                    entitasFpb={masterFpb.kode_entitas}
                    // listAkunJurnalObjek={listAkunJurnal}
                />
            )}
            {showDialogPoGrup && (
                <FrmGrupDlg
                    isOpen={showDialogPoGrup}
                    onClose={() => {
                        setShowDialogPoGrup(false);
                    }}
                    onBatal={() => {
                        setShowDialogPoGrup(false);
                    }}
                    selectedData={(dataObject: any) => handleSelectedDialogPoGrup(dataObject)}
                    target={'frmFPB'}
                    stateDokumen={stateDokumen}
                />
            )}
            {showDlgPpnAtasNama && (
                <FrmPpnAtasNamaDlg
                    isOpen={showDlgPpnAtasNama}
                    onClose={() => {
                        setShowDlgPpnAtasNama(false);
                    }}
                    onBatal={() => {
                        setShowDlgPpnAtasNama(false);
                    }}
                    selectedData={(dataObject: any) => handleSelectedDialogPpnAtasNama(dataObject)}
                    target={'frmFPB'}
                    stateDokumen={stateDokumen}
                    // listAkunJurnalObjek={listAkunJurnal}
                />
            )}
            {showDlgSupplier && (
                <FrmSupplierDlg
                    isOpen={showDlgSupplier}
                    onClose={() => {
                        setShowDlgSupplier(false);
                    }}
                    onBatal={() => {
                        setShowDlgSupplier(false);
                    }}
                    selectedData={(dataObject: any) => handleSelectedDialogSupplier(dataObject)}
                    target={'frmFPB'}
                    stateDokumen={stateDokumen}
                    // listAkunJurnalObjek={listAkunJurnal}
                />
            )}
            {showDlgSupplierNoBooking && (
                <FrmSupplierDlgNoBooking
                    isOpen={showDlgSupplierNoBooking}
                    onClose={() => {
                        setShowDlgSupplierNoBooking(false);
                    }}
                    onBatal={() => {
                        setShowDlgSupplierNoBooking(false);
                    }}
                    selectedData={(dataObject: any) => handleSelectedDialogSupplierNoBooking(dataObject)}
                    target={'frmFPB'}
                    stateDokumen={stateDokumen}
                    // listAkunJurnalObjek={listAkunJurnal}
                />
            )}
            {showDlgFpbStok && (
                <FrmFpbStokDlg
                    isOpen={showDlgFpbStok}
                    onClose={() => {
                        setShowDlgFpbStok(false);
                    }}
                    onBatal={() => {
                        setShowDlgFpbStok(false);
                    }}
                    selectedData={(dataObject: any) => handleSelectedDialogStok(dataObject)}
                    target={'frmFPB'}
                    stateDokumen={stateDokumen}
                    kode_entitas_pusat={stateDokumen?.kode_entitas}
                    kode_item={kodeItem}
                    diskripsi={diskripsi}
                    // listAkunJurnalObjek={listAkunJurnal}
                />
            )}
            {showDlgPoOutStanding && (
                <FrmFpbPoOutStanding
                    isOpen={showDlgPoOutStanding}
                    onClose={() => {
                        setShowDlgPoOutStanding(false);
                    }}
                    onBatal={() => {
                        setShowDlgPoOutStanding(false);
                    }}
                    selectedData={(dataObject: any) => handleSelectedDialogOutStanding(dataObject)}
                    target={'frmFPB'}
                    stateDokumen={stateDokumen}
                    kode_entitas_pusat={stateDokumen?.kode_entitas}
                    kode_item={kodeItem}
                    diskripsi={diskripsi}
                    // listAkunJurnalObjek={listAkunJurnal}
                />
            )}
        </>
    );
};
export default FrmFpb;
