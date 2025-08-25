import { generateNUDivisi, ResetTime } from '@/utils/routines';
import moment from 'moment';
import { fetchCustomerMap, fetchKodeAkun } from '../../../api';

export const quExportJurnalFJ = {
    kode_dokumen: 'oto',
    id_dokumen: 1,
    dokumen: 'FJ',
    tgl_dokumen: '',
    kode_akun: null,
    kode_subledger: null,
    kurs: 0, // contoh nilai kurs
    debet_rp: 0.0, // contoh nilai debet dalam RP
    kredit_rp: 0.0,
    jumlah_rp: 0.0, // contoh jumlah dalam RP
    jumlah_mu: 0.0, // contoh jumlah dalam MU
    catatan: 'Piutang Faktur No sNoFJ',
    no_warkat: null,
    tgl_valuta: null,
    persen: 0,
    kode_dept: null,
    kode_kerja: null,
    approval: 'N',
    posting: 'N',
    rekonsiliasi: 'N',
    tgl_rekonsil: null,
    userid: 'Userid',
    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
    audit: null,
    kode_kry: null,
    kode_jual: 'kode_jual_antar_cabang',
    no_kontrak_um: null,
};

export const createJurnalFJPusatPayload = async (editData: any, kode_entitas: string, token: any, tipe: any, hargaMu: number) => {
    const sJumlahFB = parseFloat(editData.total_mu) * parseFloat(editData.kurs);
    const cust = await fetchCustomerMap(kode_entitas, kode_entitas, token);
    const cust_jual = await fetchCustomerMap(kode_entitas, editData.kode_entitas, token);
    const kode_akun = await fetchKodeAkun(kode_entitas, editData.detail[0].no_item, token);

    let totalMu = 0;
    for (const item of editData.detail) {
        const harga_mu = hargaMu != 0 ? hargaMu : parseFloat(item.harga_mu);
        totalMu += item.qty_std * harga_mu;
    }

    const sNoFJ = await generateNUDivisi(kode_entitas, '', '01', '13', moment().format('YYYYMM'), moment().format('YYMM') + '01');
    const payload1 = {
        ...quExportJurnalFJ,
        tgl_dokumen: moment(editData.tgl_trxfpac).format('YYYY-MM-DD HH:mm:ss'),
        kurs: parseFloat(editData.kurs),
        debet_rp: totalMu,
        kredit_rp: 0,
        jumlah_rp: totalMu,
        jumlah_mu: totalMu,
        catatan: `Piutang Faktur No ${sNoFJ}`,
        userid: editData.userid,
        kode_subledger: editData.kode_cust_pusat,
        kode_akun: cust.length === 0 ? null : cust[0].kode_akun_piutang,
        kode_jual: cust.length === 0 ? null : cust[0].kode_jual_antar_cabang,
    };

    const catatan = `Penjualan Faktur No ${sNoFJ} kepada ${cust_jual[0].nama_relasi}`;

    const payload2 = {
        ...quExportJurnalFJ,
        id_dokumen: 2,
        tgl_dokumen: moment(editData.tgl_trxfpac).format('YYYY-MM-DD HH:mm:ss'),
        kurs: parseFloat(editData.kurs),
        debet_rp: 0,
        kredit_rp: totalMu,
        jumlah_rp: -1 * totalMu,
        jumlah_mu: -1 * totalMu,
        catatan, // harusnya GetNamaCustCabangjual(quCust.FieldValues['kode_cust_pusat_cabang'])
        userid: editData.userid,
        kode_jual: cust.length === 0 ? null : cust[0].kode_jual_antar_cabang,
        kode_akun: kode_akun[0].kode_akun_jual,
    };

    return [{ ...payload1 }, { ...payload2 }];
};
