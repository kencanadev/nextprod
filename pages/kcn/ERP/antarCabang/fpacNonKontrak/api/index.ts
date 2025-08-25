import axios from 'axios';
import swal from 'sweetalert2';

const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

export const fetchMapPembeli = async (data: any) => {
  const { entitas, entitasBeli, token } = data;
  try {
    const response = await axios.get(`${apiUrl}/erp/mapping_pembeli_nonkontrak_fpac`, {
      params: {
        entitas,
        param1: entitasBeli,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetch data mapping pembeli: ', error);
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

export const createApprovalPusat = async (data: any, token: any) => {
  try {
    const response = await axios.post(`${apiUrl}/erp/approval_fpac_non_kontrak`, data, {
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
