import moment from 'moment';
import { fetchAkunJurnal, fetchCustomerMap, fetchKodeAkun } from '../../../api';
import { hitungTotalDebet } from '../../../helpers/hitungTotalRpMu';
import { generateNU } from '@/utils/routines';

const quExportJurnalPBCabang = {
  kode_dokumen: 'oto',
  id_dokumen: 1,
  dokumen: 'PB',
  tgl_dokumen: '', // moment(masterFpb.tgl_berlaku).format('YYYY-MM-DD HH:mm:ss'),
  kode_akun: '',
  kode_subledger: null,
  kurs: 1,
  debet_rp: 0,
  kredit_rp: 0,
  jumlah_rp: 0,
  jumlah_mu: 0,
  catatan: '', // `Mutasi barang dari gudang ${namaGudang}`,
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

export const createJurnalPBPembeliPayload = async (editData: any, kode_entitas: string, token: string) => {
  // Ambil kode_akun untuk item pertama
  const kode_akun = await fetchKodeAkun(kode_entitas, editData.detail[0].no_item, token);
  const akun_jurnal = await fetchAkunJurnal(kode_entitas, kode_akun[0].kode_akun_persediaan, token);

  const cust = await fetchCustomerMap(kode_entitas, editData.kode_entitas, token);

  const noLpb = await generateNU(editData.kode_entitas, '', '04', moment().format('YYYYMM'));

  const payload1 = {
    ...quExportJurnalPBCabang,
    tgl_dokumen: moment(editData.tgl_trxfpac).format('YYYY-MM-DD HH:mm:ss'),
    kode_akun: akun_jurnal[0].kode_akun, // nanti diisi dengan akun dari api
    debet_rp: editData.total_mu,
    kredit_rp: 0,
    jumlah_rp: editData.total_mu,
    jumlah_mu: editData.total_mu / 1,
    catatan: `Penerimaan Barang No: ${noLpb}`,
    kode_kerja: editData.detail[0].kode_kerja,
    kode_dept: cust.length === 0 ? null : cust[0].kode_dept_pembelian_cabang,
    userid: editData.userid,
  };

  const payload2 = {
    ...quExportJurnalPBCabang,
    id_dokumen: 2,
    tgl_dokumen: moment(editData.tgl_trxfpac).format('YYYY-MM-DD HH:mm:ss'),
    kode_akun: 'AK0000000070', // akun hutang
    debet_rp: 0,
    kredit_rp: editData.total_mu,
    jumlah_rp: -1 * editData.total_mu,
    jumlah_mu: -1 * (editData.total_mu / 1),
    catatan: `Hutang ${editData.nama_relasi}, PB No: ${noLpb}`,
    kode_dept: cust.length === 0 ? null : cust[0].kode_dept_pembelian_cabang,
    kode_kerja: editData.detail[0].kode_kerja,
    userid: editData.userid,
    kode_subledger: cust.length === 0 ? null : cust[0].kode_supp_cabang,
  };

  return [{ ...payload1 }, { ...payload2 }];
};
