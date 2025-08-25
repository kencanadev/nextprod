import { fetchHpps, fetchKodeAkun } from '../../../api';

export const quExportDetailSJCabangJual = {
  kode_sj: 'oto',
  id_sj: 1,
  kode_do: 'oto',
  id_do: 1,
  kode_so: 'oto',
  id_so: 1,
  kode_item: '',
  diskripsi: '',
  satuan: '',
  qty: 'qudFpacqty',
  sat_std: '',
  qty_std: 0,
  qty_sisa: 0,
  qty_retur: 0,
  kode_mu: '',
  kurs: 0,
  kurs_pajak: 0,
  harga_mu: 0,
  hpp: 'DataCbg.quHppJual.hppj',
  diskon: 'qudFpacdiskon',
  diskon_mu: parseFloat('qudFpacdiskon_mu'),
  potongan_mu: parseFloat('qudFpacpotongan_mu'),
  kode_pajak: 'qudFpackode_pajak',
  pajak: parseFloat('qudFpacpajak'),
  include: 'qudFpacinclude',
  pajak_mu: parseFloat('qudFpacpajak_mu'),
  jumlah_mu: parseFloat('qudFpacqty_std') * parseFloat('qudFpacharga_jual_mu'),
  jumlah_rp: parseFloat('qudFpacqty_std') * parseFloat('qudFpacharga_jual_mu'),
  kode_dept: null,
  kode_kerja: null,
  diskon_dok_mu: 0,
  kirim_mu: 0,
  no_kontrak: 'quMFpacno_reff',
};

export const createDetailSJPenjualPayload = async (editData: any, kode_entitas: any, token: any, hargaJualMu: number) => {
  const detail = editData.detail[0];
  const params = {
    entitas: editData.entitas_cabang_jual,
    param1: editData.detail[0].kode_item,
    param2: 'all',
    param3: editData.kode_gudang_jual,
    token,
  };
  const res = await fetchHpps(params);

  const harga_jual_mu = hargaJualMu != 0 ? hargaJualMu : parseFloat(detail.harga_beli_mu);

  const payload = {
    ...quExportDetailSJCabangJual,
    kode_item: detail.kode_item,
    diskripsi: detail.diskripsi,
    satuan: detail.satuan,
    qty: parseFloat(detail.qty),
    sat_std: detail.sat_std,
    qty_std: parseFloat(detail.qty_std),
    qty_sisa: parseFloat(detail.qty),
    kode_mu: detail.kode_mu,
    kurs: parseFloat(detail.kurs),
    kurs_pajak: parseFloat(detail.kurs_pajak),
    harga_mu: harga_jual_mu,
    kode_pajak: detail.kode_pajak,
    pajak: parseFloat(detail.pajak),
    include: detail.include,
    pajak_mu: parseFloat(detail.pajak_mu),
    jumlah_mu: harga_jual_mu * parseFloat(detail.qty_std),
    jumlah_rp: harga_jual_mu * parseFloat(detail.qty_std),
    kode_dept: detail.kode_dept,
    kode_kerja: detail.kode_kerja,
    no_kontrak: editData.no_reff,
    hpp: res[0].hpp,
    diskon: detail.diskon,
    diskon_mu: detail.diskon_mu,
    potongan_mu: detail.potongan_mu,
  };

  return payload;
};
