import { Internationalization, loadCldr, L10n, enableRipple, getValue } from '@syncfusion/ej2-base';
import { frmNumber, tanpaKoma, GetInfo, fetchPreferensi } from '@/utils/routines';
import { GetListDetailRpe } from '../model/apiRpe';
import moment from 'moment';
import React from 'react';

const fungsiFormRpe = () => {
    return <div>fungsiFormRpe</div>;
};

export default fungsiFormRpe;

interface HandleChangeParamsObjectTemplateHeader {
    valueObject: any;
    kode_entitas: string;
    setStateDataHeader: React.Dispatch<React.SetStateAction<any>>;
    token: string;
    setDataBarang: React.Dispatch<React.SetStateAction<any>>;
    masterKodeDokumen: any;
    setStateDataFooter: React.Dispatch<React.SetStateAction<any>>;
    userid: any;
    entitas: any;
    onRenderDayCell: any;
    stateDataHeader: any;
    masterDataState: any;
    stateDataFooter: any;
    dataBarang: any;
}

const HandleNoRpeInputChange = (event: string, setStateFilteredData: Function) => {
    const newValue = event;
    setStateFilteredData((prevState: any) => ({
        ...prevState,
        noRpeValue: newValue,
        isNoRpeChecked: newValue.length > 0,
    }));
};

const HandleTgl = async (date: any, tipe: string, setStateFilteredData: Function) => {
    if (tipe === 'tanggalAwal') {
        setStateFilteredData((prevState: any) => ({
            ...prevState,
            date1: moment(date),
            isTanggalChecked: true,
        }));
    } else {
        setStateFilteredData((prevState: any) => ({
            ...prevState,
            date2: moment(date),
            isTanggalChecked: true,
        }));
    }
};

const HandleNamaEkspedisiInputChange = (event: string, setStateFilteredData: Function) => {
    const newValue = event;
    setStateFilteredData((prevState: any) => ({
        ...prevState,
        namaEkspedisiValue: newValue,
        isNamaEkspedisiChecked: newValue.length > 0,
    }));
};

const HandleNoFakturEksInputChange = (event: string, setStateFilteredData: Function) => {
    const newValue = event;
    setStateFilteredData((prevState: any) => ({
        ...prevState,
        noFakturEksValue: newValue,
        isNoFakturEksChecked: newValue.length > 0,
    }));
};

const HandleStatusApproval = (event: any, setStateFilteredData: Function) => {
    console.log('event = ', event);
    setStateFilteredData((prevState: any) => ({
        ...prevState,
        selectedOptionStatusApproval: event,
    }));
};

//==================================================================================================
// Fungsi Untuk mencari Data List berdasarkan no RPE
const PencarianNoRpe = async (event: string, tipe: string, setStateFilteredData: Function, setFilteredData: Function, recordsData: any[]) => {
    if (tipe === 'noRpe') {
        const searchValue = event;
        setStateFilteredData((prevState: any) => ({
            ...prevState,
            searchNoRpe: searchValue,
        }));

        const filteredData = searchDataNoRpe(searchValue, recordsData);
        setFilteredData(filteredData);

        const cariBayar = document.getElementById('cariBayar') as HTMLInputElement;
        if (cariBayar) {
            cariBayar.value = '';
        }
    } else {
        const searchValue = event;
        setStateFilteredData((prevState: any) => ({
            ...prevState,
            searchBayarMu: searchValue,
        }));

        const filteredData = searchDataBayar(searchValue, recordsData);
        setFilteredData(filteredData);

        const cariNoRpe = document.getElementById('cariNoRpe') as HTMLInputElement;
        if (cariNoRpe) {
            cariNoRpe.value = '';
        }
    }
};

const searchDataNoRpe = (keyword: any, recordsData: any[]) => {
    // Jika keyword kosong, kembalikan semua data
    console.log(keyword);
    if (keyword === '') {
        return recordsData;
    } else {
        // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
        const filteredData = recordsData.filter((item) => item.no_rpe.toLowerCase().startsWith(keyword.toLowerCase()));
        return filteredData;
    }
};

