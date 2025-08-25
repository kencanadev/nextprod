import { fetchCustomerMap } from '../../../api';

export const quExportDetailPBCabang = {
  kode_lpb: 'oto',
  id_lpb: 1,
  kode_sp: 'oto',
  id_sp: 1,
  kode_pp: 'oto',
  id_pp: 1,
  kode_item: '',
  diskripsi: '',
  satuan: '',
  qty_po: 0.0,
  sat_sj: '',
  qty_sj: 0.0,
  qty: 0.0,
  sat_std: '',
  qty_std: 0.0,
  qty_sisa: 0.0,
  qty_retur: 0.0,
  qty_lkb: 0.0,
  kode_mu: '',
  kurs: 0.0,
  kurs_pajak: 0.0,
  harga_mu: 0.0,
  diskon: '',
  diskon_mu: 0.0,
  potongan_mu: 0.0,
  kode_pajak: 'N',
  pajak: 0.0,
  include: 'N',
  pajak_mu: 0.0,
  jumlah_mu: 0.0,
  jumlah_rp: 0.0,
  ket: '',
  kode_dept: '',
  kode_kerja: null,
  export: 'N',
  kode_fpb: null,
  id_fpb: null,
  kode_fpac: 'string',
  id_fpac: 0,
};

export const createDetailPBPembeliPayload = async (editData: any, kode_entitas: any, token: any) => {
  const detail = editData.detail[0];
  const cust = await fetchCustomerMap(kode_entitas, editData.kode_entitas, token);

  const payload = {
    ...quExportDetailPBCabang,
    kode_item: detail.kode_item,
    diskripsi: detail.diskripsi,
    satuan: detail.satuan,
    qty_po: parseFloat(detail.qty),
    sat_sj: detail.satuan,
    qty_sj: parseFloat(detail.qty),
    qty: parseFloat(detail.qty),
    sat_std: detail.sat_std,
    qty_std: parseFloat(detail.qty_std),
    qty_sisa: parseFloat(detail.qty_std),
    kode_mu: detail.kode_mu,
    kurs: parseFloat(detail.kurs),
    kurs_pajak: parseFloat(detail.kurs_pajak),
    harga_mu: parseFloat(detail.harga_mu),
    jumlah_mu: parseFloat(detail.qty_std) * parseFloat(detail.harga_mu),
    jumlah_rp: parseFloat(detail.qty_std) * parseFloat(detail.harga_mu),
    kode_dept: cust.length === 0 ? null : cust[0].kode_dept_pembelian_cabang,
    kode_fpac: detail.kode_fpac,
    id_fpac: detail.id_fpac,
  };

  return payload;
};
