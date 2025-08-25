const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
import axios from 'axios';
import moment from 'moment';
import React from 'react'

const api = () => {
  return (
    <div>api</div>
  )
}

export default api
/*
REDME
-- DataDetailDok -> API untuk menampilkan detail dok data TTB pada saat tombol detail dok di pilih, 
-- GetPeriode --> API untuk menampilkan periode yang sedang berjalan saat ini, 
    1. digunakan untuk membloking pada saat akan melakukan edit data TTB kalo legih kecil dari priode berjalan akan terbloking.
-- GetMasterAlasan -> API untuk menampilkan data master Alasan pada filter
-- GetListTtb --> API untuk menampilkan data list ttb sesuai filter
-- GetListEditTtb --> API untuk menampilkan data list untuk edit data
-- GetDlgDetailSjItem --> API untuk menampilkan daftar dialog detail data item SJ
-- PostSimpanTtb --> API untuk simpan data TTB
-- PostSimpanAudit -- > API untuk simpan data history data ttb ke table audit
-- PatchUpdateTtb --> API untuk update data TTB

*/

//=================================================================
// API yang digunakan pada FormTtbList
const DataDetailDok = async (kode_ttb: any, kode_entitas: any): Promise<any[]> => {
    const response = await axios.get(`${apiUrl}/erp/list_detail_dok_ttb?`, {
        params: {
            entitas: kode_entitas,
            param1: kode_ttb,
        },
    });

    const listDetailDok = response.data.data;
    return listDetailDok;
};

const GetPeriode = async (kode_entitas: any): Promise<any[]> => {
    const response = await axios.get(`${apiUrl}/erp/get_info?`, {
        params: {
            entitas: kode_entitas,
        },
    });

    const responseData = response.data.data;
    return responseData;
};

const GetListTtb = async (paramObject: any) => {
    const { kode_entitas, vGagal, vNoTtb, vTglAwal, vTglAkhir, vNamaRelasi, vNoReff, vKodeGudang, vGrp, vKustom10, vStatus, vAlasan, vPilihanGrp, vLimit } = paramObject;
    const response = await axios.get(`${apiUrl}/erp/get_ttb?`, {
        params: {
            entitas: kode_entitas,
            gagal: vGagal, // Gagal
            no_ttb: vNoTtb, // No TTB
            tanggal_awal: vTglAwal, // Tanggal Awal
            tanggal_akhir: vTglAkhir, // Tanggal Akhir
            nama_relasi: vNamaRelasi, // nama Relasi
            no_reff: vNoReff, // No Reff
            kode_gudang: vKodeGudang, // Kode Gudang
            grp: vGrp, // Grp
            kustom10: vKustom10, // Kelompok
            status: vStatus, // Status Dokumen
            alasan: vAlasan, // Alasan
            pilihan_grp: vPilihanGrp, // Pilihan Grp Y N All
            limit: vLimit,
        },
    });
    const responseData = response.data.data;
    return responseData;
};

const GetListTtbEffect = async (paramObject: any) => {
    const { kode_entitas, vGagal, vNoTtb, vTglAwal, vTglAkhir, vNamaRelasi, vNoReff, vKodeGudang, vGrp, vKustom10, vStatus, vAlasan, vPilihanGrp, vLimit } = paramObject;
    const response = await axios.get(`${apiUrl}/erp/get_ttb?`, {
        params: {
            entitas: kode_entitas,
            gagal: vGagal, // Gagal
            no_ttb: vNoTtb, // No TTB
            tanggal_awal: vTglAwal, // Tanggal Awal
            tanggal_akhir: vTglAkhir, // Tanggal Akhir
            nama_relasi: vNamaRelasi, // nama Relasi
            no_reff: vNoReff, // No Reff
            kode_gudang: vKodeGudang, // Kode Gudang
            grp: vGrp, // Grp
            kustom10: vKustom10, // Kelompok
            status: vStatus, // Status Dokumen
            alasan: vAlasan, // Alasan
            pilihan_grp: vPilihanGrp, // Pilihan Grp Y N All
            limit: vLimit,
        },
    });
    const responseData = response.data.data;
    return responseData;
};
//END
//=================================================================

//=================================================================
// API yang digunakan pada FormRpe
const GetListEditRpe = async (kode_entitas: any, kode_rpe: any, jenis: any, token: any) => {
    const response = await axios.get(`${apiUrl}/erp/master_detail_rpe`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: {
            entitas: kode_entitas,
            param1: kode_rpe,
        },
    });

    const responsData = response.data;
    return responsData;
};

// API yang digunakan AutoJurnal
const GetListDeptRpe = async (kode_entitas: any, token: any) => {
    const response = await axios.get(`${apiUrl}/erp/get_dept`, {
        // headers: {
        //     Authorization: `Bearer ${token}`,
        // },
        params: {
            entitas: kode_entitas,
        },
    });

    const responsData = response.data;
    return responsData;
};

// API yang digunakan AutoJurnal
const GetListAkunJurnal = async (kode_entitas: any, token: any) => {
    const response = await axios.get(`${apiUrl}/erp/akun_jurnal`, {
        // headers: {
        //     Authorization: `Bearer ${token}`,
        // },
        params: {
            entitas: kode_entitas,
        },
    });

    const responsData = response.data;
    return responsData;
};

// API yang digunakan AutoJurnal
const GetListSubledger = async (kode_entitas: any, token: any) => {
    const response = await axios.get(`${apiUrl}/erp/list_subledger`, {
        // headers: {
        //     Authorization: `Bearer ${token}`,
        // },
        params: {
            entitas: kode_entitas,
        },
    });

    const responsData = response.data;
    return responsData;
};