const searchDataBayar = (keyword: any, recordsData: any[]) => {
    // Jika keyword kosong, kembalikan semua data
    console.log(keyword);
    if (keyword === '') {
        return recordsData;
    } else {
        // Lakukan pencarian di sini, misalnya dengan filter data berdasarkan kata kunci
        const filteredData = recordsData.filter((item) => item.bayar_mu.toLowerCase().startsWith(keyword.toLowerCase()));
        return filteredData;
    }
};
// END
//==================================================================================================

//==================================================================================================
// Fungsi Untuk Menampilkan detail dan dropdown Nama Ekspedisi
const HandleNamaEkspedisiChange = async (params: HandleChangeParamsObjectTemplateHeader) => {
    console.log('nilai Value = ', params.masterDataState, params.valueObject, params.stateDataHeader, params.stateDataHeader?.kodeRpe);
    const paramObject = {
        kode_entitas: params.kode_entitas,
        kode_rpe: params.stateDataHeader.kodeRpe === '' ? 'NAME' : params.stateDataHeader.kodeRpe,
        nama_ekspedisi: params.valueObject,
        token: params.token,
    };
    const responseListDetailRpe = await GetListDetailRpe(paramObject);
    console.log('paramObject = ', paramObject);
    console.log('responseListDetailRpe = ', responseListDetailRpe, paramObject);
    let disableButtonBayar = false;
    if (responseListDetailRpe.length >= 1) {
        disableButtonBayar = false;
    } else {
        disableButtonBayar = true;
    }
    let id = 1;
    Promise.all(
        responseListDetailRpe.map((item: any) => {
            return {
                id: id++,
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
                nama_gudang: item.nama_gudang,
                nama_tujuan: item.nama_tujuan,
                byr: item.byr,
                nilai_pph: parseFloat(item.nilai_pph),
                jenis_kirim: item.jenis_kirim,
                jenis_mobil: item.jenis_mobil,
                ket_klaim_eks: item.ket_klaim_eks,
                // tambahan_jarak: 0,
                tambahan_jarak: parseFloat(item.harga_tambahan),
                // idChecked: 0,
                idChecked: item.id_rpe,
            };
        })
    ).then((newData) => {
        params.setDataBarang((state: any) => {
            const existingNodes = state.nodes.filter((node: any) => node.kode_fbm === params.masterKodeDokumen);
            const newNodes = [...existingNodes, ...newData.filter((data: any) => data !== null)];
            return { ...state, nodes: newNodes }; // Memperbarui nodes dengan data yang diperbarui
        });
    });
    params.setStateDataHeader((prevState: any) => ({
        ...prevState,
        namaEkspedisi: params.valueObject,
        disabledBayarAllInvoice: disableButtonBayar,
    }));

    const newNodesDetail = responseListDetailRpe.filter((item: any) => item.byr === 'Y');
    const nodeDetail = await newNodesDetail.map((node: any) => {
        return {
            ...node,
            idChecked: node.total_rp,
        };
    });

    let totNettoRp: any;
    let beratTotal: any;
    let beratKlaim: any;
    let tambahanJarak: any;
    let totalKlaimEkspedisi: any;

    totNettoRp = nodeDetail.reduce((acc: number, node: any) => {
        if (node.idChecked > 0) {
            // return acc + parseFloat(node.netto_rp);
            return acc + parseFloat(node.total_rp);
        }
        return acc;
    }, 0);
    beratTotal = nodeDetail.reduce((acc: number, node: any) => {
        if (node.idChecked > 0) {
            return acc + parseFloat(node.total_berat);
        }
        return acc;
    }, 0);
    beratKlaim = nodeDetail.reduce((acc: number, node: any) => {
        if (node.idChecked > 0) {
            return acc + parseFloat(node.total_berat_ekspedisi);
        }
        return acc;
    }, 0);

    tambahanJarak = nodeDetail.reduce((acc: number, node: any) => {
        if (node.idChecked > 0) {
            return acc + parseFloat(node.harga_tambahan);
        }
        return acc;
    }, 0);

    totalKlaimEkspedisi = nodeDetail.reduce((acc: number, node: any) => {
        if (node.idChecked > 0) {
            return acc + parseFloat(node.total_klaim_ekspedisi);
        }
        return acc;
    }, 0);

    console.log('nodeDetail = ', nodeDetail);
    // const total_tagihan = params.stateDataFooter.biayaLainLain > 0 ? params.stateDataFooter.biayaLainLain : 0;
    // const nominal_invoice = params.stateDataFooter.nominalInvoice > 0 ? params.stateDataFooter.nominalInvoice : 0;
    // const total_bayar = params.stateDataHeader.nominalInvoice > 0 ? (total_tagihan > params.stateDataHeader.nominalInvoice ? params.stateDataHeader.nominalInvoice : total_tagihan) : 0;
    // const nilai_pph23 = total_bayar > 0 ? (total_bayar * params.stateDataHeader.nilaiPph23) / 100 : 0;
    // const potongan_ekspedisi = params.stateDataFooter.potonganEkspedisiLain > 0 ? parseFloat(params.stateDataFooter.potonganEkspedisiLain) : 0;

    const total_tagihan = totNettoRp + tambahanJarak + parseFloat(params.stateDataFooter.biayaLainLain);
    const total_bayar = params.stateDataHeader.nominalInvoice > 0 ? (total_tagihan > params.stateDataHeader.nominalInvoice ? params.stateDataHeader.nominalInvoice : total_tagihan) : 0;
    const nilai_pph23 = total_bayar > 0 ? (total_bayar * params.stateDataHeader.nilaiPph23) / 100 : 0;
    const potongan_ekspedisi = params.stateDataFooter.potonganEkspedisiLain > 0 ? parseFloat(params.stateDataFooter.potonganEkspedisiLain) : 0;

    // params.setStateDataFooter((prevState: any) => ({
    //     ...prevState,
    //     subTotal: 0,
    //     tambahanJarak: 0,
    //     totalTagihan: total_tagihan,
    //     nominalInvoice: nominal_invoice,
    //     totalBayar: total_bayar,
    //     totalKlaimEkspedisiFbm: 0,
    //     nilaiPph23: 0,
    //     totalPembayaran: total_bayar - params.stateDataFooter.nilaiPph23 - params.stateDataFooter.potonganEkspedisiLain,
    //     beratTotal: 0,
    //     beratKlaim: 0,
    // }));

    console.log('params.setStateDataFooter = ', totNettoRp, beratTotal, beratKlaim, tambahanJarak, totalKlaimEkspedisi);

    params.setStateDataFooter((prevState: any) => ({
        ...prevState,
        subTotal: totNettoRp,
        totalTagihan: total_tagihan,
        nominalInvoice: params.stateDataHeader.nominalInvoice,
        totalBayar: total_tagihan > params.stateDataHeader.nominalInvoice ? params.stateDataHeader.nominalInvoice : total_tagihan,
        totalKlaimEkspedisiFbm: totalKlaimEkspedisi,
        potonganEkspedisiLain: potongan_ekspedisi,
        nilaiPph23: nilai_pph23,
        totalPembayaran: total_bayar - totalKlaimEkspedisi - potongan_ekspedisi - nilai_pph23,
        beratTotal: beratTotal,
        beratKlaim: beratKlaim,
        tambahanJarak: tambahanJarak,
    }));
};

