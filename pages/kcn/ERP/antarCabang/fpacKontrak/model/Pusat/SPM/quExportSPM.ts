import { generateNUDivisi, ResetTime } from '@/utils/routines';
import moment from 'moment';
import { fetchCustomerMap, fetchDetailCustomer } from '../../../api';

export const quExportSPM = {
  kode_do: 'oto',
  no_do: '',
  tgl_do: "ResetTime('do', TglDokumenEfektif)",
  tgl_kirim: "ResetTime('do', TglDokumenEfektif)", // Menggunakan tgl_do sebagai tgl_kirim
  kode_cust: 'quMFpackode_cust_pusat.AsString',
  alamat_kirim: 'quMFpacalamat_kirim_cabang.AsString',
  via: 'ARMADA SENDIRI',
  fob: 'Diambil',
  pengemudi: 'AUTO FPAC',
  nopol: 'AUTO FPAC',
  total_berat: 'sTotalBerat',
  keterangan: "'[No FPAC : ' + quMFpacno_Fpac.AsString + '] - [dari ' + trim(edCabangBeli.Text) + ' ke ' + trim(edCabangJual.Text) + ']'",
  status: 'Terbuka',
  userid: 'Userid',
  tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'), // Menggunakan waktu saat ini
  kode_gudang: 'quMFpackode_gudang_pusat.AsString',
  kode_kirim: "quCustCabang.FieldValues['kode_kirim']",
  kode_jual: "quCust.FieldValues['kode_jual_antar_cabang']",
};

export const createSPMPusatPayload = async (editData: any, kode_entitas: string, token: string, updateState: any, tipe: string) => {
  const cust = await fetchCustomerMap(kode_entitas, editData.kode_entitas, token);
  const detailCust = await fetchDetailCustomer(kode_entitas, cust[0].kode_cust, token);
  const noDo = await generateNUDivisi(kode_entitas, '', cust[0].kode_jual_antar_cabang, '11', moment().format('YYYYMM'), moment().format('YYMM') + cust[0].kode_jual_antar_cabang);

  updateState('noSpmPusat', noDo);

  const keterangan =
    tipe === 'Y'
      ? `[No FPAC : ${editData.no_fpac}] - [dari ${editData.kode_entitas} ke ${editData.entitas_cabang_jual}]`
      : `[No FPAC : ${editData.no_fpac}] - [dari ${editData.kode_entitas} ke ${editData.entitas_cabang_jual}] - ${editData.keterangan}`;

  const payload = {
    ...quExportSPM,
    no_do: noDo,
    tgl_do: await ResetTime(editData.kode_entitas, editData.tgl_trxfpac),
    tgl_kirim: await ResetTime(editData.kode_entitas, editData.tgl_trxfpac),
    kode_cust: editData.kode_cust_pusat,
    alamat_kirim: editData.alamat_kirim_cabang,
    total_berat: parseFloat(editData.total_berat),
    keterangan, // harusnya cabang beli
    kode_gudang: editData.kode_gudang_pusat,
    userid: editData.userid,
    kode_kirim: cust.length === 0 ? null : cust[0].kode_kirim,
    kode_jual: cust.length === 0 ? null : cust[0].kode_jual_antar_cabang,
  };

  return payload;
};
