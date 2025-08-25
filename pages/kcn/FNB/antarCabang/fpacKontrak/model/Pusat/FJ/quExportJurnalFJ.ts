import { generateNUDivisi, ResetTime } from '@/utils/routines';
import moment from 'moment';
import { fetchCustomerMap } from '../../../api';

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

export const createJurnalFJPusatPayload = async (editData: any, kode_entitas: string, token: any) => {
  const sJumlahFB = parseFloat(editData.total_mu) * parseFloat(editData.kurs);
  const cust = await fetchCustomerMap(kode_entitas, kode_entitas, token);

  const sNoFJ = await generateNUDivisi(kode_entitas, '', '01', '13', moment().format('YYYYMM'), moment().format('YYMM') + '01');
  const payload1 = {
    ...quExportJurnalFJ,
    tgl_dokumen: moment(editData.tgl_trxfpac).format('YYYY-MM-DD HH:mm:ss'),
    kurs: parseFloat(editData.kurs),
    debet_rp: sJumlahFB,
    kredit_rp: 0,
    jumlah_rp: sJumlahFB,
    jumlah_mu: sJumlahFB,
    catatan: `Piutang Faktur No ${sNoFJ}`,
    userid: editData.userid,
    kode_subledger: editData.kode_cust_pusat,
    kode_akun: cust.length === 0 ? null : cust[0].kode_akun_piutang,
    kode_jual: cust.length === 0 ? null : cust[0].kode_jual_antar_cabang,
  };

  const payload2 = {
    ...quExportJurnalFJ,
    id_dokumen: 2,
    tgl_dokumen: moment(editData.tgl_trxfpac).format('YYYY-MM-DD HH:mm:ss'),
    kurs: parseFloat(editData.kurs),
    debet_rp: 0,
    kredit_rp: sJumlahFB,
    jumlah_rp: -1 * sJumlahFB,
    jumlah_mu: -1 * sJumlahFB,
    catatan: `Penjualan Faktur No ${sNoFJ} kepada ${editData.kode_kirim_cabang_jual}`, // harusnya GetNamaCustCabangjual(quCust.FieldValues['kode_cust_pusat_cabang'])
    userid: editData.userid,
    kode_jual: cust.length === 0 ? null : cust[0].kode_jual_antar_cabang,
  };

  return [{ ...payload1 }, { ...payload2 }];
};
