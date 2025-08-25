import { fetchHpps, fetchKodeAkun } from '../../../api';

export const quExportDetailMBCabangJual = {
  kode_mb: 'oto',
  id_mb: 1,
  kode_pmb: null,
  id_pmb: 0,
  kode_item: 'DataCbg.quItemCabangJual.kode_item',
  satuan: 'quDFpac.satuan',
  qty: 'quDFpac.qty',
  sat_std: 'quDFpac.sat_std',
  qty_std: 'qtyStd',
  harga_rp: 'hpp',
  hpp: 'hpp',
  jumlah_rp: 'qtyStd * hpp',
  berat: 0,
  no_kontrak: 'quDFpac.no_reff',
};

export const createDetailMBPenjualPayload = async (editData: any, kode_entitas: string, token: string) => {
  const detail = editData.detail[0];
  // const kode_akun = await fetchKodeAkun(editData.entitas_cabang_jual, editData.detail[0].no_item, token);
  // const hpp = kode_akun[0].hpp;
  const params = {
    entitas: editData.entitas_cabang_jual,
    param1: detail.kode_item,
    param2: 'all',
    param3: editData.kode_gudang_jual,
    token,
  };
  const res = await fetchHpps(params);

  const payload = {
    ...quExportDetailMBCabangJual,
    kode_item: detail.kode_item,
    satuan: detail.satuan,
    qty: parseFloat(detail.qty),
    sat_std: detail.sat_std,
    qty_std: parseFloat(detail.qty_std),
    harga_rp: parseFloat(res[0].hpp),
    hpp: parseFloat(res[0].hpp),
    jumlah_rp: parseFloat(detail.qty_std) * parseFloat(res[0].hpp),
    no_kontrak: editData.no_reff,
  };

  return payload;
};
