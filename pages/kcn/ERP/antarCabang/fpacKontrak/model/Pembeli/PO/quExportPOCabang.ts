import { generateNU, generateNUDivisi, ResetTime } from '@/utils/routines';
import moment from 'moment';
import { fetchCustomerMap } from '../../../api';

export const quExportPOCabang = {
    kode_sp: 'oto',
    no_sp: '',
    tgl_sp: '',
    kode_supp: '',
    tgl_berlaku: '',
    tgl_kirim: '',
    alamat_kirim: '',
    via: '',
    fob: '',
    kode_termin: '',
    kode_mu: '',
    kurs: 0.0,
    kurs_pajak: 0.0,
    kena_pajak: '',
    total_mu: 0.0,
    diskon_dok: '',
    diskon_dok_mu: 0.0,
    total_diskon_mu: 0.0,
    total_pajak_mu: 0.0,
    kirim_mu: 0.0,
    netto_mu: 0.0,
    total_rp: 0.0,
    diskon_dok_rp: 0.0,
    total_diskon_rp: 0.0,
    total_pajak_rp: 0.0,
    kirim_rp: 0.0,
    netto_rp: 0.0,
    total_berat: 0.0,
    keterangan: '', // '[No FPAC : '+ quMFpacno_fpac.AsString+'] - [Beli dari Ent '+quMFpacentitas_cabang_jual.AsString+'] '+emKet.Text;
    status: 'Terbuka',
    userid: '',
    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
    approval: 'Y',
    tgl_approval: moment().format('YYYY-MM-DD HH:mm:ss'),
    kirim_langsung: 'N',
    status_kirim: 'N',
    no_sjpabrik: null,
    tgl_sjpabrik: null,
    tgl_sjfax: null,
    nota: null,
};

export const createPOPembeliPayload = async (editData: any, kode_entitas: any, token: any, tgl: any, termin: any, updateState: any, tipe: string, hargaMu: any) => {
    const cust = await fetchCustomerMap(kode_entitas, editData.kode_entitas, token);
    const kode_termin = termin.length === 0 ? null : termin[0].kode_termin;
    const noSp = await generateNU(editData.kode_entitas, '', '02', moment().format('YYYYMM'));
    // sNoPoCabang = await generateNU(masterFpb.kode_entitas, '', '02', moment().format('YYYYMM'));
    let totalMu = 0;
    for (const item of editData.detail) {
        const harga_mu = hargaMu != 0 ? hargaMu : parseFloat(item.harga_mu);
        totalMu += item.qty_std * harga_mu;
    }
    updateState('noPoPembeli', noSp);

    const keterangan =
        tipe === 'Y'
            ? `[No FPAC : ${editData.no_fpac}] - [Beli dari Ent ${editData.entitas_cabang_jual}] ${editData.keterangan}`
            : `[No FPAC : ${editData.no_fpac}] - [Beli dari Ent ${editData.entitas_cabang_jual}] - ${editData.keterangan}`;

    const payload: any = {
        ...quExportPOCabang,
        no_sp: noSp,
        tgl_sp: tgl,
        kode_supp: cust.length === 0 ? null : cust[0].kode_supp_cabang,
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
        kirim_mu: parseFloat(editData.kirim_mu),
        netto_mu: totalMu,
        total_rp: totalMu,
        diskon_dok_rp: parseFloat(editData.diskon_dok_rp),
        total_diskon_rp: parseFloat(editData.total_diskon_rp),
        total_pajak_rp: parseFloat(editData.total_pajak_rp),
        kirim_rp: parseFloat(editData.kirim_rp),
        netto_rp: totalMu,
        total_berat: parseFloat(editData.total_berat),
        keterangan,
        userid: editData.userid,
    };

    return payload;
};
