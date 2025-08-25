import { fetchCustomerMap } from '../../../api';

export const quExportDetailSO = {
  kode_so: 'oto ',
  id_so: 0,
  kode_fpac: '',
  id_fpac: 0,
  kode_item: '',
  diskripsi: '',
  satuan: '',
  qty: 0,
  sat_std: '',
  qty_std: 0,
  qty_sisa: 0,
  qty_batal: 0,
  qty_sisa_po: 0,
  kode_mu: '',
  kurs: 0,
  kurs_pajak: 0,
  harga_mu: 0,
  diskon: 0, // Note: This is 0 instead of empty string as in previous version
  diskon_mu: 0,
  potongan_mu: 0,
  kode_pajak: '',
  pajak: 0,
  include: 'N',
  pajak_mu: 0,
  jumlah_mu: 0,
  jumlah_rp: 0,
  berat: 0,
  kode_dept: '',
  kode_kerja: null,
};

export const createDetailSOPusatPayload = async (editData: any, kode_entitas: any, token: any) => {
  const detail = editData.detail[0];
  const cust = await fetchCustomerMap(kode_entitas, editData.kode_entitas, token);

  const payload = {
    ...quExportDetailSO,
    id_so: detail.id_fpac,
    kode_fpac: detail.kode_fpac,
    id_fpac: detail.id_fpac,
    kode_item: detail.kode_item,
    diskripsi: detail.diskripsi,
    satuan: detail.satuan,
    qty: parseFloat(detail.qty),
    sat_std: detail.sat_std,
    qty_std: parseFloat(detail.qty_std),
    qty_sisa: parseFloat(detail.qty_std),
    qty_sisa_po: parseFloat(detail.qty_std),
    kode_mu: detail.kode_mu,
    kurs: parseFloat(detail.kurs),
    kurs_pajak: parseFloat(detail.kurs_pajak),
    harga_mu: parseFloat(detail.harga_mu),
    kode_pajak: detail.kode_pajak,
    jumlah_mu: detail.jumlah_mu,
    jumlah_rp: detail.jumlah_rp,
    berat: parseFloat(detail.berat),
    kode_dept: cust.length === 0 ? null : cust[0].kode_dept_pembelian_cabang,
    kode_kerja: detail.kode_kerja,
  };

  return payload;
};
