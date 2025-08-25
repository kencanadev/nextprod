import axios from 'axios';
const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

export const GetLoadGambarByName = async (paramObject: any) => {
  const response = await axios.get(`${apiUrl}/erp/load_gambar_byName?`, {
    params: {
      entitas: paramObject.kode_entitas,
      param1: paramObject.kode_cust,
      param2: paramObject.filePendukung,
    },
  });
  const responseData = response.data;
  return responseData;
};

export const UpdateCatatan = async (paramObject: any, token: any) => {
  const response = await axios.patch(`${apiUrl}/erp/update_catatan`, paramObject, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
};
