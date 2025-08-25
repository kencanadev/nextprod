import { fetchCustomerMap } from '../../../api';

export const quExportDetailSPM = {
    kode_do: 'oto',
    id_do: 1,
    kode_so: 'oto',
    id_so: 1,
    kode_item: 'quDFpackode_item.AsString',
    diskripsi: 'quDFpacdiskripsi.AsString',
    satuan: 'qudfpacsatuan.AsString',
    qty: 'qudfpacqty.AsFloat',
    sat_std: 'qudfpacsat_std.AsString',
    qty_std: 'qudfpacqty_std.AsFloat',
    qty_sisa: 'qudfpacqty.AsFloat',
    kode_mu: 'qudfpackode_mu.AsString',
    kurs: 'qudfpackurs.AsFloat',
    kurs_pajak: 'qudfpackurs_pajak.AsFloat',
    harga_mu: 'qudfpacharga_mu.AsFloat',
    diskon: 'qudfpacdiskon.AsString',
    diskon_mu: 'qudfpacdiskon_mu.AsFloat',
    potongan_mu: 'qudfpacpotongan_mu.AsFloat',
    kode_pajak: 'qudfpackode_pajak.AsString',
    pajak: 'qudfpacpajak.AsFloat',
    include: 'qudfpacinclude.AsString',
    pajak_mu: 'qudfpacpajak_mu.AsFloat',
    jumlah_mu: 'qudfpacqty_std.AsFloat * qudfpacharga_mu.AsFloat',
    jumlah_rp: 'qudfpacqty_std.AsFloat * qudfpacharga_mu.AsFloat',
    berat: 'qudfpacbrt.AsFloat',
    kode_dept: 'skodedept',
    kode_kerja: null, // Nilai dikosongkan
    qty_batal: 0,
};

export const createDetaiSPMPusatPayload = async (editData: any, kode_entitas: any, token: any) => {
    const cust = await fetchCustomerMap(kode_entitas, editData.kode_entitas, token);

    const payloads = editData.detail.map((detail: any, index: number) => {
        const payload = {
            ...quExportDetailSPM,
            id_do: index + 1,
            id_so: index + 1,
            kode_item: detail.kode_item,
            diskripsi: detail.diskripsi,
            satuan: detail.satuan,
            qty: parseFloat(detail.qty),
            sat_std: detail.sat_std,
            qty_std: parseFloat(detail.qty_std),
            qty_sisa: parseFloat(detail.qty_std),
            kode_mu: detail.kode_mu,
            kurs: parseFloat(detail.kurs),
            kurs_pajak: parseFloat(detail.kurs_pajak),
            harga_mu: parseFloat(detail.harga_mu),
            diskon: detail.diskon,
            diskon_mu: parseFloat(detail.diskon_mu),
            kode_pajak: detail.kode_pajak,
            pajak: parseFloat(detail.pajak),
            include: detail.include,
            pajak_mu: parseFloat(detail.pajak_mu),
            jumlah_mu: parseFloat(detail.harga_mu) * parseFloat(detail.qty_std),
            jumlah_rp: parseFloat(detail.harga_mu) * parseFloat(detail.qty_std),
            berat: parseFloat(detail.brt),
            kode_dept: cust.length === 0 ? null : cust[0].kode_dept_pembelian_cabang,
            potongan_mu: parseFloat(detail.potongan_mu),
        };

        return payload;
    });

    return payloads;
};
