import { useState, useEffect, useRef } from 'react';
import 'flatpickr/dist/flatpickr.css';
import 'tippy.js/dist/tippy.css';
import styles from './polist.module.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/light.css';
import { useRouter } from 'next/router';

import moment from 'moment';
import 'moment/locale/id';
import { generateNU, frmNumber, DiskonByCalc, tanpaKoma, fetchPreferensi } from '@/utils/routines';
import React from 'react';
// import { nodes } from './data';
import { faCirclePlus, faCircleMinus, faFolderOpen, faFilePdf, faCalendarDay } from '@fortawesome/free-solid-svg-icons';
import { faMagnifyingGlass, faPlay, faSave, faBackward, faCancel, faFileArchive, faCamera, faTimes } from '@fortawesome/free-solid-svg-icons';
import SupplierModal from './modal/supplier';
import TerminModal from './modal/terminBayar';
import axios from 'axios';
import PoGrup from './modal/poGrup';
import PpnAtasNama from './modal/ppnAtasNama';
import DaftarPp from './modal/daftarPp';
import DaftarPpItem from './modal/daftarPpItem';
import swal from 'sweetalert2';
import TableBarangJadi from './component/tabelBarangJadi';
import TableBarangProduksi from './component/tabelBarangProduksi';
import { ValueCaraPengiriman, ValueFax, ValuePajak } from './component/dataSelectDefault';
import { ReCalc, ReCalcDataNodes, ReCalcHargaPembelianBarangJadi, ReCalcPerhitungan, ReCalcPerhitunganNilaiPajak } from './component/reCalc';
import DaftarHargaBarangJadi from './modal/daftarHargaBarangJadi';
import Draggable from 'react-draggable';
import {
    cancelPreview,
    cancelPreviewPdf,
    cancelPreviewPdf2,
    handleBersihkanGambar,
    handleBersihkanGambarSemua,
    handleBersihkanPdf,
    handleBersihkanPdf2,
    handleClick,
    handleClickPdf,
    handleClickPdf2,
    handleClickPreview,
    handleFileUpload,
    handleFileUploadpdf,
    handleFileUploadpdf2,
    handlePreviewPdf,
    handlePreviewPdf2,
    handleTabChange,
    handleTabClick,
    handleTabClick1,
    handleTabClick2,
    handleUpload,
} from './component/fungsiFileUpload';
import { Document, Page, pdfjs } from 'react-pdf';
import {
    HandleAlamatPengiriman,
    // HandleBatal,
    HandleCatatan,
    HandleDaftarPpFilter,
    HandleEstBiayaKirim,
    HandleHargaItemBarangJadi,
    HandleKirimIdRemove,
    HandleKirimLangusng,
    HandleKurs,
    HandleModalChange,
    HandleModalHargaItem,
    HandleModalItem,
    HandleModaliconChange,
    HandlePoGrup,
    HandlePpnAtasNama,
    HandleRemoveAllRows,
    HandleRemoveRows,
    HandleSelectedData,
    HandleSelectedPoGrup,
    HandleSelectedPpnAtasNama,
    HandleSelectedTermin,
} from './component/fungsiFormPo';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
// Configure worker path
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// interface POProps {
//     userid: any;
//     kode_entitas: any;
// }

import { useSession } from '@/pages/api/sessionContext';
import { cekDataDiDatabase } from '@/utils/global/fungsi';
let routeTglAwal: any,
    routeNoPo: any,
    routeNamaSupp: any,
    routeNamaBarang: any,
    routeTipeDokumen: any,
    routeTglAkhir: any,
    routeTglBerlaku1: any,
    routeTglBerlaku2: any,
    routeTglKirim1: any,
    routeTglKirim2: any,
    routeNoPoChecked: any,
    routeNamaSuppChecked: any,
    routeNamaBarangChecked: any,
    routeStatusDok: any,
    routeStatusApp: any,
    routeTanggalChecked: any;
