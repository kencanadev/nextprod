import axios, { AxiosResponse } from 'axios';
const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

//=================================================================
// API yang digunakan untuk List Akun Kas Mutasi Bank
const getListPhe = async (paramObject: any, tipeTab: any) => {
    if (paramObject.kode_entitas || paramObject.token) {
        const response = await axios.get(`${apiUrl}/erp/list_phe?`, {
            params: {
                entitas: paramObject.kode_entitas,
                param1: paramObject.noDokumen,
                param2: paramObject.tglAwal,
                param3: paramObject.tglAkhir,
                param4: paramObject.namaEkspedisi,
                param5: paramObject.noReff,
                param6: paramObject.pph23,
                param7: paramObject.statusLunas,
                param8: tipeTab,
            },
            headers: {
                Authorization: `Bearer ${paramObject.token}`,
            },
        });

        const listPhe = response.data.data;
        return listPhe;
    } else {
        return [];
    }
};
//END
//=================================================================

//=================================================================
// API untuk menampilkan List Ekspedisi
const GetListEkspedisi = async (paramObject: any) => {
    if (paramObject.kode_entitas || paramObject.token) {
        const response = await axios.get(`${apiUrl}/erp/list_ekspedisi_phe?`, {
            params: {
                entitas: paramObject.kode_entitas,
            },
            headers: {
                Authorization: `Bearer ${paramObject.token}`,
            },
        });
        const responseData = response.data.data;
        return responseData;
    } else {
        return [];
    }
};

//=================================================================
// API untuk menampilkan List PPH
const GetListPph = async (paramObject: any) => {
    if (paramObject.kode_entitas || paramObject.token) {
        const response = await axios.get(`${apiUrl}/erp/list_pph?`, {
            params: {
                entitas: paramObject.kode_entitas,
            },
            headers: {
                Authorization: `Bearer ${paramObject.token}`,
            },
        });
        const responseData = response.data.data;
        return responseData;
    } else {
        return [];
    }
};

//=================================================================
// API untuk menampilkan List Alokasi Pembayaran
const GetListAlokasiPembayaranPhe = async (paramObject: any) => {
    if (paramObject.kode_entitas || paramObject.token) {
        const response = await axios.get(`${apiUrl}/erp/list_alokasi_pembyaran_phe?`, {
            params: {
                entitas: paramObject.kode_entitas,
                param1: paramObject.kode_phe,
                param2: paramObject.pph23,
                param3: paramObject.kode_rpe,
                param4: paramObject.via,
            },
            headers: {
                Authorization: `Bearer ${paramObject.token}`,
            },
        });
        const responseData = response.data.data;
        return responseData;
    } else {
        return [];
    }
};

