import { generateNU } from '@/utils/global/fungsi';
import moment from 'moment';

const ReCalc = async (paramObject: any, gridRbaListRef: any) => {
    const dataAppRba = [
        {
            user_app1: null,
            tgl_app1: null,
            user_app2: paramObject.user_app2,
            tgl_app2: paramObject.tgl_app2,
            level_app: paramObject.level_app,
            app: paramObject.app,
            approval: paramObject.approval,
            tgl_approval: paramObject.tgl_approval,
            catatan_konsol: paramObject.catatan_konsol,
            kode_rpeba: paramObject.kode_rpeba,
            kode_nip: paramObject.kode_nip,
        },
    ];

    const updateIds = (nodes: any) => {
        return nodes.map((node: any, index: any) => {
            return {
                ...node,
                id: index + 1,
            };
        });
    };

    let dataSource;
    if (gridRbaListRef && Array.isArray(gridRbaListRef.dataSource)) {
        dataSource = [...gridRbaListRef.dataSource]; // Salin array
        console.log('gridRbaListRef = ', dataSource);
    }

    const newNodes = await Promise.all(
        updateIds(dataSource).map(async (node: any) => {
            return {
                id_rpeba: node.id,
                kode_item: node.kode_item,
                diskripsi: node.diskripsi,
                satuan: node.satuan,
                qty: node.qty,
                qty_pabrik_real: node.qty_pabrik_real,
                qty_pabrik_acc: node.qty_pabrik_acc,
                kode_mu: 'IDR',
                harga_mu: node.harga_mu,
                harga_pusat: node.harga_pusat,
                jumlah_mu: node.jumlah_mu,
                jumlah_pusat: node.jumlah_pusat,
                kode_mb: node.kode_mb,
                id_mb: node.id_mb,
                // berat: node.berat ?? 0,
                berat: typeof node.berat !== 'undefined' ? node.berat : 0,
                no_kontrak: node.no_kontrak,
                kode_fj: node.kode_fj,
                kode_supp: node.kode_supp,
                harga_pph: node.harga_pph,
                jumlah_pph: node.jumlah_pph,
            };
        })
    );
    const newDataDetailSimpan = {
        detailAppRba: dataAppRba,
        detailRba: newNodes,
    };
    return newDataDetailSimpan;
};

export { ReCalc };