//END
//==================================================================================================

//==================================================================================================
// Fungsi Untuk Menampilkan dropdown PPH 23
const HandlePph23Change = async (params: HandleChangeParamsObjectTemplateHeader) => {
    console.log('nilai Value pph23 = ', params.valueObject);
    const newNodes = await params.dataBarang.nodes.map((node: any) => {
        return node;
    });

    let totalKlaimEkspedisi: any;

    totalKlaimEkspedisi = newNodes.reduce((acc: number, node: any) => {
        if (node.idChecked > 0) {
            return acc + parseFloat(node.total_klaim_ekspedisi);
        }
        return acc;
    }, 0);

    const total_bayar = params.stateDataFooter.totalBayar > 0 ? params.stateDataFooter.totalBayar : 0;
    const nilai_pph23 = total_bayar > 0 ? (total_bayar * params.valueObject[0].nilai) / 100 : 0;
    const potongan_ekspedisi = params.stateDataFooter.potonganEkspedisiLain > 0 ? parseFloat(params.stateDataFooter.potonganEkspedisiLain) : 0;

    params.setStateDataHeader((prevState: any) => ({
        ...prevState,
        catatanPph23: params.valueObject[0].catatan,
        nilaiPph23: params.valueObject[0].nilai,
        kodepph23: params.valueObject[0].kode_pajak,
    }));

    params.setStateDataFooter((prevState: any) => ({
        ...prevState,
        totalPembayaran: total_bayar - totalKlaimEkspedisi - potongan_ekspedisi - nilai_pph23,
        nilaiPph23: nilai_pph23,
        potonganEkspedisiLain: potongan_ekspedisi,
        totalKlaimEkspedisiFbm: totalKlaimEkspedisi,
    }));

    // await
};

