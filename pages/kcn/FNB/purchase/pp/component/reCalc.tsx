import { tanpaKoma } from '@/utils/routines';

import React from 'react'

const reCalc = () => {
  return (
    <div>reCalc</div>
  )
}

export default reCalc


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
            console.log(qty_std, diskon_mu, potongan_mu, node.potongan, totalDiskonMu);
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

export const ReCalcDataNodes = async (dataDetail: any, produksi: any) => {
    // Call dataDetail function with a callback to update state
    const newNodes = dataDetail.nodes.map((node: any) => {
        //console.log(node.qty);
        return {
            ...node,
            qty: parseFloat(tanpaKoma(node.qty)),
            qty_std: parseFloat(tanpaKoma(node.qty_std)),
            qty_sisa: parseFloat(tanpaKoma(node.qty_sisa)),
            fpp_qty: produksi === 'Y' ? parseFloat(tanpaKoma(node.fpp_qty)) : 0,
            fpp_diameter: produksi === 'Y' ? parseFloat(tanpaKoma(node.fpp_diameter)) : 0,
            fpp_kg: produksi === 'Y' ? parseFloat(tanpaKoma(node.fpp_kg)) : 0,
            fpp_btg: produksi === 'Y' ? parseFloat(tanpaKoma(node.fpp_btg)) : 0,
            fpp_harga_kg: produksi === 'Y' ? parseFloat(tanpaKoma(node.fpp_harga_kg)) : 0,
            fpp_harga_btg: produksi === 'Y' ? parseFloat(tanpaKoma(node.fpp_harga_btg)) : 0,
            fpp_jarak: produksi === 'Y' ? parseFloat(tanpaKoma(node.fpp_jarak)) : 0,
            berat: parseFloat(tanpaKoma(node.berat)),

            // if (nodeTipe==='APPROVE') {
            //   qty_batal:parseFloat(tanpaKoma(node.qty_batal)),
            //   qty_sisa:parseFloat(tanpaKoma(node.qty_sisa)),
            // }
        };
    });
    //   alert(JSON.stringify(newNodes));

    // Ubah struktur objek sesuai dengan struktur yang diinginkan
    const newDataDetailSimpan = {
        detailJson: newNodes,
    };

    return newDataDetailSimpan;
};

export const ReCalcDataNodesEdit = async (dataDetail: any) => {
    // Call dataDetail function with a callback to update state
    const newNodes = dataDetail.nodes.map((node: any) => {
        return {
            ...node,
            qty: parseFloat(tanpaKoma(node.qty)),
            qty_std: parseFloat(tanpaKoma(node.qty_std)),
            qty_sisa: parseFloat(tanpaKoma(node.qty_sisa)),
            fpp_qty: parseFloat(tanpaKoma(node.fpp_qty)),
            fpp_diameter: parseFloat(tanpaKoma(node.fpp_diameter)),
            fpp_kg: parseFloat(tanpaKoma(node.fpp_kg)),
            fpp_btg: parseFloat(tanpaKoma(node.fpp_btg)),
            fpp_harga_kg: parseFloat(tanpaKoma(node.fpp_harga_kg)),
            fpp_harga_btg: parseFloat(tanpaKoma(node.fpp_harga_btg)),
            fpp_jarak: parseFloat(tanpaKoma(node.fpp_jarak)),
            berat: parseFloat(tanpaKoma(node.berat)),

            // if (nodeTipe==='APPROVE') {
            //   qty_batal:parseFloat(tanpaKoma(node.qty_batal)),
            //   qty_sisa:parseFloat(tanpaKoma(node.qty_sisa)),
            // }
        };
    });
    //alert(JSON.stringify(newNodes));

    // Ubah struktur objek sesuai dengan struktur yang diinginkan
    const newDataDetailSimpan = {
        detailJson: newNodes,
    };

    return newDataDetailSimpan;
};

export const ReCalcDataNodesApprove = async (dataDetail: any) => {
    // Call dataDetail function with a callback to update state
    const newNodes = dataDetail.nodes.map((node: any) => {
        return {
            ...node,
            qty: parseFloat(tanpaKoma(node.qty)),
            fpp_qty: parseFloat(tanpaKoma(node.fpp_qty)),
            fpp_diameter: parseFloat(tanpaKoma(node.fpp_diameter)),
            fpp_kg: parseFloat(tanpaKoma(node.fpp_kg)),
            fpp_btg: parseFloat(tanpaKoma(node.fpp_btg)),
            fpp_harga_kg: parseFloat(tanpaKoma(node.fpp_harga_kg)),
            fpp_harga_btg: parseFloat(tanpaKoma(node.fpp_harga_btg)),
            fpp_jarak: parseFloat(tanpaKoma(node.fpp_jarak)),
            berat: parseFloat(tanpaKoma(node.berat)),
            qty_batal: parseFloat(tanpaKoma(node.qty_batal)),
            qty_sisa: parseFloat(tanpaKoma(node.qty_sisa)),
            qty_std: parseFloat(tanpaKoma(node.qty_std)),
        };
    });

    // Ubah struktur objek sesuai dengan struktur yang diinginkan
    const newDataDetailSimpan = {
        detailJson: newNodes,
    };

    return newDataDetailSimpan;
};

export const ReCalcDataNodesBatal = async (dataDetail: any) => {
    // Call dataDetail function with a callback to update state
    const newNodes = dataDetail.nodes.map((node: any) => {
        return {
            ...node,
            qty: parseFloat(tanpaKoma(node.qty)),
            fpp_qty: parseFloat(tanpaKoma(node.fpp_qty)),
            fpp_diameter: parseFloat(tanpaKoma(node.fpp_diameter)),
            fpp_kg: parseFloat(tanpaKoma(node.fpp_kg)),
            fpp_btg: parseFloat(tanpaKoma(node.fpp_btg)),
            fpp_harga_kg: parseFloat(tanpaKoma(node.fpp_harga_kg)),
            fpp_harga_btg: parseFloat(tanpaKoma(node.fpp_harga_btg)),
            fpp_jarak: parseFloat(tanpaKoma(node.fpp_jarak)),
            berat: parseFloat(tanpaKoma(node.berat)),
            qty_batal: parseFloat(tanpaKoma(node.qty_sisa)),
            qty_sisa: parseFloat('0.00'),
        };
    });

    // Ubah struktur objek sesuai dengan struktur yang diinginkan
    const newDataDetailSimpan = {
        detailJson: newNodes,
    };

    return newDataDetailSimpan;

    // console.log(newDataDetailSimpan);
    // // Set data baru ke state setDataDetailSimpan
    // setDataDetailSimpan(newDataDetailSimpan);
};
