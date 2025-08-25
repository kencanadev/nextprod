import { fetchKodeAkun } from '../../../api';

export const quExportDetailSJ = {
  kode_sj: 'oto',
  id_sj: 1,
  kode_do: 'oto',
  id_do: 1,
  kode_so: 'oto',
  id_so: 1,
  kode_item: 'quDFpackode_item.AsString',
  diskripsi: 'quDFpacdiskripsi.AsString',
  satuan: 'qudFpacsatuan.AsString',
  qty: 'qudFpacqty.AsFloat',
  sat_std: 'qudFpacsat_std.AsString',
  qty_std: 'qudFpacqty_std.AsFloat',
  qty_sisa: 'qudFpacqty.AsFloat',
  qty_retur: 0,
  kode_mu: 'qudFpackode_mu.AsString',
  kurs: 'qudFpackurs.AsFloat',
  kurs_pajak: 'qudFpackurs_pajak.AsFloat',
  harga_mu: 'qudFpacharga_mu.AsFloat',
  hpp: "quHpp.FieldValues['hppj']",
  diskon: 'qudFpacdiskon.AsString',
  diskon_mu: 'qudFpacdiskon_mu.AsFloat',
  potongan_mu: 'qudFpacpotongan_mu.AsFloat',
  kode_pajak: 'qudFpackode_pajak.AsString',
  pajak: 'qudFpacpajak.AsFloat',
  include: 'qudFpacinclude.AsString',
  pajak_mu: 'qudFpacpajak_mu.AsFloat',
  jumlah_mu: 'qudFpacqty_std.AsFloat * qudFpacharga_mu.AsFloat',
  jumlah_rp: 'qudFpacqty_std.AsFloat * qudFpacharga_mu.AsFloat',
  kode_dept: null,
  kode_kerja: null,
  diskon_dok_mu: 0,
  kirim_mu: 0,
  no_kontrak: 'quMFpacno_reff.AsString',
};

export const createDetailSJPusatPayload = async (editData: any, hargaBeliMu: number) => {
  const detail = editData.detail[0];
  const harga_beli_mu = hargaBeliMu != 0 ? hargaBeliMu : parseFloat(detail.harga_beli_mu);

  const payload = {
    ...quExportDetailSJ,
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
    harga_mu: parseFloat(detail.harga_mu),
    kode_pajak: detail.kode_pajak,
    pajak: parseFloat(detail.pajak),
    include: detail.include,
    pajak_mu: parseFloat(detail.pajak_mu),
    jumlah_mu: detail.jumlah_mu,
    jumlah_rp: detail.jumlah_rp,
    kode_dept: detail.kode_dept,
    kode_kerja: detail.kode_kerja,
    no_kontrak: editData.no_reff,
    hpp: harga_beli_mu,
    diskon: detail.diskon,
    diskon_mu: detail.diskon_mu,
    potongan_mu: detail.potongan_mu,
  };

  return payload;
};