//END
//==================================================================================================

//==================================================================================================
// Fungsi Untuk Menampilkan nilai input faktur Ekspedisi
const HandleFakturEkspedisiInput = (params: HandleChangeParamsObjectTemplateHeader) => {
    console.log('nilai Value Faktur Ekspedisi = ', params.valueObject);
    params.setStateDataHeader((prevState: any) => ({
        ...prevState,
        fakturEkspedisi: params.valueObject,
    }));
};

//END
//==================================================================================================

//==================================================================================================
// Fungsi Untuk Menampilkan nilai input Nominal Invoice
const HandleNominalInvoiceInput = async (params: HandleChangeParamsObjectTemplateHeader) => {
    console.log('params.valueObject 12 = ', params.valueObject);

    const nominalInvoice = document.getElementById('nominalInvoice') as HTMLInputElement;
    if (nominalInvoice) {
        nominalInvoice.value = frmNumber(tanpaKoma(params.valueObject));
    }

    // Fungsi untuk mengonversi karakter pertama menjadi huruf kapital
    const capitalizeFirstLetter = (str: any) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    // Kata yang ingin diubah
    const originalString = Terbilang(params.valueObject === '' || params.valueObject === null || params.valueObject === undefined ? 0 : params.valueObject);

    // Mengonversi karakter pertama menjadi huruf kapital
    const capitalizedString = capitalizeFirstLetter(originalString);

    params.setStateDataHeader((prevState: any) => ({
        ...prevState,
        nominalInvoice: tanpaKoma(params.valueObject),
        terbilangJumlah: capitalizedString,
    }));

    const newNodes = await params.dataBarang.nodes.map((node: any) => {
        return node;
    });

    // let totalKlaimEkspedisi: any;

    let totNettoRp: any;
    let beratTotal: any;
    let beratKlaim: any;
    let tambahanJarak: any;
    let totalKlaimEkspedisi: any;

    totNettoRp = newNodes.reduce((acc: number, node: any) => {
        if (node.idChecked > 0) {
            // return acc + parseFloat(node.netto_rp);
            return acc + parseFloat(node.total_rp);
        }
        return acc;
    }, 0);
    beratTotal = newNodes.reduce((acc: number, node: any) => {
        if (node.idChecked > 0) {
            return acc + parseFloat(node.total_berat);
        }
        return acc;
    }, 0);
    beratKlaim = newNodes.reduce((acc: number, node: any) => {
        if (node.idChecked > 0) {
            return acc + parseFloat(node.total_berat_ekspedisi);
        }
        return acc;
    }, 0);

    tambahanJarak = newNodes.reduce((acc: number, node: any) => {
        if (node.idChecked > 0) {
            return acc + parseFloat(node.tambahan_jarak);
        }
        return acc;
    }, 0);

    totalKlaimEkspedisi = newNodes.reduce((acc: number, node: any) => {
        if (node.idChecked > 0) {
            return acc + parseFloat(node.total_klaim_ekspedisi);
        }
        return acc;
    }, 0);

    console.log('params.valueObject = ', params.valueObject);

    // const total_bayar = params.valueObject > 0 ? (params.stateDataFooter.totalTagihan > params.valueObject ? params.valueObject : params.stateDataFooter.totalTagihan) : 0;
    // const nilai_pph23 = total_bayar > 0 ? (total_bayar * params.stateDataHeader.nilaiPph23) / 100 : 0;
    // const potongan_ekspedisi = params.stateDataFooter.potonganEkspedisiLain > 0 ? parseFloat(params.stateDataFooter.potonganEkspedisiLain) : 0;

    const total_tagihan = totNettoRp + tambahanJarak + parseFloat(params.stateDataFooter.biayaLainLain);
    const total_bayar = parseFloat(tanpaKoma(params.valueObject)) > 0 ? (total_tagihan > parseFloat(tanpaKoma(params.valueObject)) ? parseFloat(tanpaKoma(params.valueObject)) : total_tagihan) : 0;
    const nilai_pph23 = total_bayar > 0 ? (total_bayar * params.stateDataHeader.nilaiPph23) / 100 : 0;
    const potongan_ekspedisi = params.stateDataFooter.potonganEkspedisiLain > 0 ? parseFloat(params.stateDataFooter.potonganEkspedisiLain) : 0;

    params.setStateDataFooter((prevState: any) => ({
        ...prevState,
        // nominalInvoice: tanpaKoma(params.valueObject),
        // totalBayar: total_bayar,
        // totalPembayaran: total_bayar - totalKlaimEkspedisi - potongan_ekspedisi - nilai_pph23,
        // nilaiPph23: nilai_pph23,
        // potonganEkspedisiLain: potongan_ekspedisi,
        // totalKlaimEkspedisiFbm: totalKlaimEkspedisi,

        subTotal: totNettoRp,
        totalTagihan: total_tagihan,
        nominalInvoice: tanpaKoma(params.valueObject),
        totalBayar: total_tagihan > parseFloat(tanpaKoma(params.valueObject)) ? parseFloat(tanpaKoma(params.valueObject)) : total_tagihan,
        totalKlaimEkspedisiFbm: totalKlaimEkspedisi,
        potonganEkspedisiLain: potongan_ekspedisi,
        nilaiPph23: nilai_pph23,
        totalPembayaran: total_bayar - totalKlaimEkspedisi - potongan_ekspedisi - nilai_pph23,
        beratTotal: beratTotal,
        beratKlaim: beratKlaim,
        tambahanJarak: tambahanJarak,
    }));
};

