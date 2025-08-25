import { generateNUDivisi, ResetTime } from '@/utils/routines';
import moment from 'moment';
import { fetchCustomerMap } from '../../../api';

export const quExportSJCabangJual = {
  kode_sj: 'oto',
  no_sj: 'sNoSj',
  tgl_sj: 'tglSj',
  tgl_trxsj: 'tglSj', // Same as tgl_sj
  no_reff: 'quMFpac.no_reff',
  kode_gudang: 'quCust.kode_gudang_pusat_cabang',
  kode_cust: 'quCust.kode_cust_pusat_cabang',
  alamat_kirim: 'quCust.alamat_kirim1',
  via: 'ARMADA SENDIRI',
  fob: 'Diambil',
  pengemudi: '-',
  nopol: '-',
  total_rp: '',
  total_diskon_rp: 0,
  total_pajak_rp: 0,
  netto_rp: 'sTotalMU',
  total_berat: 'sTotalBerat',
  keterangan: '`[No FPAC : ${quMFpac.no_Fpac}] - [No.Kontrak : ${quMFpac.no_reff}] - [Untuk Ent ${edCabangBeli.trim()}]`',
  status: 'Terbuka',
  userid: 'Userid',
  tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
  dokumen: null,
  kode_jual: 'quCust.kode_jual_antar_cabang',
  kirim: 'N',
};

export const createSJPenjualPayload = async (editData: any, tgl: any, kode_entitas: any, token: any, updateState: any, hargaJualMu: number) => {
  const cust = await fetchCustomerMap(kode_entitas, editData.entitas_cabang_jual, token);
  const noSj = await generateNUDivisi(editData.entitas_cabang_jual, '', cust[0].kode_jual_antar_cabang, '12', moment().format('YYYYMM'), moment().format('YYMM') + cust[0].kode_jual_antar_cabang);
  const detail = editData.detail[0];
  const totalMu = parseFloat(detail.qty_std) * hargaJualMu;

  updateState('noSjPenjual', noSj);
  const payload = {
    ...quExportSJCabangJual,
    no_sj: noSj,
    tgl_sj: tgl,
    tgl_trxsj: tgl,
    no_reff: editData.no_reff,
    total_rp: totalMu,
    netto_rp: totalMu,
    total_berat: parseFloat(editData.total_berat),
    keterangan: `[No FPAC : ${editData.no_fpac}] - [No.Kontrak : ${editData.no_reff}] - [Untuk Ent ${editData.kode_entitas}]`, // harusnya cabang beli
    userid: editData.userid,
    kode_jual: cust.length === 0 ? null : cust[0].kode_jual_antar_cabang,
    kode_gudang: cust.length === 0 ? null : cust[0].kode_gudang_pusat_cabang,
    kode_cust: cust.length === 0 ? null : cust[0].kode_cust_pusat_cabang,
    alamat_kirim: cust.length === 0 ? null : cust[0].alamat_kirim1,
  };

  return payload;
};
