import { fetchHpps } from '../../../api';

export const quExportDetailFJCabangJual = {
  kode_fj: 'oto', // Will be populated with sKodeFJ
  id_fj: 1, // Will be populated with sIdFJ
  kode_sj: 'oto', // Will be populated with fkodesj
  id_sj: 1, // Will be populated with sIdFJ
  kode_do: 'oto', // Will be populated with fkodespm
  id_do: 1, // Will be populated with sIdFJ
  kode_so: 'oto', // Will be populated with fkodeso
  id_so: 1, // Will be populated with sIdFJ
  kode_item: null, // From DataCbg.quItemCabangJual
  diskripsi: null, // From DataCbg.quItemCabangJual (nama_item)
  satuan: null, // From qudFpacsatuan
  qty: 0, // From qudFpacqty
  sat_std: null, // From qudFpacsat_std
  qty_std: 0, // From qudFpacqty_std
  qty_sisa: 0, // Same as qty
  kode_mu: null, // From qudFpackode_mu
  kurs: 0, // From qudFpackurs
  kurs_pajak: 0, // From qudFpackurs_pajak
  harga_mu: 0, // From qudFpacharga_jual_mu
  diskon: null, // From qudFpacdiskon
  diskon_mu: 0, // From qudFpacdiskon_mu
  potongan_mu: 0, // From qudFpacpotongan_mu
  kode_pajak: null, // From qudFpackode_pajak
  pajak: 0, // From qudFpacpajak
  include: null, // From qudFpacinclude
  pajak_mu: 0, // From qudFpacpajak_mu
  jumlah_mu: 0, // Calculated: qty_std * harga_mu
  jumlah_rp: 0, // Same as jumlah_mu
  berat: 0, // From qudFpacbrt
  kode_dept: null,
  kode_kerja: null,
  hpp: 0, // From DataCbg.quHppJual.hppj
  bonus: 'N',
  id_bonus: 0,
};

export const createDetailFJPenjualPayload = async (editData: any, hargaJualMu: number, token: string) => {
  const detail = editData.detail[0];
  const params = {
    entitas: editData.entitas_cabang_jual,
    param1: editData.detail[0].kode_item,
    param2: 'all',
    param3: editData.kode_gudang_jual,
    token,
  };
  const res = await fetchHpps(params);

  const payload = {
    ...quExportDetailFJCabangJual,
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
    harga_mu: hargaJualMu,
    diskon: detail.diskon,
    diskon_mu: parseFloat(detail.diskon_mu),
    potongan_mu: parseFloat(detail.potongan_mu),
    kode_pajak: detail.kode_pajak,
    pajak: parseFloat(detail.pajak),
    include: detail.include,
    pajak_mu: parseFloat(detail.pajak_mu),
    jumlah_mu: hargaJualMu * parseFloat(detail.qty_std),
    jumlah_rp: hargaJualMu * parseFloat(detail.qty_std),
    hpp: res[0].hpp,
  };

  return payload;
};
