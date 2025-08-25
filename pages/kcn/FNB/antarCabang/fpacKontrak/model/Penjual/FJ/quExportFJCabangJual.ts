import { generateNUDivisi, ResetTime } from '@/utils/routines';
import moment from 'moment';
import { fetchCustomerMap, fetchDetailCustomer } from '../../../api';

export const quExportFJCabangJual = {
  kode_fj: 'oto', // Will be populated with sKodeFJ
  no_fj: null, // Will be populated with sNoFJ
  tgl_fj: null, // Will be calculated from TglDokumenEfektif
  tgl_trxfj: null, // Same as tgl_fj
  tgl_buku: null, // Same as tgl_fj
  no_reff: null, // From quMFpacno_reff
  kode_sales: null, // From DataCbg.quListJual
  kode_cust: null, // From quCust.kode_cust_pusat_cabang
  kode_akun_piutang: null,
  tgl_kirim: null,
  alamat_kirim: null, // From quCust.alamat_kirim1
  via: 'ARMADA SENDIRI',
  fob: null,
  kode_termin: null, // Calculated from quMFpacnama_termin
  kode_mu: null, // From DataCbg.quListJual
  kurs: null, // From DataCbg.quListJual
  kurs_pajak: null, // From DataCbg.quListJual
  kena_pajak: null, // From DataCbg.quListJual
  no_faktur_pajak: null,
  diskon_dok: null,
  total_mu: 0, // Will be populated with sTotalMU
  diskon_dok_mu: 0,
  total_diskon_mu: 0,
  total_pajak_mu: 0,
  kirim_mu: 0,
  netto_mu: 0, // Will be same as sTotalMU
  uang_muka_mu: 0,
  memo_mu: null,
  lunas_mu: 0,
  memo_pajak: null,
  lunas_pajak: null,
  total_rp: 0, // Will be same as sTotalMU
  diskon_dok_rp: 0,
  total_diskon_rp: 0,
  total_pajak_rp: 0,
  kirim_rp: 0,
  netto_rp: 0, // Will be same as sTotalMU
  total_berat: 0, // Will be populated with sTotalBerat
  kode_akun_kirim: null,
  kode_akun_diskon_termin: null,
  kode_akun_diskon_dok: null,
  keterangan: null, // Will be formatted with FPAC number and branch
  status: 'Terbuka',
  userid: null, // Will be populated with Userid
  tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'), // Will be current timestamp
  dokumen: 'Diambil',
  beban_antar_cabang: null,
  kode_tagih: null, // From DataCbg.quListJual.kode_sales
  kode_penjual: null, // From DataCbg.quListJual.kode_sales
  bd: 'N',
  bayar_mu: null,
  tunai: null,
  debet: null,
  debet_tunai: null,
  kredit: null,
  kredit_dp: null,
  kredit_diskon: null,
  kredit_bp: null,
  kredit_biaya: null,
  voucher: null,
  bulat: null,
  kode_mk: null,
  retur: null,
  tum: null,
  kode_tum: null,
  koreksi: 'N',
  referal: null,
  kode_jual: null, // From quCust.kode_jual_antar_cabang
  approval: 'Y',
};

export const createFJPenjualPayload = async (editData: any, tgl: any, termin: any, kode_entitas: any, token: any, updateState: any, hargaJualMu: number) => {
  const kode_termin = termin.length === 0 ? null : termin[0].kode_termin;
  const cust: any = await fetchCustomerMap(kode_entitas, editData.entitas_cabang_jual, token);
  const detailCust = await fetchDetailCustomer(editData.entitas_cabang_jual, cust[0].kode_cust_pusat_cabang, token);
  const noFj = await generateNUDivisi(editData.entitas_cabang_jual, '', cust[0].kode_jual_antar_cabang, '13', moment().format('YYYYMM'), moment().format('YYMM') + cust[0].kode_jual_antar_cabang);
  const detail = editData.detail[0];
  const harga_jual_mu = hargaJualMu != 0 ? hargaJualMu : parseFloat(detail.harga_jual_mu);
  const totalMu = parseFloat(detail.qty_std) * harga_jual_mu;

  updateState('noFjPenjual', noFj);

  const payload = {
    ...quExportFJCabangJual,
    no_fj: noFj,
    tgl_fj: tgl,
    tgl_trxfj: tgl,
    tgl_buku: tgl,
    no_reff: editData.no_reff,
    kode_termin,
    kode_mu: detailCust.length === 0 ? null : detailCust[0].kode_mu, // DataCbg.quListJual.FieldValues['kode_mu'];
    kurs: detailCust.length === 0 ? null : parseFloat(detailCust[0].kurs), // DataCbg.quListJual.FieldValues['kode_mu'];
    kurs_pajak: detailCust.length === 0 ? null : parseFloat(detailCust[0].kurs_pajak), // DataCbg.quListJual.FieldValues['kode_mu'];
    kena_pajak: editData.kena_pajak, // DataCbg.quListJual.FieldValues['kode_mu'];
    total_mu: totalMu,
    netto_mu: totalMu,
    total_rp: totalMu,
    netto_rp: totalMu,
    total_berat: editData.total_berat,
    keterangan: `[No FPAC : ${editData.no_fpac}] - [Untuk Ent ${editData.kode_entitas}]`,
    userid: editData.userid,
    kode_cust: cust.length === 0 ? null : cust[0].kode_cust_pusat_cabang,
    kode_jual: cust.length === 0 ? null : cust[0].kode_jual_antar_cabang,
    kode_sales: detailCust.length === 0 ? null : detailCust[0].kode_sales,
    kode_tagih: detailCust.length === 0 ? null : detailCust[0].kode_sales,
    kode_penjual: detailCust.length === 0 ? null : detailCust[0].kode_sales,
    alamat_kirim: cust.length === 0 ? null : cust[0].alamat_kirim1,
  };

  return payload;
};
