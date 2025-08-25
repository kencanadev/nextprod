import { fetchCustomerMap } from '../../../api';

export const quExportDetailPO = {
  kode_sp: 'oto',
  id_sp: 1,
  kode_pp: null, // Nilai dikosongkan
  id_pp: 0,
  kode_so: 'oto',
  id_so: 1,
  kode_fpb: null, // Nilai dikosongkan
  id_fpb: 0,
  kode_fpac: 'quMFpackode_fpac.AsString',
  id_fpac: 'quDFpacid_fpac.AsInteger',
  kode_item: 'quDFpackode_item.AsString',
  diskripsi: 'quDFpacdiskripsi.AsString',
  satuan: 'quDFpacsatuan.AsString',
  qty: 'quDFpacqty.AsFloat',
  sat_std: 'quDFpacsat_std.AsString',
  qty_std: 'quDFpacqty_std.AsFloat',
  qty_sisa: 'quDFpacqty_sisa.AsFloat',
  qty_batal: 'quDFpacqty_batal.AsFloat',
  kode_mu: 'quDFpackode_mu.AsString',
  kurs: 'quDFpackurs.AsFloat',
  kurs_pajak: 'quDFpackurs_pajak.AsFloat',
  harga_mu: 'quDFpacharga_beli_mu.AsFloat',
  diskon: '', // Nilai kosong
  diskon_mu: 0,
  potongan_mu: 0,
  kode_pajak: 'N',
  pajak: 0,
  include: 'N',
  pajak_mu: 0,
  jumlah_mu: 'quDFpacqty_std.AsFloat * quDFpacharga_beli_mu.AsFloat',
  jumlah_rp: 'quDFpacqty_std.AsFloat * quDFpacharga_beli_mu.AsFloat',
  kode_dept: 'sKodeDept',
  kode_kerja: null, // Nilai dikosongkan
  kontrak: 'Y',
};

export const createDetailPOPusatPayload = async (editData: any, hargaBeliMu: number, kode_entitas: any, token: any) => {
  // console.log(editData);

  const cust = await fetchCustomerMap(kode_entitas, editData.kode_entitas, token);
  const detail = editData.detail[0];
  // console.log(detail);
  // const harga_beli_mu = detail.harga_beli_mu != '' ? parseFloat(detail.harga_beli_mu) : hargaBeliMu;
  const harga_beli_mu = hargaBeliMu != 0 ? hargaBeliMu : parseFloat(detail.harga_beli_mu);

  const payload = {
    ...quExportDetailPO,
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
    harga_mu: harga_beli_mu,
    jumlah_mu: harga_beli_mu * parseFloat(detail.qty_std),
    jumlah_rp: harga_beli_mu * parseFloat(detail.qty_std),
    kode_dept: cust.length === 0 ? null : cust[0].kode_dept_pembelian_cabang,
    id_fpac: detail.id_fpac,
  };

  return payload;
};
