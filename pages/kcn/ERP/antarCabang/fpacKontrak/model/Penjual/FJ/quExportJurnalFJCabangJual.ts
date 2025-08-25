import moment from 'moment';
import { fetchCustomerMap, fetchKodeAkun } from '../../../api';
import { generateNUDivisi } from '@/utils/routines';

export const quExportJurnalFJCabangJual = {
    kode_dokumen: 'oto', // Will be populated with sKodeFJ
    id_dokumen: 1, // Will be populated with IdJurnal
    dokumen: 'FJ', // Will be populated with DOK_FJ
    tgl_dokumen: null, // Will be populated with TglDokumenEfektif
    kode_akun: null, // From kode_akun_piutang quListJual
    kode_subledger: null, // From quCust.kode_cust_pusat_cabang
    kurs: 0, // From quMFpackurs
    debet_rp: 0, // Calculated: (sTotalMU * kurs) - (0 * kurs)
    kredit_rp: 0, // Default 0
    jumlah_rp: 0, // Same as debet_rp
    jumlah_mu: 0, // Same as debet_rp
    catatan: null, // Will be formatted with sNoFJ
    no_warkat: null,
    tgl_valuta: null,
    persen: 0,
    kode_dept: null,
    kode_kerja: null,
    approval: 'N',
    posting: 'N',
    rekonsiliasi: 'N',
    tgl_rekonsil: null,
    userid: '',
    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'), // Will be current timestamp
    audit: null,
    kode_kry: null,
    kode_jual: null, // From quCust.kode_jual_antar_cabang
    no_kontrak_um: null,
};

export const createJurnalFJPenjualPayload = async (editData: any, kode_entitas: string, token: any, hargaJualMu: number) => {
    const cust = await fetchCustomerMap(kode_entitas, editData.entitas_cabang_jual, token);
    const cust_jual = await fetchCustomerMap(kode_entitas, editData.kode_entitas, token);
    const kode_akun = await fetchKodeAkun(kode_entitas, editData.detail[0].no_item, token);

    const sNoFJ = await generateNUDivisi(editData.entitas_cabang_jual, '', '01', '13', moment().format('YYYYMM'), moment().format('YYMM') + '01');

    // (sTotalMU*quMFpackurs.AsFloat)-(0*quMFpackurs.AsFloat)
    const detail = editData.detail[0];
    const totalMu = parseFloat(detail.qty_std) * hargaJualMu;
    const jumlahFb = totalMu * parseFloat(editData.kurs) - 0 * parseFloat(editData.kurs);

    const payload1 = {
        ...quExportJurnalFJCabangJual,
        tgl_dokumen: moment(editData.tgl_trxfpac).format('YYYY-MM-DD HH:mm:ss'),
        kurs: parseFloat(editData.kurs),
        debet_rp: jumlahFb,
        kredit_rp: 0,
        jumlah_rp: jumlahFb,
        jumlah_mu: jumlahFb,
        catatan: `Piutang Faktur No ${sNoFJ}`,
        userid: editData.userid,
        kode_akun: cust.length === 0 ? null : cust[0].kode_akun_piutang,
        kode_subledger: cust.length === 0 ? null : cust[0].kode_cust_pusat_cabang,
        kode_jual: cust.length === 0 ? null : cust[0].kode_jual_antar_cabang,
    };

    const payload2 = {
        ...quExportJurnalFJCabangJual,
        id_dokumen: 2,
        tgl_dokumen: moment(editData.tgl_trxfpac).format('YYYY-MM-DD HH:mm:ss'),
        kurs: parseFloat(editData.kurs),
        debet_rp: 0,
        kredit_rp: totalMu * parseFloat(editData.kurs) + 0 * parseFloat(editData.kurs),
        jumlah_rp: -1 * (totalMu * parseFloat(editData.kurs) + 0 * parseFloat(editData.kurs)),
        jumlah_mu: -1 * (totalMu * parseFloat(editData.kurs) + 0 * parseFloat(editData.kurs)),
        catatan: `Penjualan Faktur No ${sNoFJ} kepada ${cust_jual[0].nama_relasi}`, // harusnya GetNamaCustCabangjual(quCust.FieldValues['kode_cust_pusat_cabang'])
        userid: editData.userid,
        kode_jual: cust.length === 0 ? null : cust[0].kode_jual_antar_cabang,
        kode_akun: kode_akun[0].kode_akun_jual,
    };

    return [{ ...payload1 }, { ...payload2 }];
};
