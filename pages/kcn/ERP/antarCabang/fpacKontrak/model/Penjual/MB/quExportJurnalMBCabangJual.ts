import moment from 'moment';
import { fetchAkunJurnal, fetchHpps, fetchKodeAkun } from '../../../api';
import { hitungTotalDebet } from '../../../helpers/hitungTotalRpMu';

export const quExportJurnalMBCabangJual = {
  kode_dokumen: 'oto',
  id_dokumen: 1,
  dokumen: 'MB',
  tgl_dokumen: '',
  kode_akun: '',
  kode_subledger: null,
  kurs: 1,
  debet_rp: '',
  kredit_rp: 0,
  jumlah_rp: '',
  jumlah_mu: '', // Maintained original calculation even though it's redundant
  catatan: '',
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
  tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
  audit: null,
  kode_kry: null,
  kode_jual: null,
  no_kontrak_um: null,
};

export const createJurnalMBPenjualPayload = async (editData: any, kode_entitas: string, token: string) => {
  // Ambil kode_akun untuk item pertama
  const kode_akun = await fetchKodeAkun(kode_entitas, editData.detail[0].no_item, token);
  const akun_jurnal = await fetchAkunJurnal(kode_entitas, kode_akun[0].kode_akun_persediaan, token);

  const params = {
    entitas: editData.entitas_cabang_jual,
    param1: editData.detail[0].kode_item,
    param2: 'all',
    param3: editData.kode_gudang_jual,
    token,
  };
  const res = await fetchHpps(params);

  const total_mu = res[0].hpp * parseFloat(editData.detail[0].qty_std);

  const payload1 = {
    ...quExportJurnalMBCabangJual,
    tgl_dokumen: moment(editData.tgl_trxfpac).format('YYYY-MM-DD HH:mm:ss'),
    kode_akun: akun_jurnal[0].kode_akun,
    debet_rp: total_mu,
    kredit_rp: 0,
    jumlah_rp: total_mu,
    jumlah_mu: total_mu / 1,
    catatan: `Mutasi barang dari gudang ${editData.nama_gudang_jual}`,
    userid: editData.userid,
  };

  const payload2 = {
    ...quExportJurnalMBCabangJual,
    id_dokumen: 2,
    tgl_dokumen: moment(editData.tgl_trxfpac).format('YYYY-MM-DD HH:mm:ss'),
    kode_akun: akun_jurnal[0].kode_akun,
    debet_rp: 0,
    kredit_rp: total_mu,
    jumlah_rp: -1 * total_mu,
    jumlah_mu: -1 * (total_mu / 1),
    catatan: `Mutasi barang ke gudang ${editData.nama_gudang_jual}`,
    userid: editData.userid,
  };

  return [{ ...payload1 }, { ...payload2 }];
};
