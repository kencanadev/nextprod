import { generateNU, generateNUDivisi, qty2QtyStd, ResetTime } from '@/utils/routines';
import moment from 'moment';
import { fetchCustomerMap, fetchHpps } from '../../../api';

export const quExportMBCabangJual = {
  kode_mb: 'oto',
  no_mb: 'sNoMB',
  tgl_mb: 'BackTime_Cabang_Jual(TglDokumenEfektif)',
  tgl_valuta: null, // Will be set to same as tgl_mb
  kode_gudang: 'quMFpackode_gudang_jual',
  kode_tujuan: 'quCust.kode_gudang_pusat_cabang',
  netto_rp: 'sTotalMU',
  total_berat: 'sTotalBerat',
  keterangan: '[No FPAC : ${quMFpacno_fpac}] - [Untuk Ent ${edCabangBeli.trim()}]',
  status: 'Terbuka',
  userid: 'Userid',
  tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
  persediaan: 'Persediaan',
  no_reff: 'quMFpacno_reff',
  kode_supp: null,
  kode_cust: 'quCust.kode_cust_pusat_cabang',
  nopol: '-',
  via: null,
  alamat_kirim: 'quCust.alamat_kirim1',
  kontrak: 'Y',
};

export const createMBPenjualPayload = async (editData: any, tgl: any, kode_entitas: any, token: any, updateState: any, hargaJualMu: any) => {
  const cust = await fetchCustomerMap(kode_entitas, editData.entitas_cabang_jual, token);
  const noMb = await generateNU(editData.entitas_cabang_jual, '', '23', moment().format('YYYYMM'));
  const params = {
    entitas: editData.entitas_cabang_jual,
    param1: editData.detail[0].kode_item,
    param2: 'all',
    param3: editData.kode_gudang_jual,
    token,
  };
  const res = await fetchHpps(params);

  const total_mu = res[0].hpp * parseFloat(editData.detail[0].qty_std);

  updateState('noMbPenjual', noMb);

  const payload = {
    ...quExportMBCabangJual,
    no_mb: noMb,
    tgl_mb: tgl,
    tgl_valuta: tgl,
    kode_gudang: editData.kode_gudang_jual,
    kode_tujuan: cust.length === 0 ? null : cust[0].kode_gudang_pusat_cabang,
    netto_rp: total_mu,
    total_berat: parseFloat(editData.total_berat),
    keterangan: `[No FPAC : ${editData.no_fpac}] - [Untuk Ent ${editData.kode_entitas}]`,
    userid: editData.userid,
    no_reff: editData.no_reff,
    kode_cust: cust.length === 0 ? null : cust[0].kode_cust_pusat_cabang,
    alamat_kirim: cust.length === 0 ? null : cust[0].alamat_kirim1,
  };

  return payload;
};
