import { fetchCustomerMap } from '../../../api';

export const quExportDetailFB = {
  kode_fb: 'oto', // Mengambil kode_fb
  id_fb: 1, // Mengambil id_fb
  kode_lpb: 'oto', // Mengambil kode_lpb
  id_lpb: 1, // Mengambil id_lpb
  kode_sp: 'oto', // Mengambil kode_sp
  id_sp: 1, // Mengambil id_sp
  kode_pp: '', // Kosong
  id_pp: 0, // Default value
  kode_item: 'qudFpackode_item.AsString', // Mengambil kode_item
  diskripsi: 'qudFpacdiskripsi.AsString', // Mengambil deskripsi
  satuan: 'qudFpacsatuan.AsString', // Mengambil satuan
  qty: 'qudFpacqty.AsFloat', // Mengambil kuantitas
  sat_std: 'qudFpacsat_std.AsString', // Mengambil satuan standar
  qty_std: 'qudFpacqty_std.AsFloat', // Mengambil kuantitas standar
  kode_mu: 'qudFpackode_mu.AsString', // Mengambil kode mata uang
  kurs: 'qudFpackurs.AsFloat', // Mengambil kurs
  kurs_pajak: 'qudFpackurs_pajak.AsFloat', // Mengambil kurs pajak
  harga_mu: 'qudFpacharga_beli_mu.AsFloat', // Mengambil harga mata uang
  diskon: 'qudFpacdiskon.AsString', // Mengambil diskon dalam string
  diskon_mu: 'qudFpacdiskon_mu.AsFloat', // Mengambil diskon dalam mata uang
  potongan_mu: 'qudFpacpotongan_mu.AsFloat', // Mengambil potongan dalam mata uang
  kode_pajak: 'qudFpackode_pajak.AsString', // Mengambil kode pajak
  pajak: 'qudFpacpajak.AsFloat', // Mengambil pajak
  include: 'qudFpacinclude.AsString', // Mengambil include status
  pajak_mu: 'qudFpacpajak_mu.AsFloat', // Mengambil pajak dalam mata uang
  jumlah_mu: 'qudFpacqty_std.AsFloat * qudFpacharga_beli_mu.AsFloat', // Menghitung jumlah dalam mata uang
  jumlah_rp: 'qudFpacqty_std.AsFloat * qudFpacharga_beli_mu.AsFloat', // Menghitung jumlah dalam rupiah
  ket: null, // Kosongkan keterangan
  kode_dept: 'sKodeDept', // Mengambil kode departemen
  kode_kerja: null, // Kosongkan kode kerja
  berat: 'qudFpacberat.AsFloat', // Mengambil berat
};

export const createDetailFBPusatPayload = async (editData: any, hargaBeliMu: number, kode_entitas: any, token: any) => {
  // console.log(editData);

  const detail = editData.detail[0];
  // const harga_beli_mu = detail.harga_beli_mu != '' ? parseFloat(detail.harga_beli_mu) : hargaBeliMu;
  const harga_beli_mu = hargaBeliMu != 0 ? hargaBeliMu : parseFloat(detail.harga_beli_mu);
  const totalMu = detail.qty_std * harga_beli_mu;
  const cust = await fetchCustomerMap(kode_entitas, editData.kode_entitas, token);
  // console.log(detail);

  const payload = {
    ...quExportDetailFB,
    kode_item: detail.kode_item,
    diskripsi: detail.diskripsi,
    satuan: detail.satuan,
    qty: parseFloat(detail.qty),
    sat_std: detail.sat_std,
    qty_std: parseFloat(detail.qty_std),
    kode_mu: detail.kode_mu,
    kurs: parseFloat(detail.kurs),
    kurs_pajak: parseFloat(detail.kurs_pajak),
    harga_mu: parseFloat(detail.harga_beli_mu) > 0 ? parseFloat(detail.harga_beli_mu) : hargaBeliMu,
    diskon: detail.diskon,
    diskon_mu: parseFloat(detail.diskon_mu),
    potongan_mu: parseFloat(detail.potongan_mu),
    kode_pajak: detail.kode_pajak,
    pajak: parseFloat(detail.pajak),
    include: detail.include,
    pajak_mu: parseFloat(detail.pajak_mu),
    jumlah_mu: totalMu,
    jumlah_rp: totalMu,
    kode_dept: cust.length === 0 ? null : cust[0].kode_dept_pembelian_cabang,
    kode_kerja: detail.kode_kerja,
    berat: parseFloat(detail.berat),
  };

  return payload;
};
