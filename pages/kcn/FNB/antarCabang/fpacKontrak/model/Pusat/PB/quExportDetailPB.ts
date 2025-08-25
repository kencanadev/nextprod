import { fetchCustomerMap } from '../../../api';

export const quExportDetailPB = {
  kode_lpb: 'oto',
  id_lpb: 1,
  kode_sp: 'oto',
  id_sp: 1,
  kode_pp: '',
  id_pp: 0,
  kode_item: 'quDFpackode_item',
  diskripsi: 'quDFpacdiskripsi',
  satuan: 'quDFpacsatuan',
  qty_po: 'quDFpacqty',
  sat_sj: 'quDFpacsatuan',
  qty_sj: 'quDFpacqty',
  qty: 'quDFpacqty',
  sat_std: 'quDFpacsat_std',
  qty_std: 'quDFpacqty_std',
  qty_sisa: 'quDFpacqty_std',
  qty_retur: 0,
  qty_lkb: 0,
  kode_mu: 'quDFpackode_mu',
  kurs: 'quDFpackurs',
  kurs_pajak: 'quDFpackurs_pajak',
  harga_mu: 'quDFpacharga_beli_mu',
  diskon: '',
  diskon_mu: 0,
  potongan_mu: 0,
  kode_pajak: 'N',
  pajak: 0,
  include: 'N',
  pajak_mu: 0,
  jumlah_mu: 'quDFpacqty_std * quDFpacharga_beli_mu',
  jumlah_rp: 'quDFpacqty_std * quDFpacharga_beli_mu',
  ket: '[No FPAC : quMFpacno_Fpac] - dari ' + 'edCabangBeli' + ' ke ' + 'edCabangJual',
  kode_dept: 'sKodeDept',
  kode_kerja: null,
  export: 'N',
  kode_fpb: null,
  id_fpb: null,
  kode_fpac: 'quMFpackode_fpac',
  id_fpac: 'quDFpacid_fpac',
};

export const createDetailPBPusatPayload = async (editData: any, hargaBeliMu: number, kode_entitas: any, token: any) => {
  const detail = editData.detail[0];
  const cust = await fetchCustomerMap(kode_entitas, editData.kode_entitas, token);
  // const harga_beli_mu = detail.harga_beli_mu != '' ? parseFloat(detail.harga_beli_mu) : hargaBeliMu;
  const harga_beli_mu = hargaBeliMu != 0 ? hargaBeliMu : parseFloat(detail.harga_beli_mu);

  const payload = {
    ...quExportDetailPB,
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
    harga_mu: harga_beli_mu,
    jumlah_mu: parseFloat(detail.qty_std) * harga_beli_mu,
    jumlah_rp: parseFloat(detail.qty_std) * harga_beli_mu,
    kode_dept: cust.length === 0 ? null : cust[0].kode_dept_pembelian_cabang,
    kode_fpac: detail.kode_fpac,
    id_fpac: detail.id_fpac,
    ket: `[No FPAC : ${editData.no_fpac}] - dari ${editData.kode_entitas} ke ${editData.entitas_cabang_jual}`,
  };

  return payload;
};
