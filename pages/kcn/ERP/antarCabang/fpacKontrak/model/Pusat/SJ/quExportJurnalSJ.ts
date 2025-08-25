import { generateNUDivisi } from '@/utils/routines';
import { fetchCustomerMap, fetchKodeAkun } from '../../../api';
import { hitungTotalDebet } from '../../../helpers/hitungTotalRpMu';
import moment from 'moment';

export const quExportJurnalSJ = {
    kode_dokumen: 'oto',
    id_dokumen: 1,
    dokumen: 'SJ',
    tgl_dokumen: 'TglDokumenEfektif',
    kode_akun: "FieldByName('kode_akun_hpp').AsString",
    kode_subledger: null,
    kurs: 1,
    debet_rp: 'sHPP',
    kredit_rp: 0,
    jumlah_rp: 'sHPP',
    jumlah_mu: 'sHPP',
    catatan: 'Harga Pokok No. SJ: sNoSJ',
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
    kode_jual: "quCust.FieldValues['kode_jual_antar_cabang']",
    no_kontrak_um: null,
};

export const createJurnalSJPusatPayload = async (editData: any, kode_entitas: string, token: string, hargaBeliMu: number) => {
    // // Ambil kode_akun untuk item pertama
    const kode_akun = await fetchKodeAkun(kode_entitas, editData.detail[0].no_item, token);
    const cust = await fetchCustomerMap(kode_entitas, kode_entitas, token);
    const no_sj = await generateNUDivisi(kode_entitas, '', cust[0].kode_jual_antar_cabang, '12', moment().format('YYYYMM'), moment().format('YYMM') + cust[0].kode_jual_antar_cabang);
    const detail = editData.detail[0];
    const sNilaiJurnalSj = hargaBeliMu != 0 ? hargaBeliMu : parseFloat(detail.harga_beli_mu);
    let totalMu = 0;
    for (const item of editData.detail) {
        const harga_mu = hargaBeliMu != 0 ? hargaBeliMu : parseFloat(item.harga_beli_mu);
        totalMu += item.qty_std * harga_mu;
    }

    const payload1 = {
        ...quExportJurnalSJ,
        tgl_dokumen: moment(editData.tgl_trxfpac).format('YYYY-MM-DD HH:mm:ss'),
        kode_akun: kode_akun[0].kode_akun_hpp,
        kurs: parseFloat(editData.kurs),
        debet_rp: totalMu,
        kredit_rp: 0,
        jumlah_rp: totalMu,
        jumlah_mu: totalMu / 1,
        catatan: `Harga Pokok No. SJ: ${no_sj}`,
        userid: editData.userid,
        kode_jual: cust.length === 0 ? null : cust[0].kode_jual_antar_cabang,
    };

    const payload2 = {
        ...quExportJurnalSJ,
        id_dokumen: 2,
        tgl_dokumen: moment(editData.tgl_trxfpac).format('YYYY-MM-DD HH:mm:ss'),
        kode_akun: kode_akun[0].kode_akun_persediaan,
        kurs: parseFloat(editData.kurs),
        debet_rp: 0,
        kredit_rp: totalMu,
        jumlah_rp: -1 * totalMu,
        jumlah_mu: -1 * (totalMu / 1),
        catatan: `Persediaan barang No. SJ: ${no_sj}`,
        userid: editData.userid,
        kode_jual: cust.length === 0 ? null : cust[0].kode_jual_antar_cabang,
    };

    return [{ ...payload1 }, { ...payload2 }];
};
