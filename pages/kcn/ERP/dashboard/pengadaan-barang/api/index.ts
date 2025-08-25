import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

const fetchOutstandingPekerjaan = async (token: string, kode_entitas: string) => {
  const res = await axios.get(`${apiUrl}/erp/list_pengadaan_dashboard`, {
    params: {
      entitas: kode_entitas,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.data;
};

const fetchAnalisaStok = async (params: any, token: string) => {
  const res = await axios.get(`${apiUrl}/erp/analisa_stok_pengadaan_dashboard`, {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.data;
};

const fetchGudangTransit = async (params: any, token: string) => {
  try {
    const res = await axios.get(`${apiUrl}/erp/info_gudang_transit_pengadaan_dashboard`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data.data;
  } catch (error) {
    console.error(error);
  }
};

const fetchGudangCustomer = async (params: any, token: string) => {
  try {
    const res = await axios.get(`${apiUrl}/erp/info_gudang_customer_pengadaan_dashboard`, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data.data;
  } catch (error) {
    console.error(error);
  }
};

const fetchGudangTtb = async (params: any, token: string) => {
  try {
    const res = await axios.get(`${apiUrl}/erp/info_gudang_ttb_pengadaan_dashboard`, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data.data;
  } catch (error) {
    console.error(error);
  }
};

const fetchStokOverdue = async (params: any, token: string) => {
  try {
    const res = await axios.get(`${apiUrl}/erp/list_stok_overdue_pengadaan_dashboard`, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data.data;
  } catch (error) {
    console.error(error);
  }
};

const fetchDetailData = async (props: any) => {
  const { kode_dokumen, entitas, token } = props;
  try {
    const res = await axios.get(`${apiUrl}/erp/detail_item_od_pengadaan_dashboard`, {
      params: {
        entitas,
        param1: kode_dokumen,
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data.data;
  } catch (error) {
    console.error(error);
  }
};

const fetchDetailSoltSol = async (props: any) => {
  const { token, params } = props;
  try {
    const res = await axios.get(`${apiUrl}/erp/detail_stok_analisa`, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data.data;
  } catch (error) {
    console.error(error);
  }
};

const fetchDetailAktualStok = async (props: any) => {
  const { token, params } = props;

  try {
    const res = await axios.get(`${apiUrl}/erp/detail_actual_stock`, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data.data;
  } catch (error) {
    console.error(error);
  }
};

const fetchDetailStokGudang = async (props: any) => {
  const { token, params } = props;

  try {
    const res = await axios.get(`${apiUrl}/erp/detail_stok_per_gudang`, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data.data;
  } catch (error) {
    console.error(error);
  }
};

const fetchDetailHistoryOd = async (props: any) => {
  const { token, params } = props;

  try {
    const res = await axios.get(`${apiUrl}/erp/history_followup_dashboard_pengadaan`, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data.data;
  } catch (error) {
    console.error(error);
  }
};

const fetchPrepareDataOd = async (props: any) => {
  const { token, params } = props;

  try {
    const res = await axios.post(`${apiUrl}/erp/partial_update_pengaadan_dashboard`, params, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data.data;
  } catch (error) {
    console.error(error);
  }
};

const getPoHeader = async (params: any) => {
  const { token, kode_dokumen, entitas } = params;

  try {
    const res = await axios.get(`${apiUrl}/erp/list_po_header`, {
      params: {
        entitas,
        param1: kode_dokumen,
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data.data;
  } catch (error) {
    console.error(error);
  }
};

const getPpHeader = async (params: any) => {
  const { token, kode_dokumen, entitas } = params;
  try {
    const res = await axios.get(`${apiUrl}/erp/list_pp_header`, {
      params: {
        entitas,
        param1: kode_dokumen,
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data.data;
  } catch (error) {
    console.error(error);
  }
};

const getUserApp = async (kode_entitas: string, userid: string) => {
  try {
    const usersApp = await axios.get(`${apiUrl}/erp/users_app`, {
      params: {
        entitas: kode_entitas,
        param1: userid,
      },
    });

    return usersApp.data.data;
  } catch (error) {
    console.error(error);
  }
};

const getListGudang = async (kode_entitas: string, token: string) => {
  try {
    const response = await axios.get(`${apiUrl}/erp/master_gudang`, {
      params: {
        entitas: kode_entitas,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    return error;
  }
};

const fetchSettings = async (entitas: string, token: string) => {
  try {
    const res = await axios.get(`${apiUrl}/erp/setting`, {
      params: {
        entitas,
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data.data;
  } catch (error) {
    console.error(error);
  }
};

const postDateOT = async (data: any, token: string) => {
  try {
    const res = await axios.post(`${apiUrl}/erp/partial_update_outstanding_task`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res;
  } catch (error) {
    console.error(error);
  }
};

const updatePartialAnalisaStok = async (props: any) => {
  const { token, params } = props;
  try {
    const res = await axios.post(`${apiUrl}/erp/partial_update_pengaadan_dashboard`, params, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res;
  } catch (error) {
    console.error(error);
  }
};

const getPesanTransit = async (props: any) => {
  const { params, token } = props;
  try {
    const response = await axios.get(`${apiUrl}/erp/pesan_transit`, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.data;
  } catch (error) {
    return error;
  }
};

const sendTelegramMessage = async (props: any) => {
  const { params, token } = props;
  try {
    const response = await axios.get(`${apiUrl}/erp/send_text`, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    return error;
  }
};

const sendWhatsappMessage = async (props: any) => {
  const { body, token } = props;
  try {
    const response = axios.post(`${apiUrl}/erp/send_text_wa`, body, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response;
  } catch (error) {
    return error;
  }
};

const getSettingTelegram = async (props: any) => {
  const { kode_entitas, token } = props;
  try {
    const response = await axios.get(`${apiUrl}/erp/get_setting_tele`, {
      params: {
        entitas: kode_entitas,
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.data;
  } catch (error) {
    return error;
  }
};

export {
  fetchOutstandingPekerjaan,
  fetchAnalisaStok,
  fetchGudangTransit,
  fetchGudangCustomer,
  fetchGudangTtb,
  fetchStokOverdue,
  fetchDetailData,
  fetchDetailSoltSol,
  fetchDetailAktualStok,
  fetchDetailStokGudang,
  fetchPrepareDataOd,
  getPoHeader,
  getPpHeader,
  getUserApp,
  fetchDetailHistoryOd,
  postDateOT,
  updatePartialAnalisaStok,
  fetchSettings,
  getPesanTransit,
  getListGudang,
  sendTelegramMessage,
  getSettingTelegram,
  sendWhatsappMessage,
};
