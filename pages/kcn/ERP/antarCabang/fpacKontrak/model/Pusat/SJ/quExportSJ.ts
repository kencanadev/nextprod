import { generateNUDivisi, ResetTime } from '@/utils/routines';
import moment from 'moment';
import { fetchCustomerMap } from '../../../api';

export const quExportSJ = {
    kode_sj: 'oto',
    no_sj: '',
    tgl_sj: '',
    tgl_trxsj: '',
    no_reff: '',
    kode_gudang: 'quMFpackode_gudang_pusat.AsString',
    kode_cust: 'quMFpackode_cust_pusat.AsString',
    alamat_kirim: 'quMFpacalamat_kirim_cabang.AsString',
    via: 'ARMADA SENDIRI',
    fob: 'Diambil',
    pengemudi: 'AUTO FPAC',
    nopol: 'AUTO FPAC',
    total_rp: 0,
    total_diskon_rp: 0,
    total_pajak_rp: 0,
    netto_rp: 0,
    total_berat: 0,
    keterangan: '[No FPAC : ' + 'quMFpacno_Fpac.AsString' + '] - [No. Kontrak : ' + 'quMFpacno_reff.AsString' + '] - [dari ' + 'trim(edCabangBeli.Text)' + ' ke ' + 'trim(edCabangJual.Text)' + ']',
    status: 'Terbuka',
    userid: 'Userid',
    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
    dokumen: null,
    kode_jual: "quCust.FieldValues['kode_jual_antar_cabang']",
    kirim: 'N',
};

export const createSJPusatPayload = async (editData: any, kode_entitas: any, token: any, updateState: any, tipe: string, hargaMu: any) => {
    const cust = await fetchCustomerMap(kode_entitas, kode_entitas, token);
    const noSj = await generateNUDivisi(kode_entitas, '', cust[0].kode_jual_antar_cabang, '12', moment().format('YYYYMM'), moment().format('YYMM') + cust[0].kode_jual_antar_cabang);
    let totalMu = 0;
    for (const item of editData.detail) {
        const harga_mu = hargaMu != 0 ? hargaMu : parseFloat(item.harga_mu);
        totalMu += item.qty_std * harga_mu;
    }

    updateState('noSjPusat', noSj);

    const keterangan =
        tipe === 'Y'
            ? `[No FPAC : ${editData.no_fpac}]- [No.Kontrak : ${editData.no_reff}] - [dari ${editData.entitas_cabang_jual} ke ${editData.kode_entitas}]`
            : `[No FPAC : ${editData.no_fpac}]- [No. Kontrak : ${editData.no_reff}] - [dari ${editData.entitas_cabang_jual} ke ${editData.kode_entitas}] - ${editData.keterangan}`;

    const payload = {
        ...quExportSJ,
        no_sj: noSj,
        tgl_sj: await ResetTime(editData.kode_entitas, editData.tgl_trxfpac),
        tgl_trxsj: await ResetTime(editData.kode_entitas, editData.tgl_trxfpac),
        no_reff: editData.no_reff,
        kode_gudang: editData.kode_gudang_pusat,
        kode_cust: editData.kode_cust_pusat,
        alamat_kirim: editData.alamat_kirim_cabang,
        total_rp: totalMu,
        netto_rp: totalMu,
        total_berat: parseFloat(editData.total_berat),
        keterangan, // harusnya cabang beli
        userid: editData.userid,
        kode_jual: cust.length === 0 ? null : cust[0].kode_jual_antar_cabang,
    };

    return payload;
};
