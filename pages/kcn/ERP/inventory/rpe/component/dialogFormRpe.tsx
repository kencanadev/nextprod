import { ButtonComponent, RadioButtonComponent } from '@syncfusion/ej2-react-buttons';
import { Dialog, DialogComponent, ButtonPropsModel } from '@syncfusion/ej2-react-popups';
import { Tab, TabComponent } from '@syncfusion/ej2-react-navigations';
import { Tooltip, TooltipComponent, TooltipEventArgs } from '@syncfusion/ej2-react-popups';
import { FocusInEventArgs, ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown } from '@syncfusion/ej2-react-dropdowns';
import { DatePickerComponent, MaskedDateTime, ChangeEventArgs as ChangeEventArgsCalendar, RenderDayCellEventArgs } from '@syncfusion/ej2-react-calendars';
import { DataManager } from '@syncfusion/ej2-data';
import { Grid, GridComponent, ColumnDirective, ColumnsDirective, CommandColumn, Inject, Page, Edit, Toolbar, Resize, Selection } from '@syncfusion/ej2-react-grids';
import { Internationalization, loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import * as gregorian from 'cldr-data/main/id/ca-gregorian.json';
import * as numbers from 'cldr-data/main/id/numbers.json';
import * as timeZoneNames from 'cldr-data/main/id/timeZoneNames.json';
import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as weekData from 'cldr-data/supplemental/weekData.json'; // To load the culture based first day of week
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);
import idIDLocalization from 'public/syncfusion/locale.json';
L10n.load(idIDLocalization);
import * as ReactDom from 'react-dom';
import * as React from 'react';
import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import moment from 'moment';
import swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import GlobalProgressBar from '@/components/GlobalProgressBar';

// Pakai fungsi dari routines ============================
import { DiskonByCalc, FillFromSQL, fetchPreferensi, formatNumber, frmNumber, tanpaKoma, generateNU, generateNUDivisi, showLoading } from '@/utils/routines';
//========================================================

import { useRouter } from 'next/router';

import styles from './spp.module.css';
import stylesTtb from '../ttblist.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faPlay, faSave, faBackward, faCancel, faFileArchive, faCamera, faTimes } from '@fortawesome/free-solid-svg-icons';
import {
    GetDlgDetailSjItem,
    GetListAkunJurnal,
    GetListAreaJualRpe,
    GetListDeptRpe,
    GetListEditRpe,
    GetListKeuangan,
    GetListKryRpe,
    GetListSettingRpe,
    GetListSubledger,
    GetMasterAlasan,
    PatchUpdateTtb,
    PostSimpanAudit,
    PostSimpanTtb,
} from '../model/api';
import { ReCalcDataNodes } from '../functional/reCalc';
import TemplateHeaderRpe from '../interface/templateHeader';
import TemplateDetailRpe from '../interface/templateDetail';
import TemplateDetailApproveRpe from '../interface/templateDetailApprove';
import TemplateFooterRpe from '../interface/templateFooter';
import DialogHargaEkspedisi from '../modal/DialogHargaEkspedisi';
import { HandleCloseZoom, HandleZoomIn, HandleZoomOut, CekPeriodeAkutansi, CekTglMinusSatu, CurrencyFormat } from '../functional/fungsiFormRpe';
import { useProgress } from '@/context/ProgressContext';
import Swal from 'sweetalert2';
import { Terbilang } from '../../../fa/ppi/functional/fungsiFormPpiList';
enableRipple(true);

interface dialogFormRpeProps {
    userid: any;
    kode_entitas: any;
    entitas: any;
    masterKodeDokumen: any;
    masterDataState: any;
    isOpen: boolean;
    onClose: any;
    kode_user: any;
    onRefresh: any;
    token: any;
    onRefreshTipe: any;
    handleRefreshData: any;
}

