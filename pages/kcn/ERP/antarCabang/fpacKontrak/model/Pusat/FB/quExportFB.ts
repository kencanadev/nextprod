import { fetchPreferensi, generateNofakturFB, generateNU, generateNUDivisi, ResetTime } from '@/utils/routines';
import moment from 'moment';

export const quExportFB = {
    kode_fb: 'oto',
    no_fb: 'sNoFB',
    tgl_fb: "ResetTime('fb', TglDokumenEfektif)",
    tgl_trxfb: "ResetTime('fb', TglDokumenEfektif)", // Menggunakan tgl_fb sebagai tgl_trxfb
    tgl_buku: "ResetTime('fb', TglDokumenEfektif)", // Menggunakan tgl_fb sebagai tgl_buku
    kode_supp: 'quMFpackode_supp.AsString',
    kode_termin: 'quMFpackode_termin.AsString',
    kode_mu: 'quMFpackode_mu.AsString',
    kurs: 'quMFpackurs.AsFloat',
    kurs_pajak: 'quMFpackurs_pajak.AsFloat',
    kena_pajak: 'quMFpackena_pajak.AsString',
    no_faktur_pajak: null, // Dikosongkan sesuai dengan kode
    total_mu: 'sTotalMU',
    diskon_dok: '',
    diskon_dok_mu: 0,
    total_diskon_mu: 0,
    total_pajak_mu: 0,
    kirim_mu: 0,
    netto_mu: 'sTotalMU',
    memo_mu: 0,
    lunas_mu: 0, // Sesuai dengan penjelasan pada kode
    memo_pajak: 0,
    lunas_pajak: 0,
    total_rp: 'sTotalMU',
    diskon_dok_rp: 0,
    total_diskon_rp: 0,
    total_pajak_rp: 0,
    kirim_rp: 0,
    netto_rp: 'sTotalMU',
    total_berat: 'sTotalBerat',
    kode_akun_kirim: "Data.quSetting.FieldByName('kode_akun_pengiriman').AsString",
    kode_akun_diskon_termin: "Data.quSetting.FieldByName('kode_akun_diskon_item').AsString",
    kode_akun_diskon_dok: "Data.quSetting.FieldByName('kode_akun_diskon_beli').AsString",
    keterangan: "'[No FPAC : ' + quMFpacno_Fpac.AsString + '] - [dari ' + trim(edCabangBeli.Text) + ' ke ' + trim(edCabangJual.Text) + ']'",
    status: 'Terbuka',
    userid: 'Userid',
    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'), // Menggunakan waktu saat ini
    kode_lpb: 'oto',
};

export const createFBPusatPayload = async (editData: any, kode_entitas: any, tgl: any, termin: any, updateState: any, hargaBeliMu: number, tipe: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    const kodeAkun = await fetchPreferensi(kode_entitas, '');
    const kode_termin = termin.length === 0 ? null : termin[0].kode_termin;
    // const noFb = await generateNUDivisi(kode_entitas, '', '01', '03', moment().format('YYYYMM'), moment().format('YYMM') + '01');

    const noLpb = await generateNU(kode_entitas, '', '04', moment().format('YYYYMM'));

    const noFb = await generateNofakturFB(apiUrl, kode_entitas, noLpb);

    let totalMu = 0;
    for (const item of editData.detail) {
        const harga_beli_mu = hargaBeliMu != 0 ? hargaBeliMu : parseFloat(item.harga_beli_mu);
        totalMu += item.qty_std * harga_beli_mu;
    }

    updateState('noFbPusat', noFb);

    const keterangan =
        tipe === 'Y'
            ? `[No FPAC : ${editData?.no_fpac}] - [dari ${editData?.kode_entitas} ke ${editData?.entitas_cabang_jual}]`
            : `[No FPAC : ${editData?.no_fpac}] - [dari ${editData?.kode_entitas} ke ${editData?.entitas_cabang_jual}] - ${editData.keterangan}`;

    const payload: any = {
        ...quExportFB,
        no_fb: noFb,
        tgl_fb: tgl,
        // tgl_trxfb: tgl,
        tgl_trxfb: editData.tgl_kirim,
        tgl_buku: tgl,
        kode_supp: `${editData?.kode_supp}`,
        kode_termin,
        kode_mu: editData?.kode_mu,
        kurs: parseFloat(editData?.kurs),
        kurs_pajak: parseFloat(editData?.kurs_pajak),
        kena_pajak: editData?.kena_pajak,
        netto_mu: totalMu,
        total_mu: totalMu,
        total_rp: totalMu,
        netto_rp: totalMu,
        total_berat: parseFloat(editData?.total_berat),
        kode_akun_kirim: kodeAkun[0].kode_akun_pengiriman,
        kode_akun_diskon_termin: kodeAkun[0].kode_akun_diskon_item,
        kode_akun_diskon_dok: kodeAkun[0].kode_akun_diskon_beli,
        keterangan,
        userid: editData?.userid,
    };

    return payload;
};