//END
//==================================================================================================

//==================================================================================================
// Fungsi Terbilang nilai
const Terbilang = (a: number): string => {
    var bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
    var kalimat = '';

    if (typeof a === 'number') {
        a = parseFloat(a.toFixed(2));
    } else {
        a = parseFloat(parseFloat(a).toFixed(2));
    }

    var parts = a.toString().split('.');
    var angkaUtama = parseInt(parts[0]);
    var angkaDesimal = parts[1] ? parseFloat('0.' + parts[1]) : 0;

    function angkaKeKata(angka: number): string {
        if (angka === 0) {
            return '';
        }
        if (angka < 12) {
            return bilangan[angka];
        } else if (angka < 20) {
            return bilangan[angka - 10] + ' Belas';
        } else if (angka < 100) {
            var depan = Math.floor(angka / 10);
            var belakang = angka % 10;
            return bilangan[depan] + ' Puluh ' + (belakang > 0 ? bilangan[belakang] : '');
        } else if (angka < 200) {
            return 'Seratus ' + angkaKeKata(angka - 100);
        } else if (angka < 1000) {
            var depan = Math.floor(angka / 100);
            var belakang = angka % 100;
            return bilangan[depan] + ' Ratus ' + angkaKeKata(belakang);
        } else if (angka < 2000) {
            return 'Seribu ' + angkaKeKata(angka - 1000);
        } else if (angka < 1000000) {
            var depan = Math.floor(angka / 1000);
            var belakang = angka % 1000;
            return angkaKeKata(depan) + ' Ribu ' + angkaKeKata(belakang);
        } else if (angka < 1000000000) {
            var depan = Math.floor(angka / 1000000);
            var belakang = angka % 1000000;
            return angkaKeKata(depan) + ' Juta ' + angkaKeKata(belakang);
        } else if (angka < 1000000000000) {
            var depan = Math.floor(angka / 1000000000);
            var belakang = angka % 1000000000;
            return angkaKeKata(depan) + ' Milyar ' + angkaKeKata(belakang);
        } else if (angka < 1000000000000000) {
            var depan = Math.floor(angka / 1000000000000);
            var belakang = angka % 1000000000000;
            return angkaKeKata(depan) + ' Triliun ' + angkaKeKata(belakang);
        }
        return ''; // Untuk angka yang lebih besar
    }

    kalimat = angkaKeKata(angkaUtama);
    if (kalimat === '') {
        kalimat = 'Nol';
    }

    // Tambahkan bagian desimal menjadi sen
    if (angkaDesimal > 0) {
        var sen = Math.round(angkaDesimal * 100); // Konversi desimal menjadi sen
        if (sen > 0) {
            kalimat += ' Koma ' + angkaKeKata(sen) + ' Sen';
        }
    }

    return kalimat.trim();
};
//==================================================================================================