let tabPhuList: Tab | any;
let varTombol: any;
const DialogFormRpe: React.FC<dialogFormRpeProps> = ({
    userid,
    kode_entitas,
    entitas,
    masterKodeDokumen,
    masterDataState,
    isOpen,
    onClose,
    kode_user,
    onRefresh,
    token,
    onRefreshTipe,
    handleRefreshData,
}: dialogFormRpeProps) => {
    type DataNodes = {
        id: any;
        kode_rpe: any;
        id_rpe: any;
        pay: any;
        harga_eks: any;
        kode_fbm: any;
        no_fbm: any;
        tgl_fbm: any;
        kode_supp: any;
        via: any;
        kode_mu: any;
        kurs: any;
        kurs_pajak: any;
        waktuCeklis: any;
        kena_pajak: any;
        total_rp: any;
        netto_rp: any;
        total_berat: any;
        total_berat_ekspedisi: any;
        total_berat_pabrik: any;
        total_klaim_ekspedisi: any;
        total_klaim_pabrik: any;
        no_mb: any;
        nopol: any;
        tgl_mb: any;
        nama_relasi: any;
        kode_gudang: any;
        kode_tujuan: any;
        toleransi: any;
        realisasi: any;
        pph23: any;
        harga_tambahan: any;
        nama_gudang: any;
        nama_tujuan: any;
        byr: any;
        nilai_pph: any;
        jenis_kirim: any;
        jenis_mobil: any;
        ket_klaim_eks: any;
        idChecked: any;
        tambahan_jarak: any;
    };
    type DataJurnal = {
        kode_dokumen: any;
        id_dokumen: any;
        id: any;
        dokumen: any;
        tgl_dokumen: any;
        kode_akun: any;
        no_akun: any;
        nama_akun: any;
        tipe: any;
        kode_subledger: any;
        no_subledger: any;
        nama_subledger: any;
        kurs: any;
        kode_mu: any;
        debet_rp: any;
        kredit_rp: any;
        jumlah_rp: any;
        jumlah_mu: any;
        catatan: any;
        persen: any;
        kode_dept: any;
        kode_kerja: any;
        approval: any;
        posting: any;
        rekonsiliasi: any;
        tgl_rekonsil: any;
        userid: any;
        tgl_update: any;
        nama_dept: any;
        nama_kerja: any;
        isledger: any;
        subledger: any;
        no_warkat: any;
        tgl_valuta: any;
        no_kerja: any;
    };
    type DataKeuangan = {
        kode_dokumen: any;
        dokumen: any;
        no_dokumen: any;
        tgl_dokumen: any;
        no_warkat: any;
        tgl_valuta: any;
        kode_cust: any;
        kode_akun_debet: any;
        kode_supp: any;
        kode_akun_kredit: any;
        kode_akun_diskon: any;
        kurs: any;
        debet_rp: any;
        kredit_rp: any;
        jumlah_rp: any;
        jumlah_mu: any;
        pajak: any;
        kosong: any;
        kepada: any;
        catatan: any;
        status: any;
        userid: any;
        tgl_update: any;
        status_approved: any;
        tgl_approved: any;
        tgl_pengakuan: any;
        no_ttp: any;
        tgl_ttp: any;
        kode_sales: any;
        kode_fk: any;
        approval: any;
        tgl_setorgiro: any;
        faktur: any;
        barcode: any;
        komplit: any;
        validasi1: any;
        validasi2: any;
        validasi3: any;
        validasi_ho2: any;
        validasi_ho3: any;
        validasi_catatan: any;
        tolak_catatan: any;
        kode_kry: any;
        tgl_trxdokumen: any;
        api_id: any;
        api_pending: any;
        api_catatan: any;
        api_norek: any;
        kode_aktiva: any;
        kode_rpe: any;
        kode_phe: any;
        kode_rps: any;
        kode_um: any;
        no_kontrak_um: any;
        bm_pos: any;
        batal: any;
    };
    type DataNodesHargaEkspedisi = {
        id: any;
        ekspedisi: any;
        jenis_mobil: any;
        nama_jarak: any;
        jenis_kirim: any;
        harga: any;
        harga_tambahan: any;
        userid: any;
        tgl_update: any;
        max_tonase: any;
        min_tonase: any;
        kirim: any;
    };
    const { startProgress, updateProgress, endProgress, setLoadingMessage } = useProgress();
    const [stateDataHeader, setStateDataHeader] = useState({
        tanggal: moment(),
        noRpe: '',
        kodeRpe: '',
        tglEfektif: moment(),
        namaEkspedisi: '',
        fakturEkspedisi: '',
        catatanPph23: '',
        nilaiPph23: '',
        kodepph23: '',
        nominalInvoice: 0,
        disabledComponent: false,
        disabledBayarAllInvoice: true,
        disabledResetPembayaran: true,
        disabledBatalSemuaPembayaran: false,
        disabledBatalInvoice: true,
        dialogDaftarHargaEkspedisiVisible: false,
        terbilangJumlah: '',
        isOpenPreview: false,
        isDragging: false,
        imageDataUrl: '',
        dateGenerateNu: moment(),
        approval: '',
        tgl_approval: '',

        indexPreview: '',
        indexId: '',
        kodeDokumen: '',
        kodeDokumenRev: '',
    });

    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [zoomScale, setZoomScale] = useState(0.5);

    const [stateDataFooter, setStateDataFooter] = useState({
        subTotal: 0,
        tambahanJarak: 0,
        biayaLainLain: 0,
        totalTagihan: 0,
        nominalInvoice: 0,
        totalBayar: 0,
        totalKlaimEkspedisiFbm: 0,
        potonganEkspedisiLain: 0,
        nilaiPph23: 0,
        totalPembayaran: 0,
        beratTotal: 0,
        beratKlaim: 0,
        keteranganBiayaLainLain: '',
        ketPotonganEkspedisiLain: '',
    });

    const [filesUpload, setFilesUpload] = useState<File[]>([]);
    const [dataBarang, setDataBarang] = useState<{ nodes: DataNodes[] }>({ nodes: [] });
    const [dataJurnal, setDataJurnal] = useState<{ nodes: DataJurnal[] }>({ nodes: [] });
    const [dataKeuangan, setDataKeuangan] = useState<{ nodes: DataKeuangan[] }>({ nodes: [] });
    const [stateDataArray, setStateDataArray] = useState<{
        dataHargaEkspedisi: any[];
    }>({
        dataHargaEkspedisi: [],
    });
    const router = useRouter();

    //======= Setting tampilan sweet alert  =========
    const swalDialog = swal.mixin({
        customClass: {
            confirmButton: 'btn btn-dark btn-sm',
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

    const swalPopUp = swal.mixin({
        toast: true,
        position: 'center',
        customClass: {
            popup: 'colored-toast',
        },
        showConfirmButton: false,
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

    //======== FILE PENDUKUNG =========
    const [files, setFiles] = useState<File[]>([]);
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [selectedNamaFiles, setNamaFiles] = useState<any>([]);
    const formattedName = moment().format('YYMMDDHHmmss');

    // const handleFileUpload = (event: any) => {
    //     const newFiles = Array.from(event.target.files);
    //     setFiles((prevFiles: any) => [...prevFiles, ...newFiles]);

    //     const newNamaFiles = new Array(newFiles.length).fill(formattedName);
    //     setNamaFiles((prevNamaFiles: any) => [...prevNamaFiles, ...newNamaFiles]);
    // };

    const handleFileUpload = (event: any) => {
        const newFiles = Array.from(event.target.files);
        setFiles((prevFiles: any) => [...prevFiles, ...newFiles]);
        setFilesUpload((prevFiles: any) => [...prevFiles, ...newFiles]);
    };

    function terbilang(nilaiDefault: any) {
        const result = CurrencyFormat(nilaiDefault);
        // Fungsi untuk mengonversi karakter pertama menjadi huruf kapital
        const capitalizeFirstLetter = (str: any) => {
            return str.charAt(0).toUpperCase() + str.slice(1);
        };

        // Kata yang ingin diubah
        const originalString = Terbilang(nilaiDefault);

        // Mengonversi karakter pertama menjadi huruf kapital
        const capitalizedString = capitalizeFirstLetter(originalString);
        return capitalizedString;
    }

    const base64ToBlob = (base64: string, mimeType: string): Blob => {
        try {
            if (!base64 || typeof base64 !== 'string') {
                throw new Error('Base64 string tidak valid');
            }

            const cleanBase64 = base64.replace(/^data:image\/[a-z]+;base64,/, ''); // Hapus prefix
            const byteCharacters = atob(cleanBase64); // Decode base64
            const byteNumbers = new Uint8Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            return new Blob([byteNumbers], { type: mimeType });
        } catch (error) {
            console.error('❌ Error decoding base64:', error);
            return new Blob(); // Return Blob kosong jika gagal
        }
    };

    const addFilesFromData = (loadImages: any) => {
        const formattedData = loadImages.map((item: any) => ({
            ...item,
            name: item.fileoriginal, // Tambahkan properti 'name'
        }));

        const formattedDataUpload = loadImages
            .map((item: any) => {
                if (!item.decodeBase64_string || typeof item.decodeBase64_string !== 'string') {
                    return null;
                }

                try {
                    const base64Data = item.decodeBase64_string.replace(/^data:image\/[a-z]+;base64,/, ''); // Hapus prefix
                    const mimeTypeMatch = item.decodeBase64_string.match(/^data:(image\/[a-z]+);base64,/);
                    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg'; // Default ke JPEG jika tidak ditemukan

                    const fileData = base64ToBlob(base64Data, mimeType);
                    if (!fileData) {
                        return null;
                    }

                    const newFile = new File([fileData], item.fileoriginal || 'default.jpg', { type: mimeType });

                    return newFile;
                } catch (error) {
                    return null;
                }
            })
            .filter(Boolean); // Hapus nilai null

        setFiles((prevFiles: any) => [...prevFiles, ...formattedData]);
        setFilesUpload((prevFiles) => [...prevFiles, ...formattedDataUpload]); // Update state
    };

    //======== Datasource =========
    const refreshDatasource = async () => {
        // masterDataStateRef.current = masterDataState;

        setShowLoader(true);
        if (kode_entitas !== null || kode_entitas !== '') {
            try {
                if (masterDataState === 'BARU') {
                    await ReCallRefreshModal();
                    // const respHargaEkspedisi: any[] = await GetListHargaEkspedisi(kode_entitas);
                    // setStateDataArray((prevState: any) => ({
                    //     ...prevState,
                    //     dataHargaEkspedisi: respHargaEkspedisi,
                    // }));
                } else if (masterDataState === 'EDIT' || masterDataState === 'APPROVE' || masterDataState === 'BATAL_APPROVE') {
                    await ReCallRefreshModal();

                    // setRefreshKeyNamaEkspedisi((prevKey: any) => prevKey + 1);
                    const responsData = await GetListEditRpe(kode_entitas, masterKodeDokumen, 'baru', token);
                    // console.log('responsData.data.master = ', responsData.data.master);

                    if (responsData.status === true) {
                        console.log('masterKodeDokumen :', responsData.data);
                        setStateDataHeader((prevSate: any) => ({
                            ...prevSate,
                            kodeRpe: responsData.data.master.kode_rpe,
                            tanggal: moment(responsData.data.master.tgl_rpe),
                            noRpe: responsData.data.master.no_rpe,
                            namaEkspedisi: responsData.data.master.via,
                            fakturEkspedisi: responsData.data.master.no_reff,
                            kodepph23: responsData.data.master.pph23,
                            catatanPph23: responsData.data.master.catatan,
                            nilaiPph23: responsData.data.master.nilai,
                            nominalInvoice: responsData.data.master.bayar_mu,
                            kodeDokumen: responsData.data.master.kode_dokumen,
                            kodeDokumenRev: responsData.data.master.kode_dokumen_rev,
                            terbilangJumlah: terbilang(parseFloat(responsData.data.master.bayar_mu)),
                        }));
                        // stateDataHeader.kodeRpe = responsData.data.master.kode_rpe;
                        // stateDataHeader.tanggal = moment(responsData.data.master.tgl_rpe);
                        // stateDataHeader.noRpe = responsData.data.master.no_rpe;
                        // stateDataHeader.namaEkspedisi = responsData.data.master.via;
                        // stateDataHeader.fakturEkspedisi = responsData.data.master.no_reff;
                        // stateDataHeader.kodepph23 = responsData.data.master.pph23;
                        // stateDataHeader.catatanPph23 = responsData.data.master.catatan;
                        // stateDataHeader.nilaiPph23 = responsData.data.master.nilai;
                        // stateDataHeader.nominalInvoice = responsData.data.master.bayar_mu;
                        // stateDataHeader.kodeDokumen = responsData.data.master.kode_dokumen;
                        // stateDataHeader.kodeDokumenRev = responsData.data.master.kode_dokumen_rev;
                        // stateDataHeader.terbilangJumlah = terbilang(parseFloat(responsData.data.master.bayar_mu));

                        const namaEkspedisi = document.getElementById('namaEkspedisi') as HTMLInputElement;
                        if (namaEkspedisi) {
                            namaEkspedisi.value = responsData.data.master.via;
                        }

                        const fakturEkspedisi = document.getElementById('fakturEkspedisi') as HTMLInputElement;
                        if (fakturEkspedisi) {
                            fakturEkspedisi.value = responsData.data.master.no_reff;
                        }

                        const catatanPph23 = document.getElementById('catatanPph23') as HTMLInputElement;
                        if (catatanPph23) {
                            catatanPph23.value = responsData.data.master.catatan;
                        }

                        const nominalInvoice = document.getElementById('nominalInvoice') as HTMLInputElement;
                        if (nominalInvoice) {
                            nominalInvoice.value = formatNumber(parseFloat(responsData.data.master.bayar_mu));
                        }

                        console.log('sdfdsfgdsgdsg = ', responsData.data.master.pph23);
                        Promise.all(
                            responsData.data.detail.map((item: any, index: any) => {
                                return {
                                    id: index,
                                    kode_rpe: item.kode_rpe,
                                    id_rpe: item.id_rpe,
                                    pay: item.pay,
                                    harga_eks: parseFloat(item.harga_eks),
                                    kode_fbm: item.kode_fbm,
                                    no_fbm: item.no_fbm,
                                    tgl_fbm: item.tgl_fbm,
                                    kode_supp: item.kode_supp,
                                    via: item.via,
                                    kode_mu: item.kode_mu,
                                    kurs: item.kurs,
                                    kurs_pajak: item.kurs_pajak,
                                    waktuCeklis: item.waktuCeklis,
                                    kena_pajak: item.kena_pajak,
                                    total_rp: parseFloat(item.total_rp),
                                    netto_rp: parseFloat(item.netto_rp),
                                    total_berat: item.total_berat,
                                    total_berat_ekspedisi: item.total_berat_ekspedisi,
                                    total_berat_pabrik: item.total_berat_pabrik,
                                    total_klaim_ekspedisi: parseFloat(item.total_klaim_ekspedisi),
                                    total_klaim_pabrik: parseFloat(item.total_klaim_pabrik),
                                    no_mb: item.no_mb,
                                    nopol: item.nopol,
                                    tgl_mb: item.tgl_mb,
                                    nama_relasi: item.nama_relasi,
                                    kode_gudang: item.kode_gudang,
                                    kode_tujuan: item.kode_tujuan,
                                    toleransi: item.toleransi,
                                    realisasi: item.realisasi,
                                    pph23: item.pph23,
                                    harga_tambahan: parseFloat(item.harga_tambahan),
                                    tambahan_jarak: parseFloat(item.harga_tambahan),
                                    nama_gudang: item.nama_gudang,
                                    nama_tujuan: item.nama_tujuan,
                                    byr: item.byr,
                                    nilai_pph: item.nilai_pph,
                                    jenis_kirim: item.jenis_kirim,
                                    jenis_mobil: item.jenis_mobil,
                                    ket_klaim_eks: item.ket_klaim_eks,
                                    idChecked: item.id_rpe,
                                };
                            })
                        ).then((newData) => {
                            setDataBarang((state: any) => {
                                const existingNodes = state.nodes.filter((node: any) => node.kode_rpe === masterKodeDokumen);
                                const newNodes = [...existingNodes, ...newData.filter((data: any) => data !== null)];
                                return { ...state, nodes: newNodes }; // Memperbarui nodes dengan data yang diperbarui
                            });
                        });

                        const nodeDetail = responsData.data.detail.filter((item: any) => item.byr === 'Y');
                        //  const totalBerat = responsData.data.detail.filter((item: any) => item.byr === 'Y');

                        let totTambahanJarak = nodeDetail.reduce((acc: number, node: any) => {
                            return acc + parseFloat(node.harga_tambahan);
                        }, 0);

                        let totBerat = nodeDetail.reduce((acc: number, node: any) => {
                            return acc + parseFloat(node.total_berat);
                        }, 0);

                        let totBeratKlaim = nodeDetail.reduce((acc: number, node: any) => {
                            return acc + parseFloat(node.total_berat_ekspedisi);
                        }, 0);

                        // const total_tagihan = totNettoRp + tambahanJarak + parseFloat(dataObject.biayaLainLain);
                        //  const total_bayar = dataObject.nominalInvoice > 0 ? (total_tagihan > dataObject.nominalInvoice ? dataObject.nominalInvoice : total_tagihan) : 0;

                        const total_tagihan = parseFloat(responsData.data.master.sub_total) + totTambahanJarak + parseFloat(responsData.data.master.biaya_lain);
                        const total_bayar = responsData.data.master.bayar_mu > 0 ? (total_tagihan > responsData.data.master.bayar_mu ? responsData.data.master.bayar_mu : total_tagihan) : 0;
                        //  console.log(responsData.data.master.sub_total,'tttttttttttttt');
                        setStateDataFooter((prevState) => ({
                            ...prevState,
                            keteranganBiayaLainLain: responsData.data.master.ket_biaya,
                            ketPotonganEkspedisiLain: responsData.data.master.keterangan,
                            subTotal: responsData.data.master.sub_total,
                            tambahanJarak: totTambahanJarak,
                            biayaLainLain: responsData.data.master.biaya_lain,
                            totalTagihan: parseFloat(responsData.data.master.sub_total) + parseFloat(totTambahanJarak) + parseFloat(responsData.data.master.biaya_lain),
                            nominalInvoice: responsData.data.master.bayar_mu,
                            totalBayar: total_bayar,
                            totalKlaimEkspedisiFbm: responsData.data.master.total_klaim_ekspedisi,
                            potonganEkspedisiLain: responsData.data.master.potongan_lain,
                            nilaiPph23: responsData.data.master.total_pph,
                            totalPembayaran: total_bayar - responsData.data.master.total_klaim_ekspedisi - responsData.data.master.total_pph - responsData.data.master.potongan_lain,
                            beratTotal: totBerat,
                            beratKlaim: totBeratKlaim,
                        }));
                        // stateDataFooter.keteranganBiayaLainLain = responsData.data.master.ket_biaya;
                        // stateDataFooter.ketPotonganEkspedisiLain = responsData.data.master.keterangan;
                        // stateDataFooter.subTotal = responsData.data.master.sub_total;
                        // stateDataFooter.tambahanJarak = totTambahanJarak;
                        // stateDataFooter.biayaLainLain = responsData.data.master.biaya_lain;
                        // stateDataFooter.totalTagihan = parseFloat(responsData.data.master.sub_total) + parseFloat(totTambahanJarak) + parseFloat(responsData.data.master.biaya_lain);
                        // stateDataFooter.nominalInvoice = responsData.data.master.bayar_mu;
                        // stateDataFooter.totalBayar = total_bayar;
                        // stateDataFooter.totalKlaimEkspedisiFbm = responsData.data.master.total_klaim_ekspedisi;
                        // stateDataFooter.potonganEkspedisiLain = responsData.data.master.potongan_lain;
                        // stateDataFooter.nilaiPph23 = responsData.data.master.total_pph;
                        // stateDataFooter.totalPembayaran = total_bayar - responsData.data.master.total_pph - responsData.data.master.potongan_lain;
                        // stateDataFooter.beratTotal = totBerat;
                        // stateDataFooter.beratKlaim = totBeratKlaim;
                        //console.log('uuuuuuuuuuu', frmNumber(responsData.data.master.total_pph));

                        const biayaLainLain = (await document.getElementById('biayaLainLain')) as HTMLInputElement;
                        if (biayaLainLain) {
                            biayaLainLain.value = frmNumber(responsData.data.master.biaya_lain);
                        }

                        const potonganEkspedisi = (await document.getElementById('potonganEkspedisi')) as HTMLInputElement;
                        if (potonganEkspedisi) {
                            potonganEkspedisi.value = frmNumber(tanpaKoma(responsData.data.master.potongan_lain));
                        }

                        const keteranganBiayalainLain = (await document.getElementById('keteranganBiayalainLain')) as HTMLInputElement;
                        if (keteranganBiayalainLain) {
                            keteranganBiayalainLain.value = responsData.data.master.ket_biaya;
                        }

                        const ketPotonganEkspedisiLain = (await document.getElementById('ketPotonganEkspedisiLain')) as HTMLInputElement;
                        if (ketPotonganEkspedisiLain) {
                            ketPotonganEkspedisiLain.value = responsData.data.master.keterangan;
                        }
                    }

                    //FILE PENDUKUNG
                    const filependukung = await axios.get(`${apiUrl}/erp/load_fileGambar?`, {
                        params: {
                            entitas: kode_entitas,
                            param1: kode_entitas + 'RPE' + masterKodeDokumen,
                        },
                    });

                    // console.log('filependukung.data.data');
                    // console.log(filependukung.data.data);
                    // setFiles(filependukung.data.data);
                    addFilesFromData(filependukung.data.data);
                } else {
                }
            } catch (error) {
                console.error(error);
            }
        }
        if (kode_entitas == null || kode_entitas == '') {
            withReactContent(swalDialog).fire({
                title: `<p style="font-size:12px">Sesi login telah habis, silahkan login kembali.</p>`,
                icon: 'error',
                width: '360px',
                heightAuto: true,
            });

            setTimeout(() => {
                router.push({ pathname: '/' });
            }, 1000);
        } else {
            setShowLoader(false);
        }
    };

    useEffect(() => {
        refreshDatasource();
    }, [onRefreshTipe]);

    // Loading data indicator
    const [showLoader, setShowLoader] = useState(true);
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

    //======= Disable hari minggu di calendar ========
    function onRenderDayCell(args: RenderDayCellEventArgs): void {
        if ((args.date as Date).getDay() === 0) {
            args.isDisabled = true;
        }
    }

    const [refreshKeyNamaEkspedisi, setRefreshKeyNamaEkspedisi] = useState(0);

    const closeDialogRpeList = async () => {
        await ReCallRefreshModal();
        await onClose();
        setRefreshKeyNamaEkspedisi((prevKey: any) => prevKey + 1);
        // await onRefreshTipe(kodeDokumen);
    };

    const ReCallRefreshModal = async () => {
        console.log('aaaaaa');

        const namaEkspedisi = document.getElementById('namaEkspedisi') as HTMLInputElement;
        if (namaEkspedisi) {
            namaEkspedisi.value = '';
        }
        const catatanPph23 = document.getElementById('catatanPph23') as HTMLInputElement;
        if (catatanPph23) {
            catatanPph23.value = '';
        }
        const fakturEkspedisi = document.getElementById('fakturEkspedisi') as HTMLInputElement;
        if (fakturEkspedisi) {
            fakturEkspedisi.value = '';
        }
        const nominalInvoice = document.getElementById('nominalInvoice') as HTMLInputElement;
        if (nominalInvoice) {
            nominalInvoice.value = '';
        }
        const biayaLainLain = document.getElementById('biayaLainLain') as HTMLInputElement;
        if (biayaLainLain) {
            biayaLainLain.value = '';
        }
        const potonganEkspedisi = document.getElementById('potonganEkspedisi') as HTMLInputElement;
        if (potonganEkspedisi) {
            potonganEkspedisi.value = '';
        }
        const keteranganBiayalainLain = document.getElementById('keteranganBiayalainLain') as HTMLInputElement;
        if (keteranganBiayalainLain) {
            keteranganBiayalainLain.value = '';
        }
        const ketPotonganEkspedisiLain = document.getElementById('ketPotonganEkspedisiLain') as HTMLInputElement;
        if (ketPotonganEkspedisiLain) {
            ketPotonganEkspedisiLain.value = '';
        }

        setDataBarang((prevState) => ({
            ...prevState,
            nodes: [],
        }));

        if (masterDataState === 'BARU') {
            let noDok: any;

            await generateNU(kode_entitas, '', '85', stateDataHeader.dateGenerateNu.format('YYYYMM'))
                .then((result) => {
                    noDok = result;
                })
                .catch((error) => {
                    console.error('Error:', error);
                });

            setStateDataHeader((state: any) => ({
                ...state,
                tanggal: moment(),
                noRpe: noDok,
                kodeRpe: '',
                tglEfektif: moment(),
                namaEkspedisi: '',
                fakturEkspedisi: '',
                catatanPph23: '',
                nilaiPph23: '',
                kodepph23: '',
                nominalInvoice: 0,
                disabledComponent: false,
                disabledBayarAllInvoice: true,
                disabledResetPembayaran: true,
                disabledBatalSemuaPembayaran: false,
                disabledBatalInvoice: true,
                dialogDaftarHargaEkspedisiVisible: false,
                terbilangJumlah: '',
                isOpenPreview: false,
                isDragging: false,
                imageDataUrl: '',
                dateGenerateNu: moment(),
                approval: '',
                tgl_approval: '',

                indexPreview: '',
                indexId: '',
                kodeDokumen: '',
                kodeDokumenRev: '',
            }));
        }

        if (masterDataState === 'BARU') {
            setStateDataFooter((prevState) => ({
                ...prevState,
                subTotal: 0,
                tambahanJarak: 0,
                biayaLainLain: 0,
                totalTagihan: 0,
                nominalInvoice: 0,
                totalBayar: 0,
                totalKlaimEkspedisiFbm: 0,
                potonganEkspedisiLain: 0,
                nilaiPph23: 0,
                totalPembayaran: 0,
                keteranganBiayaLainLain: '',
                ketPotonganEkspedisiLain: '',
                beratKlaim: 0,
                beratTotal: 0,
            }));
        }

        setDataJurnal((state: any) => ({
            ...state,
            nodes: [],
        }));

        //file pendukung
        setFiles([]);
        setFilesUpload([]);
        setPreviewFile(null);
    };

    const handleMouseMove = (event: any) => {
        if (stateDataHeader.isDragging) {
            setPosition({
                x: event.clientX - offset.x,
                y: event.clientY - offset.y,
            });
        }
    };

    const handleMouseUp = () => {
        setStateDataHeader((prevState: any) => ({
            ...prevState,
            isDragging: false,
        }));
    };

    const handleMouseDown = (event: any) => {
        setStateDataHeader((prevState: any) => ({
            ...prevState,
            isDragging: true,
        }));
        setOffset({
            x: event.clientX - position.x,
            y: event.clientY - position.y,
        });
    };

    const handleWheel = (event: any) => {
        event.preventDefault();
        if (event.deltaY < 0) {
            // Scroll up
            setZoomScale((prevScale: any) => Math.min(prevScale + 0.1, 3)); // Maksimal zoom 3x
        } else {
            // Scroll down
            setZoomScale((prevScale: any) => Math.max(prevScale - 0.1, 0.5)); // Minimal zoom 0.5x
        }
    };

    useEffect(() => {
        if (stateDataHeader.isOpenPreview) {
            window.addEventListener('wheel', handleWheel, { passive: false });
            window.addEventListener('mousemove', handleMouseMove);
            // window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('wheel', handleWheel);
            window.addEventListener('mousemove', handleMouseMove);
            // window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.addEventListener('mousemove', handleMouseMove);
            // window.addEventListener('mouseup', handleMouseUp);
        };
    }, [stateDataHeader.isOpenPreview, handleMouseMove, handleWheel]);

    // const handleDeleteUnusedFiles = async (kode_dokumen: any) => {
    //     // Logika untuk menghapus file pendukung yang tidak digunakan
    //     // ...
    //     const filependukung = await axios.get(`${apiUrl}/erp/load_fileGambar?`, {
    //         params: {
    //             entitas: kode_entitas,
    //             param1: kode_dokumen,
    //         },
    //     });

    //     const modifiedResponse = filependukung.data.data;
    //     const ambilsemuaiddokumen = modifiedResponse.map((item: any) => item.id_dokumen);

    //     // Contoh penggunaan axios.delete untuk menghapus file pendukung
    //     try {
    //         const response = await axios.delete(`${apiUrl}/erp/hapus_file_pendukung`, {
    //             params: {
    //                 entitas: kode_entitas,
    //                 param1: kode_dokumen,
    //                 param2: indexHapus, // Sesuaikan dengan data yang diperlukan untuk menghapus
    //             },
    //         });
    //         console.log('Response dari penghapusan file pendukung:', response.data);
    //     } catch (error) {
    //         console.error('Error saat menghapus file pendukung:', error);
    //     }
    // };

    // const handleFileUpdate = async (kode_dokumen: any) => {
    //     const fileUpdate = selectedFiles.filter((file: any) => file.name);
    //     console.log('fileUpdate:', fileUpdate);

    //     if (fileUpdate.length > 0) {
    //         try {
    //             // Upload file yang diperbarui
    //             const uploadResponse = await uploadFiles(fileUpdate, kode_dokumen);

    //             if (uploadResponse.status === true) {
    //                 // Jika upload berhasil

    //                 // Persiapkan data untuk disimpan di database
    //                 const jsonSimpan = prepareDataForSave(uploadResponse, kode_dokumen);

    //                 // Gabungkan array baru dengan data yang sudah ada
    //                 console.log(uploadResponse);
    //                 console.log(jsonSimpan);

    //                 // Simpan data ke database
    //                 const saveResponse = await axios.post(`${apiUrl}/erp/simpan_tbimages`, jsonSimpan);
    //                 console.log('Response dari menyimpan data:', saveResponse);
    //                 if (routeFilePendukungValue === 'true' && saveResponse.data.status === true) {
    //                     console.log('NAVIGATE UPDATE FILE PENDUKUNG');
    //                     Swal.fire({
    //                         title: 'Berhasil update file pendukung PB',
    //                         icon: 'success',
    //                     }).then(() => {
    //                         // window.location.href = './pblist';
    //                         router.push('./pblist');
    //                     });
    //                 }
    //             } else {
    //                 console.log('Gagal mengupload file');
    //             }
    //         } catch (error) {
    //             console.error('Error:', error);
    //         }
    //     } else {
    //         console.log('Tidak ada file yang diperbarui');
    //     }
    // };

    const handleUpload = async (kode_dokumen: any) => {
        // Proses untuk file baru
        const formData = new FormData();
        let entitas;

        const kode_Dokumen = kode_entitas + 'RPE' + kode_dokumen;

        filesUpload.forEach((file: any, index: any) => {
            // Ambil timestamp tanpa detik terakhir
            const baseTime = moment().format('YYMMDDHHmmss'); // Misalnya: 250311105806
            const newSeconds = (parseInt(baseTime.slice(-2)) + index).toString().padStart(2, '0'); // Tambahkan index ke detik terakhir

            // Gabungkan kembali
            const fileName = `RPE${baseTime.slice(0, -2)}${newSeconds}`;
            const fileExtension = file.name.split('.').pop();

            formData.append(`myimage`, file);
            formData.append(`nama_file_image`, `${fileName}.${fileExtension}`);
            formData.append(`kode_dokumen`, kode_Dokumen);
            formData.append(`id_dokumen`, 101 + index);
            formData.append(`dokumen`, 'RPE-');
        });

        if (kode_entitas === '99999') {
            entitas = '999';
        } else {
            entitas = kode_entitas;
        }
        formData.append('ets', entitas);

        // console.log('FormData Contents:');
        // for (let pair of formData.entries()) {
        //     console.log(pair[0], pair[1]);
        // }

        // // console.log('JsonInput = ', jsonData);
        // console.log('JsonInput = ', formData);

        if (masterDataState !== 'BARU') {
            const responseFilePendukung = await axios.get(`${apiUrl}/erp/get_tb_images?`, {
                params: {
                    entitas: kode_entitas,
                    param1: kode_Dokumen,
                },
            });

            if (responseFilePendukung?.data.data.length !== 0) {
                const filePendukung_lama: any[] = [];
                const kodeDokumen = kode_Dokumen;
                responseFilePendukung.data.data.map((item: any) => {
                    filePendukung_lama.push(item.id_dokumen);
                });
                const result = filePendukung_lama.join(',');

                await axios.delete(`${apiUrl}/erp/hapus_file_pendukung`, {
                    params: {
                        entitas: kode_entitas,
                        param1: kodeDokumen,
                        param2: result,
                    },
                });
            }
        }

        try {
            const response = await axios.post(`${apiUrl}/upload`, formData);

            if (response.data.status === true) {
                let jsonSimpan;
                if (Array.isArray(response.data.nama_file_image)) {
                    // Jika terdapat banyak file
                    jsonSimpan = response.data.nama_file_image.map((namaFile: any, index: any) => ({
                        entitas: kode_entitas,
                        kode_dokumen: kode_Dokumen,
                        id_dokumen: response.data.id_dokumen[index],
                        dokumen: 'RPE-',
                        filegambar: namaFile,
                        fileoriginal: response.data.filesinfo[index] ? response.data.filesinfo[index].fileoriginal : null,
                    }));
                } else {
                    // Jika hanya satu file
                    jsonSimpan = {
                        entitas: kode_entitas,
                        kode_dokumen: kode_Dokumen,
                        id_dokumen: response.data.id_dokumen,
                        dokumen: 'RPE-',
                        filegambar: response.data.nama_file_image,
                        fileoriginal: response.data.filesinfo,
                    };
                }

                try {
                    // Simpan data ke database
                    const insertResponse = await axios.post(`${apiUrl}/erp/simpan_tbimages`, jsonSimpan);
                } catch (error) {
                    console.error('Error saat menyimpan data baru:', error);
                }
            } else {
                console.log('tidak upload');
            }
        } catch (error) {
            console.error('Error saat mengunggah file baru:', error);
        }
    };

    const uploadFiles = async (files: any[], kode_dokumen: any) => {
        try {
            // Mengambil data file pendukung dengan menggunakan await
            const filependukungResponse = await axios.get(`${apiUrl}/erp/load_fileGambar?`, {
                params: {
                    entitas: kode_entitas,
                    param1: kode_dokumen,
                },
            });

            const filependukung = filependukungResponse.data.data;
            const maxIdDokumen = filependukung.reduce((max: any, item: any) => Math.max(max, item.id_dokumen), 0);
            console.log('ID Dokumen Tertinggi:', maxIdDokumen);
            // const BB = maxIdDokumen + 1;

            let S_id_dokumen;
            //GANTI BB KONDISIKAN JIKA LENGHT > 0
            if (filependukung.length > 0) {
                S_id_dokumen = maxIdDokumen + 1;
            } else {
                S_id_dokumen = 101;
            }
            // Persiapkan FormData untuk upload
            const formData = prepareFormDataForUpdate(files, kode_dokumen, S_id_dokumen);

            // Upload file
            const response = await axios.post(`${apiUrl}/upload`, formData);
            console.log('Response dari uploadFiles:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error saat mengupload file:', error);
            return { status: false };
        }
    };

    const prepareFormDataForUpdate = (files: any[], kode_dokumen: any, nomor: any) => {
        // Persiapan FormData untuk file yang diperbarui
        const formData = new FormData();
        let entitas;

        files.forEach((file: any, index: any) => {
            formData.append(`myimage`, file);
            const fileExtension = file.name.split('.').pop();
            formData.append(`nama_file_image`, `PB${selectedNamaFiles[index]}.${fileExtension}`);
            formData.append(`kode_dokumen`, kode_dokumen);
            formData.append(`id_dokumen`, nomor + index);
            formData.append(`dokumen`, 'PB');
        });

        if (kode_entitas === '99999') {
            entitas = '999';
        } else {
            entitas = kode_entitas;
        }
        formData.append('ets', entitas);

        return formData;
    };

    const prepareDataForSave = (response: any, kode_dokumen: any) => {
        // Persiapan data untuk disimpan di database
        console.log(response);
        let jsonSimpan;

        if (Array.isArray(response.nama_file_image)) {
            // Jika ada banyak file
            jsonSimpan = response.nama_file_image.map((namaFile: any, index: any) => ({
                entitas: kode_entitas,
                kode_dokumen: response.kode_dokumen[index],
                id_dokumen: response.id_dokumen[index],
                dokumen: response.dokumen[index],
                filegambar: namaFile,
                fileoriginal: response.filesinfo[index] ? response.filesinfo[index].fileoriginal : null,
            }));
        } else {
            // Jika hanya satu file
            jsonSimpan = {
                entitas: kode_entitas,
                kode_dokumen: kode_dokumen,
                id_dokumen: response.id_dokumen,
                dokumen: 'PB',
                filegambar: response.nama_file_image,
                fileoriginal: response.filesinfo,
            };
        }

        //console.log(jsonSimpan);

        return jsonSimpan;
    };

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    //const [tombolApproval, setTombolApproval] = useState<any>('');

    const PrepareApproval = async (vTombol: any) => {
        // setTombolApproval(vTombol);
        //console.log('ooooooooooooooo', vTombol);
        if (vTombol === 'KOREKSI') {
            stateDataHeader.approval = 'C';
        } else if (vTombol === 'TOLAK') {
            stateDataHeader.approval = 'N';
        } else if (vTombol === 'SETUJU') {
            stateDataHeader.approval = 'Y';
        }
        try {
            prosesBloking(vTombol);
        } catch (error) {
            console.log('error', error);
        } finally {
            endProgress();
        }
    };

    // const prosesBloking = async (vTombol: any) => {
    //     handleUpload('RE0000000654');
    // };

    const prosesBloking = async (vTombol: any) => {
        varTombol = vTombol;
        if (stateDataHeader.nominalInvoice <= 0 || String(stateDataHeader.nominalInvoice) === '') {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: `<p style="font-size:12px;color:white;">Jumlah Bayar tidak boleh 0.</p>`,
                width: '100%',
                target: '#dialogFormRpe',
                customClass: {
                    popup: styles['colored-popup'], // Custom class untuk sweetalert
                },
            });
            return;
        }

        if (stateDataFooter.biayaLainLain > 0 && stateDataFooter.keteranganBiayaLainLain === '') {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: `<p style="font-size:12px;color:white;">Keterangan Biaya Lain-lain harus diisi.</p>`,
                width: '100%',
                target: '#dialogFormRpe',
                customClass: {
                    popup: styles['colored-popup'], // Custom class untuk sweetalert
                },
            });
            return;
        }

        if (stateDataFooter.potonganEkspedisiLain > 0 && stateDataFooter.ketPotonganEkspedisiLain === '') {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: `<p style="font-size:12px;color:white;">Keterangan Potongan Ekspedisi Lain-lain harus diisi.</p>`,
                width: '100%',
                target: '#dialogFormRpe',
                customClass: {
                    popup: styles['colored-popup'], // Custom class untuk sweetalert
                },
            });
            return;
        }

        if (String(stateDataHeader.tanggal) === '') {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: `<p style="font-size:12px;color:white;">Tanggal belum diisi.</p>`,
                width: '100%',
                target: '#dialogFormRpe',
                customClass: {
                    popup: styles['colored-popup'], // Custom class untuk sweetalert
                },
            });
            return;
        }

        if (String(stateDataHeader.noRpe) === '') {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: `<p style="font-size:12px;color:white;">No. Dokumen belum diisi.</p>`,
                width: '100%',
                target: '#dialogFormRpe',
                customClass: {
                    popup: styles['colored-popup'], // Custom class untuk sweetalert
                },
            });
            return;
        }

        if (String(stateDataHeader.fakturEkspedisi) === '') {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: `<p style="font-size:12px;color:white;">No. Faktur Invoice belum diisi.</p>`,
                width: '100%',
                target: '#dialogFormRpe',
                customClass: {
                    popup: styles['colored-popup'], // Custom class untuk sweetalert
                },
            });
            return;
        }

        const result: any = await CekPeriodeAkutansi(kode_entitas, stateDataHeader);

        if (result.yearB < result.yearA || (result.yearB === result.yearA && result.monthB < result.monthA)) {
            withReactContent(swalToast).fire({
                icon: 'warning',
                title: `<p style="font-size:12px;color:white;">Tanggal tidak dalam periode akuntansi, periode akutansi saat ini : ${result.periode}</p>`,
                width: '100%',
                target: '#dialogFormRpe',
                customClass: {
                    popup: styles['colored-popup'], // Custom class untuk sweetalert
                },
            });
            return;
        }

        const resultTglMinusSatu = await CekTglMinusSatu(stateDataHeader.tanggal);

        // if (masterDataState === 'APPROVE' || masterDataState === 'BATAL_APPROVE') {
        //     if (stateDataHeader.approval === 'Y') {
        //         if (dataJurnal.nodes.length <= 0 && dataBarang.nodes.length > 0) {
        //             const result = await withReactContent(swalDialog).fire({
        //                 title: '<p style="font-size:12px">Data Jurnal masih kosong, silahkan klik Auto Jurnal !</p>',
        //                 width: '24%',
        //                 target: '#dialogFormRpe',
        //                 // showCancelButton: true,
        //                 // confirmButtonText: '&nbsp; Yes &nbsp;',
        //                 // cancelButtonText: '&nbsp; No &nbsp;',
        //                 heightAuto: true,
        //                 reverseButtons: true,
        //             });
        //             //if (!result.isConfirmed) {
        //             // throw 'exit';
        //             return;
        //             //}
        //         }
        //     }
        // }

        if (resultTglMinusSatu === false) {
            // Tambahkan CSS untuk tombol
            const style = document.createElement('style');
            style.innerHTML = `
                .swal2-popup .btn {
                    margin-left: 10px;
                    }

                .swal2-confirm, .swal2-cancel {
                    width: 70px;  /* Atur ukuran lebar yang sama */
                    height: 33px;  /* Atur ukuran tinggi yang sama */
                    font-size: 14px;  /* Sesuaikan ukuran font */
                }
                `;
            document.head.appendChild(style);
            withReactContent(swalDialog)
                .fire({
                    title: `<p style="font-size:12px">Tanggal lebih kecil dari hari ini, transaksi jurnal umum dilanjutkan</span></p>`,
                    width: '16.4%',
                    target: '#dialogFormRpe',
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No', // Menambahkan teks tombol cancel
                    showCancelButton: true, // Menampilkan tombol cancel
                })
                .then(async (result) => {
                    if (result.isConfirmed) {
                        saveDoc(vTombol);
                    } else {
                        return;
                    }
                });

            // const result = await withReactContent(swalDialog).fire({
            //     title: '<p style="font-size:12px">Tanggal lebih kecil dari hari ini, transaksi jurnal umum dilanjutkan.</p>',
            //     width: '24%',
            //     target: '#dialogFormRpe',
            //     showCancelButton: true,
            //     confirmButtonText: '&nbsp; Yes &nbsp;',
            //     cancelButtonText: '&nbsp; No &nbsp;',
            //     heightAuto: true,
            //     reverseButtons: true,
            // });
            // if (!result.isConfirmed) {
            //     // throw 'exit';
            //     return;
            // }
            return;
        }

        saveDoc(vTombol);
    };

    const autojurnal = async () => {
        //masukan akun diskon

        let vTotalBayar = 0;
        let vTotalBayar1 = 0;
        let vTotalBayar2 = 0;
        let vTotalBayarTanpaPPH23 = 0;

        vTotalBayar1 = Number(stateDataFooter.subTotal) + stateDataFooter.tambahanJarak + Number(stateDataFooter.biayaLainLain);

        vTotalBayar2 = stateDataHeader.nominalInvoice;

        console.log('vTotalBayar1: ', vTotalBayar2);

        // if (vTotalBayar1 < vTotalBayar2) {
        //     vTotalBayar = vTotalBayar1 - stateDataFooter.totalKlaimEkspedisiFbm - stateDataFooter.nilaiPph23 - stateDataFooter.potonganEkspedisiLain;
        // } else {
        //     vTotalBayar = vTotalBayar2 - stateDataFooter.totalKlaimEkspedisiFbm - stateDataFooter.nilaiPph23 - stateDataFooter.potonganEkspedisiLain;
        // }

        if (vTotalBayar1 < vTotalBayar2) {
            if (stateDataHeader?.kodepph23 !== 'N') {
                vTotalBayar = vTotalBayar1 - stateDataFooter?.totalKlaimEkspedisiFbm - stateDataFooter?.nilaiPph23 - stateDataFooter?.potonganEkspedisiLain;
                vTotalBayarTanpaPPH23 = vTotalBayar1 - stateDataFooter?.totalKlaimEkspedisiFbm - stateDataFooter?.potonganEkspedisiLain;
            } else {
                vTotalBayarTanpaPPH23 = vTotalBayar1 - stateDataFooter?.totalKlaimEkspedisiFbm - stateDataFooter?.potonganEkspedisiLain;
                vTotalBayar = vTotalBayar1 - stateDataFooter?.totalKlaimEkspedisiFbm - stateDataFooter?.potonganEkspedisiLain;
            }
        } else {
            if (stateDataHeader?.kodepph23 !== 'N') {
                vTotalBayar = vTotalBayar2 - stateDataFooter?.totalKlaimEkspedisiFbm - stateDataFooter?.nilaiPph23 - stateDataFooter?.potonganEkspedisiLain;
                vTotalBayarTanpaPPH23 = vTotalBayar2 - stateDataFooter?.totalKlaimEkspedisiFbm - stateDataFooter?.potonganEkspedisiLain;
            } else {
                vTotalBayarTanpaPPH23 = vTotalBayar2 - stateDataFooter?.totalKlaimEkspedisiFbm - stateDataFooter?.potonganEkspedisiLain;
                vTotalBayar = vTotalBayar2 - stateDataFooter?.totalKlaimEkspedisiFbm - stateDataFooter?.potonganEkspedisiLain;
            }
        }

        let ket = '';

        ket = 'RPE ' + stateDataHeader.noRpe + ', HUTANG ' + stateDataHeader.namaEkspedisi;

        let vkode_dept = '';
        let vnama_dept = '';
        let vkode_kry = '';
        let vnama_kry = '';
        let vkode_jual = '';
        let vkode_akun = '';
        let vno_akun = '';
        let vnama_akun = '';
        let vtipe = '';

        let vkode_subledger = '';
        let vno_subledger = '';
        let vnama_subledger = '';
        let vsubledger = '';
        const responsDataDept = await GetListDeptRpe(kode_entitas, token);
        if (responsDataDept.status === true) {
            const filternamadept = responsDataDept.data.filter((item: any) => item.nama_dept === 'LOGISTIK');
            if (filternamadept[0].nama_dept === 'LOGISTIK') {
                vkode_dept = filternamadept[0].kode_dept;
                vnama_dept = filternamadept[0].nama_dept;
            } else {
                vkode_dept = '';
                vnama_dept = '';
            }
        }

        const responsDataKry = await GetListKryRpe(kode_entitas, token);
        if (responsDataKry.status === true) {
            const filternamakry = responsDataKry.data.filter((item: any) => item.nama_kry === 'KANTOR');
            if (filternamakry[0].nama_kry === 'KANTOR') {
                vkode_kry = filternamakry[0].kode_kry;
            } else {
                vkode_kry = '';
                vnama_kry = '';
            }
        }

        const responsDataAreaJual = await GetListAreaJualRpe(kode_entitas, token);
        if (responsDataAreaJual.status === true) {
            if (kode_entitas === '300') {
                const filternamajual1 = responsDataAreaJual.data.filter((item: any) => item.nama_jual === 'DISTRIBUTOR');
                if (filternamajual1[0].nama_jual === 'DISTRIBUTOR') {
                    vkode_jual = filternamajual1[0].kode_jual;
                } else {
                    vkode_jual = '';
                }
            } else {
                const filternamajual2 = responsDataAreaJual.data.filter((item: any) => item.nama_jual === 'KANTOR');
                if (filternamajual2[0].nama_jual === 'KANTOR') {
                    vkode_jual = filternamajual2[0].kode_jual;
                } else {
                    vkode_jual = '';
                }
            }
        }

        const responsAkunJurnal = await GetListAkunJurnal(kode_entitas, token);
        if (responsAkunJurnal.status === true) {
            const filternamaakun = responsAkunJurnal.data.filter((item: any) => item.nama_akun === 'Piutang Lainnya');
            if (filternamaakun[0].nama_akun === 'Piutang Lainnya') {
                vkode_akun = filternamaakun[0].kode_akun;
                vno_akun = filternamaakun[0].no_akun;
                vnama_akun = filternamaakun[0].nama_akun;
                vtipe = filternamaakun[0].tipe;
            } else {
                vkode_akun = '';
                vno_akun = '';
                vnama_akun = '';
                vtipe = '';
            }
        }

        const responsListSubledger = await GetListSubledger(kode_entitas, token);
        if (responsListSubledger.status === true) {
            const filternamasubledger = responsListSubledger.data.filter((item: any) => item.nama_subledger === 'PAJAK PPH 23');
            console.log('filternamasubledger = ', filternamasubledger);

            if (filternamasubledger[0].nama_subledger === 'PAJAK PPH 23') {
                vkode_subledger = filternamasubledger[0].kode_subledger;
                vno_subledger = filternamasubledger[0].no_subledger;
                vnama_subledger = filternamasubledger[0].nama_subledger;
                vsubledger = filternamasubledger[0].subledger;
            } else {
                vkode_subledger = '';
                vno_subledger = '';
                vnama_subledger = '';
                vsubledger = '';
            }
        }

        const responsDataSetting = await GetListSettingRpe(kode_entitas, token);
        console.log('responsDataSetting = ', responsDataSetting);

        // hapus semua
        setDataJurnal((state: any) => ({
            ...state,
            nodes: state.nodes.filter((node: any) => node.id_rpe === -1),
        }));

        let i = 1; // id_dokumen

        const newNodeJurnal = [
            {
                kode_dokumen: '',
                id_dokumen: i++,
                id: i,
                dokumen: 'JU',
                tgl_dokumen: stateDataHeader.tglEfektif.format('YYYY-MM-DD HH:mm:ss'),
                kode_akun: responsDataSetting.data[0].kode_akun_dbeks,
                no_akun: responsDataSetting.data[0].no_debet_eks,
                nama_akun: responsDataSetting.data[0].nama_debet_eks,
                tipe: responsDataSetting.data[0].tipe_debet_eks,
                kode_subledger: null,
                no_subledger: '',
                nama_subledger: '',
                kurs: 1.0,
                kode_mu: 'IDR',
                debet_rp: masterDataState === 'APPROVE' ? vTotalBayarTanpaPPH23 : 0.0,
                kredit_rp: masterDataState === 'APPROVE' ? 0.0 : vTotalBayarTanpaPPH23,
                jumlah_rp: masterDataState === 'APPROVE' ? vTotalBayarTanpaPPH23 : -vTotalBayarTanpaPPH23,
                jumlah_mu: masterDataState === 'APPROVE' ? vTotalBayarTanpaPPH23 : -vTotalBayarTanpaPPH23,
                catatan: masterDataState === 'APPROVE' ? ket : '[REV] ' + ket,
                persen: 0,
                kode_dept: vkode_dept,
                kode_kerja: '',
                approval: 'N',
                posting: 'N',
                rekonsiliasi: 'N',
                tgl_rekonsil: '',
                userid: userid.toUpperCase(), //kode_user,
                tgl_update: '',
                nama_dept: vnama_dept,
                nama_kerja: '',
                isledger: '',
                subledger: '',
                no_warkat: '',
                tgl_valuta: '',
                no_kerja: '',
                kode_kry: vkode_kry,
                kode_jual: vkode_jual,
            },
            {
                kode_dokumen: '',
                id_dokumen: i++,
                id: i,
                dokumen: 'JU',
                tgl_dokumen: stateDataHeader.tglEfektif.format('YYYY-MM-DD HH:mm:ss'),
                kode_akun: responsDataSetting.data[0].kode_akun_crrpe,
                no_akun: responsDataSetting.data[0].no_kredit_rpe,
                nama_akun: responsDataSetting.data[0].nama_kredit_rpe,
                tipe: responsDataSetting.data[0].tipe_kredit_rpe,
                kode_subledger: null,
                no_subledger: '',
                nama_subledger: '',
                kurs: 1.0,
                kode_mu: 'IDR',
                debet_rp: masterDataState === 'APPROVE' ? 0.0 : vTotalBayar,
                kredit_rp: masterDataState === 'APPROVE' ? vTotalBayar : 0.0,
                jumlah_rp: masterDataState === 'APPROVE' ? -vTotalBayar : vTotalBayar,
                jumlah_mu: masterDataState === 'APPROVE' ? -vTotalBayar : vTotalBayar,
                catatan: masterDataState === 'APPROVE' ? ket : '[REV] ' + ket,
                persen: 0,
                kode_dept: vkode_dept,
                kode_kerja: '',
                approval: 'N',
                posting: 'N',
                rekonsiliasi: 'N',
                tgl_rekonsil: '',
                userid: '', //kode_user,
                tgl_update: '',
                nama_dept: vnama_dept,
                nama_kerja: '',
                isledger: '',
                subledger: '',
                no_warkat: '',
                tgl_valuta: '',
                no_kerja: '',
                kode_kry: vkode_kry,
                kode_jual: vkode_jual,
            },
        ];

        // Hanya push entry PPH 23 jika pph23 !== 'N'
        console.log('stateDataHeader.kodepph23 = ', stateDataHeader.kodepph23);

        if (stateDataHeader.kodepph23 !== 'N') {
            newNodeJurnal.push({
                kode_dokumen: '',
                id_dokumen: i++,
                id: i,
                dokumen: 'JU',
                tgl_dokumen: stateDataHeader.tglEfektif.format('YYYY-MM-DD HH:mm:ss'),
                kode_akun: vkode_akun,
                no_akun: vno_akun,
                nama_akun: vnama_akun,
                tipe: vtipe,
                kode_subledger: vkode_subledger as any,
                no_subledger: vno_subledger,
                nama_subledger: vnama_subledger,
                kurs: 1.0,
                kode_mu: 'IDR',
                debet_rp: masterDataState === 'APPROVE' ? 0.0 : stateDataFooter.nilaiPph23,
                kredit_rp: masterDataState === 'APPROVE' ? stateDataFooter.nilaiPph23 : 0.0,
                jumlah_rp: masterDataState === 'APPROVE' ? -stateDataFooter.nilaiPph23 : stateDataFooter.nilaiPph23,
                jumlah_mu: masterDataState === 'APPROVE' ? -stateDataFooter.nilaiPph23 : stateDataFooter.nilaiPph23,
                catatan: masterDataState === 'APPROVE' ? ket : '[REV] ' + ket,
                persen: 0,
                kode_dept: vkode_dept,
                kode_kerja: '',
                approval: 'N',
                posting: 'N',
                rekonsiliasi: 'N',
                tgl_rekonsil: '',
                userid: '', //kode_user,
                tgl_update: '',
                nama_dept: vnama_dept,
                nama_kerja: '',
                isledger: '',
                subledger: vsubledger,
                no_warkat: '',
                tgl_valuta: '',
                no_kerja: '',
                kode_kry: vkode_kry,
                kode_jual: vkode_jual,
            });
        }

        //     {
        //         kode_dokumen: '',
        //         id_dokumen: i++,
        //         id: i,
        //         dokumen: 'JU',
        //         tgl_dokumen: stateDataHeader.tglEfektif.format('YYYY-MM-DD HH:mm:ss'),
        //         kode_akun: vkode_akun,
        //         no_akun: vno_akun,
        //         nama_akun: vnama_akun,
        //         tipe: vtipe,
        //         kode_subledger: vkode_subledger,
        //         no_subledger: vno_subledger,
        //         nama_subledger: vnama_subledger,
        //         kurs: 1.0,
        //         kode_mu: 'IDR',
        //         debet_rp: masterDataState === 'APPROVE' ? 0.0 : stateDataFooter.nilaiPph23,
        //         kredit_rp: masterDataState === 'APPROVE' ? stateDataFooter.nilaiPph23 : 0.0,
        //         jumlah_rp: masterDataState === 'APPROVE' ? -stateDataFooter.nilaiPph23 : stateDataFooter.nilaiPph23,
        //         jumlah_mu: masterDataState === 'APPROVE' ? -stateDataFooter.nilaiPph23 : stateDataFooter.nilaiPph23,
        //         catatan: masterDataState === 'APPROVE' ? ket : '[REV] ' + ket,
        //         persen: 0,
        //         kode_dept: vkode_dept,
        //         kode_kerja: '',
        //         approval: 'N',
        //         posting: 'N',
        //         rekonsiliasi: 'N',
        //         tgl_rekonsil: '',
        //         userid: '', //kode_user,
        //         tgl_update: '',
        //         nama_dept: vnama_dept,
        //         nama_kerja: '',
        //         isledger: '',
        //         subledger: vsubledger,
        //         no_warkat: '',
        //         tgl_valuta: '',
        //         no_kerja: '',
        //         kode_kry: vkode_kry,
        //         kode_jual: vkode_jual,
        //     },
        // ];

        // Tambahkan node baru ke state dan inkremen nilai i

        const totalDebet = newNodeJurnal.reduce((total: any, item: any) => {
            return total + parseFloat(item.debet_rp);
        }, 0);
        const totalKredit = newNodeJurnal.reduce((total: any, item: any) => {
            return total + parseFloat(item.kredit_rp);
        }, 0);

        // setStateDataDetail((prevState: any) => ({
        //     ...prevState,
        //     totalDebet: totalDebet,
        //     totalKredit: totalKredit,
        //     totalSelisih: totalDebet - totalKredit,
        // }));

        setDataJurnal((state: any) => ({
            ...state,
            nodes: state.nodes.concat(newNodeJurnal),
        }));

        return true;

        // i++;

        //============================================================================
    };

    const [isDataFetched, setIsDataFetched] = useState(false);
    useEffect(() => {
        if (isDataFetched) {
            setIsDataFetched(false); // Reset flag
            saveDoc(varTombol);
        }
    }, [dataJurnal, isDataFetched]);

    const saveDoc = async (vTombol: any) => {
        let vno_jurnal: any;
        if (masterDataState === 'BATAL_APPROVE') {
            const responsData = await GetListKeuangan(kode_entitas, masterKodeDokumen, 'baru', token);
            if (responsData.status === true) {
                vno_jurnal: responsData.data.keuangan.no_dokumen;
            }
        }

        let jsonData: any;
        let generateNoDok: any;
        let generateNoDokJurnal: any;
        const dataObject = {
            biayaLainLain: stateDataFooter.biayaLainLain,
            nominalInvoice: stateDataHeader.nominalInvoice,
            nilaiPph23: stateDataHeader.nilaiPph23,
            potonganEkspedisiLain: stateDataFooter.potonganEkspedisiLain,
        };

        if (masterDataState === 'BARU') {
            await generateNU(kode_entitas, '', '85', stateDataHeader.dateGenerateNu.format('YYYYMM'))
                .then((result) => {
                    generateNoDok = result;
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        } else if (masterDataState === 'APPROVE' || masterDataState === 'BATAL_APPROVE') {
            await generateNU(kode_entitas, '', '20', stateDataHeader.dateGenerateNu.format('YYYYMM'))
                .then((result) => {
                    generateNoDokJurnal = result;
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            generateNoDok = stateDataHeader.noRpe;
        } else {
            generateNoDok = stateDataHeader.noRpe;
        }
        console.log('dataJurnal.nodes = ', dataJurnal.nodes.length, dataBarang.nodes.length);

        if (dataJurnal.nodes.length <= 0 && dataBarang.nodes.length > 0) {
            console.log('masuk Sini');

            const dataRes = await autojurnal();
            if (dataRes === true) {
                setIsDataFetched(true);
            }
        } else {
            await ReCalcDataNodes(dataBarang, dataJurnal, dataObject, dataKeuangan, stateDataHeader, stateDataFooter, userid, generateNoDokJurnal, masterDataState, stateDataHeader.kodeRpe, vno_jurnal)
                .then((result) => {
                    console.log('result.detailJurnalJson = ', result.detailJurnalJson);

                    jsonData = {
                        // entitas: kode_entitas + '999999',
                        entitas: kode_entitas,
                        kode_rpe: masterDataState === 'EDIT' || masterDataState === 'APPROVE' || masterDataState === 'BATAL_APPROVE' ? stateDataHeader.kodeRpe : '',
                        no_rpe: generateNoDok,
                        tgl_rpe: stateDataHeader.tanggal.format('YYYY-MM-DD HH:mm:ss'),
                        via: stateDataHeader.namaEkspedisi,
                        kode_termin: null,
                        kode_mu: 'IDR',
                        kurs: 1,
                        total_berat: stateDataFooter.beratTotal,
                        total_mu: result.totalMu,
                        netto_mu: result.totalMu,
                        keterangan: stateDataFooter.ketPotonganEkspedisiLain,
                        status: 'Terbuka',
                        userid: userid.toUpperCase(),
                        tgl_update:
                            masterDataState === 'EDIT' || masterDataState === 'APPROVE' || masterDataState === 'BATAL_APPROVE'
                                ? moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
                                : moment(stateDataHeader.tanggal).format('YYYY-MM-DD HH:mm:ss'),
                        approval: masterDataState === 'BARU' ? null : masterDataState === 'EDIT' ? null : masterDataState === 'BATAL_APPROVE' ? null : stateDataHeader.approval,
                        tgl_approval:
                            masterDataState === 'BARU' ? null : masterDataState === 'EDIT' ? null : masterDataState === 'BATAL_APPROVE' ? null : moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                        no_reff: stateDataHeader.fakturEkspedisi,
                        bayar_mu: result.totalBayar,
                        total_berat_ekspedisi: result.totalBeratEkspedisi, // ini saya belum tahu darimana
                        total_berat_pabrik: result.totalBeratPabrik, // ini saya belum tahu darimana
                        total_klaim_ekspedisi: result.totalKlaimEkspedisi,
                        total_klaim_pabrik: result.totalKlaimPabrik, // ini saya belum tahu darimana
                        total_tambahan: result.tambahanJarak,
                        total_pph: result.nilaiPph23,
                        sub_total: result.subTotal,
                        pph23: stateDataHeader.kodepph23 === '' || stateDataHeader.kodepph23 === null || stateDataHeader.kodepph23 === undefined ? 'N' : stateDataHeader.kodepph23,
                        biaya_lain: stateDataFooter.biayaLainLain,
                        ket_biaya: stateDataFooter.keteranganBiayaLainLain,
                        potongan_lain: stateDataFooter.potonganEkspedisiLain,
                        memo_mu: 0,
                        lunas_mu: 0, // ini saya belum tahu darimana
                        kode_dokumen: stateDataHeader.kodeDokumen,
                        kode_dokumen_rev: stateDataHeader.kodeDokumenRev,
                        tgl_trxrpe: stateDataHeader.tglEfektif.format('YYYY-MM-DD HH:mm:ss'),
                        detail: result.detailJson,
                        keuangan: (masterDataState === 'APPROVE' || masterDataState === 'BATAL_APPROVE') && vTombol === 'SETUJU' ? result.detailKeuanganJson : [],
                        jurnal: (masterDataState === 'APPROVE' || masterDataState === 'BATAL_APPROVE') && vTombol === 'SETUJU' ? result.detailJurnalJson : [],
                        batal: masterDataState === 'BATAL_APPROVE' ? 'Y' : 'N',
                    };
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            // console.log('kkkkkkk', vTombol);
            console.log(' Data Yang udah di filter = ', jsonData, vTombol);
            //   showLoading();
            startProgress();

            if (masterDataState === 'BARU') {
                const response = await axios.post(`${apiUrl}/erp/simpan_rpe`, jsonData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const resultSimpan = response.data;
                const status = resultSimpan.status;
                const errormsg = resultSimpan.serverMessage;
                if (status === true) {
                    //file pendukung
                    handleUpload(response.data.kode_dokumen);
                    // await generateNU(kode_entitas, stateDataHeader.noRpe, '85', stateDataHeader.tanggal.format('YYYYMM'))
                    await generateNU(kode_entitas, generateNoDok, '85', stateDataHeader.tanggal.format('YYYYMM'))
                        .then((result) => {})
                        .catch((error) => {
                            withReactContent(swalDialog).fire({
                                title: ``,
                                html: `Penambahan Counter No. RPE gagal ${errormsg}`,
                                icon: 'warning',
                                width: '20%',
                                heightAuto: true,
                                showConfirmButton: true,
                                confirmButtonText: 'Ok',
                                target: '#dialogFormRpe',
                            });
                        });

                    await withReactContent(swalPopUp).fire({
                        icon: 'success',
                        title: '<p style="font-size:12px;color:white;margin-right: -42px;">Data Berhasil disimpan.</p>',
                        width: '50%', // Atur lebar popup sesuai kebutuhan
                        target: '#dialogRpeList',
                        heightAuto: true,
                        timer: 2000,
                        showConfirmButton: false, // Menampilkan tombol konfirmasi
                        allowOutsideClick: false, // Menonaktifkan penutupan saat klik di luar
                        allowEscapeKey: false, // Menonaktifkan penutupan dengan tombol Escape
                        customClass: {
                            popup: styles['colored-popup'], // Custom class untuk sweetalert
                        },
                    });

                    endProgress();
                    await handleRefreshData();
                    await closeDialogRpeList();
                } else {
                    withReactContent(swalDialog).fire({
                        title: ``,
                        html: errormsg,
                        icon: 'warning',
                        width: '20%',
                        heightAuto: true,
                        showConfirmButton: true,
                        confirmButtonText: 'Ok',
                        target: '#dialogFormRpe',
                    });
                }
            }

            ////////////////////////////////////////////////////////////////////////
            else if (masterDataState === 'EDIT' || masterDataState === 'APPROVE' || masterDataState === 'BATAL_APPROVE') {
                const response = await axios.patch(`${apiUrl}/erp/update_rpe`, jsonData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log(jsonData, 'ggggggggggggggggg');

                const resultSimpan = response.data;
                const status = resultSimpan.status;
                const errormsg = resultSimpan.serverMessage;
                if (status === true) {
                    //file pendukung
                    handleUpload(stateDataHeader.kodeRpe);

                    await withReactContent(swalPopUp).fire({
                        icon: 'success',
                        title: '<p style="font-size:12px;color:white;margin-right: -42px;">Data Berhasil disimpan.</p>',
                        width: '50%', // Atur lebar popup sesuai kebutuhan
                        target: '#dialogRpeList',
                        heightAuto: true,
                        timer: 2000,
                        showConfirmButton: false, // Menampilkan tombol konfirmasi
                        allowOutsideClick: false, // Menonaktifkan penutupan saat klik di luar
                        allowEscapeKey: false, // Menonaktifkan penutupan dengan tombol Escape
                        customClass: {
                            popup: styles['colored-popup'], // Custom class untuk sweetalert
                        },
                    });

                    if (masterDataState === 'APPROVE' || masterDataState === 'BATAL_APPROVE') {
                        await generateNU(kode_entitas, generateNoDokJurnal, '20', stateDataHeader.dateGenerateNu.format('YYYYMM'))
                            .then((result) => {})
                            .catch((error) => {
                                withReactContent(swalDialog).fire({
                                    title: ``,
                                    html: `Penambahan Counter No. Jurnal ${errormsg}`,
                                    icon: 'warning',
                                    width: '20%',
                                    heightAuto: true,
                                    showConfirmButton: true,
                                    confirmButtonText: 'Ok',
                                    target: '#dialogFormRpe',
                                });
                            });
                    }

                    endProgress();
                    await handleRefreshData();
                    await closeDialogRpeList();
                } else {
                    withReactContent(swalDialog).fire({
                        title: ``,
                        html: errormsg,
                        icon: 'warning',
                        width: '20%',
                        heightAuto: true,
                        showConfirmButton: true,
                        confirmButtonText: 'Ok',
                        target: '#dialogFormRpe',
                    });
                    endProgress();
                }

                //endProgress();
            }

            // swal.close();
        }

        //////////////////////////////////////////////////////////////////////
    };

    useEffect(() => {
        const dialogElement = document.getElementById('#dialogFormRpe');
        if (dialogElement) {
            dialogElement.style.maxHeight = 'none';
            dialogElement.style.maxWidth = 'none';
        }
    }, []);

    return (
        <DialogComponent
            id="dialogFormRpe"
            name="dialogFormRpe"
            className="dialogFormRpe"
            target="#main-target"
            header={() => {
                let header: JSX.Element | string = '';
                if (masterDataState == 'BARU') {
                    header = (
                        <div>
                            <div className="header-title">
                                Realisasi Pembayaran Ekspedisi Baru <span style={{ color: '#00ab55', fontWeight: 'bold', textTransform: 'uppercase', marginLeft: 10 }}>[PEMBAYARAN]</span>
                            </div>
                        </div>
                    );
                    // header = `Realisasi Pembayaran Ekspedisi Baru [PEMBAYARAN]`;
                } else if (masterDataState == 'EDIT') {
                    header = (
                        <div>
                            <div className="header-title">
                                Edit Realisasi Pembayaran Ekspedisi <span style={{ color: '#00ab55', fontWeight: 'bold', textTransform: 'uppercase', marginLeft: 10 }}>[PEMBAYARAN]</span>
                            </div>
                        </div>
                    );
                } else if (masterDataState == 'APPROVE') {
                    header = (
                        <div>
                            <div className="header-title">
                                Approve Realisasi Pembayaran Ekspedisi <span style={{ color: '#00ab55', fontWeight: 'bold', textTransform: 'uppercase', marginLeft: 10 }}>[PEMBAYARAN]</span>
                            </div>
                        </div>
                    );
                } else if (masterDataState == 'BATAL_APPROVE') {
                    header = (
                        <div>
                            <div className="header-title">
                                Batal Approve Realisasi Pembayaran Ekspedisi <span style={{ color: '#00ab55', fontWeight: 'bold', textTransform: 'uppercase', marginLeft: 10 }}>[PEMBAYARAN]</span>
                            </div>
                        </div>
                    );
                }
                return header;
            }}
            visible={isOpen}
            isModal={true}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            enableResize={true}
            resizeHandles={['All']}
            allowDragging={true}
            showCloseIcon={true}
            width="97%" //"70%"
            height="97%"
            position={{ X: 'center', Y: 8 }}
            style={{ position: 'fixed' }}
            // buttons={buttonInputData}
            close={() => {
                closeDialogRpeList();
                setDataBarang((state: any) => ({
                    ...state,
                    nodes: [],
                }));
            }}
            closeOnEscape={false}
            open={(args: any) => {
                args.preventFocus = true;
            }}
        >
            <div className={'h-full w-full border'}>
                <GlobalProgressBar />
                <div className="h-full  w-full">
                    {/* screen loader  */}
                    {/* {showLoader && contentLoader()} */}
                    <div className="h-full w-full">
                        {/* ===============  Master Form Data RPE ========================   */}
                        <TemplateHeaderRpe
                            userid={userid}
                            kode_entitas={kode_entitas}
                            entitas={entitas}
                            token={token}
                            onRenderDayCell={onRenderDayCell}
                            stateDataHeader={stateDataHeader}
                            setStateDataHeader={setStateDataHeader}
                            setStateDataFooter={setStateDataFooter}
                            setDataBarang={setDataBarang}
                            masterKodeDokumen={masterKodeDokumen}
                            masterDataState={masterDataState}
                            stateDataFooter={stateDataFooter}
                            dataBarang={dataBarang}
                            stateDataArray={stateDataArray}
                            onRefreshTipe={onRefreshTipe}
                            refreshKeyNamaEkspedisi={refreshKeyNamaEkspedisi}
                        />
                        {masterDataState == 'BARU' || masterDataState == 'EDIT' ? (
                            <TemplateDetailRpe
                                userid={userid}
                                kode_entitas={kode_entitas}
                                entitas={entitas}
                                token={token}
                                onRenderDayCell={onRenderDayCell}
                                stateDataHeader={stateDataHeader}
                                dataBarang={dataBarang}
                                tabPhuList={tabPhuList}
                                setStateDataHeader={setStateDataHeader}
                                setStateDataArray={setStateDataArray}
                                stateDataArray={stateDataArray}
                                setDataBarang={setDataBarang}
                                setStateDataFooter={setStateDataFooter}
                                stateDataFooter={stateDataFooter}
                                masterDataState={masterDataState}
                                setFiles={setFiles}
                                setPreviewFile={setPreviewFile}
                                handleFileUpload={handleFileUpload}
                                files={files}
                                previewFile={previewFile}
                                setFilesUpload={setFilesUpload}
                                filesUpload={filesUpload}
                            />
                        ) : (
                            <TemplateDetailApproveRpe
                                userid={userid}
                                kode_entitas={kode_entitas}
                                entitas={entitas}
                                token={token}
                                onRenderDayCell={onRenderDayCell}
                                stateDataHeader={stateDataHeader}
                                dataBarang={dataBarang}
                                dataJurnal={dataJurnal}
                                tabPhuList={tabPhuList}
                                setStateDataHeader={setStateDataHeader}
                                setStateDataArray={setStateDataArray}
                                stateDataArray={stateDataArray}
                                setDataBarang={setDataBarang}
                                setDataJurnal={setDataJurnal}
                                // setDataKeuangan={setDataKeuangan}
                                setStateDataFooter={setStateDataFooter}
                                stateDataFooter={stateDataFooter}
                                masterDataState={masterDataState}
                                setFiles={setFiles}
                                setPreviewFile={setPreviewFile}
                                handleFileUpload={handleFileUpload}
                                files={files}
                                previewFile={previewFile}
                                // onRefreshTipe={onRefreshTipe}
                                setFilesUpload={setFilesUpload}
                            />
                        )}

                        <TemplateFooterRpe
                            userid={userid}
                            kode_entitas={kode_entitas}
                            entitas={entitas}
                            token={token}
                            stateDataHeader={stateDataHeader}
                            setStateDataHeader={setStateDataHeader}
                            setStateDataFooter={setStateDataFooter}
                            stateDataFooter={stateDataFooter}
                            dataBarang={dataBarang}
                        />
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
                    {(masterDataState == 'BARU' || masterDataState == 'EDIT' || masterDataState == 'APPROVE' || masterDataState == 'BATAL_APPROVE') && (
                        <ButtonComponent
                            id="buBatalDokumen1"
                            content="Batal"
                            cssClass="e-primary e-small"
                            iconCss="e-icons e-small e-close"
                            style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 3.2 + 'em', backgroundColor: '#3b3f5c' }}
                            onClick={closeDialogRpeList}
                        />
                    )}
                    {(masterDataState == 'BARU' || masterDataState == 'EDIT') && (
                        <ButtonComponent
                            id="buSimpanDokumen1"
                            content="Simpan"
                            cssClass="e-primary e-small"
                            iconCss="e-icons e-small e-save"
                            style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 0.3 + 'em', backgroundColor: '#3b3f5c' }}
                            onClick={prosesBloking}
                        />
                    )}
                    {masterDataState == 'APPROVE' && (
                        <>
                            <ButtonComponent
                                id="buTolak"
                                content="Ditolak"
                                cssClass="e-primary e-small"
                                // iconCss="e-icons e-small e-close"
                                style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1.2 + 'em', backgroundColor: '#3b3f5c' }}
                                onClick={() => PrepareApproval('TOLAK')}
                            />
                            <ButtonComponent
                                id="buKoreksi"
                                content="Koreksi"
                                cssClass="e-primary e-small"
                                // iconCss="e-icons e-small e-close"
                                style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1.2 + 'em', backgroundColor: '#3b3f5c' }}
                                onClick={() => PrepareApproval('KOREKSI')}
                            />
                            <ButtonComponent
                                id="buSetuju"
                                content="Disetujui"
                                cssClass="e-primary e-small"
                                // iconCss="e-icons e-small e-close"
                                style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1.2 + 'em', backgroundColor: '#3b3f5c' }}
                                onClick={() => PrepareApproval('SETUJU')}
                            />
                        </>
                    )}
                    {masterDataState == 'BATAL_APPROVE' && (
                        <>
                            <ButtonComponent
                                id="buSetuju"
                                content="Disetujui"
                                cssClass="e-primary e-small"
                                // iconCss="e-icons e-small e-close"
                                style={{ float: 'right', width: '90px', marginTop: 1 + 'em', marginRight: 1.2 + 'em', backgroundColor: '#3b3f5c' }}
                                onClick={() => PrepareApproval('SETUJU')}
                            />
                        </>
                    )}
                </div>
                {/* ============================================================ */}
                {stateDataHeader.isOpenPreview && (
                    <div
                        style={{
                            position: 'fixed',
                            top: '0',
                            left: '0',
                            width: '100vw',
                            height: '100vh',
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: '1000',
                            overflow: 'hidden',
                        }}
                        // onClick={() => HandleCloseZoom(setIsOpenPreview)}
                    >
                        <div
                            style={{
                                position: 'relative',
                                textAlign: 'center',
                                zIndex: '1001',
                                cursor: stateDataHeader.isDragging ? 'grabbing' : 'grab',
                            }}
                        >
                            <img
                                src={stateDataHeader.imageDataUrl}
                                alt={`${stateDataHeader.indexPreview}`}
                                style={{
                                    transform: `scale(${zoomScale}) translate(${position.x}px, ${position.y}px)`,
                                    transition: 'transform 0.1s ease',
                                    cursor: 'pointer',
                                    maxWidth: '100vw',
                                    maxHeight: '100vh',
                                }}
                                onMouseDown={handleMouseDown}
                                onMouseUp={handleMouseUp}
                            />
                        </div>
                        <div
                            style={{
                                position: 'fixed',
                                top: '10px',
                                right: '10px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '10px',
                                zIndex: '1001',
                            }}
                        >
                            <ButtonComponent
                                id="zoomIn"
                                cssClass="e-primary e-small"
                                iconCss=""
                                style={{
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '24px',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    padding: 0,
                                }}
                            >
                                <span className="e-icons e-zoom-in" style={{ fontSize: '32px', fontWeight: 'bold' }} onClick={() => HandleZoomIn(setZoomScale)}></span>
                            </ButtonComponent>

                            <ButtonComponent
                                id="zoomOut"
                                cssClass="e-primary e-small"
                                iconCss=""
                                style={{
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '24px',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    padding: 0,
                                }}
                            >
                                <span className="e-icons e-zoom-out" style={{ fontSize: '32px', fontWeight: 'bold' }} onClick={() => HandleZoomOut(setZoomScale)}></span>
                            </ButtonComponent>

                            <ButtonComponent
                                id="close"
                                cssClass="e-primary e-small"
                                iconCss=""
                                style={{
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '24px',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    padding: 0,
                                }}
                            >
                                <span className="e-icons e-close" style={{ fontSize: '20px', fontWeight: 'bold' }} onClick={() => HandleCloseZoom(setStateDataHeader)}></span>
                            </ButtonComponent>
                        </div>
                    </div>
                )}
            </div>
            <DialogHargaEkspedisi
                dialogDaftarHargaEkspedisiVisible={stateDataHeader.dialogDaftarHargaEkspedisiVisible}
                stateDataHeader={stateDataHeader}
                setStateDataHeader={setStateDataHeader}
                setStateDataArray={setStateDataArray}
                stateDataArray={stateDataArray}
                setDataBarang={setDataBarang}
                setStateDataFooter={setStateDataFooter}
                stateDataFooter={stateDataFooter}
            />
        </DialogComponent>
    );
};

export default DialogFormRpe;
