import { generateNUDivisi, ResetTime } from '@/utils/routines';
import moment from 'moment';
import { fetchCustomerMap, fetchDetailCustomer } from '../../../api';

export const quExportSOCabangJual = {
  kode_so: 'oto',
  no_so: '',
  tgl_so: '',
  no_reff: '',
  kode_sales: 'quCust.FieldValues[kode_sales]',
  kode_cust: 'quCust.FieldValues[kode_cust]',
  alamat_kirim: '',
  via: 'Langsung',
  fob: 'Dikirim',
  kode_termin: '',
  kode_mu: '',
  kurs: 0,
  kurs_pajak: 0,
  kena_pajak: '',
  diskon_dok: null,
  total_mu: 0,
  diskon_dok_mu: 0,
  total_diskon_mu: 0,
  total_pajak_mu: 0,
  kirim_mu: 0,
  netto_mu: 0,
  total_rp: 0,
  diskon_dok_rp: 0,
  total_pajak_rp: 0,
  kirim_rp: 0,
  netto_rp: 0,
  total_berat: 0,
  tutup: null,
  keterangan: '',
  status: 'Terbuka',
  approval: 1,
  tgl_approval: moment().format('YYYY-MM-DD HH:mm:ss'),
  userid: '',
  tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
  tgl_jatuh_tempo: '',
  tgl_bpb: moment().format('YYYY-MM-DD HH:mm:ss'),
  tgl_dikirim: '',
  kirim_langsung: 'N',
  cara_kirim: 'KG',
  kode_kirim: '',
  kode_jual: '',
  status_kirim: 'N',
  no_sjpabrik: null,
  tgl_sjpabrik: null,
  tgl_sjfax: null,
  nota: null,
};

export const createSOPenjualPayload = async (editData: any, tgl: any, termin: any, kode_entitas: any, token: any, updateState: any, hargaJualMu: number) => {
  const kode_termin = termin.length === 0 ? null : termin[0].kode_termin;
  const cust = await fetchCustomerMap(kode_entitas, editData.entitas_cabang_jual, token);
  const detailCust = await fetchDetailCustomer(editData.entitas_cabang_jual, cust[0].kode_cust_pusat_cabang, token);
  const noSo = await generateNUDivisi(editData.entitas_cabang_jual, '', cust[0].kode_jual_antar_cabang, '10', moment().format('YYYYMM'), moment().format('YYMM') + cust[0].kode_jual_antar_cabang);
  //:= sTotalMU+(quDFpacqty_std.AsFloat * qusTotalMUDFpacharga_jual_mu.AsFloat );
  const detail = editData.detail[0];
  const harga_jual_mu = hargaJualMu != 0 ? hargaJualMu : parseFloat(detail.harga_beli_mu);
  const totalMu = parseFloat(detail.qty_std) * harga_jual_mu;

  updateState('noSoPenjual', noSo);

  const payload = {
    ...quExportSOCabangJual,
    no_so: noSo,
    tgl_so: tgl,
    no_reff: editData.no_fpac,
    kode_termin,
    kode_mu: editData.kode_mu,
    kurs: parseFloat(editData.kurs),
    kurs_pajak: parseFloat(editData.kurs_pajak),
    kena_pajak: editData.kena_pajak,
    total_mu: totalMu,
    netto_mu: totalMu,
    total_rp: totalMu,
    diskon_dok_rp: parseFloat(editData.diskon_dok_mu),
    total_pajak_rp: parseFloat(editData.total_pajak_mu),
    netto_rp: totalMu,
    total_berat: parseFloat(editData.total_berat),
    keterangan: `[No FPAC : ${editData.no_fpac}] - [Untuk Ent ${editData.kode_entitas}]`,
    userid: editData.userid,
    tgl_jatuh_tempo: moment(editData.tgl_trxfpac).add(7, 'days').format('YYYY-MM-DD HH:mm:ss'),
    tgl_dikirim: moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss'),
    kode_kirim: editData.kode_kirim_cabang_jual,
    kode_jual: cust.length === 0 ? null : cust[0].kode_jual_antar_cabang,
    kode_sales: detailCust.length === 0 ? null : detailCust[0].kode_sales,
    kode_cust: cust.length === 0 ? null : cust[0].kode_cust_pusat_cabang,
    alamat_kirim: detailCust.length === 0 ? null : detailCust[0].alamat_kirim1,
    tutup: 'N',
  };

  return payload;
};
