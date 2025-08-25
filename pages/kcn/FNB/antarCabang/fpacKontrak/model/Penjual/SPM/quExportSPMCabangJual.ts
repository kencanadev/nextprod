import { generateNUDivisi, ResetTime } from '@/utils/routines';
import moment from 'moment';
import { fetchCustomerMap } from '../../../api';

export const quExportSPMCabangJual = {
  kode_do: 'oto',
  no_do: '',
  tgl_do: "BackTime_Cabang_Jual('TglDokumenEfektif')", // Assuming this function exists in JS
  tgl_kirim: 'BackTime_Cabang_Jual(TglDokumenEfektif)', // Same as tgl_do
  kode_cust: 'quCust.kode_cust_pusat_cabang',
  alamat_kirim: 'quCust.alamat_kirim1',
  via: 'ARMADA SENDIRI',
  fob: 'Diambil',
  pengemudi: null,
  nopol: null,
  total_berat: '',
  keterangan: '`[No FPAC : ${quMfpacno_fpac}] - [Untuk Ent ${edCabangBeli.Text.trim()}]`',
  status: 'Terbuka',
  userid: 'Userid',
  tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'), // equivalent to Now
  kode_gudang: 'quCust.kode_gudang_pusat_cabang',
  kode_kirim: 'quCust.kode_kirim_pusat_cabang',
  kode_jual: 'quCust.kode_jual_antar_cabang',
};

export const createSPMPenjualPayload = async (editData: any, tgl: any, kode_entitas: any, token: any, updateState: any) => {
  const cust = await fetchCustomerMap(kode_entitas, editData.entitas_cabang_jual, token);
  const noDo = await generateNUDivisi(editData.entitas_cabang_jual, '', '01', '11', moment().format('YYYYMM'), moment().format('YYMM') + '01');

  updateState('noSpmPenjual', noDo);

  const payload = {
    ...quExportSPMCabangJual,
    no_do: noDo,
    tgl_do: tgl,
    tgl_kirim: tgl,
    total_berat: parseFloat(editData.total_berat),
    keterangan: `[No FPAC : ${editData.no_fpac}] - [Untuk Ent ${editData.kode_entitas}]`, // harusnya cabang beli
    userid: editData.userid,
    kode_cust: cust.length === 0 ? null : cust[0].kode_cust_pusat_cabang,
    alamat_kirim: cust.length === 0 ? null : cust[0].alamat_kirim1,
    kode_gudang: cust.length === 0 ? null : cust[0].kode_gudang_pusat_cabang,
    kode_kirim: cust.length === 0 ? null : cust[0].kode_kirim_pusat_cabang,
    kode_jual: cust.length === 0 ? null : cust[0].kode_jual_antar_cabang,
  };

  return payload;
};
