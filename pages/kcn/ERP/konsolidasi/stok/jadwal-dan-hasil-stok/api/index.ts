import axios from 'axios';
const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

export const getEntitasPajak = async (props: any) => {
    const { params, token } = props;
    try {
        const res = await axios.get(`${apiUrl}/erp/entitas_pajak?entitas=600&param1=administrator`, {
            params,
            headers: { Authorization: `Bearer ${token}` },
        });

        return res.data.data;
    } catch (error) {
        console.error(error);
        return error;
    }
};

export const GetAllEntitas = async (kode_entitas: any, token: any) => {
    if (kode_entitas || token) {
        const response = await axios.get(`${apiUrl}/erp/entitas_pajak?`, {
            params: {
                // Belum Sesuai Jumlah Data yang Muncul = [Semua, A-F]
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const filteredData = response.data.data.filter((item: any) => item.tampil === 'Y' && item.kodecabang !== '898');
        const temp = filteredData.filter((item: any) => item.tampil === 'Y' && item.kodecabang !== '899');
        return temp;
    } else {
        return [];
    }
};

export const getAllListOpname = async (props: any) => {
    const { params, token } = props;
    try {
        const res = await axios.get(`${apiUrl}/erp/list_jadwal_dan_hasil_stok_opname`, {
            params,
            headers: { Authorization: `Bearer ${token}` },
        });

        return res.data.data;
    } catch (error) {
        console.error(error);
        return error;
    }
};

export const getDetailOpname = async (props: any) => {
    const { params, token } = props;
    try {
        const res = await axios.get(`${apiUrl}/erp/master_detail_hasil_stok_opname`, {
            params,
            headers: { Authorization: `Bearer ${token}` },
        });

        return res.data.data;
    } catch (error) {
        console.error(error);
        return error;
    }
};

export const postApproveOpname = async (props: any) => {
    const { body, token } = props;

    try {
        const res = await axios.post(`${apiUrl}/erp/approval_hasil_jadwal_stok_opname`, body, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return res.data;
    } catch (error) {
        console.error(error);
        return error;
    }
};

export const getUserApp = async (props: any) => {
    const { params, token } = props;
    try {
        const res = await axios.get(`${apiUrl}/erp/users_app`, {
            params,
            headers: { Authorization: `Bearer ${token}` },
        });

        return res.data.data;
    } catch (error) {
        console.error(error);
    }
};
