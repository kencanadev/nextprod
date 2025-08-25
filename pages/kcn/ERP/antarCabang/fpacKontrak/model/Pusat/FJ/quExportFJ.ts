import { generateNUDivisi, ResetTime } from '@/utils/routines';
import moment from 'moment';
import { fetchCustomerMap } from '../../../api';

export const quExportFJ = {
    kode_fj: 'oto',
    no_fj: 'sNoFJ',
    tgl_fj: '', // Tanggal diambil dari TglDokumenEfektif
    tgl_trxfj: '',
    tgl_buku: '',
    no_reff: 'quMFpacno_reff',
    kode_sales: 'kode_sales',
    kode_cust: 'kode_cust_pusat',
    kode_akun_piutang: null,
    tgl_kirim: null,
    alamat_kirim: 'alamat_kirim_cabang',
    via: 'ARMADA SENDIRI',
    fob: null,
    kode_termin: 'kode_termin',
    kode_mu: 'kode_mu',
    kurs: '0.0000', // contoh kurs
    kurs_pajak: '0.0000', // contoh kurs pajak
    kena_pajak: 'Y', // contoh data pajak
    no_faktur_pajak: null,
    diskon_dok: null,
    total_mu: '0.0000', // contoh total MU
    diskon_dok_mu: '0.0000',
    total_diskon_mu: '0.0000',
    total_pajak_mu: '0.0000',
    kirim_mu: '0.0000',
    netto_mu: '0.0000', // contoh nilai netto MU
    uang_muka_mu: '0.0000',
    memo_mu: '0.0000',
    lunas_mu: '0.0000',
    memo_pajak: '0.0000',
    lunas_pajak: '0.0000',
    total_rp: '0.0000', // contoh total RP
    diskon_dok_rp: '0.0000',
    total_diskon_rp: '0.0000',
    total_pajak_rp: '0.0000',
    kirim_rp: '0.0000',
    netto_rp: '0.0000', // contoh nilai netto RP
    total_berat: 0, // contoh berat total
    kode_akun_kirim: null,
    kode_akun_diskon_termin: null,
    kode_akun_diskon_dok: null,
    keterangan: '[No FPAC: no_Fpac] - [dari CabangBeli ke CabangJual]',
    status: 'Terbuka',
    userid: 'UserID',
    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'), // contoh timestamp
    dokumen: 'Diambil',
    beban_antar_cabang: null,
    kode_tagih: 'kode_sales',
    kode_penjual: 'kode_sales',
    bd: 'N',
    bayar_mu: '0.0000',
    tunai: '0.0000',
    debet: '0.0000',
    debet_tunai: '0.0000',
    kredit: '0.0000',
    kredit_dp: '0.0000',
    kredit_diskon: '0.0000',
    kredit_bp: '0.0000',
    kredit_biaya: '0.0000',
    voucher: '0.0000',
    bulat: '0.0000',
    kode_mk: null,
    retur: '0.0000',
    tum: '0.0000',
    kode_tum: null,
    koreksi: 'N',
    referal: null,
    kode_jual: 'kode_jual_antar_cabang',
    approval: 'Y',
};

export const createFJPusatPayload = async (editData: any, tgl: any, termin: any, kode_entitas: any, token: any, updateState: any, tipe: string, hargaMu: any) => {
    const cust = await fetchCustomerMap(kode_entitas, editData.kode_entitas, token);
    const kode_termin = termin.length === 0 ? null : termin[0].kode_termin;
    const noFj = await generateNUDivisi(kode_entitas, '', cust[0].kode_jual_antar_cabang, '13', moment().format('YYYYMM'), moment().format('YYMM') + cust[0].kode_jual_antar_cabang);

    let totalMu = 0;
    for (const item of editData.detail) {
        const harga_mu = hargaMu != 0 ? hargaMu : parseFloat(item.harga_mu);
        totalMu += item.qty_std * harga_mu;
    }

    updateState('noFjPusat', noFj);

    const keterangan =
        tipe === 'Y'
            ? `[No FPAC : ${editData.no_fpac}] - [dari ${editData.kode_entitas} ke ${editData.entitas_cabang_jual}]`
            : `[No FPAC : ${editData.no_fpac}] - [dari ${editData.kode_entitas} ke ${editData.entitas_cabang_jual}] - ${editData.keterangan}`;

    const payload = {
        ...quExportFJ,
        no_fj: noFj,
        tgl_fj: tgl,
        // tgl_trxfj: tgl,
        tgl_trxfj: editData.tgl_kirim,
        tgl_buku: tgl,
        no_reff: editData.no_reff,
        kode_termin,
        kode_mu: editData.kode_mu, // DataCbg.quListJual.FieldValues['kode_mu'];
        kurs: parseFloat(editData.kurs), // DataCbg.quListJual.FieldValues['kode_mu'];
        kurs_pajak: parseFloat(editData.kurs_pajak), // DataCbg.quListJual.FieldValues['kode_mu'];
        kena_pajak: editData.kena_pajak, // DataCbg.quListJual.FieldValues['kode_mu'];
        total_mu: totalMu,
        netto_mu: totalMu,
        total_rp: totalMu,
        netto_rp: totalMu,
        total_berat: parseFloat(editData.total_berat),
        keterangan,
        userid: editData.userid,
        kode_tagih: cust.length === 0 ? null : cust[0].kode_sales,
        kode_penjual: cust.length === 0 ? null : cust[0].kode_sales,
        kode_sales: cust.length === 0 ? null : cust[0].kode_sales,
        kode_cust: editData.kode_cust_pusat,
        alamat_kirim: editData.alamat_kirim_cabang,
        kode_jual: cust.length === 0 ? null : cust[0].kode_jual_antar_cabang,
    };

    return payload;
};
