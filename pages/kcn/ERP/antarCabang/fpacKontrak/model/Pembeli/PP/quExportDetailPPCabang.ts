// DataCbg.quExportDetailPPCabang.FieldByName('kode_pp').Value := sKodePP;
//                     DataCbg.quExportDetailPPCabang.FieldByName('id_pp').Value  := sIdPP;//quDFpac.RecNo;
//                     DataCbg.quExportDetailPPCabang.FieldByName('id').Value := sIdPP;//quDFpac.RecNo;
//                     DataCbg.quExportDetailPPCabang.FieldByName('id_ket').Value  :=  sIdPP;//quDFpac.RecNo;
//                     DataCbg.quExportDetailPPCabang.FieldByName('stok').Value := 'Y';
//                     //CARI KODE ITEM ===========================
//                     GetItemCabang(quDFpacno_item.AsString);

import moment from 'moment';

//                     DataCbg.quExportDetailPPCabang.FieldByName('kode_item').Value :=DataCbg.quItemCabang.FieldValues['kode_item'];
//                     DataCbg.quExportDetailPPCabang.FieldByName('diskripsi').Value := DataCbg.quItemCabang.FieldValues['nama_item'];
//                     DataCbg.quExportDetailPPCabang.FieldByName('satuan').Value :=  quDFpacsatuan.AsString;
//                     DataCbg.quExportDetailPPCabang.FieldByName('qty').Value := quDFpacqty.AsFloat;
//                     DataCbg.quExportDetailPPCabang.FieldByName('sat_std').Value :=  quDFpacsat_std.AsString;
//                     DataCbg.quExportDetailPPCabang.FieldByName('qty_std').Value := quDFpacqty_std.AsFloat;
//                     DataCbg.quExportDetailPPCabang.FieldByName('qty_sisa').Value := quDFpacqty.AsFloat;
//                     DataCbg.quExportDetailPPCabang.FieldByName('qty_batal').Value := 0;
//                     DataCbg.quExportDetailPPCabang.FieldByName('tgl_butuh').AsDateTime := TglDokumenEfektif+7;

export const quExportDetailPPCabang = {
    kode_pp: 'oto',
    id_pp: 1,
    id: 1,
    id_ket: 1,
    stok: 'Y',
    kode_item: '',
    diskripsi: '',
    satuan: '',
    qty: 0,
    sat_std: '',
    qty_std: 0,
    qty_sisa: 0,
    qty_batal: 0,
    tgl_butuh: '',
};

export const createDetailPPPembeliPayload = async (editData: any) => {
    const payloads = editData.detail.map((detail: any, index: number) => {
        const payload = {
            ...quExportDetailPPCabang,
            id: index + 1,
            id_pp: index + 1,
            id_ket: index + 1,
            kode_item: detail.kode_item,
            diskripsi: detail.diskripsi,
            satuan: detail.satuan,
            qty: parseFloat(detail.qty),
            sat_std: detail.sat_std,
            qty_std: parseFloat(detail.qty_std),
            qty_sisa: parseFloat(detail.qty),
            tgl_butuh: moment(editData.tgl_trxfpac).add(7, 'days').format('YYYY-MM-DD HH:mm:ss'),
        };

        return payload;
    });

    return payloads;
};