const GetListKryRpe = async (kode_entitas: any, token: any) => {
    const response = await axios.get(`${apiUrl}/erp/list_karyawan`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: {
            entitas: kode_entitas,
        },
    });

    const responsData = response.data;
    return responsData;
};

const GetListAreaJualRpe = async (kode_entitas: any, token: any) => {
    const response = await axios.get(`${apiUrl}/erp/kode_jual`, {
        // headers: {
        //     Authorization: `Bearer ${token}`,
        // },
        params: {
            entitas: kode_entitas,
        },
    });

    const responsData = response.data;
    return responsData;
};

const GetListSettingRpe = async (kode_entitas: any, token: any) => {
    const response = await axios.get(`${apiUrl}/erp/setting`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: {
            entitas: kode_entitas,
        },
    });

    const responsData = response.data;
    return responsData;
};

const GetDlgDetailSjItem = async (kode_entitas: any, kode_cust: any) => {
    const response1 = await axios.get(`${apiUrl}/erp/dlg_detail_sj_item`, {
        params: {
            entitas: kode_entitas,
            param1: kode_cust,
            param2: '%',
            param3: '%',
            param4: '%',
        },
    });
    const responsData = response1.data.data;
    return responsData;
};

const PostSimpanTtb = async (jsonData: any) => {
    const response = await axios.post(`${apiUrl}/erp/simpan_ttb`, jsonData);
    return response;
};

const PostSimpanAudit = async (bodyObject: any) => {
    const { kode_entitas, kode_audit, dokumen, kode_dokumen, no_dokumen, tanggal, proses, diskripsi, userid, system_user, system_ip, system_mac } = bodyObject;
    const auditResponse = await axios.post(`${apiUrl}/erp/simpan_audit`, {
        entitas: kode_entitas,
        kode_audit: kode_audit,
        dokumen: dokumen,
        kode_dokumen: kode_dokumen,
        no_dokumen: no_dokumen,
        tanggal: tanggal,
        proses: proses,
        diskripsi: diskripsi,
        userid: userid, // userid login web
        system_user: system_user, //username login
        system_ip: system_ip, //ip address
        system_mac: system_mac, //mac address
    });
    return auditResponse;
};

const PatchUpdateTtb = async (jsonData: any) => {
    const response = await axios.patch(`${apiUrl}/erp/update_ttb`, jsonData);
    return response;
};

// API yang digunakan pada ambil kode dokumen keuangan pada pembatalan
const GetListKeuangan = async (kode_entitas: any, kode_dokumen: any, jenis: any, token: any) => {
    const response = await axios.get(`${apiUrl}/erp/master_detail_pembayaran_uang_muka`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: {
            entitas: kode_entitas,
            param1: kode_dokumen,
        },
    });

    const responsData = response.data;
    return responsData;
};
//END
//=================================================================

//=================================================================
// API yang digunakan pada FormTtb dan FormTtbList
const GetMasterAlasan = async (kode_entitas: any): Promise<any[]> => {
    const responseAlasan = await axios.get(`${apiUrl}/erp/master_alasan`, {
        params: {
            entitas: kode_entitas,
        },
    });
    const masterAlasan = responseAlasan.data.data;
    return masterAlasan;
};
//END
//=================================================================

//=================================================================
// API yang digunakan untuk Detail daftar SJ Item
const RefreshDetailSjItemAPI = async (kode_entitas: string, custSelectedKode: any, refKodeCust: any, entitas: any) => {
    const response = await axios.get(`${apiUrl}/erp/dlg_detail_sj_item?`, {
        params: {
            entitas: kode_entitas,
            param1: custSelectedKode === '' ? refKodeCust : custSelectedKode,
            param2: '%',
            param3: '%',
            param4: '%',
            param5: entitas,
        },
    });
    const result = response.data;
    return result;
};
// END
//=================================================================

//=================================================================
// API yang digunakan untuk Filter Data Customer
const ListCustFilter = async (kode_entitas: string, param1: string, param2: string, param3: string) => {
    const response = await axios.get(`${apiUrl}/erp/list_cust_so?`, {
        params: {
            entitas: kode_entitas,
            param1: param1,
            param2: param2,
            param3: param3,
        },
    });
    const result = response.data;
    return result;
};
//END
//=================================================================

//=================================================================
// API yang digunakan untuk Detail daftar SJ Item
const RefreshDetailSjAPI = async (kode_entitas: string, refKodeCust: any, custSelectedKode: any, entitas: any) => {
    const response = await axios.get(`${apiUrl}/erp/dlg_detail_sj?`, {
        params: {
            entitas: kode_entitas,
            param1: custSelectedKode === '' ? refKodeCust : custSelectedKode,
            param2: entitas,
        },
    });
    const result = response.data;
    return result;
};
// END
//=================================================================

export {
    GetListSubledger,
    GetListAkunJurnal,
    RefreshDetailSjAPI,
    ListCustFilter,
    RefreshDetailSjItemAPI,
    DataDetailDok,
    GetPeriode,
    GetMasterAlasan,
    GetListTtb,
    GetListEditRpe,
    GetDlgDetailSjItem,
    PostSimpanTtb,
    PostSimpanAudit,
    PatchUpdateTtb,
    GetListTtbEffect,
    GetListDeptRpe,
    GetListKryRpe,
    GetListAreaJualRpe,
    GetListSettingRpe,
    GetListKeuangan,
};
