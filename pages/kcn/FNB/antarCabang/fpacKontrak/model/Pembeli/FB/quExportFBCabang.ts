import { fetchPreferensi, generateNofakturFB, generateNU, generateNUDivisi, oneToOneNumber, ResetTime } from '@/utils/routines';
import moment from 'moment';
import { fetchCustomerMap } from '../../../api';

export const quExportFBCabang = {
  kode_fb: 'oto',
  no_fb: '',
  tgl_fb: '',
  tgl_trxfb: '',
  tgl_buku: '',
  kode_supp: '',
  kode_termin: '', //Kode termin
  kode_mu: '',
  kurs: '',
  kurs_pajak: '',
  kena_pajak: '',
  no_faktur_pajak: null, // This was cleared
  total_mu: '',
  diskon_dok: '',
  diskon_dok_mu: 0,
  total_diskon_mu: 0,
  total_pajak_mu: 0,
  kirim_mu: 0,
  netto_mu: '', // sTotalMU
  memo_mu: 0,
  lunas_mu: 0,
  memo_pajak: 0,
  lunas_pajak: 0,
  total_rp: '', // sTotalMU
  diskon_dok_rp: 0,
  total_diskon_rp: 0,
  total_pajak_rp: 0,
  kirim_rp: 0,
  netto_rp: '', // sTotalMU
  total_berat: '', // sTotalBerat
  kode_akun_kirim: '',
  kode_akun_diskon_termin: '',
  kode_akun_diskon_dok: '',
  keterangan: '', // '[No FPAC : '+ quMFpacno_fpac.AsString+'] - [Beli dari Ent '+quMFpacentitas_cabang_jual.AsString+'] '+emKet.Text;
  status: 'Terbuka',
  userid: '',
  tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
  kode_lpb: 'oto',
};

export const createFBPembeliPayload = async (editData: any, kode_entitas: any, tgl: any, termin: any, token: any, updateState: any, tipe: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
  const kode_termin = termin.length === 0 ? null : termin[0].kode_termin;
  const kodeAkun = await fetchPreferensi(kode_entitas, '');
  const cust = await fetchCustomerMap(kode_entitas, editData.kode_entitas, token);

  const noLpb = await generateNU(editData.kode_entitas, '', '04', moment().format('YYYYMM'));

  // const noFb = await generateNUDivisi(editData.kode_entitas, '', '01', '03', moment().format('YYYYMM'), moment().format('YYMM') + '01');
  const noFb = await generateNofakturFB(apiUrl, editData.kode_entitas, noLpb);
  updateState('noFbPembeli', noFb);
  const keterangan =
    tipe === 'Y'
      ? `[No FPAC : ${editData?.no_fpac}] - [Beli dari Ent ${editData?.entitas_cabang_jual}] ${editData?.keterangan}`
      : `[No FPAC : ${editData?.no_fpac}] - [Beli dari Ent ${editData?.entitas_cabang_jual}] - ${editData?.keterangan}`;

  const payload: any = {
    ...quExportFBCabang,
    no_fb: noFb,
    tgl_fb: tgl,
    tgl_trxfb: tgl,
    tgl_buku: tgl,
    kode_supp: cust.length === 0 ? null : cust[0].kode_supp_cabang, // quCust [kode_supp_cabang]
    kode_termin,
    kode_mu: editData?.kode_mu,
    kurs: parseFloat(editData?.kurs),
    kurs_pajak: parseFloat(editData?.kurs_pajak),
    kena_pajak: editData?.kena_pajak,
    netto_mu: parseFloat(editData?.total_mu),
    total_mu: parseFloat(editData?.total_mu),
    total_rp: parseFloat(editData?.total_mu),
    netto_rp: parseFloat(editData?.total_mu),
    total_berat: parseFloat(editData?.total_berat),
    kode_akun_kirim: kodeAkun[0].kode_akun_pengiriman,
    kode_akun_diskon_termin: kodeAkun[0].kode_akun_diskon_item,
    kode_akun_diskon_dok: kodeAkun[0].kode_akun_diskon_beli,
    keterangan,
    userid: editData?.userid,
  };

  return payload;
};
