import axios from 'axios';
import moment from 'moment';
const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

const getListJadwalHasilStokOpname = async (props: any) => {
    const { params, token } = props;
    try {
        const res = await axios.get(`${apiUrl}/erp/list_jadwal_dan_hasil_stok_opname`, {
            params,
            headers: { Authorization: `Bearer ${token}` },
        });

        return res.data.data;
    } catch (error) {
        console.error(error);
    }
};

const getListGenerateData = async (props: any) => {
    const { params, token } = props;
    try {
        const res = await axios.get(`${apiUrl}/erp/generate_jadwal_stok_opname`, {
            params,
            headers: { Authorization: `Bearer ${token}` },
        });

        if (props.setTglBatasWaktu) {
            props.setTglBatasWaktu(moment(res.data.dtOpname));
        }

        return res.data.data;
    } catch (error) {
        console.error(error);
    }
};

const cekGenBesi = async (props: any) => {
    const { params, token } = props;
    try {
        const res = await axios.get(`${apiUrl}/erp/cek_gen_besi`, {
            params,
            headers: { Authorization: `Bearer ${token}` },
        });

        return res.data.data;
    } catch (error) {
        console.error(error);
    }
};

const simpanGenerateData = async (props: any) => {
    const { body, token } = props;
    try {
        const res = await axios.post(`${apiUrl}/erp/simpan_generate_hasil_jadwal_stok_opname`, body, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return res.data;
    } catch (error) {
        console.error(error);
    }
};

const simpanOpnameData = async (props: any) => {
    const { body, token } = props;

    try {
        const res = await axios.post(`${apiUrl}/erp/simpan_hasil_jadwal_stok_opname`, body, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return res.data;
    } catch (error) {
        console.error(error);
    }
};

const approveOpnameData = async (props: any) => {
    const { body, token } = props;

    try {
        const res = await axios.post(`${apiUrl}/erp/approval_hasil_jadwal_stok_opname`, body, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return res.data;
    } catch (error) {
        console.error(error);
    }
};

const getDataKaryawan = async (props: any) => {
    const { params, token } = props;
    try {
        const res = await axios.get(`${apiUrl}/erp/list_employee_dlg`, {
            params,
            headers: { Authorization: `Bearer ${token}` },
        });

        return res.data.data;
    } catch (error) {
        console.error(error);
    }
};

const fetchHasilTimbang = async (props: any) => {
    const { params, token } = props;
    try {
        const res = await axios.get(`${apiUrl}/erp/list_timbang_stok_opname`, {
            params,
            headers: { Authorization: `Bearer ${token}` },
        });

        return res.data.data;
    } catch (error) {
        console.error(error);
    }
};

const fetchDetailOpname = async (props: any) => {
    const { params, token } = props;
    try {
        const res = await axios.get(`${apiUrl}/erp/master_detail_hasil_stok_opname`, {
            params,
            headers: { Authorization: `Bearer ${token}` },
        });

        return res.data.data;
    } catch (error) {
        console.error(error);
    }
};

const fetchUserApp = async (props: any) => {
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

const fetchListGdUtama = async (props: any) => {
    const { params, token } = props;
    try {
        const res = await axios.get(`${apiUrl}/erp/list_gudang_utama`, {
            params,
            headers: { Authorization: `Bearer ${token}` },
        });

        return res.data.data;
    } catch (error) {
        console.error(error);
    }
};

const generateStokOpname = async (props: any) => {
    const { body, token } = props;
    try {
        const res = await axios.post(`${apiUrl}/erp/hitung_stok_opname`, body, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return res.data.data;
    } catch (error) {
        console.error(error);
    }
};

const deleteJadwalHasilStokOpname = async (props: any) => {
    const { body, token } = props;

    try {
        const res = await axios.delete(`${apiUrl}/erp/delete_jadwal_stok_opname`, {
            data: body,
            headers: { Authorization: `Bearer ${token}` },
        });

        return res.data;
    } catch (error) {
        console.error(error);
    }
};
export {
    getListJadwalHasilStokOpname,
    getListGenerateData,
    cekGenBesi,
    getDataKaryawan,
    fetchHasilTimbang,
    fetchUserApp,
    fetchDetailOpname,
    fetchListGdUtama,
    deleteJadwalHasilStokOpname,
    simpanGenerateData,
    simpanOpnameData,
    approveOpnameData,
    generateStokOpname,
};
