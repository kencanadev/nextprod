import { generateNUDivisi, ResetTime } from '@/utils/routines';
import moment from 'moment';
import { fetchCustomerMap } from '../../../api';

export const quExportSO = {
  kode_so: 'oto',
  no_so: '',
  tgl_so: null, // Will be set by ResetTime function
  no_reff: '',
  kode_sales: 'quCust.FieldValues[kode_sales]',
  kode_cust: 'quCust.FieldValues[kode_cust]',
  alamat_kirim: 'quCust.FieldValues[alamat_kirim1];',
  via: 'Langsung',
  fob: 'Dikirim',
  kode_termin: '',
  kode_mu: '',
  kurs: 0,
  kurs_pajak: 0,
  kena_pajak: 'N',
  diskon_dok: null,
  total_mu: 0,
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
  tutup: 'N',
  keterangan: '',
  status: 'Terbuka',
  approval: 1,
  tgl_approval: moment().format('YYYY-MM-DD HH:mm:ss'),
  userid: '',
  tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
  tgl_jatuh_tempo: null, // Will be TglDokumenEfektif + 7
  tgl_bpb: moment().format('YYYY-MM-DD HH:mm:ss'),
  tgl_dikirim: moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss'), // Will be AppDate + 1
  kirim_langsung: 'Y', // Note: Different from previous "N"
  cara_kirim: 'KP', // Note: Different from previous "KG"
  kode_kirim: 'quCust.FieldValues[kode_kirim]',
  kode_jual: 'quCustPusat.FieldValues[kode_jual_antar_cabang]',
  status_kirim: 'N',
  no_sjpabrik: null,
  tgl_sjpabrik: null,
  tgl_sjfax: null,
  nota: null,
};

export const createSOPusatPayload = async (editData: any, kode_entitas: any, token: any, termin: any, updateState: any, tipe: string) => {
  const cust = await fetchCustomerMap(kode_entitas, editData.kode_entitas, token);
  const kode_termin = termin.length === 0 ? null : termin[0].kode_termin;
  const noSo = await generateNUDivisi(kode_entitas, '', cust[0].kode_jual_antar_cabang, '10', moment().format('YYYYMM'), moment().format('YYMM') + cust[0].kode_jual_antar_cabang);

  updateState('noSoPusat', noSo);

  const keterangan =
    tipe === 'Y'
      ? `[No FPAC : ${editData.no_fpac}] - [dari ${editData.kode_entitas} ke ${editData.entitas_cabang_jual}]`
      : `[No FPAC : ${editData.no_fpac}] - [dari ${editData.kode_entitas} ke ${editData.entitas_cabang_jual}] - ${editData.keterangan}`;

  const payload = {
    ...quExportSO,
    no_so: noSo,
    tgl_so: await ResetTime(editData.kode_entitas, editData.tgl_trxfpac),
    no_reff: editData.no_fpac,
    kode_termin,
    kode_mu: editData.kode_mu,
    kurs: parseFloat(editData.kurs),
    kurs_pajak: parseFloat(editData.kurs_pajak),
    kena_pajak: editData.kena_pajak,
    total_mu: parseFloat(editData.total_mu),
    netto_mu: parseFloat(editData.total_mu),
    total_rp: parseFloat(editData.total_mu),
    diskon_dok_rp: parseFloat(editData.diskon_dok_mu),
    total_pajak_rp: parseFloat(editData.total_pajak_mu),
    netto_rp: parseFloat(editData.total_mu),
    total_berat: parseFloat(editData.total_berat),
    keterangan,
    userid: editData.userid,
    tgl_jatuh_tempo: moment(editData.tgl_trxfpac).add(7, 'days').format('YYYY-MM-DD HH:mm:ss'),
    tgl_dikirim: moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss'),
    kode_sales: cust.length === 0 ? null : cust[0].kode_sales,
    kode_cust: cust.length === 0 ? null : cust[0].kode_cust,
    alamat_kirim: editData.alamat_kirim_cabang,
    kode_kirim: cust.length === 0 ? null : cust[0].kode_kirim,
    kode_jual: cust.length === 0 ? null : cust[0].kode_jual_antar_cabang,
  };

  return payload;
};
