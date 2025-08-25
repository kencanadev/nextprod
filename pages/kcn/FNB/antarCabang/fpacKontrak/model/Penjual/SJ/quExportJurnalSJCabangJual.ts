import moment from 'moment';
import { fetchCustomerMap, fetchHpps, fetchKodeAkun } from '../../../api';
import { hitungTotalDebet } from '../../../helpers/hitungTotalRpMu';
import { generateNUDivisi } from '@/utils/routines';

export const quExportJurnalSJCabangJual = {
  kode_dokumen: 'oto',
  id_dokumen: 1,
  dokumen: 'SJ',
  tgl_dokumen: '',
  kode_akun: '',
  kode_subledger: null,
  kurs: '',
  debet_rp: '',
  kredit_rp: 0,
  jumlah_rp: '',
  jumlah_mu: '',
  catatan: `Harga Pokok No. SJ: ${'sNoSJ'}`,
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
  tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'), // equivalent to Now
  audit: null,
  kode_kry: null,
  kode_jual: 'quCust.kode_jual_antar_cabang',
  no_kontrak_um: null,
};

export const createJurnalSJPembeliPayload = async (editData: any, kode_entitas: string, token: string) => {
  // Ambil kode_akun untuk item pertama
  const kode_akun = await fetchKodeAkun(kode_entitas, editData.detail[0].no_item, token);
  const cust = await fetchCustomerMap(kode_entitas, editData.entitas_cabang_jual, token);

  const no_sj = await generateNUDivisi(editData.entitas_cabang_jual, '', cust[0].kode_jual_antar_cabang, '12', moment().format('YYYYMM'), moment().format('YYMM') + cust[0].kode_jual_antar_cabang);

  const params = {
    entitas: editData.entitas_cabang_jual,
    param1: editData.detail[0].kode_item,
    param2: 'all',
    param3: editData.kode_gudang_jual,
    token,
  };
  const res = await fetchHpps(params);
  const hpp = res[0].hpp;

  const payload1 = {
    ...quExportJurnalSJCabangJual,
    tgl_dokumen: moment(editData.tgl_trxfpac).format('YYYY-MM-DD HH:mm:ss'),
    kode_akun: kode_akun[0].kode_akun_hpp,
    kurs: parseFloat(editData.kurs),
    debet_rp: parseFloat(hpp),
    kredit_rp: 0,
    jumlah_rp: parseFloat(hpp),
    jumlah_mu: parseFloat(hpp),
    catatan: `Harga Pokok No. SJ: ${no_sj}`,
    userid: editData.userid,
    kode_jual: cust.length === 0 ? null : cust[0].kode_jual_antar_cabang,
  };

  const payload2 = {
    ...quExportJurnalSJCabangJual,
    id_dokumen: 2,
    tgl_dokumen: moment(editData.tgl_trxfpac).format('YYYY-MM-DD HH:mm:ss'),
    kode_akun: kode_akun[0].kode_akun_persediaan,
    kurs: parseFloat(editData.kurs),
    debet_rp: 0,
    kredit_rp: parseFloat(hpp),
    jumlah_rp: -1 * parseFloat(hpp),
    jumlah_mu: -1 * parseFloat(hpp),
    catatan: `Persediaan barang No. SJ: ${no_sj}`,
    userid: editData.userid,
    kode_jual: cust.length === 0 ? null : cust[0].kode_jual_antar_cabang,
  };

  return [{ ...payload1 }, { ...payload2 }];
};