const spp = () => {
    const { sessionData, isLoading } = useSession();
    const kode_entitas = sessionData?.kode_entitas ?? '';
    const userid = sessionData?.userid ?? '';
    const nip = sessionData?.nip ?? '';
    const kode_user = sessionData?.nip ?? '';
    const entitas = sessionData?.entitas ?? '';
    const token = sessionData?.token ?? '';
    const kode_jabatan = sessionData?.kode_jabatan ?? '';

    if (isLoading) {
        return;
    }

    const router = useRouter();
    const [selectedOption, setSelectedOption] = useState('');
    const [selectedOptionPajak, setSelectedOptionPajak] = useState('N');
    const [selectedOptionCaraPengiriman, setSelectedOptionCaraPengiriman] = useState('');
    const [selectedOptionFax, setSelectedOptionFax] = useState('');

    const [date1, setDate1] = useState<any>(new Date());
    const [date2, setDate2] = useState<any>('');
    const [date3, setDate3] = useState<any>('');

    const [modal1, setModal1] = useState(false);
    const [modal2, setModal2] = useState(false);
    const [modal3, setModal3] = useState(false);
    const [modal4, setModal4] = useState(false);
    const [modal5, setModal5] = useState(false);
    const [modal6, setModal6] = useState(false);

    const [modalPpnAtasNama, setModalPpnAtasNama] = useState(false);
    const [modalPoGrup, setModalPoGrup] = useState(false);
    const [modalSuppRow, setModSuppRow] = useState(false);
    const [modalSuppDaftarPp, setModSuppDaftarPp] = useState(false);

    const [terminSelected, setterminSelected] = useState<any>('');
    const [suppSelected, setSuppSelected] = useState<any>('');
    const [suppSelectedKode, setSuppSelectedKode] = useState<any>('');
    const [selectedKodeTermin, setSelectedKodeTermin] = useState<any>('');

    const [selectedKodePoGrup, setSelectedKodePoGrup] = useState<any>('');
    const [selectedKodePpnAtasNama, setSelectedKodePpnAtasNama] = useState<any>('');
    const [selectedNamaCabangPpnAtasNama, setSelectedNamaCabangPpnAtasNama] = useState<any>('');

    const [jTransaksi, setJenisTransaksi] = useState<any>('');
    const [jBarang, setJenisBarang] = useState<any>('');
    const mounted = useRef(false);
    const [noPOValue, setNoPOValue] = useState<any>('');
    const [dateGenerateNu, setDateGenerateNu] = useState<moment.Moment>(moment());

    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [alamatPengiriman, setAlamatPengiriman] = useState<any>('');
    const [tokenRedis, setTokenRedis] = useState<any>('');

    type ListAreaBeli = {
        kode_beli: string;
        nama_beli: string;
    };

    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    const [recordListAreaBeli, setRecordListAreaBeli] = useState<ListAreaBeli[]>([]);

    const [kodePajak, setKodePajak] = useState('');
    const [nilaiPajak, setNilaiPajak] = useState('');
    const [selectedKodeRelasi, setSelectedKodeRelasi] = useState<any>('');
    const [totalBeratVariabel, setTotalBeratVariabel] = useState(0);
    const [totalJumlahVariabel, setTotalJumlahVariabel] = useState(0);
    const [totalJumlahSetelahPajakVariabel, setTotalJumlahSetelahPajakVariabel] = useState(0);
    const [totalJumlahSetelahPajakFilter, setTotalJumlahSetelahPajakFilter] = useState(0);
    const [totalJumlahSetelahPajakKirim, setTotalJumlahSetelahPajakKirim] = useState(0);
    const [valueFilterKuantitas, setValueFilterKuantitas] = useState('');
    const [totalNilaiPajakVariabel, setTotalNilaiPajakVariabel] = useState(0);
    const [disabledIconNoSpp, setDisabledIconNoSpp] = useState(false);
    const [disabledIconNoBarang, setDisabledIconNoBarang] = useState(false);
    const [disabledIconNamaBarang, setDisabledIconNamaBarang] = useState(false);
    const vRefreshData = useRef<number>(0);

    const handleDaftarPpItem = async (dataObject: any) => {
        setButtonDisabled(true);
        const {
            // idPp,
            noPp,
            property,
            noItem,
            diskripsi,
            satuan,
            sisa,
            kuantitasKg,
            diameter,
            jarakCm,
            kgBtg,
            hargaKg,
            kuantitasBtg,
            hargaBtg,
            qty,
            berat,
            brt,
            kode_pp,
            id_pp,
            kode_item,
            qty_asli,
            qty_sisa,
            qty_batal,
            kode_mu,
            kurs,
            kurs_pajak,
            diskon_mu,
            kode_pajak,
            include,
            pajak_mu,
            kode_dept,
            kontrak,
            kodecabang,
            keterangan,
        } = dataObject;

        let totalBerat,
            totalJumlah,
            totalCalNilaiDpp,
            totalCalNilaiDppFilter,
            totalJumlahSetelahPajak,
            totalJumlahSetelahPajakKirim,
            totalJumlahPajak = 0,
            valueDpp = 0;

        // Mendapatkan nilai harga_mu dengan menjalankan promise
        const hargaPembelian = await ReCalcHargaPembelianBarangJadi(kode_entitas, kode_item, suppSelectedKode, selectedKodeRelasi);
        const harga_mu = hargaPembelian.harga;
        const diskon = hargaPembelian.diskon;
        const diskonMu = hargaPembelian.diskon_mu;
        const potongan = hargaPembelian.potongan;
        const pajakMu = hargaPembelian.pajak;

        await setCatatan(keterangan);
        const catatan = document.getElementById('catatan') as HTMLInputElement;
        if (catatan) {
            catatan.value = keterangan;
        }

        await setDataDetail((state: any) => {
            const newNodes = state.nodes.map((node: any) => {
                let jumlahMu = jBarang === 'produksi' ? frmNumber(hargaBtg * sisa) : frmNumber(ReCalcPerhitungan(sisa, harga_mu, diskon, potongan, 'jumlah'));
                let jumlah_mu = parseFloat(tanpaKoma(jumlahMu));
                let nilai_pajak = 0;
                let totNilaiPajak;
                if (selectedOptionPajak === 'N') {
                    totNilaiPajak = 0;
                } else if (selectedOptionPajak === 'E') {
                    totNilaiPajak = (jumlah_mu * nilai_pajak) / 100;
                } else if (selectedOptionPajak === 'I') {
                    if (nilai_pajak === 10) {
                        totNilaiPajak = ((100 / 110) * jumlah_mu * nilai_pajak) / 100;
                    } else if (nilai_pajak === 11) {
                        totNilaiPajak = ((100 / 111) * jumlah_mu * nilai_pajak) / 100;
                    } else {
                        totNilaiPajak = 0;
                    }
                }
                let kode_pajak;
                if (nilai_pajak === 0) {
                    kode_pajak = 'N';
                } else if (nilai_pajak === 10) {
                    kode_pajak = 'S';
                } else if (nilai_pajak === 11) {
                    kode_pajak = 'T';
                }

                if (node.id === rowid) {
                    // Logika perubahan pada setiap baris
                    setValueFilterKuantitas(sisa);
                    return {
                        ...node,
                        [property]: diskripsi,
                        // id: node.id,
                        no_spp: noPp,
                        no_barang: noItem,
                        nama_barang: diskripsi,
                        kuantitas_kg: frmNumber(kuantitasKg),
                        diameter: diameter,
                        jarak_cm: jarakCm === null || jarakCm === '' || jarakCm === '0' ? frmNumber(0) : frmNumber(jarakCm),
                        kg_btg: frmNumber(kgBtg),
                        harga_kg: frmNumber(hargaKg),
                        kuantitas_btg: frmNumber(kuantitasBtg),
                        harga_btg: frmNumber(hargaBtg),
                        satuan: satuan,
                        kuantitas: frmNumber(sisa),
                        pajak: jBarang === 'produksi' ? (selectedOptionPajak === 'N' ? '0.00' : '11.00') : selectedOptionPajak === 'N' ? '0.00' : frmNumber(pajakMu),
                        harga: jBarang === 'produksi' ? frmNumber(hargaBtg) : frmNumber(harga_mu),
                        diskon: jBarang === 'produksi' ? '' : diskon === null || diskon === '' ? '' : frmNumber(diskon),
                        potongan: jBarang === 'produksi' ? '' : potongan === null || potongan === '' ? '' : frmNumber(potongan),
                        jumlah: jBarang === 'produksi' ? frmNumber(hargaBtg * sisa) : frmNumber(ReCalcPerhitungan(sisa, harga_mu, diskon, potongan, 'jumlah')),
                        // jumlah: frmNumber(hargaBtg * qty),
                        berat: frmNumber(berat),
                        brt: brt,
                        // nilai_pajak: 0,
                        nilai_pajak: totNilaiPajak,

                        kode_pp: kode_pp,
                        id_pp: id_pp,
                        kode_item: kode_item,
                        qty_asli: sisa,
                        qty_sisa: qty_sisa,
                        qty_batal: qty_batal,
                        kode_mu: kode_mu,
                        kurs: kurs,
                        kurs_pajak: kurs_pajak,
                        diskon_mu: jBarang === 'produksi' ? '0' : diskonMu === null || diskonMu === '' ? '0' : frmNumber(diskonMu),
                        // kode_pajak: 'N',
                        kode_pajak: kode_pajak,
                        include: 'N',
                        pajak_mu: 0, // ini belum
                        kode_dept: kode_dept,
                        kontrak: jTransaksi === 'KONTRAK' ? 'Y' : 'N',
                        kodecabang: '',

                        qty_std_filter: frmNumber(qty),
                    };
                } else {
                    return node;
                }
            });

            // Menghitung ulang total berat dan total jumlah berdasarkan setiap baris
            totalBerat = newNodes.reduce((acc: number, node: any) => {
                return acc + parseFloat(node.berat);
            }, 0);

            totalJumlah = newNodes.reduce((acc: number, node: any) => {
                return acc + parseFloat(node.jumlah.replace(/[^0-9.-]+/g, ''));
            }, 0);

            // const totNilaiPajak = ReCalcPerhitunganNilaiPajak(selectedOptionPajak, sisa, harga_mu, diskon, potongan, Number(pajakMu), 'jumlah');
            // totalJumlahPajak += totNilaiPajak;

            totalJumlahPajak = newNodes.reduce((acc: number, node: any) => {
                return acc + parseFloat(node.nilai_pajak);
            }, 0);

            // Menetapkan total berat dan total jumlah baru ke state
            setTotalBeratVariabel(totalBerat);
            setTotalJumlahVariabel(totalJumlah);
            setTotalJumlahSetelahPajakVariabel(totalJumlah);
            setTotalJumlahSetelahPajakFilter(totalJumlah);
            setTotalJumlahSetelahPajakKirim(totalJumlah);
            if (selectedOptionPajak === 'N') {
                setValueNilaiDpp(0);
                setValueNilaiDppFilter(0);
            } else if (selectedOptionPajak === 'E') {
                totalCalNilaiDpp = totalJumlah - (isNaN(nilaiDiskonHeader) ? 0 : nilaiDiskonHeader);
                totalCalNilaiDppFilter = totalJumlah;
                totalJumlahSetelahPajak = totalCalNilaiDpp + (isNaN(totalJumlahPajak) ? 0 : totalJumlahPajak) + (nilaiBiayaKirim === '0' || nilaiBiayaKirim === '' ? 0 : parseFloat(nilaiBiayaKirim));
                totalJumlahSetelahPajakKirim = totalCalNilaiDpp + (isNaN(totalJumlahPajak) ? 0 : totalJumlahPajak);

                setValueNilaiDpp(totalCalNilaiDpp);
                setValueNilaiDppFilter(totalCalNilaiDppFilter);
                // totalCalNilaiDpp = totalJumlah - (isNaN(nilaiDiskonHeader) ? 0 : nilaiDiskonHeader);
                // setTotalJumlahSetelahPajakVariabel(totalCalNilaiDpp + totalJumlahPajak);
                // setTotalJumlahSetelahPajakFilter(totalCalNilaiDpp + totalJumlahPajak);
                // setTotalJumlahSetelahPajakKirim(totalCalNilaiDpp + totalJumlahPajak);
                // setTotalNilaiPajakVariabel(totalJumlahPajak);
                setTotalJumlahSetelahPajakVariabel(totalJumlahSetelahPajak);
                setTotalJumlahSetelahPajakFilter(totalJumlahSetelahPajak);
                setTotalJumlahSetelahPajakKirim(totalJumlahSetelahPajakKirim);
                setTotalNilaiPajakVariabel(totalJumlahPajak);
            } else if (selectedOptionPajak === 'I') {
                if (isNaN(valueNilaiDpp)) {
                    valueDpp = 0;
                } else {
                    valueDpp = valueNilaiDpp;
                }
                // totalCalNilaiDpp = valueDpp + (jBarang === 'produksi' ? hargaBtg : harga_mu) * sisa;
                // totalCalNilaiDpp = totalJumlah - totalJumlahPajak - (isNaN(nilaiDiskonHeader) ? 0 : nilaiDiskonHeader);
                // totalCalNilaiDpp = totalJumlah - totalNilaiPajakVariabel - (isNaN(nilaiDiskonHeader) ? 0 : nilaiDiskonHeader);
                totalCalNilaiDpp = totalJumlah - totalJumlahPajak - (isNaN(nilaiDiskonHeader) ? 0 : nilaiDiskonHeader);
                totalCalNilaiDppFilter = totalJumlah - totalJumlahPajak;
                totalJumlahSetelahPajak = totalCalNilaiDpp + totalJumlahPajak + (nilaiBiayaKirim === '0' || nilaiBiayaKirim === '' ? 0 : parseFloat(nilaiBiayaKirim));
                totalJumlahSetelahPajakKirim = totalCalNilaiDpp + totalJumlahPajak;

                setValueStringPajak('Sudah termasuk pajak.');
                setValueNilaiDpp(totalCalNilaiDpp);
                setValueNilaiDppFilter(totalCalNilaiDppFilter);
                // setTotalNilaiPajakVariabel(totalNilaiPajakVariabel);
                // setValueNilaiDppFilter(totalCalNilaiDpp);
                setTotalNilaiPajakVariabel(totalJumlahPajak);
                // setTotalJumlahSetelahPajakVariabel(totalCalNilaiDpp + totalJumlahPajak);
                // setTotalJumlahSetelahPajakFilter(totalCalNilaiDpp + totalJumlahPajak);
                // setTotalJumlahSetelahPajakKirim(totalCalNilaiDpp + totalJumlahPajak);

                // setTotalJumlahSetelahPajakVariabel(totalCalNilaiDpp + totalNilaiPajakVariabel);
                // setTotalJumlahSetelahPajakFilter(totalCalNilaiDpp + totalNilaiPajakVariabel);
                // setTotalJumlahSetelahPajakKirim(totalCalNilaiDpp + totalNilaiPajakVariabel);

                setTotalJumlahSetelahPajakVariabel(totalJumlahSetelahPajak);
                setTotalJumlahSetelahPajakFilter(totalJumlahSetelahPajak);
                setTotalJumlahSetelahPajakKirim(totalJumlahSetelahPajakKirim);
            }

            return {
                nodes: newNodes,
            };
        });
    };

    const handleDaftarPp = async (dataObject: any) => {
        setDisabledIconNoSpp(true);
        setDisabledIconNoBarang(true);
        setDisabledIconNamaBarang(true);
        setButtonDisabled(true);
        const { noPp, property, produksi, tanggal } = dataObject;

        try {
            const obj = {
                entitas: kode_entitas,
                where: {
                    produksi: produksi,
                    tgl: tanggal,
                    no_pp: noPp,
                },
            };

            const jsonString = JSON.stringify(obj);
            const encodedString = btoa(jsonString);

            const response2 = await axios.get(`${apiUrl}/erp/dlg_detail_pp`, {
                params: {
                    cmd: encodedString,
                },
            });

            setCatatan(response2.data.data[0].keterangan);
            const catatan = document.getElementById('catatan') as HTMLInputElement;
            if (catatan) {
                catatan.value = response2.data.data[0].keterangan;
            }
            // Memanggil setDataDetail untuk memperbarui state
            let totalBerat = 0,
                totalJumlah = 0,
                totalJumlahPajak = 0,
                valueDpp,
                totalCalNilaiDpp,
                totalCalNilaiDppFilter,
                totalJumlahSetelahPajak,
                totalJumlahSetelahPajakKirim;
            const id = 0;

            Promise.all(
                response2.data.data.map((item: any) => {
                    totalBerat += parseFloat(item.berat);
                    return ReCalcHargaPembelianBarangJadi(kode_entitas, item.kode_item, suppSelectedKode, selectedKodeRelasi)
                        .then((hargaPembelian) => {
                            const harga_mu = hargaPembelian.harga;
                            const diskon = hargaPembelian.diskon;
                            const diskon_mu = hargaPembelian.diskon_mu;
                            const potongan = hargaPembelian.potongan;
                            const pajakMu = hargaPembelian.pajak;
                            let calculatedValue: number;
                            if (produksi === 'Y') {
                                calculatedValue = parseFloat(item.fpp_harga_btg) * parseFloat(item.qty_sisa);
                            } else {
                                const result = ReCalcPerhitungan(item.qty_sisa, harga_mu, diskon, potongan, 'jumlah');
                                if (typeof result === 'number') {
                                    calculatedValue = result;
                                } else {
                                    calculatedValue = 0; // Or any other default value
                                }
                            }
                            totalJumlah += calculatedValue;
                            // const totNilaiPajak1 = ReCalcPerhitunganNilaiPajak(selectedOptionPajak, item.qty_sisa, harga_mu, diskon, potongan, Number(pajakMu), 'jumlah');
                            // totalJumlahPajak += totNilaiPajak1;

                            let jumlahMu = produksi === 'Y' ? frmNumber(item.fpp_harga_btg * item.qty_sisa) : frmNumber(ReCalcPerhitungan(item.qty_sisa, harga_mu, diskon, potongan, 'jumlah'));
                            let jumlah_mu = parseFloat(tanpaKoma(jumlahMu));
                            let nilai_pajak = 0;
                            let totNilaiPajak = 0;
                            if (selectedOptionPajak === 'N') {
                                totNilaiPajak = 0;
                            } else if (selectedOptionPajak === 'E') {
                                totNilaiPajak = (jumlah_mu * nilai_pajak) / 100;
                            } else if (selectedOptionPajak === 'I') {
                                if (nilai_pajak === 10) {
                                    totNilaiPajak = ((100 / 110) * jumlah_mu * nilai_pajak) / 100;
                                } else if (nilai_pajak === 11) {
                                    totNilaiPajak = ((100 / 111) * jumlah_mu * nilai_pajak) / 100;
                                } else {
                                    totNilaiPajak = 0;
                                }
                            }
                            let kode_pajak;
                            if (nilai_pajak === 0) {
                                kode_pajak = 'N';
                            } else if (nilai_pajak === 10) {
                                kode_pajak = 'S';
                            } else if (nilai_pajak === 11) {
                                kode_pajak = 'T';
                            }

                            totalJumlahPajak += totNilaiPajak;

                            return {
                                [property]: item.no_pp,
                                id: item.id - 1 + 1,
                                po_grup: '',
                                ppn_atas_nama: '',
                                no_spp: item.no_pp,
                                no_barang: item.no_item,
                                nama_barang: item.diskripsi,
                                kuantitas_kg: frmNumber(item.fpp_qty),
                                diameter: item.fpp_diameter,
                                jarak_cm: item.fpp_jarak === null || item.fpp_jarak === '' || item.fpp_jarak === '0' ? frmNumber(0) : frmNumber(item.fpp_jarak),
                                kg_btg: frmNumber(item.fpp_kg),
                                harga_kg: frmNumber(item.fpp_harga_kg),
                                kuantitas_btg: frmNumber(item.fpp_btg),
                                harga_btg: frmNumber(item.fpp_harga_btg),
                                satuan: item.satuan,
                                kuantitas: frmNumber(item.qty_sisa),
                                pajak: produksi === 'Y' ? (selectedOptionPajak === 'N' ? '0.00' : '11.00') : selectedOptionPajak === 'N' ? '0.00' : frmNumber(pajakMu),
                                harga: produksi === 'Y' ? frmNumber(item.fpp_harga_btg) : frmNumber(harga_mu),
                                diskon: produksi === 'Y' ? '' : diskon === null || diskon === '' ? '' : frmNumber(diskon),
                                potongan: produksi === 'Y' ? '' : potongan === null || potongan === '' ? '' : frmNumber(potongan),
                                jumlah: produksi === 'Y' ? frmNumber(item.fpp_harga_btg * item.qty_sisa) : frmNumber(ReCalcPerhitungan(item.qty_sisa, harga_mu, diskon, potongan, 'jumlah')),
                                berat: frmNumber(item.brt * item.qty_sisa),
                                keterangan: '',
                                brt: item.brt,
                                // nilai_pajak: 0,
                                nilai_pajak: totNilaiPajak,

                                kode_pp: item.kode_pp,
                                id_pp: item.id_pp,
                                kode_item: item.kode_item,
                                qty_asli: item.qty_sisa,
                                qty_sisa: item.qty_sisa,
                                qty_batal: item.qty_batal,
                                kode_mu: 'IDR',
                                kurs: 1,
                                kurs_pajak: 1,
                                diskon_mu: produksi === 'Y' ? '0' : diskon_mu === null || diskon_mu === '' ? '0' : frmNumber(diskon_mu),
                                // kode_pajak: 'N',
                                kode_pajak: kode_pajak,
                                include: 'N',
                                pajak_mu: 0,
                                kode_dept: item.kode_dept,
                                kontrak: jTransaksi === 'KONTRAK' ? 'Y' : 'N',
                                kodecabang: '',

                                qty_std_filter: frmNumber(item.qty_std),
                            };
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                            return null;
                        });
                })
            ).then((newData) => {
                setDataDetail((state: any) => {
                    const existingNodes = state.nodes.filter((node: any) => node.kode_item === noPp);
                    const newNodes = [...existingNodes, ...newData.filter((data: any) => data !== null)];
                    return { ...state, nodes: newNodes }; // Memperbarui nodes dengan data yang diperbarui
                });
                setTotalJumlahVariabel(totalJumlah);
                if (selectedOptionPajak === 'N') {
                    setValueNilaiDpp(0);
                    setValueNilaiDppFilter(0);
                    setTotalJumlahSetelahPajakVariabel(totalJumlah);
                    setTotalJumlahSetelahPajakFilter(totalJumlah);
                    setTotalJumlahSetelahPajakKirim(totalJumlah);
                } else if (selectedOptionPajak === 'E') {
                    totalCalNilaiDpp = totalJumlah - (isNaN(nilaiDiskonHeader) ? 0 : nilaiDiskonHeader);
                    totalCalNilaiDppFilter = totalJumlah;
                    totalJumlahSetelahPajak =
                        totalCalNilaiDpp + (isNaN(totalJumlahPajak) ? 0 : totalJumlahPajak) + (nilaiBiayaKirim === '0' || nilaiBiayaKirim === '' ? 0 : parseFloat(nilaiBiayaKirim));
                    totalJumlahSetelahPajakKirim = totalCalNilaiDpp + (isNaN(totalJumlahPajak) ? 0 : totalJumlahPajak);

                    setValueNilaiDpp(totalCalNilaiDpp);
                    setValueNilaiDppFilter(totalCalNilaiDppFilter);
                    setTotalJumlahSetelahPajakVariabel(totalJumlahSetelahPajak);
                    setTotalJumlahSetelahPajakFilter(totalJumlahSetelahPajak);
                    setTotalJumlahSetelahPajakKirim(totalJumlahSetelahPajakKirim);
                    setTotalNilaiPajakVariabel(totalJumlahPajak);
                } else if (selectedOptionPajak === 'I') {
                    if (isNaN(valueNilaiDpp)) {
                        valueDpp = 0;
                    } else {
                        valueDpp = valueNilaiDpp;
                    }
                    totalCalNilaiDpp = totalJumlah - totalJumlahPajak - (isNaN(nilaiDiskonHeader) ? 0 : nilaiDiskonHeader);
                    totalCalNilaiDppFilter = totalJumlah - totalJumlahPajak;
                    totalJumlahSetelahPajak = totalCalNilaiDpp + totalJumlahPajak + (nilaiBiayaKirim === '0' || nilaiBiayaKirim === '' ? 0 : parseFloat(nilaiBiayaKirim));
                    totalJumlahSetelahPajakKirim = totalCalNilaiDpp + totalJumlahPajak;

                    setValueStringPajak('Sudah termasuk pajak.');
                    setValueNilaiDpp(totalCalNilaiDpp);
                    setValueNilaiDppFilter(totalCalNilaiDppFilter);
                    setTotalNilaiPajakVariabel(totalJumlahPajak);
                    setTotalJumlahSetelahPajakVariabel(totalJumlahSetelahPajak);
                    setTotalJumlahSetelahPajakFilter(totalJumlahSetelahPajak);
                    setTotalJumlahSetelahPajakKirim(totalJumlahSetelahPajakKirim);
                }
            });
            setTotalBeratVariabel(totalBerat);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const [kodeSpEdit, setKodeSpEdit] = useState<any>('');
    const [kodeSp, setKodeSp] = useState<any>('');
    const [tglSpEdit, setTglSpEdit] = useState<any>('');
    const [tglBerlakuEdit, setTglBerlakuEdit] = useState<any>('');
    const [tglKirimEdit, setTglKirimEdit] = useState<any>('');
    const [approvalData, setApprovalData] = useState<any>('');
    const [approvalAudit, setApprovalAudit] = useState<any>('');
    const [tglApproval, setTglApproval] = useState<any>('');
    const [statusDok, setStatusDok] = useState<any>('');

    const [loadFilePendukung, setLoadFilePendukung] = useState<ImageData[]>([]);
    const [filePendukungPdf1, setFilePendukungPdf1] = useState('');
    const [filePendukungPdf2, setFilePendukungPdf2] = useState('');
    const [pdfUrl, setPdfUrl] = useState('');
    const [pdfUrl2, setPdfUrl2] = useState('');

    interface ImageData {
        dokumen: string;
        filegambar: string;
        fileoriginal: any; // Sesuaikan dengan tipe yang sesuai
        gambar: any; // Sesuaikan dengan tipe yang sesuai
        id_dokumen: number; // Sesuaikan dengan tipe yang sesuai
        kode_dokumen: string;
        st: string;
        base64_string: string;
        decodeBase64_string: string;
    }

    const formatTgl = (tgl: any) => {
        // Contoh data dalam format 'DD-MM-YYYY'
        var dateString = tgl;

        // Memisahkan tanggal, bulan, dan tahun dari string
        var parts = dateString.split('-');
        var day = parseInt(parts[0], 10);
        var month = parseInt(parts[1], 10) - 1; // Bulan dimulai dari 0 (Januari adalah 0)
        var year = parseInt(parts[2], 10);

        // Membuat objek Date baru
        var newDate = new Date(year, month, day);
        return newDate;
    };

    const fetchData = async (kode_sp: any, name: any, tipe: any) => {
        const response = await axios.get(`${apiUrl}/erp/list_edit_po`, {
            params: {
                entitas: kode_entitas,
                kode_sp: kode_sp,
            },
        });

        const responsData = response.data;

        console.log('responsData = ', responsData);
        if (responsData.status === true) {
            setButtonDisabled(true);
            setKodeSp(responsData.data[0].kode_sp);
            // setDate1(moment(responsData.tgl_sp).format('DD-MM-YYYY'));
            setDate1(formatTgl(moment(responsData.tgl_sp).format('DD-MM-YYYY')));
            setTglSpEdit(responsData.tgl_sp);
            setDate2(formatTgl(moment(responsData.tgl_berlaku).format('DD-MM-YYYY')));
            setTglBerlakuEdit(responsData.tgl_berlaku);
            // setDate3(moment(responsData.tgl_kirim).format('DD-MM-YYYY'));
            setDate3(formatTgl(moment(responsData.tgl_kirim).format('DD-MM-YYYY')));
            setTglKirimEdit(responsData.tgl_kirim);
            setNoPOValue(responsData.no_sp);
            setSuppSelected(responsData.nama_relasi);
            setSuppSelectedKode(responsData.kode_supp);
            setterminSelected(responsData.nama_termin);
            setSelectedKodeTermin(responsData.kode_termin);
            const alamat = document.getElementById('alamat') as HTMLInputElement;
            if (alamat) {
                alamat.value = responsData.alamat_kirim;
            }
            setAlamatPengiriman(responsData.alamat_kirim);
            setSelectedOptionPajak(responsData.kena_pajak);
            setSelectedOptionCaraPengiriman(responsData.fob);
            setSelectedOptionFax(responsData.via);
            setKurs(frmNumber(responsData.kurs));
            setKursPajak(frmNumber(responsData.kurs_pajak));
            // setCatatan(responsData.keterangan);
            const catatan = document.getElementById('catatan') as HTMLInputElement;
            if (catatan) {
                catatan.value = responsData.keterangan;
            }
            setCatatan(responsData.keterangan);
            const diskon = document.getElementById('diskon') as HTMLInputElement;
            if (diskon) {
                diskon.value = frmNumber(responsData.diskon_dok);
            }
            const diskonResult = document.getElementById('diskonResult') as HTMLInputElement;
            if (diskonResult) {
                diskonResult.value = frmNumber(responsData.diskon_dok_mu);
            }
            setNilaiDiskonHeader(responsData.diskon_dok_mu);
            setDiskonHeader(responsData.diskon_dok);
            setSelectedOption(responsData.kode_beli);
            setApprovalData(tipe === 'App' ? 'Y' : '');
            setTglApproval(tipe === 'App' ? moment(new Date()).format('YYYY-MM-DD HH:mm:ss') : responsData.tgl_sp);
            setStatusDok(responsData.data[0].status);
            setNilaiBiayaKirim(responsData.kirim_rp);
            const biayaKirim = document.getElementById('estimasiBiayaKirim') as HTMLInputElement;
            if (biayaKirim) {
                biayaKirim.value = frmNumber(responsData.kirim_rp);
            }
            setTotalBeratVariabel(responsData.total_berat);
            setTotalJumlahVariabel(responsData.total_mu);
            setTotalJumlahSetelahPajakVariabel(responsData.netto_mu);
            setApprovalAudit(responsData.approval);
            setKirimLangsung(responsData.data[0].kirim_langsung);

            Promise.all(
                response.data.data.map((item: any) => {
                    return {
                        id: item.id_sp,
                        po_grup: item.kodegrup,
                        ppn_atas_nama: item.nama_cabang,
                        // no_spp: item.no_sp,
                        no_spp: item.no_pp,
                        no_barang: item.no_item,
                        nama_barang: item.diskripsi,
                        kuantitas_kg: frmNumber(item.fpo_qty),
                        diameter: item.fpo_diameter,
                        jarak_cm: item.fpo_jarak === null || item.fpo_jarak === '' || item.fpo_jarak === '0' ? frmNumber(0) : frmNumber(item.fpo_jarak),
                        kg_btg: frmNumber(item.fpo_kg),
                        harga_kg: frmNumber(item.fpo_harga_kg),
                        kuantitas_btg: frmNumber(item.fpo_btg),
                        harga_btg: frmNumber(item.fpo_harga_btg),
                        satuan: item.satuan,
                        kuantitas: frmNumber(item.qty_std),
                        pajak: frmNumber(item.pajak),
                        harga: name === 'produksi' ? frmNumber(item.fpo_harga_btg) : frmNumber(item.harga_mu),
                        diskon: item.diskon === null || item.diskon === '' ? '' : frmNumber(item.diskon),
                        potongan: item.potongan_mu === null || item.potongan_mu === '' ? '' : frmNumber(item.potongan_mu),
                        jumlah: frmNumber(item.jumlah_mu),
                        berat: frmNumber(item.qty_std * item.brt),
                        keterangan: item.catatan_cabang,
                        brt: item.brt,
                        nilai_pajak: item.pajak_mu,

                        kode_pp: item.kode_pp,
                        id_pp: item.id_pp,
                        kode_item: item.kode_item,
                        qty_asli: item.qty,
                        qty_sisa: item.qty_sisa,
                        qty_batal: item.qty_batal,
                        kode_mu: 'IDR',
                        kurs: item.kurs,
                        kurs_pajak: item.kurs_pajak,
                        diskon_mu: name === 'produksi' ? '0' : item.diskon_mu === null || item.diskon_mu === '' ? '0' : frmNumber(item.diskon_mu),
                        kode_pajak: item.kode_pajak,
                        include: item.include,
                        pajak_mu: item.pajak_mu,
                        kode_dept: item.kode_dept,
                        kontrak: item.kontrak,
                        kodecabang: item.kodecabang,
                        kode_fpb: item.kode_fpb,
                        id_fpb: item.id_fpb,
                        kirim_langsung: item.kirim_langsung,
                        kode_entitas: item.kode_entitas,
                        kode_so: item.kode_so,
                        id_so: item.id_so,
                        qty_std_filter: frmNumber(item.qty_std),
                    };
                })
            ).then((newData) => {
                setDataDetail((state: any) => {
                    const existingNodes = state.nodes.filter((node: any) => node.kode_sp === kode_sp);
                    const newNodes = [...existingNodes, ...newData.filter((data: any) => data !== null)];
                    return { ...state, nodes: newNodes }; // Memperbarui nodes dengan data yang diperbarui
                });
            });
        }

        const loadImages = await axios.get(`${apiUrl}/erp/load_fileGambar`, {
            params: {
                entitas: kode_entitas,
                param1: kode_sp,
            },
        });

        const load_images = loadImages.data.data;
        setLoadFilePendukung(load_images);
        // Mencari dokumen dengan id_dokumen yang sama dengan 51
        const targetDocument51 = load_images.find((doc: any) => doc.id_dokumen === 51);
        const targetDocument52 = load_images.find((doc: any) => doc.id_dokumen === 52);

        if (targetDocument51) {
            setFilePendukungPdf1(targetDocument51.filegambar);
            const responsePreviewPdf = await fetch(`${apiUrl}/erp/preview_pdf?entitas=${kode_entitas}&param1=${targetDocument51.filegambar}`);
            if (!responsePreviewPdf.ok) {
                throw new Error('Failed to fetch PDF');
            }
            // Assuming the response contains the URL directly
            const pdfBlob = await responsePreviewPdf.blob();
            const pdfObjectURL = URL.createObjectURL(pdfBlob);
            setPdfUrl(pdfObjectURL);
        } else {
            setFilePendukungPdf1('');
        }

        if (targetDocument52) {
            setFilePendukungPdf2(targetDocument52.filegambar);
            const responsePreviewPdf = await fetch(`${apiUrl}/erp/preview_pdf?entitas=${kode_entitas}&param1=${targetDocument52.filegambar}`);
            if (!responsePreviewPdf.ok) {
                throw new Error('Failed to fetch PDF');
            }
            // Assuming the response contains the URL directly
            const pdfBlob = await responsePreviewPdf.blob();
            const pdfObjectURL = URL.createObjectURL(pdfBlob);
            setPdfUrl2(pdfObjectURL);
        } else {
            setFilePendukungPdf2('');
        }
    };

    const [routerTipe, setRouterTipe] = useState<any>('');
    const [readOnly, setReadOnly] = useState(false);

    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            const { str } = router.query;

            interface QueryParams {
                [key: string]: string;
            }

            let decodedData: string = '';
            let jnsBarang: any, jnsTransaksi: any, kodeSp: any, tipeFrm: any, vTglAwal: any, vTglAkhir: any;
            if (typeof str === 'string') {
                decodedData = atob(str);

                const queryParams = decodedData.split('&').reduce((acc: QueryParams, keyValue) => {
                    const [key, value] = keyValue.split('=');
                    acc[key] = value;
                    return acc;
                }, {} as QueryParams);

                const {
                    name,
                    jenisTransaksi,
                    kode_sp,
                    tipe,
                    tglAwal,
                    tglAkhir,
                    tglBerlaku1,
                    tglBerlaku2,
                    tglKirim1,
                    tglKirim2,
                    vTipeDokumen,
                    noPo,
                    namaSupp,
                    namaBarang,
                    noPoChecked,
                    namaSuppChecked,
                    namaBarangChecked,
                    statusDok,
                    statusApp,
                    tanggalChecked,
                } = queryParams;

                jnsBarang = name;
                jnsTransaksi = jenisTransaksi;
                kodeSp = kode_sp;
                tipeFrm = tipe;
                routeTglAwal = tglAwal;
                routeTglAkhir = tglAkhir;
                routeTglBerlaku1 = tglBerlaku1;
                routeTglBerlaku2 = tglBerlaku2;
                routeTglKirim1 = tglKirim1;
                routeTglKirim2 = tglKirim2;
                routeTipeDokumen = vTipeDokumen;
                routeNoPo = noPo;
                routeNamaSupp = namaSupp;
                routeNamaBarang = namaBarang;
                routeNoPoChecked = noPoChecked;
                routeNamaSuppChecked = namaSuppChecked;
                routeNamaBarangChecked = namaBarangChecked;
                routeStatusDok = statusDok;
                routeStatusApp = statusApp;
                routeTanggalChecked = tanggalChecked;
                setRouterTipe(tipe);
                if (tipe === 'UpdateFile') {
                    setReadOnly(true);
                    setActive(1);
                }

                if (tipe === 'batal') {
                    setReadOnly(true);
                }
            }

            // const { name, jenisTransaksi, kode_sp } = router.query;
            setJenisTransaksi(jnsTransaksi);
            setJenisBarang(jnsBarang);
            setKodeSpEdit(kodeSp);
            if (kodeSp !== 'BARU') {
                if (tipeFrm === 'App') {
                    fetchData(kodeSp, jnsBarang, tipeFrm);
                } else {
                    fetchData(kodeSp, jnsBarang, tipeFrm);
                }
            }
            if (kodeSp === 'BARU') {
                // global function
                generateNU(kode_entitas, '', '02', dateGenerateNu.format('YYYYMM'))
                    .then((result) => {
                        setNoPOValue(result);
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            }
            if (jnsBarang === 'produksi') {
                handleSubmit();
            } else if (jnsBarang === 'barangjadi' || jnsBarang === 'nonPersediaan') {
                handleSubmit();
            }

            const fetchDataUseEffect = async () => {
                const response = await axios.get(`${apiUrl}/erp/m_areabeli`, {
                    params: {
                        entitas: kode_entitas,
                    },
                });

                const responseListAreaBeli = response.data.data;
                setRecordListAreaBeli(responseListAreaBeli);

                const respToken = await axios.get(`${apiUrl}/erp/token_uuid`, {});

                const responseToken = respToken.data.token;
                setTokenRedis(responseToken);

                if (kodeSp === 'BARU') {
                    await fetchPreferensi(kode_entitas, apiUrl)
                        .then((result) => {
                            setAlamatPengiriman(result[0].alamat_gudang === '' || result[0].alamat_gudang === null ? '' : result[0].alamat_gudang);
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                        });
                }
            };
            fetchDataUseEffect();
        } else {
        }
    }, [router.query]);

    const [dataDetail, setDataDetail] = useState({ nodes: [] });

    const handleSubmit = () => {
        // const id = Math.floor(Math.random() * (9990 - 0 + 1)) + 0;
        const id = dataDetail.nodes.length + 1;

        const newNode = {
            id: id,
            po_grup: '',
            ppn_atas_nama: '',
            no_spp: '',
            no_barang: '',
            nama_barang: '',
            kuantitas_kg: '',
            diameter: '',
            jarak_cm: '',
            kg_btg: '',
            harga_kg: '',
            kuantitas_btg: '',
            harga_btg: '',
            satuan: '',
            kuantitas: '',
            harga: '',
            diskon: '',
            potongan: '',
            pajak: '',
            jumlah: '',
            berat: '',
            keterangan: '',
            brt: '',
            nilai_pajak: '',
            qty_std_filter: '',

            // Tambahan
            kode_pp: '',
            id_pp: '',
            kode_item: '',
            qty_asli: '',
            qty_sisa: '',
            qty_batal: '',
            kode_mu: '',
            kurs: '',
            kurs_pajak: '',
            diskon_mu: '',
            kode_pajak: '',
            include: '',
            pajak_mu: '',
            kode_dept: '',
            kontrak: '',
            kodecabang: '',
            kode_fpb: '',
            id_fpb: '',
            kirim_langsung: '',
            kode_entitas: '',
            kode_so: '',
            id_so: '',
        };

        const hasEmptyFields = dataDetail.nodes.some((row: { nama_barang: string }) => row.nama_barang === '');

        if (!hasEmptyFields) {
            setDataDetail((state: any) => ({
                ...state,
                nodes: state.nodes.concat(newNode),
            }));
        } else {
            alert('Harap isi nama barang sebelum tambah data');
        }

        // event.preventDefault();
    };

    const [valueDataPajakbyRow, setValueDataPajakbyRow] = useState('');
    const handleUpdate = async (value: any, id: any, property: any) => {
        let totalBerat = 0;
        let totalJumlah = 0;
        let totalJumlahPajak = 0,
            totalCalNilaiDpp = 0,
            totalJumlahSetelahPajak = 0,
            totalNilaiPajakFix = 0;

        await setDataDetail((state: any) => {
            const newNodes = state.nodes.map((node: any) => {
                if (node.id === id) {
                    if (property === 'nama_barang') {
                        return {
                            ...node,
                            [property]: value,
                            diskripsi: value,
                        };
                    }

                    if (property === 'kuantitas_kg') {
                        let fpo_qty;
                        const format = value.includes(',');
                        const formatKgBtg = node.kg_btg.includes(',');
                        if (format) {
                            fpo_qty = tanpaKoma(value);
                        } else {
                            fpo_qty = value;
                        }
                        // let fpo_kg = node.kg_btg;
                        let fpo_kg = formatKgBtg ? parseFloat(tanpaKoma(node.kg_btg)) : node.kg_btg;
                        let fpo_btg;
                        fpo_qty === '' ? (fpo_btg = '') : null;
                        fpo_qty === '0' || fpo_kg === '0' ? (fpo_btg = '0') : (fpo_btg = Math.ceil(fpo_qty / fpo_kg));

                        const kuantitas_kg = document.getElementById('kuantitas_kg' + node.id) as HTMLInputElement;
                        if (kuantitas_kg) {
                            kuantitas_kg.value = frmNumber(fpo_qty);
                        }

                        return {
                            ...node,
                            [property]: value,
                            kuantitas_btg: frmNumber(fpo_btg),
                        };
                    }

                    if (property === 'jarak_cm') {
                        let jarak;
                        const format = value.includes(',');
                        if (format) {
                            jarak = tanpaKoma(value);
                        } else {
                            jarak = value;
                        }

                        const jarak_cm = document.getElementById('jarak_cm' + node.id) as HTMLInputElement;
                        if (jarak_cm) {
                            jarak_cm.value = frmNumber(jarak);
                        }

                        return {
                            ...node,
                            jarak_cm: jarak,
                        };
                    }

                    if (property === 'kg_btg') {
                        let fpo_kg;
                        const format = value.includes(',');
                        const formatNodeKuantitas = node.kuantitas.includes(',');
                        const formatKuantitasKg = node.kuantitas_kg.includes(',');
                        if (format) {
                            fpo_kg = tanpaKoma(value);
                        } else {
                            fpo_kg = value;
                        }

                        // let fpo_kg = node.kg_btg;
                        let fpo_qty = formatKuantitasKg ? parseFloat(tanpaKoma(node.kuantitas_kg)) : node.kuantitas_kg;
                        let fpo_btg;
                        fpo_kg === '' ? (fpo_btg = '') : null;
                        fpo_kg === '0' || fpo_qty === '0' ? (fpo_btg = '0') : (fpo_btg = Math.ceil(fpo_qty / fpo_kg));

                        let fpo_harga_kg = node.harga_kg;
                        // let qty = parseFloat(node.kuantitas);
                        let qty = formatNodeKuantitas ? parseFloat(tanpaKoma(node.kuantitas)) : parseFloat(node.kuantitas);
                        let fpo_harga_btg, totalJumlah, jumlah_mu;
                        let diskon_mu = tanpaKoma(node.diskon);
                        let potongan_mu = node.potongan === null || node.potongan === '' ? 0 : parseFloat(tanpaKoma(node.potongan));
                        fpo_harga_btg = parseFloat(fpo_kg) * parseFloat(tanpaKoma(fpo_harga_kg));
                        // totalJumlah = fpo_harga_btg * qty;

                        jumlah_mu =
                            (diskon_mu !== null || diskon_mu !== '') && qty > 0 && fpo_harga_btg > 0
                                ? qty * (fpo_harga_btg - DiskonByCalc(diskon_mu, fpo_harga_btg) - potongan_mu)
                                : fpo_harga_btg * qty;
                        let nilai_pajak = parseInt(node.pajak);
                        let totNilaiPajak;
                        if (selectedOptionPajak === 'N') {
                            totNilaiPajak = 0;
                        } else if (selectedOptionPajak === 'E') {
                            totNilaiPajak = (jumlah_mu * nilai_pajak) / 100;
                        } else if (selectedOptionPajak === 'I') {
                            if (nilai_pajak === 10) {
                                totNilaiPajak = ((100 / 110) * jumlah_mu * nilai_pajak) / 100;
                            } else if (nilai_pajak === 11) {
                                totNilaiPajak = ((100 / 111) * jumlah_mu * nilai_pajak) / 100;
                            } else {
                                totNilaiPajak = 0;
                            }
                        }
                        const kg_btg = document.getElementById('kg_btg' + node.id) as HTMLInputElement;
                        if (kg_btg) {
                            kg_btg.value = frmNumber(fpo_kg);
                        }

                        return {
                            ...node,
                            [property]: value,
                            harga_btg: frmNumber(fpo_harga_btg),
                            harga: frmNumber(fpo_harga_btg),
                            jumlah: frmNumber(jumlah_mu),
                            nilai_pajak: totNilaiPajak,
                            kuantitas_btg: frmNumber(fpo_btg),
                        };
                    }

                    if (property === 'harga_kg') {
                        let fpo_harga_kg;
                        const format = value.includes(',');
                        const formatNodeKuantitas = node.kuantitas.includes(',');
                        if (format) {
                            fpo_harga_kg = tanpaKoma(value);
                        } else {
                            fpo_harga_kg = value;
                        }
                        let fpo_kg = node.kg_btg;
                        let qty = formatNodeKuantitas ? parseFloat(tanpaKoma(node.kuantitas)) : parseFloat(node.kuantitas);
                        let diskon_mu = tanpaKoma(node.diskon);
                        let potongan_mu = node.potongan === null || node.potongan === '' ? 0 : parseFloat(tanpaKoma(node.potongan));
                        let fpo_harga_btg, jumlah_mu;
                        fpo_harga_btg = parseFloat(fpo_kg) * parseFloat(tanpaKoma(fpo_harga_kg));

                        jumlah_mu =
                            (diskon_mu !== null || diskon_mu !== '') && qty > 0 && fpo_harga_btg > 0
                                ? qty * (fpo_harga_btg - DiskonByCalc(diskon_mu, fpo_harga_btg) - potongan_mu)
                                : fpo_harga_btg * qty;
                        let nilai_pajak = parseInt(node.pajak);
                        let totNilaiPajak;
                        if (selectedOptionPajak === 'N') {
                            totNilaiPajak = 0;
                        } else if (selectedOptionPajak === 'E') {
                            totNilaiPajak = (jumlah_mu * nilai_pajak) / 100;
                        } else if (selectedOptionPajak === 'I') {
                            if (nilai_pajak === 10) {
                                totNilaiPajak = ((100 / 110) * jumlah_mu * nilai_pajak) / 100;
                            } else if (nilai_pajak === 11) {
                                totNilaiPajak = ((100 / 111) * jumlah_mu * nilai_pajak) / 100;
                            } else {
                                totNilaiPajak = 0;
                            }
                        }
                        const harga_kg = document.getElementById('harga_kg' + node.id) as HTMLInputElement;
                        if (harga_kg) {
                            harga_kg.value = frmNumber(fpo_harga_kg);
                        }

                        return {
                            ...node,
                            [property]: value,
                            harga_btg: frmNumber(fpo_harga_btg),
                            harga: frmNumber(fpo_harga_btg),
                            jumlah: frmNumber(jumlah_mu),
                            nilai_pajak: totNilaiPajak,
                        };
                    }

                    if (property === 'kuantitas') {
                        let qty_std;
                        const format = value.includes(',');
                        if (format) {
                            qty_std = parseFloat(tanpaKoma(value));
                        } else {
                            qty_std = parseFloat(value);
                        }
                        if (qty_std <= parseFloat(node.qty_asli)) {
                            let brt = node.brt;
                            let diskon_mu = tanpaKoma(node.diskon);
                            let harga_mu = parseFloat(tanpaKoma(node.harga)); //node.harga_btg
                            let potongan_mu = node.potongan === null || node.potongan === '' ? 0 : parseFloat(tanpaKoma(node.potongan));
                            let diskonMu, jumlah_mu;
                            jumlah_mu =
                                (diskon_mu !== null || diskon_mu !== '') && qty_std > 0 && harga_mu > 0 ? qty_std * (harga_mu - DiskonByCalc(diskon_mu, harga_mu) - potongan_mu) : harga_mu * qty_std;
                            let nilai_pajak = parseInt(node.pajak);
                            let totNilaiPajak;
                            if (selectedOptionPajak === 'N') {
                                totNilaiPajak = 0;
                            } else if (selectedOptionPajak === 'E') {
                                totNilaiPajak = (jumlah_mu * nilai_pajak) / 100;
                            } else if (selectedOptionPajak === 'I') {
                                if (nilai_pajak === 10) {
                                    totNilaiPajak = ((100 / 110) * jumlah_mu * nilai_pajak) / 100;
                                } else if (nilai_pajak === 11) {
                                    totNilaiPajak = ((100 / 111) * jumlah_mu * nilai_pajak) / 100;
                                } else {
                                    totNilaiPajak = 0;
                                }
                            }
                            const kuantitas = document.getElementById('kuantitas' + node.id) as HTMLInputElement;
                            if (kuantitas) {
                                kuantitas.value = frmNumber(qty_std);
                            }

                            return {
                                ...node,
                                [property]: value,
                                jumlah: frmNumber(jumlah_mu),
                                berat: frmNumber(qty_std * parseFloat(brt)),
                                nilai_pajak: totNilaiPajak,
                                qty_sisa: qty_std,
                            };
                        } else {
                            swal.fire({
                                title: 'Warning',
                                text: `Kuantitas maksimum ${frmNumber(node.qty_asli)} BTG`,
                                icon: 'warning',
                                showCancelButton: false,
                                confirmButtonText: 'Ok',
                                customClass: {
                                    popup: 'custom-popup-class',
                                },
                            }).then(async (result) => {
                                if (result.isConfirmed) {
                                    return {
                                        ...node,
                                        [property]: value,
                                        // kuantitas: node.kuantitas,
                                    };
                                }
                            });

                            let qty_std = parseFloat(tanpaKoma(node.kuantitas));
                            let brt = node.brt;
                            let diskon_mu = tanpaKoma(node.diskon);
                            let harga_mu = parseFloat(tanpaKoma(node.harga)); //node.harga_btg
                            let potongan_mu = node.potongan === null || node.potongan === '' ? 0 : parseFloat(tanpaKoma(node.potongan));
                            let diskonMu, jumlah_mu;
                            jumlah_mu =
                                (diskon_mu !== null || diskon_mu !== '') && qty_std > 0 && harga_mu > 0 ? qty_std * (harga_mu - DiskonByCalc(diskon_mu, harga_mu) - potongan_mu) : harga_mu * qty_std;
                            let nilai_pajak = parseInt(node.nilai_pajak);
                            let totNilaiPajak;
                            if (selectedOptionPajak === 'N') {
                                totNilaiPajak = 0;
                            } else if (selectedOptionPajak === 'E') {
                                totNilaiPajak = (jumlah_mu * nilai_pajak) / 100;
                            } else if (selectedOptionPajak === 'I') {
                                if (nilai_pajak === 10) {
                                    totNilaiPajak = ((100 / 110) * jumlah_mu * nilai_pajak) / 100;
                                } else if (nilai_pajak === 11) {
                                    totNilaiPajak = ((100 / 111) * jumlah_mu * nilai_pajak) / 100;
                                } else {
                                    totNilaiPajak = 0;
                                }
                            }
                            const kuantitas = document.getElementById('kuantitas' + node.id) as HTMLInputElement;
                            if (kuantitas) {
                                kuantitas.value = frmNumber(qty_std);
                            }
                            return {
                                ...node,
                                [property]: value,
                                jumlah: frmNumber(jumlah_mu),
                                berat: frmNumber(qty_std * parseFloat(brt)),
                                // kuantitas: node.kuantitas,
                                nilai_pajak: totNilaiPajak,
                                qty_sisa: qty_std,
                            };
                        }
                    }

                    if (property === 'harga') {
                        let harga_mu;
                        const format = value.includes(',');
                        const formatNodeKuantitas = node.kuantitas.includes(',');
                        if (format) {
                            harga_mu = tanpaKoma(value);
                        } else {
                            harga_mu = value;
                        }

                        let qty_std = formatNodeKuantitas ? parseFloat(tanpaKoma(node.kuantitas)) : parseFloat(node.kuantitas);
                        let diskon_mu = tanpaKoma(node.diskon);
                        let potongan_mu = node.potongan === null || node.potongan === '' ? 0 : parseFloat(tanpaKoma(node.potongan));
                        let jumlah_mu;

                        jumlah_mu =
                            (diskon_mu !== null || diskon_mu !== '') && qty_std > 0 && harga_mu > 0 ? qty_std * (harga_mu - DiskonByCalc(diskon_mu, harga_mu) - potongan_mu) : harga_mu * qty_std;

                        let nilai_pajak = parseInt(node.pajak);
                        let totNilaiPajak;
                        if (selectedOptionPajak === 'N') {
                            totNilaiPajak = 0;
                        } else if (selectedOptionPajak === 'E') {
                            totNilaiPajak = (jumlah_mu * nilai_pajak) / 100;
                        } else if (selectedOptionPajak === 'I') {
                            if (nilai_pajak === 10) {
                                totNilaiPajak = ((100 / 110) * jumlah_mu * nilai_pajak) / 100;
                            } else if (nilai_pajak === 11) {
                                totNilaiPajak = ((100 / 111) * jumlah_mu * nilai_pajak) / 100;
                            } else {
                                totNilaiPajak = 0;
                            }
                        }

                        let diskonMu = (parseFloat(harga_mu) * parseFloat(diskon_mu)) / 100;

                        const harga = document.getElementById('harga' + node.id) as HTMLInputElement;
                        // Membersihkan nilai input diskon
                        if (harga) {
                            harga.value = frmNumber(harga_mu);
                        }

                        return {
                            ...node,
                            [property]: value,
                            jumlah: frmNumber(jumlah_mu),
                            nilai_pajak: totNilaiPajak,
                            diskon_mu: frmNumber(diskonMu),
                        };
                    }

                    if (property === 'diskon') {
                        let diskon_mu;
                        const format = value.includes(',');
                        const formatNodeKuantitas = node.kuantitas.includes(',');
                        if (format) {
                            diskon_mu = tanpaKoma(value);
                        } else {
                            diskon_mu = value;
                        }
                        let brt = node.brt;
                        // let qty_std = parseFloat(node.kuantitas);
                        let qty_std = formatNodeKuantitas ? parseFloat(tanpaKoma(node.kuantitas)) : parseFloat(node.kuantitas);
                        let harga_mu = parseFloat(tanpaKoma(node.harga)); // node.harga_btg
                        let potongan_mu = node.potongan === null || node.potongan === '' ? 0 : parseFloat(tanpaKoma(node.potongan));
                        let jumlah_mu =
                            (diskon_mu !== null || diskon_mu !== '') && qty_std > 0 && harga_mu > 0 ? qty_std * (harga_mu - DiskonByCalc(diskon_mu, harga_mu) - potongan_mu) : harga_mu * qty_std;
                        let nilai_pajak = parseInt(node.pajak);
                        let totNilaiPajak;
                        if (selectedOptionPajak === 'N') {
                            totNilaiPajak = 0;
                        } else if (selectedOptionPajak === 'E') {
                            totNilaiPajak = (jumlah_mu * nilai_pajak) / 100;
                        } else if (selectedOptionPajak === 'I') {
                            if (nilai_pajak === 10) {
                                totNilaiPajak = ((100 / 110) * jumlah_mu * nilai_pajak) / 100;
                            } else if (nilai_pajak === 11) {
                                totNilaiPajak = ((100 / 111) * jumlah_mu * nilai_pajak) / 100;
                            } else {
                                totNilaiPajak = 0;
                            }
                        }
                        let diskonMu = (parseFloat(tanpaKoma(node.harga)) * diskon_mu) / 100;
                        // Mendapatkan elemen input diskon
                        const diskon = document.getElementById('diskon' + node.id) as HTMLInputElement;
                        // Membersihkan nilai input diskon
                        if (diskon) {
                            diskon.value = frmNumber(diskon_mu);
                        }

                        return {
                            ...node,
                            [property]: value,
                            jumlah: frmNumber(jumlah_mu),
                            nilai_pajak: totNilaiPajak,
                            diskon_mu: frmNumber(diskonMu),
                        };
                    }

                    if (property === 'potongan') {
                        const formatNodeKuantitas = node.kuantitas.includes(',');
                        let potongan_mu = value === '' || value === '0' || value === null ? 0 : parseFloat(tanpaKoma(value));
                        // let qty_std = parseFloat(node.kuantitas);
                        let qty_std = formatNodeKuantitas ? parseFloat(tanpaKoma(node.kuantitas)) : parseFloat(node.kuantitas);
                        let harga_mu = parseFloat(tanpaKoma(node.harga)); //node.harga_btg
                        let diskon_mu = tanpaKoma(node.diskon);
                        let jumlah_mu =
                            (diskon_mu !== null || diskon_mu !== '') && qty_std > 0 && harga_mu > 0 ? qty_std * (harga_mu - DiskonByCalc(diskon_mu, harga_mu) - potongan_mu) : harga_mu * qty_std;
                        let nilai_pajak = parseInt(node.pajak);
                        let totNilaiPajak;
                        if (selectedOptionPajak === 'N') {
                            totNilaiPajak = 0;
                        } else if (selectedOptionPajak === 'E') {
                            totNilaiPajak = (jumlah_mu * nilai_pajak) / 100;
                        } else if (selectedOptionPajak === 'I') {
                            if (nilai_pajak === 10) {
                                totNilaiPajak = ((100 / 110) * jumlah_mu * nilai_pajak) / 100;
                            } else if (nilai_pajak === 11) {
                                totNilaiPajak = ((100 / 111) * jumlah_mu * nilai_pajak) / 100;
                            } else {
                                totNilaiPajak = 0;
                            }
                        }

                        const potongan = document.getElementById('potongan' + node.id) as HTMLInputElement;
                        if (potongan) {
                            potongan.value = frmNumber(potongan_mu);
                        }

                        return {
                            ...node,
                            [property]: value,
                            jumlah: frmNumber(jumlah_mu),
                            nilai_pajak: totNilaiPajak,
                        };
                    }

                    if (property === 'pajak') {
                        let nilai_pajak = parseInt(value);
                        let jumlah_mu = parseFloat(tanpaKoma(node.jumlah));
                        let totNilaiPajak;
                        if (selectedOptionPajak === 'N') {
                            totNilaiPajak = 0;
                        } else if (selectedOptionPajak === 'E') {
                            totNilaiPajak = (jumlah_mu * nilai_pajak) / 100;
                        } else if (selectedOptionPajak === 'I') {
                            if (nilai_pajak === 10) {
                                totNilaiPajak = ((100 / 110) * jumlah_mu * nilai_pajak) / 100;
                            } else if (nilai_pajak === 11) {
                                totNilaiPajak = ((100 / 111) * jumlah_mu * nilai_pajak) / 100;
                            } else {
                                totNilaiPajak = 0;
                            }
                        }
                        let kode_pajak;
                        if (nilai_pajak === 0) {
                            kode_pajak = 'N';
                        } else if (nilai_pajak === 10) {
                            kode_pajak = 'S';
                        } else if (nilai_pajak === 11) {
                            kode_pajak = 'T';
                        }

                        return {
                            ...node,
                            [property]: value,
                            nilai_pajak: totNilaiPajak,
                            pajak: value,
                            kode_pajak: kode_pajak,
                            // keterangan: totNilaiPajak,
                        };
                    }

                    if (property === 'keterangan') {
                        let keterangan = value;

                        const keterangan_v = document.getElementById('keterangan' + node.id) as HTMLInputElement;
                        if (keterangan_v) {
                            keterangan_v.value = keterangan;
                        }

                        return {
                            ...node,
                            keterangan: keterangan,
                        };
                    }
                } else if (property === 'pajakChange') {
                    let nilai_pajak = parseInt(value);
                    let jumlah_mu = parseFloat(tanpaKoma(node.jumlah));
                    let totNilaiPajak;
                    if (id === 'N') {
                        totNilaiPajak = 0;
                    } else if (id === 'E') {
                        totNilaiPajak = (jumlah_mu * nilai_pajak) / 100;
                    } else if (id === 'I') {
                        if (nilai_pajak === 10) {
                            totNilaiPajak = ((100 / 110) * jumlah_mu * nilai_pajak) / 100;
                        } else if (nilai_pajak === 11) {
                            totNilaiPajak = ((100 / 111) * jumlah_mu * nilai_pajak) / 100;
                        } else {
                            totNilaiPajak = 0;
                        }
                    }
                    let kode_pajak;
                    if (nilai_pajak === 0) {
                        kode_pajak = 'N';
                    } else if (nilai_pajak === 10) {
                        kode_pajak = 'S';
                    } else if (nilai_pajak === 11) {
                        kode_pajak = 'T';
                    }
                    return {
                        ...node,
                        [property]: value,
                        nilai_pajak: totNilaiPajak,
                        pajak: value,
                        kode_pajak: kode_pajak,
                        // keterangan: totNilaiPajak,
                    };
                }

                return node;
            });

            let totalCalNilaiDppFilter = 0,
                totalJumlahSetelahPajakKirim = 0,
                nilaiPajak = 0,
                callNilaiPajak = 0;
            if (selectedOptionPajak === 'N') {
                // Menghitung ulang totalJumlah dan totalBerat berdasarkan semua node
                totalJumlah = newNodes.reduce((acc: number, node: any) => {
                    return acc + parseFloat(node.jumlah.replace(/[^0-9.-]+/g, ''));
                }, 0);

                totalBerat = newNodes.reduce((acc: number, node: any) => {
                    return acc + parseFloat(node.berat.replace(/[^0-9.-]+/g, ''));
                }, 0);
                totalJumlahSetelahPajak = totalJumlah - (isNaN(nilaiDiskonHeader) ? 0 : nilaiDiskonHeader) + (nilaiBiayaKirim === '0' || nilaiBiayaKirim === '' ? 0 : parseFloat(nilaiBiayaKirim));
                totalJumlahSetelahPajakKirim = totalJumlah - (isNaN(nilaiDiskonHeader) ? 0 : nilaiDiskonHeader);
            } else if (selectedOptionPajak === 'E') {
                totalJumlah = newNodes.reduce((acc: number, node: any) => {
                    return acc + parseFloat(node.jumlah.replace(/[^0-9.-]+/g, ''));
                }, 0);
                totalBerat = newNodes.reduce((acc: number, node: any) => {
                    return acc + parseFloat(node.berat.replace(/[^0-9.-]+/g, ''));
                }, 0);
                totalJumlahPajak = newNodes.reduce((acc: number, node: any) => {
                    return acc + parseFloat(node.nilai_pajak);
                }, 0);

                let pajak = newNodes.length > 0 ? (newNodes[0] as any).pajak : null;
                let nilaiSetelahPajak = totalJumlah - (isNaN(nilaiDiskonHeader) ? 0 : nilaiDiskonHeader);
                let calNilaiDpp = nilaiSetelahPajak;
                callNilaiPajak = (calNilaiDpp * parseFloat(pajak)) / 100;

                // totalCalNilaiDpp = totalJumlah - (isNaN(nilaiDiskonHeader) ? 0 : nilaiDiskonHeader);
                totalCalNilaiDpp = calNilaiDpp;
                totalCalNilaiDppFilter = totalJumlah;
                // totalJumlahSetelahPajak = totalCalNilaiDpp + (isNaN(totalJumlahPajak) ? 0 : totalJumlahPajak) + (nilaiBiayaKirim === '0' || nilaiBiayaKirim === '' ? 0 : parseFloat(nilaiBiayaKirim));
                totalJumlahSetelahPajak = totalCalNilaiDpp + (isNaN(callNilaiPajak) ? 0 : callNilaiPajak) + (nilaiBiayaKirim === '0' || nilaiBiayaKirim === '' ? 0 : parseFloat(nilaiBiayaKirim));
                // totalJumlahSetelahPajakKirim = totalCalNilaiDpp + (isNaN(totalJumlahPajak) ? 0 : totalJumlahPajak);
                totalJumlahSetelahPajakKirim = totalCalNilaiDpp + (isNaN(callNilaiPajak) ? 0 : callNilaiPajak);
                totalNilaiPajakFix = newNodes.reduce((acc: number, node: any) => {
                    return acc + (totalCalNilaiDpp * parseFloat(node.pajak)) / 100;
                }, 0);
                nilaiPajak = newNodes.reduce((acc: number, node: any) => {
                    return acc + parseFloat(node.pajak);
                }, 0);
            } else if (selectedOptionPajak === 'I') {
                totalJumlah = newNodes.reduce((acc: number, node: any) => {
                    return acc + parseFloat(node.jumlah.replace(/[^0-9.-]+/g, ''));
                }, 0);
                totalBerat = newNodes.reduce((acc: number, node: any) => {
                    return acc + parseFloat(node.berat.replace(/[^0-9.-]+/g, ''));
                }, 0);
                totalJumlahPajak = newNodes.reduce((acc: number, node: any) => {
                    return acc + parseFloat(node.nilai_pajak);
                }, 0);

                nilaiPajak = newNodes.reduce((acc: number, node: any) => {
                    return acc + parseFloat(node.pajak);
                }, 0);

                let pajak = newNodes.length > 0 ? (newNodes[0] as any).pajak : null;
                let nilaiSetelahPajak = totalJumlah - (isNaN(nilaiDiskonHeader) ? 0 : nilaiDiskonHeader);
                let calNilaiDpp = nilaiSetelahPajak / ((100 + parseFloat(pajak)) / 100);
                callNilaiPajak = (calNilaiDpp * parseFloat(pajak)) / 100;

                // totalCalNilaiDpp = totalJumlah - totalJumlahPajak - (isNaN(nilaiDiskonHeader) ? 0 : nilaiDiskonHeader);
                // totalCalNilaiDppFilter = totalJumlah - totalJumlahPajak;
                // totalJumlahSetelahPajak = totalCalNilaiDpp + totalJumlahPajak + (nilaiBiayaKirim === '0' || nilaiBiayaKirim === '' ? 0 : parseFloat(nilaiBiayaKirim));
                // totalJumlahSetelahPajakKirim = totalCalNilaiDpp + totalJumlahPajak;
                totalCalNilaiDpp = calNilaiDpp;
                totalCalNilaiDppFilter = totalJumlah - callNilaiPajak;
                totalJumlahSetelahPajak = totalCalNilaiDpp + callNilaiPajak + (nilaiBiayaKirim === '0' || nilaiBiayaKirim === '' ? 0 : parseFloat(nilaiBiayaKirim));
                totalJumlahSetelahPajakKirim = totalCalNilaiDpp + callNilaiPajak;
                totalNilaiPajakFix = newNodes.reduce((acc: number, node: any) => {
                    return acc + (totalCalNilaiDpp * parseFloat(node.pajak)) / 100;
                }, 0);
            }

            console.log('newNodes = ', newNodes);
            console.log('Sebelum setTotalJumlahVariabel 4 :', totalJumlah, selectedOptionPajak);
            setTotalJumlahVariabel(totalJumlah);
            setTotalJumlahSetelahPajakVariabel(totalJumlahSetelahPajak);
            setTotalJumlahSetelahPajakFilter(totalJumlahSetelahPajak);
            setTotalJumlahSetelahPajakKirim(totalJumlahSetelahPajakKirim);
            setTotalBeratVariabel(totalBerat);
            // setTotalNilaiPajakVariabel(totalJumlahPajak);
            setTotalNilaiPajakVariabel(callNilaiPajak);
            // setTotalNilaiPajakVariabel(totalNilaiPajakFix);
            setValueNilaiDpp(totalCalNilaiDpp);
            setValueNilaiDppFilter(totalCalNilaiDppFilter);

            return {
                nodes: newNodes,
                // totalBerat: totalBerat.toFixed(2),
            };
        });
    };

    const [rowid, setRowId] = useState<any>(0);

    async function confirmedSupp(result: any) {
        const a = result ? setModal1(true) : null;
        return a;
    }

    const [nilaiValueNoBarang, setNilaiValueNoBarang] = useState('');
    const [nilaiValueNamaBarang, setNilaiValueNamaBarang] = useState('');
    const [nilaiValueNoPp, setNilaiValueNoPp] = useState('');
    const [tipeValue, setTipeValue] = useState('');
    const [totalNum, setTotalNum] = useState(0);

    // const handleModalItemDelete = async(event: string, tipe: string, id: any, action: any) => {
    //     console.log('event = '+event+' tipe = '+tipe+' id = '+id+' action = '+action)
    // }

    const handleModalItemChange = async (event: string, tipe: string, id: any, action: any) => {
        // if (action === 'delete') {
        //     if (tipe === 'po_group_delete') {
        //         setChangeNumber((prevTotal) => prevTotal + 1);
        //         setHandleKodeGrup(event);
        //         setSelectedKodePoGrup('');
        //         let detailupdate = await setDataDetail((state: any) => ({
        //             ...state,
        //             nodes: state.nodes.map((node: any) => {
        //                 if (node.id === id) {
        //                     return {
        //                         ...node,
        //                         po_grup: event,
        //                     };
        //                 } else {
        //                     return node;
        //                 }
        //             }),
        //         }));
        //     } else if (tipe === 'ppn_atas_nama_delete') {
        //         console.log('ppn_atas_nama = delete');
        //         setChangeNumber((prevTotal) => prevTotal + 1);
        //         setHandlePpnAtasNama(event);
        //         setSelectedKodePpnAtasNama('');
        //         setSelectedNamaCabangPpnAtasNama('');
        //         let detailupdate = await setDataDetail((state: any) => ({
        //             ...state,
        //             nodes: state.nodes.map((node: any) => {
        //                 if (node.id === id) {
        //                     return {
        //                         ...node,
        //                         ppn_atas_nama: event,
        //                         kodecabang: event,
        //                     };
        //                 } else {
        //                     return node;
        //                 }
        //             }),
        //         }));
        //     }
        // } else {
        if (tipe === 'po_grup') {
            if (event === '') {
                setChangeNumber((prevTotal) => prevTotal + 1);
                setHandleKodeGrup(event);
                setSelectedKodePoGrup('');
                let detailupdate = await setDataDetail((state: any) => ({
                    ...state,
                    nodes: state.nodes.map((node: any) => {
                        if (node.id === id) {
                            return {
                                ...node,
                                po_grup: event,
                            };
                        } else {
                            return node;
                        }
                    }),
                }));
            } else {
                setChangeNumber((prevTotal) => prevTotal + 1);
                setHandleKodeGrup(event);
                // setModal3(true);
                setModalPoGrup(true);
            }
        } else if (tipe === 'ppn_atas_nama') {
            if (event === '') {
                setChangeNumber((prevTotal) => prevTotal + 1);
                setHandlePpnAtasNama(event);
                setSelectedKodePpnAtasNama('');
                setSelectedNamaCabangPpnAtasNama('');
                let detailupdate = await setDataDetail((state: any) => ({
                    ...state,
                    nodes: state.nodes.map((node: any) => {
                        if (node.id === id) {
                            return {
                                ...node,
                                ppn_atas_nama: event,
                                kodecabang: event,
                            };
                        } else {
                            return node;
                        }
                    }),
                }));
            } else {
                setChangeNumber((prevTotal) => prevTotal + 1);
                setHandlePpnAtasNama(event);
                // setModal4(true);
                setModalPpnAtasNama(true);
            }
        } else {
            vRefreshData.current += 1;
            if (suppSelected === '') {
                swal.fire({
                    title: 'Supplier belum diisi',
                    icon: 'warning',
                    showCancelButton: false,
                    confirmButtonText: 'Ok',
                    customClass: {
                        popup: 'custom-popup-class',
                    },
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        await setModSuppRow(true);
                        setTotalNum((prevTotal) => prevTotal + Number(id));

                        // Menghapus await jika tidak menggunakan hasilnya
                        setNilaiValueNoBarang('');
                        setNilaiValueNamaBarang('');
                        setNilaiValueNoPp('');

                        if (tipe === 'no_barang') {
                            setNilaiValueNoBarang(event);
                            setTipeValue(tipe);
                            setNilaiValueNamaBarang('');
                            setNilaiValueNoPp('');
                        } else if (tipe === 'nama_barang') {
                            setNilaiValueNamaBarang(event);
                            setTipeValue(tipe);
                            setNilaiValueNoBarang('');
                            setNilaiValueNoPp('');
                        } else if (tipe === 'no_spp') {
                            setNilaiValueNoPp(event);
                            setTipeValue(tipe);
                            setNilaiValueNamaBarang('');
                            setNilaiValueNoBarang('');
                        }
                    }
                });
            } else if (tipe === 'no_spp' || tipe === 'no_barang' || tipe === 'nama_barang') {
                setTotalNum((prevTotal) => prevTotal + Number(id));

                // Menghapus await jika tidak menggunakan hasilnya
                setNilaiValueNoBarang('');
                setNilaiValueNamaBarang('');
                setNilaiValueNoPp('');

                if (tipe === 'no_barang') {
                    setNilaiValueNoBarang(event);
                    setTipeValue(tipe);
                    setNilaiValueNamaBarang('');
                    setNilaiValueNoPp('');
                    setModal6(true);
                } else if (tipe === 'nama_barang') {
                    setNilaiValueNamaBarang(event);
                    setTipeValue(tipe);
                    setNilaiValueNoBarang('');
                    setNilaiValueNoPp('');
                    setModal6(true);
                } else if (tipe === 'no_spp') {
                    setNilaiValueNoPp(event);
                    setTipeValue(tipe);
                    setNilaiValueNamaBarang('');
                    setNilaiValueNoBarang('');
                    setModal6(true);
                }
            }
        }
        // }
    };

    const [valueNilaiDpp, setValueNilaiDpp] = useState(0);
    const [valueNilaiDppFilter, setValueNilaiDppFilter] = useState(0);
    const [valueStringPajak, setValueStringPajak] = useState('');

    const handlePajakChange = async (event: any) => {
        const selectedValue = event.target.value;
        setSelectedOptionPajak(selectedValue);
        // await setDataDetail((state: any) => {
        //     const newNodes = state.nodes.map((node: any) => {
        //         return {
        //             ...node,
        //             pajak: '0.00',
        //             nilai_pajak: '0.00',
        //         };
        //     });

        //     return {
        //         nodes: newNodes,
        //     };
        // });
        // if (selectedOptionPajak === 'N') {
        //     setValueStringPajak('');
        //     setValueNilaiDpp(0);
        //     setValueNilaiDppFilter(0);
        //     // handleUpdate(0, 'N', 'pajak');
        // } else if (selectedOptionPajak === 'E') {
        //     setValueStringPajak('');
        //     setValueNilaiDpp(totalJumlahVariabel);
        //     setValueNilaiDppFilter(totalJumlahVariabel);
        //     // handleUpdate(0, 'E', 'pajak');
        //     console.log('test Exclude');
        // } else if (selectedOptionPajak === 'I') {
        //     // handleUpdate(0, 'I', 'pajak');
        //     if (totalJumlahVariabel !== 0) {
        //         setValueStringPajak('Sudah termasuk pajak.');
        //         setValueNilaiDpp(totalJumlahVariabel);
        //         setValueNilaiDppFilter(totalJumlahVariabel);
        //     }
        //     console.log('test Include');
        // }
        // console.log('TEST =' + selectedValue);
        // Lakukan sesuatu dengan nilai yang dipilih
    };

    useEffect(() => {
        if (selectedOptionPajak === 'N') {
            setValueStringPajak('');
            setValueNilaiDpp(0);
            setValueNilaiDppFilter(0);
            handleUpdate(0, 'N', 'pajakChange');
            setDataDetail((state: any) => {
                const newNodes = state.nodes.map((node: any) => {
                    return {
                        ...node,
                        pajak: '0.00',
                        // nilai_pajak: '0.00',
                    };
                });

                return {
                    nodes: newNodes,
                };
            });
        } else if (selectedOptionPajak === 'E') {
            setValueStringPajak('');
            // setValueNilaiDpp(totalJumlahVariabel);
            // setValueNilaiDppFilter(totalJumlahVariabel);
            setValueNilaiDpp(totalJumlahVariabel);
            setValueNilaiDppFilter(totalJumlahVariabel);
            handleUpdate(10, 'E', 'pajakChange');
            setDataDetail((state: any) => {
                const newNodes = state.nodes.map((node: any) => {
                    return {
                        ...node,
                        pajak: '10.00',
                        // nilai_pajak: '11.00',
                    };
                });

                return {
                    nodes: newNodes,
                };
            });
        } else if (selectedOptionPajak === 'I') {
            handleUpdate(10, 'I', 'pajakChange');
            setDataDetail((state: any) => {
                const newNodes = state.nodes.map((node: any) => {
                    return {
                        ...node,
                        pajak: '10.00',
                        // nilai_pajak: '11.00',
                    };
                });

                return {
                    nodes: newNodes,
                };
            });
            if (totalJumlahVariabel !== 0) {
                setValueStringPajak('Sudah termasuk pajak.');
                setValueNilaiDpp(totalJumlahVariabel);
                setValueNilaiDppFilter(totalJumlahVariabel);
            }
        }
    }, [selectedOptionPajak, tokenRedis]);

    const [nilaiDiskonHeader, setNilaiDiskonHeader] = useState(0);
    const [diskonHeader, setDiskonHeader] = useState(0);

    const handleDiskonHeaderChange = async (value: any, property: any) => {
        let nilaiDiskon,
            diskon,
            jumlahSetelahPajak,
            calNilaiDpp = 0,
            nilaiSetelahPajak = 0,
            callNilaiPajak = 0;
        if (property === 'diskon') {
            nilaiDiskon = (totalJumlahVariabel * value) / 100;
            // calNilaiDpp = valueNilaiDppFilter - nilaiDiskon;
            nilaiSetelahPajak = totalJumlahVariabel - nilaiDiskon;
            // const newNodes = dataDetail.nodes.map((node: any) => {});
            const nilaiPajak = dataDetail.nodes.length > 0 ? (dataDetail.nodes[0] as any).pajak : null;
            calNilaiDpp = nilaiSetelahPajak / ((100 + parseFloat(nilaiPajak)) / 100);
            callNilaiPajak = (calNilaiDpp * parseFloat(nilaiPajak)) / 100;
            setNilaiDiskonHeader(nilaiDiskon);
            setDiskonHeader(value);
            if (selectedOptionPajak === 'N') {
                setValueNilaiDpp(0);
                jumlahSetelahPajak = totalJumlahVariabel - nilaiDiskon;
                setTotalJumlahSetelahPajakVariabel(jumlahSetelahPajak);
                setTotalJumlahSetelahPajakKirim(jumlahSetelahPajak);
            } else if (selectedOptionPajak === 'E') {
                let callNilaiPajakEx = (nilaiSetelahPajak * parseFloat(nilaiPajak)) / 100;

                setValueNilaiDpp(nilaiSetelahPajak);
                // jumlahSetelahPajak =
                //     calNilaiDpp + (isNaN(totalNilaiPajakVariabel) ? 0 : totalNilaiPajakVariabel) + (nilaiBiayaKirim === '0' || nilaiBiayaKirim === '' ? 0 : parseFloat(nilaiBiayaKirim));
                jumlahSetelahPajak = nilaiSetelahPajak + (isNaN(callNilaiPajakEx) ? 0 : callNilaiPajakEx) + (nilaiBiayaKirim === '0' || nilaiBiayaKirim === '' ? 0 : parseFloat(nilaiBiayaKirim));
                setTotalJumlahSetelahPajakVariabel(jumlahSetelahPajak);
                setTotalJumlahSetelahPajakKirim(jumlahSetelahPajak);
                setTotalNilaiPajakVariabel(callNilaiPajakEx);
            } else if (selectedOptionPajak === 'I') {
                setValueNilaiDpp(calNilaiDpp);
                // jumlahSetelahPajak =
                //     calNilaiDpp + (isNaN(totalNilaiPajakVariabel) ? 0 : totalNilaiPajakVariabel) + (nilaiBiayaKirim === '0' || nilaiBiayaKirim === '' ? 0 : parseFloat(nilaiBiayaKirim));
                jumlahSetelahPajak = calNilaiDpp + (isNaN(callNilaiPajak) ? 0 : callNilaiPajak) + (nilaiBiayaKirim === '0' || nilaiBiayaKirim === '' ? 0 : parseFloat(nilaiBiayaKirim));
                setTotalJumlahSetelahPajakVariabel(jumlahSetelahPajak);
                setTotalJumlahSetelahPajakKirim(jumlahSetelahPajak);
                setTotalNilaiPajakVariabel(callNilaiPajak);
            }
            // Mendapatkan elemen input diskonResult
            const nilaiDiskon1 = document.getElementById('diskonResult') as HTMLInputElement;

            // Membersihkan nilai input diskonResult
            if (nilaiDiskon1) {
                nilaiDiskon1.value = isNaN(nilaiDiskon) ? '' : frmNumber(nilaiDiskon);
            }
        } else if (property === 'nilaiDiskon') {
            diskon = (parseFloat(tanpaKoma(value)) / totalJumlahVariabel) * 100;

            nilaiDiskon = (totalJumlahVariabel * diskon) / 100;
            // calNilaiDpp = valueNilaiDppFilter - nilaiDiskon;
            nilaiSetelahPajak = totalJumlahVariabel - nilaiDiskon;
            // const newNodes = dataDetail.nodes.map((node: any) => {});
            const nilaiPajak = dataDetail.nodes.length > 0 ? (dataDetail.nodes[0] as any).pajak : null;
            calNilaiDpp = nilaiSetelahPajak / ((100 + parseFloat(nilaiPajak)) / 100);
            callNilaiPajak = (calNilaiDpp * parseFloat(nilaiPajak)) / 100;
            setDiskonHeader(diskon);
            setNilaiDiskonHeader(value);
            if (selectedOptionPajak === 'N') {
                setValueNilaiDpp(0);
                jumlahSetelahPajak = totalJumlahVariabel - nilaiDiskon;
                setTotalJumlahSetelahPajakVariabel(jumlahSetelahPajak);
                setTotalJumlahSetelahPajakKirim(jumlahSetelahPajak);
            } else if (selectedOptionPajak === 'E') {
                // setValueNilaiDpp(calNilaiDpp);
                // jumlahSetelahPajak =
                //     calNilaiDpp + (isNaN(totalNilaiPajakVariabel) ? 0 : totalNilaiPajakVariabel) + (nilaiBiayaKirim === '0' || nilaiBiayaKirim === '' ? 0 : parseFloat(nilaiBiayaKirim));
                let callNilaiPajakEx = (nilaiSetelahPajak * parseFloat(nilaiPajak)) / 100;
                setValueNilaiDpp(nilaiSetelahPajak);
                jumlahSetelahPajak = nilaiSetelahPajak + (isNaN(callNilaiPajakEx) ? 0 : callNilaiPajakEx) + (nilaiBiayaKirim === '0' || nilaiBiayaKirim === '' ? 0 : parseFloat(nilaiBiayaKirim));

                setTotalJumlahSetelahPajakVariabel(jumlahSetelahPajak);
                setTotalJumlahSetelahPajakKirim(jumlahSetelahPajak);
                setTotalNilaiPajakVariabel(callNilaiPajakEx);
            } else if (selectedOptionPajak === 'I') {
                setValueNilaiDpp(calNilaiDpp);
                // jumlahSetelahPajak =
                //     calNilaiDpp + (isNaN(totalNilaiPajakVariabel) ? 0 : totalNilaiPajakVariabel) + (nilaiBiayaKirim === '0' || nilaiBiayaKirim === '' ? 0 : parseFloat(nilaiBiayaKirim));
                jumlahSetelahPajak = calNilaiDpp + (isNaN(callNilaiPajak) ? 0 : callNilaiPajak) + (nilaiBiayaKirim === '0' || nilaiBiayaKirim === '' ? 0 : parseFloat(nilaiBiayaKirim));
                setTotalJumlahSetelahPajakVariabel(jumlahSetelahPajak);
                setTotalJumlahSetelahPajakKirim(jumlahSetelahPajak);
                setTotalNilaiPajakVariabel(callNilaiPajak);
            }

            // Mendapatkan elemen input diskon
            const diskon1 = document.getElementById('diskon') as HTMLInputElement;
            // Mendapatkan elemen input diskonResult
            const nilaiDiskon1 = document.getElementById('diskonResult') as HTMLInputElement;

            // Membersihkan nilai input diskon
            if (diskon1) {
                diskon1.value = isNaN(diskon) ? '' : frmNumber(diskon);
            }
            // Membersihkan nilai input diskonResult
            if (nilaiDiskon1) {
                nilaiDiskon1.value = isNaN(nilaiDiskon) ? '' : frmNumber(nilaiDiskon);
            }
        }
    };

    const handleTerapkanSemuaClick = async () => {
        if (selectedKodePoGrup === '' && selectedKodePpnAtasNama === '') {
            swal.fire({
                // title: 'Warning',
                html: "<span style='color: gray; font-weight: bold;'><b>PO Grup atau PPN Atas Nama belum diisi.</b></span>",
                icon: 'warning',
                showCancelButton: false,
                confirmButtonText: 'OK',
                // allowHtml: true
            }).then(async (result) => {
                if (result.isConfirmed) {
                }
            });
        } else {
            swal.fire({
                // title: 'Warning',
                html: "<span style='color: gray; font-weight: bold;'><b>Terapkan PO Grup dan atau PPN Atas Nama ke semua data barang.</b></span>",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'OK',
                // allowHtml: true
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await setDataDetail((state: any) => {
                        const newNodes = state.nodes.map((node: any) => {
                            return {
                                ...node,
                                po_grup: selectedKodePoGrup,
                                ppn_atas_nama: selectedNamaCabangPpnAtasNama,
                                kodecabang: selectedKodePpnAtasNama,
                            };
                        });

                        return {
                            nodes: newNodes,
                            // totalBerat: totalBerat.toFixed(2),
                        };
                    });
                }
            });
        }
    };

    const [idRowRemove, setIdRowRemove] = useState(0);

    const [kurs, setKurs] = useState('');
    const [kursPajak, setKursPajak] = useState('');
    const [catatan, setCatatan] = useState('');
    const [kirimLangsung, setKirimLangsung] = useState('');

    const [dataDetailSimpan, setDataDetailSimpan] = useState({ detailJson: [] });

    const saveDoc = async () => {
        if (selectedOptionPajak !== 'N') {
            const hasEmptyOrZeroPajak = dataDetail.nodes.some((row: { pajak: string }) => row.pajak === '' || row.pajak === '0.00');
            if (hasEmptyOrZeroPajak) {
                swal.fire({
                    title: `Nilai Pajak ${selectedOptionPajak === 'I' ? 'Include' : 'Exclude'} belum terisi`,
                    icon: 'warning',
                });
                return;
            }
        }

        let total_diskon_mu = 0,
            total_berat = 0;
        let objectHeader, jumlahItem, sisaPlafondDebet;
        let kodeCabang: any = 'kodecabang';
        // let overBeli = false;
        let detailRows: any = [];

        let defaultNoPO: any;
        if (kodeSpEdit === 'BARU') {
            const result = await generateNU(kode_entitas, '', '02', dateGenerateNu.format('YYYYMM'));
            defaultNoPO = result;
        } else {
            defaultNoPO = noPOValue;
        }

        await ReCalc(setDataDetail)
            .then((result) => {
                const { totalDiskonMu, totalBerat } = result;
                total_diskon_mu = totalDiskonMu;
                total_berat = totalBerat;
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        objectHeader = {
            kode_entitas: kode_entitas,
            include: selectedOptionPajak,
            tipeTransaksi: jBarang,
            kodeSp: kodeSpEdit === 'BARU' ? '' : kodeSp,
            tipeDoc: 'baru',
        };
        const respRecalc = await ReCalcDataNodes(dataDetail, objectHeader);
        const jsonData = {
            entitas: kode_entitas,
            kode_sp: kodeSpEdit === 'BARU' ? '' : kodeSp, // ini nanti dari Backend
            // no_sp: noPOValue,
            no_sp: defaultNoPO,
            tgl_sp: kodeSpEdit === 'BARU' ? moment(date1).format('YYYY-MM-DD HH:mm:ss') : tglSpEdit,
            kode_supp: suppSelectedKode,
            tgl_berlaku: moment(date2)
                .set({
                    hour: moment().hours(),
                    minute: moment().minutes(),
                    second: moment().seconds(),
                })
                .format('YYYY-MM-DD HH:mm:ss'),
            tgl_kirim: moment(date3)
                .set({
                    hour: moment().hours(),
                    minute: moment().minutes(),
                    second: moment().seconds(),
                })
                .format('YYYY-MM-DD HH:mm:ss'),
            alamat_kirim: alamatPengiriman,
            via: selectedOptionFax === '' ? 'Fax' : selectedOptionFax,
            fob: selectedOptionCaraPengiriman === '' ? 'Dikirim' : selectedOptionCaraPengiriman,
            kode_termin: selectedKodeTermin,
            kode_mu: 'IDR',
            kurs: parseInt(kurs === '' ? '1' : kurs),
            kurs_pajak: parseInt(kursPajak === '' ? '1' : kursPajak),
            kena_pajak: selectedOptionPajak,
            total_mu: totalJumlahVariabel,
            diskon_dok: diskonHeader,
            diskon_dok_mu: nilaiDiskonHeader,
            total_diskon_mu: total_diskon_mu,
            total_pajak_mu: totalNilaiPajakVariabel,
            kirim_mu: parseInt(nilaiBiayaKirim === '' ? '0' : nilaiBiayaKirim),
            netto_mu: totalJumlahSetelahPajakVariabel,
            total_rp: totalJumlahVariabel,
            diskon_dok_rp: nilaiDiskonHeader,
            total_diskon_rp: total_diskon_mu,
            total_pajak_rp: totalNilaiPajakVariabel,
            kirim_rp: parseInt(nilaiBiayaKirim === '' ? '0' : nilaiBiayaKirim),
            netto_rp: totalJumlahSetelahPajakVariabel,
            total_berat: total_berat,
            statusDok: statusDok,
            keterangan: catatan,
            status: 'Terbuka',
            userid: userid.toUpperCase(),
            tgl_update: kodeSpEdit === 'BARU' ? moment(date1).format('YYYY-MM-DD HH:mm:ss') : moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            approval: kodeSpEdit === 'BARU' ? '' : approvalData,
            tgl_approval: kodeSpEdit === 'BARU' ? moment(date1).format('YYYY-MM-DD HH:mm:ss') : tglApproval,
            kirim_langsung: kirimLangsung === '' ? 'N' : kirimLangsung,
            status_kirim: 'N', // status kirim di default dulu N
            no_sjpabrik: '',
            tgl_sjpabrik: '',
            tgl_sjfax: '',
            nota: '',
            kontrak: jTransaksi === 'KONTRAK' ? 'Y' : 'N',
            kode_beli: selectedOption,
            fdo: '',
            produksi: jBarang === 'produksi' ? 'Y' : 'N',
            token: tokenRedis,
            detailPo: respRecalc.detailJson,
        };

        for (var i = 0; i < respRecalc.detailJson.length; i++) {
            // Periksa jika kode_cabang kosong
            if (respRecalc.detailJson[i].kodecabang === '' || respRecalc.detailJson[i].kodecabang === null) {
                // Masukkan ke dalam kodeCabang dan hentikan iterasi
                kodeCabang = respRecalc.detailJson[i].kodecabang;
                break;
            }
        }
        detailRows = respRecalc.detailJson;
        jumlahItem = respRecalc.detailJson.length;

        // await ReCalcDataNodes(dataDetail, objectHeader)
        //     .then((result) => {
        //         jsonData = {
        //             entitas: kode_entitas,
        //             kode_sp: kodeSpEdit === 'BARU' ? '' : kodeSp, // ini nanti dari Backend
        //             // no_sp: noPOValue,
        //             no_sp: defaultNoPO,
        //             tgl_sp: kodeSpEdit === 'BARU' ? moment(date1).format('YYYY-MM-DD HH:mm:ss') : tglSpEdit,
        //             kode_supp: suppSelectedKode,
        //             tgl_berlaku: moment(date2)
        //                 .set({
        //                     hour: moment().hours(),
        //                     minute: moment().minutes(),
        //                     second: moment().seconds(),
        //                 })
        //                 .format('YYYY-MM-DD HH:mm:ss'),
        //             tgl_kirim: moment(date3)
        //                 .set({
        //                     hour: moment().hours(),
        //                     minute: moment().minutes(),
        //                     second: moment().seconds(),
        //                 })
        //                 .format('YYYY-MM-DD HH:mm:ss'),
        //             alamat_kirim: alamatPengiriman,
        //             via: selectedOptionFax === '' ? 'Fax' : selectedOptionFax,
        //             fob: selectedOptionCaraPengiriman === '' ? 'Dikirim' : selectedOptionCaraPengiriman,
        //             kode_termin: selectedKodeTermin,
        //             kode_mu: 'IDR',
        //             kurs: parseInt(kurs === '' ? '1' : kurs),
        //             kurs_pajak: parseInt(kursPajak === '' ? '1' : kursPajak),
        //             kena_pajak: selectedOptionPajak,
        //             total_mu: totalJumlahVariabel,
        //             diskon_dok: diskonHeader,
        //             diskon_dok_mu: nilaiDiskonHeader,
        //             total_diskon_mu: total_diskon_mu,
        //             total_pajak_mu: totalNilaiPajakVariabel,
        //             kirim_mu: parseInt(nilaiBiayaKirim === '' ? '0' : nilaiBiayaKirim),
        //             netto_mu: totalJumlahSetelahPajakVariabel,
        //             total_rp: totalJumlahVariabel,
        //             diskon_dok_rp: nilaiDiskonHeader,
        //             total_diskon_rp: total_diskon_mu,
        //             total_pajak_rp: totalNilaiPajakVariabel,
        //             kirim_rp: parseInt(nilaiBiayaKirim === '' ? '0' : nilaiBiayaKirim),
        //             netto_rp: totalJumlahSetelahPajakVariabel,
        //             total_berat: total_berat,
        //             keterangan: catatan,
        //             status: 'Terbuka',
        //             userid: userid.toUpperCase(),
        //             tgl_update: kodeSpEdit === 'BARU' ? moment(date1).format('YYYY-MM-DD HH:mm:ss') : moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        //             approval: kodeSpEdit === 'BARU' ? '' : approvalData,
        //             tgl_approval: kodeSpEdit === 'BARU' ? moment(date1).format('YYYY-MM-DD HH:mm:ss') : tglApproval,
        //             kirim_langsung: kirimLangsung === '' ? 'N' : kirimLangsung,
        //             status_kirim: 'N', // status kirim di default dulu N
        //             no_sjpabrik: '',
        //             tgl_sjpabrik: '',
        //             tgl_sjfax: '',
        //             nota: '',
        //             kontrak: jTransaksi === 'KONTRAK' ? 'Y' : 'N',
        //             kode_beli: selectedOption,
        //             fdo: '',
        //             produksi: jBarang === 'produksi' ? 'Y' : 'N',
        //             detailPo: result.detailJson,
        //         };

        //         for (var i = 0; i < result.detailJson.length; i++) {
        //             // Periksa jika kode_cabang kosong
        //             if (result.detailJson[i].kodecabang === '' || result.detailJson[i].kodecabang === null) {
        //                 // Masukkan ke dalam kodeCabang dan hentikan iterasi
        //                 kodeCabang = result.detailJson[i].kodecabang;
        //                 break;
        //             }
        //         }

        //         detailRows = result.detailJson;
        //         jumlahItem = result.detailJson.length;
        //     })
        //     .catch((error) => {
        //         console.error('Error:', error);
        //     });

        var jsonString = JSON.stringify(jsonData);
        console.log('jsonData = ', jsonData);

        const cekPlafondDebet = await axios.get(`${apiUrl}/erp/cek_plafond_debet`, {
            params: {
                entitas: kode_entitas,
                param1: suppSelectedKode,
            },
        });
        const cek_palfond_debet = cekPlafondDebet.data.data;
        if (cek_palfond_debet.length > 0) {
            sisaPlafondDebet = cek_palfond_debet[0].sisa;
        } else {
            sisaPlafondDebet = '';
        }

        const hasEmptyFieldsNamaBarang = dataDetail.nodes.some((row: { nama_barang: string }) => row.nama_barang === '');
        const hasEmptyFieldsPoGrup = dataDetail.nodes.some((row: { po_grup: string }) => row.po_grup === '');
        const hasEmptyFieldsJumalhMu = dataDetail.nodes.some((row: { jumlah: string }) => row.jumlah === '');
        if (hasEmptyFieldsNamaBarang === true) {
            swal.fire({
                title: 'Data barang belum diisi.',
                icon: 'warning',
            });
            return;
        }

        if (hasEmptyFieldsPoGrup === true) {
            swal.fire({
                title: 'Grup PO belum dimasukan.',
                icon: 'warning',
            });
            return;
        }

        if (date2 === '') {
            swal.fire({
                title: 'Tanggal berlaku belum diisi.',
                icon: 'warning',
            });
            return;
        }

        if (date3 === '') {
            swal.fire({
                title: 'Tanggal pengiriman belum diisi.',
                icon: 'warning',
            });
            return;
        }

        if (selectedOption === '') {
            swal.fire({
                title: 'Kode beli diisi.',
                icon: 'warning',
            });
            return;
        }

        if (hasEmptyFieldsJumalhMu === true) {
            swal.fire({
                title: 'Jumlah tidak boleh kurang atau sama dengan nol.',
                icon: 'warning',
            });
            return;
        }

        if (sisaPlafondDebet < totalJumlahSetelahPajakVariabel) {
            swal.fire({
                title: `Sisa plafond ${sisaPlafondDebet} Transaksi tidak dapat dilanjutkan`,
                icon: 'warning',
            });
            return;
        }
        if (kodeSpEdit === 'BARU') {

            const cekDataPO = await cekDataDiDatabase(kode_entitas, 'tb_m_sp', 'no_sp', jsonData?.no_sp, token);
            if (cekDataPO) {
                // jsonData.no_ttb = defaultNoTtb;
                const generateCounter = await generateNU(kode_entitas, defaultNoPO, '02', dateGenerateNu.format('YYYYMM'));
                const generateNoDok = await generateNU(kode_entitas, '', '02', dateGenerateNu.format('YYYYMM'));
                jsonData.no_sp = generateNoDok;
            }

            const response = await axios.post(`${apiUrl}/erp/simpan_po`, jsonData);
            const result = response.data;
            const status = result.status;
            const errormsg = result.serverMessage;

            swal.close();
            if (status === true) {
                let getcounterno_po = await generateNU(kode_entitas, result.data.no_sp, '02', moment(date1).format('YYYYMM'))
                    .then((result) => {
                        // alert(result);
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                        swal.fire({
                            title: 'Penambahan Counter No PP Gagal',
                            icon: 'warning',
                        });
                    });

                await handleUpload(
                    selectedFiles,
                    selectedFile,
                    selectedNamaFiles,
                    fileGambar,
                    result.kode_sp,
                    kode_entitas,
                    tipeBersihkangambar,
                    selectedBersihkangambar,
                    apiUrl,
                    setTipeSelectedBersihkangambar,
                    setSelectedBersihkangambar,
                    setImages,
                    setSelectedFiles,
                    tipeBersihkanPdf,
                    selectedBersihkanPdf,
                    setTipeSelectedBersihkanPdf,
                    setSelectedBersihkanPdf,
                    tipeBersihkanPdf2,
                    selectedBersihkanPdf2,
                    setTipeSelectedBersihkanPdf2,
                    setSelectedBersihkanPdf2
                );

                const auditResponse = await axios.post(`${apiUrl}/erp/simpan_audit`, {
                    entitas: kode_entitas,
                    kode_audit: null,
                    dokumen: 'SP',
                    kode_dokumen: result.kode_sp,
                    no_dokumen: result.data.no_sp, // Perubahan tgl 2025-05-23
                    tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                    proses: 'NEW',
                    diskripsi: `PO item = ${jumlahItem} total_berat = ${frmNumber(total_berat)} nilai transaksi = ${frmNumber(totalJumlahSetelahPajakVariabel)}`,
                    userid: userid.toUpperCase(), // userid login web
                    system_user: '', //username login
                    system_ip: '', //ip address
                    system_mac: '', //mac address
                });
                if (auditResponse.data.status === true) {
                    swal.fire({
                        title: 'Data Berhasil di Simpan.',
                        icon: 'success',
                    });
                    //back to pp list
                    // router.push({ pathname: './polist', query: { name: '', jenisTransaksi: '' } });
                    // router.push({ pathname: './polist' });
                    backPage();
                }
            } else {
                swal.fire({
                    title: errormsg,
                    icon: 'warning',
                });
                backPage();
            }
        } else {
            if (routerTipe === 'UpdateFile') {
                await uploadFilePendukung();
                swal.fire({
                    title: `Data Berhasil di EDIT.`,
                    icon: 'success',
                });
                // router.push({ pathname: './polist' });
                backPage();
            } else {
                let sts;
                let q, diskripsi: any;
                let overBeli = false;
                if (routerTipe === 'App') {
                    sts = 'Disetujui';
                } else {
                    sts = 'Edit';
                }
                for (var i = 0; i < detailRows.length; i++) {
                    const cekBatasPembelian = await axios.get(`${apiUrl}/erp/cek_batas_pembelian`, {
                        params: {
                            entitas: kode_entitas,
                            param1: detailRows[i].kode_item,
                        },
                    });
                    const cek_batas_pembelian = cekBatasPembelian.data.data;
                    if (parseFloat(cek_batas_pembelian[0].q) > 0) {
                        if (detailRows[i].jumlah > cek_batas_pembelian[0].q) {
                            q = '';
                            diskripsi = detailRows[i].nama_barang;
                            overBeli = true;
                            break;
                        }
                    }
                }

                if (selectedOptionPajak === 'N') {
                } else if ((kodeCabang === '' || kodeCabang === null) && routerTipe === 'App') {
                    swal.fire({
                        title: 'Referensi pajak belum dimasukkan.',
                        icon: 'warning',
                    });
                    return;
                }

                if (q === '') {
                    swal.fire({
                        title: `Item ${diskripsi} melebihi maksimum jumlah pembelian.`,
                        icon: 'warning',
                    });
                    return;
                }

                const response = await axios.patch(`${apiUrl}/erp/update_po`, jsonData);
                const result = response.data;
                const status = result.status;
                const errormsg = result.serverMessage;

                swal.close();
                if (status === true) {
                    await uploadFilePendukung();
                    if (sts === 'Edit') {
                        const auditResponse = await axios.post(`${apiUrl}/erp/simpan_audit`, {
                            entitas: kode_entitas,
                            kode_audit: null,
                            dokumen: 'SP',
                            kode_dokumen: kodeSp,
                            no_dokumen: noPOValue,
                            tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                            proses: 'EDIT',
                            diskripsi: `PO item = ${jumlahItem} total_berat = ${frmNumber(total_berat)} nilai transaksi = ${frmNumber(totalJumlahSetelahPajakVariabel)}`,
                            userid: userid.toUpperCase(), // userid login web
                            system_user: '', //username login
                            system_ip: '', //ip address
                            system_mac: '', //mac address
                        });
                        if (auditResponse.data.status === true) {
                            swal.fire({
                                title: `Data Berhasil di ${sts}.`,
                                icon: 'success',
                            });
                        }
                    } else {
                        const auditResponse = await axios.post(`${apiUrl}/erp/simpan_audit`, {
                            entitas: kode_entitas,
                            kode_audit: null,
                            dokumen: 'SP',
                            kode_dokumen: kodeSp,
                            no_dokumen: noPOValue,
                            tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                            proses: 'APPROVAL',
                            diskripsi: `Approval disetujui item = ${jumlahItem} total_berat = ${frmNumber(total_berat)} nilai transaksi = ${frmNumber(totalJumlahSetelahPajakVariabel)}`,
                            userid: userid.toUpperCase(), // userid login web
                            system_user: '', //username login
                            system_ip: '', //ip address
                            system_mac: '', //mac address
                        });
                        if (auditResponse.data.status === true) {
                            swal.fire({
                                title: `Data Berhasil di ${sts}.`,
                                icon: 'success',
                            });
                        }
                    }
                    //back to pp list
                    // router.push({ pathname: './polist', query: { name: '', jenisTransaksi: '' } });
                    // router.push({ pathname: './polist' });
                    backPage();
                } else {
                    swal.fire({
                        title: errormsg,
                        icon: 'warning',
                    });
                    backPage();
                }
            }
        }
    };

    const handleBatal = () => {
        const encode = Buffer.from(
            `vTanggalChecked=${routeTanggalChecked}&vTipeDokumen=${routeTipeDokumen}&tglAwal=${routeTglAwal}&tglAkhir=${routeTglAkhir}&tglBerlaku1=${routeTglBerlaku1}&tglBerlaku2=${routeTglBerlaku2}&tglKirim1=${routeTglKirim1}&tglKirim2=${routeTglKirim2}&noPo=${routeNoPo}&namaSupp=${routeNamaSupp}&namaBarang=${routeNamaBarang}&noPoChecked=${routeNoPoChecked}&namaSuppChecked=${routeNamaSuppChecked}&namaBarangChecked=${routeNamaBarangChecked}&statusDok=${routeStatusDok}&statusApp=${routeStatusApp}`
        ).toString('base64');
        router.push({ pathname: './polist', query: { str: encode } });

        // router.push({ pathname: './polist' });
    };

    const backPage = () => {
        const encode = Buffer.from(
            `vTanggalChecked=${routeTanggalChecked}&vTipeDokumen=${routeTipeDokumen}&tglAwal=${routeTglAwal}&tglAkhir=${routeTglAkhir}&tglBerlaku1=${routeTglBerlaku1}&tglBerlaku2=${routeTglBerlaku2}&tglKirim1=${routeTglKirim1}&tglKirim2=${routeTglKirim2}&noPo=${routeNoPo}&namaSupp=${routeNamaSupp}&namaBarang=${routeNamaBarang}&noPoChecked=${routeNoPoChecked}&namaSuppChecked=${routeNamaSuppChecked}&namaBarangChecked=${routeNamaBarangChecked}&statusDok=${routeStatusDok}&statusApp=${routeStatusApp}`
        ).toString('base64');
        router.push({ pathname: './polist', query: { str: encode } });
    };

    const [handleNamaSupp, setHandleNamaSupp] = useState('');
    const [handleNamaTermin, setHandleNamaTermin] = useState('');
    const [handleKodeGrup, setHandleKodeGrup] = useState('');
    const [handlePpnAtas_Nama, setHandlePpnAtasNama] = useState('');
    const [changeNumber, setChangeNumber] = useState(0);

    // const handleModalChange = async (event: any, tipe: string) => {
    //     setChangeNumber((prevTotal) => prevTotal + 1);
    //     if (tipe === 'supplier') {
    //         setHandleNamaSupp(event);
    //         setModal1(true);
    //     } else if (tipe === 'termin') {
    //         setHandleNamaTermin(event);
    //         setModal2(true);
    //     } else if (tipe === 'poGrup') {
    //         setHandleKodeGrup(event);
    //         setModal3(true);
    //     } else if (tipe === 'ppnAtasNama') {
    //         setHandlePpnAtasNama(event);
    //         setModal4(true);
    //     }
    // };

    const [ModalHarga, setModalHarga] = useState(false);
    const [filterHargaKodeItem, setFilterHargaKodeItem] = useState(false);
    const [filterHargaId, setFilterHargaId] = useState(false);

    const appDoc = async (tipe: any, sts: any) => {
        let total_diskon_mu = 0,
            total_berat = 0;
        let jsonData: any, objectHeader;
        let jumlahItem: any;
        let kodeFpb: any;
        await ReCalc(setDataDetail)
            .then((result) => {
                const { totalDiskonMu, totalBerat } = result;
                total_diskon_mu = totalDiskonMu;
                total_berat = totalBerat;
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        objectHeader = {
            kode_entitas: kode_entitas,
            include: selectedOptionPajak,
            tipeTransaksi: jBarang,
            kodeSp: kodeSpEdit === 'BARU' ? '' : kodeSp,
            tipeDoc: tipe,
        };
        await ReCalcDataNodes(dataDetail, objectHeader)
            .then((result) => {
                // setDataDetailSimpan(result);
                jsonData = {
                    entitas: kode_entitas,
                    kode_sp: kodeSpEdit === 'BARU' ? '' : kodeSp, // ini nanti dari Backend
                    no_sp: noPOValue,
                    tgl_sp: kodeSpEdit === 'BARU' ? moment(date1).format('YYYY-MM-DD HH:mm:ss') : tglSpEdit,
                    kode_supp: suppSelectedKode,
                    tgl_berlaku: moment(date2)
                        .set({
                            hour: moment().hours(),
                            minute: moment().minutes(),
                            second: moment().seconds(),
                        })
                        .format('YYYY-MM-DD HH:mm:ss'),
                    tgl_kirim: moment(date3)
                        .set({
                            hour: moment().hours(),
                            minute: moment().minutes(),
                            second: moment().seconds(),
                        })
                        .format('YYYY-MM-DD HH:mm:ss'),
                    alamat_kirim: alamatPengiriman,
                    via: selectedOptionFax === '' ? 'Fax' : selectedOptionFax,
                    fob: selectedOptionCaraPengiriman === '' ? 'Dikirim' : selectedOptionCaraPengiriman,
                    kode_termin: selectedKodeTermin,
                    kode_mu: 'IDR',
                    kurs: parseInt(kurs === '' ? '1' : kurs),
                    kurs_pajak: parseInt(kursPajak === '' ? '1' : kursPajak),
                    kena_pajak: selectedOptionPajak,
                    total_mu: totalJumlahVariabel,
                    diskon_dok: diskonHeader,
                    diskon_dok_mu: nilaiDiskonHeader,
                    total_diskon_mu: total_diskon_mu,
                    total_pajak_mu: totalNilaiPajakVariabel,
                    kirim_mu: parseInt(nilaiBiayaKirim === '' ? '0' : nilaiBiayaKirim),
                    netto_mu: totalJumlahSetelahPajakVariabel,
                    total_rp: totalJumlahVariabel,
                    diskon_dok_rp: nilaiDiskonHeader,
                    total_diskon_rp: total_diskon_mu,
                    total_pajak_rp: totalNilaiPajakVariabel,
                    kirim_rp: parseInt(nilaiBiayaKirim === '' ? '0' : nilaiBiayaKirim),
                    netto_rp: totalJumlahSetelahPajakVariabel,
                    total_berat: total_berat,
                    keterangan: catatan,
                    status: sts === 'dibatalkan' ? 'Tertutup' : 'Terbuka',
                    statusDok: statusDok,
                    userid: userid.toUpperCase(),
                    tgl_update: kodeSpEdit === 'BARU' ? moment(date1).format('YYYY-MM-DD HH:mm:ss') : moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                    approval: kodeSpEdit === 'BARU' ? '' : sts === 'koreksi' ? 'C' : approvalAudit,
                    tgl_approval: kodeSpEdit === 'BARU' ? moment(date1).format('YYYY-MM-DD HH:mm:ss') : tglApproval,
                    kirim_langsung: kirimLangsung === '' ? 'N' : kirimLangsung,
                    status_kirim: 'N', // status kirim di default dulu N
                    no_sjpabrik: '',
                    tgl_sjpabrik: '',
                    tgl_sjfax: '',
                    nota: '',
                    kontrak: jTransaksi === 'KONTRAK' ? 'Y' : 'N',
                    kode_beli: selectedOption,
                    fdo: '',
                    produksi: jBarang === 'produksi' ? 'Y' : 'N',
                    detailPo: result.detailJson,
                };
                jumlahItem = result.detailJson.length;
                kodeFpb = result.detailJson[0].kode_fpb;
            })
            .catch((error) => {
                console.error('Error:', error);
            });

        var jsonString = JSON.stringify(jsonData);

        let sts1: any;
        if (sts === 'koreksi') {
            sts1 = 'Dikoreksi';
        } else if (sts1 === 'ditolak') {
            sts1 = 'Ditolak';
        } else {
            sts1 = 'Dibatalkan';
        }

        console.log('jsonData ', jsonData, kodeFpb);

        if (sts === 'dibatalkan') {
            swal.fire({
                // title: 'Warning',
                title: 'Apakah Anda yakin akan membatalkan data ini ?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                // allowHtml: true
            }).then(async (result) => {
                if (result.isConfirmed) {
                    // const response = await axios.patch(`${apiUrl}/erp/update_po`, jsonData);
                    const response =
                        kodeFpb === null || kodeFpb === '' || kodeFpb === undefined
                            ? await axios.patch(`${apiUrl}/erp/update_po_pembatalan`, jsonData)
                            : await axios.post(`${apiUrl}/erp/pembatalan_po`, jsonData); // perubahan 2025-06-05
                    const result = response.data;
                    const status = result.status;
                    const errormsg = result.serverMessage;

                    swal.close();
                    if (status === true) {
                        await uploadFilePendukung();
                        const auditResponse = await axios.post(`${apiUrl}/erp/simpan_audit`, {
                            entitas: kode_entitas,
                            kode_audit: null,
                            dokumen: 'SP',
                            kode_dokumen: kodeSp,
                            no_dokumen: noPOValue,
                            tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                            proses: 'CANCEL',
                            diskripsi:
                                approvalAudit === null || approvalAudit === ''
                                    ? `PO item = ${jumlahItem} total_berat = ${frmNumber(total_berat)} nilai transaksi ${frmNumber(totalJumlahSetelahPajakVariabel)}`
                                    : `Approval ${sts1} item = ${jumlahItem} total_berat = ${frmNumber(total_berat)} nilai transaksi = ${frmNumber(totalJumlahSetelahPajakVariabel)}`,
                            userid: userid.toUpperCase(), // userid login web
                            system_user: '', //username login
                            system_ip: '', //ip address
                            system_mac: '', //mac address
                        });
                        if (auditResponse.data.status === true) {
                            swal.fire({
                                title: `Data Berhasil ${sts1}.`,
                                icon: 'success',
                            });
                        }

                        //back to pp list
                        // router.push({ pathname: './polist', query: { name: '', jenisTransaksi: '' } });
                        // router.push({ pathname: './polist' });
                        backPage();
                    } else {
                        swal.fire({
                            title: errormsg,
                            icon: 'warning',
                        });
                    }
                }
            });
        } else {
            const response = await axios.patch(`${apiUrl}/erp/update_po`, jsonData);
            const result = response.data;
            const status = result.status;
            const errormsg = result.serverMessage;

            swal.close();
            if (status === true) {
                await uploadFilePendukung();
                const auditResponse = await axios.post(`${apiUrl}/erp/simpan_audit`, {
                    entitas: kode_entitas,
                    kode_audit: null,
                    dokumen: 'SP',
                    kode_dokumen: kodeSp,
                    no_dokumen: noPOValue,
                    tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
                    proses: 'APPROVAL',
                    diskripsi: `Approval ${sts1} item = ${jumlahItem} total_berat = ${frmNumber(total_berat)} nilai transaksi = ${frmNumber(totalJumlahSetelahPajakVariabel)}`,
                    userid: userid.toUpperCase(), // userid login web
                    system_user: '', //username login
                    system_ip: '', //ip address
                    system_mac: '', //mac address
                });
                if (auditResponse.data.status === true) {
                    swal.fire({
                        title: `Data Berhasil ${sts1}.`,
                        icon: 'success',
                    });
                }
                //back to pp list
                // router.push({ pathname: './polist', query: { name: '', jenisTransaksi: '' } });
                // router.push({ pathname: './polist' });
                backPage();
            } else {
                swal.fire({
                    title: errormsg,
                    icon: 'warning',
                });
            }
        }
    };

    async function uploadFilePendukung() {
        handleUpload(
            selectedFiles,
            selectedFile,
            selectedNamaFiles,
            fileGambar,
            kodeSp,
            kode_entitas,
            tipeBersihkangambar,
            selectedBersihkangambar,
            apiUrl,
            setTipeSelectedBersihkangambar,
            setSelectedBersihkangambar,
            setImages,
            setSelectedFiles,
            tipeBersihkanPdf,
            selectedBersihkanPdf,
            setTipeSelectedBersihkanPdf,
            setSelectedBersihkanPdf,
            tipeBersihkanPdf2,
            selectedBersihkanPdf2,
            setTipeSelectedBersihkanPdf2,
            setSelectedBersihkanPdf2
        );
    }

    const [nilaiBiayaKirim, setNilaiBiayaKirim] = useState('0');

    // STATE UNTUK FILE PENDUKUNG
    const [activeTab, setActiveTab] = useState(0);
    const [activeTabPdf, setActiveTabPdf] = useState(50);
    const [activeTabPdf2, setActiveTabPdf2] = useState(51);

    const [selectedFile, setSelectedFile] = useState('baru');
    const [images, setImages] = useState<(string | ArrayBuffer | null)[][]>(
        Array(10)
            .fill(null)
            .map(() => [])
    );
    const [selectedFiles, setSelectedFiles] = useState<any>([]);
    const [selectedNamaFiles, setNamaFiles] = useState<any>([]);
    const formattedName = moment().format('YYMMDDHHmmss');
    const [fileGambar, setFileGambar] = useState('');
    const [modalPosition] = useState({ top: '15%', left: '35%' });
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedImages, setSelectedImages] = useState('');
    const [active, setActive] = useState(0);
    const [active1, setActive1] = useState(0);
    const [active2, setActive2] = useState(0);
    const [selectedBersihkangambar, setSelectedBersihkangambar] = useState('');
    const [tipeBersihkangambar, setTipeSelectedBersihkangambar] = useState('baru');
    const [selectedBersihkanPdf, setSelectedBersihkanPdf] = useState('');
    const [tipeBersihkanPdf, setTipeSelectedBersihkanPdf] = useState('baru');
    const [selectedBersihkanPdf2, setSelectedBersihkanPdf2] = useState('');
    const [tipeBersihkanPdf2, setTipeSelectedBersihkanPdf2] = useState('baru');
    const [numPages, setNumPages] = useState<number | null>(null); // Tentukan tipe data numPages
    const [pageNumber, setPageNumber] = useState(1);
    const [PreviewPdf, setPreviewPdf] = useState(false);
    const [PreviewPdf2, setPreviewPdf2] = useState(false);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        // Tentukan tipe data numPages
        setNumPages(numPages);
    };

    const [modalPosition1] = useState({
        top: '15%',
        left: '35%',
        maxWidth: '50%', // Atur lebar maksimal modal di sini
        overflow: 'auto',
    });
    // END STATE FILE PENDUKUNG

    const handleTgl = (date: any, tipe: any) => {
        if (moment(date).isValid()) {
            if (date === null) {
                if (tipe === 'tglBerlaku') {
                    setDate2(date);
                    setSelectedDate2(date);
                } else if (tipe === 'tglEstimasi') {
                    setDate3(date);
                    setSelectedDate3(date);
                }
            } else {
                if (tipe === 'tglBerlaku') {
                    setDate2(date);
                    setSelectedDate2(date);
                } else if (tipe === 'tglEstimasi') {
                    setDate3(date);
                    setSelectedDate3(date);
                }
            }
        }
    };

    const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value === undefined) {
            setCekPilihDate(true);
        } else {
            console.log('e.target.value = ', e.target.value);
        }
    };

    const [selectedDate2, setSelectedDate2] = useState<Date | null>(date2);
    const [selectedDate3, setSelectedDate3] = useState<Date | null>(date3);
    const [preventBlur, setPreventBlur] = useState(false);
    const [cekPilihDate, setCekPilihDate] = useState(false);

    const handleKeyPress = (event: any, date: any, tipe: any, selectedDate2: any) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Hindari event default (misalnya form submit)
            setPreventBlur(true); // Mencegah onBlur berjalan
            if (tipe === 'tglBerlaku') {
                let tglFix;
                let tglHariIni;
                const tglFormat = moment(date).format('DD-MM-YYYY');

                if (tglFormat === '01-01-2000') {
                    if (kodeSpEdit !== 'BARU') {
                        tglFix = formatTgl(moment(tglBerlakuEdit).format('DD-MM-YYYY'));
                        handleTgl(tglFix, tipe);
                    } else {
                        tglFix = formatTgl(moment().format('DD-MM-YYYY'));
                        handleTgl(tglFix, tipe);
                    }
                } else {
                    if (kodeSpEdit !== 'BARU') {
                        tglHariIni = formatTgl(moment(tglBerlakuEdit).format('DD-MM-YYYY'));
                        var hari = moment(date === '' ? selectedDate2 : date).format('DD');
                        if (date === '') {
                            tglFix = moment(selectedDate2).format('DD-MM-YYYY');
                        } else {
                            tglFix = moment(tglHariIni).add(hari, 'days').format('DD-MM-YYYY');
                        }
                        // tglFix = moment(tglHariIni).add(hari, 'days').format('DD-MM-YYYY');

                        handleTgl(formatTgl(tglFix), tipe);
                    } else {
                        tglHariIni = formatTgl(moment().format('DD-MM-YYYY'));
                        var hari = moment(date === '' ? selectedDate2 : date).format('DD');

                        if (date === '') {
                            tglFix = moment(selectedDate2).format('DD-MM-YYYY');
                        } else {
                            tglFix = moment(tglHariIni).add(hari, 'days').format('DD-MM-YYYY');
                        }
                        // tglFix = moment(tglHariIni).add(hari, 'days').format('DD-MM-YYYY');
                        handleTgl(formatTgl(tglFix), tipe);
                    }
                }
                // handleTgl(tglFix, tipe);
            } else if (tipe === 'tglEstimasi') {
                let tglFix, tglHariIni;
                const tglFormat = moment(date).format('DD-MM-YYYY');
                if (tglFormat === '01-01-2000') {
                    if (kodeSpEdit !== 'BARU') {
                        tglFix = formatTgl(moment(tglBerlakuEdit).format('DD-MM-YYYY'));
                        handleTgl(tglFix, tipe);
                    } else {
                        tglFix = formatTgl(moment().format('DD-MM-YYYY'));
                        handleTgl(tglFix, tipe);
                    }
                } else {
                    if (kodeSpEdit !== 'BARU') {
                        tglHariIni = formatTgl(moment(tglBerlakuEdit).format('DD-MM-YYYY'));
                        var hari = moment(date === '' ? selectedDate2 : date).format('DD');
                        if (date === '') {
                            tglFix = moment(selectedDate2).format('DD-MM-YYYY');
                        } else {
                            tglFix = moment(tglHariIni).add(hari, 'days').format('DD-MM-YYYY');
                        }
                        // tglFix = moment(tglHariIni).add(hari, 'days').format('DD-MM-YYYY');
                        handleTgl(formatTgl(tglFix), tipe);
                    } else {
                        tglHariIni = formatTgl(moment().format('DD-MM-YYYY'));
                        var hari = moment(date === '' ? selectedDate2 : date).format('DD');
                        if (date === '') {
                            tglFix = moment(selectedDate2).format('DD-MM-YYYY');
                        } else {
                            tglFix = moment(tglHariIni).add(hari, 'days').format('DD-MM-YYYY');
                        }
                        // tglFix = moment(tglHariIni).add(hari, 'days').format('DD-MM-YYYY');
                        handleTgl(formatTgl(tglFix), tipe);
                    }
                }
                // handleTgl(tglFix, tipe);
            }
        }
    };

    const handleBlur = (date: any, tipe: any, selectedDate2: any) => {
        if (preventBlur) {
            setPreventBlur(false); // Reset state agar onBlur bisa berjalan lagi
            return;
        }

        if (cekPilihDate) {
            setCekPilihDate(false);
            return;
        }

        // if (!date) return;

        let tglFix;
        let tglHariIni;
        const tglFormat = moment(date === '' ? selectedDate2 : date).format('DD-MM-YYYY');

        if (tglFormat === '01-01-2000') {
            if (kodeSpEdit !== 'BARU') {
                tglFix = formatTgl(moment(tglBerlakuEdit).format('DD-MM-YYYY'));
                handleTgl(tglFix, tipe);
            } else {
                tglFix = formatTgl(moment().format('DD-MM-YYYY'));
                handleTgl(tglFix, tipe);
            }
        } else {
            if (kodeSpEdit !== 'BARU') {
                tglHariIni = formatTgl(moment(tglBerlakuEdit).format('DD-MM-YYYY'));
                let hari = moment(date === '' ? selectedDate2 : date).format('DD');
                if (date === '') {
                    tglFix = moment(selectedDate2).format('DD-MM-YYYY');
                } else {
                    tglFix = moment(tglHariIni).add(hari, 'days').format('DD-MM-YYYY');
                }
                handleTgl(formatTgl(tglFix), tipe);
            } else {
                tglHariIni = formatTgl(moment().format('DD-MM-YYYY'));
                let hari = moment(date === '' ? selectedDate2 : date).format('DD');
                if (date === '') {
                    tglFix = moment(selectedDate2).format('DD-MM-YYYY');
                } else {
                    tglFix = moment(tglHariIni).add(hari, 'days').format('DD-MM-YYYY');
                }
                handleTgl(formatTgl(tglFix), tipe);
            }
        }
    };

    // Define a range function to generate an array of numbers
    function range(start: number, end: number, step: number = 1): number[] {
        const length = Math.floor((end - start) / step) + 1;
        return Array.from({ length }, (_, index) => start + index * step);
    }

    // Get the current year
    const currentYear = new Date().getFullYear();

    // Generate the range of years from 1990 to the current year
    const years = range(1990, currentYear + 1);

    const months = ['Januari', 'Pebruari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const handleDatePickerClick = (tipe: string) => {
        if (tipe === 'tglBerlaku') {
            if (date2 === '') {
            } else {
                setDate2('');
            }
        } else {
            if (date3 === '') {
            } else {
                setDate3('');
            }
        }
    };

    return (
        <div>
            {/* Form Grid Layouts */}
            <div className="table-responsive panel mb-3" style={{ background: '#dedede' }}>
                <div className="mb-5">
                    <div className="flex" style={{ alignItems: 'center' }}>
                        <div style={{ flex: 0.2, fontSize: '2.5vh' }}> Order Pembelian </div>
                        <div style={{ flex: 0.1, fontSize: '2vh' }}>|| Kode Beli </div>
                        <div style={{ flex: 1.0, marginBottom: -11, marginTop: 2 }}>
                            <select
                                style={{
                                    width: selectedOption === '' ? '22vh' : '22vh',
                                }}
                                id="kode_beli"
                                className="form-select mb-3 ml-3 "
                                onChange={(e) => setSelectedOption(e.target.value)}
                                value={selectedOption}
                                disabled={readOnly}
                            >
                                <option value="" disabled hidden>
                                    {'--Silahkan Pilih--'}
                                </option>
                                {recordListAreaBeli.map((option) => (
                                    <option key={option.kode_beli} value={option.kode_beli}>
                                        {option.kode_beli} | {option.nama_beli}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={{ marginBottom: -11, marginTop: 2, textAlign: 'right', background: 'black', color: 'white', fontSize: 20, fontWeight: 'bold' }}>{jTransaksi}</div>
                    </div>
                    <table className={styles.table} style={{ marginTop: 10 }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'center', width: '10%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Tanggal</th>
                                <th style={{ textAlign: 'center', width: '10%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>No. PO</th>
                                <th style={{ textAlign: 'center', width: '70%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Supplier</th>
                                <th style={{ textAlign: 'center', width: '10%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Termin</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ textAlign: 'center' }}>
                                    <Flatpickr
                                        value={date1}
                                        options={{
                                            dateFormat: 'd-m-Y', // format tanggal DD-MM-YYYY
                                        }}
                                        // options={{
                                        //     dateFormat: 'd-m-Y',
                                        //     onReady: function (dateObj, dateStr, instance) {
                                        //         const input = instance.altInput || instance.input;
                                        //         input.disabled = true; // Disable the input
                                        //     },
                                        // }}
                                        style={{ width: '20vh', borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}
                                        className={` ${styles.inputTableBasicDate}`}
                                        onChange={(date) => setDate1(date[0])}
                                    />
                                </td>
                                <td>
                                    <input
                                        className={`${styles.inputTableBasic}`}
                                        type="text"
                                        placeholder="Masukan Nomor PO"
                                        id="No.Po"
                                        value={noPOValue}
                                        readOnly={true}
                                        style={{ borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}
                                    />
                                </td>
                                <td>
                                    <div className="flex">
                                        <input
                                            id="supplier"
                                            placeholder="Masukan Nama Supplier"
                                            type="text"
                                            value={suppSelected}
                                            className={`mt-1 ltr:rounded-r-none rtl:rounded-l-none ${styles.inputTableBasicSearch}`}
                                            style={{ borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4 }}
                                            onChange={(event) =>
                                                HandleModalChange(
                                                    event.target.value,
                                                    'supplier',
                                                    setChangeNumber,
                                                    setHandleNamaSupp,
                                                    setModal1,
                                                    setHandleNamaTermin,
                                                    setModal2,
                                                    setHandleKodeGrup,
                                                    setModal3,
                                                    setHandlePpnAtasNama,
                                                    setModal4
                                                )
                                            }
                                            onFocus={(event) => event.target.select()}
                                            readOnly={readOnly}
                                        />
                                        <div>
                                            <button
                                                className="flex items-center justify-center border border-white-light bg-[#eee] pr-1 font-semibold dark:border-[#17263c] dark:bg-[#1b2e4b] ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0"
                                                onClick={() => {
                                                    console.log('Ikon diklik!');
                                                }}
                                                disabled={readOnly}
                                                style={{ height: 23, marginTop: -4, marginBottom: -4, background: '#dedede', borderColor: '#dedede' }}
                                            >
                                                <FontAwesomeIcon
                                                    icon={faMagnifyingGlass}
                                                    className="ml-2"
                                                    width="15"
                                                    height="15"
                                                    onClick={() =>
                                                        HandleModaliconChange(
                                                            'supplier',
                                                            setHandleNamaSupp,
                                                            setModal1,
                                                            setHandleNamaTermin,
                                                            setModal2,
                                                            setHandleKodeGrup,
                                                            setModal3,
                                                            setHandlePpnAtasNama,
                                                            setModal4,
                                                            vRefreshData
                                                        )
                                                    }
                                                />
                                            </button>
                                            {/* // Modal Supplier yang ada pada Header */}
                                            <SupplierModal
                                                isOpen={modal1}
                                                onClose={() => setModal1(false)}
                                                userid={userid}
                                                kode_entitas={kode_entitas}
                                                onSelectData={(dataObject: any, tipe: string) =>
                                                    HandleSelectedData(
                                                        dataObject,
                                                        (tipe = 'header'),
                                                        setSuppSelected,
                                                        setterminSelected,
                                                        setSuppSelectedKode,
                                                        setSelectedKodeTermin,
                                                        setKodePajak,
                                                        setNilaiPajak,
                                                        setSelectedKodeRelasi,
                                                        setModal6,
                                                        setModal5,
                                                        setSelectedOptionPajak
                                                    )
                                                }
                                                handleNamaSupp={handleNamaSupp}
                                                nilaiTotalId={changeNumber}
                                                jenisBarang={jBarang}
                                                vRefreshData={vRefreshData.current}
                                            />
                                            {/* // Modal Supplier yang ada pada Row Detail */}
                                            <SupplierModal
                                                isOpen={modalSuppRow}
                                                onClose={() => setModSuppRow(false)}
                                                userid={userid}
                                                kode_entitas={kode_entitas}
                                                onSelectData={(dataObject: any, tipe: string) =>
                                                    HandleSelectedData(
                                                        dataObject,
                                                        (tipe = 'row'),
                                                        setSuppSelected,
                                                        setterminSelected,
                                                        setSuppSelectedKode,
                                                        setSelectedKodeTermin,
                                                        setKodePajak,
                                                        setNilaiPajak,
                                                        setSelectedKodeRelasi,
                                                        setModal6,
                                                        setModal5,
                                                        setSelectedOptionPajak
                                                    )
                                                }
                                                handleNamaSupp={handleNamaSupp}
                                                nilaiTotalId={changeNumber}
                                                jenisBarang={jBarang}
                                                vRefreshData={vRefreshData.current}
                                            />
                                            <SupplierModal
                                                isOpen={modalSuppDaftarPp}
                                                onClose={() => setModSuppDaftarPp(false)}
                                                userid={userid}
                                                kode_entitas={kode_entitas}
                                                onSelectData={(dataObject: any, tipe: string) =>
                                                    HandleSelectedData(
                                                        dataObject,
                                                        (tipe = 'daftarPP'),
                                                        setSuppSelected,
                                                        setterminSelected,
                                                        setSuppSelectedKode,
                                                        setSelectedKodeTermin,
                                                        setKodePajak,
                                                        setNilaiPajak,
                                                        setSelectedKodeRelasi,
                                                        setModal6,
                                                        setModal5,
                                                        setSelectedOptionPajak
                                                    )
                                                }
                                                handleNamaSupp={handleNamaSupp}
                                                nilaiTotalId={changeNumber}
                                                jenisBarang={jBarang}
                                                vRefreshData={vRefreshData.current}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex">
                                        <input
                                            id="termin bayar"
                                            placeholder="Termin Bayar"
                                            value={terminSelected}
                                            type="text"
                                            className={`mt-1 ltr:rounded-r-none rtl:rounded-l-none ${styles.inputTableBasicSearch}`}
                                            style={{ borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4 }}
                                            onChange={(event) =>
                                                HandleModalChange(
                                                    event.target.value,
                                                    'termin',
                                                    setChangeNumber,
                                                    setHandleNamaSupp,
                                                    setModal1,
                                                    setHandleNamaTermin,
                                                    setModal2,
                                                    setHandleKodeGrup,
                                                    setModal3,
                                                    setHandlePpnAtasNama,
                                                    setModal4
                                                )
                                            }
                                            readOnly={readOnly}
                                            onFocus={(event) => event.target.select()}
                                        />
                                        <div>
                                            <button
                                                className="flex items-center justify-center border border-white-light bg-[#eee] pr-1 font-semibold dark:border-[#17263c] dark:bg-[#1b2e4b] ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0"
                                                onClick={() => {
                                                    console.log('Ikon diklik!');
                                                }}
                                                disabled={readOnly}
                                                style={{ height: 23, marginTop: -4, marginBottom: -4, background: '#dedede', borderColor: '#dedede' }}
                                            >
                                                <FontAwesomeIcon
                                                    icon={faMagnifyingGlass}
                                                    className="ml-2"
                                                    width="15"
                                                    height="15"
                                                    onClick={() =>
                                                        HandleModaliconChange(
                                                            'termin',
                                                            setHandleNamaSupp,
                                                            setModal1,
                                                            setHandleNamaTermin,
                                                            setModal2,
                                                            setHandleKodeGrup,
                                                            setModal3,
                                                            setHandlePpnAtasNama,
                                                            setModal4,
                                                            vRefreshData.current
                                                        )
                                                    }
                                                />
                                            </button>
                                            {/* // Modal Termin yang ada pada Header */}
                                            <TerminModal
                                                isOpen={modal2}
                                                onClose={() => setModal2(false)}
                                                onSelectData={(selectedData: any, selectedNamaTermin: any) =>
                                                    HandleSelectedTermin(selectedData, selectedNamaTermin, setSelectedKodeTermin, setterminSelected)
                                                }
                                                userid={userid}
                                                kode_entitas={kode_entitas}
                                                handleNamaTermin={handleNamaTermin}
                                                nilaiTotalId={changeNumber}
                                            />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table className={styles.table} style={{ marginTop: '5px' }}>
                        <tbody>
                            <tr>
                                <th style={{ width: '10%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Tgl Berlaku PO</th>
                                <th colSpan={2} style={{ width: '60%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>
                                    Alamat Pengiriman
                                </th>
                                <th style={{ width: '10%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}> Cara Pengiriman</th>
                                <th style={{ width: '10%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}> Pajak</th>
                                <th style={{ width: '10%', background: `#adf4f5`, fontWeight: `bold`, color: `black` }}> IDR</th>
                            </tr>

                            <tr>
                                <td style={{ textAlign: 'center' }} onClick={() => handleDatePickerClick('tglBerlaku')}>
                                    {/* <Flatpickr
                                        defaultValue={date2}
                                        options={{
                                            dateFormat: 'd-m-Y',
                                            altInput: true, // Menyembunyikan input asli
                                            altFormat: 'd-m-Y', // Format untuk tampilan alternatif
                                        }}
                                        style={{ width: '20vh', borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}
                                        className={` ${styles.inputTableBasicDate}`}
                                        onChange={(date) => setDate2(date[0])}
                                    /> */}

                                    <DatePicker
                                        renderCustomHeader={({ date, changeYear, changeMonth, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
                                            <div
                                                style={{
                                                    margin: 10,
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center', // Center items vertically
                                                    maxWidth: '240px',
                                                }}
                                            >
                                                <button
                                                    style={{
                                                        padding: '5px 10px',
                                                        fontSize: '12px',
                                                        backgroundColor: '#f0f0f0',
                                                        border: '1px solid #ccc',
                                                        borderRadius: 5,
                                                        marginRight: 10,
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={decreaseMonth}
                                                    disabled={prevMonthButtonDisabled}
                                                >
                                                    {'<'}
                                                </button>
                                                <div style={{ marginRight: 10 }}>
                                                    <select
                                                        value={date.getFullYear()}
                                                        onChange={({ target: { value } }) => changeYear(Number(value))}
                                                        style={{
                                                            padding: '5px 10px',
                                                            fontSize: '12px',
                                                            border: '1px solid #ccc',
                                                            borderRadius: 5,
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        {years.map((option) => (
                                                            <option key={option} value={option}>
                                                                {option}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div style={{ marginRight: 10 }}>
                                                    <select
                                                        value={months[date.getMonth()]}
                                                        onChange={({ target: { value } }) => changeMonth(months.indexOf(value))}
                                                        style={{
                                                            padding: '5px 10px',
                                                            fontSize: '12px',
                                                            border: '1px solid #ccc',
                                                            borderRadius: 5,
                                                            cursor: 'pointer',
                                                            width: 85,
                                                        }}
                                                    >
                                                        {months.map((option) => (
                                                            <option key={option} value={option}>
                                                                {option}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <button
                                                    style={{
                                                        padding: '5px 10px',
                                                        fontSize: '12px',
                                                        backgroundColor: '#f0f0f0',
                                                        border: '1px solid #ccc',
                                                        borderRadius: 5,
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={increaseMonth}
                                                    disabled={nextMonthButtonDisabled}
                                                >
                                                    {'>'}
                                                </button>
                                            </div>
                                        )}
                                        className={`${styles['custom-datepicker']} ${styles['cust-datepicker']}`}
                                        // isClearable={true}
                                        selected={date2}
                                        onChange={(date) => handleTgl(date, 'tglBerlaku')}
                                        onChangeRaw={handleManualInput} // Digunakan untuk input manual
                                        onKeyDown={(e) => handleKeyPress(e, date2, 'tglBerlaku', selectedDate2)}
                                        onBlur={() => handleBlur(date2, 'tglBerlaku', selectedDate2)}
                                        dateFormat="dd-MM-YYYY"
                                        value={date2}
                                        placeholderText="Klik Tanggal Berlaku PO"
                                        disabled={readOnly}
                                        // onClick={handleDatePickerClick}
                                        // onSelect={(date) => handleTgl(date, 'tglBerlaku')}
                                    />
                                </td>
                                <td rowSpan={4} colSpan={2}>
                                    <div className="flex justify-between">
                                        <textarea
                                            style={{ borderRadius: 4, marginTop: -1, marginBottom: -1, height: 80 }}
                                            id="alamat"
                                            // defaultValue={alamatPengiriman}
                                            rows={3}
                                            className="bg-gray block w-full text-sm text-gray-800 outline-0"
                                            placeholder="Masukan Alamat Pengiriman..."
                                            onChange={(event) => HandleAlamatPengiriman(event.target.value, setAlamatPengiriman)}
                                            required
                                            onFocus={(event) => event.target.select()}
                                            readOnly={readOnly}
                                        ></textarea>
                                    </div>
                                </td>
                                <td>
                                    <select
                                        style={{ width: '17vh', border: 'none', color: 'black', borderRadius: 4 }}
                                        id="caraPesan"
                                        onChange={(e) => setSelectedOptionCaraPengiriman(e.target.value)}
                                        value={selectedOptionCaraPengiriman}
                                        className={`form-select text-white-dark`}
                                        disabled={readOnly}
                                    >
                                        {/* <option value="" disabled hidden>
                                            {'--Silahkan Pilih--'}
                                        </option> */}
                                        {ValueCaraPengiriman.map((option: any, index: number) => (
                                            <option key={index} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <select
                                        style={{ width: '17vh', border: 'none', color: 'black', borderRadius: 4 }}
                                        id="pajak"
                                        // onChange={handlePajakChange}
                                        className={`form-select text-white-dark`}
                                        onChange={handlePajakChange}
                                        value={selectedOptionPajak}
                                        disabled={readOnly}
                                    >
                                        {/* <option value="" disabled hidden>
                                            {'--Silahkan Pilih--'}
                                        </option> */}
                                        {ValuePajak.map((option: any, index: number) => (
                                            <option key={index} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td rowSpan={3}>
                                    <div className="flex" style={{ alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '14px' }}>Kurs </label>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <input
                                                type="text"
                                                placeholder="1.0"
                                                id="Kurs"
                                                defaultValue={kurs}
                                                className={`${styles.inputTableBasic}`}
                                                style={{ width: '10vh', marginBottom: '0.8vh', textAlign: 'right', borderRadius: 4 }}
                                                onChange={(event) => HandleKurs(event.target.value, 'kurs', setKurs, setKursPajak)}
                                                readOnly={readOnly}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex" style={{ alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '14px' }}> Kurs Pajak </label>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <input
                                                type="text"
                                                id="kurs_pajak"
                                                defaultValue={kursPajak}
                                                placeholder="1.0"
                                                className={`${styles.inputTableBasic}`}
                                                style={{ width: '10vh', marginBottom: '0.8vh', textAlign: 'right', borderRadius: 4 }}
                                                onChange={(event) => HandleKurs(event.target.value, 'kurs_pajak', setKurs, setKursPajak)}
                                                readOnly={readOnly}
                                            />
                                        </div>
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <th style={{ background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Tgl. Estimasi Kirim</th>
                                <th style={{ background: `#adf4f5`, fontWeight: `bold`, color: `black` }}>Pemesanan Via</th>
                            </tr>

                            <tr>
                                <td style={{ textAlign: 'center' }} onClick={() => handleDatePickerClick('tglEstimasi')}>
                                    {/* <Flatpickr
                                        value={date3}
                                        className={`${styles.inputTableBasicDate}`}
                                        options={{
                                            dateFormat: 'd-m-Y',
                                        }}
                                        style={{ width: '20vh', borderRadius: 4, height: 23, marginTop: -4, marginBottom: -4, textAlign: 'center' }}
                                        onChange={(date) => setDate3(date[0])}
                                    /> */}
                                    <DatePicker
                                        renderCustomHeader={({ date, changeYear, changeMonth, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
                                            <div
                                                style={{
                                                    margin: 10,
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center', // Center items vertically
                                                    maxWidth: '240px',
                                                }}
                                            >
                                                <button
                                                    style={{
                                                        padding: '5px 10px',
                                                        fontSize: '12px',
                                                        backgroundColor: '#f0f0f0',
                                                        border: '1px solid #ccc',
                                                        borderRadius: 5,
                                                        marginRight: 10,
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={decreaseMonth}
                                                    disabled={prevMonthButtonDisabled}
                                                >
                                                    {'<'}
                                                </button>
                                                <div style={{ marginRight: 10 }}>
                                                    <select
                                                        value={date.getFullYear()}
                                                        onChange={({ target: { value } }) => changeYear(Number(value))}
                                                        style={{
                                                            padding: '5px 10px',
                                                            fontSize: '12px',
                                                            border: '1px solid #ccc',
                                                            borderRadius: 5,
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        {years.map((option) => (
                                                            <option key={option} value={option}>
                                                                {option}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div style={{ marginRight: 10 }}>
                                                    <select
                                                        value={months[date.getMonth()]}
                                                        onChange={({ target: { value } }) => changeMonth(months.indexOf(value))}
                                                        style={{
                                                            padding: '5px 10px',
                                                            fontSize: '12px',
                                                            border: '1px solid #ccc',
                                                            borderRadius: 5,
                                                            cursor: 'pointer',
                                                            width: 85,
                                                        }}
                                                    >
                                                        {months.map((option) => (
                                                            <option key={option} value={option}>
                                                                {option}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <button
                                                    style={{
                                                        padding: '5px 10px',
                                                        fontSize: '12px',
                                                        backgroundColor: '#f0f0f0',
                                                        border: '1px solid #ccc',
                                                        borderRadius: 5,
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={increaseMonth}
                                                    disabled={nextMonthButtonDisabled}
                                                >
                                                    {'>'}
                                                </button>
                                            </div>
                                        )}
                                        className={`${styles['custom-datepicker']} ${styles['cust-datepicker']}`}
                                        // isClearable
                                        selected={date3}
                                        onChange={(date) => handleTgl(date, 'tglEstimasi')}
                                        onChangeRaw={handleManualInput} // Digunakan untuk input manual
                                        onKeyDown={(e) => handleKeyPress(e, date3, 'tglEstimasi', selectedDate3)}
                                        // onKeyDown={(e) => handleKeyPress(e, date3, 'tglEstimasi')}
                                        onBlur={() => handleBlur(date3, 'tglEstimasi', selectedDate3)}
                                        dateFormat="dd-MM-YYYY"
                                        value={date3}
                                        placeholderText="Klik Tanggal Estimasi Kirim"
                                        disabled={readOnly}
                                    />
                                </td>
                                <td>
                                    <select
                                        style={{ width: '17vh', border: 'none', color: 'black', borderRadius: 4 }}
                                        id="caraPesan"
                                        onChange={(e) => setSelectedOptionFax(e.target.value)}
                                        value={selectedOptionFax}
                                        className={`form-select text-white-dark`}
                                        disabled={readOnly}
                                    >
                                        {/* <option value="" disabled hidden>
                                            {'--Silahkan Pilih--'}
                                        </option> */}
                                        {ValueFax.map((option: any, index: number) => (
                                            <option key={index} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <hr style={{ borderColor: '#958d8d', borderTopWidth: 2, marginTop: 40, marginBottom: 40 }} />
                <div>
                    <Tabs selectedIndex={routerTipe === 'UpdateFile' ? active : active}>
                        <TabList>
                            <Tab onClick={() => handleTabClick(0, setActive)} style={active === 0 ? { fontWeight: 'bold' } : { fontWeight: 'normal' }}>
                                Data Barang
                            </Tab>
                            <Tab onClick={() => handleTabClick(1, setActive)} style={active === 1 ? { fontWeight: 'bold' } : { fontWeight: 'normal' }}>
                                File Pendukung
                            </Tab>
                        </TabList>
                        <TabPanel>
                            <div className="panel" style={{ background: '#dedede' }}>
                                <div className="grid grid-cols-8 justify-between gap-5 sm:flex">
                                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-1"></div>
                                </div>

                                <div className="mb-1 flex" style={{ marginLeft: '95%' }}>
                                    {/* <button title="Tambah Barang" type="submit" onClick={handleSubmit} style={{ display: 'flex', alignItems: 'center' }}>
                                        <FontAwesomeIcon icon={faCirclePlus} className="shrink-0 ltr:mr-2 rtl:ml-2" width="30" height="30" />
                                    </button>
                                    <button
                                        title="Hapus Barang"
                                        type="submit"
                                        onClick={() => HandleRemoveRows(dataDetail, idRowRemove, setDataDetail, handleSubmit, setButtonDisabled)}
                                        style={{ display: 'flex', alignItems: 'center' }}
                                    >
                                        <FontAwesomeIcon icon={faCircleMinus} className="shrink-0 ltr:mr-2 rtl:ml-2" width="30" height="30" />
                                    </button> */}
                                    {readOnly === true ? null : (
                                        <>
                                            <button title="Tambah Barang" type="submit" onClick={handleSubmit} style={{ display: 'flex', alignItems: 'center' }}>
                                                <FontAwesomeIcon icon={faCirclePlus} className="shrink-0 ltr:mr-2 rtl:ml-2" width="30" height="30" />
                                            </button>
                                            <button
                                                title="Hapus Barang"
                                                type="submit"
                                                onClick={() => HandleRemoveRows(dataDetail, idRowRemove, setDataDetail, handleSubmit, setButtonDisabled)}
                                                style={{ display: 'flex', alignItems: 'center' }}
                                            >
                                                <FontAwesomeIcon icon={faCircleMinus} className="shrink-0 ltr:mr-2 rtl:ml-2" width="30" height="30" />
                                            </button>
                                        </>
                                    )}
                                </div>
                                {jBarang === 'produksi' ? (
                                    <TableBarangProduksi
                                        dataApi={dataDetail}
                                        handleUpdate={handleUpdate}
                                        kode_entitas={kode_entitas}
                                        userid={userid}
                                        handleModalItem={(tipe: any, id: any) =>
                                            HandleModalItem(tipe, id, setRowId, setModalPoGrup, setModalPpnAtasNama, setModSuppRow, suppSelected, setModal6, vRefreshData)
                                        }
                                        handleModalItemChange={handleModalItemChange}
                                        valueDataPajakbyRow={valueDataPajakbyRow}
                                        disabledIconNoSpp={disabledIconNoSpp}
                                        disabledIconNoBarang={disabledIconNoBarang}
                                        disabledIconNamaBarang={disabledIconNamaBarang}
                                        onHandleKirimId={(idRow: any) => HandleKirimIdRemove(idRow, setIdRowRemove)}
                                        dataReadOnly={readOnly}
                                    />
                                ) : (
                                    <TableBarangJadi
                                        dataApi={dataDetail}
                                        handleUpdate={handleUpdate}
                                        kode_entitas={kode_entitas}
                                        userid={userid}
                                        // handleModalItem={handleModalItem}
                                        handleModalItem={(tipe: any, id: any) =>
                                            HandleModalItem(tipe, id, setRowId, setModalPoGrup, setModalPpnAtasNama, setModSuppRow, suppSelected, setModal6, vRefreshData)
                                        }
                                        handleModalHargaItem={(id: any, kode_item: any) => HandleModalHargaItem(id, kode_item, setFilterHargaId, setFilterHargaKodeItem, setModalHarga)}
                                        handleModalItemChange={handleModalItemChange}
                                        valueDataPajakbyRow={valueDataPajakbyRow}
                                        disabledIconNoSpp={disabledIconNoSpp}
                                        disabledIconNoBarang={disabledIconNoBarang}
                                        disabledIconNamaBarang={disabledIconNamaBarang}
                                        onHandleKirimId={(idRow: any) => HandleKirimIdRemove(idRow, setIdRowRemove)}
                                        dataReadOnly={readOnly}
                                    />
                                )}
                                <div className="my-5 flex justify-between">
                                    <div className="flex" style={{ alignItems: 'center' }}>
                                        <span>Total Berat</span>
                                        <span style={{ margin: '0 15px', fontWeight: 'bold', fontSize: 16 }}>{frmNumber(totalBeratVariabel)}</span>
                                        <span>Kg</span>
                                    </div>

                                    <div className="flex">
                                        <span style={{ margin: '0 30px' }}>Sub Total</span>
                                        <span style={{ margin: '0 -5px', fontWeight: 'bold', fontSize: 16 }}>{frmNumber(totalJumlahVariabel)}</span>
                                        <span style={{ margin: '0 0px' }}></span>
                                    </div>
                                </div>
                            </div>
                        </TabPanel>
                        <TabPanel>
                            <Tabs>
                                <TabList>
                                    <Tab onClick={() => handleTabClick1(0, setActive1)} style={active1 === 0 ? { fontWeight: 'bold' } : { fontWeight: 'normal' }}>
                                        Gambar
                                    </Tab>
                                    <Tab onClick={() => handleTabClick1(1, setActive1)} style={active1 === 1 ? { fontWeight: 'bold' } : { fontWeight: 'normal' }}>
                                        Portable Document
                                    </Tab>
                                </TabList>
                                <TabPanel>
                                    <div className="panel">
                                        <div className={styles['grid-containerFilePendukung']} style={{ height: 300 }}>
                                            <div className={styles['grid-left']} style={{ marginTop: 1, backgroundColor: '#eee' }}>
                                                <div className="mt-1">
                                                    <div>
                                                        <Tabs selectedIndex={activeTab} onSelect={(index) => handleTabChange(index, setActiveTab)}>
                                                            <TabList>
                                                                {[...Array(5)].map((_, index) => (
                                                                    <Tab
                                                                        key={index}
                                                                        onClick={() => handleTabClick2(index, setActive2)}
                                                                        style={active2 === index ? { fontWeight: 'bold' } : { fontWeight: 'normal' }}
                                                                    >
                                                                        {index + 1}
                                                                    </Tab>
                                                                ))}
                                                            </TabList>
                                                            {[...Array(5)].map((_, index) => (
                                                                <TabPanel key={index}>
                                                                    {selectedFile === 'baru' ? (
                                                                        loadFilePendukung.find((item) => item.id_dokumen === index + 1) ? (
                                                                            <>
                                                                                {loadFilePendukung.find((item) => item.id_dokumen === index + 1)!.decodeBase64_string && (
                                                                                    <img
                                                                                        src={loadFilePendukung.find((item) => item.id_dokumen === index + 1)!.decodeBase64_string}
                                                                                        alt={`Tab ${index + 1}`}
                                                                                        style={{ maxWidth: '500px', maxHeight: '280px' }}
                                                                                    />
                                                                                )}
                                                                            </>
                                                                        ) : images[index] && images[index][0] ? (
                                                                            <>
                                                                                {/* Log the URL for troubleshooting */}
                                                                                {console.log('URL:', images[index][0])}
                                                                                <img
                                                                                    src={
                                                                                        images[index][0] instanceof ArrayBuffer
                                                                                            ? URL.createObjectURL(new Blob([images[index][0] as ArrayBuffer]))
                                                                                            : (images[index][0] as string)
                                                                                    }
                                                                                    alt={`Tab ${index + 1}`}
                                                                                    style={{ maxWidth: '500px', maxHeight: '280px' }}
                                                                                />
                                                                            </>
                                                                        ) : (
                                                                            <div>Gambar Kosong</div>
                                                                        )
                                                                    ) : images[index] && images[index][0] ? (
                                                                        <>
                                                                            {/* Log the URL for troubleshooting */}
                                                                            {console.log('URL:', images[index][0])}
                                                                            <img
                                                                                src={
                                                                                    images[index][0] instanceof ArrayBuffer
                                                                                        ? URL.createObjectURL(new Blob([images[index][0] as ArrayBuffer]))
                                                                                        : (images[index][0] as string)
                                                                                }
                                                                                alt={`Tab ${index + 1}`}
                                                                                style={{ maxWidth: '500px', maxHeight: '280px' }}
                                                                            />
                                                                        </>
                                                                    ) : loadFilePendukung.find((item) => item.id_dokumen === index + 1) ? (
                                                                        <>
                                                                            {loadFilePendukung.find((item) => item.id_dokumen === index + 1)!.decodeBase64_string && (
                                                                                <img
                                                                                    src={loadFilePendukung.find((item) => item.id_dokumen === index + 1)!.decodeBase64_string}
                                                                                    alt={`Tab ${index + 1}`}
                                                                                    style={{ maxWidth: '500px', maxHeight: '280px' }}
                                                                                />
                                                                            )}
                                                                        </>
                                                                    ) : images[index] && images[index][0] ? (
                                                                        <>
                                                                            {/* Log the URL for troubleshooting */}
                                                                            {console.log('URL:', images[index][0])}
                                                                            <img
                                                                                src={
                                                                                    images[index][0] instanceof ArrayBuffer
                                                                                        ? URL.createObjectURL(new Blob([images[index][0] as ArrayBuffer]))
                                                                                        : (images[index][0] as string)
                                                                                }
                                                                                alt={`Tab ${index + 1}`}
                                                                                style={{ maxWidth: '500px', maxHeight: '280px' }}
                                                                            />
                                                                        </>
                                                                    ) : (
                                                                        <div>Gambar Kosong</div>
                                                                    )}
                                                                </TabPanel>
                                                            ))}
                                                        </Tabs>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={styles['grid-right']}>
                                                <button
                                                    type="submit"
                                                    className="btn btn-gray mb-2 h-[4.5vh]"
                                                    disabled
                                                    onClick={() =>
                                                        handleUpload(
                                                            selectedFiles,
                                                            selectedFile,
                                                            selectedNamaFiles,
                                                            fileGambar,
                                                            kodeSp,
                                                            kode_entitas,
                                                            tipeBersihkangambar,
                                                            selectedBersihkangambar,
                                                            apiUrl,
                                                            setTipeSelectedBersihkangambar,
                                                            setSelectedBersihkangambar,
                                                            setImages,
                                                            setSelectedFiles,
                                                            tipeBersihkanPdf,
                                                            selectedBersihkanPdf,
                                                            setTipeSelectedBersihkanPdf,
                                                            setSelectedBersihkanPdf,
                                                            tipeBersihkanPdf2,
                                                            selectedBersihkanPdf2,
                                                            setTipeSelectedBersihkanPdf2,
                                                            setSelectedBersihkanPdf2
                                                        )
                                                    }
                                                    style={{ backgroundColor: 'gray', color: 'white', width: '14%', height: '13%' }}
                                                >
                                                    Scanner...
                                                </button>
                                                <input
                                                    type="file"
                                                    id={`imageInput${activeTab}`}
                                                    name={`image${activeTab}`}
                                                    accept="image/*"
                                                    style={{ display: 'none' }} // tombol input file disembunyikan
                                                    onChange={(e) => handleFileUpload(e, activeTab, setImages, setSelectedFiles, setNamaFiles, formattedName, selectedFile, fileGambar)} // handler untuk menangani unggah file
                                                    multiple
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-gray mb-2 h-[4.5vh]"
                                                    style={{ backgroundColor: 'gray', color: 'white', width: '14%', height: '13%', marginTop: -7 }}
                                                    onClick={() => handleClick(activeTab, kode_entitas, kodeSp, setSelectedFile, setFileGambar)}
                                                >
                                                    File...
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="btn btn-gray mb-2 h-[4.5vh]"
                                                    style={{ backgroundColor: 'gray', color: 'white', width: '14%', height: '13%', marginTop: -7 }}
                                                    onClick={() =>
                                                        handleBersihkanGambar(
                                                            activeTab,
                                                            loadFilePendukung, // contoh jika Anda memiliki tipe yang diperlukan
                                                            setTipeSelectedBersihkangambar,
                                                            setSelectedBersihkangambar,
                                                            setImages,
                                                            setSelectedFiles,
                                                            setLoadFilePendukung
                                                        )
                                                    }
                                                >
                                                    Bersihkan Gambar...
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="btn btn-gray mb-2 h-[4.5vh]"
                                                    style={{ backgroundColor: 'gray', color: 'white', width: '14%', height: '13%', marginTop: -7 }}
                                                    onClick={() =>
                                                        handleBersihkanGambarSemua(
                                                            activeTab,
                                                            setTipeSelectedBersihkangambar,
                                                            setLoadFilePendukung,
                                                            setSelectedBersihkangambar,
                                                            setImages,
                                                            setSelectedFiles
                                                        )
                                                    }
                                                >
                                                    Bersihkan Semua...
                                                </button>
                                                {/* <button type="submit" className="btn btn-gray mb-2 h-[4.5vh]" style={{ backgroundColor: 'gray', color: 'white', width: '14%', height: '11%', marginTop: -7 }}>
                                            Simpan ke File...
                                        </button> */}
                                                <button
                                                    type="submit"
                                                    className="btn btn-gray mb-2 h-[4.5vh]"
                                                    style={{ backgroundColor: 'gray', color: 'white', width: '14%', height: '13%', marginTop: -7 }}
                                                    onClick={() => handleClickPreview(kodeSp, activeTab, kode_entitas, images, setSelectedImages, setShowPreviewModal, selectedFile)}
                                                >
                                                    <FontAwesomeIcon icon={faCamera} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                                    Preview
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </TabPanel>
                                <TabPanel>
                                    <div className="panel">
                                        <div className={styles['grid-containerFilePendukung']} style={{ height: 300 }}>
                                            <div className={styles['grid-left']} style={{ marginTop: -11, backgroundColor: '#eee' }}>
                                                <div className="mt-1">
                                                    <div style={{ backgroundColor: '#eee' }}>
                                                        <p style={{ fontWeight: 'bold' }}>Portable Document File (PDF) 1 :</p>
                                                        <input
                                                            id={`pdfPreview${activeTabPdf}`}
                                                            // placeholder="PO Grup"
                                                            type="text"
                                                            value={filePendukungPdf1}
                                                            className={`mt-1 ltr:rounded-r-none rtl:rounded-l-none ${styles.inputTableBasicSearch}`}
                                                            disabled
                                                            style={
                                                                filePendukungPdf1 !== ''
                                                                    ? { borderRadius: 4, height: 23, marginTop: 1, marginBottom: 1, border: '1px solid gray', backgroundColor: '#adf4f5' }
                                                                    : { borderRadius: 4, height: 23, marginTop: 1, marginBottom: 1, border: '1px solid gray' }
                                                            }
                                                            // onChange={(event) => handleModalChange(event.target.value, 'poGrup')}
                                                        />
                                                        <input
                                                            type="file"
                                                            id={`pdf${activeTabPdf}`}
                                                            name={`pdf${activeTabPdf}`}
                                                            accept=".pdf"
                                                            style={{ display: 'none' }} // tombol input file disembunyikan
                                                            onChange={(e) =>
                                                                handleFileUploadpdf(
                                                                    e,
                                                                    activeTabPdf,
                                                                    setPdfUrl,
                                                                    setSelectedFiles,
                                                                    setNamaFiles,
                                                                    formattedName,
                                                                    selectedFile,
                                                                    fileGambar,
                                                                    setFilePendukungPdf1
                                                                )
                                                            } // handler untuk menangani unggah file
                                                            multiple
                                                        />
                                                        <div className="my-5 flex justify-between">
                                                            <div className="flex" style={{ width: '100%', marginTop: -20 }}>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-gray mb-2 h-[4.5vh]"
                                                                    style={{ backgroundColor: 'gray', color: 'white', width: '25%', height: '50%', marginTop: 10, marginRight: 10 }}
                                                                    onClick={() => handleClickPdf(activeTabPdf, kode_entitas, kodeSp, setSelectedFile, setFileGambar)}
                                                                >
                                                                    <FontAwesomeIcon icon={faFolderOpen} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                                                    Ambil File
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-gray mb-2 h-[4.5vh]"
                                                                    style={{ backgroundColor: 'gray', color: 'white', width: '25%', height: '50%', marginTop: 10, marginRight: 10 }}
                                                                    // onClick={() => handleClick(activeTab, kode_entitas, kodeSp, setSelectedFile, setFileGambar)}
                                                                    onClick={() =>
                                                                        handleBersihkanPdf(
                                                                            activeTabPdf,
                                                                            loadFilePendukung, // contoh jika Anda memiliki tipe yang diperlukan
                                                                            setTipeSelectedBersihkanPdf,
                                                                            setSelectedBersihkanPdf,
                                                                            setPdfUrl,
                                                                            setSelectedFiles,
                                                                            setLoadFilePendukung,
                                                                            setFilePendukungPdf1
                                                                        )
                                                                    }
                                                                >
                                                                    Hapus File
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-gray mb-2 h-[4.5vh]"
                                                                    style={{ backgroundColor: 'gray', color: 'white', width: '25%', height: '50%', marginTop: 10, marginRight: 10 }}
                                                                    disabled
                                                                    // onClick={() => handleClick(activeTab, kode_entitas, kodeSp, setSelectedFile, setFileGambar)}
                                                                >
                                                                    Simpan ke File
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-gray mb-2 h-[4.5vh]"
                                                                    style={{ backgroundColor: 'gray', color: 'white', width: '25%', height: '50%', marginTop: 10, marginRight: 10 }}
                                                                    onClick={() => handlePreviewPdf(setPreviewPdf)}
                                                                >
                                                                    <FontAwesomeIcon icon={faFilePdf} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                                                    Preview
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <p style={{ fontWeight: 'bold' }}>Portable Document File (PDF) 2 :</p>
                                                        <input
                                                            id={`pdfPreview${activeTabPdf2}`}
                                                            // placeholder="PO Grup"
                                                            type="text"
                                                            value={filePendukungPdf2}
                                                            disabled
                                                            className={`mt-1 ltr:rounded-r-none rtl:rounded-l-none ${styles.inputTableBasicSearch}`}
                                                            style={
                                                                filePendukungPdf2 !== ''
                                                                    ? { borderRadius: 4, height: 23, marginTop: 1, marginBottom: 1, border: '1px solid gray', backgroundColor: '#adf4f5' }
                                                                    : { borderRadius: 4, height: 23, marginTop: 1, marginBottom: 1, border: '1px solid gray' }
                                                            }
                                                            // onChange={(event) => handleModalChange(event.target.value, 'poGrup')}
                                                        />
                                                        <input
                                                            type="file"
                                                            id={`pdf${activeTabPdf2}`}
                                                            name={`pdf${activeTabPdf2}`}
                                                            accept=".pdf"
                                                            style={{ display: 'none' }} // tombol input file disembunyikan
                                                            onChange={(e) =>
                                                                handleFileUploadpdf2(
                                                                    e,
                                                                    activeTabPdf2,
                                                                    setPdfUrl2,
                                                                    setSelectedFiles,
                                                                    setNamaFiles,
                                                                    formattedName,
                                                                    selectedFile,
                                                                    fileGambar,
                                                                    setFilePendukungPdf2
                                                                )
                                                            } // handler untuk menangani unggah file
                                                            multiple
                                                        />
                                                        <div className="my-5 flex justify-between">
                                                            <div className="flex" style={{ width: '100%', marginTop: -20 }}>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-gray mb-2 h-[4.5vh]"
                                                                    style={{ backgroundColor: 'gray', color: 'white', width: '25%', height: '50%', marginTop: 10, marginRight: 10 }}
                                                                    // onClick={() => handleClick(activeTab, kode_entitas, kodeSp, setSelectedFile, setFileGambar)}
                                                                    onClick={() => handleClickPdf2(activeTabPdf2, kode_entitas, kodeSp, setSelectedFile, setFileGambar)}
                                                                >
                                                                    <FontAwesomeIcon icon={faFolderOpen} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                                                    Ambil File
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-gray mb-2 h-[4.5vh]"
                                                                    style={{ backgroundColor: 'gray', color: 'white', width: '25%', height: '50%', marginTop: 10, marginRight: 10 }}
                                                                    onClick={() =>
                                                                        handleBersihkanPdf2(
                                                                            activeTabPdf2,
                                                                            loadFilePendukung, // contoh jika Anda memiliki tipe yang diperlukan
                                                                            setTipeSelectedBersihkanPdf2,
                                                                            setSelectedBersihkanPdf2,
                                                                            setPdfUrl2,
                                                                            setSelectedFiles,
                                                                            setLoadFilePendukung,
                                                                            setFilePendukungPdf2
                                                                        )
                                                                    }
                                                                >
                                                                    Hapus File
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-gray mb-2 h-[4.5vh]"
                                                                    style={{ backgroundColor: 'gray', color: 'white', width: '25%', height: '50%', marginTop: 10, marginRight: 10 }}
                                                                    onClick={() => handleClick(activeTab, kode_entitas, kodeSp, setSelectedFile, setFileGambar)}
                                                                    disabled
                                                                >
                                                                    Simpan ke File
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-gray mb-2 h-[4.5vh]"
                                                                    style={{ backgroundColor: 'gray', color: 'white', width: '25%', height: '50%', marginTop: 10, marginRight: 10 }}
                                                                    onClick={() => handlePreviewPdf2(setPreviewPdf2)}
                                                                >
                                                                    <FontAwesomeIcon icon={faFilePdf} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                                                    Preview
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={styles['grid-right']}></div>
                                        </div>
                                    </div>
                                </TabPanel>
                            </Tabs>
                        </TabPanel>
                    </Tabs>
                </div>
            </div>

            {/* Modal Preview File Pendukung Images */}
            {showPreviewModal &&
                (selectedImages !== '?' ? (
                    <>
                        <Draggable>
                            <div className={`${styles.modalPreviewPictureDragable}`} style={modalPosition}>
                                <div className="overflow-auto">
                                    <div>
                                        <img src={selectedImages} alt={`Tab ${activeTab + 1}`} style={{ maxWidth: '1000px', maxHeight: '500px' }} />
                                    </div>
                                </div>
                                <button
                                    className={`${styles.closeButtonDetailDragable}`}
                                    onClick={() => {
                                        cancelPreview(setShowPreviewModal);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                                </button>
                            </div>
                        </Draggable>
                    </>
                ) : null)}

            {/* Modal Preview File Pendukung untuk PDF 1 */}
            {PreviewPdf && (
                <>
                    <Draggable>
                        <div className={`${styles.modalPreviewPictureDragable}`} style={modalPosition1}>
                            <div className={`${styles.scrollableContent}`} style={{ maxHeight: '700px', overflowY: 'auto' }}>
                                <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
                                    {Array.from(new Array(numPages), (el, index) => (
                                        <Page key={`page_${index + 1}`} pageNumber={index + 1} className={styles.page} />
                                    ))}
                                </Document>
                            </div>
                            <button className={`${styles.closeButtonDetailDragable}`} onClick={() => cancelPreviewPdf(setPreviewPdf)}>
                                <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                            </button>
                        </div>
                    </Draggable>
                </>
            )}

            {/* Modal Preview File Pendukung untuk PDF 2 */}
            {PreviewPdf2 && (
                <>
                    <Draggable>
                        <div className={`${styles.modalPreviewPictureDragable}`} style={modalPosition1}>
                            <div className={`${styles.scrollableContent}`} style={{ maxHeight: '700px', overflowY: 'auto' }}>
                                <Document file={pdfUrl2} onLoadSuccess={onDocumentLoadSuccess}>
                                    {Array.from(new Array(numPages), (el, index) => (
                                        <Page key={`page_${index + 1}`} pageNumber={index + 1} className={styles.page} />
                                    ))}
                                </Document>
                            </div>
                            <button className={`${styles.closeButtonDetailDragable}`} onClick={() => cancelPreviewPdf2(setPreviewPdf2)}>
                                <FontAwesomeIcon icon={faTimes} width="18" height="18" />
                            </button>
                        </div>
                    </Draggable>
                </>
            )}

            <div className="panel mt-3" style={{ background: '#dedede' }}>
                <div className={styles['grid-containerNote1']}>
                    {routerTipe === 'UpdateFile' ? (
                        <div className={styles['grid-leftNote']}></div>
                    ) : (
                        <div className={styles['grid-leftNote']}>
                            <table className={styles.table} style={{ marginTop: '5px' }}>
                                <tbody>
                                    <tr>
                                        <th style={{ width: '10%', background: `#dedede;`, fontWeight: `bold`, color: `black`, textAlign: 'left' }}>PO Grup</th>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div className="flex">
                                                <input
                                                    id="po_group"
                                                    placeholder="PO Grup"
                                                    type="text"
                                                    value={selectedKodePoGrup}
                                                    className={`mt-1 ltr:rounded-r-none rtl:rounded-l-none ${styles.inputTableBasicSearch}`}
                                                    style={{ borderRadius: 4, height: 23, marginTop: 1, marginBottom: 1 }}
                                                    onChange={(event) =>
                                                        HandleModalChange(
                                                            event.target.value,
                                                            'poGrup',
                                                            setChangeNumber,
                                                            setHandleNamaSupp,
                                                            setModal1,
                                                            setHandleNamaTermin,
                                                            setModal2,
                                                            setHandleKodeGrup,
                                                            setModal3,
                                                            setHandlePpnAtasNama,
                                                            setModal4
                                                        )
                                                    }
                                                    onFocus={(event) => event.target.select()}
                                                />
                                                <div>
                                                    <button
                                                        className="flex items-center justify-center border border-white-light bg-[#eee] pr-1 font-semibold dark:border-[#17263c] dark:bg-[#1b2e4b] ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0"
                                                        onClick={() => {
                                                            console.log('Ikon diklik!');
                                                        }}
                                                        style={{ height: 25, marginTop: 0, marginBottom: 1, background: '#dedede', borderColor: '#dedede' }}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faMagnifyingGlass}
                                                            className="ml-2"
                                                            width="15"
                                                            height="15"
                                                            onClick={() =>
                                                                HandleModaliconChange(
                                                                    'poGrup',
                                                                    setHandleNamaSupp,
                                                                    setModal1,
                                                                    setHandleNamaTermin,
                                                                    setModal2,
                                                                    setHandleKodeGrup,
                                                                    setModal3,
                                                                    setHandlePpnAtasNama,
                                                                    setModal4,
                                                                    vRefreshData.current
                                                                )
                                                            }
                                                        />
                                                    </button>
                                                    {/* // Modal Po Grup yang ada pada Footer */}
                                                    <PoGrup
                                                        isOpen={modal3}
                                                        onClose={() => setModal3(false)}
                                                        userid={userid}
                                                        kode_entitas={kode_entitas}
                                                        onSelectData={(selectedData: any) => HandleSelectedPoGrup(selectedData, setSelectedKodePoGrup)}
                                                        handleKodeGrup={handleKodeGrup}
                                                        nilaiTotalId={changeNumber}
                                                    />
                                                    {/* // Modal Po Grup yang ada pada Row Detail */}
                                                    <PoGrup
                                                        isOpen={modalPoGrup}
                                                        onClose={() => setModalPoGrup(false)}
                                                        userid={userid}
                                                        kode_entitas={kode_entitas}
                                                        onSelectData={(selectedData: any) => HandlePoGrup(selectedData, setSelectedKodePoGrup, setDataDetail, rowid)}
                                                        handleKodeGrup={handleKodeGrup}
                                                        nilaiTotalId={changeNumber}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>

                                    <tr>
                                        <th style={{ background: `#dedede`, fontWeight: `bold`, color: `black`, textAlign: 'left' }}>PPN Atas Nama</th>
                                    </tr>

                                    <tr>
                                        <td>
                                            <div className="flex">
                                                <input
                                                    id="ppn_atas_nama"
                                                    placeholder="PPN Atas Nama"
                                                    type="text"
                                                    value={selectedNamaCabangPpnAtasNama}
                                                    className={`mt-1 ltr:rounded-r-none rtl:rounded-l-none ${styles.inputTableBasicSearch}`}
                                                    style={{ borderRadius: 4, height: 23, marginTop: 1, marginBottom: 1 }}
                                                    onChange={(event) =>
                                                        HandleModalChange(
                                                            event.target.value,
                                                            'ppnAtasNama',
                                                            setChangeNumber,
                                                            setHandleNamaSupp,
                                                            setModal1,
                                                            setHandleNamaTermin,
                                                            setModal2,
                                                            setHandleKodeGrup,
                                                            setModal3,
                                                            setHandlePpnAtasNama,
                                                            setModal4
                                                        )
                                                    }
                                                    onFocus={(event) => event.target.select()}
                                                />
                                                <div>
                                                    <button
                                                        className="flex items-center justify-center border border-white-light bg-[#eee] pr-1 font-semibold dark:border-[#17263c] dark:bg-[#1b2e4b] ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0"
                                                        onClick={() => {
                                                            console.log('Ikon diklik!');
                                                        }}
                                                        style={{ height: 25, marginTop: 0, marginBottom: 1, background: '#dedede', borderColor: '#dedede' }}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faMagnifyingGlass}
                                                            className="ml-2"
                                                            width="15"
                                                            height="15"
                                                            onClick={() =>
                                                                HandleModaliconChange(
                                                                    'ppnAtasNama',
                                                                    setHandleNamaSupp,
                                                                    setModal1,
                                                                    setHandleNamaTermin,
                                                                    setModal2,
                                                                    setHandleKodeGrup,
                                                                    setModal3,
                                                                    setHandlePpnAtasNama,
                                                                    setModal4,
                                                                    vRefreshData.current
                                                                )
                                                            }
                                                        />
                                                    </button>
                                                    {/* // Modal PPN Atas Nama yang ada pada Footer */}
                                                    <PpnAtasNama
                                                        isOpen={modal4}
                                                        onClose={() => setModal4(false)}
                                                        userid={userid}
                                                        kode_entitas={kode_entitas}
                                                        onSelectData={(selectedData: any, nama_cabang: any) =>
                                                            HandleSelectedPpnAtasNama(selectedData, nama_cabang, setSelectedKodePpnAtasNama, setSelectedNamaCabangPpnAtasNama)
                                                        }
                                                        handlePpnAtasNama={handlePpnAtas_Nama}
                                                        nilaiTotalId={changeNumber}
                                                    />
                                                    {/* // Modal PPN Atas Nama yang ada pada Row Detail */}
                                                    <PpnAtasNama
                                                        isOpen={modalPpnAtasNama}
                                                        onClose={() => setModalPpnAtasNama(false)}
                                                        userid={userid}
                                                        kode_entitas={kode_entitas}
                                                        onSelectData={(selectedData: any, nama_cabang: any) =>
                                                            HandlePpnAtasNama(selectedData, nama_cabang, setSelectedKodePpnAtasNama, setDataDetail, rowid)
                                                        }
                                                        handlePpnAtasNama={handlePpnAtas_Nama}
                                                        nilaiTotalId={changeNumber}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex" style={{ marginTop: 15 }}>
                                                <button
                                                    type="submit"
                                                    className="btn btn-secondary mr-1"
                                                    style={{ height: 25, background: '#5c5a5a', borderColor: '#5c5a5a' }}
                                                    onClick={handleTerapkanSemuaClick}
                                                >
                                                    <FontAwesomeIcon icon={faPlay} className="shrink-0 ltr:mr-2 rtl:ml-2" width="17" height="17" />
                                                    Terapkan Semua
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className={styles['grid-leftNote']}>
                        <div>
                            <div className={styles['grid-containerCatatan']}>
                                <div className={styles['grid-leftCatatan']}>
                                    <label htmlFor="catatan">Catatan:</label>
                                </div>
                                <div className={styles['grid-rightCatatan']}>
                                    <label htmlFor="catatan">
                                        {/* <input disabled={true} type="checkbox" className="form-checkbox" onChange={(event) => HandleKirimLangusng(event.target.checked, setKirimLangsung)} /> */}
                                        <input
                                            // disabled={true}
                                            readOnly
                                            type="checkbox"
                                            checked={kirimLangsung === 'Y'}
                                            className="form-checkbox text-blue-600"
                                            onChange={(event) => HandleKirimLangusng(event.target.checked, setKirimLangsung)}
                                        />
                                        <span style={{ backgroundColor: '#86f9e2' }}>Barang dikirim ke customer (Kirim Langsung)</span>
                                    </label>
                                </div>
                            </div>
                            <form>
                                <div className="mb-4 w-full rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600">
                                    <div className="rounded-b-lg bg-white px-4 py-2 dark:bg-gray-800">
                                        <label className="sr-only">Publish post</label>
                                        <textarea
                                            id="catatan"
                                            onChange={(event) => HandleCatatan(event.target.value, setCatatan)}
                                            rows={3}
                                            className=" form-input block w-full border-0 bg-white px-0 text-sm text-gray-800 outline-0 focus:ring-0 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                                            placeholder=""
                                            required
                                            style={{ height: 100 }}
                                            onFocus={(event) => event.target.select()}
                                            disabled={readOnly}
                                        ></textarea>
                                    </div>
                                </div>
                            </form>
                        </div>
                        {/* <p className="mt-3">Terbilang:</p>
                        <p className="text-green-500">Nol</p> */}
                    </div>
                    <div className={styles['grid-rightNote']}>
                        <div className=" flex justify-between">
                            <div className="flex" style={{ alignItems: 'center' }}>
                                <label className="mt-1">Diskon(%)</label>
                                <input
                                    disabled={readOnly}
                                    placeholder="%"
                                    type="text"
                                    id="diskon"
                                    className="form-input ml-3 mr-1 md:mb-0 md:w-auto"
                                    style={{ width: '7vh', height: '3.2vh' }}
                                    onBlur={(event) => handleDiskonHeaderChange(event.target.value, 'diskon')}
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
                                    // defaultValue={isNaN(diskonHeader) ? '' : frmNumber(diskonHeader)}
                                    onFocus={(event) => event.target.select()}
                                />
                                =
                                <input
                                    disabled={readOnly}
                                    placeholder="Diskon.."
                                    type="text"
                                    id="diskonResult"
                                    className="form-input ml-1 md:w-auto"
                                    style={{ width: '20vh', height: '3.2vh', textAlign: 'right', fontSize: 16 }}
                                    onBlur={(event) => handleDiskonHeaderChange(event.target.value, 'nilaiDiskon')}
                                    // defaultValue={isNaN(nilaiDiskonHeader) ? '' : frmNumber(nilaiDiskonHeader)}
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
                            </div>
                        </div>
                        {/* <text>DPP</text> */}
                        <div className="flex" style={{ alignItems: 'center' }}>
                            <label className="mt-1" style={{ width: 212 }}>
                                DPP:
                            </label>
                            <label className="mt-1" style={{ width: 177, fontWeight: 'bold', fontSize: 16, textAlign: 'right' }}>
                                {frmNumber(valueNilaiDpp)}
                            </label>
                            {/* <input type="text" id="estimasiBiaya" placeholder="Estimasi.." className="form-input ml-2" style={{ width: '19vh', height: '3.2vh' }} disabled /> */}
                        </div>
                        <div className="flex" style={{ alignItems: 'center' }}>
                            <label className="mt-1" style={{ width: 212 }}>
                                Pajak:
                            </label>
                            <label className="mt-1" style={{ width: 177, fontWeight: 'bold', fontSize: 16, textAlign: 'right' }}>
                                {frmNumber(totalNilaiPajakVariabel)}
                            </label>
                            {/* <input type="text" id="estimasiBiaya" placeholder="Estimasi.." className="form-input ml-2" style={{ width: '19vh', height: '3.2vh' }} disabled /> */}
                        </div>
                        <div className="flex" style={{ alignItems: 'center' }}>
                            <label className="mt-1">Estimasi Biaya Kirim</label>
                            {/* <button type="button" className="btn btn-success ml-2" style={{ width: '3vh', height: '3.2vh' }}></button> */}
                            <input
                                disabled={readOnly}
                                type="text"
                                id="estimasiBiayaKirim"
                                placeholder="Estimasi.."
                                onChange={(event) =>
                                    HandleEstBiayaKirim(
                                        event.target.value,
                                        dataDetail,
                                        totalJumlahSetelahPajakKirim,
                                        setTotalJumlahSetelahPajakVariabel,
                                        setNilaiBiayaKirim,
                                        totalJumlahSetelahPajakFilter,
                                        nilaiDiskonHeader
                                    )
                                }
                                onBlur={(event) => {
                                    const estBiayaKirim = document.getElementById('estimasiBiayaKirim') as HTMLInputElement;
                                    if (estBiayaKirim) {
                                        estBiayaKirim.value = frmNumber(nilaiBiayaKirim);
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
                        </div>
                        <div className="mt-3 h-2 border-t-2 border-gray-300"></div>
                        <div className="flex" style={{ alignItems: 'center' }}>
                            <label className="mt-1" style={{ width: 212 }}>
                                Total Setelah Pajak:
                            </label>
                            <label className="mt-1" style={{ width: 177, fontWeight: 'bold', fontSize: 16, textAlign: 'right', color: 'red' }}>
                                {frmNumber(totalJumlahSetelahPajakVariabel)}
                            </label>
                            {/* <input type="text" id="estimasiBiaya" placeholder="Estimasi.." className="form-input ml-2" style={{ width: '19vh', height: '3.2vh' }} disabled /> */}
                        </div>
                        <div className="flex" style={{ alignItems: 'center' }}>
                            <label className="mt-1" style={{ width: 173 }}></label>
                            <label className="mt-1" style={{ width: 177, fontWeight: 'bold', fontSize: 16, textAlign: 'right', color: 'blue' }}>
                                {valueStringPajak}
                            </label>
                            {/* <input type="text" id="estimasiBiaya" placeholder="Estimasi.." className="form-input ml-2" style={{ width: '19vh', height: '3.2vh' }} disabled /> */}
                        </div>
                    </div>
                </div>
            </div>
            <div className="my-5 flex justify-between">
                <div className="flex">
                    {/* <button type="submit" className="btn btn-secondary mr-1" style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }}>
                        <FontAwesomeIcon icon={faPlay} className="shrink-0 ltr:mr-2 rtl:ml-2" width="17" height="17" />
                        Lanjut
                    </button> */}
                    {routerTipe === 'batal' ? (
                        ''
                    ) : statusDok === 'Tertutup' ? (
                        <>
                            {routerTipe === 'UpdateFile' ? (
                                <button type="submit" className="btn btn-secondary mr-1" onClick={saveDoc} style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }}>
                                    <FontAwesomeIcon icon={faSave} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                    Simpan
                                </button>
                            ) : (
                                ''
                            )}
                        </>
                    ) : approvalAudit === 'Y' ? (
                        <>
                            {routerTipe === 'UpdateFile' ? (
                                <button type="submit" className="btn btn-secondary mr-1" onClick={saveDoc} style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }}>
                                    <FontAwesomeIcon icon={faSave} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                    Simpan
                                </button>
                            ) : (
                                ''
                            )}
                        </>
                    ) : (
                        <>
                            {routerTipe === 'App' ? (
                                <button type="submit" className="btn btn-secondary mr-1" onClick={saveDoc} style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }}>
                                    {routerTipe === 'App' ? '' : <FontAwesomeIcon icon={faSave} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />}
                                    {routerTipe === 'App' ? 'Disetujui' : 'Simpan'}
                                </button>
                            ) : (
                                <button type="submit" className="btn btn-secondary mr-1" onClick={saveDoc} style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }}>
                                    <FontAwesomeIcon icon={faSave} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                    Simpan
                                </button>
                            )}
                        </>
                    )}

                    {statusDok === 'Tertutup' ? (
                        ''
                    ) : (
                        <>
                            {routerTipe === 'App' ? (
                                <button onClick={() => appDoc(routerTipe, 'koreksi')} type="submit" className="btn btn-secondary mr-1" style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }}>
                                    {routerTipe === 'App' ? '' : <FontAwesomeIcon icon={faCancel} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />}
                                    Koreksi
                                </button>
                            ) : (
                                ''
                            )}
                            {routerTipe === 'App' ? (
                                <button onClick={() => appDoc(routerTipe, 'ditolak')} type="submit" className="btn btn-secondary mr-1" style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }}>
                                    {routerTipe === 'App' ? '' : <FontAwesomeIcon icon={faCancel} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />}
                                    Ditolak
                                </button>
                            ) : (
                                ''
                            )}
                        </>
                    )}

                    {routerTipe === 'batal' ? (
                        <button onClick={() => appDoc(routerTipe, 'dibatalkan')} type="submit" className="btn btn-secondary mr-1" style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }}>
                            Dibatalkan
                        </button>
                    ) : (
                        ''
                    )}

                    {statusDok === 'Tertutup' || approvalAudit === 'Y' ? (
                        <button onClick={handleBatal} type="submit" className="btn btn-secondary mr-1" style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }}>
                            <FontAwesomeIcon icon={faCancel} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                            Tutup
                        </button>
                    ) : (
                        <button onClick={handleBatal} type="submit" className="btn btn-secondary mr-1" style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }}>
                            <FontAwesomeIcon icon={faCancel} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                            Batal
                        </button>
                    )}
                    {/* <button type="submit" className="btn btn-secondary mr-1" style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }}>
                        <FontAwesomeIcon icon={faPrint} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                        Cetak
                    </button> */}
                </div>

                <div className="flex">
                    {/* <button type="submit" className="btn btn-secondary mr-1" style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }}>
                        <FontAwesomeIcon icon={faTrash} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                        Hapus
                    </button> */}
                    {routerTipe === 'batal' ? (
                        ''
                    ) : statusDok === 'Tertutup' ? (
                        ''
                    ) : approvalAudit === 'Y' ? (
                        ''
                    ) : (
                        <>
                            {routerTipe === 'App' ? (
                                ''
                            ) : (
                                <>
                                    <button
                                        type="submit"
                                        className="btn btn-secondary mr-1"
                                        style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }}
                                        onClick={() =>
                                            HandleRemoveAllRows(
                                                dataDetail,
                                                setDisabledIconNoSpp,
                                                setDisabledIconNoBarang,
                                                setDisabledIconNamaBarang,
                                                setTotalBeratVariabel,
                                                setTotalJumlahVariabel,
                                                setTotalJumlahSetelahPajakVariabel,
                                                setTotalJumlahSetelahPajakFilter,
                                                setValueNilaiDpp,
                                                setValueNilaiDppFilter,
                                                setTotalNilaiPajakVariabel,
                                                setDataDetail,
                                                handleSubmit,
                                                setButtonDisabled
                                            )
                                        }
                                        disabled={readOnly}
                                    >
                                        <FontAwesomeIcon icon={faBackward} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                        Bersihkan
                                    </button>
                                    <button
                                        disabled={buttonDisabled}
                                        type="submit"
                                        className="btn btn-secondary mr-1"
                                        style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }}
                                        onClick={() => HandleDaftarPpFilter(suppSelected, setModal5, setModSuppDaftarPp, vRefreshData)}
                                    >
                                        <FontAwesomeIcon icon={faFileArchive} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                                        Daftar PP
                                    </button>
                                    {/* <button disabled={true} type="submit" className="btn btn-secondary mr-1" style={{ background: '#5c5a5a', borderColor: '#5c5a5a' }}>
                        <FontAwesomeIcon icon={faList} className="shrink-0 ltr:mr-2 rtl:ml-2" width="18" height="18" />
                        Info Supplier
                    </button> */}
                                </>
                            )}
                        </>
                    )}

                    <DaftarPp
                        isOpen={modal5}
                        onClose={() => setModal5(false)}
                        produksi={jBarang === 'produksi' ? 'Y' : 'N'}
                        kode_entitas={kode_entitas}
                        onSelectData={(dataObject: any) => handleDaftarPp(dataObject)}
                        jenisBarang={jBarang}
                        vRefreshData={vRefreshData.current}
                    />
                    <DaftarPpItem
                        isOpen={modal6}
                        onClose={() => setModal6(false)}
                        produksi={jBarang === 'produksi' ? 'Y' : 'N'}
                        kode_entitas={kode_entitas}
                        onSelectData={(dataObject: any) => handleDaftarPpItem(dataObject)}
                        valueNoBarang={nilaiValueNoBarang}
                        tipeValue={tipeValue}
                        valueNamaBarang={nilaiValueNamaBarang}
                        valueNoPp={nilaiValueNoPp}
                        nilaiTotalId={totalNum}
                        jenisBarang={jBarang}
                        vRefreshData={vRefreshData.current}
                    />
                </div>
            </div>
            <DaftarHargaBarangJadi
                isOpen={ModalHarga}
                onClose={() => setModalHarga(false)}
                produksi={jBarang === 'produksi' ? 'Y' : 'N'}
                kode_item={filterHargaKodeItem}
                idFilterHarga={filterHargaId}
                kode_entitas={kode_entitas}
                onSelectData={(dataObject: any) =>
                    HandleHargaItemBarangJadi(
                        dataObject,
                        setDataDetail,
                        setTotalJumlahVariabel,
                        setTotalJumlahSetelahPajakVariabel,
                        setTotalJumlahSetelahPajakFilter,
                        setTotalJumlahSetelahPajakKirim,
                        selectedOptionPajak,
                        setValueNilaiDpp,
                        setValueNilaiDppFilter,
                        setValueStringPajak,
                        valueNilaiDpp
                    )
                }
            />
        </div>
    );
};

export default spp;
