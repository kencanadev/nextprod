/* eslint-disable react-hooks/rules-of-hooks */
import axios from 'axios';
import moment from 'moment';
import swal from 'sweetalert2';
import { showLoading } from '@/utils/routines';
import { useRouter } from 'next/router';
import { frmNumber } from '@/utils/routines';

import React from 'react'

const api = () => {
  return (
    <div>api</div>
  )
}

export default api

export const MpbListApi = async (entitas: string, pNoMpb: string, pTglChecked: boolean, pTglAwal: any, pTglAkhir: any, pNamaSupplier: string, pKodeGudang: string, pStatusDokumen: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    type MPBListGrid = {
        kode_mpb: string;
        no_mpb: string;
        tgl_mpb: any;
        kode_gudang: string;
        kode_supp: string;
        via: string;
        pengemudi: string;
        nopol: string;
        total_rp: any;
        total_diskon_rp: any;
        total_pajak_rp: any;
        netto_rp: any;
        keterangan: string;
        status: string;
        userid: string;
        tgl_update: string;
        nama_gudang: string;
        nama_supp: string;
    };
    //  showLoading();
    if (entitas !== null || entitas !== '') {
        try {
            let vNoMpb = 'all';
            let vTglAwal = 'all';
            let vTglAkhir = 'all';
            let vNamaSupplier = 'all';
            let vKodeGudang = 'all';
            let vStatusDokumen = 'all';
            let vlimit = '10000';

            if (pNoMpb == null || pNoMpb == '') {
                vNoMpb = 'all';
            } else {
                vNoMpb = `${pNoMpb}`;
            }

            if (pTglAwal == null || pTglAwal == '') {
                vTglAwal = `all`;
            } else {
                vTglAwal = `${moment(pTglAwal).format('YYYY-MM-DD')}`;
            }

            if (pTglAkhir == null || pTglAkhir == '') {
                vTglAkhir = `all`;
            } else {
                vTglAkhir = `${moment(pTglAkhir).format('YYYY-MM-DD')}`;
            }

            if (pTglChecked == false) {
                vTglAwal = `all`;
                vTglAkhir = `all`;
            } else {
                vTglAwal = `${moment(pTglAwal).format('YYYY-MM-DD')}`;
                vTglAkhir = `${moment(pTglAkhir).format('YYYY-MM-DD')}`;
            }

            if (pNamaSupplier == null || pNamaSupplier == '') {
                vNamaSupplier = `all`;
            } else {
                vNamaSupplier = `${pNamaSupplier}`;
            }

            if (pKodeGudang == null || pKodeGudang == '') {
                vKodeGudang = `all`;
            } else {
                vKodeGudang = `${pKodeGudang}`;
            }

            if (pStatusDokumen == null || pStatusDokumen == '') {
                vStatusDokumen = `all`;
            } else {
                vStatusDokumen = `${pStatusDokumen}`;
            }

            const response = await axios.get(`${apiUrl}/erp/list_mpb?`, {
                params: {
                    entitas: entitas,
                    param1: vNoMpb,
                    param2: vTglAwal,
                    param3: vTglAkhir,
                    param4: vNamaSupplier,
                    param5: vKodeGudang,
                    param6: vStatusDokumen,
                    param7: vlimit,
                },
            });

            // console.log({ entitas: entitas, param1: vNoMpb, param2: vTglAwal, param3: vTglAkhir, param4: vNamaSupplier, param5: vKodeGudang, param6: vStatusDokumen, param7: vlimit });

            const responseData = response.data.data;
            // alert('response daata ' + responseData);
            // console.log('response data ' + responseData);

            // const transformedDataListMpb = responseData.map((item: any) => ({
            const transformedDataListMpb: MPBListGrid[] = responseData.map((item: any) => ({
                ...item,
                netto_rp: frmNumber(item.netto_rp),
                // netto_rp: frmNumber(netto_rp),
                // kode_mpb: item.kode_mpb,
                // no_mpb: item.no_mpb,
                // tgl_mpb: moment(item.tgl_pp).format('DD-MM-YYYY'),
                // kode_gudang: item.kode_gudang,
                // kode_supp: item.kode_supp,
                // via: item.via,
                // pengemudi: item.pengemudi,
                // nopol: item.nopol,
                // total_rp: item.total_rp,
                // total_diskon_rp: item.total_diskon_rp,
                // total_pajak_rp: item.total_pajak_rp,
                // netto_rp: item.netto_rp,
                // keterangan: item.keterangan,
                // status: item.status,
                // userid: item.userid,
                // tgl_update: moment(item.tgl_pp).format('DD-MM-YYYY'),
                // nama_gudang: item.nama_gudang,
                // nama_supp: item.nama_supp,
            }));

            // setAllRecords(transformedData);
            // setTotalRecords(transformedData.length);
            return transformedDataListMpb;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }
    const router = useRouter();
    if (entitas == null || entitas == '') {
        alert('Silahkan Login Kembali, Session Habis');
        setTimeout(() => {
            router.push({ pathname: '/' });
        }, 1000);
    }
    swal.close();
};

export const MpbEditApi = async (entitas: string, pKodeMpb: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    type MPBDetailGrid = {
        kode_lpb: any;
        no_lpb: any;
        id_lpb: any;
        kode_sp: any;
        id_sp: any;
        kode_pp: any;
        id_pp: any;
        kode_item: any;
        no_item: any;
        diskripsi: any;
        qty: any;
        satuan: any;
        sat_std: any;
        kode_mu: any;
        kurs: any;
        kurs_pajak: any;
        harga_mu: any;
        diskon: any;
        diskon_mu: any;
        potongan_mu: any;
        kode_pajak: any;
        include: any;
        pajak: any;
        pajak_mu: any;
        ket: any;
        kode_dept: any;
        kode_kerja: any;
        kode_akun_persediaan: any;
        brt: any;
        qty_std: any;
        qty_sisa: any;
        berat: any;
        no_dok: any;
        no_sj: any;
        tgl_sj: any;
        jumlah_rp: any;
        jumlah_mu: any;
        qty2: any;
        qty2_std: any;
        qty2_sisa: any;
        berat2: any;
        no_dok2: any;
        no_sj2: any;
        tgl_sj2: any;
        cari_rp: any;
        cari_mu: any;
        index: number;
    };
    // showLoading();
    if (entitas !== null || entitas !== '') {
        try {
            const responseDetailMPB = await axios.get(`${apiUrl}/erp/detail_mpb?`, {
                params: {
                    entitas: entitas,
                    param1: pKodeMpb,
                },
            });

            const responseData = responseDetailMPB.data.data;
            const transformedDataEditMpb: MPBDetailGrid[] = responseData.map((item: any) => ({
                ...item,
                // netto_rp: frmNumber(item.netto_rp),
            }));
            return transformedDataEditMpb;
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    const router = useRouter();
    if (entitas == null || entitas == '') {
        alert('Silahkan Login Kembali, Session Habis');
        setTimeout(() => {
            router.push({ pathname: '/' });
        }, 1000);
    }
    swal.close();
};
