import { generateNU, ResetTime } from '@/utils/routines';
import moment from 'moment';

export const quExportPB = {
    kode_lpb: 'oto',
    no_lpb: 'sNoPB',
    tgl_lpb: 'TglDokumenEfektif',
    tgl_trxlpb: 'TglDokumenEfektif',
    tgl_sj: 'TglDokumenEfektif',
    no_reff: 'quMFpacno_reff',
    dokumen: 'Dikirim',
    kode_gudang: 'kode_gudang_pusat',
    kode_supp: 'kode_supp',
    fob: null,
    via: 'ARMADA SENDIRI',
    pengemudi: 'Auto FPAC',
    nopol: 'Auto FPAC',
    persediaan: 'Y',
    total_rp: 'sTotalMU',
    total_diskon_rp: 0,
    total_pajak_rp: 0,
    netto_rp: 'sTotalMU',
    keterangan: '[No FPAC : quMFpacno_Fpac] - [dari ' + 'edCabangBeli' + ' ke ' + 'edCabangJual' + ']',
    total_berat: 'sTotalBerat',
    status: 'Terbuka',
    userid: 'Userid',
    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
    kirim: 0,
    kirim_mu: 0,
    diskon_dok: null,
    diskon_dok_rp: 0,
    kena_pajak: 'N',
    kode_termin: 'kode_termin',
    kontrak: 'Y',
};

export const createPBPusatPayload = async (editData: any, tgl: any, termin: any, kode_entitas: any, updateState: any, hargaBeliMu: number, tipe: string) => {
    // console.log(editData);
    const kode_termin = termin.length === 0 ? null : termin[0].kode_termin;
    const noLpb = await generateNU(kode_entitas, '', '04', moment().format('YYYYMM'));
    let totalMu = 0;
    for (const item of editData.detail) {
        const harga_beli_mu = hargaBeliMu != 0 ? hargaBeliMu : parseFloat(item.harga_beli_mu);
        totalMu += item.qty_std * harga_beli_mu;
    }

    updateState('noPbPusat', noLpb);

    const keterangan =
        tipe === 'Y'
            ? `[No FPAC : ${editData.no_fpac}] - [dari ${editData.kode_entitas} ke ${editData.entitas_cabang_jual}]`
            : `[No FPAC : ${editData.no_fpac}] - [dari ${editData.kode_entitas} ke ${editData.entitas_cabang_jual}] - ${editData.keterangan}`;

    const payload = {
        ...quExportPB,
        no_lpb: noLpb,
        tgl_lpb: tgl,
        // tgl_trxlpb: tgl,
        // tgl_sj: tgl,
        tgl_trxlpb: editData.tgl_kirim,
        tgl_sj: editData.tgl_berlaku,
        no_reff: editData.no_reff,
        kode_gudang: editData.kode_gudang_pusat,
        kode_supp: editData.kode_supp, // quCust.FieldValues['kode_supp_cabang']
        total_rp: totalMu,
        netto_rp: totalMu,
        keterangan,
        total_berat: parseFloat(editData.total_berat),
        userid: editData.userid,
        kode_termin,
        kontrak: tipe === 'Y' ? 'Y' : 'N',
    };

    return payload;
};
