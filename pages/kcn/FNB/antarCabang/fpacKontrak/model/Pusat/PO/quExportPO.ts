import { generateNU, generateNUDivisi, ResetTime } from '@/utils/routines';
import moment from 'moment';

export const quExportPO = {
  kode_sp: 'oto',
  no_sp: 'sNoPO',
  tgl_sp: "ResetTime('sp', TglDokumenEfektif)",
  kode_supp: 'quMFpackode_supp.AsString',
  tgl_berlaku: 'quMFpactgl_berlaku.AsDateTime',
  tgl_kirim: 'quMFpactgl_kirim.AsDateTime',
  alamat_kirim: 'edAlamat.Text',
  via: 'quMFpacvia.AsString',
  fob: 'quMFpacfob.AsString',
  kode_termin: 'quMFpackode_termin.AsString',
  kode_mu: 'quMFpackode_mu.AsString',
  kurs: 'quMFpackurs.AsFloat',
  kurs_pajak: 'quMFpackurs_pajak.AsFloat',
  kena_pajak: 'quMFpackena_pajak.AsString',
  total_mu: 'sTotalMU',
  diskon_dok: null, // Nilai dikosongkan
  diskon_dok_mu: 0,
  total_diskon_mu: 0,
  total_pajak_mu: 0,
  kirim_mu: 0,
  netto_mu: 'sTotalMU',
  total_rp: 'sTotalMU',
  diskon_dok_rp: 0,
  total_diskon_rp: 0,
  total_pajak_rp: 0,
  kirim_rp: 0,
  netto_rp: 'sTotalMU',
  total_berat: 'sTotalBerat',
  keterangan: "'[No FPAC : ' + quMFpacno_Fpac.AsString + '] - [dari ' + trim(edCabangBeli.Text) + ' ke ' + trim(edCabangJual.Text) + '] ' + emKetPusat.Text",
  status: 'Terbuka',
  userid: 'Userid',
  tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
  approval: 'Y',
  tgl_approval: moment().format('YYYY-MM-DD HH:mm:ss'),
  kirim_langsung: 'Y',
  status_kirim: 'N',
  no_sjpabrik: null, // Nilai dikosongkan
  tgl_sjpabrik: null, // Nilai dikosongkan
  tgl_sjfax: null, // Nilai dikosongkan
  nota: null, // Nilai dikosongkan
};

export const createPOPusatPayload = async (editData: any, termin: any, kode_entitas: any, updateState: any, hargaBeliMu: number, tipe: string) => {
  const kode_termin = termin.length === 0 ? null : termin[0].kode_termin;
  const noSp = await generateNU(kode_entitas, '', '02', moment().format('YYYYMM'));
  const detail = editData.detail[0];
  // const harga_beli_mu = detail.harga_beli_mu != '' ? parseFloat(detail.harga_beli_mu) : hargaBeliMu;
  const harga_beli_mu = hargaBeliMu != 0 ? hargaBeliMu : parseFloat(detail.harga_beli_mu);
  const totalMu = parseFloat(detail.qty_std) * harga_beli_mu;

  updateState('noPoPusat', noSp);

  const keterangan =
    tipe === 'Y'
      ? `[No FPAC : ${editData.no_fpac}] - [dari ${editData.kode_entitas} ke ${editData.entitas_cabang_jual}] ${editData.keterangan}`
      : `[No FPAC : ${editData.no_fpac}] - [dari ${editData.kode_entitas} ke ${editData.entitas_cabang_jual}] - ${editData.keterangan}`;

  const payload: any = {
    ...quExportPO,
    no_sp: noSp,
    tgl_sp: await ResetTime(editData?.kode_entitas, editData?.tgl_trxfpac),
    kode_supp: editData.kode_supp, // quCust
    tgl_berlaku: editData.tgl_berlaku,
    tgl_kirim: editData.tgl_kirim,
    alamat_kirim: editData.alamat_kirim_cabang,
    via: editData.via,
    fob: editData.fob,
    kode_termin,
    kode_mu: editData.kode_mu,
    kurs: parseFloat(editData?.kurs),
    kurs_pajak: parseFloat(editData?.kurs_pajak),
    kena_pajak: editData?.kena_pajak,
    total_mu: totalMu,
    diskon_dok: editData.diskon_dok ? editData.diskon_dok : null,
    diskon_dok_mu: parseFloat(editData.diskon_dok_mu),
    total_diskon_mu: parseFloat(editData.total_diskon_mu),
    total_pajak_mu: parseFloat(editData.total_pajak_mu),
    netto_mu: totalMu,
    total_rp: totalMu,
    diskon_dok_rp: parseFloat(editData.diskon_dok_rp),
    total_diskon_rp: parseFloat(editData.total_diskon_rp),
    total_pajak_rp: parseFloat(editData.total_pajak_rp),
    netto_rp: totalMu,
    total_berat: parseFloat(editData.total_berat),
    keterangan,
    userid: editData.userid,
  };

  return payload;
};
