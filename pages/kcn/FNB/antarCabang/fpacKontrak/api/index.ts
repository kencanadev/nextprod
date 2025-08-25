import axios from 'axios';
const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

export const fetchKodeAkun = async (entitas: any, no_item: any, token: any) => {
  try {
    const responseKodeAkun = await axios.get(`${apiUrl}/erp/get_item_pusat`, {
      params: {
        entitas,
        param1: no_item,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return responseKodeAkun.data.data;
  } catch (error) {
    console.error('Error fetching kode akun');
  }
};

export const fetchAkunJurnal = async (ent: any, param1: any, token: any) => {
  try {
    const response = await axios.get(`${apiUrl}/erp/akun_jurnal_by_id`, {
      params: {
        entitas: ent,
        param1: param1,
        param2: 'all',
        param3: 'all',
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching data akun jurnal:', error);
  }
};

export const fetchCekQty = async ({ ent, param1, param2, param3 }: any, token: any) => {
  try {
    const response = await axios.get(`${apiUrl}/erp/cek_quantity_maksimum`, {
      params: {
        entitas: ent,
        param1,
        param2,
        param3,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching data hpp sj:', error);
  }
};

export const fetchCustomerMap = async (ent: any, param1: any, token: any) => {
  try {
    const response = await axios.get(`${apiUrl}/erp/customer_mapping`, {
      params: {
        entitas: ent,
        param1,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching data customer mapping:', error);
  }
};

export const fetchSettingAkun = async (data: any) => {
  try {
    const response = await axios.get(`${apiUrl}/erp/setting`, {
      params: {
        entitas: data.entitas,
      },
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching data setting akub:', error);
  }
};

export const fetchAkunFBM = async (data: any) => {
  try {
    const response = await axios.get(`${apiUrl}/erp/get_kode_akun_piutang_fbm`, {
      params: {
        entitas: data.kode_entitas,
        param1: data.kode_cust,
      },
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching data akun mapping:', error);
  }
};

export const getKodeAkunJual = async (data: any) => {
  try {
    const response = await axios.get(`${apiUrl}/erp/get_kode_akun_pajak_jual_fbm`, {
      params: {
        entitas: data.entitas,
        param1: data.kode_cust,
      },
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching data kode akun pajak jual:', error);
  }
};

export const fetchTerminByNama = async (ent: any, nama_termin: any, token: any) => {
  try {
    const response = await axios.get(`${apiUrl}/erp/termin_by_nama`, {
      params: {
        entitas: ent,
        param1: nama_termin,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching data termin:', error);
  }
};

export const fetchDetailCustomer = async (entitas: any, kode_cust: any, token: any) => {
  try {
    const response = await axios.get(`${apiUrl}/erp/detail_customer_fpac`, {
      params: {
        entitas,
        param1: kode_cust,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching data detail customer:', error);
  }
};

export const fetchCekStok = async (data: any) => {
  const { entitas, token, param1, param2, param3, param4, param5 } = data;
  try {
    const res = await axios.get(`${apiUrl}/erp/qty_stock_all`, {
      params: {
        entitas,
        param1,
        param2,
        param3,
        param4,
        param5,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data.data;
  } catch (error) {
    console.error('Error fetching data cek stok: ', error);
  }
};

export const fetchHpps = async (data: any) => {
  try {
    const res = await axios.get(`${apiUrl}/erp/hpp_ps`, {
      params: {
        entitas: data.entitas,
        param1: data.param1,
        param2: data.param2,
        param3: data.param3,
      },
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });

    return res.data.data;
  } catch (error) {
    console.error('Error fetching data hpps: ', error);
  }
};

export const fetchDataPembatalan = async (data: any) => {
  const { entitas, param1, param2, param3, token } = data;
  try {
    const response = await axios.get(`${apiUrl}/erp/prepare_data_pembatalan_fpac`, {
      params: {
        entitas,
        param1,
        param2,
        param3,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching data pembatalan:', error);
  }
};

export const createPembatalanFpac = async (data: any, token: any) => {
  try {
    const response = await axios.post(`${apiUrl}/erp/batal_approval_fpac`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error creating pembatalan approval:', error);
  }
};

export const createApprovalPusat = async (data: any, token: any) => {
  try {
    const response = await axios.post(`${apiUrl}/erp/approval_pusat_fpac`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error creating approval pusat:', error);
  }
};

export const createPembatalanFpacPusat = async (data: any, token: any) => {
  try {
    const response = await axios.post(`${apiUrl}/erp/pembatalan_fpac`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error creating pembatalan approval pusat:', error);
  }
};
