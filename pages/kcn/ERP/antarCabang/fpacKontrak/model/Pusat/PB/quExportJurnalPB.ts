import { generateNU } from '@/utils/routines';
import { fetchAkunJurnal, fetchCustomerMap, fetchKodeAkun, fetchSettingAkun } from '../../../api';
import { hitungTotalDebet } from '../../../helpers/hitungTotalRpMu';
import moment from 'moment';

export const quExportJurnalPB = {
    kode_dokumen: 'oto',
    id_dokumen: 1,
    dokumen: 'PB',
    tgl_dokumen: 'TglDokumenEfektif',
    kode_akun: "fieldByName('kode_akun')",
    kode_subledger: null,
    kurs: 1,
    debet_rp: 'Psd[m]',
    kredit_rp: 0,
    jumlah_rp: 'Psd[m]',
    jumlah_mu: 'Psd[m]/1',
    catatan: 'Penerimaan Barang No: ' + 'sNoPB',
    no_warkat: null,
    tgl_valuta: null,
    persen: 0,
    kode_dept: 'sKodeDept',
    kode_kerja: null,
    approval: 'N',
    posting: 'N',
    rekonsiliasi: 'N',
    tgl_rekonsil: null,
    userid: 'Userid',
    tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
    no_kontrak_um: null,
    audit: null,
    kode_kry: null,
    kode_jual: null,
};

export const createJurnalPBPusatPayload = async (editData: any, kode_entitas: string, token: string, hargaBeliMu: number) => {
    // Ambil kode_akun untuk item pertama
    const kode_akun = await fetchKodeAkun(kode_entitas, editData.detail[0].no_item, token);
    const kode_akun_hutang = await fetchSettingAkun({ entitas: kode_entitas, token });
    const detail = editData.detail[0];
    // const harga_beli_mu = detail.harga_beli_mu != '' ? parseFloat(detail.harga_beli_mu) : hargaBeliMu;
    const harga_beli_mu = hargaBeliMu != 0 ? hargaBeliMu : parseFloat(detail.harga_beli_mu);
    const sNilaiJurnalMb = parseFloat(editData.detail[0].qty) * harga_beli_mu;
    const no_barang = await generateNU(kode_entitas, '', '04', moment().format('YYYYMM'));
    const akun_jurnal = await fetchAkunJurnal(kode_entitas, kode_akun[0].kode_akun_persediaan, token);
    const akun_jurnal_hutang = await fetchAkunJurnal(kode_entitas, kode_akun_hutang[0].kode_akun_hutang, token);
    const cust = await fetchCustomerMap(kode_entitas, editData.kode_entitas, token);

    let totalMu = 0;
    for (const item of editData.detail) {
        const hargabelimu = hargaBeliMu != 0 ? hargaBeliMu : parseFloat(item.harga_beli_mu);
        totalMu += parseFloat(item.qty) * hargabelimu;
    }

    const payload1 = {
        ...quExportJurnalPB,
        tgl_dokumen: moment(editData.tgl_trxfpac).format('YYYY-MM-DD HH:mm:ss'),
        kode_akun: akun_jurnal[0].kode_akun, // nanti diisi dengan akun dari api
        debet_rp: totalMu,
        kredit_rp: 0,
        jumlah_rp: totalMu,
        jumlah_mu: totalMu / 1,
        catatan: `Penerimaan Barang No: ${no_barang}`,
        userid: editData.userid,
        kode_dept: cust.length === 0 ? null : cust[0].kode_dept_pembelian_cabang,
    };

    const payload2 = {
        ...quExportJurnalPB,
        id_dokumen: 2,
        tgl_dokumen: moment(editData.tgl_trxfpac).format('YYYY-MM-DD HH:mm:ss'),
        kode_akun: akun_jurnal_hutang[0].kode_akun, // nanti diisi dengan akun dari api
        debet_rp: 0,
        kredit_rp: totalMu,
        jumlah_rp: -1 * totalMu,
        jumlah_mu: -1 * (totalMu / 1),
        catatan: `Hutang ${editData.nama_relasi}, PB No: ${no_barang}`,
        kode_dept: cust.length === 0 ? null : cust[0].kode_dept_pembelian_cabang,
        userid: editData.userid,
        kode_subledger: editData.kode_supp,
    };

    return [{ ...payload1 }, { ...payload2 }];
};
