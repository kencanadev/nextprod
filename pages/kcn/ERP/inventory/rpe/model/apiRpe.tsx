const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
import axios from 'axios';
import moment from 'moment';
import React from 'react'

const apiRpe = () => {
  return (
    <div>apiRpe</div>
  )
}

export default apiRpe

//=================================================================
// API yang digunakan pada FormTtbList
const GetListRpeEffect = async (paramObject: any) => {
    const response = await axios.get(`${apiUrl}/erp/list_rpe?`, {
        params: {
            entitas: paramObject.kode_entitas,
            param1: paramObject.vNoRpe, // No. RPE
            param2: paramObject.vTglAwal, // Tgl Awal
            param3: paramObject.vTglAkhir, // Tgl Akhir
            param4: paramObject.vPengiriman, // Pengiriman / Via
            param5: paramObject.vNoFaktur, // No . Faktur
            param6: paramObject.vStatusApp, // Status Approval
        },
        headers: {
            Authorization: `Bearer ${paramObject.vToken}`,
        },
    });
    const responseData = response.data.data;
    return responseData;
};

//=================================================================
// API untuk menampilkan List Ekspedisi
const GetListEkspedisi = async (paramObject: any) => {
    const response = await axios.get(`${apiUrl}/erp/list_ekspedisi?`, {
        params: {
            entitas: paramObject.kode_entitas,
        },
        headers: {
            Authorization: `Bearer ${paramObject.vToken}`,
        },
    });
    const responseData = response.data.data;
    return responseData;
};

//=================================================================
// API untuk menampilkan List PPH
const GetListPph = async (paramObject: any) => {
    const response = await axios.get(`${apiUrl}/erp/list_pph?`, {
        params: {
            entitas: paramObject.kode_entitas,
        },
        headers: {
            Authorization: `Bearer ${paramObject.vToken}`,
        },
    });
    const responseData = response.data.data;
    return responseData;
};

//=================================================================
// API untuk menampilkan List Detail Alokasi Pembayaran
const GetListDetailRpe = async (paramObject: any) => {
    const response = await axios.get(`${apiUrl}/erp/list_detail_rpe?`, {
        params: {
            entitas: paramObject.kode_entitas,
            param1: paramObject.kode_rpe,
            param2: paramObject.nama_ekspedisi,
        },
        headers: {
            Authorization: `Bearer ${paramObject.token}`,
        },
    });
    const list_detail_rpe = response.data.data;
    return list_detail_rpe;
};

//=================================================================
// API untuk menampilkan Harga Ekspedisi
const GetListHargaEkspedisi = async (paramObject: any) => {
    const response = await axios.get(`${apiUrl}/erp/harga_ekspedisi?`, {
        params: {
            entitas: paramObject.kode_entitas,
            param1: paramObject.jenis_kirim,
            param2: paramObject.nama_ekspedisi,
            param3: paramObject.jenis_mobil,
        },
        headers: {
            Authorization: `Bearer ${paramObject.token}`,
        },
    });
    const harga_ekspedisi = response.data.data;
    return harga_ekspedisi;
};

export { GetListHargaEkspedisi, GetListDetailRpe, GetListPph, GetListEkspedisi, GetListRpeEffect };
