export const quExportDetailFJ = {
  kode_fj: 'oto',
  id_fj: 1,
  kode_sj: 'oto',
  id_sj: 1,
  kode_do: 'oto',
  id_do: 1,
  kode_so: 'oto',
  id_so: 1,
  kode_item: 'kode_item',
  diskripsi: 'diskripsi',
  satuan: 'satuan',
  qty: 10.0, // contoh nilai kuantitas
  sat_std: 'sat_std',
  qty_std: 10.0, // contoh nilai kuantitas standar
  qty_sisa: 10.0, // contoh nilai kuantitas sisa
  kode_mu: 'kode_mu',
  kurs: 1.0, // contoh nilai kurs
  kurs_pajak: 1.0, // contoh kurs pajak
  harga_mu: 100000.0, // contoh harga dalam MU
  diskon: '0%', // contoh diskon
  diskon_mu: 0.0,
  potongan_mu: 0.0,
  kode_pajak: 'kode_pajak',
  pajak: 10.0, // contoh pajak
  include: 'Y', // contoh data apakah pajak termasuk
  pajak_mu: 0, // contoh pajak dalam MU
  jumlah_mu: 0, // contoh total jumlah dalam MU (qty_std * harga_mu)
  jumlah_rp: 0, // contoh total jumlah dalam RP (qty_std * harga_mu)
  berat: 0, // contoh berat
  kode_dept: null,
  kode_kerja: null,
  hpp: 0, // contoh harga pokok penjualan
  bonus: 'N',
  id_bonus: 0,
};

export const createDetailFJPusatPayload = async (editData: any, hargaBeliMu: any) => {
  const detail = editData.detail[0];
  const harga_beli_mu = hargaBeliMu != 0 ? hargaBeliMu : parseFloat(detail.harga_beli_mu);

  const payload = {
    ...quExportDetailFJ,
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
    diskon: detail.diskon,
    diskon_mu: parseFloat(detail.diskon_mu),
    potongan_mu: parseFloat(detail.potongan_mu),
    kode_pajak: detail.kode_pajak,
    pajak: parseFloat(detail.pajak),
    include: detail.include,
    pajak_mu: parseFloat(detail.pajak_mu),
    jumlah_mu: parseFloat(detail.harga_mu) * parseFloat(detail.qty_std),
    jumlah_rp: parseFloat(detail.harga_mu) * parseFloat(detail.qty_std),
    berat: detail.brt,
    hpp: harga_beli_mu,
  };

  return payload;
};
