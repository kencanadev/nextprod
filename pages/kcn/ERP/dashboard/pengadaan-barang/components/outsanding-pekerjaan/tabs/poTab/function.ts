import { SpreadNumber } from '@/pages/kcn/ERP/fa/fpp/utils';
import { DiskonByCalc, qty2QtyStd } from '@/utils/routines';
export const resetFilePendukung = () => {
    return {
        1: {
            file: null,
            fileUrl: null,
            tabIndex: 1
    
        },
        2: {
            file: null,
            fileUrl: null,
            tabIndex: 2
    
        },
        3: {
            file: null,
            fileUrl: null,
            tabIndex: 3
    
        },
        4: {
            file: null,
            fileUrl: null,
            tabIndex: 4
    
        },
        5: {
            file: null,
            fileUrl: null,
            tabIndex: 5
    
        },
        51: {
            file: null,
            fileUrl: null,
            tabIndex: 51
    
        },
        52: {
            file: null,
            fileUrl: null,
            tabIndex: 52
    
        },
    }
}


export const ReCalcDataNodes = async (dataDetail: any, objectHeader: any) => {
    const { kode_entitas, include, tipeTransaksi, kodeSp, tipeDoc } = objectHeader;
    const newNodes = await Promise.all(
        dataDetail.map(async (node: any) => {
            const qty_std = await someFunction(kode_entitas, node.kode_item, node.satuan, node.sat_std, node.kuantitas);
            return {
                ...node,
                berat: SpreadNumber(String(node.berat)),
                brt: SpreadNumber(String(node.brt)),
                diameter: tipeTransaksi === 'produksi' ? SpreadNumber(String(node.diameter)) : 0,
                kuantitas_kg: tipeTransaksi === 'produksi' ? SpreadNumber(String(node.kuantitas_kg)) : 0,
                jarak_cm: tipeTransaksi === 'produksi' ? SpreadNumber(String(node.jarak_cm)) : 0,
                kg_btg: tipeTransaksi === 'produksi' ? SpreadNumber(String(node.kg_btg)) : 0,
                harga_kg: tipeTransaksi === 'produksi' ? SpreadNumber(String(node.harga_kg)) : 0,
                kuantitas_btg: tipeTransaksi === 'produksi' ? SpreadNumber(String(node.kuantitas_btg)) : 0,
                harga_btg: tipeTransaksi === 'produksi' ? SpreadNumber(String(node.harga_btg)) : 0,
                kuantitas: SpreadNumber(String(node.kuantitas)),
                harga: SpreadNumber(String(node.harga)),
                jumlah: SpreadNumber(String(node.jumlah)),
                pajak_mu: parseFloat(node.nilai_pajak),
                // potongan: SpreadNumber(String(node.potongan))),
                potongan: node.potongan === '' ? '' : SpreadNumber(String(node.potongan)),
                diskon_mu: SpreadNumber(String(node.diskon_mu)),
                include: include,
                qty_sisa: tipeDoc === 'batal' ? 0 : node.qty_sisa,
                // qty_sisa: tipeDoc === 'batal' ? 0 : qty_std,
                // qty_sisa: tipeDoc === 'batal' ? 0 : SpreadNumber(String(node.kuantitas))),
                qty_batal: tipeDoc === 'batal' ? node.qty_sisa : 0,
                // kode_so: '',
                // id_so: '',
                kode_so: node.kode_so,
                id_so: node.id_so,
                // sat_std: '',
                sat_std: node.satuan,
                qty_std: node.qty_sisa,
                kode_kerja: null,
                // kode_fpb: '',
                // id_fpb: '',
                kode_fpb: node.kode_fpb,
                id_fpb: node.id_fpb,
                kode_fpac: '',
                id_fpac: '',
                kodepemilik: '',
                kode_entitas: node.kode_entitas,
                harga_cabang: '',
                catatan_cabang: node.keterangan,
                catatan_dashboard: '',
                tgl_selesai: '',
                kode_sp: kodeSp,
                po_grup: node.kodegrup,
                id: node.id_sp,
                nama_barang: node.diskripsi
            };
        })
    );
    // return newNodes;
    const newDataDetailSimpan = {
        detailJson: newNodes,
    };

    return newDataDetailSimpan;
};

async function someFunction(entitas: any, kode_item: any, satuan: any, sat_std: any, kuantitas: any) {
    try {
        // Menunggu hingga promise diselesaikan dan mendapatkan nilai aktual
        const qty_std_number = await qty2QtyStd(entitas, kode_item, satuan, sat_std, kuantitas);

        // Sekarang qty_std_number adalah tipe number
        console.log('asdfasfsfas' + qty_std_number);
        return qty_std_number;

        // Lakukan sesuatu dengan nilai number yang diperoleh
    } catch (error) {
        // Tangani kesalahan jika ada
        console.error('Error:', error);
    }
}