const HandleZoomIn = (setZoomScale: Function) => {
    setZoomScale((prevScale: any) => Math.min(prevScale + 0.1, 3)); // Maksimal zoom 3x
};

const HandleZoomOut = (setZoomScale: Function) => {
    setZoomScale((prevScale: any) => Math.max(prevScale - 0.1, 0.5)); // Minimal zoom 0.5x
};

const HandleCloseZoom = (setStateDataHeader: Function) => {
    setStateDataHeader((prevState: any) => ({
        ...prevState,
        isOpenPreview: false,
    }));
};

// =================================================================================
// Cek Periode Akuntasi
const CekPeriodeAkutansi = async (ets: string, stateDataHeader: any) => {
    try {
        const result = await GetInfo(ets);
        const getInfo = result[0].periode;
        const periode = getInfo;
        const tanggalMomentPeriode = moment(periode, 'YYYYMM');
        const periodeTahunBulan = tanggalMomentPeriode.format('YYYYMM');

        const tglPembanding = moment(stateDataHeader.tglDokumen).format('YYYYMM');

        // Mendapatkan tahun dan bulan dari setiap tanggal
        const yearA = parseInt(periodeTahunBulan.substring(0, 4));
        const monthA = parseInt(periodeTahunBulan.substring(4, 6));

        const yearB = parseInt(tglPembanding.substring(0, 4));
        const monthB = parseInt(tglPembanding.substring(4, 6));

        return { yearA, monthA, yearB, monthB, periode };
    } catch (error) {
        console.error('Error:', error);
        return null; // Kembalikan null jika terjadi kesalahan
    }
};

const CekTglMinusSatu = async (tglDok: any) => {
    // pengecekan tanggal kurang 1 hari dari hari ini
    // Dapatkan tanggal hari ini
    const tglDokumen = moment(tglDok).format('YYYY-MM-DD');
    const today = new Date();

    // Kurangi 1 hari dari tanggal hari ini
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Ubah tanggal transaksi menjadi objek Date
    const transaction = new Date(tglDokumen);

    // Bandingkan tanggal transaksi dengan tanggal yang telah dikurangi 1 hari
    const tglMinusSatu = transaction > yesterday && transaction < today;
    return tglMinusSatu;
};

// End
// =================================================================================

//==================================================================================================
// Format Rupiah
const formatCurrency: Object = { skeleton: 'C3', format: ',0.00;-,0.00;#', maximumFractionDigits: 2 };
const CurrencyFormat = (num: any) => {
    const numericValue = parseFloat(num); // Convert the value to number
    if (isNaN(numericValue)) {
        // If not a valid number, return an empty string or the original value
        return '';
    } else {
        let intl: Internationalization = new Internationalization();
        let nFormatter: Function = intl.getNumberFormat(formatCurrency);
        let formattedValue: string = nFormatter(numericValue);
        return formattedValue;
    }
};

//END
//==================================================================================================

export {
    HandleCloseZoom,
    HandleZoomIn,
    HandleZoomOut,
    HandleNominalInvoiceInput,
    HandleFakturEkspedisiInput,
    HandlePph23Change,
    HandleNamaEkspedisiChange,
    PencarianNoRpe,
    HandleStatusApproval,
    HandleNoFakturEksInputChange,
    HandleNamaEkspedisiInputChange,
    HandleTgl,
    HandleNoRpeInputChange,
    CekPeriodeAkutansi,
    CekTglMinusSatu,
    CurrencyFormat,
};