const PostSimpanPHE = async (jsonData: any, token: any, kode_entitas: any) => {
    if (kode_entitas || token) {
        const response = await axios.post(`${apiUrl}/erp/simpan_phe`, jsonData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response;
    } else {
        return [];
    }
};

//=================================================================
// API untuk menampilkan data pada saat klik EDIT
const GetEditPhe = async (paramObject: any) => {
    if (paramObject.kode_entitas || paramObject.token) {
        const response = await axios.get(`${apiUrl}/erp/detail_phe?`, {
            params: {
                entitas: paramObject.kode_entitas,
                param1: paramObject.kode_phe,
                param2: paramObject.pph23,
                param3: paramObject.kode_rpe,
                param4: paramObject.via,
                param5: paramObject.kode_dokumen,
            },
            headers: {
                Authorization: `Bearer ${paramObject.token}`,
            },
        });
        const responseData = response.data.data;
        return responseData;
    } else {
        return [];
    }
};

//=================================================================
// API yang digunakan untuk menganbil respone Imgaes
const GetTbImagesPhe = async (kode_entitas: string, kode_phe: any) => {
    if (kode_entitas) {
        const response = await axios.get(`${apiUrl}/erp/load_fileGambar`, {
            params: {
                entitas: kode_entitas,
                param1: kode_phe,
            },
        });
        const get_tb_images = response.data.data;
        return get_tb_images;
    } else {
        return [];
    }
};

const LoadImagesPhe = async (kode_entitas: any, kode_phe: any) => {
    const response = await axios.get(`${apiUrl}/erp/load_images`, {
        params: {
            entitas: kode_entitas,
            param1: kode_phe,
        },
    });
    const load_images = response.data.data;
    return load_images;
};

const GetBankEks = async (paramObject: any) => {
    const response = await axios.get(`${apiUrl}/erp/getbankeks`, {
        params: {
            entitas: paramObject.kode_entitas,
            param1: paramObject.pph23,
            param2: paramObject.via,
        },
        headers: {
            Authorization: `Bearer ${paramObject.token}`,
        },
    });
    const load_images = response.data.data;
    return load_images;
};

// const PostReleasePhe = async (jsonData: any, token: any, kode_entitas: any) => {
//     if (kode_entitas || token) {
//         const response = await axios.post(`${apiUrl}/erp/release_phe`, jsonData, {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//             },
//         });
//         return response;
//     } else {
//         return [];
//     }
// };

interface ResponseData {
    // Definisikan tipe data yang sesuai
    [key: string]: any;
}

const PostReleasePhe = async (jsonData: any, token: string, kode_entitas: string): Promise<AxiosResponse<ResponseData>> => {
    if (!kode_entitas || !token) {
        throw new Error('Kode entitas atau token tidak valid.');
    }

    const response = await axios.post<ResponseData>(`${apiUrl}/erp/release_phe`, jsonData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
};

const GetAllEntitas = async (kode_entitas: any, token: any) => {
    if (kode_entitas || token) {
        const response = await axios.get(`${apiUrl}/erp/entitas_pajak?`, {
            params: {
                // Belum Sesuai Jumlah Data yang Muncul = [Semua, A-F]
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const filteredData = response.data.data.filter((item: any) => item.tampil === 'Y' && (item.kodecabang !== '899' || item.kodecabang !== '899')); 

        return filteredData;
    } else {
        return [];
    }
};

const getListPheKonsolidasi = async (paramObject: any, tab: any) => {
    const response = await axios.get(`${apiUrl}/erp/list_phe_konsolidasi`, {
        params: {
            entitas: paramObject.kode_entitas,
            tab: tab,
            param1: paramObject.noDokumen,
            param2: paramObject.tglAwal,
            param3: paramObject.tglAkhir,
            param4: paramObject.namaEkspedisi,
            param5: paramObject.noReff,
            param6: paramObject.pph23,
            param7: paramObject.statusLunas,
        },
        headers: {
            Authorization: `Bearer ${paramObject.token}`,
        },
    });
    const GetListPheKonsolidasi = response.data.data;
    return GetListPheKonsolidasi;
};

const getListCekNoInvPheKonsolidasi = async (kode_entitas: any, token: any, kode_phe: any) => {
    if (kode_entitas || token) {
        const response = await axios.get(`${apiUrl}/erp/cek_no_inv_phe_konsolidasi`, {
            params: {
                entitas: kode_entitas,
                param1: kode_phe,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const getListCekNoInvPheKonsolidasi = response.data.data;
        return getListCekNoInvPheKonsolidasi;
    } else {
        return [];
    }
};

//=================================================================
// API yang digunakan untuk menganbil respone Imgaes
const GetTbImagesPheById = async (kode_entitas: string, kode_phe: any) => {
    if (kode_entitas) {
        const response = await axios.get(`${apiUrl}/erp/get_tb_images`, {
            params: {
                entitas: kode_entitas,
                param1: kode_phe,
            },
        });
        const get_tb_images = response.data.data;
        return get_tb_images;
    } else {
        return [];
    }
};

//=================================================================
// API yang digunakan untuk menganbil respone Imgaes
const GetLoadFileGambarById = async (kode_entitas: string, kode_dokumen: any, id_dokumen: any, entitas_pusat: any) => {
    if (kode_entitas) {
        const getImage = await axios.get(`${apiUrl}/erp/load_fileGambar_byId?`, {
            params: {
                entitas: kode_entitas,
                param1: kode_dokumen,
                param2: id_dokumen,
                param3: entitas_pusat,
            },
        });
        const get_tb_images = getImage.data;
        return get_tb_images;
    } else {
        return [];
    }
};

const GetListKaryawan = async (kode_entitas: any, token: any) => {
    if (kode_entitas || token) {
        const response = await axios.get(`${apiUrl}/erp/list_karyawan`, {
            params: {
                entitas: kode_entitas,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const getListKaryawan = response.data.data;
        return getListKaryawan;
    } else {
        return [];
    }
};

export {
    GetListKaryawan,
    GetLoadFileGambarById,
    GetTbImagesPheById,
    getListCekNoInvPheKonsolidasi,
    getListPheKonsolidasi,
    GetAllEntitas,
    PostReleasePhe,
    GetBankEks,
    LoadImagesPhe,
    GetTbImagesPhe,
    GetEditPhe,
    PostSimpanPHE,
    GetListAlokasiPembayaranPhe,
    GetListPph,
    GetListEkspedisi,
    getListPhe,
};
