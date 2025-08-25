import { fetchCustomerMap } from '../../../api';

export const quExportDetailPOCabang = {
  kode_sp: 'oto',
  id_sp: 1,
  kode_pp: 'oto',
  id_pp: 1,
  kode_so: null, // Cleared value
  id_so: 0,
  id_fpb: null,
  kode_fpb: null,
  kode_fpac: '',
  id_fpac: 1,
  kode_item: '',
  diskripsi: '',
  satuan: '',
  qty: '',
  sat_std: '',
  qty_std: '',
  qty_sisa: '',
  qty_batal: '',
  kode_mu: '',
  kurs: '',
  kurs_pajak: '',
  harga_mu: '',
  diskon: '',
  diskon_mu: '',
  potongan_mu: '',
  kode_pajak: '',
  pajak: '',
  include: '',
  pajak_mu: '',
  jumlah_mu: '',
  jumlah_rp: '',
  kode_dept: '',
  kode_kerja: null, // Cleared value
  kontrak: 'Y',
};

export const createDetailPOPembeliPayload = async (editData: any, kode_entitas: any, token: any) => {
  // console.log(editData);

  const detail = editData.detail[0];
  const cust = await fetchCustomerMap(kode_entitas, editData.kode_entitas, token);
  // console.log(detail);

  const payload = {
    ...quExportDetailPOCabang,
    kode_fpac: detail.kode_fpac,
    kode_item: detail.kode_item,
    diskripsi: detail.diskripsi,
    satuan: detail.satuan,
    qty: parseFloat(detail.qty),
    sat_std: detail.sat_std,
    qty_std: parseFloat(detail.qty_std),
    qty_sisa: parseFloat(detail.qty_sisa),
    qty_batal: parseFloat(detail.qty_batal),
    kode_mu: detail.kode_mu,
    kurs: parseFloat(detail.kurs),
    kurs_pajak: parseFloat(detail.kurs_pajak),
    harga_mu: parseFloat(detail.harga_mu),
    diskon: detail.diskon,
    diskon_mu: parseFloat(detail.diskon_mu),
    potongan_mu: parseFloat(detail.potongan_mu),
    kode_pajak: detail.kode_pajak,
    pajak: parseFloat(detail.pajak),
    include: detail.include,
    pajak_mu: parseFloat(detail.pajak_mu),
    jumlah_mu: parseFloat(detail.jumlah_mu),
    jumlah_rp: parseFloat(detail.jumlah_rp),
    kode_dept: cust.length === 0 ? null : cust[0].kode_dept_pembelian_cabang,
    kode_kerja: detail.kode_kerja,
  };

  return payload;
};
