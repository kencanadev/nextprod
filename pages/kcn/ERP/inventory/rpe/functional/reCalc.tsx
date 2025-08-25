import { DiskonByCalc, tanpaKoma } from '@/utils/routines';
import moment from 'moment';

import React from 'react';

const reCalc = () => {
    return <div>reCalc</div>;
};

export default reCalc;

const ReCalcDataNodes = async (
    dataBarang: any,
    dataJurnal: any,
    dataObject: any,
    dataKeuangan: any,
    stateDataHeader: any,
    stateDataFooter: any,
    userid: any,
    noDokJurnal: any,
    masterDataState: any,
    stateKodeRpe: any,
    vno_jurnal: any
) => {
    console.log('dataBarang.nodes = ', dataBarang.nodes, dataJurnal);

    const dataNodes = await dataBarang.nodes.filter((node: any) => node.idChecked > 0);
    const dataNodesJurnal = dataJurnal.nodes;
    // const dataNodesJurnal = await dataJurnal.nodes.filter((node: any) => node.idChecked > 0);
    //const dataNodesKeuangan = await dataKeuangan.nodes.filter((node: any) => node.idChecked !== 0);
    const dataNodesKeuangan = await dataJurnal.nodes.filter((node: any) => node.idChecked > 0);

    const updateIds = (newNodes: any) => {
        return newNodes.map((node: any, index: any) => {
            return {
                ...node,
                id: index + 1,
            };
        });
    };

    const newNodes = await Promise.all(
        updateIds(dataNodes).map(async (node: any) => {
            return {
                ...node,
            };
        })
    );

    const newNodesSimpan = await Promise.all(
        updateIds(dataNodes).map(async (node: any) => {
            return {
                id_rpe: node.id,
                kode_fbm: node.kode_fbm,
                pay: 'Y',
                rpeba: 'N',
                harga_eks: node.harga_eks,
                ket_klaim_eks: '',
                harga_tambahan: node.tambahan_jarak,
                waktuCeklis: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            };
        })
    );

    const newNodesJurnalSimpan = await Promise.all(
        updateIds(dataNodesJurnal).map(async (node: any) => {
            return {
                id_dokumen: node.id_dokumen,
                id: node.id,
                dokumen: node.dokumen,
                tgl_dokumen: node.tgl_dokumen,
                kode_akun: node.kode_akun,
                no_akun: node.no_akun,
                nama_akun: node.nama_akun,
                tipe: node.tipe,
                kode_subledger: node.kode_subledger,
                no_subledger: node.no_subledger,
                nama_subledger: node.nama_subledger,
                kurs: node.kurs,
                kode_mu: node.kode_mu,
                debet_rp: node.debet_rp,
                kredit_rp: node.kredit_rp,
                jumlah_rp: node.jumlah_rp,
                jumlah_mu: node.jumlah_mu,
                catatan: node.catatan,
                persen: node.persen,
                kode_dept: node.kode_dept,
                kode_kerja: node.kode_kerja,
                approval: node.approval,
                posting: node.posting,
                rekonsiliasi: node.rekonsiliasi,
                tgl_rekonsil: null,
                userid: userid.toUpperCase(),
                tgl_update: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                nama_dept: node.nama_dept,
                nama_kerja: node.nama_kerja,
                isledger: node.isledger,
                subledger: node.subledger,
                no_warkat: node.no_warkat,
                tgl_valuta: node.tgl_dokumen,
                no_kerja: node.no_kerja,
                kode_kry: node.kode_kry,
                kode_jual: node.kode_jual,
            };
        })
    );

    //  console.log(masterDataState, '===keuangan master');
    const newNodesKeuanganSimpan = {
        dokumen: 'JU',
        no_dokumen: noDokJurnal,
        tgl_dokumen: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        no_warkat: null,
        tgl_valuta: null,
        kode_cust: null,
        kode_akun_debet: null,
        kode_supp: null,
        kode_akun_kredit: null,
        kode_akun_diskon: null,
        kurs: null,
        debet_rp: stateDataFooter.totalPembayaran,
        kredit_rp: stateDataFooter.totalPembayaran,
        jumlah_rp: stateDataFooter.totalPembayaran,
        jumlah_mu: stateDataFooter.totalPembayaran,
        pajak: null,
        kosong: null,
        kepada: null,
        catatan:
            masterDataState === 'APPROVE'
                ? 'RPE ' + stateDataHeader.noRpe + ', HUTANG ' + stateDataHeader.namaEkspedisi
                : '[REV.JU ' + vno_jurnal + ']' + ' RPE ' + stateDataHeader.noRpe + ', HUTANG ' + stateDataHeader.namaEkspedisi,
        //  [REV.JU 9920.1307.00011] RPE 9985.1214.00004, HUTANG DWI TRIDAYA MANDIRI (DTM)
        status: 'Terbuka',
        userid: userid.toUpperCase(),
        tgl_update: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        status_approved: null,
        tgl_approved: null,
        tgl_pengakuan: null,
        no_ttp: null,
        tgl_ttp: null,
        kode_sales: null,
        kode_fk: null,
        approval: null,
        tgl_setorgiro: null,
        faktur: 'N',
        barcode: null,
        komplit: 'N',
        validasi1: 'N',
        validasi2: 'N',
        validasi3: 'N',
        validasi_ho2: 'N',
        validasi_ho3: 'N',
        validasi_catatan: null,
        tolak_catatan: null,
        kode_kry: null,
        tgl_trxdokumen: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        api_id: 0,
        api_pending: 'N',
        api_catatan: '',
        api_norek: '',
        kode_aktiva: null,
        kode_rpe: stateKodeRpe,
        kode_phe: null,
        kode_rps: null,
        kode_um: null,
        no_kontrak_um: null,
        bm_pos: 'N',
        batal: 'N',
    };

    let totNettoRp: any;
    let totTotalRp: any;
    let beratTotal: any;
    let tambahanJarak: any;
    let totalBeratEkspedisi: any;
    let totalBeratPabrik: any;
    let totalKlaimEkspedisi: any;
    let totalKlaimPabrik: any;

    totNettoRp = newNodes.reduce((acc: number, node: any) => {
        if (node.idChecked > 0) {
            // return acc + parseFloat(node.netto_rp);
            return acc + parseFloat(node.total_rp);

        }
        return acc;
    }, 0);
    totTotalRp = newNodes.reduce((acc: number, node: any) => {
        if (node.idChecked > 0) {
            return acc + parseFloat(node.total_rp);
        }
        return acc;
    }, 0);
    beratTotal = newNodes.reduce((acc: number, node: any) => {
        if (node.idChecked > 0) {
            return acc + parseFloat(node.total_berat);
        }
        return acc;
    }, 0);

    tambahanJarak = newNodes.reduce((acc: number, node: any) => {
        if (node.idChecked > 0) {
            return acc + parseFloat(node.tambahan_jarak);
        }
        return acc;
    }, 0);

    totalBeratEkspedisi = newNodes.reduce((acc: number, node: any) => {
        if (node.idChecked > 0) {
            return acc + parseFloat(node.total_berat_ekspedisi);
        }
        return acc;
    }, 0);

    totalBeratPabrik = newNodes.reduce((acc: number, node: any) => {
        if (node.idChecked > 0) {
            return acc + parseFloat(node.total_berat_pabrik);
        }
        return acc;
    }, 0);

    totalKlaimEkspedisi = newNodes.reduce((acc: number, node: any) => {
        if (node.idChecked > 0) {
            return acc + parseFloat(node.total_klaim_ekspedisi);
        }
        return acc;
    }, 0);

    totalKlaimPabrik = newNodes.reduce((acc: number, node: any) => {
        if (node.idChecked > 0) {
            return acc + parseFloat(node.total_klaim_pabrik);
        }
        return acc;
    }, 0);

    const total_tagihan = totNettoRp + tambahanJarak + parseFloat(dataObject.biayaLainLain);
    const total_bayar = dataObject.nominalInvoice > 0 ? (total_tagihan > dataObject.nominalInvoice ? dataObject.nominalInvoice : total_tagihan) : 0;
    const nilai_pph23 = parseFloat(total_bayar) > 0 ? (parseFloat(total_bayar) * dataObject.nilaiPph23) / 100 : 0;
    const potongan_ekspedisi = dataObject.potonganEkspedisiLain > 0 ? parseFloat(dataObject.potonganEkspedisiLain) : 0;
    const biaya_lainlain = dataObject.biayaLainLain > 0 ? parseFloat(dataObject.biayaLainLain) : 0;

    //console.log('sffsdfdsffdsf = ', parseFloat(total_bayar), dataObject.nilaiPph23);
    const newDataSimpan = {
        detailJson: newNodesSimpan,
        detailJurnalJson: newNodesJurnalSimpan,
        detailKeuanganJson: newNodesKeuanganSimpan,
        totalTagihan: total_tagihan,
        // totalBayar: parseFloat(total_bayar),
        totalBayar: parseFloat(dataObject.nominalInvoice),
        nilaiPph23: nilai_pph23,
        potonganEkspedisi: potongan_ekspedisi,
        totalMu: totTotalRp - totalKlaimEkspedisi + tambahanJarak + biaya_lainlain - nilai_pph23 - potongan_ekspedisi,
        tambahanJarak: tambahanJarak,
        totalBeratEkspedisi: totalBeratEkspedisi,
        totalBeratPabrik: totalBeratPabrik,
        totalKlaimEkspedisi: totalKlaimEkspedisi,
        totalKlaimPabrik: totalKlaimPabrik,
        subTotal: totTotalRp,
    };

    return newDataSimpan;
};

export { ReCalcDataNodes };
