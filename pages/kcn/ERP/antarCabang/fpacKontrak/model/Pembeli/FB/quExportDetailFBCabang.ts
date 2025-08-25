import { fetchCustomerMap } from '../../../api';

export const quExportDetailFBCabang = {
    kode_fb: 'oto',
    id_fb: 1,
    kode_lpb: 'oto',
    id_lpb: 1,
    kode_sp: 'oto',
    id_sp: 1,
    kode_pp: 'oto',
    id_pp: 1,
    kode_item: '',
    diskripsi: '',
    satuan: '',
    qty: null,
    sat_std: '',
    qty_std: null,
    kode_mu: '',
    kurs: null,
    kurs_pajak: null,
    harga_mu: null,
    diskon: '',
    diskon_mu: null,
    potongan_mu: null,
    kode_pajak: '',
    pajak: null,
    include: '',
    pajak_mu: null,
    jumlah_mu: null,
    jumlah_rp: null,
    ket: null,
    kode_dept: '',
    kode_kerja: '',
    berat: 0.0,
};

export const createDetailFBPembeliPayload = async (editData: any, kode_entitas: any, hargaMu: number, token: any) => {
    const cust = await fetchCustomerMap(kode_entitas, editData.kode_entitas, token);

    const payloads = editData.detail.map((detail: any, index: any) => {
        const harga_mu = hargaMu != 0 ? hargaMu : parseFloat(detail.harga_mu);
        const payload = {
            ...quExportDetailFBCabang,
            id_fb: index + 1,
            id_lpb: index + 1,
            id_sp: index + 1,
            id_pp: index + 1,
            kode_item: detail.kode_item,
            diskripsi: detail.diskripsi,
            satuan: detail.satuan,
            qty: parseFloat(detail.qty),
            sat_std: detail.sat_std,
            qty_std: parseFloat(detail.qty_std),
            kode_mu: detail.kode_mu,
            kurs: parseFloat(detail.kurs),
            kurs_pajak: parseFloat(detail.kurs_pajak),
            harga_mu,
            diskon: detail.diskon,
            diskon_mu: parseFloat(detail.diskon_mu),
            potongan_mu: parseFloat(detail.potongan_mu),
            kode_pajak: detail.kode_pajak,
            pajak: parseFloat(detail.pajak),
            include: detail.include,
            pajak_mu: parseFloat(detail.pajak_mu),
            jumlah_mu: parseFloat(detail.qty_std) * harga_mu,
            jumlah_rp: parseFloat(detail.qty_std) * harga_mu,
            kode_dept: cust.length === 0 ? null : cust[0].kode_dept_pembelian_cabang,
            kode_kerja: detail.kode_kerja,
            berat: parseFloat(detail.berat),
        };

        return payload;
    });

    return payloads;
};
