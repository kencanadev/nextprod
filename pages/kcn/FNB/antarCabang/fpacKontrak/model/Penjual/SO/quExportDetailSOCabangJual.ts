import { fetchCustomerMap } from '../../../api';

export const quExportDetailSOCabangJual = {
  kode_so: 'oto',
  id_so: 1,
  kode_fpac: '',
  id_fpac: 1,
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
  diskon: '',
  diskon_mu: 0,
  potongan_mu: 0,
  kode_pajak: '',
  pajak: 0,
  include: 'N',
  pajak_mu: 0,
  jumlah_mu: 0, // Calculated: qty_std * harga_mu
  jumlah_rp: 0, // Calculated: qty_std * harga_mu
  berat: 0,
  kode_dept: '',
  kode_kerja: null,
};

export const createDetailSOPenjualPayload = async (editData: any, hargaJualMu: number, kode_entitas: string, token: string) => {
  const detail = editData.detail[0];
  const cust = await fetchCustomerMap(kode_entitas, editData.entitas_cabang_jual, token);
  const harga_jual_mu = hargaJualMu != 0 ? hargaJualMu : parseFloat(detail.harga_beli_mu);

  const payload = {
    ...quExportDetailSOCabangJual,
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
    harga_mu: harga_jual_mu,
    kode_pajak: detail.kode_pajak,
    jumlah_mu: parseFloat(detail.qty_std) * harga_jual_mu,
    jumlah_rp: parseFloat(detail.qty_std) * harga_jual_mu,
    berat: parseFloat(detail.brt),
    kode_dept: cust.length === 0 ? null : cust[0].kode_dept_pembelian_cabang,
    kode_kerja: detail.kode_kerja,
  };

  return payload;
};
