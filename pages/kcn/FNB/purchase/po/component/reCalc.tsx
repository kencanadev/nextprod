import { DiskonByCalc, qty2QtyStd, tanpaKoma } from '@/utils/routines';
import { HargaPembelianPerItem, HargaPembelianPerSupp, HargaPembelianPoSupp } from '../model/api';

import React from 'react';

const reCalc = () => {
    return <div>reCalc</div>;
};

export default reCalc;

export const ReCalc = async (dataDetail: any) => {
    let totalDiskonMu = 0,
        totalBerat = 0;
    await dataDetail((state: any) => {
        const newNodes = state.nodes.map((node: any) => {
            let qty_std = parseFloat(node.kuantitas);
            let diskon_mu = parseFloat(isNaN(node.diskon_mu) ? 0 : node.diskon_mu);
            let potongan_mu = parseFloat(node.potongan === '' || node.potongan === '0' || node.potongan === null ? 0 : node.potongan);
            let berat = parseFloat(node.berat);
            totalDiskonMu += qty_std * (diskon_mu + potongan_mu);
            totalBerat += berat;
            return {
                ...node,
            };
        });

        return {
            nodes: newNodes,
            // totalBerat: totalBerat.toFixed(2),
        };
    });
    return { totalDiskonMu, totalBerat };
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

// export const ReCalcDataNodes = async (dataDetail: any, objectHeader: any) => {
//     const { include, tipeTransaksi, kodeSp, tipeDoc } = objectHeader;
//     const newNodes = dataDetail.nodes.map((node: any) => {
//         return {
//             ...node,
//             berat: parseFloat(tanpaKoma(node.berat)),
//             brt: parseFloat(tanpaKoma(node.brt)),
//             diameter: tipeTransaksi === 'produksi' ? parseFloat(tanpaKoma(node.diameter)) : 0,
//             kuantitas_kg: tipeTransaksi === 'produksi' ? parseFloat(tanpaKoma(node.kuantitas_kg)) : 0,
//             jarak_cm: tipeTransaksi === 'produksi' ? parseFloat(tanpaKoma(node.jarak_cm)) : 0,
//             kg_btg: tipeTransaksi === 'produksi' ? parseFloat(tanpaKoma(node.kg_btg)) : 0,
//             harga_kg: tipeTransaksi === 'produksi' ? parseFloat(tanpaKoma(node.harga_kg)) : 0,
//             kuantitas_btg: tipeTransaksi === 'produksi' ? parseFloat(tanpaKoma(node.kuantitas_btg)) : 0,
//             harga_btg: tipeTransaksi === 'produksi' ? parseFloat(tanpaKoma(node.harga_btg)) : 0,
//             kuantitas: parseFloat(tanpaKoma(node.kuantitas)),
//             harga: parseFloat(tanpaKoma(node.harga)),
//             jumlah: parseFloat(tanpaKoma(node.jumlah)),
//             pajak_mu: parseFloat(node.nilai_pajak),
//             potongan: parseFloat(tanpaKoma(node.potongan)),
//             diskon_mu: parseFloat(tanpaKoma(node.diskon_mu)),
//             include: include,
//             qty_sisa: tipeDoc === 'batal' ? 0 : node.qty_sisa,
//             qty_batal: tipeDoc === 'batal' ? node.qty_sisa : 0,
//             kode_so: '',
//             id_so: '',
//             sat_std: '',
//             // qty_std: parseFloat(tanpaKoma(node.kuantitas)),
//             qty_std: await someFunction('99999',node.kode_item, node.satuan, node.sat_std, node.kuantitas),
//             kode_kerja: '',
//             kode_fpb: '',
//             id_fpb: '',
//             kode_fpac: '',
//             id_fpac: '',
//             kodepemilik: '',
//             harga_cabang: '',
//             catatan_cabang: node.keterangan,
//             catatan_dashboard: '',
//             tgl_selesai: '',
//             kode_sp: kodeSp,
//         };
//     });

//     // Ubah struktur objek sesuai dengan struktur yang diinginkan
//     const newDataDetailSimpan = {
//         detailJson: newNodes,
//     };

//     return newDataDetailSimpan;
// };

export const ReCalcDataNodes = async (dataDetail: any, objectHeader: any) => {
    const { kode_entitas, include, tipeTransaksi, kodeSp, tipeDoc } = objectHeader;
    const newNodes = await Promise.all(
        dataDetail.nodes.map(async (node: any) => {
            const qty_std = await someFunction(kode_entitas, node.kode_item, node.satuan, node.sat_std, node.kuantitas);
            return {
                ...node,
                berat: parseFloat(tanpaKoma(node.berat)),
                brt: parseFloat(tanpaKoma(node.brt)),
                diameter: tipeTransaksi === 'produksi' ? parseFloat(tanpaKoma(node.diameter)) : 0,
                kuantitas_kg: tipeTransaksi === 'produksi' ? parseFloat(tanpaKoma(node.kuantitas_kg)) : 0,
                jarak_cm: tipeTransaksi === 'produksi' ? parseFloat(tanpaKoma(node.jarak_cm)) : 0,
                kg_btg: tipeTransaksi === 'produksi' ? parseFloat(tanpaKoma(node.kg_btg)) : 0,
                harga_kg: tipeTransaksi === 'produksi' ? parseFloat(tanpaKoma(node.harga_kg)) : 0,
                kuantitas_btg: tipeTransaksi === 'produksi' ? parseFloat(tanpaKoma(node.kuantitas_btg)) : 0,
                harga_btg: tipeTransaksi === 'produksi' ? parseFloat(tanpaKoma(node.harga_btg)) : 0,
                kuantitas: parseFloat(tanpaKoma(node.kuantitas)),
                harga: parseFloat(tanpaKoma(node.harga)),
                jumlah: parseFloat(tanpaKoma(node.jumlah)),
                pajak_mu: parseFloat(node.nilai_pajak),
                // potongan: parseFloat(tanpaKoma(node.potongan)),
                potongan: node.potongan === '' ? '' : parseFloat(tanpaKoma(node.potongan)),
                diskon_mu: parseFloat(tanpaKoma(node.diskon_mu)),
                include: include,
                qty_sisa: tipeDoc === 'batal' ? 0 : node.qty_sisa,
                // qty_sisa: tipeDoc === 'batal' ? 0 : qty_std,
                // qty_sisa: tipeDoc === 'batal' ? 0 : parseFloat(tanpaKoma(node.kuantitas)),
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
            };
        })
    );
    // return newNodes;
    const newDataDetailSimpan = {
        detailJson: newNodes,
    };

    return newDataDetailSimpan;
};

export async function ReCalcHargaPembelianBarangJadi(kode_entitas: any, kode_item: any, kode_supp: any, kode_relasi: any) {
    try {
        let result;

        result = await HargaPembelianPerSupp(kode_entitas, kode_item, kode_relasi);
        if (result.length > 0) {
            const { harga, diskon, potongan } = result[0];
            return { harga, diskon, diskon_mu: '0', potongan, pajak: '0' };
        }

        result = await HargaPembelianPoSupp(kode_entitas, kode_item, kode_supp);
        if (result.length > 0) {
            const { harga, diskon, diskon_mu, potongan, pajak } = result[0];
            return { harga, diskon, diskon_mu, potongan, pajak };
        }

        result = await HargaPembelianPerItem(kode_entitas, kode_item);
        if (result.length > 0) {
            const { harga, diskon } = result[0];
            return { harga, diskon, diskon_mu: '0', potongan: '', pajak: '0' };
        }

        throw new Error('Harga tidak ada');
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

export const ReCalcPerhitungan = (qty: any, harga: any, diskon: any, potongan: any, tipe: any) => {
    if (tipe === 'jumlah') {
        const hasil =
            (diskon !== null || diskon !== '') && qty > 0 && harga > 0
                ? qty * (harga - DiskonByCalc(diskon === null || diskon === '' ? '0' : diskon, harga) - (potongan === null || potongan === '' ? '0' : potongan))
                : harga * qty;
        return hasil;
    }
};

export const ReCalcPerhitunganNilaiPajak = (selectedOptionPajak: any, qty: any, harga_mu: any, diskon: any, potongan: any, pajakMu: any, tipe: any) => {
    let totNilaiPajak: any;
    if (selectedOptionPajak === 'N') {
        totNilaiPajak = 0;
    } else if (selectedOptionPajak === 'E') {
        const jumlah_mu = ReCalcPerhitungan(qty, harga_mu, diskon, potongan, 'jumlah');
        if (jumlah_mu !== undefined) {
            totNilaiPajak = (jumlah_mu * pajakMu) / 100;
        } else {
        }
    } else if (selectedOptionPajak === 'I') {
        if (pajakMu === 10) {
            const jumlah_mu = ReCalcPerhitungan(qty, harga_mu, diskon, potongan, 'jumlah');
            if (jumlah_mu !== undefined) {
                totNilaiPajak = ((100 / 110) * jumlah_mu * pajakMu) / 100;
            } else {
            }
        } else if (pajakMu === 11) {
            const jumlah_mu = ReCalcPerhitungan(qty, harga_mu, diskon, potongan, 'jumlah');
            if (jumlah_mu !== undefined) {
                totNilaiPajak = ((100 / 111) * jumlah_mu * pajakMu) / 100;
            } else {
            }
        } else {
            totNilaiPajak = 0;
        }
    }
    return totNilaiPajak;
};
