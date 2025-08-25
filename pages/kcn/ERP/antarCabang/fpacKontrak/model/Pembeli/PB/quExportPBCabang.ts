import { generateNU, generateNUDivisi, ResetTime } from '@/utils/routines';
import moment from 'moment';
import { fetchCustomerMap } from '../../../api';

export const quExportPBCabang = {
    kode_lpb: 'oto',
    no_lpb: '',
    tgl_lpb: '',
    tgl_trxlpb: '',
    tgl_sj: '',
    no_reff: '',
    dokumen: 'Dikirim',
    kode_gudang: '',
    kode_supp: '',
    fob: null,
    via: 'ARMADA SENDIRI',
    pengemudi: 'Auto FPAC',
    nopol: 'Auto FPAC',
    persediaan: 'Y',
    total_rp: 0.0,
    total_diskon_rp: 0.0,
    total_pajak_rp: 0.0,
    netto_rp: 0.0,
    keterangan: '', // '[No FPAC : '+ quMFpacno_fpac.AsString+'] - [Beli dari Ent '+quMFpacentitas_cabang_jual.AsString+'] '+emKet.Text;
    total_berat: 0.0,
    status: 'Terbuka',
    userid: '',
    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
    kirim: 0.0,
    kirim_mu: 0.0,
    diskon_dok: null,
    diskon_dok_rp: 0.0,
    kena_pajak: 'N',
    kode_termin: '',
    kontrak: 'Y',
};

export const createPBPembeliPayload = async (editData: any, tgl: any, termin: any, kode_entitas: any, token: any, updateState: any, tipe: string, hargaMu: number) => {
    // console.log(editData);
    const kode_termin = termin.length === 0 ? null : termin[0].kode_termin;
    const cust = await fetchCustomerMap(kode_entitas, editData.kode_entitas, token);

    // const noLpb = await generateNUDivisi(editData.kode_entitas, '', '01', '04', moment().format('YYYYMM'), moment().format('YYMM') + '01');
    const noLpb = await generateNU(editData.kode_entitas, '', '04', moment().format('YYYYMM'));

    let totalMu = 0;
    for (const item of editData.detail) {
        const harga_mu = hargaMu != 0 ? hargaMu : parseFloat(item.harga_mu);
        totalMu += item.qty_std * harga_mu;
    }
    updateState('noPbPembeli', noLpb);

    const keterangan =
        tipe === 'Y'
            ? `[No FPAC : ${editData.no_fpac}] - [Beli dari Ent ${editData.entitas_cabang_jual}] ${editData.keterangan}`
            : `[No FPAC : ${editData.no_fpac}] - [Beli dari Ent ${editData.entitas_cabang_jual}] - ${editData.keterangan}`;

    const payload = {
        ...quExportPBCabang,
        no_lpb: noLpb,
        tgl_lpb: tgl,
        // tgl_trxlpb: tgl,
        // tgl_sj: tgl,
        tgl_trxlpb: editData.tgl_kirim,
        tgl_sj: editData.tgl_berlaku,
        no_reff: editData.no_reff,
        kode_gudang: editData.kode_gudang_beli,
        kode_supp: cust.length === 0 ? null : cust[0].kode_supp_cabang, // quCust.FieldValues['kode_supp_cabang']
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
