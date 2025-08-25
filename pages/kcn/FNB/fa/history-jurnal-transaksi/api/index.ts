import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

export const fetchHistoriJurnalTransaksi = async (data: any) => {
  const { entitas, token, param1, param2, param3, param4, param5, param6, param7 } = data;
  console.log(data);

  try {
    const res = await axios.get(`${apiUrl}/erp/list_history_jurnal_transaksi`, {
      params: {
        entitas,
        param1,
        param2,
        param3,
        param4,
        param5,
        param6,
        param7,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data.data;
  } catch (error) {
    console.error('Error fetching data histori jurnal transaksi:', error);
  }
};

export const fetchCetakHistoriTransaksi = async (data: any) => {
  const { token, entitas, param1, param2, param3, param4, param5, param6, param7 } = data;
  try {
    const res = await axios.get(`${apiUrl}/erp/list_report_history_jurnal`, {
      params: {
        entitas,
        param1,
        param2,
        param3,
        param4,
        param5,
        param6,
        param7,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data.data;
  } catch (error) {
    console.error('Error fetching data histori jurnal transaksi:', error);
  }
};
